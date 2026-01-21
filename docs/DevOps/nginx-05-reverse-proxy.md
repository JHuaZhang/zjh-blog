---
group:
  title: Nginx
order: 4
title: nginx反向代理

nav:
  title: DevOps
  order: 2
---


## 1、nginx反向代理介绍
nginx 的反向代理（Reverse Proxy）是其最核心和常用的功能之一。它允许 nginx 接收来自客户端的请求，并将这些请求转发给后端的一个或多个服务器（如应用服务器、API 服务等），然后将后端服务器的响应返回给客户端。在整个过程中，客户端并不知道实际处理请求的是哪个后端服务器。

**什么是反向代理？**

+ 正向代理：客户端通过代理访问外部资源（如翻墙），代理代表客户端。
+ 反向代理：客户端访问的是代理服务器，但实际由后端服务器处理请求，代理代表服务器。

在反向代理中，nginx 对外表现为一个 Web 服务器，对内则作为客户端去请求后端服务。

nginx 反向代理的核心作用：

**负载均衡：将请求分发到多个后端服务器，提高系统可用性和性能。**

+ 隐藏后端架构：客户端只与 nginx 通信，不知道后端服务器的存在，增强安全性。
+ SSL/TLS 终止：nginx 可以处理 HTTPS 请求，解密后以 HTTP 转发给后端，减轻后端压力。
+ 缓存静态资源：nginx 可缓存后端返回的内容，减少后端负载。
+ 统一入口：多个服务可通过不同路径或域名由同一个 nginx 实例代理，便于管理。

**基本配置示例：**

```nginx
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://backend_server;  # 转发到后端
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# 定义后端服务器（可选，用于负载均衡）
upstream backend_server {
  server 192.168.1.10:8080;
  server 192.168.1.11:8080;
}
```

**关键指令说明：**

+ proxy_pass：指定后端服务器地址。可以是 IP+端口、域名，或 upstream 名称。
+ proxy_set_header：设置转发给后端的请求头，确保后端能获取真实客户端信息。
    - Host：保留原始 Host 头。
    - X-Real-IP：传递客户端真实 IP。
    - X-Forwarded-For：记录请求经过的代理链。
    - X-Forwarded-Proto：告知后端原始协议是 HTTP 还是 HTTPS。

**常见应用场景：**

①、前后端分离部署

前端静态资源由 nginx 直接提供，API 请求代理到后端 Node.js/Java/Python 服务。

②、微服务网关

不同路径路由到不同微服务：

```nginx
location /api/users/ {
  proxy_pass http://user-service;
}
location /api/orders/ {
  proxy_pass http://order-service;
}
```

**③、HTTPS卸载**

nginx 处理 SSL，后端使用 HTTP 通信，提升性能。

**④、高可用架构**

配合 upstream 实现多实例负载均衡 + 健康检查（需配合 nginx-plus 或第三方模块）。

**注意事项：**

+ 后端服务应信任来自 nginx 的请求（如通过内网通信）。
+ 正确设置请求头，避免后端无法获取真实 IP 或协议。
+ 超时设置（如 proxy_connect_timeout, proxy_read_timeout）需根据业务调整。
+ 日志记录建议包含 $upstream_addr 以便追踪请求转发情况。

## 2、举例使用
现在我们有两个服务器，就可以使用前端react + 服务器egg，分别将前后端部署在不同的服务器上，配合nginx的反向代理，让客户端只用访问一个域名，nginx自动将/api请求转发给后端服务器，其他请求返回前端页面。

**架构图：**

```plain
客户端
   │
   ▼
[ nginx (Server A) ]
   ├── /          → 返回 React 静态文件（Server A 本地）
   └── /api/...   → 代理到 Egg.js (Server B:7001)
```

### 2.1、准备Egg.js后端
**①、创建Egg项目**

```bash
npm init egg --type=simple
cd your-egg-app
npm install
```

**②、简单写一个API（示例）**

app/controller/home.js:

```javascript
'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async sayHello() {
    this.ctx.body = { message: 'Hello from Egg.js!', timestamp: Date.now() };
  }
}

module.exports = HomeController;
```

app/router.js:

```javascript
module.exports = app => {
  const { router, controller } = app;
  router.get('/api/hello', controller.home.sayHello);
};
```

**③、启动Egg服务（默认端口7001）**

```bash
npm run dev
# 或生产环境
npm start
```

确保 Server B 的 7001 端口对外可访问（或至少对 Server A 可访问）。建议通过内网通信更安全。

### 2.2、构建React前端
**①、创建React项目**

```bash
npx create-react-app my-frontend
cd my-frontend
```

**②、在组件中调用 API**

src/App.js:

```javascript
import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 注意：这里直接请求 /api/hello，不带域名！
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <div className="App">
      <h1>React + Egg.js Demo</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default App;
```

**③、构建静态文件**

```bash
npm run build
```

生成的文件在 build/ 目录下。

### 2.3、配置nginx
①、将 React 的 build/ 文件复制到 Server A 的某个目录，例如：

```plain
/var/www/myapp/
```

②、编写 nginx 配置文件（如 /etc/nginx/sites-available/myapp）

```nginx
server {
  listen 80;
  server_name myapp.com;  # 替换为你的域名或 IP

  # 前端静态资源
  root /var/www/myapp;
  index index.html;

  # 处理前端路由（React Router 支持）
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 反向代理 API 请求到 Server B
  location /api/ {
    proxy_pass http://<SERVER_B_IP>:7001/;  # 注意结尾的斜杠！
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

+ <SERVER_B_IP> 替换为 Server B 的内网或公网 IP（如 192.168.1.100 或 203.0.113.10）。
+ proxy_pass 末尾的 / 很关键：http://ip:port/ 会把 /api/hello 转为 /hello 发给后端。




