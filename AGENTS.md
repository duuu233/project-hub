# Project Hub 工作约定

## 最高优先级工作流程：先 pull，再修改

除非用户本次明确说明例外，每次开始新需求、问题修复或新一轮迭代，都必须对本次涉及的每个 Git 仓库先同步本地默认分支，成功后才能改代码或其他受版本控制的文件。Project Hub 自身也适用。一次迭代内不必每改一个文件就重复 pull；用户提出新一轮工作时重新执行。

1. 解析项目和当前环境路径，读取 Hub 上下文与目标仓库的 `AGENTS.md`。这些只读操作可以在 pull 前进行。
2. 检查仓库根目录、`git status --short --branch`、当前分支、remote 和 upstream。存在未提交修改时不得自动 stash、覆盖、清理或带着改动切分支；先说明情况，请用户决定处理方式。
3. 确定本地默认分支：优先本机项目映射中的 `default_branch`，其次公共项目的 `default_branch`，再根据远端默认分支及其对应本地分支确定。不能把当前功能分支自动当成默认分支，也不能硬编码 main/master。无法确定时询问用户。
4. 工作区干净后切换到已确定的本地默认分支，使用其已配置的 upstream 执行 `git pull --ff-only`。没有 upstream 时，只有核实远端和对应分支后才可显式 `git pull --ff-only <remote> <branch>`；不能猜测。不要自动更改 upstream。
5. pull 成功后，重新读取有变化的上下文，开始实现。默认基于已同步的默认分支工作；用户指定功能分支时，仍先完成默认分支同步，再切回指定分支。不要擅自把默认分支合并或 rebase 到功能分支。
6. pull 失败、分支分叉、冲突、鉴权失败或远端不可达时停止该项目的修改，说明原因；不得以“稍后再同步”跳过。多项目任务需先完成所有相关项目的同步，再开展相互依赖的修改。
7. 经确认的全新空仓库允许在先尝试 pull 并报告远端无分支后做初始化；这不构成已有项目跳过 pull 的理由。非 Git 项目先说明情况，由用户决定是否继续。

**commit 和 push 均由用户决定。未得到明确指令，不自动 git add、commit、push、创建 PR、合并、发布或部署。** 完成后报告改动、验证结果和未解决问题，保留工作区供用户审阅。首次初始化不自动创建提交。

## 项目身份和路径

- `projects.yaml` 是共享注册表；`projects.local.yaml` 是当前执行环境的私有映射。不得提交本机配置、绝对路径、SSH 主机信息或凭据。
- 使用 `project_id` 定位；也接受精确的项目名称。**相同名称视为同一个逻辑项目**，复用已有 ID、上下文和历史，不因电脑、目录或连接方式创建重复项目。名称去除首尾空白后按大小写精确比较，不做模糊合并；多个匹配项属于配置错误，先解决再修改。
- ID 创建后保持稳定，建议使用小写英文字母、数字和连字符；改名不改 ID。绑定同名目录前核实用户意图或仓库身份，目录名本身不等于项目名称。
- 每个环境只映射实际存在的项目；公共注册表数量与本机映射数量可以不同。未映射表示当前环境不可用，不自动创建、clone 或猜测路径。
- `enabled: false` 表示全局停用；本机解绑只移除当前环境映射，不影响其他环境。
- `transport: local`：`path` 为绝对路径，或相对于 Hub 根目录的路径；支持开头的 `~/` 和 `${VARIABLE}` 环境变量占位符。解析前检查变量存在，禁止执行路径中的 shell 表达式；解析后验证目录和仓库身份。
- `transport: ssh`：`host` 是本机 SSH config 别名，`path` 必须为远端绝对路径。使用 SSH 工具在远端执行状态检查、pull、修改和验证，不把远端路径当本地路径。工具不支持远程编辑或连接失败时说明阻塞，不暗中改本地副本。凭据交由 SSH 管理。
- 在 SSH 服务器内运行 Agent 时，把服务器当独立环境，使用服务器自己的 `projects.local.yaml` 和 `transport: local`。

## 上下文和执行

1. 读取公共注册表、本机映射和 `context/<project_id>.md`，按 `docs/configuration.md` 校验相关配置。
2. 上述流程适用于通过 Hub 发起的外部项目任务，即使目标源码不在 Hub 目录下。目标仓库规则也需遵循；规则冲突时明确说明并按指令优先级处理。
3. 严格完成先 pull 流程，再检查代码、识别跨项目依赖、执行最小必要修改。没有用户或目标仓库规则要求时，不自动启动子代理。
4. 只把长期稳定的信息写入项目 Context；当次需求与执行记录放入 `iterations/current.md`。未完成的迭代不得直接覆盖。
5. 执行目标项目适用的测试、lint 或构建；不能运行时说明原因，不宣称通过。
6. 汇报涉及项目、同步分支和结果、修改内容、验证结果、剩余事项；不自动提交或推送。完成迭代可归档为 `iterations/archive/YYYY-MM-DD-简述.md`，同日文件不得覆盖。

## 接入、解绑与校验

按 `docs/configuration.md` 操作。所有 attach / detach 只修改 Hub 的注册表、上下文及本机映射，不复制、移动、删除或修改被管理项目源码。保留解绑项目上下文与迭代历史。

<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->
