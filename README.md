# Project Hub

多项目统一管理入口。这里只保存项目注册表、工作上下文和迭代记录，源码始终保留在各自独立仓库。

Hub 只负责映射和分发任务，不维护具体项目的实现细节。每轮迭代进入目标项目，读取其维护文档和适用规则，使用该项目的 CodeGraph 理解代码，再按项目自身要求修改、验证和更新文档。Hub Context 仅保存项目身份和文档入口，详细背景以目标项目为准。

**每轮新需求或修复，先 pull 目标项目当前所在的本地分支，成功后再修改。commit 和 push 由你明确决定。** 没有特殊说明时不切分支，改动和提交都留在该仓库当前检出的分支上。Hub 自身同样遵守；分支和异常处理详见 [AGENTS.md](AGENTS.md)。

## 文件用途

| 文件 | 用途 | Git 同步 |
| --- | --- | --- |
| AGENTS.md | Agent 执行顺序、先 pull 规则、项目定位约定 | 是 |
| projects.yaml | 所有环境共享的项目身份和背景入口 | 是 |
| environments/README.md | 环境目录说明与当前环境判定规则 | 是 |
| environments/&lt;env&gt;/projects.local.yaml | 该环境的项目路径和 SSH 映射 | 否 |
| environments/projects.local.example.yaml | 脱敏的本机配置模板 | 是 |
| context/_template.md | 新项目长期上下文模板 | 是 |
| context/&lt;id&gt;.md | 接入后创建的项目背景 | 是 |
| iterations/current.md | 本轮需求、同步和验证记录 | 是 |
| iterations/archive/ | 历史迭代 | 是 |
| docs/configuration.md | 字段、路径解析、接入、解绑及校验清单 | 是 |
| .gitignore | 排除机器信息和临时文件 | 是 |

各环境的实际路径按环境分目录保存：`environments/home/`（家里电脑）、`environments/work/`（公司电脑）、`environments/ssh/`（SSH 开发机），其中的 `projects.local.yaml` 被 Git 忽略，只存在于对应机器上。第一版直接维护 YAML，无安装依赖，无固定项目数量。

已接入以下项目：

| 项目名称 | project_id |
| --- | --- |
| 花盆APP | flowerpot-app |
| 花盆后台 | flowerpot-admin |
| 相册后台 | album-admin |
| 相册小程序 | album-miniapp |
| 相册APP | album-app |
| 正矿 | minerals-admin |

可以直接使用名称发起任务，例如“花盆APP：修复设备列表刷新问题”。其他环境接入同名项目时，复用这些 ID，仅添加该环境自己的路径映射。

## 注册第一个项目

例如要接入名为“管理后台”的项目，先检查是否存在同名记录；有则复用其 ID，没有则在 `projects.yaml` 写入：

```yaml
version: 1
projects:
  admin:
    name: 管理后台
    description: 管理后台前端
    context: context/admin.md
    enabled: true
```

复制 `context/_template.md` 为 `context/admin.md`，填写已知背景。在本环境的 `environments/<env>/projects.local.yaml` 写入实际位置：

```yaml
version: 1
environment: work
paths:
  admin:
    transport: local
    path: '${PROJECTS_ROOT}/admin-web'
```

在系统中设置 `PROJECTS_ROOT` 为本机项目父目录，或者直接把 path 改为实际绝对路径。相对路径也可用，例如 `../admin-web`，以 Hub 根目录为基准。环境变量由 Agent 解析，不是 YAML 自动执行的功能。

也可以直接告诉 Agent：“接入项目：管理后台，路径为……”，Agent 按同名复用规则维护这些文件。按 [配置校验清单](docs/configuration.md) 检查后即可使用。

## 家里电脑与 SSH

新环境获取 Hub 后，将 `environments/projects.local.example.yaml` 复制为 `environments/<env>/projects.local.yaml`（`home` 家里电脑、`work` 公司电脑、`ssh` SSH 开发机，其他环境新建同名目录），修改 environment 和 paths；只填写该环境实际拥有的项目。公共配置保存项目全集，各环境路径和数量独立。相同名称就是同一项目，继续使用已有 ID。

Agent 通过扫描 `environments/*/projects.local.yaml` 判断当前环境，每台机器只会有自己那一份；判定细则见 [environments/README.md](environments/README.md)。

在 SSH 服务器内部运行 Hub 时，按普通本地项目配置服务器路径。若从公司或家里电脑操作 SSH 项目，在本机映射中使用：

```yaml
paths:
  api:
    transport: ssh
    host: dev-server
    path: /srv/projects/api
```

`api` 需先注册；`dev-server` 是你已有的 SSH config 别名。实际连接和修改需要当前 Agent 环境支持 SSH 操作。本机配置不随 Git 同步，也不要把真实主机信息写入共享 Context。

## 提交迭代需求

直接描述项目名称或 ID 加需求即可，例如：

```text
admin：用户搜索支持手机号和邮箱，修复搜索按钮 loading 不消失。
api：增加相应搜索条件。
这次先改好并验证，不提交。
```

Agent 会解析当前环境位置，加载上下文，先同步各目标仓库当前所在的分支，再实现和验证。即使不写最后一句，也不会自动 commit 或 push。需要例外时明确说明，例如“本轮不要 pull”；需要提交或推送时明确给出指令。

任务需求、分发状态和简要结果写入 `iterations/current.md`，完成后归档到 `iterations/archive/`。技术和业务细节维护在目标项目文档中，Hub Context 只维护身份和文档入口。

## 解绑

“当前电脑解绑 admin”只删除本机映射。“全局停用 admin”设置公共 enabled 为 false。均保留源码、Git 仓库、上下文和迭代历史。详细流程见 [配置维护说明](docs/configuration.md)。
