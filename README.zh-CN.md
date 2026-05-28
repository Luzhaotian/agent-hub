# Agent Hub

[English](./README.md)

一个通用的智能体插件系统，基于 Skills 架构构建，支持持久化的角色、记忆和知识管理。可接入任何支持 Skills 格式的编辑器或 AI 代理（Cursor、Claude Code 等）。

## 快速开始

### 1. 安装

```bash
npx agent-hub install ~/.agent-hub
```

一行命令，将所有核心文件（角色、技能、记忆模板、知识库模板）复制到本地目录。

### 2. 个性化

编辑 `~/.agent-hub/knowledgebase/personal.md`，填入你的技术栈、编码习惯和偏好。

### 3. 使用

在你的 AI 代理中加载 `skills/orchestrator.md`，然后提交任务 — 编排者会自动匹配或创建角色、执行任务、记录日志并更新记忆。

```
你的请求
  → 编排者分析
  → 匹配已有角色？ → 委派执行
  → 没有匹配？ → 创建新角色 + 安装技能 → 执行
  → 记录日志 + 更新记忆
```

### 4. 升级

```bash
npx agent-hub upgrade ~/.agent-hub
```

仅更新核心模板文件，你创建的角色、技能、记忆、知识库和日志**不会被覆盖**。

## 命令

| 命令 | 说明 |
|------|------|
| `agent-hub install <path>` | 安装到本地目录 |
| `agent-hub upgrade [path]` | 升级核心文件（保留用户数据） |
| `agent-hub list [path]` | 查看已安装的核心文件和用户文件 |
| `agent-hub help` | 查看帮助 |

## 集成方式

### Cursor

将 `.cursor/rules` 或项目设置指向安装目录的 `skills/` 文件夹，Cursor 会自动加载技能提示词。

### Claude Code

在 `CLAUDE.md` 中引用技能文件，或直接加载 `skills/orchestrator.md` 作为系统提示词。

## 核心概念

| 概念 | 说明 |
|------|------|
| **角色 (Roles)** | 具备特定能力、技能和标签的专用代理，根据用户需求动态创建。 |
| **技能 (Skills)** | 模块化的 Markdown 文件，定义可复用的能力。通过 `find-skill` 发现并永久安装。 |
| **记忆 (Memory)** | 跨会话的持久化上下文 — 全局记忆 (`memory/system.md`) 和角色记忆 (`memory/<role>.md`)。 |
| **知识库 (Knowledge Base)** | 个人和领域知识文件 (`knowledgebase/`)，任务执行时自动参考。 |
| **日志 (Logs)** | 结构化的任务日志 (`logs/`)，用于审计追踪和记忆提取。 |

## 项目结构

安装后，本地目录结构如下：

```
~/.agent-hub/
├── .core-manifest.json     # 核心文件追踪（用于升级）
├── roles/
│   ├── index.json          # 角色注册表
│   └── orchestrator.yaml   # 主协调者角色定义
├── skills/
│   ├── orchestrator.md     # 任务路由与协调
│   ├── create-role.md      # 动态角色创建
│   ├── match-role.md       # 角色匹配逻辑
│   ├── task-logger.md      # 任务日志与审计
│   └── memory-manager.md   # 持久化记忆管理
├── memory/
│   └── system.md           # 全局系统记忆
├── knowledgebase/
│   └── personal.md         # 个人偏好与知识
└── logs/                   # 任务执行日志（自动生成）
```

## 开源协议

MIT
