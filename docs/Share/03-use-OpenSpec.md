---
title: 基于OpenSpec的工作流操作指南
order: 3
nav:
  title: 日常分享
  order: 10
---

# OpenSpec 规范驱动开发框架详解

## 1. 概述

OpenSpec 是 **Spec Coding（规范驱动开发，Spec-Driven Development）** 范式的一个具体实现框架/工具链。它将规范驱动的理念落地为一套可操作的 CLI 工具 + 文档规范体系，帮助开发者在 AI 辅助编程中建立项目记忆，实现高质量、可追溯的代码生成。

**核心定位**：给 AI 建立项目记忆，让它像一个了解项目的同事一样干活。

---

## 2. 背景：从 Vibe Coding 到 Spec Coding

| 范式 | 特点 | 适用场景 |
|------|------|----------|
| Vibe Coding | 自由对话、快速原型、较少约束 | 简单任务、探索性编程 |
| Spec Coding | 规范先行、结构化文档、人类审阅节点 | 复杂任务、多人协作、长期维护 |

Spec Coding 强调使用多种本地 PRD 文档和技术文档指导 AI 工作，并在过程中设置人类可控的检查点。相比于 Vibe Coding，它结合了更多行业规范流程，起到更好的监督和规范作用，对于复杂和较长的任务效果更好。

---

## 3. 核心要素

### 3.1 结构化文档产物（Artifacts）

以 Markdown 形式保存在 `.aone_copilot/openspec/` 目录下，包括：

| 文件 | 作用 | 说白了就是 |
|------|------|------------|
| `proposal.md` | 做什么、为什么做 | 需求文档 |
| `spec.md` | 功能规格定义 | 验收标准 |
| `design.md` | 怎么做 | 技术方案 |
| `tasks.md` | 实施步骤 | 任务清单 |

### 3.2 人机协作的工作流节点

通过 **explore → propose → apply → archive** 四个阶段，形成一个完整的闭环：

| 阶段 | 作用 |
|------|------|
| Explore | 自由探索和思考，不写代码，只调研和讨论 |
| Propose | 将想法结晶为正式的变更提案文档 |
| Apply | 基于已审阅的文档实施代码变更 |
| Archive | 归档完成的变更，更新规格 |

### 3.3 人类审阅检查点

每个阶段之间都有人类工程师的审阅节点，比如 Propose 产出文档后，需要人类确认才能进入 Apply 阶段。

---

## 4. 基本概念详解

### 4.1 Spec（规范）

存放在项目根目录 `openspec/specs/` 下，每个 spec 描述一个功能模块的规范。

```
openspec/specs/
├── chat-message-stream/     # IM 消息流规范
│   └── spec.md
├── common-components/       # 通用组件规范
│   └── spec.md
└── sse-state-snapshot/      # SSE 状态快照规范
    └── spec.md
```

**作用**：记录模块“应该怎么做”的规则，AI 在做相关功能时会自动参考这些规范，避免写出不一致的代码。

### 4.2 Change（变更）

每次要做一个功能或修一个 bug，就创建一个 change，存放在 `openspec/changes/` 下。一个 change 包含四个 artifact（按依赖顺序生成）：

| 文件 | 作用 |
|------|------|
| `proposal.md` | 做什么、为什么做 |
| `specs/` | 功能规格定义（验收标准） |
| `design.md` | 怎么做（技术方案） |
| `tasks.md` | 拆成哪些步骤（任务清单） |

### 4.3 Explore（探索）

这是一个思考模式，不是文件或目录。当需求不太明确、方案拿不准时，先进入 explore 模式跟 AI 讨论。

**特点**：
- 只思考不动手：AI 分析代码、画架构图、比较方案，但不写代码
- 自由发散：没有固定流程，跟着思路走
- 落地衔接：想清楚了可以直接转入 propose 创建变更提案

### 4.4 Archive（归档）

变更完成后归档，会做两件事：
- 把 change 移到 `openspec/changes/archive/` 目录
- 把变更中的规范合并到对应的 spec 里

---

## 5. 安装

### 5.1 前置要求

- Node.js 版本 >= 20.19.0
- 已安装 Aone Copilot 插件（JetBrains 系列或 VSCode 均可）

```bash
node --version  # 需要 v22.16.0 或更高
```

### 5.2 方式一：自动化安装

使用官方 Prompt 市场中的指令一键安装：  
https://copilot.code.alibaba-inc.com/prompt-market/prompt/2755

### 5.3 方式二：手动安装

```bash
# 如果已安装 tnpm
tnpm install -g @ali/openspec-aone

# 如果没有 tnpm，使用 npm
npm install -g @ali/openspec-aone --registry=https://registry.anpm.alibaba-inc.com
```

### 5.4 验证安装

当前最新版本为 0.6.7，可执行以下命令查看版本：

```bash
openspec-aone --version
```

### 5.5 官方版本（可选）

如果不想使用 Aone 版本，可直接安装官方版本：

```bash
npm install -g @fission-ai/openspec@latest
cd your-project
openspec init
```

---

## 6. 使用流程

### 6.1 注册 Skills

安装完成后，需要在 Aone Copilot 中注册 4 个 skill（位于 `.aone_copilot/skills/`）：

| Skill | 触发方式 | 作用 |
|-------|----------|------|
| `opsx-aone-explore` | `/opsx-aone-explore` | 探索模式，想清楚再动手 |
| `opsx-aone-propose` | `/opsx-aone-propose` | 创建变更提案 |
| `opsx-aone-apply` | `/opsx-aone-apply` | 执行变更任务 |
| `opsx-aone-archive` | `/opsx-aone-archive` | 归档已完成的变更 |

### 6.2 日常使用四步循环

```
想清楚 → 写提案 → 执行 → 归档
explore → propose → apply → archive
```

#### Step 1：探索（可选）

需求不明确时，先用探索模式理清思路：

```
/opsx-aone-explore
> 我想给聊天消息加上评价反馈功能，不确定放哪里合适
```

AI 会分析现有代码结构，讨论方案，但不写代码。

#### Step 2：创建变更提案

```
/opsx-aone-propose
> 给 IM 对话中的表格添加复制功能
```

AI 会自动：
1. 创建 change 目录（`openspec/changes/<名称>/`）
2. 分析项目代码，生成 `proposal.md`（做什么）
3. 生成 `specs/`（功能规格 / 验收标准）
4. 生成 `design.md`（怎么做）
5. 生成 `tasks.md`（任务拆解）

**生成的 proposal 示例**：

```markdown
# Change: 将表格复制功能集成到 IM 对话中所有 Table 组件

## Why
用户在对话中查看表格数据时，无法快速复制表格内容，需要手动选择文本，体验较差。

## What Changes
- 在 PlainTableRenderer 的 footer 区域添加复制按钮
- 在 ConfirmTable 的 footer 区域添加复制按钮
- 适配 useTableCopy hook 以支持 Chat 表格的数据结构
- 复制时使用完整表格数据（所有行），而非当前分页展示的数据

## Impact
- 影响的规范：common-components、chat-message-stream
- 影响的代码：src/hooks/useTableCopy.ts, ...
```

审阅和修改这些文档，确认没问题后再执行。

#### Step 3：执行任务

```
/opsx-aone-apply
```

AI 按照 `tasks.md` 中的任务清单逐个执行，每完成一个就打勾：

```markdown
## 1. 增强 useTableCopy hook
- [x] 1.1 增加可选的 valueExtractor 参数
- [x] 1.2 修改 getRows 方法支持自定义值提取

## 2. PlainTableRenderer 集成复制按钮
- [x] 2.1 引入 useTableCopy hook
- [x] 2.2 在 footer 添加复制按钮
```

#### Step 4：归档

代码验证无误后：

```
/opsx-aone-archive
```

变更归档，相关规范自动更新到 spec 中。

---

## 7. 项目实践成果

### 7.1 数据统计（imp-data-agent 项目，2025.12 ~ 2026.03）

| 指标 | 数据 |
|------|------|
| 已完成并归档的变更 | 95 个 |
| 当前进行中的变更 | 1 个 |
| 积累的 spec 规范 | 26 个模块 |
| 覆盖的功能领域 | 知识库管理、在线 Excel 交互、IM 聊天、数据订阅、通用组件、SSE 状态快照、消息流渲染、历史消息、评价反馈、会话管理等 |
| 代码采纳率变化 | 63% → 87% → 94%（近三个月） |

### 7.2 实际体感

- **需求沟通成本降低**：一句话描述需求 → AI 自动读 spec → 直接生成靠谱方案
- **复杂功能不再翻车**：propose 自动拆解任务 → 先审方案再执行 → 每个小任务可控
- **项目知识自动沉淀**：95 个变更归档后，26 个 spec 模块积累了大量项目规范
- **变更可追溯**：每个功能都有完整的 proposal → specs → design → tasks 记录

### 7.3 典型案例

| 变更名称 | 复杂度 | 说明 |
|----------|--------|------|
| optimize-chat-session-lifecycle | 高 | 涉及会话创建、SSE 中断、历史刷新等多个模块联动 |
| integrate-table-copy-to-chat | 中 | 复用已有 hook，集成到两个不同的表格组件 |
| add-scroll-to-bottom | 低 | 简单的滚动交互功能 |

### 7.4 大需求拆分实践

**整体流程**：

```
产品 PRD → 人工模块化拆分 → 人工翻译为结构化 Markdown → OpenSpec 逐个 propose→apply → 归档沉淀
（语雀/钉钉）  （按功能域划分）      （业务需求文档）           （每个子模块）
                ↓                     ↓                         ↓
           人工审阅检查点         人工审阅检查点             人工审阅检查点
```

**IM 聊天模块拆分案例**（11 个子模块）：

| 子模块 | 需求文档数 | 复杂度 |
|--------|------------|--------|
| conversation — 会话管理 | 1 | 中 |
| table — 表格渲染 | 5 | 高 |
| confirmTable — 二次确认表格 | 4 | 高 |
| historyMsg — 历史消息 | 8 | 高 |
| feedback — 评价反馈 | 2 | 中 |
| interrupt — 中断机制 | 1 | 中 |
| multiSse — 多会话 SSE | 3 | 高 |
| scrollToBottom — 滚动交互 | 1 | 低 |
| fileDownload — 文件下载 | 2 | 低 |
| videoStyle — 视频样式 | 1 | 低 |
| fix — 消息流异常兜底修复 | 1 | 中 |

**数据模板模块拆分案例**：

| 子模块 | 需求文档数 |
|--------|------------|
| 核心功能 | 9 个 PRD |
| univerExcel — 在线 Excel | 9 个 PRD |
| cols — 列配置 | 10+ 个配置文件 |
| excel-sort — 排序 | 2 个 PRD |
| excel-filter — 筛选 | 1 个 PRD |
| cols_knowledge — 知识库列 | 1 个 PRD |

**关键数据**：
- IM 聊天模块拆分子模块数：11 个
- IM 聊天模块需求文档总数：45+
- 数据模板模块 PRD 总数：30+
- 拆分后单次 propose 平均任务数：3-5 个
- 最终代码采纳率：90%+

**为什么拆分后效果好**：
- 粒度可控：每个子模块 1-5 个需求文档，AI 一次处理上下文适中
- 依赖清晰：拆分时梳理了模块间依赖，按依赖顺序逐个实现
- spec 滚雪球：前面模块归档后沉淀的 spec，后面模块自动复用
- 人工翻译保质量：虽然翻译 PRD 需要 15-30 分钟/篇，但结构化 Markdown 让 AI 理解准确率大幅提升

---

## 8. 使用建议

1. **不是所有改动都要走 OpenSpec**：改个文案、修个样式，直接写就行。涉及多文件、多模块的功能再用。
2. **proposal 要认真审**：AI 生成的方案不一定完全对，特别是影响范围的判断，需要人工确认。
3. **spec 需要定期维护**：归档自动生成的 spec 可能比较粗糙，有空可以手动优化。
4. **explore 模式很有用**：需求不明确时别急着 propose，先 explore 聊聊，想清楚了效率更高。
5. **结合业务文档一起用**：在 `.aone_copilot/business/` 下维护业务需求文档，和 OpenSpec 配合使用效果更好。

---

## 9. 遇到的困境与痛点

### 9.1 产品需求文档本身不规范、不完备

- 问题：边界场景、验收标准规格、交互细节经常缺失
- 对策：需要人工补全

### 9.2 产品文档 → Markdown 需求文档的手动翻译

**现状**：产品经理交付的需求通常以语雀文档、钉钉文档、PRD 截图等形式存在，格式不统一、信息密度参差不齐。开发者需要手动阅读、理解、提炼，并翻译为结构化的 Markdown 需求文档。

**痛点**：
- 耗时：一份中等复杂度的 PRD 翻译通常需要 15-30 分钟
- 信息丢失风险：手动翻译过程中依然存在遗漏边界条件、交互细节
- 格式不一致：不同开发者翻译出的 Markdown 结构差异大，影响后续 AI 理解质量
- 重复劳动：每个需求都要重复“阅读 → 理解 → 结构化”的过程

### 9.3 大需求的模块化拆分与上下文影响

**现状**：当产品需求较大时，需要开发者手动拆分为多个独立的、可单独 propose 和 apply 的子需求模块。

**痛点**：
- 拆分依赖经验：需要对项目架构有深入理解，才能合理划分模块边界
- 粒度难把控：拆太细导致 propose 次数过多，拆太粗导致单次变更过大、AI 生成质量下降
- 依赖关系梳理：子模块之间的依赖顺序需要手动规划，容易出错
- 上下文断裂：拆分后各子需求之间的关联信息容易丢失

---

## 10. 参考阅读资料

- [OpenSpec 安装基本使用指南](https://aliyuque.antfin.com/copilot/userguide/ivgpkv4sgp1vqp8w#iuu7Q)
- [openspec-aone](https://aliyuque.antfin.com/copilot/userguide/ivgpkv4sgp1vqp8w#iuu7Q)
- [官方版本（GitHub）](https://github.com/Fission-AI/OpenSpec)
- [官方命令文档](https://github.com/Fission-AI/OpenSpec/blob/main/docs/commands.md)

### 基础命令

| Command | Purpose |
|---------|---------|
| `/opsx:propose` | Create a change and generate planning artifacts in one step |
| `/opsx:explore` | Think through ideas before committing to a change |
| `/opsx:apply` | Implement tasks from the change |
| `/opsx:archive` | Archive a completed change |

### 扩展命令

| Command | Purpose |
|---------|---------|
| `/opsx:new` | Start a new change scaffold |
| `/opsx:continue` | Create the next artifact based on dependencies |
| `/opsx:ff` | Fast-forward: create all planning artifacts at once |
| `/opsx:verify` | Validate implementation matches artifacts |
| `/opsx:sync` | Merge delta specs into main specs |
| `/opsx:bulk-archive` | Archive multiple changes at once |
| `/opsx:onboard` | Guided tutorial through the complete workflow |


## 11. 总结

OpenSpec 是一套将规范驱动开发（Spec Coding）落地的完整工具链。它通过结构化文档、人机协作工作流和人类审阅节点，有效解决了 AI 编程中上下文缺失、需求理解偏差、知识无法沉淀等问题。实践数据表明，采用 OpenSpec 后代码采纳率从 63% 提升至 94%，复杂功能开发更加可控。尽管存在需求翻译、模块拆分等人工成本，但整体上显著提升了 AI 辅助编程的质量和效率。
