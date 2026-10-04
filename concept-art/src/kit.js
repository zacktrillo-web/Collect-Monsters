// Shared part kit for the secret-monster blockouts.
// Every monster is assembled from simple Roblox-friendly parts (blocks, wedges,
// cylinders, low-poly spheres) so the concept can be rebuilt part-for-part.
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export { THREE };
export const DEG = Math.PI / 180;

// ---------- materials ----------

const gradientMap = (() => {
  const tex = new THREE.DataTexture(new Uint8Array([95, 175, 255]), 3, 1, THREE.RedFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
})();

const matCache = new Map();

// Cel-shaded surface material.
export function toon(color) {
  const key = 't' + color;
  if (!matCache.has(key)) {
    const m = new THREE.MeshToonMaterial({ color, gradientMap });
    m.userData.base = color;
    matCache.set(key, m);
  }
  return matCache.get(key);
}

// Unlit emissive material; values above 1 feed the bloom pass.
export function glow(color, k = 2.2) {
  const key = 'g' + color + k;
  if (!matCache.has(key)) {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), toneMapped: false });
    m.userData.glow = true;
    m.userData.base = color;
    matCache.set(key, m);
  }
  return matCache.get(key);
}

const resolveMat = (m) => (typeof m === 'string' ? toon(m) : m);

// Inverted-hull outline shared by every part. Width is in world units.
export const outline = {
  uniforms: { uWidth: { value: 0.05 }, uColor: { value: new THREE.Color('#141019') } },
};
outline.material = new THREE.ShaderMaterial({
  uniforms: outline.uniforms,
  side: THREE.BackSide,
  vertexShader: /* glsl */ `
    uniform float uWidth;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      mv.xyz += normalize(normalMatrix * normal) * uWidth;
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    void main() { gl_FragColor = vec4(uColor, 1.0); }`,
});

const hullCache = new WeakMap();
function hullOf(geom) {
  let h = hullCache.get(geom);
  if (!h) {
    const g = geom.clone();
    for (const name of Object.keys(g.attributes)) if (name !== 'position') g.deleteAttribute(name);
    h = mergeVertices(g, 1e-3);
    h.computeVertexNormals();
    hullCache.set(geom, h);
  }
  return h;
}

// ---------- placement ----------

export function place(obj, o = {}) {
  if (o.p) obj.position.set(o.p[0], o.p[1], o.p[2]);
  if (o.order) obj.rotation.order = o.order;
  if (o.r) obj.rotation.set(o.r[0] * DEG, o.r[1] * DEG, o.r[2] * DEG);
  if (o.s !== undefined) Array.isArray(o.s) ? obj.scale.set(o.s[0], o.s[1], o.s[2]) : obj.scale.setScalar(o.s);
  if (o.name) obj.name = o.name;
  return obj;
}

export function pivot(parent, o = {}) {
  const g = place(new THREE.Group(), o);
  parent.add(g);
  return g;
}

function addMesh(parent, geom, m, o = {}) {
  const mat = resolveMat(m);
  const mesh = place(new THREE.Mesh(geom, mat), o);
  const isGlow = !!mat.userData.glow;
  mesh.castShadow = !isGlow && o.shadow !== false;
  mesh.receiveShadow = !isGlow;
  if (o.outline ?? !isGlow) mesh.add(new THREE.Mesh(hullOf(geom), outline.material));
  parent.add(mesh);
  return mesh;
}

// ---------- primitives (all centred on their local origin) ----------

const geoCache = new Map();
// `shape` records what the geometry is, so tools/export-roblox.mjs can rebuild it from Roblox parts.
const cached = (key, make, shape) => {
  if (!geoCache.has(key)) {
    const g = make();
    g.userData.shape = shape;
    geoCache.set(key, g);
  }
  return geoCache.get(key);
};

export const box = (parent, [w, h, d], m, o) =>
  addMesh(parent, cached(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d), { type: 'box', size: [w, h, d] }), m, o);

export const cyl = (parent, [rt, rb, h, seg = 8], m, o) =>
  addMesh(parent, cached(`c${rt},${rb},${h},${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg), { type: 'cyl', rt, rb, h }), m, o);

export const cone = (parent, [r, h, seg = 4], m, o) =>
  addMesh(parent, cached(`k${r},${h},${seg}`, () => new THREE.ConeGeometry(r, h, seg), { type: 'cone', r, h }), m, o);

export const sph = (parent, r, m, o = {}) =>
  addMesh(parent, cached(`s${r},${o.detail ?? 1}`, () => new THREE.IcosahedronGeometry(r, o.detail ?? 1), { type: 'sph', r }), m, o);

export const tor = (parent, [R, tube, rs = 6, ts = 32], m, o) =>
  addMesh(parent, cached(`o${R},${tube},${rs},${ts}`, () => new THREE.TorusGeometry(R, tube, rs, ts), { type: 'tor', R, tube }), m, o);

// Ramp: full height at the back (-z), tapering to an edge at the front (+z).
export const wedge = (parent, [w, h, d], m, o) =>
  addMesh(
    parent,
    cached(`w${w},${h},${d}`, () => {
      const s = new THREE.Shape([
        new THREE.Vector2(-d / 2, -h / 2),
        new THREE.Vector2(d / 2, -h / 2),
        new THREE.Vector2(-d / 2, h / 2),
      ]);
      const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false });
      g.translate(0, 0, -w / 2);
      g.rotateY(-Math.PI / 2);
      return g;
    }, { type: 'wedge', size: [w, h, d] }),
    m,
    o,
  );

// Extruded 2D outline (points in the XY plane), extruded along Z and centred.
export function prism(parent, pts, depth, m, o = {}) {
  const key = 'p' + pts.flat().join(',') + '|' + depth;
  const g = cached(key, () => {
    const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
    geo.translate(0, 0, -depth / 2);
    return geo;
  }, { type: 'prism', pts, depth });
  return addMesh(parent, g, m, o);
}

// Tapered block: a frustum with a rectangular cross-section.
export const taper = (parent, [wb, db, wt, dt, h], m, o) =>
  addMesh(
    parent,
    cached(`f${wb},${db},${wt},${dt},${h}`, () => {
      const g = new THREE.CylinderGeometry(Math.SQRT1_2, Math.SQRT1_2, h, 4, 1).toNonIndexed();
      g.rotateY(Math.PI / 4);
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const top = pos.getY(i) > 0;
        pos.setX(i, pos.getX(i) * (top ? wt : wb));
        pos.setZ(i, pos.getZ(i) * (top ? dt : db));
      }
      g.computeVertexNormals();
      return g;
    }, { type: 'taper', wb, db, wt, dt, h }),
    m,
    o,
  );

// Thin cylinder spanning two points (chains, cables, struts).
export function rod(parent, a, b, r, m, o = {}) {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...b);
  const len = A.distanceTo(B);
  const mesh = addMesh(parent, cached(`r${r},${len.toFixed(3)}`, () => new THREE.CylinderGeometry(r, r, len, 5), { type: 'cyl', rt: r, rb: r, h: len }), m, o);
  mesh.position.copy(A).add(B).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.sub(A).normalize());
  return mesh;
}

// ---------- animation helpers ----------

export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const ease = {
  linear: (t) => t,
  inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  out: (t) => 1 - (1 - t) ** 3,
  in: (t) => t * t * t,
  back: (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
};
// Eased 0→1 progress of t across [a, b].
export const span = (t, a, b, e = ease.inOut) => e(clamp01((t - a) / (b - a)));
// Rises across [a, peak], falls across [peak, b].
export const bump = (t, a, peak, b, e = ease.inOut) => (t < peak ? span(t, a, peak, e) : 1 - span(t, peak, b, e));
// Damped bounce after `start` (for things that rattle and settle).
export const settle = (t, start, freq = 22, decay = 9) => {
  if (t < start) return 0;
  const x = t - start;
  return Math.exp(-decay * x) * Math.abs(Math.sin(freq * x));
};
export const lerp = (a, b, k) => a + (b - a) * k;
