# 正矿业务需求与变更流水明细

记录正矿前端由个人负责的所有需求、修复与技术改动。

---

## 历史记录（最新在最前）

### 2026-09-09：出库附件必填标识 + 码头直提集装箱弹框打开即查询
- **环境**：ssh
- **工作分支**：`feature-v1.8.3`（改前 `git pull --ff-only origin feature-v1.8.3` = Already up to date）
- **提交记录**：`ad31f92`（已推送）
- **需求与修复**：
  - 出库单新增/编辑 `views/out-warehouse/out-warehouse-list/template/handleDetail.vue`：「出库附件」`prop` 是复制粘贴残留的 `purchaseOrderFileList`，与 `FileUpload` 绑的 `form.stockOutFileList` 对不上，既没星号、必填校验也落在不存在的字段上。改为 `prop="stockOutFileList" required`，与入库单 `b56b251` 同一写法；同页只读的「提货单附件」`prop` 一并改回 `fileList`。
  - 码头直提新增 `views/sales-pickup/list/pier-add.vue`：「请选择集装箱」弹框原来只在点「查询」时才调 `getWaitDeliveryContainerList`，`openAddGoodsDialog` 改为打开即请求，与昨天堆场货物弹框的口径一致；客户或进口采购单号为空时只开弹框不发请求，弹框内「查询」按钮行为不变。
- **副作用（需实机确认）**：`required` 会同时拦提交，出库单没传附件将无法保存；编辑历史单据时详情把 `commonFiles` 回填到该字段，老数据没附件的要先补传。
- **验证**：生产构建（1024MB 堆 / 2 线程）30.7s 通过；`codegraph sync` 增量刷新（2 文件 / 474ms）。**未做浏览器实机验证**。
- **文档**：`docs/maintenance.md` 新增「附件必填星号不显示或必填校验落空」排障条目并修正过期的「本地文档不可跨机同步」；`docs/domain-map.md` 补码头直提弹框口径。

---

### 2026-09-09：ssh 装上 CodeGraph CLI，索引库改本机生成
- **环境**：ssh
- **实施**：`npm i -g @colbymchenry/codegraph`（1.6.0）；`codegraph sync` 重建本机索引（608 文件 / 16.2s / 10,121 节点 / 32,214 边）。
- **策略调整**：`codegraph.db` 从 Hub 版本控制移除并加入 `.codegraph/.gitignore`，改为每台机器本地生成；Hub 只留 `task-cache/` 与文档、规则、日志。避免 work / ssh 两处 sync 在 33MB 二进制上冲突。
- **实测**：原 work 那份索引在本机可直接读（源码路径是相对路径），但依赖侧存的是 `D:/new-project/minerals-frontend/node_modules/...` 这类绝对路径，连 work 现路径都对不上，跨机器共享价值有限——这也是改成本机自建的依据之一。
- **规则同步**：`AGENTS.md` 第 1、3 节改写（索引库不提交、CLI 每机各装一次、未装则退回源码检索）。

---

### 2026-09-09：ssh 环境补建私有挂载（5 个链接）
- **环境**：ssh
- **工作分支**：`feature-v1.8.3`（不产生团队仓库提交）
- **实施**：`node scripts/setup-links.mjs --env ssh --project minerals-admin` 建立 `.codegraph`、`docs`、`logs`、`AGENTS.md`、`AI_CONTEXT.md` 五个软链接，全部指向 Hub 的 `private/minerals-admin/`；`docs`、`logs`、`.codegraph` 写入 `.git/info/exclude`，两个 md 本就在团队 `.gitignore` 里。
- **冲突处理**：脚本原先报 `Real source exists: .../docs`（仓库实体 `docs/` 与 Hub 私有目标同时存在，两边都不覆盖）。本机 `docs/` 里只有 2026-08-25 打包优化的原始日志与脚本 `build-opt/`，`cp -a` + `diff -r` 校验一致后并入 `private/minerals-admin/docs/build-opt/`，删除仓库内原件再挂载；仓库内路径仍是 `docs/build-opt/`。
- **验证**：5 个链接 `readlink -f` 指向正确、可读；`git check-ignore` 全部命中；团队仓库 `git status` 干净。
- **遗留**：本机未安装 `codegraph` CLI，`.codegraph/` 是 work 机器的历史快照，ssh 上无法 sync；home 没有正矿仓库，映射与挂载待日后 clone 后补。
- **详细记录**：见 [`2026-09-09-ssh私有挂载补建.md`](2026-09-09-ssh私有挂载补建.md)。

---

### 2026-09-09：堆场提货「补充信息」批次号取 goodsList.stockBatchNo
- **环境**：ssh
- **工作分支**：`feature-v1.8.3`（改前 `git pull --ff-only origin feature-v1.8.3`，`08dfce1` → `1a516bd`）
- **提交记录**：`6b7d0ae`（已推送）
- **需求与修复**：
  - `yard-replenish.vue` 货物信息表「批次号」列由 `prop="batchNo"` 改为 `prop="stockBatchNo"`；`objectSpanMethod` 的 `mergeCols` 同步换成 `stockBatchNo`，保住该列的跨行合并。
  - 根因：`form.goodsList` 有两个来源——走 `stockInfoList` 时映射了 `stockBatchNo: item.batchNo`，直接用提货单详情返回的 `goodsList` 时只有 `stockBatchNo`，后者下整列为空且合并错位（详情页 `yard-detail.vue` 一直是按 `stockBatchNo` 渲染的）。
  - 排序用的 `compareFields = ['batchNo', ...]` 作用于库存原始行，保持不动；`pier-replenish.vue` 无批次号列，不受影响。
- **验证**：生产构建（1024MB 堆 / 2 线程）30.8s 通过；全量 `vue-tsc` 在本机 1GB 堆下 OOM 未跑完，按内存约定不上调堆；**未做浏览器实机验证**。
- **详细记录**：见 [`2026-09-09-堆场提货补充信息批次号.md`](2026-09-09-堆场提货补充信息批次号.md)。

---

### 2026-09-08：进口采购单新增/编辑校验规则修复
- **环境**：ssh
- **工作分支**：`feature-v1.8.3`
- **提交记录**：`08dfce1`（已提交待推送）
- **需求与排障修复**：
  - 定价依据 Collapse 外层包装 `<el-form ref="pricingBasisFormRef" :model="contractForm">`，解决组件脱离 el-form 导致 `prop="pricingBasisList.N.value"` 无法解析、用户输入一触发 change 就必现红字提示的问题。
  - `contractAmount`、`contractNo` 等字段必填 trigger 改为 `['blur', 'change']`，修复合同金额程序化回填后错误态不消失的问题。
  - 数据重建、详情回显、AI 回显处补清空校验。
- **验证**：单文件模板/脚本编译无错误，生产构建（1024MB 堆）32.2s 通过。

---

### 2026-09-08：私有目录 Symlink 方案落地与原文件迁移
- **环境**：work
- **工作分支**：`feature-v1.8.3`
- **需求与实施**：
  - 将正矿本地维护的私有文档（`docs/`）、AI 规则（`AGENTS.md`、`AI_CONTEXT.md`）、私有日志（`logs/`）和代码分析数据库（`.codegraph/`）完整迁移至 Project Hub 的 `private/minerals-admin/`。
  - 正矿原物理实体文件安全删除，替换为 Windows NTFS Junction / SymbolicLink 链接。
  - 配置业务仓库 `.git/info/exclude` 忽略规则，团队 Git 保持完全干净。
- **状态**：已完成落地，正矿工作区完全 clean。

---

### 2026-09-08：堆场提货与采购单规则修复
- **环境**：work
- **工作分支**：`feature-v1.8.3`
- **提交记录**：
  - `b56b251`：堆场货物隐藏成分列；必须先选进口采购单才可添加货物；查询与保存透传 `purchaseNo`；修正入库附件必填标识及对应字段。
  - `c16df7d`：堆场详情补齐 `deliveryStatus` 显示（1 已提货、2 待提货、3 提货中）。
- **验证**：采购单前置条件、查询/保存传参、切换清理、过期响应隔离、必填标识组件渲染与 CSS 规则、数字和字符串状态映射检查通过。
- **遗留**：全量类型检查存在外部历史报错（`dashboard.ts` 引用未导出的 `shipDynamicsWarning`），不影响本次堆场交付。
- **详细记录**：见 [`2026-09-08-堆场提货与采购单规则修复.md`](2026-09-08-堆场提货与采购单规则修复.md)。
