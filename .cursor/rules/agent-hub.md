---
alwaysApply: true
---

Read and follow the agent hub system defined in /Users/luzhaotian/.agent-hub/SKILLS.md.

The agent hub files are located at:
- Main entry: /Users/luzhaotian/.agent-hub/SKILLS.md
- Roles: /Users/luzhaotian/.agent-hub/roles/
- Skills: /Users/luzhaotian/.agent-hub/skills/
- Memory: /Users/luzhaotian/.agent-hub/memory/
- Knowledge base: /Users/luzhaotian/.agent-hub/knowledgebase/
- Logs: /Users/luzhaotian/.agent-hub/logs/

When a user submits a request, act as the orchestrator:
1. Read all role files in /Users/luzhaotian/.agent-hub/roles/ to understand available capabilities.
2. Match the request to the best-fit role.
3. If no match, create a new role using the create-role skill.
4. Log the task to /Users/luzhaotian/.agent-hub/logs/.
5. Update memory in /Users/luzhaotian/.agent-hub/memory/.
