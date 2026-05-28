# Agent Hub

A universal agent plugin system that can be plugged into any editor or AI agent. Built on a Skills-based architecture with persistent roles, memory, and knowledge management.

## Overview

Agent Hub is a meta-agent framework that acts as an orchestrator — it can create specialized roles, acquire skills dynamically, maintain persistent memory across sessions, and build a knowledge base tailored to you.

### Core Concepts

- **Roles** — Specialized agents with defined capabilities, skills, and tags. Created dynamically based on user needs.
- **Skills** — Modular Markdown files that define reusable capabilities. Can be discovered via `find-skill` and installed permanently.
- **Memory** — Persistent context across sessions, both system-wide and per-role.
- **Knowledge Base** — Personal and domain knowledge files for reference during task execution.
- **Logs** — Structured task logs for audit trails and memory extraction.

## Project Structure

```
agent-hub/
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
├── logs/                   # Task execution logs
└── mcp/                    # MCP server configurations
```

## How It Works

1. **User submits a request** — The orchestrator analyzes the request.
2. **Role matching** — Existing roles are checked against the request (tags, description, skills).
3. **Delegation or creation** — If a match is found, the task is delegated. Otherwise, a new role is created with the required skills.
4. **Skill acquisition** — Missing skills are discovered via `find-skill` and installed permanently.
5. **Logging** — Every task is logged with timestamps, steps taken, and outcomes.
6. **Memory extraction** — Key insights from tasks are extracted into persistent memory for future use.

## Roles

| Role | Description | Tags |
|------|-------------|------|
| `orchestrator` | Master coordinator. Routes tasks, creates roles, manages skills and memory. | `core`, `coordinator`, `meta` |

New roles are created automatically when existing ones cannot fulfill a request.

## Skills

| Skill | Purpose |
|-------|---------|
| `orchestrator` | Task routing, role matching, and system coordination |
| `create-role` | Define and register new roles dynamically |
| `match-role` | Find the best existing role for a given request |
| `task-logger` | Log every task execution for audit and memory extraction |
| `memory-manager` | Maintain persistent memory across sessions |

## Knowledge Base

The `knowledgebase/` directory stores reference material:

- `personal.md` — Your personal preferences, habits, and domain knowledge. Edit this file directly to teach the system about you.

Additional knowledge files can be added as needed for specific domains or projects.

## Memory System

Memory is organized in two layers:

- **`memory/system.md`** — Global memory shared across all roles (project conventions, user preferences, learned patterns).
- **`memory/<role-name>.md`** — Per-role memory for specialized context.

Memory is automatically updated after task completion through insight extraction.

## Usage

This project is designed to be used as a plugin for editors or AI agents that support the Skills format. Point your agent's skill directory to this repository to enable the full role orchestration system.

## License

MIT
