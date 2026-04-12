---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 2
title: Object对象详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

在 JavaScript 中，`Object` 是所有对象的**根构造函数**。几乎所有的 JavaScript 对象都是 `Object` 的实例，它们继承自 `Object.prototype`。`Object` 本身也是一个构造函数，可以通过 `new Object()` 或对象字面量 `{}` 创建对象。

`Object` 对象提供了丰富的**静态方法**（直接通过 `Object` 调用）和**实例方法**（通过对象实例调用），用于操作对象属性、原型、枚举等。

---

## 2. Object 的创建方式

**示例：创建对象**

```javascript
// 字面量（最常用）
const obj1 = { a: 1, b: 2 };

// 构造函数
const obj2 = new Object();
obj2.a = 1;

// Object.create(proto) 创建指定原型的对象
const proto = { x: 10 };
const obj3 = Object.create(proto);
obj3.y = 20;
```

---

## 3. Object 的静态方法

静态方法直接定义在 `Object` 构造函数上，用于操作对象本身。

### 3.1 对象属性定义与获取

**`Object.defineProperty(obj, prop, descriptor)`**  
定义或修改对象的单个属性，并返回该对象。可以通过描述符控制属性是否可枚举、可配置、可写等。

```javascript
const obj = {};
Object.defineProperty(obj, 'name', {
  value: 'Alice',
  writable: false,
  enumerable: true,
  configurable: true,
});
console.log(obj.name); // 'Alice'
obj.name = 'Bob'; // 非严格模式下无效，严格模式报错
```

**`Object.defineProperties(obj, props)`**  
一次定义多个属性。

```javascript
Object.defineProperties(obj, {
  age: { value: 25, writable: true },
  gender: { value: 'F', writable: false },
});
```

**`Object.getOwnPropertyDescriptor(obj, prop)`**  
获取指定属性的描述符。

```javascript
const desc = Object.getOwnPropertyDescriptor(obj, 'name');
console.log(desc); // { value: 'Alice', writable: false, enumerable: true, configurable: true }
```

**`Object.getOwnPropertyDescriptors(obj)`**  
获取对象所有自身属性的描述符。

### 3.2 属性枚举与遍历

**`Object.keys(obj)`**  
返回对象自身**可枚举**属性名的数组（不含 Symbol）。

```javascript
const obj = { a: 1, b: 2, c: 3 };
console.log(Object.keys(obj)); // ['a', 'b', 'c']
```

**`Object.values(obj)`**  
返回对象自身可枚举属性值的数组。

```javascript
console.log(Object.values(obj)); // [1, 2, 3]
```

**`Object.entries(obj)`**  
返回对象自身可枚举属性的 `[key, value]` 数组。

```javascript
console.log(Object.entries(obj)); // [['a',1], ['b',2], ['c',3]]
```

**`Object.getOwnPropertyNames(obj)`**  
返回对象自身所有属性名（包括不可枚举的，但不包括 Symbol）。

```javascript
Object.defineProperty(obj, 'hidden', { value: 'secret', enumerable: false });
console.log(Object.getOwnPropertyNames(obj)); // ['a','b','c','hidden']
```

**`Object.getOwnPropertySymbols(obj)`**  
返回对象自身的 Symbol 属性。

### 3.3 原型操作

**`Object.getPrototypeOf(obj)`**  
获取对象的原型（内部 `[[Prototype]]`）。

```javascript
const arr = [];
console.log(Object.getPrototypeOf(arr) === Array.prototype); // true
```

**`Object.setPrototypeOf(obj, prototype)`**  
设置对象的原型（性能较差，建议使用 `Object.create`）。

```javascript
const proto = { x: 1 };
const obj = { y: 2 };
Object.setPrototypeOf(obj, proto);
console.log(obj.x); // 1
```

**`Object.create(proto[, propertiesObject])`**  
创建一个新对象，使用指定的原型对象，并可添加属性。

```javascript
const parent = {
  greet() {
    return 'hello';
  },
};
const child = Object.create(parent);
child.name = 'Tom';
console.log(child.greet()); // 'hello'
console.log(child.__proto__ === parent); // true
```

### 3.4 对象状态控制

**`Object.preventExtensions(obj)`**  
禁止对象添加新属性（但可删除、修改已有属性）。

```javascript
const obj = { a: 1 };
Object.preventExtensions(obj);
obj.b = 2; // 静默失败或严格模式报错
console.log(obj.b); // undefined
```

**`Object.isExtensible(obj)`**  
检查对象是否可扩展。

**`Object.seal(obj)`**  
密封对象：不能添加/删除属性，不能配置属性（但可写属性仍可修改）。

**`Object.isSealed(obj)`**  
检查是否密封。

**`Object.freeze(obj)`**  
冻结对象：不能添加/删除/修改任何属性，也不能修改属性描述符。

```javascript
const obj = { a: 1 };
Object.freeze(obj);
obj.a = 2; // 静默失败或严格模式报错
console.log(obj.a); // 1
```

**`Object.isFrozen(obj)`**  
检查是否冻结。

### 3.5 其他静态方法

**`Object.assign(target, ...sources)`**  
将所有源对象的可枚举属性复制到目标对象，并返回目标对象（浅拷贝）。

```javascript
const target = { a: 1 };
const source = { b: 2, c: 3 };
Object.assign(target, source);
console.log(target); // { a:1, b:2, c:3 }
```

**`Object.is(value1, value2)`**  
判断两个值是否完全相同（比 `===` 更严格，能区分 `+0` 与 `-0`，且 `NaN` 等于自身）。

```javascript
console.log(Object.is(NaN, NaN)); // true
console.log(NaN === NaN); // false
console.log(Object.is(+0, -0)); // false
console.log(+0 === -0); // true
```

**`Object.fromEntries(iterable)`**  
将键值对列表（如 `Map` 或二维数组）转换为对象。

```javascript
const entries = [
  ['a', 1],
  ['b', 2],
];
const obj = Object.fromEntries(entries);
console.log(obj); // { a:1, b:2 }
```

---

## 4. Object 的实例方法

实例方法定义在 `Object.prototype` 上，所有对象实例都可以调用。

### 4.1 `hasOwnProperty(prop)`

判断对象自身是否包含指定属性（不检查原型链）。

```javascript
const obj = { a: 1 };
console.log(obj.hasOwnProperty('a')); // true
console.log(obj.hasOwnProperty('toString')); // false
```

### 4.2 `isPrototypeOf(obj)`

检查当前对象是否在另一个对象的原型链上。

```javascript
function Parent() {}
const parent = new Parent();
const child = Object.create(parent);
console.log(parent.isPrototypeOf(child)); // true
```

### 4.3 `propertyIsEnumerable(prop)`

检查指定属性是否可枚举（且为自身属性）。

```javascript
const obj = { a: 1 };
Object.defineProperty(obj, 'b', { value: 2, enumerable: false });
console.log(obj.propertyIsEnumerable('a')); // true
console.log(obj.propertyIsEnumerable('b')); // false
```

### 4.4 `toString()`

返回对象的字符串表示。通常自定义类型会重写该方法。

```javascript
const obj = { a: 1 };
console.log(obj.toString()); // "[object Object]"
```

### 4.5 `toLocaleString()`

返回对象的本地化字符串，常用于日期、数字。

### 4.6 `valueOf()`

返回对象的原始值。对于普通对象，返回自身。

```javascript
const obj = {};
console.log(obj.valueOf() === obj); // true
```

---

## 5. 其他对象如何使用 Object 的属性和方法

由于 JavaScript 的原型继承机制，几乎所有对象都继承自 `Object.prototype`，因此它们可以调用 `Object.prototype` 上的实例方法（如 `hasOwnProperty`、`toString` 等）。同时，任何对象都可以使用 `Object` 的静态方法（如 `Object.keys`），因为这些方法接收对象作为参数，不要求对象是通过 `Object` 构造函数创建的。

### 5.1 内置对象（Array、Date、Function 等）

```javascript
// 数组
const arr = [1, 2, 3];
console.log(arr.hasOwnProperty('length')); // true（自身属性）
console.log(arr.toString()); // "1,2,3"（重写了自己的 toString）

// 日期
const date = new Date();
console.log(date.hasOwnProperty('getTime')); // false（方法在原型上）
console.log(Object.prototype.hasOwnProperty.call(date, 'getTime')); // false
console.log(date.toString()); // 返回本地时间字符串

// 函数
function foo() {}
console.log(foo.hasOwnProperty('call')); // false（call 在 Function.prototype 上）
console.log(Object.keys(foo)); // []（函数自身属性较少）
```

### 5.2 使用 `Object` 静态方法操作不同对象

```javascript
const strObj = new String('hello');
console.log(Object.keys(strObj)); // ['0','1','2','3','4']（字符串对象的索引属性）
console.log(Object.values(strObj)); // ['h','e','l','l','o']

const map = new Map([
  ['a', 1],
  ['b', 2],
]);
console.log(Object.fromEntries(map)); // { a:1, b:2 }
```

### 5.3 自定义对象继承 `Object.prototype`

```javascript
function Person(name) {
  this.name = name;
}
Person.prototype.say = function () {};

const p = new Person('Alice');
console.log(p.hasOwnProperty('name')); // true
console.log(p.toString()); // "[object Object]"（未重写）
```

**注意**：通过 `Object.create(null)` 创建的对象没有原型，因此不能直接调用 `hasOwnProperty`、`toString` 等方法，但可以借助 `Object.prototype.hasOwnProperty.call` 间接使用。

```javascript
const obj = Object.create(null);
obj.foo = 'bar';
// obj.hasOwnProperty('foo')  // 报错
console.log(Object.prototype.hasOwnProperty.call(obj, 'foo')); // true
```

---

## 6. 实际应用场景：巧用 `Object.prototype` 上的方法配合 `call/apply`

### 6.1 精确类型判断（最常用）

`Object.prototype.toString.call(value)` 返回 `"[object Type]"` 格式的字符串，可以精确区分 `null`、`undefined`、数组、日期、正则等。

```javascript
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}
console.log(getType([])); // "Array"
console.log(getType(null)); // "Null"
console.log(getType(/regex/)); // "RegExp"
console.log(getType(new Date())); // "Date"
console.log(getType(Promise.resolve())); // "Promise"
```

### 6.2 安全调用 `hasOwnProperty`

当对象可能覆盖了 `hasOwnProperty` 或通过 `Object.create(null)` 创建时，使用原型上的方法。

```javascript
const obj = { hasOwnProperty: () => false, foo: 123 };
console.log(obj.hasOwnProperty('foo')); // false（错误）
console.log(Object.prototype.hasOwnProperty.call(obj, 'foo')); // true

const nullProto = Object.create(null);
nullProto.bar = 456;
console.log(Object.prototype.hasOwnProperty.call(nullProto, 'bar')); // true
```

### 6.3 借用数组方法处理类数组对象

类数组对象（如 `arguments`、`NodeList`）没有数组方法，可以借用 `Array.prototype` 上的方法，并通过 `call` 调用。

```javascript
function sum() {
  // 将 arguments 转换为真实数组
  const args = Array.prototype.slice.call(arguments);
  return args.reduce((acc, cur) => acc + cur, 0);
}
console.log(sum(1, 2, 3)); // 6

// 在 DOM 中遍历 NodeList
const divs = document.querySelectorAll('div');
const contents = Array.prototype.map.call(divs, (div) => div.textContent);
```

### 6.4 检查对象是否为普通对象（Plain Object）

使用 `Object.prototype.toString.call(obj) === '[object Object]'` 可以判断是否为普通对象（非数组、非 null、非内置对象等）。

```javascript
function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
console.log(isPlainObject({})); // true
console.log(isPlainObject([])); // false
console.log(isPlainObject(null)); // false
console.log(isPlainObject(new Date())); // false
```

### 6.5 安全调用 `toString` 获取原始字符串表示

避免某些对象自定义的 `toString` 带来的副作用。

```javascript
const obj = { toString: () => 'custom' };
console.log(obj.toString()); // "custom"
console.log(Object.prototype.toString.call(obj)); // "[object Object]"
```

### 6.6 判断变量是否为 `undefined` 或 `null` 的可靠方法

```javascript
function isUndefinedOrNull(value) {
  const type = Object.prototype.toString.call(value);
  return type === '[object Undefined]' || type === '[object Null]';
}
console.log(isUndefinedOrNull(undefined)); // true
console.log(isUndefinedOrNull(null)); // true
console.log(isUndefinedOrNull(0)); // false
```

### 6.7 跨窗口（iframe）数组判断

不同窗口的 `Array` 构造函数不同，`instanceof` 可能失效，但 `Object.prototype.toString` 仍然准确。

```javascript
// 假设在 iframe 中创建数组
const iframeArr = iframe.contentWindow.Array(1, 2, 3);
console.log(iframeArr instanceof Array); // false（跨窗口）
console.log(Array.isArray(iframeArr)); // true（可靠）
console.log(Object.prototype.toString.call(iframeArr) === '[object Array]'); // true
```

### 6.8 合并多个对象的属性（浅拷贝）增强版

`Object.assign` 无法处理 `null` 源对象，可以用 `call` 结合 `Object` 方法安全处理。

```javascript
function safeAssign(target, ...sources) {
  sources.forEach((src) => {
    if (src != null) {
      Object.getOwnPropertyNames(src).forEach((prop) => {
        target[prop] = src[prop];
      });
    }
  });
  return target;
}
const obj = safeAssign({}, null, { a: 1 }, undefined, { b: 2 });
console.log(obj); // { a:1, b:2 }
```

### 6.9 判断对象是否为空（无自身可枚举属性）

```javascript
function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
// 更严谨的版本
function isEmpty(obj) {
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
  }
  return true;
}
console.log(isEmpty({})); // true
console.log(isEmpty({ a: 1 })); // false
```

---

## 7. Object 的原理

### 7.1 原型链机制

JavaScript 中每个对象都有一个内部属性 `[[Prototype]]`，指向其原型。当访问一个对象的属性时，引擎会先查找对象自身属性，如果没有找到，则沿着 `[[Prototype]]` 链向上查找，直到 `null`。`Object.prototype` 位于所有对象原型链的顶端（除了通过 `Object.create(null)` 创建的对象）。

```
实例对象.__proto__ === 构造函数.prototype
构造函数.prototype.__proto__ === Object.prototype
Object.prototype.__proto__ === null
```

### 7.2 对象属性存储与查找

- 每个对象的自身属性存储在**属性表**中（类似哈希表）。
- 引擎（如 V8）使用**隐藏类（Hidden Class）** 和**内联缓存（Inline Cache）** 来优化属性访问速度。
- `Object` 的静态方法（如 `Object.keys`）会遍历对象的属性表，忽略不可枚举属性和 Symbol。

### 7.3 属性描述符的作用

属性描述符决定了属性的行为：是否可写、可枚举、可配置。`Object.defineProperty` 允许精确控制属性。例如，将属性设置为不可枚举后，`for...in` 和 `Object.keys` 将不会包含它。

### 7.4 对象状态的不可变性

- **可扩展性**：能否添加新属性。
- **密封**：不可扩展 + 不可删除/重新配置已有属性。
- **冻结**：不可扩展 + 不可删除 + 不可修改已有属性的值（若 writable 为 true 则仍可修改？冻结会将所有属性标记为不可写）。

这些状态通过对象内部的标志位实现，一旦应用就不能撤销。

### 7.5 `Object.create` 的原理

`Object.create(proto)` 创建的新对象的 `[[Prototype]]` 直接指向 `proto`，不执行任何构造函数。等价于：

```javascript
function create(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}
```

---

## 8. 注意事项

- 通过 `Object.create(null)` 创建的对象没有原型，因此没有 `hasOwnProperty`、`toString` 等方法，需要从 `Object.prototype` 调用。
- 使用 `Object.assign` 是浅拷贝，嵌套对象仍然是引用。
- 冻结、密封、阻止扩展都是不可逆操作。
- `Object.setPrototypeOf` 性能较差，应优先使用 `Object.create` 来设置原型。
- 直接修改 `Object.prototype` 是非常危险的行为，会影响所有对象，应避免。

---

## 9. 总结

`Object` 是 JavaScript 的核心内置对象，提供了丰富的静态方法和实例方法，用于创建、操作、检查对象。所有对象都继承 `Object.prototype`，因此都可以使用实例方法（如 `hasOwnProperty`、`toString`）。理解 `Object` 的原理（原型链、属性描述符、对象状态）是掌握 JavaScript 面向对象和底层机制的关键。

| 方法分类     | 常用方法                                                                         |
| ------------ | -------------------------------------------------------------------------------- |
| 属性定义     | `defineProperty`, `defineProperties`, `getOwnPropertyDescriptor`                 |
| 属性枚举     | `keys`, `values`, `entries`, `getOwnPropertyNames`, `getOwnPropertySymbols`      |
| 原型操作     | `create`, `getPrototypeOf`, `setPrototypeOf`                                     |
| 状态控制     | `preventExtensions`, `seal`, `freeze`, `isExtensible`, `isSealed`, `isFrozen`    |
| 其他静态方法 | `assign`, `is`, `fromEntries`                                                    |
| 实例方法     | `hasOwnProperty`, `isPrototypeOf`, `propertyIsEnumerable`, `toString`, `valueOf` |

掌握这些方法可以帮助你高效处理对象，写出更健壮的 JavaScript 代码。
