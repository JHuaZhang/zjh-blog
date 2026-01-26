---
group:
  title: github流水线
  order: 3
order: 1
title: GitHub Action语法规则详解
nav:
  title: CICD
  order: 7
---


## 1、介绍
GitHub Actions 是 GitHub 官方提供的 持续集成与持续交付（CI/CD）平台，允许你在代码仓库中自动化软件开发工作流。可以在代码推送、拉取请求、发布版本等事件发生时，自动执行测试、构建、部署、通知等任务。

**典型应用场景：**

| 场景 | 说明 |
| --- | --- |
| 自动化测试 | 每次 PR 自动跑单元测试、集成测试，防止引入 bug。 |
| 构建与打包 | 编译代码、生成 Docker 镜像、打包前端资源。 |
| 自动部署 | 合并到main分支后自动部署到服务器、云平台（如 Vercel、AWS、Heroku）。 |
| 发布版本 | 打 tag 时自动生成 Release 并上传构建产物（如 .zip、.exe）。 |
| 代码质量检查 | 自动运行 ESLint、Prettier、SonarQube 等。 |
| 定时任务 | 每天凌晨清理日志、同步数据、发送报告（通过 schedule事件）。 |
| 多平台兼容性测试 | 使用 矩阵策略（Matrix） 同时在 Windows、macOS、Linux 上测试。 |


**核心组成部分：**

| 组件 | 说明 |
| --- | --- |
| Workflow（工作流） | 一个.yml配置文件，定义了何时、如何运行自动化任务。存放在.github/workflows/目录下。 |
| Event（事件） | 触发工作流的条件，如push、pull_request、schedule（定时）、workflow_dispatch（手动）等。 |
| Job（任务） | 工作流中的一个独立执行单元，可并行或按依赖顺序运行。每个 Job 在独立的虚拟机（Runner）中运行。 |
| Step（步骤） | Job 中的一个操作，可以是运行 shell 命令（run）或调用可复用的 Action。 |
| Action（动作） | 可重用的代码单元（类似“插件”），可以是脚本、Docker 容器或 JavaScript。官方和社区提供了大量 Action（如 checkout 、setup-node）。 |
| Runner（运行器） | 执行 Job 的机器。GitHub 提供免费的托管 Runner（Ubuntu、Windows、macOS），也支持自建 Runner。 |


## 2、工作流文件结构（YAML）
所有工作流文件必须放在项目根目录下的：

```plain
.github/
└── workflows/
    └── ci.yml        ← 你的自动化脚本
```

一个标准的 workflow 文件结构如下：

```yaml
# 工作流名称（可选，显示在 GitHub UI 中）
name: My CI/CD Pipeline

# 触发条件（必填）
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

# 权限控制（推荐设置）
permissions:
  contents: read
  pull-requests: write

# 环境变量（全局）
env:
  NODE_VERSION: 18

# 所有任务（Job）定义
jobs:
  # Job ID（自定义，必须唯一）
  build-and-test:
    # 运行环境（必填）
    runs-on: ubuntu-latest

    # Job 级别环境变量
    env:
      CI: true

    # 步骤列表
    steps:
      # 步骤 1：检出代码
      - name: Checkout repository
        uses: actions/checkout@v4  # 使用官方 Action

      # 步骤 2：运行 shell 命令
      - name: Run a script
        run: |
          echo "Hello from ${{ github.actor }}"
          node --version

      # 步骤 3：带参数的 Action
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          registry-url: 'https://registry.npmjs.org'

  # 另一个 Job（可并行或依赖前一个）
  deploy:
    needs: build-and-test  # 依赖 build-and-test 成功
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        run: ./deploy.sh
        env:
          API_KEY: ${{ secrets.PROD_API_KEY }}  # 从 Secrets 读取

```

## 3、关键字段详解
### 3.1、name（可选）
+ 作用：为工作流指定一个名称，在 GitHub UI 中显示。
+ 类型：字符串。

```yaml
name: CI Build and Test
```

如果省略，GitHub 会使用文件名作为名称（如 ci.yml → 显示为 "ci"）。

### 3.2、on：触发事件（必填）
+ 作用：定义触发工作流的事件。
+ 类型：字符串、对象或数组。

```yaml
# 单一事件
on: push

# 多事件（OR 关系）
on: [push, pull_request]

# 带过滤条件的事件
on:
  push:
    branches: [main, 'release/**']
    tags: ['v*']
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1'  # 每周一凌晨 2 点 UTC
  workflow_dispatch:      # 允许手动触发（UI 上有“Run workflow”按钮）
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'
        type: choice
        options: [staging, production]
```

支持的事件列表：[Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)。

### 3.3、permissions（可选）
+ 作用：控制工作流中 GITHUB_TOKEN 的权限（安全最佳实践）。
+ 类型：对象。

```yaml
permissions:
  contents: read        # 读取代码
  pull-requests: write  # 可创建/评论 PR
  issues: write
  packages: read
  # 或全局设置
  # contents: write
```

默认权限较高（尤其在私有仓库），建议显式限制以降低风险。

### 3.4、env（可选）
+ 作用：定义全局环境变量，所有 Job 和 Step 都可访问。
+ 类型：键值对。

```yaml
env:
  NODE_VERSION: 18
  CI: true
```

注意：Job 或 Step 中定义的 env 会覆盖全局 env。

### 3.5、concurrency（可选）
+ 作用：控制工作流并发执行策略（常用于避免重复部署）。
+ 类型：字符串或对象。

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true  # 如果新运行开始，取消正在运行的同组任务
```

典型用途：确保同一分支不会同时部署两次。

### 3.6、jobs（必填）
每个 Job 是独立运行的单元。

#### 3.6.1、runs-on（必填）
+ 作用：指定运行该 Job 的 Runner 类型。
+ 类型：字符串或数组（用于自托管标签）。

```yaml
runs-on: ubuntu-latest
# 或
runs-on: [self-hosted, linux, x64]
```

官方托管 Runner：

+ ubuntu-latest（Linux）。
+ windows-latest。
+ macos-latest。

#### 3.6.2、needs（可选）
+ 作用：定义 Job 之间的依赖关系（顺序执行）。
+ 类型：字符串或字符串数组。

```yaml
jobs:
  build:
    # ...
  test:
    needs: build
  deploy:
    needs: [build, test]  # 必须等 build 和 test 都成功
```

成功条件：所有依赖 Job 必须成功（除非使用 if: always()）。

#### 3.6.3、strategy（可选）
+ 作用：定义矩阵构建（Matrix） 或失败策略。
+ 类型：对象。

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node: [16, 18]
  fail-fast: false  # 一个失败不影响其他并行任务
```

→ 会生成 2 × 2 = 4 个并行 Job。

如下自定义包含/排除：

```yaml
matrix:
  python-version: [3.8, 3.9, "3.10"]
  exclude:
    - python-version: 3.8
      os: windows-latest
  include:
    - python-version: "3.11"
      experimental: true
```

```yaml
python-version: [3.8, 3.9, "3.10"]
```

这表示：python-version 这个维度有 3 个值。

但矩阵需要至少两个维度才能形成组合。通常还会有一个 os 维度，比如：

```yaml
os: [ubuntu-latest, windows-latest]
```

那么默认会生成 3 × 2 = 6 个 Job，组合如下：

| os | python-version |
| --- | --- |
| ubuntu-latest | 3.8 |
| ubuntu-latest | 3.9 |
| ubuntu-latest | 3.10 |
| windows-latest | 3.8 |
| windows-latest | 3.9 |
| windows-latest | 3.10 |


exclude：排除某些组合 ❌

```yaml
exclude:
  - python-version: 3.8
    os: windows-latest
```

	作用：从上述 6 个组合中，移除 python=3.8 + os=windows 这一项。

include：额外添加自定义组合 ➕

```yaml
include:
  - python-version: "3.11"
    experimental: true
```

作用：手动添加一个不在原始矩阵中的新组合。

#### 3.6.4、env（可选）
+ 作用：Job 级别的环境变量（优先级高于全局 env）。

```yaml
env:
  DATABASE_URL: postgres://...
```

#### 3.6.5、outputs（可选）
+ 作用：定义 Job 的输出，供后续 Job 使用。
+ 必须配合 steps 中的 ::set-output 或新版 id + outputs。

```yaml
jobs:
  get-version:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.getver.outputs.version }}
    steps:
      - id: getver
        run: echo "version=1.2.3" >> $GITHUB_OUTPUT

  deploy:
    needs: get-version
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying ${{ needs.get-version.outputs.version }}"
```

注意：GitHub 已弃用 set-output，推荐使用 $GITHUB_OUTPUT（见上例）。

#### 3.6.6、if（可选）
+ 作用：条件判断是否运行该 Job。
+ 类型：表达式。

```yaml
if: github.ref == 'refs/heads/main'
```

#### 3.6.7、timeout-minutes（可选）
+ 作用：设置 Job 超时时间（默认 360 分钟）。
+ 类型：整数。

```yaml
timeout-minutes: 10
```

#### 3.6.8、steps
每个 Step 是 Job 中的一个操作。其也有如下的字段。

##### 3.6.8.1、name（可选）
+ 作用：Step 的显示名称（UI 中可见）。
+ 类型：字符串。

```yaml
- name: Install dependencies
```

##### 3.6.8.2、uses（二选一：uses 或 run）
+ 作用：调用一个 Action（可复用单元）。
+ 格式：
    - owner/repo@ref（如 actions/checkout@v4）。
    - ./path/to/action（本地 Action）。
    - docker://image:tag。

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 18
```

##### 3.6.8.3、run（二选一：uses 或 run）
+ 作用：在 Runner 上执行 shell 命令。
+ 类型：字符串或多行字符串。

```yaml
- run: npm install
- run: |
    echo "Building..."
    npm run build
```

 默认 shell：

+ Linux/macOS: bash。
+ Windows: pwsh（PowerShell Core）。

可通过 shell 字段指定：

```yaml
- run: echo $env:PATH
  shell: pwsh
```

##### 3.6.8.4、with（可选）
+ 作用：向 Action 传递输入参数。
+ 类型：键值对。

```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: npm-${{ hashFiles('**/package-lock.json') }}
```

参数名由 Action 的 action.yml 定义。

##### 3.6.8.5、env（可选）
作用：Step 级别的环境变量（优先级最高）。

```yaml
- run: ./deploy.sh
  env:
    API_KEY: ${{ secrets.PROD_API_KEY }}
```

##### 3.6.8.6、if（可选）
+ 作用：条件执行该 Step。
+ 常用函数：
    - success()（默认）。
    - failure()。
    - cancelled()。
    - always()。

```yaml
- name: Notify on failure
  if: failure()
  run: curl -X POST https://api.example.com/alert
```

##### 3.6.8.7、id（可选）
+ 作用：为 Step 设置唯一 ID，用于后续引用其输出。
+ 类型：字符串。

```yaml
- id: build
  run: |
    echo "app_version=1.0.0" >> $GITHUB_OUTPUT
- run: echo "Version is ${{ steps.build.outputs.app_version }}"
```

输出必须写入 $GITHUB_OUTPUT（格式：key=value）。

##### 3.6.8.8、continue-on-error（可选）
+ 作用：即使该 Step 失败，Job 仍继续执行。
+ 类型：布尔值。

```yaml
- run: npm audit
  continue-on-error: true  # 安全扫描失败不中断流程
```

## 4、常用官方 Actions
| **<font style="color:rgb(255, 255, 255);">Action</font>** | **<font style="color:rgb(255, 255, 255);">用途</font>** |
| --- | --- |
| <font style="color:rgb(0, 0, 0);">actions/checkout@v4</font> | <font style="color:rgb(0, 0, 0);">拉取仓库代码</font> |
| <font style="color:rgb(0, 0, 0);">actions/setup-node@v4</font> | <font style="color:rgb(0, 0, 0);">设置 Node.js 环境</font> |
| <font style="color:rgb(0, 0, 0);">actions/setup-python@v5</font> | <font style="color:rgb(0, 0, 0);">设置 Python 环境</font> |
| <font style="color:rgb(0, 0, 0);">actions/cache@v3</font> | <font style="color:rgb(0, 0, 0);">缓存依赖（加速构建）</font> |
| <font style="color:rgb(0, 0, 0);">actions/upload-artifact@v4</font> | <font style="color:rgb(0, 0, 0);">上传构建产物（如日志、二进制文件）</font> |
| <font style="color:rgb(0, 0, 0);">peter-evans/create-pull-request@v6</font> | <font style="color:rgb(0, 0, 0);">自动创建 PR（用于自动化更新）</font> |


所有官方 Actions：[https://github.com/actions](https://github.com/actions)。

## <font style="color:rgb(13, 18, 57);">5、官方参考文档</font>
+ [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
+ [Context and expression syntax](https://docs.github.com/en/actions/learn-github-actions/contexts)


