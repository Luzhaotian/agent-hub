---
name: create-role
description: "创建新角色 — 当现有角色无法处理用户请求时，定义新的专用角色并注册。"
disable-model-invocation: false
---

Create a new role in the agent system.

## Data Root

Use `<data_root>` from `~/.agent-hub/config.json` (fallback `~/.agent-hub`).
Write only under `<data_root>/roles/` and update `<data_root>/roles/index.json`.

## When to Use

When the orchestrator determines that no existing role can handle a user request.

## Process

1. Analyze the user's request to determine what capabilities are needed.
2. Define the role:
   - **name**: kebab-case identifier (e.g., `frontend-developer`)
   - **description**: Clear description of what this role does and when to use it
   - **skills**: List of skill names this role needs
   - **mcp_servers**: Any MCP servers this role depends on (must already be configured in the editor; see `<data_root>/mcp/README.md`)
   - **tags**: Searchable tags for matching
3. Check required skills under `<data_root>/skills/`. If missing, use `find-skill` to discover/install them. Abort role creation only if critical skills remain missing and the user declines a stub.
4. Write `<data_root>/roles/<name>.yaml` using the template below.
5. **Update the role index** `<data_root>/roles/index.json`:
   - Read the existing JSON
   - Append a new object to the `roles` array if `name` is not already present
   - Fields: `name`, `description` (one-line), `tags`, `created_at`
   - Write the file back with valid JSON (2-space indent)
6. Confirm both the YAML file and the index entry exist before returning success.

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

## Index entry shape

```json
{
  "name": "<role-name>",
  "description": "<one-line summary>",
  "tags": ["<tag1>", "<tag2>"],
  "created_at": "<YYYY-MM-DD>"
}
```

## Naming Conventions

- Role names: lowercase, kebab-case (e.g., `code-reviewer`, `data-analyst`)
- Be descriptive but concise
- Avoid generic names like `helper` or `assistant`
