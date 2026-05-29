# Agent Hub

[English](./README.md)

Claude Code 的通用智能体插件系统。基于 **skill + role** 架构，支持持久化记忆、任务日志和自动技能发现。一次安装，全局生效，无需每个项目单独配置。

## 工作原理

```
用户输入 /orchestrator
  → orchestrator 分析请求
  → 匹配已有角色？ → 委派执行
  → 没有匹配？ → 创建新角色 + 发现并安装技能 → 执行
  → 记录任务日志 + 更新持久化记忆
```

**核心循环**：orchestrator 是系统入口。它读取已有角色，匹配最合适的进行委派。如果没有匹配项，会自动创建新角色——定义所需技能，通过 `find-skill` 发现并安装，全程自动完成。

## 快速开始

### 1. 安装

```bash
# 克隆并安装
git clone https://github.com/Luzhaotian/agent-hub.git
cd agent-hub && node cli.js install ~/.agent-hub
```

安装会将所有 skills 复制到 `~/.agent-hub/`，并通过 symlink 注册到 `~/.claude/skills/`，全局生效。

### 2. 验证

重启 Claude Code，在对话框中输入 `/orchestrator`：

- **不带任务**：应看到 → `您好，我是通用智能体 orchestrator，请问有什么能帮你的`
- **带任务**：应看到 → `orchestrator 开始执行任务`

如果以上提示正常出现，说明系统已成功启动。

### 3. 使用

在 `/orchestrator` 后描述你的需求即可：

```
/orchestrator 帮我写一个 React 组件
/orchestrator 检查这段代码的安全性
/orchestrator 搭建一个新的 Express API
```

orchestrator 会自动路由到合适的角色，或按需创建新角色。

### 4. 升级

```bash
node cli.js upgrade ~/.agent-hub
```

仅更新核心文件（技能、角色、插件配置）。你创建的自定义角色、记忆、知识库和日志**不会被覆盖**。

## 命令

| 命令 | 说明 |
|------|------|
| `agent-hub install <path> [--force]` | 安装并全局注册 skills |
| `agent-hub upgrade [path]` | 升级核心文件（保留用户数据） |
| `agent-hub list [path]` | 查看已安装的核心文件和用户文件 |
| `agent-hub setup [path]` | 在当前项目生成 `.cursor/rules/`（仅 Cursor） |
| `agent-hub help` | 查看帮助 |

## 技能列表

| 技能 | 触发方式 | 说明 |
|------|----------|------|
| `/orchestrator` | 任何任务请求 | 系统入口 — 路由任务、匹配/创建角色、管理记忆 |
| `/create-role` | 无匹配角色时 | 动态定义和注册新角色 |
| `/match-role` | 任务委派前 | 为请求找到最合适的已有角色 |
| `/task-logger` | 任务执行中 | 记录任务日志用于审计和记忆提取 |
| `/memory-manager` | 任务完成后 | 维护跨会话的持久化记忆 |

## 系统架构

```
~/.agent-hub/
├── .cursor-plugin/
│   └── plugin.json              # Cursor 插件清单
├── skills/                      # 技能定义
│   ├── orchestrator/SKILL.md    # 智能体编排者
│   ├── create-role/SKILL.md     # 角色工厂
│   ├── match-role/SKILL.md      # 角色匹配器
│   ├── task-logger/SKILL.md     # 任务日志
│   └── memory-manager/SKILL.md  # 记忆管理
├── roles/                       # 角色定义（YAML）
│   └── orchestrator.yaml        # 内置编排者角色
├── memory/                      # 持久化记忆（自动维护）
├── knowledgebase/               # 个人知识库
└── logs/                        # 任务执行日志（自动生成）
```

技能通过 symlink 全局注册：`~/.claude/skills/<name>` → `~/.agent-hub/skills/<name>`

## 扩展性

创建新文件夹即可添加自定义技能：

```bash
mkdir -p ~/.agent-hub/skills/my-skill
# 在 SKILL.md 中编写技能提示词
```

然后执行 `agent-hub upgrade ~/.agent-hub` 注册新技能。orchestrator 会在匹配角色时自动发现并使用它。

## 开源协议

MIT
