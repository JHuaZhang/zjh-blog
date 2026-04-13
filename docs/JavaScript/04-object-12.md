---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 12
title: Object.keys详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

`Object.keys()` 是一个静态方法，用于获取一个对象自身的**所有可枚举属性**的名称组成的数组。它只返回对象自身的属性，不包括原型链上的属性，也不包括不可枚举属性。

**语法**

```javascript
Object.keys(obj);
```

- **`obj`**：要返回其自身可枚举属性名称的对象。

**返回值**：一个字符串数组，包含对象的所有可枚举自有属性的键名。

**基本示例**

```javascript
const person = {
  name: 'John',
  age: 30,
  hasDriverLicense: true,
};
console.log(Object.keys(person)); // ['name', 'age', 'hasDriverLicense']
```

---

## 2. 原理

`Object.keys` 的内部实现遵循 ECMAScript 规范中的 **`EnumerableOwnPropertyNames`** 抽象操作。大致步骤如下：

1. 将参数 `obj` 转换为对象类型（原始值会被装箱）。
2. 获取对象的所有**自有属性**键（字符串类型，不包括 Symbol）。
3. 过滤出其中**可枚举**（`enumerable: true`）的属性。
4. 按照特定顺序（数值键升序，字符串键按添加顺序）返回这些键组成的数组。

**关键点**：

- 不遍历原型链。
- 不包含不可枚举属性（如通过 `Object.defineProperty` 设置 `enumerable: false` 的属性）。
- 返回的数组顺序遵循 ES2015 定义的遍历顺序：首先数字键（按升序），然后字符串键（按添加顺序），最后 Symbol 键（按添加顺序，但 `Object.keys` 不返回 Symbol 键）。

---

## 3. 与 `for...in` 循环的区别

- `for...in` 会遍历对象自身的可枚举属性以及**原型链上**的可枚举属性。
- `Object.keys` **只返回自身**的可枚举属性，不包含原型链上的。

**示例**：

```javascript
const obj = { name: 'test', age: 18 };
Object.prototype.sex = '男'; // 原型链属性
console.log(Object.keys(obj)); // ['name', 'age']

const list = [];
for (let key in obj) {
  list.push(key);
}
console.log(list); // ['name', 'age', 'sex']
```

---

## 4. 与 `Object.getOwnPropertyNames` 的区别

- `Object.keys` 只返回**可枚举**的自有属性键。
- `Object.getOwnPropertyNames` 返回**所有**自有属性键（包括不可枚举的），但不包括 Symbol。

**示例**：

```javascript
const obj = { name: 'test', age: 18 };
Object.defineProperty(obj, 'sex', {
  value: 'male',
  enumerable: false, // 不可枚举
});
Object.prototype.like = 'test';

console.log(Object.keys(obj)); // ['name', 'age']
console.log(Object.getOwnPropertyNames(obj)); // ['name', 'age', 'sex']
```

---

## 5. 注意事项

- 只处理对象自身的属性，不包含原型链。
- 不包含不可枚举属性。
- 不包含 Symbol 键（如需获取 Symbol 键请使用 `Object.getOwnPropertySymbols`）。
- 参数为 `null` 或 `undefined` 时会抛出 `TypeError`（因为无法转换为对象）。
- 参数为原始值时（如字符串、数字、布尔值）会先装箱为对象，然后返回可枚举属性（例如字符串会返回索引键）。

```javascript
console.log(Object.keys('hello')); // ['0', '1', '2', '3', '4']
console.log(Object.keys(123)); // []（数字没有可枚举属性）
```

- 属性顺序：数值键按升序排列，字符串键按创建顺序排列，但一般不应依赖顺序。

---

## 6. 常见应用场景

### 6.1 遍历对象自身属性（配合 `forEach`）

```javascript
const obj = { a: 1, b: 2, c: 3 };
Object.keys(obj).forEach((key) => {
  console.log(key, obj[key]);
});
```

### 6.2 获取对象长度（自身可枚举属性个数）

```javascript
const obj = { x: 1, y: 2, z: 3 };
const length = Object.keys(obj).length;
console.log(length); // 3
```

### 6.3 判断对象是否为空（无自身可枚举属性）

```javascript
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
console.log(isEmpty({})); // true
console.log(isEmpty({ a: 1 })); // false
```

### 6.4 复制对象的部分属性

```javascript
const source = { a: 1, b: 2, c: 3 };
const keysToCopy = ['a', 'c'];
const target = {};
keysToCopy.forEach((key) => {
  if (key in source) target[key] = source[key];
});
console.log(target); // { a:1, c:3 }
```

### 6.5 配合 `map` 生成新数组

```javascript
const obj = { name: 'Alice', age: 25, city: 'Beijing' };
const keyValuePairs = Object.keys(obj).map((key) => [key, obj[key]]);
console.log(keyValuePairs); // [['name','Alice'], ['age',25], ['city','Beijing']]
```

---

## 7. 对比总结

| 方法                                | 返回属性类型            | 是否包含继承属性 | 是否包含不可枚举属性 | 是否包含 Symbol |
| ----------------------------------- | ----------------------- | ---------------- | -------------------- | --------------- |
| `Object.keys(obj)`                  | 字符串键（可枚举）      | 否               | 否                   | 否              |
| `Object.getOwnPropertyNames(obj)`   | 字符串键（全部）        | 否               | 是                   | 否              |
| `Object.getOwnPropertySymbols(obj)` | Symbol 键（全部）       | 否               | 是                   | 是              |
| `Reflect.ownKeys(obj)`              | 所有键（字符串+Symbol） | 否               | 是                   | 是              |
| `for...in`                          | 可枚举字符串键          | 是               | 否                   | 否              |

---

## 8. 总结

- `Object.keys` 是获取对象自身可枚举属性名称数组的便捷方法，常用于遍历、获取长度、判断空对象等。
- 它不包含原型链属性和不可枚举属性，也不包含 Symbol 键。
- 与 `for...in` 相比，它更专注于对象自身；与 `getOwnPropertyNames` 相比，它过滤掉了不可枚举属性。
- 合理使用 `Object.keys` 可以使代码更清晰、意图更明确，避免意外遍历到原型链上的属性。
