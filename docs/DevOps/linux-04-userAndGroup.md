---
group:
  title: Linux
order: 4
title: 用户和组的概念

nav:
  title: DevOps
  order: 1
---

在Linux系统中，用户（User）和组（Group）是权限管理的核心概念。它们通过控制对文件、目录和系统资源的访问权限，实现多用户环境下的安全隔离和协作。

## 1、用户介绍
Linux是一个多用户操作系统，每个用户拥有独立的账户和权限。用户分为以下类型：

:::color1
+ Root用户：超级管理员（UID=0），拥有系统最高权限。
+ 普通用户：由管理员创建，权限受限（UID≥1000）。
+ 系统用户：为运行服务或进程创建（UID1~999），无登录权限。

:::

### 1.1、用户核心信息
+ 用户信息存储在/etc/passwd文件中，格式为：

```bash
用户名:密码占位符(x):UID:GID:描述:主目录:默认Shell
```

+ 密码实际存储在/etc/shadow（加密后）。
+ UID（User ID）：用户的唯一数字标识符。

**举例：**

```bash
[root@xxx etc]# cd /etc
[root@xxx etc]# nl passwd
     1  root:x:0:0:root:/root:/bin/bash
     2  bin:x:1:1:bin:/bin:/sbin/nologin
     3  daemon:x:2:2:daemon:/sbin:/sbin/nologin
     4  adm:x:3:4:adm:/var/adm:/sbin/nologin
     5  lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
     6  sync:x:5:0:sync:/sbin:/bin/sync
     7  shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown
     8  halt:x:7:0:halt:/sbin:/sbin/halt
     9  mail:x:8:12:mail:/var/spool/mail:/sbin/nologin
    10  operator:x:11:0:operator:/root:/sbin/nologin
    11  games:x:12:100:games:/usr/games:/sbin/nologin
    12  ftp:x:14:50:FTP User:/var/ftp:/sbin/nologin
    13  nobody:x:65534:65534:Kernel Overflow User:/:/sbin/nologin
    14  dbus:x:81:81:System message bus:/:/sbin/nologin
    15  systemd-coredump:x:999:997:systemd Core Dumper:/:/sbin/nologin
    16  systemd-resolve:x:193:193:systemd Resolver:/:/sbin/nologin
    17  tss:x:59:59:Account used for TPM access:/dev/null:/sbin/nologin
    18  polkitd:x:998:996:User for polkitd:/:/sbin/nologin
    19  unbound:x:997:994:Unbound DNS resolver:/etc/unbound:/sbin/nologin
    20  chrony:x:996:993::/var/lib/chrony:/sbin/nologin
    21  sshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin
    22  nscd:x:28:28:NSCD Daemon:/:/sbin/nologin
    23  postfix:x:89:89::/var/spool/postfix:/sbin/nologin
    24  tcpdump:x:72:72::/:/sbin/nologin
    25  rpc:x:32:32:Rpcbind Daemon:/var/lib/rpcbind:/sbin/nologin
    26  rpcuser:x:29:29:RPC Service User:/var/lib/nfs:/sbin/nologin
    27  www:x:1000:1000::/home/www:/sbin/nologin
    28  mongo:x:1001:1001::/home/mongo:/sbin/nologin
    29  mysql:x:1002:1002::/home/mysql:/sbin/nologin
```

#### 1.1.1、用户名（Username）
作用：用户的登录名称（如 root、www）。

示例分析：

+ root：超级管理员账户。
+ bin、daemon、sshd：系统服务或守护进程的专用账户。
+ www、mongo、mysql：为运行 Web 服务、MongoDB、MySQL 创建的用户。

#### 1.1.2、密码占位符（Password）
作用：历史上存储加密密码，现代系统中已迁移到/etc/shadow。

示例分析：

+ x：表示密码实际存储在/etc/shadow文件中。
+ 若为*或!，表示账户被禁用（无法登录）。

#### 1.1.3、UID（User ID）
作用：用户的唯一数字标识符。

分类：

+ Root用户：UID=0（如 root）。
+ 系统用户：UID 1~999（如 bin:1、daemon:2），用于服务或进程。
+ 普通用户：UID≥1000（如 www:1000、mongo:1001）。

#### 1.1.4、GID（Group ID）
作用：用户的主组（Primary Group）ID。

示例分析：

+ root的GID是0，对应 root 组。
+ 系统组的GID通常与UID一致（如 bin:1 对应组 bin）。
+ 普通用户的主组通常与用户名相同（如 www:1000）。

#### 1.1.5、描述（GECOS）
作用：用户的注释信息，可包含全名、联系方式等（可选字段）。

示例分析：

+ root的描述是root。
+ ftp用户的描述为 FTP User。
+ 某些账户描述为空（如 www::）。

#### 1.1.6、主目录（Home Directory）
作用：用户登录后的默认工作目录。

示例分析：

+ root 的主目录是/root。
+ 系统用户的主目录通常为/var或/dev下的路径（如 sshd:/var/empty/sshd）。
+ 普通用户的主目录在 /home下（如 www:/home/www）。

#### 1.1.7、默认 Shell
作用：用户登录后启动的Shell程序。

示例分析：

+ root使用/bin/bash（可交互登录）。
+ 系统用户通常使用/sbin/nologin或/bin/false，禁止登录（如 bin:/sbin/nologin）。
+ sync用户使用/bin/sync（执行同步命令后退出）。


