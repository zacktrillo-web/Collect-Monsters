// Rebuilds an exported Roblox part tree in three.js (using Roblox's part conventions),
// so the conversion can be compared against the original blockout.
import { THREE, box, wedge, cyl, sph, glow } from '../src/kit.js';

export function previewGroup(tree) {
  const root = new THREE.Group();
  const holder = new THREE.Group();
  holder.rotation.y = Math.PI; // undo the export's turn to Roblox's -Z forward
  root.add(holder);
  const add = (n) => {
    const mat = n.neon ? glow(n.color) : n.color;
    const extra = new THREE.Matrix4();
    let mesh;
    if (n.cls === 'WedgePart') {
      mesh = wedge(holder, n.size, mat);
      extra.makeRotationY(Math.PI); // Roblox wedges are tall at +Z
    } else if (n.shape === 'Ball') mesh = sph(holder, n.size[0] / 2, mat, { detail: 2 });
    else if (n.shape === 'Cylinder') {
      mesh = cyl(holder, [n.size[1] / 2, n.size[1] / 2, n.size[0], 16], mat);
      extra.makeRotationZ(-Math.PI / 2); // Roblox cylinders run along X
    } else mesh = box(holder, n.size, mat);
    const [x, y, z, a, b, c, d, e, f, g, h, i] = n.cf;
    mesh.matrixAutoUpdate = false;
    mesh.matrix.set(a, b, c, x, d, e, f, y, g, h, i, z, 0, 0, 0, 1).multiply(extra);
  };
  const visit = (n) => (n.kind === 'model' ? n.children.forEach(visit) : add(n));
  visit(tree);
  return root;
}
