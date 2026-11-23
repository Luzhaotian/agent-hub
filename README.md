# Agent Hub

[中文](./README.zh-CN.md)

A universal agent plugin system for Claude Code (and Cursor). Built on a **skill + role** architecture with persistent memory, task logging, and skill discovery. Install once under `~/.agent-hub`, works globally.

## How It Works

```
User runs /orchestrator
  → resolve data root (~/.agent-hub via config.json)
  → match an existing role? → load role skills → execute as that role
  → no match? → create-role + find-skill → register → execute
  → write task log + update persistent memory (under data root)
```

**Core loop**: orchestrator is the entry point. It reads roles under the **data root** (not the project cwd), matches the best worker role, and **executes as that role** by loading its skills. If nothing fits, it creates a role, discovers missing skills via `find-skill`, registers them, then continues.

## Quick Start

### 1. Install

```bash
git clone https://github.com/Luzhaotian/agent-hub.git
cd agent-hub && node cli.js install ~/.agent-hub
```

This copies templates to `~/.agent-hub/`, writes `config.json` with the absolute `data_root`, and registers skills under `~/.claude/skills/` (symlink, with copy fallback on Windows).

### 2. Verify

Restart Claude Code, then type `/orchestrator`:

- **Without a task** → `您好，我是通用智能体 orchestrator，请问有什么能帮你的`
- **With a task** → `orchestrator 开始执行任务`

### 3. Use

```
/orchestrator 帮我写一个 React 组件
/orchestrator review this code for security issues
/orchestrator set up a new Express API
```

### 4. Upgrade / register

```bash
node cli.js upgrade ~/.agent-hub   # update core files + re-register skills
node cli.js register ~/.agent-hub  # re-register only (custom skills too)
```

Upgrade updates changed core files, **adds new template files**, and always re-registers skills. Custom roles, memory, knowledge base, and logs are not overwritten.

## Commands

| Command | Description |
|---------|-------------|
| `agent-hub install <path> [--force]` | Install and register skills globally |
| `agent-hub upgrade [path]` | Upgrade core files + re-register skills |
| `agent-hub register [path]` | Re-register skills (including custom ones) |
| `agent-hub list [path]` | Show installed core and user files |
| `agent-hub setup [path]` | Generate `.cursor/rules/` in current project |
| `agent-hub help` | Show help |

## Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| `/orchestrator` | Any task request | Entry point — route, match/create roles, execute, memory |
| `/match-role` | Before delegation | Find the best existing role |
| `/create-role` | When no role matches | Define role YAML + update `roles/index.json` |
| `/find-skill` | Missing skills | Discover/install skills into the data root |
| `/task-logger` | During/after tasks | Audit logs under `<data_root>/logs/` |
| `/memory-manager` | After completion | Persistent memory under `<data_root>/memory/` |

## System Architecture

```
~/.agent-hub/                    # data root (see config.json)
├── config.json                  # absolute data_root + version
├── .cursor-plugin/plugin.json
├── skills/                      # skill definitions (SKILL.md)
│   ├── orchestrator/
│   ├── match-role/
│   ├── create-role/
│   ├── find-skill/
│   ├── task-logger/
│   └── memory-manager/
├── roles/                       # YAML roles + index.json
├── memory/                      # persistent memory
├── knowledgebase/               # personal knowledge
├── logs/                        # task logs
└── mcp/                         # MCP notes (no auto-install)
```

Skills register globally: `~/.claude/skills/<name>` → `~/.agent-hub/skills/<name>`.

**Important:** Agent Hub state always uses `<data_root>`. Project code edits stay in the project cwd.

## Cursor

```bash
node cli.js setup ~/.agent-hub
```

Generates `.cursor/rules/*.mdc` (including `agent-hub-root.mdc` pointing at the data root). Restart Cursor, then use `@rules/orchestrator`.

## Extensibility

```bash
mkdir -p ~/.agent-hub/skills/my-skill
# Write SKILL.md, then:
node cli.js register ~/.agent-hub
```

Use `register` (or `upgrade`) so new skills get linked into `~/.claude/skills/`.

## MCP

Roles may list `mcp_servers`, but Agent Hub does not install MCP servers. Configure them in your editor, then reference the names in role YAML. See `mcp/README.md` in the data root.

## License

MIT
