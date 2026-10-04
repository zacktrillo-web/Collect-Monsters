import { THREE, DEG, box, cyl, cone, sph, glow, pivot, prism, span, ease, lerp } from '../kit.js';

const C = {
  skin: '#6d2c73',
  skinDark: '#471b4f',
  sucker: '#f3b8c6',
  coral: '#ff7a62',
  coralLight: '#ffb48c',
  gold: '#e3b64d',
  goldDark: '#a8782b',
  velvet: '#7e1838',
  eye: '#fff1a8',
  pupil: '#ffcc33',
};

// A chain of shrinking segments with banding and suckers; returns the joint pivots.
function tentacle(parent, o, segs, color) {
  const joints = [];
  let link = pivot(parent, o);
  segs.forEach(([w, l], i) => {
    joints.push(link);
    box(link, [w, w * 0.85, l], color, { p: [0, 0, l / 2] });
    box(link, [w + 0.08, w * 0.85 + 0.08, 0.14], C.skinDark, { p: [0, 0, l - 0.08], outline: false });
    box(link, [w * 0.45, 0.12, w * 0.45], C.sucker, { p: [0, -w * 0.43, l / 2], outline: false });
    if (i < segs.length - 1) link = pivot(link, { p: [0, 0, l] });
  });
  return joints;
}

export default {
  id: 'king-of-the-deep',
  name: 'King of the Deep',
  appearance: 'Royal octopus with thick segmented tentacles, coral armor, and a throne-shaped head crest.',
  movement: 'Smaller tentacles carry it while two large arms sweep forward.',
  palette: [
    ['Royal skin', C.skin],
    ['Ink shadow', C.skinDark],
    ['Coral armor', C.coral],
    ['Throne gold', C.gold],
    ['Velvet', C.velvet],
    ['Sucker pink', C.sucker],
  ],
  bg: ['#3a2a6a', '#0b0a1c'],
  rim: '#ffb48c',
  keys: [
    [0.08, 'Idle'],
    [0.4, 'Arms raise'],
    [0.53, 'Sweep'],
  ],
  notes: [
    'Head is one faceted blob; the throne crest sits on top-back so the face appears to "sit" in it.',
    'Six short walking tentacles + two large arms (7 segments each), all built as hinged block chains.',
    'Coral armor is layered plates on the brow and shoulders with a few branching coral sprigs.',
  ],
  build() {
    const root = new THREE.Group();
    const body = pivot(root, { p: [0, 4.8, 0] });

    // Mantle
    sph(body, 2.5, C.skin, { p: [0, 1.4, -0.3], s: [1.05, 1.15, 1.0] });
    box(body, [3.6, 1.6, 3.2], C.skin, { p: [0, -0.4, 0.1] });
    box(body, [3.0, 0.6, 2.6], C.skinDark, { p: [0, -1.35, 0] });

    // Face: big eyes under a coral brow
    for (const s of [-1, 1]) {
      box(body, [1.15, 0.95, 0.4], C.eye, { p: [s * 0.95, 0.5, 2.1] });
      box(body, [0.8, 0.26, 0.12], glow(C.pupil, 2.2), { p: [s * 0.95, 0.45, 2.33] });
      box(body, [1.6, 0.45, 0.7], C.coral, { p: [s * 1.0, 1.15, 2.0], r: [0, 0, s * -14] });
    }
    box(body, [0.9, 0.5, 0.4], C.coralLight, { p: [0, 1.05, 2.2] });
    box(body, [1.2, 0.3, 0.3], C.skinDark, { p: [0, -0.35, 1.75] });

    // Coral armor plates + sprigs
    for (const s of [-1, 1]) {
      box(body, [1.5, 1.2, 2.4], C.coral, { p: [s * 2.2, 0.3, 0], r: [0, 0, s * 18] });
      box(body, [1.1, 0.8, 1.8], C.coralLight, { p: [s * 2.55, 0.95, 0], r: [0, 0, s * 30] });
      box(body, [1.9, 0.25, 2.6], C.gold, { p: [s * 1.95, -0.35, 0], r: [0, 0, s * 18] });
      const sprig = pivot(body, { p: [s * 2.6, 1.4, -0.8], r: [0, 0, s * -20] });
      cyl(sprig, [0.16, 0.22, 1.2, 5], C.coral, { p: [0, 0.6, 0] });
      cyl(sprig, [0.12, 0.16, 0.8, 5], C.coralLight, { p: [s * 0.3, 1.1, 0], r: [0, 0, s * -40] });
      cyl(sprig, [0.12, 0.16, 0.7, 5], C.coral, { p: [-s * 0.25, 1.2, 0.1], r: [0, 0, s * 35] });
    }

    // Throne-shaped crest on top-back of the head
    const throne = pivot(body, { p: [0, 3.3, -1.2], r: [-8, 0, 0] });
    box(throne, [2.8, 3.2, 0.35], C.velvet, { p: [0, 1.6, 0] });
    for (const s of [-1, 1]) {
      box(throne, [0.45, 3.9, 0.55], C.gold, { p: [s * 1.6, 1.85, 0] });
      cone(throne, [0.3, 0.7, 4], C.gold, { p: [s * 1.6, 4.15, 0], r: [0, 45, 0] });
      box(throne, [0.45, 0.6, 1.9], C.gold, { p: [s * 1.95, 0.25, 0.85] });
      box(throne, [0.6, 0.5, 0.6], C.coral, { p: [s * 1.95, 0.6, 1.75] });
    }
    box(throne, [3.6, 0.4, 0.6], C.gold, { p: [0, 3.35, 0] });
    prism(throne, [[-1.2, 0], [1.2, 0], [0.9, 0.6], [0.3, 0.8], [0, 1.3], [-0.3, 0.8], [-0.9, 0.6]], 0.5, C.gold, { p: [0, 3.55, 0] });
    box(throne, [0.4, 0.4, 0.2], glow(C.pupil, 2.6), { p: [0, 4.05, 0.3], r: [0, 0, 45] });
    box(throne, [3.2, 0.3, 0.5], C.goldDark, { p: [0, 0.05, 0] });

    // Six walking tentacles
    const walkers = [];
    const walkSegs = [[1.0, 1.1], [0.88, 1.0], [0.76, 0.95], [0.64, 0.85], [0.52, 0.75]];
    [90, 130, 165, -165, -130, -90].forEach((yaw, i) => {
      const r = 1.5;
      const j = tentacle(body, { p: [Math.sin(yaw * DEG) * r, -1.4, Math.cos(yaw * DEG) * r], r: [0, yaw, 0], order: 'YXZ' }, walkSegs, C.skin);
      walkers.push({ j, ph: i / 3 });
    });

    // Two large sweeping arms
    const arms = [];
    const armSegs = [[1.3, 1.4], [1.15, 1.3], [1.0, 1.2], [0.85, 1.1], [0.72, 1.0], [0.6, 0.9], [0.48, 0.8]];
    for (const s of [-1, 1]) {
      const yaw = pivot(body, { p: [s * 1.4, -0.9, 1.4], order: 'YXZ' });
      const j = tentacle(yaw, {}, armSegs, C.skin);
      box(j[0], [1.5, 0.5, 1.0], C.coral, { p: [0, 0.55, 0.7] });
      box(j[1], [1.3, 0.35, 0.6], C.gold, { p: [0, 0.55, 0.5] });
      arms.push({ s, yaw, j });
    }

    const TAU = Math.PI * 2;
    function update(t) {
      const raise = span(t, 0.24, 0.4);
      const sweep = span(t, 0.4, 0.52, ease.in);
      const back = span(t, 0.66, 0.96);

      body.position.y = 4.8 + 0.12 * Math.sin(t * TAU * 3);
      body.rotation.x = (lerp(-5 * raise, 9, sweep) * (1 - back)) * DEG;
      body.position.z = 0.8 * sweep * (1 - back);

      for (const { j, ph } of walkers) {
        const w = Math.sin((t * 3 + ph) * TAU);
        const curve = [32, 12, 14, -12, -26];
        j.forEach((link, k) => (link.rotation.x = (curve[k] + (k === 0 ? w * 9 : w * 4)) * DEG));
      }
      for (const { s, yaw, j } of arms) {
        const out = lerp(lerp(40, 80, raise), -18, sweep) * (1 - back) + 40 * back;
        yaw.rotation.y = s * out * DEG;
        const lift = lerp(lerp(-35, -70, raise), 15, sweep) * (1 - back) - 35 * back;
        yaw.rotation.x = lift * DEG;
        const curl = lerp(lerp(22, 14, raise), 8, sweep) * (1 - back) + 22 * back;
        j.forEach((link, k) => k > 0 && (link.rotation.x = (curl + Math.sin(t * TAU * 2 + k) * 2) * DEG));
        j.forEach((link, k) => k > 0 && (link.rotation.y = s * -6 * DEG));
      }
    }

    update(0);
    return { root, update };
  },
};
