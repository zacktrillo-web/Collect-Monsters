// Text handed to other tools: a modeling brief for ChatGPT and an image prompt for Higgsfield.
// Both are built from the same monster definitions the 3D blockouts use.

const STYLE =
  'Stylized chunky 3D creature concept art for a Roblox monster-collecting game. Blocky, part-built construction ' +
  '(bricks, wedges, cylinders), bold readable silhouette, cel-shaded, thick dark outlines, full body, three-quarter ' +
  'front view, centered, dark gradient studio backdrop with a soft rim light, glowing accent parts. No text, no logo, no watermark.';

export function higgsfieldPrompt(def) {
  const colors = def.palette.map(([name, hex]) => `${name.toLowerCase()} ${hex}`).join(', ');
  return [
    `"${def.name}", a secret-tier monster. ${def.appearance}`,
    `Key details: ${def.notes.join(' ')}`,
    `Color palette: ${colors}.`,
    STYLE,
  ].join('\n');
}

export function modelingBrief(def) {
  const lines = [
    `Model "${def.name}" (Collect Monsters, Secret tier) for Roblox, using the attached concept sheet as the reference.`,
    '',
    `Look: ${def.appearance}`,
    `Signature move: ${def.movement}`,
    '',
    'Construction notes:',
    ...def.notes.map((n) => `- ${n}`),
    '',
    'Colors (use these exact hex values):',
    ...def.palette.map(([name, hex]) => `- ${name}: ${hex}`),
    '',
    'Requirements:',
    '- Keep it blocky and part-based like the sheet; match the silhouette and proportions in the front/side/back views.',
    '- Glowing parts use Neon material; everything else SmoothPlastic or Slate.',
    '- Split moving pieces into separate parts with clear pivot points so the signature move can be animated.',
  ];
  return lines.join('\n');
}
