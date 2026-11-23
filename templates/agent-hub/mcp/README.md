# MCP Servers

Role YAML may list MCP servers under `mcp_servers`. Agent Hub does **not** auto-install MCP servers.

## How to wire MCP

1. Install/configure the MCP server in your editor (Claude Code / Cursor) as usual.
2. Reference the server name in a role file:

```yaml
mcp_servers:
  - github
  - filesystem
```

3. When the orchestrator delegates to that role, treat listed MCP tools as available for the task.

Keep notes about your personal MCP setup in this folder if useful (e.g. `notes.md`). Do not commit secrets.
