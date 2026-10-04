// Exports each monster blockout as Roblox files, with its signature move baked in:
//   roblox/<id>.luau       - builds (or replaces) the animated model in Studio
//   roblox/<id>.rbxmx      - the same model as a file, for Insert from File
//   roblox/install-all.luau - fetches and runs every <id>.luau from GitHub in one go
// Usage: node tools/export-roblox.mjs [monster-id ...]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { monsters } from '../src/monsters/index.js';
import { toRoblox, countParts } from '../src/roblox.js';
import { bakeAnimation } from '../src/roblox-anim.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'roblox');
fs.mkdirSync(outDir, { recursive: true });

const num = (n) => String(Number((Math.abs(n) < 5e-5 ? 0 : n).toFixed(4)));
const list = (a) => a.map(num).join(', ');

const RAW = 'https://raw.githubusercontent.com/zacktrillo-web/Collect-Monsters/claude/sweet-thompson-3op8oy/concept-art/roblox/';
const ANIMATOR = fs.readFileSync(path.join(root, 'roblox-runtime', 'SignatureMove.luau'), 'utf8');

// Wraps text in a Luau long string whose brackets can't clash with the text.
function longString(text) {
  let eq = '=';
  while (text.includes(`]${eq}]`)) eq += '=';
  return `[${eq}[\n${text}]${eq}]`;
}

function keyframesSource(def, anim) {
  const lines = [
    `-- Keyframes for ${def.name}'s signature move, baked from the concept blockout.`,
    `-- times: key times in steps of 1/${anim.steps} of a loop. track: position + rotation per key`,
    '-- (stride 7) or rotation only (stride 4). Rotations are quaternions (x, y, z, w).',
    'return {',
    `\tperiod = ${anim.period},`,
    `\tsteps = ${anim.steps},`,
    '\tjoints = {',
  ];
  for (const j of anim.joints) {
    const parts = [`name = ${JSON.stringify(j.name)}`, `parent = ${j.parent}`, `rest = { ${list(j.rest)} }`];
    if (j.times) parts.push(`times = { ${j.times.join(', ')} }`, `stride = ${j.stride}`, `track = { ${list(j.track)} }`);
    lines.push(`\t\t{ ${parts.join(', ')} },`);
  }
  lines.push('\t},', '}', '');
  return lines.join('\n');
}

function toLuau(def, tree, anim, slot) {
  const lines = [
    `-- Collect Monsters: ${def.name} (Secret), with its signature move.`,
    '-- Generated from the concept blockout by concept-art/tools/export-roblox.mjs.',
    '-- Run in Roblox Studio (Command Bar, or ask Claude/ChatGPT in Studio to run it as written).',
    `-- If a model named ${tree.name} is already in Workspace, it is replaced in the same spot.`,
    '-- Otherwise the monster is placed in a row in front of the spawn. Press Play to see it move.',
    '',
    `local existing = workspace:FindFirstChild(${JSON.stringify(tree.name)}, true)`,
    'local destination = if existing then existing.Parent else workspace',
    `local ORIGIN = if existing then existing:GetPivot() else CFrame.new(${slot}, 0, -30) * CFrame.Angles(0, math.pi, 0)`,
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
  lines.push(
    '-- Signature move: a client-side script that plays the baked keyframes on a loop',
    'M[1].ModelStreamingMode = Enum.ModelStreamingMode.Atomic',
    'local animator = Instance.new("Script")',
    'animator.Name = "SignatureMove"',
    'animator.RunContext = Enum.RunContext.Client',
    `animator.Source = ${longString(ANIMATOR)}`,
    'local keyframes = Instance.new("ModuleScript")',
    'keyframes.Name = "Keyframes"',
    `keyframes.Source = ${longString(keyframesSource(def, anim))}`,
    'keyframes.Parent = animator',
    'animator.Parent = M[1]',
    '',
    'if existing then',
    '\texisting:Destroy()',
    'end',
    'M[1].Parent = destination',
    'pcall(function()',
    '\tgame:GetService("Selection"):Set({ M[1] })',
    'end)',
    `print("Built ${def.name}: ${countParts(tree)} parts, signature move included")`,
    'return M[1]',
    '',
  );
  return lines.join('\n');
}

function installAll(defs) {
  return [
    '-- Collect Monsters: installs or updates all secret monsters, each with its signature move.',
    '-- Run it in Roblox Studio\'s Command Bar, or ask Claude/ChatGPT (connected to Studio) to run it as written.',
    '-- It downloads each monster\'s build script from GitHub and runs it. A monster that is already in',
    '-- Workspace is replaced in the same spot. Needs Home > Game Settings > Security > Allow HTTP Requests.',
    'local HttpService = game:GetService("HttpService")',
    `local BASE = "${RAW}"`,
    'local MONSTERS = {',
    ...defs.map((d) => `\t"${d.id}",`),
    '}',
    '',
    'pcall(function()',
    '\tHttpService.HttpEnabled = true',
    'end)',
    '',
    'for _, id in MONSTERS do',
    '\tlocal ok, err = pcall(function()',
    '\t\t-- The query string skips GitHub\'s few-minute cache, so a fresh push is picked up right away.',
    '\t\tlocal source = HttpService:GetAsync(BASE .. id .. ".luau?v=" .. os.time(), true)',
    '\t\tlocal build = loadstring and loadstring(source)',
    '\t\tif build then',
    '\t\t\tbuild()',
    '\t\t\treturn',
    '\t\tend',
    '\t\t-- loadstring is off here, so run the build script as a temporary ModuleScript instead.',
    '\t\tlocal module = Instance.new("ModuleScript")',
    '\t\tmodule.Name = "Build_" .. id',
    '\t\tmodule.Source = source',
    '\t\tmodule.Parent = game:GetService("ServerStorage")',
    '\t\tlocal done, result = pcall(require, module)',
    '\t\tmodule:Destroy()',
    '\t\tif not done then',
    '\t\t\terror(result)',
    '\t\tend',
    '\tend)',
    '\tif not ok then',
    '\t\twarn("Could not install " .. id .. ": " .. tostring(err))',
    '\tend',
    'end',
    'print("Done installing secret monsters. Press Play to see their signature moves.")',
    '',
  ].join('\n');
}

const MATERIAL = { SmoothPlastic: 272, Neon: 288 };
const SHAPE = { Ball: 0, Block: 1, Cylinder: 2 };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const KEYS = ['X', 'Y', 'Z', 'R00', 'R01', 'R02', 'R10', 'R11', 'R12', 'R20', 'R21', 'R22'];
const cfXml = (cf) => cf.map((v, i) => `<${KEYS[i]}>${num(v)}</${KEYS[i]}>`).join('');

const cdata = (text) => `<![CDATA[${text.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;

function toRbxmx(def, tree, anim) {
  let ref = 0;
  const out = ['<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">'];
  function item(node, depth) {
    const pad = '  '.repeat(depth);
    if (node.kind === 'model') {
      out.push(`${pad}<Item class="Model" referent="RBX${ref++}"><Properties>`);
      out.push(`${pad}  <string name="Name">${esc(node.name)}</string>`);
      out.push(`${pad}  <OptionalCoordinateFrame name="WorldPivotData"><CFrame>${cfXml(node.pivot)}</CFrame></OptionalCoordinateFrame>`);
      if (node === tree) out.push(`${pad}  <token name="ModelStreamingMode">1</token>`);
      out.push(`${pad}</Properties>`);
      for (const c of node.children) item(c, depth + 1);
      if (node === tree) {
        out.push(`${pad}  <Item class="Script" referent="RBX${ref++}"><Properties>`);
        out.push(`${pad}    <string name="Name">SignatureMove</string>`);
        out.push(`${pad}    <token name="RunContext">2</token>`);
        out.push(`${pad}    <ProtectedString name="Source">${cdata(ANIMATOR)}</ProtectedString>`);
        out.push(`${pad}  </Properties>`);
        out.push(`${pad}    <Item class="ModuleScript" referent="RBX${ref++}"><Properties>`);
        out.push(`${pad}      <string name="Name">Keyframes</string>`);
        out.push(`${pad}      <ProtectedString name="Source">${cdata(keyframesSource(def, anim))}</ProtectedString>`);
        out.push(`${pad}    </Properties></Item>`);
        out.push(`${pad}  </Item>`);
      }
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
monsters.forEach((def, index) => {
  if (ids.length && !ids.includes(def.id)) return;
  const tree = toRoblox(def);
  const anim = bakeAnimation(def, tree);
  const slot = (index - (monsters.length - 1) / 2) * 40;
  fs.writeFileSync(path.join(outDir, `${def.id}.luau`), toLuau(def, tree, anim, slot));
  fs.writeFileSync(path.join(outDir, `${def.id}.rbxmx`), toRbxmx(def, tree, anim));
  const keys = anim.joints.filter((j) => j.times).length;
  console.log(`${def.id.padEnd(22)} ${String(countParts(tree)).padStart(4)} parts  ${String(keys).padStart(3)} animated joints`);
});
fs.writeFileSync(path.join(outDir, 'install-all.luau'), installAll(monsters));
