import { THREE, DEG, box, sph, tor, wedge, glow, pivot, span, bump, ease } from '../kit.js';

const C = {
  void: '#1e184d',
  plate: '#4c2fa0',
  plateLight: '#7c5cff',
  belly: '#bba9ff',
  horn: '#efe8ff',
  ring: '#ffd27a',
  ringDark: '#b9853a',
  star: '#ffffff',
  eye: '#8ef3ff',
};

const N = 20;
const smooth = (a, b, x) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

// Mean spine path: tail low at the back, rising through the ring to a raised head.
function basePath(s, out) {
  return out.set(0, 1.3 + 7.2 * smooth(0.12, 1.0, s), -8 + 11 * s - 1.5 * smooth(0.75, 1, s));
}

export default {
  id: 'universe-unbound',
  name: 'Universe Unbound',
  appearance: 'Segmented cosmic serpent with a large orbital ring around its body and a clearly defined dragon-like head.',
  movement: 'Body undulates through the ring; tail follows with a delayed wave.',
  palette: [
    ['Void hide', C.void],
    ['Nebula plate', C.plate],
    ['Starlight edge', C.plateLight],
    ['Belly glow', C.belly],
    ['Orbit gold', C.ring],
    ['Comet eye', C.eye],
  ],
  bg: ['#2a1f63', '#06051a'],
  rim: '#8ef3ff',
  hero: { az: -68, el: 12 },
  keys: [
    [0.0, 'Drift'],
    [0.33, 'Undulate'],
    [0.62, 'Tail wave'],
  ],
  notes: [
    '20 body segments that shrink toward the tail; each is one block + a dorsal plate + star specks.',
    'The orbital ring is a separate floating part — the body passes through its centre, never touching it.',
    'Head reads as a dragon at a glance: long snout, swept-back horns, glowing eyes, whisker fins.',
  ],
  build() {
    const root = new THREE.Group();

    // Body segments
    const segs = [];
    for (let i = 0; i < N; i++) {
      const s = i / (N - 1);
      const w = 0.7 + 1.2 * Math.sin(Math.min(1, s * 1.15) * Math.PI * 0.5);
      const seg = pivot(root);
      box(seg, [w, w * 0.92, 1.0], C.void);
      box(seg, [w * 0.7, 0.2, 0.8], C.belly, { p: [0, -w * 0.48, 0] });
      box(seg, [w * 0.8, 0.28, 0.75], i % 2 ? C.plate : C.plateLight, { p: [0, w * 0.5, 0], r: [-8, 0, 0] });
      if (i % 2 === 0) wedge(seg, [0.16, w * 0.45, 0.6], C.plateLight, { p: [0, w * 0.82, -0.05] });
      if (i % 3 === 1) box(seg, [0.14, 0.14, 0.14], glow(C.star, 2.4), { p: [w * 0.51, w * 0.15, 0.1] });
      if (i % 3 === 2) box(seg, [0.12, 0.12, 0.12], glow(C.eye, 2.4), { p: [-w * 0.51, -w * 0.1, -0.15] });
      segs.push({ seg, s });
    }
    // Tail tip: comet fin
    const tailTip = segs[0].seg;
    wedge(tailTip, [0.12, 1.4, 1.6], C.plateLight, { p: [0, 0.4, -1.0], r: [0, 180, 0] });
    box(tailTip, [0.25, 0.25, 0.25], glow(C.eye, 2.6), { p: [0, 0, -0.8] });

    // Dragon head
    const head = pivot(root);
    box(head, [2.2, 1.6, 2.2], C.void, { p: [0, 0.1, 0.2] });
    box(head, [1.6, 0.9, 1.8], C.void, { p: [0, -0.05, 1.9] });
    box(head, [1.7, 0.3, 1.9], C.plate, { p: [0, 0.48, 1.8] });
    box(head, [2.3, 0.4, 1.4], C.plateLight, { p: [0, 0.95, 0.3] });
    const jaw = pivot(head, { p: [0, -0.55, 0.6] });
    box(jaw, [1.5, 0.45, 2.4], C.void, { p: [0, -0.15, 1.1] });
    box(jaw, [1.3, 0.15, 2.0], C.belly, { p: [0, -0.4, 1.1] });
    for (const x of [-0.55, 0.55]) box(jaw, [0.2, 0.35, 0.2], C.horn, { p: [x, 0.2, 2.1] });
    for (const s of [-1, 1]) {
      box(head, [0.5, 0.26, 0.12], glow(C.eye, 2.8), { p: [s * 0.62, 0.45, 1.33], r: [0, 0, s * -12] });
      box(head, [0.18, 0.18, 0.1], C.void, { p: [s * 0.4, 0.15, 2.82] });
      const horn = pivot(head, { p: [s * 0.75, 1.0, -0.4], r: [-30, s * 18, 0] });
      box(horn, [0.42, 0.42, 1.6], C.horn, { p: [0, 0, -0.7] });
      box(horn, [0.3, 0.3, 1.2], C.horn, { p: [0, 0.25, -1.8], r: [-20, 0, 0] });
      box(horn, [0.2, 0.2, 0.8], C.horn, { p: [0, 0.6, -2.6], r: [-35, 0, 0] });
      const whisk = pivot(head, { p: [s * 0.8, -0.1, 2.2], r: [0, s * 40, 0] });
      box(whisk, [0.1, 0.1, 1.4], C.plateLight, { p: [0, 0, 0.7] });
      box(whisk, [0.2, 0.2, 0.2], glow(C.eye, 2.6), { p: [0, 0, 1.45] });
      box(head, [0.15, 1.0, 1.2], C.plateLight, { p: [s * 1.15, 0.1, -0.2], r: [0, s * 20, s * -15] });
    }

    // Orbital ring with moons
    const ringPivot = pivot(root);
    const ring = pivot(ringPivot);
    tor(ring, [3.6, 0.22, 6, 48], C.ring);
    tor(ring, [3.25, 0.06, 4, 48], glow(C.ring, 1.6));
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      box(ring, [0.18, 0.5, 0.5], C.ringDark, { p: [Math.cos(a) * 3.6, Math.sin(a) * 3.6, 0], r: [0, 0, (a * 180) / Math.PI] });
    }
    const moons = [];
    for (const [r, col, a0] of [[0.55, '#ff8f6b', 0], [0.38, '#7ad8ff', 2.2], [0.3, '#f6e6ff', 4.1]]) {
      const m = pivot(ring);
      sph(m, r, col, { p: [3.6, 0, 0] });
      moons.push({ m, a0 });
    }

    const P = new THREE.Vector3();
    const Q = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    const TAU = Math.PI * 2;
    let phase = 0;
    let whip = 0;
    function point(s, out) {
      basePath(s, out);
      const amp = 1.5 * (1 - 0.75 * s) + whip * 1.8 * Math.max(0, 0.35 - s) * 3;
      out.x += amp * Math.sin(TAU * (1.35 * s + phase));
      out.y += 0.45 * (1 - s) * Math.sin(TAU * (1.35 * s + phase + 0.25));
      return out;
    }

    // Place the ring once on the mean path.
    basePath(0.44, P);
    basePath(0.47, Q);
    ringPivot.position.copy(P);
    ringPivot.lookAt(Q);
    const ringY = P.y;

    function update(t) {
      phase = t;
      whip = bump(t, 0.5, 0.64, 0.85);
      for (const { seg, s } of segs) {
        point(s, P);
        point(Math.min(1.02, s + 0.03), Q);
        seg.position.copy(P);
        seg.lookAt(Q);
      }
      point(1, P);
      point(0.97, Q);
      tmp.subVectors(P, Q).normalize().lerp(new THREE.Vector3(0, -0.25, 1).normalize(), 0.65);
      head.position.copy(P).addScaledVector(tmp, 0.7);
      head.lookAt(head.position.clone().add(tmp));
      jaw.rotation.x = (8 + 22 * bump(t, 0.2, 0.3, 0.42, ease.out)) * DEG;
      ring.rotation.z = 0.1 * Math.sin(t * TAU);
      for (const { m, a0 } of moons) m.rotation.z = a0 + t * TAU;
      ringPivot.position.y = ringY + 0.15 * Math.sin(t * TAU);
    }

    update(0);
    return { root, update };
  },
};
