---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 15
title: Object.fromEntries详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

`Object.fromEntries()` 是一个静态方法，用于将**键值对列表**（如二维数组、`Map` 对象或任何可迭代的键值对集合）转换为一个普通对象。它是 `Object.entries()` 的逆操作。

**语法**

```javascript
Object.fromEntries(iterable);
```

- **`iterable`**：一个可迭代对象，其元素是键值对（例如二维数组 `[[key1, value1], [key2, value2], ...]` 或 `Map` 对象）。

**返回值**：一个新的对象，其属性由 `iterable` 中的键值对决定。

**基本示例**

```javascript
const entries = [
  ['name', 'Alice'],
  ['age', 25],
  ['city', 'Beijing'],
];
const obj = Object.fromEntries(entries);
console.log(obj); // { name: 'Alice', age: 25, city: 'Beijing' }
```

---

## 2. 原理

`Object.fromEntries` 的内部实现遵循 ECMAScript 规范中的 **`ObjectFromEntries`** 抽象操作。大致步骤如下：

1. 创建一个新的空对象 `obj`。
2. 遍历 `iterable` 参数（必须是一个可迭代对象，否则抛出 `TypeError`）。
3. 对于每个迭代到的元素 `entry`：
   - 确保 `entry` 是一个对象（或可转换为对象），并且有 `length` 属性（通常是数组）。
   - 取 `entry[0]` 作为键，`entry[1]` 作为值。
   - 如果键不是字符串或 Symbol，则将其转换为字符串。
   - 使用 `[[Set]]` 操作将键值对设置到 `obj` 上（如果键重复，后面的会覆盖前面的）。
4. 返回 `obj`。

**关键点**：

- 要求 `iterable` 的每个元素必须是一个具有两个元素的“类数组”对象（通常为数组）。
- 键会被转换为字符串（除非是 Symbol）。
- 后面的相同键会覆盖前面的。

---

## 3. 常见应用场景

### 3.1 将二维数组转换为对象

```javascript
const entries = [
  ['a', 1],
  ['b', 2],
  ['c', 3],
];
const obj = Object.fromEntries(entries);
console.log(obj); // { a: 1, b: 2, c: 3 }
```

### 3.2 将 `Map` 转换为对象

`Map` 对象本身是可迭代的键值对集合，可以直接传入。

```javascript
const map = new Map([
  ['x', 10],
  ['y', 20],
  ['z', 30],
]);
const obj = Object.fromEntries(map);
console.log(obj); // { x: 10, y: 20, z: 30 }
```

### 3.3 过滤或转换对象属性（配合 `Object.entries`）

```javascript
const original = { a: 1, b: 2, c: 3, d: 4 };
// 过滤出值大于2的属性
const filtered = Object.fromEntries(Object.entries(original).filter(([key, value]) => value > 2));
console.log(filtered); // { c: 3, d: 4 }

// 转换：将所有值加倍
const doubled = Object.fromEntries(
  Object.entries(original).map(([key, value]) => [key, value * 2]),
);
console.log(doubled); // { a: 2, b: 4, c: 6, d: 8 }
```

### 3.4 从 URL 参数数组构建对象

```javascript
const urlParams = [
  ['name', 'Alice'],
  ['age', '30'],
  ['city', 'NYC'],
];
const paramsObj = Object.fromEntries(urlParams);
console.log(paramsObj); // { name: 'Alice', age: '30', city: 'NYC' }
```

### 3.5 处理其他可迭代的键值对集合

任何遵循 `[key, value]` 格式的可迭代对象都可以：

```javascript
function* generateEntries() {
  yield ['x', 1];
  yield ['y', 2];
}
const obj = Object.fromEntries(generateEntries());
console.log(obj); // { x: 1, y: 2 }
```

---

## 4. 与 `Object.entries` 的关系

- `Object.entries(obj)` 将对象转换为键值对数组。
- `Object.fromEntries(array)` 将键值对数组转换回对象。
- 两者互为逆操作（前提是键值对数组由该对象生成，没有丢失 Symbol 键或不可枚举属性）。

```javascript
const obj = { a: 1, b: 2, c: 3 };
const entries = Object.entries(obj);
const newObj = Object.fromEntries(entries);
console.log(newObj); // { a: 1, b: 2, c: 3 }
console.log(obj === newObj); // false（浅拷贝，新对象与原对象不同）
```

---

## 5. 注意事项

- **键的类型**：`fromEntries` 会将非字符串、非 Symbol 的键强制转换为字符串。
  ```javascript
  const entries = [
    [1, 'one'],
    [true, 'boolean'],
  ];
  console.log(Object.fromEntries(entries)); // { '1': 'one', 'true': 'boolean' }
  ```
- **重复键**：后面的键会覆盖前面的。
  ```javascript
  const entries = [
    ['a', 1],
    ['a', 2],
  ];
  console.log(Object.fromEntries(entries)); // { a: 2 }
  ```
- **参数必须是可迭代对象**：传入非可迭代对象（如普通对象）会抛出 `TypeError`。
  ```javascript
  // Object.fromEntries({ a: 1 }); // TypeError
  ```
- **每个元素必须是长度为 2 的类数组**：如果某个元素没有 `length` 属性或长度不为 2，会抛出错误或产生意外结果。
- **不会复制不可枚举属性或 Symbol 属性**：因为 `Object.entries` 本身不包含这些，所以 `fromEntries` 也无法还原它们。
- **ES2019 引入**，旧环境需要 polyfill。

---

## 6. 对比总结

| 方法                     | 输入类型                              | 输出类型   | 主要用途                       |
| ------------------------ | ------------------------------------- | ---------- | ------------------------------ |
| `Object.fromEntries()`   | 可迭代的键值对（数组、Map、生成器等） | 普通对象   | 将键值对列表转换为对象         |
| `Object.entries()`       | 普通对象                              | 键值对数组 | 将对象转换为可迭代的键值对列表 |
| `new Map(iterable)`      | 可迭代的键值对                        | `Map` 对象 | 创建 Map                       |
| `Object.assign({}, ...)` | 源对象                                | 对象       | 合并对象                       |

---

## 7. 总结

- `Object.fromEntries` 是 `Object.entries` 的逆操作，用于将键值对列表转换为对象。
- 它特别适合与 `Object.entries` 配合，实现对象的过滤、转换等函数式操作。
- 也可用于将 `Map` 或二维数组快速转换为普通对象。
- 注意键的强制字符串转换和重复键覆盖的行为，确保数据符合预期。
