---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 10
title: Object.create详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

`Object.create()` 方法创建一个新对象，使用现有的对象作为新创建对象的原型（即内部 `[[Prototype]]`）。它是 ES5 引入的标准方法，提供了一种更直接的方式来设置对象的原型，无需使用构造函数。

---

## 2. Object.create

### 2.1 定义与语法

```javascript
Object.create(proto, [propertiesObject]);
```

- **`proto`**：新创建对象的原型对象。如果传入 `null`，则创建的对象没有原型（纯净对象）。
- **`propertiesObject`**（可选）：一个包含一个或多个属性描述符的对象，这些属性将添加到新创建的对象上（类似于 `Object.defineProperties` 的第二个参数）。

**返回值**：一个新对象，其原型指向 `proto`，并带有指定的自有属性。

**原理**：`Object.create` 的内部实现遵循 ECMAScript 规范中的 **`[[Create]]`** 抽象操作。它首先创建一个空对象，然后将其内部 `[[Prototype]]` 设置为 `proto` 参数。如果 `proto` 不是 `null` 也不是对象，会抛出 `TypeError`。接着，如果提供了 `propertiesObject`，则调用 `Object.defineProperties` 为新对象添加属性。最后返回该对象。该过程不涉及调用任何构造函数，因此不会执行构造函数中的代码。

### 2.2 示例

```javascript
const person = {
  isHuman: false,
  printIntroduction() {
    console.log(`My name is ${this.name}. Am I human? ${this.isHuman}`);
  },
};

const me = Object.create(person);
me.name = 'Matthew';
me.isHuman = true;
me.printIntroduction(); // My name is Matthew. Am I human? true
```

### 2.3 原型关联与影响（重要）

**核心问题**：`Object.create` 创建的对象会和原来的对象（原型对象）关联吗？修改新创建的对象，原来的对象会变化吗？

- **修改新对象的自身属性**：不会影响原型对象。因为自身属性直接存储在新对象上，原型对象不受影响。
- **修改原型对象的属性**：会影响所有以该对象为原型的对象，包括通过 `Object.create` 创建的新对象。

**验证示例**：

```javascript
const proto = { shared: 1 };
const obj = Object.create(proto);

// 1. 修改新对象的自身属性
obj.own = 100;
console.log(proto.own); // undefined（原型对象没有变）

// 2. 修改原型对象的属性
proto.shared = 999;
console.log(obj.shared); // 999（新对象通过原型链访问到修改后的值）

// 3. 新对象自身属性与原型属性同名时，自身属性会遮蔽原型属性
obj.shared = 888;
console.log(obj.shared); // 888（自身属性）
console.log(proto.shared); // 999（原型对象属性未变）
```

**结论**：

- `Object.create` 创建的对象与原型对象之间是**动态原型链关联**：新对象可以读取原型对象的属性，但修改新对象的自有属性不会写回原型对象。
- 修改原型对象会影响所有派生对象（除非派生对象自身覆盖了该属性）。
- 这种关联关系与通过构造函数创建的实例与原型的关系完全一致。

---

## 3. Object.create(null)

`Object.create(null)` 创建的是一个**纯净的空对象**，它不继承任何属性，包括 `Object.prototype` 上的方法（如 `toString`、`hasOwnProperty`、`__proto__` 等）。这样的对象最适合用作字典（映射），避免原型链上的键名冲突。

### 3.1 示例对比

**普通对象作为字典的问题**：

```javascript
const dict = {};
dict.apple = 'A fruit';
dict.__proto__ = 'Property from prototype'; // 这实际上会修改对象的原型，而不是设置普通属性
console.log(dict.__proto__); // 输出 [Object: null prototype] {}（原型已被修改）
console.log(dict.hasOwnProperty('__proto__')); // false
```

**使用 Object.create(null) 创建纯净字典**：

```javascript
const dict = Object.create(null);
dict.apple = 'A fruit';
dict.__proto__ = 'Property from prototype'; // __proto__ 只是普通键名，没有特殊行为
console.log(dict.__proto__); // 'Property from prototype'
console.log(dict.apple); // 'A fruit'
// dict.hasOwnProperty('apple') // 报错：dict.hasOwnProperty is not a function
```

### 3.2 特性与用途

- **安全映射**：不会因为原型上的 `__proto__`、`toString` 等键产生意外冲突。
- **性能优化**：无原型链查找，属性访问速度可能略快。
- **轻量级字典**：适合用作 `Map` 的替代（但无内置迭代方法）。

### 3.3 应用场景示例

**场景1：缓存对象（防止键名覆盖）**

```javascript
const cache = Object.create(null);
cache['user:1'] = { name: 'Alice' };
cache['__proto__'] = 'some value'; // 不会污染原型
console.log(cache['__proto__']); // 'some value'
```

**场景2：使用 `Object.create(null)` 实现纯映射，避免 `in` 操作符受原型影响**

```javascript
const map = Object.create(null);
map['a'] = 1;
console.log('toString' in map); // false（普通对象会返回 true）
```

### 3.4 注意事项

- 纯净对象没有 `hasOwnProperty`、`toString` 等方法，需要用 `Object.prototype.hasOwnProperty.call(map, key)` 检测。
- 不能使用 `map['__proto__']` 作为特殊键时，它只是一个普通属性，安全。
- 无法使用 `for...in` 遍历原型链属性（因为没有原型链），适合直接遍历自有键。

---

## 4. 实际应用场景

### 4.1 精确克隆对象（保留所有属性特性，但断开原型链）

**目标**：创建一个与原对象**完全独立**的副本，该副本拥有与原对象完全相同的自身属性（包括不可枚举属性、getter/setter 等），但**不继承原对象的原型**，从而断开两者之间的原型链关联。

**为什么需要断开原型链？**

- 有时我们希望克隆对象不受原对象原型变化的影响。
- 避免意外修改原型对象时影响克隆对象。
- 将克隆对象作为普通数据对象使用，不保留继承关系。

**解决方案**：

1. 使用 `Object.getOwnPropertyDescriptors` 获取原对象的所有自身属性描述符。
2. 创建一个新对象，其原型设置为 `Object.prototype`（或 `null`），而不是原对象的原型。
3. 使用 `Object.create` 和描述符对象为新对象添加属性。

**核心代码**（断开原型关联，克隆为普通对象）：

```javascript
function cloneAsPlainObject(obj) {
  return Object.create(
    Object.prototype, // 新对象原型为 Object.prototype（断开原原型）
    Object.getOwnPropertyDescriptors(obj), // 复制所有自身属性描述符
  );
}
```

如果需要更彻底的“纯净”对象（无任何原型），可将原型设为 `null`：

```javascript
function cloneAsNullPrototype(obj) {
  return Object.create(
    null, // 无原型
    Object.getOwnPropertyDescriptors(obj),
  );
}
```

**逐步拆解**：

- `Object.getOwnPropertyDescriptors(obj)`：获取原对象的所有自身属性描述符（包括不可枚举、getter/setter）。
- `Object.create(proto, descriptors)`：创建一个新对象，其 `[[Prototype]]` 指向 `proto`（此处为 `Object.prototype` 或 `null`），并按照描述符定义属性。
- **结果**：新对象拥有与原对象完全相同的自身属性，但原型链与原对象彻底分离。

**完整示例**：

```javascript
// 原对象：具有复杂原型和属性描述符
const proto = { inherited: 'from proto' };
const original = Object.create(proto, {
  a: { value: 1, enumerable: true, writable: true },
  b: { value: 2, enumerable: false }, // 不可枚举
  get sum() {
    return this.a + this.b;
  }, // getter
});
original.c = 3; // 普通属性

// 克隆为普通对象（断开原型关联）
const cloned = Object.create(Object.prototype, Object.getOwnPropertyDescriptors(original));

console.log(cloned.a); // 1
console.log(cloned.sum); // 3（getter 正常工作）
console.log(cloned.hasOwnProperty('b')); // true（不可枚举属性也被复制）
console.log(Object.getPrototypeOf(cloned) === Object.prototype); // true
console.log(Object.getPrototypeOf(original)); // 仍为 proto 对象
console.log(cloned.inherited); // undefined（原型链已断开）
```

**注意事项**：

- 这种克隆是**浅层**的：如果属性值是对象，复制的是引用，修改克隆对象的嵌套对象会影响原对象。
- 若要深层克隆，需结合递归处理。
- 如果希望克隆对象与原始对象原型链完全一致（保留继承关系），则使用 `Object.create(Object.getPrototypeOf(obj), descriptors)` 即可。

### 4.2 基于现有对象创建新对象（原型继承）

```javascript
const animal = {
  eat() {
    console.log('eating');
  },
};
const dog = Object.create(animal);
dog.bark = () => console.log('barking');
dog.eat(); // eating
```

### 4.3 使用 propertiesObject 定义属性描述符

```javascript
const obj = Object.create(Object.prototype, {
  a: { value: 1, writable: true, enumerable: true },
  b: { value: 2, writable: false, enumerable: false },
});
console.log(obj.a); // 1
obj.b = 3; // 无效（writable: false）
```

---

## 5. 对比总结

| 方法                          | 原型                    | 自有属性初始化     | 适用场景               |
| ----------------------------- | ----------------------- | ------------------ | ---------------------- |
| `Object.create(proto)`        | 指定原型                | 无                 | 显式原型继承           |
| `Object.create(proto, props)` | 指定原型                | 通过属性描述符添加 | 需要精确控制属性特性时 |
| `Object.create(null)`         | 无原型（纯净）          | 无                 | 字典、安全映射         |
| 对象字面量 `{}`               | `Object.prototype`      | 直接赋值           | 普通对象               |
| `new Constructor()`           | `Constructor.prototype` | 构造函数内赋值     | 需要实例化类时         |

---

## 6. 总结

- `Object.create` 是设置对象原型的标准方法，比 `__proto__` 或构造函数更直观、安全。
- 它的核心原理是创建一个空对象并设置其 `[[Prototype]]`，然后可选地添加属性描述符。
- `Object.create(null)` 创建的无原型对象非常适合用作字典，避免了原型链上的键名冲突。
- 在使用 `Object.create` 实现继承时，注意原型共享带来的属性引用问题：修改新对象的自有属性不会影响原型对象，但修改原型对象的属性会影响所有派生对象。
- 通过结合 `Object.getOwnPropertyDescriptors` 和 `Object.create`，可以实现精确克隆对象，并可选择断开原型链关联，生成独立的普通对象。
