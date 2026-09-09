# 正矿业务需求与变更流水明细

记录正矿前端由个人负责的所有需求、修复与技术改动。

---

## 历史记录（最新在最前）

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
