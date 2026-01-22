---
group:
  title: Nginx
order: 6
title: nginx负载均衡

nav:
  title: 发布部署
  order: 2
---

## 1、介绍
nginx 的负载均衡（Load Balancing）是其核心功能之一，用于将客户端请求分发到多个后端服务器（如应用服务器、API 服务等），以提高系统的可用性、可扩展性和性能。通过负载均衡，可以避免单点故障、提升吞吐量，并实现更高效的资源利用。

nginx 作为反向代理服务器，接收来自客户端的请求，然后根据配置的策略将请求转发给一组后端服务器（称为“upstream”服务器组）。后端服务器处理完请求后，将响应返回给 nginx，再由 nginx 返回给客户端。

整个过程对客户端透明，客户端只与 nginx 交互。

**基本配置式例：**

```nginx
http {
  upstream backend {
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    server 192.168.1.12:8080;
  }

  server {
    listen 80;

    location / {
      proxy_pass http://backend;
    }
  }
}
```

+ upstream 块定义一个服务器组，名称为 backend。
+ proxy_pass 将请求代理到该组。
+ 默认使用 轮询（Round Robin） 算法。

**举例使用：**

我们可以在本地中使用docker运行3个react应用实例，分别显示不同的标识，然后使用nginx作为负载均衡器，将请求分发到这3个实例上，这样就可以用来测试一下nginx的负载均衡策略。

对应的项目结构如下：

```plain
nginx-react-lb/     
├── nginx.conf              
├── docker-compose.yml
├── scripts/
│   └── write-hostname.sh
└── react-app/
    ├── web1/
    │   └── index.html
    ├── web2/
    │   └── index.html
    └── web3/
        └── index.html
```

我们不运行 npm start，而是直接构建静态 HTML，用 nginx 托管，更轻量、更贴近生产。

**一、创建静态页面（模拟 3 个不同实例）**

**①、创建目录：**

```bash
mkdir -p nginx-react-lb/react-app/build
cd nginx-react-lb
```

②、创建3个不同的index.html文件

我们将为每个“后端”准备一个带标识的 HTML 页面。

为 web1 创建：

```bash
mkdir -p react-app/web1
cat > react-app/web1/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>React App - Web1</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #e6f7ff; }
    .container { max-width: 600px; margin: 0 auto; }
    .box { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <div class="box">
      <h1>✅ Hello from React Web1!</h1>
      <p>This is the <strong>first backend instance</strong>.</p>
      <p>Hostname: <span id="hostname"></span></p>
      <button onclick="location.reload()">Reload</button>
    </div>
  </div>
  <script>
    // 显示容器 hostname（如果运行在 Docker 中）
    fetch('/hostname.txt')
      .then(res => res.text())
      .then(hostname => document.getElementById('hostname').textContent = hostname.trim() || 'unknown')
      .catch(() => document.getElementById('hostname').textContent = 'local');
  </script>
</body>
</html>
EOF
```

为 web2 创建：

```bash
mkdir -p react-app/web2
cat > react-app/web2/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>React App - Web2</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0fff4; }
    .container { max-width: 600px; margin: 0 auto; }
    .box { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <div class="box">
      <h1>✅ Hello from React Web2!</h1>
      <p>This is the <strong>second backend instance</strong>.</p>
      <p>Hostname: <span id="hostname"></span></p>
      <button onclick="location.reload()">Reload</button>
    </div>
  </div>
  <script>
    fetch('/hostname.txt')
      .then(res => res.text())
      .then(hostname => document.getElementById('hostname').textContent = hostname.trim() || 'unknown')
      .catch(() => document.getElementById('hostname').textContent = 'local');
  </script>
</body>
</html>
EOF
```

为 web3 创建：

```bash
mkdir -p react-app/web3
cat > react-app/web3/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>React App - Web3</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #fff9e6; }
    .container { max-width: 600px; margin: 0 auto; }
    .box { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <div class="box">
      <h1>✅ Hello from React Web3!</h1>
      <p>This is the <strong>third backend instance</strong>.</p>
      <p>Hostname: <span id="hostname"></span></p>
      <button onclick="location.reload()">Reload</button>
    </div>
  </div>
  <script>
    fetch('/hostname.txt')
      .then(res => res.text())
      .then(hostname => document.getElementById('hostname').textContent = hostname.trim() || 'unknown')
      .catch(() => document.getElementById('hostname').textContent = 'local');
  </script>
</body>
</html>
EOF
```

每个页面颜色不同，便于区分。同时会尝试加载 /hostname.txt 显示容器 ID（后面会生成）。

二、创建nginx配置文件

```bash
touch nginx.conf
vim nginx.conf
```

	内容为：

```nginx
events {
  worker_connections 1024;
}

http {
  upstream backend {
    # ===== 轮询（默认）=====
    server web1:80; 
    server web2:80;
    server web3:80;

    # 加权轮询示例：
    # server web1:80 weight=3;
    # server web2:80 weight=1;
    # server web3:80 weight=1;

    # 最少连接：
    # least_conn;
    # server web1:80;
    # server web2:80;
    # server web3:80;

    # IP 哈希：
    # ip_hash;
    # server web1:80;
    # server web2:80;
    # server web3:80;
  }

  server {
    listen 80;

    location / {
      proxy_pass http://backend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
  }
}
```

	这样可以随时修改 upstream 部分来测试不同算法，然后重启 nginx 容器。

**三、创建docker-compose.yml**

```yaml
touch docker-compose.yml
vim docker-compose.yml
```

```yaml
services:
  nginx-lb:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - web1
      - web2
      - web3

  web1:
    image: nginx:alpine
    volumes:
      - ./react-app/web1:/usr/share/nginx/html

  web2:
    image: nginx:alpine
    volumes:
      - ./react-app/web2:/usr/share/nginx/html

  web3:
    image: nginx:alpine
    volumes:
      - ./react-app/web3:/usr/share/nginx/html

```

```yaml
# 启动所有容器
docker-compose up -d
```

	这样我们访问[http://localhost:8080/](http://localhost:8080/)，就可以看到页面中的内容会依次由web1到web2再到web3轮流切换。

## 2、nginx复杂均衡的算法
nginx 本身 不支持“复杂均衡算法”（如 Least Response Time、Consistent Hashing 等高级算法），但通过其 开源版本 + 第三方模块 或 商业版 nginx Plus，可以实现多种负载均衡策略。包括：

+ 开源版内置算法。
+ 第三方模块扩展算法。
+ nginx Plus 商业版高级算法。

### 2.1、nginx开源版支持的算法
#### 2.1.1、轮询（默认算法）
+ 原理：按顺序依次将请求分发给 upstream 服务器列表中的每个节点。
+ 特点：
    - 简单、公平。
    - 不考虑服务器性能差异。

```nginx
upstream backend {
  server 192.168.1.10;
  server 192.168.1.11;
  server 192.168.1.12;
}
```

#### 2.1.2、加权轮询
+ 原理：根据 weight 值分配请求比例。权重越高，接收请求越多。
+ 公式：某服务器接收请求比例 = 自身权重 / 总权重。
+ 适用场景：后端服务器硬件配置不均（如 4核 vs 2核）。

```nginx
upstream backend {
  server 192.168.1.10 weight=3;  # 接收约 60% 请求
  server 192.168.1.11 weight=2;  # 接收约 40% 请求
}
```

#### 2.1.3、最少连接
+ 原理：将新请求分配给当前活跃连接数最少的服务器。
+ 公式：选择 active_connections / weight 最小的服务器。
+ 适用场景：请求处理时间差异大（如有的 API 耗时 10ms，有的耗时 5s）。

```nginx
upstream backend {
  least_conn;
    server 192.168.1.10;
  server 192.168.1.11;
}
```

#### 2.1.4、IP哈希
+ 原理：对客户端 IP 地址进行哈希，确保同一 IP 始终路由到同一后端。
+ 哈希方式：
    - IPv4：直接哈希
    - IPv6：取前 32 位哈希
+ 局限性：
    - 若使用 CDN/代理，真实 IP 被掩盖 → 需配合 real_ip 模块。
    - 服务器增减会导致大量用户重新分配（无一致性）。

```nginx
upstream backend {
  ip_hash;
  server 192.168.1.10;
  server 192.168.1.11;
}
```

#### 2.1.5、通用哈希
+ 原理：基于任意变量（如 $request_uri、$cookie_JSESSIONID）进行哈希。
+ 支持一致性哈希（Consistent Hashing）：添加 consistent 关键字。
+ 优势：服务器增减时，只影响少量 key 的映射（适合缓存场景）。

```nginx
# 基于 URI 哈希（相同 URL 路由到同一服务器）
upstream backend {
  hash $request_uri consistent;
  server 192.168.1.10;
  server 192.168.1.11;
}

# 基于 Cookie 会话保持
upstream backend {
  hash $cookie_session_id;
  server 192.168.1.10;
  server 192.168.1.11;
}
```

这是开源版最接近“复杂均衡”的功能！

### 2.2、通过第三方模块扩展的算法
第三方模块需重新编译 nginx，生产环境慎用。

#### 2.2.1、nginx-upstream-fair模块
实现 公平调度：考虑响应时间，优先选择快的服务器。

```nginx
upstream backend {
  fair;
    server 192.168.1.10;
  server 192.168.1.11;
}
```

#### 2.2.2、nginx-sticky-module
+ 实现 Session Sticky（会话粘滞），比 ip_hash 更灵活。
+ 基于 Cookie 实现，支持 fallback。

```nginx
upstream backend {
  sticky;
    server 192.168.1.10;
  server 192.168.1.11;
}
```

### 2.3、nginx Plus（商业版）高级算法
nginx Plus 提供企业级负载均衡能力：

#### 2.3.1、 Least Time（最少时间）
+ 原理：选择 平均响应时间最短 + 当前连接数最少 的服务器。
+ 模式：
    - header：仅计算到收到响应头的时间。
    - last_byte：计算到完整响应体接收完毕。

```nginx
upstream backend {
  least_time header;
  server 192.168.1.10;
  server 192.168.1.11;
}
```

#### 2.3.2、主动健康检查
定期探测 /health 接口，自动剔除异常节点。

```nginx
location / {
  proxy_pass http://backend;
  health_check uri=/health interval=5s fails=2 passes=1;
}
```

#### 2.3.3、Slow Start（慢启动）
新恢复的服务器逐步增加流量，避免瞬间过载。

```nginx
server 192.168.1.10 slow_start=30s;
```

## 3、健康检查
### 3.1、被动健康检查（开源版支持）
nginx 开源版通过 max_fails 和 fail_timeout 实现：

```nginx
upstream backend {
  server 192.168.1.10:80 max_fails=3 fail_timeout=30s;
  server 192.168.1.11:80;
}
```

+ max_fails=3：在 fail_timeout 时间内失败 3 次，标记为不可用。
+ fail_timeout=30s：30 秒后尝试恢复。

缺陷：只有请求失败才触发，无法提前发现“假死”服务（如进程卡住但端口通）。

### 3.2、主动健康检查（nginx Plus或第三方模块）
定期探测 /health 接口：

```nginx
location / {
  proxy_pass http://backend;
  health_check interval=5s uri=/health match=healthy;
}

match healthy {
  status 200;
  body ~ "OK";
}
```

+ 可检测 HTTP 状态码、响应体、响应时间。
+ 自动剔除异常节点，无需人工干预。

