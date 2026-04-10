---
group:
  title: 【03】js数组及数组方法
  order: 3
order: 8
title: 数组转对象方法
nav:
  title: JavaScript
  order: 2
---

在实际开发中，我们经常需要将数组转换为对象格式，例如将索引作为键、元素作为值，或者将特定结构的数组转为键值对对象。JavaScript 提供了多种方式实现这一转换，包括扩展运算符、`Object.assign()`、`reduce` 以及 `Object.fromEntries()` 等。本文将详细介绍这些方法，并分析各自的适用场景。

---

## 1. 扩展运算符（...）

**定义和用法**  
扩展运算符 `...` 可以将数组展开为元素序列，当用于对象字面量时，可以将数组的索引作为对象的键，数组元素作为对应的值，从而创建一个新对象。这要求数组元素是简单的值，且索引会被转换为字符串。

**语法规则**

```javascript
let obj = { ...arr };
```

**参数**  
`arr` — 需要转换的数组。

**返回值**  
`Object` — 一个新对象，其属性名为数组索引（字符串形式），属性值为对应索引的元素。

**原理**  
扩展运算符在对象字面量中使用时，会遍历数组的可枚举属性（索引），并为每个索引创建一个属性，属性名为索引（转为字符串），属性值为该索引对应的元素。

**注意事项**

- 仅适用于一维数组。
- 如果数组包含对象，则对象引用会被复制（浅拷贝）。
- 数组的 `length` 属性不会被复制到对象中。
- 对于稀疏数组，空位对应的索引会被忽略（不会创建属性）。
- 不改变原数组。

**举例学习**

**基本类型数组**

```javascript
const arr = [1, 2, 3, 4, 5];
const obj = { ...arr };
console.log(obj); // {0: 1, 1: 2, 2: 3, 3: 4, 4: 5}
```

**包含对象**

```javascript
const user = { name: 'Alice' };
const arr = [1, user, 3];
const obj = { ...arr };
console.log(obj); // {0: 1, 1: { name: 'Alice' }, 2: 3}
// 注意：obj[1] 和 arr[1] 引用同一对象
```

**稀疏数组**

```javascript
const sparse = [1, , 3];
const obj = { ...sparse };
console.log(obj); // {0: 1, 2: 3}  索引1被忽略
```

**优点**

- 语法简洁，易于理解。
- 不会修改原数组。
- 对于小型数组转换非常方便。

**缺点**

- 仅保留数组的索引属性，不保留 `length` 等其他属性。
- 不能自定义键名（键固定为索引）。
- 对于大型数组，扩展运算符可能会产生性能开销。

**适用场景**  
需要快速将一维数组转换为以索引为键的对象，且不需要自定义键名。

---

## 2. Object.assign()

**定义和用法**  
`Object.assign()` 方法用于将所有可枚举属性的值从一个或多个源对象复制到目标对象，并返回目标对象。当源对象是一个数组时，数组的索引会被视为属性名（字符串），元素值作为属性值，从而将数组转为对象。

**语法规则**

```javascript
Object.assign(target, ...sources);
```

**参数**

- `target` — 目标对象，拷贝后的属性将合并到该对象。
- `sources` — 一个或多个源对象（包括数组、普通对象等）。

**返回值**  
`target` — 修改后的目标对象。

**原理**  
遍历每个源对象的可枚举自有属性，将其键值对复制到目标对象。数组的索引是可枚举的，因此会被复制。如果有同名属性，后面的源对象会覆盖前面的。

**注意事项**

- 会修改目标对象（如果目标对象不是空对象，则会保留原有属性）。
- 仅拷贝可枚举的自有属性，不可枚举属性和继承属性不会被拷贝。
- 执行的是浅拷贝（属性值为对象时拷贝引用）。
- 如果目标对象为 `{}`，则不会修改原数组，返回新对象。
- 对于稀疏数组，空位对应的索引不会被复制（因为不存在该属性）。

**举例学习**

**将数组转为新对象**

```javascript
const arr = [1, 2, 3, 4, 5];
const obj = Object.assign({}, arr);
console.log(obj); // {0: 1, 1: 2, 2: 3, 3: 4, 4: 5}
```

**数组与对象合并（同名属性覆盖）**

```javascript
const target = { name: 'Alice', age: 18 };
const source = [20, 30]; // source[0]=20, source[1]=30
const result = Object.assign(target, source);
console.log(result); // {0: 20, 1: 30, name: 'Alice', age: 18}
// 注意：索引0和1覆盖了原本可能存在的0、1属性（如果有）
```

**多个源对象（包括数组）**

```javascript
const target = { a: 1 };
const source1 = [10, 20];
const source2 = { b: 2 };
Object.assign(target, source1, source2);
console.log(target); // {0: 10, 1: 20, a: 1, b: 2}
```

**稀疏数组**

```javascript
const sparse = [1, , 3];
const obj = Object.assign({}, sparse);
console.log(obj); // {0: 1, 2: 3}  空位被忽略
```

**优点**

- 可以合并多个源对象，灵活性强。
- 可同时处理数组和普通对象。
- 不要求目标对象为空，可以保留已有属性。

**缺点**

- 会修改目标对象（如果不希望修改，需传递空对象 `{}`）。
- 不能自定义键名（键固定为索引）。
- 对于大型数组，性能一般。

**适用场景**  
需要将数组与已有对象合并，或者需要同时处理多个源对象时。

---

## 3. reduce() 方法

**定义和用法**  
`reduce()` 方法可以遍历数组，将每个元素按自定义规则添加到初始对象中，从而实现数组到对象的灵活转换。可以自定义键名和值的映射规则。

**语法规则**

```javascript
arr.reduce((acc, cur, index) => { ... }, initialObject)
```

**参数**

- `callback` — 对每个元素执行的函数，返回累积对象。
- `initialObject` — 初始对象（通常为 `{}`）。

**返回值**  
`Object` — 累积后的对象。

**原理**  
遍历数组，每次迭代将当前元素（或索引）作为新对象的键值对添加到累积对象中，最终返回该对象。

**注意事项**

- 不会修改原数组。
- 可任意定制键和值的逻辑（如使用元素属性、索引等）。
- 适用于复杂转换场景。

**举例学习**

**将数组转为索引为键的对象（同扩展运算符效果）**

```javascript
const arr = ['a', 'b', 'c'];
const obj = arr.reduce((acc, cur, idx) => {
  acc[idx] = cur;
  return acc;
}, {});
console.log(obj); // {0: 'a', 1: 'b', 2: 'c'}
```

**使用数组元素的自定义键（如对象的某个字段）**

```javascript
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];
const obj = users.reduce((acc, user) => {
  acc[user.id] = user;
  return acc;
}, {});
console.log(obj);
// {1: { id: 1, name: 'Alice' }, 2: { id: 2, name: 'Bob' }}
```

**使用元素值作为键（假设数组元素是唯一标识）**

```javascript
const arr = ['apple', 'banana', 'orange'];
const obj = arr.reduce((acc, fruit, idx) => {
  acc[fruit] = idx;
  return acc;
}, {});
console.log(obj); // {apple: 0, banana: 1, orange: 2}
```

**优点**

- 最灵活，可以完全自定义键和值的生成逻辑。
- 适合处理对象数组，将其转换为以某个属性为键的对象（常用于数据索引优化）。
- 不修改原数组，返回新对象。

**缺点**

- 代码稍显冗长。
- 对于简单场景（索引->值）不如扩展运算符或 `Object.assign` 简洁。

**适用场景**  
需要自定义键名的数组转对象，尤其是对象数组转换为字典（map）结构。

---

## 4. Object.fromEntries()（ES2019）

**定义和用法**  
`Object.fromEntries()` 方法将键值对列表（如二维数组）转换为对象。数组需要是形如 `[[key1, value1], [key2, value2], ...]` 的结构。它常用于将 `Map` 或 `Object.entries()` 的结果转回对象，也可以用于数组转对象（先构造键值对数组）。

**语法规则**

```javascript
Object.fromEntries(iterable);
```

**参数**  
`iterable` — 可迭代对象，每个元素都是一个包含两个元素的数组 `[key, value]`。

**返回值**  
`Object` — 新对象。

**原理**  
遍历可迭代对象，对每个子数组取第一个元素作为键，第二个作为值，构建对象。

**注意事项**

- 如果键重复，后面的会覆盖前面的。
- 不会修改原数组。
- 要求数组的每个元素都是一个包含两个元素的类数组对象。

**举例学习**

**从索引-值对数组转换**

```javascript
const arr = [
  ['a', 1],
  ['b', 2],
  ['c', 3],
];
const obj = Object.fromEntries(arr);
console.log(obj); // {a: 1, b: 2, c: 3}
```

**将普通数组转换为对象（配合 map 先构造键值对）**

```javascript
const fruits = ['apple', 'banana', 'orange'];
const obj = Object.fromEntries(fruits.map((fruit, idx) => [fruit, idx]));
console.log(obj); // {apple: 0, banana: 1, orange: 2}
```

**将对象数组转换为以 id 为键的对象**

```javascript
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];
const obj = Object.fromEntries(users.map((user) => [user.id, user]));
console.log(obj);
// {1: { id: 1, name: 'Alice' }, 2: { id: 2, name: 'Bob' }}
```

**优点**

- 语法简洁，语义清晰。
- 专为键值对列表转对象设计。
- 性能较好（原生方法）。

**缺点**

- 需要先将数组转换为键值对数组，可能需要额外的 `map` 操作。
- 不能直接处理一维数组（需要先构造键值对）。

**适用场景**  
已经拥有键值对数组，或需要将数组转换为以元素为键、索引为值的对象等场景。

---

## 5. 方法对比总结

| 方法                     | 是否修改原数组   | 自定义键名 | 适用场景                                      | 代码简洁度 |
| ------------------------ | ---------------- | ---------- | --------------------------------------------- | ---------- |
| 扩展运算符 `{ ...arr }`  | ❌               | ❌         | 快速将一维数组转为索引为键的对象              | 非常简洁   |
| `Object.assign({}, arr)` | ❌（若目标为空） | ❌         | 同扩展运算符，但可合并多个源                  | 简洁       |
| `reduce`                 | ❌               | ✅         | 复杂映射，如对象数组转字典、自定义键值对      | 较复杂     |
| `Object.fromEntries`     | ❌               | ✅         | 已有键值对数组，或通过 `map` 构造键值对后转换 | 较简洁     |

**推荐**：

- **一维数组简单转换**：使用 `{ ...arr }` 或 `Object.assign({}, arr)`。
- **需要自定义键名（如使用元素属性作为键）**：使用 `reduce` 或 `Object.fromEntries` + `map`。
- **已有键值对数组**：直接使用 `Object.fromEntries`。

---

## 6. 注意事项与陷阱

- **数组索引是字符串属性**：转换后对象的键是字符串形式的数字（如 `'0'`），但可以通过 `obj[0]` 或 `obj['0']` 访问。
- **稀疏数组的空位**：使用扩展运算符或 `Object.assign` 时，空位对应的属性不会被创建。使用 `reduce` 时，可以自定义处理空位。
- **引用类型浅拷贝**：如果数组元素是对象，转换后对象中的属性值仍是原对象的引用，修改会影响原数组。
- **性能**：对于大型数组，`reduce` 和 `Object.fromEntries` 性能接近，但扩展运算符和 `Object.assign` 可能更快（引擎优化）。
- **`length` 属性不会复制**：转换后对象没有 `length` 属性。
