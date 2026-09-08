# Project Hub 自身操作总流水

记录 Project Hub 自身架构、脚本工具、工作规则与配置维护的每一次操作。

---

## 操作流水（最新在最前）

### 2026-09-08：家里环境项目映射与当前分支同步
- **环境**：home（家里电脑）
- **分支**：main
- **操作类型**：环境接入与仓库同步
- **实施**：新增 `environments/home/projects.local.yaml`，按项目文档与仓库身份复用花盆、相册系列 5 个既有项目 ID；正矿本机不存在，不添加映射。Hub 自身先完成 `git pull --ff-only`，当前为 `2d9633d`。
- **同步结果**：花盆 APP、相册 APP、相册后台、相册小程序均在当前 `main` 分支拉取成功，并完成已有 CodeGraph 索引同步；花盆后台因 `dist.zip` 未提交修改，等待用户决定处理方式。
- **验证范围**：核对目录、Git 根目录、项目身份、当前分支和 `origin/main` upstream；本轮仅接入与同步，不执行业务构建或测试。
- **交付状态**：映射与记录保留在工作区，未提交、未推送；详见 `iterations/current.md` 本轮记录。此前迭代原文保留。

---

### 2026-09-08：多维度日志留痕体系与跨项目方案库建设
- **环境**：work（公司电脑）
- **分支**：main
- **操作类型**：架构与日志体系增强
- **需求与实施**：
  - 建立统筹层全局日志目录 logs/：
    - logs/hub/：Project Hub 自身操作的每一次留痕（遵循子项目留痕规则）；
    - logs/projects/：记录通过 Hub 统筹修改各业务项目的全局变更看板；
    - logs/solutions/：从各业务子项目中提炼、学习并沉淀的跨项目通用方案库。
  - 规范私有大文件夹 private/：所有具有私人需求的项目统一收拢在 private/<project_id>/ 下，通过项目 ID 物理隔离，支持未来无限扩展。
  - 正矿项目专用私人日志沉淀于 private/minerals-admin/logs/，并作为 private_mounts 挂载到正矿本地。
- **验证**：软链接挂载测试通过、业务仓库 Git 干净，单元测试 6/6 全过。
- **详见记录**：[2026-09-08-多维度日志留痕体系与跨项目方案库建设.md](2026-09-08-多维度日志留痕体系与跨项目方案库建设.md)

---

### 2026-09-08：私有目录 Symlink 管理方案与自动化脚本落地
- **环境**：work（公司电脑）
- **分支**：main
- **操作类型**：核心能力建设
- **需求与实施**：
  - 根据《Project Hub 私有目录 Symlink 方案.md》，实现 scripts/setup-links.mjs 和 scripts/setup-links.sh，支持单项目/批量恢复、安全迁移（--migrate）与解绑（--detach）。
  - 在 projects.yaml 增加 private_mounts 规范；调整根级 .gitignore 放行 private/ 内的项目级 .codegraph。
  - 编写并运行原生测试套件 scripts/setup-links.test.mjs，包含 6 组自动化测试。
  - 将正矿（minerals-admin）已有私有文档与 CodeGraph 安全迁移至 private/minerals-admin/，业务项目原物理实体彻底删除并替换为 NTFS 链接。
- **验证**：
ode --test 6 项全过，git diff --check 通过，正矿工作区干净。
- **详见记录**：[2026-09-08-私有目录Symlink管理方案落地.md](2026-09-08-私有目录Symlink管理方案落地.md)
