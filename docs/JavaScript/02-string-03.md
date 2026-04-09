---
group:
  title: 【02】js字符串及字符串方法
  order: 2
order: 3
title: 字符串属性及String对象介绍
nav:
  title: JavaScript
  order: 2
---

## 1. 字符串属性

字符串在 JavaScript 中是基本数据类型，但通过**自动装箱**机制，可以临时访问 `String` 对象的方法和属性。字符串本身具有以下固有属性。

### 1.1 `length`

**语法规则**：`string.length`

**参数介绍**：无参数。

**返回值**：返回字符串中 UTF-16 编码单元的数量（即字符个数，注意某些表情符号可能占 2 个编码单元）。

**举例使用**：

```javascript
let greeting = 'Hello, world!';
console.log(greeting.length); // 13

let emojiString = '👋😊';
console.log(emojiString.length); // 4（每个表情占 2 个编码单元）
```

### 1.2 `constructor`

**语法规则**：`string.constructor`

**参数介绍**：无参数。

**返回值**：返回创建字符串实例的构造函数引用。对于原始字符串，通过自动装箱后指向 `String` 构造函数；对于字符串对象，直接指向 `String` 构造函数。

**举例使用**：

```javascript
let strLiteral = 'hello';
console.log(strLiteral.constructor); // function String() { [native code] }

let strObject = new String('hello');
console.log(strObject.constructor); // function String() { [native code] }
```

> **注意**：原始字符串不是对象，但访问 `constructor` 时 JavaScript 会临时将其包装为 `String` 对象，因此也能获得 `constructor` 属性。

---

## 2. String 对象介绍

### 2.1 String 构造函数

`String` 是 JavaScript 的内置构造函数，用于创建字符串对象或执行字符串类型转换。

**语法规则**：

- 作为构造函数：`new String(value)`
- 作为普通函数：`String(value)`

**参数介绍**：`value` — 要转换或包装的值。

**返回值**：

- 使用 `new String(value)` 返回一个 `String` 对象（引用类型）。
- 使用 `String(value)` 返回一个原始字符串值（基本类型）。

**举例使用**：

```javascript
let strObj = new String('Hello, World!');
console.log(strObj); // [String: 'Hello, World!']
console.log(typeof strObj); // "object"

let strPrimitive = String(123);
console.log(strPrimitive); // "123"
console.log(typeof strPrimitive); // "string"
```

### 2.2 String 对象与原始字符串的区别

| 特性         | 原始字符串（字面量）      | String 对象（new String）        |
| ------------ | ------------------------- | -------------------------------- |
| **类型**     | `"string"`                | `"object"`                       |
| **创建方式** | 引号、反引号或 `String()` | `new String()`                   |
| **比较行为** | 值比较                    | 引用比较（不同对象不相等）       |
| **性能**     | 更优（直接存储在栈内存）  | 较慢（堆内存分配）               |
| **使用建议** | 推荐使用                  | 仅在必要时使用（如需要对象特性） |

**举例使用**：

```javascript
let strLiteral = 'hello';
let strObject = new String('hello');

console.log(typeof strLiteral); // "string"
console.log(typeof strObject); // "object"
console.log(strLiteral == strObject); // true（值相等）
console.log(strLiteral === strObject); // false（类型不同）
```

### 2.3 自动装箱机制

当对原始字符串调用方法或读取属性时，JavaScript 会临时将其包装成 `String` 对象，执行完毕后立即销毁该包装对象。这使得原始字符串也能像对象一样使用 `String.prototype` 上的方法。

```javascript
let str = 'hello';
console.log(str.toUpperCase()); // "HELLO"（自动装箱后调用方法）
```

---

## 3. String.prototype 上的常用方法和属性

`String.prototype` 定义了所有字符串实例共享的方法和属性。以下列出最常用的部分（完整方法及详细说明请参见上一章节内容）。

### 3.1 字符访问与编码

| 方法                 | 说明                                  |
| -------------------- | ------------------------------------- |
| `charAt(index)`      | 返回指定索引的字符。                  |
| `charCodeAt(index)`  | 返回指定索引字符的 Unicode 编码。     |
| `codePointAt(index)` | 返回指定索引字符的完整 Unicode 码点。 |
| `at(index)`          | 返回指定索引的字符（支持负数）。      |

### 3.2 查找与判断

| 方法                              | 说明                                        |
| --------------------------------- | ------------------------------------------- |
| `indexOf(searchValue, start)`     | 返回子串首次出现的索引，未找到返回 -1。     |
| `lastIndexOf(searchValue, start)` | 返回子串最后一次出现的索引，未找到返回 -1。 |
| `includes(searchValue, start)`    | 判断是否包含子串。                          |
| `startsWith(searchValue, start)`  | 判断是否以子串开头。                        |
| `endsWith(searchValue, length)`   | 判断是否以子串结尾。                        |
| `search(regexp)`                  | 根据正则匹配，返回索引。                    |
| `match(regexp)`                   | 返回匹配结果数组。                          |
| `matchAll(regexp)`                | 返回所有匹配的迭代器。                      |

### 3.3 截取与分割

| 方法                      | 说明                                   |
| ------------------------- | -------------------------------------- |
| `slice(start, end)`       | 提取子串（支持负数索引）。             |
| `substring(start, end)`   | 提取子串（不支持负数，参数自动交换）。 |
| `substr(start, length)`   | 提取子串（遗留方法，不推荐）。         |
| `split(separator, limit)` | 分割字符串为数组。                     |

### 3.4 拼接与重复

| 方法                      | 说明                   |
| ------------------------- | ---------------------- |
| `concat(str1, str2, ...)` | 连接多个字符串。       |
| `repeat(count)`           | 将字符串重复指定次数。 |

### 3.5 替换与移除

| 方法                           | 说明                   |
| ------------------------------ | ---------------------- |
| `replace(search, newValue)`    | 替换第一个匹配的子串。 |
| `replaceAll(search, newValue)` | 替换所有匹配的子串。   |
| `trim()`                       | 去除首尾空白。         |
| `trimStart()` / `trimLeft()`   | 去除开头空白。         |
| `trimEnd()` / `trimRight()`    | 去除结尾空白。         |

### 3.6 大小写转换

| 方法                  | 说明                     |
| --------------------- | ------------------------ |
| `toLowerCase()`       | 转换为小写。             |
| `toUpperCase()`       | 转换为大写。             |
| `toLocaleLowerCase()` | 根据本地语言转换为小写。 |
| `toLocaleUpperCase()` | 根据本地语言转换为大写。 |

### 3.7 填充与补齐

| 方法                          | 说明                   |
| ----------------------------- | ---------------------- |
| `padStart(targetLen, padStr)` | 从开头填充至目标长度。 |
| `padEnd(targetLen, padStr)`   | 从末尾填充至目标长度。 |

### 3.8 其他方法

| 方法                           | 说明                                  |
| ------------------------------ | ------------------------------------- |
| `valueOf()`                    | 返回字符串的原始值。                  |
| `toString()`                   | 返回字符串的原始值。                  |
| `localeCompare(compareString)` | 比较两个字符串的排序顺序。            |
| `normalize(form)`              | 返回字符串的 Unicode 标准化形式。     |
| `[Symbol.iterator]()`          | 返回字符串的迭代器，支持 `for...of`。 |

### 3.9 原型属性

| 属性     | 说明                 |
| -------- | -------------------- |
| `length` | 字符串长度（只读）。 |

> **注意**：以上所有方法和属性均定义在 `String.prototype` 上，所有字符串实例（包括原始字符串和 String 对象）均可通过原型链访问。

---

## 4. 总结

- 原始字符串虽为基本类型，但通过自动装箱可以访问 `String.prototype` 上的全部方法。
- 字符串的 `length` 属性返回 UTF-16 编码单元数量，注意特殊字符可能占两个单元。
- `constructor` 属性始终指向 `String` 构造函数。
- 推荐使用字符串字面量而非 `new String()`，以获得更好的性能和更直观的类型。
- 所有字符串操作方法均不改变原字符串，而是返回新字符串或其它值。

掌握字符串的属性及 `String` 对象的特点，有助于更高效地处理文本数据。
