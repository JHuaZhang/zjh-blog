---
group:
  title: Nginx
order: 8
title: nginx与网关

nav:
  title: 发布部署
  order: 6
---

## 1、网关概念

网关（Gateway） 是网络通信中的一个关键组件，用于连接两个或多个使用不同协议、数据格式或网络架构的系统，并在它们之间进行协议转换、请求转发、安全控制和流量管理。

简单来说，网关就像一个“翻译官”或“守门人”：

- 对外：统一入口，隐藏内部复杂结构；
- 对内：将外部请求正确分发到对应的后端服务；
- 同时提供安全、限流、监控等能力。

注意：网关 ≠ 路由器（Router）：路由器工作在网络层（OSI 第3层），主要负责 IP 包的转发。网关通常工作在应用层（OSI 第7层），处理的是 HTTP、gRPC 等应用协议。

**为什么需要网关？**

在单体应用时代，客户端直接调用后端服务即可。但进入微服务架构后：

- 服务数量激增（几十甚至上百个）。
- 服务动态扩缩容，IP地址频繁变化。
- 每个服务都实现鉴权、限流、日志等逻辑 → 重复开发、难以维护。

**引入网关后：**

- 客户端只需对接一个地址（如 api.example.com）。
- 共性功能（安全、限流等）集中在网关统一处理。
- 后端服务专注业务逻辑，解耦。

### 1.1、网关的核心作用

1. **统一入口：**  
   所有客户端（Web、App、第三方）都通过网关访问后端服务，无需知道具体服务地址。
2. **协议转换**  
   例如：将 HTTP 请求转换为 gRPC，或将 WebSocket 转换为内部消息队列协议。
3. **路由与负载均衡**  
   根据 URL、Header、Host 等规则将请求路由到对应的服务实例，并支持负载均衡。
4. **安全控制**
   - 身份认证（如 JWT、OAuth2）。
   - 权限校验。
   - 防止 DDoS、SQL 注入等攻击。
   - SSL/TLS 终止（HTTPS 解密）。
5. 流**量治理**
   - 限流。
   - 熔断。
   - 重试、超时控制。
6. **日志与监控**  
   记录请求日志、性能指标，便于审计、排错和可观测性建设。
7. **缓存与压缩**  
   对静态资源或高频响应进行缓存，提升性能。

### 1.2、常见的网关类型

| 类型                    | 说明                                                             | 典型场景               |
| ----------------------- | ---------------------------------------------------------------- | ---------------------- |
| API 网关（API Gateway） | 专为微服务/API 设计，提供鉴权、限流、路由等能力                  | 微服务架构、开放平台   |
| 云原生网关              | 与 Kubernetes、Service Mesh 深度集成（如 Istio Ingress Gateway） | 云原生、容器化环境     |
| 反向代理网关            | 如 nginx、Apache，侧重请求转发和负载均衡                         | Web 应用前置代理       |
| IoT 网关                | 连接物联网设备与云平台，处理协议转换（如 MQTT ↔ HTTP）           | 智能家居、工业物联网   |
| 企业服务总线（ESB）     | 传统 SOA 架构中的集成网关，功能更重                              | 银行、大型企业遗留系统 |

在现代互联网架构中，API 网关是最常被提及的“网关”。

## 2、nginx与网关

nginx不仅仅是一个Web服务器，它本质上是一个高性能的HTTP和反向代理服务器，这恰好赋予了它成为现代应用架构中核心软件网关的资格。

**从网关的三大核心功能来看nginx：**

1. **协议转换与适配：**
   - HTTP版本转换：nginx可以接收客户端的HTTP/1.1请求，向后端服务器转发为HTTP/1.0或更高效的fastcgi协议（用于PHP应用）。
   - WebSocket代理：虽然WebSocket是不同于HTTP的协议，但nginx可以作为网关，处理初始的HTTP握手，然后“升级”连接为WebSocket，在客户端和后端服务之间进行透明代理。
   - gRPC代理：现代微服务中，nginx也能作为gRPC协议的代理网关，处理服务间的RPC调用。
2. **路由选择：这是nginx作为网关的核心日常。**
   - 反向代理：根据请求的URL路径、域名或请求头，将流量路由到不同的后端服务器集群。
     - 示例：/api/的请求路由到Java应用服务器，/blog/的请求路由到WordPress服务器，图片请求路由到静态文件服务器。
   - 负载均衡：作为流量的总入口，nginx可以将请求分发给多个后端服务器（负载均衡器是网关的典型角色），支持轮询、权重、最少连接、IP哈希等多种算法。
3. **安全与过滤：nginx是实施安全策略的第一道防线。**
   - 访问控制：基于IP地址、用户名密码进行认证和限制。
   - 速率限制：防止DDoS攻击或API滥用，限制单个IP的请求频率。
   - 请求过滤：拦截特定User-Agent、异常请求方法（如PUT/DELETE）的请求。
   - SSL/TLS终端：作为SSL网关，处理耗能的HTTPS加解密工作，将明文的HTTP请求转发给后端，解放后端服务器的性能。
   - WAF功能：通过搭配如ModSecurity等模块，实现Web应用防火墙的功能。

**如下将nginx配置为以下几种典型的网关模式：**

### 2.1、作为反向代理和负载均衡网关（最常见）

这是nginx的“本命”角色。假如有一个应用（比如运行在3000端口的Node.js服务），但不想直接暴露给外网。就可以使用：

配置示例 (nginx.conf 或 sites-available/your_site)：

```nginx
http {
  upstream my_app_backend {
    # 定义后端服务器集群
    server 127.0.0.1:3000 weight=3; # 本地应用，权重3
    server 192.168.1.100:3000;      # 另一台应用服务器
    # 使用 least_conn; 指令可以启用最少连接算法
  }

  server {
    listen 80;
    server_name yourdomain.com; # 网关对外的域名

    location / {
      # 核心代理指令：将所有请求转发到 upstream 定义的集群
      proxy_pass http://my_app_backend;

      # 以下是一些重要的“网关”头信息传递设置
      proxy_set_header Host $host; # 传递原始域名
      proxy_set_header X-Real-IP $remote_addr; # 传递用户真实IP
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; # 追加代理链IP
      proxy_set_header X-Forwarded-Proto $scheme; # 传递协议（http/https）
    }
  }
}
```

upstream 定义后端集群，proxy_pass 是路由指令，proxy_set_header 是确保后端能获取正确客户端信息的关键。

### 2.2、作为API网关（微服务入口）

当有多个微服务（用户服务、订单服务、商品服务），需要一个统一的入口。

```nginx
server {
  listen 80;
  server_name api.yourdomain.com;

  # 路由到用户服务
  location /api/users/ {
    proxy_pass http://user_service_backend;
    # 可以在此添加速率限制 limit_req zone=user_limit;
  }

  # 路由到订单服务
  location /api/orders/ {
    proxy_pass http://order_service_backend;
    # 可以在此添加身份验证验证逻辑（如先验证JWT）
    # auth_request /_validate_token;
  }

  # 路由到商品服务
  location /api/products/ {
    proxy_pass http://product_service_backend;
  }

  # 一个内部用于鉴权的路径
  location = /_validate_token {
    internal; # 只允许内部请求
    proxy_pass http://auth_service:5000/validate;
  }
}
```

使用 location 指令根据路径前缀进行精细化路由。这是API网关的核心模式。

### 2.3、作为SSL/TLS终端网关

- SSL：安全套接字层，由网景公司在1990年代中期创建。这是最初的协议。
- TLS：传输层安全，是SSL的标准化和升级版。SSL 3.0之后的版本都称为TLS（如 TLS 1.2， TLS 1.3）。

关系：可以把SSL看作TLS的曾用名。现在所有情况下，我们说的“SSL”其实指的都是更现代的TLS协议。但由于历史习惯，大家仍普遍称之为“SSL证书”或“SSL加密”。

HTTPS = HTTP + SSL/TLS：HTTPS就是在HTTP协议外面，套上了一层SSL/TLS的安全外壳。

让nginx处理所有HTTPS，后端跑HTTP，简化后端配置。

```nginx
server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  # SSL证书配置
  ssl_certificate /path/to/your/fullchain.pem;
  ssl_certificate_key /path/to/your/private.key;

  # 安全强化配置（略）

  location / {
    proxy_pass http://my_app_backend; # 注意这里是 http:// 不是 https://
    # ... 其他代理头设置
  }
}

# 强制将所有HTTP重定向到HTTPS（安全最佳实践）
server {
  listen 80;
  server_name yourdomain.com;
  return 301 https://$server_name$request_uri;
}
```

listen 443 ssl 指令开启HTTPS终端。这是性能和安全的双重最佳实践。

**这样做的好处：**

- 性能： 加解密是CPU密集型操作。由nginx统一处理，解放了后端应用服务器，让其专注业务逻辑。
- 简化后端： 后端应用无需处理复杂的SSL配置，只需处理简单的HTTP请求。
- 集中管理： 证书的更新、续期、安全策略（如禁用老旧协议）只需要在nginx网关层面操作一次。
