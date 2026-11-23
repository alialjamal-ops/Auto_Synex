# دليل التشغيل (Arabic explainer)

شرح كامل لكيفية تحويل Genesis إلى نظام حقيقي يخدم عشرة أنشطة: الاستضافة، قاعدة البيانات،
إضافة الأنشطة، التكلفة، الدفع وخطة العمل.

| File | What it is |
| --- | --- |
| `auto-synex-guide.pdf` | 11-page deck (1920×1080 pages, selectable text) |
| `slides/slide-01.png` … `slide-11.png` | One image per slide |
| `auto-synex-guide.mp4` | ~60 s animated explainer with a soft music bed |
| `build.py` | Writes `guide.html` from the slide content (edit the text here) |
| `guide.css`, `guide.js` | Design and animation (`?print`, `?slide=N`, `seek(t)`) |
| `render.cjs` | Renders the PDF, PNGs and video with Playwright + ffmpeg |
| `icons.cjs` | Exports the Lucide icons used into `icons.json` |

```bash
cd genesis
python3 docs/guide/build.py
node docs/guide/render.cjs pdf      # or: png, video, all
```

Prices in the guide are approximate; check them on the providers' sites.
