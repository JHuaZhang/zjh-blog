---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 6
title: getOwnPropertyDescriptor与getOwnPropertyDescriptors详解
nav:
  title: JavaScript
  order: 2
---

## 1. Object.getOwnPropertyDescriptor 概述

`Object.getOwnPropertyDescriptor` 方法用于获取指定对象**自身**属性（非继承属性）对应的属性描述符。如果属性存在且是自有属性，返回描述符对象；否则返回 `undefined`。

**语法**

```javascript
Object.getOwnPropertyDescriptor(obj, prop);
```

**参数**

- `obj`：要查找其描述符的对象。
- `prop`：要查找其描述符的属性名称（字符串或 `Symbol`）。

**返回值**  
返回一个对象，包含以下键（根据属性类型不同）：

- **数据描述符**：`value`、`writable`、`enumerable`、`configurable`
- **存取描述符**：`get`、`set`、`enumerable`、`configurable`

如果属性不存在或不是自有属性，返回 `undefined`。

**基础示例**

```javascript
const obj = { name: '张三', age: 25 };
const desc = Object.getOwnPropertyDescriptor(obj, 'name');
console.log(desc);
// { value: '张三', writable: true, enumerable: true, configurable: true }

// 获取不存在的属性
console.log(Object.getOwnPropertyDescriptor(obj, 'gender')); // undefined

// 获取继承的属性（原型链上的）
console.log(Object.getOwnPropertyDescriptor(obj, 'toString')); // undefined
```

**原理**

JavaScript 引擎在内部为每个对象维护一个“属性描述符”表，记录了对象自身所有属性的元信息（包括值、可写性、可枚举性、可配置性以及 getter/setter）。当调用 `Object.getOwnPropertyDescriptor(obj, prop)` 时，引擎执行以下步骤：

1. 将 `obj` 转换为对象类型（如果传入原始值，会先进行装箱）。
2. 在该对象的内部属性表中查找键名为 `prop` 的属性。
3. 如果找到且该属性是**自有属性**（非原型链继承），则根据属性类型（数据属性或访问器属性）构造对应的描述符对象并返回。
4. 如果没有找到或属性是继承而来的，返回 `undefined`。

该过程不涉及原型链遍历，因此效率很高，且能准确反映属性定义时的所有配置。

**注意事项**

- 只能获取**自有属性**的描述符，继承属性返回 `undefined`。
- 默认通过字面量定义的属性，`writable`、`enumerable`、`configurable` 均为 `true`。
- 通过 `Object.defineProperty` 定义的属性，未显式指定的描述符默认为 `false`。
- 常用于调试或框架内部检查属性配置。

---

## 2. Object.getOwnPropertyDescriptors 概述

`Object.getOwnPropertyDescriptors` 方法（ES2017 引入）返回指定对象**所有自有属性**的描述符对象集合。每个键是属性名，值是对应的描述符对象。

**语法**

```javascript
Object.getOwnPropertyDescriptors(obj);
```

**参数**

- `obj`：要获取其所有自有属性描述符的对象。

**返回值**  
返回一个新对象，其属性与源对象的自有属性一一对应，每个属性的值是一个描述符对象。如果源对象没有自有属性，则返回空对象 `{}`。

**基础示例**

```javascript
const obj = {
  a: 1,
  get b() {
    return this.a + 1;
  },
};
Object.defineProperty(obj, 'c', { value: 3, writable: false });

const descriptors = Object.getOwnPropertyDescriptors(obj);
console.log(descriptors);
/* 输出类似：
{
  a: { value: 1, writable: true, enumerable: true, configurable: true },
  b: { get: [Function: get b], set: undefined, enumerable: true, configurable: true },
  c: { value: 3, writable: false, enumerable: false, configurable: false }
}
*/
```

**原理**

`Object.getOwnPropertyDescriptors` 的工作流程如下：

1. 将 `obj` 转换为对象类型。
2. 获取该对象的所有**自有属性键**（包括字符串键和 `Symbol` 键，不包括继承属性）。这一步相当于调用 `Reflect.ownKeys(obj)`。
3. 遍历这些属性键，对每个键调用 `Object.getOwnPropertyDescriptor(obj, key)` 获取描述符。
4. 将每个键和对应的描述符组成一个新的对象返回。

因此，它本质上是 `getOwnPropertyDescriptor` 的批量调用版本，但引擎内部可能做了优化，避免重复进行类型转换。最终返回的对象直接反映了对象当前所有自身属性的元信息，适合用于后续的精确复制或属性转移操作。

**注意事项**

- 只返回**自有属性**，不包含原型链上的属性。
- 返回的对象结构可直接用于 `Object.create` 或 `Object.defineProperties` 进行精确复制。

---

## 3. 实际应用场景

### 3.1 精确复制对象（保留所有属性特性）

**目标**：创建一个与原对象完全相同的副本，包括不可枚举属性、getter/setter 等特性。

**为什么不能直接复制？**  
普通的对象复制（如 `{ ...obj }` 或 `Object.assign`）只会复制可枚举属性，并且会丢失属性的 `writable`、`configurable`、`get`、`set` 等配置信息。

**解决方案**：使用 `Object.getOwnPropertyDescriptors` 获取所有属性的完整描述符，然后配合 `Object.create` 创建新对象。

**核心代码**：

```javascript
const clone = Object.create(
  Object.getPrototypeOf(original),
  Object.getOwnPropertyDescriptors(original),
);
```

**逐步拆解**：

1. `Object.getOwnPropertyDescriptors(original)`  
   返回一个对象，例如 `{ name: {...}, age: {...}, ... }`，其中每个值都是描述符对象。这些描述符包含了属性是否可写、可枚举、可配置，以及 getter/setter 等信息。

2. `Object.getPrototypeOf(original)`  
   获取原对象的原型（即 `original.__proto__`）。这一步是为了让克隆后的对象继承相同的原型链（否则新对象会是 `Object.prototype` 的实例，丢失原型上的方法）。

3. `Object.create(proto, propertiesObject)`  
   创建一个新对象，其 `[[Prototype]]` 指向第一个参数（`proto`），同时为这个新对象定义属性，属性由第二个参数（`propertiesObject`）描述。  
   `propertiesObject` 正是 `getOwnPropertyDescriptors` 返回的对象，它告诉 `Object.create` 如何精确地定义每个属性（包括不可枚举属性、getter/setter 等）。

**最终效果**：`clone` 与原对象 `original` 在属性和原型上完全一致，实现了真正的浅层精确复制。对于嵌套对象，仍需递归处理，但此方法保证了一层的属性描述符完整。

**完整示例**：

```javascript
const original = {
  name: 'Alice',
  get fullName() {
    return this.name + ' Smith';
  },
};
Object.defineProperty(original, 'id', { value: 123, enumerable: false });

const clone = Object.create(
  Object.getPrototypeOf(original),
  Object.getOwnPropertyDescriptors(original),
);

console.log(clone.name); // 'Alice'
console.log(clone.fullName); // 'Alice Smith'
console.log(clone.id); // 123（虽然不可枚举，但属性存在）
console.log(Object.keys(clone)); // ['name', 'fullName']（id 不在其中，因为不可枚举）
```

### 3.2 调试属性配置

**场景**：开发过程中需要检查某个属性是否可写、可枚举等，尤其是在使用 `Object.defineProperty` 后验证配置是否正确。

**示例**：

```javascript
function checkProperty(obj, prop) {
  const desc = Object.getOwnPropertyDescriptor(obj, prop);
  if (!desc) return `“${prop}” 不是对象的自有属性`;
  return `可写: ${desc.writable}, 可枚举: ${desc.enumerable}, 可配置: ${desc.configurable}`;
}

const obj = {};
Object.defineProperty(obj, 'hidden', { value: 'secret', enumerable: false });
console.log(checkProperty(obj, 'hidden'));
// 输出：可写: false, 可枚举: false, 可配置: false
```

### 3.3 实现混入（Mixin）时保留属性特性

**场景**：将多个来源对象的属性混合到目标对象，并且希望保留每个属性原有的描述符（如 getter/setter、不可枚举属性等）。普通的 `Object.assign` 无法做到。

**解决方案**：使用 `getOwnPropertyDescriptors` 收集所有来源对象的属性描述符，然后通过 `defineProperties` 一次性添加到目标对象。

**示例**：

```javascript
function mixin(target, ...sources) {
  for (const source of sources) {
    const descriptors = Object.getOwnPropertyDescriptors(source);
    Object.defineProperties(target, descriptors);
  }
  return target;
}

const source1 = {
  a: 1,
  get b() {
    return this.a + 1;
  },
};
const source2 = {};
Object.defineProperty(source2, 'c', { value: 3, writable: false });

const target = {};
mixin(target, source1, source2);
console.log(target.a); // 1
console.log(target.b); // 2（getter 正常工作）
console.log(target.c); // 3
target.c = 99; // 无效（因为 writable: false）
console.log(target.c); // 3
```

---

## 4. 两者对比

| 方法                                         | 作用                         | 返回值                         | 适用场景                 |
| -------------------------------------------- | ---------------------------- | ------------------------------ | ------------------------ |
| `Object.getOwnPropertyDescriptor(obj, prop)` | 获取单个自有属性的描述符     | 描述符对象 或 `undefined`      | 检查特定属性的配置       |
| `Object.getOwnPropertyDescriptors(obj)`      | 获取所有自有属性的描述符集合 | 对象（键为属性名，值为描述符） | 批量操作、精确克隆、混入 |

**注意**：`getOwnPropertyDescriptors` 返回的对象可以直接用作 `Object.create` 或 `Object.defineProperties` 的参数，非常方便。

---

## 5. 注意事项总结

- 两个方法都**只关注自有属性**，不会遍历原型链。
- 如果属性是通过继承得到的，`getOwnPropertyDescriptor` 返回 `undefined`，`getOwnPropertyDescriptors` 也不会包含该属性。
- 使用 `Object.create` 进行克隆时，建议同时保留原型链：`Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))`。
- 这两个方法对于 `Symbol` 类型的属性键同样有效。

---

## 6. 总结

`Object.getOwnPropertyDescriptor` 和 `Object.getOwnPropertyDescriptors` 提供了对对象属性描述符的细粒度访问能力。前者用于单个属性，后者用于批量获取。它们是实现精确对象复制、混入、调试等高级操作的重要工具。理解这些方法及其底层原理有助于深入掌握 JavaScript 的对象模型和元编程能力。
