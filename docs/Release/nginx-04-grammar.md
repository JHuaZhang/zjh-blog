---
group:
  title: Nginx
order: 4
title: nginx语法规则

nav:
  title: 发布部署
  order: 6
---

## 1、nginx配置文件结构
nginx 配置的核心是定义要处理的 URL 以及如何响应这些 URL 请求，即定义一系列的 虚拟服务器（Virtual Servers） 控制对来自特定域名或者 IP 的请求的处理。每一个虚拟服务器定义一系列的 location 控制处理特定的 URI 集合。每一个 location 定义了对映射到自己的请求的处理场景，可以返回一个文件或者代理此请求。nginx 的主配置文件通常位于 /etc/nginx/nginx.conf，其结构由多个上下文（context）组成，每个上下文包含若干指令（directives）。

**主要上下文（Contexts）：**

+ main（全局上下文）：位于配置文件最外层，不包含在任何块中。
+ events：处理连接相关事件（如 epoll、kqueue）。
+ http：定义 HTTP 服务器行为（可包含多个 server 块）。
+ server：定义一个虚拟主机（监听端口、域名等）。
+ location：匹配 URI 路径，定义请求处理逻辑。
+ upstream：定义后端服务器组（用于负载均衡）。
+ map：定义变量映射。
+ if：条件判断（谨慎使用）。

```nginx
# main 全局块
# Events 块
events { }
# Http 块
# 配置使用最频繁的部分，代理、缓存、日志定义等绝大多数功能和第三方模块的配置都在这里设置
http {
  # Server 块
  server {
    # Location 块
    location [PATTERN] {}
    location [PATTERN] {}
  }
}
```

注意：不是所有指令都能在任意上下文中使用，每个指令有其允许的作用域。

**大致结构举例：**

```nginx
# ================================
# 1. 全局上下文（Main Context）
# ================================
# 运行 nginx 的用户（Linux 系统用户）
user nginx;

# 工作进程数：auto 表示等于 CPU 核心数
worker_processes auto;

# 错误日志路径和级别（debug | info | notice | warn | error | crit）
error_log /var/log/nginx/error.log warn;

# 主进程 PID 文件路径
pid /run/nginx.pid;

# ================================
# 2. events 块：处理连接事件
# ================================
events {
  # 单个工作进程允许的最大并发连接数
  worker_connections 1024;

  # 使用高效的 I/O 多路复用模型（Linux 推荐 epoll）
  use epoll;

  # 启用多 accept（一次接受多个新连接，提升性能）
  multi_accept on;
}

# ================================
# 3. http 块：HTTP 服务器全局配置
# ================================
http {
  # 包含 MIME 类型映射（如 .css → text/css）
  include /etc/nginx/mime.types;

  # 默认 Content-Type（当 MIME 无法识别时）
  default_type application/octet-stream;

  # 日志格式定义（可自定义字段）
  log_format main '$remote_addr - $remote_user [$time_local] '
    '"$request" $status $body_bytes_sent '
    '"$http_referer" "$http_user_agent" '
    'rt=$request_time uct="$upstream_connect_time" '
    'uht="$upstream_header_time" urt="$upstream_response_time"';

  # 访问日志路径和格式
  access_log /var/log/nginx/access.log main;

  # 启用高效文件传输（零拷贝）
  sendfile on;

  # 防止网络阻塞（TCP_NOPUSH + TCP_NODELAY 配合使用）
  tcp_nopush on;
  tcp_nodelay on;

  # 客户端 keepalive 超时时间（秒）
  keepalive_timeout 65;

  # Gzip 压缩配置（减少传输体积）
  gzip on;
  gzip_vary on;                     # 添加 Vary: Accept-Encoding 头
  gzip_min_length 1024;             # 小于 1KB 不压缩
  gzip_types text/plain text/css application/json application/javascript;

  # 隐藏 nginx 版本号（安全加固）
  server_tokens off;

  # 客户端请求体最大大小（防大文件上传攻击）
  client_max_body_size 10M;

  # ================================
  # 4. upstream：定义后端服务组（负载均衡）
  # ================================
  upstream backend_app {
    # 轮询（默认）负载均衡
    server 192.168.1.10:8080 weight=3;   # 权重 3
    server 192.168.1.11:8080;            # 权重 1（默认）
    server 192.168.1.12:8080 backup;     # 备用服务器
  }

  # ================================
  # 5. server 块：HTTP 虚拟主机（监听 80 端口）
  # ================================
  server {
    listen 80;
    # 监听 IPv6（可选）
    # listen [::]:80;

    # 域名匹配（支持多个，空格分隔）
    server_name example.com www.example.com;

    # 强制跳转 HTTPS（安全最佳实践）
    return 301 https://$host$request_uri;
  }

  # ================================
  # 6. server 块：HTTPS 虚拟主机（监听 443）
  # ================================
  server {
    listen 443 ssl http2;
    # listen [::]:443 ssl http2;

    server_name example.com www.example.com;

    # SSL 证书配置（需提前申请）
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    # SSL 安全优化（推荐配置）
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # 根目录（静态文件基础路径）
    root /var/www/html;
    index index.html index.htm;

    # ================================
    # 7. location：精确匹配首页
    # ================================
    location = / {
      # 仅匹配根路径 "/"，不匹配 "/index.html"
      # 设置额外头信息
      add_header X-Frame-Options "SAMEORIGIN";
      add_header X-Content-Type-Options "nosniff";
    }

    # ================================
    # 8. location：前缀匹配（普通）
    # ================================
    location /static/ {
      # 匹配以 /static/ 开头的 URI
      # expires 控制缓存（浏览器缓存 1 天）
      expires 1d;
      # 禁用日志（减少 I/O）
      access_log off;
    }

    # ================================
    # 9. location：正则匹配（区分大小写）
    # ================================
    location ~ \.php$ {
      # 拒绝直接访问 PHP 文件（安全）
      deny all;
      return 403;
    }

    # ================================
    # 10. location：正则匹配（不区分大小写）
    # ================================
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
      # 静态资源缓存 30 天
      expires 30d;
      # 添加安全头
      add_header Cache-Control "public, immutable";
    }

    # ================================
    # 11. location：^~ 前缀匹配（优先于正则）
    # ================================
    location ^~ /api/ {
      # 所有 /api/ 开头的请求代理到后端
      proxy_pass http://backend_app;  # 注意：结尾无 /，URI 会拼接

      # 透传客户端真实 IP
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;

      # 超时设置
      proxy_connect_timeout 5s;
      proxy_send_timeout 10s;
      proxy_read_timeout 10s;
    }

    # ================================
    # 12. location：try_files（优雅降级）
    # ================================
    location /app/ {
      # 尝试按顺序查找文件：
      # 1. $uri（原始路径）
      # 2. $uri/（作为目录）
      # 3. 回退到 /app/index.html（SPA 常用）
      try_files $uri $uri/ /app/index.html;
    }

    # ================================
    # 13. 自定义变量 + if（谨慎使用！）
    # ================================
    set $is_mobile "";
    if ($http_user_agent ~* "(mobile|android|iphone|ipod)") {
      set $is_mobile "1";
    }

    # 根据变量重定向（仅作演示，生产慎用 if）
    if ($is_mobile = "1") {
      rewrite ^/m/(.*)$ /mobile/$1 redirect;
    }

    # ================================
    # 14. 安全：禁止访问敏感文件
    # ================================
    location ~ /\.(env|git|svn|ht) {
      deny all;
      return 404;
    }

    # ================================
    # 15. 自定义错误页面
    # ================================
    error_page 404 /404.html;
    location = /404.html {
      internal;  # 仅内部跳转可用，外部无法直接访问
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
      internal;
    }
  }

  # ================================
  # 16. include：引入外部配置（模块化）
  # ================================
  include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

## 2、配置文件语法规则
### 2.1、基本语法规则
#### 2.1.1、指令规则
+ 格式：指令名 参数1 参数2 ...;
+ 必须以分号 ; 结尾（块指令除外）。
+ 参数之间用空格分隔。

```nginx
worker_processes 4;
error_log /var/log/nginx/error.log warn;
root /usr/share/nginx/html;
```

#### 2.1.2、块（Block）
+ 用花括号 {} 包裹一组指令，形成一个上下文。
+ 不以分号结尾。

```nginx
http {
  server {
    listen 80;
    location / {
      index index.html;
    }
  }
}
```

#### 2.1.3、注释
使用 # 开头，仅支持单行注释。

```nginx
# 这是一个注释
# listen 80;  # 被注释掉的指令
```

#### 2.1.4、字符串与引号
**①、无空格/特殊字符：可不加引号。**

```nginx
root /var/www;
```

**②、含空格、;、{}、$ 等：必须用双引号 " 包裹。**

```nginx
return 200 "Hello World!";
add_header X-Message "It's a test";
```

**③、不支持单引号（会被视为普通字符）。**

#### 2.1.5、多值参数
某些指令接受多个参数，用空格分隔：

```nginx
try_files $uri $uri/ /index.html;
gzip_types text/css application/javascript;
```

### 2.2、指令作用域
nginx的指令严格限定作用域。常见指令作用域如下：

| 指令 | 允许的上下文 |
| --- | --- |
| worker_processes | main |
| events | main |
| http | main |
| server | http |
| listen | server |
| server_name | server |
| location | server, location |
| root | http, server, location |
| index | http, server, location |
| proxy_pass | location, if in location |
| upstream | http |
| rewrite | server, location, if |
| return | server, location, if |
| if | server, location |


验证方法：使用 nginx -t 测试配置，若指令放错位置会报错。

### 2.3、变量
nginx支持内置变量和自定义变量。

#### 2.3.1、内置变量（以 $ 开头）
由 nginx 模块自动提供，反映请求/响应/连接信息。常见内置变量：

```nginx
$host                # 请求头 Host 字段
$request_uri         # 完整原始 URI（含 ?query）
$uri                 # 解码后的 URI（不含 query）
$args                # 查询字符串（? 后面部分）
$remote_addr         # 客户端 IP
$http_user_agent     # User-Agent 头
$scheme              # 协议（http/https）
$server_port         # 服务器监听端口
$status              # 响应状态码（用于日志）
```

#### 2.3.2、自定义变量
使用set指令定义：

```nginx
set $my_var "hello";
set $is_mobile "";
```

变量作用域：继承父上下文，可在 server、location 中定义并传递。

### 2.4、location匹配规则
location 是 nginx 最强大的功能之一，用于匹配请求 URI。

**语法：**

```nginx
location [修饰符] pattern { ... }
```

**修饰符类型：**

| 修饰符 | 含义 | 示例 |
| --- | --- | --- |
| (无) | 普通前缀匹配 | location /images/ |
| = | 精确匹配（最高优先级） | location = / |
| ~ | 正则匹配（区分大小写） | location ~ \.php$ |
| ~* | 正则匹配（不区分大小写） | location ~* \.(jpg|png)$ |
| ^~ | 前缀匹配，且阻止正则测试 | location ^~ /static/ |


**匹配优先级（从高到低）：**

1. = 精确匹配。
2. ^~ 前缀匹配（匹配后不再测试正则）。
3. 按配置顺序的正则匹配（~ 或 ~*）。
4. 最长前缀匹配（普通 location /xxx）。

最佳实践：高频路径用 =，静态资源用 ^~，动态路由用正则。

### 2.5、include指令
用于拆分配置，提高可维护性。

```nginx
include /path/to/file.conf;
include /etc/nginx/conf.d/*.conf;
```

**特点：**

1. 支持通配符 *。
2. 文件内容直接“内联”到当前位置。
3. 常用于多站点管理（如 sites-enabled/）。

### 2.6、条件判断（if）
**语法：**

```nginx
if (condition) {
    ...
}
```

**支持的条件：**

+ 变量判断：if ($http_user_agent ~* "mobile")。
+ 字符串比较：if ($request_method = POST)。
+ 文件存在：if (-f $request_filename)。

**注意****⚠️****：**

nginx 的 if 在 location 中行为不符合直觉，可能导致：

+ proxy_pass 失效。
+ root 被忽略。
+ 意外重写。

建议：优先使用多个 location 或 map 替代 if。

### 2.7、map指令（安全的条件映射）
map 是 nginx 提供的一个高效、安全的变量映射机制。它的作用是：

**根据一个变量的值（如 $http_user_agent），动态生成另一个变量的值（如 $is_mobile）。它不是“修改”原变量，而是创建一个新变量，其值由原变量决定。**

**举例说明：**

```nginx
map $http_user_agent $is_mobile {
  default       0;      # 默认认为是电脑
  ~*mobile      1;      # 如果 UA 里有 "mobile" → 手机
  ~*android     1;      # 如果 UA 里有 "android" → 手机
  ~*iphone      1;      # 如果 UA 里有 "iphone" → 手机
}
```

map $http_user_agent $is_mobile：

其中含义如下：

+ $http_user_agent：输入变量（客户端请求头中的 User-Agent 字符串）。
+ $is_mobile：输出变量（自定义的新变量）。
+ 含义：每当有请求进来，nginx 会检查 User-Agent，然后自动设置 $is_mobile 为 0 或 1。

$http_user_agent 是 nginx 自动提供的，$is_mobile 是我们通过 map 定义的。

然后使用的时候：

```nginx
server {
  listen 80;
  server_name example.com;

  # 使用 map 生成的变量
  if ($is_mobile = "1") {
    return 301 https://m.example.com$request_uri;
  }

  # 电脑用户正常访问
  root /var/www/html;
}
```

这样，nginx 会自动根据设备类型分流！

### 2.8、错误处理与重定向
#### 2.8.1、自定义错误页
```nginx
error_page 404 /404.html;
error_page 500 502 503 504 /50x.html;
```

可配合 location = /404.html { internal; } 限制外部访问。

#### 2.8.2、重定向
```nginx
return 301 https://$host$request_uri;  # 永久重定向
return 302 /new-path;                  # 临时重定向
return 200 "OK";                       # 直接返回内容
```

#### 2.8.3、URL重写
```nginx
rewrite ^/old/(.*)$ /new/$1 permanent;  # 301 重写
rewrite ^/api/v1/(.*)$ /v2/$1 last;     # 内部重写
```

+ last：停止当前rewrite，重新匹配location。
+ break：停止rewrite，继续当前location。
+ permanent：301重定向。
+ redirect：302重定向。

## 3、配置详解
### 3.1、main全局块
该部分配置用于设置影响 nginx 全局的指令，通常包括以下几个部分：

+ 配置运行 nginx 服务器用户（组）。
+ worker process 数。
+ nginx 进程 PID 存放路径。
+ 错误日志的存放路径。
+ 配置文件引入。

```nginx
# 配置运行 nginx 服务器用户（组）
user root;
# 错误日志的存放路径
error_log /var/log/nginx/error.log;
# nginx 进程 PID 存放路径
pid /run/nginx.pid;
# 设置工作进程数量
worker_process 1;
# 配置文件引入
include /usr/share/nginx/modules/*.conf;
```

#### 3.1.1、user
指定运行 nginx 的 woker 子进程的属主和属组，其中组可以不指定。

```nginx
user <USERNAME> [GROUP]
# 用户是 nginx; 组是 dev
user nginx dev;
```

#### 3.1.2、pid
指定运行 nginx master 主进程的 pid 文件存放路径。

```nginx
# master 主进程的的 pid 存放在 nginx.pid 的文件
pid /opt/nginx/logs/nginx.pid
```

#### 3.1.3、worker_rlimit_nofile_number
指定 worker 子进程可以打开的最大文件句柄数。

```nginx
# 可以理解成每个 worker 子进程的最大连接数量
worker_rlimit_nofile 20480;
```

#### 3.1.4、worker_rlimit_core
指定 worker 子进程异常终止后的 core 文件，用于记录分析问题。

```nginx
# 存放大小限制
worker_rlimit_core 50M;
# 存放目录
working_directory /opt/nginx/tmp;
```

#### 3.1.5、worker_processes_number
指定 nginx 启动的 worker 子进程数量。

```nginx
# 指定具体子进程数量
worker_processes 4;
# 与当前cpu物理核心数一致
worker_processes auto;
```

#### 3.1.6、worker_cpu_affinity
将每个 worker 子进程与我们的 cpu 物理核心绑定。

```nginx
# 4 个物理核心，4 个 worker 子进程
worker_cpu_affinity 0001 0010 0100 1000;
```

将每个 worker 子进程与特定 CPU 物理核心绑定，优势在于，避免同一个 worker 子进程在不同的 CPU 核心上切换，缓存失效，降低性能。但其并不能真正的避免进程切换。

#### 3.1.7、worker_priority
指定 worker 子进程的 nice 值，以调整运行 nginx 的优先级，通常设定为负值，以优先调用 nginx。

```nginx
# 120-10=110，110 就是最终的优先级
worker_priority -10;
```

Linux 默认进程的优先级值是 120，值越小越优先； nice 定范围为 -20 到 +19 。

备注：应用的默认优先级值是 120 加上 nice 值等于它最终的值，这个值越小，优先级越高。

#### 3.1.8、worker_shutdown_timeout
指定 worker 子进程优雅退出时的超时时间。

```nginx
worker_shutdown_timeout 5s;
```

#### 3.1.9、timer_resolution
worker 子进程内部使用的计时器精度，调整时间间隔越大，系统调用越少，有利于性能提升；反之，系统调用越多，性能下降。

```nginx
timer_resolution 100ms;
```

在 Linux 系统中，用户需要获取计时器时需要向操作系统内核发送请求，有请求就必然会有开销，因此这个间隔越大开销就越小。

#### 3.1.10、daemon
指定 nginx 的运行方式，前台还是后台，前台用于调试，后台用于生产。

```nginx
# 默认是 on，后台运行模式
daemon off;
```

### 3.2、events块
events 块配置影响 nginx 服务器或与用户的网络连接。有每个进程的最大连接数，选取哪种事件驱动模型处理连接请求，是否允许同时接受多个网路连接，开启多个网络连接序列化等。

该部分配置主要影响 nginx 服务器与用户的网络连接，主要包括：

+ 设置网络连接的序列化。
+ 是否允许同时接收多个网络连接。
+ 事件驱动模型的选择。
+ 最大连接数的配置。

```nginx
# 处理连接
events {
  # 默认使用的网络 I/O 模型，Linux 系统推荐采用 epoll 模型，FreeBSD 推荐采用 kqueue 模型
  # use epoll;
  # 设置连接数
  worker_connections: 1024;
}
```

#### 3.2.1、use
nginx 使用何种事件驱动模型。

```nginx
# 不推荐配置它，让 nginx 自己选择
use <method>;
```

method 的可选值：

+ select。
+ poll。
+ kqueue。
+ epoll。
+ /dev/poll。
+ eventport。

#### 3.2.2、worker_connections
worker 子进程能够处理的最大并发连接数。

```nginx
# 每个子进程的最大连接数为1024
worker_connections 1024;
```

#### 3.2.3、accept_mutex
是否打开负载均衡互斥锁。

```nginx
# 默认是 off 关闭的，这里推荐打开
accept_mutex on;
```

### 3.3、http块
http 块可以嵌套多个 server，配置代理，缓存，日志定义等绝大多数功能和第三方模块的配置。如文件引入，mime-type 定义，日志自定义，是否使用 sendfile 传输文件，连接超时时间，单连接请求数等。

+ 定义 MIMI-Type。
+ 自定义服务日志。
+ 允许 sendfile 方式传输文件。
+ 连接超时时间。
+ 单连接请求数上限。

```nginx
http {
  # 文件拓展名查找集合
  include   mime.types;

  # 当查找不到对应类型的时候默认值
  default_type    application/octet-stream;

  # 日志格式，定义别名为 main
  log_format main '$remote_addr - $remote_user [$time_local] "$request" '
    '$status $body_bytes_sent "$http_referer" '
    '"$http_user_agent" "$http_x"_forwarded_for"';

  # 指定日志输入目录
  access_log logs/access.log main;

  # 调用 sendfile 系统传输文件，开启高效传输模式
  # sendfile 开启的情况下，提高网络包的传输效率（等待，一次传输）
  sendfile      on;
  # 减少网络报文段的数量
  tcp_nopush    on;

  # 客户端与服务器连接超时时间，超时自动断开
  # keepalive_timeout   0;
  keepalive_timeout     65;

  # 开启 Gzip 压缩
  gzip    on;

  # proxy_cache_path /nginx/cache levels=1:2 keys_zone=mycache:16m inactive=24h max_size=1g

  # 当存在多个域名的时候，如果所有配置都写在 nginx.conf 主配置文件中，难免显得杂乱无章
  # 为了方便维护，可以进行拆分配置
  include /etc/nginx/conf.d/*.conf;

    # 虚拟主机
    server {
    # 省略，详细配置看 server 块

    # 位置路由，详细配置看 location 块
    location / {

}
}

    # 引入其他的配置文件
    include servers/*;
}

```

#### 3.3.1、MIME类型管理
```nginx
include       mime.types;          # 引入标准 MIME 映射（/etc/nginx/mime.types）
default_type  application/octet-stream;  # 未知扩展名时的默认 Content-Type
```

重要性：确保浏览器正确解析 .css、.js、.json 等文件。

自定义 MIME：可在 mime.types 中添加，如：

```nginx
types {
  application/wasm wasm;
}
```

#### 3.3.2、日志配置（访问日志 + 错误日志）
```nginx
# 自定义日志格式（别名 main）
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
'$status $body_bytes_sent "$http_referer" '
'"$http_user_agent" "$http_x_forwarded_for" '
'rt=$request_time uct="$upstream_connect_time"';

# 启用访问日志（使用 main 格式）
access_log /var/log/nginx/access.log main;

# 错误日志（通常在 main context 定义，但也可在 http 中覆盖）
error_log /var/log/nginx/error.log warn;
```

**关键变量：**

+ $request_time：总请求耗时（秒）。
+ $upstream_response_time：后端响应时间。
+ $http_x_forwarded_for：真实客户端 IP（需代理传递）。

#### 3.3.3、文件传输优化
```nginx
sendfile        on;      # 启用零拷贝（内核直接传文件，不经过用户空间）
tcp_nopush      on;      # 在 sendfile 时，等待包填满再发送（减少小包）
tcp_nodelay     on;      # 禁用 Nagle 算法，立即发送小包（适合动态响应）
```

组合效果：

+ 静态文件：sendfile + tcp_nopush → 高吞吐。
+ 动态 API：tcp_nodelay → 低延迟。

#### 3.3.4、连接与超时控制
```nginx
keepalive_timeout 65;           # 客户端长连接保持时间（秒）
keepalive_requests 100;         # 单个连接最大请求数（防资源耗尽）
client_header_timeout 10;       # 读取请求头超时
client_body_timeout 10;         # 读取请求体超时
send_timeout 10;                # 发送响应超时
lingering_close always;         # 优雅关闭连接
```

keepalive_requests：常被忽略！防止恶意客户端用一个连接发无限请求。

#### 3.3.5、客户端请求限制
```nginx
client_max_body_size 10M;       # 限制上传文件大小（防 DoS）
client_body_buffer_size 128k;   # 请求体缓冲区大小
client_header_buffer_size 1k;   # 请求头缓冲区
large_client_header_buffers 4 4k; # 大请求头缓冲区（4块 × 4KB）
```

#### 3.3.6、Gzip压缩（提升性能）
```nginx
gzip              on;
gzip_vary         on;                     # 添加 Vary: Accept-Encoding
gzip_min_length   1024;                   # 小于 1KB 不压缩
gzip_types        text/plain text/css application/json application/javascript;
gzip_proxied      any;                    # 对代理请求也压缩
```

#### 3.3.7、安全与隐私
```nginx
server_tokens off;              # 隐藏 nginx 版本号（Server: nginx）
add_header X-Frame-Options "SAMEORIGIN" always;    # 防点击劫持
add_header X-Content-Type-Options "nosniff" always; # 防 MIME 嗅探
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

注意：add_header 在子块（如 location）中会覆盖父块，需重复定义。

#### 3.3.8、缓存配置（代理缓存）
```nginx
# 定义缓存区（必须在 http 块）
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=mycache:10m 
inactive=60m max_size=2g use_temp_path=off;

# 全局默认缓存行为（可被 server/location 覆盖）
proxy_cache mycache;
proxy_cache_valid 200 302 10m;
proxy_cache_valid 404 1m;
```

#### 3.3.9、 SSL/TLS全局设置（HTTPS优化）
```nginx
ssl_protocols TLSv1.2 TLSv1.3;          # 禁用不安全协议
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512; # 强加密套件
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;       # 会话复用
ssl_session_timeout 10m;
```

#### 3.3.10、模块化配置（拆分文件）
```nginx
include /etc/nginx/conf.d/*.conf;       # 通用配置片段
include /etc/nginx/sites-enabled/*;     # 虚拟主机（推荐）
```

最佳实践：

+ conf.d/：放安全头、Gzip、缓存等共享配置。
+ sites-available/ + sites-enabled/（软链接）：管理多站点。

#### 3.3.11、root
指定静态资源目录位置，它可以写在 http、server、location 块等配置中。

root 与 alias 的区别主要在于 nginx 如何解释 location 后面的路径的 URI，这会使两者分别以不同的方式将请求映射到服务器文件上。具体来看：

+ root 的处理结果是：root 路径 + location 路径。
+ alias 的处理结果是：使用 alias 路径替换 location 路径。

```nginx
root path;
# 例如
location /image {
  root /opt/nginx/static;
}
```

当用户访问 www.test.com/image/1.png 时，实际在服务器找的路径是 /opt/nginx/static/image/1.png。

另一个例子：

```nginx
server {
  listen        9001;
  server_name   localhost;
  location /hello {
    root        /usr/local/var/www;
  }
}
```

在请求 [http://localhost:9001/hello](http://localhost:9001/hello) 时，服务器返回的路径地址应该是 /usr/local/var/www/hello/index.html。

注意：root 会将定义路径与 URI 叠加，alias 则只取定义路径。

#### 3.3.12、server块
server 块：配置虚拟主机的相关参数，一个 http 中可以有多个 server。

+ 配置网络监听。
+ 基于名称的虚拟主机配置。
+ 基于 IP 的虚拟主机配置。

```nginx
# 虚拟主机
server {
  listen          8080;
  # 浏览器访问域名
  server_name     domain.com;
  charset utf-8;
  access_log  logs/domain.access.log  access;
  # 路由
  location / {
    # 访问根目录
    root    www;
    # 入口文件
    index   index.html index.htm;
  }
}
```

##### 3.3.12.1、server_name介绍
指定虚拟主机域名。

```nginx
server_name <name1> <name2> <name3> ...
# 示例：
server_name www.nginx.com;
```

**域名匹配的四种写法：**

+ 精确匹配：server_name www.nginx.com。
+ 左侧通配：server_name *.nginx.com。
+ 右侧通配：server_name www.nginx.*。
+ 正则匹配：server_name ~^www\.nginx\.*$。

匹配优先级： 精准匹配 > 左侧通配符匹配 > 右侧通配符匹配 > 正则表达式匹配。

server_name配置实例：

```nginx
# 这里只列举了 http 端中的 sever 端配置

# 左匹配
server {
  listen         80;
  server_name    *.nginx-test.com;
  root           /usr/share/nginx/html/nginx-test/left-match/;

  location / {
    index index.html;
  }
}

# 正则匹配
server {
  listen         80;
  server_name    ~^.*\.nginx-test\..*$;
  root          /usr/share/nginx/html/nginx-test/reg-match/;

  location / {
    index index.html;
  }
}

# 右匹配
server {
  listen        80;
  server_name   www.nginx-test.*;
  root          /usr/share/nginx/html/nginx-test/right-match/;
  location / {
    index index.html;
  }
}

# 完全匹配
server {
  listen        80;
  server_name   www.nginx-test.com;
  root          /usr/share/nginx/html/nginx-test/all-match/;
  location / {
    index index.html;
  }
}
```

+ 当访问 www.nginx-test.com 时，都可以被匹配上，因此选择优先级最高的完全匹配。
+ 当访问 mail.nginx-test.com 时，会进行左匹配。
+ 当访问 www.nginx-test.org 时，会进行右匹配。
+ 当访问 doc.nginx-test.com 时，会进行左匹配。
+ 当访问 www.nginx-test.cn 时，会进行右匹配。
+ 当访问 fe.nginx-test.club 时，会进行正则匹配。

##### 3.3.12.2、listen的基本作用
一个 server 块可以有多个 listen 指令，nginx 会为每个 listen 创建一个监听套接字。

**基本语法：**

```nginx
listen [address][:port] [default_server] [ssl] [http2] [proxy_protocol] ...;
```

+ address：IP 地址（IPv4 或 IPv6），可选。
+ port：端口号（1–65535），可选（默认 80 或 443）。
+ 其他参数：如 ssl、http2 等，用于启用特定功能。

**listen 的6种常见写法：**

**①、仅指定端口（最常用）**

```nginx
listen 80;
```

监听 所有 IPv4 地址 的 80 端口。

等价于 listen *:80;

**②、指定 IP + 端口**

```nginx
listen 192.168.1.100:80;
```

仅监听该服务器上 192.168.1.100 这个 IP 的 80 端口。

适用于多 IP 服务器（如虚拟主机绑定不同 IP）。

**③、监听 IPv6**

```nginx
listen [::]:80;
```

[::] 表示 所有 IPv6 地址。

注意：IPv6 地址必须用方括号 [] 包裹（因为包含冒号）。

同时支持 IPv4 和 IPv6：

```nginx
listen 80;      # IPv4
listen [::]:80;  # IPv6
```

**④、HTTPS监听（带SSL）**

```nginx
listen 443 ssl;
```

+ 监听 443 端口，并启用 SSL/TLS。
+ 必须配合 ssl_certificate 和 ssl_certificate_key。

**⑤、启用HTTP/2（现代Web必备）**

```nginx
listen 443 ssl http2;
```

+ 同时启用 HTTPS 和 HTTP/2 协议。
+ 需要 OpenSSL 1.0.2+ 支持 ALPN。

**⑥、Unix Domain Socket（高性能本地通信）**

```nginx
listen unix:/var/run/nginx.sock;
```

+ 不通过 TCP，而是通过本地文件系统 socket 通信。
+ 常用于 nginx 与 PHP-FPM、本地代理等场景。

**default_server：默认虚拟主机**

当客户端请求的 Host 头不匹配任何 server_name 时，如果有 listen ... default_server;，则使用它。如果没有，nginx 会使用第一个定义的 server 块（按配置文件顺序）。

```nginx
# 默认 server：拒绝未知域名
server {
  listen 80 default_server;
  server_name _;  # 无效域名占位符
  return 444;     # 关闭连接（不返回响应）
}

# 正常站点
server {
  listen 80;
  server_name example.com;
  ...
}
```

return 444; 是 nginx 特有状态码，表示“关闭连接，不返回任何内容”，常用于安全防护。

##### 3.3.12.3、return的基本作用
return 会立即停止当前 location 或 server 的后续处理，直接向客户端返回响应。

不会执行后面的 proxy_pass、root、index 等指令。

响应可以是 状态码（如 403、301）或 自定义内容（如 JSON、HTML）。

```nginx
return code [text];
return code URL;
return URL;
```

**参数说明：**

| 用法 | 说明 | 示例 |
| --- | --- | --- |
| return code; | 返回 HTTP 状态码（无 body） | return 403; |
| return code "text"; | 返回状态码 + 自定义文本（Content-Type: text/plain） | return 403 "Access denied"; |
| return code URL; | 返回重定向（301/302/307/308） | return 301 https://new.com$request_uri; |
| return URL; | 等价于return 302 URL;（临时重定向） | return https://example.com; |


**支持的重定向状态码：**

+ 301：永久重定向（SEO 友好）。
+ 302：临时重定向（默认）。
+ 307：临时重定向（保留原始请求方法，如 POST）。
+ 308：永久重定向（保留原始请求方法）。

**return 的常见使用场景：**

**①、强制 HTTPS 跳转（最常用）**

```nginx
server {
  listen 80;
  server_name example.com;
  return 301 https://$host$request_uri;
}
```

$host：原始 Host 头。

$request_uri：完整 URI（含查询参数，如 /path?a=1）。

**②、拒绝敏感路径访问**

```nginx
location ~ /\.(git|env|ht) {
  return 404;  # 返回 404（比 403 更安全，隐藏文件存在）
}
```

+ 防止 .git 目录泄露源码。
+ 防止 .env 泄露数据库密码。

**③、API健康检查/Mock接口**

```nginx
location = /health {
  return 200 "OK";
  add_header Content-Type "text/plain";
}

location = /api/v1/status {
  return 200 '{"status":"ok"}';
  add_header Content-Type "application/json";
}
```

无需后端服务即可提供简单 API。常用于 Kubernetes Liveness/Readiness 探针。

**return 的响应头控制：**

return 默认的 Content-Type 是 text/plain。如果需要返回 JSON、HTML 等，需手动设置：

```nginx
location = /api/error {
  return 400 '{"error":"invalid request"}';
  add_header Content-Type "application/json";
}
```

注意：add_header 在子块中会覆盖父块，所以必须和 return 写在同一 location。

**特殊状态码：444：**

nginx 特有状态码：

```nginx
return 444;
```

+ 含义：关闭连接，不向客户端发送任何响应。
+ 用途：安全防护（如拒绝扫描器、恶意爬虫）。
+ 效果：客户端会收到“连接被重置”错误（比 403/404 更隐蔽）。

```nginx
server {
  listen 80 default_server;
  return 444;  # 所有未知域名请求直接断开
}
```

##### 3.3.12.4、location的基本作用
location 块用于定义：当客户端请求的 URI 匹配某个模式时，nginx 应该如何处理该请求。

例如：

+ /static/ → 返回本地文件。
+ /api/ → 代理到 Java/Node.js 后端。
+ /.git → 拒绝访问。
+ /app/ → 交给前端 SPA 路由处理。

**语法规则：**

```nginx
location [修饰符] pattern {
  # 指令...
}
```

+ 必须位于 server 块内（或嵌套在另一个 location 中）。
+ pattern：要匹配的 URI 路径（字符串或正则表达式）。
+ [修饰符]：可选，控制匹配方式（见下文）。

5 种 location 匹配类型：

| 修饰符 | 名称 | 匹配方式 | 是否区分大小写 | 示例 |
| --- | --- | --- | --- | --- |
| (无) | 普通前缀匹配 | URI 以pattern开头 | 否 | location /images/ |
| = | 精确匹配 | URI 完全等于pattern | 否 | location = / |
| ~ | 正则匹配 | 使用正则表达式匹配 | 是 | location ~ \.php$ |
| ~* | 正则匹配（不区分大小写） | 同上，忽略大小写 | 否 | location ~* \.(jpg|JPG)$ |
| ^~ | 前缀匹配（阻止正则） | URI 以pattern开头，且匹配后不再测试正则 | 否 | location ^~ /static/ |


+ 所有匹配都基于 解码后的 URI（如 /foo%20bar → /foo bar）。
+ 不包含查询参数（?a=1 不参与匹配）。
+ pattern 中的 / 是字面量，不是路径分隔符（只是字符串的一部分）。

这是 nginx 最容易出错的地方！匹配顺序不是按配置文件顺序，而是按以下优先级规则：

:::color1
1. **=精确匹配**  
→ 如果匹配成功，立即使用该 location，结束匹配。
2. **^~前缀匹配**  
→ 如果匹配成功，立即使用该 location，不再测试任何正则 location。
3. **正则匹配（~ 和 ~*）**  
→ 按配置文件中出现的顺序依次测试，第一个匹配成功的正则 location 被使用。
4. **最长前缀匹配（普通 location /xxx）**  
→ 如果前面都没匹配，则选择前缀最长的那个普通 location。

:::

举例说明优先级：

```nginx
location = / {
  # 1. 精确匹配 /
}

location ^~ /static/ {
  # 2. 前缀匹配 /static/，阻止正则
}

location ~ \.php$ {
  # 3. 正则匹配 .php（区分大小写）
}

location ~* \.(jpg|png)$ {
  # 4. 正则匹配图片（不区分大小写）
}

location / {
  # 5. 普通前缀匹配（兜底）
}
```

| 请求 URI | 匹配结果 | 原因 |
| --- | --- | --- |
| / | =精确匹配 | 优先级最高 |
| /static/style.css | ^~ /static/ | 前缀匹配成功，跳过正则 |
| /app/image.JPG | ~* \.(jpg|png)$ | 正则匹配（不区分大小写） |
| /api/user.php | ~ \.php$ | 正则匹配（区分大小写） |
| /about | /（兜底） | 没有其他匹配，最长前缀是/ |


关键点：^~ 的作用是“短路”正则匹配，提升性能。

###### 3.3.12.4.1、核心指令分类
我们将 location 内部的指令分为以下几类：

| 类别 | 指令 |
| --- | --- |
| 文件服务 | root, alias，index, try_files |
| 代理转发 | proxy_pass, proxy_set_header, proxy_redirect |
| 重写与返回 | rewrite, return |
| 访问控制 | deny, allow, auth_basic |
| 缓存与性能 | expires, add_header, etag |
| 日志与调试 | access_log, error_log |
| 限流与安全 | limit_req, limit_conn |


###### 3.3.12.4.2、文件服务类指令
**①、root**

+ 作用：设置静态文件的根目录。
+ 语法：root path;
+ 路径拼接：root + URI。
+ 示例：

```nginx
location /images/ {
  root /data/www;
}
```

请求 /images/logo.png → 文件路径：/data/www/images/logo.png。

适用场景：常规静态资源服务。

**②、alias**

+ 作用：将 URI 映射到另一个路径（替换匹配部分）。
+ 语法：alias path;
+ 路径替换：alias 的值直接替换 location 的 pattern。
+ 示例：

```nginx
location /images/ {
  alias /data/pictures/;
}
```

请求 /images/logo.png → 文件路径：/data/pictures/logo.png。

**重要区别：**

+ root 是拼接，alias 是替换。
+ alias 路径必须以 / 结尾（如果 location 以 / 结尾）。
+ alias 不能用于正则 location（会报错）。

**③、index**

+ 作用：定义默认索引文件。
+ 语法：index file ...;
+ 示例：

```nginx
location / {
  root /var/www/html;
  index index.html index.htm;
}
```

请求 / → 尝试返回 /var/www/html/index.html。

可指定多个文件，按顺序查找。

**④、try_files**

+ 作用：按顺序检查文件是否存在，用于优雅降级（如 SPA 路由）。
+ 语法：try_files file1 file2 ... final;
+ 示例：

```nginx
location /app/ {
  root /var/www/spa;
  try_files $uri $uri/ /app/index.html;
}
```

+ 先找 $uri（文件）。
+ 再找 $uri/（目录）。
+ 最后 fallback 到 /app/index.html。

SPA 标准配置，最后一个参数必须是内部 URI（不能是 URL）。

###### 3.3.12.4.3、代理转发类指令（反向代理）
**①、proxy_pass**

+ 作用：将请求代理到后端服务器。
+ 语法：proxy_pass URL;
+ 关键细节：结尾是否有 /。

```nginx
# 无 /：URI 拼接
location /api/ {
  proxy_pass http://backend;
}
# 请求 /api/user → 后端收到 /api/user

# 有 /：URI 替换
location /api/ {
  proxy_pass http://backend/;
}
# 请求 /api/user → 后端收到 /user
```

推荐：明确是否需要保留原始路径。

**②、proxy_set_header**

+ 作用：向后端传递自定义请求头。
+ 常用头：

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

作用：让后端知道原始客户端 IP、协议、域名等。

必须配置，否则后端可能无法正确生成 URL 或记录日志。

**③、proxy_redirect**

+ 作用：修改后端返回的 Location 和 Refresh 头。
+ 示例：

```nginx
proxy_redirect http://backend/ https://example.com/;
```

用途：当后端返回 301/302 重定向时，修正为公网地址。

###### 3.3.12.4.4、重写与返回类指令
**①、rewrite**

+ 作用：修改 URI（内部重写或外部重定向）。
+ 语法：rewrite regex replacement [flag];
+ 常用 flag：
    - last：停止 rewrite，重新匹配 location。
    - break：停止 rewrite，继续当前 location。
    - redirect：302 临时重定向。
    - permanent：301 永久重定向。
+ 示例：

```nginx
rewrite ^/old/(.*)$ /new/$1 permanent;
```

 	慎用：容易造成重写循环。

**②、return**

+ 作用：立即返回响应（状态码或内容）。
+ 语法：

```nginx
return 403;
return 301 https://new.com$request_uri;
return 200 "OK";
```

优势：比 rewrite 更高效、语义更清晰。推荐用于重定向和拒绝访问。

###### 3.3.12.4.5、访问控制类指令
**①、deny / allow**

+ 作用：基于 IP 限制访问。
+ 语法：

```nginx
deny 192.168.1.100;
allow 192.168.1.0/24;
deny all;
```

+ 顺序：从上到下，第一个匹配的规则生效。

常用于管理后台、API 保护。

**②、auth_basic**

+ 作用：启用 HTTP Basic 认证。
+ 语法：

```nginx
auth_basic "Restricted Area";
auth_basic_user_file /etc/nginx/.htpasswd;
```

生成密码文件：

```bash
htpasswd -c /etc/nginx/.htpasswd username
```

简单但有效的访问控制。

###### 3.3.12.4.6、缓存与性能类指令
**①、expires**

+ 作用：设置 Cache-Control 和 Expires 头。
+ 语法：

```bash
expires 30d;        # 30 天
expires epoch;      # 禁用缓存
expires off;        # 不修改头
```

+ 示例：

```nginx
location ~* \.(jpg|png|css|js)$ {
  expires 1y;
}
```

大幅提升静态资源加载速度。

**②、add_header**

+ 作用：添加自定义响应头。
+ 常用头：

```nginx
add_header Cache-Control "public, immutable";
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
```

注意：在子块中会覆盖父块的同名头。

**③、etag**

+ 作用：启用/禁用 ETag 头。
+ 语法：etag on | off;
+ 默认：on。
+ 用途：配合 If-None-Match 实现条件请求。

###### 3.3.12.4.7、日志与调试类指令
**①、access_log**

+ 作用：为该 location 单独设置访问日志。
+ 语法：

```nginx
access_log /var/log/nginx/static.log main;
access_log off;  # 关闭日志（提升性能）
```

高频静态资源建议关闭日志。

**②、error_log**

+ 作用：设置错误日志级别（通常在全局定义，但可覆盖）。
+ 语法：error_log file level;

###### 3.3.12.4.8、限流与安全类指令
**①、limit_req**

+ 作用：限制请求速率（防 CC 攻击）。
+ 需先定义 zone：

```nginx
http {
  limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;
}
server {
  location /login/ {
    limit_req zone=one burst=5 nodelay;
  }
}
```

**②、limit_conn**

+ 作用：限制并发连接数。
+ 示例：

```nginx
limit_conn_zone $binary_remote_addr zone=addr:10m;
location /download/ {
  limit_conn addr 1;
}
```

###### 3.3.12.4.9、完整location配置示例
```nginx
location ^~ /static/ {
  alias /data/static/;
  expires 1y;
  add_header Cache-Control "public, immutable";
  access_log off;
}

location /api/ {
  proxy_pass http://backend/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}

location ~ /\.(git|env) {
  deny all;
  return 404;
}

location /app/ {
  root /var/www/spa;
  try_files $uri $uri/ /app/index.html;
  expires -1;  # 禁用缓存（SPA 需要）
}

location = /health {
  return 200 "OK";
  add_header Content-Type "text/plain";
}

```

最佳实践总结：

| 场景 | 推荐指令 |
| --- | --- |
| 静态资源 | alias + expires + access_log off |
| API 代理 | proxy_pass + proxy_set_header |
| SPA 路由 | try_files |
| 安全防护 | deny all + return 404 |
| 重定向 | return 301（优于rewrite） |
| 缓存控制 | expires + add_header Cache-Control |


