---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 5
title: Object.defineProperties详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

`Object.defineProperties` 方法直接在一个对象上**定义新属性**或**修改现有属性**，并返回该对象。与 `Object.defineProperty` 不同，它可以**同时定义或修改多个属性**，每个属性可以单独配置自己的描述符。

**语法**

```javascript
Object.defineProperties(obj, props);
```

**参数**

- `obj`：要在其上定义或修改属性的对象。
- `props`：一个对象，其键为属性名，值为对应属性的描述符对象。

**返回值**：修改后的对象。

**基础使用示例**

```javascript
const obj = {};

Object.defineProperties(obj, {
  name: { value: '张三', writable: true, enumerable: true },
  age: { value: 25, writable: false, enumerable: true },
});

console.log(obj.name); // '张三'
obj.age = 30; // 无效，因为 writable: false
console.log(obj.age); // 25
```

---

## 2. 原理

`Object.defineProperties` 的内部实现可以概括为以下步骤：

1. **类型转换**：将第一个参数 `obj` 转换为对象类型（如果传入原始值，会先进行装箱）。
2. **获取属性列表**：获取第二个参数 `props` 的所有**自有属性键**（包括字符串和 `Symbol`，不包括继承属性）。这一步相当于 `Reflect.ownKeys(props)`。
3. **遍历属性键**：对每个属性键 `key`，执行以下操作：
   - 从 `props` 中取出对应的描述符对象 `desc`。
   - 调用内部的 `DefineOwnProperty` 抽象操作，将 `obj` 的 `key` 属性按照 `desc` 的定义进行设置。
   - 该内部操作与 `Object.defineProperty` 完全一致，会校验描述符的合法性（如不能同时指定 `value` 和 `get`），并更新对象的内部属性表。
4. **返回对象**：操作完成后返回修改后的 `obj`。

本质上，`Object.defineProperties` 可以看作是循环调用 `Object.defineProperty` 的语法糖，但引擎内部可能对此进行了优化（例如一次完成所有属性的验证和添加，减少中间状态）。它与多次调用 `defineProperty` 的主要区别在于：

- **原子性**：如果某个属性的描述符非法，整个操作会抛出错误，`obj` 可能部分属性已被修改（规范未要求回滚，实际行为取决于引擎）。
- **性能**：一次遍历和多次调用相比，性能差异很小，但在定义大量属性时，使用 `defineProperties` 可以减少函数调用开销。

---

## 3. 属性描述符

每个属性的描述符与 `Object.defineProperty` 完全一致，分为**数据描述符**和**存取描述符**，两者不能混用。

**公共可选键**（数据描述符和存取描述符都支持）：

- **`configurable`**：布尔值，表示属性的描述符是否能被改变，以及属性是否能被删除。默认为 `false`。
- **`enumerable`**：布尔值，表示属性是否可以在 `for...in` 循环和 `Object.keys()` 中被枚举。默认为 `false`。

**数据描述符特有键**：

- **`value`**：与属性关联的值，默认为 `undefined`。
- **`writable`**：布尔值，表示属性的值是否可以被赋值运算符改变。默认为 `false`。

**存取描述符特有键**：

- **`get`**：作为属性的 getter 函数，如果没有则 `undefined`。
- **`set`**：作为属性的 setter 函数，如果没有则 `undefined`。

**注意**：如果同时使用数据描述符和存取描述符（例如同时指定 `value` 和 `get`），会抛出错误。

---

## 4. 基本用法示例

### 4.1 同时定义多个属性

```javascript
const obj = {};

Object.defineProperties(obj, {
  x: {
    value: 10,
    writable: false,
    enumerable: true,
    configurable: true,
  },
  y: {
    get() {
      return this.x + 5;
    },
    set(value) {
      this.x = value - 5;
    },
    enumerable: true,
    configurable: true,
  },
});

console.log(obj.x); // 10
obj.y = 20; // 调用 y 的 setter，将 x 设为 15
console.log(obj.y); // 调用 y 的 getter，输出 20
console.log(obj.x); // 15（因为 setter 修改了 x）
```

### 4.2 混合使用数据描述符和存取描述符

```javascript
const person = {};

Object.defineProperties(person, {
  firstName: { value: 'John', writable: true, enumerable: true },
  lastName: { value: 'Doe', writable: true, enumerable: true },
  fullName: {
    get() {
      return `${this.firstName} ${this.lastName}`;
    },
    set(name) {
      [this.firstName, this.lastName] = name.split(' ');
    },
    enumerable: true,
  },
});

console.log(person.fullName); // "John Doe"
person.fullName = 'Jane Smith';
console.log(person.firstName); // "Jane"
console.log(person.lastName); // "Smith"
```

---

## 5. 注意事项

- 使用 `Object.defineProperties` 定义属性时，如果不显式指定 `configurable`、`enumerable`、`writable`，它们默认都是 `false`。
- 如果一个属性同时定义了 `get`/`set` 和 `value`/`writable`，会抛出错误。
- 一旦属性被设置为 `configurable: false`，将无法更改属性的可配置性和可枚举性，也无法将其在数据描述符和存取描述符之间转换。
- 对象的属性是否可枚举，取决于其 `enumerable` 值。如果不希望属性被枚举，需显式设置 `enumerable: false`。

---

## 6. 实际应用场景

### 6.1 批量定义只读常量

```javascript
const constants = {};
Object.defineProperties(constants, {
  PI: { value: 3.14159, writable: false, configurable: false },
  E: { value: 2.71828, writable: false, configurable: false },
  GOLDEN_RATIO: { value: 1.618, writable: false, configurable: false },
});
```

### 6.2 在工厂函数中动态创建属性

```javascript
function createUser(name, age) {
  const user = {};
  Object.defineProperties(user, {
    name: { value: name, writable: true, enumerable: true },
    age: { value: age, writable: true, enumerable: true },
    isAdult: {
      get() {
        return this.age >= 18;
      },
      enumerable: true,
    },
  });
  return user;
}
const u = createUser('Alice', 20);
console.log(u.isAdult); // true
```

### 6.3 模拟私有属性（通过不可枚举 + getter）

```javascript
function BankAccount(balance) {
  let _balance = balance;
  Object.defineProperties(this, {
    balance: {
      get() {
        return _balance;
      },
      enumerable: false, // 隐藏，不参与遍历
      configurable: false,
    },
    deposit: {
      value(amount) {
        _balance += amount;
      },
      enumerable: false,
    },
    withdraw: {
      value(amount) {
        if (amount <= _balance) _balance -= amount;
      },
      enumerable: false,
    },
  });
}
const acc = new BankAccount(100);
acc.deposit(50);
console.log(acc.balance); // 150
for (let k in acc) console.log(k); // 无输出（所有属性不可枚举）
```

---

## 7. 与 `Object.defineProperty` 的对比

| 特性             | `Object.defineProperty`            | `Object.defineProperties`                          |
| ---------------- | ---------------------------------- | -------------------------------------------------- |
| **定义属性数量** | 一次只能定义或修改**一个**属性     | 一次可以定义或修改**多个**属性                     |
| **语法简洁性**   | 适合单个属性操作                   | 适合批量操作，代码更紧凑                           |
| **返回值**       | 返回修改后的对象                   | 返回修改后的对象                                   |
| **错误处理**     | 单个属性出错会中断                 | 批量定义时，一个属性描述符错误可能导致整个操作失败 |
| **适用场景**     | 动态添加单个属性、在循环中逐个定义 | 初始化对象时批量定义多个属性、工厂模式             |
| **性能**         | 多次调用有额外开销                 | 一次调用，性能更好（当需要定义多个属性时）         |

**选择建议**：

- 如果需要定义或修改**一个属性**，使用 `Object.defineProperty`。
- 如果需要**同时定义多个属性**（如初始化对象、创建常量集），使用 `Object.defineProperties` 更清晰、高效。

---

## 8. 为什么 Vue 2 选择 `defineProperty` 而不是 `defineProperties`？

尽管 `defineProperties` 可以一次定义多个属性，但 Vue 2 在实现响应式系统时依然选择逐个调用 `defineProperty`，原因如下：

### 8.1 递归嵌套处理的需求

Vue 需要深度遍历对象的每个属性（包括嵌套对象），对每个属性单独设置 getter/setter。如果使用 `defineProperties`，仍然需要先递归收集所有属性及其描述符，然后一次性定义。这与循环调用 `defineProperty` 相比并没有简化代码，反而需要构建一个巨大的描述符对象，容易导致内存峰值。

### 8.2 每个属性需要独立的闭包（Dep 实例）

每个响应式属性都需要一个独立的 `Dep` 实例。使用 `defineProperty` 时，可以在循环中为每个属性创建闭包，自然地捕获各自的 `dep`。而使用 `defineProperties` 需要在构建 `props` 对象时，为每个属性的 `get`/`set` 函数手动绑定对应的 `dep`，这通常需要借助立即执行函数或额外的作用域，代码变得不直观：

```javascript
// 使用 defineProperty（清晰）
function defineReactive(obj, key, val) {
  const dep = new Dep();
  Object.defineProperty(obj, key, {
    get() {
      dep.depend();
      return val;
    },
    set(newVal) {
      val = newVal;
      dep.notify();
    },
  });
}

// 使用 defineProperties（需要额外技巧）
function defineReactiveBatch(obj, propsMap) {
  const descriptors = {};
  Object.keys(propsMap).forEach((key) => {
    const dep = new Dep();
    const val = propsMap[key];
    descriptors[key] = {
      get() {
        dep.depend();
        return val;
      },
      set(newVal) {
        val = newVal;
        dep.notify();
      },
    };
  });
  Object.defineProperties(obj, descriptors);
}
```

虽然也能实现，但需要预先将所有属性的描述符收集到一个对象中，且无法处理动态添加的属性（如 `Vue.set`）。

### 8.3 动态添加属性的灵活性

Vue 提供了 `Vue.set` 方法，用于在运行时向响应式对象添加新属性。这种场景下只能使用 `defineProperty` 单独处理，`defineProperties` 无法预知未来要添加的属性。

### 8.4 代码可读性和调试便利性

逐个调用 `defineProperty` 的代码更直观，出错时堆栈信息更精确（可以定位到具体哪个属性）。`defineProperties` 一旦某个属性的描述符有问题，整个批量操作失败，难以快速定位。

### 8.5 性能差异可忽略

虽然 `defineProperties` 理论上只调用一次原生方法，而 `defineProperty` 需要多次调用，但实际性能差异极小（微秒级别），Vue 初始化阶段的性能瓶颈主要在于递归遍历，而不是属性定义的次数。

**结论**：Vue 2 选择 `defineProperty` 不是因为它比 `defineProperties` 功能更强，而是因为代码更清晰、更易于维护、更符合动态添加属性的需求。`defineProperties` 更适合静态的、已知的、非嵌套的属性集合，而 Vue 的响应式系统需要更强的灵活性。

---

## 9. 总结

`Object.defineProperties` 是 `Object.defineProperty` 的批量版本，允许一次操作多个属性，使代码更简洁。它与 `defineProperty` 共享相同的描述符规则，适用于需要同时配置多个属性的场景，如对象初始化、常量定义、工厂函数等。理解两者的区别和适用场景，可以帮助你更灵活地控制对象属性的行为。Vue 2 选择 `defineProperty` 是基于动态性、闭包便利性和可维护性的实际考量。
