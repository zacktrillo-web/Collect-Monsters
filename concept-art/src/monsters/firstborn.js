import { THREE, DEG, box, cone, glow, pivot, wedge, span, bump, ease, lerp } from '../kit.js';

const C = {
  hide: '#7b3f24',
  hideDark: '#4d2514',
  stripe: '#331a0f',
  bone: '#e9ddc1',
  boneShade: '#bfae8a',
  mouth: '#5a1414',
  eye: '#ffcf3a',
};

export default {
  id: 'firstborn',
  name: 'Firstborn',
  appearance: 'Powerful six-limbed prehistoric predator with bone armor, broad claws, and a split tail.',
  movement: 'Front limbs pull its body forward into a rising bite.',
  palette: [
    ['Rust hide', C.hide],
    ['Old blood', C.hideDark],
    ['Tiger stripe', C.stripe],
    ['Bone armor', C.bone],
    ['Fossil shade', C.boneShade],
    ['Predator eye', C.eye],
  ],
  bg: ['#5a3a22', '#120a05'],
  rim: '#ffcf3a',
  keys: [
    [0.05, 'Idle'],
    [0.32, 'Reach'],
    [0.53, 'Rising bite'],
  ],
  notes: [
    'Low, long and heavy-fronted: two big pulling arms up front, four sprawled legs behind.',
    'Bone armor = a skull mask on the head plus a row of spiked back plates; hide shows between plates.',
    'Tail splits in two after the third segment; each fork ends in a bone spike.',
  ],
  build() {
    const root = new THREE.Group();
    const rig = pivot(root);
    const body = pivot(rig, { p: [0, 2.7, 0] });

    box(body, [3.0, 2.0, 5.2], C.hide);
    box(body, [3.3, 2.3, 2.2], C.hide, { p: [0, 0.15, 2.4] });
    box(body, [2.6, 1.8, 1.8], C.hide, { p: [0, 0.1, -2.6] });
    box(body, [2.4, 0.4, 4.6], C.hideDark, { p: [0, -1.05, 0] });
    for (const [i, z] of [2.6, 1.3, 0, -1.3, -2.6].entries()) {
      box(body, [2.6 - Math.abs(z) * 0.12, 0.35, 1.0], C.bone, { p: [0, 1.2 + (z > 2 ? 0.15 : 0), z] });
      for (const s of [-1, 1]) box(body, [0.9, 0.3, 0.95], C.boneShade, { p: [s * 1.45, 0.85, z], r: [0, 0, s * -35] });
      cone(body, [0.32, 0.6 + (i % 2) * 0.25, 4], C.bone, { p: [0, 1.6 + (i % 2) * 0.12, z], r: [-20, 45, 0] });
      if (i < 4) for (const s of [-1, 1]) box(body, [0.12, 1.4, 0.3], C.stripe, { p: [s * 1.52, 0.1, z - 0.65], outline: false });
    }

    // Neck + armored head
    const neck = pivot(body, { p: [0, 0.6, 3.4] });
    box(neck, [1.8, 1.5, 1.9], C.hide, { p: [0, 0.3, 0.6], r: [-15, 0, 0] });
    box(neck, [1.9, 0.3, 1.6], C.bone, { p: [0, 1.05, 0.5], r: [-15, 0, 0] });
    const head = pivot(neck, { p: [0, 0.6, 1.4] });
    box(head, [2.0, 1.1, 2.8], C.hide, { p: [0, 0.2, 1.2] });
    box(head, [2.2, 0.4, 2.6], C.bone, { p: [0, 0.85, 1.05] });
    box(head, [2.3, 0.35, 0.55], C.boneShade, { p: [0, 0.95, 1.95] });
    box(head, [1.4, 0.3, 0.8], C.bone, { p: [0, 0.65, 2.55] });
    for (const s of [-1, 1]) {
      box(head, [0.1, 0.3, 0.45], glow(C.eye, 2.6), { p: [s * 1.02, 0.55, 1.6] });
      wedge(head, [0.4, 1.0, 1.6], C.bone, { p: [s * 0.65, 1.3, -0.35], r: [-25, 0, s * -15] });
      for (let i = 0; i < 4; i++) box(head, [0.22, 0.4, 0.22], C.bone, { p: [s * 0.88, -0.45, 2.3 - i * 0.55] });
    }
    for (const x of [-0.45, 0, 0.45]) box(head, [0.24, 0.45, 0.24], C.bone, { p: [x, -0.45, 2.5] });
    box(head, [1.7, 0.5, 2.4], C.mouth, { p: [0, -0.4, 1.2], outline: false });
    const jaw = pivot(head, { p: [0, -0.35, 0] });
    box(jaw, [1.85, 0.55, 2.7], C.hide, { p: [0, -0.35, 1.35] });
    box(jaw, [1.6, 0.25, 2.4], C.boneShade, { p: [0, -0.7, 1.3] });
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) box(jaw, [0.2, 0.35, 0.2], C.bone, { p: [s * 0.78, 0.1, 2.5 - i * 0.55] });

    // Front pulling arms with broad claws
    const arms = [];
    for (const s of [-1, 1]) {
      const sh = pivot(body, { p: [s * 1.8, 0.3, 2.6], r: [0, 0, s * 10] });
      box(sh, [1.1, 1.8, 1.1], C.hide, { p: [0, -0.7, 0] });
      box(sh, [1.3, 0.6, 1.3], C.bone, { p: [0, 0.1, 0] });
      const el = pivot(sh, { p: [0, -1.45, 0] });
      box(el, [0.95, 1.4, 0.95], C.hideDark, { p: [0, -0.6, 0] });
      const hand = pivot(el, { p: [0, -1.3, 0] });
      box(hand, [1.8, 0.45, 1.6], C.hide, { p: [0, 0, 0.35] });
      for (const k of [-0.6, 0, 0.6]) {
        const claw = pivot(hand, { p: [k, 0, 1.15] });
        box(claw, [0.36, 0.34, 0.8], C.bone, { p: [0, 0.02, 0.35] });
        box(claw, [0.28, 0.3, 0.5], C.boneShade, { p: [0, -0.15, 0.8], r: [35, 0, 0] });
      }
      arms.push({ s, sh, el, hand });
    }

    // Four sprawled legs
    const legs = [];
    for (const [z, ph] of [[0.3, 0], [-2.4, 0.5]]) {
      for (const s of [-1, 1]) {
        const hip = pivot(body, { p: [s * 1.45, -0.4, z] });
        box(hip, [1.4, 0.95, 1.0], C.hide, { p: [s * 0.65, 0, 0] });
        const knee = pivot(hip, { p: [s * 1.3, 0, 0] });
        box(knee, [0.85, 1.9, 0.85], C.hideDark, { p: [0, -0.85, 0] });
        box(knee, [1.15, 0.4, 1.45], C.hide, { p: [0, -1.95, 0.3] });
        for (const k of [-0.35, 0, 0.35]) box(knee, [0.22, 0.24, 0.35], C.bone, { p: [k, -2.0, 1.1] });
        legs.push({ hip, knee, s, ph: ph + (s > 0 ? 0.25 : 0) });
      }
    }

    // Split tail
    const tail = pivot(body, { p: [0, 0.3, -3.4] });
    let link = tail;
    for (const [w, h, l] of [[1.5, 1.2, 1.5], [1.2, 1.0, 1.4], [0.95, 0.8, 1.3]]) {
      box(link, [w, h, l], C.hide, { p: [0, 0, -l / 2] });
      cone(link, [0.22, 0.5, 4], C.bone, { p: [0, h / 2 + 0.15, -l / 2], r: [-30, 45, 0] });
      link = pivot(link, { p: [0, 0, -l + 0.1], r: [-6, 0, 0] });
    }
    const forks = [];
    for (const s of [-1, 1]) {
      const f = pivot(link, { r: [0, s * 28, 0] });
      box(f, [0.65, 0.6, 1.4], C.hide, { p: [0, 0, -0.7] });
      const f2 = pivot(f, { p: [0, 0, -1.35], r: [-10, -s * 10, 0] });
      box(f2, [0.5, 0.5, 1.0], C.hideDark, { p: [0, 0, -0.5] });
      cone(f2, [0.4, 1.1, 4], C.bone, { p: [0, 0, -1.45], r: [-90, 45, 0] });
      forks.push(f);
    }

    const TAU = Math.PI * 2;
    function update(t) {
      const reach = span(t, 0.14, 0.32);
      const pull = span(t, 0.33, 0.46, ease.inOut);
      const rise = span(t, 0.43, 0.52, ease.out);
      const bite = bump(t, 0.43, 0.5, 0.56);
      const back = span(t, 0.66, 0.98);
      const r = reach * (1 - pull);
      const p = pull * (1 - back);
      const up = rise * (1 - back);

      rig.position.z = 1.8 * p;
      body.position.y = 2.7 + 0.05 * Math.sin(t * TAU * 2) - 0.2 * p * (1 - rise);
      body.rotation.x = (-5 * r - 10 * up) * DEG;
      neck.rotation.x = (lerp(-5 * r, -32, up)) * DEG;
      head.rotation.x = (-10 * up + 6 * r) * DEG;
      jaw.rotation.x = (4 + 40 * bite) * DEG;

      for (const { sh, el, hand } of arms) {
        sh.rotation.x = (-75 * r + 35 * p * (1 - up) + 10 * up) * DEG;
        el.rotation.x = (-10 * r + 15 * p) * DEG;
        hand.rotation.x = (55 * r - 30 * p * (1 - up)) * DEG;
      }
      for (const { hip, knee, s, ph } of legs) {
        const step = Math.sin((t * 2 + ph) * TAU);
        hip.rotation.y = s * step * 12 * DEG;
        hip.rotation.z = s * Math.max(0, step) * 10 * DEG;
        knee.rotation.z = -s * Math.max(0, step) * 10 * DEG;
      }
      tail.rotation.y = 14 * Math.sin(t * TAU) * DEG;
      tail.rotation.x = (8 * up) * DEG;
      forks.forEach((f, i) => (f.rotation.x = 8 * Math.sin(t * TAU * 2 + i * Math.PI) * DEG));
    }

    update(0);
    return { root, update };
  },
};
