---
name: find-skill
description: "技能发现与安装 — 在本地与常见来源中查找缺失技能，并安装到 Agent Hub data root。"
disable-model-invocation: false
---

Discover and install skills that a role needs.

## Data Root

Resolve the Agent Hub data root before any file operation:

1. Prefer `~/.agent-hub/config.json` → field `data_root` (absolute path written at install time).
2. Fallback: `~/.agent-hub`.

Never write Agent Hub skills into the current project directory unless the user explicitly asks.

Paths:

- Local skills: `<data_root>/skills/<name>/SKILL.md`
- Claude Code registry links: `~/.claude/skills/`

## When to Use

- `create-role` needs skills that are not present under `<data_root>/skills/`
- User asks to find/install a capability (e.g. "add a React review skill")

## Discovery Order

1. **Local catalog** — list directories under `<data_root>/skills/` that contain `SKILL.md`.
2. **Claude skills** — list `~/.claude/skills/*/SKILL.md` (may be symlinks into Agent Hub).
3. **User / web sources** — if still missing, search the user's request keywords against known public skill repos or docs the user points to. Prefer official or user-provided URLs; do not invent download URLs.

## Install Process

When a needed skill is found outside `<data_root>/skills/`:

1. Create `<data_root>/skills/<skill-name>/`.
2. Write or copy `SKILL.md` (and any sibling files the skill needs).
3. Register globally by running:

```bash
node "<path-to-agent-hub-repo>/cli.js" register
# or, if installed as a package:
npx agent-hub register
```

If the CLI is unavailable, create a symlink manually:

```bash
ln -sfn "<data_root>/skills/<skill-name>" "$HOME/.claude/skills/<skill-name>"
```

On Windows without symlink privilege, copy the skill folder into `%USERPROFILE%\.claude\skills\<skill-name>` instead, or re-run `agent-hub register` (CLI falls back to copy).

4. Confirm `SKILL.md` is readable at the registered path.

## If Nothing Is Found

Do **not** pretend a skill exists. Return:

```
found: false
tried: [local, claude-skills, user-sources]
suggestion: <what the role can do with built-in tools, or ask the user for a skill URL>
```

Optionally draft a minimal stub `SKILL.md` under `<data_root>/skills/<name>/` **only if** the user agrees, then register it.

## Output

```
needed: [<skill-name>, ...]
found: [{ name, source, path }]
installed: [{ name, path }]
missing: [<skill-name>, ...]
```
