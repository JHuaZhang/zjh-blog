---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 7
title: getOwnPropertyNames与getOwnPropertySymbols详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

`Object.getOwnPropertyNames` 和 `Object.getOwnPropertySymbols` 是用于获取对象**自有属性**键的两个方法。前者返回字符串类型的属性名（包括不可枚举），后者返回 `Symbol` 类型的属性键。两者都**不包含继承属性**，且都基于规范中的 `[[OwnPropertyKeys]]` 内部操作。

---

## 2. Object.getOwnPropertyNames

### 2.1 定义与语法

`Object.getOwnPropertyNames()` 方法返回一个由指定对象的所有**自有属性**组成的数组，包括**不可枚举**的属性，但**不包括** `Symbol` 类型的属性。

```javascript
Object.getOwnPropertyNames(obj)
```

- **`obj`**：要获取自有属性名称的对象。
- **返回值**：一个字符串数组，包含 `obj` 的所有自有属性名（不含 `Symbol`）。

### 2.2 原理

`Object.getOwnPropertyNames` 的内部机制遵循 ECMAScript 规范中的 **`[[OwnPropertyKeys]]`** 抽象操作：

1. 将参数 `obj` 转换为对象类型（原始值会被装箱）。
2. 调用对象内部的 `[[OwnPropertyKeys]]` 方法，获取一个包含所有自有属性键的列表（包括字符串和 `Symbol`）。
3. 从列表中过滤掉所有 `Symbol` 类型的键，只保留字符串键。
4. 返回这些字符串键组成的数组。

该过程**不遍历原型链**，且不会跳过不可枚举的字符串属性。

### 2.3 示例

```javascript
const obj = { a: 1, b: 2 };
Object.defineProperty(obj, 'invisible', {
  value: 'hidden',
  enumerable: false   // 不可枚举
});
console.log(Object.getOwnPropertyNames(obj)); // ["a", "b", "invisible"]
console.log(Object.keys(obj));                // ["a", "b"]（不可枚举被忽略）
```

### 2.4 特性与用途

- **获取不可枚举属性**：能够获取到 `enumerable: false` 的属性，适合需要全面检查对象属性的场景。
- **健壮的对象属性迭代**：相比 `for...in`（包含继承的可枚举属性）和 `Object.keys()`（仅自有可枚举属性），此方法更完整。
- **调试和对象探索**：在调试时，可以获取更完整的属性列表。

### 2.5 应用场景示例

**场景1：深度克隆对象（保留不可枚举属性）**

普通的 `Object.assign` 或扩展运算符只会复制可枚举属性。若需要完整克隆对象（包括不可枚举属性），可以结合 `getOwnPropertyNames` 和 `getOwnPropertyDescriptor`。

```javascript
function deepClone(obj) {
  const clone = Object.create(Object.getPrototypeOf(obj));
  const propNames = Object.getOwnPropertyNames(obj);
  for (const name of propNames) {
    const desc = Object.getOwnPropertyDescriptor(obj, name);
    Object.defineProperty(clone, name, desc);
  }
  return clone;
}

const original = { visible: 1 };
Object.defineProperty(original, 'hidden', { value: 2, enumerable: false });
const cloned = deepClone(original);
console.log(cloned);                    // { visible: 1 }
console.log(Object.getOwnPropertyNames(cloned)); // ["visible", "hidden"]
```

**场景2：调试时查看对象的所有自有属性**

在控制台快速查看对象自身属性（包括不可枚举的），便于调试。

```javascript
function inspect(obj) {
  const props = Object.getOwnPropertyNames(obj);
  console.log('自有属性（含不可枚举）:', props);
}
```

### 2.6 注意事项

- **不包括 `Symbol` 属性**：如需获取 `Symbol` 键，请使用 `Object.getOwnPropertySymbols()`。
- **兼容性**：ES5 引入，广泛支持（IE9+）。
- **顺序不确定**：返回数组的顺序在规范中未定义，不应依赖。

---

## 3. Object.getOwnPropertySymbols

### 3.1 定义与语法

`Object.getOwnPropertySymbols()` 方法（ES6 引入）返回一个数组，包含给定对象自身的所有 **`Symbol` 类型属性**的键。

```javascript
Object.getOwnPropertySymbols(obj)
```

- **`obj`**：要获取 `Symbol` 属性键的对象。
- **返回值**：一个包含所有自身 `Symbol` 键的数组；若无则返回空数组。

### 3.2 原理

同样基于 `[[OwnPropertyKeys]]` 内部操作：

1. 将 `obj` 转换为对象。
2. 调用 `[[OwnPropertyKeys]]` 获取所有自有属性键列表。
3. 从列表中过滤掉所有**非 `Symbol`** 的键（即只保留 `Symbol` 类型）。
4. 返回这些 `Symbol` 键组成的数组。

该方法不会遍历原型链，且无论 `Symbol` 属性是否可枚举，都会被包含。

### 3.3 示例

```javascript
const sym1 = Symbol('foo');
const sym2 = Symbol('bar');
const obj = {
  [sym1]: 'value1',
  [sym2]: 'value2',
  normal: 'value3'
};
console.log(Object.getOwnPropertySymbols(obj)); // [Symbol(foo), Symbol(bar)]
```

### 3.4 特性与用途

- **获取 `Symbol` 属性**：`Symbol` 属性不会出现在 `for...in`、`Object.keys()` 或 `Object.getOwnPropertyNames()` 中，此方法是唯一直接获取所有 `Symbol` 键的官方途径。
- **模拟私有属性**：利用 `Symbol` 不被常规枚举方法发现的特性，可以实现一定程度的属性隐藏。
- **元编程**：与 `Reflect` API 配合，可以更精细地操作对象属性。

### 3.5 应用场景示例

**场景1：使用 Symbol 作为私有属性**

将不希望被外部轻易访问的属性用 `Symbol` 作为键，然后通过 `getOwnPropertySymbols` 在内部访问。

```javascript
const _private = Symbol('private');
class MyClass {
  constructor(value) {
    this[_private] = value;
  }
  getPrivate() {
    return this[_private];
  }
}
const inst = new MyClass('secret');
console.log(Object.keys(inst));                 // []
console.log(Object.getOwnPropertyNames(inst));  // []
console.log(Object.getOwnPropertySymbols(inst)); // [Symbol(private)]
console.log(inst.getPrivate());                 // 'secret'
```

**场景2：序列化时排除某些 Symbol 属性**

如果需要自定义序列化行为，可以识别特定的 `Symbol` 键并排除。

```javascript
const internal = Symbol('internal');
const data = {
  name: 'Alice',
  [internal]: 'do not serialize'
};
function serialize(obj) {
  const symbols = Object.getOwnPropertySymbols(obj);
  const filtered = {};
  for (let key in obj) {
    filtered[key] = obj[key];
  }
  // 排除 internal symbol
  return JSON.stringify(filtered);
}
console.log(serialize(data)); // {"name":"Alice"}
```

### 3.6 注意事项

- 仅返回**自身**的 `Symbol` 键，不包含继承的。
- 若无 `Symbol` 属性，返回空数组。
- 可使用 `Symbol.for()` 和 `Symbol.keyFor()` 管理全局 `Symbol`。
- 兼容性：ES6 引入，不支持 IE，现代浏览器和 Node.js 可用。

---

## 4. 对比总结

| 特性                 | `Object.getOwnPropertyNames`                | `Object.getOwnPropertySymbols`                |
| -------------------- | ------------------------------------------- | ---------------------------------------------- |
| **返回的属性类型**   | 字符串键（包括不可枚举）                    | `Symbol` 键（无论是否可枚举）                  |
| **是否包含不可枚举** | 是                                          | 是                                             |
| **是否包含继承属性** | 否                                          | 否                                             |
| **返回值示例**       | `["a", "b", "invisible"]`                   | `[Symbol(foo), Symbol(bar)]`                   |
| **引入版本**         | ES5                                         | ES6 (ES2015)                                   |
| **典型用途**         | 获取所有字符串自有键，调试、克隆            | 获取所有 `Symbol` 自有键，元编程、模拟私有属性 |
| **兼容性**           | 广泛（IE9+）                                | 现代浏览器和 Node.js，不支持 IE               |

**补充说明**：两者都基于同一内部操作 `[[OwnPropertyKeys]]`，只是过滤的键类型不同。如果希望**同时获取所有自有键**（字符串 + `Symbol`），可以使用 `Reflect.ownKeys(obj)`，它返回一个包含所有键的数组。

```javascript
const allKeys = Reflect.ownKeys(obj); // 包含字符串键和 Symbol 键
```

---

## 5. 总结

- `Object.getOwnPropertyNames` 用于获取对象的所有**字符串**自有属性名（包括不可枚举），适合需要完整枚举对象自身字符串属性的场景，如深度克隆、调试。
- `Object.getOwnPropertySymbols` 用于获取对象的所有 **`Symbol`** 自有属性键，是操作 `Symbol` 属性的必备工具，适合模拟私有属性、元编程等场景。
- 理解这两个方法及其与 `Object.keys`、`for...in`、`Reflect.ownKeys` 的区别，有助于精确控制对象的属性访问和元编程。
