# 环境配置目录

各环境的私有映射按目录分开存放，Hub 根目录只保留共享文件。

| 目录 | 含义 | 映射文件 | Git 同步 |
| --- | --- | --- | --- |
| `home/` | 家里电脑 | `home/projects.local.yaml` | 否 |
| `work/` | 公司电脑 | `work/projects.local.yaml` | 否 |
| `ssh/` | SSH 开发机（在服务器内运行 Hub） | `ssh/projects.local.yaml` | 否 |
| — | 脱敏模板 | `projects.local.example.yaml` | 是 |

## 当前环境如何确定

1. Agent 扫描 `environments/*/projects.local.yaml`。每台机器只放自己那一份，因此正常情况下只会命中一个文件，它就是当前环境。
2. 命中多个时不猜测：读取各文件的 `environment` 字段，请用户指明本次使用哪一个。
3. 一个都没有时说明本机尚未配置，不自动创建、clone 或猜测路径。
4. 若根目录还残留旧版 `projects.local.yaml`，说明是旧布局，先迁移到对应环境目录再执行任务。

## 新增环境

复制 `projects.local.example.yaml` 到新目录（例如 `environments/laptop/projects.local.yaml`），填写 `environment` 和该环境实际拥有的项目路径。目录名与 `environment` 字段保持一致，一律使用小写英文，不使用中文；Markdown 文档的文件名可以用中文。只填写本机真实存在的项目；公共注册表的项目数量与本机映射数量可以不同。

映射文件被 `.gitignore` 排除，不随 Git 同步；不要在其中写入密码、私钥或 token，也不要把真实主机信息写进共享文件。
