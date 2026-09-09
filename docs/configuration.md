# 配置格式与维护

第一版由人或 Agent 直接维护 YAML，不依赖框架或脚本。路径占位符由 Agent 在执行时解析，YAML 自身不会自动展开变量。尚未提供自动发现目录或自动 SSH 同步服务。

## 公共配置

`projects.yaml` 包含 `version: 1` 和 `projects` 映射。每个键是稳定的 project_id，每项包含：

| 字段 | 规则 |
| --- | --- |
| name | 必填、非空、全局唯一；首尾不留空白；同名复用已有 ID |
| description | 可选，机器无关的说明 |
| context | 必填，Hub 内现存的相对 Markdown 路径 |
| enabled | 必填，布尔值 true / false |
| default_branch | 可选，该仓库经过确认的**远端默认分支**，仅供判断和汇报；工作分支按仓库当前检出的分支，不据此自动切换 |

公共注册表是所有环境项目的集合，不能因为公司电脑没有某个项目就把它全局删除。

## 环境映射

环境映射保存在 `environments/<env>/projects.local.yaml`，随 Git 同步，各环境的映射彼此可见；当前用哪一份以用户在任务开头声明的环境为准，环境目录名与文件内 `environment` 字段一致（当前使用 `home` 家里电脑、`work` 公司电脑、`ssh` SSH 开发机；新增环境新建目录即可）。当前环境的判定规则见 `environments/README.md`。

该文件包含 `version: 1`、非空的 `environment` 和 `paths` 映射。paths 的键必须是公共注册表中已存在的 ID；可以只配置其中一部分。每个 ID 在一个配置中只能有一个执行位置。

本地位置需要 `transport: local`、非空 `path`；远程位置需要 `transport: ssh`、SSH 别名 `host`、远端绝对 `path`。两种位置均可选填 `default_branch`，其优先级高于公共配置。不存密码、私钥和 token；这些文件会进入 Git 历史，只写路径和 SSH 别名。

本地路径解析顺序：展开 `${VARIABLE}`（未定义则报错）→ 展开开头 `~/` → 相对路径以 Hub 根目录为基准转绝对路径 → 检查目录、Git 根目录及项目身份。Windows 推荐正斜杠；使用引号包住路径。绝不通过 eval 或执行字符串来解析路径。

SSH 路径不在本机展开变量；要求填写远端绝对路径。所有远程命令要正确引用路径，不能直接拼接未转义配置内容。连接或工具能力不足时停止对应任务。

若同一机器有多个工作副本，当前只选择一个映射；切换副本时更新本机映射，复用同一个 ID。不要创建重复公共项目。

## 私有挂载（private_mounts）

在团队协作项目中，个人的私有文件或目录（如 `.codegraph/`、`docs/` 私有文档、个人笔记、指令规则等）通过软链接（symlink/junction）挂载到业务项目中，真实文件则由 Project Hub 的 `private/<project_id>/` 目录保存在私有 Git 仓库中统一同步。

在 `projects.yaml` 的项目定义下配置 `private_mounts`：

```yaml
projects:
  minerals-admin:
    name: 正矿
    context: context/minerals-admin.md
    enabled: true
    private_mounts:
      .codegraph:
        target: .codegraph
        type: directory
      docs:
        target: docs
        type: directory
      AGENTS.md:
        target: instructions/AGENTS.md
        type: file
      AI_CONTEXT.md:
        target: instructions/AI_CONTEXT.md
        type: file
      logs:
        target: logs
        type: directory
```

- **挂载键名**（如 `docs`、`logs`、`AGENTS.md`）：在业务项目根目录下创建的软链接名称。
- `target`：相对于 `project-hub/private/<project_id>/` 的存储路径（禁止绝对路径或 `..` 越界）。
- `type`：`directory` 或 `file`。在 Windows 下目录创建 NTFS Junction，文件创建 SymbolicLink；类 Unix 系统创建标准软链接。

### 私人需求大文件夹（private/）与扩展机制

所有具有私人需求的项目，其非公开资产统一存放在 `private/` 大文件夹下，按项目 ID 建立子目录（如 `private/minerals-admin/`），彼此物理隔离。未来任何其他项目（如 `flowerpot-admin`）若产生私有需求，直接在 `private/` 下新建同名子目录并在 `projects.yaml` 增加 `private_mounts` 即可平滑扩展。

### 管理脚本与安全机制

使用 `scripts/setup-links.mjs`（或 `scripts/setup-links.sh`）进行自动化挂载与解绑：

1. **新电脑/新环境恢复挂载**：
   ```bash
   node scripts/setup-links.mjs --env work
   ```
   自动遍历当前环境已映射项目，将 `private/` 内的私有目录/文件建立软链接，并在业务仓库的 `.git/info/exclude` 中自动忽略，确保业务仓库 `git status` 干净，不污染团队 Git。
2. **首次安全迁移已有私有目录**：
   ```bash
   node scripts/setup-links.mjs --env work --project minerals-admin --migrate
   ```
   采用快照对比、原子备份、建立软链接后清理原备份的安全流程，保证数据不丢失、不损坏；若私有目标已存在则拒绝覆盖。
3. **试运行（Dry-run）**：
   ```bash
   node scripts/setup-links.mjs --env work --dry-run
   ```
4. **解绑软链接（Detach）**：
   ```bash
   node scripts/setup-links.mjs --env work --project minerals-admin --detach
   ```
   仅解除业务项目内的软链接，绝对不删除 Hub 内的真实文件，不影响业务项目源码与 Git 历史。

### 各环境挂载状态与冲突处理

`private_mounts` 定义在共享的 `projects.yaml` 里，三个环境读的是同一份，挂载点名称与 `private/<project_id>/` 内的目标路径天然一致；每台机器要做的只是本机执行一次 `setup-links` 把链接建出来。归属口径：所有项目都按「文档 + CodeGraph」长期维护，但个人自有仓库（`flowerpot-app`、`flowerpot-admin`、`album-app`、`album-admin`、`album-miniapp`）的 `AGENTS.md`、`AI_CONTEXT.md`、`docs/` 都提交在各自仓库里，`.codegraph/` 写在各自 `.gitignore` 中、每台机器本地生成，一律不进 Hub、不配 `private_mounts`。只有 `minerals-admin`（正矿）是企业团队仓库，私人内容不能提交进去，才把这几样迁到 `private/minerals-admin/` 并用软链接挂回业务仓库。各环境正矿仓库的物理路径不同，分别写在自己的 `environments/<env>/projects.local.yaml` 里，挂载定义共用同一份，三端最终指向 Hub 的同一份文档与索引。

| 环境 | 正矿仓库位置 | 挂载状态 |
| --- | --- | --- |
| work | `D:/Work/zk/minerals-frontend` | 2026-09-08 已挂载（NTFS Junction / SymbolicLink） |
| ssh | `/pgdata/pg/dh/minerals-frontend` | 2026-09-09 已挂载（标准软链接，5 个挂载点全部建立） |
| home | 未映射 | 该机器没有正矿仓库；日后 clone 后先在 `environments/home/projects.local.yaml` 补映射，再执行 `node scripts/setup-links.mjs --env home --project minerals-admin` |

冲突处理：当业务仓库里已存在同名实体目录/文件、而 Hub 的私有目标也已存在时，脚本直接报 `Real source exists` 并拒绝执行，两边都不覆盖，也不能用 `--migrate` 绕过（`--migrate` 只适用于私有目标尚不存在的首次迁移）。正确做法是先判断本机那份内容是否需要保留：需要就复制进 `private/<project_id>/` 的对应位置、校验一致后再删除仓库内原件，确认无用才直接删除，然后重新执行脚本走 `mount`。2026-09-09 在 ssh 环境遇到的 `docs/build-opt/`（2026-08-25 打包优化留下的原始日志、指标与脚本，24 个文件 / 601894 字节）即按此并入 `private/minerals-admin/docs/build-opt/`，挂载后在仓库内仍是原来的 `docs/build-opt/` 路径。

挂载完成后确认 CodeGraph。CLI 每台机器各装一次（自带运行时，装完提供 `codegraph` 命令）：

```bash
npm i -g @colbymchenry/codegraph   # 2026-09-09 在 ssh 装的是 1.6.0
```

**索引库 `codegraph.db` 不进版本控制**，与其余项目一致（它们的 `.gitignore` 都忽略整个 `.codegraph/`），已在 `private/minerals-admin/.codegraph/.gitignore` 里忽略；Hub 只跟踪同目录下人工维护的 `task-cache/`。索引是可再生成的派生物：每台机器拉到新代码后自己跑 `codegraph sync` 即可（正矿 629 个文件全量重解析约 16 秒）。这样避免两台机器同时提交 33MB 二进制造成不可合并的冲突，也不让 Hub 仓库被历次快照撑大。

`.codegraph/` 仍然保留挂载，是为了让索引和 `task-cache/` 跟其它私有资料放在同一处统一维护；顺带说明，正矿团队仓库自己的 `.gitignore` 第 26、29~31 行本来就忽略了 `.codegraph/`、`/AGENTS.md`、`/AI_CONTEXT.md`、`/docs/`，脚本写进 `.git/info/exclude` 的那几条是双保险，真正只靠 exclude 兜底的是 `logs/`。

## Attach（接入）

1. 修改 Hub 受控配置前，按 AGENTS.md 完成 Hub 的默认分支 pull。
2. 获取项目名称和本环境位置；检查公共注册表是否已有同名项目。已有则复用 ID；没有才新增 ID 和公共记录。
3. 新项目复制 `context/_template.md` 为 `context/<id>.md`，填写身份、用途和项目内文档入口。实现细节由目标项目自己的维护文档负责，Hub 不复制维护。已有 Context 不覆盖；重新接入停用项目时按用户接入意图恢复 enabled。
4. 在本机 `paths` 下添加位置。可以只注册公共信息暂不映射；任务执行前必须存在有效映射。
5. 按下面清单校验。接入本身只读取目标项目，不对目标仓库执行写入。

## Detach（解绑）

- 默认仅本环境解绑：删除本机 `paths.<id>`，保留公共注册表和 Context。
- 用户明确全局停用：把公共 `enabled` 改为 false；其他环境映射可以保留，但不得执行任务。
- 只有用户明确要求删除公共注册记录时才移除该记录；告知其他环境需同步清理悬空映射。仍保留 Context 和历史。
- 以上操作不删除或移动源码，不删除 `.git`，也不清理项目文件。

## 配置校验清单

每次接入、解绑、映射变更后，以及运行任务前检查相关项：

1. 两个配置版本均为 1；YAML 使用空格缩进，无重复键；projects 和 paths 均为映射（空映射写 `{}`）。
2. ID 非空且稳定，推荐匹配 `^[a-z][a-z0-9-]*$`；name 去除首尾空白后唯一，同名项目没有多个 ID。
3. 必填字段完整，enabled 是布尔值；Context 是 Hub 内实际存在的文件，不能越出 Hub。
4. 本机映射不存在未知 ID；公共项目未映射不是错误，只表示当前环境不可用。全局停用项目不能执行。
5. transport 合法，位置字段齐全；本地环境变量存在，解析后的目录存在，路径指向正确项目的 Git 根目录；SSH 路径在远端检查。用户声明的环境里解析不出有效路径时停止并请用户确认环境，不要改用其他环境的映射。
6. 分支和 upstream 在实际仓库核实；不要把配置中的示例值当事实。工作分支以当前检出的分支为准，`default_branch` 只是远端默认分支的记录。
7. 环境映射随 Git 同步：`git ls-files environments` 应能看到各环境的 `projects.local.yaml`。提交前逐行确认其中只有路径、`transport`、`host` 别名和 `default_branch`，没有密码、私钥、token 或真实主机地址。
8. `git diff --check` 应通过；审阅 `git diff` 与新增文件，确认除环境映射外的共享文件没有本机路径，且任何文件都没有 SSH 主机地址或凭据。

静态校验不能证明 SSH 可连接或远端仓库存在；执行前必须实际核实。未经检查的项目标记为待验证，不宣称通过。
