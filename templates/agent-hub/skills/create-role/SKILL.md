---
name: create-role
description: "创建新角色 — 当现有角色无法处理用户请求时，定义新的专用角色并注册。"
disable-model-invocation: false
---

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
