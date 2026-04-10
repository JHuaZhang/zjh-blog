---
group:
  title: 【03】js数组及数组方法
  order: 3
order: 1
title: 数组介绍
nav:
  title: JavaScript
  order: 2
---

## 1. 介绍

在 JavaScript 中，数组是用于存储一系列有序项目的全局对象。数组可以包含任何类型的值，例如数字、字符串、对象、甚至其他数组（这称为多维数组）。JavaScript 数组是动态的，这意味着数组的大小和内容可以在运行时改变。

## 2. 定义数组的方法

定义数组有几种不同的方法：

### 2.1 使用字面量语法

这是定义数组最简单和最常用的方法。直接使用方括号 `[]`，并在其中包括初始化的元素（如果有的话）。

```javascript
const fruits = ['Apple', 'Banana', 'Cherry'];
console.log(fruits); // 输出: ["Apple", "Banana", "Cherry"]
```

### 2.2 使用 `Array` 构造函数

`Array` 是 JavaScript 内置的数组构造函数，可以通过 `new` 关键字调用，也可以作为普通函数调用（两者行为一致）。它提供了多种创建数组的方式，但需要注意其参数的特殊行为。

#### 2.2.1 创建一个空数组

```javascript
const arr1 = new Array(); // 或者 Array()
console.log(arr1); // []
```

#### 2.2.2 创建一个指定长度的数组

如果只传递一个参数，并且该参数是**正整数**，则会创建一个长度为该数值的**稀疏数组**，数组中没有任何元素（只有 `length` 属性被设置），即 `empty slots`。

```javascript
const arr2 = new Array(5);
console.log(arr2); // [ <5 empty items> ]
console.log(arr2.length); // 5
console.log(arr2[0]); // undefined（但索引不存在于对象中）
```

> 注意：`new Array(5)` 并不会像字面量 `[undefined, undefined, undefined, undefined, undefined]` 那样创建真实存在的元素。它只是将 `length` 设为 5，没有存储任何属性，因此是稀疏的。通过 `in` 操作符可以验证：`0 in arr2` 返回 `false`。

#### 2.2.3 创建一个包含多个元素的数组

如果传递多个参数，或者一个非数值参数，则会使用这些参数作为数组的元素。

```javascript
const arr3 = new Array('Red', 'Green', 'Blue');
console.log(arr3); // ["Red", "Green", "Blue"]

const arr4 = new Array(3.14); // 参数不是正整数，会被当作元素
console.log(arr4); // [3.14]
```

#### 2.2.4 `Array` 作为普通函数调用

`Array()` 可以省略 `new`，效果完全相同：

```javascript
const arr5 = Array(5); // 同 new Array(5)
const arr6 = Array(1, 2, 3); // [1, 2, 3]
```

### 2.3 使用 `Array.of()` 方法

`Array.of` 是一个静态方法，用于创建一个新的 `Array` 实例，其元素由方法的参数组成，**无论参数数量或类型**。这个方法主要是为了解决 `Array` 构造函数行为的不一致性而引入的。

**语法**：`Array.of(element0[, element1[, ...[, elementN]]])`

**返回值**：返回一个新的 `Array` 实例。

**举例**：

```javascript
// 使用 Array 构造函数时的特殊行为
const arr1 = new Array(5);
console.log(arr1); // 输出：[ <5 empty items> ]
console.log(arr1.length); // 输出：5

// 使用 Array.of 创建数组
const arr2 = Array.of(5);
console.log(arr2); // 输出：[5]
console.log(arr2.length); // 输出：1

const arr3 = Array.of(1, 2, 3, 4, 5);
console.log(arr3); // 输出：[1, 2, 3, 4, 5]
```

`Array.of` 是 ECMAScript 2015 (ES6) 引入的特性，大多数现代浏览器都支持。

### 2.4 使用 `Array.from()` 方法

`Array.from` 是另一个静态方法，用于从类数组对象（如 `arguments`、`NodeList`）或可迭代对象（如 `Set`、`Map`、字符串）创建一个新的数组实例。它还可以接受一个可选的映射函数。

**语法**：`Array.from(arrayLike[, mapFn[, thisArg]])`

**举例**：

```javascript
// 从字符串创建数组
console.log(Array.from('hello')); // ['h', 'e', 'l', 'l', 'o']

// 从 Set 创建数组
const set = new Set([1, 2, 3]);
console.log(Array.from(set)); // [1, 2, 3]

// 使用映射函数
console.log(Array.from([1, 2, 3], (x) => x * 2)); // [2, 4, 6]

// 从类数组对象创建
function f() {
  return Array.from(arguments);
}
console.log(f(1, 2, 3)); // [1, 2, 3]
```

## 3. 数组的特性

- **动态大小**：JavaScript 数组的长度是动态的，可以随时添加或删除元素。
- **异质性**：数组可以包含任意类型的元素，同一个数组中可以同时包含字符串、数字、对象等。
- **索引**：数组中的元素通过从 0 开始的数字索引访问。
- **方法**：JavaScript 为数组提供了强大的方法，如 `map()`、`filter()`、`reduce()`、`sort()` 等，这些方法用于迭代、转换、搜索和排序数组。

## 4. 数组的原理

### 4.1 数组是特殊的对象

在 JavaScript 中，数组并不是像 C 语言那样的连续内存块，而是一种**特殊的对象**，其键名是字符串表示的数值索引（例如 `"0"`、`"1"`），并额外拥有 `length` 属性和一系列数组方法。

```javascript
const arr = ['a', 'b', 'c'];
console.log(typeof arr); // "object"

// 验证索引其实是属性名
console.log(Object.keys(arr)); // ["0", "1", "2"]
```

数组的索引会被自动转换为字符串，然后作为对象的属性名存储。你可以给数组添加任意属性（非数值字符串），但这不会影响 `length` 的值。

```javascript
const arr = [1, 2, 3];
arr.name = 'myArray';
console.log(arr.name); // "myArray"
console.log(arr.length); // 3（不变）
```

### 4.2 `length` 属性的行为

数组的 `length` 属性不仅仅是记录元素个数，它还具有**可写**的特性。当你修改 `length` 时，数组会被截断或扩展：

- 设置 `length` 为比当前小的值，会删除索引大于或等于新 `length` 的元素。
- 设置 `length` 为比当前大的值，会创建稀疏区域（新增的索引为 empty slots）。

```javascript
let arr = [1, 2, 3, 4, 5];
arr.length = 3;
console.log(arr); // [1, 2, 3]

arr.length = 5;
console.log(arr); // [1, 2, 3, <2 empty items>]
```

### 4.3 稀疏数组与密集数组

- **密集数组**：每个索引位置都有真实存在的元素（即使值为 `undefined`）。例如 `[undefined, undefined]` 是一个长度为 2 的密集数组，两个索引都真实存在（可通过 `in` 检查）。
- **稀疏数组**：某些索引位置没有分配元素，仅被 `length` 覆盖。例如 `new Array(3)` 或 `[1, , 3]`（中间空位）。稀疏数组的 empty slots 在遍历时会表现不同（如 `forEach` 会跳过空位，而 `map` 会保留空位但不会调用回调）。

```javascript
const sparse = [1, , 3];
console.log(sparse.length); // 3
console.log(1 in sparse); // false（索引1不存在）
console.log(sparse[1]); // undefined（访问不存在的属性返回 undefined）

// forEach 会跳过空位
sparse.forEach((v, i) => console.log(i, v)); // 输出 0 1 和 2 3，跳过索引1
```

### 4.4 类数组对象

有些对象具有 `length` 属性和数值索引，但并非继承自 `Array.prototype`，例如函数内的 `arguments`、DOM 的 `NodeList`。它们不能直接调用数组方法，但可以通过 `Array.from()` 或 `Array.prototype.slice.call()` 转换为真正的数组。

```javascript
function sum() {
  const args = Array.from(arguments);
  return args.reduce((a, b) => a + b, 0);
}
console.log(sum(1, 2, 3)); // 6
```

## 5. 判断数组的方法

在实际开发中，经常需要判断一个变量是否为数组。由于数组在 JavaScript 中属于对象类型（`typeof` 返回 `"object"`），因此不能简单地使用 `typeof`。下面是几种可靠的数组判断方法。

### 5.1 `Array.isArray()`（推荐）

ES5 提供的静态方法，专门用于判断一个值是否为数组，**最简洁、最可靠**，能正确区分跨框架（如 iframe）的数组。

**语法**：`Array.isArray(value)`

**返回值**：布尔值，`true` 表示是数组，`false` 表示不是数组。

```javascript
console.log(Array.isArray([])); // true
console.log(Array.isArray([1, 2, 3])); // true
console.log(Array.isArray({})); // false
console.log(Array.isArray('array')); // false
console.log(Array.isArray(null)); // false

// 跨框架场景（iframe）
// 假设在 iframe 中定义了一个数组，Array.isArray 依然能正确判断
```

### 5.2 `instanceof` 操作符

`instanceof` 用于检测构造函数的 `prototype` 属性是否出现在实例的原型链上。对于数组，`[] instanceof Array` 返回 `true`。

**注意**：`instanceof` 在跨框架（不同执行环境，如 iframe）下会失效，因为不同框架拥有独立的 `Array` 构造函数和原型。

```javascript
console.log([] instanceof Array); // true
console.log({} instanceof Array); // false

// 跨框架问题示例
// 假设在一个 iframe 中创建数组 arrIframe，父页面中 arrIframe instanceof Array 可能为 false
```

### 5.3 `Object.prototype.toString.call()`

这是最通用的类型检测方法，可以精确返回所有内置类型的字符串标签。对于数组，返回 `"[object Array]"`。它不受跨框架影响，且能区分数组和对象。

**原理**：`Object.prototype.toString` 方法会返回 `[object Type]` 格式的字符串，其中 `Type` 是对象的内部 `[[Class]]` 属性。通过 `call` 改变 `this` 指向即可获取任意值的类型。

```javascript
function isArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}

console.log(isArray([])); // true
console.log(isArray({})); // false
console.log(isArray('hello')); // false

// 跨框架同样有效
```

### 5.4 构造函数 `constructor` 属性

通过检查 `value.constructor === Array` 也可以判断是否为数组。但此方法不安全，因为 `constructor` 属性可以被改写，且在跨框架场景下也可能失效。

```javascript
function isArray(value) {
  return value != null && value.constructor === Array;
}

console.log(isArray([])); // true
console.log(isArray({})); // false

// 风险示例
const obj = {};
obj.constructor = Array;
console.log(isArray(obj)); // true（误判）
```

### 5.5 方法对比总结

| 方法                               | 跨框架可靠 | 可被修改 | 推荐程度   | 说明                         |
| ---------------------------------- | ---------- | -------- | ---------- | ---------------------------- |
| `Array.isArray()`                  | ✅ 是      | ❌ 否    | ⭐⭐⭐⭐⭐ | ES5 标准方法，最佳实践       |
| `instanceof`                       | ❌ 否      | 部分可改 | ⭐⭐       | 原型链可能被修改，跨框架失效 |
| `Object.prototype.toString.call()` | ✅ 是      | ❌ 否    | ⭐⭐⭐⭐   | 最通用，但写法稍繁琐         |
| `constructor`                      | ❌ 否      | ✅ 是    | ⭐         | 不可靠，容易被覆盖           |

**结论**：在常规开发中，优先使用 `Array.isArray()`；如果需要兼容非常古老的浏览器（IE9 以下）且无法使用 polyfill，可降级使用 `Object.prototype.toString.call()`。

```javascript
// 推荐的 polyfill 写法（兼容 ES3）
if (!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}
```

## 6. 多维数组

### 6.1 什么是多维数组

多维数组是指数组的元素本身又是数组。最常见的多维数组是二维数组（类似矩阵），三维及以上较少见但在某些算法（如张量计算）中也有应用。

### 6.2 创建多维数组

使用嵌套的字面量或构造函数即可创建多维数组。

```javascript
// 二维数组
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
console.log(matrix[1][2]); // 6（第2行第3列）

// 三维数组
const threeD = [
  [
    [1, 2],
    [3, 4],
  ],
  [
    [5, 6],
    [7, 8],
  ],
];
console.log(threeD[1][0][1]); // 6
```

### 6.3 动态创建多维数组

动态创建多维数组通常需要使用循环，因为 `Array.from` 和 `fill` 需要小心引用问题。

```javascript
// 正确创建 3x3 全零矩阵
const zeros = Array.from({ length: 3 }, () => Array(3).fill(0));
console.log(zeros);
// [[0, 0, 0], [0, 0, 0], [0, 0, 0]]

// 错误示例：直接 fill 会导致所有行引用同一数组
const bad = Array(3).fill(Array(3).fill(0));
bad[0][0] = 1;
console.log(bad); // 第一列全部变成1，因为所有行是同一个数组引用
```

### 6.4 访问和遍历多维数组

使用嵌套循环遍历多维数组。

```javascript
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
];

for (let i = 0; i < matrix.length; i++) {
  for (let j = 0; j < matrix[i].length; j++) {
    console.log(`matrix[${i}][${j}] = ${matrix[i][j]}`);
  }
}

// 使用 forEach
matrix.forEach((row) => {
  row.forEach((value) => {
    console.log(value);
  });
});
```

### 6.5 扁平化多维数组

`Array.prototype.flat()` 可以将多维数组降维。

```javascript
const nested = [1, [2, [3, 4]]];
console.log(nested.flat()); // [1, 2, [3, 4]]（默认深度1）
console.log(nested.flat(2)); // [1, 2, 3, 4]
```

## 7. 总结

| 特性     | 说明                                                            |
| -------- | --------------------------------------------------------------- |
| 定义方式 | 字面量 `[]`、构造函数 `Array()`、`Array.of()`、`Array.from()`   |
| 动态大小 | 可以随时增删元素，`length` 可写                                 |
| 异质性   | 可存储任意类型值                                                |
| 稀疏性   | 允许存在 empty slots，遍历时会跳过                              |
| 底层原理 | 数组是特殊对象，索引是属性名，`length` 自动维护                 |
| 多维数组 | 通过嵌套数组实现，注意引用问题，可用 `flat()` 扁平化            |
| 判断数组 | 推荐 `Array.isArray()`，其次 `Object.prototype.toString.call()` |

掌握数组的这些基础知识和原理，能够帮助开发者写出更健壮、更高效的代码，避免因稀疏数组、`length` 修改或多维数组引用引发的意外错误。
