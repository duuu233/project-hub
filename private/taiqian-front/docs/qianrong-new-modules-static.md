# qianrong 新增三模块（静态页面）与菜单

2026-11-11 ssh dev/c0beb06（用户明确）：按 `V0.9` 原型新增 F04 额度账本、F05 认证管理、O01 资产管理三个模块，先用静态页面 + 静态数据，后续再对接接口；菜单由接口自动新增。同日用户要求另建 `test` 分支指向本次改动前的 dev（ba4b6dc），已推送 origin。

## 菜单（dev 环境后端，2026-11-11 通过 POST /system/menu 新增）

按现有规律：C 页面 perms 为空；「XX列表」占位 C、path `/`、isList=1、visible=1；隐藏子页面 C、visible=1；按钮 F。

| menuId | 父级 | 类型 | 名称 | path / component | perms |
| --- | --- | --- | --- | --- | --- |
| 2507 | 2411 供应链金融运营 | C | 额度账本（o=3） | credit-ledger / supply-chain/credit-ledger/index | |
| 2508 | 2507 | F | 额度总览查询 | | credit:ledger:overview |
| 2509 | 2507 | F | 导出企业额度 | | credit:ledger:export |
| 2510 | 2411 | C | 认证管理（o=4） | certification / supply-chain/certification/index | |
| 2511 | 2510 | C | 认证列表（占位，isList=1） | / | certification:record:list |
| 2512 | 2510 | C | 认证详情（隐藏） | certification/detail / supply-chain/certification/detail | certification:record:detail |
| 2513 | 0 | M | 数字监管（o=6） | digital-supervision | |
| 2514 | 2513 | C | 资产管理 | asset / digital-supervision/asset/index | |
| 2515 | 2514 | C | 资产列表（占位，isList=1） | / | asset:info:list |
| 2516 | 2514 | C | 新增资产（隐藏） | asset/add / digital-supervision/asset/add | asset:info:add |
| 2517 | 2514 | C | 资产详情（隐藏） | asset/detail / digital-supervision/asset/detail | asset:info:detail |

自行决定（可改）：
- 挂载位置：F04 原型面包屑「数据金融配置 / 信用组件 / 额度账本」、F05 原型侧栏「供应链金融运营 → … 认证管理」，对应本系统的「供应链金融运营」（与准入、授信同级）；O01 按 F05 原型侧栏「数字监管」单列一个顶级目录（o=6，排在配置与审计之后，可在菜单管理拖动）。
- 权限字符由前端拟定，后端定稿后需同步改菜单与页面 `v-hasPermi`。额度总览不是表格列表，未建 isList 占位，查询权限 credit:ledger:overview 暂无页面使用。
- 菜单只建不分配角色；非超管账号需在角色配置权限中勾选。

## 页面

- `views/supply-chain/credit-ledger/`：额度总览。产业项目胶囊（文案 = 名称-N家银行，N 按银行卡片数算）+ 总授信 + 6 张统计卡；el-tabs 切资金维度 / 企业维度。资金维度按银行分卡：版本标签、有效期间、用信率环（=（冻结中+已用）/授信额度，按数据计算，不照抄原型 80%）、5 指标、金融产品明细表。企业维度：企业名称模糊搜索 + 导出（credit:ledger:export，静态阶段提示接口对接后提供）；企业卡默认展开第一张，使用明细两行式、时间/金额标签随融资状态变化（RECORD_LABELS），分页 5/10/20。
- `views/supply-chain/certification/`：认证列表（认证对象模糊搜索、8 列、仅详情、分页 5/10/20/50）；详情 = DetailHeaderCard（认证编号 / 状态 / 创建时间）+ 认证信息（企业 8 字段 / 个人 4 字段），整页只读。
- `views/digital-supervision/asset/`：资产列表（4 个 AND 条件，购销合同号匹配单据类型=购销合同的资产编号；16 列；资产编号列前缀显示含义货柜号 / 业务合同号 / 提单号）；新增资产（乾链系统信息 / 资产基本信息 / 资产明细信息三组，币种=人民币时外币价值与汇率禁填、人民币价值必填，外币时人民币价值 = 外币×汇率四舍五入 2 位只读；融资企业→金融产品→明细品类级联）；详情四组只读，无关联融资显示空态。
- 静态列表 `withListGridStyle` 显式 `policyColumns: false, responseColumns: false`：全局 strict 下无列配置会只剩序号与操作列。对接接口时去掉这两项、getList 改 withMenuPerm + whenListColumnsReady。
- 空值沿用系统 `--`（原型写 `-` / `/`）；明细合计按 SUM 计算（原型截图 2,00 / 20,000.00 为笔误）；明细保留「删除」列（V3 截图去掉了，但现有表单交互都有，最后一行不可删），至少 1 行；新增「确定」只做校验并提示未保存。

## 验证

无 Node，构建 / 测试 / 浏览器均未运行；只做了模板标签配对、未用导入、信息隔离静态核对。getRouters 已返回新路由（数字监管 / 资产管理、额度账本、认证管理及隐藏子页）。
