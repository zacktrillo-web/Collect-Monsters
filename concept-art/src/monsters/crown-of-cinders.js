import { THREE, box, cone, glow, pivot, prism, span, settle, lerp, ease } from '../kit.js';

const C = {
  hide: '#2f2b31',
  hideDark: '#1f1b22',
  ash: '#4d464f',
  seam: '#ff6a1a',
  ember: '#ffb347',
  crown: '#d9a03a',
  crownDark: '#94631f',
  teeth: '#e8dac4',
};

export default {
  id: 'crown-of-cinders',
  name: 'Crown of Cinders',
  appearance:
    'Broad charcoal monster with four chunky arms, orange seams, an oversized jaw, and a broken floating crown.',
  movement: 'Upper arms brace while the lower fists slam; crown pieces bounce and settle.',
  palette: [
    ['Charcoal hide', C.hide],
    ['Deep soot', C.hideDark],
    ['Ash plates', C.ash],
    ['Seam fire', C.seam],
    ['Broken crown', C.crown],
    ['Ash teeth', C.teeth],
  ],
  bg: ['#5a2c18', '#140a07'],
  rim: '#ff8a3c',
  keys: [
    [0.08, 'Idle'],
    [0.4, 'Brace'],
    [0.5, 'Slam'],
  ],
  notes: [
    'Wide, low torso is the silhouette: chest ~1.7× wider than tall, legs short and set wide.',
    'Seams are separate neon parts sitting just proud of the charcoal surface — easy to recolor.',
    'Crown = 5 loose gold shards orbiting above the head, one gap left on purpose (it is broken).',
  ],
  build() {
    const root = new THREE.Group();
    const body = pivot(root, { p: [0, 2.2, 0], name: 'Torso' });

    // Legs
    for (const s of [-1, 1]) {
      box(root, [1.5, 1.8, 1.6], C.hide, { p: [s * 1.6, 1.05, 0] });
      box(root, [1.9, 0.6, 2.2], C.hideDark, { p: [s * 1.65, 0.3, 0.25] });
      for (const tx of [-0.55, 0, 0.55]) box(root, [0.45, 0.4, 0.4], C.ash, { p: [s * 1.65 + tx, 0.25, 1.45] });
      box(root, [0.1, 0.9, 0.05], glow(C.seam), { p: [s * 1.6 + 0.2, 1.1, 0.82], r: [0, 0, 18 * s] });
    }

    // Torso
    box(body, [4.2, 1.5, 3.0], C.hide, { p: [0, 0.6, 0] });
    box(body, [6.0, 2.6, 3.6], C.hide, { p: [0, 2.4, 0] });
    box(body, [4.6, 1.0, 3.0], C.hideDark, { p: [0, 3.9, -0.2] });
    for (const s of [-1, 1]) {
      box(body, [2.0, 1.3, 2.6], C.ash, { p: [s * 2.55, 3.85, 0], r: [0, 0, -12 * s] });
      box(body, [1.4, 0.5, 2.2], C.hideDark, { p: [s * 2.7, 4.6, 0], r: [0, 0, -12 * s] });
    }
    // Seams across the chest and belly
    const seam = glow(C.seam);
    const zig = [
      [-1.6, 2.9, 30], [-1.25, 2.3, -35], [-0.85, 1.8, 25],
      [1.4, 3.0, -28], [1.05, 2.4, 32], [0.7, 1.75, -20],
    ];
    for (const [x, y, rz] of zig) box(body, [0.13, 0.85, 0.06], seam, { p: [x, y, 1.82], r: [0, 0, rz] });
    box(body, [3.4, 0.1, 0.06], seam, { p: [0, 0.95, 1.52] });
    box(body, [0.1, 1.3, 0.06], seam, { p: [3.02, 2.4, 0.6], r: [0, 90, 10] });
    box(body, [0.1, 1.3, 0.06], seam, { p: [-3.02, 2.4, 0.6], r: [0, 90, -10] });

    // Head: small cranium sunk into the shoulders, huge underbite jaw
    const head = pivot(body, { p: [0, 3.9, 1.3], name: 'Head' });
    box(head, [2.4, 1.3, 1.9], C.hide, { p: [0, 0.75, 0] });
    box(head, [2.7, 0.4, 0.6], C.hideDark, { p: [0, 1.25, 0.8] });
    for (const s of [-1, 1]) box(head, [0.55, 0.18, 0.1], glow(C.ember, 2.6), { p: [s * 0.6, 0.95, 0.97] });
    box(head, [2.0, 0.35, 1.2], glow(C.seam, 1.8), { p: [0, 0.1, 0.5] });
    for (let i = 0; i < 4; i++) box(head, [0.32, 0.32, 0.32], C.teeth, { p: [-0.75 + i * 0.5, 0.2, 1.05] });
    const jaw = pivot(head, { p: [0, 0.1, -0.4], name: 'Jaw' });
    box(jaw, [3.6, 1.4, 2.8], C.hide, { p: [0, -0.7, 1.2] });
    box(jaw, [3.8, 0.35, 0.6], C.ash, { p: [0, -1.25, 2.45] });
    for (let i = 0; i < 5; i++) box(jaw, [0.42, 0.55, 0.42], C.teeth, { p: [-1.2 + i * 0.6, 0.2, 2.25] });
    for (const s of [-1, 1]) box(jaw, [0.55, 1.05, 0.55], C.teeth, { p: [s * 1.6, 0.45, 2.15], r: [0, 0, -8 * s] });
    box(jaw, [0.1, 0.9, 0.06], seam, { p: [0.9, -0.7, 2.62], r: [0, 0, 25] });

    // Broken floating crown
    const crown = pivot(head, { p: [0, 2.55, 0], name: 'Crown' });
    const shards = [];
    const n = 6;
    for (let i = 0; i < n; i++) {
      if (i === 4) continue; // the missing piece
      const a = (i / n) * Math.PI * 2;
      const shard = pivot(crown, { p: [Math.sin(a) * 1.15, 0, Math.cos(a) * 1.15], r: [0, (a * 180) / Math.PI, 0], name: `CrownShard${shards.length + 1}` });
      const inner = pivot(shard, { r: [(i % 2 ? 10 : -12), 0, (i % 3) * 7 - 7], name: 'Tilt' });
      box(inner, [1.05, 0.38, 0.24], C.crown);
      box(inner, [1.05, 0.12, 0.26], C.crownDark, { p: [0, -0.22, 0] });
      prism(inner, [[-0.4, 0.19], [0.4, 0.19], [0.12, i % 2 ? 1.2 : 0.85], [-0.05, 0.6]], 0.2, C.crown);
      if (i === 0) box(inner, [0.22, 0.22, 0.1], glow(C.ember, 2.8), { p: [0, 0.02, 0.14], r: [0, 0, 45] });
      shards.push({ shard, inner, base: inner.rotation.clone(), phase: i * 1.3 });
    }

    // Arms: the upper pair braces, the lower pair carries the giant slamming fists
    const upper = [];
    const lower = [];
    for (const s of [-1, 1]) {
      const side = s > 0 ? 'Left' : 'Right';
      const sh = pivot(body, { p: [s * 3.15, 3.7, 0.2], name: `UpperShoulder${side}` });
      const up = pivot(sh, { name: 'Twist' });
      box(up, [1.3, 1.9, 1.3], C.hide, { p: [0, -0.8, 0] });
      box(up, [1.5, 0.9, 1.5], C.ash, { p: [0, 0.1, 0] });
      box(up, [0.1, 1.1, 0.06], seam, { p: [0.1 * s, -0.8, 0.68], r: [0, 0, 20 * s] });
      const el = pivot(up, { p: [0, -1.7, 0], name: `UpperElbow${side}` });
      box(el, [1.15, 1.7, 1.15], C.hideDark, { p: [0, -0.75, 0] });
      box(el, [1.5, 1.3, 1.5], C.hide, { p: [0, -1.95, 0] });
      for (const k of [-0.45, -0.15, 0.15, 0.45]) box(el, [0.24, 0.3, 0.3], C.ash, { p: [k, -2.0, 0.82] });
      upper.push({ s, sh, up, el });

      const lsh = pivot(body, { p: [s * 2.6, 1.5, 0.35], name: `LowerShoulder${side}` });
      box(lsh, [1.3, 1.6, 1.3], C.hide, { p: [0, -0.6, 0] });
      const lel = pivot(lsh, { p: [0, -1.3, 0], name: `LowerElbow${side}` });
      box(lel, [1.4, 1.3, 1.4], C.hideDark, { p: [0, -0.5, 0] });
      const fist = pivot(lel, { p: [0, -1.55, 0.15], name: `Fist${side}` });
      box(fist, [2.1, 1.6, 2.1], C.hide);
      box(fist, [2.2, 0.5, 0.5], C.ash, { p: [0, 0.4, 0.9] });
      for (const k of [-0.7, 0, 0.7]) box(fist, [0.55, 0.45, 0.35], C.ash, { p: [k, -0.2, 1.15] });
      box(fist, [0.1, 1.0, 0.06], seam, { p: [-0.5 * s, 0, 1.08], r: [0, 0, -25 * s] });
      lower.push({ s, lsh, lel });
    }

    const TAU = Math.PI * 2;
    function update(t) {
      const raise = span(t, 0.2, 0.42);
      const slam = span(t, 0.42, 0.5, ease.in);
      const back = span(t, 0.64, 0.97);
      const breathe = Math.sin(t * TAU * 2) * 0.05;

      body.position.y = 2.2 + breathe - 0.35 * slam * (1 - back);
      body.rotation.x = (lerp(-6 * raise, 14, slam) * (1 - back) * Math.PI) / 180;
      head.rotation.x = (lerp(-10 * raise, 8, slam) * (1 - back) * Math.PI) / 180;
      jaw.rotation.x = ((12 * raise * (1 - slam) + 4) * Math.PI) / 180;

      for (const { s, sh, up, el } of upper) {
        const brace = Math.max(raise, slam) * (1 - back);
        sh.rotation.set(((-20 - 35 * brace) * Math.PI) / 180, 0, (s * (68 + 14 * brace) * Math.PI) / 180);
        up.rotation.y = (s * -10 * brace * Math.PI) / 180;
        el.rotation.z = (s * (-95 + 30 * brace) * Math.PI) / 180;
      }
      for (const { lsh, lel } of lower) {
        const a = lerp(-150 * raise, -20, slam) * (1 - back);
        lsh.rotation.x = (a * Math.PI) / 180;
        lel.rotation.x = ((-25 + 20 * raise * (1 - slam)) * Math.PI) / 180;
      }

      for (const { shard, inner, base, phase } of shards) {
        const bounce = settle(t, 0.5 + phase * 0.008, 26, 6.5);
        shard.position.y = 0.12 * Math.sin(t * TAU + phase) + bounce * 1.1;
        inner.rotation.x = base.x + bounce * 0.9 * Math.sin(phase);
        inner.rotation.z = base.z + bounce * 0.9 * Math.cos(phase);
      }
      crown.rotation.y = 0.3 * Math.sin(t * TAU);
    }

    update(0);
    return { root, update };
  },
};
