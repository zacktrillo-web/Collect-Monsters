// Bakes a monster's signature move into per-joint keyframes for Roblox.
// Each joint's transform is recorded relative to its parent joint (in Roblox space), sampled densely
// over one loop that starts from the pose the model is built in, then thinned to the fewest keys
// that still follow the motion within TOLERANCE. Joints that never move get no track; joints that
// only turn store rotations only.
import { THREE } from './kit.js';

const CONV = new THREE.Matrix4().makeRotationY(Math.PI);

export const PERIOD = 3.6; // seconds per loop, same as the gallery viewer
export const STEPS = 240; // dense samples per loop; key times are stored in these steps
const TOLERANCE = 0.01; // studs, measured 3 studs out from the joint
const LEVER = 3;

const lerpKey = (A, B, a) => ({ p: A.p.clone().lerp(B.p, a), q: A.q.clone().slerp(B.q, a) });
const keyError = (A, B) => A.p.distanceTo(B.p) + LEVER * A.q.angleTo(B.q);

// Ramer-Douglas-Peucker over time: keep the sample that the straight blend misses most, recursively.
// Keys are also never more than a quarter turn apart: near a half turn, which way a blend rotates
// is a coin flip that rounding can tip, so a spinning part could run backwards in Roblox.
function thin(samples) {
  const keep = new Set([0, samples.length - 1]);
  const turned = [0];
  for (let i = 1; i < samples.length; i++) turned.push(turned[i - 1] + samples[i - 1].q.angleTo(samples[i].q));
  const split = (a, b) => {
    if (b - a < 2) return;
    let worst = -1, at = -1;
    for (let i = a + 1; i < b; i++) {
      const e = keyError(lerpKey(samples[a], samples[b], (i - a) / (b - a)), samples[i]);
      if (e > worst) [worst, at] = [e, i];
    }
    if (turned[b] - turned[a] > Math.PI / 2) [worst, at] = [Infinity, (a + b) >> 1];
    if (worst > TOLERANCE) {
      keep.add(at);
      split(a, at);
      split(at, b);
    }
  };
  split(0, samples.length - 1);
  return [...keep].sort((x, y) => x - y);
}

export function bakeAnimation(def, tree) {
  const joints = [];
  (function collect(node, parent) {
    for (const c of node.children) {
      if (c.kind !== 'model') continue;
      joints.push({ name: c.name, parent, obj: c.obj });
      collect(c, joints.length);
    }
  })(tree, 0);

  const inst = tree.inst;
  const t0 = def.keys[0][0];
  const world = [new THREE.Matrix4()];
  const inv = new THREE.Matrix4();
  const local = new THREE.Matrix4();
  const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  const samples = joints.map(() => []);

  for (let f = 0; f <= STEPS; f++) {
    inst.update((t0 + f / STEPS) % 1);
    inst.root.updateMatrixWorld(true);
    joints.forEach((j, k) => {
      world[k + 1] = CONV.clone().multiply(j.obj.matrixWorld);
      local.multiplyMatrices(inv.copy(world[j.parent]).invert(), world[k + 1]);
      local.decompose(p, q, s);
      const prev = samples[k][f - 1];
      if (prev && prev.q.dot(q) < 0) q.set(-q.x, -q.y, -q.z, -q.w); // keep rotations on the short path
      samples[k].push({ p: p.clone(), q: q.clone() });
    });
  }
  inst.update(t0);
  inst.root.updateMatrixWorld(true);

  return {
    period: PERIOD,
    steps: STEPS,
    joints: joints.map((j, k) => {
      const track = samples[k];
      const rest = track[0];
      const out = { name: j.name, parent: j.parent, rest: [...rest.p.toArray(), ...rest.q.toArray()] };
      const moves = track.some((x) => x.p.distanceTo(rest.p) > 1e-4);
      const turns = track.some((x) => x.q.angleTo(rest.q) > 1e-4);
      if (!moves && !turns) return out;
      const keys = thin(track).slice(0, -1); // the last sample repeats the first (the loop closes)
      out.times = keys;
      out.stride = moves ? 7 : 4;
      out.track = keys.flatMap((i) => (moves ? [...track[i].p.toArray(), ...track[i].q.toArray()] : track[i].q.toArray()));
      return out;
    }),
  };
}

// Pose of every joint (Roblox model space) at loop time t, computed the way the Roblox script does.
export function sampleAnimation(anim, t) {
  const toKey = (v, j) => {
    const [x, y, z, qx, qy, qz, qw] = j.stride === 4 ? [j.rest[0], j.rest[1], j.rest[2], ...v] : v;
    return { p: new THREE.Vector3(x, y, z), q: new THREE.Quaternion(qx, qy, qz, qw).normalize() };
  };
  const f = (((t % 1) + 1) % 1) * anim.steps;
  const world = [new THREE.Matrix4()];
  anim.joints.forEach((j, k) => {
    let key;
    if (!j.times) key = toKey(j.rest, { stride: 7 });
    else {
      let i = 0;
      while (i + 1 < j.times.length && j.times[i + 1] <= f) i++;
      const n = (i + 1) % j.times.length;
      const ta = j.times[i], tb = n === 0 ? anim.steps : j.times[n];
      const at = (m) => toKey(j.track.slice(m * j.stride, (m + 1) * j.stride), j);
      key = lerpKey(at(i), at(n), (f - ta) / (tb - ta));
    }
    world[k + 1] = world[j.parent].clone().multiply(new THREE.Matrix4().compose(key.p, key.q, new THREE.Vector3(1, 1, 1)));
  });
  return world;
}
