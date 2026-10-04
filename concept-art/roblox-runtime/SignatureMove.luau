-- SignatureMove: plays this monster's signature move on a loop.
-- The keyframes (child ModuleScript) are baked from the concept blockout by
-- concept-art/tools/export-roblox.mjs, so the motion matches the concept gallery.
-- RunContext is Client: every player animates their own copy, which keeps the motion smooth.
-- The server copy stays in its resting pose.
local RunService = game:GetService("RunService")

local model = script.Parent
local data = require(script:WaitForChild("Keyframes"))
local STEPS = data.steps

-- Joint models by name (names are unique within a monster).
local byName = {}
for _, d in model:GetDescendants() do
	if d:IsA("Model") then
		byName[d.Name] = d
	end
end

-- Each joint's resting transform relative to its parent joint (0 is this model).
local rest = {}
local joints = {}
for i, j in data.joints do
	local r = j.rest
	rest[i] = CFrame.new(r[1], r[2], r[3], r[4], r[5], r[6], r[7])
	joints[i] = byName[j.name]
	if not joints[i] then
		warn(`{model.Name}: SignatureMove can't find the joint "{j.name}", so the animation is off.`)
		return
	end
end

-- Where every joint sits at rest, and where each part sits relative to the joint that carries it.
local world = { [0] = model:GetPivot() }
for i, j in data.joints do
	world[i] = world[j.parent] * rest[i]
end
local parts, owner, offset = {}, {}, {}
for i, joint in joints do
	for _, child in joint:GetChildren() do
		if child:IsA("BasePart") then
			table.insert(parts, child)
			table.insert(owner, i)
			table.insert(offset, world[i]:ToObjectSpace(child.CFrame))
		end
	end
end

-- Keyframe m of joint j. Rotation-only tracks (stride 4) keep the joint's resting position.
local function key(j, m)
	local t, b = j.track, (m - 1) * j.stride
	if j.stride == 4 then
		return CFrame.new(j.rest[1], j.rest[2], j.rest[3], t[b + 1], t[b + 2], t[b + 3], t[b + 4])
	end
	return CFrame.new(t[b + 1], t[b + 2], t[b + 3], t[b + 4], t[b + 5], t[b + 6], t[b + 7])
end

-- Blend between the keys around step f. The cursor remembers the last key per joint,
-- so finding the next one is usually a single step.
local cursor = {}
local function pose(i, j, f)
	local times = j.times
	local n = #times
	local c = cursor[i] or 1
	if times[c] > f then
		c = 1
	end
	while c < n and times[c + 1] <= f do
		c += 1
	end
	cursor[i] = c
	local after = if c < n then times[c + 1] else STEPS
	local a = (f - times[c]) / (after - times[c])
	return key(j, c):Lerp(key(j, if c < n then c + 1 else 1), a)
end

local frames = table.create(#parts)
local start = os.clock()
RunService.Heartbeat:Connect(function()
	local f = ((os.clock() - start) / data.period % 1) * STEPS
	for i, j in data.joints do
		world[i] = world[j.parent] * (if j.times then pose(i, j, f) else rest[i])
	end
	for k, part in parts do
		frames[k] = world[owner[k]] * offset[k]
	end
	workspace:BulkMoveTo(parts, frames, Enum.BulkMoveMode.FireCFrameChanged)
end)
