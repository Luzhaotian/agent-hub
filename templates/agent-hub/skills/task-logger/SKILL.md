---
name: task-logger
description: "任务日志 — 记录每次任务执行的过程和结果，用于审计追踪和记忆提取。"
disable-model-invocation: false
---

Log every task execution for audit and memory extraction.

## When to Use

At the start and end of every task handled by any role.

## Log Format

Each log file: `logs/YYYY-MM-DD-HH-mm-<task-slug>.md`

```markdown
# Task Log: <task-slug>

- **Date**: YYYY-MM-DD HH:mm
- **Role**: <role-name>
- **Request**: <original user request>

## Execution

- Steps taken
- Skills used
- MCP servers involved

## Result

- Outcome (success / partial / failed)
- Key findings
- Files created/modified

## Memory Notes

- Extractable insights for future reference
```

## Auto-extraction

After logging, check if the task produced any reusable knowledge:
- New patterns or conventions discovered
- User preferences revealed
- Solutions to recurring problems

If yes, update the relevant role's memory or the knowledge base.
