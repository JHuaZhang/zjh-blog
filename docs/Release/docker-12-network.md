---
group:
  title: Docker
order: 12
title: docker network介绍

nav:
  title: 发布部署
  order: 2
---

## 1、介绍

Docker Network 是 Docker 提供的网络虚拟化功能，核心作用是让容器之间、容器与宿主机、容器与外部网络之间能够安全地通信，同时隔离不同容器的网络环境。

可以把 Docker 网络想象成一个 “虚拟交换机”：

- 每个容器可以连接到这个 “交换机”（对应 Docker 网络）。
- 连接到同一个 “交换机” 的容器可以互相通信。
- 不同 “交换机” 的容器默认隔离，无法直接通信。
- Docker 会为每个网络分配独立的网段，自动管理容器的 IP 地址。

**为什么需要网络？**

- 默认情况下，每个 Docker 容器是网络隔离的。
- 容器 A 无法直接访问容器 B 的服务（即使在同一台机器）。
- 用户也无法直接访问容器内的服务（除非显式暴露端口）。

**Docker Network 的作用：**

让多个容器加入同一个“虚拟局域网”，实现：

- 容器间通过名字互相通信（如 [http://backend:3000](http://backend:3000)）。
- 网络隔离（不同项目互不影响）。
- 安全（内部服务不对外暴露）。

上面这些概念很容易让人看得迷糊，下面我们就用之前的例子来说明一下：

在之前本地部署 gitlab 的时候，最开始的方式是直接通过 8080 端口映射，然后直接就可以通过 ip 的方式就来访问了，不过这种存在安全问题，后面使用域名之后，就换成通过域名如 git.xxx 的方式来访问，这个时候就不用 8080 端口来映射了：

```yaml
version: '3'

services:
  gitlab:
    image: gitlab/gitlab-ce:12.9.0-ce.0
    container_name: gitlab-local
    restart: unless-stopped
    hostname: 'gitlab'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        # 改为 HTTPS 域名
        external_url 'https://git.handn.fun'

        # 容器内仍监听 80
        nginx['listen_port'] = 80
        nginx['listen_https'] = false

        # SSH 端口
        gitlab_rails['gitlab_shell_ssh_port'] = 2222
        gitlab_rails['time_zone'] = 'Asia/Shanghai'

        # 告诉 GitLab 前端是 HTTPS
        nginx['proxy_set_headers'] = {
          "X-Forwarded-Proto" => "https",
          "X-Forwarded-Ssl" => "on"
        }

    # 🔥 移除 8080 端口映射！只保留 SSH（按需）
    ports:
      - '2222:22'
      # - "8080:80"  ← 已删除

    volumes:
      - ./config:/etc/gitlab
      - ./logs:/var/log/gitlab
      - ./data:/var/opt/gitlab
    shm_size: '256m'
    networks:
      - gitlab-network

networks:
  gitlab-network:
    driver: bridge
```

如这里我们移除了 8080 端口映射，而是给 gitlab 设置了 gitlab-network 这个 docker network，但是这样就会导致我们的 gitlab 服务根本访问不了，这个时候就可以上 nginx 了，nginx 会将我们访问[https://git.handn.fun](https://git.handn.fun)域名的内容进行转发，如下：

```bash
# 启动新 Nginx，加入 gitlab-network
docker run -d \
  --name nginx-https \
  --restart unless-stopped \
  --network docker-data_gitlab-network \          # 👈 关键：加入 GitLab 网络
  -p 80:80 \
  -p 443:443 \
  -v ~/nginx/conf.d:/etc/nginx/conf.d:ro \
  -v ~/nginx/ssl:/etc/nginx/ssl:ro \
  nginx:alpine
```

这样将 nginx 和 gitlab 放在同一个网络下，就可以实现容器间的互通，也就不用将一些容器暴露出去了。

## 2、举例说明

我们有如下的场景：

```bash
用户浏览器
    │
    ▼
https://myapp.com        ← 域名（备案后可用）
    │
    ▼
[Nginx 容器]             ← 监听 443，反向代理
    ├─ /          → [Frontend 容器:80]
    └─ /api/      → [Backend 容器:3001]
```

生产部署 —— 用 Docker Compose + Nginx

```bash
myapp/
├── docker-compose.yml
├── nginx/
│   └── default.conf       # Nginx 配置
├── frontend/              # 你的前端 build 后的静态文件
│   └── index.html
└── backend/               # 你的 Node.js 后端代码
    ├── package.json
    └── server.js
```

我们的一般步骤：

**①、构建前端静态文件**

```bash
cd myapp/frontend
npm run build  # 生成 dist/ 或 build/ 目录
```

**②、编写 Nginx 配置 nginx/default.conf**

```nginx
server {
  listen 80;
  server_name localhost;

  # 前端静态资源
  location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;  # 支持 SPA 路由
  }

  # API 代理到后端
  location /api/ {
    proxy_pass http://backend:3001/;   # 注意结尾的 /
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

proxy_pass [http://backend:3001/](http://backend:3001/)，backend 为 Docker Compose 中的服务名，自动解析到后端容器 IP。

**③、编写 docker-compose.yml**

```yaml
version: '3'

services:
  # 前端：Nginx 托管静态文件
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443' # 如果有 HTTPS
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
      - ./frontend:/usr/share/nginx/html # 挂载 build 后的文件
    depends_on:
      - backend
    networks:
      - app-network

  # 后端：Node.js 服务
  backend:
    build: ./backend
    # 或直接用镜像: image: node:18
    expose:
      - '3001' # 只在内部网络暴露，不映射到宿主机
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

```bash
# 启动所有服务
docker-compose up -d
```

**说明：**

上面 docker-compose.yml 关键配置：

```yaml
services:
  nginx:
    networks:
      - app-network # ← 加入网络

  backend:
    expose:
      - '3001' # ← 注意：是 expose，不是 ports！
    networks:
      - app-network # ← 也加入同一网络
```

当运行 docker-compose up 后：

:::color1

1. Docker 创建一个 私有虚拟网络 叫 myapp_app-network。
2. 启动两个容器：
   1. nginx → 分配 IP 172.20.0.2。
   2. backend → 分配 IP 172.20.0.3。
3. Docker 内置 DNS 记录：
   1. nginx → 172.20.0.2。
   2. backend → 172.20.0.3。

:::

**关键：expose vs ports：**

| 配置                 | 作用                         | 是否对外可见               |
| -------------------- | ---------------------------- | -------------------------- |
| expose: ["3001"]     | 仅在 Docker 内部网络开放端口 | ❌ 宿主机无法访问          |
| ports: ["3001:3001"] | 将容器端口映射到宿主机       | ✅ 外网可通过 IP:3001 访问 |

expose 的作用是：告诉 Docker 这个端口在内部网络可用（用于服务发现），但不对外暴露。

所以：

- Nginx 容器可以访问 backend:3001（因为同网络）。
- 本地电脑不能访问 [http://localhost:3001](http://localhost:3001)（因为没用 ports）。

**网络通信路径图：**

```bash
  [浏览器]
     │
     ▼ (访问 http://localhost)
[宿主机 80 端口] ← 由 docker-compose 的 ports: "80:80" 映射
     │
     ▼ (进入 Nginx 容器)
[Nginx 容器] → 执行 proxy_pass http://backend:3001
     │
     ▼ (Docker 内部网络)
[Docker 虚拟交换机] → 把 backend 解析为 172.20.0.3
     │
     ▼
[Backend 容器:3001] ← 监听 0.0.0.0:3001
```

expose 其实可以省略！只要容器内服务监听了端口（如 3001），同一网络的其他容器就能访问。expose 更多是文档作用（声明哪些端口可用）。

## 3、Docker Network 命令清单

Docker Network 核心命令速查表：

| 功能           | 命令                                        | 说明                       |
| -------------- | ------------------------------------------- | -------------------------- |
| 列出所有网络   | docker network ls                           | 查看当前主机所有网络       |
| 创建自定义网络 | docker network create [NAME]                | 创建 bridge 网络（默认）   |
| 查看网络详情   | docker network inspect [NAME]               | 查看 IP、容器、配置等      |
| 连接容器到网络 | docker network connect [NET] [CONTAINER]    | 动态加入网络               |
| 断开容器与网络 | docker network disconnect [NET] [CONTAINER] | 从网络移除容器             |
| 删除网络       | docker network rm [NAME]                    | 删除未使用的网络           |
| 清理无用网络   | docker network prune                        | 删除所有未被容器使用的网络 |

### 3.1、列出所有网络

```bash
docker network ls
```

输出示例：

```bash
NETWORK ID     NAME                DRIVER    SCOPE
a7363ec31330   bridge              bridge    local
f5e208efbcc8   host                host      local
448fcc183490   none                null      local
d8c1b3a12345   my-app-net          bridge    local   ← 自定义网络
```

bridge / host / none 是内置网络，不要删除。

### 3.2、创建自定义网络

```bash
# 基本创建（默认 driver=bridge）
docker network create my-net

# 指定子网和网关（避免 IP 冲突）
docker network create \
  --driver bridge \
  --subnet=172.20.0.0/16 \
  --gateway=172.20.0.1 \
  my-custom-net

# 指定网络名称（用于 Compose 外部引用）
docker network create --attachable shared-net
```

推荐：为多项目共享网络加 --attachable，允许外部容器加入。如下创建两个不同的网络：

```bash
# 普通网络
docker network create normal-net

# 可附加网络
docker network create --attachable attachable-net
```

接着创建一个容器：

```bash
docker run -d --name test-container alpine sleep 3600
```

然后将上面两个网络分别加入到 test-container 容器：

```bash
# 尝试加入普通网络 → ❌ 失败！
docker network connect normal-net test-container
# Error: network normal-net is not attachable

# 尝试加入 attachable 网络 → ✅ 成功！
docker network connect attachable-net test-container
```

可以看到未设置--attachable 的网络无法在容器运行的时候添加进去。

### 3.3、查看网络详情

```bash
docker network inspect my-net
```

关键信息包括：

- Containers: 列出所有连接的容器及其 IP。
- Options: 网络配置（如子网）。
- IPAM.Config: IP 地址池。

示例片段：

```bash
"Containers": {
  "a1b2c3d4...": {
    "Name": "web",
    "IPv4Address": "172.20.0.2/16"
  },
  "e5f6g7h8...": {
    "Name": "db",
    "IPv4Address": "172.20.0.3/16"
  }
}
```

### 3.4、启动容器时指定网络

```bash
# 启动时加入网络
docker run -d \
  --name web \
  --network my-net \
  nginx

# 同时加入多个网络（高级用法）
docker run -d \
  --name app \
  --network net1 \
  --network net2 \
  alpine
```

一个容器可属于多个网络，但每个网络中只有一个 IP。

### 3.5、动态连接/断开网络

```bash
# 将已运行的容器加入网络
docker network connect my-net existing-container

# 从网络断开（容器仍运行）
docker network disconnect my-net existing-container
```

常用于调试时临时加入监控网络，隔离故障容器等场景。

### 3.6、删除网络

```bash
# 删除空闲网络
docker network rm my-net

# 强制删除（先停止并移除关联容器）
docker stop $(docker ps -aq --filter network=my-net)
docker rm $(docker ps -aq --filter network=my-net)
docker network rm my-net
```

如果网络被容器使用，会报错：Error: network my-net has active endpoints。

### 3.7、清理无用网络

```bash
# 删除所有未被使用的网络（谨慎！）
docker network prune

# 安全模式（确认后删除）
docker network prune -f
```

定期清理可避免网络碎片。

## 4、Docker 网络的核心类型

Docker 内置了 4 种常用的网络驱动（驱动决定了网络的工作方式），可以根据场景选择：

| 类型    | 命令/配置                    | 特点                          | 适用场景                    |
| ------- | ---------------------------- | ----------------------------- | --------------------------- |
| bridge  | 默认 / docker network create | 私有网络，支持 DNS 解析容器名 | ✅ 90% 场景：单机多容器通信 |
| host    | --network host               | 共享宿主机网络命名空间        | 高性能、监控、网络工具      |
| none    | --network none               | 完全禁用网络（仅 lo）         | 安全隔离、离线任务          |
| overlay | Swarm 模式自动创建           | 跨主机容器通信                | Docker Swarm 集群           |
| macvlan | 高级配置                     | 容器拥有独立 MAC 地址         | 需要容器像物理机一样        |

90% 场景使用 bridge；Swarm 用 overlay；特殊需求用 macvlan。日常开发只需掌握 bridge；其他按需了解即可。

**如何选择网络类型：**

| 需求                            | 推荐网络类型          |
| ------------------------------- | --------------------- |
| 前端 + 后端 + DB                | bridge（自定义网络）  |
| 高性能监控工具（如 Prometheus） | host                  |
| 安全离线任务                    | none                  |
| 多服务器集群（Swarm）           | overlay               |
| 容器需要独立 MAC 地址           | macvlan（仅限物理机） |

### 4.1、bridge（桥接网络）

**原理：**

- Docker 创建一个虚拟网桥（docker0）。
- 容器通过 veth pair 连接到网桥。
- 容器获得私有 IP（如 172.17.0.2）。
- 自定义 bridge 网络支持 DNS 解析容器名。

**使用方式：**

**①、默认 bridge 网络（不推荐用于多容器）**

```bash
# 所有容器默认加入此网络
docker run -d --name web nginx
docker run -it --name client alpine

# ❌ 不能用容器名通信！
docker exec client ping web   #失败
```

**②、自定义 bridge 网络**

```bash
# 创建网络
docker network create my-app-net

# 启动容器加入网络
docker run -d --name backend --network my-app-net nginx
docker run -it --name frontend --network my-app-net alpine

# ✅ 可用容器名通信
docker exec frontend ping backend
```

**③、在 docker-compose.yml 中使用**

```yaml
version: '3'
services:
  web:
    image: nginx
    networks:
      - my-net

  db:
    image: postgres
    networks:
      - my-net

networks:
  my-net:
    driver: bridge
    # name: my-net    # 可选：固定全局名称
    # attachable: true # 可选：允许外部容器加入
```

**优点：**

- 容器间可通过 名字通信（[http://db:5432](http://db:5432)）。
- 网络隔离（不同项目互不影响）。
- 安全（内部服务无需暴露端口）。

### 4.2、host（主机网络）

**原理：**

- 容器 直接共享宿主机的网络命名空间。
- 无网络隔离，容器 = 宿主机。
- 性能最高（无 NAT、无虚拟网卡）。

```bash
# 启动容器使用 host 网络
docker run -d --network host --name prometheus prom/prometheus
```

此时 Prometheus 直接监听宿主机的 9090 端口，无需 -p 9090:9090。

**适用场景**

- 网络性能敏感（如监控、抓包工具）。
- 需要监听大量端口（如 P2P 应用）。
- 替代 --net=host 的旧写法。

**缺点：**

- 无端口隔离：多个容器不能监听同一端口。
- 无网络隔离：容器可访问宿主机所有网络接口。
- 不支持端口映射：-p 参数无效。

**举例说明 host 怎么实现网络监控：**

当用默认方式启动一个监控容器（比如 Prometheus）：

```bash
docker run -d -p 9090:9090 --name prom prom/prometheus
```

它的网络路径是这样的：

```bash
宿主机应用 (如 Nginx)
    │
    ▼
[宿主机网络栈]
    │
    ▼
[Docker 虚拟网桥 docker0] ← NAT 转换、iptables 规则
    │
    ▼
[Prometheus 容器]
```

问题：

- 所有流量要经过 Docker 虚拟网桥 + NAT。
- 监控工具看到的是 虚拟 IP（如 172.17.0.2），不是真实连接。
- 无法获取宿主机原始网络指标（如 TCP 连接数、socket 状态）。

而--network host 的魔法：直接“贴”在宿主机上：

```bash
docker run -d --network host --name prom-host prom/prometheus
```

此时，Prometheus 完全共享宿主机的网络命名空间：

```bash
宿主机应用 (Nginx, MySQL...)
    │
    ▼
[宿主机网络栈] ← Prometheus 直接在这里“监听”
    │
    ▼
Prometheus 容器 = 宿主机的一部分
```

**优势：**

- Prometheus 能直接读取 /proc/net/ 下的原始网络数据。
- 能看到 所有进程的真实 TCP 连接、端口、流量。
- 无性能损耗（没有虚拟网卡、NAT、端口映射）。

如果想实现一个兼容服务器性能的功能，可以直接使用 Prometheus + Node Exporter + Grafana（业界标准组合），并用 Docker 一键部署。

```bash
  [服务器]
    │
    ├── [Node Exporter] → 采集本机指标（CPU/内存/磁盘/网络）
    │        ↑
    │        └── 运行在 --network host 模式（关键！）
    │
    ├── [Prometheus] → 定时拉取指标 + 存储
    │
    └── [Grafana] → 可视化展示
             │
             ▼
       http://your-server:3000 → 美丽的监控大盘
```

所有组件都用 Docker 运行，但 Node Exporter 必须用 --network host。

**①、创建项目目录**

```bash
mkdir server-monitoring && cd server-monitoring
```

**②、编写 docker-compose.yml**

```yaml
version: '3'

services:
  # 1. Node Exporter：采集本机指标（必须用 host 网络！）
  node-exporter:
    image: quay.io/prometheus/node-exporter:latest
    container_name: node-exporter
    command:
      - '--path.rootfs=/host'
    network_mode: host # ← 关键！等价于 --network host
    pid_mode: host # 获取完整进程信息
    volumes:
      - '/:/host:ro,rslave' # 挂载宿主机根目录（只读）
    restart: unless-stopped

  # 2. Prometheus：拉取指标 + 存储
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - '9090:9090'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prom_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  # 3. Grafana：可视化
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - '3000:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    restart: unless-stopped

volumes:
  prom_data:
  grafana_data:
```

**关键点：**

- node-exporter 用 network_mode: host → 能看到真实服务器指标。
- 挂载 / 到 /host（只读）→ 安全地读取系统文件。

**③、配置 Prometheus (prometheus.yml)**

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100'] # Node Exporter 默认端口
```

因为 Prometheus 和 Node Exporter 都在宿主机网络，所以用 localhost:9100。

**④、启动监控系统**

```yaml
# 启动所有服务
docker-compose up -d

# 查看日志（可选）
docker-compose logs -f
```

**⑤、访问 Grafana 并配置数据源**

1. 打开浏览器访问：http://你的服务器 IP:3000。
2. 登录：
   1. 用户名：admin。
   2. 密码：admin（首次登录会要求改密码）。
3. 添加数据源：
   1. 左侧齿轮图标 → Data Sources → Add data source。
   2. 选择 Prometheus。
   3. URL 填：[http://prometheus:9090](http://prometheus:9090)（因为 Grafana 和 Prometheus 在同一 Docker 网络）。
   4. 点击 Save & Test。

**⑥、导入现成监控大盘**

- 在 Grafana 左侧点击 + → Import。
- 输入 Dashboard ID：1860（这是官方 Node Exporter 全能监控模板）。
- 选择 Prometheus 数据源 → Import。

最后可以看到一个专业级服务器监控大盘，包含：

- CPU 使用率（按核）。
- 内存使用（含缓存/缓冲区）。
- 磁盘 IO、读写速度。
- 网络流量（进出）。
- 系统负载、进程数。
- 磁盘空间。

### 4.3、none（无网络）

原理：容器只有 lo（回环）接口，完全断网，无法访问外网，也无法被访问。

```yaml
docker run -it --network none alpine ip addr
```

输出：

```yaml
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1000
    link/loop 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
```

**适用场景：**

- 安全敏感任务（如密码生成、加密计算）。
- 离线批处理（不需要网络）。
- 测试“无网络”环境行为。

### 4.4、overlay（覆盖网络）

原理：基于 VXLAN 技术，实现 跨多台 Docker 主机 的容器通信，仅在 Docker Swarm 模式下使用。

```yaml
# 初始化 Swarm
docker swarm init

# 创建 overlay 网络
docker network create -d overlay my-overlay-net

# 部署服务
docker service create \
  --name web \
  --network my-overlay-net \
  nginx
```

**适用场景：**

- Docker Swarm 集群。
- 微服务跨节点通信。
- 服务发现与负载均衡。

### 4.5、macvlan（MAC VLAN）

原理：为容器分配 独立的 MAC 地址，容器在网络中表现为 一台物理设备，绕过 Docker 网桥，直接接入物理网络。

```yaml
# 创建 macvlan 网络（需指定父接口，如 eth0）
docker network create -d macvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  -o parent=eth0 \
  my-macvlan-net

# 启动容器
docker run -d \
  --network my-macvlan-net \
  --ip=192.168.1.100 \
  --name iot-device \
  alpine
```

**适用场景：**

- IoT 设备模拟（每个容器像一个硬件）。
- 遗留系统要求固定 MAC/IP。
- 网络设备测试（如 DHCP、ARP）。
