---
title: yaml语法规则
order: 2
nav:
  title: CICD
  order: 7
---


## 1、介绍
在我们使用github创建流水线的时候，都会需要使用到yaml进行配置，因此这里我们先提前整理一下yaml相关的知识。

YAML（发音 /ˈjæməl/）是一个类似 XML、JSON 的数据序列化语言，YAML是专门用来写配置文件的语言，非常简洁和强大，使用比json更方便。它实质上是一种通用的数据串行化格式。其强调以数据为中心，旨在方便人类使用；并且适用于日常常见任务的现代编程语言。因而 YAML 本身的定义比较简单，号称“一种人性化的数据格式语言”。

**优点：**

+ 便捷性：不必添加大量参数到命令行中执行命令。
+ 可维护性：yaml文件可以通过控制源头，跟踪每次操作。
+ 灵活性：yaml可创建比命令行更加复杂的结构。
+ 简易：易使用。

**语法规则：**

+ 大小写敏感。
+ 使用缩进表示层级关系。
+ 缩进不允许使用Tab键，只允许空格。
+ 缩进空格数目不重要，只要相同层级的元素左侧对齐。
+ #表示注释。

## 2、YAML的数据类型
YAML 支持以下几种数据类型：

+ 对象：键值对的集合，又称为映射（mapping）/ 哈希（hashes） / 字典（dictionary）。
+ 数组：一组按次序排列的值，又称为序列（sequence） / 列表（list）。
+ 纯量（scalars）：单个的、不可再分的值。

### 2.1、YAML对象
对象的几种表示形式：

**①、对象键值对使用冒号结构表示 key: value，冒号后面要加一个空格：**

```yaml
key: value
```

**②、也可以使用 key:{key1: value1, key2: value2, ...}：**

```yaml
key:{child-key1:value1,child-key2:value2}
```

**③、还可以使用缩进表示层级关系：**

```yaml
key: 
    child-key1: value1
    child-key2: value2
```

同2，只是表示形式不同。

**④、较为复杂的对象格式，可以使用问号加一个空格代表一个复杂的 key，配合一个冒号加一个空格代表一个 value：**

```yaml
?  
    - complexkey1
    - complexkey2
:
    - complexvalue1
    - complexvalue2
```

这实际上定义了一个 只有一个键值对的映射（map/dictionary），其中：

+ 键（key） 是一个列表：[ "complexkey1", "complexkey2" ]。
+ 值（value） 也是一个列表：[ "complexvalue1", "complexvalue2" ]。

等价于 JSON 表示（虽然 JSON 不支持非字符串键，但逻辑上类似）：

```json
{
  "[\"complexkey1\", \"complexkey2\"]": ["complexvalue1", "complexvalue2"]
}
```

但在 YAML 中，键可以是任意类型（包括列表、映射等），只要用 ? 显式声明。AML 规范（YAML 1.2 spec）允许使用以下形式定义 复杂键（complex keys）：

```yaml
? <key>
: <value>
```

+ ? 表示接下来的内容是一个 键（key）。
+ : 表示接下来的内容是对应的 值（value）。
+ 当键是简单标量（如字符串、数字）时，通常省略 ?，写成 key: value。
+ 但当键是列表、映射或其他复杂结构时，必须使用 ? 和 : 显式分隔。

使用示例：权限系统中的角色匹配：

```yaml
# 用户拥有 ["admin", "finance"] 角色 → 允许访问财务报表
? 
  - admin
  - finance
:
  - view_financial_report
  - export_data

# 用户拥有 ["guest"] → 只能查看公开信息
? 
  - guest
:
  - view_public_info
```

优势：清晰表达“角色组合”到“权限集合”的映射，比写 if-else 或嵌套结构更声明式。

### 2.2、YAML数组
以 - 开头的行表示构成一个数组：

```yaml
- A
- B
- C
```

YAML 支持多维数组，可以使用行内表示：

```yaml
key: [value1, value2, ...]
```

数据结构的子成员是一个数组，则可以在该项下面缩进一个空格。

```yaml
-
 - A
 - B
 - C
```

一个相对复杂的例子：

```yaml
companies:
    -
        id: 1
        name: company1
        price: 200W
    -
        id: 2
        name: company2
        price: 500W
```

意思是 companies 属性是一个数组，每一个数组元素又是由 id、name、price 三个属性构成。数组也可以使用流式(flow)的方式表示：

```javascript
{ 
  companies: [ 
    { id: 1, name: 'company1', price: '200W' },
    { id: 2, name: 'company2', price: '500W' }
  ] 
}
```

### 2.3、复合结构（对象和数组组合）
数组和对象可以构成复合结构，例：

```yaml
languages:
  - Ruby
  - Perl
  - Python 
websites:
  YAML: yaml.org 
  Ruby: ruby-lang.org 
  Python: python.org 
  Perl: use.perl.org
```

转换为 js 为：

```yaml
{ 
  languages: [ 'Ruby', 'Perl', 'Python'],
  websites: {
    YAML: 'yaml.org',
    Ruby: 'ruby-lang.org',
    Python: 'python.org',
    Perl: 'use.perl.org' 
  } 
}
```

### 2.3、纯量
纯量是最基本的，不可再分的值，包括：

+ 字符串
+ 布尔值
+ 整数
+ 浮点数
+ Null
+ 时间
+ 日期

使用一个例子来快速了解纯量的基本使用：

```yaml
boolean: # 布尔值
    - TRUE  #true,True都可以
    - FALSE  #false，False都可以
float: # 浮点数
    - 3.14
    - 6.8523015e+5  #可以使用科学计数法
int: # 整数
    - 123
    - 0b1010_0111_0100_1010_1110    #二进制表示
null: # Null
    nodeName: 'node'
    parent: ~  #使用~表示null
string: # 字符串
    - 哈哈 # 字符串默认不使用引号表示
    - 'Hello world'  #可以使用双引号或者单引号包裹特殊字符
    - newline
      newline2    #字符串可以拆成多行，每一行会被转化成一个空格
date:
    - 2018-02-17    #日期必须使用ISO 8601格式，即yyyy-MM-dd
datetime: 
    -  2018-02-17T15:02:31+08:00    #时间使用ISO 8601格式，时间和日期之间使用T连接，最后使用+代表时区

```

多行字符串可以使用|保留换行符，也可以使用>折叠换行。

```yaml
this: |
  Foo
  Bar
that: >
  Foo
  Bar
```

转为js代码如下：

```javascript
{ this: 'Foo\nBar\n', that: 'Foo Bar\n' }
```

+表示保留文字块末尾的换行，-表示删除字符串末尾的换行。

```yaml
s1: |
  Foo
 
s2: |+
  Foo
 
 
s3: |-
  Foo
```

转为js代码如下：

```javascript
{ s1: 'Foo\n', s2: 'Foo\n\n\n', s3: 'Foo' }
```

字符串之中可以插入 HTML 标记：

```yaml
message: |
  <p style="color: red">
    段落
  </p>
```

	转成js为：

```javascript
{ message: '<p style="color: red">\n  段落\n</p>\n' }
```

## 3、转换数据格式
允许使用两个感叹号，强制转换数据类型。

```yaml
e: !!str 123
f: !!str true
```

转换js结果同：

```javascript
{ e: '123', f: 'true' }
```

## 4、锚点引用
& 锚点和< span class="marked">* 别名，可以用来引用:

```yaml
defaults: &defaults # 添加锚点
  adapter:  postgres
  host:     localhost

development:
  database: myapp_development
  <<: *defaults # <<表示合并，*引用锚点

test:
  database: myapp_test
  <<: *defaults # <<表示合并，*引用锚点
```

相当于:

```yaml
defaults:
  adapter:  postgres
  host:     localhost

development:
  database: myapp_development
  adapter:  postgres
  host:     localhost

test:
  database: myapp_test
  adapter:  postgres
  host:     localhost
```

	& 用来建立锚点（defaults），<< 表示合并到当前数据，***** 用来引用锚点。

```yaml
- &showell Steve 
- Clark 
- Brian 
- Oren 
- *showell 
```

转为js代码如下:

```javascript
[ 'Steve', 'Clark', 'Brian', 'Oren', 'Steve' ]
```

	这里只是做简单的了解，熟悉了这些基本用法，后续配置一些流水线就能得心应手了。

