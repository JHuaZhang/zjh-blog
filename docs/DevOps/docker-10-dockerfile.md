---
group:
  title: Docker
order: 10
title: Dockerfile介绍

nav:
  title: DevOps
  order: 2
---


## 1、介绍
Dockerfile 是一个纯文本格式的配置文件，它并非可执行脚本，而是包含了一系列按顺序执行的指令（Instruction）。这些指令定义了构建 Docker 镜像的完整步骤，包括基础镜像选择、文件拷贝、依赖安装、环境配置、容器启动命令等，Docker 引擎会按照指令的先后顺序逐行解析并执行，最终生成一个可复用的 Docker 镜像。

**Dockerfile 核心特性：分层构建：**

Docker 镜像采用分层（Layered）构建机制，这是 Docker 高效复用和轻量化的关键：

+ 指令与分层的对应关系：Dockerfile 中的每一条指令（除少数特殊指令如 WORKDIR、ENV 优化场景外），执行后都会生成一个独立的镜像层，每层都只记录与上一层的差异内容；
+ 分层的优势：分层是可缓存的，当再次构建镜像时，如果某条指令及其之前的指令都没有修改，Docker 会直接复用缓存的镜像层，无需重新执行，大幅提升构建速度；同时，不同镜像可以共享相同的底层镜像层，节省磁盘空间和网络传输成本。

**基本结构：**

Dockerfile 一般由以下部分构成：

1. 基础镜像（Base image）：使用 FROM 指令指定，构建镜像的起点。
2. 维护者信息（可选）：使用 LABEL 或 MAINTAINER（已过时）指令指定。
3. 镜像构建过程中的操作指令：如 RUN、COPY、ADD、WORKDIR 等。
4. 容器启动时执行的指令：如 CMD 或 ENTRYPOINT。

## 2、Docker执行Dockefile的流程
**Docker构建镜像的流程：**

**①、解析Dockerfile**

1. Docker客户端读取Dockerfile内容，并检查语法。
2. 如果Dockerfile中有语法错误，构建过程会立即终止。

**②、发送构建上下文**

1. 构建上下文（context）是Dockerfile所在目录及其子目录中的文件集合。
2. Docker客户端会将整个构建上下文（包括子目录）打包发送给Docker守护进程（daemon）。
3. 因此，为了避免发送不必要的文件，应该使用.dockerignore文件来忽略不需要的文件。

**③、按顺序执行指令**

1. Docker守护进程按照Dockerfile中的指令顺序逐一执行。
2. 每条指令都会创建一个新的镜像层（layer），并提交（commit）这一层的修改。

**④、使用缓存（如果可能）**

1. 在构建过程中，Docker会检查每一条指令是否可以使用缓存。
2. 缓存机制：Docker会从之前构建的镜像中查找是否有相同的指令和相同的父层，如果找到，则直接使用缓存的结果，跳过该指令的执行。
3. 如果某一层指令的缓存失效（例如，指令内容改变或基础镜像更新），那么后续的所有指令都将不使用缓存，而是重新执行。

Docker的缓存机制可以加快构建过程，但有时我们需要避免使用缓存，例如确保获取最新的软件包。可以使用--no-cache选项来禁用缓存。

```bash
docker build --no-cache -t myapp .
```

另外，如果某一层指令的缓存失效，那么后续的指令缓存也会失效。例如，如果COPY app.py /app/中的app.py文件内容发生变化，那么从这一条指令开始，后续的所有指令都不会使用缓存，而是重新执行。

**⑤、生成最终镜像**

1. 所有指令执行完毕后，生成最终的镜像，并存储在本地。

**详细步骤示例：**

假设我们有如下Dockerfile：

```dockerfile
FROM ubuntu:20.04
RUN apt-get update && apt-get install -y python3
COPY app.py /app/
WORKDIR /app
CMD ["python3", "app.py"]
```

**构建命令：**

```bash
docker build -t myapp .
```

**步骤分解：**

1. FROM ubuntu:20.04：
    1. Docker检查本地是否有ubuntu:20.04镜像，如果没有，则从Docker Hub拉取。
    2. 创建第一个镜像层。
2. RUN apt-get update && apt-get install -y python3：
    1. 在一个临时容器中执行apt-get update和apt-get install命令。
    2. 安装完成后，将容器提交为新的镜像层。
3. COPY app.py /app/：
    1. 从构建上下文中复制文件app.py到容器的/app/目录。
    2. 注意：如果app.py文件发生变化，那么这一层缓存会失效，后续指令将重新执行。
4. WORKDIR /app：
    1. 设置工作目录为/app，这个更改会记录在镜像层中。
5. CMD ["python3", "app.py"]：
    1. 设置容器启动时的默认命令，这个命令不会在构建时执行，而是记录在镜像的元数据中。
    2. 构建完成，生成镜像myapp。

**多阶段构建介绍：**

对于多阶段构建，Docker会按照Dockerfile中的多个FROM指令分别构建。每个阶段可以使用不同的基础镜像，并且可以复制之前阶段的文件。这有助于减小最终镜像的大小。

```bash
# 第一阶段：构建
FROM golang:1.16 AS builder
WORKDIR /app
COPY . .
RUN go build -o myapp .

# 第二阶段：运行
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/myapp .
CMD ["./myapp"]
```

在这个例子中，第一阶段使用golang镜像构建应用，第二阶段使用alpine镜像，并只从第一阶段复制构建好的可执行文件。这样，最终镜像只包含运行应用所需的最小文件。

## 3、Dockerfile保留字介绍
Dockerfile的保留字本质是Docker预定义的核心指令，大小写不敏感（官方推荐大写），每条指令对应镜像构建的特定操作，官方文档为[https://docs.docker.com/reference/dockerfile/](https://docs.docker.com/reference/dockerfile/)，下面按使用优先级和常用程度，逐一详细介绍其功能、用法和注意事项。

### 3.1、基础镜像相关指令
#### 3.1.1、FROM - 指定基础镜像（必选首指令）
核心功能：指定构建当前镜像的基础镜像（Base Image），所有后续指令都基于该基础镜像展开，是 Dockerfile 中第一个非注释指令（必选，除非构建 scratch 空镜像）。

**语法格式：**

```dockerfile
# 格式1：指定基础镜像名+标签（标签默认latest，建议显式指定避免版本兼容问题）
FROM <镜像名>:<标签>
# 格式2：构建多阶段镜像时，可为基础镜像指定别名（后续可通过别名引用该镜像层）
FROM <镜像名>:<标签> AS <别名>
```

**示例：**

```dockerfile
# 基础镜像：Ubuntu 22.04 系统
FROM ubuntu:22.04
# 基础镜像：OpenJDK 8 轻量级 Alpine 版本（体积更小）
FROM openjdk:8-jdk-alpine
# 多阶段构建：给Node基础镜像指定别名builder
FROM node:16-alpine AS builder
```

**注意事项：**

+ 若需构建无基础镜像的「空镜像」，可使用 FROM scratch（通常用于构建极简内核程序，如 Go 语言应用）；
+ 标签若不指定，默认使用 latest，但 latest 镜像可能随官方更新变化，建议固定具体版本（如 ubuntu:22.04 而非 ubuntu）。

### 3.2、镜像构建操作指令
#### 3.2.1、RUN - 执行构建时命令
核心功能：在镜像构建过程中，在临时容器内执行命令行命令（如安装软件、配置环境、创建目录等），执行完成后会生成新的镜像层，是镜像环境准备的核心指令。

**语法格式：**

```dockerfile
# 格式1：shell 格式（类似终端直接输入命令，默认使用 /bin/sh -c 执行，支持环境变量替换）
RUN <命令字符串>
# 格式2：exec 格式（推荐，避免 shell 解析带来的问题，参数以JSON数组形式传递）
RUN ["可执行文件", "参数1", "参数2"]
```

**示例：**

```dockerfile
# shell 格式：安装 Nginx（Ubuntu 系统）
RUN apt update && apt install nginx -y && rm -rf /var/lib/apt/lists/*
# exec 格式：创建应用目录（无 shell 解析，更安全）
RUN ["mkdir", "-p", "/usr/local/my-app"]
```

**注意事项：**

+ 尽量将多个命令通过 && 合并为一条 RUN 指令，减少镜像层数量（如上面安装 Nginx 时同时清理 apt 缓存）；
+ exec 格式中，不能使用 shell 内置命令（如 cd、echo $PATH），若需使用需显式指定 shell（如 RUN ["/bin/sh", "-c", "cd /usr/local && mkdir app"]）。

#### 3.2.2、COPY - 本地文件拷贝到镜像
核心功能：将构建上下文目录（docker build 指定的目录）中的本地文件 / 目录，拷贝到镜像的指定路径中，是应用代码 / 配置文件迁移到镜像的常用指令。

**语法格式：**

```dockerfile
# 格式1：拷贝本地单个文件/目录 到 镜像内路径
COPY <本地源路径> <镜像目标路径>
# 格式2：多个本地源文件拷贝到镜像内路径（目标路径必须以 / 结尾，表示目录）
COPY <源路径1> <源路径2> <镜像目标路径/>
# 格式3：使用通配符匹配文件（支持 *、? 等通配符）
COPY <通配符匹配路径> <镜像目标路径>
```

**示例：**

```dockerfile
# 拷贝本地 app.jar 到镜像的 /usr/local/app 目录
COPY app.jar /usr/local/app/
# 拷贝本地 config 目录下所有文件到镜像的 /etc/config 目录
COPY config/ /etc/config/
# 拷贝本地所有 .txt 后缀文件到镜像的 /usr/local/docs 目录
COPY *.txt /usr/local/docs/
```

**注意事项：**

+ 本地源路径必须在构建上下文目录内，不能使用 ../ 引用上下文外的文件；
+ 若镜像目标路径不存在，Docker 会自动递归创建该目录；
+ 拷贝时会保留本地文件的权限属性（如执行权限）。

#### 3.2.3、ADD - 增强版文件拷贝
核心功能：兼容 COPY 的所有功能，同时提供两个额外增强特性，适用于特殊拷贝场景。

**额外增强特性：**

+ 支持从 URL 地址下载资源并拷贝到镜像中；
+ 支持自动解压压缩包文件（如 .tar、.gz、.zip 等）到镜像目标路径（仅支持本地压缩包，URL 下载的压缩包不会自动解压）。

**语法格式：与 COPY 完全一致**

```dockerfile
ADD <源路径/URL> <镜像目标路径>
```

**示例：**

```dockerfile
# 等价于 COPY：拷贝本地 app.jar 到镜像目录
ADD app.jar /usr/local/app/
# 增强1：从 URL 下载 nginx 压缩包到镜像目录（不会自动解压）
ADD https://nginx.org/download/nginx-1.24.0.tar.gz /usr/local/src/
# 增强2：自动解压本地 nginx.tar.gz 到镜像的 /usr/local/nginx 目录
ADD nginx.tar.gz /usr/local/
```

**注意事项：**

+ 若无特殊需求（URL 下载、本地压缩包自动解压），优先使用 COPY（语义更清晰，更易维护）；
+ 从 URL 下载大文件时，不推荐使用 ADD（会增加镜像层体积，建议使用 RUN wget 或 RUN curl，并在后续清理下载文件）。

### 3.3、环境配置相关指令
#### 3.3.1、WORKDIR - 设置工作目录
核心功能：为 Dockerfile 中后续所有指令（RUN、COPY、ADD、CMD、ENTRYPOINT 等）设置统一的工作目录，容器启动后，默认进入该工作目录。

**语法格式：**

```dockerfile
WORKDIR <镜像内目录路径>
```

**示例：**

```dockerfile
# 设置工作目录为 /usr/local/my-app
WORKDIR /usr/local/my-app
# 后续 COPY 指令会将 app.jar 拷贝到 /usr/local/my-app 目录（无需写完整路径）
COPY app.jar ./
# 后续 RUN 指令会在 /usr/local/my-app 目录下执行
RUN ["touch", "app.log"]
```

**注意事项：**

+ 优先使用 WORKDIR 而非 RUN cd 命令（RUN cd 仅在当前指令生效，后续指令会恢复默认目录，而 WORKDIR 永久生效）；
+ 若指定的目录不存在，Docker 会自动创建该目录；
+ 可多次使用 WORKDIR，后续指令会基于前一次的工作目录进行相对路径拼接（如 WORKDIR /usr/local → WORKDIR app，最终工作目录为 /usr/local/app）。

#### 3.3.2、ENV - 设置环境变量
核心功能：在镜像中设置环境变量，该变量可在「镜像构建过程中」（供 RUN、COPY 等指令使用）和「容器运行时」（供应用程序使用）生效，支持全局引用。

**语法格式：**

```dockerfile
# 格式1：单个环境变量赋值
ENV <变量名> <变量值>
# 格式2：多个环境变量赋值（用空格分隔，推荐批量设置时使用）
ENV <变量名1>=<值1> <变量名2>=<值2> ...
```

**示例：**

```dockerfile
# 格式1：设置 JAVA_HOME 环境变量
ENV JAVA_HOME /usr/local/jdk8
# 格式2：批量设置应用目录和端口变量
ENV APP_HOME=/usr/local/my-app APP_PORT=8080
# 引用环境变量：WORKDIR 使用 APP_HOME 变量
WORKDIR $APP_HOME
# 引用环境变量：RUN 指令中使用 JAVA_HOME 变量
RUN echo "Java path: $JAVA_HOME"
```

**注意事项：**

+ 环境变量值若包含空格，需用引号包裹（如 ENV APP_NAME "My Java App"）；
+ 容器运行时，可通过 docker run -e <变量名>=<新值> 覆盖镜像中预设的环境变量；
+ 若需永久生效（跨构建阶段），优先使用 ENV，而非 RUN export <变量名>=<值>（后者仅在当前 RUN 指令生效）。

#### 3.3.3、ARG - 设置构建参数（临时环境变量）
核心功能：定义构建时临时参数，作用类似 ENV，但仅在「镜像构建过程中」生效，容器运行时不会保留该变量，是动态传递构建参数的核心指令。

**语法格式：**

```dockerfile
# 格式1：定义构建参数（默认值可选，不指定则构建时需通过 --build-arg 传递）
ARG <参数名>[=<默认值>]
# 格式2：批量定义构建参数
ARG <参数名1>[=<默认值1>] <参数名2>[=<默认值2>]
```

**示例：**

```dockerfile
# 定义构建参数 APP_VERSION，默认值为 v1.0
ARG APP_VERSION=v1.0
# 构建过程中引用该参数：拷贝对应版本的应用包
COPY app-${APP_VERSION}.jar /usr/local/app/app.jar
```

构建时可通过 --build-arg 覆盖默认值：

```dockerfile
docker build -t my-app:v2.0 --build-arg APP_VERSION=v2.0 .
```

**注意事项：**

+ ARG 与 ENV 的核心区别：ARG 仅构建时有效，容器运行时不可见；ENV 构建时和运行时均有效；
+ 若 ARG 未指定默认值，构建时必须通过 --build-arg <参数名>=<值> 传递，否则构建会失败；
+ Docker 内置了一些默认 ARG 参数（如 HTTP_PROXY、HTTPS_PROXY），可直接使用无需定义。

#### 3.3.4、EXPOSE - 声明容器监听端口
核心功能：声明容器运行时将要监听的网络端口（TCP/UDP），仅作为「说明文档」，不自动完成端口映射（告知使用者该容器需要映射哪个端口）。

**语法格式：**

```dockerfile
# 格式1：声明 TCP 端口（默认协议为 TCP）
EXPOSE <端口1> <端口2> ...
# 格式2：显式声明协议（TCP/UDP）
EXPOSE <端口>/<协议>
```

**示例：**

```dockerfile
# 声明容器监听 8080 端口（TCP）
EXPOSE 8080
# 声明 80 端口（TCP）和 53 端口（UDP）
EXPOSE 80 53/udp
```

**注意事项：**

+ EXPOSE 仅为声明，不会自动将容器端口映射到主机端口；
+ 容器运行时，需通过 docker run -p <主机端口>:<容器端口> 手动完成端口映射（如 docker run -p 8080:8080 my-app）；
+ 声明端口有助于提高镜像的可维护性，使用者可快速知晓容器的端口用途。

#### 3.3.5、VOLUME - 定义匿名 / 命名数据卷
核心功能：在镜像中定义数据卷挂载点，容器启动时，会自动创建对应的匿名数据卷（或关联命名数据卷），用于持久化存储容器内的动态数据（如日志、数据库文件等）。

核心优势：数据卷独立于容器生命周期，容器删除后，数据卷中的数据不会丢失，可实现数据持久化和容器间数据共享。

**语法格式：**

```dockerfile
# 格式1：JSON 数组格式（推荐）
VOLUME ["<容器内挂载路径1>", "<容器内挂载路径2>"]
# 格式2：shell 格式
VOLUME <容器内挂载路径1> <容器内挂载路径2>
```

**示例：**

```dockerfile
# 格式1：定义两个数据卷挂载点，存储日志和数据库数据
VOLUME ["/var/log/my-app", "/var/lib/mysql"]
# 格式2：定义单个数据卷挂载点
VOLUME /tmp/data
```

**注意事项：**

+ 容器启动时，若未手动指定主机目录或命名数据卷，Docker 会自动创建匿名数据卷（路径为 /var/lib/docker/volumes/[随机ID]/_data）；
+ 若需指定主机目录挂载，可在容器运行时通过 docker run -v <主机目录>:<容器内挂载路径> 覆盖镜像中的 VOLUME 配置；
+ 建议将动态数据（可修改、需持久化）存储在数据卷中，静态数据（如应用程序、配置模板）直接拷贝到镜像中。

### 3.4、 容器启动相关指令
#### 3.4.1、CMD - 指定容器默认启动命令
核心功能：指定容器启动时默认执行的命令，当容器启动时，若未在 docker run 命令后附加自定义命令，会自动执行 CMD 中定义的命令；若附加了自定义命令，会覆盖 CMD 命令。

**语法格式：**

```dockerfile
# 格式1：exec 格式（推荐，无 shell 解析，更稳定）
CMD ["可执行文件", "参数1", "参数2"]
# 格式2：shell 格式（默认使用 /bin/sh -c 执行，支持环境变量）
CMD <命令字符串>
# 格式3：为 ENTRYPOINT 提供默认参数（仅与 ENTRYPOINT 配合使用）
CMD ["参数1", "参数2"]
```

**示例：**

```dockerfile
# 格式1：启动 Java 应用（推荐）
CMD ["java", "-jar", "app.jar"]
# 格式2：启动 Nginx 并前台运行
CMD "nginx", "-g", "daemon off;"
# 格式3：与 ENTRYPOINT 配合，提供默认参数
ENTRYPOINT ["java", "-jar"]
CMD ["app.jar"]
```

**注意事项：**

+ 一个 Dockerfile 中只能有一个有效 CMD 指令，若写多个，仅最后一个 CMD 生效；
+ exec 格式中，不能使用 shell 内置命令（如 cd、echo），若需使用需显式指定 shell；
+ 容器运行时，可通过 docker run <镜像名> <自定义命令> 覆盖 CMD 命令（如 docker run my-app java -jar app-dev.jar 会覆盖原 CMD 命令）。

#### 3.4.2、ENTRYPOINT - 指定容器入口程序（不可覆盖）
核心功能：指定容器的入口程序 / 命令，与 CMD 类似，但 ENTRYPOINT 命令不会被 docker run 后的自定义命令覆盖，自定义命令只会作为参数传递给 ENTRYPOINT 命令，适用于需要固定入口程序的场景。

**语法格式：**

```dockerfile
# 格式1：exec 格式（推荐，无 shell 解析，支持接收 CMD 或 docker run 传递的参数）
ENTRYPOINT ["可执行文件", "固定参数1", "固定参数2"]
# 格式2：shell 格式（不支持接收外部参数，不推荐使用）
ENTRYPOINT <命令字符串>
```

**示例：**

```dockerfile
# 示例1：单独使用 ENTRYPOINT（固定启动命令，无默认参数）
ENTRYPOINT ["java", "-jar", "app.jar"]
# 示例2：与 CMD 配合（ENTRYPOINT 固定入口，CMD 提供默认参数，可被覆盖）
ENTRYPOINT ["java", "-jar"]  # 固定入口：java -jar
CMD ["app.jar"]              # 默认参数：app.jar，可被 docker run 传递的参数覆盖
```

容器运行时传递参数覆盖 CMD 示例：

```dockerfile
# 此时容器执行的命令为：java -jar app-dev.jar（CMD 的 app.jar 被替换为 app-dev.jar）
docker run my-app app-dev.jar
```

**注意事项：**

+ 一个 Dockerfile 中只能有一个有效 ENTRYPOINT 指令，若写多个，仅最后一个生效；
+ 若需强制覆盖 ENTRYPOINT 命令，可在 docker run 时添加 --entrypoint 参数（如 docker run --entrypoint "python" my-app app.py）；
+ 优先使用 exec 格式，shell 格式会导致 ENTRYPOINT 无法接收 CMD 或 docker run 传递的参数。

### 3.5、高级构建指令
#### 3.5.1、ONBUILD - 定义镜像后置构建触发器
核心功能：为当前镜像定义后置构建触发器，当前镜像不会执行该指令，只有当其他镜像以当前镜像为基础镜像（使用 FROM <当前镜像>）时，才会在其子镜像的构建过程中，自动执行 ONBUILD 中定义的指令，适用于构建基础模板镜像。

**语法格式：**

```dockerfile
ONBUILD <其他指令>  # 可跟随 RUN、COPY、ADD 等大部分指令
```

**示例：**

①、构建基础模板镜像（base-app）的 Dockerfile：

```dockerfile
FROM node:16-alpine
# 定义后置触发器：当子镜像基于该镜像构建时，自动拷贝本地 src 目录到镜像
ONBUILD COPY src/ /usr/local/app/src/
# 定义后置触发器：当子镜像基于该镜像构建时，自动安装依赖
ONBUILD RUN npm install --prefix /usr/local/app
```

②、构建子镜像（my-node-app）的 Dockerfile（基于 base-app）：

```dockerfile
# 基于 base-app 镜像构建，会自动执行 base-app 中的 ONBUILD 指令
FROM base-app
# 其他子镜像专属指令
WORKDIR /usr/local/app
CMD ["npm", "start"]
```

**注意事项：**

+ ONBUILD 指令不会在当前镜像构建时执行，仅对子镜像生效；
+ 不能在 ONBUILD 中嵌套使用 ONBUILD 指令；
+ 若子镜像构建时，ONBUILD 指令执行失败，子镜像构建会直接终止。

#### 3.5.2、LABEL - 添加镜像元数据（标签）
核心功能：为镜像添加自定义元数据（键值对格式），用于描述镜像的作者、版本、用途等信息，可通过 docker inspect <镜像名> 命令查看这些元数据，提高镜像的可管理性。

**语法格式：**

```dockerfile
# 格式1：单个标签
LABEL <key>=<value>
# 格式2：多个标签（用空格分隔，推荐批量添加时使用）
LABEL <key1>=<value1> <key2>=<value2> ...
# 格式3：多行标签（用 \ 换行，提高可读性）
LABEL <key1>=<value1> \
      <key2>=<value2> \
      <key3>=<value3>
```

**示例：**

```dockerfile
# 批量添加镜像元数据
LABEL author="Zhang San" \
      version="1.0.0" \
      description="This is a Java web application" \
      maintainer="zhangsan@example.com"
```

**注意事项：**

+ 标签值若包含空格或特殊字符，需用引号包裹（如 LABEL description="My App v1.0"）；
+ 若多次添加相同键的标签，后面的标签值会覆盖前面的；
+ 与 ENV 的区别：LABEL 仅用于描述镜像元数据，不参与环境变量传递，容器运行时不可见。

#### 3.5.3、USER - 指定执行后续指令的用户 / 用户组
核心功能：指定 Dockerfile 中后续所有指令（RUN、CMD、ENTRYPOINT 等）的执行用户，以及容器启动后默认的登录用户，适用于需要非 root 用户运行应用的场景（提高安全性）。

**语法格式：**

```dockerfile
# 格式1：指定用户名
USER <用户名>
# 格式2：指定用户ID（UID）
USER <UID>
# 格式3：指定用户名:用户组
USER <用户名>:<用户组>
# 格式4：指定用户ID:用户组ID（GID）
USER <UID>:<GID>
```

**示例：**

```dockerfile
# 1. 先创建非 root 用户 appuser（RUN 指令默认以 root 用户执行）
RUN useradd -m appuser
# 2. 指定后续指令以 appuser 用户执行
USER appuser
# 3. 后续 RUN 指令会以 appuser 身份执行，而非 root
RUN touch /home/appuser/app.log
# 4. 容器启动后，默认登录用户为 appuser
CMD ["java", "-jar", "app.jar"]
```

**注意事项：**

+ 若指定的用户 / 用户组不存在，需先通过 RUN useradd 等命令创建，否则构建会失败；
+ 若需临时切换回 root 用户，可在 RUN 指令中使用 sudo（需先安装 sudo 并配置权限）；
+ 生产环境中，建议使用非 root 用户运行应用，避免容器被入侵后获取主机 root 权限。

#### 3.5.4、STOPSIGNAL - 指定容器停止信号
核心功能：指定当 Docker 停止容器时，发送给容器内主进程的系统信号，用于优雅停止容器内的应用程序（而非强制杀死进程），避免数据丢失或资源泄露。

**语法格式：**

```dockerfile
STOPSIGNAL <信号名>  # 或 信号编号
```

**示例：**

```dockerfile
# 指定停止信号为 SIGTERM（默认信号，优雅终止进程）
STOPSIGNAL SIGTERM
# 等价于信号编号 15
STOPSIGNAL 15
# 若应用需要 SIGINT 信号（如 Ctrl + C 触发的信号）
STOPSIGNAL SIGINT
```

**注意事项：**

+ Docker 默认停止容器的信号为 SIGTERM（编号 15），若应用不支持该信号，可通过 STOPSIGNAL 自定义；
+ 若发送 STOPSIGNAL 后，容器内进程在超时时间（默认 10 秒）内未停止，Docker 会发送 SIGKILL（编号 9）信号强制杀死进程；
+ 仅适用于容器内的主进程（PID 1），子进程的停止需由主进程负责管理。

#### 3.5.5、HEALTHCHECK - 配置容器健康检查
核心功能：配置 Docker 对容器的健康状态检测，Docker 会定期执行检测命令，根据命令执行结果判断容器是否健康运行，便于及时发现容器内应用的异常状态。

**语法格式：**

```dockerfile
# 格式1：配置健康检查命令
HEALTHCHECK [选项] CMD <检测命令>
# 格式2：禁用基础镜像中的健康检查（若基础镜像配置了 HEALTHCHECK，子镜像可禁用）
HEALTHCHECK NONE
```

**常用选项：**

+ --interval=<时间>：健康检查间隔时间（默认 30 秒）；
+ --timeout=<时间>：检测命令超时时间（默认 30 秒）；
+ --retries=<次数>：检测失败后，重试多少次判定为容器不健康（默认 3 次）；
+ --start-period=<时间>：容器启动后，延迟多久开始第一次健康检查（默认 0 秒，适用于启动较慢的应用）。

**示例：**

```dockerfile
# 配置健康检查：每 10 秒检测一次，超时 5 秒，重试 3 次后判定为不健康
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1
```

**检测结果说明：**

+ 检测命令退出码为 0：容器健康；
+ 检测命令退出码为 1：容器不健康；
+ 检测命令退出码为 2：保留状态，Docker 不做处理。

**注意事项：**

+ 一个 Dockerfile 中只能有一个 HEALTHCHECK 指令，若写多个，仅最后一个生效；
+ 检测命令需能在容器内执行，若使用 curl、wget 等工具，需先在镜像中安装；
+ 可通过 docker ps 命令查看容器健康状态（STATUS 列会显示 healthy/unhealthy）。

## 4、docker build详细介绍
### 4.1、docker build介绍
docker build 是 Docker 中用于基于 Dockerfile 构建自定义镜像的核心命令，它会读取指定目录下的 Dockerfile 和相关文件，按指令完成镜像构建，具体用法如下：

**基本语法格式：**

```dockerfile
# 完整语法
docker build [OPTIONS] <上下文目录/URL/->
# 最常用简化格式（指定镜像标签 + 本地上下文目录）
docker build -t <镜像名称>:<标签> <Dockerfile所在目录路径>
```

**关键参数说明：**

| 参数 | 全称 | 核心作用 |
| --- | --- | --- |
| -t/--tag | --tag | 为构建的镜像指定「名称：标签」（标签默认latest），方便后续查找和使用，可多次指定多个标签 |
| -f/--file | --file | 指定非默认名称 / 路径的 Dockerfile（默认文件名是Dockerfile，无需指定） |
| --build-arg | - | 传递 Dockerfile 中定义的ARG构建参数（覆盖ARG默认值） |
| --no-cache | - | 禁用镜像构建缓存，强制重新执行所有 Dockerfile 指令（适用于需要完全更新的场景） |
| --pull | - | 强制拉取FROM指令指定的基础镜像的最新版本（即使本地已存在该镜像） |


**示例：**

**①、默认场景（Dockerfile 名为 Dockerfile，在当前目录）**

```dockerfile
# 构建名为 my-app、标签为 v1.0 的镜像，使用当前目录的 Dockerfile
docker build -t my-app:v1.0 .
```

说明：. 表示「构建上下文目录」（当前目录），Docker 会读取该目录下所有文件用于构建。

**②、指定非默认名称的 Dockerfile**

```dockerfile
# 若 Dockerfile 命名为 Dockerfile.dev（非默认名称），用 -f 指定文件路径
docker build -t my-app:dev -f Dockerfile.dev .
# 若 Dockerfile 在子目录中（如 ./docker/Dockerfile）
docker build -t my-app:v2.0 -f ./docker/Dockerfile .
```

**③、传递 ARG 构建参数**

```dockerfile
# 若 Dockerfile 中定义了 ARG APP_VERSION=v1.0，通过 --build-arg 覆盖
docker build -t my-app:v3.0 --build-arg APP_VERSION=v3.0 .
```

**④、禁用缓存强制构建**

```dockerfile
# 忽略所有缓存层，重新执行每一条 Dockerfile 指令（适用于依赖更新场景）
docker build -t my-app:latest --no-cache .
```

### 4.2、docker build操作Dockerfile的完整执行流程
<font style="color:rgba(0, 0, 0, 0.85) !important;">docker build</font><font style="color:rgb(0, 0, 0);">并非简单逐行执行 Dockerfile 指令，而是遵循「准备 - 执行 - 收尾」的完整流程，具体步骤如下：</font>

**<font style="color:rgb(0, 0, 0);">步骤 1： 前置准备阶段（构建前的初始化）</font>**

1. 解析命令参数：Docker 客户端（CLI）首先解析docker build命令中的参数（如-t标签、-f指定的 Dockerfile 路径、上下文目录等）；
2. 确定 Dockerfile 位置：
    - 若未指定-f参数，默认在「上下文目录」下查找名为Dockerfile（无后缀）的文件；
    - 若指定-f参数，按参数路径定位 Dockerfile（可不在上下文目录内，但不推荐）；
3. 打包构建上下文：
    - Docker 会将「上下文目录」下的所有文件和目录递归打包成一个临时压缩包（.dockerignore文件中配置的文件 / 目录会被排除，减少打包体积）；
    - 核心目的：Docker 客户端与 Docker 守护进程（daemon）可能不在同一环境（如远程构建），打包上下文是为了让守护进程获取到构建所需的所有文件（如COPY指令需要的本地应用包、配置文件等）；
4. 发送请求与语法校验：
    - 客户端将「上下文压缩包」+「Dockerfile 内容」+「构建参数」发送给 Docker 守护进程（实际构建工作由守护进程完成，客户端仅负责发起指令）；
    - 守护进程先对 Dockerfile 进行语法校验（如指令拼写错误、FROM非首行、指令格式非法等），若校验失败，直接终止构建并返回错误信息。

**步骤 2： 核心执行阶段（Dockerfile 指令的逐行执行）**

语法校验通过后，进入镜像构建的核心阶段，核心是「基于临时容器，逐行执行指令，分层生成镜像：

1. 初始化构建环境：
    - 守护进程根据 Dockerfile 中FROM指令，拉取对应的基础镜像（本地不存在则从Docker Hub 等仓库下载）；
    - 基于该基础镜像创建一个临时容器（该容器仅用于承载指令执行，无对外暴露端口，构建完成后会被清理），所有 Dockerfile 指令的执行都在这个临时容器内进行；
2. 逐行执行 Dockerfile 指令：
    - 守护进程从上到下、按顺序解析 Dockerfile 中的每一条非注释指令（#开头为注释，直接跳过）；
    - 对每一条指令，执行对应操作后，通过docker commit操作生成一个新的镜像层（只读层），该镜像层会被缓存（后续构建可复用）；
    - 特殊指令处理：WORKDIR、ENV、EXPOSE等指令不生成独立的可写镜像层，仅修改镜像的「元数据」（如工作目录配置、环境变量配置），元数据会随commit操作保存到镜像中；
3. 缓存复用判断（关键优化步骤）：
    - 执行每条指令前，守护进程会先检查本地是否存在该指令对应的「缓存镜像层」；
    - 判断依据：「当前指令内容完全一致」+「上一层镜像的哈希值完全一致」，两者同时满足才会复用缓存层，跳过该指令的执行；
    - 若某条指令缓存失效（如修改了COPY的源文件、变更了RUN命令），则该指令及后续所有指令的缓存都会失效，需重新执行并生成新镜像层；
4. 多阶段构建处理（可选）：
    - 若 Dockerfile 使用FROM ... AS ...定义多阶段构建，守护进程会按「阶段顺序」依次执行每个阶段的指令，每个阶段对应一个临时镜像；
    - 后续阶段可通过COPY --from=<阶段别名/镜像ID>从前面的阶段拷贝文件（实现「构建环境与运行环境分离」，减小最终镜像体积）。

**步骤 3： 收尾阶段（构建完成后的处理）**

1. 清理临时资源：守护进程销毁构建过程中使用的所有临时容器（释放资源，避免冗余），仅保留生成的镜像层；
2. 封装最终镜像：将所有生成的镜像层（基础镜像层 + 指令生成的新镜像层）按顺序叠加，结合镜像元数据（环境变量、工作目录、启动命令等），封装成一个完整的、可复用的 Docker 镜像；
3. 关联镜像标签：若通过-t参数指定了镜像标签，守护进程会将该标签与最终镜像的 ID 进行关联（相当于给镜像起一个「易记名称」）；
4. 返回构建结果：守护进程将镜像 ID、标签、构建耗时等信息返回给 Docker 客户端，在终端输出构建成功提示；若构建过程中出现错误（如RUN命令执行失败、COPY找不到源文件），会终止构建并输出错误日志，同时清理已生成的临时镜像层。

## 5、举例介绍
### 5.1、node项目举例
```bash
# 1. 创建项目目录并进入
mkdir my-node-app && cd my-node-app

# 2. 初始化 Node.js 项目（默认生成 package.json）
npm init -y

# 3. 安装一个简单依赖（如 express，用于启动 web 服务）
npm install express --save

# 4. 创建入口文件 app.js
touch app.js
```

```javascript
// app.js：一个简单的 Express Web 服务
const express = require('express');
const app = express();
const port = 3000; // 服务端口

// 路由配置
app.get('/', (req, res) => {
  res.send('Hello Docker + Node.js + Git! 🚀');
});

// 启动服务
app.listen(port, () => {
  console.log(`Node.js 服务运行在 http://localhost:${port}`);
});
```

```bash
mkdir docker-node-demo && cd docker-node-demo
touch Dockerfile
```

```dockerfile
# 1. 指定基础镜像：Node.js 官方镜像（选择 LTS 版本，alpine 轻量化，体积更小）
FROM node:18-alpine

# 2. 安装 Git（alpine 镜像默认无 Git，需手动安装，用于拉取远程代码）
RUN apk add --no-cache git

# 3. 设置工作目录（后续所有操作都在该目录下执行）
WORKDIR /usr/local/node-app

# 4. 拉取 GitHub 远程 Node.js 项目代码（替换为你的远程仓库地址）
# 若为私有仓库，需先配置 SSH 密钥，下文有补充说明
RUN git clone https://github.com/你的用户名/my-node-app.git .

# 5. 安装项目依赖（npm install 读取 package.json 并安装依赖）
RUN npm install --production # --production：仅安装生产环境依赖，减小镜像体积

# 6. 声明容器监听端口（与 Node.js 项目中的 port 一致，此处为 3000）
EXPOSE 3000

# 7. 容器启动命令：启动 Node.js 项目
CMD ["node", "app.js"]
```

### 5.2、react项目举例
```bash
my-react-app/
├── src/                # 业务代码目录
├── public/             # 静态资源目录
├── package.json        # 依赖配置文件（包含 build 脚本）
├── .gitignore          # Git 忽略文件（已排除 node_modules、build 等）
└── README.md
```

确保 package.json 中包含 build 脚本（默认已有）：

```bash
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build"  // 构建静态文件的核心脚本
}
```

在任意空目录下（如 docker-react-demo）创建 Dockerfile：

```bash
mkdir docker-react-demo && cd docker-react-demo
touch Dockerfile
```

编写 Dockerfile 内容：

```bash
# ===== 阶段1：构建阶段（使用 Node 镜像构建 React 静态文件）=====
FROM node:18-alpine AS builder

# 安装 Git（用于拉取远程 React 代码）
RUN apk add --no-cache git

# 设置工作目录
WORKDIR /usr/local/react-build

# 拉取远程 React 项目代码（替换为你的远程仓库地址，HTTPS 方式）
RUN git clone https://github.com/你的用户名/my-react-app.git .

# 安装项目依赖（完整依赖，用于构建）
RUN npm install

# 构建 React 静态文件（执行 npm run build，生成 build 目录）
RUN npm run build

# ===== 阶段2：运行阶段（使用 Nginx 镜像托管静态文件）=====
FROM nginx:alpine

# 从构建阶段（builder）拷贝构建好的静态文件到 Nginx 默认站点目录
# Nginx 默认站点目录：/usr/share/nginx/html
COPY --from=builder /usr/local/react-build/build /usr/share/nginx/html

# 声明 Nginx 监听端口（默认 80 端口，无需修改）
EXPOSE 80

# Nginx 容器默认启动命令（无需手动指定，Nginx 镜像已内置）
# CMD ["nginx", "-g", "daemon off;"]
```



