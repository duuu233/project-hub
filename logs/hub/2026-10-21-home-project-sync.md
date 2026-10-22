# 2026-10-21 home｜全部映射项目同步

## 范围与执行

用户要求根据文档拉取各项目，沿用本会话明确的home。先读注册表、home映射、项目Context和规则，核实目录/Git根目录、仓库身份、当前分支、origin/upstream。统筹main从c42c867快进至d0fe5f1，重读变更的SSH规则与配置说明；home映射不变，不连接SSH服务器。

七业务仓均显式执行git pull --ff-only origin当前分支，未切分支、stash、merge、rebase、设置upstream或推送业务仓。正矿保留feature-v1.8.5和未配置upstream的状态。

## 同步结果

| 项目 | 分支 | 同步前 | 同步后 | 结果 |
| --- | --- | --- | --- | --- |
| 泰乾超级 | master | f21cff3 | af5e215 | 已快进 |
| 正矿 | feature-v1.8.5 | d4163fe | b243be1 | 已快进 |
| 花盆APP | main | db84e71 | 88ecd95 | 已快进 |
| 花盆后台 | main | 7f53d3a | 7f53d3a | 已是最新 |
| 相册APP | main | b311383 | b311383 | 已是最新 |
| 相册后台 | main | 27c1238 | 7ea5e56 | 已快进 |
| 相册小程序 | main | 86a6611 | 86a6611 | 已是最新 |

泰乾超级、正矿、花盆APP、相册后台四仓快进，其余三仓已最新。最终逐仓ls-remote确认HEAD与远端同名分支一致，工作区全部干净。

## 花盆APP原未跟踪文件

预检发现docs/last_epoch_build_loot_filter_guide (1).md未跟踪，按规则先停该仓并询问；用户回复“已经删除了”。复核文件不存在且工作区干净后才拉取，删除由用户完成，Agent未删除、stash或提交该文件。

## 验证与边界

六个已有CodeGraph索引全部sync成功，花盆后台无.codegraph，按规则跳过、不初始化。复核花盆APP及相册后台更新的上下文和文档索引。仅同步，不安装依赖、不运行测试/构建、不改业务文件；不把远端既有验证当本轮测试。

统筹只追加本记录、当前迭代与两类流水，保留旧任务和全部环境映射。提交后再次显式pull --ff-only origin main并push origin main。
