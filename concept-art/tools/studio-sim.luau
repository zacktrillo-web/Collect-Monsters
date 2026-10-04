-- Simulated Roblox Studio for testing the generated build + animation scripts with the Luau CLI.
-- Real CFrame math (rotation matrix + position), a small instance tree, and a fake clock.
-- Used by tools/test-roblox-sim.mjs.

------------------------------------------------------------------ CFrame
local CF = {}
CF.__index = CF

local function mk(x, y, z, r)
	return setmetatable({ x = x, y = y, z = z, r = r }, CF)
end

local function quatToMat(qx, qy, qz, qw)
	local n = math.sqrt(qx * qx + qy * qy + qz * qz + qw * qw)
	qx, qy, qz, qw = qx / n, qy / n, qz / n, qw / n
	return {
		1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy - qz * qw), 2 * (qx * qz + qy * qw),
		2 * (qx * qy + qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz - qx * qw),
		2 * (qx * qz - qy * qw), 2 * (qy * qz + qx * qw), 1 - 2 * (qx * qx + qy * qy),
	}
end

local function matToQuat(m)
	local tr = m[1] + m[5] + m[9]
	local qx, qy, qz, qw
	if tr > 0 then
		local s = math.sqrt(tr + 1) * 2
		qw = 0.25 * s
		qx = (m[8] - m[6]) / s
		qy = (m[3] - m[7]) / s
		qz = (m[4] - m[2]) / s
	elseif m[1] > m[5] and m[1] > m[9] then
		local s = math.sqrt(1 + m[1] - m[5] - m[9]) * 2
		qw = (m[8] - m[6]) / s
		qx = 0.25 * s
		qy = (m[2] + m[4]) / s
		qz = (m[3] + m[7]) / s
	elseif m[5] > m[9] then
		local s = math.sqrt(1 + m[5] - m[1] - m[9]) * 2
		qw = (m[3] - m[7]) / s
		qx = (m[2] + m[4]) / s
		qy = 0.25 * s
		qz = (m[6] + m[8]) / s
	else
		local s = math.sqrt(1 + m[9] - m[1] - m[5]) * 2
		qw = (m[4] - m[2]) / s
		qx = (m[3] + m[7]) / s
		qy = (m[6] + m[8]) / s
		qz = 0.25 * s
	end
	return qx, qy, qz, qw
end

CFrame = {
	new = function(...)
		local n = select("#", ...)
		local a = { ... }
		for i = 1, n do
			assert(type(a[i]) == "number", "CFrame.new argument " .. i .. " is not a number")
		end
		if n == 0 then
			return mk(0, 0, 0, { 1, 0, 0, 0, 1, 0, 0, 0, 1 })
		elseif n == 3 then
			return mk(a[1], a[2], a[3], { 1, 0, 0, 0, 1, 0, 0, 0, 1 })
		elseif n == 7 then
			return mk(a[1], a[2], a[3], quatToMat(a[4], a[5], a[6], a[7]))
		elseif n == 12 then
			return mk(a[1], a[2], a[3], { a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12] })
		end
		error("CFrame.new with " .. n .. " arguments")
	end,
	Angles = function(rx, ry, rz)
		local function rot(axis, t)
			local c, s = math.cos(t), math.sin(t)
			if axis == "x" then
				return { 1, 0, 0, 0, c, -s, 0, s, c }
			elseif axis == "y" then
				return { c, 0, s, 0, 1, 0, -s, 0, c }
			end
			return { c, -s, 0, s, c, 0, 0, 0, 1 }
		end
		local A = mk(0, 0, 0, rot("x", rx))
		return A * mk(0, 0, 0, rot("y", ry)) * mk(0, 0, 0, rot("z", rz))
	end,
}

CF.__mul = function(a, b)
	assert(getmetatable(b) == CF, "CFrame * non-CFrame")
	local A, B = a.r, b.r
	local r = {}
	for i = 0, 2 do
		for j = 0, 2 do
			r[i * 3 + j + 1] = A[i * 3 + 1] * B[j + 1] + A[i * 3 + 2] * B[j + 4] + A[i * 3 + 3] * B[j + 7]
		end
	end
	return mk(
		A[1] * b.x + A[2] * b.y + A[3] * b.z + a.x,
		A[4] * b.x + A[5] * b.y + A[6] * b.z + a.y,
		A[7] * b.x + A[8] * b.y + A[9] * b.z + a.z,
		r
	)
end

function CF:Inverse()
	local R = self.r
	local t = { R[1], R[4], R[7], R[2], R[5], R[8], R[3], R[6], R[9] }
	return mk(
		-(t[1] * self.x + t[2] * self.y + t[3] * self.z),
		-(t[4] * self.x + t[5] * self.y + t[6] * self.z),
		-(t[7] * self.x + t[8] * self.y + t[9] * self.z),
		t
	)
end

function CF:ToObjectSpace(other)
	return self:Inverse() * other
end

function CF:Lerp(other, a)
	local ax, ay, az, aw = matToQuat(self.r)
	local bx, by, bz, bw = matToQuat(other.r)
	local d = ax * bx + ay * by + az * bz + aw * bw
	if d < 0 then
		bx, by, bz, bw, d = -bx, -by, -bz, -bw, -d
	end
	local s0, s1
	if d > 0.9995 then
		s0, s1 = 1 - a, a
	else
		local th = math.acos(d)
		s0, s1 = math.sin((1 - a) * th) / math.sin(th), math.sin(a * th) / math.sin(th)
	end
	return mk(
		self.x + (other.x - self.x) * a,
		self.y + (other.y - self.y) * a,
		self.z + (other.z - self.z) * a,
		quatToMat(ax * s0 + bx * s1, ay * s0 + by * s1, az * s0 + bz * s1, aw * s0 + bw * s1)
	)
end

------------------------------------------------------------------ values & enums
Vector3 = { new = function(x, y, z)
	assert(x > 0 and y > 0 and z > 0, "non-positive part size")
	return { x, y, z }
end }
Color3 = { fromHex = function(h)
	assert(string.match(h, "^#%x%x%x%x%x%x$"), "bad hex " .. h)
	return h
end }
local function enum(names)
	return setmetatable({}, { __index = function(_, k)
		assert(names[k], "unknown enum item " .. tostring(k))
		return k
	end })
end
Enum = {
	Material = enum({ Neon = true, SmoothPlastic = true }),
	PartType = enum({ Ball = true, Block = true, Cylinder = true }),
	SurfaceType = enum({ Smooth = true }),
	RunContext = enum({ Client = true }),
	ModelStreamingMode = enum({ Atomic = true }),
	BulkMoveMode = enum({ FireCFrameChanged = true }),
}

------------------------------------------------------------------ instances
local Inst = {}
local classes = { Model = true, Part = true, WedgePart = true, Script = true, ModuleScript = true, Folder = true }
local allowed = {
	Name = true, Anchored = true, Size = true, CFrame = true, Color = true, Material = true, Shape = true,
	TopSurface = true, BottomSurface = true, WorldPivot = true, ModelStreamingMode = true, RunContext = true, Source = true,
}
__allParts = {}

local function newInstance(class)
	assert(classes[class], "unexpected class " .. class)
	local self = { ClassName = class, Name = class, _children = {}, _props = {} }
	return setmetatable(self, {
		__index = function(t, k)
			if k == "Parent" then
				return rawget(t, "_parent")
			end
			if Inst[k] then
				return Inst[k]
			end
			return t._props[k]
		end,
		__newindex = function(t, k, v)
			if k == "Parent" then
				local old = rawget(t, "_parent")
				if old then
					for i, c in old._children do
						if c == t then
							table.remove(old._children, i)
							break
						end
					end
				end
				rawset(t, "_parent", v)
				if v then
					table.insert(v._children, t)
				end
				return
			end
			assert(allowed[k], "unexpected property " .. k .. " on " .. class)
			if k == "Shape" then
				assert(class == "Part", "Shape on " .. class)
			end
			if k == "RunContext" then
				assert(class == "Script", "RunContext on " .. class)
			end
			t._props[k] = v
		end,
	})
end

function Inst:GetChildren()
	return table.clone(self._children)
end
function Inst:GetDescendants()
	local out = {}
	local function walk(n)
		for _, c in n._children do
			table.insert(out, c)
			walk(c)
		end
	end
	walk(self)
	return out
end
function Inst:IsA(class)
	if class == "BasePart" then
		return self.ClassName == "Part" or self.ClassName == "WedgePart"
	end
	return self.ClassName == class
end
function Inst:FindFirstChild(name, recursive)
	for _, c in (if recursive then self:GetDescendants() else self._children) do
		if c.Name == name then
			return c
		end
	end
	return nil
end
function Inst:WaitForChild(name)
	return assert(self:FindFirstChild(name), "WaitForChild timed out: " .. name)
end
function Inst:Destroy()
	self.Parent = nil
end
function Inst:GetPivot()
	assert(self.ClassName == "Model")
	return self._props.WorldPivot
end

Instance = { new = function(class)
	local i = newInstance(class)
	if class == "Part" or class == "WedgePart" then
		table.insert(__allParts, i)
	end
	return i
end }

workspace = newInstance("Folder")
workspace.Name = "Workspace"
rawset(workspace, "BulkMoveTo", function(_, parts, frames)
	for k, p in parts do
		p._props.CFrame = frames[k]
	end
end)

local heartbeat = {}
local services = {
	RunService = { Heartbeat = { Connect = function(_, fn)
		table.insert(heartbeat, fn)
	end } },
	Selection = { Set = function() end },
}
game = { GetService = function(_, name)
	return assert(services[name], "unexpected service " .. name)
end }

__clockValue = 0
__clock = function()
	return __clockValue
end
__heartbeat = heartbeat

function require(module)
	local fn = assert(loadstring(module.Source))
	return fn()
end
