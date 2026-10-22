# qianrong 角色与日志当前对接口径

2026-10-22 home最新样式：角色与系统、用户组共用“权限名称 / 操作权限”两列权限表，采用正矿feature-v1.8.5独立页面组件，替代同日早先的纵向目录树。PermissionTable仍只作叶子Set/toggle适配；展开/全选/半选、停用及筛选规则见[菜单权限表说明](qianrong-menu-permission-tree.md)，下述接口/继承和字段保存边界不变。

2026-10-22菜单继承更新优先：恢复用户组menuList，系统→用户组→角色收窄；角色只取menuTreeList，不回退系统元信息菜单、不补授树外父节点。上级已收窄的原授权保存前确认移除；空树保留回显但阻断保存。具体接口、交互与后台缓存验收边界见 [菜单继承说明](qianrong-group-menu-inheritance.md)。三类日志本轮未修改。

更新：2026-10-21，home。用户已恢复角色模块开发，并要求重新对接三种日志、自动补缺失菜单、完成后直接提交推送；此前迭代的“角色排除”“日志接口未开放”“先不push”不适用于本次。

## 角色管理

- 保留原生 vxe-grid、独立新增/编辑/详情路由、权限指令与用户分配页面；接入角色列表、详情、增改、启停、删除和数据权限。
- 表单维护所属企业、角色名称、顺序、权限字符、状态、备注与系统菜单。已有企业归属固定，历史未设置企业时允许补选。角色状态按现有0启用/1停用，不新增原型草稿状态。
- 提交只发送 SysRoleAddOrUpdateDTO 声明的字段。roleSystems 与汇总 menuIds 一致；系统按编号匹配，不按同名归并，不把所有菜单按“小程序”等名称兜底授权。
- 可选菜单读取登录用户的用户组菜单树。接口返回空树、系统失效或菜单不可配置时保留原授权，不静默删除；新角色无可选系统时提示管理员核对权限，不能伪造授权。后端仍负责企业/用户组权限上限。
- 数据权限真实范围接口返回 `[{key:'1',value:'全部数据权限'},…]`，已兼容旧 value/label；范围值按接口，不沿用本地旧枚举。部门树使用 depts/checkedKeys；非部门范围不访问空树，也不发送未声明的 productIds/regulatoryIds/bankIds。
- 详情失败禁止提交；请求切换、保存状态和本机草稿按当前角色隔离。“本机草稿”不表示服务端已保存。

## 角色菜单列字段

统一前缀 `/api-qianrong/system/role/column`：

| 功能 | 方法与路径 | 参数 |
| --- | --- | --- |
| 分页 | GET /list | roleId、menuId必填，keyword、pageNum、pageSize；返回顶层rows/total |
| 详情 | GET /detail/{id} | 返回data，核验id/roleId/menuId |
| 编辑 | POST /edit | id、roleId、menuId、字段元信息、orderNum、isFilter、policy、maskType、remark |
| 删除 | POST /delete | JSON `{id}`，提交前核验详情归属 |
| 导入 | POST /import | JSON `{roleId,menuId}`，从菜单定义导入，不是上传文件 |
| 一键策略 | POST /mask | JSON `{roleId,menuId,policy,maskType}`，不受当前搜索页限制 |

- 从角色列表和已保存角色表单进入，新增角色须先保存。详情入口只读。
- 菜单目录/按钮不提供配置：菜单树只含id/label/children，不能据此判断类型；从真实菜单列表读取menuType，交集仅保留角色roleSystems.menuIds已授权的C页面，并再读菜单详情核验。
- 策略 HIDDEN/VISIBLE/MASKED；MASKED方式 FULL/KEEP_FIRST_LAST，改成非脱敏策略清空maskType。保留0和int64字符串，拒绝已丢失精度的数字。
- 切换角色/菜单关闭旧编辑框并清空结果；丢弃旧响应，失败可重试，不将缓存当保存成功。

## 三类日志

| 页面 | 当前列表/详情 | 权限前缀 | 清理类别 |
| --- | --- | --- | --- |
| 登录日志 | /monitor/logLogin/list；详情读取当前列表记录 | monitor:logLogin | LOGIN |
| 操作日志 | /monitor/logOper/list；详情读取当前列表记录 | monitor:logOper | OPER |
| 第三方日志 | /monitor/logThirdApi/list、/monitor/logThirdApi/{id} | monitor:logThirdApi | THIRD_API |

路径均带 `/api-qianrong`。旧 logininfor/operlog 服务路径已替换，原页面组件路径保留，避免破坏菜单。登录/操作导出继续同步接口，携带当前筛选；不新增清空、删除、解锁操作。第三方尚无导出接口，不伪造导出任务。

三个页面都用“日志列表 / 留存策略 / 清理记录”。留存由 `/system/config/configKey/{configKey}` 读取：

- `sys.log.archiveMonths`：日志产生到归档的月数。
- `sys.log.cleanMonths`：日志归档后保留月数，不是从产生时间起算。
- 真实响应为 `{code:200,msg:'12'}`，不是data；前端兼容msg/data/configValue，读不到显示待确认并允许重试，不写死12个月，不伪造执行时间或统计数据。
- 清理记录 `/monitor/logCleanupRecord/list`，按logType隔离与分页。显示runTime、archiveMonths、cleanMonths、archivedCount、deletedCount、status、costTime、errorMsg；保留0，未知状态不冒充成功。
- 第三方按实际声明的keyword/interfaceName/initiator/receiver/className/methodName查询；原型近7天、90天限制保留，时间通过既有params.beginTime/endTime传递，具体过滤仍待后端恢复后验收。不发送旧占位direction/result等未声明字段。
- 详情继续局部脱敏密码、令牌、Cookie等内容；不影响真实请求鉴权。

## 开发环境菜单

用户明确授权补缺少菜单。先查重，保留已有登录日志501和操作日志500，仅在日志管理108下新增：第三方日志2465，path=`api-log`，component=`monitor/api-log/index`，perms=`monitor:logThirdApi:list`。新增后菜单回读一致，getRouters已返回该组件。未修改其他角色或系统授权。

## 验证与边界

- 12项持久化Node契约回归、15项角色浏览器场景、17项日志浏览器场景通过，均无运行时异常。角色/三Tab在768/1280/1920宽度无页面横向溢出，并检查截图。
- 生产构建通过，保留原有登录背景资源、CSS `:export`及大包告警；无单独lint/typecheck脚本。现有CodeGraph已同步。
- 真实只读核验：角色列表/详情、角色菜单树、数据范围/部门树、角色字段分页、登录/操作日志、两个留存参数和三类清理记录均返回成功；当前角色字段为空，未用真实数据测试导入/编辑/删除/策略写入。
- 第三方列表和详情均真实返回业务500，数据库缺少`del_flag`列。前端错误及重试已验证，后端修复后再验收真实字段、时间筛选和详情；不把此错误描述为前端已修复。
- 登录用户菜单树在本次令牌下返回空数组；已有授权保留，字段配置可从真实菜单元信息与角色授权交集读取，但新增授权仍需后台提供有效的可选菜单树。
- 飞书链接本轮访问受限，未读取在线原型正文；使用既有原型摘要、用户补充和当前真实Swagger（299路径/243定义）。不宣称完成逐像素在线原型验收。
- 除明确授权新增菜单外，未真实变更角色/字段/日志数据，未部署。

实施及提交记录见 [本次记录](history/2026-10-21-home-role-logs.md)。
