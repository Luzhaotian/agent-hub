# Agent Hub

[中文](./README.zh-CN.md)

A universal agent plugin system for Claude Code. Built on a **skill + role** architecture with persistent memory, task logging, and automatic skill discovery. Install once, works globally — no per-project setup needed.

## How It Works

```
用户输入 /orchestrator
  → orchestrator 分析请求
  → 匹配已有角色？ → 委派执行
  → 没有匹配？ → 创建新角色 + 发现并安装技能 → 执行
  → 记录任务日志 + 更新持久化记忆
```

**Core loop**: orchestrator is the entry point. It reads your existing roles, matches the best one, and delegates. If nothing fits, it creates a new role on the fly — defining its skills, discovering them via `find-skill`, and registering everything automatically.

## Quick Start

### 1. Install

```bash
# Clone and install
git clone https://github.com/Luzhaotian/agent-hub.git
cd agent-hub && node cli.js install ~/.agent-hub
```

This copies all skills to `~/.agent-hub/` and registers them globally via symlinks in `~/.claude/skills/`.

### 2. Verify

Restart Claude Code, then type `/orchestrator`:

- **Without a task**: you should see → `您好，我是通用智能体 orchestrator，请问有什么能帮你的`
- **With a task**: you should see → `orchestrator 开始执行任务`

If these messages appear, the system is working correctly.

### 3. Use

Just describe what you need after `/orchestrator`:

```
/orchestrator 帮我写一个 React 组件
/orchestrator review this code for security issues
/orchestrator set up a new Express API
```

The orchestrator will route to the appropriate role or create one if needed.

### 4. Upgrade

```bash
node cli.js upgrade ~/.agent-hub
```

Only core files (skills, roles, plugin config) are updated. Your custom roles, memory, knowledge base, and logs are **never touched**.

## Commands

| Command | Description |
|---------|-------------|
| `agent-hub install <path> [--force]` | Install and register skills globally |
| `agent-hub upgrade [path]` | Upgrade core files (preserves user data) |
| `agent-hub list [path]` | Show installed core and user files |
| `agent-hub setup [path]` | Generate `.cursor/rules/` in current project (Cursor only) |
| `agent-hub help` | Show help |

## Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| `/orchestrator` | Any task request | Entry point — routes tasks, matches/creates roles, manages memory |
| `/create-role` | When no role matches | Define and register new roles dynamically |
| `/match-role` | Before delegation | Find the best existing role for a request |
| `/task-logger` | During execution | Log tasks for audit trail and memory extraction |
| `/memory-manager` | After completion | Maintain persistent memory across sessions |

## System Architecture

```
~/.agent-hub/
├── .cursor-plugin/
│   └── plugin.json              # Cursor plugin manifest
├── skills/                      # Skill definitions
│   ├── orchestrator/SKILL.md    # Master coordinator
│   ├── create-role/SKILL.md     # Role factory
│   ├── match-role/SKILL.md      # Role matcher
│   ├── task-logger/SKILL.md     # Execution logger
│   └── memory-manager/SKILL.md  # Memory manager
├── roles/                       # Role definitions (YAML)
│   └── orchestrator.yaml        # Built-in orchestrator role
├── memory/                      # Persistent memory (auto-maintained)
├── knowledgebase/               # Personal knowledge base
└── logs/                        # Task execution logs (auto-generated)
```

Skills are registered globally via symlinks: `~/.claude/skills/<name>` → `~/.agent-hub/skills/<name>`

## Extensibility

Add a custom skill by creating a new folder:

```bash
mkdir -p ~/.agent-hub/skills/my-skill
# Write your skill prompt in SKILL.md
```

Then run `agent-hub upgrade ~/.agent-hub` to register it. The orchestrator will automatically discover and use it when matching roles.

## License

MIT
