# 跨项目执行与变更总日志

本文件作为 Project Hub 统筹全局项目的变更看板，记录每次通过 Hub 对各子项目执行的修改流水，以及涉及的分支、环境与交付状态。

---

## 变更总流水（最新在最前）

| 日期 | 涉及项目 | 环境 / 工作分支 | 变更摘要与技术方案 | 交付状态 / 关键 Commit |
| :--- | :--- | :--- | :--- | :--- |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **toast 去掉来源前缀**：`接口-` / `涂鸦-` / `APP-` 不再进用户可见文案，`_tagged` 改名 `_diagnostic` 只服务诊断行（`sessionDiagnostics`、后端会话失效原因）；来源信息仍在 `ActionResult.code` 里，页面要展示自己拼。 | `c7f765d`（已推送；本机无 Flutter SDK，analyze/test 未执行，真机未验） |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **配网切到涂鸦「热点配网新流程」**：官方文档明确「SDK 会自动去连接 AP 热点」，故 App 不再用 `WifiNetworkSpecifier`，系统入网授权框消失。桥接新增 `apQueryDeviceWifi`/`apStartPairing`/`apStopPairing`，「切换 Wi-Fi」改列**设备自己扫到的**网络；手动连热点引导整套删除。相关接口经解 AAR 核实 7.5.1 已具备，无需升级 SDK。 | `f105bd0`（查证）+ `223bdae`（实现），均已推送；⚠️ 本机无 Flutter/Android SDK，analyze/test/编译均未执行，**真机未验**；⚠️ 硬前提：设备固件 TuyaOS ≥ 3.6.1，且反射签名无编译期保护 |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **「配网为什么要授权」续查（仅文档+工具）**：测试证据逐条排除了「必然弹框」与「官方 App 送用户去系统设置」两个推断；定位到唯一能解释的机制——**Android 的 Wi-Fi 限制按应用 `targetSdkVersion` 生效**，`targetSdk ≤ 28` 仍可用 `addNetwork/enableNetwork` 静默连网，我们跟 Flutter 走的现代 targetSdk 只能用 `WifiNetworkSpecifier` 故必然弹框。新增 `tool/apk_target_sdk.py` 离线读任意 APK 的 targetSdk 与 Wi-Fi 权限。 | `c3b0b29`/`935d595`/`df9c561`（已推送，**无业务代码改动**）；⚠️ targetSdk 这条仍是推断，待一条 adb 命令确认 |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **配网模式查证（仅文档）**：设备开发确认设备只支持涂鸦标准 AP 热点配网、不支持 EZ/SmartConfig，桥接里的 EZ 分支确认为死代码；由此推出「AP 必须连热点 ⇒ Android 10 起只能走 `WifiNetworkSpecifier` ⇒ App 发起连接时必然弹一次系统授权框」，唯一无框情形是手机已连在该热点上。热点名白名单对 `smartlife_xxx`/`tuya_mdev_xxx` 均命中。附给测试的五条排查清单。 | `136176a`（已推送，**无代码改动**）；⚠️ 「系统记住授权」那条未经真机验证 |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **配网只剩「输密码」一步**：搜索页扫到设备后照常画出列表、停 600ms 让用户看清，随后自动带着它跳「连接 Wi-Fi」（只自动一次，返回可手动改点；多台取信号最强）；连接 Wi-Fi 页顶部写明「✓ 已选择设备 xxx」，并在进页面时后台跑 `prepareForPairing`（确认家庭 + 取令牌），用户输密码那几秒正好跑完云端往返，点按钮直接复用令牌。 | `2ff0dd9` + `e2a479e`（均已推送；本机无 Flutter/Android SDK，analyze、test 与编译均未执行，真机未验） |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **键盘避让改回框架默认 + 系统入网框说明**：上一版「关掉 resize + 底部加 viewInsets padding」在 Scaffold body 里错两次（视口不缩所以 `ensureVisible` 不滚；开着 resize 时 body 里 `viewInsets.bottom` 恒为 0），四页全部改回默认行为；配网三步里 App 已无任何自有弹框，Android 的「要连接至设备吗?」是系统入网授权框、`WifiNetworkSpecifier` 必弹且无 API 可抑制，本次补上「已连在目标热点上就跳过 `requestNetwork`」少弹一次。 | `60dd74b`（已推送；本机无 Flutter/Android SDK，analyze、test 与编译均未执行，**真机未验，键盘那条需逐页走一遍**） |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **连接Wi-Fi 页精简 + 扫描配额 front-load**：删掉底部「系统会弹框询问是否连接…」那张解释卡（手动路径那张保留，它是必须照做的一步），间距整体收紧让内容进首屏；主动扫描时间表由均匀 `0/30/60/90s` 改成 **`0/6/46/86s`**——Android「前台 2 分钟 4 次 `startScan`」是滑动窗口约束而非均匀间隔，front-load 后第二次真扫从 30 秒提前到 6 秒且仍合规。 | `9a00ac0`（已推送；本机无 Flutter/Android SDK，analyze、test 与编译均未执行，真机未验）；💡 后续可上 Android 13 的 `registerScanResultsCallback` 把 2 秒轮询降到接近 0 |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **搜索提速 + Wi-Fi 名带出规则**：受 Android 配额限制的只有 `startScan`，读 `scanResults` 不受限——`scanWifi` 加 `refresh` 参数，搜索页改成「30 秒一次真扫 + 2 秒一次读缓存」两条线并行（改前两次真扫之间那 30 秒完全瞎着，就是「搜了一分钟」的成因）；「连接 Wi-Fi」页填 SSID 改走只读缓存（名字来自 `connectionInfo`，根本不用扫描），并收敛为「连着就带出来、没连就留空」；「发现 N 台设备」字号 28/24→20/18。 | `ae1de0a`（已推送；本机无 Flutter/Android SDK，analyze、test 与 Kotlin 编译均未执行，真机未验） |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **搜索页「重新扫描」只在搜索为空时显示**：Android 改为「搜完一轮且一台都没有」才画（搜索中点它只是白烧系统配额，已搜到时用户要点的是那台设备）；iOS 的「下一步」全程都在（唯一入口）。`_SearchActions` 收敛成一颗按钮。 | `504e205`（已推送；本机无 Flutter SDK，analyze/test 未执行） |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **登录页只留 toast + toast 宽度修折行**：登录页去掉输入框下面那行常驻校验提示（校验本身没松，发送前照常挡下不合法号码）；toast `maxWidth` 由写死 300 改成 `(屏宽-32).clamp(260,380)`、内边距 18→16、图标间距 9→8——原来留给文字只有 236 而「请先阅读并同意用户协议与隐私政策」要 224，只差 12px 必折。 | `d875cff`（已推送；本机无 Flutter SDK，analyze/test 未执行，真机未验）；⚠️ 注册页与找回密码页仍保留行内提示，是否一起去掉待产品 |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **iOS 配网入口补回**：iOS 无公开 API 可枚举附近 Wi-Fi（平台限制），但 `NEHotspotConfiguration(ssidPrefix:)` 按前缀就能连热点，故 iOS 搜索页给无条件「下一步」（不带热点名）。同时修回上一版的回归——Dart 侧曾拒绝「没有确切 SSID」，而 iOS target 永远为 null，等于砍掉 iOS 唯一通路；改为把「拒绝通配」下放 Android 原生（`hotspot_ssid_required`，删 `setSsidPattern`），Android 因此永不触发系统「查找设备」框。 | `c437953`（已推送）；⚠️ **iOS 这条路一次没验过**（无 Mac/Xcode/设备），HotspotConfiguration entitlement 待在 Xcode 侧确认 |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **设备开机即可配网，端上文案整体改口**：产品明确「设备只要开机就一定处于可配网状态，不需要多余操作去确认」，搜索页「未发现配网中的设备」→「未发现设备」、不再让用户「长按进入配网状态」；失败页与帮助中心同源文案一并改写；代码注释里的同一前提也改掉。 | `e65a76a`（已推送；本机无 Flutter SDK，analyze/test 未执行）；⚠️ iOS 入口缺口仍在——iOS 列不出设备且已无「继续」按钮，待产品定是否补一个无条件的「下一步」 |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **配网动线七项**：四页键盘避让（`resizeToAvoidBottomInset:false` + 底部让出 viewInsets）；配网期弹框收敛（`PairingStage.hint` 只跟当前步、删遮罩与 toast、**连热点只用确切 SSID** 以避开系统「查找设备／没有找到任何设备」框）；第三步「连接云端」无实际业务、给 1–2 秒随机停留后按成功处理；失败页绝对定位改纵向流（修小提示重叠 + 多余滚动条）；搜索页改内联列表不再跳页并删除 `device_selection_page` 与路由；去掉「设备已在配网状态，继续」；启动页先只留背景图。另把 09-09 的 `home_unresolved` 门禁降级为诊断（疑似「配网又不行了」成因）。 | `b951d61`（已推送；本机无 Flutter/Android SDK，analyze、test 与 Kotlin 编译均未执行，真机未验）；⚠️ **iOS 不枚举附近网络，删掉「继续」后 iOS 走不到配网**，待产品补入口 |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **搜索不到设备：每 2 秒重扫烧光了系统 Wi-Fi 扫描配额**。Android 9 起前台每 2 分钟只许 4 次 `startScan`，超了返回旧缓存；09-08 改的「45 秒窗口每 2 秒重扫」在头 20 秒烧光配额，之后整窗口读的都是**用户上电之前**的快照——「先进搜索页再上电」必然搜不到。改为「2 次快扫(3s) + 30s 节奏 / 窗口 45s→3min / 两条出路全程可见」，桥接补 `throttled` 与 `ageMs`，被限流时明说、一次没真扫成时给「无法确认附近设备」而非谎报「未发现设备」。 | `bef2ca0`（已推送；本机无 Flutter/Android SDK，analyze、test 与 Kotlin 编译均未执行，真机未验）；⚠️ 相邻风险：09-08 同时删了「手动选择设备」，热点白名单外的量产件将不可见 |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **手机号格式校验补上反馈**：09-09 那轮只把「获取验证码」置灰，按钮点不动也不说话。新增共用 `AuthFieldError`（输入框下方提示行），三页账号框接 `FocusNode`，失焦一次或点过按钮后才报错；按钮改回可点、在发送前挡下并同时给 toast 与常驻提示（短信仍不会发出）；登录/注册/重置提交也补账号格式校验。 | `1bacd9e`（已推送；本机无 Flutter SDK，analyze/test 未执行，真机未验） |
| **2026-09-10** | **album-miniapp（相册小程序）+ album-app（相册APP）** | ssh / `main` | **用户协议第九章违规阶梯按 AI 服务协议对齐**：法务原文那张表仍是「第 1/2/3 次各封 24 小时」且自称与 AI 协议一致，AI 协议本轮已改口，产品裁定用户协议跟 AI 协议。前三行合成「第 1-3 次｜AI 功能提示违禁」，后两行与原文逐字相同、表头不动。替换写在转换脚本里并先断言换掉的确实是原来那五行；两端用例把用户协议阶梯表与 AI 协议页钉在一起，单独改一边会红。 | `5b43680`（小程序，已推送，57/58 用例通过）/ `e537c44`（App，已推送，本机无 Flutter SDK、analyze/test 未跑）；⚠️ 端上第九章与法务 docx 从此有一处有意差异，建议把新阶梯回给法务 |
| **2026-09-10** | **album-miniapp（相册小程序）+ album-app（相册APP）** | ssh / `main` | **协议排版按产品答复统一**：生效日期由占位符填为 2026-09-10；隐私政策版本号 `VI.0` → `V1.0`；英文 16 处断词收齐（句号后补空格 6、标点前删空格 10），简中 9 处同类问题一并规范（半角标点→全角、`AppleAppStore` 补空格、句末重复句号）；英文隐私政策第 13 节公司名统一为 `BoltStar (Shenzhen)…`；AI 服务协议开场白的公司名去掉模板方括号（两端三语）。每条修正写进转换脚本并断言命中次数，措辞一字未改。 | `6c488ad`（小程序，已推送，57/58 用例通过）/ `c3907ae`（App，已推送，本机无 Flutter SDK、analyze/test 未跑）；⚠️ 用户协议第九章阶梯与新 AI 协议的矛盾仍待法务出新版 |
| **2026-09-10** | **album-miniapp（相册小程序）+ album-app（相册APP）** | ssh / `main` | **两端换法务 20260909 协议全文 + AI 协议违规阶梯改口径**：小程序取简中、App 取英文。用户协议由 2026-5-13 的三节旧短文换成 15 章全文（小程序改为数据驱动渲染，App 由 `l10n.pick` 三语改成编译期常量并固定英文），隐私政策换同批新版；AI 服务协议违规表改为「第 1-3 次只提示违禁、第 4 次起封 24 小时」（App 中英日三份都改）。四份 docx 用一次性脚本逐块转换并校验拼回原文一致，TOC 未转换（两端无锚点）。 | `d3eb1e8`（小程序，已推送，57/58 用例通过，唯一失败与本轮无关）/ `6bcaecf`（App，已推送，本机无 Flutter SDK、analyze/test 未跑）；⚠️ 生效日期在原文里是占位符、版本号 `VI.0` 疑笔误、英文版 16 处断词、第 13 节公司名不一致、**用户协议第九章旧阶梯与新 AI 协议矛盾**，五件事待法务/产品 |
| **2026-09-10** | **flowerpot-admin (花盆后台)** | ssh / `main` | **用户列表下线星币三列与行级账户日志按钮**：删「总计星币」「可用星币」「消耗星币」三列与行操作里的「账户日志」按钮，操作列宽 250 → 170；只服务于可用星币列的 `UserAccountEditor.vue` 与 `setUserAccount` 封装一并删除。工具栏「账户操作日志」全量入口、`userAccountLogs` 路由、后端接口与两个权限节点均保留不动。 | `dbc46ff`（已推送，vite build 1024MB 堆 45.6s 通过；未实机验证。后台「编辑用户账户」权限节点已无前端调用方，是否摘掉待定） |
| **2026-09-10** | **flowerpot-app (花盆APP)** | ssh / `main` | **定制动画操作按钮改底部悬浮**：核对后确认 v2 图库卡 09-04 已落地、顶部权限提示条与「文件同步」09-08 已下线，唯一对不上的是虚线上传位常驻。新增 `_GalleryActionBar`（body 改 `Stack` + 底部 `Positioned`）：上传按钮常驻，「删除选中」「取消选择」有图才画；`_UploadedFilesCard` 去掉卡内按钮行只剩网格，虚线上传位改为只在空态出现；滚动内容底部内边距按条子高度算（104），圆按钮加 `elevation`。 | `ef11017`（已推送；本机无 Flutter SDK，analyze/test 未执行。提示卡「长按可删除」与实现的长按置顶互相打架，待产品确认） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **植物 DP 契约补充：id=0 通用植物单独一支**：固件报 0（认出有植物但认不出品种）且 162=1 时，引导窗正文改「已检测到通用植物，请选择并确认植物。」，**按钮只留「选择植物」**，点它进选择流程且不下发任何 DP；1..N 仍是「确认 + 选择植物」。新增 `PlantVariety.generic` 与 `reportedPlantId`。后台不再新建 ID=0 通用植物，文档同步。 | `4eabac5`（已推送；本机无 Flutter SDK，analyze/test 未执行） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **植物 DP 契约改版**：116 从字符串标识符改为植物 id（`-1` 无植物 / `0..N` = 后台「涂鸦标识 ID」），162 收敛为两态且只上报（0 不弹 / 1 弹引导窗，App 不再写）。数据层加 `PlantVariety`、`plantMissing`、`plantGuidePending`、`reportedPlantName`、`_plantKey`（数字优先、兼容老 `tuYaRemark`），删 `answerPlantConfirm` 换成 `confirmDetectedPlant`（原样回写上报 id）；列表页删掉「没植物先去选植物」门禁，详情页按 162 弹「发现新植物」引导窗，116=-1 时画无植物设备图 + 今日养护换惊叹号提示 + 植物入口不可进。 | `275942c`（已推送；本机无 Flutter SDK，analyze/test 未执行。**依赖后台把涂鸦标识 ID 改成与固件一致的数字并新建 ID=0 通用植物**） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **续接 `docs/CODE_REVIEW_HANDOFF.md`**：work 端 `27bbbd9` 已删除调试台 / 体验模式、关闭 S1 明文回落、写请求不重试、加 `ApiSession.revision` 防迟到、搜索页销毁保护；ssh 端做静态自检（测试声明位置、38 个测试的 mock import、产品代码残留引用、我方功能是否幸存）全部通过，并按当前源码改写 `AI_CONTEXT.md` 的调试台 / 临时地址 / 评审结论条目，补历史记录并更新 handoff。 | `fa54740`（已推送；本机无 Flutter SDK / Android SDK / Xcode，analyze、test 与编译未执行——这是 handoff 唯一剩余待办） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **「一小时掉登录」**：后端 token 无客户端 TTL、也无定时器，掉登录只能来自 401/406；而 `_run` 里 `isAuthError → _clearLocalSession()` 把涂鸦会话与设备列表一起清了。改为只清后端会话并记失效原因（进设备列表诊断行），`ApiClient` 加 `[session] 后端会话失效：<METHOD> <path> → HTTP/retCode` 日志（不记 token）。根因仍需后端核对。 | `38c71f0`（已推送；本机无 Flutter SDK，analyze/test 未执行） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **家庭归属改用后端 `userId` 作账号键**：后端同意登录响应多返回 `userId`（不加 `tuYaHomeId`）。`userId` 不是家庭 id、也当不了；用作家庭名标记 `YS-<userId>` 与本地缓存键，缺省退回涂鸦 uid（`userNo`）；登录时记下并按 uid 存一份，会话恢复时读回保证键稳定。 | `c612166`（已推送；同上未验证） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **发验证码前校验手机号格式**：`state.sendCode` 本来就会拦，缺的是界面这层——手机号框只有 `keyboardType` 没有输入过滤，按钮也只在 busy/倒计时禁用。`AuthValidator` 新增 `isValidAccount`；登录页与注册页加 `digitsOnly` + 11 位限制、按格式禁用「获取验证码」并补发送前兜底；找回密码页（可能是邮箱）不加数字过滤，按区域校验后决定按钮可用。 | `669b89b`（已推送；本机无 Flutter SDK，analyze/test 未执行） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **家庭 id 改由后端登录接口下发**：`BackendAuthAccount` 新增 `tuyaHomeId`（解析 `tuYaHomeId`，兼容两种拼法），登录/注册后立刻钉给涂鸦并写本地；优先级 后端 > 本地缓存 > 涂鸦列表现挑。钉住的家庭读出 0 台设备时作废缓存并重读一次（iOS `setHomeId` 收空值改为清 `currentHome`）。**待后端补两件事**：登录响应 `UserInfoDetailApiOut` 增加 `tuYaHomeId`；提供保存接口让 App 回写第一次解析到的家庭。 | `1763f74`（已推送；本机无 Flutter SDK / Xcode，analyze、test 与 iOS 编译未执行） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **家庭按账号固定 + 配网前置检查**：新增桥接 `setHomeId` / `useHome`，`FlowerpotState` 按涂鸦 uid 把家庭存进 `SharedPreferences`，`_startSession` 统一「换代→钉家庭→拉列表」，四个会话入口共用；新增 `prepareForPairing()`（确认家庭 + 取令牌，全程还在路由器上）并在配网页盖 `AppLoading` 遮罩，失败不碰热点；空家庭列表在绑着设备热点时报 `home_offline` 不建家，正常网络下先重查一次；iOS 补上缺失的 `currentHomeId`。 | `d0ab4d0`（已推送；本机无 Flutter/Android SDK 与 Xcode，analyze、test 与桥接编译均未执行） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **OTA 两个版本号都不对**：不是进度弹层改坏的（`992b8f8` 只把升级后的 toast 换成弹层）。根因两条：Android `deviceMap` 的 `firmwareVersion` 取的是协议版本 `getPv()`（2026-08-12 起），改取 `verSw`、iOS 补上同名键；「当前版本」与「新版本」来源不同（设备字段 vs OTA 记录），两端 `checkFirmware` 改为成对返回同一条记录的 `{version, currentVersion}`，Dart 侧新增 `FirmwareUpdate`，弹窗与「已是最新」判断改用它。 | `b9f7dba`（已推送；本机无 Flutter/Android SDK 与 Xcode，analyze、test 与桥接编译均未执行，iOS `currentVersion` 字段名待确认） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **现场信息搬到真实页面**：不再依赖联调页——`FlowerpotState` 记 `lastHomeId` 并给出 `sessionDiagnostics`（uid · 家庭 · 设备 N 台 · 失败原因），设备列表错误态与空态底部各画一行可复制小字，每次读列表打一行 `[devices]` 日志；iOS 补 `home picked` 日志与 Android 对齐。并写清家庭 id 的来源：属涂鸦账号、云端按 uid 返回，连哪个 Wi-Fi 不选家庭；但 AP 配网时手机在设备热点上没有外网，查家庭失败或拿到空列表会自动建家，这才是多出空家庭的来路。 | `b7b6ad6`（已推送；本机无 Flutter SDK / Xcode，analyze、test 与 iOS 编译未执行） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **重新登录读不到已绑定设备**：定位到两处确定缺陷——① 登录/恢复会话的 `_refreshDevicesForSession(ignoreErrors: true)` 把失败吞成空列表，页面画「暂无设备」，与空账号无法区分，下拉刷新还把异常抛回 `RefreshIndicator` 只进日志；② 两端桥接都取家庭列表的第一个，顺序不保证稳定，账号有多个家庭（列表瞬时为空时本代码会自动建一个）就会不同登录读到不同家庭。新增 `deviceLoadError` + 错误态重试、`probeDevices` 改名 `reloadDevices` 统一入口；Android 先挑带设备的家庭再按 `homeId` 最小，iOS 按 `homeId` 升序。根因待现场用联调页的家庭 id 确认。 | `c08fbb8`（已推送；本机无 Flutter SDK / Android SDK / Xcode，analyze、test 与桥接编译均未执行） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **已绑定设备首页改用后台配置的植物图片**：`HomeDashboardModel` 增加 `plantImageUrl`（取 `device.plant.imageUrl`，即 `getProductPlantList` 的 `plantImg`），首页正中 132×170 的图改由 `_PlantHeroImage` 渲染，有配置走网络图、为空或加载失败才回落本地 `smart_planter_with_plant`；植物详情页 `_PlantDetailArtwork` 核对后本就是同一口径，未改；设备列表行缩略图不在范围内。 | `b162068`（已推送；本机无 Flutter SDK，analyze/test 未执行） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **定制动画提示卡背景图被裁**：图用 `Positioned(right: -14, bottom: -18)` 顶到 `SizedBox` 外，而 `Stack` 默认 `Clip.hardEdge` 不画顶出去的部分，盒子高度压到 126 后切掉的正好是文件夹下沿与右侧叶子。改为卡片零内边距 + 文案自带 padding、`SizedBox` 高度补 28 保持外形，图按设计稿右边贴边、底部与文案齐平；素材 670×304 经 cover+centerRight 裁到 118 见方本身完整，未动缩放。 | `559ba84`（已推送；本机无 Flutter SDK，analyze/test 未执行） |
| **2026-09-09** | **flowerpot-admin (花盆后台)** | ssh / `main` | **商品「原价」核查（仅文档）**：实测 yikaltd 后端已无 `Goods`/`Order`/`ProductImg`/`AiConfig`/`ProductVersion` 五组接口，`Goods` 路径返回与乱编路径一致的裸 500；`marketAmount` 四字段只在相册后端 boltfox 契约里。判定不是漏做，不加空转输入框，改 `docs/interface-list.md` 的自相矛盾记录。 | `e7b051e`（已推送，无代码改动） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **植物数据链路确认（仅文档）**：列表图片确为接口字段 `plantImg`；详情内容不是从涂鸦读——DP 116 只上报「哪一株」的标识符，内容由 `getProductPlantList` 目录按标识符匹配，实时数值才来自 DP。口径写进 `AI_CONTEXT.md`。 | `e355274`（已推送，无代码改动） |
| **2026-09-09** | **flowerpot-app (花盆APP)** | ssh / `main` | **配网页 Wi-Fi 名称刷新 + 休眠模式改页内展开**：连接Wi-Fi 页原来只在首帧填一次、还复用搜索页留下的扫描缓存，用户换网络后显示的名称与实际连接不符；改为进页面强制重扫 + 回到前台再刷新，并用 `_autoFilledSsid` 保证不覆盖用户输入（2026-09-08 的样式改动不是原因）。休眠模式（DP 151/152）由入口 + 二级页面改为「行为」页第三张卡，版式交互照午休 / 夜间，删除 `standby_settings_page.dart` 与路由。 | `b493dbd`（已推送；本机无 Flutter SDK，analyze/test 未执行，需在有 SDK 的机器复跑） |
| **2026-09-09** | **minerals-admin (正矿)** | ssh / `feature-v1.8.3` | **码头直提按采购类型控制客户项**：采购单接口新增 `purchaseType`/`customerId`/`customerName`/`agentOrderNo`；表单采购单号调到客户前面，自营采购禁用并清空客户、必填随之关闭（`rules` 改 computed），代理采购按采购单回显客户且可手改；保存回传上述四个字段；集装箱取数条件改为自营只按采购单号查，切换采购单清空已选。 | `a909a1a`（已推送，生产构建 1024MB 堆 29.7s 通过；未实机验证，`customerId` 取最终选中客户的口径待确认） |
| **2026-09-09** | **minerals-admin (正矿)** | ssh / `feature-v1.8.3` | **出库附件必填标识 + 码头直提弹框打开即查询**：出库单「出库附件」的 `prop` 是残留的 `purchaseOrderFileList`，与 `v-model` 的 `stockOutFileList` 对不上，星号和必填校验都是空转，改为正确 `prop` + `required`（与入库单 `b56b251` 一致）；码头直提新增页「请选择集装箱」弹框由「点查询才请求」改为打开即请求，客户/采购单为空时不发请求。 | `ad31f92`（已推送，生产构建 1024MB 堆 30.7s 通过；未实机验证，required 会同时拦提交） |
| **2026-09-09** | **minerals-admin (正矿)** | ssh / `feature-v1.8.3` | **堆场提货补充信息批次号取值修复**：货物信息表「批次号」列由 `batchNo` 改取 `goodsList` 元素的 `stockBatchNo`，`objectSpanMethod` 合并列同步替换。提货单详情返回的 `goodsList` 只带 `stockBatchNo`，走该来源时原来整列为空且合并错位；库存接口原始行的 `batchNo` 排序逻辑保持不动。 | `6b7d0ae`（已推送，生产构建 1024MB 堆 30.8s 通过；未实机验证） |
| **2026-09-09** | **flowerpot-admin (花盆后台)** | ssh / `main` | **植物资料删养护建议**：删表单项与必填校验（此前不填无法保存），`defaultForm` 与 `buildPayload` 保留 `careInstructions` 原样回传——该字段后端契约真实存在且可能有存量数据，编辑不清空、新增空值被过滤。APP 已改本地文案不再读它。 | `6051546`（已推送，vite build 通过；未实机验证） |
| **2026-09-09** | **flowerpot-admin (花盆后台)** | ssh / `main` | **植物资料删四条建议字段**：新增/编辑/详情共用弹窗里删除光照、需水、空气温度、湿度建议的初始值、校验、提交字段与表单项，植物分类保留并改 `span 12`。核对 Swagger 确认整份契约从未有过这四个字段，属空转输入，故不保留回传。 | `4b8bd13`（已推送，vite build 通过；未实机验证） |
| **2026-09-09** | **flowerpot-admin (花盆后台)** | ssh / `main` | **首页注册趋势改柱状图**：手写条形列表换成 ECharts 柱状图，新增 `echarts@^6.1.0` 并按需引入（core + BarChart + Grid/Tooltip/DataZoom），`manualChunks` 单独拆包；抽出 `RegistrationTrendChart.vue`，颜色取 CSS 变量、日期标签兼容日/月/周期串、>40 点自动 dataZoom、resize 与 dispose 齐全。 | `c140b26`（已推送，vite build 通过；未实机验证，锁文件未动，其他环境需重装依赖） |
| **2026-09-09** | **flowerpot-admin (花盆后台)** | ssh / `main` | **侧栏失效菜单过滤**：后端残留已下线模块菜单行（`appUrl=config`），`RouterLink` 解析不存在的路由名在渲染期抛 `No match`，整块左侧菜单不显示。`Sidebar.vue` 渲染前用 `router.hasRoute` 过滤，屏蔽逻辑收进 `visibleMenus`，空分组不留标题，dev 每个失效 `menuUrl` warn 一次。 | `61f8e76`（已推送，vite build 通过；未实机验证，后台菜单行待人工清理） |
| **2026-09-08** | **flowerpot-app (花盆APP)** | ssh / `main` | **设置/我的/关于十项**：分享入口隐藏、帮助中心搬到设备设置、OTA 进度弹层、App 强制/提示升级链路（按 swagger 修正字段）、昵称刷新与头像加载失败回退、列表行高与下划线、养护建议改本地中英文案；161 未下发定位为后台分类未配置。 | `992b8f8`（已推送；本机无 Flutter SDK，未跑 analyze/test） |
| **2026-09-08** | **flowerpot-admin (花盆后台)** | ssh / `main` | **模块下线与表单精简**：删除用户设备、用户产品图片、产品版本、系统配置四个模块及其接口封装；植物去掉所属产品；产品表单精简七字段、列表去两列（产品列表按确认保留）。 | `690a70b`（已推送，vite build 通过） |
| **2026-09-08** | **flowerpot-app (花盆APP)** | ssh / `main` | **连接 Wi-Fi 页输入框聚焦态**：两格凭据输入抽成同一组件，去掉 24px 固定高改由 `isDense` + 留白撑开，补品牌色聚焦下划线；保持设计稿的卡片版式，未改成登录页的胶囊输入框。 | 已由用户提交为 `85854f6` 并推送 |
| **2026-09-08** | **花盆、相册系列 5 个项目** | home / `main` | 家里环境映射接入；对干净仓库执行 `git pull --ff-only`，同步已有 CodeGraph 索引。花盆后台因 `dist.zip` 本地修改暂缓拉取。 | 花盆 APP `9dfc52d`；相册 APP `be2d80f`；相册后台 `746407d`；小程序 `487869b`；花盆后台待处理 |
| **2026-09-08** | **minerals-admin (正矿)** | ssh / `feature-v1.8.3` | **进口采购单新增/编辑校验修复**：修复定价依据缺少 el-form 上下文导致成分要求报必填，修复合同金额错误态不清除，补清空校验。 | `08dfce1`（已提交待推送） |
| **2026-09-08** | **flowerpot-app (花盆APP)** | ssh / `main` | **多语言框架 + 首页与设置 7 项**：新增可扩展的界面文案框架（`AppLanguage`/`AppL10n`，简中 + 英文，对齐相册 APP 做法）；首页顶栏改显示设备名；「自动检测植物」改为独立页；其他设置去掉系统文件两项；纪念日补日期校验与输入框样式修正；新增休眠模式页（DP 151 开关 + DP 152 延迟，入口在行为页）。 | `2903cf7`（已推送；本机无 Flutter SDK，未跑 analyze/test） |
| **2026-09-08** | **flowerpot-admin (花盆后台)** | ssh / `main` | **接口地址由临时 IP 改回域名**：`.env` 的 `VITE_APP_API_ORIGIN` 与菜单同步脚本 `DEFAULT_API_BASE` 改为 `https://api.yikaltd.com`，文档与注释同步；遗留支付/上传服务（39.108.153.239）无域名可用，未动。 | `468d76f`（已推送，vite build 通过）；遗留支付/上传配置与 `requestPay` 实例的清理见 `7bb1f8b`（已推送） |
| **2026-09-08** | **flowerpot-app (花盆APP)** | ssh / `main` | **设备图库接口收敛 + 配网与首页文案清理**：图库改按涂鸦 `deviceId` 直调 `getUserProductImgList`（删掉换 `userProductId` 的 userProduct 前置链路，此前该链路 404 导致图库整页加载失败）；搜索页加 45 秒搜索窗口并删除扫描台数/当前连接/手动选择，选择页删除「显示附近全部网络」「设备已在配网状态，继续」，动画页删除文件同步与权限提示条，首页空态文案与四张指标卡对齐修正；首页「今日养护」改为轮播四条状态（107/108/113/115）的养护建议（5 秒一条），并给这批状态文案补中英双语表（跟随设置页语言开关，非英文回落中文）。 | `2903cf7`（已推送；本机无 Flutter SDK，未跑 analyze/test） |
| **2026-09-08** | **minerals-admin (正矿)** | ssh / `feature-v1.8.3` | **进口采购单新增/编辑校验修复**：修复定价依据缺少 el-form 上下文导致成分要求报必填，修复合同金额错误态不清除，补清空校验。 | `08dfce1`（已推送） |
| **2026-09-08** | **minerals-admin (正矿)** | work / `feature-v1.8.3` | **私有目录 Symlink 方案落地与原文件迁移**：将正矿的 docs、.codegraph、logs、AGENTS 等私有资料安全迁移至 Hub，正矿原物理实体彻底删除并替换为 Windows NTFS Junction / SymbolicLink 链接，双重本地忽略防团队污染。 | `private/minerals-admin` 纳入 Hub 管理，业务仓库干净 |
| **2026-09-08** | **minerals-admin (正矿)** | work / `feature-v1.8.3` | **堆场提货详情状态机补齐**：补齐提货详情页中「提货中」状态显示与按钮交互逻辑。 | `c16df7d`（已推送） |
| **2026-09-08** | **flowerpot-admin (花盆后台)** | ssh / `main` | **植物分类与养护建议字段支持**：后台植物新增/编辑/详情增补 categoryType 与 4 条环境建议字段（光照、浇水、温度、湿度）。 | `60eee3a`（已推送） |
| **2026-09-08** | **flowerpot-app (花盆APP)** | ssh / `main` | **植物分类数据展示与硬件 DP 下发**：读取植物详情新增字段，并将 categoryType 下发至设备 DP 161。 | `9dfc52d`（已推送） |
| **2026-09-08** | **album-miniapp (相册小程序)** | ssh / `main` | **套餐卡视觉优化与留白收窄**：套餐卡赠送角标位置与配色固定（恒为橙底白字），右侧留白自 300 逐步收窄至 208rpx。 | `c33125f`, `01e7b6c`, `fcedd6a`, `487869b`（已推送） |
| **2026-09-08** | **album-app (相册APP)** | ssh / `main` | **Flutter 端样式同步对齐**：同步相册小程序视觉改动，卡片右侧留白缩短至 104。 | `0969685`, `4da1397`, `b37d5f4`, `be2d80f`（已推送） |

---

## 维护规范

1. **宏观粒度**：本日志仅记录“改动了哪个项目、为什么改、交付了什么”，保持全局清晰。
2. **私人隔离**：凡属正矿等有私人需求项目的内部深层业务细节、个人开发笔记与排障记录，记录在其专属目录 private/<project_id>/logs/ 下，不在此处展开。
3. **沉淀方案**：若改动中产出了具有跨项目复用价值的技术方案（如打包优化、跨平台隔离等），在 logs/solutions/ 提炼为独立方案文档并在此处关联。

## 2026-09-10 花盆APP 搜索设备扫描排班 + 涂鸦能力核对

- 项目：花盆APP（`/pgdata/pg/dh/flowerpot`），环境 home，分支 `main`。
- 提交：`4543917`（扫描排班改均匀 + 取令牌预取）、`7cac9e7`（涂鸦能力核对文档）。
- 起因：测试反馈搜索延迟不对称——「先开设备再搜索」正常，「先搜索再开设备」很慢。
- 诊断：**不是配额被打满**，是 4 次/2 分钟的预算分布错了。旧排班 0/6/46/86s 把两次
  押在头 6 秒赌设备已开机，赌输时有用的第一次要等 46s、错过就是 86s。
- 改动：主动扫描改均匀 32 秒一次（0/32/64/96/128s，最坏 86s → 32s）；读缓存 2s → 1s
  （受配额约束的只有 `startScan`）；补回 `prepareForPairing()` 预取——涂鸦要求令牌必须
  在联网状态下取，而新流程在搜索页就连上了没有外网的设备热点，取令牌却还留在下一页，
  改新流程时漏了这个调用点。
- 核对结论（`docs/TUYA_CAPABILITY_AUDIT.md`）：涂鸦的 AP 配网**没有「发现设备」能力**，
  这一页只能自研、配额绕不过去；顺带查出 `createShareLink` 挂在未集成的业务拓展包上，
  而核心 SDK 本来就有 `getDeviceShareInstance`（待产品确认要「按账号分享」还是「链接」）。
- 交付状态：已推送。**未验证** —— 本机无 Flutter/Dart 工具链，analyze / test / 真机均未跑。

## 2026-09-10（晚）花盆APP 去掉卡死的配网前置步骤 + 配网页间距

- 项目：花盆APP（`/pgdata/pg/dh/flowerpot`），环境 home，分支 `main`，提交 `f6e9b73`。
- 报告：搜索到设备后卡在「正在连接【SmaXXXX】」直到超时，走不到输密码页；配网页插图
  上下间距过大，首屏放不下。
- 定位：卡住的是**新流程第一步** `queryDeviceConfigState`（读设备自己扫到的 Wi-Fi
  列表），它只对 TuyaOS ≥ 3.6.1 的固件有效，而固件版本一直是假定的、从未确认。
- 产品定调：配网就用手机当前连着的那个网络，不关心设备能看见哪些网络 ⇒ 这一步换来的
  唯一收益不需要了，整步删除。连热点交给 `startActivator` 自己做（官方文档：「在配网
  过程中，SDK 会在指定时间内自动去连接 AP 热点」），原生 `apStartPairing` 改为按需
  新建配网器。
- 同时：补齐涂鸦 207xxx 失败码映射（之前一个都没映射，失败只剩一句笼统文案）；配网
  进度页插图上下留白收紧，三步进度完整进首屏。
- 交付状态：已推送。**未验证** —— 本机无 Flutter/Dart/Kotlin 工具链，只做了括号配平
  与现有测试断言的静态核对。**配网本身能否成功仍待真机**；另需设备团队确认固件版本。

## 2026-09-10（晚，续）花盆APP 固件确认后补齐新流程安全配置

- 项目：花盆APP，环境 home，分支 `main`，提交 `649d22d`。
- 设备团队确认固件 **TuyaOS > 3.6.1**，新流程固件前提成立。这推翻了上一条「卡在正在
  连接是固件不支持」的假设：真正原因应是 `queryDeviceConfigState` 要求手机**已经连在
  设备热点上**才问得到设备（文档里「SDK 自动连 AP 热点」那句写在*配网过程*里，不是
  查询那一步的保证），当时手机还在路由器上所以一直等到超时。结论不变，该步已去掉。
- 新增：官方新流程的第一步 `getDeviceSecurityConfigs()` 在项目里**一次都没调用过**，
  `setSecurityConfig` 分支是死代码。现在跟着 `prepareActivatorToken` 一起预取并缓存，
  `apStartPairing` 自动带上；取不到不拦路。
- `207206` 提示改掉（不再指向固件版本）。
- 交付状态：已推送。**未验证** —— 本机无工具链，只做了括号配平与反射签名静态核对。

## 2026-09-10（晚，续2）花盆APP 键盘避让 scrollPadding + 失败码可见 + 失败页间距

- 项目：花盆APP，环境 home，分支 `main`，提交 `816f512`。
- 键盘挡输入框：框架默认只做对了一半。Scaffold 的 resize 确实把 body 缩矮、光标也确实
  被滚进视口，但 `TextField.scrollPadding` 默认只留 20px，而视口底部就是键盘顶部，那
  20px 正好被浮在底部的按钮占着 ⇒ 输入框停在按钮后面。把按钮占位算进 `scrollPadding`
  （`pairing_page` 新增 `_startButtonInset = 92`，`memorial_edit_page` 用 96）。
  `plant_picker` 搜索框在列表顶部，键盘挡不到，未改。
- 失败码看不到：`hintFor` 认得才带 `（code）`，认不得那一支把 code 整个丢了——而认不得
  恰恰最需要它。两支现在都带上；涂鸦那句没翻译的 `out of time` 另给一句能照着做的话。
- 失败页间距收紧约 90px，底部「返回搜索设备」不再被挤出首屏。
- 交付状态：已推送。**未验证**（本机无工具链），新增一条回归测试。
- **配网失败本身未解决**：等下次失败把码带回来再定——207xxx ⇒ 通道已建立、是设备侧原因；
  仍是 out of time 之类 ⇒ 通道没建起来，需把连热点显式加回「点开始配网之后」。

## 2026-09-10（晚，续3）花盆APP 按设备方流程把「手机连接设备热点」加回配网

- 项目：花盆APP，环境 home，分支 `main`，提交 `ad7c6c1`。
- 设备方给出配网流程要求核对。逐条对照结论：**不一致，缺了第 2 步「手机连接该热点」**。
  其余四条（热点前缀白名单、下发 SSID/密码、设备切网连云、开机即可配网）都一致。
- 第 2 步是当天白天被整个删掉的，依据是文档「在配网过程中，SDK 会在指定时间内自动去
  连接 AP 热点」。已被证伪：失败提示 `out of time` 且**没有任何 207xxx**——那批码全部
  来自「设备收到配网信息之后」，一个都没出现说明设备从没收到过东西、通道没建起来。
- 改动：`pairViaDeviceHotspot` 改为「先 `_joinHotspotForPairing` 连热点、再
  `apStartPairing` 下发凭据」，新增 `hotspotSsid` 参数由搜索页带过来；失败按原流程规则
  清理热点与令牌。连热点放在配网这一步而不是搜索页——一连上热点手机就没外网，取令牌与
  取安全配置都要走云端，已由搜索页 `prepareForPairing` 预取完。
- 代价：Android 10+ 会弹一次系统入网授权框（关不掉），但只在点了「开始配网」之后出现，
  已连在该热点上时跳过。能配网成功 > 没有弹框。
- 交付状态：已推送。**未验证**（本机无工具链），现有测试断言逐条核对过。

## 2026-09-10（晚，续4）花盆APP 配网全按新流程补齐三步；失败码表补到官方全量

- 项目：花盆APP，环境 home，分支 `main`，提交 `449d911`。
- 测试给回确切码 **207220**。存档的中文错误码表只到 207218，从英文页补齐后确认漏了三条：
  207219（连云端 iot-dns 失败）、**207220（配网任务整体超时）**、207222（获取设备 Wi-Fi
  列表失败）。存档文档已同步。
- 判读：关键不在 207220，而在**哪些码没出现**——没有 207201，也没有 207209–207213
  （设备收到配网信息之后的失败）。任务空转到整体超时、设备从未报过进展 = 手机压根没连上
  设备热点。该反馈对应 `816f512`，还不含连热点步骤。
- 三次实测结论：官方新流程三步一步都不能少。`pairViaDeviceHotspot` 补成
  「连热点 → queryDeviceConfigState（建通道+查设备状态，列表不展示）→ startActivator」，
  每步记耗时并在失败页单独一行显示。
- 用户定调「都按新流程来」：中途曾按「设备方流程=原流程」切到 `pairViaHotspot`，已撤回。
- 交付状态：已推送。**未验证**（本机无工具链）。**需用最新包复测**。

## 2026-09-10（晚，续5）花盆APP 搜索页预热读缓存；并核实产品路径无 mock 数据

- 项目：花盆APP，环境 home，分支 `main`，提交 `3ec6577`。
- 搜索页反馈（首次进入要授权来不及点设备 / 非首次希望马上搜出来）定位为同一根因：
  `scanWifi` 在原生侧要权限，首次进入弹系统授权框、原生把调用挂起等用户答完，而改之前
  第一次取数就是真扫、3 分钟窗口却已开始计时 ⇒ 授权越久前面越空。
- 改法：`_scan()` 拆出 `_startSearchWindow()` —— 先 `probeWifi(refresh:false)` 免费读一次
  缓存（**权限框挡在这一步，读缓存不占配额 ⇒ 授权前一次真扫都不浪费**），命中就直接带走；
  之后才开窗口与 32 秒节奏。非首次进入时缓存里往往已有热点，设备进页面瞬间就出现。
- 系统弹框（「要与智能花盆搭配使用的设备」）**删不掉**：Android 10+ 的 `WifiNetworkSpecifier`
  必弹，无 API 可抑制或代点。已做到的是「已连在该热点上就跳过、不白弹」。唯一能降为一次性的
  是 `WifiNetworkSuggestion`，代价是连接时机由系统决定、不可控，待产品决定。
- 核实 mock：`lib/` 对任何 mock/fake/demo 的引用为 **0**，产品固定用
  `MethodChannelTuyaRepository`（真实涂鸦桥接）；`MockTuyaRepository` 只存在于
  `test/support/`，仅被单元测试构造。产品路径唯一的非真实行为是配网第三步「连接云端」的
  1–2 秒随机停留，那是 2026-09-10 产品明确要求的（该步没有实际业务接入）。
- 交付状态：已推送。**未验证**（本机无工具链）。

## 2026-09-10（晚，定稿）花盆APP 配网新流程全程不用 WifiNetworkSpecifier

- 项目：花盆APP，环境 home，分支 `main`，提交 `b3d0d09`。
- 用户口径：不要弹框；新流程的意义就是绕开 Android 10+ 必弹的入网授权框。另要求
  **文档不要来回乱改**。
- 纠错：我此前把 `_joinHotspotForPairing`（`WifiNetworkSpecifier`）加回配网的依据不成立。
  那次「只调 startActivator 失败」的对照**已经把 `queryDeviceConfigState` 删掉了**，而新流程
  里建立与设备通道的正是它；更早那次又缺 `getDeviceSecurityConfigs`。完整序列从未被完整
  试过一次。
- 改动：`pairViaDeviceHotspot` 收敛为两步 —— `apQueryDeviceWifi`（SDK 自己连热点并查设备
  状态）→ `apStartPairing`；App 侧不再碰任何连 Wi-Fi 的系统 API。`queryTimeout` 25s→45s；
  失败收尾改 `apStopPairing`（连接挂在 SDK 配网器上，不能用 `leaveDeviceHotspot`）。
- 文档：`AI_CONTEXT.md` 那段已堆成自相矛盾的过程记录（同一问题来回三遍），按它自己的规则
  （current facts 快照、不是时间日志）**一次性收拢成定稿块**，删掉两处矛盾旧句；过程细节只
  留在 `docs/history/`，以后不在 AI_CONTEXT 来回改。
- 交付状态：已推送。**未验证**。这是第一次完整跑官方序列，需真机复测；若仍超时，下一步
  **不是**把 `WifiNetworkSpecifier` 加回来，而是看失败消息的耗时行、查 `207201`，必要时走
  涂鸦工单确认 `queryDeviceConfigState` 内部如何连 AP。

## 2026-09-10（晚，续6）花盆APP 用户在系统 Wi-Fi 面板连热点 + 配网进度接真实 onStep

- 项目：花盆APP，环境 home，分支 `main`，提交 `da5a054`、`3ea5ea5`。
- 产品决定：**不要入网授权框**，改由用户在系统 Wi-Fi 面板点一下连设备热点。原生新增
  `openWifiPanel`（Android 10+ 用 `Settings.Panel.ACTION_INTERNET_CONNECTIVITY`，浮在 App
  之上的底部面板）；配网页不在热点上就进引导态、拉面板、每秒轮询（读缓存不占配额），
  连上后自动续跑配网。顺带修掉「从面板回来时 `resumed` 会把用户填好的路由器名清空」。
  旁证：智能生活 AP 流程里本来就有「去连接」跳系统 Wi-Fi 这一步，这解释了它为何不弹框。
- 测试提供的智能生活进度串（设备连接建立成功 / Wi-Fi配置已下发 / 设备连接路由器成功 /
  设备激活中 / 设备即将上线）正是涂鸦 `onStep` 回调的 UI 映射 ⇒ SDK 会报真实进度，而我们
  第三步「连接云端」一直是装的。现在把 `onStep` 接出来驱动进度（**页面文案一行没动**），
  失败消息带上最后到过的那一步；原生每收到一条都打 `pairing step: …` 日志，真机跑一次
  就能确认常量名。
- 测试改动：`MockTuyaRepository` 加可变 `currentSsid` / `wifiPanelOpens` / `pairingSteps`；
  4 处点「开始配网」的用例插入 `_connectDeviceHotspot()`；`widget_test._pumpApp` 改为返回
  repository；`a refused hotspot join` 整条改写（它覆写 `joinDeviceHotspot`，而新流程不调它，
  从 `b3d0d09` 起已测不到东西）。
- 交付状态：已推送。**未验证**（本机无工具链）。

## 2026-09-10（晚，续7）花盆APP 新增产品口径文档 PRODUCT_RULES.md

- 项目：花盆APP，环境 home，分支 `main`，提交 `8d00c29`。
- 起因：产品要求「将我说的慢慢总结归纳到 .md 中，不要我反复强调」。
- 新增 `docs/PRODUCT_RULES.md` 作为**产品口径与硬性要求的唯一出处**，六块：配网 /
  搜索设备页 / 连接 Wi-Fi 页 / 通用 UI / 实现底线 / 协作方式。每条带日期。
- 明确三者分工：**口径** → `PRODUCT_RULES.md`；**技术事实** → `AI_CONTEXT.md`；
  **试错过程** → `docs/history/`。不重复。已在 `docs/README.md` 登记并在 AI_CONTEXT
  顶部加指针。
- 同时澄清两条口径：智能生活只作参考、不照抄（页面展示内容保持现状）；**只做 Wi-Fi 配网，
  不需要 4G/蜂窝路径** —— 已核查代码 `mode` 写死 `'ap'`，`THING_4G_GATEWAY` 只出现在注释
  的能力清单里、无任何调用路径。
- 交付状态：已推送。本次只改文档。

## 2026-09-10（晚，续8）花盆APP 连热点改回「自动选中 + 一次确认」

- 项目：花盆APP，环境 home，分支 `main`，提交 `39d29d6`。
- 产品指出：搜索页已经搜到设备，不该让用户去 Wi-Fi 面板再挑一遍。上一版（`da5a054`）
  为了彻底消掉系统框走了那条路，确实多余。
- 写死的事实（避免再来回）：**「搜到」≠「能连上」** —— `getScanResults` 只能看见热点名，
  要真连上 Android 10+ 只有 `WifiNetworkSpecifier` 一条公开 API、必然弹一次确认框；涂鸦
  SDK 同样没特权（实测 `queryDeviceConfigState` 跑满 45 秒报 207220、全程无框、手机始终在
  路由器上）。⇒ 零确认做不到，自动选中做得到，两者只差一次点击。
- iOS 实测对照印证动线：用户选的是**路由器 Wi-Fi 不是设备**，连设备热点由 App 自己做
  （`NEHotspotConfiguration(ssidPrefix:)`，系统也只弹一次）。我们本来就是这样。
- 改动：`pairViaDeviceHotspot` 恢复三步（连热点 → 建通道查状态 → 下发凭据）；失败收尾
  两样都放（`apStopPairing` + `leaveDeviceHotspot`）；配网页撤掉引导态；测试回到含连热点
  那一版（`_RefusedHotspotRepository` 重新有意义）。
- 文档：`PRODUCT_RULES.md` 1.2 整节重写；`AI_CONTEXT.md` 动线第 3 步改准并写明三步各由
  哪次实测证明不能少。`openWifiPanel` 保留但不在主流程上。
- 交付状态：已推送。**未验证**（本机无工具链）。需真机复测三步序列——这是①②③第一次同时到位。

## 2026-09-10（晚，续9）花盆APP 动线改为「先连热点、再选 Wi-Fi」

- 项目：花盆APP，环境 home，分支 `main`，提交 `78afe2a`。
- 产品参照智能生活后给出新顺序：搜到设备 → **自动连这台设备的热点** → 点「连接」→ 弹
  Wi-Fi 列表（此时不再显示设备）→ 选 Wi-Fi → 输密码 → 配网。并问「我的理解对不对、能否实现」。
- 核对结论：**可以实现，且比原顺序更稳**。原来是「输密码 → 连热点 → 配网」，而手机一旦挂在
  设备热点上，「带出当前 Wi-Fi 名」只能留空（填热点名等于让设备连它自己）；新顺序里用户本来
  就要自己选网络，矛盾消失。三点说明：①取令牌/取安全配置/确认家庭必须在连热点**之前**完成
  （都走云端）——已由搜索页预取满足；②`WifiNetworkSpecifier` 的连接是进程专属一次性的，可能在
  用户选网络那段时间被系统掉掉，所以配网第①步照常保留（已连跳过、掉了重连）；③手机连在设备
  热点上时扫描照样能用，Wi-Fi 列表拿得到。
- 一处没照抄：「无 4G 信号或信号不佳」是说设备没蜂窝信号，**本设备没有蜂窝模块**，照搬会误导；
  改成「设备本身不联网，需要给它配置一个 Wi-Fi 网络」。
- 改动：state 新增 `connectDeviceHotspot()`；搜索页连上热点后不再自动跳页、出现「连接」按钮
  （失败给「重试连接」）；Wi-Fi 页删掉「已选择设备」行、`hotspotConnected` 为真且 SSID 为空时
  自动弹列表；两条用例随之改写。
- 文档：`PRODUCT_RULES.md` 1.4 整节改为新动线表；`AI_CONTEXT.md` 动线 1/2 同步。
- 交付状态：已推送。**未验证**（本机无工具链）。另记：`widget_test` 端到端用例**先前就已损坏**
  （仍断言已删的「选择设备」页与 `pairing-hotspot-step`），未盲改。

## 2026-09-10（晚，续10）花盆APP 每条退出路径还原 Wi-Fi，并修掉配网成功漏放

- 项目：花盆APP，环境 home，分支 `main`，提交 `16efc92`。
- 起因：产品指出自动连设备热点会让手机没网，要求取消/退出 App 等情况一律把 Wi-Fi 还原。
- 机制：原生 `leaveDeviceHotspot` → 取消 `WifiNetworkSpecifier` 注册 + 解开进程绑定，系统
  随即自动切回已保存的路由器。**原语本来就对，缺的是"保证调到"。**
- 审计出四条漏网，其中一条是**真 bug**：**配网成功不放** —— 凭据交出去后设备立刻关掉热点，
  进程还绑在已消失的网络上，紧接着读设备列表必然失败，正是代码里那句兜底「配网成功，但暂时
  读不到设备信息」的成因。另三条：搜索页连完热点后返回、进了 Wi-Fi 页又退回来（原来只在配网
  真跑起来过时才放）、App 切后台（进程还活着会一直没网）。
- 改动：state 新增 `releaseDeviceHotspot()`（不走 `_guard`、不抛错、可重复调）并在成功路径
  await；两个页面的 `dispose` 与 `paused` 都补上；唯两个不放的时机 —— 配网进行中、系统确认框
  正显示（那时页面也 paused，放等于撤回刚发出的请求）。
- 文档：`PRODUCT_RULES.md` 新增 1.4.1（每条退出路径一张表）；`AI_CONTEXT.md` 同步。
- 交付状态：已推送。**未验证**（本机无工具链）。真机验证重点：返回后是否自动回到原 Wi-Fi、
  切后台回来能否重连、**配网成功后设备列表能否立刻读到**。

## 2026-09-10（晚，续11）花盆APP 确认框只弹一次；补打包失败的 import

- 项目：花盆APP，环境 home，分支 `main`，提交 `736f2d1`（修打包）、`02a38f0`（只弹一次）。
- **打包失败**：`Type 'FlowerpotState' not found`。`device_search_page.dart` 只 import 了
  `app/flowerpot_app.dart`（那里是 `FlowerpotScope`），而 `FlowerpotState` 在 `lib/src/state.dart`。
  已补。顺带把两处本机无法验证的新语法（带 `when` 守卫的模式 switch、记录模式解构）换成
  if 链 + 局部变量，并在 `PRODUCT_RULES` §6 加了「编译不了就自己抓」的自检清单。
- **产品问「为什么还有那个系统框、自动连接不行吗」**：自动连接已做到（App 自己挑中搜到的
  那台、自己发起），但那个框是系统在问是否允许本应用加入该网络，Android 10+ 对所有第三方
  应用必弹、无 API 可抑制。**唯一真能没有框的情形**是该热点已在手机「已保存的网络」里
  （设备开机即自动连上、不经过 App API）；而我们用 `WifiNetworkSpecifier` 连的那次不会被系统
  保存，所以只能由用户在系统设置手动连一次才会变成「记住了」。建议在测试机查「已保存的网络」
  里有没有 `smartlife_…`，以验证智能生活不弹框的成因。
- 顺带修掉**会让框多弹一次**的真问题：判断「是否已连上目标热点」取自 `connectionInfo.ssid`，
  没有定位权限时它读成 `<unknown ssid>` ⇒ 判断成还没连 ⇒ 再发一次请求 ⇒ 第二个框。而
  Android 13+ 门禁里定位权限只是 requested，「给附近设备、拒定位」完全可能。改为原生
  `boundHotspotSsid` 自己记账，不依赖任何权限。
- 交付状态：已推送。**未验证**（本机无工具链）。

## 2026-09-10（晚，续12）花盆APP 改回「用户手动点设备行的连接」

- 项目：花盆APP，环境 home，分支 `main`，提交 `e7603b9`。
- 产品要求回到原来那种：设备列表每行旁边一颗「连接」按钮，手动点，不要自动连接。
- ⚠️ 已向产品澄清：**手动点不会让系统授权框消失** —— 那个框由 `WifiNetworkSpecifier` 触发，
  与「自动发起还是用户点的」无关。但产品直觉有一半对且重要：自己冒出来的框，用户完全不知道
  发生了什么；由用户点触发时框出现在他刚表达意图的那一刻。**收益在时机，不在有没有。**
- 改动：设备行加 `device-search-connect-$index`「连接」按钮替掉箭头；`_maybeAutoOpen()` 只停
  扫描不再自动连接；删掉 11 个随之无用的符号（含 `WidgetsBindingObserver` 与搜索页的网络还原
  —— 本页不再持有连接）；配网页去掉 `hotspotConnected` 与自动弹 Wi-Fi 列表（热点改在点
  「开始配网」那一刻才连，所以进那页时手机还在路由器上、SSID 照常自动带出）。
  `pairViaDeviceHotspot` 三步一行未改，系统框因此只在配网那一刻出现一次。
- 文档：`PRODUCT_RULES.md` 1.4 改为新动线表并写明「手动点不等于没有框」，1.4.1 相应调整。
- 交付状态：已推送。**未验证**（本机无工具链），按 `PRODUCT_RULES` §6 清单自检：括号配平、
  11 个删除符号引用全部归零、删 import 前确认无按类型使用、未引入新语法糖。

## 2026-09-10（晚，续13）花盆APP 搜不到设备 40 秒给指引 + DP 162 探针

- 项目：花盆APP，环境 home，分支 `main`，提交 `e01bc8d`。（提交前确认两仓库均干净已推送。）
- **产品反馈修正了一项产品事实**：`PRODUCT_RULES` 1.5 原写「设备开机就一定处于可配网状态」，
  现加限定 **「只在上电后一段时间内成立」** —— 静置后设备退出配网模式、不再广播热点。
- **「加快频率」走不通**：Android 9 起前台应用每 2 分钟只许 4 次 `startScan`（平均 30 秒一次，
  我们取 32 秒均匀铺满），超了静默返回旧缓存。这是 OS 配额、不是参数。设备已退出配网模式时，
  再怎么排扫描都搜不到。
- 改的是**尽早把正确动作交出去**：原来「重新扫描」要等整个 3 分钟窗口走完；现在 40 秒
  （已真扫两次：0s/32s）还没搜到就换标题「还没搜到设备」、正文说明「设备静置会退出配网状态，
  请断电重启」并立刻给出按钮。重启后热点一定在，下一次扫描就能看见 —— 把「碰运气等重叠」
  换成「确定性对齐」。
- **DP 162 探针**：`PlantConfirmState.fromDp` 把原始值丢了（只认 1、其它归 hidden），新增
  `SmartPlanterDevice.plantConfirmRaw` 保留原文；「更多设备信息」页底部加按钮，点开系统
  `AlertDialog` 列出上报原值 / App 解析结论 / DP 116（162 跟着 116 走）/ 设备名 / devId。
  ⚠️ **正式包里也可见**，测完需决定移除或加开关。
- 交付状态：已推送。**未验证**（本机无工具链），按 §6 清单自检。

## 2026-09-11 花盆APP 「连接」按钮在那一刻就连热点，框不再出现在密码之后

- 项目：花盆APP，环境 home，分支 `main`，提交 `a07820c`。
- 产品反馈「输完 wifi 密码后又弹框授权，很早的版本不需要，查一下 git」。
- **查 git 的结论**：被删的「选择设备」页那颗 `connect-device-$index` 按钮注释原话是
  *Nothing is "connected" here* —— **更早那版的「连接」同样不连热点、只把热点名带到下一页**，
  所以那一版的框也在密码之后。「早期不需要」最可能是当时测试机**已保存过该热点**（保存过由
  系统自动重连、不经过 App API，自然没框）。这条已记入 history，免得以后再找那个不存在的旧实现。
- 但要求本身对：按钮叫「连接」却什么都不连。改成**点「连接」就在那一刻连** —— 框出现在用户
  刚表达意图时；配网第①步检测到已持有该连接会原地跳过（原生 `boundHotspotSsid` 记账，不依赖
  读 SSID 权限），**输完密码不再弹第二次**。
- 连带副作用已解：连上热点后手机离开路由器、SSID 带不出来 ⇒ 趁还在路由器上先抓路由器名带给
  下一页（`PairingArguties.routerSsid` + `_applyCurrentSsid` 回落），用户到下一页仍只需输密码。
- 搜索页同时恢复网络还原（`dispose` / `paused`，正在连的那一刻除外），并加了按行的进行中态。
- 文档：`PRODUCT_RULES` 1.4 动线表重写（框在第 2 步、第 4 步明确不再弹），1.4.1 补退出路径。
- 交付状态：已推送。**未验证**（本机无工具链），按 §6 清单自检。

## 2026-09-11（续）花盆APP 配网全程去掉系统入网授权框 + 纠错

- 项目：花盆APP，环境 home，分支 `main`，提交 `74f826d`。
- 产品两次强调「系统框从始至终都不会出现」并要我核对提交。`git log -S"_joinHotspotForPairing"`
  查出：**`b3d0d09` 是最后一个无框状态，框是我在 `39d29d6` 加回来的**，`78afe2a` / `a07820c`
  只是换了它出现的位置——正是产品说的「改为自动连接的那几次改动」。
- **纠正一个我的错误结论**：加回来的唯一依据是那次 `207220 / 失败 45073ms`（跑满 45 秒、
  全程无框、手机始终在路由器上），我据此判「SDK 不会替我们连热点」。但产品**在那之后**才
  告知「设备静置一段时间会退出配网模式」——那 45 秒里设备很可能早就不广播热点了，连不上一个
  **已经不存在**的热点，超时是必然的，与「SDK 会不会连」无关。**实验被污染，结论作废。**
- 改动：`pairViaDeviceHotspot` 去掉第①步连热点，收敛为 ①`queryDeviceConfigState`（SDK 在这
  里连热点）②`startActivator`；连带去掉 `hotspotRequested`、`releaseHotspot` 参数与
  `hotspot_manual_required` 支；`_releaseDeviceHotspotPairing` 改为**无条件**解一次进程网络
  绑定。搜索页「连接」只选定设备（抓当前 Wi-Fi 名 + 等预取落地后跳页）。
- 文档：`PRODUCT_RULES` **1.2 整节重写为硬性要求**，并专列「⚠️ 不要再凭一次超时把
  `joinDeviceHotspot` 加回来」（错在哪 / 复测前提 / 真要推翻走工单）；1.4 动线表改为无框版。
- 交付状态：已推送。**未验证**。**真机复测必须用刚断电重启过的设备**，否则同一个超时会把
  同一个错误结论再推一遍。

## 2026-09-11（续2）花盆APP 回到能配网成功的路径；授权统一收在「连接」按钮

- 项目：花盆APP，环境 home，分支 `main`，提交 `fbf1f76`（前置检查+诊断）、`03efb05`（回到老路径）。
- **按产品要求查 git，拿到确定答案**：`223bdae^` 是最后一版能配网成功的代码，配网页调
  `state.pairViaHotspot` —— 序列「取令牌 → `_joinHotspotForPairing`（即 `WifiNetworkSpecifier`，
  **App 自己把手机连上热点**）→ `pairWifiDevice`（原流程 TY_AP）」。提交 `223bdae`「配网切到
  新流程，SDK 自己连热点」把这一步换成"指望 SDK 自己连"，**从那以后全是 207220 超时**。
  反复实测证明 **SDK 并不连** —— 这就是「为什么现在超时」的答案。
- 产品给的出路（「假如必须要授权，就在那个按钮上统一处理」）同时满足两件事：配网能成 +
  系统 UI 只在一处出现一次。
- 改动：搜索页「连接」恢复为**真的连热点**（抓路由器名 → `await _prepared` → 连 → 成功才跳页）；
  配网页改回 `pairViaHotspot`，其内部连热点一步会检测「已在目标热点上」而跳过 ⇒ **输完密码
  不再弹框**。新流程代码全部保留，换一处调用点即可回去。
- 另（`fbf1f76`）：失败消息末尾追加「手机在「xxx」(设备热点/不是设备热点)」；配网前做只读
  前置检查，手机不在热点上就**立刻**提示并给「打开系统 Wi-Fi 列表」，不让用户空等 45 秒。
- 文档：`PRODUCT_RULES` 1.2 重写为「系统 UI 只允许出现在一处：搜索页那颗『连接』」，写入 git
  查证结论（这一步不能省）；1.4 动线同步。
- 交付状态：已推送。**未验证**（本机无工具链）。

## 2026-09-11（续3）花盆APP 查证「永远不弹系统框的配网流程」

- 项目：花盆APP，环境 home，分支 `main`，提交 `898841b`。**本轮只查证与记录，无代码改动。**
- 产品给出目标流程（搜索列表 → 点连接 → 输/切 Wi-Fi 密码 → 确认配网，没有多余操作）：
  **该流程结构上就是当前实现**，唯一侵入是第 2 步那一次系统确认框。
- 把最后一条候选查到底 —— **`WifiNetworkSuggestion` 不可用**。Android 官方文档两条原文致命：
  ①「On Android 11 and higher, the user sees a **dialog** if the app is running in the foreground」
  首次在前台仍是对话框；②「The platform **ultimately chooses** which access point to accept」
  应用无法强制立刻连上指定网络，而平台倾向于不切到**没有互联网**的网络。
  另排除 `CompanionDeviceManager`（本身即系统选择弹窗、不授予静默连网能力）与降 targetSdk。
- 涂鸦文档侧：UI 业务包与「设备配网」页对 Android 10+ 限制**一字未提**；其 AP 定义原话反而是
  「**但用户需要手动切换手机的 Wi-Fi 设置**」——涂鸦自己的 AP 标准流程比我们现在**多一步**。
- **真正的零弹框答案在设备端：EZ/SmartConfig**。该模式手机全程留在路由器上、App 广播凭据、
  不需要连热点 ⇒ 零系统 UI。设备开发原话是「**没使用** EZ/SmartConfig」，而「没使用」≠「不能用」
  ⇒ **待设备团队确认固件能否同时开启 EZ**。桥接层 EZ 代码仍在（死代码），启用只需换 `mode`；
  **未经产品与设备团队确认不擅自切换**。
- 临时办法：让用户在系统设置里手动连一次该热点，系统保存后设备一开机自动重连，我们检测到
  「已在目标热点上」全程跳过 ⇒ 此后零框。这也最可能是"以前都不弹框"的真相。
- 文档：`PRODUCT_RULES` 1.2 增补「真正的零弹框只有两条路」与「已排除的（不要再试）」。

## 2026-09-11（续4）花盆APP 加入 EZ 快连配网，与 AP 页面可切换

- 项目：花盆APP，环境 home，分支 `main`，提交 `bf5878f`。
- 产品要求「改一个 EZ 配网模式我测试一下，原来的也备份下，不行就切回 AP」。
- 顺带回答「智能生活用什么模式」：两种都支持，但对 Wi-Fi 设备**默认先走 EZ（快连）**。产品自己
  在 iOS 上的观察正是 EZ —— 「选了一下 WIFI（不是设备），输密码就去配网」，不选设备、不连热点、
  直接广播凭据，这就是"从始至终没有系统框"的原因。
- 改动：新增 `lib/src/tuya/pairing_mode.dart`（`enum PairingMode {ez, ap}` + 运行时开关，
  **默认 ez**，做成运行时开关是为了同一个包里两种都能测）；state 新增 `pairViaEz`
  （取令牌 → `_pairInternal(mode:'ez')`，**全程不调 `_joinHotspotForPairing`** ⇒ 零系统 UI）；
  「连接 Wi-Fi」页加测试开关 `_PairingModeSelector`；搜索页 EZ 模式跳过连热点。
  **原生无需改动** —— `pairWifi`/`activatorFactory` 早有 EZ 分支（`newEZWifiConfigDevActivator`）。
- 测试：mock 加 `hotspotJoins` 计数；`pairing_page_test` 用 setUp/tearDown 钉成 AP（该文件用例都是
  按 AP 写的）；新增 EZ 用例断言 `hotspotJoins == 0` / `tokenCalls == 1` / `pairCalls == 1`。
- 文档：`PRODUCT_RULES` 1.1 重写为双模式，并**修正旧口径**——「永远不考虑 EZ，设备不支持」源自
  设备开发的「**没使用** EZ」，「没使用」≠「不能用」。
- 交付状态：已推送。**未验证**（本机无工具链）。测试前请确认手机连的是要配给设备的那个
  **2.4GHz** Wi-Fi；EZ 失败最可能两个原因：手机不在目标网络上、或固件没开 EZ（需设备团队确认）。

## 2026-09-11（续5）花盆APP 切回 AP、屏蔽 EZ；智能生活截图分析

- 项目：花盆APP，环境 home，分支 `main`，提交 `e43513c`（切回 AP + 截图分析）、`9d48a63`（屏蔽 EZ）。
- **实测结论：设备不支持 EZ/SmartConfig**，入口已全部屏蔽（删 `pairing_mode.dart`、
  `_PairingModeSelector`、两个页面的模式分支与 EZ 用例）；`pairViaEz` 方法体保留仅作备查，
  无任何入口。设备开发原先的「采用 AP-cfg，**没使用** EZ」就此坐实为「不能用」。**不要再提议 EZ。**
- **智能生活截图分析（`docs/配网1.jpg` / `配网2.jpg`）**：配网2「选择Wi-Fi」页副标题写
  「选择**设备工作**Wi-Fi并输入密码」，列表标题「可用Wi-Fi」，每行带锁图标 + 信号强度格数 ——
  正对应涂鸦 `WifiInfoBean` 的 ssid/rssi/sec，是 **`queryDeviceConfigState` 返回的设备视角列表**。
  配网1 那 5 步只有第一行转圈，是整条计划清单。⇒ **智能生活走的是涂鸦「新流程」AP**：
  连上设备 → 让设备扫 Wi-Fi → 用户从**设备扫到的列表**里选 → 输密码 → 配网。
- 由此修正两条旧判断：①不是 EZ（此前据 iOS 观察误判）；②**设备扫到的 Wi-Fi 列表是要展示的**
  （此前口径是"不需要读设备能看到的网络"，截图证明智能生活正是让用户从这份列表里选）。
- 另回答产品「系统弹框能否改成自己页面的样式」：**不能**。该框由系统进程渲染、在应用之外，
  App 既改不了样式也替换不掉；截图那两页是智能生活自己的页面。
- 交付状态：已推送。**未验证**（本机无工具链）。
- **下一步值得试**：照截图把新流程补齐 —— `queryDeviceConfigState` 成功后把设备扫到的 Wi-Fi
  列表展示给用户选、进度页按那 5 步显示。前提是该调用能连上，**必须在刚断电重启过的设备上验证**。

## 2026-09-11（续6）花盆APP 照截图实现新流程（五步进度 + 设备扫到的 Wi-Fi 列表）

- 项目：花盆APP，环境 home，分支 `main`，提交 `b72a950`。
- 依据产品提供的智能生活截图，按其**步骤**实现新流程；**UI 风格保持本项目现有的**
  （产品：「UI 风格不用改，只是改步骤」）。
- 改动：
  - `PairingStage` 三步 → **五步**（连接设备 / 设备找网络 / 设备连路由器 / 云端激活 / 设备上线），
    用词沿用本项目短标签，细节放 `hint`；进度页标题副标题未动。
  - 后三步由 `startActivator` 的 `onStep` **真实驱动**；前两步由 `connectDeviceForPairing` 覆盖
    （列表拿回来即「设备找网络」完成，成功后阶段留在 `deviceScanning`）。
  - 搜索页点「连接」改走 `connectDeviceForPairing()`（SDK 自己连，App 不碰
    `WifiNetworkSpecifier`），期间整页盖进度视图，标题仍是「搜索设备」；新增取消。
  - 连接 Wi-Fi 页的网络列表改为 **`state.deviceWifiNetworks`**（设备扫到的，按 rssi 画格数），
    「刷新」= 让设备重扫；进页面未选网络时自动弹出列表（只弹一次）；配网改回
    `pairViaDeviceHotspot`。
  - `PRODUCT_RULES` 1.4 按新流程重写，写明两条路径的切换点。
- **AP 原流程完整保留**，两处调用点都写了注释指路，随时可切回（`223bdae^` 那版能配成的路径）。
- 交付状态：已推送。**未验证**（本机无工具链）。
- ⚠️ **复测必须用刚断电重启过的设备** —— 此前三次 45 秒超时（`207220`）都可能撞上设备已退出
  配网模式。请带回：有无系统弹框 / 进度停在哪一步 / 失败消息整行 / logcat 的 `pairing step: …`。

## 2026-09-11（续7）花盆APP 新流程全程嫁接给 SDK：清掉会误伤它的门禁与死 UI

- 项目：花盆APP，环境 home，分支 `main`，提交 `7ea483b`。
- 产品澄清：新流程**也包括把「连设备」整件事嫁接给涂鸦 SDK，不用弹框授权设备**。
- 核对当前动线：App 侧已经一次都不调 `WifiNetworkSpecifier`。但发现两处残留会碍事：
  1. `pairViaDeviceHotspot` 开头那道硬门禁（不在设备热点上就抛 `not_on_device_hotspot`）
     是为「没有任何东西连热点」的旧形态写的；新流程由 SDK 连，而该判断依赖
     `connectionInfo.ssid`——没有定位权限时读成 `<unknown ssid>`，**会把新流程直接拦死**。
     已降级为**纯诊断**（只写进失败消息末尾的「手机在「xxx」」）。
  2. 随之永远触发不到的「打开系统 Wi-Fi 列表」引导 UI，连同 `_needHotspotHint` /
     `_openWifiPanel` / `notOnHotspotCode` / 失败页那条映射一并删除，底部按钮回到单层。
- **自检结论**：UI 只调 `connectDeviceForPairing` / `pairViaDeviceHotspot` / `probeWifi` /
  `stopDevicePairing` / `cancelPairing` / `prepareForPairing` / `releaseDeviceHotspot`，
  **七个都不触达 `_joinHotspotForPairing`**；`pairViaHotspot` / `connectDeviceHotspot` 仅作
  AP 回退路径保留，两处调用点注释写了怎么切。
- 文档：`PRODUCT_RULES` 1.2 按定稿口径重写，并列出「当前动线上唯一允许调的 state 方法」。
- 交付状态：已推送。**未验证**（本机无工具链）。

## 2026-09-11（续8）花盆APP 给 SDK 留扫描配额 + 失败原文打到页面

- 项目：花盆APP，环境 home，分支 `main`，提交 `d7d48c8`。
- 现象：第一步「连接设备」卡几十秒后退回搜索页，中间提示 `time out`。
- **新假设（具体且可修）**：`startScan` 配额**按 UID 算** —— 涂鸦 SDK 跑在我们进程里，与搜索页
  **共用** 4 次 / 2 分钟。原来 32 秒一次真扫两分钟正好用满；用户紧接着点「连接」，SDK 想扫一次
  找热点却被限流，**在等一个永远不会来的扫描结果广播**，于是挂到超时——症状完全吻合。
- 改动：搜索页新增扫描预算 `_quotaReservedForSdk = 2`（自己最多 2 次/2 分钟、62 秒一次），
  `_ownScans` 如实记账且**不清零**（配额由系统按时间回补）；预算用完改读缓存。
  `connectDeviceForPairing` 超时 60s → 35s。
- 按产品要求**把错误原样打到页面**：失败时把「原始码 + 原文 + 用时 + 手机当时连的网络」拼进
  异常并 `debugPrint` 一行；搜索页连同【错误码】显示，且**长按可复制**。
- 文档：`PRODUCT_RULES` 记下「搜索页必须给 SDK 留扫描配额，不要改回 0」。
- 交付状态：已推送。**未验证**（本机无工具链）。
