# Secret monster concept art

Concept sheets for the 15 secret-tier monsters in **Collect Monsters**. Each monster is built as a
3D blockout from Roblox-style parts (blocks, wedges, cylinders), with its signature move animated,
then rendered to a concept sheet you can hand to ChatGPT (or any modeler) as the reference.

## What's here

| Path | What it is |
|---|---|
| `output/sheets/<id>.png` | 1920×1080 concept sheet: hero view, 3 signature-move key poses, front/side/back turnaround, palette with hex codes, build notes. **Send this to ChatGPT.** |
| `output/heroes/<id>.png` | Clean hero render only. Use it as the image reference in Higgsfield. |
| `chatgpt-briefs.md` | One modeling brief per monster, written to paste into ChatGPT with its sheet. |
| `higgsfield/` | Painted Higgsfield concept art: image links in `jobs.json`, plus the exact prompts used. |
| `higgsfield-prompts.md` | Simpler text-only prompts, if you want to try other image tools. |
| `roblox/` | Every monster as a Roblox model with its signature move built in (`.rbxmx` for Insert from File, `.luau` build scripts, `install-all.luau` for all 15). See `roblox/README.md`. |
| `gallery.html` | Interactive viewer: orbit each model and play its signature move. |
| `src/monsters/*.js` | The blockout models and their animations (one file per monster). |

## Workflow

1. Open a sheet in `output/sheets/` and its brief in `chatgpt-briefs.md`.
2. Paste the brief into ChatGPT and attach the sheet.
3. Optional: also attach the painted Higgsfield version (links in `higgsfield/jobs.json`) for
   surface detail. The sheet stays the source of truth for shape, parts and colors.

## Re-rendering after a design change

```bash
npm install
npm run render                    # all sheets, or: node tools/render.mjs firstborn
npm run briefs                    # regenerate the ChatGPT briefs and Higgsfield prompts
python3 tools/web-media.py        # refresh gallery thumbnails (needs Pillow)
```

Rendering uses headless Chromium through Playwright. Each monster file exports its name, palette,
key poses and notes alongside `build()`, so the sheet, the gallery and the briefs all update together.
To view the gallery locally, serve this folder (for example `python3 -m http.server`) and open
`gallery.html`.
