---
group:
  title: 【02】js字符串及字符串方法
  order: 2
order: 2
title: 字符串方法
nav:
  title: JavaScript
  order: 2
---

JavaScript 字符串方法用于查找、截取、替换、转换、填充等操作。由于字符串的**不可变性**，所有方法都不会修改原字符串，而是返回一个新字符串或其它值（如索引、布尔值）。

本文按照功能分类，完整介绍所有常用字符串方法。

---

## 1. 字符访问与编码

### 1.1 `charAt()`

**语法规则**：`string.charAt(index)`

**参数介绍**：`index` — 必需。字符在字符串中的下标（从 0 开始）。

**返回值**：返回指定位置的字符。如果 `index` 超出范围，返回空字符串。

**举例使用**：

```javascript
var str = 'HELLO WORLD';
var n = str.charAt(str.length - 1);
console.log(n); // "D"
```

### 1.2 `charCodeAt()`

**语法规则**：`string.charCodeAt(index)`

**参数介绍**：`index` — 必需。字符在字符串中的下标。

**返回值**：返回指定位置字符的 Unicode 编码（0 ~ 65535）。如果 `index` 超出范围，返回 `NaN`。

**举例使用**：

```javascript
var str = 'HELLO WORLD';
var n = str.charCodeAt(str.length - 1);
console.log(n); // 68
```

### 1.3 `codePointAt()`

**语法规则**：`string.codePointAt(index)`

**参数介绍**：`index` — 必需。字符在字符串中的下标。

**返回值**：返回指定位置字符的完整 Unicode 码点（支持大于 `0xFFFF` 的字符）。如果 `index` 超出范围，返回 `undefined`。

**举例使用**：

```javascript
var str = '😀';
var n = str.codePointAt(0);
console.log(n); // 128512
```

### 1.4 `String.fromCharCode()`

**语法规则**：`String.fromCharCode(n1, n2, ..., nX)`

**参数介绍**：`n1, n2, ...` — 必需。一个或多个 Unicode 编码值。

**返回值**：返回由这些 Unicode 编码组成的字符串。

**举例使用**：

```javascript
var n = String.fromCharCode(72, 69, 76, 76, 79);
console.log(n); // "HELLO"
```

### 1.5 `String.fromCodePoint()`

**语法规则**：`String.fromCodePoint(n1, n2, ..., nX)`

**参数介绍**：`n1, n2, ...` — 必需。一个或多个 Unicode 码点。

**返回值**：返回由这些 Unicode 码点组成的字符串。

**举例使用**：

```javascript
var n = String.fromCodePoint(128512);
console.log(n); // "😀"
```

### 1.6 `at()`

**语法规则**：`string.at(index)`

**参数介绍**：`index` — 必需。字符位置索引（支持负数，-1 表示最后一个字符）。

**返回值**：返回指定位置的字符。如果索引超出范围，返回 `undefined`。

**举例使用**：

```javascript
var str = 'HELLO';
console.log(str.at(-1)); // "O"
console.log(str.at(10)); // undefined
```

---

## 2. 查找与判断

### 2.1 `indexOf()`

**语法规则**：`string.indexOf(searchvalue, start)`

**参数介绍**：

- `searchvalue` — 必需。要检索的子字符串。
- `start` — 可选。开始检索的位置，默认为 0。

**返回值**：返回子字符串第一次出现的索引，未找到返回 -1。

**举例使用**：

```javascript
var str = 'Hello world, welcome to the universe.';
console.log(str.indexOf('e')); // 1
console.log(str.indexOf('z')); // -1
```

### 2.2 `lastIndexOf()`

**语法规则**：`string.lastIndexOf(searchvalue, start)`

**参数介绍**：

- `searchvalue` — 必需。要检索的子字符串。
- `start` — 可选。开始检索的位置（从后向前），默认为 `string.length - 1`。

**返回值**：返回子字符串最后一次出现的索引，未找到返回 -1。

**举例使用**：

```javascript
var str = 'i love China hello my lover';
console.log(str.lastIndexOf('o')); // 23
console.log(str.lastIndexOf('o', 10)); // 3
```

### 2.3 `includes()`

**语法规则**：`string.includes(searchvalue, start)`

**参数介绍**：

- `searchvalue` — 必需。要查找的子字符串。
- `start` — 可选。开始查找的位置，默认为 0。

**返回值**：如果包含子字符串返回 `true`，否则返回 `false`。

**举例使用**：

```javascript
const str = 'hello world';
console.log(str.includes('he')); // true
console.log(str.includes('he', 3)); // false
```

### 2.4 `startsWith()`

**语法规则**：`string.startsWith(searchvalue, start)`

**参数介绍**：

- `searchvalue` — 必需。要查找的子字符串。
- `start` — 可选。开始查找的位置，默认为 0。

**返回值**：如果字符串以指定子字符串开头返回 `true`，否则返回 `false`。

**举例使用**：

```javascript
const str = 'zjh happy everyday';
console.log(str.startsWith('zjh')); // true
console.log(str.startsWith('zjh', 1)); // false
```

### 2.5 `endsWith()`

**语法规则**：`string.endsWith(searchvalue, length)`

**参数介绍**：

- `searchvalue` — 必需。要查找的子字符串。
- `length` — 可选。设置字符串的长度（即在此长度内搜索），默认为原字符串长度。

**返回值**：如果字符串以指定子字符串结尾返回 `true`，否则返回 `false`。

**举例使用**：

```javascript
var str = 'To be, or not to be, that is the question.';
console.log(str.endsWith('question.')); // true
console.log(str.endsWith('to be')); // false
console.log(str.endsWith('to be', 19)); // true
```

### 2.6 `search()`

**语法规则**：`string.search(regexp)`

**参数介绍**：`regexp` — 必需。正则表达式对象。

**返回值**：返回第一个匹配项的索引，未找到返回 -1。

**举例使用**：

```javascript
var str = 'Hello 123 world';
console.log(str.search(/\d+/)); // 6
```

### 2.7 `match()`

**语法规则**：`string.match(regexp)`

**参数介绍**：`regexp` — 必需。正则表达式对象。

**返回值**：返回匹配结果数组（如果正则带有 `g` 标志则返回所有匹配，否则返回第一个匹配及捕获组），未匹配返回 `null`。

**举例使用**：

```javascript
var str = 'The rain in SPAIN stays mainly in the plain';
console.log(str.match(/ain/g)); // ["ain", "ain", "ain"]
```

### 2.8 `matchAll()`

**语法规则**：`string.matchAll(regexp)`

**参数介绍**：`regexp` — 必需。正则表达式对象（必须带有 `g` 标志）。

**返回值**：返回一个迭代器，包含所有匹配结果（包括捕获组）。

**举例使用**：

```javascript
var str = 'test1 test2';
var matches = str.matchAll(/test(\d)/g);
for (const match of matches) {
  console.log(match[0], match[1]);
}
// "test1" "1"
// "test2" "2"
```

---

## 3. 截取与分割

### 3.1 `slice()`

**语法规则**：`string.slice(start, end)`

**参数介绍**：

- `start` — 必需。开始提取的索引（支持负数）。
- `end` — 可选。结束提取的索引（不包括），默认为字符串长度。

**返回值**：返回提取的新字符串。

**举例使用**：

```javascript
var str = 'Hello world';
console.log(str.slice(6, 11)); // "world"
console.log(str.slice(-5)); // "world"
```

### 3.2 `substring()`

**语法规则**：`string.substring(start, end)`

**参数介绍**：

- `start` — 必需。开始提取的索引（负数视为 0）。
- `end` — 可选。结束提取的索引（不包括），默认为字符串长度。

**返回值**：返回提取的新字符串。

**举例使用**：

```javascript
var str = 'Hello world';
console.log(str.substring(6, 11)); // "world"
console.log(str.substring(11, 6)); // "world"（自动交换参数）
console.log(str.substring(-3, 5)); // "Hello"（-3 视为 0）
```

### 3.3 `substr()`（遗留方法，不推荐）

**语法规则**：`string.substr(start, length)`

**参数介绍**：

- `start` — 必需。开始提取的索引（支持负数）。
- `length` — 可选。提取的字符数，默认为到字符串末尾。

**返回值**：返回提取的新字符串。

**举例使用**：

```javascript
var str = 'Hello world';
console.log(str.substr(6, 5)); // "world"
console.log(str.substr(-5, 5)); // "world"
```

### 3.4 `split()`

**语法规则**：`string.split(separator, limit)`

**参数介绍**：

- `separator` — 必需。指定分隔符（字符串或正则表达式）。
- `limit` — 可选。限制返回数组的最大长度。

**返回值**：返回由子字符串组成的数组。

**举例使用**：

```javascript
var str = 'a,b,c,d';
console.log(str.split(',')); // ["a", "b", "c", "d"]
console.log(str.split(',', 2)); // ["a", "b"]
console.log('hello'.split('')); // ["h","e","l","l","o"]
```

---

## 4. 拼接与重复

### 4.1 `concat()`

**语法规则**：`string.concat(string1, string2, ..., stringX)`

**参数介绍**：`string1, string2, ...` — 必需。要连接的一个或多个字符串。

**返回值**：返回连接后的新字符串。

**举例使用**：

```javascript
var str1 = 'Hello ';
var str2 = 'world!';
var str3 = ' Have a nice day!';
var n = str1.concat(str2, str3);
console.log(n); // "Hello world! Have a nice day!"
```

### 4.2 `repeat()`

**语法规则**：`string.repeat(count)`

**参数介绍**：`count` — 必需。重复次数（非负整数）。

**返回值**：返回重复指定次数后的新字符串。

**举例使用**：

```javascript
const str = 'zjh';
console.log(str.repeat(2)); // "zjhzjh"
console.log(str); // "zjh"（原字符串未变）
```

---

## 5. 替换与移除

### 5.1 `replace()`

**语法规则**：`string.replace(searchvalue, newvalue)`

**参数介绍**：

- `searchvalue` — 必需。要替换的子字符串或正则表达式。
- `newvalue` — 必需。替换后的字符串或函数。

**返回值**：返回替换后的新字符串（只替换第一个匹配）。

**举例使用**：

```javascript
var str = 'Hello world, hello';
console.log(str.replace('hello', 'hi')); // "Hello world, hi"
console.log(str.replace(/hello/g, 'hi')); // "Hello world, hi"
```

### 5.2 `replaceAll()`

**语法规则**：`string.replaceAll(searchvalue, newvalue)`

**参数介绍**：

- `searchvalue` — 必需。要替换的子字符串或正则表达式（正则必须带有 `g` 标志）。
- `newvalue` — 必需。替换后的字符串或函数。

**返回值**：返回替换所有匹配后的新字符串。

**举例使用**：

```javascript
var str = 'Hello world, hello';
console.log(str.replaceAll('hello', 'hi')); // "Hello world, hi"
```

### 5.3 `trim()`

**语法规则**：`string.trim()`

**参数介绍**：无参数。

**返回值**：返回去除首尾空白字符后的新字符串。

**举例使用**：

```javascript
var str = '  hello world  ';
console.log(str.trim()); // "hello world"
```

### 5.4 `trimStart()` / `trimLeft()`

**语法规则**：`string.trimStart()` 或 `string.trimLeft()`

**参数介绍**：无参数。

**返回值**：返回去除开头空白字符后的新字符串。

**举例使用**：

```javascript
var str = '  hello world  ';
console.log(str.trimStart()); // "hello world  "
```

### 5.5 `trimEnd()` / `trimRight()`

**语法规则**：`string.trimEnd()` 或 `string.trimRight()`

**参数介绍**：无参数。

**返回值**：返回去除结尾空白字符后的新字符串。

**举例使用**：

```javascript
var str = '  hello world  ';
console.log(str.trimEnd()); // "  hello world"
```

---

## 6. 大小写转换

### 6.1 `toLowerCase()`

**语法规则**：`string.toLowerCase()`

**参数介绍**：无参数。

**返回值**：返回转换为小写的新字符串。

**举例使用**：

```javascript
const str = 'Zjh Be Great';
console.log(str.toLowerCase()); // "zjh be great"
```

### 6.2 `toUpperCase()`

**语法规则**：`string.toUpperCase()`

**参数介绍**：无参数。

**返回值**：返回转换为大写的新字符串。

**举例使用**：

```javascript
const str = 'Zjh Trying Be Better';
console.log(str.toUpperCase()); // "ZJH TRYING BE BETTER"
```

### 6.3 `toLocaleLowerCase()`

**语法规则**：`string.toLocaleLowerCase(locale)`

**参数介绍**：`locale` — 可选。指定语言环境（如 `'tr'` 表示土耳其语），默认为主机环境。

**返回值**：返回根据本地语言规则转换为小写的新字符串。

**举例使用**：

```javascript
const str = 'I Am Hero';
console.log(str.toLocaleLowerCase()); // "i am hero"
```

### 6.4 `toLocaleUpperCase()`

**语法规则**：`string.toLocaleUpperCase(locale)`

**参数介绍**：`locale` — 可选。指定语言环境，默认为主机环境。

**返回值**：返回根据本地语言规则转换为大写的新字符串。

**举例使用**：

```javascript
const str = 'i am hero';
console.log(str.toLocaleUpperCase()); // "I AM HERO"
```

---

## 7. 填充与补齐

### 7.1 `padStart()`

**语法规则**：`string.padStart(targetLength, padString)`

**参数介绍**：

- `targetLength` — 必需。补齐后的目标长度。
- `padString` — 可选。用于填充的字符串，默认为空格。

**返回值**：返回从开头填充后的新字符串。

**举例使用**：

```javascript
var str = '5';
console.log(str.padStart(3, '0')); // "005"
```

### 7.2 `padEnd()`

**语法规则**：`string.padEnd(targetLength, padString)`

**参数介绍**：

- `targetLength` — 必需。补齐后的目标长度。
- `padString` — 可选。用于填充的字符串，默认为空格。

**返回值**：返回从末尾填充后的新字符串。

**举例使用**：

```javascript
var str = '5';
console.log(str.padEnd(3, '0')); // "500"
```

---

## 8. 其他方法

### 8.1 `valueOf()`

**语法规则**：`string.valueOf()`

**参数介绍**：无参数。

**返回值**：返回 String 对象的原始字符串值。

**举例使用**：

```javascript
const str = 'zjh';
console.log(str.valueOf()); // "zjh"
```

### 8.2 `toString()`

**语法规则**：`string.toString()`

**参数介绍**：无参数。

**返回值**：返回 String 对象的字符串表示。

**举例使用**：

```javascript
const num = 123;
console.log(num.toString()); // "123"
console.log(typeof num.toString()); // "string"
```

### 8.3 `localeCompare()`

**语法规则**：`string.localeCompare(compareString, locales, options)`

**参数介绍**：

- `compareString` — 必需。要比较的字符串。
- `locales` — 可选。指定语言环境。
- `options` — 可选。配置比较行为（如是否忽略大小写等）。

**返回值**：返回一个数字：若原字符串排在比较字符串之前返回负数，之后返回正数，相等返回 0。

**举例使用**：

```javascript
var a = 'apple';
var b = 'banana';
console.log(a.localeCompare(b)); // -1（"apple" 在 "banana" 之前）
```

### 8.4 `normalize()`

**语法规则**：`string.normalize(form)`

**参数介绍**：`form` — 可选。Unicode 标准化形式：`"NFC"`、`"NFD"`、`"NFKC"`、`"NFKD"`，默认为 `"NFC"`。

**返回值**：返回字符串的 Unicode 标准化形式。

**举例使用**：

```javascript
var str1 = '\u00F1'; // "ñ"
var str2 = 'n\u0303'; // "ñ"（组合形式）
console.log(str1 === str2); // false
console.log(str1.normalize() === str2.normalize()); // true
```
