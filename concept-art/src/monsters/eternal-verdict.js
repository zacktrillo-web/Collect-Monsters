import { THREE, DEG, box, cone, cyl, glow, pivot, prism, rod, span, bump, settle, ease } from '../kit.js';

const C = {
  hide: '#2d2a37',
  marble: '#e4ddcc',
  marbleShade: '#bcb29a',
  gold: '#cc9c3d',
  bronze: '#a96e36',
  bronzeLight: '#d99f5c',
  blindfold: '#8e1d2d',
  gem: '#ffe9a8',
  heart: '#ff4d5e',
};

export default {
  id: 'eternal-verdict',
  name: 'Eternal Verdict',
  appearance: 'Armored four-legged guardian carrying large bronze balance scales above its shoulders.',
  movement: 'Scales sway while walking, then settle before a double stomp.',
  palette: [
    ['Marble armor', C.marble],
    ['Armor shade', C.marbleShade],
    ['Guardian hide', C.hide],
    ['Bronze scales', C.bronze],
    ['Judge gold', C.gold],
    ['Blindfold red', C.blindfold],
  ],
  bg: ['#5a4a33', '#120e08'],
  rim: '#ffd27a',
  keys: [
    [0.12, 'Walk'],
    [0.47, 'Settle · rear'],
    [0.515, 'Double stomp'],
  ],
  notes: [
    'Lion-like guardian in heavy marble plate; blindfolded (justice is blind) with a gem on the brow.',
    'Scales = one bronze post, a swinging beam and two pans on 3 chains each. Beam is the pivot part.',
    'Pans hold a feather and a glowing heart — the verdict is always being weighed.',
  ],
  build() {
    const root = new THREE.Group();
    const body = pivot(root, { p: [0, 4.1, 0] });

    // Torso + marble plate
    box(body, [3.2, 2.6, 5.4], C.hide);
    box(body, [3.7, 0.8, 4.8], C.marble, { p: [0, 1.4, -0.1] });
    box(body, [3.8, 0.2, 4.9], C.gold, { p: [0, 0.95, -0.1] });
    for (const s of [-1, 1]) {
      box(body, [0.4, 1.9, 4.4], C.marbleShade, { p: [s * 1.8, 0.1, -0.1] });
      box(body, [0.45, 0.22, 4.5], C.gold, { p: [s * 1.82, -0.75, -0.1] });
    }
    box(body, [3.0, 2.3, 0.5], C.marble, { p: [0, 0.1, 2.85] });
    box(body, [0.25, 1.4, 0.15], C.gold, { p: [0, 0.2, 3.15] });
    box(body, [1.2, 0.2, 0.15], C.gold, { p: [0, 0.75, 3.15] });
    box(body, [1.2, 0.8, 1.0], C.marbleShade, { p: [0, 0.6, -3.0], r: [30, 0, 0] });

    // Legs
    const legs = [];
    for (const [x, z, ph] of [[-1.25, 1.9, 0], [1.25, 1.9, 0.5], [-1.25, -1.9, 0.5], [1.25, -1.9, 0]]) {
      const hip = pivot(body, { p: [x, -0.8, z] });
      box(hip, [1.3, 1.8, 1.4], C.hide, { p: [0, -0.7, 0] });
      box(hip, [1.5, 0.7, 1.6], C.marble, { p: [0, 0.1, 0] });
      const knee = pivot(hip, { p: [0, -1.5, 0] });
      box(knee, [1.45, 1.4, 1.55], C.marbleShade, { p: [0, -0.6, 0] });
      box(knee, [1.6, 0.6, 1.9], C.marble, { p: [0, -1.5, 0.15] });
      for (const k of [-0.5, 0, 0.5]) box(knee, [0.32, 0.3, 0.35], C.gold, { p: [k, -1.6, 1.2] });
      legs.push({ hip, knee, front: z > 0, ph });
    }

    // Blindfolded head with a sunburst mane
    const head = pivot(body, { p: [0, 1.0, 3.1] });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * 360;
      const ray = pivot(head, { p: [0, 0.4, 0.1], r: [0, 0, a] });
      box(ray, [0.55, 1.4, 0.35], i % 2 ? C.gold : C.marbleShade, { p: [0, 1.55, 0] });
    }
    box(head, [2.0, 1.9, 2.0], C.marble, { p: [0, 0.4, 0.8] });
    box(head, [1.4, 1.0, 1.0], C.marble, { p: [0, -0.1, 2.1] });
    box(head, [0.6, 0.35, 0.3], C.hide, { p: [0, 0.2, 2.6] });
    box(head, [2.12, 0.42, 2.12], C.blindfold, { p: [0, 0.75, 0.8] });
    for (const s of [-1, 1]) box(head, [0.3, 1.2, 0.12], C.blindfold, { p: [s * 0.3, 0.2, -0.3], r: [20, 0, s * 15] });
    box(head, [0.35, 0.35, 0.1], glow(C.gem, 2.6), { p: [0, 1.25, 1.82], r: [0, 0, 45] });
    const jaw = pivot(head, { p: [0, -0.5, 1.2] });
    box(jaw, [1.3, 0.45, 1.3], C.marbleShade, { p: [0, -0.15, 0.7] });

    // Balance scales
    box(body, [1.4, 0.5, 1.4], C.gold, { p: [0, 2.0, 0.6] });
    box(body, [0.45, 4.2, 0.45], C.bronze, { p: [0, 4.2, 0.6] });
    box(body, [0.9, 0.35, 0.9], C.bronzeLight, { p: [0, 2.4, 0.6] });
    cone(body, [0.45, 0.9, 4], C.bronzeLight, { p: [0, 6.85, 0.6], r: [0, 45, 0] });
    const beam = pivot(body, { p: [0, 6.1, 0.6] });
    box(beam, [7.4, 0.4, 0.55], C.bronzeLight);
    box(beam, [1.0, 0.8, 0.7], C.bronze);
    const pans = [];
    for (const s of [-1, 1]) {
      box(beam, [0.6, 0.6, 0.7], C.bronze, { p: [s * 3.55, 0, 0], r: [0, 0, 45] });
      const hanger = pivot(beam, { p: [s * 3.4, -0.2, 0] });
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + 0.5;
        rod(hanger, [0, 0, 0], [Math.cos(a) * 1.05, -2.6, Math.sin(a) * 1.05], 0.05, C.bronze, { outline: false });
      }
      cyl(hanger, [1.25, 0.85, 0.35, 8], C.bronze, { p: [0, -2.75, 0] });
      cyl(hanger, [1.1, 1.1, 0.06, 8], C.bronzeLight, { p: [0, -2.56, 0], outline: false });
      if (s < 0) prism(hanger, [[0, 0], [0.18, 0.5], [0.08, 1.1], [-0.08, 0.6]], 0.08, '#fbfaf5', { p: [0, -2.5, 0], r: [0, 30, -20] });
      else box(hanger, [0.45, 0.45, 0.45], glow(C.heart, 2.2), { p: [0, -2.3, 0], r: [0, 45, 35] });
      pans.push({ s, hanger });
    }

    const TAU = Math.PI * 2;
    function update(t) {
      const walk = 1 - span(t, 0.34, 0.42);
      const walkBack = span(t, 0.8, 0.98);
      const gait = walk + walkBack;
      const rear1 = bump(t, 0.44, 0.48, 0.51, ease.out);
      const rear2 = bump(t, 0.53, 0.56, 0.585, ease.out);
      const rear = Math.max(rear1, rear2);
      const jolt = settle(t, 0.51, 30, 8) + settle(t, 0.585, 30, 8);

      body.position.y = 4.1 + 0.1 * Math.abs(Math.sin(t * TAU * 3)) * gait + 0.3 * rear - 0.15 * jolt;
      body.rotation.x = (-12 * rear + 3 * jolt) * DEG;
      head.rotation.x = (6 * rear - 4 * jolt) * DEG;

      const sway = 15 * Math.sin(t * TAU * 3) * gait + 12 * settle(t, 0.4, 14, 7) - 6 * jolt;
      beam.rotation.z = sway * DEG;
      for (const { hanger } of pans) {
        hanger.rotation.z = (-sway * 1.25) * DEG;
        hanger.rotation.x = (6 * Math.sin(t * TAU * 3 + 1) * gait + 8 * jolt) * DEG;
      }

      for (const { hip, knee, front, ph } of legs) {
        const cyc = Math.sin((t * 3 + ph) * TAU) * gait;
        hip.rotation.x = (cyc * 16 + (front ? -35 * rear : 8 * rear)) * DEG;
        knee.rotation.x = (Math.max(0, cyc) * 25 + (front ? 30 * rear : 0)) * DEG;
      }
    }

    update(0);
    return { root, update };
  },
};
