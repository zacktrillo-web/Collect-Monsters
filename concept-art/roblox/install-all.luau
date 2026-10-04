-- Collect Monsters: installs or updates all secret monsters, each with its signature move.
-- Run it in Roblox Studio's Command Bar, or ask Claude/ChatGPT (connected to Studio) to run it as written.
-- It downloads each monster's build script from GitHub and runs it. A monster that is already in
-- Workspace is replaced in the same spot. Needs Home > Game Settings > Security > Allow HTTP Requests.
local HttpService = game:GetService("HttpService")
local BASE = "https://raw.githubusercontent.com/zacktrillo-web/Collect-Monsters/claude/sweet-thompson-3op8oy/concept-art/roblox/"
local MONSTERS = {
	"crown-of-cinders",
	"verdant-warden",
	"king-beneath-the-ice",
	"oceans-hunger",
	"king-of-the-deep",
	"universe-unbound",
	"crown-of-worlds",
	"reality-breaker",
	"the-missing-one",
	"end-of-code",
	"firstborn",
	"the-unforgotten",
	"eternal-verdict",
	"throne-of-beasts",
	"last-monument",
}

pcall(function()
	HttpService.HttpEnabled = true
end)

for _, id in MONSTERS do
	local ok, err = pcall(function()
		-- The query string skips GitHub's few-minute cache, so a fresh push is picked up right away.
		local source = HttpService:GetAsync(BASE .. id .. ".luau?v=" .. os.time(), true)
		local build = loadstring and loadstring(source)
		if build then
			build()
			return
		end
		-- loadstring is off here, so run the build script as a temporary ModuleScript instead.
		local module = Instance.new("ModuleScript")
		module.Name = "Build_" .. id
		module.Source = source
		module.Parent = game:GetService("ServerStorage")
		local done, result = pcall(require, module)
		module:Destroy()
		if not done then
			error(result)
		end
	end)
	if not ok then
		warn("Could not install " .. id .. ": " .. tostring(err))
	end
end
print("Done installing secret monsters. Press Play to see their signature moves.")
