# Project Hub 私有目录管理方案

## 目标

在部分团队协作项目中，我有一些个人使用的文件或目录，例如：

```text
.codegraph/
personal-notes/
experiments/
.ai/
```

这些内容需要：

1. 在项目目录中正常出现，供编辑器、AI Agent、CLI 工具读取。
2. 不提交到团队 Git 仓库。
3. 团队成员 clone 项目后看不到这些私人文件/目录。
4. 私人内容需要通过我自己的 Private Git 仓库同步。
5. 公司电脑、家里电脑、SSH 开发机都可以使用。
6. 不同电脑上的业务项目绝对路径可能不同。
7. 新电脑初始化时尽可能一条命令恢复私人目录。
8. 项目从 Project Hub detach 后，不影响原业务项目。

---

# 核心方案

采用：

> Private Project Hub + Symbolic Link（symlink）

原则：

> 私人文件真实存储在 `project-hub`，业务项目中只创建本地 symlink。

不要把私人文件真实存储在团队项目中。

例如：

```text
project-hub/
└── private/
    └── project-a/
        ├── .codegraph/
        ├── personal-notes/
        └── experiments/
```

业务项目本机看到：

```text
project-a/
├── src/
├── package.json
│
├── .codegraph       -> project-hub/private/project-a/.codegraph
├── personal-notes   -> project-hub/private/project-a/personal-notes
└── experiments      -> project-hub/private/project-a/experiments
```

这些 symlink 仅存在于我自己的电脑。

不要提交 symlink 到团队 Git 仓库。

---

# Git 管理关系

存在两个完全独立的 Git Repository。

## 团队 Repository

例如：

```text
project-a/
```

负责：

```text
src/
package.json
docs/
...
```

不负责我的私人内容。

私人目录必须被团队 Git 忽略。

例如：

```gitignore
.codegraph/
personal-notes/
experiments/
.ai/
```

如果不能或者不希望修改团队 `.gitignore`，可以优先考虑使用：

```text
.git/info/exclude
```

进行仅当前 clone 生效的本地忽略。

这是私人目录场景下更优先考虑的方式，因为不会修改团队共享的 `.gitignore`。

例如：

```gitignore
# Personal Project Hub
.codegraph/
personal-notes/
experiments/
.ai/
```

---

# 私人 Repository

`project-hub` 本身是我的 Private Git Repository。

真实私人内容：

```text
project-hub/
└── private/
    ├── project-a/
    │   ├── .codegraph/
    │   ├── personal-notes/
    │   └── experiments/
    │
    ├── project-b/
    │   └── .codegraph/
    │
    └── project-c/
        ├── .ai/
        └── notes/
```

这些文件正常由 `project-hub` Git 管理：

```bash
git add .
git commit
git push
```

从而同步到：

- 公司电脑
- 家里电脑
- SSH 开发服务器

前提是这些机器拥有访问 Private Repository 的权限。

---

# 项目配置

Project Hub 应支持为每个项目配置私人挂载目录。

例如：

```yaml
projects:
  project-a:
    name: Project A

    private_mounts:
      - .codegraph
      - personal-notes
      - experiments

  project-b:
    name: Project B

    private_mounts:
      - .codegraph
```

这里不要记录机器相关的绝对路径。

---

# 本机路径配置

继续使用：

```text
projects.local.yaml
```

该文件：

- 不提交 Git
- 每台电脑单独维护

例如公司电脑：

```yaml
paths:
  project-a: /Users/me/company/project-a
  project-b: /Users/me/company/project-b
```

家里电脑：

```yaml
paths:
  project-a: /Users/me/Code/project-a
  project-b: /Users/me/Code/project-b
```

SSH：

```yaml
paths:
  project-a: /home/me/projects/project-a
  project-b: /home/me/projects/project-b
```

---

# Symlink 工作方式

假设：

```text
project-hub:
~/project-hub

业务项目:
~/work/project-a
```

真实私人目录：

```text
~/project-hub/private/project-a/.codegraph
```

在业务项目中创建：

```bash
ln -s ~/project-hub/private/project-a/.codegraph ~/work/project-a/.codegraph
```

最终：

```text
~/work/project-a/.codegraph
        ↓
        ↓ symlink
        ↓
~/project-hub/private/project-a/.codegraph
```

对于程序来说，仍然可以正常访问：

```text
project-a/.codegraph/xxx
```

但是实际文件由 `project-hub` 保存和 Git 管理。

---

# 自动化脚本

请在 Project Hub 中实现一个简单的 setup/mount 脚本。

例如：

```bash
./scripts/setup-links.sh
```

或者如果当前项目已有更合适的 CLI/脚本结构，则遵循现有结构。

脚本应该：

1. 读取 `projects.yaml`
2. 读取 `projects.local.yaml`
3. 找到每个项目的本机路径
4. 读取项目的 `private_mounts`
5. 检查 `project-hub/private/<project-id>/`
6. 自动创建缺少的私人目录
7. 在业务项目根目录创建 symlink
8. 检查对应路径是否已经被 Git 忽略
9. 优先使用 `.git/info/exclude` 添加本机 ignore 规则
10. 不要无必要修改团队共享 `.gitignore`
11. 已经存在正确 symlink 时跳过
12. 不重复创建
13. 输出清晰的执行结果

例如：

```text
project-a
  ✓ .codegraph mounted
  ✓ personal-notes mounted
  ✓ experiments mounted

project-b
  ✓ .codegraph mounted
```

---

# 安全处理

脚本不能粗暴覆盖已有文件。

例如发现：

```text
project-a/.codegraph
```

已经是真实目录，而不是 symlink：

不要删除。

不要覆盖。

应该停止该项操作并提示：

```text
WARNING:
project-a/.codegraph already exists and is not a symlink.

Please migrate it to:
project-hub/private/project-a/.codegraph
```

同样，如果 symlink 已存在但指向错误位置，也不要静默覆盖，需要明确提示。

目标是：

> 自动化可以重复执行，但不能因为自动化导致私人数据丢失。

---

# Detach

Project Hub 需要支持项目解绑。

Detach 的含义是：

> Project Hub 不再管理这个项目。

如果实现 detach 脚本，它可以删除 Project Hub 创建的 symlink，但：

绝对不能：

- 删除业务项目源码
- 删除 Project Hub 中的私人真实文件
- 删除私人 Git 历史
- 删除团队 Repository
- 删除 symlink 指向的真实目录

例如：

```text
project-a/.codegraph
```

只是 symlink。

Detach 可以删除这个 link。

但是：

```text
project-hub/private/project-a/.codegraph
```

必须保留。

---

# 新电脑恢复流程

理想使用方式：

```text
1. clone project-hub
2. clone 需要开发的业务项目
3. 创建 projects.local.yaml
4. 填写这台电脑的业务项目路径
5. 执行 setup-links
```

例如：

```bash
./scripts/setup-links.sh
```

然后自动恢复：

```text
project-a/.codegraph
project-a/personal-notes
project-a/experiments
project-b/.codegraph
...
```

不需要手工一个个创建软链接。

---

# Git 状态要求

执行完成后：

在团队项目中：

```bash
git status
```

不应该出现：

```text
.codegraph
personal-notes
experiments
```

这些内容不应该进入团队 Git。

但是在：

```bash
cd project-hub
git status
```

私人目录中的修改应该正常出现，从而可以：

```bash
git add .
git commit
git push
```

同步私人内容。

---

# 跨平台

我的主要环境可能包括：

- macOS
- Linux
- SSH Linux
- Windows

macOS / Linux 优先使用标准 symlink：

```bash
ln -s source target
```

如果实现脚本时需要考虑 Windows：

请检测操作系统并采用合理方式创建目录链接。

不要为了 Windows 兼容性引入重量级依赖。

如果 Windows symlink 存在权限或 Developer Mode 限制，请给出清晰提示，而不是静默失败。

---

# 与现有 Project Hub 集成

不要重新设计整个 Project Hub。

请先检查当前仓库已有：

```text
AGENTS.md
projects.yaml
projects.local.yaml
projects.local.example.yaml
context/
iterations/
scripts/
```

然后在现有设计基础上增加：

```text
private/
```

以及私人目录挂载能力。

建议最终结构：

```text
project-hub/
├── README.md
├── AGENTS.md
├── projects.yaml
├── projects.local.yaml
├── projects.local.example.yaml
├── .gitignore
│
├── context/
│
├── iterations/
│
├── private/
│   ├── project-a/
│   ├── project-b/
│   └── ...
│
└── scripts/
    ├── setup-links.sh
    └── ...
```

---

# 最重要的原则

整个实现必须遵守：

```text
团队代码
    ↓
团队 Repository

个人私人内容
    ↓
Private project-hub Repository

业务项目中的私人目录
    ↓
仅为本机 symlink
```

即：

> 私人文件“住”在 Project Hub，但通过 symlink “出现在”业务项目里。

团队成员 clone 业务项目时，不应该获得这些私人文件、目录或内容。

Project Hub detach 某个项目时，也不能影响原业务项目及 Project Hub 中已经保存的私人数据。

---

# 本次执行任务

请先阅读当前 Project Hub 的已有结构和配置，然后基于上述方案进行修改。

不要覆盖已有设计。

完成后请：

1. 告诉我修改/新增了哪些文件。
2. 解释 `private_mounts` 如何配置。
3. 告诉我如何把一个已有私人目录迁移到 Project Hub。
4. 告诉我如何执行 symlink 初始化。
5. 验证团队项目 `git status` 不会出现私人目录。
6. 验证 Project Hub 可以正常 Git 管理私人目录。
7. 给出公司电脑 → 家里电脑 / SSH 的完整恢复流程。
8. 如果发现当前 Project Hub 的设计与本方案存在冲突，先说明冲突，再采用最简单、安全的方案调整。