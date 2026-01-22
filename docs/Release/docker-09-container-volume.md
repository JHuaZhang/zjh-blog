---
group:
  title: Docker
order: 9
title: 容器卷介绍

nav:
  title: 发布部署
  order: 2
---

## 1、介绍

前面我们介绍到了容器目录挂载，以及命名卷，那么这个容器卷又是什么呢？实际上 Docker 容器卷（Volume）和容器目录（Container Directory）不是同一个概念，但它们密切相关。

Docker 容器卷（Volumes）是用于持久化存储容器数据的一种机制。容器默认情况下使用可写层（writable layer）来存储数据，但这些数据在容器删除后会丢失。卷则提供了独立于容器生命周期的持久化存储。

**主要特点：**

- 持久性：卷中的数据在容器删除后仍然存在。
- 共享：卷可以被多个容器同时挂载，实现数据共享。
- 备份和迁移：卷可以方便地备份和迁移。

**容器卷和目录挂载的区别：**

| 项目     | 容器目录（Container Directory）            | Docker 卷（Volume）                                        |
| -------- | ------------------------------------------ | ---------------------------------------------------------- |
| 定义     | 容器内部的文件系统路径（如/app, /var/log） | Docker 管理的持久化存储单元，用于保存数据                  |
| 生命周期 | 随容器创建而存在，随容器删除而丢失         | 独立于容器，即使容器删除，数据仍保留                       |
| 存储位置 | 在容器的可写层（UnionFS 的顶层）           | 默认在宿主机的/var/lib/docker/volumes/下（由 Docker 管理） |
| 用途     | 应用运行时读写文件的地方                   | 持久化数据（如数据库文件、配置、日志）                     |

:::color1
**简单说：卷是“外部存储”，容器目录是“内部路径”；卷可以挂载到容器目录上，实现数据持久化。**

:::

它们如何关联？——通过“挂载（Mount）”

Docker 允许将一个 Volume（或绑定挂载） 挂载到容器内的某个目录上：

```yaml
# 示例：将名为 my-volume 的卷挂载到容器的 /app 目录
docker run -v my-volume:/app my-image
```

此时：

- 容器内的 /app 目录（原本是容器镜像的一部分）被覆盖。
- 所有对 /app 的读写操作，实际上发生在 Volume my-volume 中。
- 即使容器删除，my-volume 中的数据依然存在。

## 2、容器卷的类型

### 2.1、绑定挂载

在运行容器时通过 -v 指定主机上的一个具体路径和容器内的路径。这里就直接 cv 上一章节的内容了。

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

### 2.2、匿名卷

在运行容器时通过 -v 指定容器内的路径，但不在主机上指定具体路径，Docker 会自动在主机上创建一个随机目录作为卷。

```yaml
docker run -d -v /data nginx
```

这会在主机上创建一个匿名卷，并挂载到容器的 /data 目录。

### 2.3、具名卷(命名券)

在运行容器时通过 -v 指定一个卷名和容器内的路径，Docker 会使用该卷名在主机上创建一个目录。

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

## 3、容器卷的读写规则

在 Docker 中，挂载卷（volumes）或绑定挂载（bind mounts）时，可以设置读写权限。默认情况下，挂载的卷是可读写的，但我们可以通过添加:ro 或:rw 来明确指定。

**读写权限设置：**

- 读写（read-write，默认）：允许容器内对挂载的卷进行读写操作。
- 只读（read-only）：容器内只能读取卷的内容，不能写入。

**语法：**

①、对于-v 或--volume 标志（较旧的语法）

```bash
# 读写（默认）
docker run -v volume_name:/path/in/container:rw image_name

# 只读
docker run -v volume_name:/path/in/container:ro image_name
```

②、对于--mount 标志（更新的语法）

```bash
# 读写（默认）
docker run --mount source=volume_name,target=/path/in/container,readwrite image_name

# 只读
docker run --mount source=volume_name,target=/path/in/container,readonly image_name
```

**不同挂载类型的权限：**

- 命名卷
  - 默认权限：读写 rw。
  - 支持设置为只读。
- 绑定挂载
  - 默认权限：读写 rw。
  - 支持设置为只读。
  - 注意：如果主机上的目录或文件权限限制，容器内的权限也会相应受限。
- 匿名卷
  - 默认权限：读写 rw。
  - 通常不设置为只读，因为匿名卷主要用于临时存储，容器删除后卷会被清理。

**多个挂载点的权限：**

一个容器可以同时有多个挂载点，每个挂载点可以单独设置权限。

```bash
docker run -d \
  --name myapp \
  -v data-volume:/app/data:rw \
  -v config-volume:/app/config:ro \
  -v /host/logs:/app/logs:rw \
  myapp:latest
```

**注意事项：**

只读卷：容器内进程不能修改只读卷中的任何文件，也不能在只读卷中创建新文件。尝试写入会得到“只读文件系统”的错误。

权限继承：容器内进程对卷中文件的访问权限还受文件本身的权限和容器内用户身份的影响。

SELinux/AppArmor：在启用 SELinux 或 AppArmor 的系统上，可能会对容器的访问有额外的限制。

**使用场景：**

- 只读场景：
  - 配置文件：容器只需要读取配置，不允许修改。
  - 静态资源：如 Web 服务器的静态文件，防止被容器修改。
  - 共享代码：在开发环境中，将代码挂载为只读，防止容器内测试修改代码。
- 读写场景：
  - 数据持久化：如数据库数据目录、应用程序生成的文件等。
  - 开发环境代码挂载：需要容器内修改代码并立即生效。

**检查卷的挂载权限：**

可以使用 docker inspect 命令查看容器的挂载信息，包括权限设置。

```bash
docker inspect container_name --format='{{json .Mounts}}' | jq
```

输出示例：

```json
[
  {
    "Type": "volume",
    "Name": "nginx-data",
    "Source": "/var/lib/docker/volumes/nginx-data/_data",
    "Destination": "/usr/share/nginx/html",
    "Driver": "local",
    "Mode": "ro",
    "RW": false,
    "Propagation": ""
  }
]
```

其中"RW": false 表示只读。

注意：一旦容器创建，挂载点的权限就不能动态修改。如果需要更改权限，必须重新创建容器。

**实际应用场景：**

场景 1：配置文件的只读访问：

```bash
# 配置文件只读，防止容器修改
docker run -d \
  --name nginx \
  -v nginx-config:/etc/nginx:ro \
  -v nginx-logs:/var/log/nginx:rw \
  nginx:alpine
```

场景 2：数据库数据保护：

```bash
# 数据库数据目录读写，但备份目录只读挂载
docker run -d \
  --name postgres \
  -v pgdata:/var/lib/postgresql/data:rw \
  -v backup:/backup:ro \
  -e POSTGRES_PASSWORD=secret \
  postgres:14
```

场景 3：多容器共享数据：

```bash
# 生产者可读写，消费者只读
docker volume create shared-data

# 生产者容器（读写）
docker run -d \
  --name producer \
  -v shared-data:/data:rw \
  producer-app

# 消费者容器（只读）
docker run -d \
  --name consumer \
  -v shared-data:/data:ro \
  consumer-app
```

## 4、容器卷继承

容器卷之间的继承通常指的是在创建新容器时，使用已有容器的卷。这可以通过--volumes-from 参数来实现。这样，新容器可以访问已有容器挂载的卷，实现数据共享。

**使用--volumes-from 继承卷：**

```bash
docker run --volumes-from <源容器> [其他选项] <镜像>
```

基础使用示例：

```bash

# 1. 创建源容器（有数据卷）
docker run -d \
  --name data-container \
  -v /app/data \
  -v /app/config \
  alpine sleep 3600

# 2. 新容器继承源容器的所有卷
docker run --rm \
  --name consumer \
  --volumes-from data-container \
  alpine ls -la /app/
# 可以看到 /app/data 和 /app/config 目录
```

**实际应用场景：**

场景 1：数据备份

```bash
# 创建备份容器，继承数据容器的卷，并将/data目录备份到主机的当前目录下的backup.tar.gz
docker run --rm --volumes-from data-container -v $(pwd):/backup ubuntu tar czf /backup/backup.tar.gz -C /data .
```

场景 2：数据恢复

```bash
# 创建一个新的数据容器
docker run -d --name new-data-container -v /data ubuntu sleep 1000

# 将备份文件恢复到新容器的卷中
docker run --rm --volumes-from new-data-container -v $(pwd):/backup ubuntu tar xzf /backup/backup.tar.gz -C /data
```

场景 3：多个容器共享数据

```bash
# 创建第一个容器，挂载卷并写入数据
docker run -d --name container1 -v shared-data:/data ubuntu sh -c "echo 'Hello from container1' > /data/file.txt"

# 创建第二个容器，继承container1的卷，读取数据
docker run --rm --volumes-from container1 ubuntu cat /data/file.txt

# 创建第三个容器，同样继承卷，可以追加数据
docker run --rm --volumes-from container1 ubuntu sh -c "echo 'Hello from container2' >> /data/file.txt"
```

场景 4：多个容器共享配置

```bash
# 创建配置容器，挂载配置文件
docker run -d --name config-container -v config:/config ubuntu sleep 1000

# 应用容器1使用配置
docker run -d --name app1 --volumes-from config-container myapp

# 应用容器2使用相同配置
docker run -d --name app2 --volumes-from config-container myapp
```

**注意事项：**

- 删除源容器不会删除卷：使用--volumes-from 只是让新容器可以访问源容器的卷，但卷的生命周期独立于容器。即使删除了源容器，卷仍然存在，除非使用 docker volume rm 删除卷。
- 卷的读写权限：继承的卷的读写权限与源容器中的定义相同。如果源容器中以只读方式挂载，那么继承的容器也只能只读访问。
- 多个容器同时写入：如果多个容器同时写入同一个卷，需要考虑数据一致性问题，特别是当多个容器同时写同一个文件时。
- 容器间卷的传递：可以同时使用多个--volumes-from 参数，从多个容器继承卷。

```bash
docker run --volumes-from container1 --volumes-from container2 ubuntu
```

**卷的生命周期管理：**

- 创建卷：当使用-v 创建卷时，如果卷不存在，Docker 会自动创建。
- 删除卷：删除容器时，可以使用-v 参数同时删除关联的卷（匿名卷），但命名卷不会被自动删除。
- 共享卷的清理：确保在删除所有使用卷的容器后，使用 docker volume prune 清理未使用的卷。

**使用--volumes-from 与只读卷:**

如果源容器以只读方式挂载卷，那么继承的容器也只能只读访问。但也可以在继承时重新指定为读写（如果源容器是读写的），但不能将只读改为读写。

```bash
# 源容器以只读方式挂载卷
docker run -d --name ro-container -v /data:ro ubuntu sleep 1000

# 新容器继承只读卷，无法写入
docker run --rm --volumes-from ro-container ubuntu touch /data/newfile.txt
# touch: cannot touch '/data/newfile.txt': Read-only file system
```

**与--mount 标志的对比:**

--volumes-from 是较旧的语法，但在某些场景下仍然方便。新的--mount 语法更明确，但不支持直接从其他容器继承卷。因此，如果需要从其他容器继承卷，使用--volumes-from 是合适的选择。
