/**
 * Renders promo.html to MP4, frame by frame (deterministic, no dropped frames).
 * Usage: node promo/render.cjs [en|ar] [out.mp4] [--stills dir t1,t2,...]
 * Needs: Playwright + Chromium, ffmpeg on PATH.
 */
const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const path = require("node:path");

(async () => {
  const lang = process.argv[2] || "en";
  const out = process.argv[3] || path.join(__dirname, `auto-synex-promo-${lang}.mp4`);
  const stillsAt = process.argv[4] === "--stills" ? process.argv[6].split(",").map(Number) : null;
  const FPS = 30;
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })).newPage();
  await page.goto(`file://${path.join(__dirname, "promo.html")}?lang=${lang}`);
  await page.evaluate(() => window.ready);
  const duration = await page.evaluate(() => window.DURATION);

  if (stillsAt) {
    for (const t of stillsAt) { await page.evaluate((t) => window.seek(t), t); await page.screenshot({ path: path.join(process.argv[5], `still-${lang}-${String(t).replace(".", "_")}.jpg`), quality: 80 }); }
    await browser.close(); return;
  }

  const audio = process.env.PROMO_AUDIO;
  const args = ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-"];
  if (audio) args.push("-i", audio);
  args.push("-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart");
  if (audio) args.push("-c:a", "aac", "-b:a", "192k", "-shortest");
  args.push(out);
  const ff = spawn("ffmpeg", args, { stdio: ["pipe", "ignore", "inherit"] });
  const total = Math.round(duration * FPS);
  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => window.seek(t), f / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 150 === 0) console.log(`${lang}: frame ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  await browser.close();
  console.log("wrote", out);
})();
