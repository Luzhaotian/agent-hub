---
alwaysApply: false
description: match-role
---

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
Source: /Users/luzhaotian/.agent-hub/skills/match-role.md
