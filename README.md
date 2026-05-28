# Agent Hub

[中文](./README.zh-CN.md)

A universal agent plugin system built on a Skills-based architecture with persistent roles, memory, and knowledge management. Plugs into any editor or AI agent that supports the Skills format (Cursor, Claude Code, etc.).

## Quick Start

### 1. Install

```bash
npx agent-hub install ~/.agent-hub
```

This copies all core files (roles, skills, memory templates, knowledge base templates) to your local directory.

### 2. Personalize

Edit `~/.agent-hub/knowledgebase/personal.md` with your tech stack, coding habits, and preferences.

### 3. Use

Load `skills/orchestrator.md` in your AI agent. Then submit tasks — the orchestrator will automatically match or create roles, execute, log results, and update memory.

```
Your request
  → orchestrator analyzes
  → matches existing role? → delegates
  → no match? → creates new role + installs skills → executes
  → logs task + updates memory
```

### 4. Upgrade

```bash
npx agent-hub upgrade ~/.agent-hub
```

Only core template files are updated. Your custom roles, skills, memory, knowledge base, and logs are **never touched**.

## Commands

| Command | Description |
|---------|-------------|
| `agent-hub install <path>` | Install to a local directory |
| `agent-hub upgrade [path]` | Upgrade core files (preserves user data) |
| `agent-hub list [path]` | Show installed core and user files |
| `agent-hub help` | Show help |

## Integration

### Cursor

Point `.cursor/rules` or project settings to your installation directory's `skills/` folder. Cursor will load skill prompts automatically.

### Claude Code

Reference skill files in your `CLAUDE.md`, or load `skills/orchestrator.md` directly as a system prompt.

## Core Concepts

| Concept | What It Is |
|---------|-----------|
| **Roles** | Specialized agents with defined capabilities, skills, and tags. Created dynamically based on user needs. |
| **Skills** | Modular Markdown files that define reusable capabilities. Discovered via `find-skill` and installed permanently. |
| **Memory** | Persistent context across sessions — global (`memory/system.md`) and per-role (`memory/<role>.md`). |
| **Knowledge Base** | Personal and domain knowledge files (`knowledgebase/`) referenced during task execution. |
| **Logs** | Structured task logs in `logs/` for audit trails and memory extraction. |

## Project Structure

After installation, your local directory looks like this:

```
~/.agent-hub/
├── .core-manifest.json     # Tracks core files for upgrades
├── roles/
│   ├── index.json          # Role registry
│   └── orchestrator.yaml   # Master coordinator role
├── skills/
│   ├── orchestrator.md     # Task routing and coordination
│   ├── create-role.md      # Dynamic role creation
│   ├── match-role.md       # Role matching logic
│   ├── task-logger.md      # Task logging and audit
│   └── memory-manager.md   # Persistent memory management
├── memory/
│   └── system.md           # Global system memory
├── knowledgebase/
│   └── personal.md         # Personal preferences and knowledge
└── logs/                   # Task execution logs (auto-generated)
```

## License

MIT
