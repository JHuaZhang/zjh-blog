---
group:
  title: Nginx
order: 10
title: Keepalived实现nginx故障切换

nav:
  title: 发布部署
  order: 6
---


## 1、Keepalived介绍
Keepalived是一个开源的、基于VRRP（Virtual Router Redundancy Protocol，虚拟路由冗余协议） 实现的高可用性（High Availability, HA）解决方案。它主要用于构建高可用集群，确保关键服务在发生故障时能够自动切换，从而保证业务连续性。

**核心功能与作用：**

+ **高可用（HA）：**
    - 在多台服务器之间实现故障自动转移。
    - 当主节点宕机时，备用节点自动接管服务。
    - 客户端无感知，服务不中断。
+ **负载均衡（LVS 集成）：**
    - 内置对 Linux Virtual Server (LVS) 的支持。
    - 可实现四层（传输层）负载均衡。
    - 支持多种调度算法（轮询、加权轮询、最少连接等）。
+ **健康检查：**
    - 支持对后端服务进行 TCP/HTTP 健康检查。
    - 自动剔除故障节点，恢复后自动加入。

虽然 Keepalived 支持 LVS 负载均衡，但在现代架构中，更多人用它配合 Nginx、HAProxy 等七层代理实现“高可用 + 负载均衡”的组合方案。

**工作原理：**

**①、VRRP协议基础**

+ 多台路由器组成一个 VRRP 组。
+ 共享一个 虚拟 IP 地址（VIP）。
+ 组内选举一个 Master（主），其余为 Backup（备）。
+ Master 定期发送 Advertisement 报文（心跳包）。
+ Backup 若长时间收不到心跳，则认为 Master 故障，升级为 Master 并接管 VIP。

**②、Keepalived架构**

```bash
+---------------------+
|     Keepalived      |
+----------+----------+
           |
   +-------v-------+     +------------------+
   |    VRRP Stack |<--->| 虚拟IP (VIP)      |
   +-------+-------+     +------------------+
           |
   +-------v-------+
   |   Checkers    | —— 健康检查模块（TCP/HTTP等）
   +-------+-------+
           |
   +-------v-------+
   |     IPVS      | —— Linux 内核 LVS 模块接口
   +---------------+
```

## 2、Keepalived语法规则
Keepalived 的配置文件语法清晰、模块化，主要由 全局定义（global_defs）、VRRP 实例（vrrp_instance）、虚拟服务器（virtual_server） 等核心块组成。

默认路径：/etc/keepalived/keepalived.conf。

**语法特点：**

+ 区分大小写（关键字通常小写）。
+ 使用 { } 定义代码块。
+ 支持 # 注释。
+ 配置项以 key value 形式书写（部分支持多值）。
+ 支持 include 引入其他配置文件（Keepalived ≥ 2.0）。

整体配置结构：

```bash
global_defs {
    # 全局参数（邮件通知、标识等）
}

# 可选：自定义健康检查脚本
vrrp_script <SCRIPT_NAME> {
    # 脚本定义
}

# VRRP 实例（高可用核心）
vrrp_instance <INSTANCE_NAME> {
    # VRRP 配置
}

# LVS 虚拟服务（负载均衡场景）
virtual_server <VIP> <PORT> {
    # 后端真实服务器列表
}
```

vrrp_instance 和 virtual_server 是独立的。如果只做 Nginx 高可用 → 只需 vrrp_instance，如果做 LVS 四层负载均衡 + 高可用 → 需要两者都配。

### 2.1、global_defs(全局定义)
用于设置全局行为，如邮件告警、路由器 ID 等。

```bash
global_defs {
    notification_email {
        admin@example.com
        ops@example.com
    }
    notification_email_from keepalived@localhost
    smtp_server 127.0.0.1
    smtp_connect_timeout 30

    router_id LVS_DEVEL          # 本机唯一标识（建议 hostname）
    vrrp_skip_check_adv_addr     # 跳过 VRRP 广告地址检查（云环境常用）
    vrrp_garp_interval 0         # 免费 ARP 发送间隔（秒）
    vrrp_gna_interval 0          # 通知 ARP 间隔
    enable_script_security       # 启用脚本安全（限制执行路径）
}
```

**常用参数说明：**

| 参数 | 说明 |
| --- | --- |
| router_id | 必须设置，主备节点可相同或不同，但建议唯一 |
| vrrp_skip_check_adv_addr | 在某些网络（如 Docker、云）中避免“源地址检查失败” |
| enable_script_security | 启用后，脚本必须在/etc/keepalived/或白名单目录 |


### 2.2、vrrp_script(自定义健康检查脚本)
用于定义外部脚本，监控服务状态（如 Nginx、MySQL 是否存活）。

```bash
vrrp_script chk_nginx {
    script "/etc/keepalived/check_nginx.sh"  # 脚本路径（必须绝对路径）
    interval 2        # 检查间隔（秒）
    timeout 3         # 脚本超时时间（秒，默认同 interval）
    weight -5         # 脚本失败时，调整 VRRP 优先级（可正可负）
    fall 2            # 连续失败几次才认为故障
    rise 1            # 成功几次才认为恢复
    user root         # 以哪个用户运行脚本（可选）
}
```

脚本返回值：0 表示成功，非 0 表示失败。

### 2.3、vrrp_instance(高可用核心）
每个vrrp_instance对应一个VIP和一组主备关系。

```bash
vrrp_instance VI_1 {
    state MASTER | BACKUP        # 初始状态（仅启动时有效）
    interface eth0               # 绑定的物理网卡
    use_vmac                     # 使用虚拟 MAC（可选，增强兼容性）
    vmac_xmit_base               # 虚拟 MAC 发送模式（高级）

    virtual_router_id 51         # VRRP 组 ID（0-255），主备必须一致！
    priority 100                 # 优先级（1-255），越高越优先成为 Master
    advert_int 1                 # VRRP 通告间隔（秒，默认 1）

    # 认证（简单密码，防非法节点加入）
    authentication {
        auth_type PASS           # 只支持 PASS（明文密码）
        auth_pass 123456         # 密码（≤8 字符，主备必须相同）
    }

    # 虚拟 IP 地址列表（可多个）
    virtual_ipaddress {
        192.168.1.100/24 dev eth0 label eth0:1
        10.0.0.100/24
        # 格式：IP[/掩码] [dev 设备] [label 别名]
    }

    # 虚拟路由（可选，用于复杂网络）
    virtual_routes {
        src 192.168.1.100 to 10.0.0.0/8 via 192.168.1.1 dev eth0
    }

    # 跟踪脚本（关联健康检查）
    track_script {
        chk_nginx
        chk_disk
    }

    # 故障时执行的脚本
    notify_master "/etc/keepalived/notify.sh master"
    notify_backup "/etc/keepalived/notify.sh backup"
    notify_fault "/etc/keepalived/notify.sh fault"

    # 抢占模式控制
    nopreempt                    # 设置后，即使优先级高也不抢占（避免频繁切换）
    preempt_delay 30             # 抢占延迟（秒），配合 nopreempt 使用
}
```

**关键参数详解：**

| 参数 | 说明 |
| --- | --- |
| state | 仅决定启动时角色，运行中由优先级和健康状态决定 |
| virtual_router_id | 必须主备一致，否则无法组成 VRRP 组 |
| priority | Master 应 > Backup（如 100 vs 90） |
| nopreempt | 非抢占模式：Backup 升级为 Master 后，即使原 Master 恢复也不抢回 VIP |
| virtual_ipaddress | 支持 CIDR 写法（如/24），label用于创建别名接口（如eth0:1） |


### 2.4、virtual_server(LVS 虚拟服务,负载均衡）
用于配置 Linux Virtual Server（四层负载均衡）。

```bash
virtual_server 192.168.1.100 80 {
    delay_loop 6                 # 健康检查间隔（秒）
    lb_algo rr                   # 调度算法：rr|wrr|lc|wlc|sh|dh|lblc
    lb_kind NAT|DR|TUN           # 转发模式（DR 最常用）
    persistence_timeout 50       # 会话保持时间（秒）
    protocol TCP                 # TCP 或 UDP

    # 健康检查（可选，也可用 vrrp_script 替代）
    sorry_server 192.168.1.200 80  # 所有后端挂掉时的备用服务器

    real_server 192.168.1.101 80 {
        weight 1                 # 权重
        inhibit_on_failure       # 故障时权重设为 0，而非剔除
        TCP_CHECK {
            connect_port 80
            connect_timeout 3
            nb_get_retry 3
            delay_before_retry 3
        }
    }

    real_server 192.168.1.102 80 {
        weight 1
        HTTP_GET {
            path /health
            digest adf32d...     # HTTP 响应 body 的 MD5（可选）
            status_code 200
            connect_timeout 3
        }
    }
}
```

**调度算法（lb_algo）：**

+ rr：轮询。
+ wrr：加权轮询。
+ lc：最少连接。
+ sh：源 IP 哈希（会话保持）。

**转发模式（lb_kind）：**

+ NAT：修改目标 IP（性能较低）。
+ DR：直接路由（推荐，高性能）。
+ TUN：IP 隧道（跨公网）。

### 2.5、配置最佳实践
1. 主备配置差异最小化：除 state 和 priority 外，其余尽量一致。
2. 使用健康检查脚本：不要只依赖 Keepalived 进程存活。
3. 设置 nopreempt：避免网络抖动导致 VIP 频繁漂移。
4. VIP 使用 /32 掩码（可选）：

```bash
virtual_ipaddress {
    192.168.1.100/32
}
```

5. 日志调试：启动时加 -l -n -d 参数查看详细日志。

完整示例（Nginx 高可用）：

```bash
global_defs {
    router_id nginx-ha
}

vrrp_script chk_nginx {
    script "/etc/keepalived/check_nginx.sh"
    interval 2
    weight -5
    fall 2
    rise 1
}

vrrp_instance VI_NGINX {
    state MASTER
    interface eth0
    virtual_router_id 60
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass nginx123
    }
    virtual_ipaddress {
        192.168.1.100/24
    }
    track_script {
        chk_nginx
    }
    nopreempt
}
```

## 3、实际使用测试
下面我们就通过阿里云的linux服务器使用docker模拟多台Ubuntu服务器来学习Keepalived。虽然Keepalived通常运行在物理机或VM上（因为它需要操作网络接口），但在Docker中也可以模拟，只要满足几个关键条件：

+ 使用 --privileged 模式（允许操作网络）。
+ 使用 host 网络模式 或 自定义 bridge + 手动配置 ARP。
+ 安装必要内核模块（Docker 容器共享宿主机内核）。

**实验目标：**

+ 启动 2 个 Ubuntu 容器（keepalived-master / keepalived-backup）。
+ 在容器中安装 Nginx + Keepalived。
+ 配置 VIP（如 172.20.0.100）。
+ 模拟 Master 故障，观察 VIP 自动漂移到 Backup。
+ 通过浏览器或 curl 访问 VIP，验证高可用。

### 3.1、准备Docker网络
```bash
# 创建网络（子网 172.20.0.0/24）
docker network create --subnet=172.20.0.0/24 keepalived-net
```

### 3.2、编写健康检查脚本和Keepalived配置
创建项目目录：

```bash
mkdir ~/keepalived-lab && cd ~/keepalived-lab
```

创建健康检查脚本 check_nginx.sh：

```bash
cat > check_nginx.sh << 'EOF'
#!/bin/bash
if pgrep nginx > /dev/null; then
    exit 0
else
    exit 1
fi
EOF
```

```bash
chmod +x check_nginx.sh
```

创建 Master 配置 keepalived-master.conf：

```bash
cat > keepalived-master.conf << 'EOF'
vrrp_script chk_nginx {
    script "/etc/keepalived/check_nginx.sh"
    interval 2
    weight -5
    fall 2
    rise 1
}

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 123456
    }
    virtual_ipaddress {
        172.20.0.100/24 dev eth0 label eth0:1
    }
    track_script {
        chk_nginx
    }
}
EOF
```

创建 Backup 配置 keepalived-backup.conf:

```bash
cat > keepalived-backup.conf << 'EOF'
vrrp_script chk_nginx {
    script "/etc/keepalived/check_nginx.sh"
    interval 2
    weight -5
    fall 2
    rise 1
}

vrrp_instance VI_1 {
    state BACKUP
    interface eth0
    virtual_router_id 51
    priority 90
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 123456
    }
    virtual_ipaddress {
        172.20.0.100/24 dev eth0 label eth0:1
    }
    track_script {
        chk_nginx
    }
}
EOF
```

### 3.3、启动两个Ubuntu容器
必须加 --privileged 和 --cap-add=NET_ADMIN，否则无法绑定 VIP。

**启动Master容器：**

```bash
docker run -d \
  --name keepalived-master \
  --network keepalived-net \
  --ip 172.20.0.11 \
  --privileged \
  --cap-add=NET_ADMIN \
  -v $(pwd)/keepalived-master.conf:/etc/keepalived/keepalived.conf:ro \
  -v $(pwd)/check_nginx.sh:/etc/keepalived/check_nginx.sh:ro \
  ubuntu:22.04 \
  bash -c "
    apt-get update &&
    apt-get install -y nginx keepalived iproute2 iputils-ping &&
    echo '<h1>Master Server</h1>' > /var/www/html/index.html &&
    nginx &&
    keepalived -f /etc/keepalived/keepalived.conf -l -n &
    tail -f /dev/null
  "
```

& 让 keepalived 后台运行，tail -f /dev/null 作为前台主进程，防止容器退出。

**启动Backup容器：**

```bash
docker run -d \
  --name keepalived-backup \
  --network keepalived-net \
  --ip 172.20.0.12 \
  --privileged \
  --cap-add=NET_ADMIN \
  -v $(pwd)/keepalived-backup.conf:/etc/keepalived/keepalived.conf:ro \
  -v $(pwd)/check_nginx.sh:/etc/keepalived/check_nginx.sh:ro \
  ubuntu:22.04 \
  bash -c "
    apt-get update &&
    apt-get install -y nginx keepalived iproute2 iputils-ping &&
    echo '<h1>Backup Server</h1>' > /var/www/html/index.html &&
    nginx &&
    keepalived -f /etc/keepalived/keepalived.conf -l -n &
    tail -f /dev/null
  "
```

### 3.4、验证VIP是否生效
查看 Master 是否持有 VIP：

```bash
# 进入 master 容器
docker exec -it keepalived-master ip addr show eth0
```

应该看到：

```bash
[root@iZ2zeb9fdjcne1mfh06bmoZ keepalived-lab]# docker exec keepalived-master ip addr show eth0
13: eth0@if14: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:ac:14:00:0b brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.20.0.11/24 brd 172.20.0.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet 172.20.0.100/24 scope global secondary eth0:1 ← 这个就是VIP!
       valid_lft forever preferred_lft forever
[root@iZ2zeb9fdjcne1mfh06bmoZ keepalived-lab]# 
```

从宿主机访问 VIP：

```bash
[root@iZ2zeb9fdjcne1mfh06bmoZ keepalived-lab]# curl http://172.20.0.100
<h1>Master Server</h1>
```

### 3.5、模拟故障切换
停掉Master的Nginx：

```bash
# 停掉 Master 的 Keepalived（不是 Nginx！）
docker exec keepalived-master pkill keepalived
```

等待 3~5 秒，查看 Backup 是否接管：

```bash
docker logs keepalived-backup | grep "MASTER STATE"
# 应该看到 Backup 成为 MASTER
```

```bash
[root@iZ2zeb9fdjcne1mfh06bmoZ keepalived-lab]# docker logs keepalived-backup | grep "MASTER STATE"
debconf: delaying package configuration, since apt-utils is not installed
Wed Feb  4 06:32:08 2026: Starting Keepalived v2.2.4 (08/21,2021)
Wed Feb  4 06:32:08 2026: WARNING - keepalived was built for newer Linux 5.15.27, running on Linux 5.10.134-19.1.al8.x86_64 #1 SMP Wed Jun 25 10:21:27 CST 2025
Wed Feb  4 06:32:08 2026: Command line: 'keepalived' '-f' '/etc/keepalived/keepalived.conf' '-l' '-n'
Wed Feb  4 06:32:08 2026: Configuration file /etc/keepalived/keepalived.conf
Wed Feb  4 06:32:08 2026: NOTICE: setting config option max_auto_priority should result in better keepalived performance
Wed Feb  4 06:32:08 2026: Starting VRRP child process, pid=1254
Wed Feb  4 06:32:08 2026: WARNING - default user 'keepalived_script' for script execution does not exist - please create.
Wed Feb  4 06:32:08 2026: SECURITY VIOLATION - scripts are being executed but script_security not enabled.
Wed Feb  4 06:32:08 2026: Startup complete
Wed Feb  4 06:32:08 2026: (VI_1) Entering BACKUP STATE (init)
Wed Feb  4 06:32:08 2026: VRRP_Script(chk_nginx) succeeded
Wed Feb  4 06:39:34 2026: (VI_1) Entering MASTER STATE
[root@iZ2zeb9fdjcne1mfh06bmoZ keepalived-lab]# 
```

从日志中可以看到关键时间点：

```bash
Wed Feb  4 06:32:08 2026: (VI_1) Entering BACKUP STATE (init)
...
Wed Feb  4 06:39:34 2026: (VI_1) Entering MASTER STATE   ← ✅ 切换成功！
```

这说明Backup节点在 06:39:34 成功接管了VIP，Keepalived高可用机制完全正常工作。

**访问 VIP，确认返回的是 Backup 内容：**

```bash
[root@iZ2zeb9fdjcne1mfh06bmoZ keepalived-lab]# curl http://172.20.0.100
<h1>Backup Server</h1>
```

**查看 Backup 容器是否绑定了 VIP：**

```bash
[root@iZ2zeb9fdjcne1mfh06bmoZ keepalived-lab]# docker exec keepalived-backup ip addr show eth0
15: eth0@if16: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:ac:14:00:0c brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.20.0.12/24 brd 172.20.0.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet 172.20.0.100/24 scope global secondary eth0:1
       valid_lft forever preferred_lft forever
```

恢复Master：

如果想让 VIP 漂回 Master：

```bash
docker restart keepalived-master
```

等待5s之后，再次访问VIP：

```bash
# 再次访问 VIP
curl http://172.20.0.100
# 又变成 <h1>Master Server</h1>
```

### 3.6、总结
这里我们只是在学习nginx的时候，知道了如何设置多台nginx代理服务器，这样就能避免nginx服务器宕机导致服务不可用，可以给我们自动切换到其他的nginx代理服务器，不过关于Keepalived的知识还是有很多需要更进一步的掌握的，后续可以从这些方向深入探究，这次就不继续赘述了。

+ 尝试配置 nopreempt：在 vrrp_instance 中加入 nopreempt，观察 Master 恢复后是否不抢占 VIP。
+ 测试多 VIP：在 virtual_ipaddress 中添加多个 IP，验证是否都能漂移。
+ 结合域名测试：在本地 hosts 文件加一条：

```bash
172.20.0.100  mysite.local
```

然后浏览器访问 [http://mysite.local](http://mysite.local)。

+ 生产环境迁移：当需要在真实两台服务器部署时，只需：
    - 将容器换成物理机。
    - VIP 改为同网段公网/内网 IP。
    - 注意云厂商的网络限制（如阿里云需用单播或 SLB）。








