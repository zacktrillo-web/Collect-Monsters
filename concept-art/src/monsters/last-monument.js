import { THREE, DEG, box, cyl, glow, pivot, span, bump, ease } from '../kit.js';

const C = {
  sand: '#c6a877',
  sandMid: '#a88b5d',
  sandDark: '#7e6744',
  carve: '#5a4830',
  inlay: '#3fbfae',
  eye: '#5ff5e0',
};

export default {
  id: 'last-monument',
  name: 'Last Monument',
  appearance: 'Tall stepped stone monster with oversized hanging arms, carved face details, and layered shoulder structures.',
  movement: 'Torso sections settle sequentially after each heavy step.',
  palette: [
    ['Sandstone', C.sand],
    ['Weathered', C.sandMid],
    ['Deep carving', C.sandDark],
    ['Groove shadow', C.carve],
    ['Turquoise inlay', C.inlay],
    ['Ancient eye', C.eye],
  ],
  bg: ['#6b5232', '#150f07'],
  rim: '#5ff5e0',
  keys: [
    [0.04, 'Stand'],
    [0.22, 'Heavy step'],
    [0.32, 'Settle'],
  ],
  notes: [
    'Tallest secret (~13 studs): a stepped tower of 4 stacked torso blocks and a carved head block.',
    'Each torso block is its own part so they can drop and settle one after another, bottom to top.',
    'Arms are longer than the legs and the hands rest near the ground; shoulders are 3-tier stone slabs.',
  ],
  build() {
    const root = new THREE.Group();
    const rig = pivot(root);

    // Legs
    const legs = [];
    for (const s of [-1, 1]) {
      const hip = pivot(rig, { p: [s * 1.25, 2.3, 0] });
      box(hip, [1.7, 2.0, 1.9], C.sandMid, { p: [0, -1.0, 0] });
      box(hip, [2.1, 0.5, 2.5], C.sandDark, { p: [0, -2.05, 0.2] });
      box(hip, [1.8, 0.15, 1.95], C.inlay, { p: [0, -0.55, 0], outline: false });
      legs.push({ hip, s });
    }

    // Stacked torso sections, bottom to top
    const sections = [];
    const sec = (y, w, h, d, col) => {
      const p = pivot(rig, { p: [0, y, 0] });
      box(p, [w, h, d], col);
      box(p, [w + 0.08, 0.16, d + 0.08], C.carve, { p: [0, -h / 2 + 0.25, 0], outline: false });
      sections.push({ p, y });
      return p;
    };
    const s0 = sec(3.0, 3.8, 1.4, 2.7, C.sandMid);
    const s1 = sec(4.6, 4.6, 1.8, 3.0, C.sand);
    const s2 = sec(6.5, 5.3, 2.0, 3.2, C.sand);
    const s3 = sec(8.3, 4.0, 1.6, 2.8, C.sandMid);
    for (const x of [-1.2, 0, 1.2]) box(s1, [0.5, 0.5, 0.1], glow(C.inlay, 1.6), { p: [x, 0.1, 1.52], r: [0, 0, 45] });
    for (const x of [-1.6, -0.55, 0.55, 1.6]) box(s2, [0.65, 1.1, 0.15], C.sandDark, { p: [x, 0.0, 1.62] });
    box(s2, [4.4, 0.2, 0.18], glow(C.inlay, 1.6), { p: [0, 0.75, 1.62] });
    box(s3, [2.4, 0.6, 0.12], C.carve, { p: [0, 0, 1.42], outline: false });

    // Carved head block
    const head = sec(10.3, 2.9, 2.4, 2.5, C.sand);
    box(head, [3.1, 0.45, 0.6], C.sandDark, { p: [0, 0.55, 1.15] });
    for (const s of [-1, 1]) {
      box(head, [0.75, 0.55, 0.3], C.carve, { p: [s * 0.65, 0.05, 1.15], outline: false });
      box(head, [0.32, 0.22, 0.1], glow(C.eye, 2.6), { p: [s * 0.65, 0.05, 1.31] });
      cyl(head, [0.45, 0.45, 0.25, 8], C.inlay, { p: [s * 1.55, -0.1, 0.2], r: [0, 0, 90] });
    }
    box(head, [0.55, 0.8, 0.5], C.sandMid, { p: [0, -0.35, 1.35] });
    box(head, [1.5, 0.35, 0.3], C.carve, { p: [0, -0.9, 1.15], outline: false });
    for (const x of [-0.5, -0.17, 0.17, 0.5]) box(head, [0.14, 0.35, 0.32], C.sand, { p: [x, -0.9, 1.18] });
    box(head, [2.4, 0.6, 2.1], C.sandMid, { p: [0, 1.5, 0] });
    box(head, [1.5, 0.6, 1.4], C.sandDark, { p: [0, 2.1, 0] });
    box(head, [0.5, 0.5, 0.2], glow(C.inlay, 2.0), { p: [0, 1.5, 1.08], r: [0, 0, 45] });

    // Layered shoulders + oversized hanging arms
    const arms = [];
    for (const s of [-1, 1]) {
      box(s3, [2.4, 0.5, 2.9], C.sandDark, { p: [s * 2.9, -0.2, 0] });
      box(s3, [2.0, 0.5, 2.5], C.sandMid, { p: [s * 3.05, 0.3, 0] });
      box(s3, [1.5, 0.5, 2.0], C.sand, { p: [s * 3.2, 0.8, 0] });
      box(s3, [1.0, 0.18, 1.5], C.inlay, { p: [s * 3.2, 1.12, 0], outline: false });
      const sh = pivot(s2, { p: [s * 3.25, 0.4, 0] });
      box(sh, [1.5, 3.0, 1.5], C.sandMid, { p: [0, -1.5, 0] });
      box(sh, [1.65, 0.3, 1.65], C.carve, { p: [0, -2.6, 0], outline: false });
      const el = pivot(sh, { p: [0, -3.0, 0] });
      box(el, [1.6, 2.3, 1.6], C.sand, { p: [0, -1.15, 0] });
      box(el, [1.7, 0.2, 1.7], C.inlay, { p: [0, -0.4, 0], outline: false });
      const hand = pivot(el, { p: [0, -2.3, 0] });
      box(hand, [2.3, 1.7, 2.1], C.sandMid, { p: [0, -0.8, 0.15] });
      for (const k of [-0.75, 0, 0.75]) box(hand, [0.55, 0.6, 0.45], C.sandDark, { p: [k, -1.35, 1.15] });
      arms.push({ sh, el, s });
    }

    const TAU = Math.PI * 2;
    // Two heavy steps per loop: left lands at 0.24, right at 0.74.
    const lands = [0.24, 0.74];
    // Damped drop that starts when a foot lands; higher sections (i) react a beat later.
    const ring = (t, land, i) => {
      const x = (((t - land - i * 0.035) % 1) + 1) % 1;
      return Math.exp(-7 * x) * Math.sin(16 * x);
    };
    function update(t) {
      const lifts = [bump(t, 0.06, 0.16, 0.24, ease.out), bump(t, 0.56, 0.66, 0.74, ease.out)];
      const shift = Math.sin((t - 0.12) * TAU) * 0.35;
      rig.position.x = shift;
      rig.rotation.z = -shift * 6 * DEG;
      legs.forEach(({ hip }, i) => {
        hip.position.y = 2.3 + 0.9 * lifts[i];
        hip.rotation.x = -20 * lifts[i] * DEG;
      });
      sections.forEach(({ p, y }, i) => {
        let d = 0;
        for (const land of lands) d += ring(t, land, i);
        p.position.y = y - 0.32 * d;
        p.rotation.z = (i % 2 ? 1 : -1) * 1.5 * d * DEG;
      });
      for (const { sh, el, s } of arms) {
        let d = 0;
        for (const land of lands) d += ring(t, land, 3);
        sh.rotation.x = (6 * Math.sin((t - 0.2) * TAU * 2) - 6 * d) * DEG;
        sh.rotation.z = s * (4 + 3 * d) * DEG;
        el.rotation.x = (-8 - 8 * d) * DEG;
      }
    }

    update(0);
    return { root, update };
  },
};
