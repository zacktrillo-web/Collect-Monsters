import { THREE, DEG, box, cone, sph, tor, wedge, glow, pivot, span, ease, lerp } from '../kit.js';

const C = {
  body: '#272a63',
  bodyDark: '#171842',
  ivory: '#f2e9d5',
  ivoryShade: '#d5c6a2',
  gold: '#dba843',
  star: '#fff4c2',
  eye: '#fff6d6',
  nebula: '#8b6cff',
};

export default {
  id: 'crown-of-worlds',
  name: 'Crown of Worlds',
  appearance: 'Six-limbed celestial creature with ivory armor and several differently sized planetary crown rings.',
  movement: 'Rings align above its face before a paired forelimb strike.',
  palette: [
    ['Night sky hide', C.body],
    ['Deep space', C.bodyDark],
    ['Ivory armor', C.ivory],
    ['Armor shade', C.ivoryShade],
    ['Celestial gold', C.gold],
    ['Nebula tail', C.nebula],
  ],
  bg: ['#2b3170', '#070818'],
  rim: '#ffe7a3',
  hero: { az: -48, el: 10 },
  keys: [
    [0.06, 'Idle'],
    [0.44, 'Rings align'],
    [0.57, 'Twin strike'],
  ],
  notes: [
    'Centaur layout: four legs carry a horizontal body, an upright torso carries the two striking forelimbs.',
    'Ivory armor is thick plating over a dark star-flecked body, trimmed with thin gold bands.',
    'Four crown rings of different sizes, each carrying one planet; they tumble freely until they align.',
  ],
  build() {
    const root = new THREE.Group();
    const rig = pivot(root);
    const body = pivot(rig, { p: [0, 3.9, -1.2] });

    // Long horizontal lower body: dark star-flecked hide under ivory saddle plates
    box(body, [3.0, 2.3, 6.4], C.body);
    box(body, [2.6, 0.4, 5.8], C.bodyDark, { p: [0, -1.25, 0] });
    box(body, [3.3, 0.6, 2.6], C.ivory, { p: [0, 1.3, 1.6] });
    box(body, [3.0, 0.5, 2.0], C.ivory, { p: [0, 1.2, -1.9] });
    for (const z of [1.6, -1.9]) box(body, [3.4, 0.16, z > 0 ? 2.7 : 2.1], C.gold, { p: [0, 0.98, z] });
    for (const s of [-1, 1]) box(body, [0.3, 1.3, 1.9], C.ivoryShade, { p: [s * 1.62, 0.2, 1.6] });
    for (const [x, y, z] of [[1.52, -0.3, 0.2], [-1.52, 0.4, -0.4], [1.52, 0.5, -0.9], [-1.52, -0.4, 0.5], [0.6, 1.16, 0.1], [-0.5, 1.16, -0.5], [1.52, -0.6, -2.6], [-1.52, 0.1, -2.9]])
      box(body, [0.14, 0.14, 0.14], glow(C.star, 2.4), { p: [x, y, z] });
    // Nebula tail
    const tail = pivot(body, { p: [0, 0.7, -3.1], r: [35, 0, 0] });
    box(tail, [1.0, 1.0, 1.7], C.nebula, { p: [0, 0, -0.8] });
    box(tail, [0.75, 0.75, 1.5], C.nebula, { p: [0, -0.35, -2.1], r: [20, 0, 0] });
    box(tail, [0.5, 0.5, 1.2], C.nebula, { p: [0, -0.9, -3.2], r: [35, 0, 0] });
    box(tail, [0.32, 0.32, 0.32], glow(C.star, 2.6), { p: [0, -1.4, -3.9] });

    // Four legs
    const legs = [];
    for (const [x, z] of [[-1.1, 2.4], [1.1, 2.4], [-1.1, -2.4], [1.1, -2.4]]) {
      const hip = pivot(body, { p: [x, -0.8, z] });
      box(hip, [1.0, 1.7, 1.15], C.body, { p: [0, -0.55, 0] });
      const knee = pivot(hip, { p: [0, -1.4, 0] });
      box(knee, [0.8, 1.5, 0.85], C.ivoryShade, { p: [0, -0.55, 0] });
      box(knee, [1.1, 0.45, 1.3], C.ivory, { p: [0, -1.4, 0.15] });
      box(knee, [1.15, 0.12, 1.35], C.gold, { p: [0, -1.13, 0.15] });
      legs.push({ hip, knee, front: z > 0, x });
    }

    // Upright torso
    const torso = pivot(body, { p: [0, 0.9, 2.7] });
    box(torso, [2.3, 2.5, 1.8], C.body, { p: [0, 1.25, 0] });
    box(torso, [2.5, 1.5, 0.5], C.ivory, { p: [0, 1.6, 0.85] });
    box(torso, [1.9, 0.2, 0.55], C.gold, { p: [0, 0.75, 0.9] });
    box(torso, [0.32, 0.32, 0.12], glow(C.star, 2.2), { p: [0, 1.65, 1.13], r: [0, 0, 45] });
    for (const s of [-1, 1]) {
      box(torso, [1.2, 0.5, 1.7], C.ivory, { p: [s * 1.4, 2.6, 0] });
      box(torso, [0.9, 0.45, 1.4], C.ivoryShade, { p: [s * 1.5, 3.0, 0] });
      box(torso, [1.25, 0.12, 1.75], C.gold, { p: [s * 1.4, 2.33, 0] });
    }

    // Helmed head with crescent horns
    const head = pivot(torso, { p: [0, 2.85, 0.2] });
    box(head, [1.5, 1.6, 1.6], C.ivory, { p: [0, 0.8, 0] });
    box(head, [1.1, 0.7, 0.6], C.ivoryShade, { p: [0, 0.35, 0.9] });
    box(head, [1.2, 0.18, 0.1], glow(C.eye, 2.4), { p: [0, 1.0, 0.82] });
    box(head, [0.18, 0.6, 0.1], glow(C.eye, 2.0), { p: [0, 0.65, 0.82] });
    for (const s of [-1, 1]) {
      const horn = pivot(head, { p: [s * 0.75, 1.2, 0], r: [0, 0, s * -20] });
      box(horn, [0.9, 0.35, 0.35], C.gold, { p: [s * 0.45, 0, 0] });
      box(horn, [0.32, 0.9, 0.32], C.gold, { p: [s * 0.95, 0.45, 0], r: [0, 0, s * 15] });
      box(horn, [0.24, 0.6, 0.24], C.gold, { p: [s * 0.85, 1.1, 0], r: [0, 0, s * 40] });
    }
    wedge(head, [0.3, 0.8, 1.5], C.ivoryShade, { p: [0, 1.95, -0.3] });

    // Forelimbs
    const arms = [];
    for (const s of [-1, 1]) {
      const sh = pivot(torso, { p: [s * 1.6, 2.3, 0.1] });
      box(sh, [0.85, 1.6, 0.85], C.body, { p: [0, -0.7, 0] });
      const el = pivot(sh, { p: [0, -1.4, 0] });
      box(el, [0.95, 1.5, 0.95], C.ivory, { p: [0, -0.6, 0] });
      box(el, [1.0, 0.12, 1.0], C.gold, { p: [0, 0.05, 0] });
      const hand = pivot(el, { p: [0, -1.45, 0] });
      box(hand, [1.2, 0.6, 1.2], C.ivoryShade, { p: [0, -0.2, 0.15] });
      for (const k of [-0.4, 0, 0.4]) cone(hand, [0.17, 0.75, 4], C.gold, { p: [k, -0.55, 0.65], r: [130, 45, 0] });
      arms.push({ s, sh, el });
    }

    // Planetary crown rings (each a different size, each carrying one planet)
    const crownBase = pivot(torso, { p: [0, 6.2, 0.2] });
    const rings = [];
    [
      [1.4, 0.09, '#e0a96d', 0.4, [75, 0, 15], 1],
      [2.1, 0.1, '#5fb3ff', 0.52, [55, 50, -25], -1],
      [2.8, 0.11, '#ff6f61', 0.44, [85, -40, 30], 1],
      [3.5, 0.12, '#b28cff', 0.62, [25, 90, 0], -1],
    ].forEach(([R, tube, planet, pr, rot, dir], i) => {
      const r = pivot(crownBase);
      tor(r, [R, tube, 5, 40], i % 2 ? C.gold : C.ivory);
      const orbit = pivot(r);
      sph(orbit, pr, planet, { p: [R, 0, 0] });
      if (i === 0) tor(orbit, [pr * 1.6, 0.05, 4, 20], C.ivoryShade, { p: [R, 0, 0], r: [70, 0, 0] });
      const idle = new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG);
      rings.push({ r, orbit, idle, dir, i });
    });

    const TAU = Math.PI * 2;
    const qIdle = new THREE.Quaternion();
    const qSpin = new THREE.Quaternion();
    const qAligned = new THREE.Quaternion();
    const Y = new THREE.Vector3(0, 1, 0);
    function update(t) {
      const align = span(t, 0.18, 0.42) * (1 - span(t, 0.7, 0.95));
      const rear = span(t, 0.38, 0.48);
      const strike = span(t, 0.49, 0.57, ease.in);
      const back = span(t, 0.68, 0.96);
      const a = rear * (1 - strike) * (1 - back);
      const k = strike * (1 - back);

      body.position.y = 3.9 + 0.08 * Math.sin(t * TAU * 2);
      body.rotation.x = (-10 * a + 6 * k) * DEG;
      torso.rotation.x = (-14 * a + 18 * k) * DEG;
      head.rotation.x = (-6 * align + 4 * k) * DEG;
      rig.position.z = 0.8 * k;

      for (const { s, sh, el } of arms) {
        sh.rotation.x = (lerp(-15, -150, a) * (1 - k) + -40 * k) * DEG;
        sh.rotation.z = s * (12 + 10 * a) * DEG;
        el.rotation.x = (lerp(-35, -20, a) * (1 - k) - 5 * k) * DEG;
      }
      for (const { hip, knee, front } of legs) {
        hip.rotation.x = (front ? -20 * a + 10 * k : 6 * a) * DEG;
        knee.rotation.x = (front ? 25 * a : 0) * DEG;
      }

      crownBase.position.set(0, 6.2 - 0.4 * align, 0.2 + 1.2 * align);
      for (const { r, orbit, idle, dir, i } of rings) {
        qIdle.setFromEuler(idle);
        qSpin.setFromAxisAngle(Y, dir * t * TAU);
        qIdle.premultiply(qSpin);
        r.quaternion.copy(qIdle).slerp(qAligned, ease.inOut(align));
        orbit.rotation.z = dir * t * TAU + i * 1.4;
      }
    }

    update(0);
    return { root, update };
  },
};
