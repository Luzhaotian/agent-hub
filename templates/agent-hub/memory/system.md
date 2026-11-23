# System Memory

Global memory shared across all roles.

## Data Root

- Default install: `~/.agent-hub`
- Runtime source of truth: `config.json` → `data_root` (absolute path after install)
- Never store Agent Hub roles/memory/logs in the current project directory

## Project Conventions

- Skills format: Markdown (`SKILL.md`) under `skills/<name>/`
- Role definitions: YAML (`.yaml`) under `roles/`
- Role index: `roles/index.json` (must stay in sync when creating roles)
- Logs: Markdown files in `logs/` with timestamp prefix
- Knowledge: Markdown files in `knowledgebase/`
- MCP notes: `mcp/README.md` and optional local notes (no secrets)

## User Preferences

<!-- Auto-populated from task logs and user input -->

## Learned Patterns

<!-- Patterns discovered across multiple tasks -->

## Active Roles

- **orchestrator** — Master coordinator (always available)
