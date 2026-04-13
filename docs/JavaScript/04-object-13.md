---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 13
title: Object.values详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

`Object.values()` 是一个静态方法，返回一个给定对象自身的所有**可枚举属性值**组成的数组。值的顺序与 `Object.keys()` 返回的键的顺序一致（但不包括原型链上的属性值）。

**语法**

```javascript
Object.values(obj);
```

- **`obj`**：要返回其自身可枚举属性值的对象。

**返回值**：一个数组，包含对象自身的所有可枚举属性值。

**基本示例**

```javascript
const obj = { a: 'somestring', b: 42, c: false };
console.log(Object.values(obj)); // ['somestring', 42, false]
```

---

## 2. 原理

`Object.values` 的内部实现类似于 `Object.keys`，但返回的是属性值而非键名。它遵循 ECMAScript 规范中的 **`EnumerableOwnPropertyNames`** 操作，然后映射到值：

1. 将参数 `obj` 转换为对象（原始值会被装箱）。
2. 获取对象的所有**自有可枚举属性**键（字符串键，不包括 Symbol）。
3. 按照与 `Object.keys` 相同的顺序遍历这些键，收集每个键对应的属性值。
4. 返回这些值组成的数组。

**关键点**：

- 不包含原型链上的属性值。
- 不包含不可枚举属性的值。
- 顺序与 `Object.keys` 完全一致。

---

## 3. 属性值的排列顺序

`Object.values` 返回的数组顺序遵循 ECMAScript 规范定义的**属性遍历顺序**。该顺序由属性的类型（数值索引、字符串键、Symbol）以及创建时间决定。具体规则如下：

### 3.1 排序规则（ES2015+）

1. **数值索引属性**（整数索引，如 `'0'`、`'1'`、`'100'`）按**升序**排列。
   - 例如：键 `'2'`、`'10'`、`'1'` 会按 `1`、`2`、`10` 排序。
   - 数值索引是指能被 `Number` 转换且是自然数（包括 0）的属性名。

2. **字符串属性**（非数值键）按**创建时间**（添加顺序）排列。
   - 例如：先添加 `'a'`，后添加 `'b'`，则 `'a'` 在 `'b'` 之前。

3. **Symbol 属性**（`Symbol` 类型的键）按**创建时间**排列，但 **`Object.values` 不包含 Symbol 属性**，所以此规则对 `Object.values` 不适用。

**注意**：数值索引总是排在字符串键之前，无论它们的创建顺序如何。

### 3.2 示例演示

```javascript
const obj = {};
obj[100] = 'hundred';
obj[2] = 'two';
obj[1] = 'one';
obj.name = 'Alice';
obj[0] = 'zero';
obj.age = 25;
console.log(Object.values(obj));
// 输出顺序：数值键升序（0,1,2,100），然后字符串键按添加顺序（name, age）
// 结果：['zero', 'one', 'two', 'hundred', 'Alice', 25]
```

### 3.3 规范参考

ECMAScript 规范中定义了 **`OwnPropertyKeys`** 抽象操作，该操作返回的属性键顺序如下：

- 首先，数值键按升序。
- 然后，字符串键按创建顺序。
- 最后，Symbol 键按创建顺序。

`Object.values` 基于此顺序，但只取字符串键，因此数值键在前，字符串键在后，各自保持上述规则。

### 3.4 注意事项

- **不要依赖顺序做业务逻辑**：虽然规范定义了顺序，但在某些旧环境中可能不一致。建议始终将对象视为无序集合。
- **数值键的判定**：只有正整数（包括 `0`）才被视为数值键，负数和浮点数会被当作普通字符串键。
- **数组**：当对象是数组时，`Object.values` 返回索引对应的值，按索引升序。

```javascript
const arr = ['a', 'b', 'c'];
arr[100] = 'z';
console.log(Object.values(arr)); // 索引0,1,2,100 => ['a','b','c', 'z']
```

---

## 4. 示例

### 4.1 基本用法

```javascript
const person = { name: 'John', age: 30, city: 'New York' };
console.log(Object.values(person)); // ['John', 30, 'New York']
```

### 4.2 数组作为参数

```javascript
const arr = ['a', 'b', 'c'];
console.log(Object.values(arr)); // ['a', 'b', 'c']
```

### 4.3 字符串作为参数

```javascript
console.log(Object.values('foo')); // ['f', 'o', 'o']
```

### 4.4 不可枚举属性被忽略

```javascript
const obj = { visible: 1 };
Object.defineProperty(obj, 'hidden', { value: 2, enumerable: false });
console.log(Object.values(obj)); // [1]
```

---

## 5. 与相关方法的对比

| 方法                                | 返回值类型                | 是否包含继承属性 | 是否包含不可枚举 | 是否包含 Symbol |
| ----------------------------------- | ------------------------- | ---------------- | ---------------- | --------------- |
| `Object.keys(obj)`                  | 属性名数组（字符串）      | 否               | 否               | 否              |
| `Object.values(obj)`                | 属性值数组                | 否               | 否               | 否              |
| `Object.entries(obj)`               | 键值对数组 `[key, value]` | 否               | 否               | 否              |
| `Object.getOwnPropertyNames(obj)`   | 所有属性名（字符串）      | 否               | 是               | 否              |
| `Object.getOwnPropertySymbols(obj)` | Symbol 属性名             | 否               | 是               | 是              |
| `for...in`                          | 可枚举属性名（遍历）      | 是               | 否               | 否              |

---

## 6. 常见应用场景

### 6.1 遍历对象的值

```javascript
const obj = { a: 1, b: 2, c: 3 };
Object.values(obj).forEach((value) => {
  console.log(value);
});
```

### 6.2 将对象值转换为数组并操作（如求和）

```javascript
const scores = { math: 90, english: 85, science: 92 };
const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
console.log(total); // 267
```

### 6.3 判断对象是否为空（值角度）

```javascript
function isEmpty(obj) {
  return Object.values(obj).length === 0;
}
console.log(isEmpty({})); // true
console.log(isEmpty({ a: 1 })); // false
```

### 6.4 提取所有值用于序列化或日志

```javascript
const user = { id: 1, name: 'Alice', role: 'admin' };
console.log(Object.values(user)); // [1, 'Alice', 'admin']
```

### 6.5 与 `Object.keys` 配合，同时处理键和值

```javascript
const obj = { name: 'Alice', age: 25 };
const keys = Object.keys(obj);
const values = Object.values(obj);
console.log(keys, values); // ['name','age'] [ 'Alice', 25 ]
```

---

## 7. 注意事项

- 参数为 `null` 或 `undefined` 时会抛出 `TypeError`。
- 原始值会被装箱：数字、布尔值返回空数组；字符串返回字符数组。
- 只返回自身可枚举属性值，忽略 Symbol 属性值。
- 属性值顺序遵循规范，但不建议依赖顺序做关键业务。
- ES2017 引入，旧环境需要 polyfill。

---

## 8. 总结

- `Object.values` 是获取对象自身可枚举属性值的便捷方法，常用于遍历值、计算聚合等。
- 它与 `Object.keys` 互补，共同提供了操作对象键和值的统一方式。
- 理解属性值的顺序规则（数值键升序、字符串键按创建顺序）有助于预测结果，但不应过度依赖顺序。
- 了解其与 `for...in`、`Object.entries` 的区别，有助于在合适场景选择正确的 API。
