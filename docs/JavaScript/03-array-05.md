---
group:
  title: 【03】js数组及数组方法
  order: 3
order: 5
title: reduce方法详解
nav:
  title: JavaScript
  order: 2
---

## 1. reduce 概述

`reduce` 是数组的**归并方法**，它遍历数组中的每个元素，并累计得到一个最终结果。它可以实现几乎所有数组方法的功能（如 `map`、`filter`、`some` 等），是函数式编程中的重要工具。之所以要将这个单独罗列，因为该方法在平时的时候使用比较少，然后又能优化算法，所以掌握这个方法能让人眼前一亮，因此这里着重单独列出。

### 核心思想

- 维护一个**累加器**（accumulator），每次迭代更新累加器的值。
- 最终返回累加器的值。

## 2. 语法与参数

```javascript
arr.reduce(callback(accumulator, currentValue[, index[, array]])[, initialValue])
```

**参数**

- `callback` — 必需。对每个元素执行的函数，接收四个参数：
  - `accumulator`：上一次调用回调的返回值，或提供的 `initialValue`。
  - `currentValue`：当前元素的值。
  - `index`（可选）：当前元素的索引。
  - `array`（可选）：调用 `reduce` 的数组本身。
- `initialValue`（可选）— 初始值。如果省略，则使用数组第一个元素作为初始值，并从第二个元素开始遍历。

**返回值**  
最终累积结果（任意类型）。

## 3. 工作原理

- 如果没有提供 `initialValue`：
  1. 取数组第一个元素作为初始的 `accumulator`。
  2. 从第二个元素开始，依次执行回调，将上一次的结果传给下一次。
- 如果提供了 `initialValue`：
  1. `accumulator` 初始化为该值。
  2. 从第一个元素开始执行回调。

**注意**：空数组且未提供 `initialValue` 会抛出 `TypeError`。

## 4. 手写实现

```javascript
Array.prototype.myReduce = function (callback, initialValue) {
  let accumulator = initialValue;
  let startIndex = 0;

  // 未提供 initialValue 时的处理
  if (arguments.length === 1) {
    if (this.length === 0) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    accumulator = this[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < this.length; i++) {
    // 跳过稀疏数组的空位
    if (i in this) {
      accumulator = callback(accumulator, this[i], i, this);
    }
  }
  return accumulator;
};
```

## 5. 基础用法示例

### 5.1 数组求和

```javascript
const arr = [1, 2, 3, 4];
const sum = arr.reduce((acc, cur) => acc + cur, 0);
console.log(sum); // 10
```

### 5.2 数组求积

```javascript
const product = arr.reduce((acc, cur) => acc * cur, 1);
console.log(product); // 24
```

### 5.3 对象数组提取最大值

```javascript
const users = [{ age: 25 }, { age: 32 }, { age: 28 }];
const maxAge = users.reduce((max, user) => Math.max(max, user.age), -Infinity);
console.log(maxAge); // 32
```

### 5.4 字符串拼接

```javascript
const words = ['Hello', 'world', '!'];
const sentence = words.reduce((acc, word) => acc + ' ' + word);
console.log(sentence); // "Hello world !"
```

## 6. reduce的进阶算法示例

### 6.1 数组扁平化（指定深度）

**问题**：将嵌套数组展平为一维数组。

```javascript
function flatten(arr, depth = 1) {
  return arr.reduce((acc, val) => {
    if (Array.isArray(val) && depth > 0) {
      acc.push(...flatten(val, depth - 1));
    } else {
      acc.push(val);
    }
    return acc;
  }, []);
}

const nested = [1, [2, [3, [4]]]];
console.log(flatten(nested, 2)); // [1, 2, 3, [4]]
```

### 6.2 数组去重

**问题**：基于 `reduce` 实现数组去重。

```javascript
const arr = [1, 2, 2, 3, 4, 4, 5];
const unique = arr.reduce((acc, cur) => {
  if (!acc.includes(cur)) acc.push(cur);
  return acc;
}, []);
console.log(unique); // [1, 2, 3, 4, 5]
```

### 6.3 统计数组中每个元素出现的次数

```javascript
const fruits = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple'];
const count = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
console.log(count);
// { apple: 3, banana: 2, orange: 1 }
```

### 6.4 分组（按属性）

**问题**：将对象数组按某个属性分组。

```javascript
const students = [
  { name: 'Alice', grade: 'A' },
  { name: 'Bob', grade: 'B' },
  { name: 'Charlie', grade: 'A' },
  { name: 'David', grade: 'C' },
];
const groupByGrade = students.reduce((acc, student) => {
  const grade = student.grade;
  if (!acc[grade]) acc[grade] = [];
  acc[grade].push(student);
  return acc;
}, {});
console.log(groupByGrade);
/*
{
  A: [{ name: 'Alice', grade: 'A' }, { name: 'Charlie', grade: 'A' }],
  B: [{ name: 'Bob', grade: 'B' }],
  C: [{ name: 'David', grade: 'C' }]
}
*/
```

### 6.5 管道函数组合

**问题**：将多个函数组合成一个从右向左执行的管道。

```javascript
const add = (x) => x + 1;
const multiply = (x) => x * 2;
const subtract = (x) => x - 3;

const compose =
  (...fns) =>
  (initialValue) =>
    fns.reduceRight((acc, fn) => fn(acc), initialValue);

const pipeline = compose(add, multiply, subtract);
console.log(pipeline(5)); // (5 - 3) * 2 + 1 = 5
```

### 6.6 将二维数组转换为对象（键值对）

**问题**：将 `[[key1, value1], [key2, value2]]` 转换为对象。

```javascript
const pairs = [
  ['name', 'Alice'],
  ['age', 25],
  ['city', 'Beijing'],
];
const obj = pairs.reduce((acc, [key, value]) => {
  acc[key] = value;
  return acc;
}, {});
console.log(obj); // { name: 'Alice', age: 25, city: 'Beijing' }
```

### 6.7 实现 `map` 和 `filter`

**问题**：用 `reduce` 模拟 `map` 和 `filter`。

```javascript
// 模拟 map
function map(arr, callback) {
  return arr.reduce((acc, cur, idx) => {
    acc.push(callback(cur, idx, arr));
    return acc;
  }, []);
}
console.log(map([1, 2, 3], (x) => x * 2)); // [2, 4, 6]

// 模拟 filter
function filter(arr, predicate) {
  return arr.reduce((acc, cur, idx) => {
    if (predicate(cur, idx, arr)) acc.push(cur);
    return acc;
  }, []);
}
console.log(filter([1, 2, 3, 4], (x) => x > 2)); // [3, 4]
```

### 6.8 求多个数组的交集

```javascript
const arrays = [
  [1, 2, 3],
  [2, 3, 4],
  [3, 4, 5],
];
const intersection = arrays.reduce((acc, cur) => {
  return acc.filter((item) => cur.includes(item));
});
console.log(intersection); // [3]
```

### 6.9 将数组转换为树形结构

**问题**：给定扁平数据（每个元素有 id 和 parentId），构建树。

```javascript
const items = [
  { id: 1, parentId: null, name: 'root' },
  { id: 2, parentId: 1, name: 'child1' },
  { id: 3, parentId: 1, name: 'child2' },
  { id: 4, parentId: 2, name: 'grandchild' },
];
const tree = items.reduce(
  (acc, item) => {
    acc.nodes[item.id] = { ...item, children: [] };
    if (item.parentId === null) {
      acc.root = acc.nodes[item.id];
    } else {
      const parent = acc.nodes[item.parentId];
      if (parent) parent.children.push(acc.nodes[item.id]);
    }
    return acc;
  },
  { nodes: {}, root: null },
).root;
console.log(JSON.stringify(tree, null, 2));
/*
{
  id: 1, parentId: null, name: 'root', children: [
    { id: 2, parentId: 1, name: 'child1', children: [{ id: 4, ... }] },
    { id: 3, parentId: 1, name: 'child2', children: [] }
  ]
}
*/
```

### 6.10 异步串行执行任务

**问题**：使用 `reduce` 按顺序执行异步任务（Promise 链）。

```javascript
const tasks = [
  () => Promise.resolve(1),
  (prev) => Promise.resolve(prev + 2),
  (prev) => Promise.resolve(prev * 3),
];
const runTasks = (initial) => {
  return tasks.reduce((promise, task) => promise.then(task), Promise.resolve(initial));
};
runTasks(0).then(console.log); // (0 + 1 + 2) * 3 = 9
```

## 7. reduce 与 reduceRight 的区别

- `reduce`：从左向右累积。
- `reduceRight`：从右向左累积。

**示例**：实现字符串反转

```javascript
const str = 'hello';
const reversed = str.split('').reduceRight((acc, char) => acc + char, '');
console.log(reversed); // "olleh"
```

## 8. 注意事项

- **始终提供初始值**：除非常明确数组不为空且可以使用第一个元素作为初始值，否则建议提供 `initialValue` 以避免空数组报错。
- **稀疏数组处理**：`reduce` 会跳过稀疏数组中的空位（`empty slots`），但不会跳过 `undefined` 或 `null` 值。
- **性能**：`reduce` 比手写循环稍慢，但可读性高，适用于中小规模数据。大数据量时优先考虑 `for` 循环。
- **不修改原数组**：`reduce` 不会修改原数组，但回调函数内部可以修改，建议保持纯函数。

## 9. 总结

`reduce` 是 JavaScript 中最灵活、最强大的数组方法之一。它不仅可以完成常见的累加、扁平化、分组等操作，还能模拟其他数组方法。掌握 `reduce` 有助于写出更简洁、函数式的代码。
