---
title: 文件查找相关命令
order: 3
nav:
  title: Linux
  order: 2
---


## 1、which命令
which是Linux和Unix-like系统中一个常用的命令行工具，用于查找并显示某个命令的完整路径。它可以帮助用户确定在当前环境中，某个可执行文件或命令的位置。

**基本用法：**

```bash
which [选项] 命令名
```

**常用参数：**

+ -n：指定文件名长度，指定的长度必须大于或等于所有文件中最长的文件名。
+ -p：与-n参数相同，但此处的包括了文件的路径。
+ -w：指定输出时栏位的宽度。
+ -V：显示版本信息。
+ -a：显示所有匹配的路径，而不仅仅是第一个。

```bash
which -a python
# 如果系统中有多个 python 可执行文件，该命令会列出所有路径。
```

+ --skip-alias：忽略别名，只查找可执行文件。

```bash
[root@xxx ~]# which --skip-alias ls
/usr/bin/ls
# 同举例中的输出有差异
```

+ --skip-functions：忽略函数，只查找可执行文件。

**举例：**

查找ls命令的路径：

```bash
[root@xxx ~]# which ls
alias ls='ls --color=auto'
        /usr/bin/ls
```

which命令通过搜索PATH环境变量中列出的目录来查找指定的命令。PATH是一个包含多个目录路径的字符串，系统会按照顺序在这些目录中查找可执行文件。

**注意事项：**

+ 如果命令不存在于PATH中，which不会返回任何结果。
+ which只能查找可执行文件，不能查找shell内置命令或别名。

**相关命令：**

+ whereis：查找命令的二进制文件、源代码和手册页的位置。
+ locate：通过数据库查找文件。
+ find：在文件系统中查找文件。

## 2、whereis命令
whereis是Linux和Unix-like系统中一个用于查找命令的二进制文件、源代码和手册页（man page）位置的命令行工具。与which命令不同，whereis不仅查找可执行文件，还会查找与命令相关的其他文件。

**基本用法：**

```bash
whereis [选项] 命令名
```

**常用参数：**

-b：定位可执行文件。

-m：定位帮助文件。

-s：定位源代码文件。

-u：搜索默认路径下除可执行文件、源代码文件、帮助文件以外的其它文件。

-B：指定搜索可执行文件的路径。

```bash
whereis -B /usr/bin -f ls
```

-M：指定搜索帮助文件的路径。

```bash
whereis -M /usr/share/man -f ls
```

-S：指定搜索源代码文件的路径。

```bash
whereis -S /usr/src -f ls
```

**举例：**

```bash
root@xxx ~]# whereis ls
ls: /usr/bin/ls /usr/share/man/man1/ls.1.gz
[root@xxx ~]# whereis -b ls
ls: /usr/bin/ls
[root@xxx ~]# whereis -m ls
ls: /usr/share/man/man1/ls.1.gz
```

这里 /usr/bin/ls是二进制文件，/usr/share/man/man1/ls.1.gz是手册页。

```bash
[root@xxx ~]# whereis -s ls
ls:
```

如果ls没有源代码文件，则不会输出任何内容。

**工作原理：**

whereis命令通过搜索系统的标准目录来查找与指定命令相关的文件。这些标准目录包括 /bin、/usr/bin、/usr/lib、/usr/include、/usr/share/man等。

**注意事项：**

+ whereis只能查找系统标准目录中的文件，不能查找用户自定义目录中的文件。
+ 如果命令没有源代码或手册页，whereis不会返回这些部分的结果。

## 3、locate命令
locate是Linux和Unix-like系统中一个用于快速查找文件和目录的命令。它通过搜索系统预建的数据库（通常由updatedb命令生成）来定位文件，因此速度非常快。与find命令不同，locate不需要实时扫描文件系统，而是依赖于数据库中的索引。

**基本用法：**

```bash
locate [选项] 模式
```

**常用参数：**

+ `-n`：**至多显示 **`**n**`** 个输出**  
限制显示匹配结果的数量。
+ `-r`：**使用正规表达式（正则表达式）作为查找条件**  
支持更复杂的匹配模式。
+ `-o`：**指定资料库的名称**  
使用指定的数据库文件进行查找，而不是默认的数据库。
+ `-d`：**指定资料库的路径**  
使用指定路径下的数据库文件进行查找，可以指定多个路径，用冒号分隔。
+ `-i`：**忽略大小写**  
查找时忽略文件名的大小写。
+ `-c`：**仅显示匹配的文件数量**  
不显示具体路径，仅统计匹配的文件数量。
+ `-e`：**仅显示存在的文件**  
检查匹配的文件是否实际存在，避免显示已被删除的文件。
+ `-S`：**显示数据库的统计信息**  
显示数据库的详细信息，如文件数量、目录数量、数据库大小等。
+ `-q`：**静默模式**  
不显示错误信息（如数据库未找到或权限问题）。
+ `-0`：**以空字符（NULL）分隔输出**  
适用于处理包含空格或特殊字符的文件名。
+ `-b`：**仅匹配文件名中的基名（basename）**  
忽略路径部分，仅匹配文件名。
+ `-w`：**匹配整个路径名**  
默认行为，匹配完整的路径名。
+ `-l`：**限制显示结果数量**  
与 `-n` 类似，限制显示的匹配结果数量。
+ `-A`：**显示所有匹配结果**  
即使匹配结果较多，也显示全部内容。
+ `-P`：**检查符号链接是否有效**  
仅显示有效的符号链接。
+ `-V`：**显示版本信息**  
显示 `locate` 命令的版本信息。
+ `-h`：**显示帮助信息**  
显示 `locate` 命令的使用帮助。

**工作原理：**

locate命令依赖于一个由updatedb生成的数据库文件（通常位于 /var/lib/mlocate/mlocate.db）。updatedb会定期（通常每天）运行，扫描文件系统并更新数据库。因此，locate的搜索结果可能不是实时的，而是反映了数据库最后一次更新时的状态。

如果文件系统发生了变化（例如添加或删除了文件），可以使用updatedb命令手动更新数据库：

```bash
sudo updatedb
```

**注意事项：**

+ locate的速度非常快，但搜索结果可能不是最新的。
+ locate无法查找未包含在数据库中的文件（例如新创建的文件）。
+ locate默认会搜索整个文件系统，但可以通过配置文件/etc/updatedb.conf限制搜索范围。

## 4、find命令
find是Linux系统中一个功能强大且常用的命令，用于在指定目录下查找文件和目录。它支持多种查找条件，如文件名、文件类型、文件大小、修改时间等，还可以对查找到的文件执行操作。

**基本语法：**

```bash
find [路径] [选项] [操作]
```

+ 路径：指定查找的起始目录。如果不指定路径，默认从当前目录开始查找。
+ 选项：指定查找条件，如文件名、类型、大小等。
+ 操作：对查找到的文件执行的操作（如删除、打印等）。

**常用参数：**

+ -print：find命令将匹配的文件输出到标准输出。
+ -exec：find命令对匹配的文件执行该参数所给出的。
+ shell：命令。
+ -name：按照文件名查找文件。
+ -type：查找某一类型的文件。

**举例：**

**①、按文件名查找**

查找指定文件名的文件：

```bash
find /path/to/search -name "filename"
```

示例：查找当前目录下名为 test.txt 的文件：

```bash
find . -name "test.txt"
```

查找文件名匹配模式的文件（支持通配符 * 和 ?）：

```bash
find /path/to/search -name "*.txt"
```

查找文件名忽略大小写：

```bash
find /path/to/search -iname "filename"
```

**②、按文件类型查找**

查找普通文件：

```bash
find /path/to/search -type f
```

查找目录：

```bash
find /path/to/search -type d
```

查找符号链接：

```bash
find /path/to/search -type l
```

**③、按文件大小查找**

支持的单位：

+ c：字节。
+ k：千字节。
+ M：兆字节。
+ G：吉字节。

查找大于指定大小的文件：

```bash
find /path/to/search -size +100M
```

```bash
[root@xxx www]# find wwwroot -size +100M
wwwroot/yapi-install.zip
```

查找小于指定大小的文件：

```bash
find /path/to/search -size -100M
```

查找指定大小的文件：

```bash
find /path/to/search -size 100M
```

**④、按文件时间查找**

查找最近修改时间在指定天数内的文件：

```bash
find /path/to/search -mtime -7
```

查找最近访问时间在指定天数内的文件：

```bash
find /path/to/search -atime -7
```

查找最近状态更改时间在指定天数内的文件：

```bash
find /path/to/search -ctime -7
```

**⑤、按文件权限查找**

查找具有指定权限的文件：

```bash
find /path/to/search -perm 644
```

查找可执行文件：

```bash
find /path/to/search -executable
```


