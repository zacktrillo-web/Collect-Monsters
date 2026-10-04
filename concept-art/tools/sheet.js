import { createStage } from '../src/stage.js';
import { monsters } from '../src/monsters/index.js';

const canvas = document.createElement('canvas');
const stage = createStage(canvas, { width: 1160, height: 1080 });

function shot(w, h, view, t) {
  stage.resize(w, h);
  stage.frame(view);
  stage.render(t);
  return canvas.toDataURL('image/png');
}

const $ = (id) => document.getElementById(id);
const frame = (src, label) => `<div class="frame"><img src="${src}"><span>${label}</span></div>`;

window.renderSheet = async (id) => {
  const index = monsters.findIndex((m) => m.id === id);
  const def = monsters[index];
  stage.setMonster(def);

  document.documentElement.style.setProperty('--accent', def.rim);
  $('name').textContent = def.name;
  $('num').textContent = `Secret ${String(index + 1).padStart(2, '0')} / ${String(monsters.length).padStart(2, '0')}`;
  $('appearance').textContent = def.appearance;
  $('movement').textContent = def.movement;
  $('palette').innerHTML = def.palette.map(([n, c]) => `<div class="sw"><i style="background:${c}"></i><b>${n}</b><code>${c}</code></div>`).join('');
  $('notes').innerHTML = def.notes.map((n) => `<li>${n}</li>`).join('');

  const hero = shot(1160, 1080, { az: -32, el: 12, margin: 0.8, ...def.hero, pose: def.keys[0][0] }, def.keys[0][0]);
  $('hero').src = hero;
  $('keys').innerHTML = def.keys.map(([t, label], i) => frame(shot(424, 352, { az: -40, el: 10, margin: 0.9, ...def.hero }, t), `${i + 1} · ${label}`)).join('');
  $('turn').innerHTML = [
    [{ az: 0, el: 4 }, 'Front'],
    [{ az: -90, el: 4 }, 'Side'],
    [{ az: 180, el: 4 }, 'Back'],
  ].map(([v, label]) => frame(shot(424, 352, { ...v, margin: 0.9, pose: def.keys[0][0] }, def.keys[0][0]), label)).join('');

  await document.fonts.ready;
  await Promise.all([...document.images].map((img) => img.decode()));
  return hero;
};

window.monsterIds = monsters.map((m) => m.id);
window.sheetReady = true;
