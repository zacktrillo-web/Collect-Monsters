import { THREE, DEG, box, cone, glow, pivot, span, ease } from '../kit.js';

const C = {
  fur: '#3e4d68',
  furDark: '#28324a',
  ice: '#a8def2',
  iceLight: '#e4f8ff',
  iceDeep: '#5aa6cf',
  ivory: '#f0e6cf',
  ivoryDark: '#c9b993',
  glow: '#9eeaff',
};

export default {
  id: 'king-beneath-the-ice',
  name: 'King Beneath the Ice',
  appearance: 'Stocky mammoth-like monster with stepped ice armor, huge ivory tusks, and a jagged crown.',
  movement: 'Head swings with its weight; shoulder plates lift during a charge.',
  palette: [
    ['Glacier fur', C.fur],
    ['Deep fur', C.furDark],
    ['Ice armor', C.ice],
    ['Frost edge', C.iceLight],
    ['Old ice', C.iceDeep],
    ['Ivory tusk', C.ivory],
  ],
  bg: ['#39587a', '#0b1420'],
  rim: '#9eeaff',
  keys: [
    [0.06, 'Idle'],
    [0.3, 'Head swing'],
    [0.64, 'Charge'],
  ],
  notes: [
    'Mass sits low and forward: barrel body on four pillar legs, head almost as wide as the chest.',
    'Armor steps up in three shrinking tiers on the back; shoulder plates are hinged parts that lift.',
    'Tusks are 4 tapering ivory blocks each, curving down → forward → up past the trunk.',
  ],
  build() {
    const root = new THREE.Group();
    const rig = pivot(root);
    const body = pivot(rig, { p: [0, 3.9, 0] });

    // Barrel body + fur fringe
    box(body, [4.8, 3.6, 6.2], C.fur);
    box(body, [4.2, 1.4, 3.2], C.fur, { p: [0, 2.0, 1.0] });
    for (let i = 0; i < 6; i++)
      for (const s of [-1, 1]) box(body, [0.6, 1.2, 0.9], C.furDark, { p: [s * 2.25, -1.9, -2.5 + i * 1.0], r: [0, 0, s * -6] });
    box(body, [1.0, 1.2, 0.9], C.furDark, { p: [0, -1.0, -3.3], r: [-25, 0, 0] });

    // Stepped ice armor on the back
    box(body, [5.2, 0.55, 5.4], C.iceDeep, { p: [0, 1.95, -0.6] });
    box(body, [4.2, 0.55, 4.4], C.ice, { p: [0, 2.5, -0.6] });
    box(body, [3.0, 0.55, 3.2], C.iceLight, { p: [0, 3.05, -0.5] });
    for (const z of [-1.4, -0.4, 0.6]) box(body, [0.7, 0.8, 0.7], C.iceLight, { p: [0, 3.6, z], r: [0, 45, 0] });

    // Hinged shoulder plates
    const plates = [];
    for (const s of [-1, 1]) {
      const hinge = pivot(body, { p: [s * 2.3, 2.0, 1.5] });
      box(hinge, [0.6, 2.6, 2.8], C.ice, { p: [s * 0.35, -1.0, 0] });
      box(hinge, [0.5, 2.0, 2.2], C.iceLight, { p: [s * 0.8, -0.8, 0] });
      box(hinge, [0.4, 1.2, 1.4], C.iceDeep, { p: [s * 1.15, -0.5, 0] });
      plates.push({ s, hinge });
    }

    // Four pillar legs
    const legs = [];
    for (const [x, z, ph] of [[-1.6, 2.0, 0], [1.6, 2.0, 0.5], [-1.6, -2.2, 0.5], [1.6, -2.2, 0]]) {
      const hip = pivot(body, { p: [x, -1.0, z] });
      box(hip, [1.7, 2.9, 1.7], C.fur, { p: [0, -1.3, 0] });
      box(hip, [2.0, 0.55, 2.0], C.ice, { p: [0, -2.2, 0] });
      box(hip, [1.9, 0.4, 1.9], C.furDark, { p: [0, -2.7, 0] });
      for (const k of [-0.55, 0, 0.55]) box(hip, [0.42, 0.35, 0.3], C.ivory, { p: [k, -2.75, 0.95] });
      legs.push({ hip, z, ph });
    }

    // Head, trunk, tusks, crown
    const head = pivot(body, { p: [0, 0.9, 3.0] });
    box(head, [3.0, 2.8, 2.4], C.fur, { p: [0, 0.2, 0.9] });
    box(head, [2.5, 0.9, 1.9], C.furDark, { p: [0, 1.9, 0.6] });
    box(head, [3.1, 0.45, 0.7], C.iceDeep, { p: [0, 1.0, 2.0] });
    for (const s of [-1, 1]) {
      box(head, [0.45, 0.22, 0.1], glow(C.glow, 2.6), { p: [s * 0.8, 0.6, 2.12] });
      box(head, [0.35, 1.9, 1.6], C.furDark, { p: [s * 1.75, 0.1, 0.3], r: [0, s * 20, s * 8] });
    }
    let link = pivot(head, { p: [0, -0.7, 2.1], r: [-12, 0, 0] });
    for (const [w, l, bend] of [[1.0, 0.9, 6], [0.85, 0.85, 6], [0.7, 0.8, -28], [0.6, 0.7, -40], [0.55, 0.5, 0]]) {
      box(link, [w, l, w], C.fur, { p: [0, -l / 2, 0] });
      box(link, [w + 0.06, 0.12, w + 0.06], C.furDark, { p: [0, -l + 0.06, 0] });
      link = pivot(link, { p: [0, -l, 0], r: [bend, 0, 0] });
    }
    for (const s of [-1, 1]) {
      let tusk = pivot(head, { p: [s * 0.95, -0.7, 1.9], r: [55, s * 14, 0] });
      for (const [w, l, bend] of [[0.62, 1.5, -38], [0.55, 1.4, -38], [0.46, 1.2, -36], [0.36, 0.9, 0]]) {
        box(tusk, [w, w, l], C.ivory, { p: [0, 0, l / 2] });
        box(tusk, [w + 0.04, w + 0.04, 0.14], C.ivoryDark, { p: [0, 0, 0.1] });
        tusk = pivot(tusk, { p: [0, 0, l - 0.05], r: [bend, 0, 0] });
      }
    }
    const crown = pivot(head, { p: [0, 2.4, 0.6] });
    box(crown, [2.4, 0.35, 1.9], C.iceDeep);
    const spikes = [
      [-1.0, 0.75, 0.8, 0.9], [-0.5, 0.75, 0.8, 1.3], [0, 0.75, 0.8, 1.8], [0.5, 0.75, 0.8, 1.2], [1.0, 0.75, 0.8, 0.8],
      [-1.0, 0, -0.75, 0.7], [0, 0, -0.75, 1.0], [1.0, 0, -0.75, 0.6],
    ];
    for (const [x, , z, h] of spikes) cone(crown, [0.32, h, 4], C.iceLight, { p: [x, 0.17 + h / 2, z], r: [0, 45, x * 9] });
    box(crown, [0.35, 0.35, 0.2], glow(C.glow, 2.8), { p: [0, 0.05, 0.98], r: [0, 0, 45] });

    const TAU = Math.PI * 2;
    function update(t) {
      const swingIn = 1 - span(t, 0.4, 0.5);
      const swing = Math.sin((t / 0.5) * TAU) * swingIn;
      const charge = span(t, 0.48, 0.64, ease.out);
      const back = span(t, 0.76, 1.0);
      const c = charge * (1 - back);

      rig.position.z = 1.6 * c;
      body.rotation.z = -swing * 4 * DEG;
      body.rotation.x = 7 * c * DEG;
      body.position.y = 3.9 + 0.06 * Math.sin(t * TAU * 2) - 0.2 * c;
      head.rotation.y = swing * 24 * DEG;
      head.rotation.z = swing * 8 * DEG;
      head.rotation.x = 14 * c * DEG;

      for (const { s, hinge } of plates) hinge.rotation.z = s * (40 * c + 4 * Math.abs(swing)) * DEG;
      for (const { hip, z, ph } of legs) {
        const stride = z > 0 ? -22 : 18;
        hip.rotation.x = (stride * c + Math.sin((t * 2 + ph) * TAU) * 3) * DEG;
      }
    }

    update(0);
    return { root, update };
  },
};
