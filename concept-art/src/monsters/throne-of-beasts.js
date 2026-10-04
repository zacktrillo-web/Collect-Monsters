import { THREE, DEG, box, cone, glow, pivot, prism, span, ease } from '../kit.js';

const C = {
  stone: '#8f8778',
  stoneDark: '#665f53',
  gold: '#cfa64b',
  velvet: '#7d1f2c',
  velvetDark: '#4f121b',
  fur: '#3f2c22',
  furDark: '#2a1c15',
  claw: '#ebdfc4',
  maw: '#5c0a14',
  teeth: '#f3ecdb',
  ruby: '#ff3b3b',
};

export default {
  id: 'throne-of-beasts',
  name: 'Throne of Beasts',
  appearance: 'An empty, richly shaped stone throne walking on four beast legs, with hidden teeth inside its backrest.',
  movement: 'Backrest opens into a mouth and the entire throne lunges.',
  palette: [
    ['Throne stone', C.stone],
    ['Carved shadow', C.stoneDark],
    ['Royal gold', C.gold],
    ['Velvet', C.velvet],
    ['Beast fur', C.fur],
    ['Ruby eyes', C.ruby],
  ],
  bg: ['#4d2a2e', '#110709'],
  rim: '#ff7a6b',
  keys: [
    [0.1, 'Walk'],
    [0.44, 'Backrest opens'],
    [0.54, 'Lunge'],
  ],
  notes: [
    'Reads as furniture first: seat, armrests, tall backrest, crest. The legs are the only "animal" at rest.',
    'Backrest front is two velvet panels hinged top and bottom; teeth sit behind the panel edges, hidden.',
    'Two ruby gems in the crest become the eyes once the backrest mouth opens.',
  ],
  build() {
    const root = new THREE.Group();
    const rig = pivot(root);
    const throne = pivot(rig, { p: [0, 3.25, 0] });

    // Seat
    box(throne, [3.8, 1.0, 3.4], C.stone);
    box(throne, [3.2, 0.45, 2.8], C.velvet, { p: [0, 0.7, 0.15] });
    box(throne, [3.9, 0.3, 0.35], C.gold, { p: [0, -0.2, 1.72] });
    box(throne, [3.4, 0.7, 0.3], C.stoneDark, { p: [0, -0.75, 1.55] });
    prism(throne, [[-0.5, 0], [0.5, 0], [0, -0.45]], 0.2, C.gold, { p: [0, -0.4, 1.9] });

    // Armrests with carved beast heads
    for (const s of [-1, 1]) {
      box(throne, [0.7, 1.5, 0.7], C.stoneDark, { p: [s * 1.95, 1.0, 1.2] });
      box(throne, [0.85, 0.4, 3.1], C.stone, { p: [s * 1.95, 1.85, 0] });
      box(throne, [0.95, 0.12, 3.2], C.gold, { p: [s * 1.95, 1.6, 0] });
      box(throne, [0.8, 0.7, 0.75], C.stone, { p: [s * 1.95, 1.95, 1.75] });
      box(throne, [0.55, 0.35, 0.4], C.stoneDark, { p: [s * 1.95, 1.8, 2.2] });
      for (const k of [-0.18, 0.18]) box(throne, [0.12, 0.12, 0.1], C.gold, { p: [s * 1.95 + k, 2.1, 2.14] });
    }

    // Backrest: stone frame, hidden maw, and two hinged velvet "lips"
    const back = pivot(throne, { p: [0, 0.5, -1.35] });
    box(back, [3.8, 5.4, 0.55], C.stone, { p: [0, 2.7, -0.4] });
    for (const s of [-1, 1]) {
      box(back, [0.55, 5.4, 1.2], C.stoneDark, { p: [s * 1.62, 2.7, 0] });
      box(back, [0.7, 0.3, 1.3], C.gold, { p: [s * 1.62, 5.45, 0] });
      cone(back, [0.38, 0.9, 4], C.gold, { p: [s * 1.62, 6.05, 0], r: [0, 45, 0] });
    }
    box(back, [2.7, 4.5, 0.3], glow(C.maw, 1.3), { p: [0, 2.65, -0.05] });
    box(back, [3.8, 0.45, 1.2], C.stone, { p: [0, 5.3, 0] });
    const crest = pivot(back, { p: [0, 5.5, 0] });
    prism(crest, [[-1.6, 0], [1.6, 0], [1.3, 0.7], [0.6, 0.9], [0, 1.7], [-0.6, 0.9], [-1.3, 0.7]], 0.7, C.gold);
    for (const s of [-1, 1]) box(crest, [0.38, 0.3, 0.1], glow(C.ruby, 2.6), { p: [s * 0.55, 0.55, 0.38] });
    box(crest, [0.3, 0.3, 0.1], C.velvetDark, { p: [0, 1.05, 0.38], r: [0, 0, 45] });

    const lips = [];
    for (const [sign, hingeY] of [[1, 4.95], [-1, 0.35]]) {
      const hinge = pivot(back, { p: [0, hingeY, 0.35] });
      box(hinge, [2.75, 2.3, 0.35], C.velvet, { p: [0, -sign * 1.15, 0] });
      box(hinge, [2.85, 0.18, 0.4], C.gold, { p: [0, -sign * 0.12, 0] });
      for (let i = 0; i < 3; i++) box(hinge, [0.6, 0.6, 0.1], C.velvetDark, { p: [-0.8 + i * 0.8, -sign * 1.15, 0.2], r: [0, 0, 45], outline: false });
      for (let i = 0; i < 6; i++)
        box(hinge, [0.34, 0.55, 0.34], C.teeth, { p: [-1.1 + i * 0.44, -sign * (2.3 - 0.35), -0.32] });
      lips.push({ hinge, sign });
    }

    // Four beast legs
    const legs = [];
    for (const [x, z, ph] of [[-1.45, 1.15, 0], [1.45, 1.15, 0.5], [-1.45, -1.15, 0.5], [1.45, -1.15, 0]]) {
      const hip = pivot(throne, { p: [x, -0.5, z] });
      box(hip, [1.1, 1.5, 1.15], C.fur, { p: [0, -0.55, 0] });
      box(hip, [1.2, 0.5, 1.25], C.furDark, { p: [0, -0.1, 0] });
      const knee = pivot(hip, { p: [0, -1.2, 0] });
      box(knee, [0.85, 1.3, 0.85], C.fur, { p: [0, -0.55, z > 0 ? -0.1 : 0.1] });
      const paw = pivot(knee, { p: [0, -1.25, 0] });
      box(paw, [1.2, 0.5, 1.35], C.furDark, { p: [0, 0, 0.2] });
      for (const k of [-0.38, 0, 0.38]) cone(paw, [0.13, 0.5, 4], C.claw, { p: [k, -0.05, 1.05], r: [90, 45, 0] });
      legs.push({ hip, knee, paw, front: z > 0, ph });
    }

    const TAU = Math.PI * 2;
    function update(t) {
      const walk = 1 - span(t, 0.3, 0.38);
      const walkBack = span(t, 0.82, 0.98);
      const gait = walk + walkBack;
      const open = span(t, 0.32, 0.44, ease.out) * (1 - span(t, 0.6, 0.68, ease.in));
      const lunge = span(t, 0.46, 0.54, ease.out) * (1 - span(t, 0.64, 0.86));
      const crouch = span(t, 0.38, 0.46) * (1 - span(t, 0.46, 0.52));

      rig.position.z = 2.2 * lunge;
      throne.position.y = 3.25 + 0.12 * Math.abs(Math.sin(t * TAU * 2)) * gait - 0.35 * crouch + 0.3 * lunge;
      throne.rotation.x = (6 * crouch * -1 + 16 * lunge) * DEG;
      throne.rotation.z = 3 * Math.sin(t * TAU * 2) * gait * DEG;
      back.rotation.x = (-6 * open) * DEG;

      for (const { hinge, sign } of lips) hinge.rotation.x = (-sign * 72 * open) * DEG;
      for (const { hip, knee, paw, front, ph } of legs) {
        const cyc = Math.sin((t * 2 + ph) * TAU) * gait;
        hip.rotation.x = (cyc * 22 + (front ? -35 * lunge : 25 * lunge) + 15 * crouch) * DEG;
        knee.rotation.x = ((front ? 1 : -1) * Math.max(0, cyc) * 30 + (front ? 0 : -20 * lunge) - 20 * crouch) * DEG;
        paw.rotation.x = (-cyc * 10 + (front ? 30 * lunge : 0)) * DEG;
      }
    }

    update(0);
    return { root, update };
  },
};
