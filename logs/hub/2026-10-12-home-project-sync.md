# 2026-10-12 home 项目同步

按 home 映射核实七个业务仓库的根目录、身份、当前分支、origin 和远端同名分支，先同步统筹 main（ae81f90 → d608c9d），再逐仓执行显式 `git pull --ff-only origin <当前分支>`。

| 项目 | 分支 | 起始提交 | 拉取后提交 | 结果 |
| --- | --- | --- | --- | --- |
| 泰乾超级 | master | 7d3dd63 | 7d3dd63 | 已为最新 |
| 正矿 | feature-v1.8.5 | f152a424 | f152a424 | 已为最新，未设置 upstream |
| 花盆APP | main | d15eef0 | 2f863f3 | 快进成功 |
| 花盆后台 | main | e653396 | db02ba1 | 快进成功 |
| 相册APP | main | 68e4dee | caa6ec2 | 快进成功 |
| 相册后台 | main | 322e960 | 322e960 | 已为最新 |
| 相册小程序 | main | 118ff7e | 118ff7e | 已为最新 |

花盆 APP 的协议 V2.6 与两份机器日志文档、花盆后台的 dist.zip 与 pnpm-lock.yaml，按本轮用户确认暂存指定路径，pull 后恢复；五文件 SHA256 和工作区状态与操作前一致，本轮临时 stash 在核验后移除。泰乾超级未跟踪 pnpm-lock.yaml 按此前授权保留、不提交，SHA256 未变。相册 APP 复查时出现两份用户未跟踪的 iOS 对接文档，未处理或提交。

两个私有挂载项目共十项已有挂载 dry-run 正常。六个已有 CodeGraph 索引同步成功；花盆后台本机没有 .codegraph，按规则未自行初始化。所有业务 HEAD 与拉取后的 origin 同名分支一致；没有切换分支、设置 upstream、安装依赖、构建或调用业务接口。本轮只新增统筹同步留痕，随后继续用户追加的花盆 APP 需求。

## 花盆 APP 追加需求交付

- 五项需求在已同步的 main / 2f863f3 上实现，业务提交 f36be8c06d657b9933aebcb23b09b01ee12a4ba6，提交后再次显式 pull --ff-only origin main 成功并已 push；HEAD 与 origin/main 一致。
- 当前契约、初版边界和L1–L10真机清单在业务 docs/MOWER_MACHINE_LOGS.md；详细实施与验证在 docs/history/2026-10/2026-10-12-mower-feedback-machine-logs.md。具体实现由业务文档维护，统筹只登记状态。
- 253项相关Flutter回归通过。Dart分析无error/无新增诊断，保留state未使用成员warning和区域字段可final的info。扩大检查发现网络探测原用例失败，在2f863f3隔离原始副本同样复现，未改无关代码。四个Python脚本因本机只有WindowsApps别名、缺实际解释器未运行；未称通过。
- 原协议与两份日志材料在推送前按既有授权再次指定路径暂存，pull后恢复并核验SHA256原样一致；未提交，临时stash已移除。记录时间为APP接收时间，云端时间戳、离线补齐、设备本地日志及全局/后台提醒留待联调；未真机、双端安装包构建或平台规则修改。
- 本轮无真实业务接口/POST、依赖升级或部署，统筹记录按main默认提交、再次pull后push。
