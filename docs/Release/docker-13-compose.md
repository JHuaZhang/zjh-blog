---
group:
  title: Docker
order: 13
title: docker compose介绍

nav:
  title: 发布部署
  order: 2
---


## 1、介绍
Docker Compose 是一个用于定义和运行多容器 Docker 应用程序的工具。在之前使用 docker run 命令启动一个容器需要附带很多参数（端口映射、卷挂载、环境变量等）。当应用由多个服务组成（例如：一个 Web 应用 + 一个数据库 + 一个缓存服务）时，手动管理每个容器会变得非常繁琐且容易出错。

Docker Compose 通过一个 YAML 格式的配置文件（通常是 docker-compose.yml）来描述整个应用的架构、服务、网络和存储卷。然后，只需要一条简单的命令（docker-compose up），就能按照配置文件中的描述，一键启动所有关联的服务。

**Docker Compose的核心价值：**

+ 简化多容器管理：用一个命令管理整个应用栈的生命周期（启动、停止、重建）。
+ 服务依赖和启动顺序：可以定义服务之间的依赖关系，确保数据库先于 Web 应用启动。
+ 配置即代码：将整个应用的环境配置（包括网络、存储）版本化，方便团队共享和持续部署。
+ 快速搭建开发/测试环境：让新成员能通过一个文件快速复现完全一致的开发环境，解决了“在我机器上能跑”的经典问题。

## 2、Dockerfile和Docker Compose的区别
### 2.1、Dockerfile回顾
Dockerfile是一个文本文件，包含了一系列指令，用于构建 Docker 镜像，每个指令都会在镜像中创建一个新的层。主要用于定义镜像的构建步骤，打包应用程序及其依，创建可重复的构建过程。

**基本结构：**

```yaml
# Dockerfile 示例
FROM node:18-alpine          # 基础镜像
WORKDIR /app                # 设置工作目录
COPY package*.json ./       # 复制文件
RUN npm install             # 执行命令
COPY . .                    # 复制应用程序代码
EXPOSE 3000                 # 暴露端口
CMD ["npm", "start"]        # 容器启动命令
```

使用方式：

```yaml
# 构建镜像
docker build -t my-app:latest .

# 运行容器（来自构建的镜像）
docker run -p 3000:3000 my-app:latest
```

### 2.2、Docker Compose介绍
docker-compose.yml：一个 YAML 格式的文件，用于定义和运行多容器 Docker 应用程序。

**主要用途：**

+ 定义多个服务（容器）。
+ 配置容器间的网络和依赖关系。
+ 管理存储卷和数据持久化。
+ 简化多容器应用的启动和管理。

**基本结构：**

```yaml
# docker-compose.yml 示例
version: '3.8'

services:
  web:                          # 服务1：Web应用
    build: .                    # 使用当前目录的 Dockerfile 构建
    ports:
      - "3000:3000"
    depends_on:
      - db                      # 依赖数据库服务
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/mydb

  db:                           # 服务2：数据库
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:                # 定义数据卷
```

### 2.3、核心区别对比
简单的可以这样理解：

Dockerfile 是"食谱"，告诉你如何制作一道菜（镜像），而Docker Compose 是"宴席菜单"，告诉你如何安排一桌宴席（多个容器组成的应用），包括上菜顺序（依赖关系）、餐具摆放（网络配置）等。

以下为二者详细的差异：

| 特性 | Dockerfile | Docker Compose |
| --- | --- | --- |
| 作用 | 构建单个镜像 | 编排多个容器 |
| 文件格式 | 指令式文本文件 | YAML 配置文件 |
| 使用阶段 | 构建阶段 | 运行阶段 |
| 范围 | 单个容器 | 整个应用（多个容器） |
| 网络 | 不支持定义网络 | 自动创建网络，支持服务发现 |
| 存储卷 | 不支持定义卷 | 支持定义和管理卷 |
| 依赖关系 | 不支持定义依赖 | 支持定义服务依赖 |
| 环境变量 | 可在构建时设置 | 可在运行时设置 |
| 端口映射 | 定义 EXPOSE | 定义具体的端口映射 |


**工作流程关系：**

```yaml
Dockerfile（构建镜像）
     ↓
docker build（创建镜像）
     ↓
docker run（运行单个容器）
     ↓
docker-compose.yml（定义多容器应用）
     ↓
docker-compose up（启动整个应用）
```

**典型使用场景：**

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend          # 使用 ./frontend/Dockerfile
    ports:
      - "80:3000"
      
  backend:
    build: ./backend           # 使用 ./backend/Dockerfile
    environment:
      - DB_HOST=database
      
  database:
    image: mysql:8.0
    volumes:
      - db_data:/var/lib/mysql

  redis:
    image: redis:alpine
    
volumes:
  db_data:
```

**如何选择使用：**

**①、使用 Dockerfile 的情况：**

1. 只需要构建一个镜像。
2. 作为基础镜像供他人使用。
3. CI/CD 流水线中构建步骤。
4. 需要自定义镜像构建过程。

**②、使用 Docker Compose 的情况：**

1. 需要运行多个容器。
2. 开发环境需要快速启动整个应用栈。
3. 需要定义服务间的依赖关系。
4. 需要管理容器网络和数据卷。
5. 测试环境需要复现生产环境的多服务架构。

然而他们二者并不是割裂的，而是经常在一起进行使用，如：

+ 为每个服务编写 Dockerfile（定义如何构建）。
+ 编写 docker-compose.yml（定义如何运行和连接这些服务）。

```bash
# 项目结构示例
project/
├── frontend/
│   ├── Dockerfile          # 前端镜像构建
│   └── ...
├── backend/
│   ├── Dockerfile          # 后端镜像构建
│   └── ...
├── docker-compose.yml      # 定义整个应用栈
└── docker-compose.prod.yml # 生产环境配置
```

## 3、Docker Compose语法规则
Docker Compose 是 Docker 官方提供的用于定义和运行多容器应用的工具。它通过一个 YAML 文件（通常命名为 docker-compose.yml）来配置应用程序的服务、网络、卷等资源，然后使用一条命令（如 docker compose up）即可启动整个应用。

下面详细介绍 Docker Compose 的语法规则（以 Compose Specification v3.x 为主，兼容 v2 和 v1 的常用特性）。

**基本结构：**

Docker Compose 文件是一个 YAML 格式的文件，顶层包含以下主要部分：

```yaml
version: '3.8'       # 指定 Compose文件格式版本（可选，新版docker compose已弱化）
services:            # 定义服务（容器）
networks:            # 定义网络
volumes:             # 定义命名卷
configs:             # 定义配置（Swarm模式）
secrets:             # 定义密钥（Swarm模式）
```

### 3.1、版本声明
在文件开头，通常使用 version 来指定 Compose 文件格式的版本。

```yaml
version: '3.8'
```

注意：最新版本的 Docker Compose 已经逐渐过渡到使用 Compose Specification，从 Docker Compose v2 开始（即 docker compose 命令，而非旧版 docker-compose），version 字段不再是强制要求，但为了兼容性和清晰性，建议保留。

### 3.2、services服务定义
在 Docker Compose 中，services 是核心配置部分，用于定义应用中的各个服务（容器）。每个服务代表一个独立的容器实例，可以包含应用程序、数据库、缓存等组件。

**基本结构：**

```yaml
version: '3.8'
services:
  web:
    # web 服务的配置
  database:
    # 数据库服务的配置
  redis:
    # Redis 服务的配置
```

**Services 下常用指令详解：**

#### 3.2.1、image - 指定镜像
image 指令用于指定服务要使用的 Docker 镜像。这是 Docker Compose 中最基础也是最重要的配置之一，它决定了容器运行时使用的基础环境和应用程序。

**基础语法：**

```yaml
services:
  service_name:
    image: [repository/][image_name][:tag]
```

完整镜像引用格式：

```yaml
services:
  # 官方镜像（Docker Hub）
  nginx:
    image: nginx:1.21.6
  
  # 第三方仓库镜像
  postgres:
    image: postgres:14-alpine
  
  # 私有仓库镜像
  app:
    image: myregistry.com/myapp:latest
  
  # 多级路径镜像
  custom:
    image: company/department/project:1.0.0
```

**与其他指令的交互关系：**

**①、image vs build**

这两个指令是互斥的，但可以同时存在（此时以 build 为准）：

```yaml
services:
  # 错误用法 - 同时指定但意图冲突
  app:
    build: ./app          # 会构建新镜像
    image: nginx:latest   # 这个会被忽略
  
  # 正确用法 - build 构建后使用指定的镜像名称
  app:
    build: ./app
    image: mycompany/myapp:1.0.0  # 构建后的镜像会以此命名
```

:::color1
当同时指定 build 和 image 时：

+ docker-compose build 会构建镜像并命名为 image 指定的名称。
+ docker-compose up 会优先使用本地已存在的镜像，如果不存在则尝试拉取。

:::

**②、与 pull_policy的关系**

```yaml
services:
  app:
    image: myapp:latest
    pull_policy: always  # 总是拉取最新镜像
```

**注意事项：**

避免使用 latest 标签：

```yaml
# 危险！每次拉取可能得到不同版本
app:
  image: nginx:latest
```

latest 标签会随时间变化，导致环境不一致，调试困难，无法确定具体使用的是哪个版本，可能引入意外的破坏性变更。

#### 3.2.2、build - 构建镜像
build 指令用于定义如何从源代码构建 Docker 镜像。它允许你在 Docker Compose 文件中指定构建上下文、Dockerfile 路径、构建参数等信息，从而创建自定义的应用镜像。

**基本语法：**

```yaml
services:
  service_name:
    build: [构建上下文路径]
    # 或者
    build:
      context: [构建上下文路径]
      dockerfile: [Dockerfile 路径]
      args: [构建参数]
      target: [构建目标阶段]
      # 其他选项...

```

如下的例子：

```yaml
services:
  app:
    build:
      context: ./src                    # 构建上下文路径
      dockerfile: Dockerfile.prod       # 自定义 Dockerfile 名称
      args:                             # 构建参数
        NODE_ENV: production
        VERSION: 1.2.3
      target: runner                    # 多阶段构建的目标阶段
      network: host                     # 构建时的网络模式
      shm_size: '2gb'                   # /dev/shm 大小
      labels:                           # 构建时添加的标签
        com.example.description: "Production build"
```

**各个子选项详解：**

**①、context - 构建上下文**

指定构建上下文的路径或 URL。

```yaml
services:
  # 本地目录
  app1:
    build:
      context: ./myapp
  
  # 远程 Git 仓库（Docker Compose v2.5+）
  app2:
    build:
      context: https://github.com/user/repo.git#main
  
  # 压缩包 URL
  app3:
    build:
      context: https://example.com/app.tar.gz
```

重要: 构建上下文中的所有文件都会被发送到 Docker 守护进程，所以要避免包含不必要的大文件。

**②、dockerfile - Dockerfile 路径**

指定自定义的 Dockerfile 文件名或路径。

```yaml
services:
  # 使用不同名称的 Dockerfile
  dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
  
  prod:
    build:
      context: .
      dockerfile: ./docker/Dockerfile.prod
  
  # 使用绝对路径（不推荐）
  custom:
    build:
      context: .
      dockerfile: /home/user/project/Dockerfile.custom
```

**③、args - 构建参数**

传递构建参数给 Dockerfile 中的 ARG 指令。

```yaml
# docker-compose.yml
services:
  app:
    build:
      context: .
      args:
        NODE_VERSION: 18.12.1        # ← 这里传入的是 18.12.1
        BUILD_ENV: production
        HTTP_PROXY: http://proxy.company.com:8080
```

```yaml
# Dockerfile
ARG NODE_VERSION=16.14.0     # ← 这是默认值（当没有传入参数时使用）
ARG BUILD_ENV=development    # ← 默认值
ARG HTTP_PROXY               # ← 这个没有默认值

FROM node:${NODE_VERSION}-alpine   # ← 实际使用的是 18.12.1！
```

当运行 docker-compose build 时：

1. Docker Compose 会将 args 中的参数传递给构建过程。
2. NODE_VERSION=18.12.1 会覆盖 Dockerfile 中的默认值 16.14.0。
3. 最终构建的镜像是：FROM node:18.12.1-alpine。

**④、target - 多阶段构建目标**

target 是 build 配置中的一个选项，用于指定多阶段构建（Multi-stage Build）中要构建到哪个阶段为止。要理解 target，首先需要理解 Docker 多阶段构建的概念。

**什么是多阶段构建？**

多阶段构建允许你在单个 Dockerfile 中使用多个 FROM 指令，每个 FROM 指令开始一个新的构建阶段。你可以选择性地将文件从一个阶段复制到另一个阶段。

```dockerfile
# 第一阶段：构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 第二阶段：运行阶段  
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["npm", "start"]

# 第三阶段：测试阶段
FROM node:18-alpine AS test
WORKDIR /app
COPY . .
RUN npm ci
CMD ["npm", "test"]

```

每个 AS <stage-name> 定义了一个命名阶段，这些阶段名称就是 target 可以指向的目标。

而target的作用决定了构建过程在哪个阶段停止：

+ 如果不指定 target，会构建到最后一个阶段。
+ 如果指定 target，只构建到指定的阶段就停止。

**⑤、network - 构建网络模式**

指定构建过程中使用的网络模式。

```yaml
services:
  app:
    build:
      context: .
      network: host        # 使用主机网络
      # 或
      network: none        # 无网络
      # 或
      network: my-custom-network  # 自定义网络
```

**⑥、shm_size - 共享内存大小**

设置 /dev/shm 的大小，对某些需要大量共享内存的应用很重要。

```yaml
services:
  chrome:
    build:
      context: .
      shm_size: '2gb'      # 默认是 64MB
```

**⑦、labels - 构建标签**

为构建的镜像添加元数据标签。

```yaml
services:
  app:
    build:
      context: .
      labels:
        com.example.version: "1.0.0"
        com.example.maintainer: "team@example.com"
        org.opencontainers.image.source: "https://github.com/user/repo"
```

**⑧、cache_from - 构建缓存**

指定构建缓存来源（Docker Compose v2.0+）。

```yaml
services:
  app:
    build:
      context: .
      cache_from:
        - type=registry,ref=myregistry.com/myapp:latest
        - type=local,src=./cache
```

**⑨、secrets - 构建密钥**

在构建过程中使用密钥（Docker Compose v2.5+）。

```yaml
services:
  app:
    build:
      context: .
      secrets:
        - github_token

secrets:
  github_token:
    file: ./github-token.txt
```

#### 3.2.3、container_name - 容器名称
container_name 是 Docker Compose 服务配置中的一个可选指令，用于为容器指定自定义的名称。如果不指定，Docker Compose 会自动生成一个基于项目名称、服务名称和实例编号的容器名称。

```yaml
services:
  web:
    image: nginx
    container_name: my-web-server
```

在没有指定 container_name 的情况下，Docker Compose 会按照以下规则生成容器名称：

```yaml
<project_name>_<service_name>_<index>
```

#### 3.2.4、ports - 端口映射
ports 指令用于配置端口映射（Port Mapping），将容器内部的端口暴露到 Docker 主机上，使得外部网络可以访问容器中的服务。

**语法规则：**

```yaml
services:
  service_name:
    ports:
      - "HOST_PORT:CONTAINER_PORT"
      - "HOST_PORT:CONTAINER_PORT/PROTOCOL"
```

**举例：**

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"        # 主机:容器
      - "443:443/tcp"    # 指定协议
      - "127.0.0.1:8001:8001"  # 绑定到特定IP
```

**容器端口 vs 主机端口：**

+ 容器端口（Container Port）：应用程序在容器内部监听的端口。
+ 主机端口（Host Port）：外部网络访问 Docker 主机时使用的端口。

#### 3.2.5、volumes - 数据卷
volumes 指令用于配置数据持久化和文件共享，允许在容器和主机之间、容器和容器之间共享数据。这是 Docker Compose 中处理数据存储的核心机制。

**Docker 提供了三种主要的数据管理方式：**

+ Volumes（命名卷） - Docker 管理的存储。
+ Bind Mounts（绑定挂载） - 直接挂载主机目录/文件。
+ tmpfs Mounts - 内存中的临时文件系统（Compose 不直接支持）。

在 Docker Compose 中，volumes 指令可以配置前两种方式。

**基本语法：**

```yaml
services:
  service_name:
    volumes:
      # 绑定挂载
      - /host/path:/container/path
      - ./relative/path:/container/path
      
      # 命名卷
      - volume_name:/container/path
      
      # 高级选项
      - type: volume
        source: volume_name
        target: /container/path
        read_only: true

volumes:
  volume_name:
    # 卷的详细配置
```

**详细使用方式：**

**①、绑定挂载**

绑定挂载直接将主机的文件或目录挂载到容器中。

**基本用法：**

```yaml
version: '3.8'
services:
  web:
    image: nginx
    volumes:
      # 绝对路径
      - /home/user/www:/usr/share/nginx/html
      
      # 相对路径（相对于 compose 文件位置）
      - ./html:/usr/share/nginx/html
      
      # 主机文件挂载到容器文件
      - ./nginx.conf:/etc/nginx/nginx.conf
```

**只读挂载：**

```yaml
services:
  app:
    image: myapp
    volumes:
      # 只读挂载配置文件
      - ./config.json:/app/config.json:ro
      # 或者
      - type: bind
        source: ./secrets
        target: /app/secrets
        read_only: true
```

**完整的绑定挂载语法：**

```yaml
services:
  app:
    volumes:
      # 简写形式
      - ./host-dir:/container-dir:rw
      
      # 详细形式
      - type: bind
        source: ./host-dir
        target: /container-dir
        read_only: false
        bind:
          propagation: rprivate
          create_host_path: true

```

**②、命名卷**

命名卷由 Docker 管理，存储位置由 Docker 决定。

**基本用法：**

```yaml
version: '3.8'
services:
  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
    # 卷的具体配置
```

**卷的详细配置：**

```yaml
volumes:
  # 简单声明
  simple_volume:
  
  # 带驱动配置的卷
  custom_volume:
    driver: local
    driver_opts:
      type: none
      device: /mnt/data
      o: bind
  
  # 外部卷（引用已存在的卷）
  external_volume:
    external: true
    name: existing-volume-name
  
  # 带标签的卷
  labeled_volume:
    labels:
      com.example.description: "Database storage"
      com.example.department: "IT"
```

**③、匿名卷**

不指定卷名称，Docker 自动生成名称：

```yaml
services:
  app:
    image: myapp
    volumes:
      - /app/cache  # 匿名卷，每次重建容器都会丢失数据
```

匿名卷在 docker-compose down 时会被删除（除非使用 -v 参数保留）。

#### 3.2.6、environment - 环境变量
environment 指令用于为容器设置环境变量（Environment Variables）。环境变量是容器化应用中最常用的配置方式，允许在不修改代码的情况下改变应用的行为。

**基本语法：**

```yaml
services:
  service_name:
    environment:
      # 列表格式
      - KEY=value
      - KEY2=value2
      
      # 字典格式  
      KEY: value
      KEY2: value2
```

**举例使用：**

```yaml
services:
  app:
    image: myapp
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - DEBUG=false
    # 或者使用键值对格式
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://user:pass@db:5432/mydb
```

如果只设置键名，则会从主机环境中继承。

```yaml
services:
  app:
    image: myapp
    environment:
      - NODE_ENV        # 从主机环境变量获取值
      - DATABASE_URL    # 如果主机有这个变量，就使用它
```

如果主机环境中有 NODE_ENV=development，那么容器内也会有 NODE_ENV=development。

**举例多环境配置：**

```yaml
# docker-compose.yml (基础配置)
services:
  app:
    build: .
    environment:
      - LOG_LEVEL=info
      - MAX_CONNECTIONS=100

# docker-compose.dev.yml (开发环境)
services:
  app:
    environment:
      - NODE_ENV=development
      - DEBUG=true
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp_dev

# docker-compose.prod.yml (生产环境)
services:
  app:
    environment:
      - NODE_ENV=production
      - DEBUG=false
      - DATABASE_URL=postgresql://prod-user:prod-pass@prod-db:5432/myapp_prod
      - SSL_ENABLED=true

```

**与 env_file 的关系：**

environment 和 env_file 可以同时使用，environment 的优先级更高：

```yaml
# .env 文件
DATABASE_URL=postgresql://default:pass@localhost:5432/default
DEBUG=false

# docker-compose.yml
services:
  app:
    image: myapp
    env_file:
      - .env
    environment:
      - DATABASE_URL=postgresql://override:pass@db:5432/myapp  # 这个会覆盖 .env 中的值
      - PORT=3000
```

最终容器内的环境变量：

+ DATABASE_URL=postgresql://override:pass@db:5432/myapp。
+ DEBUG=false。
+ PORT=3000。

**变量替换和插值：**

Docker Compose 支持在 environment 中使用变量替换：

```yaml
services:
  app:
    image: myapp:${VERSION:-latest}
    environment:
      - APP_VERSION=${VERSION:-1.0.0}
      - BUILD_DATE=${BUILD_DATE}
      - GIT_COMMIT=${GIT_COMMIT}
      - DATABASE_URL=postgresql://${DB_USER:-postgres}:${DB_PASS:-password}@${DB_HOST:-db}:5432/${DB_NAME:-myapp}
```

变量替换语法：

| 语法 | 说明 | 示例 |
| --- | --- | --- |
| ${VAR} | 使用变量值 | ${VERSION} |
| ${VAR:-default} | 如果变量未设置，使用默认值 | ${PORT:-3000} |
| ${VAR:-} | 如果变量未设置，使用空字符串 | ${OPTIONAL_VAR:-} |


环境变量来源优先级：

1. 命令行参数：VAR=value docker-compose up。
2. Shell 环境变量：export VAR=value。
3. .env 文件：项目根目录下的 .env 文件。
4. 默认值：${VAR:-default} 中的 default。

#### 3.2.7、env_file - 环境文件
env_file 指令用于从外部文件加载环境变量到容器中。它提供了一种将配置与 compose 文件分离的方式，特别适合管理大量环境变量或敏感配置。

```yaml
services:
  service_name:
    env_file:
      - file1.env          # 单个文件
      - ./path/file2.env   # 相对路径
      - /absolute/path/file3.env  # 绝对路径
```

**文件格式要求：**

.env 文件必须遵循简单的 KEY=VALUE 格式：

```bash
# .env 文件示例
NODE_ENV=production
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_NAME=myapp
DATABASE_USER=postgres
DATABASE_PASSWORD=secret123
REDIS_URL=redis://redis:6379
API_KEY=sk_live_xxxxxxxxxxxxxx
DEBUG=false
```

**文件格式规则：**

+ 每行一个 KEY=VALUE 对。
+ 不支持 YAML 或 JSON 格式。
+ 不支持 嵌套结构。
+ 空行和以 # 开头的注释行会被忽略。
+ 值中包含特殊字符时需要用引号（但通常不需要）。

```bash
# ✅ 正确格式
DB_PASSWORD=p@ssw0rd!#$%
API_URL=https://api.example.com/v1
FEATURE_ENABLED=true

# ❌ 错误格式（YAML 风格）
database:
  host: db
  port: 5432
```

#### 3.2.8、depends_on - 依赖关系
depends_on 指令用于定义服务之间的依赖关系，控制服务的启动顺序。它确保被依赖的服务在当前服务启动之前先启动。

基本语法：

```yaml
services:
  service_name:
    depends_on:
      - service1
      - service2
```

注意: depends_on 只控制启动顺序，不等待服务完全就绪。如需等待服务就绪，需要配合健康检查使用。

**带条件的依赖（v2.1+ 格式）：**

```yaml
version: '2.4'  # 注意：健康检查条件只在 v2.x 中支持
services:
  web:
    image: nginx
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
  
  db:
    image: postgres:14
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

**条件类型说明：**

| 条件类型 | 说明 |
| --- | --- |
| service_started | 服务容器已启动（默认行为） |
| service_healthy | 服务通过了健康检查 |
| service_completed_successfully | 服务已成功完成（适用于一次性任务） |


在 v3.x 版本中，condition 选项被移除了！这是因为 v3 主要面向 Docker Swarm，而 Swarm 有自己的一套健康检查机制。

```yaml
# v3.x 中只能这样写（没有条件）
version: '3.8'
services:
  app:
    image: myapp
    depends_on:
      - db
      - redis
```

#### 3.2.9、networks - 网络配置
networks 指令用于配置 Docker 容器的网络连接，控制服务之间以及服务与外部世界的通信方式。它是构建安全、高效容器化应用架构的核心组件。

Docker Compose 支持多种网络驱动：

| 驱动类型 | 说明 | 适用场景 |
| --- | --- | --- |
| bridge | 默认驱动，创建私有内部网络 | 大多数应用场景 |
| host | 使用主机网络命名空间 | 高性能需求，网络插件 |
| overlay | 跨主机网络（Swarm 模式） | Docker Swarm 集群 |
| none | 无网络 | 完全隔离的容器 |


**网络作用域：**

+ 服务级别 networks：定义服务连接到哪些网络。
+ 根级别 networks：定义网络的详细配置。

**基本语法：**

```yaml
version: '3.8'

services:
  service_name:
    networks:
      - network1
      - network2

networks:
  network1:
    # 网络配置
  network2:
    # 网络配置
```

**详细使用方式：**

**①、默认网络行为**

如果不显式配置 networks，Docker Compose 会：

1. 创建一个名为 <project_name>_default 的桥接网络。
2. 所有服务都连接到这个默认网络。
3. 服务可以通过服务名称互相访问。

```yaml
# 最简单的配置
version: '3.8'
services:
  web:
    image: nginx
  
  app:
    image: myapp
```

等价于：

```yaml
version: '3.8'
services:
  web:
    image: nginx
    networks:
      - default
  
  app:
    image: myapp
    networks:
      - default

networks:
  default:
    driver: bridge
```

**②、自定义网络名称**

```yaml
version: '3.8'
services:
  web:
    image: nginx
    networks:
      - frontend
  
  api:
    image: myapp
    networks:
      - frontend
      - backend
  
  db:
    image: postgres
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

在这个例子中：

+ web 只能访问 api（都在 frontend 网络）。
+ api 可以访问 web 和 db。
+ db 只能被 api 访问（安全隔离）。

**③、网络别名**

为服务在网络中设置额外的别名：

```yaml
services:
  database:
    image: postgres
    networks:
      backend:
        aliases:
          - db
          - postgres-db
          - primary-database

networks:
  backend:
```

其他服务可以通过以下任意名称访问数据库：

+ database（服务名称）。
+ db。
+ postgres-db。
+ primary-database。

#### 3.2.10、restart - 重启策略
restart 指令用于定义容器的重启策略（Restart Policy），控制容器在什么情况下应该自动重启。这是确保服务高可用性和容错性的关键配置。

**基本语法：**

```yaml
services:
  service_name:
    restart: [policy]
```

**重启策略类型：**

**①、no（默认策略）**

不自动重启容器，无论退出状态如何。

```yaml
services:
  batch-job:
    image: my-batch-processor
    restart: no
    # 或者省略 restart 指令（默认就是 no）
```

**适用场景：**

+ 一次性任务（如数据库迁移、数据导入）。
+ 批处理作业。
+ 调试环境中的临时容器。

**②、always**

总是重启容器，无论退出原因是什么。

```yaml
services:
  web-server:
    image: nginx
    restart: always
    ports:
      - "80:80"
```

**行为特点：**

+ 容器退出后立即重启。
+ 即使手动停止容器，Docker 守护进程重启后也会重新启动容器。
+ 适用于必须持续运行的关键服务。

**③、on-failure[:max-retries]**

仅在容器以非零退出码退出时重启。

```yaml
services:
  # 基本用法
  api-service:
    image: myapi
    restart: on-failure
  
  # 限制最大重试次数
  worker:
    image: my-worker
    restart: on-failure:5
```

**行为特点：**

+ 正常退出（退出码 0）不会重启。
+ 异常退出（退出码非 0）会重启。
+ 可以指定最大重试次数，避免无限重启循环。

**④、unless-stopped**

总是重启容器，除非容器被手动停止。

```yaml
services:
  database:
    image: postgres:14
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: password
```

**行为特点：**

+ 容器退出后自动重启。
+ 如果手动执行 docker stop 或 docker-compose stop，则不会自动重启。
+ Docker 守护进程重启后，会重新启动所有 unless-stopped 的容器。
+ 这是生产环境中最常用的策略。

#### 3.2.11、command - 覆盖默认命令
command 指令用于覆盖容器的默认启动命令。每个 Docker 镜像都有一个预定义的CMD或ENTRYPOINT，command 允许在运行时替换这些默认命令。

**Docker 镜像的命令结构：**

+ ENTRYPOINT：容器的主要执行程序（通常不可覆盖）。
+ CMD：传递给 ENTRYPOINT 的默认参数（可以被覆盖）。

```dockerfile
# Dockerfile 示例
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
# ENTRYPOINT ["node"]
# CMD ["index.js"]  # 这是默认命令
```

当使用 command 时：

+ 如果镜像只有 CMD，command 完全替换它。
+ 如果镜像有 ENTRYPOINT + CMD，command 替换 CMD 部分。

**基本语法：**

```yaml
services:
  service_name:
    # 字符串格式
    command: "npm start"
    
    # 数组格式（推荐）
    command: ["npm", "start"]
    
    # 复杂命令
    command: sh -c "echo 'Starting...' && npm start"
```

#### 3.2.12、healthcheck - 健康检查
定义容器健康检查。

```yaml
services:
  web:
    image: nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

#### 3.2.13、deploy - 部署配置（仅 Swarm 模式）
在 Docker Swarm 中使用的部署配置。

```yaml
services:
  web:
    image: nginx
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

#### 3.2.14、user - 用户
指定运行容器的用户。

```yaml
services:
  app:
    image: myapp
    user: "1000:1000"  # UID:GID
```

#### 3.2.15、working_dir - 工作目录
设置容器内的工作目录。

```yaml
services:
  app:
    image: node
    working_dir: /app
```

#### 3.2.16、entrypoint - 入口点
覆盖镜像的入口点。

```yaml
services:
  app:
    image: myapp
    entrypoint: ["/bin/bash", "-c"]
    command: ["echo 'Hello World'"]
```

#### 3.2.17、cap_add/cap_drop - 能力管理
添加或删除 Linux 能力。

```yaml
services:
  app:
    image: myapp
    cap_add:
      - NET_ADMIN
    cap_drop:
      - SYS_ADMIN
```

#### 3.2.18、devices - 设备映射
映射主机设备到容器。

```yaml
services:
  app:
    image: myapp
    devices:
      - "/dev/ttyUSB0:/dev/ttyUSB0"
```

#### 3.2.19、dns - DNS 配置
自定义 DNS 服务器。

```yaml
services:
  app:
    image: myapp
    dns:
      - 8.8.8.8
      - 8.8.4.4
```

#### 3.2.20、extra_hosts - 额外主机映射
添加额外的主机名映射。

```yaml
services:
  app:
    image: myapp
    extra_hosts:
      - "host.docker.internal:host-gateway"
      - "api.local:192.168.1.100"
```

### 3.3、根级别networks
前面我们介绍到了services中有使用networks，而根位置下也有一个networks，根级别的 networks 用于定义和配置网络本身，而不是指定服务如何使用网络。这是网络的"声明"部分。

**基本语法：**

```yaml
version: '3.8'
services:
  # ... 服务定义

# 根级别 networks - 定义网络
networks:
  network_name:
    # 网络配置选项
```

常用配置选项如下所示。

#### 3.3.1、driver - 网络驱动
Network Driver（网络驱动）是 Docker 网络的核心组件，它决定了网络的底层实现方式和功能特性。不同的驱动提供不同的网络模型，适用于不同的使用场景。

Docker Compose 支持以下主要网络驱动：

```yaml
networks:
  bridge-net:
    driver: bridge          # 桥接网络（默认）
  
  host-net:
    driver: host            # 主机网络
  
  overlay-net:
    driver: overlay         # 覆盖网络（Swarm模式）
  
  none-net:
    driver: none            # 无网络
    
  macvlan-net:
    driver: macvlan         #macvlan 驱动
```

##### 3.3.1.1、bridge 驱动（默认驱动）
**基本概念**

+ 单机桥接网络：在单个 Docker 主机上创建私有内部网络。
+ NAT 转发：容器通过 NAT 访问外部网络。
+ 自动 DNS：服务名称自动解析为容器 IP。

**配置示例：**

```yaml
networks:
  # 最简单的桥接网络
  simple-bridge:
    driver: bridge
  
  # 自定义桥接网络
  custom-bridge:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: my-custom-bridge0
      com.docker.network.driver.mtu: 1500
```

**适用场景：**

+ 开发环境：多容器应用本地开发。
+ 单机部署：所有服务运行在同一台服务器。
+ 网络隔离：需要将不同应用分组到不同网络。

**特性：**

+ ✅ 自动 DNS 解析（服务名 → IP）。
+ ✅ 端口映射支持（ports 指令）。
+ ✅ 网络隔离（不同 bridge 网络默认不通）。
+ ❌ 不支持跨主机通信。
+ ❌ 性能开销（NAT 转发）。

##### 3.3.1.2、host 驱动
**基本概念：**

+ 主机网络模式：容器直接使用主机的网络命名空间。
+ 无网络隔离：容器与主机共享同一网络栈。
+ 高性能：无 NAT 开销，直接使用主机网络。

**配置示例：**

```yaml
# 注意：host 驱动通常不在根级别 networks 中定义
# 而是在服务级别使用 network_mode
services:
  metrics:
    image: prom/node-exporter
    network_mode: host  # 使用主机网络
```

**适用场景：**

+ 性能敏感应用：监控代理、网络工具。
+ 需要主机端口的应用：必须绑定到特定主机端口。
+ 网络插件：需要直接访问主机网络接口。

**特性：**

+ ✅ 最佳网络性能（无虚拟化开销）。
+ ✅ 直接访问主机所有网络接口。
+ ✅ 无需端口映射。
+ ❌ 无网络隔离（安全风险）。
+ ❌ 无法使用 Compose 的 ports 指令。
+ ❌ 无法与其他 Compose 网络集成。

**限制：**

+ 不能在根级别 networks 中定义 host 驱动。
+ 必须使用服务级别的 network_mode: host。
+ 在 Compose 文件中这样使用：

```yaml
services:
  host-network-app:
    image: myapp
    network_mode: host
    # 注意：不能同时使用 networks 和 network_mode
```

##### 3.3.1.3、overlay 驱动
**基本概念：**

+ 跨主机网络：在 Docker Swarm 集群中创建覆盖网络。
+ VXLAN 封装：通过 VXLAN 隧道实现跨主机通信。
+ 服务发现：内置 DNS 服务发现。

**配置示例：**

```yaml
version: '3.8'
networks:
  swarm-overlay:
    driver: overlay
    attachable: true    # 允许独立容器连接
    # internal: true    # 可选：内部网络
```

**适用场景：**

+ Docker Swarm 集群：多主机容器编排。
+ 微服务架构：跨主机服务通信。
+ 高可用部署：服务实例分布在多个节点。

**特性：**

+ ✅ 跨主机通信。
+ ✅ 内置负载均衡。
+ ✅ 服务发现和 DNS。
+ ✅ 网络加密（可选）。
+ ❌ 仅在 Swarm 模式下工作。
+ ❌ 性能开销（VXLAN 封装）。

##### 3.3.1.4、macvlan 驱动
**基本概念：**

+ 物理网络集成：为容器分配物理网络中的 MAC 地址。
+ 直接网络访问：容器直接出现在物理网络中。
+ 无 NAT：容器 IP 直接路由。

**配置示例：**

```yaml
networks:
  macvlan-net:
    driver: macvlan
    driver_opts:
      parent: eth0    # 指定父网络接口
    ipam:
      config:
        - subnet: 192.168.1.0/24
          gateway: 192.168.1.1
```

**适用场景：**

+ 遗留系统集成：需要容器出现在现有物理网络。
+ 网络设备模拟：每个容器需要独立 MAC 地址。
+ 特定网络拓扑：需要容器直接路由到物理网络。

**特性：**

+ ✅ 容器直接出现在物理网络。
+ ✅ 无 NAT 开销。
+ ✅ 每个容器有独立 MAC 地址。
+ ❌ 需要物理网络支持。
+ ❌ 主机无法直接访问容器（除非配置子接口）。
+ ❌ 网络配置复杂。

##### 3.3.1.5、none 驱动
**基本概念**

+ 完全网络隔离：容器只有 loopback 接口。
+ 无外部网络：无法访问任何外部网络。
+ 最高安全性：完全网络隔离。

**配置示例：**

```yaml
# 通常不在根级别定义，而是在服务级别使用
services:
  isolated-app:
    image: myapp
    network_mode: none
```

**适用场景：**

+ 安全敏感应用：完全隔离的计算环境。
+ 离线处理：不需要网络的批处理任务。
+ 测试环境：验证应用的离线行为。

**特性：**

+ ✅ 完全网络隔离。
+ ✅ 最高安全性。
+ ✅ 无网络开销。
+ ❌ 无法访问任何网络（包括其他容器）。
+ ❌ 无法使用 Compose 网络功能。

#### 3.3.2、driver_opts - 驱动选项
为网络驱动传递特定选项：

```yaml
networks:
  # 自定义桥接网络名称
  custom-bridge:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: my-custom-br0
  
  # 设置 MTU（最大传输单元）
  high-mtu:
    driver: bridge
    driver_opts:
      com.docker.network.driver.mtu: 9000
  
  # MACVLAN 网络
  macvlan-net:
    driver: macvlan
    driver_opts:
      parent: eth0          # 指定父网络接口
```

#### 3.3.3、ipam - IP 地址管理
配置 IP 地址分配：

```yaml
networks:
  custom-ipam:
    driver: bridge
    ipam:
      driver: default       # IPAM 驱动
      config:
        - subnet: 172.28.0.0/16           # 子网
          ip_range: 172.28.5.0/24         # IP 范围
          gateway: 172.28.5.254           # 网关
          aux_addresses:                  # 预留地址
            host1: 172.28.5.10
            host2: 172.28.5.11
        # 可以配置多个子网（包括 IPv6）
        - subnet: 2001:388:1:5::/64
          gateway: 2001:388:1:5::254
```

#### 3.3.4、external - 外部网络
引用已经存在的 Docker 网络：

```yaml
networks:
  # 引用名为 "existing-network" 的现有网络
  existing-net:
    external: true
    name: existing-network
  
  # 简写形式（网络名称与 key 相同）
  my-existing-network:
    external: true
  
  # 使用环境变量动态指定
  dynamic-external:
    external: true
    name: ${NETWORK_NAME}
```

#### 3.3.5、internal - 内部网络
创建不能访问外部网络的隔离网络：

```yaml
networks:
  secure-backend:
    driver: bridge
    internal: true    # 容器无法访问互联网或其他外部网络
```

#### 3.3.6、attachable - 可连接网络
允许独立容器（非 Compose 管理）连接到此网络：

```yaml
networks:
  public-api:
    driver: bridge
    attachable: true  # docker run --network=xxx 可以连接
```

#### 3.3.7、enable_ipv6 - 启用 IPv6
启用 IPv6 支持：

```yaml
networks:
  dual-stack:
    driver: bridge
    enable_ipv6: true
    ipam:
      config:
        - subnet: 172.28.0.0/16
        - subnet: 2001:388:1:5::/64
```

#### 3.3.8、labels - 网络标签
为网络添加元数据标签：

```yaml
networks:
  production-net:
    driver: bridge
    labels:
      com.example.environment: "production"
      com.example.team: "backend"
      monitoring.enabled: "true"
```

## 4、Docker Componse命令行指令
**基本语法格式：**

```bash
docker compose [OPTIONS] COMMAND [ARGS...]
# 或者旧版本
docker-compose [OPTIONS] COMMAND [ARGS...]
```

Docker Compose v2+ 已经集成到 Docker CLI 中，使用 docker compose（无连字符），而旧版本使用 docker-compose（有连字符）。

### 4.1、docker compose up - 启动服务
作用：构建、创建、启动和附加容器。

**常用选项：**

```bash
# 基本启动
docker compose up

# 后台运行（detached mode）
docker compose up -d

# 重新构建镜像
docker compose up --build

# 强制重新创建容器
docker compose up --force-recreate

# 不启动依赖的服务
docker compose up --no-deps web

# 指定特定服务
docker compose up web api

# 重新拉取镜像
docker compose up --pull

# 设置超时时间
docker compose up --timeout 30
```

### 4.2、docker compose down - 停止并移除服务
作用：停止并移除容器、网络、镜像和卷。

**常用选项：**

```bash
# 基本停止和移除
docker compose down

# 同时移除命名卷
docker compose down -v

# 同时移除镜像
docker compose down --rmi all

# 移除外部创建的网络
docker compose down --remove-orphans

# 设置超时时间
docker compose down --timeout 30
```

### 4.3、docker compose start / stop - 启动/停止服务
作用：启动或停止已创建的容器（不重建）。

```bash
# 启动所有服务
docker compose start

# 启动特定服务
docker compose start web db

# 停止所有服务
docker compose stop

# 停止特定服务
docker compose stop web

# 停止并设置超时
docker compose stop --timeout 60
```

与 up/down 的区别：

+ start/stop：只控制容器状态，不重建容器。
+ up/down：会重新创建容器（如果配置有变化）。

### 4.4、docker compose restart - 重启服务
作用：重启运行中的容器。

```bash
# 重启所有服务
docker compose restart

# 重启特定服务
docker compose restart web api

# 设置重启超时
docker compose restart --timeout 30
```

### 4.5、docker compose logs - 查看日志
作用：查看服务的日志输出。

```bash
# 查看所有服务日志
docker compose logs

# 实时跟踪日志
docker compose logs -f

# 查看特定服务日志
docker compose logs web

# 显示最近 N 行日志
docker compose logs --tail 100

# 显示时间戳
docker compose logs -t

# 组合使用
docker compose logs -f --tail 50 web
```

### 4.6、docker compose ps - 查看服务状态
作用：列出项目中所有容器的状态。

```bash
# 基本状态查看
docker compose ps

# 查看详细信息
docker compose ps -a

# 只显示正在运行的容器
docker compose ps --services --status running

# 以 JSON 格式输出
docker compose ps --format json
```

### 4.7、docker compose exec - 在容器中执行命令
作用：在运行中的容器内执行命令。

```bash
# 基本用法
docker compose exec web bash

# 执行单条命令
docker compose exec db psql -U postgres

# 以特定用户身份执行
docker compose exec --user root web apt update

# 禁用 TTY
docker compose exec -T db pg_dump myapp > backup.sql

# 设置工作目录
docker compose exec --workdir /app web ls -la
```

### 4.8、docker compose build - 构建镜像
作用：构建或重新构建服务镜像。

```bash
# 构建所有服务
docker compose build

# 构建特定服务
docker compose build web

# 不使用缓存
docker compose build --no-cache

# 强制拉取基础镜像
docker compose build --pull

# 并行构建
docker compose build --parallel

# 传递构建参数
docker compose build --build-arg NODE_ENV=production
```

### 4.9、docker compose pull - 拉取镜像
作用：拉取服务所需的所有镜像。

```bash
# 拉取所有服务的镜像
docker compose pull

# 拉取特定服务的镜像
docker compose pull web db

# 忽略构建镜像
docker compose pull --ignore-buildable
```

### 4.10、docker compose config - 验证和查看配置
作用：验证和查看 Compose 文件配置。

```bash
# 验证配置文件
docker compose config

# 只验证，不输出
docker compose config --quiet

# 显示使用的卷
docker compose config --volumes

# 显示使用的网络
docker compose config --networks

# 输出为 JSON
docker compose config --format json
```

### 4.11、docker compose run - 运行一次性命令
作用：为服务运行一次性命令。

```bash
# 运行测试
docker compose run --rm app npm test

# 运行数据库迁移
docker compose run --rm app python manage.py migrate

# 以特定环境运行
docker compose run -e NODE_ENV=test app npm test

# 挂载额外卷
docker compose run -v ./tmp:/tmp app backup-script.sh
```

与 exec 的区别：

+ run：创建新容器执行命令。
+ exec：在现有容器中执行命令。

### 4.12、docker compose scale - 扩缩容服务
作用：设置服务的容器实例数量。

```bash
# 扩展 Web 服务到 3 个实例
docker compose scale web=3

# 同时扩展多个服务
docker compose scale web=3 worker=2
```

如果服务定义了 container_name，则无法扩缩容。

### 4.13、docker compose top - 查看进程
作用：显示容器内的运行进程。

```bash
# 查看所有服务的进程
docker compose top

# 查看特定服务的进程
docker compose top web
```

### 4.14、docker compose kill - 强制杀死容器
作用：强制杀死容器（发送 SIGKILL）。

```bash
# 杀死所有服务
docker compose kill

# 杀死特定服务
docker compose kill web

# 发送特定信号
docker compose kill -s SIGTERM web
```

### 4.15、docker compose pause / unpause - 暂停/恢复容器
作用：暂停或恢复容器内的所有进程。

```bash
# 暂停服务
docker compose pause web

# 恢复服务
docker compose unpause web
```

### 4.16、 docker compose ls - 列出项目
作用：列出所有 Compose 项目。

```bash
# 列出所有项目
docker compose ls

# 显示详细信息
docker compose ls --all
```

### 4.17、docker compose images - 列出镜像
作用：列出服务使用的所有镜像。

```bash
# 列出所有服务的镜像
docker compose images

# 列出特定服务的镜像
docker compose images web
```

### 4.18、docker compose port - 查看端口映射
作用：查看服务的端口映射。

```bash
# 查看 Web 服务的 80 端口映射
docker compose port web 80

# 输出格式：0.0.0.0:8080
```

