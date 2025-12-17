---
group:
  title: Docker
order: 4
title: Docker命令-常用镜像命令

nav:
  title: DevOps
  order: 1
---

## 1、介绍
Docker中用于管理镜像（Image）的常用命令主要包括以下几类：

![](../images/docker/docker202512171640.png)

## 2、具体命令指令介绍
### 2.1、docker images：列出本地存储的Docker镜像
列出当前系统中已下载并存储在本地的所有Docker镜像（不包括正在运行的容器所使用的镜像元数据，仅指镜像本身）。

```bash
docker images [OPTIONS] [REPOSITORY[:TAG]]
```

**参数说明：**

+ [REPOSITORY[:TAG]]（可选）：可指定特定仓库名和标签，仅显示匹配的镜像。例如docker images nginx:latest。
+ 常用选项：
    - -a, --all：显示所有镜像（包括中间层镜像，默认隐藏）。
    - -q, --quiet：仅输出镜像ID（便于脚本处理）。
    - --digests：显示镜像摘要（Digest）。
    - --no-trunc：不截断输出（如完整IMAGE ID）。
    - -f, --filter：按条件过滤（如dangling=true显示悬空镜像）。

docker images -a：显示所有镜像

```bash
zhangjianhua@U-QCX2V1Y9-0238 ~ % docker images -a
                                                           i Info →   U  In Use
IMAGE          ID             DISK USAGE   CONTENT SIZE   EXTRA
nginx:latest   553f64aecdc3        247MB         61.1MB    U   
redis:latest   3906b477e4b6        226MB         54.9MB        
```

docker images -q：仅输出镜像ID，可以用来批量处理，如配合删除全部：docker rmi -f $(docker images -qa)可以删除全部镜像。

```bash
zhangjianhua@U-QCX2V1Y9-0238 ~ % docker images -q
3906b477e4b6
553f64aecdc3
```

docker images --digests：显示镜像摘要

```bash
zhangjianhua@U-QCX2V1Y9-0238 ~ % docker images --digests
REPOSITORY   TAG       DIGEST                                                                    IMAGE ID       CREATED       SIZE
redis        latest    sha256:3906b477e4b60250660573105110c28bfce93b01243eab37610a484daebceb04   3906b477e4b6   7 days ago    226MB
nginx        latest    sha256:553f64aecdc31b5bf944521731cd70e35da4faed96b2b7548a3d8e2598c52a42   553f64aecdc3   4 weeks ago   247MB
```

docker images --no-trunc：不截断输出。对比上面的iamge id是截断后的内容。

```bash
zhangjianhua@U-QCX2V1Y9-0238 ~ % docker images --no-trunc
REPOSITORY   TAG       IMAGE ID                                                                  CREATED       SIZE
redis        latest    sha256:3906b477e4b60250660573105110c28bfce93b01243eab37610a484daebceb04   7 days ago    226MB
nginx        latest    sha256:553f64aecdc31b5bf944521731cd70e35da4faed96b2b7548a3d8e2598c52a42   4 weeks ago   247MB
```

docker images --filter dangling=true：按条件查看悬空镜像。

```bash
zhangjianhua@U-QCX2V1Y9-0238 ~ % docker images --filter dangling=true
IMAGE   ID             DISK USAGE   CONTENT SIZE   EXTRA
```

**输出字段解释（默认列）：**

```bash
zhangjianhua@U-QCX2V1Y9-0238 ~ % docker images
IMAGE          ID             DISK USAGE   CONTENT SIZE
nginx:latest   553f64aecdc3        247MB         61.1MB 
```

| 列名 | 含义 |
| --- | --- |
| REPOSITORY | 镜像仓库名称（如nginx，redis，） |
| TAG | 镜像标签（版本标识，如latest, 1.21） |
| IMAGE ID | 镜像唯一标识符（SHA256哈希值前缀） |
| CREATED | 镜像创建时间（相对于当前时间） |
| SIZE | 镜像磁盘占用大小（不包含共享层） |


注意：多个标签可能指向同一个IMAGE ID（即同一镜像有多个别名）。

**使用场景：**

+ 查看本地有哪些可用镜像；
+ 确认是否已拉取某个特定版本的镜像；
+ 清理前识别无用或重复的镜像（配合docker rmi）；
+ 调试构建过程时检查中间镜像（使用 -a）；
+ 自动化脚本中获取镜像ID（使用 -q）。

**Bash示例：**

```bash
# 列出所有本地镜像（默认行为）
docker images

# 仅显示 nginx 相关镜像
docker images nginx

# 显示所有镜像（包括中间层）
docker images -a

# 仅输出镜像 ID（用于批量删除等操作）
docker images -q

# 查找悬空镜像（dangling=true：未被任何标签引用的镜像）
docker images -f "dangling=true"
```

**补充技巧：**

组合命令清理无用镜像：

```bash
# 删除所有悬空镜像
docker image prune -f

# 删除所有未被容器引用的镜像（谨慎！）
docker image prune -a -f
```

格式化输出（Go模板）：

```bash
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

### 2.2、docker pull：从远程镜像仓库拉取镜像到本地
从配置的镜像注册表（默认为Docker Hub）下载指定名称和标签（或摘要）的镜像，并存储到本地镜像库中，供后续运行容器使用。

```bash
docker pull [OPTIONS] NAME[:TAG|@DIGEST]
```

**参数说明：**

+ NAME：镜像仓库名称，格式通常为[REGISTRY_HOST[:PORT]/]REPOSITORY_NAME。
    - 若省略注册表地址，默认使用Docker Hub（docker.io）。
    - 例如：nginx等价于docker.io/library/nginx。
+ [:TAG]（可选）：指定镜像标签（如latest、1.21-alpine）。若未指定，默认拉取latest标签。
+ [@DIGEST]（可选）：通过内容摘要（SHA256哈希值）精确拉取镜像，确保不可变性和安全性。例如：nginx@sha256:abc123...

**常用选项：**

+ --platform：指定目标平台（如linux/amd64、linux/arm64），用于多架构镜像拉取。
+ -q, --quiet：静默模式，仅输出最终镜像ID。
+ --all-tags：拉取该仓库下所有标签的镜像（慎用，可能下载大量数据）。

**执行过程详解：**

1. 解析镜像名：将nginx:latest解析为完整引用docker.io/library/nginx:latest。
2. 连接注册表：向[https://registry-1.docker.io](https://registry-1.docker.io)发起HTTPS请求（或自定义registry）。
3. 认证（如需要）：若为私有仓库，会尝试使用~/.docker/config.json中的凭证。
4. 获取清单（Manifest）：下载镜像的元数据，包含各层（layers）的摘要和大小。
5. 并行下载层：按需下载缺失的镜像层（已存在的层会跳过，实现增量更新）。
6. 验证完整性：通过SHA256校验每层内容，防止篡改或损坏。
7. 本地存储：将镜像层写入本地存储驱动（如overlay2、btrfs），并注册到镜像数据库。

**Bash示例：**

```bash
# 拉取nginx最新版本（等价于 nginx:latest）
docker pull nginx

# 拉取指定版本
docker pull redis:7.0-alpine

# 从私有仓库拉取
docker pull my-registry.local:5000/my-app:v1.2

# 通过摘要精确拉取（推荐用于生产）
docker pull alpine@sha256:e3bd82196e9882f3c363a8b4a5aa337181d048da3b32a4a2e83c464bcc805b1e

# 拉取适用于 AMD64 架构的镜像（在 ARM 设备上）
docker pull --platform linux/amd64 mysql:8.0

# 静默拉取，仅输出镜像 ID
docker pull -q ubuntu
```

**验证是否成功：**

```bash
# 查看刚拉取的镜像
docker images nginx

# 检查镜像详细信息（包括Digest）
docker inspect nginx:latest | grep -i digest

# 尝试运行容器验证可用性
docker run --rm nginx:latest nginx -v
```

**常见错误及解决：**

| 错误信息 | 原因 | 解决方案 |
| --- | --- | --- |
| Error response from daemon: pull access denied | 私有镜像未登录或无权限 | 执行docker login [registry] |
| manifest for ... not found | 标签不存在或拼写错误 | 检查标签名，或访问Docker Hub 页面确认 |
| net/http: TLS handshake timeout | 网络问题或代理未配置 | 配置Docker代理或重试 |
| no matching manifest for linux/arm64 | 镜像不支持当前平台 | 使用--platform指定兼容架构 |


### 2.3、docker search：在Docker Hub中搜索镜像
从Docker Hub（默认）的公共镜像仓库中，根据关键词（TERM）搜索可用的镜像，并返回匹配结果列表，包含镜像名称、描述、星标数、是否官方等信息。

docker search仅支持Docker Hub（hub.docker.com），不支持私有仓库或第三方注册表（如Harbor、Quay.io等）。

```bash
docker search [OPTIONS] TERM
```

**参数说明：**

+ TERM：搜索关键词（必需），如nginx、redis、mysql。支持部分模糊匹配。
+ 常用选项：
    - --limit N：限制返回结果数量（默认25，最大100）。
    - --filter "is-official=true"：仅显示官方镜像。
    - --filter "is-automated=true"：仅显示自动构建镜像（已弃用，现多为历史遗留）。
    - --format：自定义输出格式（Go模板语法）。

```bash
zhangjianhua@U-QCX2V1Y9-0238 ~ % docker search nginx --limit 5
NAME                              DESCRIPTION                                      STARS     OFFICIAL
nginx                             Official build of Nginx.                         21114     [OK]
nginx/nginx-ingress               NGINX and  NGINX Plus Ingress Controllers fo…   111       
nginx/nginx-prometheus-exporter   NGINX Prometheus Exporter for NGINX and NGIN…   50        
nginx/unit                        This repository is retired, use the Docker o…   66        
nginx/nginx-ingress-operator      NGINX Ingress Operator for NGINX and NGINX P…   3         
```

**输出字段解释（默认列）：**

| 列名 | 含义 |
| --- | --- |
| NAME | 镜像仓库名称（如nginx,library/redis） |
| DESCRIPTION | 镜像简要描述（来自Docker Hub页面） |
| STARS | 社区点赞数（⭐），反映流行度和可信度 |
| OFFICIAL | 是否为Docker官方镜像（标记为[OK]） |
| AUTOMATED | 是否为自动构建镜像（旧功能，现基本无意义） |


**使用场景：**

+ 快速查找某个软件是否有官方Docker镜像；
+ 比较不同镜像的社区认可度（通过STARS数）；
+ 发现特定用途的第三方镜像（如jenkins/jenkins:lts）；
+ 在脚本或终端中无需打开浏览器即可探索镜像选项；
+ 结合 --filter精准筛选高质量镜像（如只看官方镜像）。

**Bash示例：**

```bash
# 搜索 nginx 相关镜像（默认最多 25 条）
docker search nginx

# 限制返回 5 条结果
docker search --limit 5 redis

# 仅搜索官方镜像
docker search --filter "is-official=true" mysql

# 自定义输出格式（仅显示名称和星标数）
docker search --format "table {{.Name}}\t{{.StarCount}}" python

# 搜索包含 "alpine" 的轻量级镜像
docker search alpine
```

**注意事项：**

+ 仅限Docker Hub：无法搜索私有仓库、GitLab Container Registry、AWS ECR等。
+ 不返回标签信息：docker search不会显示镜像有哪些TAG（如latest, 1.21），需前往Docker Hub页面或使用 docker pull + docker images 查看。
+ 结果可能过时：搜索结果基于Docker Hub元数据缓存，不一定实时反映最新状态。
+ 网络依赖：需要能访问[https://hub.docker.com](https://hub.docker.com)，国内用户可能因网络问题超时或失败（可配置代理或使用镜像加速器，但search不走镜像加速器）。
+ 无认证需求：搜索公共镜像无需docker login。
+ API限制：频繁调用可能触发Docker Hub的速率限制（Rate Limit）。

### 2.4、docker rmi：删除本地存储的Docker镜像
从本地镜像存储中删除一个或多个指定的镜像。若镜像被容器引用（正在运行或已停止但未删除），默认会阻止删除（除非强制）。

rmi是"remove image"的缩写。

```bash
docker rmi [OPTIONS] IMAGE [IMAGE...]
```

**参数说明：**

+ IMAGE：要删除的镜像标识符，可使用以下任一形式：
    - 仓库名+标签：如 nginx:latest
    - 镜像 ID：如605c77e624dd（支持完整或前缀匹配）
    - 摘要（Digest）：如 nginx@sha256:abc123...
+ 常用选项：
    - -f, --force：强制删除镜像（即使有容器依赖它）。
    - --no-prune：不删除未被其他镜像引用的中间层（默认会自动清理无用层）。

**删除逻辑详解：**

+ 检查依赖关系：Docker会检查是否有任何容器（包括已停止的）引用该镜像。若有，则拒绝删除（除非使用 -f）。
+ 解除标签引用：若镜像有多个标签（如myapp:v1和myapp:latest指向同一 ID），rmi仅移除指定标签；只有当最后一个标签被删除时，镜像数据才会被真正清理。
+ 清理中间层：删除镜像后，Docker会自动移除不再被任何镜像引用的中间层（dangling layers），释放磁盘空间（可通过--no-prune禁用）。
+ 实际删除时机：镜像数据仅在无任何标签或容器引用时才从磁盘移除。

```bash
docker tag nginx:latest my-nginx:dev  # 同一镜像有两个标签
docker rmi my-nginx:dev               # 仅删除标签，镜像数据保留
docker rmi nginx:latest               # 最后一个标签被删，镜像数据被清除
```

**使用场景：**

+ 清理不再需要的旧版本镜像（如myapp:v1.0）；
+ 释放磁盘空间（尤其在频繁构建测试镜像后）；
+ 删除悬空镜像（<none>:<none>，通常由构建失败或更新产生）；
+ 强制清理被“僵尸”容器占用的镜像（配合 -f）；
+ 自动化脚本中批量清理临时镜像。

**Bash示例：**

```bash
# 删除指定标签的镜像
docker rmi nginx:latest

# 通过镜像 ID 删除（更精确）
docker rmi 605c77e624dd

# 删除多个镜像
docker rmi redis:alpine postgres:15

# 强制删除（即使有容器依赖）
docker rmi -f my-broken-image

# 删除所有悬空镜像（推荐方式，非直接 rmi）
docker image prune -f

# 批量删除所有包含 "test" 的镜像（谨慎！）
docker rmi $(docker images 'test*' -q)
```

**注意事项：**

+ 不能删除被容器使用的镜像：若存在任何状态的容器（运行中或已停止）基于该镜像，rmi会失败并提示：

```bash
Error response from daemon: conflict: unable to remove repository reference "nginx:latest" (must force) - container abc123 is using its referenced image 605c77e624dd
```

解决方案：先停止容器，再删镜像。

```plain
graph LR
A[想删镜像] --> B{镜像被容器使用？}
B -- 是 --> C[用 docker ps 找到容器]
C --> D[docker stop <容器名>]
D --> E[docker rm <容器名>]
E --> F[docker rmi <镜像>]
B -- 否 --> F
```

+ 强制删除的风险：使用-f会跳过依赖检查，但底层镜像数据可能因容器仍在引用而无法真正释放磁盘空间，直到容器被删除。
+ 多标签共享镜像：删除一个标签不会影响其他标签或容器，只有最后一个引用被移除时才清理数据。
+ 悬空镜像（:）：这些镜像没有标签，通常由docker build中断或docker pull更新产生，可安全删除。

**验证是否删除成功：**

```bash
# 查看镜像是否还在
docker images nginx

# 检查悬空镜像（确认中间层是否清理）
docker images -f "dangling=true"

# 查看磁盘空间变化（需结合 df 或 du）
df -h /var/lib/docker
```

**补充技巧：**

①、安全批量清理（推荐替代直接 rmi）：

```bash
# 删除所有未被容器使用的镜像
docker image prune -a -f

# 删除 24 小时前创建的镜像（需配合 filter）
docker images --format "{{.ID}}" --filter "before=24h" | xargs docker rmi
```

②、查看镜像依赖树（调试用）：

```bash
docker history <image>
```

### 2.5、docker inspect：查看Docker对象的底层详细信息(元数据)
返回指定Docker对象（容器、镜像、网络、卷等）的完整 JSON 格式元数据，包含配置、状态、网络、挂载点、安全策略等底层细节，是调试和自动化脚本的核心工具。

```bash
docker inspect [OPTIONS] NAME|ID [NAME|ID...]
```

默认操作对象是 容器，但也可用于镜像、网络、卷等。

**参数说明：**

+ NAME|ID：要检查的对象标识符，支持以下类型：
    - 容器：容器名或ID（如my-nginx或a1b2c3d4）
    - 镜像：镜像名、标签或ID（如nginx:latest）
    - 网络/卷：网络名或卷名（如bridge, my-volume）
+ 常用选项：
    - -f, --format string：使用Go模板语法提取特定字段（避免解析完整JSON）。
    - -s, --size：（仅容器）显示容器总文件大小（包括可写层）。
    - --type string：显式指定对象类型（container、image、network、volume），避免歧义。

docker inspect返回一个JSON数组（即使只查一个对象），每个元素包含数十个字段，关键部分包括：

| 字段类别 | 说明 |
| --- | --- |
| Id | 容器完整ID（64位SHA256） |
| Created | 容器创建时间（ISO8601格式） |
| Path/Args | 容器启动命令及参数（如["nginx", "-g", "daemon off;"]） |


举例：

```bash
zhangjianhua@U-QCX2V1Y9-0238 project % docker inspect nginx
[
    {
        "Id": "sha256:553f64aecdc31b5bf944521731cd70e35da4faed96b2b7548a3d8e2598c52a42",
        "RepoTags": [
            "nginx:latest"
        ],
        "RepoDigests": [
            "nginx@sha256:553f64aecdc31b5bf944521731cd70e35da4faed96b2b7548a3d8e2598c52a42"
        ],
        "Comment": "buildkit.dockerfile.v0",
        "Created": "2025-11-18T02:21:42.4782034Z",
        "Config": {
            "ExposedPorts": {
                "80/tcp": {}
            },
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                "NGINX_VERSION=1.29.3",
                "NJS_VERSION=0.9.4",
                "NJS_RELEASE=1~trixie",
                "PKG_RELEASE=1~trixie",
                "DYNPKG_RELEASE=1~trixie"
            ],
            "Entrypoint": [
                "/docker-entrypoint.sh"
            ],
            "Cmd": [
                "nginx",
                "-g",
                "daemon off;"
            ],
            "Labels": {
                "maintainer": "NGINX Docker Maintainers <docker-maint@nginx.com>"
            },
            "StopSignal": "SIGQUIT"
        },
        "Architecture": "arm64",
        "Variant": "v8",
        "Os": "linux",
        "Size": 58263548,
        "RootFS": {
            "Type": "layers",
            "Layers": [
                "sha256:f1b30ab9918326dc2f4c25f16c0e6c13e9a48427441ea41c0e4d8f3e6699da24",
                "sha256:05d7c2ce4c712467d7be41cf65f90f965b602f391c39650ae46dc8a160c364f3",
                "sha256:e3e0793190cc8810723b5b807657db69ac3d013f83f2372dedc27bcc624bfe31",
                "sha256:501e2f6df34652fb73c2c515b3ea211113fbdc2f5c9fb718c54ddd16bb030fdd",
                "sha256:55e790c2add0d339609a92d53ba2c53aa44b9ff5e13f6ea2892e640485b82ac1",
                "sha256:9c9db52289d5c984a37af79680c03d0d5d1ad1ecfa8403173050a82f443e5178",
                "sha256:3cfb2d9aac9754a2f765c02b5ae791cad74e022ec33cd13bf0d753033a098094"
            ]
        },
        "Metadata": {
            "LastTagTime": "2025-12-08T06:21:43.083021463Z"
        },
        "Descriptor": {
            "mediaType": "application/vnd.oci.image.index.v1+json",
            "digest": "sha256:553f64aecdc31b5bf944521731cd70e35da4faed96b2b7548a3d8e2598c52a42",
            "size": 10229
        }
    }
]
```

**使用场景：**

+ 调试容器异常：查看实际IP、端口映射、挂载路径、退出原因；
+ 确认运行时配置：验证环境变量、资源限制、重启策略是否生效；
+ 自动化脚本取值：通过--format提取IP、状态等字段供Shell使用；
+ 审计安全设置：检查是否启用特权模式、Capabilities、SELinux/AppArmor配置；
+ 排查镜像问题：查看镜像的Entrypoint/Cmd、层结构、基础OS信息；
+ 获取容器日志路径：LogPath字段指向JSON日志文件位置（若使用json-file驱动）。

Bash示例：

```bash
# 查看容器 my-nginx 的完整信息
docker inspect my-nginx

# 仅获取容器 IP 地址（使用 Go 模板）
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' my-nginx

# 获取容器状态（running/exited）
docker inspect -f '{{.State.Status}}' my-nginx

# 查看镜像的 Entrypoint 和 Cmd
docker inspect -f 'Entrypoint: {{.Config.Entrypoint}} | Cmd: {{.Config.Cmd}}' nginx:latest

# 显式指定类型（避免名称冲突）
docker inspect --type=image nginx

# 查看容器挂载的卷
docker inspect -f '{{.Mounts}}' my-db

# 获取容器使用的镜像 ID（完整）
docker inspect -f '{{.Image}}' my-app
```

### 2.6、docker image prune：清理未被使用的Docker镜像
安全地删除本地存储中未被任何容器引用的“悬空”或“无用”镜像，帮助回收磁盘空间，避免镜像堆积导致系统存储耗尽。

```bash
docker image prune [OPTIONS]
```

**参数说明：**

+ 常用选项：
    - -a, --all：不仅删除悬空镜像，还删除所有未被容器使用的镜像（包括有标签的）。
    - -f, --force：跳过交互式确认提示，直接执行删除。
    - --filter filter：按条件过滤要删除的镜像（如until=24h删除24小时前的镜像）。

| 类型 | 说明 | 是否默认删除 |
| --- | --- | --- |
| 悬空镜像（dangling images） | 标签为<none>:<none>、未被任何镜像或容器引用的中间层镜像（通常由docker build中断、docker pull更新或docker rmi删除标签后产生） | ✅ 是（默认行为） |
| 未被容器使用的带标签镜像 | 有有效标签（如myapp:v1），但没有任何容器（运行中或已停止）基于它 |  |


构建新镜像后，旧版本若无容器使用 → 成为“无用镜像”。

docker pull nginx:latest更新后，旧nginx:latest层若无其他引用 → 变为悬空镜像。

**使用场景：**

+ 🧹 日常磁盘清理：定期释放因频繁构建/拉取积累的无用镜像；
+ 💾 磁盘空间告急时快速回收：尤其在CI/CD环境或开发机上；
+ 🧪 清理测试残留：删除临时构建的调试镜像；
+ 🔄 配合自动化运维脚本：在部署后自动清理旧版本镜像；
+ 🛡️ 安全审计后清理：移除不再需要的第三方镜像。

**Bash示例：**

```bash
# 交互式删除所有悬空镜像（默认行为）
docker image prune

# 强制删除所有悬空镜像（无确认提示）
docker image prune -f

# 删除所有未被容器使用的镜像（包括有标签的！谨慎使用）
docker image prune -a -f

# 删除 24 小时前创建的无用镜像
docker image prune -a --filter "until=24h"

# 删除带有特定 label 的无用镜像
docker image prune --filter "label=stage=dev"
```

**验证清理效果：**

```bash
# 查看清理前悬空镜像
docker images -f "dangling=true"

# 执行清理
docker image prune -f

# 再次检查，应无悬空镜像
docker images -f "dangling=true"

# 查看磁盘空间变化（Docker 根目录通常为 /var/lib/docker）
df -h /var/lib/docker
```

与其他清理命令对比：

| 命令 | 作用范围 | 是否删除带标签镜像 |
| --- | --- | --- |
| docker image prune | 仅悬空镜像 | ❌ |
| docker image prune -a | 所有未被容器使用的镜像 | ✅ |
| docker rmi <image> | 手动指定镜像 | ✅（但需处理依赖） |
| docker system prune | 镜像 + 容器 + 网络 + 构建缓存 | ✅（加-a时） |


**举例说明：**

```bash
zhangjianhua@U-QCX2V1Y9-0238 project % docker image prune -a
WARNING! This will remove all images without at least one container associated to them.
Are you sure you want to continue? [y/N] y
Deleted Images:
untagged: redis:latest
deleted: sha256:3906b477e4b60250660573105110c28bfce93b01243eab37610a484daebceb04
deleted: sha256:79abb36c01d293cba035a1a97bc2e017e0c33e6b711b2819337f41fd1aa0bc65
deleted: sha256:3bef1ceab41afb1bdf8e3a827ba709b95808facc7f7bacebac86a0006eaa7668

Total reclaimed space: 54.87MB
zhangjianhua@U-QCX2V1Y9-0238 project % docker images
                                                           i Info →   U  In Use
IMAGE          ID             DISK USAGE   CONTENT SIZE   EXTRA
nginx:latest   553f64aecdc3        247MB         61.1MB    U  
```

### 2.7、docker tag：为本地Docker镜像创建新标签
为已存在的本地镜像创建一个或多个新的引用名称（标签），而不复制镜像数据。本质上是为同一个镜像ID添加额外的“别名”，便于管理、推送或区分用途。

tag不会创建新镜像，仅添加元数据引用 —— 多个标签可指向同一镜像ID。

```bash
docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]
```

**参数说明：**

+ SOURCE_IMAGE[:TAG]：源镜像，必须是本地已存在的镜像。
    - 可使用：仓库名+标签（如 nginx:latest）、镜像ID（如 605c77e624dd）。
    - 若省略 :TAG，默认使用latest。
+ TARGET_IMAGE[:TAG]：目标标签名称，格式为[REGISTRY_HOST[:PORT]/] REPOSITORY_NAME[:TAG]。
    - 可包含自定义仓库地址（为后续 docker push 做准备）。
    - 若省略 :TAG，默认设为latest。

如：

```bash
docker tag nginx:latest my-registry.local:5000/web-server:v1.2
```

表示：为本地nginx:latest镜像添加一个新标签，使其能被推送到私有仓库my-registry.local:5000。

**核心机制：**

+ 共享镜像层：新标签与原镜像完全共享所有层数据，不占用额外磁盘空间。
+ 更新引用：Docker内部将新标签映射到同一IMAGE ID。
+ 不影响容器：已有容器仍绑定原始镜像ID，不受标签变更影响。

```bash
$ docker images nginx
REPOSITORY   TAG       IMAGE ID       SIZE
nginx        latest    605c77e624dd   141MB

$ docker tag nginx:latest my-app:prod

$ docker images | grep 605c77e624dd
nginx        latest    605c77e624dd   141MB
my-app       prod      605c77e624dd   141MB   # 同一 ID，两个标签
```

**使用场景：**

+ 🏷️ 为镜像打版本标签：构建后将latest镜像标记为v1.0、stable等语义化版本；
+ 📤 准备推送至私有仓库：在docker push前，用目标仓库地址重命名镜像；
+ 🧪 区分环境用途：如my-app:dev、my-app:staging、my-app:prod指向同一构建产物；
+ 🔁 保留历史版本引用：在更新latest前，先tag旧版为backup-v1；
+ 🔄 标准化镜像命名：统一团队内部镜像命名规范（如project/service:version）。

**Bash示例：**

```bash
# 为本地 nginx 镜像添加新标签
docker tag nginx:latest my-web-server:1.0

# 为镜像 ID 打标签（更精确）
docker tag 605c77e624dd my-web-server:latest

# 添加私有仓库前缀（为 push 做准备）
docker tag my-app:1.0 registry.example.com/my-team/my-app:1.0

# 同一镜像打多个用途标签
docker tag app:build-123 app:testing
docker tag app:build-123 app:release-candidate

# 验证标签是否生效
docker images my-web-server
```

**注意事项：**

+ ⚠️ 源镜像必须存在：若SOURCE_IMAGE不存在，会报错：

```bash
Error response from daemon: No such image: nonexistent:latest
```

+ ⚠️ 不会拉取远程镜像：docker tag仅操作本地镜像，不能用于“重命名远程镜像”。
+ ⚠️ 覆盖行为：若TARGET_IMAGE:TAG已存在，会被静默覆盖（指向新镜像ID）。
+ ⚠️ 不改变镜像内容：标签只是“指针”，修改标签不会影响镜像本身或已运行的容器。
+ ⚠️ 推送需匹配标签：docker push registry/app:1.0要求本地必须存在该完整标签名。

**常见工作流（配合build&push）：**

```bash
# 1. 构建镜像（默认标签为 latest）
docker build -t my-app .

# 2. 打上版本和仓库标签
docker tag my-app:latest my-registry.com/my-app:v1.2.0
docker tag my-app:latest my-registry.com/my-app:latest

# 3. 推送至私有仓库
docker push my-registry.com/my-app:v1.2.0
docker push my-registry.com/my-app:latest
```

### 2.8、docker save与docker load镜像的完整备份与恢复
跨主机迁移镜像、离线分发、长期归档（推荐用于生产环境）。

#### 2.8.1、docker save：将本地镜像导出为tar归档文件（含完整分层结构）
将一个或多个本地镜像（包括所有层、标签、元数据）打包成一个 tar 文件，可被 docker load 完整还原。

```bash
docker save [OPTIONS] IMAGE [IMAGE...] > archive.tar
# 或
docker save -o archive.tar IMAGE [IMAGE...]
```

**参数说明：**

+ IMAGE：镜像名、标签或ID（如nginx:latest、605c77e624dd）。
+ -o, --output：指定输出文件路径（推荐使用，避免重定向问题）。
+ 支持多个镜像打包到同一tar文件中。

**示例：**

```bash
# 导出单个镜像
docker save -o nginx.tar nginx:latest

# 导出多个镜像到同一文件
docker save -o my-apps.tar nginx:alpine redis:7.0 my-app:v1

# 查看 tar 内容（包含 manifest.json 和各层目录）
tar -tf nginx.tar
```

```bash
zhangjianhua@U-QCX2V1Y9-0238 ~ % docker save -o nginx.tar nginx:latest
zhangjianhua@U-QCX2V1Y9-0238 ~ % ls
nginx.tar
```

**特点：**

+ ✅ 保留完整镜像历史（所有中间层）；
+ ✅ 保留所有标签（如nginx:latest和nginx:1.21若指向同一 ID，都会被保存）；
+ ✅ 可跨平台传输（文件不依赖宿主机环境）；
+ 💾 文件较大（包含所有层，即使与其他镜像共享）。

#### 2.8.2、docker load：从tar文件加载镜像到本地
将docker save生成的tar文件完整还原为本地镜像，恢复所有标签和层。

```bash
docker load < archive.tar
# 或
docker load -i archive.tar
```

示例：

我们先删除docker中已经存在的nginx，然后从本地导入：

```bash
zhangjianhua@U-QCX2V1Y9-0238 ~ % docker images
                                                           i Info →   U  In Use
IMAGE          ID             DISK USAGE   CONTENT SIZE   EXTRA
nginx:latest   553f64aecdc3        247MB         61.1MB    U   
zhangjianhua@U-QCX2V1Y9-0238 ~ % docker rmi -f nginx:latest
Untagged: nginx:latest
zhangjianhua@U-QCX2V1Y9-0238 ~ % docker load -i nginx.tar 
Loaded image: nginx:latest
zhangjianhua@U-QCX2V1Y9-0238 ~ % docker images
                                                           i Info →   U  In Use
IMAGE          ID             DISK USAGE   CONTENT SIZE   EXTRA
nginx:latest   553f64aecdc3        247MB         61.1MB    U   
```

**特点：**

+ ✅ 完全还原save时的状态；
+ ✅ 自动恢复所有标签引用；
+ ✅ 不依赖网络（纯离线操作）。

#### 2.8.3、docker export与docker import —— 基于容器快照的扁平化镜像创建
运行中的容器创建简化镜像、去除构建痕迹（如日志、临时文件），不推荐用于常规镜像分发。

**①、docker export**

```bash
docker export [OPTIONS] CONTAINER > filesystem.tar
# 或
docker export -o filesystem.tar CONTAINER
```

将正在运行或已停止的容器的当前文件系统状态（可写层 + 只读层合并后的快照）导出为一个扁平化的tar文件。

**特点：**

+ ❌ 丢失所有镜像历史层（结果是一个单层镜像）；
+ ❌ 丢失元数据：无CMD、ENTRYPOINT、ENV、EXPOSE等配置；
+ ✅ 文件较小（仅包含最终文件系统）；
+ ✅ 可清除构建过程中的敏感信息或临时文件。

**②、docker import**

将docker export生成的tar文件（或任意文件系统tar）导入为一个新的Docker镜像。

```bash
docker import [OPTIONS] file|URL|- [REPOSITORY[:TAG]]
```

**参数说明：**

+ file|URL|-：tar文件路径、URL或标准输入（-）。
+ [REPOSITORY[:TAG]]：为新镜像指定名称和标签（必须手动指定，因元数据已丢失）。
+ -c, --change：可添加Dockerfile指令（如CMD ["/nginx"]）来补全元数据。

| 特性 | save/load | export/import |
| --- | --- | --- |
| 操作对象 | 镜像（Image） | 容器（Container） |
| 是否保留历史层 | ✅ 是（完整分层） | ❌ 否（扁平单层） |
| 是否保留元数据 | ✅ 是（CMD/ENV/标签等） | ❌ 否（需手动补充） |
| 文件大小 | 较大（含所有层） | 较小（仅最终文件系统） |
| 适用场景 | 镜像备份、离线分发 | 容器快照、安全加固 |
| 能否直接运行 | ✅ 是 | ⚠️ 通常不能（缺启动命令） |
| 命令对 | docker save→ docker load | docker export→ docker import |


❌不要混淆两者：

docker load不能加载export生成的tar；

docker import不能加载save生成的tar（会报错或生成无效镜像）。

### 2.9、docker build：根据Dockerfile构建自定义Docker镜像
读取指定路径下的Dockerfile和构建上下文（build context），按指令逐层执行，最终生成一个新的本地Docker镜像。

```bash
docker build [OPTIONS] PATH | URL | -
```

这是将应用程序打包为容器镜像的核心命令，是CI/CD、微服务部署的起点。

**参数说明：**

+ PATH | URL | -：构建上下文路径（必须提供）：
    - PATH（最常用）：本地目录路径（如.表示当前目录），Docker会将该目录所有内容（除.dockerignore排除外）发送给守护进程作为构建上下文。
    - URL：Git仓库地址（如[https://github.com/user/repo.git#branch:subdir](https://github.com/user/repo.git#branch:subdir)），Docker会自动克隆并构建。
    - -：从标准输入（stdin）读取Dockerfile内容（通常配合管道使用）。

**常用选项：**

| 选项 | 说明 |
| --- | --- |
| -t, --tag | 为生成的镜像指定名称和标签（如-t myapp:v1），可多次使用打多个标签 |
| -f, --file | 指定 Dockerfile 文件名（默认为Dockerfile），如-f Dockerfile.prod |
| --build-arg | 传递构建时变量（需在 Dockerfile 中用ARG声明） |
| --no-cache | 忽略缓存，强制重新构建所有层（调试时常用） |
| --platform | 指定目标平台（如linux/amd64），用于多架构构建 |
| --progress | 设置构建日志输出格式（auto, plain, tty） |


**构建过程详解：**

+ 发送构建上下文：Docker客户端将PATH目录下所有文件（受.dockerignore过滤）打包发送给dockerd守护进程。
+ 读取Dockerfile：从上下文中读取Dockerfile（或通过-f指定的文件）。
+ 逐层执行指令：按顺序执行FROM, RUN, COPY, CMD等指令，每条指令生成一个新镜像层。
+ 利用层缓存：若某层指令及上下文未变，Docker会复用缓存层，加速后续构建（可通过--no-cache跳过）。
+ 生成最终镜像：所有指令执行完毕后，生成一个新镜像，并可选地打上标签（-t）。

**使用场景：**

+ 📦 打包应用程序：将代码、依赖、运行环境封装为可移植镜像；
+ 🔁 CI/CD自动化构建：在流水线中生成带版本号的镜像；
+ 🧪 多环境隔离：通过不同Dockerfile构建开发/测试/生产镜像；
+ 🌐 多架构支持：使用--platform构建ARM/AMD64兼容镜像；
+ 🔒 安全构建：通过.dockerignore排除敏感文件（如.env, id_rsa）。

**Bash示例：**

```bash
# 在当前目录构建，打标签 myapp:latest
docker build -t myapp:latest .

# 使用自定义 Dockerfile
docker build -f Dockerfile.nginx -t web-server .

# 传递构建参数
docker build --build-arg VERSION=1.2.0 -t myapp:$VERSION .

# 忽略缓存（强制全量构建）
docker build --no-cache -t myapp:debug .

# 从 Git 仓库构建
docker build -t myapp https://github.com/user/app.git#main

# 构建并立即运行
docker build -t temp-app . && docker run --rm temp-app
```

**注意事项：**

+ ⚠️ 构建上下文≠Dockerfile所在目录：docker build . 中的 . 是上下文根目录，Dockerfile中的COPY路径是相对于此目录的。
+ ⚠️ 避免大上下文：上下文包含大量无关文件（如node_modules, .git）会显著拖慢构建速度。务必使用 .dockerignore。
+ ⚠️ 缓存失效机制：一旦某层变更，其后所有层缓存失效。应将频繁变动的指令（如COPY代码）放在Dockerfile底部。
+ ⚠️ 需要Docker守护进程：若dockerd未运行，会报错：

```bash
Cannot connect to the Docker daemon at unix:///var/run/docker.sock...
```

+ ⚠️ 权限问题：普通用户需加入 docker 用户组，否则需 sudo（不推荐）。

**.dockerignore示例（提升安全与性能）：**

```bash
# 排除敏感文件
.env
*.pem
id_rsa

# 排除开发文件
.git
node_modules/
__pycache__/
*.log
.DS_Store

# 排除构建产物
dist/
build/
```

	这里暂时只做介绍，关于深入的使用随着深入的学习再进行探究。

