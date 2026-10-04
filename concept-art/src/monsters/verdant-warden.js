import { THREE, DEG, box, glow, pivot, span, bump, lerp, ease } from '../kit.js';

const C = {
  bark: '#5c3d27',
  barkDark: '#3b2618',
  hollow: '#140d08',
  leaf: '#4f9a3f',
  leafLight: '#7cc451',
  leafDark: '#2f6430',
  antler: '#c9b58a',
  moss: '#9fe36a',
  eye: '#e8ff7a',
};

export default {
  id: 'verdant-warden',
  name: 'Verdant Warden',
  appearance:
    'Six-legged woodland beast with block-built antlers, layered leaf plates, and a hollow trunk chest.',
  movement: 'Root toes curl as it walks; antlers lower before a heavy stomp.',
  palette: [
    ['Old bark', C.bark],
    ['Heartwood', C.barkDark],
    ['Leaf plate', C.leaf],
    ['New growth', C.leafLight],
    ['Antler bone', C.antler],
    ['Spirit moss', C.moss],
  ],
  bg: ['#2c4a2a', '#0b140c'],
  rim: '#a6f06b',
  hero: { az: -26, el: 10 },
  keys: [
    [0.1, 'Walk'],
    [0.42, 'Antlers lower'],
    [0.56, 'Stomp'],
  ],
  notes: [
    'Long log-shaped body on three leg pairs; the front pair is thickest and does the stomp.',
    'Chest is a hollow trunk ring — keep the dark cavity deep so the moss glow reads inside it.',
    'Antlers are stacked cubes, branching in 90° steps, with small leaf cubes on the tips.',
  ],
  build() {
    const root = new THREE.Group();
    const body = pivot(root, { p: [0, 3.27, 0] });

    // Trunk body
    box(body, [3.2, 2.6, 6.6], C.bark, { p: [0, 0, -0.4] });
    box(body, [2.6, 0.5, 6.0], C.barkDark, { p: [0, -1.45, -0.4] });
    for (const z of [-2.6, -0.9, 0.8]) box(body, [3.4, 0.35, 0.5], C.barkDark, { p: [0, 0.4, z] });

    // Hollow trunk chest: a bark ring around a dark cavity with glowing moss inside
    const chest = pivot(body, { p: [0, 0.1, 2.9] });
    box(chest, [3.6, 0.8, 1.4], C.bark, { p: [0, 1.25, 0] });
    box(chest, [3.4, 0.7, 1.4], C.bark, { p: [0, -1.15, 0] });
    for (const s of [-1, 1]) box(chest, [0.85, 2.4, 1.4], C.bark, { p: [s * 1.38, 0.05, 0] });
    box(chest, [2.0, 1.75, 0.3], C.hollow, { p: [0, 0.05, -0.55], outline: false });
    for (const [x, y] of [[-0.5, -0.5], [0.35, -0.6], [0.1, -0.2], [-0.2, 0.35], [0.55, 0.3]])
      box(chest, [0.22, 0.22, 0.22], glow(C.moss, 1.8), { p: [x, y, -0.25] });
    box(chest, [3.8, 0.25, 1.5], C.barkDark, { p: [0, 1.7, 0] });

    // Layered leaf plates along the spine
    for (let i = 0; i < 6; i++) {
      const z = 2.2 - i * 1.0;
      for (const s of [-1, 1]) {
        box(body, [1.9, 0.22, 1.5], i % 2 ? C.leaf : C.leafDark, { p: [s * 0.95, 1.55 - i * 0.04, z], r: [-14, 0, s * -22] });
        box(body, [1.3, 0.2, 1.1], C.leafLight, { p: [s * 0.75, 1.75 - i * 0.04, z - 0.25], r: [-14, 0, s * -18] });
      }
    }
    // Leafy tail tuft
    box(body, [1.4, 0.9, 1.4], C.leafDark, { p: [0, 0.6, -4.0], r: [20, 0, 0] });
    box(body, [0.9, 0.7, 1.0], C.leaf, { p: [0, 0.9, -4.6], r: [35, 0, 0] });

    // Head + block antlers
    const neck = pivot(body, { p: [0, 1.7, 3.3] });
    box(neck, [1.5, 1.8, 1.6], C.bark, { p: [0, 0.3, 0.4], r: [-25, 0, 0] });
    const head = pivot(neck, { p: [0, 1.1, 1.5] });
    box(head, [1.9, 1.5, 1.9], C.bark, { p: [0, 0, 0] });
    box(head, [1.3, 0.95, 1.4], C.barkDark, { p: [0, -0.3, 1.4] });
    box(head, [0.9, 0.35, 0.4], C.hollow, { p: [0, -0.15, 2.05] });
    for (const s of [-1, 1]) {
      box(head, [0.36, 0.3, 0.1], glow(C.eye, 2.4), { p: [s * 0.55, 0.25, 0.97] });
      box(head, [0.55, 0.22, 0.6], C.leafDark, { p: [s * 1.1, 0.35, 0], r: [0, 0, s * 30] });
      const ant = pivot(head, { p: [s * 0.55, 0.75, -0.2], r: [-12, 0, s * -18] });
      const seg = (p, sz) => box(ant, sz, C.antler, { p });
      seg([s * 0.1, 0.45, 0], [0.42, 0.9, 0.42]);
      seg([s * 0.75, 0.85, 0], [1.5, 0.42, 0.42]);
      seg([s * 1.35, 1.35, 0], [0.4, 0.9, 0.4]);
      seg([s * 2.0, 1.75, 0], [1.4, 0.38, 0.38]);
      seg([s * 2.55, 2.15, 0], [0.36, 0.8, 0.36]);
      seg([s * 0.55, 1.35, 0.25], [0.34, 0.75, 0.34]);
      seg([s * 1.7, 2.2, -0.05], [0.34, 0.55, 0.34]);
      seg([s * 1.6, 1.0, 0.45], [0.75, 0.3, 0.3]);
      seg([s * 2.85, 1.75, 0], [0.6, 0.3, 0.3]);
      for (const [x, y, z] of [[2.55, 2.6, 0], [1.7, 2.55, -0.05], [0.55, 1.75, 0.25], [3.15, 1.75, 0]])
        box(ant, [0.36, 0.26, 0.36], C.leafLight, { p: [s * x, y, z], r: [0, 45, 0] });
    }

    // Six legs with curling root toes
    const legs = [];
    const legZ = [2.2, -0.3, -2.8];
    for (let pair = 0; pair < 3; pair++) {
      for (const s of [-1, 1]) {
        const thick = pair === 0 ? 1.2 : 1.0;
        const hip = pivot(body, { p: [s * 1.75, -0.6, legZ[pair]] });
        box(hip, [thick, 1.6, thick], C.bark, { p: [0, -0.5, 0] });
        const knee = pivot(hip, { p: [0, -1.3, 0] });
        box(knee, [thick * 0.9, 1.3, thick * 0.9], C.barkDark, { p: [0, -0.55, 0] });
        const foot = pivot(knee, { p: [0, -1.2, 0] });
        box(foot, [thick * 1.1, 0.35, thick * 1.1], C.bark, { p: [0, 0, 0] });
        const toes = [];
        for (const [tx, ty] of [[-0.4, 0], [0, 0], [0.4, 0]]) {
          const toe = pivot(foot, { p: [tx * thick, -0.05, thick * 0.5], r: [0, tx * 40, 0] });
          box(toe, [0.26, 0.24, 0.7], C.barkDark, { p: [0, -0.02, 0.3] });
          const tip = pivot(toe, { p: [0, 0, 0.62] });
          box(tip, [0.22, 0.2, 0.45], C.bark, { p: [0, -0.06, 0.18], r: [12, 0, 0] });
          toes.push({ toe, tip });
        }
        legs.push({ hip, knee, foot, toes, phase: (pair + (s > 0 ? 1 : 0)) % 2, pair });
      }
    }

    const TAU = Math.PI * 2;
    function update(t) {
      const walk = 1 - span(t, 0.28, 0.4);
      const lower = span(t, 0.3, 0.44);
      const rear = bump(t, 0.4, 0.5, 0.56, ease.out);
      const stomp = span(t, 0.5, 0.56, ease.in);
      const back = span(t, 0.7, 0.98);
      const walkBack = span(t, 0.82, 0.98);
      const gait = walk + walkBack;

      body.position.y = 3.27 + 0.08 * Math.sin(t * TAU * 4) * gait - 0.25 * stomp * (1 - back);
      body.rotation.x = (-12 * rear * (1 - stomp) + 4 * stomp * (1 - back)) * DEG;
      neck.rotation.x = (lerp(0, 32, lower) * (1 - back)) * DEG;
      head.rotation.x = (lerp(0, 10, lower) * (1 - back)) * DEG;

      for (const { hip, knee, foot, toes, phase, pair } of legs) {
        const cyc = Math.sin((t * 4 + phase * 0.5) * TAU);
        const lift = Math.max(0, cyc) * gait;
        let swing = cyc * 18 * gait;
        let bend = -lift * 35;
        if (pair === 0) {
          swing += -40 * rear * (1 - stomp);
          bend += -45 * rear * (1 - stomp);
        }
        hip.rotation.x = swing * DEG;
        knee.rotation.x = -bend * DEG;
        foot.rotation.x = (-swing + bend) * DEG;
        const curl = Math.max(lift, pair === 0 ? rear * (1 - stomp) : 0);
        for (const { toe, tip } of toes) {
          toe.rotation.x = 45 * curl * DEG;
          tip.rotation.x = 70 * curl * DEG;
        }
      }
    }

    update(0);
    return { root, update };
  },
};
