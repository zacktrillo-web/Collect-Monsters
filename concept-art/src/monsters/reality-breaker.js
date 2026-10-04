import { THREE, DEG, box, glow, pivot, prism, wedge, span, ease, lerp } from '../kit.js';

const C = {
  stone: '#5b576f',
  stoneLight: '#8a85a3',
  stoneDark: '#3a374b',
  rift: '#ff4fd8',
  core: '#ffd6f6',
  glitch: '#4ff3ff',
};

export default {
  id: 'reality-breaker',
  name: 'Reality Breaker',
  appearance: 'Asymmetric four-armed monster built from separated stone-like blocks, with bright gaps through its torso.',
  movement: 'Body sections shift apart during windup and reconnect on impact.',
  palette: [
    ['Rift stone', C.stone],
    ['Fracture edge', C.stoneLight],
    ['Deep stone', C.stoneDark],
    ['Rift light', C.rift],
    ['Core white', C.core],
    ['Glitch cyan', C.glitch],
  ],
  bg: ['#3b2552', '#0a0612'],
  rim: '#ff7ae3',
  keys: [
    [0.05, 'Idle'],
    [0.39, 'Shift apart'],
    [0.49, 'Reconnect'],
  ],
  notes: [
    'Nothing touches: every block floats with a ~0.25 stud gap, and a glowing core fills the torso gaps.',
    'Deliberately lopsided — one huge fist arm, one blade arm, one pincer arm, one small claw arm.',
    'Head sits off-centre on the left shoulder; one large rift eye, one small glitch eye.',
  ],
  build() {
    const root = new THREE.Group();
    const body = pivot(root, { p: [0, 4.6, 0] });
    const shards = [];
    const V = (a) => new THREE.Vector3(...a);

    // A block that drifts away from `origin` as the body separates.
    function shard(parent, size, color, p, o = {}) {
      const holder = pivot(parent, { p, r: o.r });
      box(holder, size, color);
      if (o.trim) box(holder, [size[0] + 0.06, 0.14, size[2] + 0.06], C.stoneLight, { p: [0, size[1] / 2 - 0.12, 0] });
      const dir = V(p).sub(V(o.origin || [0, 0.2, 0]));
      if (dir.lengthSq() < 1e-4) dir.set(0, 1, 0);
      shards.push({ obj: holder, base: V(p), dir: dir.normalize(), k: o.k ?? 1 });
      return holder;
    }

    // Rift core seen through the torso gaps
    box(body, [2.2, 3.2, 1.3], glow(C.rift, 1.7), { p: [0, 0.2, 0] });
    box(body, [1.0, 1.6, 1.5], glow(C.core, 2.2), { p: [0.2, 0.4, 0] });

    // Torso blocks
    shard(body, [1.6, 1.15, 1.9], C.stone, [-0.95, 1.55, 0], { r: [0, 0, 4], trim: true });
    shard(body, [1.35, 1.35, 1.8], C.stoneLight, [0.85, 1.6, 0.05], { r: [0, 0, -6] });
    shard(body, [1.2, 1.2, 1.95], C.stoneDark, [-1.15, 0.2, 0]);
    shard(body, [0.85, 0.95, 1.7], C.stone, [0.12, 0.15, 0.1], { r: [0, 0, 8] });
    shard(body, [1.15, 1.3, 1.85], C.stone, [1.25, 0.1, 0], { r: [0, 0, -3] });
    shard(body, [2.0, 1.0, 1.75], C.stone, [-0.4, -1.15, 0], { r: [0, 0, -4], trim: true });
    shard(body, [0.9, 0.9, 1.6], C.stoneLight, [1.3, -1.1, 0.05], { r: [0, 0, 7] });
    shard(body, [2.2, 0.8, 1.6], C.stoneDark, [0, -2.2, 0], { origin: [0, -1, 0], k: 0.6 });

    // Legs: thick left, thin right, with glowing joint gaps
    shard(body, [1.25, 1.0, 1.35], C.stone, [-0.95, -3.1, 0], { origin: [0, -1, 0], k: 0.5 });
    shard(body, [1.45, 0.9, 1.8], C.stoneDark, [-0.95, -4.15, 0.15], { origin: [0, -1, 0], k: 0.3 });
    shard(body, [0.85, 1.0, 1.0], C.stoneLight, [1.0, -3.1, 0], { origin: [0, -1, 0], k: 0.5 });
    shard(body, [1.1, 0.9, 1.45], C.stoneDark, [1.0, -4.15, 0.15], { origin: [0, -1, 0], k: 0.3 });
    for (const x of [-0.95, 1.0]) {
      box(body, [0.6, 0.12, 0.6], glow(C.rift, 2.2), { p: [x, -2.6, 0] });
      box(body, [0.5, 0.1, 0.5], glow(C.rift, 2.2), { p: [x, -3.65, 0.05] });
    }

    // Off-centre head
    const head = shard(body, [1.3, 1.1, 1.25], C.stoneLight, [-0.85, 2.75, 0.2], { r: [0, 12, 14], k: 1.4 });
    box(head, [0.55, 0.55, 0.1], glow(C.rift, 2.6), { p: [-0.15, 0.02, 0.64] });
    box(head, [0.22, 0.22, 0.1], glow(C.glitch, 2.6), { p: [0.38, 0.25, 0.64] });
    box(head, [0.6, 0.35, 0.6], C.stone, { p: [0.4, 0.95, -0.1], r: [0, 30, 10] });

    // Four mismatched arms, each a chain of floating blocks
    const arms = {};
    const armA = pivot(body, { p: [1.9, 1.4, 0] });
    shard(armA, [1.6, 1.3, 1.7], C.stone, [0.55, 0.2, 0], { origin: [0, 0, 0], trim: true });
    shard(armA, [1.2, 1.5, 1.25], C.stoneDark, [0.9, -1.2, 0], { origin: [0, 0, 0] });
    shard(armA, [1.5, 1.4, 1.5], C.stone, [1.0, -2.85, 0.15], { origin: [0, 0, 0] });
    const fist = shard(armA, [2.2, 1.9, 2.2], C.stoneLight, [1.1, -4.6, 0.3], { origin: [0, 0, 0] });
    for (const k of [-0.7, 0, 0.7]) box(fist, [0.5, 0.45, 0.4], C.stoneDark, { p: [k, -0.2, 1.15] });
    box(fist, [0.12, 1.2, 0.08], glow(C.rift, 2.4), { p: [0.3, 0.1, 1.12], r: [0, 0, 25] });
    arms.A = armA;

    const armB = pivot(body, { p: [1.75, -0.6, 0.4] });
    shard(armB, [0.6, 0.9, 0.6], C.stoneDark, [0.3, -0.45, 0], { origin: [0, 0, 0] });
    const claw = shard(armB, [0.55, 0.8, 0.55], C.stone, [0.4, -1.55, 0.25], { origin: [0, 0, 0] });
    for (const s of [-1, 1]) wedge(claw, [0.2, 0.5, 0.6], C.stoneLight, { p: [s * 0.15, -0.55, 0.15], r: [90, 0, 0] });
    arms.B = armB;

    const armC = pivot(body, { p: [-1.95, 1.6, 0] });
    shard(armC, [0.95, 1.3, 0.95], C.stone, [-0.5, -0.4, 0], { origin: [0, 0, 0] });
    shard(armC, [0.8, 1.6, 0.8], C.stoneDark, [-0.75, -2.0, 0], { origin: [0, 0, 0] });
    const blade = shard(armC, [0.3, 0.3, 0.3], C.stone, [-0.8, -3.1, 0], { origin: [0, 0, 0] });
    prism(blade, [[-0.45, 0], [0.45, 0], [0.1, -2.6], [-0.15, -2.2]], 0.28, C.stoneLight, { p: [0, 0.1, 0] });
    box(blade, [0.08, 1.8, 0.32], glow(C.glitch, 2.2), { p: [-0.05, -1.0, 0], r: [0, 0, 6] });
    arms.C = armC;

    const armD = pivot(body, { p: [-1.75, -0.5, 0.4] });
    shard(armD, [0.8, 1.0, 0.8], C.stone, [-0.4, -0.5, 0], { origin: [0, 0, 0] });
    const pincer = shard(armD, [0.8, 0.9, 0.8], C.stoneDark, [-0.5, -1.65, 0.2], { origin: [0, 0, 0] });
    for (const s of [-1, 1]) box(pincer, [0.25, 0.9, 0.35], C.stoneLight, { p: [s * 0.3, -0.8, 0.15], r: [0, 0, s * -18] });
    arms.D = armD;

    // Orbiting glitch debris
    const debris = [];
    [[C.stone, 0.45], [glow(C.rift, 2.2), 0.25], [C.stoneLight, 0.35], [glow(C.glitch, 2.2), 0.22], [C.stoneDark, 0.4], [glow(C.rift, 2.2), 0.18]].forEach(
      ([m, sz], i) => {
        const orbit = pivot(body);
        box(orbit, [sz, sz, sz], m, { p: [3.4 + (i % 2) * 0.6, -1.2 + i * 0.7, 0], r: [i * 20, i * 33, 0] });
        debris.push({ orbit, i });
      },
    );

    const TAU = Math.PI * 2;
    function update(t) {
      const wind = span(t, 0.18, 0.39);
      const hit = span(t, 0.41, 0.48, ease.in);
      const back = span(t, 0.62, 0.95);
      const sep = (0.08 + 0.04 * Math.sin(t * TAU * 3)) * (1 - wind) + 0.9 * wind * (1 - hit) - 0.06 * hit * (1 - back) + 0.08 * hit * back;

      for (const { obj, base, dir, k } of shards) obj.position.copy(base).addScaledVector(dir, sep * k);

      const w = wind * (1 - hit);
      const h = hit * (1 - back);
      body.rotation.y = (25 * w - 15 * h) * DEG;
      body.rotation.x = (-6 * w + 10 * h) * DEG;
      body.position.y = 4.6 - 0.25 * h;
      arms.A.rotation.set((lerp(0, -120, w) - 25 * h) * DEG, 0, (10 + 25 * w - 5 * h) * DEG);
      arms.C.rotation.set((lerp(-5, -95, w) - 30 * h) * DEG, 0, (-10 - 30 * w + 25 * h) * DEG);
      arms.B.rotation.set((-20 * w - 40 * h) * DEG, 0, (15 * w) * DEG);
      arms.D.rotation.set((-30 * w - 20 * h) * DEG, 0, (-20 * w) * DEG);
      for (const { orbit, i } of debris) orbit.rotation.y = (i * 60 * DEG) + (i % 2 ? 1 : -1) * t * TAU;
    }

    update(0);
    return { root, update };
  },
};
