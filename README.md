# Project Hub

多项目统一管理入口。这里只保存项目注册表、工作上下文和迭代记录，源码始终保留在各自独立仓库。

Hub 只负责映射和分发任务，不维护具体项目的实现细节。每轮迭代进入目标项目，读取其维护文档和适用规则，使用该项目的 CodeGraph 理解代码，再按项目自身要求修改、验证和更新文档。Hub Context 仅保存项目身份和文档入口，详细背景以目标项目为准。

**每轮新需求或修复，先 pull 目标项目当前所在的本地分支，成功后再修改；任务完成并验证通过后，默认再 pull 一次并 push 回该分支。** 没有特殊说明时不切分支，改动和提交都留在该仓库当前检出的分支上。Hub 自身同样遵守；分支和异常处理详见 [AGENTS.md](AGENTS.md)。

## 文件用途

| 文件/目录 | 用途 | Git 同步 |
| --- | --- | --- |
| AGENTS.md | Agent 执行顺序、先 pull / 完成后 push 规则、项目定位约定、留痕规范 | 是 |
| projects.yaml | 所有环境共享的项目身份和背景入口（含 private_mounts） | 是 |
| private/ | 所有私有需求项目的统一收拢大文件夹（按 `<id>/` 物理隔离与扩展） | 是 |
| logs/ | 统筹日志：含 Hub 自身留痕（`hub/`）、跨项目看板（`projects/`）、方案库（`solutions/`） | 是 |
| environments/README.md | 环境目录说明与当前环境判定规则 | 是 |
| environments/&lt;env&gt;/projects.local.yaml | 该环境的项目路径和 SSH 映射 | 是 |
| environments/projects.local.example.yaml | 脱敏的本机配置模板 | 是 |
| context/_template.md | 新项目长期上下文模板 | 是 |
| context/&lt;id&gt;.md | 接入后创建的项目背景 | 是 |
| iterations/current.md | 本轮需求、同步和验证记录 | 是 |
| iterations/archive/ | 历史迭代 | 是 |
| docs/configuration.md | 字段、路径解析、私有挂载、接入、解绑及校验清单 | 是 |
| scripts/setup-links.mjs | 私有目录软链接初始化、迁移与解绑脚本 | 是 |
| .gitignore | 排除机器信息和临时文件 | 是 |

各环境的实际路径按环境分目录保存：`environments/home/`（家里电脑）、`environments/work/`（公司电脑）、`environments/ssh/`（SSH 开发机）。这些 `projects.local.yaml` 随 Git 同步，每台机器都能看到全部环境的位置；当前环境以你在任务开头声明的为准，细则见 [environments/README.md](environments/README.md)。文件里只放路径，不放任何凭据。第一版直接维护 YAML，无安装依赖，无固定项目数量。

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

映射文件随 Git 同步，每台机器都能看到全部环境，所以**每次发任务先在开头说明当前是哪个环境**。Agent 按你说的环境去查映射和路径，路径对不上就停下来问你是不是环境说错了，不会自己猜。判定细则见 [environments/README.md](environments/README.md)。改映射时只动自己环境那一份。

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
当前是 ssh。
admin：用户搜索支持手机号和邮箱，修复搜索按钮 loading 不消失。
api：增加相应搜索条件。
这次先改好并验证，不提交。
```

开头那句环境声明每次都写，Agent 据此去对应的 `environments/<env>/projects.local.yaml` 找路径；找不到或对不上会停下来问你，不会换个环境接着试。

Agent 会解析当前环境位置，加载上下文，先同步各目标仓库当前所在的分支，再实现和验证；验证通过后默认再 pull 一次并推送本轮改动过的每个仓库（含 Hub 自身）。不想提交或推送时就写上面示例里的最后一句；其他例外同样明确说明，例如“本轮不要 pull”。PR、合并、发布和部署仍需另行给出指令。

任务需求、分发状态和简要结果写入 `iterations/current.md`，完成后归档到 `iterations/archive/`。技术和业务细节维护在目标项目文档中，Hub Context 只维护身份和文档入口。

## 私有目录与软链接（Private Mounts）

项目中的私有文件或目录（如 `.codegraph/`、私有文档等）“住”在 Project Hub 的 `private/<project_id>/` 下，通过本地软链接出现在业务项目中，并在业务仓库的 `.git/info/exclude` 中自动忽略，不污染团队 Git。

在新电脑初始化或需要一键恢复软链接时，执行：

```bash
node scripts/setup-links.mjs --env <env>
```

指定单个项目迁移或解绑软链接：

```bash
# 安全迁移已有私有目录
node scripts/setup-links.mjs --env <env> --project <id> --migrate

# 仅解除业务项目内的软链接（保留 Hub 私有真实数据）
node scripts/setup-links.mjs --env <env> --project <id> --detach
```

详细规范与说明见 [配置维护说明](docs/configuration.md#私有挂载private_mounts)。

## 留痕日志与跨项目方案库（Logs & Solutions）

为了实现系统演进全流程可追溯并沉淀通用知识，Hub 建立了统一的日志与方案中枢：

- **`logs/hub/`（统筹项目自身留痕）**：严格遵循小项目的留痕规则，记录 Hub 自身的配置、工具脚本、规则改动的每一次流水与详细说明。
- **`logs/projects/`（跨项目变更看板）**：按时间倒序记录通过 Hub 调度修改的各业务项目的全局时间线流水。
- **`logs/solutions/`（跨项目方案库）**：从各个子项目实践中提炼出的高价值通用方案（如 Symlink 方案、构建拆包优化等），供所有项目学习复用。
- **`private/<project_id>/logs/`（私有需求专属日志）**：凡具有私人需求的项目，其业务细节、内部排障和定制需求写入各自的私有目录下，与公共日志彻底物理隔离。

## 解绑

“当前电脑解绑 admin”只删除本机映射。“全局停用 admin”设置公共 enabled 为 false。均保留源码、Git 仓库、上下文和迭代历史。详细流程见 [配置维护说明](docs/configuration.md)。
