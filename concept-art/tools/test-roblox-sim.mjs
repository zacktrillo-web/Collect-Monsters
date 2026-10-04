// Runs each generated build script + SignatureMove in a simulated Studio (tools/studio-sim.luau) with
// the Luau CLI, and compares every part's position at several moments against the blockout's motion.
// Usage: LUAU=/path/to/luau node tools/test-roblox-sim.mjs [monster-id ...]   (LUAU defaults to "luau")
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { THREE } from '../src/kit.js';
import { monsters } from '../src/monsters/index.js';
import { toRoblox } from '../src/roblox.js';

import os from 'node:os';
import path from 'node:path';

const LUAU = process.env.LUAU || 'luau';
const sim = fs.readFileSync(new URL('./studio-sim.luau', import.meta.url), 'utf8');
const runFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'roblox-sim-')), 'run.luau');
const CONV = new THREE.Matrix4().makeRotationY(Math.PI);
const TIMES = [0.13, 0.31, 0.42, 0.47, 0.52, 0.66, 0.9];
const ids = process.argv.slice(2);
const cfMat = (c) => new THREE.Matrix4().set(c[3], c[4], c[5], c[0], c[6], c[7], c[8], c[1], c[9], c[10], c[11], c[2], 0, 0, 0, 1);

monsters.forEach((def, index) => {
  if (ids.length && !ids.includes(def.id)) return;
  const build = fs.readFileSync(`roblox/${def.id}.luau`, 'utf8');
  const driver = `
local model = assert(loadstring(${JSON.stringify(build)}))()
assert(model.Parent == workspace, "model not parented to workspace")
local animator = assert(model:FindFirstChild("SignatureMove"), "no SignatureMove")
assert(animator.RunContext == "Client", "RunContext not Client")
assert(animator:FindFirstChild("Keyframes"), "no Keyframes")
script = animator
local src = string.gsub(animator.Source, "os%.clock%(%)", "__clock()")
assert(loadstring(src))()
assert(#__heartbeat == 1, "animator did not connect")
for _, t in { ${TIMES.join(', ')} } do
	__clockValue = t * 3.6
	__heartbeat[1]()
	for i, p in __allParts do
		local c = p.CFrame
		print(string.format("%s %d %.4f %.4f %.4f", tostring(t), i, c.x, c.y, c.z))
	end
end
`;
  fs.writeFileSync(runFile, sim + driver);
  let out;
  try {
    out = execFileSync(LUAU, [runFile], { encoding: 'utf8', maxBuffer: 1 << 26 });
  } catch (e) {
    console.log(`${def.id}: LUAU ERROR\n${e.stdout}\n${e.stderr}`);
    return;
  }
  const got = new Map();
  for (const line of out.trim().split('\n')) {
    const [t, i, x, y, z] = line.split(' ');
    got.set(`${t} ${i}`, new THREE.Vector3(+x, +y, +z));
  }

  const tree = toRoblox(def);
  const t0 = def.keys[0][0];
  const parts = [];
  (function walk(node, joint) {
    for (const c of node.children) c.kind === 'model' ? walk(c, c) : parts.push({ cf: c.cf, joint });
  })(tree, null);
  const slot = (index - (monsters.length - 1) / 2) * 40;
  const ORIGIN = new THREE.Matrix4().makeTranslation(slot, 0, -30).multiply(new THREE.Matrix4().makeRotationY(Math.PI));
  const rest = new Map();
  for (const p of parts) if (p.joint && !rest.has(p.joint)) rest.set(p.joint, CONV.clone().multiply(p.joint.obj.matrixWorld));

  let worst = 0;
  for (const t of TIMES) {
    tree.inst.update((t0 + t) % 1);
    tree.inst.root.updateMatrixWorld(true);
    parts.forEach((p, i) => {
      const local = cfMat(p.cf);
      const expected = p.joint
        ? ORIGIN.clone().multiply(CONV.clone().multiply(p.joint.obj.matrixWorld)).multiply(rest.get(p.joint).clone().invert()).multiply(local)
        : ORIGIN.clone().multiply(local);
      const e = new THREE.Vector3().setFromMatrixPosition(expected).distanceTo(got.get(`${t} ${i + 1}`));
      worst = Math.max(worst, e);
    });
  }
  console.log(`${def.id.padEnd(22)} parts ${String(parts.length).padStart(4)}  worst position error over ${TIMES.length} moments: ${worst.toFixed(3)} studs`);
});
