# Memory Manager Skill

Maintain persistent memory across sessions for roles and the system.

## When to Use

- After completing a task (extract insights)
- When a user provides personal preferences or corrections
- Periodically to consolidate logs into memory

## Memory Structure

- `memory/system.md` — Global system memory (cross-role patterns)
- `memory/<role-name>.md` — Per-role memory

## Operations

### Extract Memory from Task

1. Read the completed task log
2. Identify reusable insights:
   - User preferences (e.g., "always use TypeScript")
   - Technical patterns (e.g., "project uses pnpm")
   - Solutions to problems (e.g., "this error is fixed by...")
3. Append to the relevant role's memory file

### Query Memory

1. Before starting a task, read the role's memory file
2. Check `memory/system.md` for global context
3. Check `knowledgebase/` for domain knowledge
4. Use this context to inform task execution

### Consolidate

Periodically review `logs/` and extract key information:
- Remove duplicates
- Merge related insights
- Archive outdated information

## Memory File Format

```markdown
# <Role Name> Memory

## User Preferences
- preference 1
- preference 2

## Technical Context
- project uses X framework
- deployment via Y

## Learned Patterns
- when encountering Z, do W
```
