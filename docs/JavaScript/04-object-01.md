---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 1
title: 理解面向对象及创建对象的方法
nav:
  title: JavaScript
  order: 2
---

## 1. 面向对象介绍

面向对象是程序中一个非常重要的思想，简而言之就是：**程序中的所有操作都需要通过对象来完成**。

- 操作浏览器要使用 `window` 对象。
- 操作网页要使用 `document` 对象。
- 操作控制台要使用 `console` 对象。

一切操作都要通过对象，这就是所谓的**面向对象**。

那么对象到底是什么？计算机程序的本质是对现实事物的**抽象**。例如，照片是对人的抽象，汽车模型是对汽车的抽象。程序中也一样，一个事物到了程序中就成为了**对象**。

在程序中，对象被分为两个部分：**数据**和**功能**。以人为例：

- 姓名、性别、年龄等 → **属性**（数据）
- 说话、吃饭、睡觉等 → **方法**（功能）

**简而言之：在程序中，一切皆对象。**

---

## 2. 对象分类

ECMAScript 可以识别两种类型的对象：**Native Object（本地对象）** 和 **Host Object（宿主对象）**。

### 2.1 Native Object（本地对象）

JavaScript 语言提供的不依赖于执行宿主的对象。其中一些是**内建对象**（Build-in Object），如 `Global`、`Math`；另一些是在脚本运行环境中创建来使用的，如 `Array`、`Boolean`、`Date`、`Function`、`Number`、`Object`、`RegExp`、`Error` 等。

> 内建对象都是 Native Object。

### 2.2 Host Object（宿主对象）

JavaScript 语言提供的**依赖于宿主环境**的对象。所有非 Native Object 的对象都是宿主对象，例如：

- 浏览器中的 `window` 对象
- `WScript` 中的 `wscript` 实例
- 任何用户创建的类

---

## 3. 创建对象的方法

### 3.1 通过 `{}` 创建对象（对象字面量）

```javascript
let obj = {}; // 等同于 new Object()
obj.name = 'zjh';
obj.age = 18;
console.log(obj); // { name: 'zjh', age: 18 }
```

如果对象不需要重复创建，这种方式比较方便。

### 3.2 通过 `new Object()` 创建对象

```javascript
const obj = new Object();
obj.name = 'zjh';
obj.age = 18;
console.log(obj); // { name: 'zjh', age: 18 }
```

### 3.3 使用字面量创建对象（简写形式）

```javascript
let obj = { name: 'zjh', age: 18 };
```

完全等价于上面两种方法。

**问题**：前面三种创建对象的方式存在两个问题：

1. **代码冗余**：如果需要创建多个相似对象，重复代码多。
2. **方法不能共享**：每个对象中的方法都是独立的，占用内存。

### 3.4 工厂模式创建对象

使用一个函数来创建对象，减少重复代码。

```javascript
function createObject(name) {
  let obj = new Object();
  obj.name = name;
  obj.sayName = function () {
    console.log(this.name);
  };
  return obj;
}

var obj1 = createObject('zjh');
var obj2 = createObject('ln');
obj1.sayName(); // zjh
obj2.sayName(); // ln
console.log(obj1.sayName === obj2.sayName); // false
```

**优点**：解决了代码重复的问题。  
**缺点**：方法仍然不能共享（每个对象的方法独立）。

### 3.5 构造函数模式

构造函数本质也是普通函数，但约定首字母大写，通过 `new` 关键字调用。

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.speak = function () {
    console.log(this.name);
  };
}

const person1 = new Person('zhangsan', 18);
const person2 = new Person('lisi', 21);
console.log(person1); // Person { name: 'zhangsan', age: 18, speak: [Function] }
console.log(person2); // Person { name: 'lisi', age: 21, speak: [Function] }
console.log(person1.speak === person2.speak); // false
console.log(person1.constructor === Person); // true
console.log(person1.constructor === person2.constructor); // true
```

**缺点**：方法仍然独立存在于每个对象，不能共享。

### 3.6 原型模式

每个函数都有一个 `prototype` 属性（原型对象），通过原型添加的属性和方法可以被所有实例共享。

```javascript
function Demo() {}
Demo.prototype.name = 'demo';
Demo.prototype.sayName = function () {
  console.log(this.name);
};

const demo1 = new Demo();
const demo2 = new Demo();
console.log(demo1); // Demo {}
console.log(demo2); // Demo {}
console.log(demo1 === demo2); // false
demo1.sayName(); // demo
console.log(demo1.sayName === demo2.sayName); // true
```

**属性访问顺序**：先查找对象自身属性，如果没有则沿着原型链向上查找（对象 → 构造函数.prototype → ... → Object.prototype）。

```javascript
demo1.name = 'demo1';
demo1.sayName(); // demo1（对象自身属性覆盖原型属性）
```

**原型模式的缺点**：如果原型中包含**引用类型**的属性，那么一个实例修改该属性会影响所有实例。

```javascript
function Demo() {}
Demo.prototype = {
  name: 'demo',
  friends: ['demo1', 'demo2'],
};
var d1 = new Demo();
var d2 = new Demo();
d2.friends.push('demo3');
console.log(d1.friends); // ['demo1', 'demo2', 'demo3']
console.log(d2.friends); // ['demo1', 'demo2', 'demo3']
```

### 3.7 组合模式（构造函数 + 原型）

将**实例属性**放在构造函数中（每个实例独立），将**共享方法**放在原型上。这是最常用的方式。

```javascript
function Demo(name) {
  this.name = name;
  this.friends = ['demo1', 'demo2']; // 每个实例独立
}
Demo.prototype.sayName = function () {
  // 共享方法
  console.log(this.name);
};

var d1 = new Demo('d1');
var d2 = new Demo('d2');
d1.friends.push('demo3');
console.log(d1.friends); // ['demo1', 'demo2', 'demo3']
console.log(d2.friends); // ['demo1', 'demo2']  不受影响
```

**优点**：解决了代码冗余、方法共享、引用类型相互影响的问题。

### 3.8 ES6 class 创建对象（详细说明）

ES6 引入了 `class` 关键字，它是基于构造函数和原型链的**语法糖**，让面向对象的写法更清晰、更接近传统语言（如 Java、C++）。

#### 3.8.1 类声明与类表达式

```javascript
// 类声明
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }
}

// 类表达式（匿名类）
const Animal = class {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes a sound.`);
  }
};
```

#### 3.8.2 构造函数 `constructor`

`constructor` 是类的默认方法，通过 `new` 生成实例时自动调用。一个类必须有 `constructor`，如果没有显式定义，JavaScript 会默认添加一个空构造函数。

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
const p = new Point(3, 4);
console.log(p.x, p.y); // 3 4
```

#### 3.8.3 实例方法

在类中定义的方法，会被添加到原型对象上，所有实例共享。

```javascript
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  // 实例方法（放在原型上）
  getArea() {
    return this.width * this.height;
  }
}
const rect = new Rectangle(5, 10);
console.log(rect.getArea()); // 50
console.log(rect.hasOwnProperty('getArea')); // false（方法在原型上）
console.log(Rectangle.prototype.getArea === rect.getArea); // true
```

#### 3.8.4 静态方法（static）

使用 `static` 关键字定义的方法，属于类本身，而不是实例。静态方法通常用于工具函数。

```javascript
class MathUtil {
  static add(a, b) {
    return a + b;
  }
}
console.log(MathUtil.add(2, 3)); // 5
// 实例无法调用静态方法
const util = new MathUtil();
// console.log(util.add(2, 3)); // TypeError: util.add is not a function
```

#### 3.8.5 静态属性

ES2022 正式支持静态属性（此前可用 `类名.属性名` 模拟）。

```javascript
class MyClass {
  static myStaticProp = 42;
}
console.log(MyClass.myStaticProp); // 42
```

#### 3.8.6 实例属性（新提案，ES2022）

可以直接在类顶层定义实例属性，无需写在构造函数中。

```javascript
class Car {
  wheels = 4; // 实例属性，默认值
  color;
  constructor(color) {
    this.color = color;
  }
}
const myCar = new Car('red');
console.log(myCar.wheels); // 4
console.log(myCar.color); // red
```

#### 3.8.7 类的继承（extends）

使用 `extends` 关键字实现继承，子类可以调用 `super` 访问父类的构造函数和方法。

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes a sound.`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 必须调用父类构造函数
    this.breed = breed;
  }
  speak() {
    super.speak(); // 调用父类方法
    console.log(`${this.name} barks.`);
  }
}

const d = new Dog('Buddy', 'Golden');
d.speak();
// 输出：
// Buddy makes a sound.
// Buddy barks.
```

**注意**：子类必须在 `constructor` 中调用 `super()`，否则会报错。且只有调用 `super` 之后才能使用 `this`。

#### 3.8.8 类的本质

ES6 的类本质上仍然是函数，`typeof` 类返回 `'function'`。

```javascript
class Person {}
console.log(typeof Person); // 'function'
console.log(Person === Person.prototype.constructor); // true
```

#### 3.8.9 类与组合模式的等价性

以下两种写法在功能上等价：

```javascript
// ES6 class 写法
class Demo {
  constructor(name) {
    this.name = name;
    this.friends = ['demo1', 'demo2'];
  }
  sayName() {
    console.log(this.name);
  }
}

// 组合模式（构造函数+原型）等价写法
function Demo(name) {
  this.name = name;
  this.friends = ['demo1', 'demo2'];
}
Demo.prototype.sayName = function () {
  console.log(this.name);
};
```

#### 3.8.10 使用注意

- 类内部默认使用**严格模式**。
- 类不存在变量提升（hoisting），必须先声明后使用。
- 类的方法不可枚举（`enumerable` 为 `false`），而构造函数原型上的方法默认是可枚举的（但通常不依赖此特性）。

---

## 4. 实例对象与函数对象

### 4.1 实例对象

通过 `new` 函数产生的对象称为**实例对象**，简称**对象**。

```javascript
var person = new Object(); // person 是 Object 的实例
var person = {}; // 对象字面量，也是对象
```

> 实例都是对象，但对象不全是实例（例如 `Object.prototype` 是对象，但不是实例）。

### 4.2 函数对象

当函数被当作对象使用时，称为**函数对象**。

```javascript
function Fn() {} // 定义函数
const fn = new Fn(); // fn 是实例对象
console.log(fn); // Fn {}
console.log(Fn.prototype); // {constructor: ƒ}
console.log(Fn.bind()); // 函数对象才有 bind 方法
```

- 每创建一个函数，该函数自动拥有 `prototype` 属性（函数对象）。
- 只有函数对象才有 `bind`、`call`、`apply` 等方法，普通对象没有。

---

## 5. 总结

| 创建方式              | 优点                 | 缺点                              |
| --------------------- | -------------------- | --------------------------------- |
| 字面量 / `new Object` | 简单直观             | 代码冗余，方法不共享              |
| 工厂模式              | 解决代码冗余         | 方法仍不共享                      |
| 构造函数              | 每个实例独立属性     | 方法不共享，内存浪费              |
| 原型模式              | 方法共享             | 引用类型属性会被所有实例共享      |
| 组合模式（推荐）      | 属性独立，方法共享   | 需要写两段代码（构造函数 + 原型） |
| ES6 class（推荐）     | 语法清晰，接近传统类 | 需要理解底层原型链机制            |

**最佳实践**：推荐使用 **组合模式** 或 **ES6 class** 创建对象。如果项目环境支持 ES6，优先使用 `class`，代码更简洁易读。

---

## 6. 扩展：原型链示意图

```
实例对象.__proto__ === 构造函数.prototype
构造函数.prototype.constructor === 构造函数
构造函数.prototype.__proto__ === Object.prototype
Object.prototype.__proto__ === null
```

理解原型链是掌握 JavaScript 面向对象的关键。
