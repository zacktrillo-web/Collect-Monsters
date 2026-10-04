import { THREE, DEG, box, cone, glow, pivot, prism, taper, wedge, span, bump, ease, lerp } from '../kit.js';

const C = {
  cloak: '#1d1b27',
  cloakMid: '#2c283b',
  lining: '#4b2a60',
  mask: '#f3f0e8',
  maskShade: '#cbc6b9',
  void: '#07060a',
  eye: '#bfe9ff',
  hand: '#cdc6d8',
  claw: '#2a2531',
};

export default {
  id: 'the-missing-one',
  name: 'The Missing One',
  appearance: 'Floating angular cloak, oversized clawed hands, and an incomplete white mask.',
  movement: 'Mask fragments briefly assemble into a face before it attacks.',
  palette: [
    ['Cloak black', C.cloak],
    ['Fold grey', C.cloakMid],
    ['Lining violet', C.lining],
    ['Mask white', C.mask],
    ['Pale hands', C.hand],
    ['Hollow light', C.eye],
  ],
  bg: ['#3a3550', '#0b0a12'],
  rim: '#bfe9ff',
  keys: [
    [0.08, 'Drift'],
    [0.42, 'Mask assembles'],
    [0.55, 'Attack'],
  ],
  notes: [
    'No legs and no visible body — just an angular cloak shell with a dark void inside the hood.',
    'Hands are ~2× normal scale, floating at the sleeve ends, with long dark claws.',
    'Mask = 6 white fragments. Only 3 are in place at rest; the rest orbit until it attacks.',
  ],
  build() {
    const root = new THREE.Group();
    const body = pivot(root, { p: [0, 1.4, 0] });

    // Angular cloak shell
    taper(body, [3.6, 2.8, 2.3, 1.7, 4.2], C.cloak, { p: [0, 2.4, 0] });
    taper(body, [2.4, 1.8, 3.8, 2.4, 0.9], C.cloakMid, { p: [0, 4.9, 0] });
    for (const s of [-1, 1]) {
      box(body, [1.4, 3.6, 0.25], C.cloakMid, { p: [s * 0.75, 2.3, 1.18], r: [-6, s * -22, s * 4] });
      box(body, [0.9, 3.0, 0.1], C.lining, { p: [s * 0.35, 2.0, 0.95], r: [-6, 0, 0], outline: false });
    }
    box(body, [0.7, 3.0, 0.2], C.void, { p: [0, 2.2, 0.9], outline: false });
    // Jagged hem
    const hem = [[-1.5, 1.1, 1.0], [-0.7, 1.1, 1.6], [0.2, 1.1, 0.9], [1.0, 1.1, 1.4], [1.6, 0.6, 1.1], [1.6, -0.6, 1.5], [1.2, -1.2, 1.0],
      [0.3, -1.3, 1.7], [-0.6, -1.3, 1.2], [-1.4, -1.0, 1.6], [-1.7, 0, 1.2]];
    for (const [x, z, h] of hem) cone(body, [0.42, h, 4], C.cloak, { p: [x, 0.3 - h / 2, z], r: [180, 45, 0] });

    // Hood with void face
    const hood = pivot(body, { p: [0, 5.4, 0.1] });
    taper(hood, [2.3, 2.2, 1.5, 1.6, 2.0], C.cloak, { p: [0, 0.95, -0.1] });
    cone(hood, [1.15, 1.6, 4], C.cloak, { p: [0, 2.55, -0.45], r: [-28, 45, 0] });
    box(hood, [1.8, 1.7, 0.4], C.void, { p: [0, 0.8, 0.85], outline: false });
    wedge(hood, [2.2, 0.5, 1.0], C.cloakMid, { p: [0, 1.9, 0.75], r: [0, 180, 0] });

    // Mask fragments: [home position, shape, scattered offset, starts in place?]
    const mask = pivot(hood, { p: [0, 0.85, 1.12] });
    const frags = [];
    const frag = (pts, home, away, inPlace, extra) => {
      const p = pivot(mask, { p: home });
      prism(p, pts, 0.18, C.mask);
      if (extra) extra(p);
      frags.push({ p, home: new THREE.Vector3(...home), away: new THREE.Vector3(...away), inPlace, spin: frags.length * 1.7 });
    };
    frag([[-0.7, 0], [0.7, 0], [0.55, 0.38], [-0.55, 0.38]], [0, 0.32, 0], [0.4, 2.4, 0.6], true);
    frag([[-0.72, 0], [-0.04, 0], [-0.04, -0.75], [-0.42, -0.95], [-0.7, -0.4]], [0, 0.3, 0], [0, 0, 0], true, (p) => {
      box(p, [0.36, 0.2, 0.06], C.void, { p: [-0.38, -0.25, 0.1], outline: false });
      box(p, [0.12, 0.08, 0.04], glow(C.eye, 2.6), { p: [-0.38, -0.25, 0.14] });
      box(p, [0.04, 0.5, 0.03], C.maskShade, { p: [-0.2, -0.6, 0.1], r: [0, 0, 20], outline: false });
    });
    frag([[0.04, 0], [0.72, 0], [0.7, -0.4], [0.42, -0.95], [0.04, -0.75]], [0, 0.3, 0], [2.3, -0.4, 0.8], false, (p) => {
      box(p, [0.36, 0.2, 0.06], C.void, { p: [0.38, -0.25, 0.1], outline: false });
      box(p, [0.12, 0.08, 0.04], glow(C.eye, 2.6), { p: [0.38, -0.25, 0.14] });
    });
    frag([[-0.1, 0], [0.1, 0], [0.16, -0.5], [-0.16, -0.5]], [0, 0.3, 0.06], [-1.9, 1.2, 0.9], true);
    frag([[-0.42, 0], [0.42, 0], [0.22, -0.38], [-0.22, -0.38]], [0, -0.68, 0], [1.4, -1.6, 1.2], false, (p) => {
      box(p, [0.5, 0.06, 0.04], C.void, { p: [0, -0.15, 0.1], outline: false });
    });
    frag([[-0.3, 0], [0.3, 0], [0.18, 0.25], [-0.18, 0.25]], [0, 0.72, 0.02], [-2.2, -0.2, 1.0], false);

    // Sleeves + oversized hands
    const hands = [];
    for (const s of [-1, 1]) {
      const sleeve = pivot(body, { p: [s * 1.9, 4.7, 0.1], r: [0, 0, s * 35] });
      taper(sleeve, [0.9, 0.9, 1.6, 1.4, 2.4], C.cloakMid, { p: [0, -1.1, 0] });
      box(sleeve, [1.5, 0.3, 1.3], C.lining, { p: [0, -2.25, 0], outline: false });
      const hand = pivot(body, { p: [s * 3.4, 2.4, 0.6] });
      const palm = pivot(hand, { r: [0, 0, s * 10] });
      box(palm, [1.5, 0.45, 1.6], C.hand, { p: [0, 0, 0.2] });
      const fingers = [];
      [-0.55, -0.18, 0.18, 0.55].forEach((x, i) => {
        const f1 = pivot(palm, { p: [x, 0, 1.0], r: [0, (x * 12), 0] });
        box(f1, [0.26, 0.26, 1.0], C.hand, { p: [0, 0, 0.5] });
        const f2 = pivot(f1, { p: [0, 0, 1.0] });
        box(f2, [0.22, 0.22, 0.8], C.hand, { p: [0, 0, 0.4] });
        const f3 = pivot(f2, { p: [0, 0, 0.8] });
        cone(f3, [0.16, 0.8, 4], C.claw, { p: [0, 0, 0.35], r: [90, 45, 0] });
        fingers.push({ f1, f2, f3, i });
      });
      const thumb = pivot(palm, { p: [-s * 0.8, 0, 0.1], r: [0, -s * 55, 0] });
      box(thumb, [0.28, 0.28, 0.9], C.hand, { p: [0, 0, 0.45] });
      cone(thumb, [0.16, 0.6, 4], C.claw, { p: [0, 0, 1.15], r: [90, 45, 0] });
      hands.push({ s, hand, palm, fingers });
    }

    // Trailing shadow wisps
    const wisps = [];
    for (let i = 0; i < 5; i++) {
      const w = pivot(body);
      box(w, [0.3, 0.3, 0.3], C.cloak, { p: [(i - 2) * 0.7, -0.6 - (i % 2) * 0.5, -0.4] });
      wisps.push(w);
    }

    const TAU = Math.PI * 2;
    function update(t) {
      const gather = span(t, 0.2, 0.42, ease.out) * (1 - span(t, 0.68, 0.9));
      const lunge = span(t, 0.46, 0.55, ease.in) * (1 - span(t, 0.66, 0.92));
      const coil = bump(t, 0.36, 0.45, 0.5);

      body.position.y = 1.4 + 0.25 * Math.sin(t * TAU);
      body.rotation.x = (-6 * coil + 12 * lunge) * DEG;
      body.position.z = 1.2 * lunge;
      hood.rotation.x = (8 * lunge) * DEG;

      for (const { p, home, away, inPlace, spin } of frags) {
        if (inPlace) {
          p.position.copy(home);
          p.rotation.set(0, 0, 0);
          continue;
        }
        const k = gather;
        const a = spin + t * TAU;
        p.position.set(
          lerp(away.x + 0.3 * Math.cos(a), home.x, k),
          lerp(away.y + 0.3 * Math.sin(a), home.y, k),
          lerp(away.z, home.z, k),
        );
        p.rotation.set((1 - k) * Math.sin(a) * 0.8, (1 - k) * 0.6, (1 - k) * Math.cos(a) * 1.2);
      }

      for (const { s, hand, palm, fingers } of hands) {
        hand.position.set(s * lerp(3.4, 2.2, lunge) + s * 0.4 * coil, 2.4 + 1.0 * coil + 0.6 * lunge + 0.15 * Math.sin(t * TAU + s), 0.6 + 3.2 * lunge - 0.6 * coil);
        palm.rotation.set((-20 * coil + 10 * lunge) * DEG, s * (-20 * lunge) * DEG, s * (10 + 50 * coil - 30 * lunge) * DEG);
        for (const { f1, f2, f3, i } of fingers) {
          const curl = 20 + 10 * Math.sin(t * TAU * 2 + i) * (1 - lunge) - 15 * coil + 30 * lunge;
          f1.rotation.x = curl * DEG;
          f2.rotation.x = curl * 1.2 * DEG;
          f3.rotation.x = curl * 0.8 * DEG;
        }
      }
      wisps.forEach((w, i) => (w.position.y = -0.4 * ((t * 2 + i * 0.2) % 1)));
    }

    update(0);
    return { root, update };
  },
};
