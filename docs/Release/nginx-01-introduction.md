---
group:
  title: Nginx
order: 1
title: nginx介绍及安装

nav:
  title: 发布部署
  order: 2
---

## 1、介绍
Nginx是一款高性能、轻量级的 Web 服务器、反向代理服务器、负载均衡器 和 HTTP 缓存服务器。由俄罗斯开发者 Igor Sysoev 于 2004 年首次发布，旨在解决 C10K（即同时处理上万个并发连接）问题。

**核心特性：**

1. **高性能与高并发：**
    1. 采用 事件驱动（event-driven）、异步非阻塞（asynchronous non-blocking） 架构。
    2. 单个进程可处理数万甚至数十万并发连接，资源消耗远低于传统多线程模型（如 Apache）。
2. **反向代理（Reverse Proxy）：**
    1. 可将客户端请求转发到后端应用服务器（如 Node.js、Python、Java 应用等）。
    2. 支持 HTTP、HTTPS、gRPC、FastCGI、uWSGI、SCGI 等协议。
3. **负载均衡（Load Balancing）：**
    1. 支持多种负载均衡算法：
        1. 轮询（Round Robin，默认）。
        2. 加权轮询（Weighted Round Robin）。
        3. IP 哈希（IP Hash）。
        4. 最少连接（Least Connections）。
    2. 可配置健康检查、故障转移和重试机制。
4. **静态文件服务：**
    1. 高效地提供静态资源（HTML、CSS、JS、图片等），支持缓存、压缩、范围请求（Range Requests）等。
5. **SSL/TLS 终止：**
    1. 支持 HTTPS 配置，可处理 SSL/TLS 加密/解密，减轻后端服务器负担。
6. **缓存与加速：**
    1. 可缓存后端响应，减少对上游服务器的请求，提升响应速度。
7. **模块化架构：**
    1. 功能通过模块扩展，官方提供核心模块和第三方模块（如 Lua、GeoIP、RTMP 等）。
    2. 支持动态加载模块（从 Nginx 1.9.11 起）。
8. **高可用与热部署：**
    1. 支持平滑重启（reload）和升级，无需中断服务。
    2. 可配合 Keepalived 实现高可用集群。

**主要应用场景：**

| 场景 | 说明 |
| --- | --- |
| Web 服务器 | 提供静态内容，速度快、资源占用低 |
| 反向代理 | 隐藏后端服务，统一入口，增强安全性 |
| 负载均衡 | 分发流量到多个应用实例，提高可用性与伸缩性 |
| API 网关 | 路由、限流、认证、日志等（常配合 OpenResty/Lua） |
| 缓存服务器 | 缓存动态内容，减轻数据库或应用压力 |
| 流媒体服务器 | 通过 RTMP 模块支持直播推流（需第三方模块） |


## 2、nginx的安装及使用
### 2.1、常用nginx的4个版本介绍
以下是 Nginx 生态中四个常用版本 的详细介绍与对比，包括：

+ Nginx 开源版（Nginx Open Source）。
+ Nginx Plus（商业版）。
+ OpenResty。
+ Tengine。

#### 2.1.1、Nginx开源版
+ 开发者：F5 Networks（原 Nginx, Inc.）。
+ 许可证：2-clause BSD License（完全开源免费）。
+ 官网：[https://nginx.org/](https://nginx.org/)。
+ 特点：
    - 官方原始版本，功能稳定、社区活跃。
    - 支持核心功能：Web 服务器、反向代理、负载均衡、SSL/TLS、HTTP/2、静态文件服务等。
    - 模块需在编译时静态集成（动态模块支持从 1.9.11 起逐步完善）。
+ 适用场景：
    - 中小型网站、API 网关基础部署、学习与开发环境。
+ 局限性：
    - 缺少高级功能（如主动健康检查、JWT 认证、可视化监控等）。
    - 不提供官方商业支持。

✅ 优势：免费、轻量、高性能、广泛兼容。

❌ 不足：高级运维和企业级功能缺失。

#### 2.1.2、Nginx Plus（Nginx商业版）
+ 开发者：F5 Networks。
+ 许可证：商业授权（付费）。
+ 官网：[https://www.nginx.com/products/nginx/](https://www.nginx.com/products/nginx/)。
+ 基于：Nginx 开源版 + 企业级增强功能。
+ 核心增强功能：
    - 主动健康检查（Active Health Checks）：自动剔除故障后端节点。
    - 会话保持（Session Persistence）：基于 Cookie 或 IP 的粘性会话。
    - JWT 认证：原生支持 JSON Web Token 验证。
    - 实时监控 API：提供 /api 接口，可集成 Prometheus、Grafana。
    - 动态配置更新：无需 reload 即可修改 upstream 服务器列表。
    - 官方技术支持：7×24 小时 SLA 保障。
+ 适用场景：
    - 金融、电商、SaaS 等对高可用、安全性和运维效率要求高的企业。
    - 价格：按服务器/实例年费计费（通常数千美元/年起）。

✅ 优势：功能全面、企业级支持、开箱即用的高级特性。

❌ 不足：成本高，不适合预算有限的项目。

#### 2.1.3、OpenResty
+ 开发者：章亦春（agentzh）团队，基于 Nginx 二次开发。
+ 许可证：BSD-like（开源免费）。
+ 官网：[https://openresty.org/](https://openresty.org/)。
+ 核心思想：将 Nginx 打造成一个全功能 Web 应用平台。
+ 关键技术：
    - 内嵌 LuaJIT 引擎，支持在 Nginx 配置中直接编写 Lua 脚本。
    - 提供大量 Lua 库（如 lua-resty-core、lua-resty-http、lua-resty-redis 等）。
    - 支持非阻塞 I/O，可直接访问数据库（MySQL、PostgreSQL）、缓存（Redis）、消息队列等。
+ 典型应用：
    - 高性能 API 网关（如 Kong 网关底层基于 OpenResty）。
    - 动态路由、限流、鉴权、日志聚合。
    - 实时风控、AB 测试、灰度发布。
+ 优势：
    - 极致性能（C + LuaJIT）。
    - 逻辑灵活，可替代部分后端服务。
    - 社区活跃，生态丰富（Kong、APISIX 等均基于它）。

✅ 优势：可编程性强、性能极高、适合构建复杂网关逻辑。

❌ 不足：学习曲线较陡（需掌握 Lua 和 Nginx 内部机制）。

#### 2.1.4、Tengine
+ 开发者：阿里巴巴集团（开源）。
+ 许可证：BSD License（开源免费）。
+ 官网：[http://tengine.taobao.org/](http://tengine.taobao.org/)。
+ 背景：为支撑淘宝、天猫等高并发场景而优化的 Nginx 分支。
+ 主要增强功能：
    - 动态模块加载（早于官方 Nginx 实现）。
    - 更智能的负载均衡算法（如 consistent_hash、least_conn 增强）。
    - 异步文件 I/O（AIO）优化：提升静态文件处理性能。
    - 请求合并（Request Combine）：减少小文件请求开销。
    - DYNAMIC_UPSTREAM：运行时动态增删 upstream 节点。
    - 更详细的统计信息（如连接数、请求耗时分布）。
+ 现状：
    - 曾广泛用于阿里系产品，但近年来官方更新放缓（最新稳定版为 2022 年的 2.3.3）。
    - 部分优秀特性已回馈到官方 Nginx（如动态模块）。
+ 适用场景：
    - 对静态资源服务有极致性能要求的场景。
    - 需要动态 upstream 管理但不想用 Plus 的企业。

✅ 优势：针对高并发优化、免费、兼容 Nginx 配置。

❌ 不足：社区活跃度下降，新特性迭代慢。

#### 2.1.5、总结对比
**四者对比总结表：**

| 特性 | Nginx 开源版 | Nginx Plus | OpenResty | Tengine |
| --- | --- | --- | --- | --- |
| 是否免费 | ✅ 是 | ❌ 否（付费） | ✅ 是 | ✅ 是 |
| 核心定位 | 通用 Web 服务器/代理 | 企业级代理/负载均衡 | 可编程网关平台 | 高性能 Web 服务器（阿里优化版） |
| 动态 upstream | ❌（需 reload） | ✅（API 控制） | ✅（Lua 实现） | ✅（DYNAMIC_UPSTREAM） |
| 健康检查 | 被动（仅错误剔除） | ✅ 主动 + 被动 | ✅（Lua 自定义） | ✅ 增强版被动检查 |
| 脚本能力 | 无 | 有限（njs） | ✅ 强大（LuaJIT） | 无 |
| 企业支持 | 社区 | ✅ 官方 SLA | 社区 / 第三方 | 社区（阿里已减少维护） |
| 典型用户 | 全球中小网站 | Netflix、Cisco、F5 客户 | Kong、APISIX、Cloudflare | 阿里巴巴（历史） |


**如何选择？**

+ 只想做简单反向代理或静态服务？ → 选 Nginx 开源版。
+ 需要企业级功能+技术支持？ → 选 Nginx Plus。
+ 要构建高性能、可编程的 API 网关？ → 选 OpenResty。
+ 追求极致静态性能，且接受稍旧版本？ → 可考虑 Tengine。

## 2.2、安装nginx
因为我们学习阶段对nginx的要求没那么高，因此就直接使用社区版进行了解使用，后续再根据需要熟悉其他

### 2.2.1、使用Docker安装Nginx
#### 2.2.1.1、Docker安装
**①、阿里云服务器安装docker：**

**步骤 1：卸载旧版本（如有）**

```bash
sudo dnf remove docker \
                docker-client \
                docker-client-latest \
                docker-common \
                docker-latest \
                docker-latest-logrotate \
                docker-logrotate \
                docker-selinux \
                docker-engine-selinux \
                docker-engine
```

**步骤 2：安装必要依赖**

```bash
sudo dnf install -y yum-utils device-mapper-persistent-data lvm2
```

注意：虽然系统用dnf，但yum-utils仍然可用（Alibaba Cloud Linux兼容）。

**步骤 3：添加Docker官方仓库**

```bash
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

Alibaba Cloud Linux 3与CentOS 8/Stream兼容，因此使用centos仓库是官方认可的做法。Docker官方也明确支持RHEL及其兼容发行版。

**步骤 4：（可选）配置国内镜像加速（提升下载速度）**

编辑仓库文件，将baseurl指向阿里云镜像（更稳定快速）：

```bash
sudo sed -i 's|https://download.docker.com|https://mirrors.aliyun.com/docker-ce|g' /etc/yum.repos.d/docker-ce.repo
```

这一步强烈建议在阿里云 ECS 上执行，避免因网络问题导致安装失败。

**步骤 5：安装Docker Engine**

```bash
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

**步骤 6：启动并设置开机自启**

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

**步骤 7：验证安装**

```bash
sudo docker --version
sudo docker run hello-world
```

	如果看到：

```bash
Hello from Docker!
This message shows your installation appears to be working correctly.
```

说明安装成功！

有的时候会报错：

```bash
[root@iZ2zeb9fdjcne1mfh06bmoZ ~]# sudo docker run hello-world
Unable to find image 'hello-world:latest' locally
docker: Error response from daemon: Get "https://registry-1.docker.io/v2/": net/http: request canceled while waiting for connection (Client.Timeout exceeded while awaiting headers).
See 'docker run --help'.
[root@iZ2zeb9fdjcne1mfh06bmoZ ~]# 
```

根本原因：阿里云服务器无法访问Docker Hub（registry-1.docker.io），这是国内云服务器的常见问题（受网络限制或防火墙策略影响）。直接使用步骤9即可解决。

**步骤 8：（可选）将当前用户加入docker组，免sudo**

```bash
sudo usermod -aG docker $USER
```

然后重新登录终端或执行：

```bash
newgrp docker
```

之后即可直接运行：

```bash
docker ps
```

**步骤9：（可选）配置Docker镜像加速器（阿里云）**

在阿里云上拉取Docker Hub镜像可能较慢，建议配置镜像加速器：

创建或编辑Docker配置文件：

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://<your-aliyun-mirror>.mirror.aliyuncs.com"]
}
EOF
```

替换<your-aliyun-mirror>为你的专属加速地址（免费）：

+ 登录 [阿里云容器镜像服务控制台](https://cr.console.aliyun.com/cn-beijing/instances/mirrors)
+ 左侧菜单 → 镜像工具 → 镜像加速器
+ 复制你的专属地址（如[https://tv448oas.mirror.aliyuncs.com](https://tv448oas.mirror.aliyuncs.com)）

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://tv448oas.mirror.aliyuncs.com"]
}
EOF
```

重启Docker生效：

```bash
sudo systemctl daemon-reexec
sudo systemctl restart docker
```

#### 2.2.1.2、安装nginx
```bash
docker pull nginx:latest
```

**启动Nginx容器：**

```bash
# 简单启动（80 端口映射到主机）
docker run -d \
  --name my-nginx \
  -p 80:80 \
  nginx
```

挂载自定义配置和静态文件：



```bash
# 创建本地目录
mkdir -p ~/nginx/{conf.d,html}

# 示例：创建一个默认 index.html
echo "<h1>Hello from Nginx on Docker!</h1>" > ~/nginx/html/index.html

cat > ~/nginx/conf.d/default.conf <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ =404;
    }
}
EOF

# 启动时挂载配置和网页目录
docker run -d \
  --name my-nginx \
  -p 80:80 \
  -v ~/nginx/html:/usr/share/nginx/html:ro \
  -v ~/nginx/conf.d:/etc/nginx/conf.d:ro \
  nginx
```

常用命令：

```bash
# 查看日志
docker logs my-nginx

# 进入容器调试
docker exec -it my-nginx /bin/bash

# 停止/删除
docker stop my-nginx && docker rm my-nginx
```

### 2.2.2、在Linux服务器上直接安装Nginx
在 Alibaba Cloud Linux 3.2104 LTS 64位 系统上安装Nginx，可以使用dnf包管理器。

```shell
sudo dnf install nginx -y
```

**启动并设置开机自启：**

```shell
# 启动 Nginx 服务
sudo systemctl start nginx     # 启动
sudo systemctl enable nginx		 # 设置开机自启动
sudo systemctl stop nginx      # 停止
sudo systemctl restart nginx   # 重启
sudo systemctl reload nginx    # 重载配置（不中断服务）
sudo systemctl status nginx    # 查看状态
```

**配置防火墙：**

如果服务器启用了 firewalld，需要放行 HTTP（80）和HTTPS（443）端口：

```shell
# 放行 HTTP 和 HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# 重新加载防火墙配置
sudo firewall-cmd --reload
```

**测试Nginx是否正常运行：**

在浏览器中访问你的服务器公网IP：

```http
http://8.141.84.225
```

**卸载nginx：**

```shell
sudo systemctl stop nginx
sudo systemctl disable nginx
sudo dnf remove nginx -y
sudo rm -rf /etc/nginx      # 删除配置（谨慎操作）
```

**nginx配置文件路径：**

+ 主配置文件：/etc/nginx/nginx.conf。
+ 站点配置目录：/etc/nginx/conf.d/（可在此添加.conf文件）。
+ 默认网站根目录：/usr/share/nginx/html。
+ 日志文件：
    - 访问日志：/var/log/nginx/access.log。
    - 错误日志：/var/log/nginx/error.log。


