#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { closeSync, openSync, writeSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = '127.0.0.1';
const PORT = 8123;
const BASE_URL = `http://${HOST}:${PORT}/`;
const STATE_DIR = path.join(ROOT, '.codex');
const LOG_FILE = path.join(STATE_DIR, 'preview-dev.log');
const PID_FILE = path.join(STATE_DIR, 'preview-dev.pid');
const START_TIMEOUT_MS = 15_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isReachable() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1_000);

  try {
    const response = await fetch(BASE_URL, {
      method: 'HEAD',
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function canBindPort() {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', (error) => resolve({ ok: false, code: error.code }));
    server.once('listening', () => {
      server.close(() => resolve({ ok: true }));
    });
    server.listen(PORT, HOST);
  });
}

async function startDevServer() {
  await mkdir(STATE_DIR, { recursive: true });

  const logFd = openSync(LOG_FILE, 'a');
  writeSync(logFd, `\n--- ${new Date().toISOString()} starting Astro dev server ---\n`);

  const astroBin = path.join(ROOT, 'node_modules', 'astro', 'astro.js');
  const child = spawn(
    process.execPath,
    [astroBin, 'dev', '--host', HOST, '--port', String(PORT)],
    {
      cwd: ROOT,
      detached: true,
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
      stdio: ['ignore', logFd, logFd],
    },
  );

  child.unref();
  closeSync(logFd);
  await writeFile(PID_FILE, `${child.pid}\n`);
  return child.pid;
}

async function waitUntilReachable() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < START_TIMEOUT_MS) {
    if (await isReachable()) {
      return;
    }

    await sleep(200);
  }

  throw new Error(
    `Started Astro dev server, but ${BASE_URL} did not become reachable within ${START_TIMEOUT_MS}ms. ` +
      `Check ${path.relative(ROOT, LOG_FILE)}.`,
  );
}

async function main() {
  if (await isReachable()) {
    console.log(`preview: already running at ${BASE_URL}`);
    return;
  }

  const bindCheck = await canBindPort();
  if (bindCheck.code === 'EPERM' || bindCheck.code === 'EACCES') {
    throw new Error(
      `Cannot bind ${BASE_URL} from this process (${bindCheck.code}). ` +
        'Run this command from a normal local terminal or allow Codex to run it outside the sandbox.',
    );
  }

  if (!bindCheck.ok) {
    throw new Error(
      `Port ${PORT} is already in use, but ${BASE_URL} is not reachable. ` +
        'Stop the process on that port or check the existing server manually.',
    );
  }

  const pid = await startDevServer();
  await waitUntilReachable();
  console.log(`preview: started at ${BASE_URL}`);
  console.log(`preview: pid ${pid}, log ${path.relative(ROOT, LOG_FILE)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
