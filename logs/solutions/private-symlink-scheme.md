# 方案：团队项目私有目录软链接与双层隔离

- **方案来源**：正矿项目 (minerals-admin)
- **适用场景**：团队协作项目需要维护个人私有文件（如 .codegraph/、架构笔记、AI 规则、本地脚本等），既要能在本地项目中透明读取，又要绝不提交到团队 Git，且能多端跨机器同步。

---

## 核心设计

采用 **「Private Project Hub + 本地软链接（Symlink/Junction）」** 机制：

`	ext
真实存储（Hub 私有 Git 管理）:
  project-hub/private/<project-id>/[mounts]

业务项目本地呈现:
  <project-root>/[mount] -> project-hub/private/<project-id>/[mount]
`

### 1. 跨平台软链接选型
- **Windows**：
  - 目录挂载：使用 **NTFS Junction**（junction）。普通用户免提权、免开发者模式限制即可创建。
  - 文件挂载：使用 **SymbolicLink**（ile）。
- **macOS / Linux**：
  - 统一使用原生标准软链接 ln -s。

### 2. 双重忽略机制（彻底防污染）
- **外层**：若团队已在 .gitignore 声明则正常忽略。
- **内层**：在业务项目的 .git/info/exclude 中自动注入规则（例如 /.codegraph、/docs），仅对本机当前 clone 有效，团队 clone 不会产生任何 git 记录。

### 3. 安全迁移流程（--migrate）
1. 检查目标项目团队 Git 是否正在跟踪对应文件，若跟踪则严格拒绝迁移。
2. 对原实体文件/目录执行 SHA-256 全量快照递归计算。
3. 复制到 Hub 私有目录并验证哈希完全一致。
4. 原实体改名为临时备份 *.hub-migration-<uuid>。
5. 建立软链接并校验链接目标。
6. 校验无误后彻底删除临时备份。

---

## 落地指引

1. 在 projects.yaml 中增加 private_mounts 配置。
2. 运行 
ode scripts/setup-links.mjs --env <env> --project <id> --migrate 完成首次迁移。
3. 在新机器上只需运行 
ode scripts/setup-links.mjs --env <env> 一键恢复。
