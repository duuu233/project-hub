# 当前迭代

## 2026-09-11：花盆 APP **蓝牙双模配网真机跑通** + 收口（`51e2f86`，已推送）

- 环境：ssh；flowerpot，`main`。真机 Android 10（API 29）。**配网成功。**
- **跑通的关键**：配网必须用 **`IMultiModeParallelActivator`** —— `config(ssid/pwd/token/gid=homeId/timeout)`
  → **`appendDevice(ScanDeviceBean)`** → `addMultiModeParallelListener` → `startConfigWifi()`。
  另一条 `IMultiModeActivator.startActivator(MultiModeActivatorBean, …)` 要**手工拼整个 bean**
  （二十多个字段），拼漏一项就在 SDK 内部 NPE，而混淆栈帧（`pqppqpd.bdpdqbp:21`）看不出漏了哪一项。
  并行这条把 `ScanDeviceBean` **整个交回给 SDK**，没有"拼"这一步。
- **完整路径与一路踩过的坑**都写进 `docs/history/2026-09/2026-09-11-蓝牙双模配网跑通.md`：
  `neverForLocation` 会让 12+ 静默过滤广播、探测抢在授权框之前、系统定位总开关、仓库层静默丢掉
  无 uuid 的设备、配网失败后没断 BLE 链路导致"之后再也搜不到"、`mac` 空而地址在 `address`、
  混淆栈帧只报类名。每条都有症状与处置。
- **本次收口，逻辑与流程不变**：① `showUnfilteredBleScan` 置 false，列表回到**只列本产品且未绑定的**；
  ② **认设备以后台 `/Client/Product/getProductList` 的 `broadcastId` 为准**（产品口径「根据后台的接口
  配对一下」），进搜索页拉一次、尽力而为不拦路，本地 `TuyaConfig` 常量兜底——**后台新增产品，App
  不用改代码、不用发版就能认出来**；③ 页面回到 UI 图，行上只留「信号 −xx dBm」，设备标识 / 能力位 /
  SDK 原样输出 / 常驻状态行 / 原生日志框**全部收进排查态**（翻回 true 整套就回来，不是删掉）。
- ⚠️ AP 仍屏蔽中（`apEnabled = false`），是否恢复作回落由产品决定，代码原样保留。
- 验证：**真机配网成功**（本轮唯一被真实验证的结论）。本机无工具链，analyze / test / 编译未执行；
  静态自检全绿。**收口后的样式与过滤未再上真机**，需回归：只列本产品、行上只有信号、配网照常成功。

---

## 2026-09-11：花盆 APP 配网改走并行配网器（`appendDevice`）（flowerpot 已推送）

- 环境：ssh；flowerpot，`main`。
- 真机连续两次同一个栈帧：`NullPointerException @ pqppqpd.bdpdqbp:21 (ble_start_failed)`
  ——混淆类名 ⇒ 炸在**涂鸦 SDK 内部**、就在调 `startActivator` 那一瞬间。上一轮补的 `getHomeDetail`
  同步**没能解决**。
- **涂鸦两次都提「必须先 `appendDevice` 再 start」，我上一轮凭印象否掉了（以为是 mesh 子设备的 API）
  ——这次解包查实：确实存在**，属于另一套接口 `IMultiModeParallelActivator`：
  `config(MultiModeActivatorConfig)` / `appendDevice(ScanDeviceBean)` /
  `addMultiModeParallelListener` / `startConfigWifi()` / `stopConfigWifi()` / `removeDevice(String)`。
- **关键差别**：旧路 `startActivator(MultiModeActivatorBean, …)` 要我们**手工拼出整个 bean**（二十多个
  字段），拼漏一项就是一次 NPE，而混淆过的栈帧看不出漏了哪一项——真机那个 NPE 极可能就是这么来的。
  并行这条**把扫到的 `ScanDeviceBean` 整个交回给 SDK**，字段由它自己取，**没有手工拼 bean 也就没有
  拼漏的可能**。
- 改法：`config(ssid/pwd/token/gid=homeId/timeout)` → `appendDevice(扫到的 bean)` → `addListener`
  → `startConfigWifi()`。回落保留（拿不到并行配网器时走旧路）；`stopMultiModeActivator` 两条都停，
  外加断开 BLE 链路。listener 的 `onError(String,String,String)` 三个字符串**原样拼进消息，不猜**。
- ⚠️ **教训**：上一轮我凭印象否掉了涂鸦的建议，白绕一圈。这个项目里**任何 API 论断都必须先跑
  `tools/aar_class_dump.py`**——包括用来「否定」别人的论断。已归纳进 `PRODUCT_RULES`。
- 涂鸦另一条「Android 17+ 需 `ACCESS_LOCAL_NETWORK`」仍未采纳：没有 Android 17 这个版本。
- 验证：**本机无工具链**，analyze / test / 编译 / 真机**全部未执行**。静态自检全绿。

---

## 2026-09-11：花盆 APP 配网 NPE 定位——配网前要先同步家庭详情（`flowerpot` 已推送）

- 环境：ssh；flowerpot，`main`（起始 `918d260`）。
- **真机新报错**（带上栈帧了，我加的隔离也起作用）：
  `NullPointerException @ pqppqpd.bdpdqbp:21 (ble_start_failed)`。混淆后的类名 ⇒ **炸在涂鸦 SDK 内部**、
  就在调 `startActivator` 的那一瞬间，**不是我们组 bean 炸的**。
- **根因**：`withHome` 只负责**拿到 homeId**（Dart 会话开始时 `setHomeId` 钉进来的），**全程没调过
  `getHomeDetail`**；而 SDK 的配网器要从**家庭缓存**里取东西。App 重启后直接进搜索页配网，那份缓存
  还是空的，一解引用就 NPE。涂鸦排查建议第三条「App 重启后未先调用 homedetail 同步网关数据」命中。
- **以前 AP 配网为什么没暴露**：走 AP 的用户通常**先进过设备列表**（`getDevices` 会调 `getHomeDetail`），
  缓存顺带就热了；蓝牙这条动线可以完全不经过设备列表。
- 改法：新增 `withHomeDetail(homeId)`——每个家庭每进程只拉一次，拉完再 `startActivator`；
  `loadHomeDevices` 成功时也记账免得重复拉。**失败不拦路**（让真正的配网错误来说话）。
- **涂鸦另外两条未采纳**：`appendDevice` 是 mesh 子设备那条链路的，双模 BLE-WiFi 用不上；
  「Android 17+ 需 `ACCESS_LOCAL_NETWORK`」——**没有 Android 17 这个版本**。
- 另：Windows 侧 `minifyReleaseWithR8` 报 `FileSystemException ... classes.dex 被占用`，是**环境问题**
  （Gradle daemon 未退 / 杀毒实时扫描锁文件），已给出 `gradlew --stop` + `flutter clean` + 杀 java 进程
  + 把项目目录加进杀毒排除的处置，并建议赶时间时先打 debug 包（不走 R8）。
- 验证：**本机无工具链**，analyze / test / 编译 / 真机**全部未执行**。静态自检全绿。

---

## 2026-09-11：花盆 APP 按真机 raw 加固配网 bean（`918d260`，已推送）

- 环境：ssh；flowerpot，`main`（起始 `aed8a0f`）。
- **真机拿到了完整 raw**（上一版的全字段打印起作用了）：
  `ScanDeviceBean{id='uuid23119e1d4a2b66fc', name='', providerName='SingleBleProvider',`
  `data='null', configType='config_type_wifi', productId='ehbx83xdh9jkmxvz',`
  `uuid='uuid23119e1d4a2b66fc', mac='', address='D8:FC:92:F4:89:88', deviceType='404',`
  `isbind=false, flag=776, rssi='-38'}`
- **三条规律**：
  1. ⚠️ **`mac` 是空的，真正的蓝牙地址在 `address` 上** —— 涂鸦不少代码路径拿的是 `mac`，
     空着就可能一路走到 NPE。**这大概率就是配网 NPE 的来源。** 现在两边互相补齐。
  2. `uuid` 带字面前缀 `uuid`（`uuid23119e1d4a2b66fc`），不是拼错，SDK 原样如此。
  3. `deviceType=404` / `configType=config_type_wifi` / `providerName=SingleBleProvider`，
     `flag=776`（bit 3/8/9），SCAN_WIFI 位未置 ⇒ `supportWifiList=false`，与页面显示一致。
- 加固：`productId` / `deviceType` / `flag` 没抄到就从 `ScanDeviceBean` 补；String 字段
  （`countryISOCode`/`devId`/`ip`/`dns`/`gateway`/`subnetMask`）**不留 null**——裸 null 的 String
  是最典型的 NPE 来源。
- 诊断：把真正交给 SDK 的 bean **整个 `toString` 打出来**；`startActivator` 单独 `runCatching`
  包起来，失败回 `ble_start_failed` + 异常类名 + **出事的栈帧**——这样能分清 NPE 是**我们组 bean**
  炸的还是 **SDK 内部**炸的。
- ⚠️ 带栈帧的报错是 `b809fcd` 加的，真机那条 6757ms 还是**旧包**；换新包重试就能看到具体位置。
- 验证：**本机无工具链**，analyze / test / 编译 / 真机**全部未执行**。静态自检全绿。

---

## 2026-09-11：花盆 APP 扫描结果一条都不丢 + 全字段打印（`aed8a0f`，已推送）

- 环境：ssh；flowerpot，`main`（起始 `6e5f768`）。
- 需求：还是扫不到设备；「把有概率的信息都列出来我自己判断，顺便把扫到的都打印出来」，
  「按信号把最强的前 50 展示出来也行」。
- **先修了一个正在吞设备的 bug**：仓库层 `_bleDevice` 写着「没有 uuid 的一律丢掉」——**静默过滤**。
  广播里没带 uuid 的设备直接消失，页面上显示的却是「一台都没扫到」，于是**「我们把它扔了」被当成
  「设备没在广播」，排查方向正好反**。现在一条都不丢；去重键按 uuid → mac → address → id 依次退
  （只按 uuid 会让所有没 uuid 的挤成一条）。没有 uuid 的照常列出、只是点不动（配网要它）。
- **每台的全部信息都画出来**：原生每条 `onResult` 现在上报 id / name / mac / **address（与 mac 分开，
  双模配网真正拿去连的是它）** / uuid / productId / configType / providerName / data / deviceType /
  bound / share / roam / rssi / flag / supportWifiList / **seq（第几次回调）** / **raw（bean 的原样
  `toString`）**。raw 最要紧——上面的字段是按常见 getter 名读的，万一这版 SDK 字段名不同会全读成空，
  只有它能说明 SDK 究竟给了什么。页面按等宽多行完整画，读不到的显式写「(空)」（**空本身就是线索**），
  整行长按可复制；列表仍按信号取前 50。
- **状态行补上判断依据**：系统版本（Android x / API n）、**SDK 回调次数**（列表为空而它在涨 ⇒ 扫描是
  活的、只是没留住；两者都 0 才是真没回调）、扫描起停事件。
- 验证：**本机无工具链**，analyze / test / 编译 / 真机**全部未执行**。静态自检全绿。新增用例：
  没有 uuid 的也要列出来、按 mac 去重。

---

## 2026-09-11：花盆 APP「之前搜得到、现在搜不到」——退出时断开 BLE 链路（`6e5f768`，已推送）

- 环境：ssh；flowerpot，`main`（起始 `cd2a3a8`）。
- 现象：`ehbx83xdh9jkmxvz` 那台之前搜得到，配网失败之后就搜不到了。
- **根因之一在我们这边**：**BLE 外设在连接状态下会停止广播**。配网连上设备、中途失败，而
  `stopMultiModeActivator` 只调了 `stopActivator`、**从来没断开那条链路**；NPE 又发生在 listener
  之外，连那点清理都没跑到。设备于是一直挂在连接上、不再发广播。
- 改法：`stopMultiModeActivator` 现在 `stopActivator` + `disconnectBleDevice` 两件事都做；新增
  `disconnectBleDevice(uuid)`（空 uuid = 全断，优先 `disconnectAllBleDevices()`）；`releasePairing`
  兜底全断；Dart 侧 `stopBleDiscovery` 停扫后一并断开——每次「重新扫描」「退出页面」都会断干净。
  扫不到时的文案把两个原因说清楚：①设备静置会退出配网状态（**只能断电重启**）；②上次连接没断干净
  （已自动处理）。
- **另一半原因仍在设备侧**：设备静置会退出配网状态，那之后不广播，只能断电重启——这条与 T5-E1
  规格书里「蓝牙配网 / 热点模式配网是两个独立工作状态」互为印证。
- **又查了一次那套 API**：产品再次贴来 `ActivatorService` / `IDiscovery` / `DiscoveryMode.BLE_WIFI` /
  `IDiscoveryListener` / `IBluetoothDevice`。这次连**最新版 7.8.6** 也下下来查了（我们在 7.5.1）——
  **依旧 0 命中**，所以不是「升级就有」。识别特征已记进 `PRODUCT_RULES`：那段里的 `didDiscover` 是
  **Objective-C/Swift 的委托命名**，把 iOS 风格套进了 Java 语法。它想做的事我们已经在做，只是类名不同，
  一一对应关系也写进规则了。
- 验证：**本机无工具链**，analyze / test / 编译 / 真机**全部未执行**。静态自检全绿。新增断言：
  停扫必须连 BLE 链路一起断。

---

## 2026-09-11：花盆后台产品表单恢复「广播ID」必填（`4e7f2e1`，已推送）

- 环境：ssh；flowerpot-admin（`/pgdata/pg/dh/flowerpot-web`），`main`（起始 `dbc46ff`）。
- 需求：产品**新增 / 编辑 / 详情**三页各加一个 `broadcastId` 表单项、**必填**。
- 三页共用 `template/DetailForm.vue`（`pageType` 1/2/3），**只改一处即三处生效**：默认值、必填规则、
  详情回填（`?? ''` 不能省——后端返 null 时 `Object.assign` 会把默认值覆盖成 null，`el-input` 告警且
  必填校验判不出"没填"）、模板插在产品名称与产品图片之间，`:disabled="pageType === 3"` 详情页只读。
- **这其实是把 2026-09-08 精简表单时撤掉的字段恢复回来**。那一轮记录里就留过风险提示「广播ID 是后台
  产品与涂鸦 PID 的映射来源，界面上去掉后新建产品不会再提交，若后端当必填则新增会失败」——这条风险
  就此关闭。
- **为什么它重要**（App 侧同日查清）：`broadcastId` 与涂鸦平台的 `productId` 是**两个不同字段**。
  `productId`（`yciq4kssu1fv8umn`）是平台产品 ID，云端配网/绑定/DP **以它为准**；
  `broadcastId`（`ehbx83xdh9jkmxvz`）是设备**广播时放进 BLE 包里**的标识。花盆 APP 做蓝牙配网时，
  BLE 扫到的 `ScanDeviceBean.getProductId()` 拿回来的正是广播里那个——后台这字段缺了，App 就认不出
  扫到的是不是本产品。
- 验证：本仓库**没有 lint / test 脚本**（`package.json` 只有 dev/build/preview 与菜单同步），
  `node_modules` 里也没有 eslint/prettier，**无可跑的静态门禁**；按本机内存约定未跑 `vite build`。
  自检：SFC 标签配平、字段四处（默认值/规则/回填/模板）齐全、详情页只读与同页一致。**浏览器未验。**
- 未做：**列表页没有加这一列**（产品只要求三个页面）；后端对 `broadcastId` 的长度/格式约束未知，
  前端目前只做必填，没有 maxlength 或格式校验。
- 文档：新增 `docs/history/2026-09/2026-09-11-产品表单恢复广播ID.md`。

---

## 2026-09-11：花盆 APP 蓝牙扫到设备了；修双模配网 NPE + 澄清 broadcastId（`b809fcd`，已推送）

- 环境：ssh；flowerpot，`main`（起始 `17fba0a`）。
- **真机进展：蓝牙扫到设备了**（-32dBm，uuid `23119e1d4a2b66fc`，`固件不支持读 Wi-Fi 列表`）。
  发现这条通了；卡在配网：6757ms 后 `native_error` / `NullPointerException｜令牌(复用) 0ms · 失败`。
- **① NPE 根因：activator bean 用错了构造函数。** 原先用 `MultiModeActivatorBean` 的**无参构造**、
  只手填 8 个字段，而这个 bean 还有 `address` / `mac` / `productId` / `deviceType` / `flag` 全留在
  null/0 上——SDK 要拿 `address` 去连那条 BLE 链路，一解引用就炸。改用 SDK 给的正道
  **`MultiModeActivatorBean(ScanDeviceBean)`**（扫到的那台是什么它自己全抄），老版本没有该构造时
  退回无参 + 逐字段搬。
- **② `broadcastId` ≠ `productId`，不是"对不上"。** 产品澄清：后台返回 `broadcastId = ehbx83xdh9jkmxvz`，
  涂鸦平台产品 ID = `yciq4kssu1fv8umn`，**两个不同字段**。**云端（配网/绑定/DP）一律以 `productId` 为准**；
  `broadcastId` 只是设备**广播包里**的标识，而 BLE 扫到的 `ScanDeviceBean.getProductId()` 拿到的正是它。
  ⚠️ 所以「扫到 -32dBm 的花盆却没标成本产品」**不是设备的问题，是我只比了一个 id**——我上一条
  「请与设备方核对固件烧录的 PID」是错的结论，已撤回。`TuyaConfig` 新增 `broadcastId`，认设备时两个都比。
- **③ 报错不再只给一个光秃秃的异常类名**：`describe()` 带上第一帧属于 `com.thingclips` / `com.common`
  的栈（类名.方法:行号）。NPE 的 `message` 往往是 null，退回类名之后说不出是哪一行。另在
  `startActivator` 之前把真正交给 SDK 的 uuid/address/mac/pid/deviceType 打一行日志。
- 验证：**本机无工具链**，analyze / test / 编译 / 真机**全部未执行**。静态自检全绿。
- **下一步真机**：这版应当能过 NPE 那一关；若仍失败，看新加的那行日志（哪一项空着）与带栈帧的报错。

---

## 2026-09-11：花盆 APP 读 T5-E1 规格书定位卡点 + 按 pid 认花盆（`17fba0a`，已推送）

- 环境：ssh；flowerpot，`main`（起始 `1bf3551`）。
- **规格书读出两条硬事实**（本机无 `pdftoppm`，纯标准库解 PDF 的 ToUnicode CMap 解码，脚本用完即删）：
  1. T5-E1 **确实是 Wi-Fi(b/g/n/ax) + 蓝牙 LE 双模**，支持 **BLE 5.4**、1Mbps 与 125Kbps 远距离模式
     ⇒ **硬件支持蓝牙配网，这条不用再问设备方**。
  2. ⚠️ **功耗表把「蓝牙配网」与「热点模式配网」列为两个独立工作状态**（各有电流与指示灯）。
     **这很可能就是真机扫不到的原因**：设备上电后进的是热点配网状态（它确实在拉 `SmartLife-xxxx`
     热点、我们一直扫得到），而那个状态下**未必同时广播 BLE**。
     ⇒ 要问设备方的变成两条具体问题：**上电默认进哪个状态？怎么切到蓝牙配网状态？**两种状态的
     指示灯分别什么样（好让测试肉眼确认）。这是本轮最有价值的产出。
- **按 pid 认花盆**（产品 pid `yciq4kssu1fv8umn`，已在 `TuyaConfig.productId`）：匹配的**置顶**、
  行上标「★ 本产品」，状态行单独一句「本产品（pid）：扫到 N 台，已置顶／未扫到」——这一行就是
  「到底有没有搜到花盆」的答案。pid 与固件烧录的 PID 严格一致，是唯一可靠判据（广播名常常为空、
  mac 每台不同）。
- **云端补产品名**：`IThingDeviceActivator.getActivatorDeviceInfo(productId, uuid, mac, …)`
  ——产品给的思路，解包核对**确实存在**。是云端往返，所以按信号**只查前 20 台**、**每台只查一次**
  （查空也占位，否则每条扫描回调都重试同一台）、并发用 in-flight 集合挡住。
- **同一批里没有采用的**：`ActivatorService` / `ActivatorMode.BLE` / `BLEActivator` / `IDiscovery` /
  `DiscoveryMode` / `IDiscoveryListener` / `startConfigBLEWifiDeviceWithUUID` / `ThingBLEAdvModel`
  ——7.5.1 全模块 **0 命中**：前者是**设备固件侧 TuyaOS(TKL)** 命名，后两个是 **iOS** 写法。
  `ACCESS_BACKGROUND_LOCATION` 与前台服务只在**后台扫描**时才要，本项目前台扫，不加。
- 验证：**本机无工具链**，analyze / test / 编译 / 真机**全部未执行**。静态自检全绿。新增用例：
  本产品置顶（信号更弱也排前）、云端产品名补上、每台只查一次。
- 文档：新增 `docs/history/2026-09/2026-09-11-T5E1规格书与云端产品名.md`。
- 小事：`docs/` 下那份 PDF 有一个「- 副本」重复文件，建议删其一（本轮未动，避免误删产品资料）。

---

## 2026-09-11：花盆 APP 撤掉系统原生 BLE 扫描，只走涂鸦 SDK；扫到的按信号列前 50（`5cd8c2d`，已推送）

- 环境：ssh；flowerpot，`main`（起始 `e6e84d6`）。
- 产品口径（两次确认）：**能用涂鸦 SDK 实现的，就不要自己实现**；搜索设备只走涂鸦 SDK 的
  `startLeScan`，不用系统原生 `BluetoothLeScanner`。
- `be52069` 里加的那条原生扫描当初只是**对照用的诊断**、从不参与配网，但口径明确就整个删掉：
  原生桥接、`RawBleDevice` 模型、仓库、状态、页面、mock、用例，净删 219 行，`RawBle*` 全仓零残留。
  `openAppSettings` 留下——它是权限被永久拒绝后的出口，和原生扫描无关。
- 按产品要求「把搜到的按信号强弱列前 50 台我看看有没有」：`bleDevices` 按 rssi 截前 50
  （`bleListLimit`），`bleTotal` 另报总数；状态行写清「一共 N 台，按信号列最强的 M 台」；
  每行小字加 **mac / uuid**（广播里常常没名字，只能靠这两样和设备方对），`maxLines` 放宽到 3。
- **没有采用**产品贴来的 `ActivatorService` / `ActivatorMode.BLE` / `BLEActivator` / `IDiscovery` /
  `DiscoveryMode` 示例——7.5.1 全模块 0 命中（前一轮已核对），其链接指向**设备固件侧**的 TuyaOS
  BLE 芯片 SDK 指南。`ACCESS_BACKGROUND_LOCATION` / 前台服务只在后台扫描时才要，本项目前台扫，不加。
- 验证：**本机无工具链**，analyze / test / 编译 / 真机**全部未执行**。静态自检全绿。
- 文档：history 那条线补「当日撤回」一节；`PRODUCT_RULES` §6 归纳这条口径。

---

## 2026-09-11：花盆 APP 首次进搜索页误报「缺定位权限」（`e6e84d6`，已推送）

- 环境：ssh；flowerpot，`main`（起始 `be52069`）。测试机 **Android 10**。
- 现象：第一次进搜索页提示缺定位权限、也搜不到，但系统设置里这个 App 的定位**明明是给了的**
  （「仅在使用该应用时允许」）；**退出 App 重进就正常**。产品问「是缓存问题吗」——不是缓存，是时序。
- **根因是我上一版引入的竞态**：搜索页把 BLE 那条 `unawaited` 出去、紧接着才调 `probeWifi`，
  而**权限框是 `probeWifi` 触发的**。于是 BLE 探测抢在授权框被回答之前跑完，`checkSelfPermission`
  报"未授予" ⇒ 既不扫描、也再没人重新探测，那句话就一直挂着。第二次进 App 权限已在，自然正常。
- 改法：① 新增 `ensureBlePermissions` 通道方法（只为触发那次授权框，走已有的权限门禁，答完才返回），
  `startBleDiscovery` **先 await 它、再 `probeBle`**；② 搜索页 `unawaited` 改 `await`——除了顺序，
  **原生的权限申请同时只能有一个在跑**（多一个会被回 `busy`），而 `probeWifi` 也会申请，串起来才不打架；
  ③ 回到前台重新探测并重试（用户很可能是去系统设置开完权限才回来的，必须当场生效）；
  ④ 权限被点成「拒绝」后系统不再弹框，补 `openAppSettings` + 页面上「重新检测／去系统设置」两颗按钮
  ——光说「缺权限」而没有入口，用户会卡死；⑤ `_bleNotice` 不再把所有「不可用」都说成"蓝牙没打开"
  （蓝牙开着却卡在定位上时，那句话会让人去反复开关蓝牙），并写明**「仅在使用该应用时允许」就够了**。
- ⚠️ **更正上一版的口径**：Android 10 上 `BLUETOOTH_SCAN` 与 `neverForLocation` 都不适用（那是 API 31+），
  `be52069` 那条改动**对这台测试机没有影响**。这台机器上真正的门是「定位权限 + 系统定位开关」。
  `neverForLocation` 那条改动对 Android 12+ 仍然有效，保留。
- 验证：**本机无工具链**，analyze / test / 编译 / 真机**全部未执行**。静态自检全绿
  （`dart_string_check` 274 文件、`kt_dangling_refs`、括号配平）。新增用例：授权必须在探测之前跑完、
  原生对照扫描一起开。
- 文档：并入 `docs/history/2026-09/2026-09-11-BLE扫不到设备的权限修复.md` 那条线。

---

## 2026-09-11：花盆 APP 真机扫不到设备——去掉 `neverForLocation` 并补齐每一道门（`be52069`，已推送）

- 环境：ssh；flowerpot，`main`（起始 `95fcfc6`）。
- 现象：只走蓝牙那版真机**一台都搜不到**。产品转述涂鸦口径：≤API29 需定位权限 + 传统蓝牙权限；
  ≥API31 可只用 `BLUETOOTH_SCAN`（带 `neverForLocation`）、无需定位，**除非需扫描 iBeacon 类广播**。
- **根因（最可能）**：清单里 `BLUETOOTH_SCAN` 带着 `neverForLocation`。那标志能在 12+ 免掉定位权限，
  代价是**系统会过滤扫描结果**——可能用于推断位置的广播（iBeacon 这类厂商自定义数据）被剔掉，应用
  根本收不到。涂鸦那句「除非需扫描 iBeacon 类广播」说的正是它，而待配网设备广播的恰恰是这类数据。
  于是**不报错、不回调、静默为空**，跟「设备没开机」完全分不开。
- 按版本口径重排权限：清单去掉 `neverForLocation`；≥API31 申请 `BLUETOOTH_SCAN + BLUETOOTH_CONNECT +
  ACCESS_FINE_LOCATION`（去掉标志后定位成为必需），API23–30 申请 FINE（另请求 COARSE）。
- **第二条同源的坑**：**系统定位服务开关**（不是权限），Android 6～11 强制要求，关着时扫描同样静默
  返回空。申请不来、只能检测。`bleProbe` 现在回 `locationOn` / `scanPermission` / `locationPermission`，
  `BleAvailability.usable` **六项全开才为真**；搜索页分出「缺权限／定位没开／蓝牙没开」三条独立结论。
  ⚠️ 少判任何一条，都会把「我们这边没配好」显示成「附近没有设备」——方向正好反。
- **新增系统原生 BLE 扫描作对照**（`BluetoothLeScanner`，无过滤，只对照不配网）：涂鸦只认它自己的协议
  广播，扫不到时「设备没广播」和「广播格式不对」看起来一模一样。页面上两个数目并排，并直接给结论——
  原生>0 而涂鸦=0 ⇒ 手机这边是通的、问题在广播内容（把页面截图给设备方）；两边都 0 ⇒ 设备多半没在广播。
  每条广播带 mac / 名字 / rssi / **厂商 id / service uuid**。这正是这轮要交付的：给设备方一个能照着改的
  结论，而不是「搜不到」。
- 验证：**本机无工具链**，analyze / test / 编译 / 真机**全部未执行**。静态自检全绿（`dart_string_check`
  274 文件、`kt_dangling_refs`、括号配平）。新增 `test/ble_availability_gates_test.dart`（六道门逐条验、
  老桥接缺字段按"没问题"处理、桥接明确回 false 要认出来）。
- **真机判据**：装上这版后 ① 授权框里应当多出「定位」；② 状态行逐项显示每道门；③ 原生扫描那一行的
  数目就是分水岭。
- ⚠️ 去掉 `neverForLocation` 后上架 Google Play 需说明定位用途（「用于蓝牙配网扫描附近设备」），国内商店不受影响。
- 文档：新增 `docs/history/2026-09/2026-09-11-BLE扫不到设备的权限修复.md`。

---

## 2026-09-11：花盆 APP 打包失败修复（`95fcfc6`，已推送）

- 环境：ssh；flowerpot，`main`（起始 `c36b0d0`）。
- 现象：Windows 侧 `assembleRelease` 失败，`String starting with ' must end with '`，6 处，
  全在上一轮（`c36b0d0`）新加的 `_bleOnlyOutcome` 里。
- **根因是我自己的**：用 python 脚本插代码时把 `\n` 写成了**单反斜杠**，python 当成转义、
  吐出**真正的换行**，Dart 源码里的字符串于是断成两行（`'…。` 换行 `'`）。文件编码没问题
  （终端显示的乱码是 Windows 控制台的事），纯粹是源码被截断。
- ⚠️ **自检为什么没拦住**：我那套自检只数括号，而**括号完全配平**——引号它根本看不见。
  顺带把那处「插值里再套一层同种引号」（`'${a.isEmpty ? 'x' : b}'`）拆成局部变量：合法，
  但正是它让粗暴的字符串剥离数不准。
- 新增 `tools/dart_string_check.py`：按 Dart 词法真的走一遍（区分 `'`/`"`、三引号、`r` 前缀、
  反斜杠转义、`${}` 插值里的嵌套字符串），查跨行未闭合的字符串字面量。**已自测**：对坏版本
  报出 1213/1214/1227/1228/1229/1230 六行，与编译器报的完全一致；对修好的版本 273 个文件全绿。
- `docs/PRODUCT_RULES.md` §6 补上「改完 Dart 必须跑它」，与已有的 `kt_dangling_refs.py` 并列，
  并写明两者各管一段、别拿其中一个当「全都查过了」。
- 顺带全仓扫了同一特征：**相册 APP 那边干净**，只有花盆这 3 处（6 行）。

---

## 2026-09-11：花盆 APP 屏蔽 AP、只走蓝牙双模（`c36b0d0`，已推送）

- 环境：ssh；flowerpot，`main`（起始 `fd763b0`）。
- 需求：先把 AP（热点）配网**整条屏蔽**，只走蓝牙，**在真机上确认设备端到底支不支持**
  ——不支持由设备方改固件。配套三条：页面标注清楚（用的是什么方式、报错原因）、搜索结果
  要看得出是不是蓝牙搜的、**先不做任何过滤，扫到什么全展示**。
- **为什么必须屏蔽而不是"优先"**：上一轮是 BLE 优先 / AP 回落，而在**验证**场景下那是有害的
  ——用户一旦落到 AP 上并配成，「设备支不支持蓝牙」这个结论就被一次成功盖掉了。
- 新增 `PairingGate` 总闸（`apEnabled=false` / `showUnfilteredBleScan=true`）。**是门禁不是删除**：
  AP 整条代码原样留着，翻回 `true` 全部回来。两个开关**刻意不是 `const`**——用例要两头都跑，
  关着时验这轮行为，开着时验 **AP 那套仍然完好**。
- 关掉的入口（逐条）：搜索页不列热点、**不再发 `startScan`**（读缓存保留，下一页要拿当前路由器名
  填 Wi-Fi）、不因热点停扫；iOS 的「下一步」不画（那是 AP 专用入口）；失败页不给「改用热点方式」；
  **配网页拿不到 BLE uuid 时直接报 `ap_disabled`，不许悄悄退回 AP**——悄悄退回是这轮最要命的错。
- 不过滤：`bleDevices` 不再剔除已绑定的（设备若因故被报成已绑定，过滤后页面上就是「什么都没扫到」，
  结论正好反了）——照常列出、行上标注、但点不动；原生 ScanType 从只加 `SINGLE` 改成**能加的全加上**，
  万一设备报的是别的类型，只加 SINGLE 会和「设备没开机」看起来一模一样。
- 页面标注：常驻状态行（搜索方式／蓝牙可用性／已扫秒数／扫到几台／过滤：无，可长按复制）、原生日志
  **只要有就画**（不再等失败，成功那次也要能截图）、行内小字带绑定状态与能力位、失败建议按 `viaBle`
  分流（早先蓝牙失败会劝人「等 Wi-Fi 扫描限制缓过来」，而这条根本不碰 Wi-Fi 扫描）、搜索结论单独走
  `_bleOnlyOutcome`（原来那套讲的全是 Wi-Fi 扫描）。
- 验证：**本机无 Flutter / Android 工具链**，analyze / test / 编译 / 真机**全部未执行**。静态自检：括号配平
  （改用「先抠 `${...}` 再剥字符串」的口径，否则插值里的嵌套引号会骗过计数）、`kt_dangling_refs` 通过。
  用例：搜索页整文件 `setUp` 把 AP 开回来**保住既有覆盖**，另加两条验屏蔽后的行为；失败页加一条；
  state 层「已绑的不列」显式关掉不过滤开关。
- **这一版就是拿去取结论的**，真机要看三件事：① 蓝牙扫不扫得到花盆（状态行 + 列表就是答案）；
  ② 扫到的话 `supportWifiList` 是真是假；③ 配网走不走得通、失败码是什么。
- ⚠️ 结论出来后**两个开关都不该长期停在排查态**：要么 `apEnabled` 翻回 true（设备不支持蓝牙），
  要么 `showUnfilteredBleScan` 关掉（蓝牙可用，恢复正常过滤）。
- 文档：新增 `docs/history/2026-09/2026-09-11-屏蔽AP只走蓝牙.md`。

---

## 2026-09-11：相册 APP 星币数值不再被截成「75… Stars」（`170412b`，已推送）

- 环境：ssh；album-app（`/pgdata/pg/dh/flutter`），`main`（起始 `858ad7d`）。
- 现象：Stars 页「Buy stars」套餐卡上的星币数显示成 `75… Stars`。产品口径：字体可以小一点，
  但**数值要完整展示**（当前档位上限 30000）；追加一条——后面的单位也可以跟着缩小。
- **根因**：卡片 2026-09-08 当日三次收窄（150→138→124→**104**，对齐小程序 208rpx），而这一行的
  排版没跟着改。内容宽只剩 `104-11*2=82`，`Row` 里**单位先按本征宽度占走**，剩下的才轮到
  `Flexible` 的数字 ⇒ 四位数就开始截。
- ⚠️ **不能靠"调小一个固定字号"了事**：单位是多语种的——「星币」2 个全角、`Stars` 5 个半角、
  **「スターコイン」6 个全角**（13px 下约 78px，几乎占满 82）。三者宽度差一倍多，挑不出四语种
  都放得下的固定值，**日文比报上来的英文还紧**。
- 改法：① 套餐卡那一行换成整行 `FittedBox(scaleDown)` + `Row(min)`，放得下原样、放不下等比缩，
  **永远不出现省略号**（与紧挨着下面那行金额同一套做法，那行 09-08 就已经是 FittedBox）；
  ② 单位基准 13→11、间距 4→3——`FittedBox` 本就整行等比缩放、单位一直跟着变小，调小基准是为了
  **把位置让给数字**（整行更窄 ⇒ 缩放比例更大 ⇒ 数字画得更大）；③ **`_Amount` 一并修**（概览卡
  余额 38px 与下方三格统计 20px 都用它，同一个 `Flexible+ellipsis`、同一个多语种单位，日文下同样
  会截）——用户只报了套餐卡，但同页同根因同改法，留着等于等下一次报障。
- **不加宽卡片**：104 是 09-08 对齐小程序定下的，缩放能在不动几何的前提下满足要求。保留的两处
  `ellipsis` 都在**标签**上（`starAvailable` / `_AccountStat.label`），那是有意的 nowrap——标签折行会把
  下面的数字整体下沉。
- 验证：**本机无 Flutter SDK**，analyze / test **未执行**。静态自检：括号配平（Δ 为 0）、全文件复查
  `ellipsis` 去向。新增 `test/star_package_amount_no_ellipsis_test.dart`：量本征宽度，守三条**与字体
  无关**的结构性事实（改前四语种下本征宽度都超 82、等比缩放后放得进、单位收窄确实让整行更窄）。
  ⚠️ 用例里**刻意不断言绝对像素阈值**——`flutter_test` 用方块测试字体（每字宽 = 字号），那种数字
  只在真机字体下才有意义。**真机未验**，尤其要看**日文**（单位最长）。
- 已知取舍：同一行内不同档位缩放比例不同（1000 不缩、30000 要缩），并排卡片数字大小有细微差异；
  金额那行 09-08 起就是这个行为，本次保持一致。要求绝对统一的话需要另做「按最大档位统一缩放」。
- 文档：新增 `docs/history/2026-09/2026-09-11-星币数值省略号.md`。

---

## 2026-09-11：相册 APP AI 助手顶栏标题跟着语种变（`858ad7d`，已推送）

- 环境：ssh；album-app（`/pgdata/pg/dh/flutter`），`main`（起始 `e537c44`）。
- 现象：AI 助手页顶部标题（例如「新对话」）切到英文/日文仍是简体中文。
- **两个根因，都修了**：
  1. 新建会话时**后端**把 `session.title` 填成写死的简中「新对话」（要等首条用户消息入库才自动填），
     而端上判断「是不是占位」拿的是跟着语种走的 `l10n.aiNewChat`。英文下 `'新对话' != 'New Chat'`
     ⇒ 这个占位被当成**用户自己起的标题**原样画到顶栏。连带 `_sendChat` 里「首条消息顶替占位」
     同样失配 ⇒ 英/日下**发完消息标题也不更新**，中文占位一直挂着；会话列表整列也是中文。
  2. `_sessionTitle` 存的是**已解析的字符串**，页面内切语种不会重算，顶栏停在切换前那一版——
     这是「没有根据语种动态变化」的另一半。
- 改法：新增 `AppL10n.isNewChatTitle(String?)`——空/null/空白，或**任意语种**下的 `aiNewChat` 都算
  「还没起名」。**遍历 `AppLanguage.values` 比对而不是写死四语种表**，将来改任何一个语种的文案，
  判定自动跟上、不会漏掉某一种而重新长出同一个 bug。四处调用点（`_createSession` / `_sendChat` /
  `initState` / 会话列表）改用它；`_buildHeader` 改为**每次 build 按当前语种重取**，
  `AppL10n.of(context)` 已订阅 `AppLocalizationsScope`，切语种当场重建。
- **不改后端**：占位是它的实现细节，历史数据里也已存着中文，端上识别并本地化更稳、不影响已有会话。
  **只有完全相等才算占位**——用户首条消息可能恰好含「新对话」三字（「新对话框怎么用」），子串匹配
  会把真标题吞掉，已按用例固定。
- 验证：**本机无 Flutter SDK**，analyze / test **未执行**。静态自检：四个文件括号配平（`ai_chat_page.dart`
  那处 `(`/`)` 不等是 HEAD 就有的噪声，本次 Δ 持平）；AI 页面内硬编码中文 `Text` 扫描 **0 命中**，
  确认顶栏那串只可能来自后端标题。新增 `test/ai_new_chat_title_l10n_test.dart`（四语种占位含繁中
  自动转换、空值、用户标题不被吞、遍历语种防漏）。**真机未验**——需在英/日/繁中各走一遍
  「新建会话 → 顶栏 → 发首条消息 → 会话列表」，并在页面停留时切语种确认当场跟着变。
- 文档：新增 `docs/history/2026-09/2026-09-11-AI助手标题不跟语种变.md`。

---

## 2026-09-11：花盆 APP 修「输完密码卡住」+ 配网按官方四步梳理 + **配网改走蓝牙双模**（未提交）

- 环境：ssh；flowerpot，`main`（起始 `2b0a4b8`）。
- **① 卡住的根因找到了，是回归。** `aef6ccd`（「只剩一条路，净删 1388 行」）把 `_pair()` 里的
  `_pairingState = state;` 与 `setState(() => _pairing = true);` **连同上面那段注释一起删掉了**，
  替换进来的新注释没把它们带回来。`build` 靠 `_pairing` 切进度页 ⇒ 它恒为 false ⇒ 点下「开始配网」
  后页面还停在输密码那屏、只有按钮里转个圈，而 `pairViaHotspot` 最长要跑满 150 秒才回来。
  连带三处：「取消配网」够不到（`_pairingState` 为 null）、退出本页走 `releaseDeviceHotspot()` 而不是
  `cancelPairing()`、**切后台会把正在下发凭据的热点通道掐断**（最后这条会让配网真的失败，不只是看着卡）。
  按 `223bdae^` 原样恢复。**现有用例本来能挡住它**（`leaving the page during pairing cancels it` 在当前
  代码上必然失败），只是那轮没跑测试——本机没有 Flutter 工具链。
- **② 配网对着官方四步过了一遍**，唯一的差异是有意的：**取 Token 必须排在连热点之前**（连上热点就没外网了），
  这条已经写死在注释与 `AI_CONTEXT`。顺带删掉多余代码：`FlowerpotState.pairDevice`（全仓零调用）、
  `PairingRequest.mode`/`isAp` 与通道里的 `'mode'`（只剩一个取值；iOS 拿它在已删的 EZ 与 AP 之间挑，
  改成写死 AP）、`PairingArguments.deviceName`（一直在传、没人读）、孤儿类 `_PairingHintCard`、
  三段被删除脚本留在原地的悬空文档注释。
- **③④ 配网主路径换成蓝牙双模**（固件方已确认支持蓝牙配网；AP 那条完整保留作回落）。原生走已集成的
  `thingsmart 7.5.1` 自带蓝牙模块，**没加任何 gradle 依赖**：`getBleOperator().startLeScan(LeScanSetting,
  ThingBleScanResponse)` 逐台推给 Dart、`stopLeScan()`、`isBleSupported/isBluetoothOpened`；
  `CombosFlagCapability.SCAN_WIFI` 位判 `supportWifiList`（固件 TuyaOS ≥ 3.6.1），为真时
  `IMultiModeActivator.queryDeviceConfigState(MultiModeQueryBuilder)` **建本地蓝牙连接**问设备要它自己扫到的
  Wi-Fi 列表——这就是绕开 Android「2 分钟 4 次 `startScan`」配额的那条路，也是「搜索不及时」的解；配网本身走
  `IMultiModeActivator.startActivator(MultiModeActivatorBean{ssid,pwd,token,homeId,scanDeviceBean})`，凭据经蓝牙
  下发，**全程没有系统入网授权框、手机也从没离开路由器**。
- **接的是真实动线，不是调试面板。** 中途我先做成了一张诊断卡（列可用性/flag/uuid + 一颗「查Wi-Fi」），
  被指出「就在真实场景，不要搞什么测试」后整张删掉：BLE 扫到的设备现在直接进搜索页的「已发现设备」列表
  （**扫到 BLE 就只列 BLE**——两条通道没有可靠的共同标识，混列就是同一台花盆出现两行），点「连接」直接查列表
  并进输密码页，「切换」弹层列的就是**设备自己扫到的**网络。
- **又证伪了一批编造的 API。** 过程中拿到的示例代码写着 `ActivatorService.activator(ActivatorMode.BLE)` /
  `ActivatorService.discovery(DiscoveryMode.BLE)` / `BLEActivator` / `IDiscovery`——把 7.5.1 能下到的模块全扫了一遍，
  **五个名字 0 命中**。那套命名属于**设备固件侧的 TuyaOS（TKL）**，不是 Android App SDK（同一段话里「适配 TuyaOS
  Kernel Layer」也印证了）。App 侧 BLE 配网只有两个入口：`IBleActivator`（纯蓝牙，`BleActivatorBean` 没有 ssid/pwd）
  与 `IMultiModeActivator`（双模，`MultiModeActivatorBean` 带 ssid/pwd/token）——花盆要连路由器，是后者。
- **反射目标全部解包核对过，没采信任何口头说法**——这个项目被涂鸦官方 AI 编造的 API 坑过一次。为此新写了
  `tools/aar_class_dump.py`：纯标准库解析 `.class` 常量池与方法表，**不依赖 JDK**（本机连 JRE 都没有），
  从官方 Maven 拉 7.5.1 的蓝牙 AAR 逐个确认，上面提到的类与方法**全部存在**。AAR 核对完已删除、未入库。
- 验证：**本机无 Flutter / Dart / Android / Kotlin / JDK 工具链**，analyze / test / 编译 / 真机**全部未执行**。
  静态自检：括号配平按「与改前相比有无新增不配平」比对，9 个文件全部持平；`tools/kt_dangling_refs.py` 通过；
  被删符号全仓零残留；悬空/重复 DartDoc 扫描 `lib/` 零命中。用例已同步（配网页补三条进度页回归断言、
  state 层新增两条 BLE 用例、mock 补四个方法与断言钩子）。
- 文档：新增 `docs/history/2026-09/2026-09-11-pairing-stuck-fix-and-ble-discovery.md`，
  `AI_CONTEXT.md` 配网整段重写（原文描述的是已删掉的 `pairViaDeviceHotspot` 新流程）+ 补 BLE 口径，
  历史索引同步。
- **堵掉一条「优先走蓝牙」的缝**：两条通道并行开，但 **Wi-Fi 会先答**——进页面读一次系统扫描缓存不占配额、
  几乎不耗时，而缓存里往往已经有设备热点了。那一瞬间列表先画出 AP 那行，用户一点就掉进更差的路。补了一个
  **4 秒抢答窗口**：BLE 还在扫且窗口没过时先不画热点；蓝牙用不了时一秒都不压；窗口到点由定时器主动重画
  （否则两条都没新结果时没人触发重建、热点会被一直压着）。**Wi-Fi 扫描节奏没动**——它现在是回落路径，但
  蓝牙关着时就是唯一的路，为省一次配额推迟首扫只会在真正需要它那次多等几十秒（09-10 踩过）。
- **「自动优选」补到失败之后**：双模的承诺是「自动优选最佳方式、提升配网成功率」，而第一版的优选只发生在
  发现阶段，蓝牙真没成时一条退路都没有。补两处——① 失败页的「重新配网」带上 `bleUuid`/`hotspotSsid`/
  `deviceNetworks` **照原样重走刚才那条**（原来只带 request，走蓝牙失败的那次重试会掉进 AP 分支、又没有热点名，
  得到的是另一个失败）；② 蓝牙失败时另给一颗「改用热点方式配网」，回搜索页带 `preferHotspot: true`，那一轮不开
  BLE、直接走 AP。**不做自动回落**：要再等一轮超时，而且 AP 必然弹系统框，在用户以为结束时冒出来更糟。
  EZ 不进优选池（真机实测设备不支持、整条已删），所以本产品的自动优选是 BLE ⇄ AP 两选一。
- **待真机**：① 配网那两行是本轮唯一确定的线上修复，要回归；② 双模整条全部未验，三条硬风险——反射参数装箱
  没有编译期保护、`queryDeviceConfigState` 的回调泛型是推的（已把每项 `toString()` 原样带回 `raw` 字段，真机
  一眼能看出是什么 bean）、`MultiModeActivatorBean` 是公有裸字段靠 `Field.set` 写（字段名写错不编译报错、
  只在运行时 `NoSuchFieldException`）。③ 真机不通时回滚只要一行：`_foundDevices` 永远返回 Wi-Fi 热点那份。

---

## 2026-09-10：花盆 APP toast 去掉来源前缀（`c7f765d`，已推送）

- 环境：ssh；flowerpot-app，`main`（起始 `863b02b`）。
- 需求：toast 里去掉 `接口-` / `APP-`（同源的还有 `涂鸦-`）前缀，直接输出内容。
- 这些前缀由 `FlowerpotState._tagged` 统一拼在失败文案前面，本意是「一眼看出是谁拒绝了这次请求」。对排查有用、对用户没用——「接口-406 请重新登录！」里有信息量的只有后半句。
- 改法：`_tagged` **改名 `_diagnostic`，只服务诊断行**；`_run` 的四条出口（`AuthValidationException` / `TuyaException` / `ApiException` / 兜底未预期异常）全部改为直接给原文；两处写死的前缀（`APP-wifi_scanning`、`APP-busy`）一并去掉。
- **诊断行保留标签**：`sessionDiagnostics`（设备列表页底部那行可长按复制的 `uid · 家庭 · 设备 N 台 · 失败原因`）与 `_backendSessionError` 仍走 `_diagnostic`——那两处本来就是给排查看的，去掉来源反而查不动。
- **来源信息没丢**：`ActionResult.code` 一直带着原始错误码，页面需要就自己拼；配网失败页就是这么做的（认得的码补在括号里）。分步耗时后缀（`｜令牌 812ms · 连热点…`）未动，本次只要求去前缀。
- 验证：**本机无 Flutter/Dart SDK**，analyze / test 未执行，只做静态自检；全仓检索确认 `lib/` 与 `test/` 里已无用户可见的三种前缀。用例已同步（`'涂鸦-pair_failed 配网失败'` → `'配网失败'` 等）。**真机未验。**
- 文档：新增 `docs/history/2026-09/2026-09-10-toast-drop-source-prefix.md`，`AI_CONTEXT.md` 与历史索引同步。

---

## 2026-09-10：花盆 APP 配网切到涂鸦「热点配网新流程」（`f105bd0` 查证 + `223bdae` 实现，已推送）

- 环境：ssh；flowerpot-app，`main`（起始 `b371412`）。
- **推翻了我此前「系统授权框无法避免」的结论。** 官方 Android 文档「Wi-Fi 热点模式」里有一节**「热点配网新流程」**，原话：「在配网过程中，**SDK 会在指定时间内自动去连接 AP 热点**」。官方 App 走的就是这条，我们走的是同篇文档的「原流程」（开头就写着「用户需要手动切换手机的 Wi-Fi 设置」）。文档匿名可读：`developer.tuya.com/cn/docs/app-development/hotspot-mode?id=Kaixk6wxla1oy`，已存档到 `docs/reference/`。
- **实测核对 SDK**：从官方 Maven 下 7.5.1 各模块解 AAR，`ThingApActivatorBuilder` / `IThingOptimizedActivator` / `ApActivatorBuilder` / `ApQueryBuilder` / `ApHandlerBean` / `IThingSmartActivatorListener` **全部存在**（`thingsmart-hardware(-business)-api`），`newOptimizedActivator` / `queryDeviceConfigState` / `getDeviceSecurityConfigs` / `resumeAPConfigWifi` 也在实现模块里 ⇒ **无需升级 SDK**。
- 顺带纠正了涂鸦官方 AI 的多处编造：`ThingSmartHotspotCredentialKit` 在两个 Maven 仓库 × 4 groupId × 3 命名下**全部 404**，它给的两篇「文档」一篇是《使用智能生活 App》用户手册、一篇是《H5 商城 UI 业务包》，两篇里那个类名出现 **0 次**；它最后自己承认无法访问文档/Maven/SDK。**该渠道不可作为技术依据。**
- **实现（`223bdae`）**：桥接新增 `apQueryDeviceWifi`（SDK 连热点 + 回读**设备扫到的** Wi-Fi 列表）、`apStartPairing`、`apStopPairing`，沿用反射风格（SDK 未链接时工程仍要能编过）；Dart 新增 `DeviceWifiNetwork`（含按 `sec` 推出的 `needsPassword` / `minimumPasswordLength`）、仓库三方法、`connectDeviceForPairing` / `pairViaDeviceHotspot` / `stopDevicePairing`；搜索页扫到设备后由 **SDK** 连热点再进下一页；连接 Wi-Fi 页直接下发凭据，`hotspot_manual_required` 引导路径整套删除；「切换 Wi-Fi」改列**设备扫到的**网络。
- **有意保留**：原流程（`pairViaHotspot` / `joinDeviceHotspot` / `prepareForPairing`）代码还在、只是不再被 UI 调用——新流程只对新固件有效，真机不通时回退只需换调用点。
- ⚠️ **陷阱记一笔**：新流程 `setTimeout` 单位是**毫秒**，原流程 `setTimeOut` 是**秒**，名字只差一个大小写。
- 验证：**本机无 Flutter/Dart SDK 与 Android SDK**，analyze / test / Kotlin 编译**均未执行**，只做静态自检（括号配平、逐行通读）。用例已改（state 层新增新流程一条，删掉已下线的手动热点用例与 `_ManualHotspotRepository`，令牌断言改口）。**真机全部未验。**
- **两条硬风险**：① 反射调用的方法名/参数类型**没有编译期保护**，签名对不上会 `NoSuchMethodException`；② **固件必须 TuyaOS ≥ 3.6.1**（产品已确认按此处理，但尚未拿到设备侧确认），低于此版本预期报 `207206` 或超时。另：文档没写 SDK 在 Android 10+ 用什么机制连热点，**是否仍弹一次框必须真机验证**。
- 文档：新增 `docs/history/2026-09/2026-09-10-tuya-ap-new-flow-found.md`（查证）与 `2026-09-10-ap-new-flow-implemented.md`（实现），官方文档三篇存档到 `docs/reference/`，`AI_CONTEXT.md` 与历史索引同步。

---

## 2026-09-10：花盆 APP「配网为什么要授权」续查（`c3b0b29` / `935d595` / `df9c561`，均仅文档+工具）

- 环境：ssh；flowerpot-app，`main`。**没有改任何业务代码。**
- 测试两次补充证据，逐条排除了我先前的推断：
  1. 「同一台手机、同一台设备，用智能生活 App 不弹框」⇒ 排除「Android 必然弹框、无法避免」这个**过于绝对**的结论（智能生活也是普通第三方应用，没有系统签名）。
  2. 「智能生活也没有退出 App 去系统设置，直接就连上了」⇒ 排除「官方 App 把用户送去系统设置手动连」这个最像的猜测。
- **目前唯一能解释的机制：Android 的 Wi-Fi 限制按「应用的 `targetSdkVersion`」生效，不是按设备系统版本。** `WifiManager.addNetwork()` / `enableNetwork()` 的官方兼容性说明写明：`targetSdk >= 29` 的应用调用「always fail」；反过来 **`targetSdk <= 28` 的应用在 Android 10~13 上仍可静默连自己加的网络、不弹任何框**。国内 App 常年停在低 targetSdk 正是为了保住这类能力（Google Play 的 targetSdk 下限对国内商店不适用）。本项目 `targetSdk = flutter.targetSdkVersion`（现代版本）⇒ 落在 always fail 一侧 ⇒ 只能用 `WifiNetworkSpecifier` ⇒ 必然弹框。**差异根源是 targetSdk，不是权限。**
- 对齐的三条路与代价（写进记录，均需产品决定、均未实测）：降 targetSdk 到 28（Google Play 会拒绝更新、放弃十年平台安全改进、Flutter 与三方库要重测）／改用 `WifiNetworkSuggestion`（首次通知授权一次、之后系统自动连，但连接时机由系统决定）／维持现状。
- **交付一个排查工具**：`tool/apk_target_sdk.py`（`df9c561`）——纯标准库解析二进制 `AndroidManifest.xml`，离线读出任意 APK 的 `min/targetSdkVersion` 与 Wi-Fi 相关权限并给结论，不依赖 Android SDK / aapt，只读不改写。用手工构造的最小 AXML 自测通过（正确读出 target 28 / min 24 与权限），**未在真实 APK 上跑过**。记录里另给了两条不用脚本的查法：`adb shell dumpsys package <包名> | grep targetSdk`；手机上装「应用信息」类工具看 target SDK。
- 文档：`AI_CONTEXT.md` 两次修正口径（先把「无法绕开」改准确，再写进 targetSdk 这条机制与验证方法），`docs/history/2026-09/2026-09-10-ap-only-and-system-consent-checklist.md` 追加三节。
- **仍待确认**：智能生活的实际 targetSdk（一条 adb 命令即可）。确认之前，targetSdk 这条只是**推断**。

---

## 2026-09-10：花盆 APP 配网模式查证——设备只支持 AP，系统授权框去不掉（`136176a`，仅文档）

- 环境：ssh；flowerpot-app，`main`（起始 `e2a479e`）。**本轮没有改任何代码。**
- **设备开发口径（新增确定事实）**：设备采用**涂鸦标准 AP 热点配网（AP-cfg），没使用 EZ/SmartConfig**；未激活设备开机自动开热点（`smartlife_xxx` / `tuya_mdev_xxx`），手机连上该热点后由 App 下发路由器 SSID/密码。
- **EZ 假设就此排除**。本仓库桥接层确实实现了 EZ（Android `EZ_MODE_NAMES`/`DUAL_MODE_NAMES`、iOS `ThingActivatorModeEZ`，注释还写着「EZ 默认，AP 兜底」），Dart 侧 2026-08-30 的 `a55a9ad` 把 `mode` 写死 `'ap'`——**那不是退化而是对的**，设备本来就不支持 EZ。桥接里的 EZ 分支从此按死代码看待，不要再试图切过去。
- **由此推出一条绕不开的限制**：AP 必须连设备热点 ⇒ Android 10（API 29）起第三方应用不能静默连任意 Wi-Fi，只能走 `WifiNetworkSpecifier` + `requestNetwork` ⇒ **由 App 发起连接时必然弹一次系统授权框**。唯一没有框的情形是**手机已经连在该热点上**（那时走手动路径、App 不发起连接）——设备开发描述的「手机连接该热点 → 打开 App」正是这一种，很可能就是「昨天的包不需要授权」的真实原因。
- 热点名白名单核对：`isDeviceHotspotName` 对 `smartlife_xxx` 与 `tuya_mdev_xxx`（含大小写、下划线、连字符变体）**全部命中**，不是问题来源。
- 给测试的排查清单（写进记录）：① 点「开始配网」那一刻手机连的是路由器还是设备热点；② 「昨天的包」是哪个提交；③ 测试机 Android 版本（9 及以下走完全不同的路径、本来就没有系统框）；④ 该热点此前是否授权过（较新 Android 会记住同一应用对同一网络的授权，**这条未经真机验证**）；⑤ 对比的是我们的包还是涂鸦官方 App。
- 文档：`AI_CONTEXT.md` 写进 AP-only 与系统框的结论，新增 `docs/history/2026-09/2026-09-10-ap-only-and-system-consent-checklist.md`，历史索引同步。

---

## 2026-09-10：花盆 APP 配网只剩「输密码」一步（`2ff0dd9` + `e2a479e`，均已推送）

- 环境：ssh；flowerpot-app，`main`（起始 `60dd74b`）。
- 需求：搜到设备**自动连**、不让用户确认，但**连的是哪台要展示出来**；整条流程只留「输 Wi-Fi 密码 + 点按钮」两个动作。另附：中间环节尽量减少等待，**不再考虑 Android 9 及以下**，按最快方案实现。
- **搜索页：先画出来，再自动带走**。扫到热点 ⇒ 列表照常画出来、标题下换成「正在连接「SmartLife-xxxx」…」，停 **600ms** 后自动跳「连接 Wi-Fi」并带上热点名。那 600ms 就是让用户看清扫到了哪台（先定 1.2 秒，按「少等」这条收到 0.6 秒）。跳之前把真扫、读缓存、窗口三个定时器全停掉——目标已选定，再扫只是白烧配额。**只自动跳一次**（`_autoOpened`），用户从下一页返回不会被再弹走、列表还在可手动改点；多台时取信号最强的那台。
- **连接 Wi-Fi 页：进页面就把云端往返跑掉**。「确认家庭 + 取令牌」都是云端往返，原来点了按钮才跑、用户干等。改为进页面后台跑 `_warmUpPairing()`——用户接下来必然要输密码，那几秒正好用来跑；令牌缓存在 `FlowerpotState.activatorTokenReady`，点按钮时直接复用，**省掉一次往返**。预热失败一声不响（用户还没表达配网意图），点按钮会再跑一次、那次的报错才弹出来。
- **连的是哪台写在页面上**：用户没点过「就连这台」，所以搜索页跳转时把 `deviceName` 一并带过去（值用热点名，AP 模式下 App 只有这一个标识），页面顶部画一行「✓ 已选择设备 SmartLife-xxxx」。不写清楚整条流程就成了黑箱。
- 结果：用户实际要做的只剩 **输密码 → 点「开始配网」**。
- 验证：**本机无 Flutter/Dart SDK 与 Android SDK**，analyze / test / 编译**均未执行**，只做静态自检。用例已改（自动跳转那条断言「先画出来 → 600ms 后跳 → 带上 hotspotSsid 与 deviceName」；原「点中列表里的设备」那条作废删除；连接 Wi-Fi 页文案断言跟到「已选择设备」）。**真机未验**。
- 文档：`AI_CONTEXT.md` 配网段落改写，`docs/history/2026-09/2026-09-10-pairing-flow-batch.md` 追加两节。

---

## 2026-09-10：花盆 APP 键盘避让改回框架默认 + 系统入网确认框说明（`60dd74b`，已推送）

- 环境：ssh；flowerpot-app，`main`（起始 `9a00ac0`）。
- **键盘避让：上一版是我自己写错了。** 那版把四页改成 `resizeToAvoidBottomInset: false` + 滚动区底部加 `viewInsets.bottom` 的 padding。这套写法放在 **Scaffold body 里错两次**：① 关掉 resize 后 body 高度不再按键盘缩 ⇒ **滚动视口不变矮** ⇒ Flutter 的光标自动滚动（`ensureVisible`）认为整屏都可见、**根本不会滚**；② Scaffold 开着 resize 时 body 里读到的 `viewInsets.bottom` **本来就是 0**（已被 Scaffold 消费），那段 padding 连值都取不到。现在四页（登录/注册/找回密码/连接Wi-Fi）**全部去掉覆写与手写 padding**，回到框架默认：body 缩高 → 视口变矮 → 内容溢出变可滚 → 光标滚进变矮的视口 → 输入框停在键盘上方。连接 Wi-Fi 页保留 `bottom: 92`，那是给浮在滚动区外的「开始配网」按钮让的位，与键盘无关。
- 其余带输入框的页面核对过，都是默认行为且本身可滚，无需改动：设备信息、纪念日编辑、选择植物、个人资料、登录密码、修改密码；`AppDialog` 走 Material 的 `Dialog`，它自己把 `viewInsets` 加进 `insetPadding`。
- **配网 1/2/3 步骤里的「要连接至设备吗?」——那是系统的，关不掉。** Android 10（API 29）起应用不能再自己 `enableNetwork` 任意网络，唯一途径是 `WifiNetworkSpecifier` + `requestNetwork`，而它**必然弹一次系统授权框**，没有任何 API 能抑制它或替用户点确认（能被应用绕过就失去意义了）。替代方案都更糟：`enableNetwork` 在 10+ 对第三方失效；`WifiNetworkSuggestion` 首次仍要批准且**由系统决定何时连**，配网这种即时场景用不了；引导用户去系统设置更差；Device Owner 普通应用拿不到。
  - **能做的都做了**：App 自己的弹框这三步里**一个都没有**（早些时候已删掉全屏遮罩与 toast，必要文案改成 `PairingStage.hint` 写在步骤里）；只用确切 SSID 请求以避开更啰嗦的「查找设备…」搜索变体；**本次再补一条——已经连在目标热点上（上次尝试留下的或用户自己连的）就跳过 `requestNetwork`，省掉一次框**。
- 验证：**本机无 Flutter/Dart SDK 与 Android SDK**，analyze / test / Kotlin 编译**均未执行**，只做静态自检。**真机未验**——键盘那条尤其需要真机逐页走一遍。
- 文档：`AI_CONTEXT.md` 写进「键盘避让一律用框架默认，不要再写关 resize 那一套」与系统框的结论，`docs/history/2026-09/2026-09-10-pairing-flow-batch.md` 追加一节。

---

## 2026-09-10：花盆 APP 连接Wi-Fi 页精简 + 主动扫描配额 front-load（`9a00ac0`，已推送）

- 环境：ssh；flowerpot-app，`main`（起始 `ae1de0a`）。
- **连接 Wi-Fi 页**：删掉底部「点『开始配网』后，系统会弹框询问是否连接…不必到系统设置里手动连」那张卡（`pairing-hotspot-step`）——系统弹框来了用户自然看得见，提前解释一遍只占掉半屏。**手动路径那张卡保留**（`pairing-hotspot-manual`）：它不是解释，是平台不让 App 连热点时用户必须照做的一步，且只在需要时出现。间距收紧让内容进首屏：顶部 88→**56**、插图后 27→20、段间 12→10、底部提示前 38→18、页尾 24→16。
- **「30 秒是哪来的规则、能不能更快」**：规则是 **Android 9（API 28）起的 Wi-Fi 扫描节流——前台每 2 分钟 4 次 `startScan`**（后台每 30 分钟 1 次），超额时 `startScan` 返回 false 且不再广播，`scanResults` 给旧缓存。见官方文档「Wi-Fi scanning restrictions」；开发者选项里能关掉「Wi-Fi 扫描节流」（Android 10+），所以开发机常测不出来；iOS 不适用。
  - **能更快**：4 次/2 分钟是**滑动窗口**约束，不等于必须均匀 30 秒一次。时间表由 `0/30/60/90s` 改成 **`0/6/46/86/126s`**——任意 2 分钟窗口仍不超 4 次，而最常见的「打开页面时设备早就开着」第二次真扫从 30 秒提前到 **6 秒**。空档仍由 2 秒一次的读缓存补上（不占配额）。
  - **还能更快但本轮没做**：Android 13（API 33）起有 `WifiManager.registerScanResultsCallback`，**任何**扫描出结果时推一次回调，可把 2 秒的轮询延迟降到接近 0；只对 API 33+ 有效，需要新增一条事件通道。
- 验证：**本机无 Flutter/Dart SDK 与 Android SDK**，analyze / test / Kotlin 编译**均未执行**，只做静态自检。`pairing_page_test.dart` 已同步（断言那张解释卡不再出现、手动卡仍在）。**真机未验**。
- 文档：`AI_CONTEXT.md` 扫描节奏口径更新，`docs/history/2026-09/2026-09-10-pairing-flow-batch.md` 追加两节。

---

## 2026-09-10：花盆 APP 搜索提速 + Wi-Fi 名带出规则 + 两处样式（`ae1de0a`，已推送）

- 环境：ssh；flowerpot-app，`main`（起始 `504e205`）。
- **「搜索了一分钟才搜出来」的根因**：改前是「30 秒一次真扫」。30 秒来自 Android 配额（前台每 2 分钟 4 次 `startScan`）本身没错——错在**那 30 秒里什么都没做**。设备上电到热点广播出来要几十秒，它在空档里冒出来也要等下一次真扫才看得见。
- **关键事实**：受配额限制的只有 `startScan`，**读 `scanResults` 不受限**；而系统自己（连接管理、设置页、别的应用）同样在扫、缓存会被它们刷新。
  - `scanWifi` 加 `refresh` 参数，`false` 时只读缓存：不调 `startScan`、不等 `SCAN_RESULTS_AVAILABLE` 广播、立刻返回。一路透传 `TuyaRepository.scanWifi({refresh})` → `FlowerpotState.probeWifi({refresh})`。
  - 搜索页改成**两条线并行**：`_forceScanGap = 30s` 真扫 + `_cachePollGap = 2s` 读缓存。热点被**任何一次**扫描（我们的或系统的）看到后，最多 2 秒出现在列表里。
  - `_throttled` 的「缓存太旧」兜底只在**真扫之后**判断——读缓存本来就不刷新缓存，`ageMs` 偏大是常态，否则每次读缓存都会被误判成限流。
- **「带出 wifi 名称很慢」是同一个根因**：填 SSID 只需要 `current`（来自 `WifiManager.connectionInfo`），**根本不需要扫描**；改前 `_loadNetworks` 一上来就真扫、要等最多 5 秒广播。现在只走 `refresh: false`，几乎瞬时；附近网络列表留给「切换」弹层自己拉。
- **SSID 带出规则收敛（产品口径）**：① 手机连着 Wi-Fi 就**直接带出来**；② 没连就**留空**，让用户自己去「切换」里选。唯一例外是手机挂在设备热点上（上次配网失败留下的）按「没连」处理。**频段不再作为过滤条件**——5G 照样带出来，由页面上那条频段提示说明；空着一个框反而让人不知道该做什么。
- **两处样式**：「发现 N 台设备」标题 28/24 → **20/18**（下面紧跟设备列表，重点在列表）；「重新扫描」的显示时机见上一条记录。
- 验证：**本机无 Flutter/Dart SDK，也无 Android SDK**，analyze / test / Kotlin 编译**均未执行**，只做静态自检。用例已同步（读缓存捡到中途出现的热点、没连 Wi-Fi 留空、挂在设备热点上按没连处理，以及全仓 `scanWifi` 覆写跟上新签名），**一条没跑过**。**真机未验**。
- 文档：`AI_CONTEXT.md` 配网段落补新节奏与 SSID 规则，`docs/history/2026-09/2026-09-10-pairing-flow-batch.md` 追加一节。

---

## 2026-09-10：花盆 APP 登录页 toast 收敛 + toast 宽度 + 搜索页重新扫描时机

- 环境：ssh；flowerpot-app，工作分支 `main`（起始 `c437953`）。

### 一、登录页只留 toast（`d875cff`）

- 产品口径：登录页校验不通过**有 toast 就够用了**，去掉 form 表单下面那行常驻提示。
- 删掉 `accountFocus` / `accountTouched` / `_handleAccountFocusChange` / `_accountError` 与 `AuthFieldError` 引用，`_LoginField` 退回单纯的 `SizedBox(56) + TextField`。**校验本身一点没松**：「获取验证码」照常在发送前挡下不合法号码（短信不会发出去），登录提交也照常校验格式。
- ⚠️ **注册页与找回密码页仍保留那行提示**，本轮没动——产品说的是登录页，且那两页表单更长（账号/验证码/密码/确认密码），toast 弹完就没了、用户回头改时没有参照。要不要一起去掉等一句话。

### 二、toast 宽度：写死 300 → 跟屏宽走（同 `d875cff`）

- 现象：「请先阅读并同意用户协议与隐私政策」折成两行。
- 算账：气泡 `maxWidth` 写死 300，减左右内边距 18×2 + 图标 19 + 间距 9，**留给文字只有 236**；这句 16 个汉字在 14px 下正好要 **224**——只差 12px，系统字号调大一档必折。
- 改法：`maxWidth` 改 `(屏宽 - 32).clamp(260, 380)`（375 屏上 343，留给文字 284，同句有 60px 富余，字号放大约 1.25 倍仍单行）；内边距 18→16、图标间距 9→8，这 6px 也让给文字。
- ⚠️ **「一定不折行」做不到也不该做**：toast 还要显示接口长报错。这次是把常见短提示的余量拉开，长文案照旧折行 + 限高裁尾。

### 三、搜索页「重新扫描」只在搜索为空时显示（`504e205`）

- 改前是「全程都在、搜索中置灰」。现在：**Android** 只有「搜完一轮 && 一台都没有」才画（搜索中点它只是白烧一次系统配额；已搜到设备时用户要点的是那台设备）；**iOS** 的「下一步」**全程都在**——那是唯一入口，列不出设备是平台限制，干等 3 分钟窗口没有意义。
- `_SearchActions` 收敛成一颗按钮，`onRescan` / `onContinue` 二选一（构造函数 `assert` 挡住）。

- 验证：**本机无 Flutter/Dart SDK**，`dart format` / `flutter analyze` / `flutter test` 均未执行，只做静态自检（括号配平、逐行通读）。用例已同步（登录页断言只给 toast、`AuthFieldError` 不出现；新增 toast 单行用例；新增「搜索中不画重新扫描、搜完为空才画」），**一条都没跑过**。**真机未验**——折行与否最终取决于机型字体与系统字号档位，建议把系统字号调大一档再看。
- 文档：新增 `docs/history/2026-09/2026-09-10-login-toast-only-and-toast-width.md`，`2026-09-10-pairing-flow-batch.md` 追加「重新扫描时机」一节，历史索引同步。

---

## 2026-09-10：花盆 APP 配网动线七项（`b951d61`，已推送）

- 环境：ssh；flowerpot-app，工作分支 `main`（起始 `bef2ca0`）。
- ① **键盘避让**：登录/注册/找回密码/连接Wi-Fi 四页统一 `resizeToAvoidBottomInset: false` + 滚动区底部让出 `MediaQuery.viewInsetsOf(context).bottom`。⚠️ 只靠 Scaffold 默认 resize 不够——内容本来放得下一屏时**不会产生可滚动区间**，光标「滚进可视区」无处可滚，输入框照样被盖住，这正是现象成因。
- ② **配网期弹框收敛**：新增 `PairingStage.hint`，三步各一句、只在「进行中」那步显示；删掉「正在确认账号与家庭」全屏遮罩（准备阶段并进进度页第一步，`_preparing` 去掉）与「请先到系统设置连接热点」toast。**关键一条**：不再用通配前缀请求 `WifiNetworkSpecifier`——`setSsidPattern` 走的正是产品截到的「查找设备…／没有找到任何设备。请确保要连接的设备已打开并准备好进行连接。」那个系统搜索框；现在只用确切 SSID，拿不到名字就以 `hotspot_unknown` 让用户回搜索页选。⚠️ 系统那个「连接到 xxx?」确认框**删不掉**（Android 10+ 应用不能自己连任意 Wi-Fi，必弹一次）。
- ③ **第三步「连接云端」**：目前没有接任何实际业务（activator 返回时设备其实已注册到云端），`_pairInternal` 给它 1–2 秒随机停留后直接按成功处理，否则第二步刚亮起就跳走。接上真实回执后换成真等待。
- ④ **配网失败页版式**：根因是写死的绝对定位——副标题 `top:362`、小提示卡 `top:400`，只有 38px 空档而副标题两行是 42px，必然重叠；`SizedBox(height: max(690, 屏高))` 又撑出多余滚动条。改成 `ConstrainedBox(minHeight) + IntrinsicHeight + Column`，副标题不再 `maxLines: 2` 截断。
- ⑤ **搜索页改「监听器」**：扫到的热点直接列在下面，点哪台带哪台 SSID 进配网，不再跳页；**`device_selection_page.dart` 与 `AppRoutes.deviceSelection` 一并删除**（那页唯一职责已被搜索页接管），失败页按钮改「返回搜索设备」。
- ⑥ **去掉「设备已在配网状态，继续」**。⚠️ **有代价、需产品复核**：iOS 不枚举附近网络，搜索页在 iOS 上**永远列不出设备**，这个按钮是 iOS 唯一能进下一步的入口——删掉后 **iOS 走不到配网**；Android 被限流或热点名在白名单外时同样没有出路。
- ⑦ **启动页先只留背景图**：logo/字标/标语整块不画，代码留在 `_buildBranding()`，`_showBranding` 改回 true 即恢复。
- **关于「配网又不行了」（产品第 5 条）**：昨天动到配网的是 `d0ab4d0`（配网前 `prepareForPairing`）与 `1763f74`/`ffbefb6`/`c612166`（家庭 id 与账号键）。最可疑的是 `prepareForPairing` 里那道新门禁 `if (home == '0') throw home_unresolved`——它把「查不到家庭」当成「不能配网」，而 `currentHomeId` 返回 0 只表示此刻还没解析出来，activator 自己会在配网时解析；且这一步跑在**还连着路由器**时，根本不存在 `d0ab4d0` 要防的「在热点上查家庭 → 空列表 → 建空家庭」。门禁一触发「开始配网」直接失败、配网根本没开始 = 「昨天还能配，今天点了没反应」。本轮降级为诊断（文案「准备就绪（家庭待解析）」）。⚠️ **这是基于代码的推断、不是实测**；若真机上仍配不了，下一个查 `setHomeId` 钉住的家庭是否过期/不属于当前账号，看设备列表页底部 `sessionDiagnostics` 与 `[pair]` 日志。
- 验证：**本机无 Flutter/Dart SDK，也无 Android SDK**，analyze / test / Kotlin 编译**均未执行**，只做静态自检（括号配平、逐行通读）。用例已按新行为改写（搜索页内联列表与点击跳转、失败页路由与文案、启动页断言品牌内容不出现，选择页用例随页面删除），**一条都没跑过**。**真机全部未验**。
- 文档：`AI_CONTEXT.md` 配网段落改写，新增 `docs/history/2026-09/2026-09-10-pairing-flow-batch.md`，历史索引同步。

### 追加：设备开机即可配网，文案整体改口（`e65a76a`，已推送）

- **产品事实**：设备只要开机就一定处于可配网状态，**不需要长按、复位或任何确认动作**；搜索页的职责就是把设备搜出来并展示。原来那批文案全建立在「用户要先把设备弄进配网状态」这个前提上，与事实不符。
- 改口清单：搜索页「**未发现配网中的设备**」→「**未发现设备**」、「请长按设备按键让它进入配网状态后重新扫描」→「请确认设备已开机并靠近手机后重新扫描」、搜索中那句→「请确认设备已开机，并确认手机连接的是 2.4GHz Wi-Fi」、被限流与「平台不枚举附近网络」两种态同步改口；失败页 `hotspot_join_*` 与 `pair_timeout` 两条提示不再提指示灯与配网状态；帮助中心「搜索不到设备」整条改写、去掉长按复位键那一步；代码注释里同样的前提一并改写。
- 这条同时回答了第 6 项的疑问：「设备已在配网状态，继续」要用户确认的东西**永远为真**，本来就没有意义，删掉是对的。
- ⚠️ 但**iOS 入口的缺口仍在**：iOS 不枚举附近网络，搜索页在 iOS 上永远列不出设备，删掉那个按钮后 iOS 没有任何路径进入配网。「开机即可配网」这条事实反而说明 iOS 可以直接给一个无条件的「下一步」——是否要补，待产品定。
- `AI_CONTEXT.md` 把这条产品事实记进配网段落，历史记录 `2026-09-10-pairing-flow-batch.md` 追加一节。

### 追加：iOS 入口补回（`c437953`，已推送）

- **查证结论**：iOS **列不出附近设备，而且没有替代方案**——系统没有任何公开 API 能枚举附近热点（`NEHotspotHelper` 要 Apple 特批的 entitlement，基本只发给运营商；`CNCopyCurrentNetworkInfo` 只回答「此刻连着哪个」）。这是平台限制，不是搜不到。
- **但配网本身不需要先列出来**：本仓库 iOS 侧 (`AppDelegate.swift`) 早就用 `NEHotspotConfiguration(ssidPrefix:)`，**按前缀**直接连设备热点、不需要确切 SSID。加上「设备开机即可配网」，iOS 上没有任何要用户确认的东西 ⇒ 给一个**无条件的「下一步」**即可（与被删掉的「设备已在配网状态，继续」不是一回事：那个要用户确认一件永远为真的事）。
- 改动：搜索页新增 `_canListNetworks`（`defaultTargetPlatform != iOS`），iOS 上按钮换成「下一步」→ 直接进「连接 Wi-Fi」且**不带热点名**，标题/说明改成「本机无法列出附近设备 / iOS 不提供附近 Wi-Fi 列表…设备开机即可配网，直接下一步即可」；Android 仍是「重新扫描」。
- **修回一个自己引入的回归**：上一版在 Dart 侧直接拒绝「没有确切 SSID」的请求（`hotspot_unknown`），而 **iOS 的 target 永远是 null**——那等于把 iOS 唯一的通路也砍了。现在恢复前缀路径，把「拒绝通配」下放到 **Android 原生**（`joinDeviceHotspot` 收到空 ssid 回 `hotspot_ssid_required`，`setSsidPattern` 与 `PatternMatcher` import 一并删除）。这样 Android 永不触发系统那个「查找设备…／没有找到任何设备」搜索框，iOS 照常走前缀。失败页补 `hotspot_ssid_required` 的提示。
- ⚠️ **iOS 这条路一次都没验过**：没有 Mac、Xcode、设备。`NEHotspotConfiguration` 需要 `com.apple.developer.networking.HotspotConfiguration` entitlement（Xcode Capabilities 可自助开、不需 Apple 审批），签名配置是否已带上它需要在有 Xcode 的机器上确认。

---

## 2026-09-10：花盆 APP 两件——手机号校验补反馈 + 搜索不到设备

- 环境：ssh；flowerpot-app，工作分支 `main`（改前 pull = Already up to date，起始 `ef11017`）。

### 一、手机号格式校验补上反馈（`1bacd9e`，已推送）

- 需求：09-09 加的手机号格式校验**没给任何反馈**——那轮只是把「获取验证码」按钮置灰，按钮点不动也不说话，用户不知道是号码写错还是页面坏了。产品口径：toast 或表单式的输入框下方提示，都行。
- 做法：新增共用组件 `widgets/auth_field_error.dart`（`AuthFieldError`），登录 / 注册 / 找回密码三页同一套改法——账号框接 `FocusNode` + `accountTouched`（**失焦一次**或**点过按钮**之后才报错，改对了自己消失）；新增 `_rejectInvalidAccount()` 同时给 toast 和常驻提示；**「获取验证码」不再按格式置灰**，只在忙 / 倒计时置灰；三页的提交动作也补上账号格式校验（原来只判空）。
- 关键点：**按钮改回可点是这次的核心**——置灰是上一轮「不让短信发出去」的手段，但它同时堵死了唯一能回话的入口（点不动就没有点击事件，toast 永远不出现）。改成照常可点、在调 `sendCode` 之前挡下：短信仍然不会发出去，但用户拿得到一句话。两种反馈都给不是二选一：toast 回答「你刚点了什么」，行内提示回答「到底哪儿不对」。
- 用例：旧的「位数不够时按钮 onPressed 为 null」作废，改写为「点得动 → toast + 行内提示 → 不发短信 → 补对后提示消失」，新增「失焦时才报错」。**未运行**。

### 二、搜索不到设备（`bef2ca0`，已推送）——根因不是频率太低，是太高

- 反馈：搜索设备搜不到，昨天是不是改到这里；追问后给出复现——**先进搜索页、再给设备上电**就一直搜不到，并猜「是不是搜索频率太低」。
- **根因方向相反**：**Android 9 起前台应用每 2 分钟只允许 4 次 `startScan()`**，超额时直接返回 false、不再广播，`scanResults` 给的是**上一次真扫的缓存**。2026-09-08 的 `2903cf7` 把这页从「进页面扫一次 + 用户点重新扫描」改成 **45 秒窗口每 2 秒重扫**：一轮约 7 秒（原生等广播最多 5 秒 + 2 秒间隔），**4 次配额在头 20 秒就烧光**；之后 `startScan` 被拒、原生立刻用缓存作答（没有 5 秒等待），循环反而加速到 2 秒一轮，**整窗口剩余时间全在反复读同一份旧缓存**。而「先进页再上电」时那份缓存正是**上电之前**拍的 ⇒ 必然搜不到，45 秒一到报「未发现配网中的设备」。09-09 的 `27bbbd9` 只是把节奏换了写法，没碰配额问题。
- 改动：**节奏** 开头 2 次快扫（间隔 3 秒）→ 之后 **30 秒一次**（= 4 次/2 分钟的配额）；**窗口** 45 秒 → **3 分钟**（短于 2 分钟等不到配额回补）；**两条出路全程可见**（搜索中禁用「重新扫描」，「设备已在配网状态，继续」可点）——窗口拉长和放出出路是一对，只做一半就是把用户困住；**桥接补 `throttled`（`startScan` 被拒）与 `ageMs`（缓存年龄）**，`WifiScan` 带上；被限流时明说「系统限制了 Wi-Fi 扫描频率，正在等待下一次扫描」；**一次都没真扫成过时给「无法确认附近设备」而不是谎报「未发现配网中的设备」**。
- ⚠️ 这条链路在开发机上常常看不出来：Android 开发者选项有「Wi-Fi 扫描节流」开关，关掉就不限流。
- 用例：旧「45 秒窗口反复扫描」按新节奏重写，新增「被限流时不下未发现设备的结论」「搜索中也能直接继续」。**未运行**。
- **相邻风险（本轮未处理）**：09-08 同时删掉了「从附近网络中手动选择设备」，而热点识别只是 SSID 前缀白名单（`smartlif` / `tuya` / `ysplanter` / `ty_`）。量产件热点名若在白名单之外，搜索页看不见它也没有手动入口，用户只能走「继续」。要不要放回手动选择需产品决定。

- 验证缺口（两件都是）：**本机无 Flutter/Dart SDK，也无 Android SDK**，`flutter analyze` / `flutter test` / Kotlin 编译**均未执行**，只做静态自检（括号配平、逐行通读）。**真机均未验**；`throttled` / `ageMs` 一次都没在真机上跑过，是最大未验证项。
- 文档：`AI_CONTEXT.md` 配网段落改写扫描节奏口径，新增 `docs/history/2026-09/2026-09-10-auth-phone-format-feedback.md` 与 `docs/history/2026-09/2026-09-10-device-search-scan-throttle.md`，历史索引同步。

---

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
