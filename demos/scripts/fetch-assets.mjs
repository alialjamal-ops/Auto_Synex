/**
 * Fetches the demo photography and the self-hosted fonts before `next build`.
 *
 * Both sets of files are large binaries that don't belong in a source tree, so
 * they are pulled once at build time and then served from `public/media` and
 * `app/fonts` like any other local asset — no third-party request at runtime.
 *
 * Anything already on disk is skipped, so local development never re-downloads
 * and works offline.
 *
 * Run automatically via the `prebuild` npm lifecycle script.
 */

import { createWriteStream } from 'node:fs';
import { mkdir, readFile, stat, unlink } from 'node:fs/promises';
import { dirname } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const FONTS = [
  { file: 'app/fonts/inter.woff2', family: 'Inter:wght@100..900' },
  { file: 'app/fonts/manrope.woff2', family: 'Manrope:wght@200..800' },
  { file: 'app/fonts/sora.woff2', family: 'Sora:wght@100..800' },
  { file: 'app/fonts/cormorant.woff2', family: 'Cormorant+Garamond:wght@300..700', style: 'normal' },
  { file: 'app/fonts/cormorant-italic.woff2', family: 'Cormorant+Garamond:ital,wght@1,300..700', style: 'italic' },
  { file: 'app/fonts/playfair.woff2', family: 'Playfair+Display:wght@400..900' },
  { file: 'app/fonts/fraunces.woff2', family: 'Fraunces:opsz,wght@9..144,100..900' },
];

const MIN_BYTES = 2048;

async function exists(path) {
  try {
    const info = await stat(path);
    return info.size > MIN_BYTES;
  } catch {
    return false;
  }
}

async function download(url, file, { expect } = {}) {
  const response = await fetch(url, {
    headers: { 'User-Agent': UA, Referer: 'https://stocksnap.io/', Accept: '*/*' },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const type = response.headers.get('content-type') ?? '';
  if (expect && !type.includes(expect)) throw new Error(`unexpected content-type "${type}"`);

  await mkdir(dirname(file), { recursive: true });
  await pipeline(Readable.fromWeb(response.body), createWriteStream(file));

  if (!(await exists(file))) {
    await unlink(file).catch(() => {});
    throw new Error('file too small');
  }
}

async function withRetry(label, task, attempts = 4) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await task();
      return true;
    } catch (error) {
      if (attempt === attempts) {
        console.warn(`  ! ${label}: ${error.message}`);
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 900));
    }
  }
  return false;
}

/** Resolves the latin-subset woff2 behind a Google Fonts css2 request. */
async function resolveFontUrl({ family, style }) {
  const response = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}&display=swap`,
    { headers: { 'User-Agent': UA } },
  );
  if (!response.ok) throw new Error(`css HTTP ${response.status}`);
  const css = await response.text();

  for (const block of css.split('@font-face').slice(1)) {
    if (!/unicode-range:[^;]*U\+0000-00FF/.test(block)) continue;
    if (style && !new RegExp(`font-style:\\s*${style}`).test(block)) continue;
    const match = block.match(/url\((https:\/\/[^)]+\.woff2)\)/);
    if (match) return match[1];
  }
  throw new Error('no latin woff2 in css');
}

async function run(label, items, worker, concurrency = 6) {
  const queue = [...items];
  let done = 0;
  let failed = 0;

  const runners = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      const ok = await worker(item);
      if (ok) done += 1;
      else failed += 1;
    }
  });

  await Promise.all(runners);
  console.log(`${label}: ${done} ready, ${failed} failed`);
  return failed;
}

async function main() {
  const manifest = JSON.parse(await readFile(new URL('./assets.json', import.meta.url), 'utf8'));
  const images = Object.entries(manifest);

  console.log(`Assets: ${images.length} photos, ${FONTS.length} fonts`);

  const missingFonts = [];
  for (const font of FONTS) {
    if (!(await exists(font.file))) missingFonts.push(font);
  }
  const missingImages = [];
  for (const [file, url] of images) {
    if (!(await exists(file))) missingImages.push([file, url]);
  }

  if (missingFonts.length === 0 && missingImages.length === 0) {
    console.log('Assets: everything already present — nothing to download.');
    return;
  }

  const fontFailures = await run(
    'Fonts',
    missingFonts,
    (font) =>
      withRetry(font.file, async () => {
        const url = await resolveFontUrl(font);
        await download(url, font.file, { expect: 'font' });
      }),
    3,
  );

  const imageFailures = await run('Photos', missingImages, ([file, url]) =>
    withRetry(file, () => download(url, file, { expect: 'image' })),
  );

  // Fonts are load-bearing: next/font/local fails the build without them.
  if (fontFailures > 0) {
    throw new Error(`${fontFailures} font file(s) could not be downloaded`);
  }
  // A handful of missing photos degrades gracefully; a wholesale failure does not.
  if (imageFailures > images.length * 0.1) {
    throw new Error(`${imageFailures} photo(s) could not be downloaded`);
  }
}

main().catch((error) => {
  console.error(`Asset fetch failed: ${error.message}`);
  process.exit(1);
});
