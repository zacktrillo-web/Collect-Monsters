import { THREE, DEG, box, glow, pivot, prism, wedge, span, bump, ease } from '../kit.js';

const C = {
  hide: '#1f5a6e',
  hideDark: '#133746',
  belly: '#cbdcbf',
  mouth: '#3f0c19',
  gum: '#8c2539',
  teeth: '#f5efe1',
  fin: '#2e8b98',
  finRay: '#1d6470',
  inner: '#b98a90',
  eye: '#ffd84a',
  glow: '#7ff0dc',
};

export default {
  id: 'oceans-hunger',
  name: 'Ocean’s Hunger',
  appearance: 'A huge square-toothed sea monster with four broad fins and a mouth that dominates its silhouette.',
  movement: 'Fins spread and a second jaw extends from inside its mouth.',
  palette: [
    ['Abyss teal', C.hide],
    ['Trench blue', C.hideDark],
    ['Pale belly', C.belly],
    ['Maw red', C.mouth],
    ['Square teeth', C.teeth],
    ['Fin glow', C.glow],
  ],
  bg: ['#17506a', '#04121b'],
  rim: '#7ff0dc',
  hero: { az: -36, el: 20 },
  keys: [
    [0.08, 'Idle'],
    [0.44, 'Fins spread'],
    [0.56, 'Second jaw'],
  ],
  notes: [
    'The front half is all mouth: the jaw box is as wide as the body and opens ~35° on a rear hinge.',
    'Teeth are plain cubes in single rows — square, chunky, readable from far away.',
    'Inner jaw is its own model on a slide rail inside the mouth; it shoots forward ~4 studs.',
  ],
  build() {
    const root = new THREE.Group();
    const body = pivot(root, { p: [0, 5.6, 0] });

    // Upper head
    box(body, [7.0, 2.4, 6.0], C.hide, { p: [0, 1.3, 0] });
    box(body, [5.4, 0.7, 4.8], C.hideDark, { p: [0, 2.8, -0.3] });
    for (const s of [-1, 1]) {
      box(body, [1.4, 0.5, 1.1], C.hideDark, { p: [s * 2.6, 2.75, 1.6] });
      box(body, [0.55, 0.4, 0.2], glow(C.eye, 2.6), { p: [s * 2.6, 2.45, 2.12] });
    }
    for (let i = 0; i < 8; i++) box(body, [0.62, 0.9, 0.62], C.teeth, { p: [-3.0 + i * 0.857, -0.3, 2.6] });
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) box(body, [0.62, 0.8, 0.62], C.teeth, { p: [s * 3.05, -0.25, 1.6 - i * 1.05] });
    box(body, [6.4, 2.2, 5.6], C.mouth, { p: [0, -0.4, -0.2], outline: false });
    box(body, [6.6, 0.3, 5.8], C.gum, { p: [0, 0.18, 0] });

    // Lower jaw on a rear hinge
    const jaw = pivot(body, { p: [0, 0.1, -2.8] });
    box(jaw, [7.2, 2.2, 6.2], C.hide, { p: [0, -1.2, 2.9] });
    box(jaw, [6.8, 0.35, 5.8], C.belly, { p: [0, -2.35, 2.9] });
    box(jaw, [6.6, 0.3, 5.6], C.gum, { p: [0, -0.05, 2.9] });
    for (let i = 0; i < 8; i++) box(jaw, [0.62, 0.9, 0.62], C.teeth, { p: [-3.0 + i * 0.857, 0.35, 5.6] });
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) box(jaw, [0.62, 0.8, 0.62], C.teeth, { p: [s * 3.1, 0.3, 4.6 - i * 1.05] });

    // Second jaw that slides out of the throat
    const inner = pivot(body, { p: [0, -0.3, -1.4] });
    box(inner, [1.7, 1.5, 3.4], C.inner, { p: [0, 0, -0.4] });
    for (let i = 0; i < 4; i++) box(inner, [1.9, 0.18, 0.3], C.gum, { p: [0, 0.2, -1.6 + i * 0.75] });
    const innerTop = pivot(inner, { p: [0, 0.2, 1.1] });
    box(innerTop, [2.3, 0.9, 1.6], C.inner, { p: [0, 0.35, 0.6] });
    for (const x of [-0.75, 0, 0.75]) box(innerTop, [0.36, 0.45, 0.36], C.teeth, { p: [x, -0.25, 1.2] });
    const innerBot = pivot(inner, { p: [0, -0.2, 1.1] });
    box(innerBot, [2.3, 0.8, 1.6], C.inner, { p: [0, -0.35, 0.6] });
    for (const x of [-0.5, 0.25, 0.75]) box(innerBot, [0.36, 0.45, 0.36], C.teeth, { p: [x - 0.12, 0.25, 1.2] });

    // Body tapering to the tail
    box(body, [6.0, 4.6, 4.0], C.hide, { p: [0, 0.3, -5.0] });
    box(body, [5.2, 0.4, 3.6], C.belly, { p: [0, -2.05, -5.0] });
    box(body, [4.2, 3.4, 3.0], C.hide, { p: [0, 0.5, -8.4] });
    box(body, [2.6, 2.2, 2.6], C.hideDark, { p: [0, 0.6, -11.0] });
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) box(body, [0.08, 1.8, 0.22], C.hideDark, { p: [s * 3.02, 0.2, -3.6 - i * 0.6], outline: false });
    for (const [z, h] of [[-4.2, 1.6], [-6.0, 1.2], [-8.4, 1.0]]) wedge(body, [0.5, h, 1.8], C.finRay, { p: [0, 2.6 + h / 2 + (z < -7 ? -0.8 : 0), z] });
    const tail = pivot(body, { p: [0, 0.6, -12.2] });
    prism(tail, [[0, 0], [2.4, 2.8], [1.3, 0], [2.4, -2.8]], 0.45, C.fin, { r: [0, 90, 0] });
    
    // Four broad fins (flat swept plates) + bioluminescent side dots
    const fins = [];
    for (const [x, y, z, w, big] of [[3.3, -1.2, -3.4, 5.0, 1], [2.3, -1.3, -8.2, 3.6, 0]]) {
      for (const s of [-1, 1]) {
        const base = pivot(body, { p: [s * x, y, z], order: 'YXZ' });
        const flap = pivot(base);
        const k = w / 5;
        const pts = [[0, 1.5 * k], [s * w * 0.7, 1.0 * k], [s * w, -1.0 * k], [s * w * 0.75, -2.4 * k], [0, -1.6 * k]];
        prism(flap, s > 0 ? pts : pts.slice().reverse(), 0.32, C.fin, { r: [90, 0, 0] });
        for (const f of [0.35, 0.6, 0.85])
          box(flap, [0.14, 0.36, 2.6 * k], C.finRay, { p: [s * w * f * 0.9, 0, -0.3 * k], r: [0, s * -25 * f, 0], outline: false });
        fins.push({ s, base, flap, big });
      }
    }
    for (const s of [-1, 1])
      for (const [z, y] of [[-4.0, 1.4], [-5.0, 1.2], [-6.0, 1.4], [-7.6, 1.1], [-8.6, 1.3], [-9.6, 1.0]])
        box(body, [0.1, 0.32, 0.32], glow(C.glow, 2.2), { p: [s * (z > -7 ? 3.02 : 2.12), y, z] });
    for (const s of [-1, 1]) box(body, [1.8, 0.4, 0.5], C.hideDark, { p: [s * 2.55, 2.95, 1.85], r: [0, 0, s * 16] });

    const TAU = Math.PI * 2;
    function update(t) {
      const open = span(t, 0.24, 0.42, ease.out) * (1 - span(t, 0.66, 0.8));
      const spread = span(t, 0.22, 0.4, ease.out) * (1 - span(t, 0.72, 0.92));
      const lunge = span(t, 0.44, 0.54, ease.out) * (1 - span(t, 0.6, 0.72));
      const snap = bump(t, 0.5, 0.55, 0.6);

      body.position.y = 5.6 + 0.25 * Math.sin(t * TAU);
      body.rotation.x = (-6 * open + 2 * Math.sin(t * TAU)) * DEG;
      tail.rotation.y = 12 * Math.sin(t * TAU * 2) * DEG;
      jaw.rotation.x = (2 + 36 * open) * DEG;
      inner.position.z = -1.4 + 4.6 * lunge;
      inner.position.y = -0.3 - 0.4 * lunge;
      innerTop.rotation.x = (-30 * lunge * (1 - snap)) * DEG;
      innerBot.rotation.x = (30 * lunge * (1 - snap)) * DEG;

      for (const { s, base, flap, big } of fins) {
        const idle = Math.sin(t * TAU * 2 + (big ? 0 : 1.2)) * 8;
        base.rotation.y = s * (30 - 38 * spread) * DEG;
        flap.rotation.z = s * (-16 + idle * (1 - spread) + 30 * spread) * DEG;
      }
    }

    update(0);
    return { root, update };
  },
};
