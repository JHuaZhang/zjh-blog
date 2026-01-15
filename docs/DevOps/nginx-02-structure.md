---
group:
  title: Nginx
order: 2
title: nginx目录结构与基本运行原理

nav:
  title: DevOps
  order: 2
---

## 1、nginx目录结构
### 1.1、nginx目录结构介绍
nginx 的目录结构在不同操作系统和安装方式（如源码编译、包管理器安装）下可能略有差异，但总体上遵循类似的组织逻辑。以下是一个典型的 nginx 安装后的目录结构（以 Linux 系统中通过包管理器如 apt 或 yum 安装为例）：

```bash
/etc/nginx/                # 主配置目录
├── nginx.conf             # 主配置文件
├── conf.d/                # 存放额外的 server 配置文件（通常用于虚拟主机）
│   └── default.conf       # 默认站点配置
├── sites-available/       # （Debian/Ubuntu 特有）可用站点配置文件
├── sites-enabled/         # （Debian/Ubuntu 特有）启用的站点配置（通常是软链接）
├── modules-available/     # （部分系统）可用模块配置
├── modules-enabled/       # （部分系统）启用的模块配置
├── snippets/              # 可复用的配置片段（如 fastcgi_params、ssl-params 等）
└── mime.types             # MIME 类型定义文件

/usr/sbin/nginx            # nginx 可执行文件（二进制程序）

/var/log/nginx/            # 日志目录
├── access.log             # 访问日志
└── error.log              # 错误日志

/usr/share/nginx/html/     # 默认网站根目录（存放静态文件）
├── index.html             # 默认首页
└── 50x.html               # 错误页面（如 502、503 等）

/run/nginx.pid             # nginx 主进程 PID 文件（部分系统位于 /var/run/）

/usr/lib/nginx/modules/    # 动态模块目录（如果启用了动态模块加载）
```

**各目录/文件说明：**

+ /etc/nginx/：
    - 这是 nginx 的主配置目录。
    - nginx.conf 是核心配置文件，包含全局设置、事件模型、HTTP 设置等。
    - conf.d/ 目录中的 .conf 文件会被自动 include（通常在 nginx.conf 中通过 include /etc/nginx/conf.d/*.conf; 引入），适合放置多个站点配置。
    - 在 Debian/Ubuntu 系统中，常用 sites-available/ 和 sites-enabled/ 模式管理虚拟主机：将配置放在 sites-available/，然后在 sites-enabled/ 中创建软链接来启用。
+ /usr/sbin/nginx：
    - nginx 的可执行程序，用于启动、重载、停止服务等。
+ /var/log/nginx/：
    - 默认的日志存储位置。可通过配置修改日志路径和格式。
+ /usr/share/nginx/html/：
    - 默认的 Web 根目录。当没有特别指定 root 或 alias 时，nginx 会从此目录提供静态文件。
+ /run/nginx.pid 或 /var/run/nginx.pid：
    - 存储主进程的 PID，用于 nginx -s reload、stop 等信号操作。
+ /usr/lib/nginx/modules/：
    - 如果 nginx 编译时启用了动态模块支持（如 --with-compat），模块会放在此处，并可在配置中通过 load_module 加载。

### 1.2、Docker中查看nginx相关配置
```bash
# 创建本地目录
mkdir -p ~/nginx/{conf.d,html}

# 示例：创建一个默认 index.html
echo "<h1>Hello from nginx on Docker!</h1>" > ~/nginx/html/index.html

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

如上通过 Docker 运行了 nginx，并将本地的 ~/nginx/html 和 ~/nginx/conf.d 挂载到了容器中。要查看当前生效的 nginx 配置，有几种方法：

**①、直接查看你挂载的本地配置文件**

因为已经把配置挂载到容器里，实际生效的配置就是本地的文件：

```bash
# 查看主配置（虽然你没挂载 nginx.conf，但默认会加载 conf.d 下的 .conf 文件）
cat ~/nginx/conf.d/default.conf
```

注意：上面只挂载了 /etc/nginx/conf.d，而 没有覆盖主配置文件 /etc/nginx/nginx.conf。容器内的 nginx.conf 仍然是官方镜像自带的，它通常包含这样一行：

```bash
include /etc/nginx/conf.d/*.conf;
```

	所以上面的default.conf 会被自动加载。如下我们详细查看对应的nginx配置：

```bash
[root@iZ2zeb9fdjcne1mfh06bmoZ ~]# cd /etc/nginx
[root@iZ2zeb9fdjcne1mfh06bmoZ nginx]# ls
conf.d     fastcgi.conf          fastcgi_params          koi-utf  mime.types          nginx.conf          scgi_params          uwsgi_params          win-utf
default.d  fastcgi.conf.default  fastcgi_params.default  koi-win  mime.types.default  nginx.conf.default  scgi_params.default  uwsgi_params.default
```

对应的配置文件的目录结构如下：

```bash
/etc/nginx/
├── nginx.conf                 ← ★ 主配置文件（核心）
├── nginx.conf.default         ← 原始备份（安装时自动生成）
│
├── conf.d/                    ← ★ 存放自定义站点配置（.conf 文件）
│   └── （可在此放 default.conf、api.conf 等）
│
├── default.d/                 ← 为默认 server 块提供额外配置片段
│   └── （通常为空，高级用法）
│
├── mime.types                 ← 定义文件扩展名与 MIME 类型的映射（如 .html → text/html）
├── mime.types.default         ← 备份
│
├── fastcgi_params             ← FastCGI 参数（用于 PHP-FPM 等）
├── fastcgi.conf               ← 更完整的 FastCGI 配置（含 SCRIPT_FILENAME）
├── scgi_params                ← SCGI 协议参数
├── uwsgi_params               ← uWSGI 协议参数
│
├── koi-utf, koi-win, win-utf  ← 字符编码转换表（历史遗留，一般不用）
│
└── *.default                  ← 所有配置文件的原始备份（升级或重装时保留）

```

如下为nginx.conf，这是 nginx 启动时读取的入口配置文件。

```nginx
[root@iZ2zeb9fdjcne1mfh06bmoZ nginx]# cat nginx.conf
# For more information on configuration, see:
#   * Official English Documentation: http://nginx.org/en/docs/
#   * Official Russian Documentation: http://nginx.org/ru/docs/

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

# Load dynamic modules. See /usr/share/doc/nginx/README.dynamic.
include /usr/share/nginx/modules/*.conf;

events {
worker_connections 1024;
}

http {
log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
'$status $body_bytes_sent "$http_referer" '
'"$http_user_agent" "$http_x_forwarded_for"';

access_log  /var/log/nginx/access.log  main;

sendfile            on;
tcp_nopush          on;
tcp_nodelay         on;
keepalive_timeout   65;
types_hash_max_size 4096;

include             /etc/nginx/mime.types;
default_type        application/octet-stream;

# Load modular configuration files from the /etc/nginx/conf.d directory.
# See http://nginx.org/en/docs/ngx_core_module.html#include
# for more information.
include /etc/nginx/conf.d/*.conf;

server {
listen       80;
listen       [::]:80;
server_name  _;
root         /usr/share/nginx/html;

# Load configuration files for the default server block.
include /etc/nginx/default.d/*.conf;

error_page 404 /404.html;
location = /40x.html {
}

error_page 500 502 503 504 /50x.html;
location = /50x.html {
}
}

# Settings for a TLS enabled server.
#
#    server {
#        listen       443 ssl http2;
#        listen       [::]:443 ssl http2;
#        server_name  _;
#        root         /usr/share/nginx/html;
#
#        ssl_certificate "/etc/pki/nginx/server.crt";
#        ssl_certificate_key "/etc/pki/nginx/private/server.key";
#        ssl_session_cache shared:SSL:1m;
#        ssl_session_timeout  10m;
#        ssl_ciphers PROFILE=SYSTEM;
#        ssl_prefer_server_ciphers on;
#
#        # Load configuration files for the default server block.
#        include /etc/nginx/default.d/*.conf;
#
#        error_page 404 /404.html;
#            location = /40x.html {
#        }
#
#        error_page 500 502 503 504 /50x.html;
#            location = /50x.html {
#        }
#    }

}
```

	可以看到这里并没有直接指向我们的~/nginx/conf.d，而是导入的include /etc/nginx/conf.d/*.conf;而我们使用docker启动nginx的时候，就是使用了绑定挂载的方式将~/nginx/conf.d和/etc/nginx/conf.d进行绑定。

**②、查看容器内完整的生效配置**

```nginx
# 打印容器内 nginx 加载的所有配置（包括主配置 + include 的）
docker exec my-nginx nginx -T
```

如下：

```nginx
[root@iZ2zeb9fdjcne1mfh06bmoZ ~]# docker exec my-nginx nginx -T
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
# configuration file /etc/nginx/nginx.conf:

user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;
}

# configuration file /etc/nginx/mime.types:

types {
    text/html                                        html htm shtml;
    text/css                                         css;
    text/xml                                         xml;
    image/gif                                        gif;
    image/jpeg                                       jpeg jpg;
    application/javascript                           js;
    application/atom+xml                             atom;
    application/rss+xml                              rss;

    text/mathml                                      mml;
    text/plain                                       txt;
    text/vnd.sun.j2me.app-descriptor                 jad;
    text/vnd.wap.wml                                 wml;
    text/x-component                                 htc;

    image/avif                                       avif;
    image/png                                        png;
    image/svg+xml                                    svg svgz;
    image/tiff                                       tif tiff;
    image/vnd.wap.wbmp                               wbmp;
    image/webp                                       webp;
    image/x-icon                                     ico;
    image/x-jng                                      jng;
    image/x-ms-bmp                                   bmp;

    font/woff                                        woff;
    font/woff2                                       woff2;

    application/java-archive                         jar war ear;
    application/json                                 json;
    application/mac-binhex40                         hqx;
    application/msword                               doc;
    application/pdf                                  pdf;
    application/postscript                           ps eps ai;
    application/rtf                                  rtf;
    application/vnd.apple.mpegurl                    m3u8;
    application/vnd.google-earth.kml+xml             kml;
    application/vnd.google-earth.kmz                 kmz;
    application/vnd.ms-excel                         xls;
    application/vnd.ms-fontobject                    eot;
    application/vnd.ms-powerpoint                    ppt;
    application/vnd.oasis.opendocument.graphics      odg;
    application/vnd.oasis.opendocument.presentation  odp;
    application/vnd.oasis.opendocument.spreadsheet   ods;
    application/vnd.oasis.opendocument.text          odt;
    application/vnd.openxmlformats-officedocument.presentationml.presentation
                                                     pptx;
    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
                                                     xlsx;
    application/vnd.openxmlformats-officedocument.wordprocessingml.document
                                                     docx;
    application/vnd.wap.wmlc                         wmlc;
    application/wasm                                 wasm;
    application/x-7z-compressed                      7z;
    application/x-cocoa                              cco;
    application/x-java-archive-diff                  jardiff;
    application/x-java-jnlp-file                     jnlp;
    application/x-makeself                           run;
    application/x-perl                               pl pm;
    application/x-pilot                              prc pdb;
    application/x-rar-compressed                     rar;
    application/x-redhat-package-manager             rpm;
    application/x-sea                                sea;
    application/x-shockwave-flash                    swf;
    application/x-stuffit                            sit;
    application/x-tcl                                tcl tk;
    application/x-x509-ca-cert                       der pem crt;
    application/x-xpinstall                          xpi;
    application/xhtml+xml                            xhtml;
    application/xspf+xml                             xspf;
    application/zip                                  zip;

    application/octet-stream                         bin exe dll;
    application/octet-stream                         deb;
    application/octet-stream                         dmg;
    application/octet-stream                         iso img;
    application/octet-stream                         msi msp msm;

    audio/midi                                       mid midi kar;
    audio/mpeg                                       mp3;
    audio/ogg                                        ogg;
    audio/x-m4a                                      m4a;
    audio/x-realaudio                                ra;

    video/3gpp                                       3gpp 3gp;
    video/mp2t                                       ts;
    video/mp4                                        mp4;
    video/mpeg                                       mpeg mpg;
    video/quicktime                                  mov;
    video/webm                                       webm;
    video/x-flv                                      flv;
    video/x-m4v                                      m4v;
    video/x-mng                                      mng;
    video/x-ms-asf                                   asx asf;
    video/x-ms-wmv                                   wmv;
    video/x-msvideo                                  avi;
}

# configuration file /etc/nginx/conf.d/default.conf:
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
```

可以看到：

+ 容器自带的 /etc/nginx/nginx.conf（官方镜像的默认配置）。
+ 挂载的 /etc/nginx/conf.d/default.conf（自定义配置）。

容器内的 nginx.conf 和宿主机的 /etc/nginx/nginx.conf 内容不同！官方 nginx Docker 镜像的 nginx.conf 更简洁，通常也包含 include /etc/nginx/conf.d/*.conf;

**③、进入容器查看**

```nginx
docker exec -it my-nginx bash

# 在容器内：
cat /etc/nginx/nginx.conf
cat /etc/nginx/conf.d/default.conf
exit
```

验证配置是否真的生效：

```nginx
curl http://localhost
# 输出应为: <h1>Hello from nginx on Docker!</h1>
```

## 2、nginx基本运行原理
nginx是一个高性能的 HTTP 服务器、反向代理服务器、负载均衡器和邮件代理服务器。它的设计哲学是高并发、低资源消耗、稳定性强。

### 2.1、nginx的核心设计理念
**①、事件驱动 + 异步非阻塞 I/O**

+ 传统 Web 服务器（如 Apache）采用 多进程/多线程模型：每个连接分配一个线程或进程，资源开销大。
+ nginx 采用 单线程事件循环（Event Loop） + 多工作进程（Worker Processes） 模型：
    - 主进程（Master Process）：负责读取配置、启动/管理 worker 进程、平滑升级等。
    - 工作进程（Worker Processes）：真正处理网络请求，每个 worker 是单线程、异步非阻塞。

**优势：**

+ 单个 worker 可同时处理 数万甚至数十万并发连接。
+ 内存占用低，CPU 利用率高。
+ 不会因为某个请求慢（如数据库卡住）而阻塞其他请求。

**②、多进程架构（非多线程）**

nginx 默认启动多个 worker 进程（通常等于 CPU 核心数），由操作系统内核通过 accept_mutex 或 SO_REUSEPORT 机制将新连接分发给空闲的 worker。

```bash
        +------------------+
        |   Master Process | ← 读配置、启停 worker、信号处理
        +------------------+
                |
      +---------+----------+
      |                    |
+------------+     +------------+
| Worker 1   |     | Worker 2   | ← 真正处理 HTTP 请求
| (event loop)|     | (event loop)|
+------------+     +------------+
      |                    |
   处理连接           处理连接
```

每个 worker 独立运行，互不干扰，即使一个崩溃也不会影响其他 worker。

### 2.2、nginx处理请求的基本流程
当用户访问 [http://example.com/](http://example.com/) 时，nginx 的处理步骤如下：

**步骤 1：接收连接**

+ 客户端发起 TCP 连接（三次握手）。
+ 内核将连接分配给某个 nginx worker 进程。

**步骤 2：解析HTTP请求**

+ 读取 HTTP 请求头（GET /index.html HTTP/1.1 ...）。
+ 根据 Host 头、IP、端口 匹配对应的 server 块（虚拟主机）。

**步骤 3：匹配 location**

+ 在选中的 server 块中，根据 URI（如 /index.html）匹配 location 指令：

```nginx
location / {
  root /usr/share/nginx/html;
}
location ~ \.php$ {
  fastcgi_pass 127.0.0.1:9000;
}
```

**步骤 4：执行处理逻辑**

根据 location 中的指令，nginx 可能：

+ 返回静态文件（如 HTML、CSS、JS、图片）。
+ 反向代理到后端应用（如 Node.js、Java、Python）。
+ 重写 URL（rewrite）。
+ 返回重定向（return 301）。
+ 调用 FastCGI/uWSGI（处理 PHP、Python 等）。

**步骤 5：发送响应**

+ 构造 HTTP 响应头 + 响应体。
+ 通过 TCP 发送给客户端。

整个过程在 单个 worker 的事件循环中异步完成，无需阻塞等待 I/O。

### 2.3、nginx的模块化架构
nginx 功能通过 模块（Modules） 实现，所有功能都是模块化的：

| 模块类型 | 作用 | 示例 |
| --- | --- | --- |
| 核心模块 | 基础功能 | ngx_core_module |
| 事件模块 | I/O 多路复用 | epoll（Linux）、kqueue（BSD） |
| HTTP 模块 | 处理 HTTP 请求 | ngx_http_core_module, ngx_http_rewrite_module |
| Proxy 模块 | 反向代理 | ngx_http_proxy_module |
| FastCGI 模块 | 与 PHP-FPM 通信 | ngx_http_fastcgi_module |
| 第三方模块 | 扩展功能 | nginx-rtmp-module, lua-nginx-module |


模块在编译时静态链接（或动态加载），运行时高效调用。

### 2.4、nginx的典型应用场景
#### 2.4.1、静态资源服务器
```nginx
server {
  listen 80;
  root /var/www/html;
  index index.html;
}
```

直接返回磁盘上的文件，性能极高。

#### 2.4.2、反向代理
```nginx
location /api/ {
  proxy_pass http://backend-server:8080/;
}
```

将请求转发给后端应用，隐藏真实服务器。

#### 2.4.3、负载均衡
```nginx
upstream backend {
  server 10.0.0.1:8080;
  server 10.0.0.2:8080;
}

location / {
  proxy_pass http://backend;
}
```

自动分发请求到多个后端，支持轮询、权重、IP 哈希等策略。

#### 2.4.4、SSL/TLS 终止
```nginx
server {
  listen 443 ssl;
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/privkey.pem;
  ...
}
```

nginx 解密 HTTPS 流量，后端只需处理 HTTP，减轻应用负担。

#### 2.4.5、缓存
```nginx
proxy_cache_path /tmp/cache levels=1:2 keys_zone=my_cache:10m;

location / {
  proxy_cache my_cache;
  proxy_pass http://backend;
}
```

缓存后端响应，减少重复请求。

### 2.5、为什么nginx性能这么高
| 特性 | 说明 |
| --- | --- |
| 异步非阻塞 I/O | 不等待磁盘或网络，立即处理下一个事件 |
| 零拷贝（sendfile） | 静态文件直接从内核缓冲区发送，不经过用户空间 |
| 内存池（Memory Pool） | 减少频繁 malloc/free，避免内存碎片 |
| 高效的事件通知机制 | Linux 下使用epoll，可高效管理百万级连接 |
| 无状态 worker | 请求可被任意 worker 处理，天然支持水平扩展 |


nginx 通过“主进程 + 多个异步非阻塞的工作进程”模型，利用事件驱动机制高效处理海量并发连接，以模块化方式提供静态服务、反向代理、负载均衡等核心功能。



