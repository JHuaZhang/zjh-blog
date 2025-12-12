---
group:
  title: Linux
order: 2
title: 文件操作相关命令

nav:
  title: DevOps
  order: 1
---


## 1、ls命令
ls命令不仅可以查看Linux文件夹包含的文件而且可以查看文件权限(包括目录、文件夹、文件权限)查看目录信息等等。

命令格式:	**ls [选项][目录名]，如 ls -a /www, 即可展示/www目录下的全部文件。**

**常用选项参数：**

+ -l ：列出长数据串，包含文件的属性与权限数据等。
+ -a ：列出全部的文件，连同隐藏文件（开头为.的文件）一起列出来（常用）。
+ -d ：仅列出目录本身，而不是列出目录的文件数据。
+ -h ：将文件容量以较易读的方式（GB，kB等）列出来。
+ -R ：连同子目录的内容一起列出（递归列出），等于该目录下的所有文件都会显示出来。

**核心功能：**

### 1.1、显示详细信息：-l
以长格式（long format）显示文件/目录的详细信息，包括权限、所有者、大小、修改时间等。

```bash
ls -l
```

默认显示当前目录的文件和子目录。

**举例：**

```bash
[root@xxx www]# ls -l
total 1051256
drw-------  6 root root       4096 Apr 23 18:33 backup
-rw-r--r--  1 root root          5 Apr 23 12:54 disk.pl
-rw-r--r--  1 root root    1668096 Apr 23 12:55 reserve_space.pl
drwxr-xr-x 16 root root       4096 Apr 23 18:33 server
-rw-r--r--  1 root root 1074790400 Apr 23 12:52 swap
drwx-----x 11 www  www        4096 Apr 23 18:40 wwwlogs
drwxr-xr-x  5 root root       4096 Apr 23 18:33 wwwroot
```

**每一列的含义：**

:::color1
1. 第1列：文件类型和权限（如 -rw-r--r--）。后续我们再针对权限再继续深入探究
2. 第2列：硬链接数。
3. 第3列：所有者。
4. 第4列：所属组。
5. 第5列：文件大小（字节）。
6. 第6-8列：最后修改时间。
7. 最后一列：文件名。

:::

### 1.2、显示隐藏文件：-a
显示所有文件和目录，包括以 . 开头的隐藏文件（如 .bashrc）。

**举例：**

```bash
[root@xxx www]# ls -a
.  ..  .Recycle_bin  backup  disk.pl  reserve_space.pl  server  swap  wwwlogs  wwwroot
```

### 1.3、人性化显示文件大小：-h
ls -h 命令在Linux中的作用是将文件大小以人类可读的格式（Human-readable）显示，通常与 -l 或 -s 等选项结合使用。

**注意事项：**

:::color1
+ 依赖其他选项：单独使用 ls -h 可能无效，需搭配显示文件大小的选项（如 -l, -s）。
+ 小数精度：文件大小会保留 1~2 位小数（如 1.5K、2.0M）。
+ 目录大小：ls -lh 默认显示目录的元数据大小，而非目录内容总大小。若要查看目录总大小，需使用 du -sh。

:::

**支持的常用单位：**

+ B（字节）、K（千字节）、M（兆字节）、G（吉字节）、T（太字节）。
+ 转换规则为 1024 进制（非 1000），例如：1K = 1024B。

**适用场景：**

:::color1
+ 需要快速判断文件大小时（如检查日志文件或备份文件体积）。
+ 与其他选项组合使用：
    - ls -lh：长格式列表 + 人类可读大小。
    - ls -sh：显示文件占用磁盘块大小 + 人类可读格式。

:::

**举例：**

```bash
[root@xxx www]# ls -h
backup  disk.pl  reserve_space.pl  server  swap  wwwlogs  wwwroot
[root@xxx www]# ls -lh
total 1.1G
drw-------  6 root root 4.0K Apr 23 18:33 backup
-rw-r--r--  1 root root    5 Apr 23 12:54 disk.pl
-rw-r--r--  1 root root 1.6M Apr 23 12:55 reserve_space.pl
drwxr-xr-x 16 root root 4.0K Apr 23 18:33 server
-rw-r--r--  1 root root 1.1G Apr 23 12:52 swap
drwx-----x 11 www  www  4.0K Apr 23 18:40 wwwlogs
drwxr-xr-x  5 root root 4.0K Apr 23 18:33 wwwroot
[root@xxx www]# ls -sh
total 1.1G
4.0K backup  4.0K disk.pl  1.6M reserve_space.pl  4.0K server  1.1G swap  4.0K wwwlogs  4.0K wwwroot
```

### 1.4、递归列出子目录内容：-R
递归显示目录及其所有子目录的内容。

**举例：**

```bash
[root@xxx common]# ls -a
.   HandleImportData.js  createContext.js  formats.js  markdown.js         mock-extra.js  postmanLib.js    schema-transformTo-table.js  utils.js
..  config.js            diff-view.js      lib.js      mergeJsonSchema.js  plugin.js      power-string.js  tui-editor
[root@xxx common]# ls -R
.:
HandleImportData.js  createContext.js  formats.js  markdown.js         mock-extra.js  postmanLib.js    schema-transformTo-table.js  utils.js
config.js            diff-view.js      lib.js      mergeJsonSchema.js  plugin.js      power-string.js  tui-editor

./tui-editor:
dist

./tui-editor/dist:
tui-editor-2x.png             tui-editor-Viewer-all.min.js  tui-editor-extChart.min.js        tui-editor-extTable.min.js  tui-editor.png
tui-editor-Editor-all.min.js  tui-editor-Viewer.min.js      tui-editor-extColorSyntax.min.js  tui-editor-extUML.min.js
tui-editor-Editor.min.js      tui-editor-contents.min.css   tui-editor-extScrollSync.min.js   tui-editor.min.css
```

如上可以看到这里罗列了common的字文件夹及孙文件夹中的全部内容。

### 1.5、按时间排序：-t 和 -r
+ -t：按修改时间从新到旧排序。
+ -tr：反转排序顺序（如从旧到新），-r 表示反向（reverse），与 -t 组合后，按文件的修改时间反向排序（从旧到新），最旧的文件显示在最前面。

```bash
ls -lt
ls -ltr
```



### 1.6、按文件大小排序：-S
按文件大小从大到小排序，常与 -l 和 -h 结合使用。

```bash
ls -lSh
```

**举例：**

```bash
[root@xxx www]# ls -lt
total 1051256
drwx-----x 11 www  www        4096 Apr 23 18:40 wwwlogs
drwxr-xr-x  5 root root       4096 Apr 23 18:33 wwwroot
drw-------  6 root root       4096 Apr 23 18:33 backup
drwxr-xr-x 16 root root       4096 Apr 23 18:33 server
-rw-r--r--  1 root root    1668096 Apr 23 12:55 reserve_space.pl
-rw-r--r--  1 root root          5 Apr 23 12:54 disk.pl
-rw-r--r--  1 root root 1074790400 Apr 23 12:52 swap
[root@xxx www]# ls -ltr
total 1051256
-rw-r--r--  1 root root 1074790400 Apr 23 12:52 swap
-rw-r--r--  1 root root          5 Apr 23 12:54 disk.pl
-rw-r--r--  1 root root    1668096 Apr 23 12:55 reserve_space.pl
drwxr-xr-x 16 root root       4096 Apr 23 18:33 server
drw-------  6 root root       4096 Apr 23 18:33 backup
drwxr-xr-x  5 root root       4096 Apr 23 18:33 wwwroot
drwx-----x 11 www  www        4096 Apr 23 18:40 wwwlogs
```

可以看到这里我们加一个r就能实现从小到大。

### 1.7、显示文件类型标记：-F
在文件名后附加标识符，表示文件类型：

:::color1
+ /：目录
+ *：可执行文件
+ @：符号链接
+ |：管道文件

:::

```javascript
ls -F
```

**举例：**

```bash
[root@xxx www]# ls -F
backup/  disk.pl  reserve_space.pl  server/  swap  wwwlogs/  wwwroot/
[root@xxx www]# ls -h
backup  disk.pl  reserve_space.pl  server  swap  wwwlogs  wwwroot
```

### 1.8、显示 inode 号：-i
在Linux/Unix 系统中，ls -i可以列出文件的索引节点号（inode number）。索引节点（inode）是文件系统的核心数据结构，它的作用远不止一个简单的编号，文件名只是inode 的一个“别名”，系统底层通过 inode号而非文件名识别文件。这意味着：

+ 同一文件可以有多个文件名（通过 硬链接 实现）。
+ 删除文件时，实际是删除文件名到inode的关联，只有当硬链接数为0时，inode才会被释放。

```javascript
ls -i
```

**举例：**

```bash
[root@xxx www]# ls -i
537907 backup  523269 disk.pl  547874 reserve_space.pl  523267 server  523266 swap  537906 wwwlogs  537905 wwwroot
```

### 1.9、仅显示目录本身：-d
不展开目录内容，仅显示目录自身的信息（常用于查看目录属性）。

```bash
[root@xxx www]# ls -ld
drwxr-xr-x 7 root root 4096 Apr 23 12:55 .
[root@xxx www]# ls -d
.
[root@xxx www]# ls -lad
drwxr-xr-x 7 root root 4096 Apr 23 12:55 .
```

### 1.10、通配符过滤
使用通配符 *、?、[] 过滤文件：

```bash
ls *.txt     # 所有 .txt 文件
ls file?.txt # file1.txt、fileA.txt 等
ls [a-c]*    # 以 a、b、c 开头的文件
```

### 1.11、组合使用选项
多个选项可以组合使用，例如：

```javascript
ls -lathr  # 显示所有文件（包括隐藏文件）的长格式、按时间倒序、可读大小
```

	这个顺序也是可以变化的。

**举例：**

```bash
root@xxx www]# ls -lathr
total 1.1G
-rw-r--r--   1 root root 1.1G Apr 23 12:52 swap
-rw-r--r--   1 root root    5 Apr 23 12:54 disk.pl
drw-------   2 root root 4.0K Apr 23 12:54 .Recycle_bin
dr-xr-xr-x. 20 root root 4.0K Apr 23 12:54 ..
drwxr-xr-x   7 root root 4.0K Apr 23 12:55 .
-rw-r--r--   1 root root 1.6M Apr 23 12:55 reserve_space.pl
drwxr-xr-x  16 root root 4.0K Apr 23 18:33 server
drw-------   6 root root 4.0K Apr 23 18:33 backup
drwxr-xr-x   5 root root 4.0K Apr 23 18:33 wwwroot
drwx-----x  11 www  www  4.0K Apr 23 18:40 wwwlogs
[root@xxx www]# ls -rhtal
total 1.1G
-rw-r--r--   1 root root 1.1G Apr 23 12:52 swap
-rw-r--r--   1 root root    5 Apr 23 12:54 disk.pl
drw-------   2 root root 4.0K Apr 23 12:54 .Recycle_bin
dr-xr-xr-x. 20 root root 4.0K Apr 23 12:54 ..
drwxr-xr-x   7 root root 4.0K Apr 23 12:55 .
-rw-r--r--   1 root root 1.6M Apr 23 12:55 reserve_space.pl
drwxr-xr-x  16 root root 4.0K Apr 23 18:33 server
drw-------   6 root root 4.0K Apr 23 18:33 backup
drwxr-xr-x   5 root root 4.0K Apr 23 18:33 wwwroot
drwx-----x  11 www  www  4.0K Apr 23 18:40 wwwlogs
```

	可以看到输出的内容是一致的。

## 2、cd命令
cd是Linux和类Unix系统中用于切换目录（Change Directory）的核心命令，几乎在每次终端操作中都会用到。

### 2.1、基本语法
```javascript
cd [目录路径]
```

+ 如果不带参数，默认切换到当前用户的家目录（如 /home/username）。
+ 如果指定路径，则跳转到对应目录。

因此cd和cd /是访问的不同的目录，如下：

```bash
[root@xxx /]# cd /
[root@xxx /]# ls -a
.  ..  .Recycle_bin  .autorelabel  bin  boot  dev  etc  home  lib  lib64  lost+found  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var  www
[root@xxx /]# cd
[root@xxx ~]# ls -a
.  ..  .bash_history  .bash_logout  .bash_profile  .bashrc  .cache  .cshrc  .mongodb  .npm  .npmrc  .nvm  .pip  .pydistutils.cfg  .ssh  .tcshrc  .wget-hsts  install.sh
```

根目录 /：所有目录的起点，包含系统关键目录如 /bin、/etc、/home 等。

家目录 ~：每个用户的个人目录，路径通常为 /home/用户名（root 用户是 /root）。

### 2.2、切换到绝对路径
使用完整的路径（以 / 开头）跳转：

```bash
[root@xxx ~]# cd /www
[root@xxx www]# 
```

### 2.3、切换到相对路径
基于当前目录的相对位置跳转：

```javascript
cd Documents      # 进入当前目录下的 Documents 子目录
cd ../            # 返回上一级目录
cd ../../         # 返回上两级目录
```

**举例：**

```bash
[root@xxx www]# cd wwwroot/
[root@xxx wwwroot]# cd ../
[root@xxx www]# cd ../
[root@xxx /]# cd /www/wwwroot
[root@xxx wwwroot]# cd ../../
[root@xxx /]# 
```

### 2.4、返回家目录
直接输入 cd 或 cd ~：

```bash
[root@xxx /]# cd ~
[root@xxx ~]# cd /www/
[root@xxx www]# cd
[root@xxx ~]# 
```

### 2.5、返回上一次所在目录
使用 cd - 快速切换回上次的目录：

```bash
[root@xxx www]# cd wwwroot/
[root@xxx wwwroot]# cd -
/www
[root@xxx www]# cd -
/www/wwwroot
[root@xxx wwwroot]# 
```

### 2.6、实用技巧
#### 2.6.1、结合通配符
使用通配符（如 *）快速匹配目录名（需唯一匹配）：

```javascript
cd D*     # 进入当前目录下以 D 开头的唯一目录（如 Documents）
```

#### 2.6.2、使用环境变量
直接跳转到环境变量定义的路径：

```bash
cd $HOME       # 进入家目录（等价于 cd ~）
cd /usr/local  # 跳转后，可用 cd $OLDPWD 返回原目录
```

#### 2.6.3、子目录快速跳转
使用 Tab 键自动补全目录名（避免手动输入长路径）。

#### 2.6.4、常见错误处理
①、目录不存在

错误提示：bash: cd: no-such-dir: No such file or directory。

解决方法：检查路径拼写或用 ls 确认目录是否存在。

②、权限不足

错误提示：bash: cd: directory: Permission denied。

解决方法：用 ls -l 检查目录权限。

确保你对目标目录有 执行权限（x），可用 chmod 修改权限：

```bash
sudo chmod +x directory_name  # 添加执行权限
```

## 3、pwd命令
pwd 是Linux和类Unix系统中一个常用的命令，全称为Print Working Directory。它的功能非常简单：显示当前用户所在的目录的绝对路径。

**举例：**

```bash
[root@xxx ~]# pwd
/root
[root@xxx ~]# cd /
[root@xxx /]# pwd
/
```

pwd返回的是从根目录（/）开始的完整路径，例如 /home/user，而不是相对路径（如 ../ 或 subdir）。

我们也可以在脚本中获取当前路径：

```bash
current_dir=$(pwd)
echo "当前目录是：$current_dir"
```

**举例：**

```bash
[root@xxx wwwroot]# current_dir=$(pwd)
[root@xxx wwwroot]# echo "当前目录是：$current_dir"
当前目录是：/www/wwwroot
```

## 4、mkdir命令
mkdir是Linux系统中用于创建目录的核心命令，名称来源于“make directory”。以下是它的功能详解和常见用法：

**基本用法：**

```bash
mkdir [选项] 目录名...
```

### 4.1、创建单个目录
**直接指定目录名创建新文件夹：**

```bash
mkdir my_folder  # 创建名为 my_folder 的目录
```

**举例：**

```bash
[root@xxx wwwroot]# ls -a
.  ..  default  init.lock  log  yapi  yapi-install.zip
[root@xxx wwwroot]# mkdir test
[root@xxx wwwroot]# ls -a
.  ..  default  init.lock  log  test  yapi  yapi-install.zip
```

### 4.2、批量创建目录
**同时创建多个目录：**

```bash
mkdir dir1 dir2 dir3  # 创建 dir1, dir2, dir3 三个目录
```

**举例：**

```bash
root@xxx wwwroot]# mkdir dir1 dir2 dir3  # 创建 dir1, dir2, dir3 三个目录
[root@xxx wwwroot]# ls -a
.  ..  default  dir1  dir2  dir3  init.lock  log  test  yapi  yapi-install.zip
```

**常用选项：**

| 选项 | 作用 | 示例 |
| --- | --- | --- |
| -p | 递归创建多级目录（自动创建父目录） | mkdir -p parent/child/grandchild |
| -v | 显示创建过程的详细信息（verbose 模式） | mkdir -v logs<br/> → 输出：创建了目录 'logs' |
| -m | 设置目录权限（需搭配权限值使用） | mkdir -m 755 secure_dir<br/>→ 权限设为 rwxr-xr-x |


### 4.3、常用用途
#### 4.3.1、强制创建多级目录
Windows 的mkdir默认支持多级目录创建（类似 -p 功能），但Linux需显式指定 -p。

```bash
mkdir -p project/src/main/java  # 自动创建 project/, src/, main/, java/ 层级目录
```

**举例：**

```bash
[root@xxx wwwroot]# mkdir -p project/src/main/java  # 自动创建 project/, src/, main/, java/ 层级目录
[root@xxx wwwroot]# ls -a
.  ..  default  dir1  dir2  dir3  init.lock  log  project  test  yapi  yapi-install.zip
[root@xxx wwwroot]# cd project
[root@xxx project]# ls -R
.:
src

./src:
main

./src/main:
java

./src/main/java:
```

#### 4.3.2、批量创建带权限的目录
```bash
mkdir -m 700 private_dir  # 创建仅所有者可读/写/执行的目录
mkdir -m 755 public_dir   # 创建所有者可完全控制、其他用户只读的目录
```

#### 4.3.3、结合路径通配符
```bash
mkdir -p data/{2023,2024}/{Q1,Q2,Q3,Q4}  # 快速创建年份和季度的目录结构
```

效果：生成 data/2023/Q1, data/2024/Q4 等目录。

**举例：**

```bash
root@xxx project]# mkdir -p data/{2023,2024}/{Q1,Q2,Q3,Q4}
[root@xxx project]# ls -a
.  ..  data  src
[root@xxx project]# cd data/
[root@xxx data]# ls -a
.  ..  2023  2024
[root@xxx data]# ls -R
.:
2023  2024

./2023:
Q1  Q2  Q3  Q4

./2023/Q1:

./2023/Q2:

./2023/Q3:

./2023/Q4:

./2024:
Q1  Q2  Q3  Q4

./2024/Q1:

./2024/Q2:

./2024/Q3:

./2024/Q4:
```

## 5、rmdir命令
rmdir 是Linux/Unix系统中用于删除空目录（Empty Directory）的命令，全称为Remove Directory。它的设计目的是安全地删除空目录，避免误删含有文件的目录。以下是详细介绍：

**基本语法：**

```bash
rmdir [选项] 目录名
```

**特点：**

+ 仅删除空目录：目录中不能包含任何文件或子目录（包括隐藏文件）。
+ 安全性高：相比 rm -r，rmdir不会删除非空目录，避免误操作风险。
+ 轻量级操作：适合脚本中精确控制目录清理流程。

**常用选项：**

| 选项 | 作用 |
| --- | --- |
| -p | 递归删除目录及其空的父目录（删除多级空目录结构） |
| --ignore-fail-on-non-empty | 忽略因目录非空导致的错误（仅报告失败，不中断操作） |
| -v | 显示操作详情（Verbose 模式） |


### 5.1、删除单个空目录
```bash
rmdir mydir   # 若 mydir 为空，则删除成功
```

**举例：**

```bash
[root@xxx wwwroot]# ls -a
.  ..  default  init.lock  log  project  yapi  yapi-install.zip
[root@xxx wwwroot]# mkdir mydir
[root@xxx wwwroot]# ls -a
.  ..  default  init.lock  log  mydir  project  yapi  yapi-install.zip
[root@xxx wwwroot]# cd mydir/
[root@xxx mydir]# touch 1.html
[root@xxx mydir]# cd ../
[root@xxx wwwroot]# rmdir mydir
rmdir: failed to remove 'mydir': Directory not empty
```

如上所示我们创建了一个mydir文件夹，然后给里面新建了1.html之后，就无法进行删除文件夹了。

### 5.2、递归删除多级空目录
假设目录结构为 A/B/C（且 A、B、C 均为空）：

```bash
rmdir -p A/B/C  # 从 C 开始逐级向上删除空目录 A → B → C
```

**举例：**

```bash
[root@xxx wwwroot]# mkdir -p test/test2/test3
[root@xxx test]# ls -R
.:
test2

./test2:
test3

./test2/test3:
```

如果我们直接删除test，就会报错：

```bash
[root@xxx wwwroot]# rmdir -p test
rmdir: failed to remove 'test': Directory not empty
[root@xxx wwwroot]# rmdir -p test/test2/test3
[root@xxx wwwroot]# ls -a
.  ..  default  init.lock  log  mydir  project  yapi  yapi-install.zip
```

## 6、touch命令
touch是Linux/Unix系统中用于创建空文件或修改文件时间戳的实用命令。它看似简单，但在脚本编写、开发调试和系统管理中非常常用。以下是详细介绍：

**基本语法：**

```bash
touch [选项] 文件名...
```

**常用选项：**

| 选项 | 作用 |
| --- | --- |
| -a | 仅更新 访问时间（Access Time） |
| -m | 仅更新 修改时间（Modification Time） |
| -c | 不创建新文件（仅修改现有文件时间戳） |
| -t | 指定时间戳（格式：[[CC]YY]MMDDhhmm[.ss]） |
| -r | 复制其他文件的时间戳到目标文件（参考文件） |
| -d | 指定时间字符串（如 "2023-10-01 12:30:00"） |


### 6.1、创建空文件
如果文件不存在，touch 会直接创建一个空文件。

```bash
touch file1.txt        # 创建单个文件
touch file{1..3}.log   # 批量创建 file1.log, file2.log, file3.log
```

**举例：**

```bash
[root@xxx mydir]# touch {1..3}.html
[root@xxx mydir]# ls -a 
.  ..  1.html  2.html  3.html
```

### 6.2、修改文件时间戳
若文件已存在，touch默认将文件的 访问时间（Access Time）和修改时间（Modification Time）更新为当前时间。时间戳是文件元数据的一部分，可以用stat命令查看：

```bash
stat file1.txt
```

```bash
touch file.txt          # 更新访问和修改时间到当前时间
touch -a file.txt       # 只更新访问时间
touch -m file.txt       # 只更新修改时间
# 使用 -t 选项（时间格式：YYYYMMDDHHMM.SS）
touch -t 202310011230.59 file.txt  # 2023年10月1日 12:30:59
touch -d "next Monday" file.txt   # 设置为下周一的当前时间
```

## 7、rm命令
rm是Linux/Unix系统中用于删除文件或目录的命令（全称 remove）。它的功能看似简单，但误用可能导致数据丢失，因此使用时需格外谨慎。以下是rm的详细介绍：

**基本用法：**

```bash
rm [选项] 文件或目录
```

**常用选项：**

| 选项 | 作用 |
| --- | --- |
| -f | 强制删除（忽略不存在的文件，不提示确认） |
| -i | 交互式删除（删除前逐一询问确认） |
| -r或 -R | 递归删除目录及其内容（用于删除非空目录） |
| -v | 显示删除过程的详细信息 |
| -d | 删除空目录（类似 rmdir） |
| --no-preserve-root | 强制删除根目录 /（极端危险！） |


### 7.1、删除单个文件
```bash
rm file.txt       # 删除文件（无提示）
rm -i file.txt    # 删除前询问确认
```

这里我们发现直接使用rm file.txt也会有提示，这是因为许多系统（如某些Linux发行版或macOS）会为rm预设别名（alias），强制绑定-i选项，通过：

```bash
alias rm   # 查看当前 shell 的别名设置
```

**举例：**

```bash
[root@xxx dir1]# alias rm
alias rm='rm -i'
```

```bash
[root@xxx dir1]# ls -a
.  ..  10.html  1.html  2.html  3.html  4.html  5.html  6.html  7.html  8.html  9.html
[root@xxx dir1]# rm 1.html
rm: remove regular empty file '1.html'? y
[root@xxx dir1]# ls -r
9.html  8.html  7.html  6.html  5.html  4.html  3.html  2.html  10.html
```

### 7.2、删除多个文件
```bash
rm file1.txt file2.txt   # 删除多个文件
rm *.log                 # 通配符删除所有 .log 文件
```

**举例：**

```bash
[root@xxx dir1]# rm 3.html 4.html
rm: remove regular empty file '3.html'? y
rm: remove regular empty file '4.html'? y
[root@xxx dir1]# ls -a
.  ..  10.html  5.html  6.html  7.html  8.html  9.html
```

```bash
[root@xxx dir1]# rm *.html
rm: remove regular empty file '10.html'? y
rm: remove regular empty file '5.html'? y
rm: remove regular empty file '6.html'? y
rm: remove regular empty file '7.html'? y
rm: remove regular empty file '8.html'? y
rm: remove regular empty file '9.html'? y
[root@xxx dir1]# ls -a
.  ..
```

### 7.3、删除空目录
```bash
rm -d empty_dir         # 删除空目录（等同于 `rmdir empty_dir`）
```

**举例：**

```bash
[root@xxx wwwroot]# ls -a
.  ..  default  dir1  dir2  dir3  init.lock  log  project  test  yapi  yapi-install.zip
[root@xxx wwwroot]# rm -d dir2
rm: remove directory 'dir2'? y
[root@xxx wwwroot]# ls -a
.  ..  default  dir1  dir3  init.lock  log  project  test  yapi  yapi-install.zip
[root@xxx wwwroot]# rm -d dir1
rm: cannot remove 'dir1': Directory not empty
```

	可以看到-d只能删除空文件夹，有内容的文件夹是无法删除的。

### 7.4、高危操作命令
以下命令可能导致灾难性后果，禁止随意执行：

```bash
rm -rf /                # 递归强制删除根目录（系统崩溃！）
rm -rf *               # 删除当前目录下所有文件（包括隐藏文件）
rm -rf ./*            # 同上（更明确的写法）
```

### 7.5、注意事项
①、权限问题

删除系统文件需 sudo，但极端危险。普通用户只能删除自己有权限的文件。

②、通配符风险

```bash
rm -rf *.txt          # 若当前目录无 .txt 文件，可能误删其他文件
rm -rf ./*.txt        # 更安全（明确限制当前目录）
```

③、rm -rf * 不会删除以 . 开头的隐藏文件，但 rm -rf .* 可能误删父目录。

## 8、mv命令
mv 是Linux/Unix系统中用于 移动或重命名文件/目录的核心命令。

**基本作用：**

+ 移动文件/目录：将文件或目录从一个位置移动到另一个位置。
+ 重命名文件/目录：通过移动操作间接实现重命名（在同一目录中移动并修改名称）。

**基本用法：**

```bash
mv [选项] <源文件或目录> <目标路径或新名称>
```

**常用选项：**

| 选项 | 说明 |
| --- | --- |
| -i | 交互模式：覆盖前提示用户确认。 |
| -f | 强制覆盖：不提示，直接覆盖已存在的目标文件。 |
| -v | 显示详细信息：输出操作过程。 |
| -n | 不覆盖：若目标文件已存在，不执行移动。 |
| -u | 更新模式：仅当源文件比目标文件新时移动。 |
| -b | 备份：覆盖前为目标文件创建备份（默认添加 `~`<br/> 后缀）。 |


### 8.1、移动文件/目录
```bash
# 将 file.txt 移动到 /home/user/documents/
mv file.txt /home/user/documents/

# 移动多个文件到目录
mv file1.txt file2.txt /target/dir/

# 移动目录 dir1 到 dir2（若 dir2 存在，则 dir1 成为 dir2 的子目录）
mv dir1/ dir2/
```

**举例：**

```bash
[root@xxx test]# touch 1.html
[root@xxx test]# mkdir to
[root@xxx test]# ls -a
.  ..  1.html  to
[root@xxx test]# mv 1.html to
[root@xxx test]# ls -R
.:
to

./to:
1.html
```

### 8.2、重命名文件/目录
```bash
# 重命名文件（同一目录下）
mv oldname.txt newname.txt

# 重命名目录
mv old_dir/ new_dir/
```

**举例：**

```bash
[root@xxx test]# ls -a
.  ..  to
[root@xxx test]# mv to demo
[root@xxx test]# ls -a
.  ..  demo
```

### 8.3、强制覆盖文件（慎用！）
```bash
mv -f source.txt target.txt  # 不提示直接覆盖
```

**举例：**

```bash
[root@xxx demo]# ls -a
.  ..  1.html  2.html
[root@xxx demo]# mv -f 1.html 2.html
[root@xxx demo]# ls -a
.  ..  2.html
```

### 8.4、覆盖前备份原文件
```bash
mv -b source.txt target.txt  # 原 target.txt 备份为 target.txt~
```

**举例：**

```bash
[root@xxx demo]# ls -a
.  ..  1.html  2.html
[root@xxx demo]# mv -b 1.html 2.html
mv: overwrite '2.html'? y
[root@xxx demo]# ls -a
.  ..  2.html  2.html~
```

### 8.5、注意事项
1. 覆盖风险：默认情况下，mv会直接覆盖同名文件（无提示）。建议使用-i选项或设置别名（如 alias mv='mv -i'）来避免误操作。
2. 跨文件系统移动：若目标路径在另一磁盘分区，mv实际是“复制+删除”，可能耗时较长。
3. 权限要求：需对源文件有读权限，对目标目录有写权限。
4. 目录行为：
    - 若目标目录存在，源目录会移动到目标目录内。
    - 若目标目录不存在，源目录会被重命名。

## 9、cp命令
cp是Linux/Unix 系统中用于复制文件或目录的核心命令。

**基本作用：**

+ 复制文件：将文件从一个位置复制到另一个位置。
+ 复制目录：递归复制目录及其子目录和文件（需搭配-r选项）。
+ 保留文件属性：可选保留文件的权限、时间戳等元数据。

**基本用法：**

```bash
cp [选项] <源文件或目录> <目标路径或新名称>
```

**常用选项：**

| 选项 | 说明 |
| --- | --- |
| -i | 交互模式：覆盖目标文件前提示确认。 |
| -f | 强制覆盖：直接覆盖已存在的目标文件，不提示。 |
| -r/-R | 递归复制：复制目录及其全部内容（必需选项）。 |
| -v | 显示详细信息：输出操作过程。 |
| -p | 保留属性：保留文件的权限、时间戳、所有者等信息。 |
| -a | 归档模式：相当于 -dpR，保留所有属性并递归复制（常用于备份）。 |
| -u | 更新模式：仅当源文件比目标文件新时复制。 |
| -n | 不覆盖：若目标文件已存在，不执行复制。 |
| -l | 硬链接：创建硬链接而非复制文件（节省空间，但源和目标需在同一文件系统）。 |
| -s | 符号链接：创建符号链接（软链接）而非复制文件。 |
| --backup | 备份覆盖：覆盖前备份原文件（默认后缀为 ~，可自定义）。 |


### 9.1、复制文件
```bash
# 复制 file.txt 到 /target/dir/
cp file.txt /target/dir/

# 复制多个文件到目录
cp file1.txt file2.txt /target/dir/

# 复制并重命名
cp file.txt /target/dir/newfile.txt
```

### 9.2、复制目录
```bash
# 递归复制目录 dir1 到 dir2（dir2 不存在时会被创建）
cp -r dir1/ dir2/
```

### 9.3、保留文件属性（权限、时间戳等）
```bash
cp -p source.txt target.txt
```

### 9.4、增量复制（仅更新新文件）
```bash
cp -u source_dir/* target_dir/
```

### 9.5、备份覆盖文件
```bash
cp --backup=numbered source.txt target.txt  # 生成 target.txt.~1~ 等备份
```

### 9.6、创建链接而非复制
```bash
cp -l source.txt hardlink.txt      # 硬链接
cp -s source.txt symlink.txt       # 软链接
```

### 9.7、注意事项
1. 覆盖风险：默认情况下，cp会直接覆盖同名文件（无提示）。建议搭配-i选项或设置别名（如 alias cp='cp -i'）避免误操作。
2. 目录复制必加-r：复制目录时必须使用-r或-a，否则操作会失败。
3. 跨文件系统行为：
    - 若目标路径在另一磁盘分区，cp会创建新文件（不保留硬链接关系）。
    - 符号链接默认复制为链接本身（使用-L可复制链接指向的实际文件）。
4. 权限问题：
    - 需对源文件有读权限，对目标目录有写权限。
    - 使用-p或-a可保留原文件的权限属性。
5. 特殊文件：复制设备文件、套接字等特殊文件时可能失败，需管理员权限。

## 10、cat命令
cat 命令是Linux/Unix系统中一个基础但功能强大的工具，名字来源于concatenate（连接）。它主要用于文件的查看、合并、创建和重定向操作。

**语法规则：**

```bash
cat [选项] 文件名
```

**常用选项：**

| 选项 | 功能 |
| --- | --- |
| -n | 显示行号（包括空行）：cat -n file.txt |
| -b | 显示行号（忽略空行）：cat -b file.txt |
| -s | 压缩连续空行为一行：cat -s file.txt |
| -E | 在每行末尾显示$符号：cat -E file.txt（便于检查行尾空格） |
| -T | 将制表符（Tab）显示为^I：cat -T file.txt（检查缩进） |


### 10.1、查看文件的内容
直接将文件的内容输出到终端上。

```bash
cat filename.txt
```

**举例：**

```bash
[root@xxx wwwroot]# ls
express  index.html  init.lock  log  project  yapi  yapi-install.zip
[root@xxx wwwroot]# cat index.html 
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body></body>
</html>
[root@xxx wwwroot]# 
```

### 10.2、查看多个文件
连续显示多个文件内容：

```bash
cat file1.txt file2.txt
```

**举例：**

```bash
[root@xxx wwwroot]# cat 1.txt 
这是测试内容1

哈哈[root@xxx wwwroot]# cat 2.txt 
这是测试内容2[root@xxx wwwroot]# 
这是测试内容2[root@xxx wwwroot]# cat 1.txt 2.txt 
这是测试内容1

哈哈这是测试内容2[root@xxx wwwroot]# 
```

其中这里1.txt中的内容为：

```plain
这是测试内容1

哈哈
```

### 10.3、合并文件
将多个文件合并为一个新文件：

```bash
cat file1.txt file2.txt > combined.txt
```

**举例：**

```bash
[root@xxx wwwroot]# ls
1.txt  2.txt  express  index.html  init.lock  log  project  yapi  yapi-install.zip
[root@xxx wwwroot]# cat 1.txt 
这是测试内容1

哈哈[root@xxx wwwroot]# cat 2.txt 
这是测试内容2[root@xxx wwwroot]# cat 1.txt 2.txt > 3.txt
[root@xxx wwwroot]# ls
1.txt  2.txt  3.txt  express  index.html  init.lock  log  project  yapi  yapi-install.zip
[root@xxx wwwroot]# cat 3.txt 
这是测试内容1

哈哈这是测试内容2[root@xxx wwwroot]# 
```

## 11、nl命令
nl是Linux中一个用于给文件内容添加行号的实用命令。与cat -n不同，它支持更灵活的行号格式控制，适合需要定制行号显示的场景。

行号是用于标识文本文件中每一行位置的数字或序号。它类似于书本中的页码，能帮助你快速定位到文件中的特定内容。

**基本语法：**

```bash
nl [选项]... [文件]...
```

+ 若未指定文件，默认从标准输入（stdin）读取内容。
+ 支持同时处理多个文件。

**常用参数:**

+ -b ：指定行号指定的方式，主要有两种：
    - -b a ：表示不论是否为空行，也同样列出行号(类似 cat -n)。
    - -b t ：如果有空行，空的那一行不要列出行号(默认值)。
+ -n ：列出行号表示的方法，主要有三种：
    - -n ln ：行号在萤幕的最左方显示。
    - -n rn ：行号在自己栏位的最右方显示，且不加 0。
    - -n rz ：行号在自己栏位的最右方显示，且加 0。
+ -w ：行号栏位的占用的位数。

### 11.1、基础行号显示
为文件所有行（包括空行）添加行号：

```bash
nl file.txt
```

**举例：**

```bash
[root@xxx wwwroot]# nl 3.txt 
     1  这是测试内容1
       
     2  哈哈这是测试内容2
```

### 11.2、忽略空行
仅对非空行编号（类似 cat -b）：

```bash
nl -b t file.txt
```

举例：

```bash
[root@xxx wwwroot]# nl -b t 3.txt 
     1  这是测试内容1
       
     2  哈哈
     3  这是测试内容2
       
     4  测试
```

## 12、more命令
more是Linux和Unix系统中一个非常基础的文本文件查看工具，主要用于逐页显示文件内容。它适用于查看较大的文本文件，因为可以逐页浏览，而不是一次性显示整个文件内容。

**基本语法：**

```bash
more [选项] 文件名
```

**常用参数：**

+ +n 从笫n行开始显示。

```bash
more +10 filename.txt
# 这将从第 10 行开始显示 filename.txt 的内容。
```

+ -n 定义屏幕大小为n行。

```bash
more -20 filename.txt
# 这将每页显示20行。
```

+ +/pattern 在每个档案显示前搜寻该字串（pattern），然后从该字串前两行之后开始显示。
+ -c 清屏后再显示内容，避免滚动显示。

```bash
more -c filename.txt
```

+ -d 显示提示信息，告诉用户如何继续浏览。

```bash
more -d filename.txt
# 这会显示类似 Press space to continue, 'q' to quit. 的提示。
```

+ -l 忽略Ctrl+l（换页）字符。
+ -p 通过清除窗口而不是滚屏来对文件进行换页，与-c选项相似。
+ -s 把连续的多个空行显示为一行。
+ -u 把文件内容中的下画线去掉。

**常用操作:**

:::color1
+ 空格键: 向下翻一页。
+ Enter 键: 向下滚动一行。
+ q: 退出 more。
+ h: 显示帮助信息。
+ / + 搜索词: 搜索指定的关键词。

:::

**与less的区别:**

more是一个非常简单的工具，功能相对有限。与之相比，less是more的增强版，支持更多的功能，例如向前和向后翻页、搜索、跳转等。因此，在现代Linux系统中，less更为常用。

## 13、less命令
less是Linux和Unix系统中一个功能强大的文本文件查看工具，用于逐页或逐行浏览文件内容。与more相比，less提供了更多的功能，例如向前和向后翻页、搜索、跳转等。less的名字来源于“less is more”（少即是多），表明它是more的增强版。

**基本语法：**

```bash
less [选项] 文件名
```

**常见选项：**

+ -b <缓冲区大小> 设置缓冲区的大小。
+ -e 当文件显示结束后，自动离开。
+ -f 强迫打开特殊文件，例如外围设备代号、目录和二进制文件。
+ -g 只标志最后搜索的关键词。
+ -i 忽略搜索时的大小写。
+ -m 显示类似more命令的百分比。
+ -N 显示每行的行号。
+ -o <文件名> 将less 输出的内容在指定文件中保存起来。
+ -Q 不使用警告音。
+ -s 显示连续空行为一行。
+ -S 行过长时间将超出部分舍弃。
+ -x <数字> 将“tab”键显示为规定的数字空格。

**常用操作：**

:::color1
+ 空格键: 向下翻一页。
+ b: 向上翻一页。
+ j: 向下滚动一行。
+ k: 向上滚动一行。
+ g: 跳转到文件开头。
+ G: 跳转到文件末尾。
+ / + 搜索词: 向前搜索指定的关键词。
+ ? + 搜索词: 向后搜索指定的关键词。
+ n: 跳转到下一个匹配的搜索结果。
+ N: 跳转到上一个匹配的搜索结果。
+ q: 退出 less。
+ h: 显示帮助信息。

:::

## 14、head命令
head是Linux和Unix系统中一个常用的命令行工具，用于显示文件的开头部分。默认情况下，head会显示文件的前10行内容。它通常用于快速查看文件的开头部分，而不需要加载整个文件。

**语法规则：**

```bash
head [选项] [文件]
```

**常用选项：**

:::color1
+ -n <行数> 或 --lines=<行数>：指定要显示的行数。例如，head -n 20 file.txt会显示file.txt文件的前20行。
+ -c <字节数> 或 --bytes=<字节数>：指定要显示的字节数。例如，head -c 100 file.txt会显示file.txt文件的前100个字节。
+ -q或--quiet：不显示文件名标题。当处理多个文件时，默认会在每个文件的内容前显示文件名，使用-q可以禁止这种行为。
+ -v或--verbose：总是显示文件名标题。即使只处理一个文件，也会显示文件名。

:::

**举例：**

显示文件的前 10 行（默认行为）：

```bash
head file.txt
```

```bash
[root@xxx wwwroot]# nl 3.txt 
     1  这是第1行
     2  这是第2行
     3  这是第3行
     4  这是第4行
     5  这是第5行
     6  这是第6行
     7  这是第7行
     8  这是第8行
     9  这是第9行
    10  这是第10行
    11  这是第11行
    12  这是第12行
    13  这是第13行
    14  这是第14行
    15  这是第15行
    16  这是第16行
    17  这是第17行
    18  这是第18行
    19  这是第19行
[root@xxx wwwroot]# head 3.txt 
这是第1行
这是第2行
这是第3行
这是第4行
这是第5行
这是第6行
这是第7行
这是第8行
这是第9行
这是第10行
```

显示文件的前 20 行：

```bash
head -n 20 file.txt
```

	显示文件的前100个字节：

```bash
head -c 100 file.txt
```

显示多个文件的前 10 行：

```bash
head file1.txt file2.txt
```

不显示文件名标题：

```bash
head -q file1.txt file2.txt
```

总是显示文件名标题：

```bash
head -v file.txt
```

```bash
[root@xxx wwwroot]# head -q 3.txt 
这是第1行
这是第2行
这是第3行
这是第4行
这是第5行
这是第6行
这是第7行
这是第8行
这是第9行
这是第10行
[root@xxx wwwroot]# head -v 3.txt 
==> 3.txt <==
这是第1行
这是第2行
这是第3行
这是第4行
这是第5行
这是第6行
这是第7行
这是第8行
这是第9行
这是第10行
```

**注意事项:**

+ 如果文件的行数少于指定的行数，head会显示文件的全部内容。
+ head通常与管道 (|) 结合使用，以便处理其他命令的输出。例如，ls -l | head会显示 ls -l命令输出的前10行。

## 15、tail命令
tail是Linux和Unix系统中一个常用的命令行工具，用于显示文件的末尾部分。默认情况下，tail会显示文件的最后10行内容。它通常用于查看日志文件或实时监控文件的新增内容。

```bash
tail [选项] [文件]
```

**常用选项：**

:::color1
-n <行数> 或 --lines=<行数>：指定要显示的行数。例如，tail -n 20 file.txt会显示file.txt文件的最后20行。

-c <字节数> 或 --bytes=<字节数>：指定要显示的字节数。例如，tail -c 100 file.txt会显示file.txt文件的最后100个字节。

-f 或 --follow：实时跟踪文件的新增内容。常用于监控日志文件，文件内容更新时会自动显示新增的内容。

-F：类似于 -f，但会处理文件被删除或重命名的情况。如果文件被删除或重命名，tail会重新打开文件并继续跟踪。

-q 或 --quiet：不显示文件名标题。当处理多个文件时，默认会在每个文件的内容前显示文件名，使用 -q可以禁止这种行为。

-v 或 --verbose：总是显示文件名标题。即使只处理一个文件，也会显示文件名。

:::

**举例：**

显示文件的最后 10 行（默认行为）：

```bash
tail file.txt
```

显示文件的最后 20 行：

```bash
tail -n 20 file.txt
```

显示文件的最后 100 个字节：

```bash
tail -c 100 file.txt
```

实时跟踪文件的新增内容：

```bash
tail -f file.txt
```

处理文件被删除或重命名的情况：

```bash
tail -F file.txt
```

显示多个文件的最后 10 行：

```bash
tail file1.txt file2.txt
```

不显示文件名标题：

```bash
tail -q file1.txt file2.txt
```

	总是显示文件名标题：

```bash
tail -v file.txt
```

**注意事项：**

+ 如果文件的行数少于指定的行数，tail 会显示文件的全部内容。
+ tail通常与管道 (|) 结合使用，以便处理其他命令的输出。例如，ls -l | tail会显示ls -l命令输出的最后10行。
+ -f选项非常适合用于监控日志文件，特别是在调试或排查问题时。

tail是一个非常有用的工具，特别适合在处理大文件或需要实时监控文件内容时使用。


