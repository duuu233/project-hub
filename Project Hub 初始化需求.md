# Project Hub

## 1. 项目目标

创建一个轻量级的多项目统一管理仓库 `project-hub`。

这个仓库**不拥有、不包含被管理项目的源码**，而是作为多个独立项目的统一管理入口。

主要解决以下问题：

- 本地同时维护多个独立项目。
- 每个项目已经进入持续迭代阶段。
- 每次迭代时，不希望重复描述项目路径、技术背景、目录结构等信息。
- 希望只关注“这次需要修改什么”。
- 项目可以随时接入 Project Hub，也可以随时解绑。
- 解绑项目不能影响原项目本身。
- 同一个项目在不同电脑上的本地路径可能不同。
- Project Hub 的公共配置可以通过 Git 同步，但机器相关路径不能提交到 Git。

核心原则：

> Project Hub 管理项目，但不拥有项目。

---

# 2. 项目管理模型

每个被管理项目需要拥有一个稳定的 `project_id`。

例如：

```yaml
admin:
  name: 管理后台

api:
  name: API 服务

app:
  name: 用户端
```

以后所有任务、上下文和迭代都优先使用 `project_id` 引用项目，而不是直接使用本地绝对路径。

例如：

```text
admin：订单列表增加批量取消功能。

api：增加对应的批量取消接口。
```

系统根据 `project_id` 自动找到当前电脑上的实际项目路径。

---

# 3. 公共配置与本机配置分离

必须区分：

## 公共项目配置

可以提交 Git，在公司电脑、家里电脑等环境之间同步。

例如：

```text
projects.yaml
```

负责记录：

- project_id
- 项目名称
- 项目描述
- 项目上下文位置
- 是否启用
- 其他与机器无关的信息

示例：

```yaml
projects:
  admin:
    name: 管理后台
    context: ./context/admin.md
    enabled: true

  api:
    name: API 服务
    context: ./context/api.md
    enabled: true
```

---

## 本机路径配置

每台电脑独立维护：

```text
projects.local.yaml
```

例如公司电脑：

```yaml
paths:
  admin: D:/company/projects/admin-web
  api: D:/company/backend/api
```

家里电脑：

```yaml
paths:
  admin: /Users/me/Projects/admin-web
  api: /Users/me/Projects/api
```

`projects.local.yaml` 必须加入：

```gitignore
projects.local.yaml
```

同时提供：

```text
projects.local.example.yaml
```

作为新电脑初始化时的模板。

---

# 4. 项目接入与解绑

Project Hub 中的项目必须是松耦合关系。

需要支持以下概念：

```text
attach project
detach project
```

## Attach

将一个已有项目注册到 Project Hub。

需要建立：

```text
project_id
    ↓
项目公共信息
    ↓
项目 Context
    ↓
当前电脑本地路径
```

Attach 不复制项目源码。

---

## Detach

将项目从 Project Hub 的管理范围中移除。

Detach：

- 不删除项目源码。
- 不修改原项目。
- 不删除原项目 Git 仓库。
- 只解除 Project Hub 与项目之间的管理关系。
- 如果存在项目历史迭代记录，应尽量保留历史记录。

因此：

> detach ≠ delete

---

# 5. Context 设计

上下文分成不同层级，避免所有信息堆积到一个巨大文件。

## Global Context

记录所有项目共同遵守的工作规则。

例如：

```text
AGENTS.md
```

内容包括：

- 如何识别项目
- 如何读取项目 Context
- 如何处理迭代任务
- 如何执行代码修改
- 如何进行测试
- 如何汇报结果
- 多项目任务如何分发

---

## Project Context

每个项目拥有独立 Context。

例如：

```text
context/
├── admin.md
├── api.md
└── app.md
```

Context 主要保存长期稳定的信息，例如：

- 项目用途
- 技术栈
- 项目架构
- 重要目录
- 开发规范
- 业务规则
- 特殊约束
- 测试方式
- 构建方式
- AI 修改代码时需要长期知道的信息

不要把每次临时迭代任务不断追加到 Context。

---

# 6. Iteration 管理

具体迭代内容和长期 Context 分离。

建议：

```text
iterations/
├── current.md
└── archive/
```

`current.md` 表示当前正在处理的迭代。

例如：

```markdown
# Current Iteration

## admin

- 用户详情增加冻结账户功能
- 冻结后按钮变成解除冻结

## api

- 增加冻结/解除冻结接口
- 记录操作日志

## app

- 被冻结用户登录时显示冻结原因
```

未来可以将完成的迭代归档：

```text
iterations/archive/
├── 2026-09-01.md
├── 2026-09-08.md
└── ...
```

---

# 7. AI / Agent 工作方式

Project Hub 的最终目标是让我尽量只描述：

> 哪个项目 + 我要修改成什么样。

而不是让我重复描述：

- 项目在哪里
- 进入哪个目录
- 修改哪个文件
- 项目是什么技术栈
- 如何启动
- 如何测试
- 项目历史背景

Agent 收到：

```text
admin：用户搜索增加手机号和邮箱搜索，同时修复搜索按钮 loading 偶尔不消失的问题。
```

应该自动完成：

```text
读取 project_id
        ↓
读取 projects.yaml
        ↓
读取 projects.local.yaml
        ↓
找到项目实际路径
        ↓
加载 context/admin.md
        ↓
检查实际代码
        ↓
理解本次需求
        ↓
拆解修改任务
        ↓
修改代码
        ↓
检查关联影响
        ↓
执行测试 / lint / build
        ↓
输出结果
```

除非存在真正需要用户决策的歧义，否则不要要求用户手动指定具体文件。

---

# 8. 多项目迭代

一次输入可以同时包含多个项目。

例如：

```text
本轮迭代：

admin：
订单列表增加批量取消。

api：
增加批量取消接口。

app：
订单取消后增加状态提示。
```

Project Hub 应该根据项目 ID 分发任务。

不同项目之间保持独立上下文。

如果任务存在跨项目依赖，需要识别依赖关系，并合理确定执行顺序。

---

# 9. 建议目录结构

第一版采用：

```text
project-hub/
│
├── README.md
├── AGENTS.md
├── projects.yaml
├── projects.local.yaml
├── projects.local.example.yaml
├── .gitignore
│
├── context/
│   └── .gitkeep
│
├── iterations/
│   ├── current.md
│   └── archive/
│       └── .gitkeep
│
└── scripts/
```

其中：

```text
README.md
```

面向人，说明 Project Hub 怎么使用。

```text
AGENTS.md
```

面向 AI / Agent，定义统一执行规则。

```text
projects.yaml
```

公共项目注册表。

```text
projects.local.yaml
```

当前电脑的项目路径映射，不提交 Git。

```text
projects.local.example.yaml
```

本地路径配置模板。

```text
context/
```

保存各项目长期 Context。

```text
iterations/
```

保存当前以及历史迭代。

```text
scripts/
```

未来放项目注册、解绑、校验等自动化脚本。

---

# 10. 第一阶段实现要求

目前不要过度设计。

第一阶段优先实现一个：

> 简单、透明、AI 容易理解、人也容易手动修改的 Project Hub。

优先使用：

```text
Markdown
YAML
Git
```

暂时不要为了“平台化”引入数据库、Web 管理后台或者复杂服务。

先实现：

1. 项目注册表。
2. 本机路径映射。
3. 项目 Context。
4. 当前 Iteration。
5. Agent 工作规则。
6. 项目 attach / detach 基础机制。
7. 配置有效性检查。
8. README 使用说明。

---

# 11. 初始化任务

请根据以上需求初始化当前 `project-hub` 仓库。

要求：

1. 创建合理的目录结构。
2. 创建 `README.md`。
3. 创建 `AGENTS.md`。
4. 创建 `projects.yaml`。
5. 创建 `projects.local.example.yaml`。
6. 创建本机使用的 `projects.local.yaml`。
7. 确保 `projects.local.yaml` 被 `.gitignore` 忽略。
8. 创建 `context/`。
9. 创建 `iterations/current.md`。
10. 创建 `iterations/archive/`。
11. 设计简单的项目 attach / detach 方式。
12. 如果值得实现，可以在 `scripts/` 中提供轻量级辅助脚本。
13. 不要引入不必要的框架和依赖。

完成初始化后，请告诉我：

- 创建了哪些文件。
- 每个文件负责什么。
- 如何注册第一个项目。
- 如何配置当前电脑的项目路径。
- 以后我应该如何提交一次新的迭代需求。

目标是初始化完成以后，我只需要逐步把现有项目接入 Project Hub，而不需要重新设计这套结构。