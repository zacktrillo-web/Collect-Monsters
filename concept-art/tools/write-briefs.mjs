// Writes the Higgsfield prompt pack and the ChatGPT modeling briefs as Markdown.
// Usage: node tools/write-briefs.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { monsters } from '../src/monsters/index.js';
import { higgsfieldPrompt, modelingBrief } from '../src/briefs.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const higgs = [
  '# Higgsfield prompts — Secret monsters',
  '',
  'One text-to-image prompt per secret monster. For the closest match, attach the hero render',
  '(`output/heroes/<id>.png`) as the image reference so Higgsfield keeps the blockout silhouette.',
  '',
  ...monsters.flatMap((m, i) => [
    `## ${String(i + 1).padStart(2, '0')}. ${m.name}`,
    '',
    `Reference: \`output/heroes/${m.id}.png\``,
    '',
    '```text',
    higgsfieldPrompt(m),
    '```',
    '',
  ]),
];
fs.writeFileSync(path.join(root, 'higgsfield-prompts.md'), higgs.join('\n'));

const briefs = [
  '# ChatGPT modeling briefs — Secret monsters',
  '',
  'Paste a brief into ChatGPT together with the matching concept sheet (`output/sheets/<id>.png`).',
  '',
  ...monsters.flatMap((m, i) => [
    `## ${String(i + 1).padStart(2, '0')}. ${m.name}`,
    '',
    `Sheet: \`output/sheets/${m.id}.png\``,
    '',
    '```text',
    modelingBrief(m),
    '```',
    '',
  ]),
];
fs.writeFileSync(path.join(root, 'chatgpt-briefs.md'), briefs.join('\n'));
console.log(`wrote prompts and briefs for ${monsters.length} monsters`);
