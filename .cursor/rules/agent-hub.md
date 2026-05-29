---
alwaysApply: false
description: Agent Hub - 智能体编排系统
---

## create-role

# Create Role Skill

Create a new role in the agent system.

## When to Use

When the orchestrator determines that no existing role can handle a user request.

## Process

1. Analyze the user's request to determine what capabilities are needed.
2. Define the role:
   - **name**: kebab-case identifier (e.g., `frontend-developer`)
   - **description**: Clear description of what this role does and when to use it
   - **skills**: List of skill names this role needs
   - **mcp_servers**: Any MCP servers this role depends on
   - **tags**: Searchable tags for matching
3. Check if required skills exist in `skills/`. If not, use `find-skill` to discover them.
4. Write the role definition to `roles/<name>.yaml`.
5. Update the role index.

## Template

```yaml
name: <role-name>
description: >
  <What this role does. Be specific about the scope and capabilities.>
skills:
  - <skill-1>
  - <skill-2>
mcp_servers: []
tags: [<tag1>, <tag2>]
created_at: <YYYY-MM-DD>
```

## Naming Conventions

- Role names: lowercase, kebab-case (e.g., `code-reviewer`, `data-analyst`)
- Be descriptive but concise
- Avoid generic names like `helper` or `assistant`


---

## match-role

# Match Role Skill

Find the best matching existing role for a user request.

## When to Use

Every time a user submits a request, before creating a new role.

## Matching Process

1. Read all `.yaml` files in `roles/`.
2. For each role, compare against the user request:
   - **Tag match**: Do any tags relate to the request keywords?
   - **Description match**: Does the role description cover the request domain?
   - **Skill match**: Does the role have skills relevant to the task?
3. Score each role (simple keyword overlap + semantic relevance).
4. Return the best match if score > threshold, otherwise return null.

## Matching Rules

- **Exact domain match**: e.g., user asks about React → match `frontend-developer`
- **Skill overlap**: If 2+ required skills overlap, consider it a match
- **No forced match**: Better to create a new role than force a bad fit

## Output

```
matched_role: <role-name> | null
confidence: <0-1>
reason: <why this role matches or why no match>
```


---

## memory-manager

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


---

## orchestrator

# Orchestrator Skill

You are the orchestrator — the master coordinator of this agent system.

## Responsibilities

1. **Task Routing**: When a user provides a request, analyze it and determine which existing role can handle it.
2. **Role Matching**: Check `roles/` directory for existing roles. Match based on role description and tags.
3. **Role Creation**: If no existing role matches, create a new role using the `create-role` skill.
4. **Skill Acquisition**: Use `find-skill` to discover and install skills that new roles need.
5. **Memory & Logging**: Ensure every task is logged and key information is captured in memory.

## Workflow

When receiving a user request:

1. Read all role files in `roles/` to understand available capabilities.
2. Match the request to the best-fit role using description and tag similarity.
3. If a match is found → delegate to that role.
4. If no match → create a new role:
   - Define the role's name, description, and required skills.
   - Use `find-skill` to discover needed skills.
   - Save the role definition to `roles/<role-name>.yaml`.
   - Install discovered skills to `skills/`.
5. Log the task to `logs/` with timestamp and outcome.
6. Update memory in `memory/` with key findings.

## Role Definition Format

```yaml
name: <role-name>
description: >
  A clear description of what this role does and when to use it.
skills:
  - skill-name-1
  - skill-name-2
mcp_servers:
  - server-name (if applicable)
tags: [tag1, tag2, tag3]
created_at: YYYY-MM-DD
```

## Decision Priority

1. Exact role match → use it
2. Partial match → use it with adaptation
3. No match → create new role
4. Skill missing → find and install skill first, then proceed


---

## task-logger

# Task Logger Skill

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

