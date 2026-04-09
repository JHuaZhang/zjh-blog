---
group:
  title: 【01】js数据类型介绍及转换
  order: 1
order: 2
title: js数据类型检测
nav:
  title: JavaScript
  order: 2
---

## 1. 数据类型检测方法概览

JavaScript 中一共有八大数据类型（原始类型：String、Number、Boolean、Null、Undefined、Symbol、BigInt；引用类型：Object）。当我们需要确定一个变量具体属于哪种类型时，有多种方法可供选择，每种方法各有优缺点和适用场景。下面依次介绍四种常用检测方法。

---

## 2. typeof 操作符

`typeof` 操作符返回一个字符串，表示未经计算的操作数的类型。

### 2.1 基本使用

```javascript
console.log(typeof ''); // "string"
console.log(typeof 1); // "number"
console.log(typeof NaN); // "number"
console.log(typeof true); // "boolean"
console.log(typeof Symbol(1)); // "symbol"
console.log(typeof undefined); // "undefined"
console.log(typeof function () {}); // "function"

// 特殊情况
console.log(typeof null); // "object"
console.log(typeof []); // "object"
console.log(typeof {}); // "object"
```

**总结**：`typeof` 对除 `null` 以外的原始类型和函数判断准确，但对数组、对象、`null` 均返回 `"object"`，无法进一步区分。

### 2.2 注意：暂时性死区的影响

在 ES6 之前，`typeof` 对于未声明的变量会返回 `"undefined"`，不会报错。但 ES6 引入 `let`/`const` 和暂时性死区后，在变量声明前使用 `typeof` 会抛出 `ReferenceError`。

```javascript
let a = 1;
console.log(typeof a); // "number"

console.log(typeof c); // ReferenceError: c is not defined
let c = 1;
```

### 2.3 为什么 `typeof null === "object"`？

在 JavaScript 最初的实现中，值由类型标签和实际数据组成。对象的类型标签为 0，而 `null` 代表空指针（多数平台为 0x00），因此 `null` 的类型标签也为 0，导致 `typeof null` 错误地返回 `"object"`。

---

## 3. instanceof 操作符

`instanceof` 用于检测构造函数的 `prototype` 属性是否出现在某个实例对象的原型链上。它通常用来判断**对象**的具体类型，不能用于原始类型（除非通过包装对象）。

### 3.1 基本使用

```javascript
console.log([] instanceof Array); // true
console.log([] instanceof Object); // true（数组的原型链上也有 Object）

console.log({} instanceof Object); // true
console.log(function () {} instanceof Function); // true
console.log(function () {} instanceof Object); // true

// 包装对象
console.log(new String('1') instanceof String); // true
console.log(new Number(1) instanceof Number); // true
console.log(new Boolean(true) instanceof Boolean); // true
```

### 3.2 原始类型直接使用会返回 false

```javascript
console.log('1' instanceof String); // false
console.log(1 instanceof Number); // false
console.log(true instanceof Boolean); // false
```

### 3.3 注意：`null` 和 `undefined` 不能使用 `instanceof`

```javascript
console.log(null instanceof Object); // false（不会报错，但永远为 false）
console.log(undefined instanceof Object); // false
```

> `null` 和 `undefined` 没有构造函数，因此 `instanceof` 始终返回 `false`，不会报错。但直接对 `null` 或 `undefined` 使用 `instanceof` 是合法的，只是结果固定为 `false`。

### 3.4 `instanceof` 与基本类型的包装

```javascript
console.log(new Number(1) == 1); // true（== 会进行类型转换）
console.log(new Number(1) === 1); // false（类型不同）
```

---

## 4. constructor 属性

每个实例对象都拥有 `constructor` 属性，指向创建该对象的构造函数。

### 4.1 基本使用

```javascript
console.log('1'.constructor === String); // true
console.log((1).constructor === Number); // true
console.log(NaN.constructor === Number); // true
console.log(true.constructor === Boolean); // true
console.log([].constructor === Array); // true
console.log(function () {}.constructor === Function); // true
console.log({}.constructor === Object); // true
console.log(Symbol(1).constructor === Symbol); // true
```

### 4.2 注意：`null` 和 `undefined` 没有 `constructor`

```javascript
console.log(null.constructor); // TypeError: Cannot read property 'constructor' of null
console.log(undefined.constructor); // TypeError: Cannot read property 'constructor' of undefined
```

### 4.3 `constructor` 可能被改变

```javascript
function Fn() {}
Fn.prototype = new Array(); // 改变原型
var f = new Fn();

console.log(f.constructor === Fn); // false
console.log(f.constructor === Array); // true
```

因此，`constructor` 在原型被修改后不再可靠。

---

## 5. Object.prototype.toString.call()

这是最通用、最准确的类型检测方法，可以精确区分所有内置类型（包括 `null`、`undefined`、数组、函数、日期等）。

### 5.1 原理

`Object.prototype.toString` 方法返回一个格式为 `"[object Type]"` 的字符串，其中 `Type` 是对象的内部 `[[Class]]` 属性。通过 `call` 或 `apply` 改变 `this` 指向，即可获取任意值的类型。

### 5.2 基本使用

```javascript
const toString = Object.prototype.toString;

console.log(toString.call(1)); // "[object Number]"
console.log(toString.call('1')); // "[object String]"
console.log(toString.call(NaN)); // "[object Number]"
console.log(toString.call(true)); // "[object Boolean]"
console.log(toString.call(Symbol(1))); // "[object Symbol]"
console.log(toString.call(null)); // "[object Null]"
console.log(toString.call(undefined)); // "[object Undefined]"
console.log(toString.call([])); // "[object Array]"
console.log(toString.call({})); // "[object Object]"
console.log(toString.call(function () {})); // "[object Function]"

function Fn() {}
console.log(toString.call(Fn)); // "[object Function]"
```

### 5.3 封装为通用函数

```javascript
function getType(target) {
  return Object.prototype.toString.call(target).slice(8, -1);
}

console.log(getType(1)); // "Number"
console.log(getType('1')); // "String"
console.log(getType(null)); // "Null"
console.log(getType(undefined)); // "Undefined"
console.log(getType([])); // "Array"
console.log(getType({})); // "Object"
console.log(getType(function () {})); // "Function"
```

### 5.4 为什么不能用 `obj.toString()` 直接获取类型？

因为许多内置类型（如 Array、Function、Date 等）重写了自身的 `toString` 方法，调用时会返回其他内容（如数组转为字符串、函数返回函数体字符串）。只有 `Object.prototype.toString` 保留了原始的类型标签功能。

```javascript
let arr = [1, 2, 3];
console.log(arr.toString()); // "1,2,3"（被重写）
delete Array.prototype.toString;
console.log(arr.toString()); // "[object Array]"（恢复为 Object.prototype.toString）
```

---

## 6. 四种方法对比总结

| 方法                               | 适用范围                            | 优点           | 缺点                                       |
| ---------------------------------- | ----------------------------------- | -------------- | ------------------------------------------ |
| `typeof`                           | 原始类型（除 `null`）及函数         | 简单、快速     | 无法区分对象、数组、`null`，对 `null` 误判 |
| `instanceof`                       | 对象（包括包装对象）                | 能检测继承关系 | 不能用于原始类型，且可能因原型改变而不准确 |
| `constructor`                      | 大多数对象（有 `constructor` 属性） | 相对准确       | 易被修改，`null`/`undefined` 会报错        |
| `Object.prototype.toString.call()` | 所有内置类型                        | 最准确、最全面 | 写法稍繁琐，但可封装为工具函数             |

**推荐**：在需要精确判断任何类型的场景下，使用 `Object.prototype.toString.call()` 是最佳实践。

---

## 7. 扩展：检测是否为数组

ES5 提供了 `Array.isArray()` 方法，专门用于判断一个值是否为数组。

```javascript
console.log(Array.isArray([])); // true
console.log(Array.isArray({})); // false
console.log(Array.isArray(null)); // false
```

这是目前检测数组最简洁可靠的方式。
