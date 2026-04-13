---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 18
title: 判断对象为空的方法
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

判断一个对象是否为空（即没有自身可枚举属性）是 JavaScript 开发中的常见需求。不同场景下对“空”的定义可能不同，通常指对象**没有自有的可枚举属性**，也可能需要进一步考虑不可枚举属性、Symbol 属性或原型链上的属性。

本文将介绍几种常用的判断方法，分析其原理、适用场景及注意事项。

---

## 2. 常用方法

### 2.1 `Object.keys(obj).length === 0`

这是最常用、最直观的方法，返回对象自身**可枚举**属性名的数组。

```javascript
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

console.log(isEmpty({})); // true
console.log(isEmpty({ a: 1 })); // false
console.log(isEmpty([])); // true（数组也是对象，但长度为0）
console.log(isEmpty(new Date())); // false（Date 实例有自身属性吗？实际上 Date 实例没有自身可枚举属性，但 Object.keys 返回 []，因此返回 true？注意：Date 实例没有自身可枚举属性，所以会被判空，这可能不符合预期）
```

**原理**：`Object.keys` 返回对象自身可枚举字符串属性的数组，长度为 0 表示没有可枚举属性。

**优点**：简单直观，性能较好。

**缺点**：

- 只检查可枚举属性，不可枚举属性不影响结果。
- 对于 `Date`、`RegExp` 等内置对象实例，它们可能没有自身可枚举属性，会被判空，但通常业务中不需要将这类对象视为“空对象”。
- 不会检查原型链上的属性。

### 2.2 `Object.getOwnPropertyNames(obj).length === 0`

返回对象自身**所有属性**（包括不可枚举的，不包括 Symbol）的数组。

```javascript
function isEmpty(obj) {
  return Object.getOwnPropertyNames(obj).length === 0;
}

const obj = {};
Object.defineProperty(obj, 'hidden', { value: 1, enumerable: false });
console.log(isEmpty(obj)); // false（因为 getOwnPropertyNames 能获取到不可枚举属性）
```

**适用场景**：需要严格判断对象是否没有任何自身属性（包括不可枚举）。

**缺点**：仍然不包含 Symbol 属性。

### 2.3 `Reflect.ownKeys(obj).length === 0`

返回对象自身**所有属性键**（包括不可枚举属性和 Symbol）的数组。

```javascript
function isEmpty(obj) {
  return Reflect.ownKeys(obj).length === 0;
}

const sym = Symbol('test');
const obj = { [sym]: 1 };
console.log(isEmpty(obj)); // false（因为 Symbol 属性被计入）
```

**适用场景**：需要完整检查对象自身所有属性（包括 Symbol 和不可枚举属性）。

**注意**：仍然不检查原型链。

### 2.4 `for...in` 配合 `hasOwnProperty`

```javascript
function isEmpty(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}
```

**原理**：遍历所有可枚举属性（包括原型链），但用 `hasOwnProperty` 过滤，只检查自身属性。

**优点**：兼容性好（ES3 可用）。

**缺点**：代码稍冗长，且仍只检查可枚举属性。

### 2.5 `JSON.stringify(obj) === '{}'`

```javascript
function isEmpty(obj) {
  return JSON.stringify(obj) === '{}';
}
```

**原理**：将对象转为 JSON 字符串，空对象序列化为 `'{}'`。

**注意**：

- 只适用于“纯数据对象”，且不包含函数、`undefined`、`Symbol` 等无法 JSON 序列化的值。
- 对于包含不可枚举属性、原型链属性的对象，序列化结果可能仍为 `'{}'`。
- 性能较差，不推荐用于大型对象。

### 2.6 使用 `lodash` 的 `_.isEmpty`

Lodash 提供了 `_.isEmpty` 方法，可以判断对象、数组、Map、Set、字符串等是否为空。

```javascript
const _ = require('lodash');
console.log(_.isEmpty({})); // true
console.log(_.isEmpty({ a: 1 })); // false
console.log(_.isEmpty([])); // true
console.log(_.isEmpty([1])); // false
console.log(_.isEmpty('')); // true
console.log(_.isEmpty('abc')); // false
```

**优点**：功能全面，支持多种数据类型，处理边界情况良好。

**缺点**：需要引入第三方库。

---

## 3. 综合考虑与推荐

- **普通业务场景**：使用 `Object.keys(obj).length === 0` 即可，简单且满足大多数需求。
- **需要检测不可枚举属性**：使用 `Object.getOwnPropertyNames(obj).length === 0`。
- **需要检测 Symbol 属性**：使用 `Reflect.ownKeys(obj).length === 0`。
- **需要兼容旧环境（ES3）**：使用 `for...in` + `hasOwnProperty`。
- **需要处理多种数据类型（数组、字符串等）**：使用 `lodash.isEmpty`。
- **注意**：对于 `Date`、`RegExp` 等内置对象实例，`Object.keys` 会返回空数组，可能被误判为空。通常这些对象不是我们想要判断的“空对象”，因此在调用前应确保参数是普通对象。

### 封装通用函数（仅判断普通对象）

```javascript
function isEmptyObject(obj) {
  return (
    obj != null && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0
  );
}
```

---

## 4. 总结

| 方法                            | 检查可枚举属性 | 检查不可枚举   | 检查 Symbol | 检查原型链 | 支持数组/字符串等    | 推荐场景                   |
| ------------------------------- | -------------- | -------------- | ----------- | ---------- | -------------------- | -------------------------- |
| `Object.keys(obj).length === 0` | ✅             | ❌             | ❌          | ❌         | ❌（仅对象）         | 通用简单场景               |
| `Object.getOwnPropertyNames`    | ✅             | ✅             | ❌          | ❌         | ❌                   | 需要忽略不可枚举属性       |
| `Reflect.ownKeys`               | ✅             | ✅             | ✅          | ❌         | ❌                   | 需要包括 Symbol 属性       |
| `for...in + hasOwnProperty`     | ✅             | ❌             | ❌          | ❌         | ❌                   | 老旧环境兼容               |
| `JSON.stringify(obj) === '{}'`  | ✅（仅可枚举） | ❌             | ❌          | ❌         | ❌                   | 纯数据对象，不推荐用于性能 |
| `_.isEmpty(obj)` (Lodash)       | ✅             | ✅（根据类型） | ✅          | ❌         | ✅（数组、字符串等） | 通用生产环境（引入库）     |

**最终建议**：对于普通对象，优先使用 `Object.keys(obj).length === 0`。如果需要更严格的检查（包括不可枚举或 Symbol），使用 `Reflect.ownKeys`。在大型项目中，可以考虑使用 Lodash 的统一方法。
