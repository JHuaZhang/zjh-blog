---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 11
title: Object.assign详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

`Object.assign()` 方法用于将所有可枚举属性的值从一个或多个源对象复制到目标对象，并返回修改后的目标对象。它是 ES6 引入的常用对象合并与浅克隆工具。

**语法**

```javascript
Object.assign(target, ...sources);
```

- **`target`**：目标对象，接收源对象属性的对象。
- **`...sources`**：一个或多个源对象，其可枚举自身属性会被复制到目标对象。

**返回值**：修改后的目标对象（即 `target` 本身）。

**基本示例**

```javascript
const target = { a: 1, b: 2 };
const source1 = { b: 4, c: 5 };
const source2 = { d: 6 };

const result = Object.assign(target, source1, source2);
console.log(target); // { a: 1, b: 4, c: 5, d: 6 }
console.log(result === target); // true
```

---

## 2. 原理

`Object.assign` 的内部实现遵循 ECMAScript 规范中的 **`CopyDataProperties`** 抽象操作。大致步骤如下：

1. 将第一个参数 `target` 转换为对象（原始值会被装箱）。
2. 对于每个源对象 `source`（按参数顺序处理）：
   - 如果 `source` 为 `null` 或 `undefined`，则跳过。
   - 获取 `source` 的所有**自身可枚举属性**（包括字符串键和 Symbol 键）。
   - 将每个属性的值通过 **`[[Set]]`** 操作设置到 `target` 对象上（覆盖同名属性）。
3. 返回 `target`。

**关键点**：

- 复制是**浅拷贝**：如果属性值是对象，复制的是引用。
- 只复制源对象的**自身可枚举属性**（包括 `Symbol` 属性），不复制继承属性、不可枚举属性。
- 属性描述符（如 `writable`、`getter`/`setter`）不会被复制；`getter` 会被调用后取其返回值作为普通属性值复制。
- 如果目标对象中已有同名属性，后面的源对象会覆盖前面的。
- 如果复制过程中发生错误（如属性不可写），会抛出 `TypeError`，目标对象可能已被部分修改。

---

## 3. 常见应用场景

### 3.1 合并多个对象

```javascript
const obj1 = { a: 1 };
const obj2 = { b: 2 };
const obj3 = { c: 3 };
const merged = Object.assign({}, obj1, obj2, obj3);
console.log(merged); // { a:1, b:2, c:3 }
```

### 3.2 浅克隆对象

```javascript
const original = { x: 1, y: { z: 2 } };
const clone = Object.assign({}, original);
console.log(clone); // { x:1, y: { z:2 } }
clone.x = 99;
clone.y.z = 100;
console.log(original.y.z); // 100（浅克隆，内部对象仍是引用）
```

### 3.3 设置默认配置（函数参数默认值）

```javascript
function setup(options) {
  const defaults = { host: 'localhost', port: 8080, ssl: false };
  const config = Object.assign({}, defaults, options);
  console.log(config);
}
setup({ port: 9090, ssl: true });
// { host: 'localhost', port: 9090, ssl: true }
```

### 3.4 复制 Symbol 属性

```javascript
const sym = Symbol('key');
const src = { [sym]: 'symbol value', normal: 'text' };
const target = {};
Object.assign(target, src);
console.log(target[sym]); // 'symbol value'
```

---

## 4. 处理数组

`Object.assign` 将数组视为**对象**，数组索引作为属性名（字符串形式的数字）。因此，复制数组时是按索引覆盖。

**示例**：

```javascript
const arr1 = ['a', 'b', 'c'];
const arr2 = ['d', 'e', 'f'];
const result = Object.assign(arr1, arr2);
console.log(result); // ['d', 'e', 'f']
console.log(arr1); // ['d', 'e', 'f']（原数组被修改）
```

**注意事项**：

- 目标数组会被修改，且长度由源数组决定（如果源数组更长，目标数组会扩展）。
- 不会保留原数组的额外属性（如 `length` 会被重新计算）。
- 若源数组有空位（稀疏数组），空位对应索引会被赋值为 `undefined`。

```javascript
const sparse = [1, , 3];
const target = [];
Object.assign(target, sparse);
console.log(target); // [1, undefined, 3]
```

**更安全的数组合并方式**：使用 `concat` 或扩展运算符。

```javascript
const combined = [...arr1, ...arr2];
// 或
const combined2 = arr1.concat(arr2);
```

---

## 5. 处理函数

函数也是对象，可以拥有属性。`Object.assign` 可以将属性复制到函数对象上，但不会影响函数的执行行为。

**示例**：

```javascript
function greet() {
  console.log('hello');
}
Object.assign(greet, { version: '1.0', author: 'Alice' });
console.log(greet.version); // '1.0'
greet.author = 'Bob';
console.log(greet.author); // 'Bob'
```

**注意**：复制到函数上的方法可以通过函数调用，但不会改变原函数的作用域或原型。

```javascript
const fn = function () {
  console.log('fn');
};
Object.assign(fn, {
  method() {
    console.log('method');
  },
});
fn.method(); // 'method'（可调用，但 method 中的 this 指向 fn 对象）
```

一般不推荐将函数作为普通数据容器，但某些元编程场景中可能有用。

---

## 6. 注意事项与限制

- **浅拷贝**：嵌套对象仍是引用，修改会影响原对象。
- **不可枚举属性不会被复制**：例如 `Object.defineProperty` 定义的 `enumerable: false` 属性。
- **只复制自身属性**：原型链上的属性不会被复制。
- **属性描述符被忽略**：源对象的 getter 会被调用后取返回值，setter 不会被复制；目标对象的属性描述符（如 `writable`）可能限制赋值。
- **异常处理**：复制过程中如果某个属性不可写，会抛出 `TypeError`，目标对象可能部分修改。
- **原始值作为源对象**：`null` 或 `undefined` 会被忽略；其他原始值（字符串、数字、布尔值）会被装箱为对象，但只有字符串有可枚举属性（索引）。
- **Symbol 属性**：也会被复制（因为 Symbol 属性也是可枚举的自身属性）。

---

## 7. 对比总结

| 方法                                | 浅/深拷贝 | 是否修改目标对象 | 是否复制原型链 | 是否复制不可枚举属性 | 是否复制 getter/setter |
| ----------------------------------- | --------- | ---------------- | -------------- | -------------------- | ---------------------- |
| `Object.assign(target, ...sources)` | 浅        | 是               | 否             | 否                   | 否（取 getter 的值）   |
| 扩展运算符 `{ ...obj }`             | 浅        | 否（创建新对象） | 否             | 否                   | 否                     |
| `JSON.parse(JSON.stringify(obj))`   | 深        | 否               | 否             | 否                   | 否（丢失方法）         |
| 手写递归深拷贝                      | 深        | 否               | 否             | 可定制               | 可定制                 |

---

## 8. 总结

- `Object.assign` 是对象浅拷贝与合并的便捷方法，适用于**简单数据对象**。
- 它不会复制原型链属性、不可枚举属性、getter/setter（只复制值）。
- 对于数组，它会按索引覆盖，可能产生意外结果，建议使用数组合并专用方法。
- 在需要深拷贝或保留属性描述符的场景，应使用其他方法（如 `Object.create` + `getOwnPropertyDescriptors` 或第三方库）。
- 合理使用 `Object.assign` 可以简化默认配置、对象克隆等操作，但需注意其局限性。
