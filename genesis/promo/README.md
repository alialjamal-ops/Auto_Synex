# Promo video

A 35-second, 1080p promo for Auto Synex Booking OS, in English and Arabic.

| File | What it is |
| --- | --- |
| `auto-synex-promo-en.mp4`, `auto-synex-promo-ar.mp4` | The rendered videos (1920×1080, 30 fps, H.264 + AAC) |
| `promo.html` | The eight scenes (logo, headline, dashboard, booking, industries, languages and themes, the three ways to get the platform, end card). Every animation is a pure function of time (`window.seek(t)`), so renders are frame-exact |
| `render.cjs` | Renders `promo.html` frame by frame with Playwright and pipes the frames to ffmpeg |
| `assets/` | Real screenshots of the Genesis demo used in the video |
| `make-music.sh` | Generates `music.wav`, a synthesised ambient bed (ffmpeg only, no third-party audio) |

## High-energy cut

`promo-hype.html` is a faster 30-second edit at 120 BPM: cuts land on the beat, phrases slam in
one at a time, and impacts add a short shake and a soft flash (main cuts only). Its music comes
from `make-music-hype.sh` (kick, off-beat bass, hats, clap, arpeggio, risers; ffmpeg only).

```bash
bash promo/make-music-hype.sh
PROMO_HTML=promo-hype.html PROMO_AUDIO=promo/music-hype.wav node promo/render.cjs en promo/auto-synex-promo-hype-en.mp4
```

## Re-render

```bash
cd genesis
bash promo/make-music.sh
PROMO_AUDIO=promo/music.wav node promo/render.cjs en   # or: ar
```

Needs `ffmpeg` on the PATH and Playwright's Chromium. To preview a scene, open
`promo.html` (add `?lang=ar` for Arabic) and run `seek(10.5)` in the console.

## Editing

- Text for both languages lives in the `T` object at the top of the script in `promo.html`.
- Scene timings are in `SCENES`; each scene's motion is in its numbered block in `seek()`.
- To use licensed music, point `PROMO_AUDIO` at your own audio file.
- Photos are the CC0 StockSnap set in `public/media` (see its README).

The logo in the video is `public/brand/mark-exact.png`, cut from the supplied brand image (about 100 px wide), so it is slightly soft at video size. Replace that file with the original high-resolution logo and re-render for a sharper result.
