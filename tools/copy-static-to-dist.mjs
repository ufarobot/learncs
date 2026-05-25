import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');

const passthrough = [
  '.nojekyll',
  'robots.txt',
  'assets',
  'apply',
  'camps'
];

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function copyRecursive(from, to) {
  const fromStat = await stat(from);
  const name = from.split('/').pop();

  if (name === '.DS_Store' || name?.startsWith('._')) {
    return;
  }

  if (fromStat.isDirectory()) {
    await mkdir(to, { recursive: true });
    const entries = await readdir(from);
    for (const entry of entries) {
      await copyRecursive(join(from, entry), join(to, entry));
    }
    return;
  }

  await mkdir(to.slice(0, to.lastIndexOf('/')), { recursive: true });
  await copyFile(from, to);
}

if (!(await exists(dist))) {
  console.error('dist/ does not exist. Run astro build first.');
  process.exit(1);
}

await mkdir(dist, { recursive: true });

for (const item of passthrough) {
  const from = join(root, item);
  if (!(await exists(from))) {
    continue;
  }
  await copyRecursive(from, join(dist, item));
  console.log(`copied ${item} -> dist/${item}`);
}
