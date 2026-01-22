---
group:
  title: Docker
order: 8
title: Docker容器目录挂载

nav:
  title: 发布部署
  order: 2
---

## 1、介绍

在 Docker 中，目录挂载（也称为“绑定挂载”或“bind mount”）是指将宿主机（Host）上的一个目录或文件挂载到容器（Container）内部的某个路径上。这样，容器内对该路径的读写操作会直接反映到宿主机的对应目录中，实现数据的持久化和共享。

**为什么需要挂载目录？**

- 数据持久化：容器删除后，其内部文件系统也会被清除。通过挂载宿主机目录，可以保留重要数据。
- 开发调试方便：比如将本地代码目录挂载进容器，修改代码后无需重建镜像。
- 配置文件共享：将宿主机的配置文件挂载到容器中，便于统一管理。
- 日志收集：将容器日志输出到宿主机指定目录，便于监控和分析。
- 容器内的内容因为环境缺少导致不易编辑等，如下的 demo 中，容器中没有 vim 编辑器，很难去进行编辑。

```bash
zhangjianhua@U-QCX2V1Y9-0238 zjh % docker exec -it web01 /bin/bash
root@f035a7810460:/# cd /usr/share/nginx/html/
root@f035a7810460:/usr/share/nginx/html# ls
50x.html  index.html
root@f035a7810460:/usr/share/nginx/html# vim index.html
bash: vim: command not found
root@f035a7810460:/usr/share/nginx/html#
```

## 2、容器目录挂载方式

Docker 支持三种主要的数据管理方式，其中最常用的是绑定挂载（Bind Mounts）和命名卷（Named Volumes）。下面我们就通过上面的例子，实现挂载。

Docker 使用 -v 或 --volume 参数挂载存储，其通用格式为：

```bash
-v source:target[:options]
source：宿主机路径（绑定挂载）或卷名（命名卷）
target：容器内的挂载路径
options：可选参数，如 ro（只读）、rw（读写，默认）
```

### 2.1、绑定挂载

这是最直观的方式：直接把宿主机的一个目录映射进容器。是最常用且适合开发的方式。

✅ **特点：source 是宿主机上的绝对路径（必须是完整路径）。必须使用绝对路径！相对路径（如 ./data）在旧版 Docker 中可能被解释为命名卷（行为不一致），建议避免。**

将宿主机的任意目录或文件挂载到容器中。

```bash
docker run -v /host/path:/container/path your-image
```

或者使用--mount 语法（推荐，更清晰）：

```bash
docker run --mount type=bind,source=/host/path,target=/container/path your-image
```

```bash
# Linux / macOS
docker run -v /home/user/config:/app/config nginx

# Windows（PowerShell 或 CMD）
docker run -v C:\Users\user\config:/app/config nginx

# 或使用正斜杠（在某些 shell 中需转义）
docker run -v //c/Users/user/config:/app/config nginx
```

注意：

- /host/path 必须是宿主机上的绝对路径。
- 如果该路径不存在，Docker 不会自动创建（会报错）。

下面我们就通过上面的例子进行操作，先退出当前容器：

```bash
exit
```

然后停止并删除现有的 web01 容器（因为挂载必须在 docker run 时指定，不能动态添加）：

```bash
docker stop web01
docker rm web01
```

在宿主机创建一个本地目录，比如~/nginx-web：

```bash
mkdir -p ~/nginx-web
echo '<h1>Hello from Host!</h1>' > ~/nginx-web/index.html
```

启动新容器，使用-v 挂载：

```bash
docker run -d \
  --name web01 \
  -p 8080:80 \
  -v ~/nginx-web:/usr/share/nginx/html \
  nginx:latest
```

可以访问[http://localhost:8080](http://localhost:8080)可以看到页面内容为 Hello from Host!

注意~/nginx-web 会被自动展开为绝对路径（如/Users/zhangjianhua/nginx-web），Docker 支持这种写法。

验证：

```bash
# 查看挂载是否生效
docker exec web01 ls /usr/share/nginx/html
# 输出应包含 index.html

# 在宿主机修改文件
echo '<h1>Updated from Mac!</h1>' > ~/nginx-web/index.html

# 浏览器访问 http://localhost:8080，页面内容已更新！
```

再次访问的时候已经给变更成了 Updated from Mac!，并且这个时候我们可以使用 vim 编辑器编辑 ~/nginx-web 中的内容，保存之后就发现页面对应的内容也发生了变化。

```bash
zhangjianhua@U-QCX2V1Y9-0238 zjh % cd ~/nginx-web
zhangjianhua@U-QCX2V1Y9-0238 nginx-web % ls
index.html
zhangjianhua@U-QCX2V1Y9-0238 nginx-web % vim index.html
```

优点：实时同步、便于本地开发、可直接用宿主机编辑器修改。

注意：确保 Docker Desktop（Mac/Windows）已授权该目录共享（默认用户目录如~/通常已授权）。

### 2.2、命名卷

如果我们将 nginx 的配置文件 default.conf 通过绑定挂载的方式映射到容器去，就会导致 nginx 中缺少配置而启动错误，比如：

```bash
docker run -d -p 2001:80 -v /web/ngconf:/etc/nginx --name nginx2001 nginx
```

但是我们在 mac 上发现会报错，因为在 macOS 上使用 Docker Desktop 时，Docker 实际运行在一个轻量级 Linux 虚拟机（VM）中。为了能挂载本地文件（比如-v /host/path:/container/path），Docker 需要明确知道哪些主机目录可以被共享给这个虚拟机。出于安全考虑，Docker Desktop 默认只允许共享某些目录（如/Users, /tmp, /private 等），而不允许任意根目录下的路径（比如/web, /data, /opt/myapp 等）被挂载。

因此这个时候需要使用命名卷，命名卷由 Docker 管理，不直接暴露宿主机路径（但可以找到）。适合生产或数据持久化。由 Docker 管理的存储卷，路径由 Docker 自动分配（通常在/var/lib/docker/volumes/下）。

和绑定挂载的区别，**简单的说就是绑定挂载内容放在主机，容器中使用的时候去外面获取，而命名卷则是将内容放在容器中，主机上的内容只是映射过来的。所以我们一般只会把共享文件通过绑定挂载的方式，而一些应用的配置，则通过命名卷的方式。**

**特点：source 是一个卷名称（非路径），由 Docker 管理。**

```bash
# 创建并使用命名卷（自动创建）
docker run -v my-volume:/app/data nginx

# 显式创建后再使用（推荐用于生产）
docker volume create my-volume
docker run -v my-volume:/app/data nginx
```

**语法规则：**

```bash
docker run -v my-volume:/container/path your-image
```

或：

```bash
docker run --mount type=volume,source=my-volume,target=/container/path your-image
```

**\*\***注意：my-volume 不是路径，只是一个名字。Docker 会在 /var/lib/docker/volumes/my-volume/\_data 存储实际数据。\*\*

优点：跨平台、更安全、适合生产环境。

下面我们就使用这种方式来修改 nginx 的配置，再此之前我们先删除前面的容器，接着开始进行配置：

创建一个命名卷（可选，Docker 会在首次使用时自动创建）：

```bash
docker volume create nginx-html
```

启动容器，挂载该卷：

```bash
docker run -d \
  --name web01 \
  -p 8080:80 \
  -v nginx-html:/usr/share/nginx/html \
  nginx:latest
```

问题来了：卷初始是空的！Nginx 镜像自带的 index.html 不会被复制进去（因为挂载会覆盖容器内目录）。所以需要先从原镜像复制默认文件到卷中：

```bash
 #启动一个临时容器，把默认文件拷出来
docker run --rm -v nginx-html:/target nginx:latest cp -r /usr/share/nginx/html/. /target/
```

现在容器里的网页就是默认内容了。但想在宿主机编辑？需要找到卷的实际路径：

```bash
docker volume inspect nginx-html
```

输出内容为：

```json
[
  {
    "CreatedAt": "2025-12-09T02:51:07Z",
    "Driver": "local",
    "Labels": null,
    "Mountpoint": "/var/lib/docker/volumes/nginx-html/_data",
    "Name": "nginx-html",
    "Options": null,
    "Scope": "local"
  }
]
```

但在 macOS 或 Windows 上，这个路径是在 Docker 虚拟机内部，无法直接访问！所以命名卷不适合在 Mac 或 Windows 上直接编辑文件（除非用 docker cp 或进入容器操作）。如果坚持要用命名卷并在宿主机编辑（仅 Linux 可行），或者可以这样间接操作：

```bash
# 从卷中拷出文件到本地
docker run --rm -v nginx-html:/source -v $(pwd):/backup alpine cp -r /source/. /backup/nginx-from-volume/

# 编辑后拷回去
docker run --rm -v nginx-html:/target -v $(pwd)/my-edit:/source alpine cp -r /source/. /target/
```

- 优点：跨容器共享、Docker 管理、适合数据库等持久化数据。
- 缺点：在非 Linux 系统上难以直接编辑文件，不适合前端开发热更新。

**和绑定挂载对比：**

| 特性               | 命名卷（Named Volume）        | 绑定挂载（Bind Mount）                            |
| ------------------ | ----------------------------- | ------------------------------------------------- |
| docker run 示例    | -v myvol:/path                | -v /host/path:/container/path                     |
| source 类型        | 卷名称（字符串）              | 宿主机绝对路径（或 Compose 中的相对路径）         |
| 路径要求           | 任意合法名称（如 db_data）    | 必须是真实存在的路径（或 Docker 会报错/创建目录） |
| Compose 中相对路径 | ❌ 不适用（会被视为绑定挂载） | ✅ ./data 表示绑定挂载                            |
| 是否需要预创建     | 否（自动创建）                | 否（但路径不存在时行为不同）                      |
| 显式类型声明       | type: volume                  | type: bind                                        |

### 2.3、tmpfs 挂载（内存挂载）

tmpfs 是把目录挂载到内存，容器重启后数据丢失，常用于临时缓存或敏感信息（如 /run/secrets）。

这个方式不适合当前的需求（因为上面希望持久化并编辑文件）。

示例：

```bash
docker run -d --name web01 -p 8080:80 --tmpfs /usr/share/nginx/html nginx
```

这样/usr/share/nginx/html 是空的，且无法从宿主机访问！
