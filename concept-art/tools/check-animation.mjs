// Compares each baked Roblox animation against the blockout's own motion.
// Reports the worst joint error in studs (measured up to 3 studs out from each joint) over 1000
// moments of the loop, plus how many keyframe numbers the Roblox script carries.
// Usage: node tools/check-animation.mjs [monster-id ...]
import { THREE } from '../src/kit.js';
import { monsters } from '../src/monsters/index.js';
import { toRoblox } from '../src/roblox.js';
import { bakeAnimation, sampleAnimation } from '../src/roblox-anim.js';

const CONV = new THREE.Matrix4().makeRotationY(Math.PI);
const ids = process.argv.slice(2);
const probes = [[0, 0, 0], [3, 0, 0], [0, 3, 0], [0, 0, 3]].map((v) => new THREE.Vector3(...v));

for (const def of monsters.filter((m) => !ids.length || ids.includes(m.id))) {
  const tree = toRoblox(def);
  const anim = bakeAnimation(def, tree);
  const objs = [];
  (function collect(n) {
    for (const c of n.children) if (c.kind === 'model') (objs.push(c.obj), collect(c));
  })(tree);

  const t0 = def.keys[0][0];
  let worst = 0, worstT = 0;
  for (let i = 0; i < 1000; i++) {
    const t = i / 1000;
    const predicted = sampleAnimation(anim, t);
    tree.inst.update((t0 + t) % 1);
    tree.inst.root.updateMatrixWorld(true);
    objs.forEach((o, k) => {
      const truth = CONV.clone().multiply(o.matrixWorld);
      for (const v of probes) {
        const e = v.clone().applyMatrix4(truth).distanceTo(v.clone().applyMatrix4(predicted[k + 1]));
        if (e > worst) [worst, worstT] = [e, t];
      }
    });
  }
  const numbers = anim.joints.reduce((n, j) => n + 7 + (j.track ? j.track.length + j.times.length : 0), 0);
  const animated = anim.joints.filter((j) => j.track).length;
  console.log(
    `${def.id.padEnd(22)} joints ${String(anim.joints.length).padStart(3)}  animated ${String(animated).padStart(3)}  numbers ${String(numbers).padStart(6)}  worst error ${worst.toFixed(3)} studs (t=${worstT.toFixed(3)})`,
  );
}
