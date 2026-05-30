#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = '127.0.0.1';
const DEFAULT_ROUTES = ['/'];
const DEFAULT_PORT = 8123;
const RESERVED_PORTS = new Set([8000]);

function parseArgs(argv) {
  const routes = [];
  let keepAlive = false;
  let requestedPort = null;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--keep-alive') {
      keepAlive = true;
      continue;
    }

    if (arg === '--port') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('--port requires a port number');
      }
      requestedPort = Number(value);
      index += 1;
      continue;
    }

    if (arg.startsWith('--port=')) {
      requestedPort = Number(arg.slice('--port='.length));
      continue;
    }

    routes.push(arg.startsWith('/') ? arg : `/${arg}`);
  }

  if (requestedPort !== null && (!Number.isInteger(requestedPort) || requestedPort <= 0)) {
    throw new Error(`Invalid port: ${requestedPort}`);
  }

  return {
    keepAlive,
    requestedPort,
    routes: routes.length > 0 ? routes : DEFAULT_ROUTES,
  };
}

function canBind(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, HOST);
  });
}

async function resolvePort(requestedPort) {
  const port = requestedPort ?? DEFAULT_PORT;

  if (RESERVED_PORTS.has(port)) {
    throw new Error(`Port ${port} is reserved for another local service.`);
  }

  return {
    port,
    shouldStartPreview: await canBind(port),
  };
}

function startPreview(port) {
  const astroBin = path.join(ROOT, 'node_modules', 'astro', 'astro.js');
  const child = spawn(
    process.execPath,
    [astroBin, 'preview', '--host', HOST, '--port', String(port)],
    {
      cwd: ROOT,
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  child.stdout.on('data', (chunk) => {
    process.stdout.write(chunk);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(chunk);
  });

  return child;
}

async function waitForPreview(child, baseUrl) {
  const timeoutMs = 10_000;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode !== null) {
      throw new Error(`Preview exited early with code ${child.exitCode}.`);
    }

    try {
      const response = await fetch(baseUrl, { method: 'HEAD' });
      if (response.ok) {
        return;
      }
    } catch {
      // Server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw new Error(`Preview did not become ready within ${timeoutMs}ms.`);
}

async function checkRoute(baseUrl, route) {
  const url = new URL(route, baseUrl);
  let response;
  try {
    response = await fetch(url, { method: 'HEAD' });
  } catch (error) {
    const detail = error.cause?.code || error.message;
    throw new Error(
      `${url.href} is not reachable from this check process (${detail}). ` +
        `Port ${url.port} is already occupied, so no fallback preview was started. ` +
        'Stop the existing server on that port and rerun the check, or verify the page manually in the browser.',
    );
  }
  if (!response.ok) {
    throw new Error(`${url.pathname} returned ${response.status}`);
  }
  console.log(`ok ${url.pathname} ${response.status}`);
}

async function checkRoutes(baseUrl, routes) {
  for (const route of routes) {
    await checkRoute(baseUrl, route);
  }
}

async function stopPreview(child) {
  if (child.exitCode !== null) {
    return;
  }

  child.kill('SIGTERM');
  const timer = setTimeout(() => {
    if (child.exitCode === null) {
      child.kill('SIGKILL');
    }
  }, 2_000);

  try {
    await once(child, 'exit');
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const { keepAlive, requestedPort, routes } = parseArgs(process.argv.slice(2));
  const { port, shouldStartPreview } = await resolvePort(requestedPort);
  const baseUrl = `http://${HOST}:${port}/`;
  const child = shouldStartPreview ? startPreview(port) : null;

  const cleanup = async () => {
    if (child) {
      await stopPreview(child);
    }
  };

  process.once('SIGINT', async () => {
    await cleanup();
    process.exit(130);
  });

  process.once('SIGTERM', async () => {
    await cleanup();
    process.exit(143);
  });

  try {
    if (child) {
      await waitForPreview(child, baseUrl);
      console.log(`agent preview: ${baseUrl}`);
    } else {
      console.log(`agent preview: using existing server at ${baseUrl}`);
    }

    if (keepAlive) {
      if (!child) {
        console.log('Existing server is owned by another terminal; leaving it running.');
        return;
      }
      console.log('Press Ctrl+C to stop.');
      await once(child, 'exit');
      process.exit(child.exitCode ?? 0);
    }

    await checkRoutes(baseUrl, routes);
  } finally {
    if (!keepAlive) {
      await cleanup();
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
