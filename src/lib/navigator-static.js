import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_NAVIGATOR_DIR = path.join(ROOT, 'public/navigator');

function safeSegments(rawPath = '') {
  return rawPath
    .split('/')
    .filter(Boolean)
    .filter((segment) => segment !== '.' && segment !== '..');
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export function navigatorFilePath(rawPath = '') {
  const segments = safeSegments(rawPath);
  const candidate = segments.length > 0
    ? path.join(PUBLIC_NAVIGATOR_DIR, ...segments)
    : path.join(PUBLIC_NAVIGATOR_DIR, 'index.html');

  if (path.extname(candidate)) {
    return candidate;
  }

  return path.join(candidate, 'index.html');
}

export async function readNavigatorHtml(rawPath = '') {
  const filePath = navigatorFilePath(rawPath);
  return readFile(filePath, 'utf8');
}

async function walkHtmlRoutes(dir, routePrefix = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const routes = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    const routePath = routePrefix ? `${routePrefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      routes.push(...await walkHtmlRoutes(entryPath, routePath));
      continue;
    }

    if (entry.name !== 'index.html') {
      continue;
    }

    const route = routePrefix;
    if (route) {
      routes.push(route);
    }
  }

  return routes;
}

export async function navigatorStaticPaths() {
  if (!(await exists(PUBLIC_NAVIGATOR_DIR))) {
    return [];
  }

  const routes = await walkHtmlRoutes(PUBLIC_NAVIGATOR_DIR);

  return routes.map((route) => ({
    params: { path: route },
  }));
}
