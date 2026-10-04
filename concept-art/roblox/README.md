# Roblox models

Each secret monster as a ready-to-use Roblox model, converted part-for-part from its concept blockout.
Every monster comes in two forms. Use whichever is easier:

| File | How to use it |
|---|---|
| `<id>.rbxmx` | In Studio's Explorer, right-click **Workspace → Insert from File…** and pick the file. |
| `<id>.luau` | A script that builds the model. Run it in the Command Bar, or ask Claude (connected to Studio) to run it. |

The script version places the monster 30 studs in front of the world origin, facing the spawn point.

## What's inside a model

- Anchored parts only: `Part` (blocks, balls, cylinders) and `WedgePart`. No meshes, no uploads needed.
- Glowing pieces use **Neon**; everything else is **SmoothPlastic**. Parts are named after their palette color
  (for example "Seam fire" or "Broken crown"), so they're easy to select and recolor.
- Moving pieces sit in nested Models (joints) with their pivot on the hinge, so rotating a joint in Studio
  swings it like the signature move. Crown of Cinders has named joints (Jaw, Crown, FistLeft, ...);
  the others use generic "Joint" names for now.
- Shapes Roblox has no part for are rebuilt from parts: spikes are two leaning wedges, rings are loops of
  small blocks, tapered blocks are three stacked steps, and flat shapes (crests, masks, fins) are wedge triangles.

## Regenerating

```bash
node tools/export-roblox.mjs            # all monsters, or name some: node tools/export-roblox.mjs firstborn
node tools/check-roblox.mjs             # renders each blockout next to its part rebuild in output/roblox-check/
```

The check rebuilds the exported parts using Roblox's part conventions (wedges tall at +Z, cylinders along X)
and renders them beside the original, so conversion mistakes show up before anything goes into Studio.
