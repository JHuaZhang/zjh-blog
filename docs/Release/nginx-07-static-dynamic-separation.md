---
group:
  title: Nginx
order: 7
title: nginx动静分离

nav:
  title: 发布部署
  order: 6
---


## 1、介绍
动静分离是指将网站中的静态资源（如 HTML、CSS、JavaScript、图片、视频等）和动态资源（需要服务器端处理生成的内容，如 PHP、Java、Python 等生成的页面）分别部署在不同的服务器或目录中，通过 Web 服务器进行智能路由分发。

静**态资源 vs 动态资源：**

| 类型 | 特点 | 示例 |
| --- | --- | --- |
| 静态资源 | 内容固定不变，直接返回文件内容 | .html, .css, .js, .jpg, .png, .gif, .pdf |
| 动态资源 | 需要服务器端程序处理，每次请求可能返回不同内容 | .php, .jsp, .asp, API 接口 |


**为什么要做动静分离？**

**①、性能优势**

+ 减少后端压力：静态资源直接由 Nginx 返回，不经过应用服务器。
+ 提高响应速度：Nginx 处理静态文件效率极高。
+ 节省带宽：可以针对静态资源做专门的优化。

**②、架构优势**

+ 便于扩展：静态资源可以独立部署到 CDN。
+ 简化维护：静态和动态资源管理分离。
+ 提高安全性：减少应用服务器暴露面。

**③、成本优势**

+ 降低服务器成本：减少应用服务器负载。
+ CDN 友好：静态资源天然适合 CDN 加速。

## 2、 Nginx实现动静分离的配置方式
### 2.1、基于文件扩展名的分离
这种配置方式通过 正则表达式 匹配请求 URL 的文件扩展名，将不同类型的文件分别处理。

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt|svg|woff|woff2|ttf|eot)$ {
  # 静态资源处理
}
```

+ ~*：表示不区分大小写的正则匹配。
+ \.：转义点号，匹配字面量的点。
+ (jpg|jpeg|...)：匹配括号内的任意一种扩展名。
+ $：表示字符串结尾。

**工作流程：**

1. 客户端请求 /static/style.css。
2. Nginx 检查所有 location 块。
3. 发现扩展名 .css 匹配正则表达式。
4. 执行该 location 块中的指令。
5. 直接从磁盘读取文件并返回给客户端。

**适用场景：**

+ 传统多页面网站：HTML、CSS、JS、图片等静态资源混合存放。
+ 简单应用：不需要复杂的路径结构。
+ 快速实施：配置简单，容易理解和维护。

**详细配置说明：**

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt|svg|woff|woff2|ttf|eot)$ {
  # root 指令指定文件根目录
  # 如果 server 块中已经定义了 root，则这里可以省略

  # 缓存控制 - 浏览器缓存30天
  expires 30d;

  # 添加 HTTP 响应头
  add_header Cache-Control "public, immutable";

  # 关闭访问日志（减少IO，提高性能）
  access_log off;

  # 启用 gzip 静态压缩（如果存在 .gz 文件）
  gzip_static on;

  # 启用 etag
  etag on;
}
```

**注意事项：**

+ 匹配优先级：正则 location 的优先级高于前缀 location。
+ 性能考虑：正则匹配比普通前缀匹配消耗更多 CPU。
+ 扩展名管理：需要维护完整的静态文件扩展名列表。

**举例：**

```nginx
server {
  listen 80;
  server_name example.com;

  # 静态资源根目录
  root /var/www/html;
  index index.html index.htm;

  # 静态资源处理规则
  location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt|svg|woff|woff2|ttf|eot)$ {
    # 设置缓存时间
    expires 30d;
    # 添加安全头
    add_header Cache-Control "public, immutable";
    # 关闭访问日志（可选）
    access_log off;
  }

  # 动态资源处理 - 转发到后端应用服务器
  location ~* \.(php|jsp|asp|aspx)$ {
    proxy_pass http://backend_server;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # API 接口转发
  location /api/ {
    proxy_pass http://api_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

### 2.2、基于路径的分离
通过 URL 路径前缀来区分静态和动态资源，通常约定：

+ /static/、/assets/、/images/ 等路径存放静态资源。
+ 其他路径处理动态请求。

```nginx
location /static/ {
  alias /var/www/static/;
}
```

**工作流程：**

+ 客户端请求 /static/images/logo.png。
+ Nginx 匹配到 /static/ 前缀。
+ 使用 alias 指令将 /static/ 映射到实际文件系统路径。
+ 读取 /var/www/static/images/logo.png 文件并返回。

**适用场景：**

+ 现代前端框架：Vue、React 等 SPA 应用。
+ CDN 友好：便于将特定路径配置到 CDN。
+ 团队协作：前后端开发约定清晰的资源路径。
+ 微服务架构：不同服务负责不同路径。

**root vs alias 的区别：**

**①、root**

```nginx
location /static/ {
  root /var/www;
}
```

请求 /static/logo.png。

实际文件路径：/var/www/static/logo.png。

**②、alias**

```nginx
location /static/ {
  alias /var/www/static/;
}
```

请求 /static/logo.png。

实际文件路径：/var/www/static/logo.png。

**关键区别：**

+ root：会将 location 路径拼接到 root 路径后面。
+ alias：会用 alias 路径替换 location 路径。

**举例：**

```nginx
# 静态资源路径配置
location /static/ {
  # 使用 alias 指定实际文件路径
  alias /var/www/static/;

  # 长期缓存
  expires 1y;
  add_header Cache-Control "public, immutable";

  # 安全设置
  # 防止执行脚本文件
  location ~* \.(php|pl|py|jsp|asp|sh|cgi)$ {
    deny all;
    return 403;
  }
}

# 图片专用路径
location /images/ {
  alias /var/www/images/;
  expires 30d;
  # 图片压缩
  image_filter_jpeg_quality 90;
  image_filter_webp_quality 85;
}

# 动态内容处理
location / {
  # 所有其他请求转发到后端
  proxy_pass http://backend_app;
}
```

### 2.3、混合模式（try_files方式）
try_files 指令按顺序尝试不同的文件或位置，直到找到存在的文件或最终回退到指定位置。

```nginx
location / {
  try_files $uri $uri/ @backend;
}
```

+ $uri：当前请求的 URI（不包含查询参数）。
+ $uri/：尝试作为目录访问（会寻找 index 文件）。
+ @backend：命名 location，作为最后的回退选项。

**工作流程：**

假设请求 /user/profile：

+ 首先检查是否存在文件 /var/www/html/user/profile。
+ 如果不存在，检查是否存在目录 /var/www/html/user/profile/。
+ 如果目录也不存在，执行 @backend location。
+ @backend 将请求代理到后端应用服务器。

**适用场景：**

+ 单页应用（SPA）：前端路由需要后端处理。
+ 混合内容网站：既有静态页面又有动态内容。
+ 渐进式迁移：逐步将动态内容转为静态。
+ 灵活的路由需求：需要智能判断文件是否存在。

**举例：**

```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/html;

  # 主要的动静分离逻辑
  location / {
    # 尝试顺序：
    # 1. 直接匹配文件
    # 2. 匹配目录（会自动找 index.html 等）
    # 3. 转发到后端应用
    try_files $uri $uri/ @backend;
  }

  # 静态资源优化
  location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
    # 这个 location 会在 try_files 之前匹配
    # 因为正则 location 优先级更高
    expires 1y;
    add_header Cache-Control "public, immutable";
    gzip_static on;
  }

  # 后端应用处理
  location @backend {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # 超时设置
    proxy_connect_timeout 30s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
  }
}
```

try_files的高级用法：

```nginx
# SPA 应用的典型配置
location / {
  try_files $uri $uri/ /index.html;
}

# API 和静态资源混合
location / {
  try_files $uri $uri/ @api;
}

location @api {
  proxy_pass http://api_backend;
}

# 多级回退
location / {
  try_files $uri $uri/ /cache/$uri /index.php?$query_string;
}
```

## 3、动静分离高级配置技巧
### 3.1、缓存策略优化
#### 3.1.1、缓存控制原理
Nginx 的缓存控制主要通过两个机制实现：

+ 浏览器缓存：通过 expires 和 Cache-Control 头部控制。
+ 代理缓存：Nginx 自身作为缓存服务器（本文重点讲浏览器缓存）。

#### 3.1.2、expires指令详解
```nginx
# 基本语法
expires [time|epoch|max|off];

# 具体示例
expires 30d;        # 30天后过期
expires 2h;         # 2小时后过期  
expires -1;         # 立即过期（no-cache）
expires epoch;      # 设置为 Unix 时间戳 0（1970年1月1日）
expires max;        # 设置为 2038年1月1日（最大值）
expires off;        # 关闭 expires 头部
```

#### 3.1.3、Cache-Control头部详解
```nginx
# 静态资源长期缓存（推荐）
add_header Cache-Control "public, immutable";

# 私有缓存（用户专属）
add_header Cache-Control "private, max-age=3600";

# 强制重新验证
add_header Cache-Control "no-cache";

# 完全禁止缓存
add_header Cache-Control "no-store, no-cache, must-revalidate";

# 条件缓存
add_header Cache-Control "public, max-age=3600, stale-while-revalidate=86400";
```

**各指令含义：**

+ public：可被任何缓存存储。
+ private：仅用户浏览器可缓存。
+ immutable：内容永远不会改变，避免条件请求。
+ max-age：缓存有效期（秒）。
+ stale-while-revalidate：过期后仍可使用，同时后台更新。
+ stale-if-error：过期且更新失败时仍可使用。

#### 3.1.4、智能缓存策略配置
```nginx
# 根据文件类型设置不同缓存策略
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|webp|woff2)$ {
  # 版本化文件：长期缓存
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location ~* \.(html|htm)$ {
  # HTML 文件：不缓存或短缓存
  expires 5m;
  add_header Cache-Control "public, must-revalidate";
}

location ~* \.(json|xml)$ {
  # API 响应：短缓存
  expires 1m;
  add_header Cache-Control "public, must-revalidate";
}

# 特殊路径的缓存策略
location /static/versioned/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location /static/unversioned/ {
  expires 1h;
  add_header Cache-Control "public, must-revalidate";
}
```

#### 3.1.5、ETag和Last-Modified
```nginx
# 启用 ETag（默认开启）
etag on;

# 如果需要关闭 ETag（某些 CDN 要求）
etag off;

# Last-Modified 默认基于文件修改时间自动设置
# 可以通过 if_modified_since 指令控制行为
if_modified_since exact;    # 精确匹配（默认）
if_modified_since before;   # 允许时间在 Last-Modified 之前
```

### 3.2、Gzip压缩配置
**什么是静态 Gzip？**

+ 概念：预先压缩好 .gz 文件，Nginx 直接返回预压缩文件。
+ 优势：避免实时压缩的 CPU 开销。
+ 适用场景：静态资源（CSS、JS、HTML 等不经常变化的文件）。

**配置方法：**

```nginx
# 启用静态 gzip
gzip_static on;

# 完整配置示例
location ~* \.(css|js|html|xml|json)$ {
  gzip_static on;
  gzip_vary on;
  expires 1y;
}
```

```nginx
# 启用 gzip
gzip on;

# 决定是否在响应头中添加 Vary: Accept-Encoding
gzip_vary on;

# 最小压缩文件大小（字节）
gzip_min_length 1024;

# 压缩级别（1-9，1最快，9最压缩）
gzip_comp_level 6;

# 压缩缓冲区设置
gzip_buffers 16 8k;

# HTTP 版本要求
gzip_http_version 1.1;

# 针对特定 User-Agent 禁用压缩
gzip_disable "MSIE [1-6]\.";

# 压缩的 MIME 类型
gzip_types 
text/plain
text/css
text/xml
text/javascript
application/javascript
application/json
application/xml
application/rss+xml
application/atom+xml
image/svg+xml
font/ttf
font/otf
font/eot;
```

**静态Gzip（gzip_static）：**

```nginx
# 启用静态 gzip
gzip_static on;

# 工作原理：
# 当请求 style.css 时，Nginx 会先检查是否存在 style.css.gz
# 如果存在且客户端支持 gzip，则直接返回 .gz 文件
# 这样避免了实时压缩的 CPU 开销
```

**静态Gzip和动态Gzip的区别：**

+ 静态Gzip (gzip_static on)：Nginx 直接返回预先压缩好的 .gz 文件。
+ 动态Gzip (gzip on)：Nginx 实时压缩原始文件再返回。

静态Gzip文件结构要求：

```nginx
/var/www/html/
├── app.js          # 原始文件
└── app.js.gz       # 预先压缩好的文件（必须存在）
```

当用户请求 app.js 时：

1. Nginx 检查客户端是否支持 gzip (Accept-Encoding: gzip)。
2. 如果支持，检查是否存在 app.js.gz 文件。
3. 如果存在，直接返回 app.js.gz 文件。
4. 如果不存在，返回原始 app.js 文件。

而动态则是当用户请求 app.js 时：

1. Nginx 检查客户端是否支持 gzip。
2. 如果支持，读取 app.js 文件到内存。
3. 调用 gzip 算法实时压缩内容。
4. 将压缩后的内容返回给客户端。

 关键点：每次请求都要进行 CPU 密集型的压缩计算！

这个时候还容易提出一个问题，为什么前端也可以通过框架实现gzip压缩了，还需要在nginx上也配置这个呢？

这是因为有的时候一些框架，如react框架，页面中的数据需要通过接口返回的，因此返回给用户的时候就需要通过nginx进行压缩，因此工作流程大致为：

```plain
客户端请求 app.js
        ↓
Nginx 检查 Accept-Encoding: gzip
        ↓
检查是否存在 app.js.gz
        ↓
存在 → 直接返回 app.js.gz (零 CPU 开销)
不存在 → 实时压缩 app.js 并返回 (有 CPU 开销)
```

### 3.3、安全配置
#### 3.3.1、敏感文件保护
```nginx
# 方法1：正则匹配禁止访问
location ~* \.(env|log|sql|bak|swp|git|svn|htaccess|htpasswd|ini|conf|cfg|config)$ {
  deny all;
  return 404;  # 返回404而不是403，避免暴露文件存在
}

# 方法2：特定目录保护
location ~ ^/(config|backup|logs|temp)/ {
  deny all;
  return 404;
}

# 方法3：隐藏特定文件
location = /.gitignore {
  deny all;
  return 404;
}

location = /composer.json {
  deny all;
  return 404;
}

```

#### 3.3.2、目录遍历防护
```nginx
# 禁止访问隐藏文件和目录
location ~ /\. {
  deny all;
  return 404;
}

# 禁止目录列表
location / {
  # 确保没有 autoindex on
  # 默认情况下目录访问会返回403
}

# 显式关闭目录列表
location /downloads/ {
  autoindex off;
}
```

#### 3.3.3、其他安全头部
```nginx
# X-Frame-Options：防止点击劫持
add_header X-Frame-Options "DENY" always;

# X-Content-Type-Options：防止 MIME 类型嗅探
add_header X-Content-Type-Options "nosniff" always;

# Referrer-Policy：控制 Referer 头部
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions-Policy：控制浏览器功能
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# HSTS（仅 HTTPS）
# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

#### 3.3.4、文件上传安全
```nginx
# 限制上传文件大小
client_max_body_size 10M;

# 防止上传可执行文件到静态目录
location /uploads/ {
  # 禁止执行脚本
  location ~* \.(php|pl|py|jsp|asp|sh|cgi|exe|bat|dll)$ {
    deny all;
    return 403;
  }

  # 限制文件类型
  location ~* \.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx)$ {
    # 允许的文件类型
    expires 30d;
  }

  # 其他文件类型拒绝
  location / {
    deny all;
    return 403;
  }
}
```

