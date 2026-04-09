---
group:
  title: 【02】js字符串及字符串方法
  order: 2
order: 4
title: 字符串转数组方法
nav:
  title: JavaScript
  order: 2
---

在 JavaScript 中，将字符串转换为数组是一项常见操作。本文介绍几种常用方法，包括 `split()`、扩展运算符、`Array.from()` 和 `Object.assign()` 结合数组构造函数等，并分析各自适用场景。

---

## 1. 使用 `split()` 方法

**语法规则**：`string.split(separator, limit)`

**参数介绍**：

- `separator` — 必需。指定分隔符（字符串或正则表达式）。如果传入空字符串 `''`，则每个字符都会被分割为数组元素。
- `limit` — 可选。限制返回数组的最大长度。

**返回值**：返回由子字符串组成的数组。

**举例使用**：

```javascript
let str = 'Hello';
let str1 = 'Hello,World';

let array1 = str.split(''); // 按照每个字符分割
console.log(array1); // [ 'H', 'e', 'l', 'l', 'o' ]

let array2 = str1.split(','); // 使用逗号作为分隔符
console.log(array2); // [ 'Hello', 'World' ]
```

---

## 2. 使用扩展运算符 `...`

**语法规则**：`[...string]`

**参数介绍**：无（扩展运算符直接作用于可迭代对象）。

**返回值**：返回一个新数组，包含字符串的每个字符作为单独元素。

**举例使用**：

```javascript
let str = 'Hello';
let array = [...str];
console.log(array); // [ 'H', 'e', 'l', 'l', 'o' ]
```

---

## 3. 使用 `Array.from()` 方法

**语法规则**：`Array.from(string, mapFn, thisArg)`

**参数介绍**：

- `string` — 必需。要转换的字符串（可迭代对象）。
- `mapFn` — 可选。对每个元素执行的映射函数。
- `thisArg` — 可选。执行 `mapFn` 时的 `this` 值。

**返回值**：返回一个新数组，包含字符串的每个字符作为单独元素。

**举例使用**：

```javascript
let str = 'Hello';
let array = Array.from(str);
console.log(array); // [ 'H', 'e', 'l', 'l', 'o' ]
```

---

## 4. 使用 `Object.assign()` 结合 `Array()`

**语法规则**：`Object.assign([], string)`

**参数介绍**：

- `[]` — 目标数组（空数组）。
- `string` — 源字符串（将被复制到目标数组中）。

**返回值**：返回一个填充了字符串字符的新数组。

**举例使用**：

```javascript
let str = 'Hello';
let array = Object.assign([], str);
console.log(array); // [ 'H', 'e', 'l', 'l', 'o' ]
```

> **注意**：这种方法相对复杂，且不如其他方法直观，通常不推荐作为首选方案。

---

## 5. 总结

| 方法              | 适用场景                       | 优点                         | 缺点                                       |
| ----------------- | ------------------------------ | ---------------------------- | ------------------------------------------ |
| `split('')`       | 按字符拆分，或按指定分隔符拆分 | 灵活，支持复杂分隔符（正则） | 空字符串分隔符可能在某些旧环境中表现不一致 |
| 扩展运算符 `...`  | 按字符拆分                     | 简洁、直观，性能较好         | 只能按字符拆分，不能指定分隔符             |
| `Array.from()`    | 按字符拆分，并可选映射处理     | 功能强大，可同时进行转换     | 语法略长                                   |
| `Object.assign()` | 按字符拆分                     | 实现方式独特                 | 不直观，性能差，不推荐                     |

**推荐做法**：

- 按指定分隔符分割字符串 → 使用 `split()`。
- 将字符串每个字符转为数组元素 → 使用 `[...str]` 或 `Array.from(str)`。
- 避免使用 `Object.assign([], str)` 方式。

掌握这些方法可以更灵活地处理字符串与数组之间的转换，满足不同业务需求。
