import { THREE, DEG, box, glow, pivot, prism, span, ease, lerp } from '../kit.js';

const C = {
  stone: '#8b8478',
  stoneDark: '#5f594f',
  moss: '#6f8a4a',
  rune: '#ffb347',
  ink: '#2b1d14',
};

// Expression details are drawn as dark inset blocks on each mask face.
const FACES = {
  joy(m) {
    for (const s of [-1, 1]) {
      prism(m, [[-0.35, -0.08], [0.35, -0.08], [0.2, 0.12], [-0.2, 0.12]], 0.1, C.ink, { p: [s * 0.45, 0.35, 0.22], outline: false });
      box(m, [0.5, 0.1, 0.1], C.ink, { p: [s * 0.45, 0.75, 0.22], r: [0, 0, s * -12], outline: false });
    }
    prism(m, [[-0.6, 0.1], [0.6, 0.1], [0.35, -0.3], [0, -0.42], [-0.35, -0.3]], 0.1, C.ink, { p: [0, -0.45, 0.22], outline: false });
  },
  sorrow(m) {
    for (const s of [-1, 1]) {
      box(m, [0.42, 0.18, 0.1], C.ink, { p: [s * 0.45, 0.3, 0.22], r: [0, 0, s * 18], outline: false });
      box(m, [0.55, 0.1, 0.1], C.ink, { p: [s * 0.42, 0.72, 0.22], r: [0, 0, s * 25], outline: false });
      box(m, [0.08, 0.5, 0.08], glow('#9fe7ff', 1.8), { p: [s * 0.5, -0.05, 0.22] });
    }
    prism(m, [[-0.5, -0.1], [0, 0.15], [0.5, -0.1], [0.42, -0.25], [0, -0.05], [-0.42, -0.25]], 0.1, C.ink, { p: [0, -0.6, 0.22], outline: false });
  },
  rage(m) {
    for (const s of [-1, 1]) {
      box(m, [0.4, 0.2, 0.1], glow(C.rune, 2.4), { p: [s * 0.42, 0.32, 0.22] });
      box(m, [0.7, 0.16, 0.14], C.ink, { p: [s * 0.4, 0.62, 0.22], r: [0, 0, s * 28] });
      box(m, [0.18, 0.35, 0.14], '#f0e6cf', { p: [s * 0.32, -0.35, 0.25] });
    }
    box(m, [1.0, 0.6, 0.1], C.ink, { p: [0, -0.55, 0.22], outline: false });
  },
  calm(m) {
    for (const s of [-1, 1]) box(m, [0.46, 0.07, 0.1], C.ink, { p: [s * 0.42, 0.32, 0.22], outline: false });
    box(m, [0.4, 0.08, 0.1], C.ink, { p: [0, -0.5, 0.22], outline: false });
    box(m, [0.28, 0.28, 0.1], glow('#bfffe0', 2.2), { p: [0, 0.75, 0.22], r: [0, 0, 45] });
  },
  scream(m) {
    for (const s of [-1, 1]) box(m, [0.3, 0.42, 0.1], C.ink, { p: [s * 0.42, 0.35, 0.22], outline: false });
    box(m, [0.5, 0.95, 0.1], C.ink, { p: [0, -0.45, 0.22], outline: false });
    box(m, [0.3, 0.6, 0.06], glow('#d8a6ff', 1.6), { p: [0, -0.45, 0.26] });
  },
};

const MASKS = [
  ['rage', '#c4643a', '#8f4123'],
  ['joy', '#dba543', '#9f7426'],
  ['sorrow', '#4fa88a', '#2f6e59'],
  ['calm', '#eae0c8', '#b8ac8f'],
  ['scream', '#2c2a34', '#17161c'],
];

export default {
  id: 'the-unforgotten',
  name: 'The Unforgotten',
  appearance: 'A central stone creature surrounded by several large, expressive ancient masks.',
  movement: 'Masks turn independently; one faces forward as the creature strikes.',
  palette: [
    ['Old stone', C.stone],
    ['Rune amber', C.rune],
    ['Rage terracotta', MASKS[0][1]],
    ['Joy gold', MASKS[1][1]],
    ['Sorrow jade', MASKS[2][1]],
    ['Scream obsidian', MASKS[4][1]],
  ],
  bg: ['#4a4436', '#0f0d09'],
  rim: '#ffc46b',
  hero: { az: -18, el: 10 },
  keys: [
    [0.06, 'Idle'],
    [0.36, 'Masks turn'],
    [0.52, 'Strike'],
  ],
  notes: [
    'The body is small and hunched on purpose — the five masks are the silhouette.',
    'Masks: Rage, Joy, Sorrow, Calm, Scream. Each is a big flat slab with a carved rim and inset features.',
    'Each mask floats on its own pivot; the ring rotates to bring Rage to the front for the strike.',
  ],
  build() {
    const root = new THREE.Group();
    const body = pivot(root, { p: [0, 2.2, 0] });

    // Hunched stone creature
    for (const s of [-1, 1]) {
      box(root, [0.95, 1.4, 1.1], C.stoneDark, { p: [s * 0.75, 0.7, 0] });
      box(root, [1.2, 0.4, 1.5], C.stone, { p: [s * 0.75, 0.2, 0.2] });
    }
    const torso = pivot(body, { r: [18, 0, 0] });
    box(torso, [2.6, 1.4, 1.9], C.stone, { p: [0, 0.6, 0] });
    box(torso, [3.0, 1.6, 2.1], C.stone, { p: [0, 1.9, 0.1] });
    box(torso, [3.2, 0.35, 2.2], C.moss, { p: [0, 2.85, 0.1] });
    box(torso, [0.5, 0.5, 0.1], glow(C.rune, 2.2), { p: [0, 1.9, 1.16], r: [0, 0, 45] });
    for (const s of [-1, 1]) box(torso, [0.1, 0.6, 0.1], glow(C.rune, 2.0), { p: [s * 0.7, 1.4, 1.16] });
    const head = pivot(torso, { p: [0, 2.8, 0.7] });
    box(head, [1.4, 1.1, 1.3], C.stoneDark, { p: [0, 0.35, 0.2] });
    box(head, [1.5, 0.3, 0.5], C.stone, { p: [0, 0.8, 0.7] });
    for (const s of [-1, 1]) box(head, [0.3, 0.18, 0.1], glow(C.rune, 2.8), { p: [s * 0.32, 0.45, 0.86] });
    const arms = [];
    for (const s of [-1, 1]) {
      const sh = pivot(torso, { p: [s * 1.75, 2.2, 0.1] });
      box(sh, [1.1, 0.9, 1.2], C.moss, { p: [0, 0.35, 0] });
      box(sh, [0.9, 1.9, 0.9], C.stone, { p: [0, -0.7, 0] });
      const el = pivot(sh, { p: [0, -1.6, 0] });
      box(el, [0.85, 1.4, 0.85], C.stoneDark, { p: [0, -0.6, 0] });
      box(el, [1.3, 1.1, 1.3], C.stone, { p: [0, -1.75, 0.1] });
      arms.push({ s, sh, el });
    }

    // Ring of floating masks
    const ring = pivot(root, { p: [0, 0, 0] });
    const masks = [];
    MASKS.forEach(([kind, col, rim], i) => {
      const a = (i / MASKS.length) * 360;
      const orbit = pivot(ring, { r: [0, a, 0] });
      const holder = pivot(orbit, { p: [0, 6.7 + (i % 2) * 0.7, 3.7] });
      const turn = pivot(holder);
      box(turn, [1.9, 2.4, 0.35], col);
      box(turn, [2.1, 0.3, 0.45], rim, { p: [0, 1.25, 0] });
      box(turn, [0.3, 1.8, 0.45], rim, { p: [-0.95, -0.1, 0] });
      box(turn, [0.3, 1.8, 0.45], rim, { p: [0.95, -0.1, 0] });
      prism(turn, [[-0.95, 0], [0.95, 0], [0.5, -0.45], [-0.5, -0.45]], 0.45, rim, { p: [0, -1.15, 0] });
      box(turn, [0.3, 0.55, 0.3], rim, { p: [0, 0.0, 0.25] });
      FACES[kind](turn);
      masks.push({ holder, turn, i, a, ph: i * 1.9 });
    });

    const TAU = Math.PI * 2;
    function update(t) {
      const focus = span(t, 0.24, 0.42) * (1 - span(t, 0.66, 0.94));
      const wind = span(t, 0.36, 0.45);
      const strike = span(t, 0.45, 0.52, ease.in);
      const back = span(t, 0.62, 0.92);
      const w = wind * (1 - strike) * (1 - back);
      const k = strike * (1 - back);

      body.position.y = 2.2 + 0.06 * Math.sin(t * TAU * 2) - 0.2 * k;
      torso.rotation.x = (18 - 12 * w + 16 * k) * DEG;
      head.rotation.x = (-10 * w + 6 * k) * DEG;
      for (const { s, sh, el } of arms) {
        const lead = s > 0 ? 1 : 0.35;
        sh.rotation.x = ((-40 * Math.sin(t * TAU) * 0.1) + lerp(0, -150, w) * lead + -60 * k * lead) * DEG;
        sh.rotation.z = s * (10 + 15 * w) * DEG;
        el.rotation.x = (-25 * w * lead - 10 * k) * DEG;
      }

      // At rest the masks flank the face; the ring then swings Rage (mask 0) round onto it.
      const drift = 18 + 6 * Math.sin(t * TAU);
      ring.rotation.y = lerp(drift, 0, focus) * DEG;
      for (const { holder, turn, i, ph } of masks) {
        const front = i === 0 ? focus : 0;
        const idleY = 6.7 + (i % 2) * 0.7 + 0.25 * Math.sin(t * TAU + ph);
        holder.position.y = lerp(idleY, 4.8 - 0.3 * k, front);
        holder.position.z = lerp(3.7, 2.75 + 0.5 * k, front);
        // Each mask leans its face toward the viewer, then sways on its own rhythm.
        const world = ((((masks[i].a + ring.rotation.y / DEG) % 360) + 540) % 360) - 180;
        turn.rotation.y = lerp(-0.6 * world + 35 * Math.sin(t * TAU * (i % 2 ? 1 : 2) + ph), 0, front) * DEG;
        turn.rotation.z = lerp(12 * Math.sin(t * TAU + ph * 2), 0, front) * DEG;
        turn.rotation.x = lerp(14, -12, front) * DEG;
      }
    }

    update(0);
    return { root, update };
  },
};
