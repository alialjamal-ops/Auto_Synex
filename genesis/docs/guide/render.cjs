/**
 * Renders guide.html to: guide.pdf, slides/slide-NN.png and the explainer video.
 * Usage: node docs/guide/render.cjs [pdf|png|video|all]
 */
const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const file = (q = "") => `file://${path.join(__dirname, "guide.html")}${q}`;

(async () => {
  const what = process.argv[2] || "all";
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  if (what === "pdf" || what === "all") {
    await page.goto(file("?print")); await page.evaluate(() => window.ready);
    await page.pdf({ path: path.join(__dirname, "auto-synex-guide.pdf"), width: "1920px", height: "1080px", printBackground: true, preferCSSPageSize: true });
    console.log("pdf done");
  }
  if (what === "png" || what === "all") {
    fs.mkdirSync(path.join(__dirname, "slides"), { recursive: true });
    const n = await (async () => { await page.goto(file("?slide=0")); await page.evaluate(() => window.ready); return page.evaluate(() => document.querySelectorAll(".slide").length); })();
    for (let i = 0; i < n; i++) {
      await page.goto(file(`?slide=${i}`)); await page.evaluate(() => window.ready);
      await page.screenshot({ path: path.join(__dirname, "slides", `slide-${String(i + 1).padStart(2, "0")}.png`) });
    }
    console.log("png done", n);
  }
  if (what === "video" || what === "all") {
    await page.goto(file()); await page.evaluate(() => window.ready);
    const dur = await page.evaluate(() => window.DURATION);
    const FPS = 30, out = path.join(__dirname, "auto-synex-guide.mp4"), audio = process.env.GUIDE_AUDIO;
    const args = ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-"];
    if (audio) args.push("-i", audio);
    args.push("-c:v", "libx264", "-profile:v", "high", "-level:v", "4.0", "-refs", "3", "-bf", "2", "-g", "60", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart");
    if (audio) args.push("-c:a", "aac", "-ar", "44100", "-b:a", "160k", "-shortest");
    args.push(out);
    const ff = spawn("ffmpeg", args, { stdio: ["pipe", "ignore", "inherit"] });
    for (let f = 0; f < Math.round(dur * FPS); f++) {
      await page.evaluate((t) => window.seek(t), f / FPS);
      const buf = await page.screenshot({ type: "jpeg", quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    }
    ff.stdin.end(); await new Promise((r) => ff.on("close", r));
    console.log("video done", dur);
  }
  await browser.close();
})();
