// Writes CONCEPT-ART.md: every secret monster's painted concept, concept sheet, description,
// palette and build notes on one page, with absolute links so it can be handed to another tool.
// Usage: node tools/write-concept-index.mjs
import fs from 'node:fs';
import { monsters } from '../src/monsters/index.js';

const BRANCH = 'https://raw.githubusercontent.com/zacktrillo-web/Collect-Monsters/claude/sweet-thompson-3op8oy/concept-art';
const jobs = JSON.parse(fs.readFileSync(new URL('../higgsfield/jobs.json', import.meta.url))).jobs;

const out = [
  '# Collect Monsters: secret monster concept art',
  '',
  'All 15 secret-tier monsters. Each one has:',
  '',
  '- **Painted concept** (Higgsfield): the intended final look (materials, detail, glow).',
  '- **Concept sheet**: the exact shape, proportions, signature-move poses, front/side/back views and hex colors.',
  '  When the two disagree on shape, parts or colors, follow the sheet.',
  '- **Roblox build script**: the part-based model with its signature move, already made for Roblox Studio.',
  '',
  'Every link below is a direct, public file link.',
  '',
];
monsters.forEach((m, i) => {
  const n = String(i + 1).padStart(2, '0');
  out.push(
    `## ${n}. ${m.name}`,
    '',
    `| Painted concept | Concept sheet |`,
    `|---|---|`,
    `| ![${m.name} painted concept](${jobs[m.id].image}) | ![${m.name} concept sheet](${BRANCH}/output/sheets/${m.id}.png) |`,
    '',
    `- Painted concept (2048×2048): ${jobs[m.id].image}`,
    `- Concept sheet (1920×1080): ${BRANCH}/output/sheets/${m.id}.png`,
    `- Clean 3D render: ${BRANCH}/output/heroes/${m.id}.png`,
    `- Roblox build script (with signature move): ${BRANCH}/roblox/${m.id}.luau`,
    '',
    `**Look:** ${m.appearance}`,
    '',
    `**Signature move:** ${m.movement}`,
    '',
    '**Colors:** ' + m.palette.map(([name, hex]) => `${name} \`${hex}\``).join(' · '),
    '',
    '**Build notes:**',
    ...m.notes.map((x) => `- ${x}`),
    '',
  );
});
fs.writeFileSync(new URL('../CONCEPT-ART.md', import.meta.url), out.join('\n'));
console.log('wrote CONCEPT-ART.md for', monsters.length, 'monsters');
