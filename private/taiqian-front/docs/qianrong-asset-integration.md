# qianrong 资产管理对接接口；菜单调整后的模块核对

2026-11-13 ssh（用户明确切到 dev）：检查菜单调整后此前新增的三个模块，再把资产管理从静态页面改为对接接口。

## 菜单调整核对

- 同事 349f118（kimi 自动同步，2026-11-12）用 `scripts/add-qianrong-routes.mjs` 重组侧栏：认证管理从「供应链金融运营」挪到「数字监管」，额度账本挪到新一级目录「额度与账本」（`quota-ledger`），资产管理仍在数字监管。脚本对这三个菜单「照服务端现状声明、不改」，组件路径不变。
- dev 后端 getRouters（只读）确认：`/digital-supervision/asset`（Asset）、`/digital-supervision/certification`（组件仍为 supply-chain/certification/index）、`/quota-ledger/credit-ledger`（组件仍为 supply-chain/credit-ledger/index）。
- 结论：**文件不用挪**（组件路径没变，侧栏按路由名称归组）。同事对三个模块的改动只是格式化。
- 问题：认证管理列表「详情」与详情「返回」写死 `/supply-chain/certification…`，挪目录后实际是 `/digital-supervision/certification…`，点了找不到页面。已改为按路由名称跳转（`Certification/detail`、`Certification`），资产管理的跳转同样改用名称（`Asset/add`、`Asset/detail`、`Asset`）。额度账本无页面跳转。

## 资产接口（业务管理 / 资产管理）

| 用途 | 接口 | 说明 |
| --- | --- | --- |
| 列表 | GET /finance/asset/list | 查询：sourceSysNo 乾链资产流水号、financingOrgName 企业名称、assetBizNo 资产编号（模糊）、financingStatus；分页 pageNum / pageSize；带 menuPerm |
| 详情 | GET /finance/asset/detail/{id} | 含 candidateProducts、items（FinanceAssetDetail，有 totalAmount）、financing（financeId / loanNo / loanAmount / loanDate / productName） |
| 新增 | POST /finance/asset/add | 必填：sourceSysNo、assetFormTime、pushTime、assetType、industryProject、assetBizNo、coreOrgName、importServiceName、financingOrgName、candidateProductIds（多选）、currencyCode、items（skuCode / skuName / category / unit / quantity / unitPrice） |

字典与下拉（dev 只读核实）：

- 单据类型 = 字典 `asset_type`（货柜(质押)/货柜(监管)/提单/仓单/购销合同/应收账款确认书）；资产编号标签：货柜→货柜号、提单→提单号、仓单→仓单号、购销合同→业务合同号，其余「资产编号」。
- 产业项目 `industry_project`（ldqx/lsrq/gtzq）；融资状态 `asset_financing_status`（7 值，列表 dict-tag，详情头卡配色）。
- 进口服务商、核心企业：`/system/org/selectList?type=0`（org_type 0 = 核心企业）；ID 是长整型，按字符串处理。
- 融资企业 + 可申请金融产品：`/credit/financeOrg/list?creditStatus=2`（已生效）逐页拉全，按 orgId 归并、产品去重。
- 币种：`/currency/selectList`；编码是自定义的（dev 只有 c001 人民币），人民币按名称认。
- 品类：没有合适的字典 / 接口（large_category 是家电），明细里改为文本输入。

## 页面改动

- `api/asset/index.js` 新增；`static-data.js` 改为 `model.js`（字段口径、下拉整理、列表参数、新增负载；静态数据删除）。
- 列表：去掉 `policyColumns: false / responseColumns: false`，`whenListColumnsReady` + `withMenuPerm`；列改接口字段，新增「融资状态」列；查询「购销合同号」改为「资产编号」（接口 assetBizNo 对所有单据类型模糊匹配）。
- 新增：资产形成时间、乾链推送时间改为可选的日期时间（接口必填；原静态页标为「源于乾链推送」只读）；申请金融产品改多选；名称随 ID 提交；日期按本项目口径传毫秒时间戳；外币时人民币价值按外币 × 汇率回填；成功后回列表。
- 详情：按 id 请求；新增「乾融资产流水号」；融资信息改为借据号 / 融资金融产品 / 放款金额 / 放款日期。
- 测试：新增 `tests/asset-model.test.mjs`；`policy-columns.test.mjs` 增加「静态列表」名单（目前只有认证管理），标准列表仍为 27（HEAD 时因同事新增列表已对不上：28 个标准 / 26 个动态）。

## 自行决定（可改）

- 进口服务商与核心企业都从核心企业（org_type 0）里选；融资企业只取授信已生效（creditStatus 2）。
- 两个时间放开手填（手工新增没有乾链推送来源）。
- 品类改文本输入。
- 「购销合同号」查询改为通用「资产编号」。

## 验证

- dev 只读：getRouters、字典、企业 / 币种 / 授信下拉、资产列表（当前 0 条）。未调用新增接口，未写任何数据。
- 无 Node：构建与测试未运行；模板标签配对、括号配平、测试正则对源码 Python 核对通过；CodeGraph 本机未安装，未同步索引。
