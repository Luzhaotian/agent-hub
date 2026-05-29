# Agent Hub

[English](./README.md)

一个通用的智能体插件系统，基于 Skills 架构构建，支持持久化的角色、记忆和知识管理。像内置 skill 一样全局可用，无需每个项目单独配置。

## 快速开始

### 1. 安装

```bash
# 通过 npm（发布后可用）
npx agent-hub install ~/.agent-hub               # macOS / Linux
npx agent-hub install %USERPROFILE%\.agent-hub   # Windows

# 或克隆到本地运行
git clone https://github.com/Luzhaotian/agent-hub.git
cd agent-hub && node cli.js install ~/.agent-hub
```

安装会将 skills 注册到 `~/.claude/skills/`，全局生效。

### 2. 使用

重启编辑器，在对话框中输入 `/orchestrator` 激活系统：

```
你的请求
  → 编排者分析
  → 匹配已有角色？ → 委派执行
  → 没有匹配？ → 创建新角色 + 安装技能 → 执行
  → 记录日志 + 更新记忆
```

编辑 `~/.agent-hub/knowledgebase/personal.md`，告诉系统你的技术栈和偏好。

### 3. 升级

```bash
npx agent-hub upgrade ~/.agent-hub
```

仅更新核心文件，你创建的角色、技能、记忆、知识库和日志**不会被覆盖**。

## 命令

| 命令 | 说明 |
|------|------|
| `agent-hub install <path>` | 安装并全局注册 skills |
| `agent-hub setup [path]` | 在当前项目生成 `.cursor/rules/`（Cursor 用） |
| `agent-hub upgrade [path]` | 升级核心文件（保留用户数据） |
| `agent-hub list [path]` | 查看已安装的核心文件和用户文件 |
| `agent-hub help` | 查看帮助 |

## 可用技能

| 技能 | 触发方式 | 说明 |
|------|----------|------|
| `/orchestrator` | 任何任务请求 | 路由任务、匹配/创建角色、管理记忆 |
| `/create-role` | 需要新角色时 | 动态定义和注册新角色 |
| `/match-role` | 任务委派前 | 为请求找到最合适的已有角色 |
| `/task-logger` | 任务执行中 | 记录任务日志用于审计和记忆提取 |
| `/memory-manager` | 任务完成后 | 维护跨会话的持久化记忆 |

## 项目结构

```
~/.agent-hub/
├── .cursor-plugin/plugin.json  # 插件配置
├── skills/
│   ├── orchestrator/SKILL.md   # /orchestrator
│   ├── create-role/SKILL.md    # /create-role
│   ├── match-role/SKILL.md     # /match-role
│   ├── task-logger/SKILL.md    # /task-logger
│   └── memory-manager/SKILL.md # /memory-manager
├── roles/                      # 角色定义（YAML）
├── memory/                     # 持久化记忆
├── knowledgebase/              # 个人知识库
└── logs/                       # 任务执行日志（自动生成）
```

## 扩展性

在 `skills/` 目录下创建新文件夹即可添加自定义技能：

```
~/.agent-hub/skills/my-skill/SKILL.md
```

然后重新执行 `agent-hub install --force ~/.agent-hub` 注册新技能。

## 开源协议

MIT
