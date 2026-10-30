# qianrong 当前接口字段对照（2026-10-15 work）

## 2026-10-22 用户组菜单恢复（优先于旧迁移结论）

用户明确系统→用户组→角色逐层过滤。用户组恢复菜单界面并发送groupsSystemMenuDTOList[{systemId,menuList}]，上限来自所选系统已授权菜单；角色仅使用用户组可选树。新增/编辑/撤权确认与异常阻断已实现，详细规则、验证和未真实联调范围见 [菜单继承说明](qianrong-group-menu-inheritance.md)。下表“用户组只关联系统”是旧轮裁决，不再适用。

## 2026-10-21 角色与日志更新（优先于旧相关结论）

最新Swagger为299路径/243定义。角色已纳入开发，SysRoleAddOrUpdateDTO/roleSystems及六个角色字段接口已对接；日志路径为logLogin/logOper/logThirdApi，留存读取sys.log.archiveMonths/sys.log.cleanMonths，清理按LOGIN/OPER/THIRD_API。真实scopeList为key/value，configKey为msg月数。第三方菜单已按授权注册，真实第三方接口受数据库del_flag缺失阻塞。完整字段裁决、验证与未联调范围见 [当前角色与日志说明](qianrong-role-logs.md)。下文角色排除、日志未开放及不push只对应当时历史迭代。

## 2026-10-19 企业契约核对（优先于旧企业结论）

最新Swagger的企业新增和编辑已改为顶层`userGroupIds: array[integer/int64]`，编辑不传保留、不允许空列表；新增`bankList`（编辑不传保留、空列表清除）及`legalIdType`。原`sysOrgGroups`已不在模型中。首次核对b3c1c73仍为旧实现，用户随后授权修复：已改多选、兼容新旧回填、未改省略/清空保护及证件类型；银行未新增CRUD，省略bankList保护原信息。详细证据、实现和验证见[qianrong-enterprise-contract-audit.md](qianrong-enterprise-contract-audit.md)及[同日记录](history/2026-10-19-work-enterprise-group-contract.md)。其它模块未在本次重新全量核对，真实业务未联调。

## 2026-10-16 菜单列字段追加口径

本轮重新读取Swagger，七接口契约未变；当前使用独立页替代菜单行抽屉入口。用户明确C页面菜单不依赖isList显示列字段设置，M/F/B不显示，后台isList不批量修改。真实菜单详情作为上下文，保留query menuId，当前页面拒绝目录/按钮和无权限访问。路由已按授权在dev新增，真实字段写入仍由用户自测；本轮不push。详见[10/16记录](history/2026-10-16-work-menu-columns.md)。以下10/15字段矩阵继续适用。

用户最终口径：原型与接口结合核对，冲突按当前Swagger；接口是本轮可实现上限。角色S05排除；本轮仅本地交付，不push。

## 已实施与预留裁决

| 范围 | 当前契约与本轮处理 | 未声明部分 |
| --- | --- | --- |
| 菜单列字段 | 7接口；menuId/id使用真实编号；fieldName/fieldCode/orderNum映射；保留策略、筛选项和0值 | 不猜生成器className |
| 菜单 | isList数字0/1；保留M/C/F并兼容按钮B；查询使用menuName/menuType/status；按钮不能新增下级或设为列表（2026-10-30 起两项均已放开：所有行可新增，按钮可设为列表） | 不按原型重编码历史类型 |
| 系统 | menuIds、status、systemName；系统编辑DTO已声明status，表单变更二次确认后经现有update保存；菜单移除确认 | 无精确关联影响查询，不伪造用户组数量；不猜独立状态端点 |
| 用户组 | 名称、类别、关联系统及每系统menuList；上限为系统已授权菜单，按10-22口径回填与保存；查询仍用既有分页 | 不把全部菜单目录当授权上限；后台级联撤权及有效权限仍待真实联调 |
| 部门 | deptName最多30字（原型50字不采用）；leader可选字符串；parentId=0一级；完整list树按一级20条分页、下级跟随；status经现有PUT字段更新 | 无负责人账户ID/新version，不能伪造负责人有效性校验或乐观锁；企业边界仍由服务端强制 |
| 字典 | dictId/dictCode由后台生成且只读；dictType/dictValue保留既有业务键，编辑不改；dictLabel表示显示名称；状态变更确认 | 不生成DICT_TYPE/DICT_ITEM新编号；无version/引用查询，显示原后台失败原因 |
| 企业 | 10/19已改userGroupIds多选、回填/编辑保护及legalIdType；工商/实控人/附件和字典口径保留 | bankList尚无新CRUD界面，未编辑省略保护原账户；隔离/构建通过，不声称真实联调 |
| 账号 | userId只读、roleIds/deptId可选；创建不手输密码，编辑不发送password；旧userType原值保留 | 无accountType/accountNo四值契约，不猜映射；后端未完成 |
| 操作/登录日志 | 保留已声明列表字段及同步导出路径，导出带当前筛选；移除手动清空/删除/解锁；只读详情；日志局部增加敏感内容遮蔽 | 留存仅规则说明，清理记录暂未开放；无异步导出任务端点，不伪造任务成功 |
| 接口日志 | 新组件通过可注入适配器预留列表/详情/导出，默认近7天、≤90天；仅后端→外部/外部→后端；默认不请求未知后台 | 无专用Swagger端点，不注册正式菜单、不凭空构造HTTP；可通过本地隔离装配检查 |
| 登录 | 核对LoginBody及既有store，仍走企业/角色登录和原SSO/Token；code字段存在但当前文档无/code图形验证码来源 | 无公开启用系统入口契约，不将鉴权后的system/list用于登录前选系统；不改造认证机制 |

## 新增/编辑DTO字段清单

下表为本轮读取的真实Swagger结构；审计/删除/认证流程等服务端字段只读或保留原机制，不表示全部都是可编辑表单项。

### 菜单：SysMenuDTO
`POST /api-qianrong/system/menu`

| 字段 | 类型 | 必填声明 | 约束/含义 |
| --- | --- | --- | --- |
| children | array[SysMenu] | 否/未声明 |  |
| component | string | 否/未声明 | maxLength=200；minLength=0 |
| createBy | string | 否/未声明 | 创建者 |
| createTime | string | 否/未声明 | 创建时间 |
| delFlag | string | 否/未声明 | 删除标志（0代表存在 2代表删除） |
| icon | string | 否/未声明 |  |
| isCache | string | 否/未声明 |  |
| isFrame | string | 否/未声明 |  |
| isList | integer | 否/未声明 | 是否为列表菜单（0否 1是）；minimum=0；maximum=1；enum=[0, 1] |
| menuId | integer | 否/未声明 |  |
| menuName | string | 是 | maxLength=50；minLength=0 |
| menuType | string | 是 |  |
| orderNum | integer | 是 |  |
| params | object | 否/未声明 | 请求参数 |
| parentId | integer | 否/未声明 |  |
| parentName | string | 否/未声明 |  |
| path | string | 否/未声明 | maxLength=200；minLength=0 |
| perms | string | 否/未声明 | maxLength=100；minLength=0 |
| query | string | 否/未声明 |  |
| refApiPerms | array[string] | 否/未声明 |  |
| remark | string | 否/未声明 | 备注 |
| routeName | string | 否/未声明 |  |
| status | string | 否/未声明 |  |
| updateBy | string | 否/未声明 | 更新者 |
| updateTime | string | 否/未声明 | 更新时间 |
| visible | string | 否/未声明 |  |

### 系统：系统新增、编辑参数
`POST /api-qianrong/system/add`

| 字段 | 类型 | 必填声明 | 约束/含义 |
| --- | --- | --- | --- |
| createBy | string | 否/未声明 | 创建者 |
| createTime | string | 否/未声明 | 创建时间 |
| delFlag | string | 否/未声明 | 删除标志（0代表存在 2代表删除） |
| id | integer | 否/未声明 | 系统主键id |
| menuIds | array[integer] | 否/未声明 | 菜单ID列表 |
| params | object | 否/未声明 | 请求参数 |
| remark | string | 否/未声明 | 备注 |
| status | string | 否/未声明 | 系统状态（0正常 1停用） |
| systemLogo | string | 否/未声明 | 系统logo |
| systemName | string | 否/未声明 | 系统名称；maxLength=100；minLength=1 |
| updateBy | string | 否/未声明 | 更新者 |
| updateTime | string | 否/未声明 | 更新时间 |

### 用户组：SysUserGroupsDTO
`POST /api-qianrong/user/groups/add`

| 字段 | 类型 | 必填声明 | 约束/含义 |
| --- | --- | --- | --- |
| createBy | string | 否/未声明 | 创建者 |
| createTime | string | 否/未声明 | 创建时间 |
| delFlag | string | 否/未声明 | 删除标志（0代表存在 2代表删除） |
| groupsSystemMenuDTOList | array[SysUserGroupsSystemMenuDTO] | 否/未声明 | 用户组-系统-菜单列表 |
| id | integer | 否/未声明 | 用户组主键id |
| params | object | 否/未声明 | 请求参数 |
| remark | string | 否/未声明 | 备注 |
| status | string | 否/未声明 | 用户组状态（0正常 1停用） |
| updateBy | string | 否/未声明 | 更新者 |
| updateTime | string | 否/未声明 | 更新时间 |
| userGroupsCode | string | 否/未声明 | 用户组id |
| userGroupsName | string | 否/未声明 | 用户组名称 |
| userGroupsType | integer | 否/未声明 | 用户组类型(参考字典-user_groups_type) |

### 部门：SysDept
`POST /api-qianrong/system/dept`

| 字段 | 类型 | 必填声明 | 约束/含义 |
| --- | --- | --- | --- |
| ancestors | string | 否/未声明 |  |
| children | array[SysDept] | 否/未声明 |  |
| createBy | string | 否/未声明 | 创建者 |
| createTime | string | 否/未声明 | 创建时间 |
| delFlag | string | 否/未声明 | 删除标志（0代表存在 2代表删除） |
| deptId | integer | 否/未声明 |  |
| deptName | string | 是 | maxLength=30；minLength=0 |
| email | string | 否/未声明 | maxLength=50；minLength=0 |
| leader | string | 否/未声明 |  |
| orderNum | integer | 是 |  |
| orgId | integer | 否/未声明 |  |
| params | object | 否/未声明 | 请求参数 |
| parentId | integer | 否/未声明 |  |
| parentName | string | 否/未声明 |  |
| phone | string | 否/未声明 | maxLength=11；minLength=0 |
| remark | string | 否/未声明 | 备注 |
| status | string | 否/未声明 |  |
| updateBy | string | 否/未声明 | 更新者 |
| updateTime | string | 否/未声明 | 更新时间 |

### 字典类型：SysDictType
`POST /api-qianrong/system/dict/type`

| 字段 | 类型 | 必填声明 | 约束/含义 |
| --- | --- | --- | --- |
| createBy | string | 否/未声明 | 创建者 |
| createTime | string | 否/未声明 | 创建时间 |
| delFlag | string | 否/未声明 | 删除标志（0代表存在 2代表删除） |
| dictId | integer | 否/未声明 |  |
| dictName | string | 是 | maxLength=100；minLength=0 |
| dictType | string | 是 | maxLength=100；minLength=0；pattern=^[a-z][a-z0-9_]*$ |
| params | object | 否/未声明 | 请求参数 |
| remark | string | 否/未声明 | 备注 |
| status | string | 否/未声明 |  |
| updateBy | string | 否/未声明 | 更新者 |
| updateTime | string | 否/未声明 | 更新时间 |

### 字典项：SysDictData
`POST /api-qianrong/system/dict/data`

| 字段 | 类型 | 必填声明 | 约束/含义 |
| --- | --- | --- | --- |
| createBy | string | 否/未声明 | 创建者 |
| createTime | string | 否/未声明 | 创建时间 |
| cssClass | string | 否/未声明 | maxLength=100；minLength=0 |
| delFlag | string | 否/未声明 | 删除标志（0代表存在 2代表删除） |
| dictCode | integer | 否/未声明 |  |
| dictLabel | string | 是 | maxLength=100；minLength=0 |
| dictSort | integer | 否/未声明 |  |
| dictType | string | 是 | maxLength=100；minLength=0 |
| dictValue | string | 是 | maxLength=100；minLength=0 |
| isDefault | string | 否/未声明 |  |
| listClass | string | 否/未声明 |  |
| params | object | 否/未声明 | 请求参数 |
| remark | string | 否/未声明 | 备注 |
| status | string | 否/未声明 |  |
| updateBy | string | 否/未声明 | 更新者 |
| updateTime | string | 否/未声明 | 更新时间 |

### 企业：企业信息基础表
`POST /api-qianrong/system/org/insert`

同时适用于`POST /api-qianrong/system/org/update`；本节按2026-10-19最新JSON更新，前端本轮对齐范围和保留边界见顶部说明。

| 字段 | 类型 | 必填声明 | 约束/含义 |
| --- | --- | --- | --- |
| actualControllerIdNumber | string | 否/未声明 | 实控人身份证号 |
| actualControllerName | string | 否/未声明 | 实控人姓名 |
| actualControllerPhone | string | 否/未声明 | 实控人联系电话 |
| address | string | 否/未声明 | 详细地址 |
| areaCode | string | 否/未声明 | 地区code |
| areaFullName | string | 否/未声明 | 地区全称（省市区） |
| bankList | array[SysOrgBank对象] | 否/未声明 | 编辑不传保留，空列表清除 |
| bankType | integer | 否/未声明 |  |
| businessLicenseUrl | array[文件信息] | 否/未声明 | 营业执照 |
| businessScope | string | 否/未声明 | 经营范围 |
| cityCode | string | 否/未声明 | 城市code |
| createBy | string | 否/未声明 | 创建者 |
| createTime | string | 否/未声明 | 创建时间 |
| currencyCode | string | 否/未声明 | 币种编码 |
| currencyName | string | 否/未声明 | 币种名称 |
| delFlag | string | 否/未声明 | 删除标志（0代表存在 2代表删除） |
| esignAuthFlowId | string | 否/未声明 | 认证流程id |
| esignAuthStatus | integer | 否/未声明 | 认证状态: 0未认证，1已认证 |
| establishmentDate | string | 否/未声明 | 成立日期 |
| id | integer | 否/未声明 | 企业id |
| legalCardBackFile | array[文件信息] | 否/未声明 | 法人身份证反面 |
| legalCardFrontFile | array[文件信息] | 否/未声明 | 法人身份证正面 |
| legalIdNumber | string | 否/未声明 | 法人身份证 |
| legalIdType | integer | 否/未声明 | 法人证件类型：0身份证、1护照、2港澳通行证 |
| legalName | string | 否/未声明 | 法人姓名 |
| legalPhone | string | 否/未声明 | 法人联系电话 |
| orgAdminName | string | 否/未声明 | 企业管理员 |
| orgAdminPhone | string | 否/未声明 | 企业管理员联系电话 |
| orgCode | string | 否/未声明 | 企业编码/客户号 |
| orgName | string | 否/未声明 | 企业名称 |
| orgSimpleName | string | 否/未声明 | 企业简称 |
| orgType | integer | 否/未声明 | 企业类型：参考字典org_type |
| params | object | 否/未声明 | 请求参数 |
| projectId | integer | 否/未声明 | 项目id |
| projectName | string | 否/未声明 | 项目名称 |
| provinceCode | string | 否/未声明 | 省份code |
| registeredCapital | number | 否/未声明 | 注册资本(万) |
| registrationStatus | integer | 否/未声明 | 登记状态：参考字典regist_status |
| remark | string | 否/未声明 | 备注 |
| socialCreditCode | string | 否/未声明 | 社会信用代码 |
| status | string | 否/未声明 | 状态（0正常 1停用） |
| userGroupIds | array[integer/int64] | 业务校验至少一个 | 编辑不传保留，不允许空列表；不再使用sysOrgGroups |
| tenantId | integer | 否/未声明 | 租户id |
| updateBy | string | 否/未声明 | 更新者 |
| updateTime | string | 否/未声明 | 更新时间 |

### 账号：SysUser
`POST /api-qianrong/system/user`

| 字段 | 类型 | 必填声明 | 约束/含义 |
| --- | --- | --- | --- |
| areaIds | string | 否/未声明 |  |
| areaNames | string | 否/未声明 |  |
| avatar | string | 否/未声明 |  |
| bankIds | array[integer] | 否/未声明 |  |
| createBy | string | 否/未声明 | 创建者 |
| createTime | string | 否/未声明 | 创建时间 |
| delFlag | string | 否/未声明 | 删除标志（0代表存在 2代表删除） |
| dept | SysDept | 否/未声明 |  |
| deptId | integer | 否/未声明 |  |
| email | string | 否/未声明 |  |
| loginDate | string | 否/未声明 |  |
| loginIp | string | 否/未声明 |  |
| nickName | string | 否/未声明 |  |
| orgId | integer | 否/未声明 |  |
| params | object | 否/未声明 | 请求参数 |
| password | string | 否/未声明 |  |
| phonenumber | string | 否/未声明 |  |
| postIds | array[integer] | 否/未声明 |  |
| productIds | array[integer] | 否/未声明 |  |
| regulatoryIds | array[integer] | 否/未声明 |  |
| remark | string | 否/未声明 | 备注 |
| roleId | integer | 否/未声明 |  |
| roleIds | array[integer] | 否/未声明 |  |
| roles | array[SysRole] | 否/未声明 |  |
| sex | string | 否/未声明 |  |
| status | string | 否/未声明 |  |
| tenantIds | array[integer] | 否/未声明 |  |
| updateBy | string | 否/未声明 | 更新者 |
| updateTime | string | 否/未声明 | 更新时间 |
| userId | integer | 否/未声明 |  |
| userName | string | 否/未声明 |  |
| userType | string | 否/未声明 |  |
