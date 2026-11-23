---
name: task-logger
description: "任务日志 — 记录每次任务执行的过程和结果，用于审计追踪和记忆提取。"
disable-model-invocation: false
---

Log every task execution for audit and memory extraction.

## Data Root

Use `<data_root>` from `~/.agent-hub/config.json` (fallback `~/.agent-hub`).
Write logs only under `<data_root>/logs/`. Create the directory if missing.

## When to Use

At the start and end of every task handled by any role.

## Log Format

Each log file: `<data_root>/logs/YYYY-MM-DD-HH-mm-<task-slug>.md`

```markdown
# Task Log: <task-slug>

- **Date**: YYYY-MM-DD HH:mm
- **Role**: <role-name>
- **Request**: <original user request>
- **Data root**: <data_root>

## Execution

- Steps taken
- Skills used
- MCP servers involved

## Result

- Outcome (success / partial / failed)
- Key findings
- Files created/modified (project paths)

## Memory Notes

- Extractable insights for future reference
```

## Auto-extraction

After logging, check if the task produced any reusable knowledge:

- New patterns or conventions discovered
- User preferences revealed
- Solutions to recurring problems

If yes, hand off to `memory-manager` (or append notes under Memory Notes for later extraction).
