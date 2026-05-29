# Agent Hub

[中文](./README.zh-CN.md)

A universal agent plugin system built on a Skills-based architecture with persistent roles, memory, and knowledge management. Works globally like built-in skills — no per-project setup needed.

## Quick Start

### 1. Install

```bash
# From npm (after publishing)
npx agent-hub install ~/.agent-hub               # macOS / Linux
npx agent-hub install %USERPROFILE%\.agent-hub   # Windows

# Or clone and run locally
git clone https://github.com/Luzhaotian/agent-hub.git
cd agent-hub && node cli.js install ~/.agent-hub
```

This installs skills and registers them globally in `~/.claude/skills/`.

### 2. Use

Restart your editor, then type `/orchestrator` in chat:

```
Your request
  → orchestrator analyzes
  → matches existing role? → delegates
  → no match? → creates new role + installs skills → executes
  → logs task + updates memory
```

Edit `~/.agent-hub/knowledgebase/personal.md` to teach the system about your tech stack and preferences.

### 3. Upgrade

```bash
npx agent-hub upgrade ~/.agent-hub
```

Only core files are updated. Your roles, skills, memory, knowledge base, and logs are **never touched**.

## Commands

| Command | Description |
|---------|-------------|
| `agent-hub install <path>` | Install and register skills globally |
| `agent-hub setup [path]` | Generate `.cursor/rules/` in current project (for Cursor) |
| `agent-hub upgrade [path]` | Upgrade core files (preserves user data) |
| `agent-hub list [path]` | Show installed core and user files |
| `agent-hub help` | Show help |

## Available Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| `/orchestrator` | Any task request | Routes tasks, matches/creates roles, manages memory |
| `/create-role` | Need new role | Define and register new roles dynamically |
| `/match-role` | Before task delegation | Find the best existing role for a request |
| `/task-logger` | During task execution | Log tasks for audit and memory extraction |
| `/memory-manager` | After task completion | Maintain persistent memory across sessions |

## Project Structure

```
~/.agent-hub/
├── .cursor-plugin/plugin.json  # Plugin config
├── skills/
│   ├── orchestrator/SKILL.md   # /orchestrator
│   ├── create-role/SKILL.md    # /create-role
│   ├── match-role/SKILL.md     # /match-role
│   ├── task-logger/SKILL.md    # /task-logger
│   └── memory-manager/SKILL.md # /memory-manager
├── roles/                      # Role definitions (YAML)
├── memory/                     # Persistent memory
├── knowledgebase/              # Personal knowledge base
└── logs/                       # Task execution logs (auto-generated)
```

## Extensibility

Add custom skills by creating a new folder in `skills/`:

```
~/.agent-hub/skills/my-skill/SKILL.md
```

Then re-run `agent-hub install --force ~/.agent-hub` to register the new skill.

## License

MIT
