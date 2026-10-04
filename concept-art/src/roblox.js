// Converts a monster blockout into a tree of Roblox parts.
// Blocks, wedges, balls and cylinders map 1:1. Shapes Roblox has no part for are rebuilt:
// cones become two-wedge spikes, rings become loops of blocks, tapered blocks become
// three stacked steps, and flat outlines (crests, masks, fins) become wedge triangles.
// Roblox models face -Z, so everything is turned 180° from the blockout (which faces +Z).
import { THREE, outline } from './kit.js';

const CONV = new THREE.Matrix4().makeRotationY(Math.PI);
const qAxis = (x, y, z, a) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(x, y, z), a);
const Q_Y180 = qAxis(0, 1, 0, Math.PI);
const Q_Y45 = qAxis(0, 1, 0, Math.PI / 4);
const Q_Z90 = qAxis(0, 0, 1, Math.PI / 2);

// CFrame as [x, y, z, R00, R01, R02, R10, R11, R12, R20, R21, R22] (rows of the rotation matrix).
export function cframe(pos, quat) {
  const e = new THREE.Matrix4().makeRotationFromQuaternion(quat).elements;
  return [pos.x, pos.y, pos.z, e[0], e[4], e[8], e[1], e[5], e[9], e[2], e[6], e[10]];
}
const cframeBasis = (pos, X, Y, Z) => [pos.x, pos.y, pos.z, X.x, Y.x, Z.x, X.y, Y.y, Z.y, X.z, Y.z, Z.z];

export const robloxName = (name) => name.replace(/[^A-Za-z0-9 ]/g, '').replace(/(?:^|\s)(\w)/g, (_, c) => c.toUpperCase()).replace(/\s/g, '');

// Triangle (world points) as two wedges, using the standard Roblox wedge-triangle construction.
function triangle(a, b, c, thickness) {
  let ab = b.clone().sub(a), ac = c.clone().sub(a), bc = c.clone().sub(b);
  const abd = ab.dot(ab), acd = ac.dot(ac), bcd = bc.dot(bc);
  if (abd > acd && abd > bcd) [a, c] = [c, a];
  else if (acd > bcd && acd > abd) [a, b] = [b, a];
  ab = b.clone().sub(a);
  ac = c.clone().sub(a);
  bc = c.clone().sub(b);
  const right = new THREE.Vector3().crossVectors(ac, ab);
  if (right.lengthSq() < 1e-10) return [];
  right.normalize();
  const up = new THREE.Vector3().crossVectors(bc, right).normalize();
  const back = bc.clone().normalize();
  const height = Math.abs(ab.dot(up));
  if (height < 1e-3) return [];
  const out = [];
  const len1 = Math.abs(ab.dot(back));
  const len2 = Math.abs(ac.dot(back));
  if (len1 > 1e-3) out.push({ cls: 'WedgePart', size: [thickness, height, len1], cf: cframeBasis(a.clone().add(b).multiplyScalar(0.5), right, up, back) });
  if (len2 > 1e-3)
    out.push({ cls: 'WedgePart', size: [thickness, height, len2], cf: cframeBasis(a.clone().add(c).multiplyScalar(0.5), right.clone().negate(), up, back.clone().negate()) });
  return out;
}

function meshParts(mesh) {
  const shape = mesh.geometry.userData.shape;
  if (!shape) return [];
  const W = CONV.clone().multiply(mesh.matrixWorld);
  const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  W.decompose(p, q, s);
  const at = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(W);
  const rot = (lq) => q.clone().multiply(lq);

  switch (shape.type) {
    case 'box': {
      const [w, h, d] = shape.size;
      return [{ cls: 'Part', shape: 'Block', size: [w * s.x, h * s.y, d * s.z], cf: cframe(p, q) }];
    }
    case 'wedge': {
      // Blockout wedges are tall at -Z; Roblox wedges are tall at +Z.
      const [w, h, d] = shape.size;
      return [{ cls: 'WedgePart', size: [w * s.x, h * s.y, d * s.z], cf: cframe(p, rot(Q_Y180)) }];
    }
    case 'cyl': {
      // Roblox cylinders run along X; the blockout's run along Y.
      const r = (shape.rt + shape.rb) / 2;
      return [{ cls: 'Part', shape: 'Cylinder', size: [shape.h * s.y, 2 * r * s.x, 2 * r * s.z], cf: cframe(p, rot(Q_Z90)) }];
    }
    case 'sph': {
      const d = (2 * shape.r * (s.x + s.y + s.z)) / 3;
      return [{ cls: 'Part', shape: 'Ball', size: [d, d, d], cf: cframe(p, q) }];
    }
    case 'cone': {
      // Four-sided spike rebuilt as a ridge of two wedges leaning together.
      const a = shape.r * Math.SQRT2 * s.x;
      const h = shape.h * s.y;
      const L = rot(Q_Y45);
      const off = new THREE.Vector3(0, 0, a / 4).applyQuaternion(L);
      return [
        { cls: 'WedgePart', size: [a, h, a / 2], cf: cframe(p.clone().add(off), L.clone().multiply(Q_Y180)) },
        { cls: 'WedgePart', size: [a, h, a / 2], cf: cframe(p.clone().sub(off), L) },
      ];
    }
    case 'tor': {
      const n = Math.max(16, Math.min(64, Math.round((2 * Math.PI * shape.R * s.x) / 0.5)));
      const out = [];
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2;
        out.push({
          cls: 'Part',
          shape: 'Block',
          size: [((2 * Math.PI * shape.R) / n) * 1.12 * s.x, 2 * shape.tube * s.y, 2 * shape.tube * s.z],
          cf: cframe(at(Math.cos(t) * shape.R, Math.sin(t) * shape.R, 0), rot(qAxis(0, 0, 1, t + Math.PI / 2))),
        });
      }
      return out;
    }
    case 'taper': {
      const out = [];
      for (let k = 0; k < 3; k++) {
        const f = (k + 0.5) / 3;
        const w = shape.wb + (shape.wt - shape.wb) * f;
        const d = shape.db + (shape.dt - shape.db) * f;
        out.push({ cls: 'Part', shape: 'Block', size: [w * s.x, (shape.h / 3) * s.y * 1.02, d * s.z], cf: cframe(at(0, -shape.h / 2 + shape.h * f, 0), q) });
      }
      return out;
    }
    case 'prism': {
      const contour = shape.pts.map(([x, y]) => new THREE.Vector2(x, y));
      const thickness = shape.depth * s.z;
      return THREE.ShapeUtils.triangulateShape(contour, []).flatMap(([i, j, k]) =>
        triangle(at(...shape.pts[i], 0), at(...shape.pts[j], 0), at(...shape.pts[k], 0), thickness),
      );
    }
    default:
      return [];
  }
}

// Returns { kind: 'model', name, pivot, children } where children are parts and nested joint models.
// Joint names are unique within a monster so the animation script can find them by name.
// Each joint node keeps `obj` (its blockout group) and the tree keeps `inst`, for baking animation.
export function toRoblox(def, t = def.keys[0][0]) {
  const inst = def.build();
  inst.update(t);
  inst.root.updateMatrixWorld(true);

  const names = new Map(def.palette.map(([n, c]) => [c.toLowerCase(), n]));
  const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  const used = new Set([robloxName(def.name)]);
  const unique = (base) => {
    let name = base;
    for (let i = 2; used.has(name); i++) name = base + i;
    used.add(name);
    return name;
  };

  function walk(obj, node) {
    for (const child of obj.children) {
      if (!child.visible || child.material === outline.material) continue;
      if (child.isMesh) {
        const base = String(child.material.userData.base || '#888888').toLowerCase();
        const neon = !!child.material.userData.glow;
        const name = names.get(base) || (neon ? 'Glow' : 'Part');
        for (const part of meshParts(child)) node.children.push({ kind: 'part', name, color: base, neon, ...part });
        walk(child, node);
      } else {
        CONV.clone().multiply(child.matrixWorld).decompose(p, q, s);
        const sub = { kind: 'model', name: unique(child.name || 'Joint'), pivot: cframe(p, q), children: [], obj: child };
        walk(child, sub);
        if (sub.children.length) node.children.push(sub);
      }
    }
  }

  const tree = { kind: 'model', name: robloxName(def.name), pivot: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1], children: [], inst };
  walk(inst.root, tree);
  return tree;
}

export function countParts(node) {
  return node.kind === 'part' ? 1 : node.children.reduce((n, c) => n + countParts(c), 0);
}
