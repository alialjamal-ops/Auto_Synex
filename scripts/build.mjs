/**
 * Root build for the Auto Synex marketing site.
 *
 * The site's `src/` is not committed to this repository — only the built
 * `dist/`, which is self-contained (Vite inlines the JS and CSS into
 * `dist/index.html`). So:
 *
 *   • when `src/` is present, build normally with Vite;
 *   • when it is absent, keep the committed `dist/` and succeed, so the site
 *     still deploys from what the repository actually contains.
 *
 * Restoring `src/` needs no change here: the Vite path takes over on its own.
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const hasSource = existsSync(path.join(root, 'src'));
const hasBuild = existsSync(path.join(root, 'dist', 'index.html'));

if (hasSource) {
  console.log('src/ found — building with Vite.');
  const result = spawnSync('npx', ['vite', 'build'], { cwd: root, stdio: 'inherit', shell: true });
  process.exit(result.status ?? 1);
}

if (!hasBuild) {
  console.error('Neither src/ nor dist/index.html exists — there is nothing to deploy.');
  process.exit(1);
}

console.log('src/ is not in this repository; serving the committed dist/ build.');
console.log('See DEPLOY.md — committing src/ restores real builds.');
