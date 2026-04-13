---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 31
title: 对象的constructor属性
nav:
  title: JavaScript
  order: 2
---

## 1. constructor 属性介绍

`constructor` 属性返回创建实例对象的**构造函数**的引用。每个对象（除了 `null` 和 `undefined`）都继承自某个原型，而原型对象上默认拥有 `constructor` 属性，指向关联的构造函数。

### 1.1 基本概念

- 每个 JavaScript 函数都有一个 `prototype` 属性，该属性是一个对象，其中默认包含一个 `constructor` 属性，指向函数本身。
- 通过构造函数创建的实例对象，其 `[[Prototype]]`（即 `__proto__`）指向构造函数的 `prototype`，因此实例也可以访问 `constructor` 属性。
- 几乎所有内置对象（如 `Array`、`Boolean`、`Date`、`Function`、`Number`、`Object`、`String` 等）都拥有 `constructor` 属性。少数对象如 `Math`、`JSON` 等没有构造函数，因此没有 `constructor` 属性。

**示例：内置对象的 constructor**

```javascript
let str = 'str';
console.log(str.constructor); // [Function: String]

let number = 1;
console.log(number.constructor); // [Function: Number]

let bool = true;
console.log(bool.constructor); // [Function: Boolean]

let arr = [];
console.log(arr.constructor); // [Function: Array]

let obj = {};
console.log(obj.constructor); // [Function: Object]
```

**注意**：`null` 和 `undefined` 没有 `constructor` 属性，访问会报错。

```javascript
// let nul = null;
// console.log(nul.constructor); // TypeError: Cannot read property 'constructor' of null

// let unde = undefined;
// console.log(unde.constructor); // TypeError: Cannot read property 'constructor' of undefined
```

**示例：自定义对象的 constructor 及控制台输出**

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}
var person1 = new Person('zhangsan', 18);
var person2 = new Person('lisi', 18);
console.log(person1);
```

在浏览器控制台中，上述代码的输出结果（展开后）如下所示：

```
Person
age: 18
name: "zhansan"
[[Prototype]]: Object
    constructor: ƒ Person(name,age)   // 可见这里指向的就是其构造函数
    [[Prototype]]: Object
        constructor: ƒ Object()
        hasOwnProperty: ƒ hasOwnProperty()
        isPrototypeOf: ƒ isPrototypeOf()
        propertyIsEnumerable: ƒ propertyIsEnumerable()
        toLocaleString: ƒ toLocaleString()
        toString: ƒ toString()
        valueOf: ƒ valueOf()
        __defineGetter__: ƒ __defineGetter__()
        __defineSetter__: ƒ __defineSetter__()
        __lookupGetter__: ƒ __lookupGetter__()
        __lookupSetter__: ƒ __lookupSetter__()
        __proto__: （…）
        get __proto__: ƒ __proto__()
        set __proto__: ƒ __proto__()
```

从输出中可以看到，`person1` 实例本身没有 `constructor` 属性，而是从其原型链（`[[Prototype]]`）中继承得到，该 `constructor` 指向 `Person` 构造函数。

```javascript
console.log(person1.constructor === Person); // true
console.log(person1.constructor.name); // "Person"
```

**示例：默认的 constructor**

```javascript
const obj = {};
console.log(obj.constructor === Object); // true
console.log(obj.constructor.name); // "Object"
```

---

## 2. constructor 与 prototype 的对比

在理解 `constructor` 之前，有必要先了解 `prototype`。每个函数（包括构造函数）都有一个 `prototype` 属性，它指向一个对象，该对象包含了由该构造函数创建的所有实例共享的属性和方法。这个 `prototype` 对象内部默认有一个 `constructor` 属性，指向函数本身。

**简单介绍 prototype**：

- `prototype` 是函数独有的属性（普通对象没有）。
- 通过构造函数创建实例时，实例的内部 `[[Prototype]]`（即 `__proto__`）会指向构造函数的 `prototype`。
- `prototype` 用于实现继承和方法共享。

**constructor 与 prototype 的区别与联系**：

| 特性         | `prototype`                       | `constructor`                                   |
| ------------ | --------------------------------- | ----------------------------------------------- |
| **属于谁**   | 函数（Function）                  | 对象（通过原型链访问，通常来自 `prototype`）    |
| **本质**     | 一个对象，用于存储共享属性和方法  | 一个属性，指向创建该对象的构造函数              |
| **主要用途** | 实现继承、方法共享                | 获取对象的构造函数、类型判断、修复继承链        |
| **可变性**   | 可以被完全替换或修改              | 可以被修改，但修改后可能导致不可靠              |
| **默认关系** | `Fn.prototype.constructor === Fn` | 实例通过原型链访问到 `Fn.prototype.constructor` |

**示例：展示 prototype 和 constructor 的关系**

```javascript
function Person(name) {
  this.name = name;
}
console.log(Person.prototype.constructor === Person); // true

const p = new Person('Alice');
console.log(p.constructor === Person); // true
console.log(p.__proto__ === Person.prototype); // true
```

**修改 prototype 的影响**

```javascript
Person.prototype = {
  greet() {
    console.log('Hi');
  },
};
const p2 = new Person('Bob');
console.log(p2.constructor === Person); // false（新原型没有 constructor）
console.log(p2.constructor === Object); // true（沿原型链到 Object）
```

此时需要手动修复 `constructor`：

```javascript
Person.prototype.constructor = Person;
console.log(p2.constructor === Person); // true
```

**总结**：`prototype` 是函数上的属性，用于共享方法；`constructor` 是原型对象上的属性，指向构造函数本身。理解两者关系是掌握 JavaScript 继承的关键。

---

## 3. constructor 与原型链的关系

每个函数都有一个 `prototype` 对象，该对象默认拥有 `constructor` 属性指向函数自身。实例对象的 `constructor` 实际上是从原型链上继承来的。

```javascript
function Animal() {}
console.log(Animal.prototype.constructor === Animal); // true

const a = new Animal();
console.log(a.constructor === Animal); // true（沿着原型链找到 Animal.prototype.constructor）
```

**原型链图解（以 `Person` 构造函数为例）**

```
+----------------+      +-------------------+
| 构造函数 Person |----->| Person.prototype  |
| (函数对象)       |      | (原型对象)         |
+----------------+      +-------------------+
       |                       |
       | 通过 new 创建           | 包含 constructor 属性
       v                       v
+----------------+      +-------------------+
| 实例 person1   |      | constructor: Person|
| (对象)         |      | (其他方法)         |
+----------------+      +-------------------+
       |
       | 内部 [[Prototype]] 指向 Person.prototype
       v
+----------------+
| 原型链查找      |
| person1.constructor  -->  Person.prototype.constructor  -->  Person
+----------------+
```

**文字描述**：

1. 创建构造函数 `Person` 时，自动生成 `Person.prototype` 对象。
2. `Person.prototype` 默认有一个 `constructor` 属性，指向 `Person` 本身。
3. 通过 `new Person()` 创建实例 `person1`，`person1` 的内部 `[[Prototype]]` 指向 `Person.prototype`。
4. 访问 `person1.constructor` 时，沿着原型链找到 `Person.prototype.constructor`，最终得到 `Person`。

### 3.1 修改原型会影响 constructor

如果重写构造函数的 `prototype` 对象，原型的 `constructor` 会丢失，需要手动修复。

```javascript
function Dog() {}
Dog.prototype = { bark: function () {} }; // 重写原型

const d = new Dog();
console.log(d.constructor === Dog); // false（因为新原型中没有 constructor）
console.log(d.constructor === Object); // true（原型链最终指向 Object.prototype.constructor）
```

**图解（修改原型后）**

```
+----------------+      +-------------------+
| 构造函数 Dog    |----->| Dog.prototype     | (被重写)
| (函数对象)       |      | (新对象)          |
+----------------+      +-------------------+
       |                       |
       | 通过 new 创建           | 没有 constructor 属性
       v                       v
+----------------+      +-------------------+
| 实例 d          |      | bark: function    |
+----------------+      +-------------------+
       |
       | 内部 [[Prototype]] 指向新原型
       v
+----------------+
| 原型链查找       |
| d.constructor  -->  新原型没有 constructor  -->  继续向上 -->  Object.prototype.constructor  -->  Object
+----------------+
```

正确做法：手动修复 `constructor` 指向。

```javascript
Dog.prototype.constructor = Dog; // 修复
console.log(d.constructor === Dog); // true
```

---

## 4. constructor 的应用场景

### 4.1 类型判断（有限适用）

`constructor` 可以用于判断基本类型和内置对象的类型，但不如 `Object.prototype.toString.call()` 可靠。

```javascript
console.log('1'.constructor === String); // true
console.log((1).constructor === Number); // true
console.log(true.constructor === Boolean); // true
console.log([].constructor === Array); // true
console.log({}.constructor === Object); // true
console.log(function () {}.constructor === Function); // true
console.log(Symbol().constructor === Symbol); // true
```

局限性：

- `null` 和 `undefined` 无法使用。
- 如果原型被修改，`constructor` 可能不准确。

```javascript
function Fn() {}
Fn.prototype = new Array(); // 改变原型
var f = new Fn();
console.log(f.constructor === Fn); // false
console.log(f.constructor === Array); // true
```

### 4.2 在继承中修复 constructor

在使用原型链继承时，通常需要手动将子类原型上的 `constructor` 指回子类本身。

```javascript
function Animal() {}
function Dog() {}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog; // 修复 constructor

const dog = new Dog();
console.log(dog.constructor === Dog); // true
```

如果不修复，`dog.constructor` 会指向 `Animal`，导致类型判断错误。

---

## 5. constructor 的注意事项

- **易变性**：`constructor` 属性可以被任意修改，因此不能作为判断对象类型的唯一依据。
- **可靠性**：在复杂的继承或多重原型链修改后，`constructor` 可能丢失或指向错误的构造函数。
- **替代方案**：
  - 使用 `instanceof` 操作符判断实例与构造函数的关系。
  - 使用 `Object.prototype.toString.call(obj)` 获取准确的内部 `[[Class]]`。
  - 在构造函数中增加自定义标识（如 `obj.__type = 'MyClass'`）。

**示例：constructor 被修改**

```javascript
function Person() {}
Person.prototype.constructor = function NotPerson() {};

const p = new Person();
console.log(p.constructor === Person); // false
console.log(p.constructor.name); // "NotPerson"
```

因此，依赖 `constructor` 进行业务逻辑需要谨慎。

---

## 6. 关于 constructor 链的常见疑问

**疑问**：如果某个对象的 `constructor` 不是指定的构造函数，但该对象的 `constructor` 的 `constructor` 却是指定的构造函数，这种情况存在吗？该如何理解？

**解答**：要理解这个问题，需要先明确两点：

1. 每个对象（包括函数）都有 `constructor` 属性（除非被删除或覆盖）。
2. 函数本身也是对象，函数的 `constructor` 属性指向 `Function` 构造函数（因为所有函数都是 `Function` 的实例）。

### 6.1 基本关系

```javascript
function Foo() {}
const obj = new Foo();
console.log(obj.constructor === Foo); // true
console.log(Foo.constructor === Function); // true
console.log(Function.constructor === Function); // true（Function 指向自身）
```

### 6.2 修改 obj.constructor 的情况

如果人为修改 `obj.constructor = Bar`，那么：

- `obj.constructor` 指向 `Bar`（一个函数）。
- `obj.constructor.constructor` 即 `Bar.constructor`，指向 `Function`（因为任何普通函数都是 `Function` 的实例）。

此时 `obj.constructor.constructor` 并不会等于原始的 `Foo`，而是 `Function`。

```javascript
function Bar() {}
const obj = new Foo();
obj.constructor = Bar;
console.log(obj.constructor === Bar); // true
console.log(obj.constructor.constructor === Function); // true
console.log(obj.constructor.constructor === Foo); // false
```

### 6.3 是否存在“constructor 的 constructor”回到原构造函数？

一般情况下**不会**。要让 `obj.constructor.constructor === Foo`，需要 `obj.constructor` 本身是一个函数，且该函数的 `constructor` 属性指向 `Foo`。这意味着 `obj.constructor` 必须是 `Foo` 的实例（即 `obj.constructor` 是由 `Foo` 构造出来的）。但 `Foo` 是构造函数，通常用于创建普通对象，而不是创建函数。除非 `Foo` 返回了一个函数，但这种做法非常罕见且不符合常规。

```javascript
function Foo() {
  return function () {};
}
const weird = new Foo();
console.log(weird.constructor); // 返回的函数没有特殊 constructor，通常指向 Function
```

因此，这种链式依赖并不可靠，也不应该作为判断类型的依据。

### 6.4 正确的理解方式

- `obj.constructor` 通常指向创建 `obj` 的构造函数（除非被修改或原型链中断）。
- `obj.constructor.constructor` 指向创建该构造函数的构造函数（通常是 `Function`）。
- 不要依赖 `constructor.constructor` 来反向查找原始构造函数，这很容易出错且难以维护。

**最佳实践**：使用 `instanceof` 或 `Object.prototype.toString.call()` 进行类型判断，避免依赖多层 `constructor` 属性。

---

## 7. 总结

| 特性         | 说明                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| **定义**     | 每个对象的原型链上默认有一个 `constructor` 属性，指向创建该对象的构造函数。 |
| **访问方式** | `obj.constructor`                                                           |
| **用途**     | 获取对象的构造函数、类型判断（有限）、修复继承链。                          |
| **注意事项** | `null`/`undefined` 无此属性；原型被重写后需手动修复；属性可被篡改，不可信。 |
| **推荐替代** | 类型判断用 `Object.prototype.toString.call()`；实例关系用 `instanceof`。    |

**最佳实践**：

- 在实现继承时，务必修复子类的 `constructor` 指向。
- 不要过度依赖 `constructor` 进行类型检查，尤其是在框架或库代码中。
- 理解 `constructor` 是原型链的一部分，有助于掌握 JavaScript 的面向对象本质。
