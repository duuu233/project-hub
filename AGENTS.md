# Project Hub 工作约定

## 最高优先级工作流程：先 pull，再修改

除非用户本次明确说明例外，每次开始新需求、问题修复或新一轮迭代，都必须对本次涉及的每个 Git 仓库先同步**当前所在的本地分支**，成功后才能改代码或其他受版本控制的文件。Project Hub 自身也适用。一次迭代内不必每改一个文件就重复 pull；用户提出新一轮工作时重新执行。

**工作分支就是仓库当前检出的分支。** 没有特殊说明时不切分支，修改和提交都发生在这个分支上；例如某仓库停在 `feature-v1.8.3`，本轮的同步、修改和提交就都在 `feature-v1.8.3`。要换分支必须由用户本次明确指定。

1. 解析项目和当前环境路径，读取 Hub 上下文与目标仓库的 `AGENTS.md`。这些只读操作可以在 pull 前进行。
2. 检查仓库根目录、`git status --short --branch`、当前分支、remote 和 upstream。存在未提交修改时不得自动 stash、覆盖、清理或带着改动切分支；先说明情况，请用户决定处理方式。
3. 确定工作分支：默认就是第 2 步读到的当前分支，不做切换。配置中的 `default_branch` 只记录该仓库的远端默认分支，供判断和汇报使用，不是自动切换目标。用户本次指定了分支时才 checkout，且该分支需已存在或经用户确认新建。
4. 工作区干净后，对工作分支使用其已配置的 upstream 执行 `git pull --ff-only`。没有 upstream 时（例如只存在于本地的功能分支），不猜测对应远端分支：说明情况，由用户决定是显式 `git pull --ff-only <remote> <branch>`、还是本轮直接在本地分支上工作。不要自动更改或新建 upstream。
5. 同步完成后，重新读取有变化的上下文，在工作分支上实现。不要擅自把默认分支合并或 rebase 到工作分支，也不要为了“保持最新”自动切到默认分支再切回。
6. pull 失败、分支分叉、冲突、鉴权失败或远端不可达时停止该项目的修改，说明原因；不得以“稍后再同步”跳过。多项目任务需先完成所有相关项目的同步，再开展相互依赖的修改。
7. 经确认的全新空仓库允许在先尝试 pull 并报告远端无分支后做初始化；这不构成已有项目跳过 pull 的理由。非 Git 项目先说明情况，由用户决定是否继续。

**commit 和 push 均由用户决定。未得到明确指令，不自动 git add、commit、push、创建 PR、合并、发布或部署。** 得到指令后提交到当前工作分支，push 到该分支已配置的 upstream；分支没有 upstream 时先说明，由用户决定是否 `push -u <remote> <branch>`，不擅自选远端分支、不强推。完成后报告改动、验证结果、分支和提交号，保留工作区供用户审阅。首次初始化不自动创建提交。

## 项目身份和路径

- `projects.yaml` 是共享注册表；`environments/<env>/projects.local.yaml` 是各执行环境的映射（`environments/home/` 家里电脑、`environments/work/` 公司电脑、`environments/ssh/` SSH 开发机）。映射文件随 Git 同步，里面只放路径和 SSH 别名；**密码、私钥、token 一律不得提交**。
- **当前环境以用户在任务开头声明的为准**（映射随 Git 同步，本机能看到全部环境，不按文件是否存在判断）。按声明的环境查映射、解析路径，核对目录存在、是 Git 根目录且仓库对得上；**任一项对不上立即停止**，不改文件、不换环境、不创建目录、不 clone、不猜路径，说明卡在哪一步并提示用户确认是否把当前环境说错了。用户未声明时先问。细则见 `environments/README.md`。改映射只动自己环境那一份。根目录若残留旧版 `projects.local.yaml`，先迁移到对应环境目录。
- 使用 `project_id` 定位；也接受精确的项目名称。**相同名称视为同一个逻辑项目**，复用已有 ID、上下文和历史，不因电脑、目录或连接方式创建重复项目。名称去除首尾空白后按大小写精确比较，不做模糊合并；多个匹配项属于配置错误，先解决再修改。
- ID 创建后保持稳定，建议使用小写英文字母、数字和连字符；改名不改 ID。绑定同名目录前核实用户意图或仓库身份，目录名本身不等于项目名称。
- 每个环境只映射实际存在的项目；公共注册表数量与本机映射数量可以不同。未映射表示当前环境不可用，不自动创建、clone 或猜测路径。
- `enabled: false` 表示全局停用；本机解绑只移除当前环境映射，不影响其他环境。
- `transport: local`：`path` 为绝对路径，或相对于 Hub 根目录的路径；支持开头的 `~/` 和 `${VARIABLE}` 环境变量占位符。解析前检查变量存在，禁止执行路径中的 shell 表达式；解析后验证目录和仓库身份。
- `transport: ssh`：`host` 是本机 SSH config 别名，`path` 必须为远端绝对路径。使用 SSH 工具在远端执行状态检查、pull、修改和验证，不把远端路径当本地路径。工具不支持远程编辑或连接失败时说明阻塞，不暗中改本地副本。凭据交由 SSH 管理。
- 在 SSH 服务器内运行 Agent 时，把服务器当独立环境，使用 `environments/ssh/projects.local.yaml` 和 `transport: local`。

## 上下文和执行

### 职责边界：Hub 只负责映射和分发

- Hub 负责识别项目、解析环境路径、分发需求和记录任务状态，不负责制定或维护目标项目的实现细节。
- 每次迭代或问题修复，进入目标项目后必须先读取其 `AGENTS.md` 及适用的目录级规则，查看该项目维护的文档入口和索引，例如 `AI_CONTEXT.md`、`README.md`、架构说明、开发规范、业务说明、接口文档及本次任务相关文档。不能仅凭 Hub 中的简要 Context 开始改代码。
- 目标项目有 `.codegraph/` 时，理解或定位代码必须先使用 CodeGraph；随后按需核对当前源码与相关文档。索引维护也遵循目标项目的规则，不由 Hub 另建一套规范。
- pull 前允许只读检查规则；完成默认分支 pull 后，重新检查更新过的规则和文档，再实施修改。具体设计、代码、测试、构建以及文档更新均在目标项目内按其自身要求执行。
- 代码变更涉及需要同步维护的文档时，按目标项目约定更新其文档。项目内部细节、技术决策和维护记录应留在目标项目，Hub Context 只保留身份、用途及文档入口，不复制维护另一份细节。
- Hub 的先 pull、由用户决定 commit / push 等统一约定持续适用；具体项目文档不能被 Hub 摘要替代。若要求冲突，明确说明并按指令优先级处理。

1. 读取公共注册表、本机映射和 `context/<project_id>.md`，按 `docs/configuration.md` 校验相关配置。
2. 上述流程适用于通过 Hub 发起的外部项目任务，即使目标源码不在 Hub 目录下。目标仓库规则也需遵循；规则冲突时明确说明并按指令优先级处理。
3. 严格完成先 pull 流程，再检查代码、识别跨项目依赖、执行最小必要修改。没有用户或目标仓库规则要求时，不自动启动子代理。
4. Hub 项目 Context 仅保存稳定的身份、用途和项目内文档入口；详细背景维护在目标项目。当次需求、分发状态及简要结果放入 `iterations/current.md`，具体实施记录遵循目标项目约定。未完成的迭代不得直接覆盖。
5. 执行目标项目适用的测试、lint 或构建；不能运行时说明原因，不宣称通过。
6. 汇报涉及项目、同步分支和结果、修改内容、验证结果、剩余事项；不自动提交或推送。完成迭代可归档为 `iterations/archive/YYYY-MM-DD-简述.md`，同日文件不得覆盖。

### 操作留痕与私有需求扩展规范

1. **统筹项目自身留痕（`logs/hub/`）**：
   - 每次对 Project Hub 自身进行代码改动、配置调整、脚本开发或规则升级，均须遵循小项目严格留痕规范，在 `logs/hub/activity.md` 登记最新流水，并在重大改动时产出 `logs/hub/YYYY-MM-DD-操作.md` 记录背景、改动清单与验证结果。
2. **跨项目变更看板（`logs/projects/`）**：
   - 每次通过 Hub 完成各业务子项目的任务修改后，在 `logs/projects/activity.md` 追加全局变更记录（日期、项目、环境、工作分支、改动摘要、交付状态）。
3. **跨项目通用方案学习（`logs/solutions/`）**：
   - 从各子项目的实践中提炼高价值技术方案（如打包优化、跨平台隔离等），沉淀到 `logs/solutions/` 通用方案库，供所有项目学习借鉴。
4. **私人需求大文件夹物理隔离与扩展（`private/`）**：
   - 所有具有私人需求的项目，统一收拢在 `private/` 大文件夹下，按 `<project_id>/` 建立子目录进行物理隔离（如 `private/minerals-admin/`），内部包含 `logs/`（私人业务流水）、`docs/`、`instructions/` 等。
   - 正矿等私人项目的具体业务需求与排障细节写入 `private/<project_id>/logs/`，不与统筹公共日志混杂。
   - 未来其他项目若有私人需求，直接在 `private/` 下新建项目 ID 目录并配置 `private_mounts` 即可平滑扩展。

## 接入、解绑与校验

按 `docs/configuration.md` 操作。所有 attach / detach 只修改 Hub 的注册表、上下文及本机映射，不复制、移动、删除或修改被管理项目源码。保留解绑项目上下文与迭代历史。

<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->
