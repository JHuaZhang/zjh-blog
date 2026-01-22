---
group:
  title: Docker
order: 6
title: 镜像的分层概念

nav:
  title: 发布部署
  order: 2
---

## 1、介绍

镜像，是一种轻量级、可执行的独立软件包，它包含运行某个软件所需的所有内容，我们把应用程序和配置依赖打包好形成一个可交付的运行环境（包括代码、运行时需要的库、环境变量和配置文件等），这个打包好的运行环境就是 image 镜像文件。

可以把 Docker 镜像想象成一个千层糕或一颗洋葱。它是由一层一层的“薄片”堆叠而成的。最底层是基础，每一层都在前一层的基础上添加或修改一些东西，最终堆叠成一个完整的、可运行的镜像。

那什么是分层呢？先来看一个现象，在下载 Tomcat 镜像的时候，好像是在一层一层的在下载：

```bash
$ docker pull tomcat
Using default tag: latest
latest: Pulling from library/tomcat
0e29546d541c: Pull complete
9b829c73b52b: Pull complete
cb5b7ae36172: Pull complete
6494e4811622: Pull complete
668f6fcc5fa5: Pull complete
dc120c3e0290: Pull complete
8f7c0eebb7b1: Downloading [=======================> ]  96.69MB/203.1MB
77b694f83996: Download complete
0f611256ec3a: Download complete
4f25def12f23: Download complete
```

这是因为镜像文件，是分层的，基于 UnionFS。

UnionFS（联合文件系统）：Union 文件系统（UnionFS）是一种分层、轻量级并且高性能的文件系统，它支持对文件系统的修改作为一次提交来一层层的叠加，同时可以将不同目录挂载到同一个虚拟文件系统下（unite several directories into a single virtual filesystem）。Union 文件系统是 Docker 镜像的基础。镜像可以通过分层来进行继承，基于基础镜像（没有父镜像，类似 Java 中的 Object 类，是所有类的父类），可以制作各种具体的应用镜像。

特性：一次同时加载多个文件系统，但从外面看起来，只能看到一个文件系统，联合加载会把各层文件系统叠加起来，这样最终的文件系统会包含所有底层的文件和目录。

### 1.1、什么是镜像层？

- 只读模板：每个镜像层都是一个只读的文件系统层，它记录了对文件系统的一组更改（例如：添加、删除或修改文件）。
- 增量变更：每一层只包含它相对于其父层的差异内容。例如：
  - 第一层：一个干净的 Ubuntu 系统。
  - 第二层：在上面安装了 python 软件包（添加了文件）。
  - 第三层：在上面复制了你的应用程序代码 app.py（添加了文件）。
- 联合文件系统：Docker 使用 Union File System 技术将这些只读层透明地叠加在一起，呈现给用户一个统一的、完整的文件系统视图。

### 1.2、镜像与容器的关系

- 镜像是模板，容器是实例：当你用 docker run 基于一个镜像启动容器时，Docker 会在所有镜像层的最顶部，添加一个可写的容器层。
- 写时复制：这是关键机制。容器运行时的所有修改（如写入新文件、修改现有文件、删除文件）都只发生在这个最顶层的可写层中，而不会修改底下的只读镜像层。
  - 读操作：如果容器需要读取一个文件，Docker 会从最顶层的可写层开始向下查找，找到后就返回。
  - 写操作：
    - 如果文件在底层只读镜像中，CoW 机制会将该文件复制到可写层，然后在可写层进行修改。这保证了镜像层的不可变性。
    - 如果文件在可写层，则直接修改。
- 删除操作：在容器层中“标记”删除底层文件，而不是真的删除它。

### 1.3、分层的好处（为什么这么设计？）

- **资源共享与存储效率：多个镜像可以共享相同的底层基础层。**
  - 例子：你有一个基于 ubuntu:latest 的 Python 应用镜像，你的同事有一个基于 ubuntu:latest 的 Nginx 镜像。在你们的主机上，ubuntu:latest 这一层只存储一份，两个镜像共享它。这极大地节省了磁盘空间。
- **加速镜像构建：Docker 缓存机制的核心。**
  - 当你构建镜像（通过 Dockerfile）时，Docker 会按顺序执行每一条指令，并为每条指令的结果创建一个新的镜像层。
  - 如果下次构建时，某条指令及其之前的所有指令都没有变化，Docker 就会直接复用之前构建好的缓存层，而不是重新执行。这能极大加快构建速度，尤其是在 CI/CD 流水线中。
- **加速镜像分发（拉取/推送）：**
  - 当你 docker pull 一个镜像时，Docker 只会下载你本地还没有的层。如果你已经有了很多基础层，那么下载会非常快。
  - 同理，上传镜像到仓库时，也只需上传新增或修改的层。

### 1.4、如何查看镜像的分层

使用 docker image history <镜像名> 或更详细的 docker image inspect <镜像名> 命令。例如 docker image history nginx:latest 会显示类似下面的输出，可以看到每一层的创建命令和大小：

```dockerfile
IMAGE          CREATED        CREATED BY                                      SIZE
abc12345678    2 weeks ago    /bin/sh -c #(nop)  CMD ["nginx" "-g" "daemon…   0B
def23456789    2 weeks ago    /bin/sh -c #(nop)  STOPSIGNAL SIGQUIT           0B
ghi34567890    2 weeks ago    /bin/sh -c #(nop)  EXPOSE 80                    0B
... (更多层)
```

## 2、通过 Dockerfile 理解分层

Dockerfile 的每一条指令（除了少数如 ENV、LABEL 等元数据指令）基本都会创建一个新的镜像层。

```dockerfile
# 第一层：基于官方Python运行时作为父镜像
FROM python:3.9-slim

# 第二层：设置工作目录（创建目录）
WORKDIR /app

# 第三层：将依赖定义文件复制到镜像中
COPY requirements.txt ./

# 第四层：安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 第五层：复制应用程序的其余源代码
COPY . .

# 第六层：定义容器启动时运行的命令
CMD ["python", "./app.py"]
```

每执行完一行，就会生成一个只读层。最终这些层堆叠起来，形成最终的镜像。

## 3、镜像加载原理

镜像实际上由一层一层的文件系统组成，这种层级的文件系统 UnionFS。

bootfs（boot file system）主要包含 bootloader 和 kernel，bootloader 主要是引导加载 kernel，Linux 刚启动时会加载 bootfs 文件系统，在 Docker 镜像的最底层是引导文件系统 bootfs。这一层与典型的 Linux/Unix 系统是一样的，包含 boot 加载器和内核。当 boot 加载完成之后整个内核就都在内存中了，此时内存的使用权已由 bootfs 转交给内核，此时系统也会卸载 bootfs。

rootfs（root file system）， 在 bootfs 之上。包含的就是典型 Linux 系统中的 /dev, /proc, /bin, /etc 等标准目录和文件。rootfs 就是各种不同的操作系统发行版，比如 Ubuntu，Centos 等等。

![](../images/docker/docker202512231804.png)

平时我们安装进虚拟机的 CentOS 都是好几个 G，为什么 docker 这里才 200M？对于一个精简的 OS，rootfs 可以很小，只需要包括最基本的命令、工具和程序库就可以了，因为底层直接用 Host 的 kernel，自己只需要提供 rootfs 就行了。由此可见对于不同的 linux 发行版，bootfs 基本是一致的，rootfs 会有差别，因此不同的发行版可以公用 bootfs。比如，启动一个 Ubuntu，进入到容器后，会发现 vim 等工具都是没有的。

**重点理解：Docker 镜像层都是只读的，容器层是可写的。当容器启动时，一个新的可写层被加载到镜像的顶部。 这一层通常被称作“容器层”，“容器层”之下的都叫“镜像层”。**

![](../images/docker/docker202512231805.png)

所有对容器的改动 - 无论添加、删除、还是修改文件都只会发生在容器层中。只有容器层是可写的，容器层下面的所有镜像层都是只读的。
