---
group:
  title: 【03】js数组及数组方法
  order: 3
order: 3
title: 不会改变原数组的方法
nav:
  title: JavaScript
  order: 2
---

这些方法不会修改原数组，而是返回新数组、字符串、布尔值或其他值。它们通常用于数据转换、查询和合并。

## 1. concat() – 合并数组

**定义和用法**  
`concat()` 方法用于连接两个或多个数组（或值），返回新数组，原数组不变。

**语法规则**

```javascript
array1.concat(array2, array3, ..., arrayX)
```

**参数**  
`array2, array3, ..., arrayX` — 必需。可以是具体值或数组，任意多个。

**返回值**  
`Array` — 合并后的新数组。如果参数是数组，则展开其元素；如果是值，则直接添加。

**原理**  
创建一个新数组，先拷贝原数组所有元素，然后依次处理每个参数：如果参数是数组，则遍历其元素添加到新数组；否则直接添加该值。

**手写实现**

```javascript
Array.prototype.myConcat = function (...args) {
  const result = [];
  // 添加原数组元素
  for (let i = 0; i < this.length; i++) {
    result.push(this[i]);
  }
  // 处理参数
  for (let arg of args) {
    if (Array.isArray(arg)) {
      for (let item of arg) {
        result.push(item);
      }
    } else {
      result.push(arg);
    }
  }
  return result;
};
```

**注意事项**

- 不会修改原数组，只返回新数组。
- 浅拷贝：如果原数组或参数数组中的元素是对象，新数组中的对象引用与原数组相同。

**举例学习**

```javascript
let arr = [1, 2, 3, 4];
console.log(arr.concat(5)); // [1,2,3,4,5]
console.log(arr.concat([5, 6])); // [1,2,3,4,5,6]
console.log(arr.concat([5, 6], [7])); // [1,2,3,4,5,6,7]
console.log(arr); // [1,2,3,4]（原数组不变）
```

**面试题：用 concat 生成重复元素数组**

```javascript
function repeat(m, n) {
  return m ? repeat(m - 1, n).concat(n) : [];
}
console.log(repeat(8, 6)); // [6,6,6,6,6,6,6,6]
```

---

## 2. slice() – 截取

**定义和用法**  
`slice()` 方法返回一个新的数组，包含原数组中从 `begin` 到 `end`（不包括 `end`）的浅拷贝。

**语法规则**

```javascript
arr.slice([begin[, end]])
```

**参数**

- `begin`（可选）— 起始索引，负数表示从末尾计数。省略则从0开始。
- `end`（可选）— 结束索引（不包括），负数表示从末尾计数。省略则到末尾。

**返回值**  
`Array` — 包含提取元素的新数组。

**原理**  
创建一个空数组，遍历原数组从 `begin` 到 `end-1`，将每个元素添加到新数组。

**手写实现**

```javascript
Array.prototype.mySlice = function (begin = 0, end = this.length) {
  if (begin < 0) begin = this.length + begin;
  if (end < 0) end = this.length + end;
  begin = Math.max(begin, 0);
  end = Math.min(end, this.length);
  const result = [];
  for (let i = begin; i < end; i++) {
    result.push(this[i]);
  }
  return result;
};
```

**注意事项**

- 原数组不变。
- 浅拷贝：数组元素为对象时，新数组中的对象引用同一对象。
- 可用于快速复制数组：`let copy = arr.slice()`。

**举例学习**

```javascript
let arr = [1, 2, 3, 4, 5];
let slice1 = arr.slice(1, 3);
console.log(slice1); // [2, 3]
let slice2 = arr.slice(-3, -1);
console.log(slice2); // [3, 4]
let copy = arr.slice();
console.log(copy); // [1, 2, 3, 4, 5]
```

---

## 3. join() – 转字符串

**定义和用法**  
`join()` 方法将数组所有元素连接成一个字符串，用指定分隔符分隔。

**语法规则**

```javascript
arr.join([separator]);
```

**参数**  
`separator`（可选）— 分隔符，默认为逗号 `,`。

**返回值**  
`string` — 连接后的字符串。

**原理**  
遍历数组，将每个元素（转换为字符串）与分隔符拼接。如果数组为空则返回空字符串。

**手写实现**

```javascript
Array.prototype.myJoin = function (separator = ',') {
  let result = '';
  for (let i = 0; i < this.length; i++) {
    if (i > 0) result += separator;
    result += this[i] == null ? '' : String(this[i]);
  }
  return result;
};
```

**注意事项**

- `null` 和 `undefined` 会被转换为空字符串。
- 原数组不变。

**举例学习**

```javascript
let arr = ['Hello', 'world', 'JavaScript'];
console.log(arr.join()); // "Hello,world,JavaScript"
console.log(arr.join(' ')); // "Hello world JavaScript"
console.log(arr.join('-')); // "Hello-world-JavaScript"
```

---

## 4. indexOf() – 正向查找索引

**定义和用法**  
`indexOf()` 方法返回数组中给定元素的第一个索引，不存在则返回 -1。从 `fromIndex` 开始正向搜索。

**语法规则**

```javascript
arr.indexOf(searchElement[, fromIndex])
```

**参数**

- `searchElement` — 必需。要查找的元素。
- `fromIndex`（可选）— 开始搜索的索引，默认0。负数表示从末尾偏移。

**返回值**  
`number` — 元素索引，未找到返回 -1。

**原理**  
从 `fromIndex` 开始遍历数组，使用严格相等（`===`）比较，注意 `NaN` 永远不相等（`NaN === NaN` 为 false）。

**手写实现**

```javascript
Array.prototype.myIndexOf = function (searchElement, fromIndex = 0) {
  let start = fromIndex >= 0 ? fromIndex : this.length + fromIndex;
  start = Math.max(start, 0);
  for (let i = start; i < this.length; i++) {
    if (this[i] === searchElement) return i;
  }
  return -1;
};
```

**注意事项**

- 使用严格相等，不能查找 `NaN`（因为 `NaN !== NaN`）。
- 原数组不变。

**举例学习**

```javascript
let arr = [2, 5, 9, 2];
console.log(arr.indexOf(2)); // 0
console.log(arr.indexOf(2, 1)); // 3
console.log(arr.indexOf(7)); // -1
console.log([NaN].indexOf(NaN)); // -1
```

---

## 5. lastIndexOf() – 反向查找索引

**定义和用法**  
`lastIndexOf()` 方法返回数组中给定元素的最后一个索引，不存在则返回 -1。从 `fromIndex` 开始反向搜索。

**语法规则**

```javascript
arr.lastIndexOf(searchElement[, fromIndex])
```

**参数**

- `searchElement` — 必需。要查找的元素。
- `fromIndex`（可选）— 开始搜索的索引，默认 `length-1`。负数表示从末尾偏移。

**返回值**  
`number` — 元素索引，未找到返回 -1。

**原理**  
从 `fromIndex` 开始逆向遍历数组，使用严格相等比较。

**手写实现**

```javascript
Array.prototype.myLastIndexOf = function (searchElement, fromIndex = this.length - 1) {
  let start = fromIndex >= 0 ? fromIndex : this.length + fromIndex;
  start = Math.min(start, this.length - 1);
  for (let i = start; i >= 0; i--) {
    if (this[i] === searchElement) return i;
  }
  return -1;
};
```

**注意事项**

- 不能查找 `NaN`。
- 原数组不变。

**举例学习**

```javascript
let arr = [2, 5, 9, 2];
console.log(arr.lastIndexOf(2)); // 3
console.log(arr.lastIndexOf(2, 2)); // 0
```

---

## 6. includes() – 是否包含

**定义和用法**  
`includes()` 方法判断数组是否包含某个值，返回布尔值。可以处理 `NaN`。

**语法规则**

```javascript
arr.includes(searchElement[, fromIndex])
```

**参数**

- `searchElement` — 必需。要查找的值。
- `fromIndex`（可选）— 开始搜索的索引，默认0。

**返回值**  
`boolean` — 包含返回 `true`，否则 `false`。

**原理**  
类似于 `indexOf`，但使用 `SameValueZero` 比较（`NaN` 被视为相等），且返回布尔值。

**手写实现**

```javascript
Array.prototype.myIncludes = function (searchElement, fromIndex = 0) {
  let start = fromIndex >= 0 ? fromIndex : this.length + fromIndex;
  start = Math.max(start, 0);
  for (let i = start; i < this.length; i++) {
    if (Object.is(this[i], searchElement)) return true;
  }
  return false;
};
```

**注意事项**

- 能正确判断 `NaN`：`[NaN].includes(NaN)` 返回 `true`。
- 原数组不变。

**举例学习**

```javascript
console.log([1, 2, 3].includes(2)); // true
console.log([1, 2, 3].includes(4)); // false
console.log([NaN].includes(NaN)); // true
```

---

## 7. toString() – 转字符串

**定义和用法**  
`toString()` 方法返回一个表示数组的字符串，相当于 `join(',')`。

**语法规则**

```javascript
arr.toString();
```

**参数**  
无

**返回值**  
`string` — 数组的字符串表示。

**原理**  
调用 `join(',')` 方法。

**手写实现**

```javascript
Array.prototype.myToString = function () {
  return this.join(',');
};
```

**注意事项**

- 原数组不变。

**举例学习**

```javascript
let arr = [1, 2, 3];
console.log(arr.toString()); // "1,2,3"
```

---

## 8. toLocaleString() – 本地化字符串

**定义和用法**  
`toLocaleString()` 返回一个表示数组元素的本地化字符串。每个元素会调用自身的 `toLocaleString` 方法。

**语法规则**

```javascript
arr.toLocaleString([locales[, options]])
```

**参数**

- `locales`（可选）— 语言标签。
- `options`（可选）— 配置对象。

**返回值**  
`string` — 本地化字符串。

**原理**  
遍历数组，对每个元素调用 `toLocaleString`，然后用逗号连接。

**手写实现**（简化）

```javascript
Array.prototype.myToLocaleString = function (locales, options) {
  let result = '';
  for (let i = 0; i < this.length; i++) {
    if (i > 0) result += ',';
    if (this[i] != null) {
      result += this[i].toLocaleString(locales, options);
    }
  }
  return result;
};
```

**注意事项**

- 原数组不变。

**举例学习**

```javascript
let arr = [123456.789, new Date()];
console.log(arr.toLocaleString('de-DE'));
// 例如 "123.456,789,10.4.2025, 12:00:00"
```

---

## 9. 静态方法：Array.isArray()

**定义和用法**  
`Array.isArray()` 判断一个值是否为数组，返回布尔值。

**语法规则**

```javascript
Array.isArray(value);
```

**参数**  
`value` — 待检测的值。

**返回值**  
`boolean`

**原理**  
检查对象的内部 `[[Class]]` 或使用 `Symbol.toStringTag` 是否为 `Array`，跨框架可靠。

**手写实现**（基于 `toString`）

```javascript
Array.isArray = function (value) {
  return Object.prototype.toString.call(value) === '[object Array]';
};
```

**注意事项**

- 比 `instanceof` 更可靠，能处理跨窗口数组。
- 不会修改原数组。

**举例学习**

```javascript
console.log(Array.isArray([])); // true
console.log(Array.isArray({})); // false
```

---

## 10. 静态方法：Array.from()

**定义和用法**  
`Array.from()` 从类数组或可迭代对象创建新数组，可选映射函数。

**语法规则**

```javascript
Array.from(arrayLike[, mapFn[, thisArg]])
```

**参数**

- `arrayLike` — 类数组对象或可迭代对象。
- `mapFn`（可选）— 映射函数。
- `thisArg`（可选）— 映射函数的 `this`。

**返回值**  
`Array` — 新数组。

**原理**  
获取对象的 `length` 属性，然后遍历索引，将值（或经过映射）放入新数组。

**手写实现**（简化）

```javascript
Array.from = function (arrayLike, mapFn, thisArg) {
  const result = [];
  const length = arrayLike.length;
  for (let i = 0; i < length; i++) {
    let value = arrayLike[i];
    if (mapFn) value = mapFn.call(thisArg, value, i);
    result.push(value);
  }
  return result;
};
```

**举例学习**

```javascript
console.log(Array.from('hello')); // ['h','e','l','l','o']
console.log(Array.from([1, 2, 3], (x) => x * 2)); // [2,4,6]
```

---

## 11. 静态方法：Array.of()

**定义和用法**  
`Array.of()` 用参数创建新数组，解决 `Array(5)` 与 `Array(5,6)` 不一致的问题。

**语法规则**

```javascript
Array.of(element0[, element1[, ...]])
```

**参数**  
任意个元素。

**返回值**  
`Array` — 新数组。

**原理**  
直接使用参数构建数组。

**手写实现**

```javascript
Array.of = function (...items) {
  return items;
};
```

**举例学习**

```javascript
console.log(Array.of(5)); // [5]
console.log(Array.of(1, 2, 3)); // [1,2,3]
```

---

## 12. ES2023 新增方法

以下方法是 ECMAScript 2023 引入的不可变数组方法，它们返回新数组而不修改原数组。

### 12.1 toReversed() – 反转（返回新数组）

**定义和用法**  
`toReversed()` 方法返回一个新数组，其元素顺序与原数组相反。相当于 `reverse()` 的不可变版本。

**语法规则**

```javascript
arr.toReversed();
```

**参数**  
无

**返回值**  
`Array` — 反转后的新数组。

**原理**  
创建一个新数组，从原数组末尾开始依次添加元素。

**手写实现**

```javascript
Array.prototype.myToReversed = function () {
  const result = [];
  for (let i = this.length - 1; i >= 0; i--) {
    result.push(this[i]);
  }
  return result;
};
```

**注意事项**

- 原数组不变。
- 稀疏数组的空位在新数组中会转为 `undefined`（按规范）。

**举例学习**

```javascript
let arr = [1, 2, 3];
let reversed = arr.toReversed();
console.log(reversed); // [3, 2, 1]
console.log(arr); // [1, 2, 3]（不变）
```

### 12.2 toSorted() – 排序（返回新数组）

**定义和用法**  
`toSorted()` 方法返回一个新数组，其元素已排序，相当于 `sort()` 的不可变版本。

**语法规则**

```javascript
arr.toSorted([compareFunction]);
```

**参数**  
`compareFunction`（可选）— 比较函数，同 `sort`。

**返回值**  
`Array` — 排序后的新数组。

**原理**  
复制原数组，然后对新数组调用 `sort`。

**手写实现**

```javascript
Array.prototype.myToSorted = function (compareFn) {
  const copy = this.slice();
  copy.sort(compareFn);
  return copy;
};
```

**注意事项**

- 原数组不变。

**举例学习**

```javascript
let arr = [3, 1, 4, 2];
let sorted = arr.toSorted((a, b) => a - b);
console.log(sorted); // [1, 2, 3, 4]
console.log(arr); // [3, 1, 4, 2]（不变）
```

### 12.3 toSpliced() – 添加/删除元素（返回新数组）

**定义和用法**  
`toSpliced()` 方法返回一个新数组，在指定位置删除/替换/添加元素，相当于 `splice()` 的不可变版本。

**语法规则**

```javascript
arr.toSpliced(start[, deleteCount[, item1[, item2[, ...]]]])
```

**参数**

- `start` — 必需。起始索引。
- `deleteCount`（可选）— 删除个数。
- `item1, item2, ...`（可选）— 要插入的元素。

**返回值**  
`Array` — 修改后的新数组。

**原理**  
复制原数组，然后在新数组上执行 `splice`。

**手写实现**

```javascript
Array.prototype.myToSpliced = function (start, deleteCount, ...items) {
  const copy = this.slice();
  copy.splice(start, deleteCount, ...items);
  return copy;
};
```

**举例学习**

```javascript
let arr = [1, 2, 3, 4];
let spliced = arr.toSpliced(1, 2, 'a', 'b');
console.log(spliced); // [1, 'a', 'b', 4]
console.log(arr); // [1, 2, 3, 4]（不变）
```

### 12.4 with() – 替换单个元素（返回新数组）

**定义和用法**  
`with()` 方法返回一个新数组，将指定索引处的元素替换为新值。相当于 `arr[index] = value` 的不可变版本。

**语法规则**

```javascript
arr.with(index, value);
```

**参数**

- `index` — 索引（支持负数，从末尾计数）。
- `value` — 新值。

**返回值**  
`Array` — 替换后的新数组。

**原理**  
复制原数组，然后将指定索引位置赋值为新值。

**手写实现**

```javascript
Array.prototype.myWith = function (index, value) {
  if (index < 0) index = this.length + index;
  const copy = this.slice();
  copy[index] = value;
  return copy;
};
```

**注意事项**

- 原数组不变。
- 索引越界时会抛出错误。

**举例学习**

```javascript
let arr = [1, 2, 3, 4];
let newArr = arr.with(1, 99);
console.log(newArr); // [1, 99, 3, 4]
console.log(arr); // [1, 2, 3, 4]（不变）
```

---

## 方法对比总结

| 方法             | 返回值类型 | 是否返回新数组 | 主要用途                       |
| ---------------- | ---------- | -------------- | ------------------------------ |
| `concat`         | Array      | ✅             | 合并数组或值                   |
| `slice`          | Array      | ✅             | 截取子数组                     |
| `join`           | String     | ❌             | 转为字符串                     |
| `indexOf`        | Number     | ❌             | 正向查找索引                   |
| `lastIndexOf`    | Number     | ❌             | 反向查找索引                   |
| `includes`       | Boolean    | ❌             | 判断是否包含                   |
| `toString`       | String     | ❌             | 转为字符串（逗号分隔）         |
| `toLocaleString` | String     | ❌             | 本地化字符串                   |
| `Array.isArray`  | Boolean    | ❌             | 静态方法，判断是否为数组       |
| `Array.from`     | Array      | ✅             | 静态方法，从类数组/可迭代创建  |
| `Array.of`       | Array      | ✅             | 静态方法，用参数创建数组       |
| `toReversed`     | Array      | ✅             | ES2023，反转（不可变）         |
| `toSorted`       | Array      | ✅             | ES2023，排序（不可变）         |
| `toSpliced`      | Array      | ✅             | ES2023，增删改（不可变）       |
| `with`           | Array      | ✅             | ES2023，替换单个元素（不可变） |

**注意**：以上所有方法都不会修改原数组，因此适合在函数式编程中安全地操作数据。

掌握这些方法可以帮助你编写更清晰、无副作用的代码。
