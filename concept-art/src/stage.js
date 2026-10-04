// Lit, outlined, bloom-enabled stage shared by the sheet renderer and the viewer.
import { THREE, outline } from './kit.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const DEG = Math.PI / 180;

function backdrop([top, bottom]) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  // Soft spotlight behind the monster so dark silhouettes still read.
  const spot = g.createRadialGradient(256, 220, 10, 256, 220, 300);
  spot.addColorStop(0, 'rgba(255,255,255,0.16)');
  spot.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = spot;
  g.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createStage(canvas, { width = 800, height = 600, pixelRatio = 1 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, width / height, 0.1, 1000);

  scene.add(new THREE.HemisphereLight('#f4f1ff', '#4a4458', 1.35));
  const key = new THREE.DirectionalLight('#fff4e2', 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0015;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight('#ffffff', 1.4);
  scene.add(rim, rim.target);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(400, 64), new THREE.ShadowMaterial({ opacity: 0.32 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.5, 0.45, 1.1);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let def = null;
  let inst = null;
  const unionBounds = new THREE.Box3();
  const single = new THREE.Box3();
  function poseBounds(t) {
    inst.update(t);
    inst.root.updateMatrixWorld(true);
    return single.setFromObject(inst.root);
  }
  const target = new THREE.Vector3();

  function setMonster(nextDef) {
    if (inst) scene.remove(inst.root);
    def = nextDef;
    inst = def.build();
    scene.add(inst.root);

    // Frame against the union of every key pose so nothing is cropped mid-move.
    unionBounds.makeEmpty();
    for (const [t] of def.keys) unionBounds.union(poseBounds(t));
    inst.update(def.keys[0][0]);

    const size = unionBounds.getSize(new THREE.Vector3());
    const radius = size.length() / 2;
    outline.uniforms.uWidth.value = radius * 0.0095;
    key.shadow.normalBias = radius * 0.006;
    unionBounds.getCenter(target);

    scene.background = backdrop(def.bg);
    rim.color.set(def.rim || '#ffffff');

    const sc = key.shadow.camera;
    sc.left = sc.bottom = -radius * 1.3;
    sc.right = sc.top = radius * 1.3;
    sc.near = 0.1;
    sc.far = radius * 8;
    sc.updateProjectionMatrix();
    key.position.copy(target).add(new THREE.Vector3(-0.55, 1.1, 0.75).normalize().multiplyScalar(radius * 3));
    key.target.position.copy(target);
    rim.position.copy(target).add(new THREE.Vector3(0.8, 0.6, -1).normalize().multiplyScalar(radius * 3));
    rim.target.position.copy(target);
  }

  // Place the camera on a view direction and pull back until the bounds fit.
  // With `pose`, fit that single pose instead of the union of every key pose.
  function frame({ az = -35, el = 14, margin = 0.86, pose } = {}) {
    const bounds = pose === undefined ? unionBounds : poseBounds(pose);
    const dir = new THREE.Vector3(Math.sin(az * DEG) * Math.cos(el * DEG), Math.sin(el * DEG), Math.cos(az * DEG) * Math.cos(el * DEG));
    const corners = [];
    for (let i = 0; i < 8; i++)
      corners.push(new THREE.Vector3(i & 1 ? bounds.max.x : bounds.min.x, i & 2 ? bounds.max.y : bounds.min.y, i & 4 ? bounds.max.z : bounds.min.z));
    const tanV = Math.tan((camera.fov / 2) * DEG) * margin;
    const tanH = tanV * camera.aspect;
    const center = bounds.getCenter(new THREE.Vector3());
    const F = dir.clone().negate();
    const R = new THREE.Vector3().crossVectors(F, new THREE.Vector3(0, 1, 0)).normalize();
    const U = new THREE.Vector3().crossVectors(R, F);
    const local = (c) => {
      const o = c.clone().sub(center);
      return [o.dot(R), o.dot(U), o.dot(F)];
    };
    const fitDistance = () => {
      let D = 0;
      for (const c of corners) {
        const [x, y, f] = local(c);
        D = Math.max(D, Math.abs(x) / tanH - f, Math.abs(y) / tanV - f);
      }
      return D;
    };
    // Fit, then shift the aim point so the projected extents are balanced, and refit.
    for (let pass = 0; pass < 3; pass++) {
      const D = fitDistance();
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const c of corners) {
        const [x, y, f] = local(c);
        x0 = Math.min(x0, x / (D + f)); x1 = Math.max(x1, x / (D + f));
        y0 = Math.min(y0, y / (D + f)); y1 = Math.max(y1, y / (D + f));
      }
      center.addScaledVector(R, ((x0 + x1) / 2) * D).addScaledVector(U, ((y0 + y1) / 2) * D);
    }
    camera.position.copy(center).addScaledVector(dir, fitDistance());
    camera.lookAt(center);
    return center;
  }

  function resize(w, h) {
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function render(t) {
    if (inst) inst.update(t);
    composer.render();
  }

  return { renderer, scene, camera, composer, setMonster, frame, resize, render, get bounds() { return unionBounds; } };
}
