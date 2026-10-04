// Exports each monster blockout as Roblox files:
//   roblox/<id>.luau  - a script that builds the model in Studio (Command Bar or Claude in Studio)
//   roblox/<id>.rbxmx - a model file for Insert from File
// Usage: node tools/export-roblox.mjs [monster-id ...]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { monsters } from '../src/monsters/index.js';
import { toRoblox, countParts } from '../src/roblox.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'roblox');
fs.mkdirSync(outDir, { recursive: true });

const num = (n) => String(Number((Math.abs(n) < 5e-5 ? 0 : n).toFixed(4)));
const list = (a) => a.map(num).join(', ');

function toLuau(def, tree) {
  const lines = [
    `-- Collect Monsters: ${def.name} (Secret)`,
    '-- Generated from the concept blockout by concept-art/tools/export-roblox.mjs.',
    '-- Run once in Roblox Studio (Command Bar, or ask Claude in Studio to run it).',
    '-- It adds the model to Workspace, 30 studs in front of the origin, facing the spawn.',
    '',
    'local ORIGIN = CFrame.new(0, 0, -30) * CFrame.Angles(0, math.pi, 0)',
    'local M = {}',
    '',
    'local function cf(t)',
    '\treturn ORIGIN * CFrame.new(table.unpack(t))',
    'end',
    '',
    'local function part(parent, class, name, size, frame, color, neon, shape)',
    '\tlocal p = Instance.new(class)',
    '\tp.Name = name',
    '\tp.Anchored = true',
    '\tp.Size = Vector3.new(size[1], size[2], size[3])',
    '\tp.CFrame = cf(frame)',
    '\tp.Color = Color3.fromHex(color)',
    '\tp.Material = if neon then Enum.Material.Neon else Enum.Material.SmoothPlastic',
    '\tif shape then',
    '\t\tp.Shape = Enum.PartType[shape]',
    '\tend',
    '\tp.TopSurface = Enum.SurfaceType.Smooth',
    '\tp.BottomSurface = Enum.SurfaceType.Smooth',
    '\tp.Parent = parent',
    'end',
    '',
    'local function joint(parent, name)',
    '\tlocal m = Instance.new("Model")',
    '\tm.Name = name',
    '\tm.Parent = parent',
    '\treturn m',
    'end',
    '',
  ];
  const pivots = [];
  let count = 0;
  function emit(node, parentRef) {
    const ref = `M[${++count}]`;
    if (parentRef) lines.push(`${ref} = joint(${parentRef}, ${JSON.stringify(node.name)})`);
    else lines.push(`${ref} = Instance.new("Model")`, `${ref}.Name = ${JSON.stringify(node.name)}`);
    pivots.push(`${ref}.WorldPivot = cf({ ${list(node.pivot)} })`);
    for (const c of node.children) {
      if (c.kind === 'model') emit(c, ref);
      else {
        const shape = c.cls === 'Part' && c.shape !== 'Block' ? `, "${c.shape}"` : '';
        lines.push(`part(${ref}, "${c.cls}", ${JSON.stringify(c.name)}, { ${list(c.size)} }, { ${list(c.cf)} }, "${c.color}", ${c.neon}${shape})`);
      }
    }
  }
  emit(tree, null);
  lines.push('', '-- Joint pivots, so each moving piece rotates around its hinge in Studio', ...pivots, '');
  lines.push('M[1].Parent = workspace', 'pcall(function()', '\tgame:GetService("Selection"):Set({ M[1] })', 'end)', `print("Built ${def.name}: ${countParts(tree)} parts")`, '');
  return lines.join('\n');
}

const MATERIAL = { SmoothPlastic: 272, Neon: 288 };
const SHAPE = { Ball: 0, Block: 1, Cylinder: 2 };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const KEYS = ['X', 'Y', 'Z', 'R00', 'R01', 'R02', 'R10', 'R11', 'R12', 'R20', 'R21', 'R22'];
const cfXml = (cf) => cf.map((v, i) => `<${KEYS[i]}>${num(v)}</${KEYS[i]}>`).join('');

function toRbxmx(tree) {
  let ref = 0;
  const out = ['<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">'];
  function item(node, depth) {
    const pad = '  '.repeat(depth);
    if (node.kind === 'model') {
      out.push(`${pad}<Item class="Model" referent="RBX${ref++}"><Properties>`);
      out.push(`${pad}  <string name="Name">${esc(node.name)}</string>`);
      out.push(`${pad}  <OptionalCoordinateFrame name="WorldPivotData"><CFrame>${cfXml(node.pivot)}</CFrame></OptionalCoordinateFrame>`);
      out.push(`${pad}</Properties>`);
      for (const c of node.children) item(c, depth + 1);
      out.push(`${pad}</Item>`);
      return;
    }
    const rgb = parseInt(node.color.slice(1), 16);
    out.push(`${pad}<Item class="${node.cls}" referent="RBX${ref++}"><Properties>`);
    out.push(`${pad}  <string name="Name">${esc(node.name)}</string>`);
    out.push(`${pad}  <bool name="Anchored">true</bool>`);
    out.push(`${pad}  <CoordinateFrame name="CFrame">${cfXml(node.cf)}</CoordinateFrame>`);
    out.push(`${pad}  <Color3uint8 name="Color3uint8">${(0xff000000 + rgb) >>> 0}</Color3uint8>`);
    out.push(`${pad}  <token name="Material">${node.neon ? MATERIAL.Neon : MATERIAL.SmoothPlastic}</token>`);
    out.push(`${pad}  <token name="TopSurface">0</token><token name="BottomSurface">0</token>`);
    out.push(`${pad}  <Vector3 name="size"><X>${num(node.size[0])}</X><Y>${num(node.size[1])}</Y><Z>${num(node.size[2])}</Z></Vector3>`);
    if (node.cls === 'Part') out.push(`${pad}  <token name="shape">${SHAPE[node.shape]}</token>`);
    out.push(`${pad}</Properties></Item>`);
  }
  item(tree, 1);
  out.push('</roblox>', '');
  return out.join('\n');
}

const ids = process.argv.slice(2);
for (const def of monsters.filter((m) => !ids.length || ids.includes(m.id))) {
  const tree = toRoblox(def);
  fs.writeFileSync(path.join(outDir, `${def.id}.luau`), toLuau(def, tree));
  fs.writeFileSync(path.join(outDir, `${def.id}.rbxmx`), toRbxmx(tree));
  console.log(`${def.id.padEnd(22)} ${String(countParts(tree)).padStart(4)} parts`);
}
