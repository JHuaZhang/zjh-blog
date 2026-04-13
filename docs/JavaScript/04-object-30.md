---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 30
title: 构造函数
nav:
  title: JavaScript
  order: 2
---

## 1. 构造函数介绍

在 JavaScript 中，构造函数是用来**创建特定类型对象**的特殊函数。构造函数在使用 `new` 关键字创建新对象实例时被调用，是实现“类”行为及模拟面向对象设计模式的核心机制。

**构造函数的约定**：

1. 函数名通常以**大写字母开头**（约定俗成，非语法强制）。
2. 通过 `this` 关键字给新创建的对象设置属性和方法。
3. 不需要显式返回值。如果没有返回其他对象，`new` 操作符将返回新创建的对象。

在 ES6 引入 `class` 之前，构造函数是创建具有相似属性和方法的多个对象的传统方式。

### 1.1 ES5 及之前版本的构造函数示例

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.greet = function () {
    console.log('Hello, my name is ' + this.name + ' and I am ' + this.age + ' years old.');
  };
}

var person1 = new Person('Alice', 30);
person1.greet(); // Hello, my name is Alice and I am 30 years old.

var person2 = new Person('Bob', 25);
person2.greet(); // Hello, my name is Bob and I am 25 years old.
```

### 1.2 ES6+ 类语法（本质仍是构造函数）

ES6 引入的 `class` 关键字是构造函数的**语法糖**，内部仍然依赖原型链和构造函数。

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  greet() {
    console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
  }
}

const person1 = new Person('Alice', 30);
person1.greet();
```

无论使用哪种方式，JavaScript 都提供了灵活的对象创建方法。

---

## 2. 构造函数中的 this 指向

`this` 在 JavaScript 中的指向**取决于函数的调用方式**。对于构造函数，其 `this` 的行为尤为重要。

### 2.1 作为普通函数调用时

如果一个函数没有通过 `new` 调用，而是直接执行，此时 `this` 指向**全局对象**（浏览器中是 `window`，Node.js 中是 `global`），在严格模式下则为 `undefined`。

```javascript
function Person(name) {
  this.name = name;
  console.log(this); // 非严格模式：window；严格模式：undefined
}
Person('Alice'); // 忘记写 new
console.log(window.name); // 'Alice'（非严格模式）
```

这会导致意外地创建或修改全局变量，因此**必须使用 `new` 调用构造函数**。

### 2.2 通过 new 调用时

当使用 `new` 关键字调用函数时，会发生以下步骤：

1. 创建一个新的空对象。
2. 将该新对象的原型指向构造函数的 `prototype` 属性。
3. 将构造函数内部的 `this` 绑定到该新对象。
4. 执行构造函数内部的代码。
5. 如果构造函数返回一个对象，则返回该对象；否则返回步骤1创建的新对象。

因此，构造函数内的 `this` 指向**即将返回的新实例**。

```javascript
function Car(make) {
  this.make = make; // this 指向新创建的对象
  console.log(this); // Car { make: 'Toyota' }
}
const myCar = new Car('Toyota');
console.log(myCar.make); // 'Toyota'
```

### 2.3 在构造函数的方法中使用 this

构造函数内部定义的方法中，`this` 的指向取决于**方法如何被调用**。如果将方法作为实例的属性调用（如 `obj.method()`），则方法内的 `this` 指向该实例。

```javascript
function Person(name) {
  this.name = name;
  this.sayName = function () {
    console.log(this.name);
  };
}
const p = new Person('Alice');
p.sayName(); // 'Alice'（this 指向 p）
```

如果将方法单独提取出来调用，`this` 可能丢失：

```javascript
const say = p.sayName;
say(); // undefined（非严格模式）或报错（严格模式），因为 this 变为全局或 undefined
```

### 2.4 箭头函数作为构造函数方法

箭头函数没有自己的 `this`，它的 `this` 继承自外部作用域。因此**箭头函数不能用作构造函数**（不能使用 `new` 调用），但可以在构造函数内部作为方法使用，此时它的 `this` 指向外层（即构造函数实例）。

```javascript
function Person(name) {
  this.name = name;
  this.sayName = () => {
    console.log(this.name); // this 继承自构造函数作用域，永远指向实例
  };
}
const p = new Person('Alice');
const say = p.sayName;
say(); // 'Alice'（依然正确，因为箭头函数 this 固定）
```

### 2.5 类中的 this

ES6 类中的方法默认绑定到实例（但不会自动绑定，需要注意事件处理等场景）。类中的 `constructor` 方法中的 `this` 指向新创建的实例。

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  sayName() {
    console.log(this.name);
  }
}
const p = new Person('Alice');
p.sayName(); // 'Alice'

// 解绑后 this 丢失
const say = p.sayName;
say(); // TypeError: Cannot read property 'name' of undefined
```

解决方案：使用箭头函数类属性或绑定 `this`。

```javascript
class Person {
  constructor(name) {
    this.name = name;
    this.sayName = () => {
      console.log(this.name);
    };
  }
}
```

### 2.6 总结：构造函数的 this 绑定规则

| 调用方式               | this 指向                                |
| ---------------------- | ---------------------------------------- |
| 普通函数调用（非严格） | 全局对象（window/global）                |
| 普通函数调用（严格）   | `undefined`                              |
| `new` 调用             | 新创建的实例对象                         |
| 箭头函数               | 无自己的 `this`，继承外层作用域的 `this` |
| 类中的普通方法         | 实例（但容易丢失，需绑定）               |

**最佳实践**：

- 始终使用 `new` 调用构造函数。
- 如果希望方法不丢失 `this`，可以使用箭头函数定义，或手动 `bind`。
- 避免直接调用构造函数而不加 `new`，可以使用 `new.target` 检测或 `instanceof` 防护。

---

## 3. 构造函数的参数和返回值

### 3.1 构造函数的参数

使用 `new` 调用构造函数时，可以传递参数。在构造函数内部，通过 `this` 引用新创建的对象，并将参数赋值给属性。

```javascript
function Car(make, model, year) {
  this.make = make;
  this.model = model;
  this.year = year;
}

var myCar = new Car('Honda', 'Civic', 2014);
console.log(myCar.make); // Honda
console.log(myCar.model); // Civic
console.log(myCar.year); // 2014
```

### 3.2 构造函数的返回值

构造函数**通常不需要显式返回值**。当通过 `new` 调用时：

- 如果构造函数没有 `return` 语句，或返回一个**非对象类型**（如数字、字符串、布尔值），则自动返回新创建的对象（`this`）。
- 如果构造函数**显式返回一个对象**，则该对象会取代默认的新对象。

```javascript
function Car(make, model, year) {
  this.make = make;
  // ... 其他初始化
  // 没有返回语句，默认返回 this
}

var myCar = new Car('Honda', 'Civic', 2014);
console.log(myCar instanceof Car); // true
```

显式返回对象的例子：

```javascript
function Car(make, model, year) {
  this.make = make;
  // 显式返回一个完全不同的对象
  return {
    make: 'Ford',
    model: 'Fusion',
    year: 2015,
  };
}

var myCar = new Car('Honda', 'Civic', 2014);
console.log(myCar.make); // Ford （不是 Honda）
```

**注意**：一般情况下，不要显式返回对象，否则会破坏构造函数的正常行为。

---

## 4. 构造函数的继承

### 4.1 ES5 及之前的原型链继承

在 ES5 中，继承通过**原型链**实现。基本步骤：

1. 定义父构造函数。
2. 将方法添加到父构造函数的原型上。
3. 子构造函数内部调用父构造函数（使用 `call` 或 `apply`）。
4. 设置子构造函数的原型为 `Object.create(父构造函数.prototype)`。
5. 修复子构造函数的 `constructor` 指向。

```javascript
// 父构造函数
function Parent(name) {
  this.name = name;
}

Parent.prototype.greet = function () {
  console.log('Hello from Parent, ' + this.name);
};

// 子构造函数
function Child(name, age) {
  Parent.call(this, name); // 继承属性
  this.age = age;
}

// 继承原型方法
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child; // 修复 constructor 指向

// 可以重写或添加子类方法
Child.prototype.greet = function () {
  console.log('Hello from Child, ' + this.name + ', age ' + this.age);
};

var child = new Child('Alice', 10);
child.greet(); // Hello from Child, Alice, age 10
```

### 4.2 ES6 的 class 语法继承

使用 `extends` 和 `super` 更直观。

```javascript
class Parent {
  constructor(name) {
    this.name = name;
  }
  greet() {
    console.log('Hello from Parent, ' + this.name);
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name); // 调用父类构造函数
    this.age = age;
  }
  greet() {
    console.log('Hello from Child, ' + this.name + ', age ' + this.age);
  }
}

const child = new Child('Alice', 10);
child.greet(); // Hello from Child, Alice, age 10
```

---

## 5. 构造函数的使用场景

### 5.1 封装对象数据和方法

将相关的数据（属性）和功能（方法）封装在一个构造函数中，提高模块化和可维护性。

```javascript
function Car(make, model, year) {
  this.make = make;
  this.model = model;
  this.year = year;
  this.displayInfo = function () {
    return `${this.make} ${this.model} (${this.year})`;
  };
}

const myCar = new Car('Toyota', 'Corolla', 2020);
console.log(myCar.displayInfo()); // Toyota Corolla (2020)
```

### 5.2 创建可复用的对象模板

构造函数为相似对象提供“模板”，减少重复代码。

```javascript
function Employee(name, position) {
  this.name = name;
  this.position = position;
}

const emp1 = new Employee('Alice', 'Developer');
const emp2 = new Employee('Bob', 'Manager');
```

### 5.3 与原型链配合实现继承

构造函数与原型链协同工作，实现属性和方法的继承，减少内存占用。

```javascript
function Person(firstName, lastName) {
  this.firstName = firstName;
  this.lastName = lastName;
}
Person.prototype.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

function Employee(firstName, lastName, position) {
  Person.call(this, firstName, lastName);
  this.position = position;
}
Employee.prototype = Object.create(Person.prototype);
Employee.prototype.constructor = Employee;

const emp = new Employee('Alice', 'Smith', 'Lead Developer');
console.log(emp.getFullName() + ', ' + emp.position); // Alice Smith, Lead Developer
```

### 5.4 实现封装和私有属性

通过闭包在构造函数中模拟私有属性（ES2020 之前）。

```javascript
function Counter() {
  let count = 0; // 私有变量

  this.increment = function () {
    count++;
    console.log(count);
  };
  this.decrement = function () {
    count--;
    console.log(count);
  };
}

const counter = new Counter();
counter.increment(); // 1
counter.decrement(); // 0
// 无法直接访问 count 变量
```

---

## 6. 总结

| 特性          | 说明                                                        |
| ------------- | ----------------------------------------------------------- |
| **定义**      | 用于创建对象的特殊函数，通常首字母大写。                    |
| **调用方式**  | 必须使用 `new` 关键字。                                     |
| **this 指向** | 通过 `new` 调用时指向新实例；直接调用则指向全局/undefined。 |
| **返回值**    | 默认返回新对象，若显式返回对象则覆盖默认行为。              |
| **继承方式**  | ES5 通过原型链 + `call`/`apply`；ES6 使用 `class extends`。 |
| **使用场景**  | 封装对象、创建模板、实现继承、模拟私有属性等。              |

**最佳实践**：

- 在 ES6+ 环境中，优先使用 `class` 语法，更清晰易读。
- 始终使用 `new` 调用构造函数，避免污染全局。
- 理解构造函数的 `this` 绑定规则，避免方法丢失 `this`。
- 掌握原型链继承原理，即使使用 `class` 也需知其本质。
