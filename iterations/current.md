# 当前迭代

## 2026-09-10：相册两端换法务 20260909 协议全文 + AI 协议违规阶梯改口径

- 环境：ssh；album-miniapp（`/pgdata/pg/dh/photo-album`）与 album-app（`/pgdata/pg/dh/flutter`），工作分支均为 `main`，改前两个仓 `git pull --ff-only` 都是 Already up to date（起始 `487869b` / `be2d80f`）。
- 来源：Hub `docs/相册协议/` 下四份法务 docx（文件名 20260909，正文页首的更新日期是 **2026 年 8 月 28 日**）：中文两份、名字带 `(EN)` 的英文两份。口径：**小程序固定简中、App 固定英文**。
- 交付一：**album-miniapp `d3eb1e8`（已推送）**
  - `privacy-content.js` 整份换新版简中（14 章 / 56 条列表 / 4 张表）；新增 `agreement-content.js`（15 章 / 60 条列表 / 1 张表），`agreement.wxml` 由写死的三节旧短文（2026-5-13）改为与 `privacy.wxml` 同一套通用渲染，`agreement.js` 从数据取数。
  - `ai-agreement.wxml` 第 4 节违规表按产品新口径改：原「第1次/第2次/第3次 各封 24 小时」三行 → 一行「第1-3次｜AI功能提示违禁」，其余两行不变。
  - 新增 `tests/user-agreement-content.test.js`；`tests/privacy-policy-content.test.js` 断言跟到新版日期并新增「页面不许写死旧版日期」。
- 交付二：**album-app `6bcaecf`（已推送）**
  - `privacy_policy_page.dart` 正文换新版英文；`user_agreement_page.dart` **整页重写**——由 `l10n.pick` 的中英日三节短文改成编译期常量 `userAgreementSections`（15 章）并**固定英文**（与隐私政策同口径，页面标题仍随语种）。
  - `ai_service_agreement_page.dart` 第 4 节违规阶梯**中英日三份都改**（只改英文会让日文用户看到作废阶梯）。
  - 新增 `test/user_agreement_content_test.dart`；`AI_CONTEXT.md` 补一段说明「用户协议/隐私政策固定英文、AI 服务协议仍随语种」。
- 做法：四份 docx 用一次性脚本逐块转换（按样式名 `heading 2/3` 与 `numPr` 分区块），脚本未入仓，沿用 2026-08-13 换 v3.0 那轮的约定；**转换后逐块校验过拼接结果与原文逐字相同**。两端的**目录（TOC）都没有转换进来**——都没有锚点跳转能力，照抄只是多一屏点不动的条目；正文一字未改。
- **⚠️ 需要法务/产品回话的四件事**（端上一律照抄，没有自行修改）：① 生效日期在四份原文里就是占位符（简中「待填写」/「[待填写：生效日期]」，英文 `To be completed`），**发版前必须补**；② 隐私政策版本号写作 `VI.0`（用户协议是 `V1.0`），疑为笔误；③ 英文版有断词/断句缺口共 16 处（句号后少空格 6 处如 `bold.By`、`app.If`；标点前多空格 10 处如 `Permission: Bluetooth . Used`），源于粗体 run 边界，两端都不渲染粗体所以更显眼；④ 英文隐私政策第 13 节公司名 `Qihe Ming (Shenzhen)…` 与页首页尾的 `BoltStar (Shenzhen)…` 不一致。
- **⚠️ 一处口径矛盾**：法务用户协议第九章的违规表仍是「第 1/2/3 次各封 24 小时」，原文还写明「与应用内《BoltStar AI 服务协议》一致」；而本轮按产品口径把 AI 服务协议改成了「第 1-3 次只提示违禁」。**两份文档现在互相矛盾**，端上没有替法务改用户协议正文，需产品与法务确认以哪份为准（若以新口径为准，要法务重出第九章那张表、端上再转换一次）。
- 验证：小程序 `node --test "tests/*.test.js"` **57/58 通过**；唯一失败的 `tests/token-page-layout.test.js` 与本轮无关——它断言 `subpackages/token/index/index.wxss` 里的 `.package-card--active .package-gift`，那条规则在 2026-09-08 的 `487869b` 就被去掉了，本轮一个字没动 `subpackages/token/`。App 侧**本机无 Flutter SDK**，`dart format`/`flutter analyze`/`flutter test` 均未执行，只做静态自检（括号配平、字符串拼回原文一致、正文无中文字符）。两端**真机均未验**。
- 文档：小程序 `docs/changes/2026-09-10-用户协议与隐私政策换法务20260909全文.md`、App `docs/history/2026-09/2026-09-10-协议换法务20260909全文.md`，两边 `docs/README.md` 索引同步。

### 追加（同轮第二次）：四个问题按产品答复统一处理

产品当天逐条答复：①「按今天的日期填写」②「是的笔误」③「弄成统一的就行」④「按照开头和结尾的公司名」。交付 **album-miniapp `6c488ad`** 与 **album-app `c3907ae`**（均已推送）：

- **① 生效日期**：四份统一填 2026 年 9 月 10 日 / September 10, 2026，页面不再显示占位符。
- **② 版本号**：隐私政策 `VI.0` → `V1.0`（与用户协议一致；App 端页面本就不展示版本，记在类注释）。
- **③ 排版统一**：英文 16 处（句号后补空格 6 处 `bold.By`/`app.If` 等、标点前删空格 10 处 `Permission: Bluetooth . ` 等）；**简中另有 9 处同类问题是本轮新发现的、经用户确认后一并处理**——半角分号/括号统一成全角、`AppleAppStore` 补空格成 `Apple App Store`、句末重复句号 `。。` 收成一个；隐私政策第一节的 `(1)` `(2)` 是枚举编号，有意保留 ASCII。
- **④ 公司名**：英文隐私政策第 13 节 `Qihe Ming (Shenzhen)…` → `BoltStar (Shenzhen) New Energy Technology Co., Ltd.`，与页首页尾一致。
- **顺带**：AI 服务协议开场白的公司名一直裹着模板方括号（`[启和明(深圳)…]` / `[Qihe Ming (Shenzhen)…]`，方括号原样显示给用户），经确认两端**三语**都去掉方括号，英文/日文按 ④ 的口径统一，简中括号改全角。
- **做法**：每条修正都写进一次性转换脚本的 `fixups.py` 并**断言命中次数**——法务下次给新版时对不上的条目会当场暴露；**措辞一字未改**。两端各给两个用例加了一节，锁住修正不被下次转换带回去（小程序 57/58 仍通过，唯一失败仍是与本轮无关的 `token-page-layout`）。
- **已解决（同轮第三次）**：产品裁定「用户协议按 AI 协议改」，交付 **album-miniapp `5b43680`** 与 **album-app `e537c44`**（均已推送）。第九章阶梯表前三行合成「第 1-3 次｜AI 功能提示违禁」/「1st-3rd violations | AI features show a violation warning」，**后两行与法务原文逐字相同**、表头不动；英文措辞沿用用户协议自己的用语（统一的是口径不是字面）。表前那句「与应用内《BoltStar AI 服务协议》一致」现在才真的成立。替换写在转换脚本的 `apply_tier_table()` 里，**先断言换掉的确实是原来那五行再替换**——法务下次给新版若已改过这张表，转换会当场报错而不是覆盖掉新版。两端用例各加一条把用户协议阶梯表与 AI 服务协议页**钉在一起**（App 侧直接读 `ai_service_agreement_page.dart` 源码断言中英日三份阶梯行都在、旧阶梯行都不在），任何一边单独改口径都会红。⚠️ 端上展示的第九章与法务 docx 从此有这一处**有意差异**，建议把新阶梯回给法务，让下一版从源头就是这个口径。


---

## 2026-09-10：花盆后台用户列表——下线星币三列与行级账户日志按钮

- 环境：ssh；flowerpot-admin，工作分支 `main`（改前 `git pull --ff-only` = Already up to date，起始 `e7b051e`）。
- 需求：用户列表去掉「总计星币」「可用星币」「消耗星币」三列和「账户日志」按钮。
- 交付：**flowerpot-admin `dbc46ff`（已推送）**
  - `src/views/sms/userList/index.vue`：删 `totalToken` / `consumeToken` 两列与承载 `UserAccountEditor` 的「可用星币」列；删行操作里的「账户日志」按钮，操作列宽 250 → 170（只剩编辑、详情，和植物管理列表同宽）；连带删 `handleAccountUpdated` 与组件引入，`handleAccountLogs` 只剩工具栏调用故简化为无参。
  - 删除 `src/views/sms/userList/components/UserAccountEditor.vue`（可用星币行内编辑弹层，全仓库唯一调用方就是那一列）与 `src/api/userList.js` 的 `setUserAccount` 封装（唯一调用方就是该组件），`components/` 目录随之删空。
- 取舍：① **工具栏「账户操作日志」按钮保留**——产品说的是行级那个「账户日志」，工具栏那个标签不同、进的是全量日志页，属列表级入口；`accountLogs.vue` 与 `userAccountLogs` 路由不动，其页内「用户ID」筛选仍可缩到单个用户。② 只服务于被删列的组件与接口封装一并删除，与 2026-09-08 下线四个模块的处理一致；要恢复可用星币编辑直接 revert 本次提交。③ **不动后端菜单与权限节点**——`scripts/sync-admin-menu.mjs` 里 `Post_User_SetUserAccount`、`Get_User_GetOperatUserAccountLog` 的声明保持原样，删节点属后台数据变更需单独指令。④ 接口本身不动：`getUserList` 响应仍带三个星币字段，只是前端不展示。
- 验证：`NODE_OPTIONS=--max-old-space-size=1024 npm run build` **通过**（vite，45.58s，无报错无新警告，`accountLogs` 仍单独分包）；全仓检索确认 `UserAccountEditor` / `setUserAccount` / `availableToken` / `totalToken` / `consumeToken` 在 `src/` 下已无残留（只剩商品模块自己的 `totalTokenCount`，不相关）。项目没有 test / lint / type-check 脚本；**未在浏览器实机验证**列表渲染与操作列宽度。
- 遗留：后台菜单里「编辑用户账户」权限节点仍在但前端已无对应按钮，要不要摘掉由产品决定。
- 文档：`AI_CONTEXT.md` 补本次下线记录，`docs/project-structure.md`、`docs/interface-list.md`（三行）、`docs/dynamic-menu-sync.md` 同步口径，新增 `docs/history/2026-09/2026-09-10-userlist-remove-token-columns.md` 并更新历史索引。

---

## 2026-09-10：花盆 APP 定制动画——操作按钮改底部悬浮

- 环境：ssh；flowerpot-app，工作分支 `main`（改前 `git pull --ff-only` = Already up to date，起始 `4eabac5`）。
- 需求：先核对定制动画页是否已按 `docs/UI/v2/智能花盆ysplanter/定制动画-已上传图片（图库管理）.png` 调整，再在此基础上——上传按钮悬浮固定在底部；有上传的图片时才显示下面那排操作按钮；其余照 UI 图；顶部「仅支持屏幕录制或本地文件」那个模块不需要。
- **核对结论**：v2 那张图库卡（三列缩略图 + 勾选圈 + `N/10` + 一排三个圆按钮 + 长按置顶）2026-09-04 已落地；顶部权限提示条与右上角「文件同步」按钮 2026-09-08 已按产品口径整体下线（本轮要求与之一致，无需再动），提示卡首条同期改为「支持本地图片文件上传」。**唯一和 UI 图对不上的**：虚线「上传文件」位一直常驻，有图时还压在图库卡上面，而 v2 那一屏没有这块。
- 交付：**flowerpot-app `ef11017`（已推送）**
  - 新增 `_GalleryActionBar`：页面 body 由单个 `CustomScrollView` 改 `Stack` + 底部 `Positioned`，上传按钮常驻，`hasFiles` 为真才追加「删除选中」「取消选择」；三颗按钮的可用性判断（busy / 上限 10 张 / 有没有选中）上移到页面。
  - `_UploadedFilesCard` 去掉卡内那排圆按钮与 `busy`/`onUpload`/`onDeleteSelected`/`onClearSelection` 四个入参，只剩网格；虚线上传位 `_UploadCard` 改为**只在图库为空时**画（空态仍按 `docs/UI/定制动画.png`）。
  - 滚动内容底部内边距由写死 40 改为 `_GalleryActionBar.height + AppSpacing.xxl`（56 + 12×2 + 24 = 104），滚到底最后一行缩略图不会钻到按钮下面；`_GalleryAction` 提出 `diameter = 56` 并在可用时加 `elevation: 4`。
- 取舍：① 虚线上传位**保留为空态**——`docs/UI/定制动画.png` 画的就是 `0/10` 这一屏，删了空态只剩一张提示卡；有图时按 v2 让位，上传入口由悬浮按钮承担。② 悬浮条走 `Stack`+`Positioned` 而不是 `bottomNavigationBar`：`AppBottomActionBar` 是不透明白底给整宽主按钮用的（仓库里无调用方），这里要的是圆按钮浮在渐变背景上；`AppPageScaffold` 已把 body 包在 `SafeArea` 里，`bottom: 0` 正好落在 Home Indicator 之上。③ 条子底色用透明→`canvas` 渐变而非实底，`DecoratedBox` 不参与命中测试，空白处仍可滚动。
- 测试（未运行）：空态补「只有上传按钮」断言；新增「有图时虚线位让位」「有图才画删除与取消」「悬浮固定 + 滚到底不被压住」（9 张图 / 320×568）；删除 `uploaded files appear and can be deleted with a long press`——它断言 `find.text('demo.gif')` 与长按即删，而 2026-09-04 换成网格后格子不画文件名、长按已改成置顶（DP 157），这条从那时起就与实现对不上。
- 验证缺口：**本机没有 Flutter/Dart SDK**，`dart format` / `flutter analyze` / `flutter test` 均未执行；只做了静态自检（两个改动文件的 Dart 感知括号配平、删除入参无残留调用方、逐行通读）。需在有工具链的机器补跑并在真机看两态版式与安全区。
- 遗留待产品确认：提示卡第二条照 UI 图写「长按文件可删除已选文件」，而实现里长按是**置顶**（DP 157），同屏图库卡副标题写的是「长按可置顶」——两句话互相打架，本轮未动。
- 文档：`AI_CONTEXT.md` 内容与维护段落补两态版式口径与「下线的模块不要按老设计稿加回来」，新增 `docs/history/2026-09/2026-09-10-animations-floating-action-bar.md` 并更新历史索引。

---

## 2026-09-09：花盆 APP 植物 DP 契约改版（116 / 162）

- 环境：ssh；flowerpot-app，工作分支 `main`（改前 pull = Already up to date，起始 `fa54740`）。
- 需求：DP 定义改版 —— 162 改为 0 不弹窗 / 1 弹窗；植物 DPID 改为 -1 无植物、0..N 具体植物 id（= 管理后台「涂鸦标识 ID」，0 为通用植物），以及配套的 7 条交互逻辑与 6 条界面要求。
- 交付：**flowerpot-app `275942c`（已推送）**
  - **数据层**：`PlantConfirmState` 收敛为 `hidden(0)`/`prompt(1)`（`fromDp` 只认 1）；新增 `PlantVariety`（`none = -1`、`parse`、`hasPlant`、`isMissing`）；`FlowerpotState` 的 `hasPlant` 先判 -1，新增 `plantMissing` / `plantGuidePending` / `reportedPlantName`；新增 `_plantKey` 归一化标识——**能解析成整数就按整数比，否则退回小写字符串**，这样后台数据改造和固件升级不同步时老设备也不会突然变「无植物」；删除 `answerPlantConfirm`（App 不再写 162），新增 `confirmDetectedPlant`（把设备当前上报的 id 原样回写 116，能解析出植物时顺带下发 161）；设备报 -1 时清掉本地「有植物」缓存。
  - **交互**：设备列表页删掉「没有植物就先送去选植物」这道门禁（需求第 6 条），只留离线拦截；详情页进页先补植物资料再看 162，报 1 就弹「发现新植物」引导窗（正文按 116 从后端目录取名字，按钮「确认」= 回写当前上报 id、「选择植物」= 跳选择流程，下方两条提示按需求原文，返回键关掉则不发、下次再弹）；116 = -1 时首页画不带植物的设备图（忽略后台图片）、「今日养护」整行换成惊叹号 + 「未检测到植物，请将植物种入花盆。」、设备设置页「植物」入口点了只提示同一句不进选择页。
- 两处刻意的取舍：① 116 = -1 时**不清** `device.plant` 对象（那是非空字段、详情页多处直接读，改空安全风险大于收益），界面统一用 `plantMissing()` 判断；② 引导窗不做二次确认——新契约里「确认」只是回写设备自己报的 id，不像旧的 162=2 会让设备换植物。
- 测试（未运行）：`home_plant_confirm_test.dart` 整份改写为新交互 5 例（弹窗内容、确认回写 116 且不写 162、选择植物跳转、162=0 不弹、116=-1 的无植物界面）；`device_list_page_test.dart` 把「没植物跳选择页」改成「直接进详情页」；`state_backend_integration_test.dart` 补「116 报 -1 就是没有植物」。
- 验证缺口：**本机没有 Flutter/Dart SDK**，analyze / test 未跑；只做了静态自检（括号配平、无残留旧枚举与 `answerPlantConfirm` 引用、清掉两处失效 import）。真机需验证 162=1 弹窗、确认后固件是否改 0 并回报、拔植物是否报 -1。
- **依赖后端/后台**：管理后台植物管理的「涂鸦标识 ID」要改成与固件一致的数字，并**新建 涂鸦标识 ID = 0 的通用植物**（需求第 3、4 条）。在这之前 App 用数字 id 匹配不到目录项，引导窗只能显示「已检测到新植物」。
- 文档：`AI_CONTEXT.md` 设备详情段落按新契约重写，新增 `docs/history/2026-09/2026-09-09-plant-dp-contract-v2.md`，两个索引同步。
- **需求更新（同轮）**：植物 id **0（通用植物）单独一支** —— 交付 **`4eabac5`（已推送）**。固件只认出「有植物」但认不出品种时报 0，后台也**不再为 0 建植物数据**（原「新建 ID=0 通用植物」那条作废），所以没有可确认的对象：引导窗正文换成「已检测到通用植物，请选择并确认植物。」，**按钮只留「选择植物」**（`showCancel: false`），标题、两条提示、返回键行为与 1..N 那支一致；点唯一那个按钮走选择流程，**不会把 0 当成确认下发**。新增 `PlantVariety.generic` 与 `FlowerpotState.reportedPlantId`，测试补一例。

---

## 2026-09-09：花盆 APP 续接代码审核（CODE_REVIEW_HANDOFF）

- 环境：ssh；flowerpot-app，工作分支 `main`（改前 `git pull --ff-only` = Already up to date，拉到 work 端的 `27bbbd9`）。
- 起点：`docs/CODE_REVIEW_HANDOFF.md`（work 端写的续接单）。代码改动已由 work 端作为 **`27bbbd9`（74 文件 / +926 / −2167）** 提交推送：移除涂鸦 SDK 调试台（998 行）、体验模式与静态预览开关，`MockTuyaRepository` 从产品代码搬到 `test/support/`；关闭 S1 明文回落（`ApiConfig` 只收 HTTPS、默认 `https://api.yikaltd.com`，Android network-security-config 与 iOS ATS 例外删除）；`postJson` 默认不再重试；`ApiSession.revision` + `ApiClient._ensureSession` 挡旧会话迟到响应；设备搜索页改 `Timer` 截止并全程 `mounted` 保护。
- 本轮（ssh）交付 **`fa54740`（已推送）**，只有静态检查与文档：
  - **静态自检全部通过**：没有「测试声明写在 `main()` 之外」（handoff 提到的语法错误已不存在）；38 个引用 `MockTuyaRepository` 的测试都已 import `test/support/mock_tuya_repository.dart`，`PlantCatalog` / `FixtureBackend` 也没漏；产品代码里 `MockTuyaRepository` / `StaticPreviewConfig` / `DebugToolsConfig` / `enterDemo` / `_temporaryBaseUrl` 均无残留；**同日早些时候在 ssh 完成的功能在 `27bbbd9` 之后全部仍在**（家庭固定 `useHome`/`useHomeTag`、OTA `FirmwareUpdate`、`deviceLoadError`、`prepareForPairing`、`sessionDiagnostics`、`_handleBackendSessionExpired`、`isValidAccount`）。
  - **Active 文档口径修复**：`AI_CONTEXT.md` 的启动开关与源站、`ActionResult.code`、目录表、设备列表段落、第 117 行「联调工具」、第 3/4/5 条约定、2026-09-03 临时地址条目、2026-09-05 评审结论条目，全部按当前源码改写（原文还在写「联调页」「体验模式」「回落临时 HTTP」）。
  - 新增 `docs/history/2026-09/2026-09-09-code-review-cleanup.md`，更新两个索引；`CODE_REVIEW_HANDOFF.md` 改写为「只剩跑 analyze/test」并列出 S2/S3 待办与环境边界。
- **handoff 唯一剩余待办**：在有 Flutter SDK 的机器上跑 `flutter analyze` + `flutter test`——`27bbbd9` 删除范围大、测试基建整体搬家，基线必须重新确认；ssh 端**没有 Flutter/Dart SDK、Android SDK、Xcode**，做不了。
- 仍未关闭（已写进 handoff 与历史记录）：**S2** 安全组件 `.aar` 仍被 Git 跟踪（移出跟踪影响所有克隆，需用户决定）；**S3** `/Client/` 请求仍把 `userToken` 放进 URL 查询、令牌仍存 `SharedPreferences`（去查询参数属跨端契约变更，要先和后端确认只认鉴权头）；release 包 Manifest / Info.plist 与抓包核对。

---

## 2026-09-09：花盆 APP 家庭标记改用 userId + 「一小时掉登录」排查

- 环境：ssh；flowerpot-app，工作分支 `main`（起始 `669b89b`）。
- 交付一：**家庭名标记（`ffbefb6`）** —— 后端不想加 `tuYaHomeId` 字段并提出「`userNo` 转 long 当家庭 id」，**该方案不可行**（家庭 id 是涂鸦云端家庭表主键、由它分配，`createHome` 不接受指定 id；自造 Long 要么查不到家庭，要么撞上别人的）。改为让账号标识承载归属但**不当 id**：新增 `useHomeTag`（桥接 `setHomeTag`），两端建家时用 `YS-<账号键>` 当家庭名，认领时名字优先、其次带设备、最后 `homeId` 最小。
- 交付二：**账号键改用后端 `userId`（`c612166`）** —— 后端同意登录响应多返回 `userId`。解析 `userId`（兼容 `id`），登录时记下并按涂鸦 uid 存一份，会话恢复时读回；家庭名标记与本地缓存键都用它，缺省退回涂鸦 uid（`userNo`）。**标记跟账号走不跟手机走**：同一手机反复登录、换手机登同一账号，认到的都是同一个家庭。
- 交付三：**「一小时掉登录」（`38c71f0`）** —— 排查结论：APP 后端 token 没有客户端 TTL（`ApiSession` 持久化、不过期），App 里也没有一小时量级的定时器，所以掉登录只能来自某次请求回 401/406（该后端 `retCode 406` 就是「请重新登录！」）。真正的放大器在 `_run`：`if (error.isAuthError) _clearLocalSession()` 把**整个**本地会话清掉，包括涂鸦会话、设备列表与各种缓存 —— 而设备、DP、配网、固件全走涂鸦，与后端 token 无关。改为 `_handleBackendSessionExpired`：只清后端会话、记下失效原因（进设备列表页诊断行「后端会话：…」），并在 `ApiClient` 判死会话前打一行 `[session] 后端会话失效：<METHOD> <path> → HTTP/retCode`（只记路径不记 token）。
- **根因仍在后端**：一小时像是后端会话/redis 有效期，而他们查的是 token 表。请用新版本复现一次，把那行日志发给后端即可定位是哪个接口开始 406；若确认 token 就是一小时有效期，需要后端给刷新接口或延长有效期——设备侧不受影响，只有图库、植物目录这些依赖后端的功能会提示重新登录。
- 测试（未运行）：`state_pairing_test.dart` 补家庭标记断言；`state_backend_integration_test.dart` 新增「后端会话失效只清后端」用例（`updateProfile` 失败但 `authenticated` 仍为 true、诊断行含「后端会话」）。
- 验证缺口：**本机没有 Flutter/Dart SDK、Android SDK、Xcode**，analyze / test 未跑，两端桥接未编译。
- 文档：新增 `docs/history/2026-09/2026-09-09-backend-session-expiry.md`；`docs/BACKEND_TUYA_HOME_ID.md` 增「当前落地方案」一节说明 `userId` 的用法与为何不能当 id；`AI_CONTEXT.md` 补会话与家庭两条口径。

---

## 2026-09-09：花盆 APP 发验证码前校验手机号格式

- 环境：ssh；flowerpot-app，工作分支 `main`（改前 pull = Already up to date，起始 `2fa56d0`）。
- 需求：登录界面发送手机验证码要校验手机号格式。
- 排查：`FlowerpotState.sendCode` 本来就走 `_normalizeAccount` → `AuthValidator.account`，格式不对会以 `APP-invalid_input 手机号格式不正确` 失败，短信不会真发。**缺的是界面这层**——手机号框只设了 `keyboardType: TextInputType.phone`（那套键盘上还有 `+ - ( ) *`，粘贴还能带进字母空格，位数也不限），「获取验证码」按钮只在 `busy` 或倒计时期间禁用，号码不合法照样可点、点完才吃一个带前缀的红色提示。
- 交付：**flowerpot-app `669b89b`（已推送）**
  - `AuthValidator` 新增 `isValidAccount(value, region)`：只判断格式不抛异常，与 `account()` 共用同一组正则，避免界面放行、提交却被拦。
  - 登录页、注册页：手机号框加 `FilteringTextInputFormatter.digitsOnly` + `LengthLimitingTextInputFormatter(11)`；`accountController` 加监听让按钮跟着可用性变；`_sendCode` 补兜底校验，提示改为「请输入正确的 11 位手机号」。
  - 找回密码页：账号可能是手机也可能是邮箱，**不加数字过滤**，但按当前区域校验后再决定按钮是否可点，并补兜底提示。
- 测试（未运行）：`auth_page_test.dart` 增两例——位数不够时「获取验证码」的 `onPressed` 为 null、补齐 11 位后可点；输入 `138-0013 8000abc9` 后框里只剩 `13800138000`。
- 验证缺口：**本机没有 Flutter/Dart SDK**，analyze / test 未跑；真机需确认第三方输入法粘贴同样被过滤。
- 文档：新增 `docs/history/2026-09/2026-09-09-verification-code-phone-format.md`，两个索引同步。

---

## 2026-09-09：花盆 APP 家庭按账号固定 + 配网前置确认

- 环境：ssh；flowerpot-app，工作分支 `main`（改前 pull = Already up to date，起始 `b9f7dba`）。
- 需求：① 家庭 id 要固定传给涂鸦——它属于涂鸦账号，不依赖设备也不依赖后端；② 手机连着设备热点没网时会误判，配网前加 loading 等这一步确认完再走后续；③ 先提升客户端健壮性，后端是否返回了不同账号本轮不查。
- 交付：**flowerpot-app `d0ab4d0`（已推送）**
  - **家庭固定**：新增桥接方法 `setHomeId` 与 `TuyaRepository.useHome`；`FlowerpotState` 按**涂鸦 uid** 把家庭记进 `SharedPreferences`（`tuyaHome:<uid>`），新增 `_startSession()` 把「会话换代 → 钉家庭 → 拉设备列表」串成一处，登录 / 注册 / 恢复会话 / 会话自检四个入口统一走它（顺序不能反，否则等于又让原生自己挑一次）；每次成功读到列表后把实际用上的家庭写回本地。原生的挑选规则保留为「本地还没记过」时的第一次解析。
  - **配网前置 + loading**：新增 `prepareForPairing()`——先 `currentHomeId()` 确认并记住家庭，再取令牌，两步都在手机还连着路由器时完成；配网页点「开始配网」先跑它并盖一层 `AppLoading` 遮罩（`AbsorbPointer` 防误触），失败弹错误、**根本不去碰设备热点**。旧原生包没有该方法（`sdk_unavailable`）时不拦路。
  - **空家庭列表不再随手建家**：Android `withHome` 拆出 `queryHome(retry:)`——进程绑着设备热点时直接报 `home_offline` 绝不建家；否则先重查一次挡掉瞬时空返回；两次都空且在正常网络上才建。iOS 同样先重查一次，并补上**此前根本没实现的 `currentHomeId`** 分支。
- 测试（未运行）：`state_pairing_test.dart` 新增四例——会话开始把 `tuyaHome:mock-user` 钉给涂鸦、准备阶段查不到家庭时不取令牌也不连热点、确认家庭后才取令牌且有效期内不重取、旧原生包缺方法时不拦路。
- 验证缺口：**本机没有 Flutter/Dart SDK、Android SDK、Xcode**，analyze / test 未跑，两端桥接**未编译**。真机需走一次完整配网，确认遮罩出现即消失、日志里 `home pinned to …` 与 `home picked …` 对得上。
- 已知边界：已经被写进第二个空家庭的老设备不会自动搬家，本轮只保证今后固定用同一个家庭；首次解析若挑错，设备列表底部的诊断行会显示家庭 id，可据此在涂鸦后台核对。
- 文档：`AI_CONTEXT.md` 家庭那段改写，新增 `docs/history/2026-09/2026-09-09-home-pinned-and-pairing-preflight.md`，两个索引同步。
- **追加（同轮，用户确认「家庭 id 就用涂鸦给的，后端按账户存、在登录接口返回」）**：交付 **`1763f74`（已推送）**
  - `BackendAuthAccount` 新增 `tuyaHomeId`，从登录 / 注册响应解析，字段名以 **`tuYaHomeId`** 为准（与 `tuYaPwd`、`tuYaRemark` 同一套写法），兼容 `tuyaHomeId` / `homeId`；拿到就 `useHome` 钉给涂鸦并写本地缓存，`_pinKnownHome` 不再覆盖。**优先级：后端 > 本地缓存 > 涂鸦家庭列表现挑。**
  - **自愈**：用钉住的家庭读设备却拿到 0 台，就作废缓存（`useHome('')` + 删本地记录）并立刻重读一次——缓存只是缓存，以涂鸦返回的为准。iOS 的 `setHomeId` 收到空值改为清掉 `currentHome`，否则这条路径在 iOS 上无效。
  - 家庭 id 的性质已核实并写进文档：**由涂鸦云端分配**，App 只能查（`queryHomeList` → `getHomeId`）或建（`createHome` 回调里返回云端分配的 id），我们唯一自定的是家庭名「我的花园」；Home SDK 下设备按家庭组织（`getHomeDetail().getDeviceList()`），配网令牌也按家庭取（`getActivatorToken(homeId)`），所以账号必须有家庭。
- **后端需求已成文交付**：新增 `docs/BACKEND_TUYA_HOME_ID.md`（Active，已进 `docs/README.md` 索引），交付 **`2fa56d0`（已推送）**——写清家庭 id 的来源（涂鸦云端分配、App 不能生成、`userNo` 顶替不了，它是涂鸦登录的 UID 且为字符串）、需要后端做的两件事（登录响应 `UserInfoDetailApiOut` 增 `tuYaHomeId`；提供回写接口，建议 `POST /Client/User/setTuyaHomeId {userToken, tuYaHomeId}`）、App 侧当前优先级与自愈行为、以及排查用的现场信息格式。
- **待后端配合（已写进项目历史记录与上述文档）**：① 登录 / 注册响应 `UserInfoDetailApiOut` 增加 `tuYaHomeId`（当前 Swagger 里只有 `userToken`/`userNo`/`tuYaPwd`/`countryCode`/`nickName`/`avatar`/`userMobile`/`userEmail`）；② 提供保存接口（建议 `POST /Client/User/setTuyaHomeId`，入参 `{userToken, tuYaHomeId}`），让 App 把第一次解析 / 创建到的家庭回写——否则后端手里永远不会有值。接口定下来前 App 侧用「本地缓存 + 自愈」顶着，换手机 / 重装后重新解析一次。

---

## 2026-09-09：花盆 APP OTA 弹窗两个版本号都不对

- 环境：ssh；flowerpot-app，工作分支 `main`（改前 pull = Already up to date，起始 `b7b6ad6`）。
- 需求：OTA 升级里「当前版本」和「检测到的新版本」都读错了，怀疑是上次加进度条改坏的。
- **先给结论：不是进度弹层改的。** `992b8f8` 对这条路径只动了一处——升级发起成功后把一条 toast 换成 `showOtaProgressDialog`，取版本、比版本、弹「检查更新」框的代码一行未动（`git show 992b8f8 -- device_other_settings_page.dart` 可复核）。真正的两条根因都更早：
  1. **Android `deviceMap` 取错字段**：`"firmwareVersion" to (getPv() ?: getVersion())`，而 `DeviceBean.getPv()` 是**通信协议版本**（`2.2` 这种）不是固件版本，固件在 `verSw` 上。这行 2026-08-12 `b0c773f` 就在了，所以弹窗第一行一直显示协议号；iOS 的 `deviceMap` 连这个键都没有，只能退回 DP 148 或 `--`。
  2. **两行版本号来源不同**：「当前版本」来自设备列表字段，「新版本」来自 `getOtaInfo` 里 `upgradeStatus == 1` 那条的 `version`——那是**某个可升级组件**（MCU / Wi-Fi 模块）的版本，设备有多个组件时两行必然对不上。弹窗本身从 2026-07-20 `bdd9c29` 起就是这个读法，进度弹层只是让用户更常打开它。
- 交付：**flowerpot-app `b9f7dba`（已推送）**
  - Android `deviceMap` 改取 `getVerSw()`（退回 `getVersion()`），不再用 `getPv()`；iOS `deviceMap` 补 `"firmwareVersion": device.verSw`。
  - 两端 `checkFirmware` 从回一个字符串改为回 `{version, currentVersion}`，两个版本号取自**同一条 OTA 记录**。
  - Dart 新增 `FirmwareUpdate{version, currentVersion}`；`TuyaRepository` 解码兼容旧原生只回字符串；`_availableFirmware` 改存模型，`_rememberFirmwareUpdate` 的比较基准优先用 OTA 记录里的当前版本；其他设置页弹窗「当前版本」优先用它、取不到才退回设备字段，「已是最新」判断同步。
  - 连带修正：设备信息页「固件版本」那行原来同样显示协议号，改 `verSw` 后一并变正确。
- 测试（未运行）：`state_ota_test.dart` 增两例（SDK 报的当前版本压过设备列表字段 / SDK 原样回当前版本不算新版本）并改用 `FirmwareUpdate`；`device_other_settings_page_test.dart` 增一例断言弹窗两行来自同一条 OTA 记录。
- 验证缺口：**本机没有 Flutter/Dart SDK、Android SDK、Xcode**，analyze / test 未跑，两端桥接**未编译**；**iOS `ThingSmartFirmwareUpgradeModel.currentVersion` 的字段名需在能编译的机器上确认**，若该版本 SDK 没有，去掉那一项即可（Dart 侧已兜底）。真机需用一台确有新固件的设备验证两行版本与升级后的回写。
- 文档：`AI_CONTEXT.md` 新增 OTA 一条，新增 `docs/history/2026-09/2026-09-09-ota-version-pair.md`，两个索引同步。

---

## 2026-09-09：花盆 APP 重新登录读不到已绑定设备

- 环境：ssh；flowerpot-app，工作分支 `main`（改前 pull = Already up to date，起始 `b162068`）。
- 需求：重新登录后读不到已绑定的设备，严重 bug，修复。
- 交付：**flowerpot-app `c08fbb8`（已推送）**。链路只有一条：`_refreshDevicesForSession` → `getDevices` → 原生 `withHome` 查家庭 → `getHomeDetail`；列表页直接画 `state.devices`，不与后端交叉过滤。顺着读出两处**确定缺陷**并修掉：
  1. **失败被吞成「暂无设备」**：登录、注册、恢复会话都走 `ignoreErrors: true` 的 `catch (_) {}`，任何失败都表现为空列表，与账号真没设备完全一样；下拉刷新原来接 `state.refreshDevices`，异常抛回 `RefreshIndicator` 只进日志，用户拉半天没反馈。→ 新增 `FlowerpotState.deviceLoadError`（带来源与错误码，失败**不清空**已有列表），列表为空且有错误时画 `AppErrorView` + 「重试」；`probeDevices()` 改名 `reloadDevices()`，成为下拉刷新 / 重试 / 联调页共用入口，失败以 `ActionResult` 返回并弹提示条。
  2. **家庭选择不稳定**：Android `homes.firstOrNull()`、iOS `homes?.first`，而 `queryHomeList` / `getHomeList` 的顺序在两次登录之间不保证一致；账号名下只要有两个家庭就会这次读到 A 家、下次读到 B 家的 0 台。第二个家庭恰恰是这套代码自己会造的——家庭列表瞬时返回空时会自动建「我的花园」。→ Android 新增 `pickHome`（先挑带设备的家庭，同样带设备时取 `homeId` 最小，并记日志），iOS 按 `homeId` 升序后取第一个。自动建家逻辑保留（新账号需要），但选择规则钉稳后不再摆动。
- **根因未确认**：需要在复现的手机上用联调页「拉取设备列表」，它会回报「共 N 台（家庭 X）」，与配网成功那次的家庭 id 对比——不同 → 就是第 2 条；相同但 0 台 → 设备不在这个家庭里（配网落到别处或云端已解绑）；直接报错 → 现在错误码会显示出来。另外涂鸦 uid 来自 APP 后端的 `userNo`，若同一手机号在后端换过 `userNo`，重新登录等于登进另一个涂鸦账号，这条只能在后端核对。
- 测试（未运行）：`device_list_page_test.dart` 新增一例——`getDevices` 抛错后 `deviceLoadError` 带错误码、页面显示错误态与「重试」而不是「暂无设备」，仓库恢复后点重试回到正常列表。
- 验证缺口：**本机没有 Flutter/Dart SDK，也没有 Android SDK 和 Xcode** —— `flutter analyze`、`flutter test` 未跑，两端桥接改动**没有编译过**，需在有环境的机器上先编译再测。
- 文档：`AI_CONTEXT.md` 补设备清单链路与家庭选择口径，新增 `docs/history/2026-09/2026-09-09-relogin-device-list-empty.md`，两个索引同步。
- **追加（同一轮，用户反馈已基本不用联调页）**：把定位所需的现场信息搬进真实页面，交付 **`b7b6ad6`（已推送）**
  - `FlowerpotState` 记 `lastHomeId`（每次成功读设备后从原生 `currentHomeId` 读回，此时原生已缓存，不会再触发云端查询），并给出 `sessionDiagnostics` = `uid … · 家庭 … · 设备 N 台 · 失败原因`。
  - 设备列表的**错误态和「暂无设备」空态**底部各画一行可长按复制的小字（`Key('device-list-diagnostics')`）——「一台都没有」时最需要的就是这两项。
  - 每次读设备列表打一行 `[devices] …` 日志（`debugPrint`，不按 debug 模式过滤，`adb logcat -s flutter` / Xcode 控制台可见）；iOS 补 `home picked <id> of <n> homes` 与 Android 对齐。
- **回答「家庭 id 从哪来、会不会因为 Wi-Fi 不同」**：家庭属于涂鸦账号、存在云端，由 `queryHomeList` / `getHomeList` 按当前 uid 拉取，桥接缓存在 `homeId` / `currentHome`（退登清空）。手机连哪个 Wi-Fi **不参与选家庭**。但网络会间接影响两条路径：① AP 配网期间手机挂在设备热点上没有外网，若家庭尚未缓存，`withHome` 在无网下查家庭可能失败、或拿到空的本地缓存进而**自动建家**——这正是账号多出一个空家庭的来路；② 配网时用的是哪个家庭，设备就绑进哪个家庭。所以因果是「多个家庭 + 选择不稳定」，Wi-Fi 只是制造第二个家庭的诱因。

---

## 2026-09-09：正矿 ssh 环境提交作者名改为 dh

- 环境：ssh；minerals-admin。**本机 Git 配置调整，无代码改动、无新提交进团队仓库**（工作区仍干净，分支 `feature-v1.8.3`）。
- 需求：正矿在当前环境提交到远程分支的 commit 作者名由 `pg-dh` 改为 `dh`。
- 执行：`git -C /pgdata/pg/dh/minerals-frontend config --local user.name dh`。选仓库级而不是全局：用户只点名正矿，同机的花盆、花盆后台、Hub 仍是 `pg-dh`（已逐个核对）。验证 `git var GIT_AUTHOR_IDENT` = `dh <xxxxx.com>`，committer 一并生效。
- 追加：邮箱也按用户要求改成 `duun235@163.com`（同样仓库级）。用户先问「能不能留空」，在临时仓库实测：Git 允许空邮箱，提交对象记为 `author dh <>`；但托管平台是按邮箱把提交归属到账号的，空邮箱在 Codeup 上认不到人、还可能被推送校验拦下，所以用了用户给的备选邮箱。现在 `git var GIT_AUTHOR_IDENT` = `dh <duun235@163.com>`，花盆 / 花盆后台 / Hub 仍是 `pg-dh <xxxxx.com>`。
- 未做，需用户决定：
  - **历史提交没重写**：本机此前推上去的 `08dfce1`、`6b7d0ae`、`ad31f92`、`a909a1a` 以及 2026-09-01 那批作者仍是 `pg-dh`。`feature-v1.8.3` 是与 zhengmaoru 等人共用的团队分支，改作者要重写历史并强推，按约定不自动做。
- 口径记录：`.git/config` 不随 Git 同步，**work / home 需各自再配一次**；已写入 `private/minerals-admin/docs/development.md` 新增的「11. 提交身份」，原「11. 跨机器协作」顺延为 12。

---

## 2026-09-09：花盆 APP 已绑定设备首页改用后台配置的植物图片

- 环境：ssh；flowerpot-app，工作分支 `main`。本轮开始时 pull 到用户自己推的 `5644162 更新植物图片`（替换了 `smart_planter_with_plant.png` / `smart_planter_device.png` 两张本地静态图）与合并提交 `2342d70`，本次改动落在其上。
- 需求：已绑定设备首页和植物详情页的植物图片都取植物列表接口返回的那张（后台管理系统给该植物配的），没有数据才用本地静态图，以接口为准。
- 交付：**flowerpot-app `b162068`（已推送）**
  - `HomeDashboardModel` 新增 `plantImageUrl`，`fromDevice` 取 `device?.plant?.imageUrl`——即 `Client/Product/getProductPlantList` 行里的 `plantImg`。
  - `HomePlantOverview` 正中那张 132×170 改由新的 `_PlantHeroImage` 渲染：有值走 `Image.network`，为空或 `errorBuilder` 触发才回落 `AppAssets.smartPlanterWithPlant`；尺寸、`BoxFit.contain`、`filterQuality` 均未变。
  - **植物详情页不用改**：`_PlantDetailArtwork` 本来就是「`plant.imageUrl` 优先 → 失败回落 `AppAssets.plantImage(plant.id)` → 未知 id 再退通用图标」，核对后原样保留。
  - 未动设备列表页 `_DeviceListCard` 里 48×62 的缩略图（仍是静态图）——需求指的是「首页-已绑定设备页面」，列表行是另一屏，要不要一起改由用户决定。
- 测试（未运行）：新增 `test/features/home/home_plant_overview_test.dart` 两例——配了图片时控件树上是带该 URL 的 `NetworkImage`；没配时画本地静态图且树上无 `NetworkImage`。第一例只断言控件树、且不额外 pump：测试环境里 `Image.network` 必然加载失败，多一帧就走 `errorBuilder` 换成本地图。
- 验证缺口：**本机没有 Flutter/Dart SDK，analyze 与 test 都没跑**；也未在真机确认后台图片放进 132×170 容器后的观感（素材比例与静态图不同可能偏扁或偏小），弱网下没有加载占位（与详情页保持一致）。
- 文档：`AI_CONTEXT.md` 补首页这条链路，新增 `docs/history/2026-09/2026-09-09-home-plant-image-from-backend.md`，两个索引同步。

---

## 2026-09-09：花盆 APP 定制动画「提示」卡背景图被裁

- 环境：ssh；flowerpot-app，工作分支 `main`（改前 `git pull --ff-only` = Already up to date，起始 `e355274`）。
- 需求：定制动画页提示盒子右下角的背景图，盒子高度改短后显示不完整，修复。
- 交付：**flowerpot-app `559ba84`（已推送）**，只动 `animations_page.dart` 的 `_AnimationTipsCard`。
- 定位：不是缩放坏了，是**被裁**。图用 `Positioned(right: -14, bottom: -18)` 顶到 `SizedBox(height: 126)` 之外，而 `Stack` 的 `clipBehavior` 默认是 `Clip.hardEdge`，顶出去的 18px / 14px 根本不画——卡片本身留着 14px 内边距，位置是有的。盒子压到 126 后被切掉的正好是文件夹下沿和右边的叶子。
- 顺带核对缩放：素材 `animation_upload_illustration.png` 是 670×304 宽图，`BoxFit.cover` + `alignment: centerRight` 裁到 118 见方时取的是源图右侧 304px 那一窗，文件夹与叶子整个在窗内，所以 cover 不是问题，未动。
- 改法：卡片 `padding: EdgeInsets.zero`，内边距挪到文案那层 `Padding`，`SizedBox` 高度由 126 改成 154（126+28）保持卡片外形不变；图改 `Positioned(right: 0, bottom: 14)`——按设计稿 `docs/UI/定制动画.png` 的摆法右边贴边、底部与文案齐平，整块在卡片内，也不会被 16px 圆角削到叶子尖。没有用 `Clip.none` 让它继续出血，就是为了避开圆角。
- 测试（未运行）：新增用例断言图 118×118、右缘与卡片对齐、底边距卡片底缘 14px、四边都在卡片矩形内；旧写法下底边会落到卡片外 4px，能挡住回归。
- 验证缺口：**本机没有 Flutter/Dart SDK，`flutter analyze` 与 `flutter test` 都没跑**，也未在真机/模拟器上看过效果，需要在有 SDK 的机器复跑。
- 文档：新增 `docs/history/2026-09/2026-09-09-animation-tips-illustration-clip.md`，两个索引同步。

---

## 2026-09-09：花盆后台「原价」核查 + 花盆 APP 植物数据链路确认（两问，均无功能改动）

- 环境：ssh；flowerpot-admin（`main`）与 flowerpot-app（`main`）改前均 `git pull --ff-only` = Already up to date。
- 问题①：花盆后台商品新增/编辑/详情是不是漏了原价（划线价）四字段（`marketAmount` / `marketAmountEnglish` / `marketAmountFan` / `marketAmountJapanese`）。
  - **结论：不是漏做，是花盆后端根本没有商品模块。** 实测依据：
    - `https://api.yikaltd.com/v2/api-docs` 当前 111 条路径、71 条 `/ZoneAdmin/*`，只有 AppVersion / Common / Jurisdiction / Passport / Product / ProductPlant / User 七组；`Goods`、`Order`、`ProductImg`、`AiConfig`、`ProductVersion` 都已不在文档里。
    - 只读探测：`/ZoneAdmin/Goods/getGoodsList` 返回容器原始 HTTP 500，和乱编的 `/ZoneAdmin/Nope/nope` 一模一样；而真实存在的 `/ZoneAdmin/Product/getProductList` 返回 200 + `{"retCode":406,"retMsg":"请重新登录！"}`。
    - 同一路径在相册后端 `https://api.boltfox.cn` 返回业务信封（模块在那边）；`marketAmount` 四字段只出现在 boltfox 的 `GoodsAddApiIn` / `GoodsApiOut` / `GoodsDetailApiOut`（以及 `ClientGoodsApiOut.marketAmount`）。
    - 花盆后台 `AI_CONTEXT.md` 第 109 / 152 行本来就写着商品等是复制项目遗留、不在 yikaltd Swagger 范围内，与实测一致。
  - 处理：只修文档，不加输入框——加了就是 2026-09-09 上午刚删掉的那种空转字段。`docs/interface-list.md` 补 2026-09-09 复核结论并改写 Goods 行（原写「Done」与文首「goods 不在范围内」自相矛盾）。交付 **flowerpot-admin `e7b051e`（已推送）**。
  - 待用户决定：花盆商品/订单等遗留页面是留着等后端补模块，还是按之前的模块下线方式清掉。
- 问题②：花盆 APP 植物列表图片是否取接口字段、植物详情是否按设备上报的植物 ID 经 DP 与涂鸦交互获取。
  - **列表图片：是。** 后端 `Client/Product/getProductPlantList` 行里的 `plantImg` → `PlantProfile.imageUrl`（`app_backend_repository.dart:1114`），选择页与详情页都用它。
  - **详情：一半对。** 涂鸦只回答「哪一株」——设备用 DP 116 `plant_variety` 上报后台配的标识符（`tuYaRemark` 字符串，不是数字 ID），App 选植物也是写回 116（分类另写 161）；**详情内容不是从涂鸦读的**，是拿 116 的标识符去后端目录匹配（`_plantForIdentifier` / `ensurePlantProfile`），图片、别名、简介、最适温湿度、四条建议、养护难度、`categoryType` 全部是后端字段；匹配不上补拉一次目录，仍失败回落本地目录且不打断详情页。详情页的实时数值（107/108/113/115 等）才是设备 DP 上报。
  - 处理：`AI_CONTEXT.md` 把这条分工写清楚，交付 **flowerpot-app `e355274`（已推送）**。
- 验证：本轮无代码改动，只有文档；接口结论来自实际 HTTP 探测与两份 Swagger 的机器可读契约。

---

## 2026-09-09：花盆 APP 配网页 Wi-Fi 名称刷新与休眠模式页内展开

- 环境：ssh；flowerpot-app，工作分支 `main`（改前 `git pull --ff-only` = Already up to date，起始 `992b8f8`）。
- 需求：① 连接Wi-Fi 页反馈「Wi-Fi 名称和实际连接的名称不一致」，先查是不是昨天的样式改动引起，再修；② 昨天加的休眠模式不要做成入口，直接在「行为」页展开，模仿同页上面的样式与交互。
- 交付：**flowerpot-app `b493dbd`（已推送）**
  - 排查结论：**不是 `85854f6` 那次样式改动**。那次只是把 Wi-Fi 名称 / 密码两格抽成 `_CredentialInput`，控制器和取值来源没动。真正原因在 `pairing_page.dart`：首帧 `_loadNetworks()` 复用 `FlowerpotState.wifiScan` 缓存（通常是搜索页几分钟前扫的），而且只在输入框为空时才填，此后再不更新——用户去系统设置换了 Wi-Fi 回来，页面还留着进页面那一刻的名字。
  - 修复：进页面强制重扫（`force: true`）；页面实现 `WidgetsBindingObserver`，`resumed` 时再刷新一次（配网进行中不刷新，那时手机是故意挂在设备热点上）；新增 `_autoFilledSsid`，只有输入框为空或内容仍等于上次自动填入值才覆盖，用户输入 / 「切换」选过的 / 重试带入的名称一律不动。5 GHz 与设备热点的原有过滤不变。
  - 休眠模式：新增 `widgets/standby_settings_card.dart`（`StandbySettingsCard` 复用 `BehaviorScheduleCard` 版式 + `BehaviorTimeRow` 可点行，`showStandbyDelayDialog` 照 `showScheduleSlotDialog` 外壳做滚轮弹窗），行为页删入口换卡片，开关 DP 151 即时下发、延迟时间弹窗保存才写 DP 152 且取值没变不发；删除 `standby_settings_page.dart` 与 `AppRoutes.standbySettings`。
  - 文档：`AI_CONTEXT.md` 两处口径更新，新增 `docs/history/2026-09/2026-09-09-pairing-ssid-and-standby-inline.md`，`docs/README.md` 与 `docs/history/README.md` 索引同步。
- 验证缺口：**本机没有 Flutter/Dart SDK，`flutter analyze` 和 `flutter test` 都没跑**。测试已写但未运行——配网页新增 3 例（缓存过期重扫、回前台刷新、用户输入不被覆盖），休眠从 `standby_settings_page_test.dart` 改写为 `standby_settings_card_test.dart` 6 例。需要在有 SDK 的机器复跑；生命周期用例与滚轮拖动用例是最可能需要微调的两处。
- 顺带：本机 CodeGraph CLI 虽已装好，但花盆仓库没有 `.codegraph/` 索引，按工具提示「索引与否是用户的决定」没有自行 `codegraph init`，本轮用源码检索完成。要在这台机器用 CodeGraph 的话，在花盆仓库跑一次 `codegraph init` 即可（索引本机生成、`.gitignore` 已忽略）。

---

## 2026-09-09：正矿码头直提按采购类型控制客户项

- 环境：ssh；minerals-admin，工作分支 `feature-v1.8.3`（改前 pull = Already up to date；Hub 同步 = Already up to date）。
- 需求：码头直提新增页，`getWaitDeliveryPurchaseList` 后端多返回 `purchaseType`（0 代理采购 / 1 自营采购）、`customerId`、`customerName`、`agentOrderNo`；采购单号与客户项换位置；自营禁用客户项，代理按采购单的 `customerId` 回显客户并允许手改；这四个字段一并传给保存接口。
- 交付：**minerals-admin `a909a1a`（已推送，生产构建 1024MB 堆 / 2 线程 29.7s 通过）**，改动集中在 `src/views/sales-pickup/list/pier-add.vue`。
  - 关键点是 `rules` 必须从普通对象改成 `computed`：原写法 `required: true` 是 setup 时的快照，只在 form-item 上写 `:required="!isSelfOperated"` 不足以放开——el-form-item 的 `required` 与表单 rules 是叠加关系，自营模式仍会被那条 required 拦住提交。同时给 `el-form` 加 `:validate-on-rule-change="false"`，避免规则变化时立刻弹红字。做法与堆场 `yard-add.vue` 一致。
  - `customerOptions` 把采购单带回的客户补进下拉，防止该客户不在 `getWaitDeliveryCustomerList` 里时回显不出来；同时修掉原提交里 `state.customerList.find(...).label` 客户不在列表就抛错的写法。
  - 集装箱取数条件从「客户 + 采购单都有」改成 `canFetchGoods`（已选采购单，代理采购下还需客户），否则自营模式永远查不到集装箱；切换采购单清空已选集装箱，避免跨单混入。
- 待确认口径：保存时 `customerId`/`customerName` 传的是**最终选中的客户**（因为需求明确客户可手改）。若后端要的是采购单原始委托客户，改成取 `selectedPurchaseOrder` 的值即可。
- 未完成：**未做浏览器实机验证**，自营 / 代理两类采购单的真实数据没跑过；全量 `vue-tsc` 仍因本机 1GB 堆 OOM 未跑，沿用生产构建当门禁。

---

## 2026-09-09：正矿出库附件必填标识与码头直提集装箱弹框

- 环境：ssh；minerals-admin，工作分支 `feature-v1.8.3`（改前 `git pull --ff-only origin feature-v1.8.3` = Already up to date；Hub 同步 = Already up to date）。
- 需求：① 出库单新增/编辑页「出库附件」补必填标识；② 码头直提新增页「请选择集装箱」弹框改为打开即调列表接口（和昨天堆场那个同类问题）。
- 交付：**minerals-admin `ad31f92`（已推送，生产构建 1024MB 堆 / 2 线程 30.7s 通过）**
  - `out-warehouse/out-warehouse-list/template/handleDetail.vue`：`prop="purchaseOrderFileList"` → `prop="stockOutFileList" required`。原 prop 是复制粘贴残留，和 `FileUpload` 绑定的 `form.stockOutFileList` 对不上，所以既没有星号、必填也校验不到东西；写法对齐入库单 `b56b251`。同页只读的「提货单附件」prop 一并改回 `fileList`（同样是残留，改动本身无行为影响）。
  - `sales-pickup/list/pier-add.vue`：`openAddGoodsDialog` 改为 `async` 并在打开后 `await fetchGoodsList()`；客户或进口采购单号任一为空时只开弹框不发请求（两者都是表单必填，缺任一查询无意义），弹框内「查询」按钮逻辑未动。列表页「新增码头直提」按 `deliveryType=1` 进的就是这个页面，该页只负责新增，没有 edit 包装。
  - 本轮改用 CodeGraph 定位（本机 CLI 今天刚装好），改完 `codegraph sync` 增量刷新 2 文件 / 474ms。
- 需实机确认的副作用：`required` 会同时拦提交——出库单不传附件将保存不了；编辑老单据时详情把 `commonFiles` 回填该字段，历史数据没附件的要先补传。若只想要星号不想要拦提交，说一声改成纯样式。
- 文档：`docs/maintenance.md` 加「附件必填星号不显示或必填校验落空」条目（含 `prop` 与 model 字段必须一致、不要用 `class="is-required"`），并修正已过期的「本地文档不可跨机同步」；`docs/domain-map.md` 补码头直提弹框口径。
- 未完成：**未做浏览器实机验证**；全量 `vue-tsc` 仍因本机 1GB 堆 OOM 未跑（沿用构建作为门禁）。

---

## 2026-09-09：正矿堆场提货「补充信息」批次号取值修复

- 环境：ssh；项目 minerals-admin（正矿），工作分支 `feature-v1.8.3`（无 upstream，用显式 `origin feature-v1.8.3` 同步与推送；改前 `08dfce1` → `1a516bd`）。
- 需求：堆场提货 —— 补充信息页，货物信息列表的批次号取 `goodsList` 数组里的 `stockBatchNo` 字段。
- 交付：**minerals-admin `6b7d0ae`（已推送，生产构建 1024MB 堆 / 2 线程 30.8s 通过）**
  - `src/views/sales-pickup/list/yard-replenish.vue` 两处：批次号列 `prop="batchNo"` → `prop="stockBatchNo"`；`objectSpanMethod` 的 `mergeCols` 里 `'batchNo'` → `'stockBatchNo'`，保住该列跨行合并。
  - 根因：`form.goodsList` 两个来源不同名——走库存接口 `stockInfoList`（「重新导入」及详情里有 `agentOrderNo` + `applyGoodsList` 时）会映射 `stockBatchNo: item.batchNo`；不走这条时直接用提货单详情返回的 `goodsList`，那批数据只有 `stockBatchNo`，原绑定下整列为空，合并列还因取到 `undefined` 把同一 `skuCode` 的行错误并成一行。详情页 `yard-detail.vue`、新增页 `yard-add.vue` 一直用 `stockBatchNo`，本次是补齐口径。
  - 未动：排序用的 `compareFields = ['batchNo', ...]` 作用于库存原始行；`pier-replenish.vue`（码头）没有批次号列。
- 文档：`private/minerals-admin/docs/domain-map.md` 补堆场三页批次号字段口径；私有流水 `logs/activity.md` 与详细记录 `logs/2026-09-09-堆场提货补充信息批次号.md`；Hub `logs/projects/activity.md` 追加看板行。
- 验证缺口：全量 `vue-tsc --noEmit` 在本机 1024MB 堆下 **OOM 未跑完**（按本机内存约定不上调堆，未改用其它机器），仅以生产构建通过为准；**未做浏览器实机验证**。
- 环境补建（用户确认后本轮一并处理）：ssh 机器上正矿的 private_mounts 软链接原本一个都没有，已用 `scripts/setup-links.mjs --env ssh --project minerals-admin` 补齐 `.codegraph`、`docs`、`logs`、`AGENTS.md`、`AI_CONTEXT.md` 五个链接，全部指向 Hub 的 `private/minerals-admin/`，团队仓库 `git status` 仍干净。冲突的仓库内 `docs/build-opt/`（打包优化原始产物）已校验后并入 Hub 私有 docs。三端定义本来就共用 `projects.yaml`，work 早已挂载，home 尚无正矿仓库故未映射。本机没有 `codegraph` CLI，索引仍是 work 的快照。详见 `logs/hub/activity.md` 与 `private/minerals-admin/logs/2026-09-09-ssh私有挂载补建.md`。

---

## 2026-09-09：花盆后台植物资料删除四条建议字段与养护建议

- 环境：ssh；工作分支 `main`（改前 `git pull --ff-only` = Already up to date）。
- 需求：植物资料新增 / 编辑 / 详情页面删除光照建议、需水建议、空气温度建议、湿度建议 4 个字段及相关代码。
- 交付：**flowerpot-admin `4b8bd13`（已推送，`vite build` 通过 43.60s）**
  - 三种模式共用 `ProductPlantFormDialog.vue`，一处删除三处生效：`defaultForm` 初始值、`rules` 四条长度校验、`buildPayload` 四个提交字段、模板四个 `el-col` 全部删除，`grep` 复查 `src/` 下字段名与中文标签均归零。
  - 「植物分类」`categoryType` 保留（下发设备 DP 161），原与四条建议并排 `span 6`，改为 `span 12` 与同区字段对齐。
- 关键发现：只读核对 Swagger，**整份契约里没有任何 `*Suggestion*` 字段** —— `ProductPlantAddApiIn`（新增/编辑）与 `ProductPlantDetailApiOut`（详情）都没有这四个。这四个输入框从 2026-09-08 `60eee3a` 加上起就是空转的，填了存不进、详情也回不来。因此直接删除，不像「所属产品」那样保留原样回传。
- 追加需求：「养护建议」也不需要。交付 **`6051546`（已推送，`vite build` 通过 43.84s）**——删表单项与 `requiredTextRule` 必填校验（此前不填无法保存，现在新增不再被卡）；但 `defaultForm` 与 `buildPayload` 两处保留 `careInstructions`：它是后端契约真实存在的字段（Add 入参收、Detail 出参返回）且可能有存量数据，编辑时原样回传不清空，新增时空值被 `cleanPayload` 过滤。与四条建议口径不同的原因就在这里。花盆 APP 已于 `2903cf7` 改用本地中英文案，不再读该字段。
- 未完成项：**未在浏览器实机验证**；若后端后续补上这些字段需按 `60eee3a` 与本轮历史文档恢复；养护建议存量数据此后只能在后端 / 数据库维护。

---

## 2026-09-09：花盆后台首页注册趋势改 ECharts 柱状图

- 环境：ssh；工作分支 `main`（改前 `git pull --ff-only` = Already up to date）。
- 需求：首页「用户注册增长趋势」改用柱状图，不要原来那种手写条形列表，必要时引入 ECharts。
- 交付：**flowerpot-admin `c140b26`（已推送，`vite build` 通过 44.13s）**
  - 新增 `echarts@^6.1.0`，按需引入 `core + BarChart + Grid/Tooltip/DataZoom + CanvasRenderer`；`vite.config.js` 的 `manualChunks` 单独拆出 `echarts` chunk（523.94 kB / gzip 178.09 kB），不并进 1.1MB 的 vendor。
  - 新增 `src/views/home/RegistrationTrendChart.vue`：只接 `list` prop，不自己发请求；品牌色竖向渐变柱、颜色从 CSS 变量读；`queryDate` 兼容 `YYYY-MM-DD` / `YYYY-MM` / 自定义周期串；Y 轴 `minInterval: 1`；>40 个数据点自动加 dataZoom；`setOption(option, true)` 整份替换，`ResizeObserver` 跟随容器，卸载 `dispose()`。
  - 首页删掉 `maxRegistrationCount`、`getBarWidth` 和六段旧进度条样式，空态仍走 `el-empty`，周期切换与 `v-loading` 不变。
  - 补 `docs/history/2026-09/2026-09-09-home-registration-bar-chart.md`，`AI_CONTEXT.md` 技术栈与依赖安装口径同步。
- 外部操作：只读拉取 `https://api.yikaltd.com/v2/api-docs` 核对 `getStatisticsUser` 契约（`queryDate` = 日期或周期，`userCount` = 注册数量）。
- 依赖安装口径：`npm install echarts --save --no-package-lock`，只改 `package.json`，`yarn.lock` / `pnpm-lock.yaml` 未动，也没新增 `package-lock.json`（主包管理器仍未确认）。**其他环境拉到 `c140b26` 后必须重新安装依赖**，否则构建找不到 echarts。
- 未完成项：图表**未在浏览器实机验证**；近一年的实际数据粒度没有实测样本，若后端返回「第 N 周」这类中文串，`formatAxisLabel` 需要按实际返回再调。

---

## 2026-09-09：花盆后台侧栏菜单修复，并把「完成后默认 pull + push」写进约定

- 环境：ssh；路径见 `environments/ssh/projects.local.yaml`。
- 需求：① 排查花盆后台取 `getLeftMenus?parentMenuId=2` 后报 `No match for {"name":"config"}`、左侧菜单整块不显示；② 前端先过滤掉后端返回的失效菜单；③ 把「每次完成任务，没有特殊要求就给对应项目和 Hub 先 pull 再 push」写进文档并执行。
- 定位结论：`690a70b` 下线「系统配置」时删了本地路由 `name: 'config'`，后端菜单表里 `appUrl=config` 那行还在（同步脚本只增不删，当时已记为待人工清理）。`Sidebar.vue` 把 `menuUrl` 直接交给 `RouterLink`，vue-router 解析不存在的命名路由在渲染期抛错，`v-for` 整体中断，所以整块菜单消失。
- 交付：
  - **flowerpot-admin**：`Sidebar.vue` 渲染前用 `router.hasRoute` 过滤失效菜单，屏蔽列表逻辑收进 `visibleMenus` computed，空分组不再留标题，dev 环境每个失效 `menuUrl` warn 一次；补 `docs/history/2026-09/2026-09-09-sidebar-route-filter.md`，同步 `AI_CONTEXT.md` 与 `docs/dynamic-menu-sync.md` 常见问题。提交 `61f8e76`，已推送，`vite build` 通过（35.36s）。
  - **Hub**：`AGENTS.md` 新增「任务完成后的默认动作：再 pull 一次，然后 push」，替换原「commit 和 push 均由用户决定」；`README.md`、6 份项目 Context 与 `context/_template.md` 同步新口径。
- 本轮流程自查：改 `Sidebar.vue` 前**漏了对 flowerpot-admin 执行 pull**，违反 `AGENTS.md` 最高优先级规则；发现后补做 stash → `git pull --ff-only`（Already up to date）→ pop，未造成分叉。两个仓库 push 前均再次 pull 确认为最新。
- 未完成项：后台「菜单列表」里已下线模块的菜单行（基础信息配置 / 用户产品图片 / 产品版本 / 用户产品列表）仍需人工清理或置 `isNav=0`；前端改动**未在浏览器实机验证**，等用户实测。

---

## 2026-09-08：家里环境接入与批量拉取

- 环境：home；各项目路径见 `environments/home/projects.local.yaml`。
- 需求：将本机工作目录中的项目接入 Hub，并拉取全部项目当前分支。
- 状态：5 个业务项目映射已建立；Hub 与 4 个业务仓库拉取成功，花盆后台等待用户处理本地修改。本轮不提交、不推送。
- 身份核实：项目文档与 Git 远端名称相符，复用既有 ID；所有目录均为 Git 根目录，当前分支均为 `main`，upstream 均为 `origin/main`。
- 正矿本机不存在，不添加映射、不执行拉取。Hub 自身作为管理入口同步，不新增业务项目注册项。

| 项目 | 拉取前 | 拉取后 | 结果 |
| --- | --- | --- | --- |
| Project Hub | `2d9633d` | `2d9633d` | 已是最新 |
| 花盆 APP | `9dfc52d` | `9dfc52d` | 已是最新 |
| 花盆后台 | `468d76f` | `468d76f` | `dist.zip` 有未提交修改，未执行 pull，保留现场待用户决定 |
| 相册 APP | `a89eb91` | `be2d80f` | 快进成功 |
| 相册后台 | `7fd5097` | `746407d` | 快进成功 |
| 相册小程序 | `8dab520` | `487869b` | 快进成功 |

验证与限制：成功拉取的 4 个业务项目均完成 `codegraph sync .`，最终工作区干净且分支仍为 `main`。5 条映射的 ID、Context、目录及 Git 根目录核对通过，Hub 的 `git diff --check` 通过，此前迭代原文完整保留校验通过。本轮没有业务代码编辑，不运行业务构建或测试。花盆后台的 `dist.zip` 修改原样保留，不自动 stash、还原或覆盖。此前迭代及其未完事项保留如下。

---

## 2026-09-08：ssh 开发机——花盆 APP 与花盆后台交付

状态：全部已提交并推送 —— 花盆APP `2903cf7`、花盆后台 `468d76f` + `7bb1f8b`、Hub 本次记录
日期：2026-09-08
环境：ssh（SSH 开发机，按 `environments/ssh/projects.local.yaml` 解析）

---

## 需求与分发

| 项目 | 需求 | 交付 |
| :--- | :--- | :--- |
| **flowerpot-app** | ① 排查「图片列表加载失败…（HTTP 404）」是哪个接口 → 定位到进图库前置的 userProduct 换 id 链路；② 图库只调 `getUserProductImgList`，其余接口删掉（设备档案由涂鸦提供） | 已提交推送 `2903cf7` |
| **flowerpot-admin** | 接口地址 IP 改域名，改完推远端 | 已提交推送 `468d76f` |
| **flowerpot-admin** | 删除遗留支付 / 上传服务配置（39.108.153.239），现在不需要 | 已提交推送 `7bb1f8b` |
| **flowerpot-app** | 首页-已绑定设备 7 项：顶栏改设备名、多语言框架（简中+英文，可扩到 18 种）、自动检测植物改独立页、其他设置去掉系统文件两项、纪念日日期校验、纪念日文本框样式、新增休眠模式（DP 151/152） | 已提交推送 `2903cf7` |
| **flowerpot-app** | 首页-已绑定植物：「今日养护」改成按四条状态读养护建议并 5 秒轮播、文案按给定 12 条、支持多语种 | 已提交推送 `2903cf7` |
| **flowerpot-app** | 配网/首页/动画页 7 项：配网系统弹框、选择设备页两条入口、首页空态文案、搜索页三段文案与手动选择、搜索时长 45 秒、首页四卡对齐、定制动画页三处文案与功能 | 6 项已实现，第 1 项无法在 App 侧实现（见下） |

同步：`git pull --ff-only`，project-hub main（`0b85d8e → 2d9633d`）、flowerpot main（`9dfc52d`，Already up to date）、flowerpot-web main（`60eee3a`，Already up to date）。工作分支均为各自当前分支，未切换。

---

## 交付明细（flowerpot-app / main）

- **图库接口收敛**：`getImages` / `uploadImage` 入参由 `userProductId` 改为涂鸦 `deviceId`，请求变成 `getUserProductImgList?...&deviceId=…` 与 `setUserProductUpload?deviceId=…`；`refreshAnimations` / `addAnimation` 不再走 `_ensureBackendDevice`（即不再调 `getUserProductList` / `getUserProductDetail` / `addUserProduct` / `Product/getProductList`）。纪念日链路仍用旧方式，本轮未动。
- **搜索设备页**：删掉「扫描到 N 个网络…」「手机当前连接…」「用下面的手动选择」和「从附近网络中手动选择设备」；新增 45 秒搜索窗口（间隔 2 秒重扫），窗口内一直显示搜索中，扫到热点立即进下一步。
- **选择设备页**：删掉「设备不在上面？显示附近全部网络」和两处「设备已在配网状态，继续」。
- **首页**：空态文案改「还没有连接智能设备…」；概览四张指标卡统一 `top:145` / `left|right:0`，空气温度与相对湿度不再错位。
- **定制动画页**：删掉「文件同步」按钮与实现（连带删掉已无调用方的 `FlowerpotState.syncAnimations`）、删掉「仅支持屏幕录制或本地文件。点击这里重新授权」提示条，上传说明改为「支持本地图片文件上传」。
- 项目内文档已按其规则更新：`docs/history/2026-09/2026-09-08-gallery-device-id-and-pairing-cleanup.md`、`docs/README.md`、`docs/history/README.md` 索引、`AI_CONTEXT.md` 两处过期事实。

### 今日养护轮播（本轮追加）

- 「今日养护」由一句自写总结改为读四条状态功能点（107 需水 / 108 光照 / 113 温度 / 115 湿度）当前取值对应的建议，顺序与上面四张卡片一致，`HomeCareBanner` 每 5 秒切一条（淡入淡出 + 上移 420ms）。
- 产品给的 12 条文案与项目里已有的 `TuyaStatusCopy` 中文表逐字一致，直接复用没有另写。
- 多语种：`TuyaStatusCopy` 补了四张英文表和按语言查表的方法，跟着设置页的语言开关（zh / en）走，非英文回落中文；首页四张卡片的标题与取值也一并跟随语言。
- 首页原来不判断温度冷热，本轮补上 113 判断，兜底阈值（18–28℃）上移到 `TuyaStatusCopy`，与温度状态页共用一份。

---

## 交付明细（flowerpot-admin / main，已推送）

- `.env` 的 `VITE_APP_API_ORIGIN`：`http://120.25.227.36:8601` → `https://api.yikaltd.com`；运行时只有这一个地址来源（`request.js`、`clientBasic.js` 都读它，开发代理没配 `VITE_APP_PROXY_TARGET` 时也回落到它）。
- `scripts/sync-admin-menu.mjs` 的 `DEFAULT_API_BASE` 同步改成域名。
- `AI_CONTEXT.md` 第 3 节、`docs/api-integration-progress.md`、`docs/dynamic-menu-sync.md`、`src/api/productPlant.js` 注释里的 Swagger 地址同步改域名，并保留「曾临时改用 IP」的来龙去脉；新增 `docs/history/2026-09/2026-09-08-api-origin-back-to-domain.md` 并补齐历史索引。
- 验证：SSH 开发机 `curl https://api.yikaltd.com/v2/api-docs` 返回 200（245411 字节），与 IP 返回同一份契约（仅 `host` 不同）；`npx vite build`（1024 MB 堆）通过，31.40s。
- **遗留支付/上传服务：确认不需要后整体删除（第二次改动，未提交）**——`.env.development` / `.env.production` 删掉 `VITE_APP_BASE_PAY` / `VITE_APP_BASE_UPLOAD` / `VITE_APP_BASE_BIGUPLOAD`（连同写在 URL 里的 sign 查询串），两个文件已无分环境覆盖项只留说明；删除 `src/utils/requestPay.js`（它的 baseURL 就是被删的变量，留着只会打到后台自身源站）；`src/api/log.js` 去掉该 import 与 `getPayQuery`/`getPayRefundQuery` 两个无人调用的封装（log.js 其余函数仍被日志页使用，文件保留）。`README.md`、`AI_CONTEXT.md`、`docs/next-session.md` 与历史记录同步更新，`npx vite build` 再次通过（29.55s）。

---

## 交付明细（flowerpot-app 第三批：首页与设置 7 项）

- **多语言**：新增 `lib/src/shared/l10n/`（`AppLanguage` 枚举 + `AppLocalizationsScope` + `AppL10n` 文案目录），做法对齐相册 APP，但文案用 `t({语言: 文案})` 的 Map 写法而不是位置参数——18 种语言下位置参数会失控；缺译文按回落链落到简中。设置页语言列表由枚举生成，加语种不用改页面。**只覆盖本轮涉及的页面，其余页面仍是硬编码中文**；`flutter_localizations` 未引入（本机跑不了 `pub get`，改 pubspec 会让别人构建直接失败），所以 Material 内建文案仍是英文，与改动前一致。
- **顶栏设备名**：`HomeHeader` 加 `title`，已绑定设备时正中显示设备名（长名省略号），未绑定仍是品牌标识。
- **自动检测植物**：改成与 LED 设置同款的独立页（`PlantDetectionSettingsPage`），设置页那一行只显示状态；行内开关的整套支持已删除。
- **其他设置**：删掉「系统文件更新」「修复系统文件」两行、中间的红色说明条和两个只弹「暂未开放」的处理函数。
- **编辑纪念日**：保存前校验日期（提示「请选择日期」）；文字输入框边距对齐上方输入框、输入区 92→104、字号 16→17，三个输入框圆角 16→12（设计稿上同形）。
- **休眠模式**：新增 `StandbySettingsPage`，开关 DP 151 即时下发、延迟时间 DP 152 由时/分滚轮 + 保存写入并钳到 1–180 分钟，入口在「行为」页。版式照 `docs/UI/v2/割草机/割草机-雨淋设置.png`。
- 项目内文档：新增第三份历史记录并更新两个索引与 `AI_CONTEXT.md`。

---

## 追加（同日）：连接 Wi-Fi 页输入框（已推送）

「Wi-Fi 名称 / 密码」两格原来把 `TextField` 压在 `SizedBox(height: 24)` 里配 `InputDecoration.collapsed`——15px 的字加光标本就接近 24，聚焦时光标上下顶格、点击热区也只有 24px，就是「上下太窄」的来源。现在两格抽成同一个 `_CredentialInput`：高度交给 `isDense` + 上下留白自己撑（约 30px，行高仍是 72，版式不动），聚焦时在值下面画一条品牌色细线、失焦透明。没有照登录页改成胶囊输入框——`docs/UI/连接Wi-Fi.png` 上这张卡就是「图标 + 标签 + 值 + 分隔线」的样子，换成登录页那种会偏离设计稿。补了聚焦态与高度的用例。

---

## 追加（同日）：后台三项 + APP 十项（已推送）

**flowerpot-admin**：① 下线用户设备（用户产品列表）、用户产品图片、产品版本、系统配置（基础配置→系统配置）四个模块，连同只服务于它们的接口封装与菜单同步脚本节点；产品列表按用户确认**保留**。② 植物管理去掉「所属产品」（表单 + 列表筛选 + 表格列）。③ 产品新增/编辑/详情去掉形状类型、屏幕方向、尺寸、广播ID、轮播间隔、横/竖向旋转度数，列表去掉形状与尺寸两列；编辑时这些值仍原样回传，不会清空后端已有数据。`npx vite build` 通过（31.92s）。提交 `690a70b`，已推送。

**flowerpot-app**：① 设置页分享入口用常量关掉；② 帮助中心从「我的」搬到设备设置页；③ 新增 OTA 进度弹层（进度条+百分比，升级中不可关）；④ 卡片标题去加粗，LED 不再与「显示」共用插画（LED / 自动检测植物暂用矢量图标占位，**等 UI 出正式素材**）；⑤ 意见反馈读后台平台邮箱、箭头改复制图标；⑥ 关于页去掉版本说明，补齐强制/提示升级链路（启动检测 + 红点 + 弹窗）并按 swagger 修正 `getLastVersion` 字段解析；⑦ 我的进页即刷新用户信息（昵称）、`AppAvatar` 图片加载失败退回占位图（左上角入口「消失」的根因）；⑧ 我的与设备设置列表行高抬高并补下划线；⑨ 四个状态详情页的养护建议改读 `TuyaStatusCopy.advice`（中英各 12 条，跟随界面语言）；⑩ 161 未下发的排查结论见下。提交 `992b8f8`，已推送。

---

## 验证摘要

- **SSH 开发机没有 Flutter / Dart SDK**（`~/sdk` 下只有 Go），`flutter analyze`、`flutter test` 一个都跑不了，本轮只做静态复核并同步修改了受影响的用例，不宣称通过。
- 同步改动的测试：仓库后端契约用例（新增按 `deviceId` 取图库的用例）、state 集成用例、搜索页/选择页/动画页/首页空态用例。
- 45 秒窗口的用例依赖假时钟推进，需在有 SDK 的机器上实跑确认没有遗留 Timer。

---

## 需要用户确认

1. **第 1 项做不了**：「要连接至设备吗？智能花盆将使用临时 WAN 网络连接至设备。」不是 App 的弹框，源码里没有这两句。它是 Android 10+ 对 `WifiNetworkSpecifier` + `requestNetwork` 的**系统授权框**（`MainActivity.joinDeviceHotspot`），必须由用户点同意，应用无法预先接受或跳过；绕开它只能回到「引导用户去系统设置连热点」的手动路径，步骤更多。
2. 图库按 `deviceId` 过滤依赖后端该接口支持这个参数，需后端确认；404 本身也要服务端确认是路由缺失还是临时地址部署问题。
3. 搜索页去掉手动选择后，热点名不在白名单且系统扫不出时，只剩「设备已在配网状态，继续」这条路。
4. **没有引入全局 i18n**：项目至今没有 `flutter_localizations`/arb，全部界面文案硬编码中文，只有设置页的语言开关是现成的。本轮只给这批状态文案做了中英双语表，切英文时也只有首页这块跟着变；全局多语种是一次独立迁移，要做请单独排期。英文文案是本轮撰写的（产品只给了中文），需要复核。
5. **休眠模式与多语言都没有真机 / SDK 验证**：DP 151/152 此前没有页面用过；滚轮钳位、语言切换整树重译都只做了静态复核。
6. 英文文案为本轮撰写，需产品或英文母语者复核；编辑纪念日「中间白色部分内容过小」按「输入区偏矮 + 字号比标题小」处理，如指别的看截图再调。
7. 三批改动合并为一次提交 `2903cf7` 推送到 main（本机无 SDK，analyze/test 仍未跑，上机请先跑测试）。
8. **161 未下发是数据问题**：swagger 里 `ClientProductPlantApiOut`（植物列表）有 `categoryType`（1 水培/2 适中/3 耐旱），APP 读的就是它，选植物页用的也是这个列表——所以只有后台该行没填分类才会走到「未下发 161」。提示已改成点名字段。另注意 `ClientProductPlantDetailApiOut` **没有** 这个字段。
9. **`_debugPlantIdentifier = '17'` 还写死着**：联调期把 DP 116 下发标识统一成冷水花的 17，后台补齐 `tuYaRemark` 后必须改回 null，否则选任何植物设备都当成冷水花。本轮未动，待产品确认。
10. **删掉系统配置页后**，平台邮箱只能在后端维护；APP 侧仍从 `getBasicData` 读，不受影响。广播ID 从产品表单去掉后，新增产品不再提交该字段，若后端必填会失败。
11. 后台已存在的菜单行（用户产品图片、产品版本、基础信息配置等）要人工在「菜单列表」里清理，同步脚本只创建不删除。

上一轮记录见 `iterations/archive/2026-09-08-私有目录symlink与统筹留痕.md`。

---

## 此前迭代原始记录（保留待推送事项）

状态：代码均已实现并验证完成，合并提交并推送
日期：2026-09-08
环境：work / ssh 多端协同

---

## 需求与分发

| 项目 | 需求与改动 | 环境 / 交付 |
| :--- | :--- | :--- |
| **project-hub** | **私有目录 Symlink 方案、统筹留痕体系与方案库建设**：落地 scripts/setup-links.mjs（迁移、解绑、批量挂载），建立 logs/hub/ 自身留痕、logs/projects/ 全局看板、logs/solutions/ 方案库，建立 private/ 私有大文件夹扩展规范。 | work / 本次提交 |
| **minerals-admin** | **私有目录安全迁移与物理隔离**：docs、.codegraph、logs、AGENTS 等迁移入 Hub，原业务目录实体彻底删除替换为软链接，业务仓库 git clean。 | work / 本次提交 |
| **minerals-admin** | **进口采购单新增/编辑校验规则修复**：修复定价依据组件脱离 el-form 上下文导致成分要求报必填的缺陷；修复合同金额回填后红字不消失；详情与 AI 回显补清空校验。 | ssh / 提交  8dfce1 |

---

## 验证摘要

1. **Project Hub**：
   - 单元测试：
ode --test scripts/setup-links.test.mjs 6 项自动化测试全部通过。
   - 静态检查：git diff --check 通过。
   - 软链接实测：正矿 5 项私有目录/文件挂载全部生效（docs、logs、.codegraph 为 Junction，AGENTS.md、AI_CONTEXT.md 为 SymbolicLink）。
2. **正矿业务仓库 (minerals-frontend)**：
   - 工作分支 eature-v1.8.3，git status 完全 clean。
   - 本地忽略：.git/info/exclude 正常生效，无团队 Git 污染。
   - 采购单修复：@vue/compiler-sfc 编译通过，
ode scripts/build.mjs --memory 1024 生产构建 32.2s 通过。

---

## 需要用户注意的事项

1. 正矿业务仓库的 eature-v1.8.3 无 upstream，其业务提交  8dfce1 待用户明确指令后再 push。
2. 上一轮记录见 iterations/archive/2026-09-08-套餐卡收窄与植物字段.md。
