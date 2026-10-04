import { THREE, DEG, box, cyl, glow, pivot, span, bump, ease } from '../kit.js';

const C = {
  metal: '#3c424d',
  metalLight: '#6c7584',
  metalDark: '#22262d',
  code: '#3dff8f',
  cables: ['#151515', '#d23c3c', '#e6c23a', '#3a7bd5'],
  tooth: '#b9c2cf',
  mouth: '#0d1a12',
};

const N = 14;
const smooth = (a, b, x) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

export default {
  id: 'end-of-code',
  name: 'End of Code',
  appearance: 'Long mechanical wyrm with chunky bracket-shaped ribs, bundled cables, and a heavy rectangular jaw.',
  movement: 'Rib sections close in sequence from tail to head.',
  palette: [
    ['Gunmetal', C.metal],
    ['Machined edge', C.metalLight],
    ['Chassis dark', C.metalDark],
    ['Terminal green', C.code],
    ['Signal red', C.cables[1]],
    ['Bus yellow', C.cables[2]],
  ],
  bg: ['#1d3a2c', '#050b08'],
  rim: '#3dff8f',
  hero: { az: -58, el: 24 },
  keys: [
    [0.06, 'Ribs open'],
    [0.32, 'Closing'],
    [0.56, 'Jaw slam'],
  ],
  notes: [
    'Each body section = spine block + cable bundle + two "[ ]" bracket ribs that hinge shut around the cables.',
    'Cables are 4 coloured cylinders running the full length; they stay visible between closed ribs.',
    'Head is a heavy rectangular slab with two screen-eyes; the tail ends in a blinking cursor block.',
  ],
  build() {
    const root = new THREE.Group();

    const segs = [];
    for (let i = 0; i < N; i++) {
      const s = i / (N - 1);
      const k = 0.75 + 0.55 * s;
      const seg = pivot(root);
      box(seg, [1.1 * k, 0.8 * k, 1.0], C.metal, { p: [0, 0.45 * k, 0] });
      box(seg, [0.5 * k, 0.35 * k, 0.8], C.metalLight, { p: [0, 0.95 * k, 0] });
      box(seg, [0.16, 0.12, 0.6], glow(C.code, 2.0), { p: [0, 1.15 * k, 0] });
      C.cables.forEach((c, j) =>
        cyl(seg, [0.17 * k, 0.17 * k, 1.15, 6], c, { p: [(j - 1.5) * 0.36 * k, -0.25 * k + (j % 2) * 0.12, 0], r: [90, 0, 0], outline: false }),
      );
      const ribs = [];
      for (const side of [-1, 1]) {
        const hinge = pivot(seg, { p: [side * 0.55 * k, 0.75 * k, 0] });
        const r = pivot(hinge);
        box(r, [0.9 * k, 0.32, 0.5], C.metalLight, { p: [side * 0.45 * k, 0, 0] });
        box(r, [0.34, 1.6 * k, 0.5], C.metal, { p: [side * 0.9 * k, -0.7 * k, 0] });
        box(r, [0.7 * k, 0.3, 0.5], C.metalLight, { p: [side * 0.6 * k, -1.4 * k, 0] });
        if (i % 2 === 0) box(r, [0.06, 0.8 * k, 0.16], glow(C.code, 1.5), { p: [side * (0.9 * k + 0.18), -0.7 * k, 0] });
        ribs.push({ r, side });
      }
      segs.push({ seg, s, ribs, k });
    }

    // Tail cursor
    const cursor = pivot(segs[0].seg, { p: [0, 0.3, -1.0] });
    const cursorBlock = box(cursor, [0.35, 0.8, 0.35], glow(C.code, 2.6));

    // Head: heavy rectangular slab with a hinged jaw
    const head = pivot(root);
    box(head, [2.6, 1.5, 2.8], C.metal, { p: [0, 0.45, 0.6] });
    box(head, [2.8, 0.4, 3.0], C.metalLight, { p: [0, 1.3, 0.5] });
    box(head, [2.2, 0.5, 0.5], C.metalDark, { p: [0, 0.7, 2.05] });
    for (const s of [-1, 1]) {
      box(head, [0.75, 0.42, 0.1], glow(C.code, 2.6), { p: [s * 0.6, 0.7, 2.31] });
      box(head, [0.3, 1.2, 0.3], C.metalLight, { p: [s * 1.45, 0.4, 1.4] });
      box(head, [0.3, 0.3, 0.6], C.metalLight, { p: [s * 1.45, 0.85, 1.75] });
      box(head, [0.3, 0.3, 0.6], C.metalLight, { p: [s * 1.45, -0.05, 1.75] });
      for (const [j, c] of C.cables.entries()) {
        const cab = pivot(head, { p: [s * (0.6 + j * 0.18), 0.9, -0.8], r: [-50 + j * 8, 0, s * 10] });
        cyl(cab, [0.1, 0.1, 1.6, 5], c, { p: [0, -0.8, 0], outline: false });
      }
    }
    for (let i = 0; i < 5; i++) box(head, [0.3, 0.32, 0.3], C.tooth, { p: [-0.9 + i * 0.45, -0.38, 1.85] });
    box(head, [2.2, 0.3, 2.0], glow(C.code, 1.2), { p: [0, -0.35, 0.8], outline: false });
    const jaw = pivot(head, { p: [0, -0.3, -0.6] });
    box(jaw, [2.8, 0.95, 3.1], C.metal, { p: [0, -0.5, 1.5] });
    box(jaw, [2.9, 0.3, 0.6], C.metalDark, { p: [0, -0.9, 2.8] });
    for (let i = 0; i < 5; i++) box(jaw, [0.32, 0.4, 0.32], C.tooth, { p: [-0.9 + i * 0.45, 0.15, 2.7] });
    box(jaw, [2.0, 0.1, 2.4], C.mouth, { p: [0, 0.0, 1.4], outline: false });

    const P = new THREE.Vector3();
    const Q = new THREE.Vector3();
    const TAU = Math.PI * 2;
    let phase = 0;
    function point(s, out) {
      out.set(
        3.4 * Math.sin(Math.PI * 1.25 * s + 0.4) * (1 - 0.55 * s) + 0.35 * Math.sin(TAU * (s * 1.2 + phase)) * (1 - s),
        0.7 + 3.4 * smooth(0.62, 1.0, s),
        -10 + 15 * s - 1.4 * smooth(0.8, 1.0, s),
      );
      return out;
    }

    function update(t) {
      phase = t;
      for (const { seg, s, ribs } of segs) {
        point(s, P);
        point(Math.min(1.05, s + 0.04), Q);
        seg.position.copy(P);
        seg.lookAt(Q);
        const at = 0.12 + 0.3 * s;
        const closed = span(t, at, at + 0.07, ease.in) * (1 - span(t, 0.74 + 0.1 * (1 - s), 0.84 + 0.1 * (1 - s)));
        for (const { r, side } of ribs) r.rotation.z = side * (70 * (1 - closed)) * DEG;
      }
      point(1, P);
      point(0.96, Q);
      head.position.copy(P).add(new THREE.Vector3(0, 0.6, 0.4));
      head.lookAt(head.position.clone().add(new THREE.Vector3().subVectors(P, Q).setY(0).normalize().add(new THREE.Vector3(0, -0.1, 0))));
      jaw.rotation.x = (6 + 34 * bump(t, 0.44, 0.52, 0.58, ease.out)) * DEG;
      head.rotation.x += (-14 * bump(t, 0.44, 0.52, 0.6)) * DEG;
      cursorBlock.visible = Math.floor(t * 8) % 2 === 0;
    }

    update(0);
    return { root, update };
  },
};
