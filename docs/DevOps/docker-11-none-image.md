---
group:
  title: Docker
order: 11
title: 虚悬镜像介绍

nav:
  title: DevOps
  order: 2
---

## 1、介绍
“虚悬镜像”（Dangling Image）是 Docker 中的一个术语，指的是那些没有被任何标签（tag）引用、也没有被任何容器使用的镜像。这类镜像通常是在构建新镜像或拉取/更新镜像过程中产生的中间产物或残留镜像。

**虚悬镜像的特征：**

+ 没有标签：在 docker images 命令输出中，虚悬镜像通常显示为 `<none>` 作为镜像名和标签。
+ 未被任何容器引用：没有任何正在运行或已停止的容器使用该镜像。
+ 占用磁盘空间但无实际用途：它们通常是构建过程中的中间层，或者因标签被覆盖/删除而变成“孤儿”。

 **虚悬镜像的产生原因：**

+ Dockerfile 构建过程中：当使用 `docker build` 构建镜像时，Docker 会为每一步创建一个中间镜像层。如果构建成功，这些中间层通常会被新生成的最终镜像所引用；但如果构建失败、中断，或后续构建覆盖了之前的标签，就可能留下未被引用的中间镜像。
+ 重新打标签或拉取同名镜像：例如，执行 `docker pull ubuntu:latest`，而本地已有 ubuntu:latest 镜像，Docker 会将旧的 ubuntu:latest 镜像变为虚悬状态（因为标签现在指向新镜像）。
+ 手动删除镜像标签：使用 docker rmi 删除某个镜像的标签后，若该镜像没有其他标签，且未被容器使用，就会变成虚悬镜像。

**解决虚悬镜像方法：**

+ 定期清理：将清理虚悬镜像作为日常维护的一部分，可以节省大量磁盘空间，尤其是在频繁构建镜像的 CI/CD 环境中。
+ 构建时覆盖标签要谨慎：在开发过程中，可以使用诸如 myapp:dev、myapp:test 这样的标签，或者使用 Git 提交哈希作为标签的一部分（如 myapp:git-{commit_id}），来避免因覆盖同一标签而产生大量虚悬镜像。
+ 利用 .dockerignore 文件：减少构建上下文的不必要文件，可以加速构建过程，并在某种程度上减少因缓存失效而产生的中间层差异。
+ 理解镜像分层：知道每个 Dockerfile 指令都会产生一个镜像层，优化 Dockerfile（如合并 RUN 指令、合理安排指令顺序）可以减少总层数，也便于管理。

## 2、如何识别虚悬镜像
使用 docker images 命令，并添加 --filter 参数进行过滤。

```bash
# 查看所有镜像，虚悬镜像通常显示为 <none>:<none>
docker images

# 专门列出所有虚悬镜像（推荐）
docker images -f "dangling=true"

# 或者更详细的写法
docker images --filter "dangling=true"
```

执行后，会看到类似这样的输出：

```bash
REPOSITORY   TAG       IMAGE ID       CREATED        SIZE
<none>       <none>    1234567890ab   2 weeks ago    150MB
<none>       <none>    abcdef123456   4 weeks ago    200MB
```

## 3、如何处理虚悬镜像
虚悬镜像通常可以安全删除，因为它们不再被使用，只会占用磁盘空间。

### 3.1、安全删除（删除所有虚悬镜像）
```bash
docker image prune
```

执行后，Docker 会询问你是否确认。也可以加 -f 或 --force 参数跳过确认：

```bash
docker image prune -f
```

### 3.2、更彻底的清理
Docker 还提供了更强大的清理命令，可以同时删除虚悬镜像和未被任何容器引用的镜像（即连非虚悬的、但未被使用的镜像也删除）：

```bash
docker image prune -a
```

### 3.3、作为系统清理的一部分
docker system prune 命令会清理更广泛的内容，其中就包括虚悬镜像，同时还会删除：

+ 已停止的容器。
+ 未被任何容器使用的网络。
+ 构建缓存。

```bash
# 这个命令清理得非常彻底，使用前请确认
docker system prune -f
# 如果你想保留一些未使用的镜像，就不要加 `-a`
docker system prune
```

