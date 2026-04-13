---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 8
title: getPrototypeOf与setPrototypeOf详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

`Object.getPrototypeOf` 和 `Object.setPrototypeOf` 是用于获取和设置对象原型（内部 `[[Prototype]]`）的两个静态方法。`getPrototypeOf` 是 ES5 引入的标准方式，而 `setPrototypeOf` 是 ES6 引入的方法，但由于性能问题，不推荐在生产环境中使用。

---

## 2. Object.getPrototypeOf

### 2.1 定义与语法

`Object.getPrototypeOf()` 返回指定对象的原型（即内部 `[[Prototype]]` 属性的值）。

```javascript
Object.getPrototypeOf(obj);
```

- **`obj`**：要获取原型的对象。
- **返回值**：`obj` 的原型对象。如果没有继承属性（即 `[[Prototype]]` 为 `null`），则返回 `null`。

**原理**：`Object.getPrototypeOf` 的内部机制遵循 ECMAScript 规范中的 **`[[GetPrototypeOf]]`** 抽象操作。首先将参数 `obj` 转换为对象类型（原始值会被装箱），然后调用对象内部的 `[[GetPrototypeOf]]` 方法，返回对象的内部 `[[Prototype]]` 值。该操作是获取对象原型的标准、可靠方式，不涉及任何递归或遍历，性能较高。

**示例**：

```javascript
// 普通对象
const obj = {};
console.log(Object.getPrototypeOf(obj) === Object.prototype); // true

// 数组
const arr = [];
console.log(Object.getPrototypeOf(arr) === Array.prototype); // true

// 通过 Object.create 创建的对象
const proto = { x: 1 };
const child = Object.create(proto);
console.log(Object.getPrototypeOf(child) === proto); // true

// null 原型的对象
const nullProto = Object.create(null);
console.log(Object.getPrototypeOf(nullProto)); // null
```

### 2.2 特性与用途

- **获取对象原型**：是替代已过时的 `__proto__` 属性的标准方式。
- **原型链检查**：可用于调试或检查继承关系。
- **框架内部实现**：许多库和框架使用它来获取对象的真实原型。

### 2.3 应用场景示例

**场景1：判断对象是否继承自某个构造函数**

```javascript
function isDerived(obj, constructor) {
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    if (proto === constructor.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
class Parent {}
class Child extends Parent {}
const child = new Child();
console.log(isDerived(child, Parent)); // true
```

**场景2：克隆对象时保留原型**

```javascript
function cloneWithPrototype(obj) {
  const clone = Object.create(Object.getPrototypeOf(obj));
  return Object.assign(clone, obj);
}
const original = { a: 1 };
const cloned = cloneWithPrototype(original);
console.log(Object.getPrototypeOf(cloned) === Object.getPrototypeOf(original)); // true
```

**场景3：获取所有祖先原型（原型链遍历）**

```javascript
function getPrototypeChain(obj) {
  const chain = [];
  let current = obj;
  while (current) {
    const proto = Object.getPrototypeOf(current);
    if (!proto) break;
    chain.push(proto);
    current = proto;
  }
  return chain;
}
class A {}
class B extends A {}
class C extends B {}
const c = new C();
console.log(getPrototypeChain(c)); // [C.prototype, B.prototype, A.prototype, Object.prototype]
```

**场景4：安全地判断是否为普通对象（非 null、非数组、非特殊对象）**

```javascript
function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
console.log(isPlainObject({})); // true
console.log(isPlainObject([])); // false
console.log(isPlainObject(new Date())); // false
console.log(Object.create(null)); // true（原型为 null）
```

**场景5：框架中实现“类继承”检查（例如 React 的 isValidElement）**

在 React 等库中，需要检查某个对象是否是特定类的实例。利用 `getPrototypeOf` 可以安全地获取原型，避免 `instanceof` 跨 iframe 问题。

```javascript
function isInstanceOf(obj, constructor) {
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    if (proto === constructor.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
// 适用于跨 iframe 场景，比 instanceof 更可靠
```

---

## 3. Object.setPrototypeOf

### 3.1 定义与语法

`Object.setPrototypeOf()` 方法设置一个指定对象的原型（即内部 `[[Prototype]]` 属性）到另一个对象或 `null`。

```javascript
Object.setPrototypeOf(obj, prototype);
```

- **`obj`**：要设置原型的对象。
- **`prototype`**：`obj` 的新原型对象。如果为 `null`，`obj` 将没有原型。
- **返回值**：修改后的对象 `obj`。

**原理**：`Object.setPrototypeOf` 的内部机制遵循规范中的 **`[[SetPrototypeOf]]`** 抽象操作。首先检查 `obj` 是否可扩展，若不可扩展则抛出 `TypeError`；然后检查新原型 `prototype` 是否与 `obj` 构成循环引用，如果是则抛出 `TypeError`；接着调用 `[[SetPrototypeOf]]` 将 `obj` 的 `[[Prototype]]` 设置为 `prototype`；最后返回 `obj`。由于改变对象的原型会破坏引擎对原型链的缓存优化（如隐藏类、内联缓存），该操作**性能极差**，应尽量避免。

**示例**：

```javascript
const shape = { type: 'shape' };
const circle = { radius: 10 };
Object.setPrototypeOf(circle, shape);
console.log(circle.type); // 'shape'
console.log(Object.getPrototypeOf(circle) === shape); // true
```

### 3.2 特性与用途

- **动态改变原型**：可以在运行时修改对象的继承关系，但极不推荐。
- **理论上可用于某些高级元编程**，但实际中几乎不用。

### 3.3 应用场景示例（仅演示，不推荐生产）

**场景1：动态改变对象的行为（非常不推荐）**

```javascript
function makeBird(obj) {
  const birdProto = {
    fly() {
      console.log('Flying!');
    },
  };
  Object.setPrototypeOf(obj, birdProto);
}
const obj = { name: 'penguin' };
makeBird(obj);
obj.fly(); // 'Flying!'
```

**场景2：修复某些库中丢失的原型（极少数情况）**

在某些 JSON 反序列化或深层克隆后，对象原型可能变成 `Object.prototype`，如果需要恢复为某个特定原型，可以用 `setPrototypeOf`（但更好的做法是使用 `Object.create` 重新构建）。

```javascript
function restorePrototype(obj, properProto) {
  Object.setPrototypeOf(obj, properProto);
  return obj;
}
```

**场景3：实现“对象混入”但破坏原型链（不推荐）**

```javascript
const mixin = {
  log() {
    console.log(this);
  },
};
const target = {};
Object.setPrototypeOf(target, mixin);
target.log(); // 可工作，但性能差，不如使用 Object.assign
```

### 3.4 注意事项

- **性能警告**：`setPrototypeOf` 是慢操作，会破坏引擎优化，应避免使用。
- **更好的替代方案**：
  - 创建对象时直接指定原型：使用 `Object.create(proto)`。
  - 使用 ES6 的 `class` 和 `extends` 语法。
- **循环引用检查**：若 `prototype` 的某个祖先已经是 `obj`，会抛出 `TypeError`。

---

## 4. 对比总结

| 特性               | `Object.getPrototypeOf`                            | `Object.setPrototypeOf`               |
| ------------------ | -------------------------------------------------- | ------------------------------------- |
| **作用**           | 获取对象的原型                                     | 设置对象的原型                        |
| **性能**           | 快，无副作用                                       | 极慢，破坏引擎优化，不推荐使用        |
| **是否改变原对象** | 否                                                 | 是                                    |
| **替代方案**       | 无（标准获取方式）                                 | `Object.create()`、`class`、`extends` |
| **引入版本**       | ES5                                                | ES6                                   |
| **典型用途**       | 调试、原型链检查、克隆时保留原型、框架内部类型判断 | 理论上可动态修改继承，但实际不应用    |
| **兼容性**         | 广泛（IE9+）                                       | 现代浏览器和 Node.js，但应避免使用    |

**注意**：`Object.setPrototypeOf` 虽然存在，但几乎所有情况下都应避免使用，而使用 `Object.create()` 或 `class` 来建立继承关系。

---

## 5. 总结

- `Object.getPrototypeOf` 是获取对象原型的**标准、安全、高效**方式，应始终使用它替代 `__proto__`。其应用场景包括原型链遍历、类型判断、克隆保留原型、框架内部检测等。
- `Object.setPrototypeOf` 由于性能问题，**不应在生产环境中使用**；创建对象时应使用 `Object.create()` 或 `class/extends` 来定义原型链。仅在极其特殊的元编程或修补遗留代码时谨慎使用，并了解性能代价。
- 理解原型链的获取和设置机制，有助于深入理解 JavaScript 的继承模型，但实际编码中应优先采用声明式的方法（`class`、`Object.create`）而非动态修改原型。
