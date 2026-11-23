---
name: match-role
description: "角色匹配 — 根据用户请求，在已有角色中找到最合适的角色进行委派。"
disable-model-invocation: false
---

Find the best matching existing role for a user request.

## Data Root

Use `<data_root>` from `~/.agent-hub/config.json` (fallback `~/.agent-hub`).
Read roles from `<data_root>/roles/*.yaml`. Treat `index.json` as a quick catalog, but **always verify** against the YAML files (index can be stale).

## When to Use

Every time a user submits a request, before creating a new role.

## Matching Process

1. List all `.yaml` files in `<data_root>/roles/` (ignore `index.json`).
2. For each role, compare against the user request:
   - **Tag match**: Do any tags relate to the request keywords?
   - **Description match**: Does the role description cover the request domain?
   - **Skill match**: Does the role have skills relevant to the task?
3. Score each role (keyword overlap + semantic relevance). Skip `orchestrator` as a worker role unless the task is explicitly about coordinating the agent system itself.
4. Return the best match if confidence ≥ 0.6, otherwise return null.

## Matching Rules

- **Exact domain match**: e.g., user asks about React → match `frontend-developer`
- **Skill overlap**: If 2+ required skills overlap, consider it a match
- **No forced match**: Better to create a new role than force a bad fit

## Output

```
matched_role: <role-name> | null
confidence: <0-1>
reason: <why this role matches or why no match>
role_path: <data_root>/roles/<role-name>.yaml | null
```
