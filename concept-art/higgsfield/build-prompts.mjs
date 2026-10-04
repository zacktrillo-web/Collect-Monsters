// Builds the reference-guided Higgsfield prompts from descriptions.json + the monster palettes.
// Usage: node higgsfield/build-prompts.mjs > higgsfield/prompts.json
import fs from 'node:fs';
import { monsters } from '../src/monsters/index.js';

const desc = JSON.parse(fs.readFileSync(new URL('./descriptions.json', import.meta.url)));
const out = monsters.map((m) => {
  const d = desc[m.id];
  const palette = m.palette.map(([name, hex]) => `${name.toLowerCase()} ${hex}`).join(', ');
  const prompt = [
    'Turn the reference blockout into finished concept art of the same monster. Keep its exact silhouette, proportions, pose, number of limbs, part layout and color palette.',
    '',
    `"${m.name}", a secret-tier monster. ${d.body}`,
    `Color palette: ${palette}.`,
    '',
    `Style: polished stylized 3D game creature art for a Roblox monster-collecting game. Chunky bevelled block-built parts, hand-painted stylized textures (${d.look}), glowing parts that emit light, soft shadows, dramatic ${d.rim} rim light, full body, three-quarter front view, centered, dark gradient backdrop. No text, no logo, no watermark.`,
  ].join('\n');
  return { id: m.id, name: m.name, prompt };
});
console.log(JSON.stringify(out, null, 2));
