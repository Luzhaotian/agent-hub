# Agent Hub

[English](./README.md)

面向 Claude Code（及 Cursor）的通用智能体插件系统。基于 **skill + role** 架构，支持持久化记忆、任务日志和技能发现。安装到 `~/.agent-hub` 后全局可用。

## 工作原理

```
用户输入 /orchestrator
  → 解析 data root（~/.agent-hub / config.json）
  → 匹配已有角色？ → 加载角色技能 → 以该角色身份执行
  → 没有匹配？ → create-role + find-skill → 注册 → 执行
  → 写入任务日志 + 更新持久化记忆（均在 data root 下）
```

**核心循环**：orchestrator 是入口。它读取 **data root** 下的角色（不是当前项目目录），匹配最合适的工作角色，并**加载其技能后亲自执行**。若无匹配，则创建角色、用 `find-skill` 发现缺失技能、注册后再继续。

## 快速开始

### 1. 安装

```bash
git clone https://github.com/Luzhaotian/agent-hub.git
cd agent-hub && node cli.js install ~/.agent-hub
```

安装会把模板复制到 `~/.agent-hub/`，写入带绝对路径的 `config.json`，并注册到 `~/.claude/skills/`（优先 symlink，Windows 失败时回退为复制）。

### 2. 验证

重启 Claude Code，输入 `/orchestrator`：

- **不带任务** → `您好，我是通用智能体 orchestrator，请问有什么能帮你的`
- **带任务** → `orchestrator 开始执行任务`

### 3. 使用

```
/orchestrator 帮我写一个 React 组件
/orchestrator 检查这段代码的安全性
/orchestrator 搭建一个新的 Express API
```

### 4. 升级 / 注册

```bash
node cli.js upgrade ~/.agent-hub   # 更新核心文件并重新注册技能
node cli.js register ~/.agent-hub  # 仅重新注册（含自定义技能）
```

升级会更新变更的核心文件、**追加模板中的新文件**，并始终重新注册技能。自定义角色、记忆、知识库和日志不会被覆盖。

## 命令

| 命令 | 说明 |
|------|------|
| `agent-hub install <path> [--force]` | 安装并全局注册 skills |
| `agent-hub upgrade [path]` | 升级核心文件 + 重新注册 skills |
| `agent-hub register [path]` | 仅重新注册 skills（含自定义） |
| `agent-hub list [path]` | 查看已安装的核心/用户文件 |
| `agent-hub setup [path]` | 在当前项目生成 `.cursor/rules/` |
| `agent-hub help` | 查看帮助 |

## 技能列表

| 技能 | 触发方式 | 说明 |
|------|----------|------|
| `/orchestrator` | 任何任务请求 | 入口 — 路由、匹配/创建角色、执行、记忆 |
| `/match-role` | 委派前 | 匹配最合适的已有角色 |
| `/create-role` | 无匹配角色时 | 写角色 YAML 并更新 `roles/index.json` |
| `/find-skill` | 技能缺失时 | 发现/安装技能到 data root |
| `/task-logger` | 任务执行中 | 日志写入 `<data_root>/logs/` |
| `/memory-manager` | 任务完成后 | 记忆写入 `<data_root>/memory/` |

## 系统架构

```
~/.agent-hub/                    # data root（见 config.json）
├── config.json                  # 绝对 data_root + 版本
├── .cursor-plugin/plugin.json
├── skills/                      # 技能定义
│   ├── orchestrator/
│   ├── match-role/
│   ├── create-role/
│   ├── find-skill/
│   ├── task-logger/
│   └── memory-manager/
├── roles/                       # YAML 角色 + index.json
├── memory/                      # 持久化记忆
├── knowledgebase/               # 个人知识库
├── logs/                        # 任务日志
└── mcp/                         # MCP 说明（不自动安装）
```

技能全局注册：`~/.claude/skills/<name>` → `~/.agent-hub/skills/<name>`。

**重要：** Agent Hub 状态始终使用 `<data_root>`；项目代码修改仍在项目目录。

## Cursor

```bash
node cli.js setup ~/.agent-hub
```

生成 `.cursor/rules/*.mdc`（含指向 data root 的 `agent-hub-root.mdc`）。重启后使用 `@rules/orchestrator`。

## 扩展性

```bash
mkdir -p ~/.agent-hub/skills/my-skill
# 编写 SKILL.md 后：
node cli.js register ~/.agent-hub
```

用 `register`（或 `upgrade`）把新技能链到 `~/.claude/skills/`。

## MCP

角色可声明 `mcp_servers`，但 Agent Hub **不会**自动安装 MCP。在编辑器中配置好后，在角色 YAML 里引用名称即可。详见 data root 下的 `mcp/README.md`。

## 开源协议

MIT
