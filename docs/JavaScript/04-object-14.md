---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 14
title: Object.entries详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

`Object.entries()` 是一个静态方法，返回一个给定对象自身的所有**可枚举属性**的键值对数组。每个键值对是一个由 `[key, value]` 组成的数组。顺序与 `Object.keys()` 或 `for...in` 循环（不包含原型链属性）一致。

**语法**

```javascript
Object.entries(obj)
```

- **`obj`**：要返回其自身可枚举属性键值对的对象。

**返回值**：一个二维数组，其中每个子数组是 `[key, value]` 键值对。

**基本示例**

```javascript
const obj = { a: 'somestring', b: 42, c: false };
console.log(Object.entries(obj));
// [ ['a', 'somestring'], ['b', 42], ['c', false] ]
```

---

## 2. 原理

`Object.entries` 的内部实现结合了 `Object.keys` 和 `Object.values` 的功能：

1. 将参数 `obj` 转换为对象（原始值会被装箱）。
2. 获取对象的所有**自有可枚举属性**键（字符串键，不包括 Symbol），顺序与 `Object.keys` 相同。
3. 遍历这些键，为每个键构建一个 `[key, value]` 数组。
4. 返回这些数组组成的数组。

**关键点**：
- 只包含对象自身的可枚举属性，不包含原型链属性。
- 不包含不可枚举属性，也不包含 Symbol 键。
- 顺序规则与 `Object.keys` / `Object.values` 完全一致。

---

## 3. 属性键值对的排列顺序

顺序规则与 `Object.keys` 完全相同，详见 `Object.keys` 或 `Object.values` 文档。总结如下：

- **数值索引属性**（整数索引，如 `'0'`、`'1'`、`'100'`）按**升序**排列。
- **字符串属性**（非数值键）按**创建时间**（添加顺序）排列。
- **Symbol 属性**不会被包含。

**示例**：

```javascript
const obj = {};
obj[100] = 'hundred';
obj[2] = 'two';
obj[1] = 'one';
obj.name = 'Alice';
obj[0] = 'zero';
obj.age = 25;
console.log(Object.entries(obj));
// 输出顺序：数值键升序（0,1,2,100），然后字符串键按添加顺序（name, age）
// 结果：
// [ ['0','zero'], ['1','one'], ['2','two'], ['100','hundred'], ['name','Alice'], ['age',25] ]
```

---

## 4. 常见应用场景

### 4.1 将对象转换为 `Map`

`Map` 构造函数接受一个可迭代的键值对数组，`Object.entries` 天然适配。

```javascript
const fruitColors = { apple: 'red', banana: 'yellow', cherry: 'darkred' };
const fruitMap = new Map(Object.entries(fruitColors));
console.log(fruitMap.get('banana')); // 'yellow'
```

### 4.2 遍历对象的键值对

使用 `for...of` 解构遍历：

```javascript
const obj = { a: 1, b: 2, c: 3 };
for (const [key, value] of Object.entries(obj)) {
  console.log(`${key}: ${value}`);
}
// a: 1
// b: 2
// c: 3
```

### 4.3 配合 `forEach` 解构

```javascript
Object.entries(obj).forEach(([key, value]) => {
  console.log(key, value);
});
```

### 4.4 将对象转换为普通对象数组（用于表格渲染等）

```javascript
const user = { id: 1, name: 'Alice', age: 25 };
const entries = Object.entries(user);
// entries: [ ['id',1], ['name','Alice'], ['age',25] ]
```

### 4.5 过滤对象属性

```javascript
const data = { a: 1, b: 2, c: 3 };
const filtered = Object.fromEntries(
  Object.entries(data).filter(([key, value]) => value > 1)
);
console.log(filtered); // { b: 2, c: 3 }
```

### 4.6 与 `Object.fromEntries` 配合转换数据结构

```javascript
const original = { a: 1, b: 2 };
const doubled = Object.fromEntries(
  Object.entries(original).map(([key, value]) => [key, value * 2])
);
console.log(doubled); // { a: 2, b: 4 }
```

---

## 5. 与相关方法的对比

| 方法                               | 返回值类型                     | 是否包含继承属性 | 是否包含不可枚举 | 是否包含 Symbol |
| ---------------------------------- | ------------------------------ | ---------------- | ---------------- | --------------- |
| `Object.keys(obj)`                 | 属性名数组（字符串）           | 否               | 否               | 否              |
| `Object.values(obj)`               | 属性值数组                     | 否               | 否               | 否              |
| `Object.entries(obj)`              | 键值对数组 `[key, value]`      | 否               | 否               | 否              |
| `Object.getOwnPropertyNames(obj)`  | 所有属性名（字符串）           | 否               | 是               | 否              |
| `Object.getOwnPropertySymbols(obj)`| Symbol 属性名                  | 否               | 是               | 是              |
| `for...in`                         | 可枚举属性名（遍历）           | 是               | 否               | 否              |

---

## 6. 注意事项

- 参数为 `null` 或 `undefined` 时会抛出 `TypeError`。
- 原始值会被装箱：数字、布尔值返回空数组；字符串返回索引-字符对（但字符串的键是数字索引，值是对应字符）。
  ```javascript
  console.log(Object.entries('foo')); // [['0','f'], ['1','o'], ['2','o']]
  ```
- 只返回自身可枚举属性，忽略 Symbol 属性。
- 顺序遵循规范，但不建议依赖顺序做关键业务逻辑。
- ES2017 引入，旧环境需要 polyfill。

---

## 7. 总结

- `Object.entries` 是获取对象自身可枚举属性键值对数组的便捷方法，常用于遍历、转换为 `Map`、过滤或转换对象等。
- 它与 `Object.keys` 和 `Object.values` 互补，三者共同提供了完整的对象属性迭代工具。
- 理解其返回的数组结构及顺序规则，有助于在数据处理和集合转换中高效使用。
