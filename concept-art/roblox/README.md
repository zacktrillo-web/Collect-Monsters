# Roblox models

Each secret monster as a ready-to-use Roblox model, converted part-for-part from its concept blockout,
with its signature move from the concept gallery built in.

| File | How to use it |
|---|---|
| `install-all.luau` | Installs or updates all 15 at once. Run it in Studio's Command Bar, or ask Claude/ChatGPT (connected to Studio) to run it as written. It downloads each `<id>.luau` from GitHub, so it needs **Game Settings → Security → Allow HTTP Requests** (it tries to switch this on itself). |
| `<id>.luau` | Builds one monster. A model with the same name already in Workspace is replaced in the same spot and folder; otherwise the monster goes in a row in front of the spawn. |
| `<id>.rbxmx` | The same model as a file. In Studio's Explorer, right-click **Workspace → Insert from File…**, or drag the file into Studio. |

Press **Play** to see the signature moves. They don't run while editing.

## What's inside a model

- Anchored parts only: `Part` (blocks, balls, cylinders) and `WedgePart`. No meshes, no uploads needed.
- Glowing pieces use **Neon**; everything else is **SmoothPlastic**. Parts are named after their palette color
  (for example "Seam fire" or "Broken crown"), so they're easy to select and recolor.
- Moving pieces sit in nested Models (joints) with their pivot on the hinge. Joint names are unique within
  each monster. Crown of Cinders' are descriptive (Jaw, Crown, FistLeft, ...); the others are Joint, Joint2, ...
- Shapes Roblox has no part for are rebuilt from parts: spikes are two leaning wedges, rings are loops of
  small blocks, tapered blocks are three stacked steps, and flat shapes (crests, masks, fins) are wedge triangles.

## The signature move

- `SignatureMove` is a Script with RunContext **Client** inside each monster. Every player animates their own
  copy, which keeps it smooth; the server copy stays in its resting pose.
- Its child ModuleScript `Keyframes` holds the move, baked from the blockout's animation: each joint's
  transform relative to its parent joint, sampled 240 times per 3.6-second loop and thinned to the keys
  needed to stay within 0.01 studs. Keys are never more than a quarter turn apart, so spins can't reverse.
- The script moves all parts with `workspace:BulkMoveTo` once per frame.
- The source is in `../roblox-runtime/SignatureMove.luau`.
- The monster model streams as one piece (ModelStreamingMode Atomic), so the script always finds all its parts.

## Regenerating and checking

```bash
node tools/export-roblox.mjs             # all monsters, or name some: node tools/export-roblox.mjs firstborn
node tools/check-roblox.mjs              # renders each blockout next to its part rebuild in output/roblox-check/
node tools/check-animation.mjs           # baked keyframes vs. the blockout motion, worst error in studs
LUAU=path/to/luau node tools/test-roblox-sim.mjs   # runs the real build + animation scripts in a simulated Studio
```

The simulated Studio (`tools/studio-sim.luau`) runs each build script and its SignatureMove with real CFrame
math. The test then compares every part's position at several moments of the loop with the blockout. These
checks can't cover Studio itself: the exact look of Roblox's lighting and materials, and the property names
inside `.rbxmx` files.
