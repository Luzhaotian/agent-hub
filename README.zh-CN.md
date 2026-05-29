# Agent Hub

[English](./README.md)

一个通用的智能体插件系统，基于 Skills 架构构建，支持持久化的角色、记忆和知识管理。可接入任何支持 Skills 格式的编辑器或 AI 代理（Cursor、Claude Code 等）。

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

支持 `~` 路径展开 — `~` 会自动解析为用户主目录，全平台通用。

### 2. 使用

将编辑器指向安装目录，`SKILLS.md` 是主入口文件，然后提交任务：

```
你的请求
  → 编排者分析
  → 匹配已有角色？ → 委派执行
  → 没有匹配？ → 创建新角色 + 安装技能 → 执行
  → 记录日志 + 更新记忆
```

编辑 `knowledgebase/personal.md`，告诉系统你的技术栈和偏好。

### 3. 升级

```bash
npx agent-hub upgrade ~/.agent-hub
# 或: node cli.js upgrade ~/.agent-hub
```

仅更新核心文件，你创建的角色、技能、记忆、知识库和日志**不会被覆盖**。

## 命令

| 命令 | 说明 |
|------|------|
| `agent-hub install <path>` | 安装到本地目录 |
| `agent-hub upgrade [path]` | 升级核心文件（保留用户数据） |
| `agent-hub list [path]` | 查看已安装的核心文件和用户文件 |
| `agent-hub setup-cursor [path]` | 在当前项目生成 Cursor 规则文件 |
| `agent-hub help` | 查看帮助 |

## 集成方式

### Cursor

在项目根目录运行：

```bash
npx agent-hub setup-cursor
# 或: node cli.js setup-cursor
```

生成 `.cursor/rules/agent-hub.mdc`。重启 Cursor 后，在对话中输入 `@rules/agent-hub` 即可激活整个系统。

### Claude Code

在 `CLAUDE.md` 中引用 `SKILLS.md`，或直接加载为系统提示词。

## 核心概念

| 概念 | 说明 |
|------|------|
| **角色 (Roles)** | 具备能力、技能和标签的专用代理，按需动态创建。 |
| **技能 (Skills)** | 模块化 Markdown 文件，定义可复用的能力。 |
| **记忆 (Memory)** | 跨会话的持久化上下文，分全局和角色级别。 |
| **知识库 (Knowledge Base)** | 个人和领域知识，任务执行时自动参考。 |
| **日志 (Logs)** | 结构化任务日志，用于审计和记忆提取。 |

## 项目结构

```
~/.agent-hub/
├── SKILLS.md           # 编辑器主入口文件
├── roles/              # 角色定义（编排者 + 用户创建）
├── skills/             # 技能提示词（核心 + 用户创建）
├── memory/             # 持久化记忆文件
├── knowledgebase/      # 个人知识库
└── logs/               # 任务执行日志（自动生成）
```

## 开源协议

MIT
