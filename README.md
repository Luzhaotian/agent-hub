# Agent Hub

[中文](./README.zh-CN.md)

A universal agent plugin system built on a Skills-based architecture with persistent roles, memory, and knowledge management. Plugs into any editor or AI agent that supports the Skills format (Cursor, Claude Code, etc.).

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

Supports `~` path expansion — `~` is automatically resolved to your home directory on all platforms.

### 2. Use

Point your editor to the installation directory. The `SKILLS.md` file is the main entry point. Then submit tasks:

```
Your request
  → orchestrator analyzes
  → matches existing role? → delegates
  → no match? → creates new role + installs skills → executes
  → logs task + updates memory
```

Edit `knowledgebase/personal.md` to teach the system about your tech stack and preferences.

### 3. Upgrade

```bash
npx agent-hub upgrade ~/.agent-hub
# or: node cli.js upgrade ~/.agent-hub
```

Only core files are updated. Your roles, skills, memory, knowledge base, and logs are **never touched**.

## Commands

| Command | Description |
|---------|-------------|
| `agent-hub install <path>` | Install to a local directory |
| `agent-hub upgrade [path]` | Upgrade core files (preserves user data) |
| `agent-hub list [path]` | Show installed core and user files |
| `agent-hub setup-cursor [path]` | Generate Cursor rules in current project |
| `agent-hub help` | Show help |

## Integration

### Cursor

Run in your project root:

```bash
npx agent-hub setup-cursor
# or: node cli.js setup-cursor
```

This generates `.cursor/rules/agent-hub.md` pointing to your installation.

### Claude Code

Reference `SKILLS.md` in your `CLAUDE.md`, or load it directly as a system prompt.

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Roles** | Specialized agents with capabilities, skills, and tags. Created dynamically. |
| **Skills** | Modular Markdown files defining reusable capabilities. |
| **Memory** | Persistent context across sessions — global and per-role. |
| **Knowledge Base** | Personal and domain knowledge referenced during tasks. |
| **Logs** | Structured task logs for audit and memory extraction. |

## Project Structure

```
~/.agent-hub/
├── SKILLS.md           # Main entry point for editors
├── roles/              # Role definitions (orchestrator + user-created)
├── skills/             # Skill prompts (core + user-created)
├── memory/             # Persistent memory files
├── knowledgebase/      # Personal knowledge base
└── logs/               # Task execution logs (auto-generated)
```

## License

MIT
