---
group:
  title: 【03】js数组及数组方法
  order: 3
order: 9
title: 数组删除指定元素方法
nav:
  title: JavaScript
  order: 2
---

在实际开发中，经常需要从数组中删除指定的元素。JavaScript 数组没有提供直接删除指定元素的方法，但可以通过 `splice`、`filter` 等实现。本文将详细介绍几种常用方法，包括如何删除基本类型元素、如何删除对象元素，以及各自的注意事项。

---

## 1. splice() + indexOf() – 删除基本类型元素

**定义和用法**  
先使用 `indexOf()` 找到要删除元素的索引，然后使用 `splice()` 删除该索引位置的元素。此方法会修改原数组。

**语法规则**

```javascript
arr.splice(arr.indexOf(val), 1);
```

**参数**

- `val` — 要删除的元素值。
- 1 — 要删除的元素个数。

**返回值**  
返回被删除的元素组成的数组。

**原理**  
`indexOf()` 返回元素在数组中首次出现的索引，`splice(index, 1)` 删除该索引位置的元素。

**注意事项**

- 只删除第一个匹配的元素（如需删除所有匹配，需循环）。
- 对于对象，`indexOf()` 无法找到，因为对象引用不同。
- 会修改原数组。
- 如果元素不存在，`indexOf()` 返回 -1，`splice(-1, 1)` 会删除最后一个元素，因此需要先判断。

**手写实现**

```javascript
function removeByValue(arr, val) {
  const index = arr.indexOf(val);
  if (index !== -1) {
    arr.splice(index, 1);
  }
  return arr;
}
```

**举例学习**

**删除基本类型元素**

```javascript
const arr = ['a', 'b', 'c'];
arr.splice(arr.indexOf('b'), 1);
console.log(arr); // ['a', 'c']
```

**封装函数删除指定元素（只删除第一个）**

```javascript
function removeByValue(arr, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      arr.splice(i, 1);
      break;
    }
  }
}
const arr = [1, 2, 3, 4, 5];
removeByValue(arr, 3);
console.log(arr); // [1, 2, 4, 5]
```

**删除所有匹配的元素（循环）**

```javascript
function removeAllByValue(arr, val) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === val) {
      arr.splice(i, 1);
    }
  }
}
const arr = [1, 2, 3, 2, 4];
removeAllByValue(arr, 2);
console.log(arr); // [1, 3, 4]
```

**无法直接删除对象（引用不同）**

```javascript
const arr = [
  { name: 'zhangsan', age: 18 },
  { name: 'lisi', age: 12 },
];
removeByValue(arr, { name: 'lisi', age: 12 });
console.log(arr); // 原数组不变，因为对象引用不同
// 原因：{ name: 'lisi', age: 12 } !== arr[1]
```

**优点**

- 代码简单，易于理解。
- 适合删除基本类型元素。

**缺点**

- 只能删除第一个匹配项（需循环才能删除全部）。
- 无法删除对象（除非引用相同）。
- 会修改原数组。

**适用场景**  
删除基本类型元素，且仅需删除第一个匹配项。

---

## 2. splice() + findIndex() – 删除对象元素

**定义和用法**  
使用 `findIndex()` 根据自定义条件找到要删除元素的索引，然后用 `splice()` 删除。适合删除对象数组中符合条件的元素。

**语法规则**

```javascript
arr.splice(arr.findIndex(callback), 1);
```

**参数**

- `callback` — 判断函数，返回 `true` 表示找到目标元素。
- 1 — 要删除的元素个数。

**返回值**  
返回被删除的元素组成的数组。

**原理**  
`findIndex()` 遍历数组，返回第一个使回调返回 `true` 的元素的索引；然后 `splice()` 删除该索引位置的元素。

**注意事项**

- 只删除第一个匹配的元素。
- 会修改原数组。
- 如果未找到匹配元素，`findIndex()` 返回 -1，`splice(-1,1)` 会删除最后一个元素，因此需要先判断。

**手写实现**

```javascript
function removeByCondition(arr, condition) {
  const index = arr.findIndex(condition);
  if (index !== -1) {
    arr.splice(index, 1);
  }
  return arr;
}
```

**举例学习**

**根据对象属性删除**

```javascript
const arr = [
  { name: 'zhangsan', age: 18 },
  { name: 'lisi', age: 12 },
  { name: 'wangwu', age: 14 },
];
arr.splice(
  arr.findIndex((item) => item.name === 'lisi'),
  1,
);
console.log(arr);
// [{ name: 'zhangsan', age: 18 }, { name: 'wangwu', age: 14 }]
```

**封装函数删除指定属性值的对象**

```javascript
function removeByProp(arr, prop, value) {
  const index = arr.findIndex((item) => item[prop] === value);
  if (index !== -1) arr.splice(index, 1);
  return arr;
}
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];
removeByProp(users, 'id', 1);
console.log(users); // [{ id: 2, name: 'Bob' }]
```

**删除所有符合条件的对象（循环）**

```javascript
function removeAllByCondition(arr, condition) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (condition(arr[i])) {
      arr.splice(i, 1);
    }
  }
}
const objs = [{ val: 1 }, { val: 2 }, { val: 1 }];
removeAllByCondition(objs, (item) => item.val === 1);
console.log(objs); // [{ val: 2 }]
```

**优点**

- 可以灵活根据对象属性或复杂条件删除。
- 不依赖引用，只需条件匹配。

**缺点**

- 会修改原数组。
- 只删除第一个匹配项（需循环删除所有）。

**适用场景**  
对象数组中根据条件删除元素（如根据 id 删除）。

---

## 3. filter() – 返回新数组（不改变原数组）

**定义和用法**  
`filter()` 方法创建一个新数组，包含所有满足条件的元素。通过排除要删除的元素，实现“删除”效果。原数组不变。

**语法规则**

```javascript
arr.filter(callback(element[, index[, array]])[, thisArg])
```

**参数**

- `callback` — 测试函数，返回 `true` 表示保留该元素。
- `thisArg`（可选）— 执行回调时的 `this` 值。

**返回值**  
`Array` — 新数组，包含所有通过测试的元素。

**原理**  
遍历数组，对每个元素执行回调，将返回 `true` 的元素放入新数组。

**注意事项**

- 不会修改原数组，返回新数组。
- 适用于删除所有匹配的元素（无需循环）。
- 对于对象，基于条件判断，同样适用。
- 性能略低于 `splice`（因为创建新数组），但函数式风格更安全。

**手写实现**（原生已实现，此处仅示意）

```javascript
Array.prototype.myFilter = function (callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};
```

**举例学习**

**删除基本类型元素**

```javascript
const arr = [1, 2, 3, 2, 4];
const newArr = arr.filter((item) => item !== 2);
console.log(newArr); // [1, 3, 4]
console.log(arr); // [1, 2, 3, 2, 4]（原数组不变）
```

**删除对象数组中符合条件的元素**

```javascript
const arr = [
  { name: 'zhangsan', age: 18 },
  { name: 'lisi', age: 12 },
  { name: 'wangwu', age: 14 },
];
const newArr = arr.filter((item) => item.name !== 'lisi');
console.log(newArr);
// [{ name: 'zhangsan', age: 18 }, { name: 'wangwu', age: 14 }]
```

**删除多个条件（保留满足多个条件的元素）**

```javascript
const products = [
  { name: 'apple', price: 5 },
  { name: 'banana', price: 3 },
  { name: 'orange', price: 7 },
];
const cheap = products.filter((p) => p.price < 6);
console.log(cheap); // [{ name: 'apple', price: 5 }, { name: 'banana', price: 3 }]
```

**优点**

- 不修改原数组，符合不可变数据原则。
- 可以一次性删除所有匹配元素。
- 代码简洁，函数式风格。

**缺点**

- 返回新数组，内存占用稍高。
- 对于大数组，性能可能略低于 `splice`。

**适用场景**

- 需要保留原数组不变。
- 删除所有符合条件的元素。
- 函数式编程风格。

---

## 4. 方法对比总结

| 方法                   | 是否修改原数组 | 是否返回新数组 | 适用场景                             | 能否删除对象 | 删除方式 |
| ---------------------- | -------------- | -------------- | ------------------------------------ | ------------ | -------- |
| `splice` + `indexOf`   | ✅             | ❌             | 删除基本类型第一个匹配项             | ❌           | 删除一个 |
| `splice` + `findIndex` | ✅             | ❌             | 根据条件删除第一个匹配项（适合对象） | ✅           | 删除一个 |
| `filter`               | ❌             | ✅             | 删除所有匹配项，不改变原数组         | ✅           | 删除全部 |

**推荐**：

- **需要修改原数组且只删除一个**：使用 `splice` + `indexOf`（基本类型）或 `splice` + `findIndex`（对象）。
- **需要删除所有匹配项且不改变原数组**：使用 `filter`。
- **需要删除所有匹配项且修改原数组**：使用反向循环 `splice`。

**注意**：`filter` 是最安全、最现代的方式，推荐优先使用，除非有明确的性能或内存要求。

---

**补充：删除所有匹配项并修改原数组**

如果需要删除所有匹配项且直接修改原数组，可以使用反向 `for` 循环 + `splice`：

```javascript
function removeAll(arr, val) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === val) {
      arr.splice(i, 1);
    }
  }
}
```

通过以上方法，可以灵活应对各种数组删除元素的需求。
