---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 3
title: hasOwnProperty方法介绍
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

`hasOwnProperty` 是 JavaScript 中用于检查**对象自身**是否包含指定属性的方法。它不会检查对象原型链上的属性，只关心对象本身直接拥有的属性。

**语法规则**

```javascript
obj.hasOwnProperty(prop)
```

**参数**
- `prop`：必需。要检查的属性名，可以是字符串或 `Symbol` 类型。

**返回值**
- 布尔值：`true` 表示对象自身具有该属性；`false` 表示没有该属性或该属性来自原型链。

**描述**
所有继承自 `Object.prototype` 的对象都会获得 `hasOwnProperty` 方法。该方法会忽略从原型链上继承的属性，只检测对象自身的属性。

---

## 2. hasOwnProperty 的原理

### 2.1 内部机制

`hasOwnProperty` 是 `Object.prototype` 上的一个方法。当一个对象调用该方法时，JavaScript 引擎会执行以下步骤：

1. 获取调用对象（`this` 值）。
2. 检查该对象是否拥有一个**自身属性**（own property），其键名等于传入的 `prop`。
3. 如果存在，返回 `true`；否则返回 `false`。

**关键点**：该方法不会沿着对象的 `[[Prototype]]` 链（即原型链）向上查找。它只检查对象本身直接定义的属性，包括：
- 直接在对象上定义的属性（如 `obj.name = 'value'`）。
- 通过 `Object.defineProperty` 定义的属性。
- 在构造函数中通过 `this.prop = value` 添加的属性。

### 2.2 与 `in` 操作符的区别

- `in` 操作符会检查原型链：`'prop' in obj` 如果 `prop` 存在于对象自身或原型链中的任何位置，都返回 `true`。
- `hasOwnProperty` 只检查自身，忽略原型链。

```javascript
function Parent() { this.parentProp = 'parent'; }
Parent.prototype.shared = 'shared';
const child = new Parent();
console.log('shared' in child);               // true（原型链上有）
console.log(child.hasOwnProperty('shared'));  // false（不是自身属性）
```

### 2.3 实现思路（伪代码）

在 JavaScript 引擎内部，`hasOwnProperty` 的行为类似于以下逻辑：

```javascript
// 伪代码，不是真正的实现
Object.prototype.hasOwnProperty = function(prop) {
  // 将 this 转为对象（处理原始值装箱）
  const obj = Object(this);
  // 获取对象的自身属性列表
  const ownKeys = Object.getOwnPropertyNames(obj);
  // 同时检查 Symbol 属性
  const ownSymbols = Object.getOwnPropertySymbols(obj);
  const allOwnKeys = ownKeys.concat(ownSymbols);
  // 判断 prop 是否在自身属性列表中
  return allOwnKeys.includes(prop);
};
```

实际引擎（如 V8）会利用对象的**隐藏类（Hidden Class）**和**属性表**进行高效查找，无需构建完整属性列表。

### 2.4 底层实现简述

在 V8 引擎中，JavaScript 对象在内存中以**隐藏类 + 属性数组**的形式存储。每个属性有一个指向其值的指针。`hasOwnProperty` 的快速路径是：
- 通过隐藏类定位属性的偏移量。
- 检查该偏移量是否在对象的属性存储范围内，且该属性不是从原型继承的。

如果属性不存在于对象自身的存储中，直接返回 `false`，不访问原型。

---

## 3. 为什么使用 hasOwnProperty

在使用 `for...in` 循环遍历对象属性时，循环会枚举对象自身的所有可枚举属性以及其原型链上的可枚举属性。很多时候我们只关心对象自身的属性，这时就可以用 `hasOwnProperty` 来过滤。

**示例：过滤原型链属性**

```javascript
function MyConstructor() {
  this.ownProp = 'value';
}
MyConstructor.prototype.inheritedProp = 'value';

const instance = new MyConstructor();

for (const prop in instance) {
  if (instance.hasOwnProperty(prop)) {
    console.log(prop); // 只输出 "ownProp"
  }
}
```

---

## 4. 基本用法示例

### 4.1 判断自身属性是否存在

```javascript
let obj = new Object();
obj.name = 'zjh';

function change() {
  obj.newName = 'lisi';
  delete obj.name;
}

console.log(obj.hasOwnProperty('name')); // true
change();
console.log(obj.hasOwnProperty('name'));    // false
console.log(obj.hasOwnProperty('newName')); // true
```

### 4.2 自身属性与继承属性的区别

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}
const obj = new Person('zhangsan', 18);
console.log(obj.hasOwnProperty('name'));      // true（自身属性）
console.log(obj.hasOwnProperty('toString'));  // false（继承自 Object）
console.log(obj.hasOwnProperty('hasOwnProperty')); // false（继承自 Object）

// 给原型添加属性
Person.prototype.sex = 'nan';
console.log(obj.hasOwnProperty('sex'));       // false（原型属性）
```

### 4.3 使用 hasOwnProperty 遍历自身属性

配合 `for...in` 只输出对象自身的属性，忽略继承属性。

```javascript
for (let k in obj) {
  if (obj.hasOwnProperty(k)) {
    console.log("自身属性：" + k);
  } else {
    console.log("继承属性：" + k);
  }
}
// 输出：自身属性：name、自身属性：age、继承属性：sex
```

---

## 5. 注意事项

### 5.1 hasOwnProperty 可能被覆盖

如果对象自身定义了 `hasOwnProperty` 属性（例如一个方法），那么原型的 `hasOwnProperty` 就会被覆盖，导致调用结果异常。

```javascript
const obj = {
  name: 'zhangsan',
  hasOwnProperty: function() {
    return false;   // 总是返回 false
  }
};
console.log(obj.hasOwnProperty('name')); // false（错误的结果）
```

**解决方法**：使用原型链上的 `hasOwnProperty` 方法，并通过 `call` 调用。

```javascript
console.log(Object.prototype.hasOwnProperty.call(obj, 'name')); // true
// 或者
console.log(({}).hasOwnProperty.call(obj, 'name')); // true
```

### 5.2 不能检测从原型继承的属性

`hasOwnProperty` 只关注对象自身属性，对于原型链上的属性（包括手动添加到原型上的属性）都会返回 `false`。

### 5.3 适用于所有对象

只要对象继承自 `Object.prototype`（绝大多数普通对象），都可以使用 `hasOwnProperty`。通过 `Object.create(null)` 创建的对象没有原型，也就没有 `hasOwnProperty` 方法，此时可以用 `Object.prototype.hasOwnProperty.call(obj, prop)` 进行检测。

```javascript
const obj = Object.create(null);
obj.name = 'test';
// obj.hasOwnProperty('name') // 报错：obj.hasOwnProperty is not a function
console.log(Object.prototype.hasOwnProperty.call(obj, 'name')); // true
```

---

## 6. 总结

| 特性             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **作用**         | 判断对象自身是否包含指定属性（不检查原型链）。               |
| **返回值**       | `true`（自身有） / `false`（自身没有或来自原型链）。         |
| **原理**         | 直接检查对象自身的属性表，不遍历原型链；引擎利用隐藏类等机制高效实现。 |
| **典型场景**     | 配合 `for...in` 过滤原型属性；在继承中确认属性归属。         |
| **注意事项**     | 对象可能覆盖 `hasOwnProperty` 属性；`Object.create(null)` 创建的对象没有该方法。 |
| **推荐用法**     | 正常情况使用 `obj.hasOwnProperty(prop)`；若不可靠则使用 `Object.prototype.hasOwnProperty.call(obj, prop)`。 |

`hasOwnProperty` 是 JavaScript 对象属性检查的重要工具，正确使用可以避免原型链干扰，提高代码健壮性。
