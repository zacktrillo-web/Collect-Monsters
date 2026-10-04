# Higgsfield painted concepts

Painted concept art for all 15 secret monsters, made in Higgsfield with `gpt_image_2_5`
(quality high, 2048×2048). Each image used the monster's blockout hero render
(`../output/heroes/<id>.png`) as its image reference, so the silhouette and colors follow the blockout.

| File | What it is |
|---|---|
| `jobs.json` | Higgsfield job ID and full-size image link for each monster. |
| `prompts.json` | The exact prompt sent for each monster. |
| `descriptions.json` | The per-monster descriptions the prompts are built from. |
| `references.json` | Higgsfield media IDs of the uploaded hero renders. |
| `build-prompts.mjs` | Rebuilds `prompts.json` (`node higgsfield/build-prompts.mjs > higgsfield/prompts.json`). |

The images also live in your Higgsfield library. To redo one, ask Claude with the Higgsfield
connector to regenerate it from `prompts.json` with the same reference.
