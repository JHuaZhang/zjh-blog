---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 16
title: Object.is详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

`Object.is()` 是一个用于比较两个值是否相等的方法。它提供了与严格相等运算符 `===` 类似但更精确的语义，主要解决了 `===` 在处理 `NaN` 和 `-0` / `+0` 时的特殊行为问题。

**语法**

```javascript
Object.is(value1, value2);
```

- **`value1`**：第一个比较值。
- **`value2`**：第二个比较值。

**返回值**：布尔值，若两个值相同则返回 `true`，否则 `false`。

**基本示例**

```javascript
console.log(Object.is(25, 25)); // true
console.log(Object.is('foo', 'foo')); // true
console.log(Object.is(NaN, NaN)); // true（与 === 不同）
console.log(Object.is(0, -0)); // false（与 === 不同）
console.log(Object.is([], [])); // false（不同引用）
```

---

## 2. 原理

`Object.is` 的内部实现基于 ECMAScript 规范中的 **SameValue** 抽象比较算法。该算法与 **SameValueZero**（用于 `Map`、`Set` 等）和 **严格相等**（`===`）略有不同。

SameValue 算法步骤（简化）：

1. 如果 `value1` 与 `value2` 是同一对象引用（严格相等），返回 `true`。
2. 如果两者都是 `undefined`，返回 `true`。
3. 如果两者都是 `null`，返回 `true`。
4. 如果两者都是 `true` 或都是 `false`，返回 `true`。
5. 如果两者都是数字：
   - 如果两者都是 `NaN`，返回 `true`（关键区别）。
   - 如果一个是 `+0` 另一个是 `-0`，返回 `false`（关键区别）。
   - 否则，如果数值相等，返回 `true`。
6. 如果两者都是字符串且字符序列完全相同，返回 `true`。
7. 否则返回 `false`。

**关键点**：

- `NaN` 等于 `NaN`。
- `+0` 不等于 `-0`。
- 其他情况与 `===` 基本一致。

---

## 3. 与 `===` 的对比

| 比较场景                  | `===` 结果 | `Object.is` 结果 | 说明                                    |
| ------------------------- | ---------- | ---------------- | --------------------------------------- |
| `NaN === NaN`             | `false`    | `true`           | `===` 中 `NaN` 不自等，`Object.is` 修正 |
| `+0 === -0`               | `true`     | `false`          | `===` 视两者相等，`Object.is` 区分      |
| `0 === 0`                 | `true`     | `true`           | 一致                                    |
| `'foo' === 'foo'`         | `true`     | `true`           | 一致                                    |
| `{} === {}`               | `false`    | `false`          | 一致（不同引用）                        |
| `undefined === undefined` | `true`     | `true`           | 一致                                    |
| `null === null`           | `true`     | `true`           | 一致                                    |

**总结**：`Object.is` 在 `NaN` 和 `-0` / `+0` 的比较上比 `===` 更符合“相同值”的直觉，其他情况行为相同。

---

## 4. 应用场景

### 4.1 判断是否为 `NaN`

```javascript
function isNaNValue(value) {
  return Object.is(value, NaN);
}
console.log(isNaNValue(NaN)); // true
console.log(isNaNValue(0 / 0)); // true
console.log(isNaNValue('NaN')); // false
```

### 4.2 区分 `0` 和 `-0`（如符号方向的数学计算）

```javascript
function isPositiveZero(value) {
  return Object.is(value, 0);
}
console.log(isPositiveZero(0)); // true
console.log(isPositiveZero(-0)); // false
```

### 4.3 在自定义相等性逻辑中使用（如 `Map` / `Set` 无法自定义比较时）

```javascript
const unique = (arr, comparator = Object.is) => {
  return arr.reduce((acc, val) => {
    if (!acc.some((item) => comparator(item, val))) acc.push(val);
    return acc;
  }, []);
};
const arr = [0, -0, NaN, NaN];
console.log(unique(arr)); // [0, -0, NaN]（使用 Object.is 区分 0 和 -0）
```

### 4.4 实现更严格的缓存键（区分 `0` 和 `-0`）

```javascript
const cache = new Map();
function getCacheKey(a, b) {
  return Object.is(a, b) ? `${a}__${b}` : null;
}
```

### 4.5 用于库或框架的内部比较（如 React 的 `Object.is` 用于 state 更新判定）

React 的 `shouldComponentUpdate` 或 `PureComponent` 内部使用 `Object.is` 进行浅比较，以确保 `NaN` 不会错误地触发更新。

---

## 5. 注意事项

- 对于绝大多数场景，`===` 足够使用，无需刻意改用 `Object.is`。
- `Object.is` 不会进行类型转换，与 `===` 相同。
- `Object.is` 的性能略低于 `===`，但差异可忽略。
- ES6 引入，旧环境需要 polyfill（通常可自行实现：`Object.is = (a, b) => (a === b) || (Number.isNaN(a) && Number.isNaN(b))` 等）。

---

## 6. 对比总结

| 方法        | 类型转换 | 处理 `NaN` | 区分 `+0`/`-0` | 引用比较                    |
| ----------- | -------- | ---------- | -------------- | --------------------------- |
| `==`        | 是       | `false`    | `true`         | 对于对象，引用相同才 `true` |
| `===`       | 否       | `false`    | `true`         | 对于对象，引用相同才 `true` |
| `Object.is` | 否       | `true`     | `false`        | 对于对象，引用相同才 `true` |

---

## 7. 总结

- `Object.is` 是一种更精确的值比较方法，修正了 `NaN` 不自等和 `+0` / `-0` 被视为相等的特殊情况。
- 它常用于需要精确区分符号零或检测 `NaN` 的场景，以及作为库内部的相等性比较基础。
- 在普通业务代码中，`===` 依然是最常用且足够的选择；但了解 `Object.is` 有助于理解 JavaScript 中的“相同值”语义。
