import { cp, mkdir, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function copyTree(fromDir, toDir) {
  const entries = await readdir(fromDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.DS_Store' || entry.name.startsWith('._')) {
      continue;
    }

    const from = join(fromDir, entry.name);
    const to = join(toDir, entry.name);

    if (entry.isDirectory()) {
      await mkdir(to, { recursive: true });
      await copyTree(from, to);
      continue;
    }

    await cp(from, to);
    console.log(`published ${relative(root, to)}`);
  }
}

if (!(await exists(dist))) {
  console.error('dist/ does not exist. Run npm run build first.');
  process.exit(1);
}

await copyTree(dist, root);
