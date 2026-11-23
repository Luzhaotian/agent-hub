---
name: memory-manager
description: "记忆管理 — 维护跨会话的持久化记忆，提取任务洞察，合并和整理记忆。"
disable-model-invocation: false
---

Maintain persistent memory across sessions for roles and the system.

## Data Root

Use `<data_root>` from `~/.agent-hub/config.json` (fallback `~/.agent-hub`).

| File | Purpose |
|------|---------|
| `<data_root>/memory/system.md` | Global system memory |
| `<data_root>/memory/<role-name>.md` | Per-role memory |
| `<data_root>/knowledgebase/` | Curated personal knowledge |
| `<data_root>/logs/` | Source material for extraction |

## When to Use

- After completing a task (extract insights)
- When a user provides personal preferences or corrections
- Periodically to consolidate logs into memory

## Operations

### Extract Memory from Task

1. Read the completed task log under `<data_root>/logs/`
2. Identify reusable insights:
   - User preferences (e.g., "always use TypeScript")
   - Technical patterns (e.g., "project uses pnpm")
   - Solutions to problems (e.g., "this error is fixed by...")
3. Append to `<data_root>/memory/<role-name>.md` (create if missing)
4. Put cross-role insights in `<data_root>/memory/system.md`

### Query Memory

Before starting a task:

1. Read the role's memory file
2. Read `memory/system.md`
3. Skim `knowledgebase/` for domain knowledge
4. Use this context during execution

### Consolidate

Periodically review `<data_root>/logs/` and extract key information:

- Remove duplicates
- Merge related insights
- Archive outdated information

## Memory File Format

```markdown
# <Role Name> Memory

## User Preferences
- preference 1

## Technical Context
- project uses X framework

## Learned Patterns
- when encountering Z, do W
```
