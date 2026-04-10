---
group:
  title: 【03】js数组及数组方法
  order: 3
order: 6
title: 数组去重方法
nav:
  title: JavaScript
  order: 2
---

## 概述

数组去重是前端开发中的常见需求。JavaScript 数组可以存储任意类型的值，去重时需要考虑 `NaN`、`null`、`undefined`、对象引用等特殊情况。本文介绍 10 种常用的数组去重方法，分析它们的原理、优缺点和适用场景。

**测试数据**（包含各种数据类型）：

```javascript
const arr = [
  1,
  1,
  'true',
  'true',
  true,
  true,
  15,
  15,
  false,
  false,
  undefined,
  undefined,
  null,
  null,
  NaN,
  NaN,
  'NaN',
  'NaN',
  0,
  0,
  'a',
  'a',
  {},
  {},
];
```

---

## 1. 双重 for 循环 + splice（正向遍历）

**定义和用法**  
使用两层循环，外层遍历数组元素，内层从当前元素的下一个开始比较，遇到相同元素则使用 `splice` 删除内层元素，并调整索引。该方法直接修改原数组。

**原理**

- 外层循环 `i` 从 0 到 `length-1`。
- 内层循环 `j` 从 `i+1` 到 `length-1`。
- 如果 `arr[i] === arr[j]`，则删除 `arr[j]`（`splice(j,1)`），并将 `j` 减 1（因为数组长度减少，下一个元素会前移）。

**代码实现**

```javascript
function distinct(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        arr.splice(j, 1);
        j--;
      }
    }
  }
  return arr;
}

const result = distinct([...arr]); // 注意原数组会被修改
console.log(result);
// [1, "true", true, 15, false, undefined, null, NaN, NaN, "NaN", 0, "a", {…}, {…}]
```

**优点**

- 可以去除 `String`、`Boolean`、`Number`、`undefined`、`null` 的重复。
- 直接修改原数组，不产生额外内存（除索引调整外）。

**缺点**

- 无法去除 `NaN`（因为 `NaN !== NaN`）。
- 无法去除引用类型（对象、数组等），因为 `{} !== {}`。
- 时间复杂度 O(n²)，数据量大时性能差。

**适用场景**  
仅适用于小数组且不包含 `NaN` 和对象的情况，且希望直接修改原数组。

---

## 2. 双重 for 循环 + splice（逆向遍历）

**定义和用法**  
与正向遍历类似，但外层从末尾开始，内层从外层的前一个开始。同样使用 `splice` 删除重复元素。

**原理**

- 外层循环 `i` 从 `arr.length-1` 到 0。
- 内层循环 `j` 从 `i-1` 到 0。
- 如果 `arr[i] === arr[j]`，删除 `arr[j]`。由于从后向前遍历，删除元素不会影响未遍历的索引。

**代码实现**

```javascript
function distinct(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      if (arr[i] === arr[j]) {
        arr.splice(j, 1);
      }
    }
  }
  return arr;
}

const result = distinct([...arr]);
console.log(result);
// [1, "true", true, 15, false, null, NaN, NaN, "NaN", 0, "a", {…}, {…}]
```

**优点**

- 与正向遍历类似，可以去除基本类型重复（除 `NaN` 和对象）。

**缺点**

- 同样无法处理 `NaN` 和对象。
- 时间复杂度 O(n²)。

**适用场景**  
与正向遍历相同，但代码稍显简洁（无需手动调整 `j`）。

---

## 3. includes + 新数组

**定义和用法**  
创建一个新数组，遍历原数组，使用 `includes` 检查当前元素是否已存在于新数组中，若不存在则添加。

**原理**

- 初始化空数组 `newArr`。
- 遍历原数组，对每个元素调用 `newArr.includes(element)`。
- 若返回 `false`，则 `push` 到 `newArr`。

**代码实现**

```javascript
function distinct(arr) {
  const newArr = [];
  for (let i = 0; i < arr.length; i++) {
    if (!newArr.includes(arr[i])) {
      newArr.push(arr[i]);
    }
  }
  return newArr;
}

console.log(distinct(arr));
// [1, "true", true, 15, false, undefined, null, NaN, "NaN", 0, "a", {…}, {…}]
```

**优点**

- 可以去除 `NaN`（因为 `includes` 使用 `SameValueZero` 比较，`NaN` 被视为相等）。
- 不改变原数组，返回新数组。
- 代码简洁易读。

**缺点**

- 无法去除对象（`{}` 每次都是新引用，`includes` 无法识别）。
- 时间复杂度 O(n²)（`includes` 内部遍历新数组）。

**适用场景**  
适用于数组包含 `NaN` 但不包含对象，且不关心性能的场景。

---

## 4. indexOf + 新数组

**定义和用法**  
与 `includes` 类似，但使用 `indexOf` 判断元素是否已存在于新数组中（`indexOf === -1` 表示不存在）。

**原理**

- 新数组初始为空。
- 遍历原数组，若 `newArr.indexOf(arr[i]) === -1`，则 `push`。

**代码实现**

```javascript
function distinct(arr) {
  const newArr = [];
  for (let i = 0; i < arr.length; i++) {
    if (newArr.indexOf(arr[i]) === -1) {
      newArr.push(arr[i]);
    }
  }
  return newArr;
}

console.log(distinct(arr));
// [1, "true", true, 15, false, undefined, null, NaN, NaN, "NaN", 0, "a", {…}, {…}]
```

**优点**

- 可以去除基本类型（除 `NaN` 外），不改变原数组。

**缺点**

- **不能去除 `NaN`**（因为 `indexOf` 使用严格相等，`NaN !== NaN`，导致两个 `NaN` 都会被添加）。
- 无法去除对象。
- 时间复杂度 O(n²)。

**适用场景**  
仅适用于不含 `NaN` 和对象的小数组。

---

## 5. 对象属性（哈希表）

**定义和用法**  
利用对象属性的唯一性，将数组元素作为对象的键，如果键不存在则添加到新数组。该方法可以区分 `NaN` 和 `'NaN'`？实际测试中发现：`obj[NaN]` 和 `obj['NaN']` 会冲突，因为对象键会被自动转为字符串。因此该方法会将 `NaN` 和 `'NaN'` 视为同一个键。

**原理**

- 创建空对象 `obj` 和空数组 `newArr`。
- 遍历原数组，将每个元素作为键检查 `obj[arr[i]]` 是否为 `true`。
- 若不存在，则设置 `obj[arr[i]] = true` 并将元素加入新数组。

**代码实现**

```javascript
function distinct(arr) {
  const obj = {};
  const newArr = [];
  for (let i = 0; i < arr.length; i++) {
    if (!obj[arr[i]]) {
      obj[arr[i]] = 1;
      newArr.push(arr[i]);
    }
  }
  return newArr;
}

console.log(distinct(arr));
// [1, "true", 15, false, undefined, null, NaN, 0, "a", {…}]
```

**注意**：输出中 `true` 被 `"true"` 覆盖？实际测试：`true` 和 `"true"` 不同，因为对象键 `true` 会被转为 `"true"`，与字符串 `"true"` 冲突，导致只保留一个。另外 `NaN` 和 `"NaN"` 也会冲突。对象 `{}` 作为键会被转为 `"[object Object]"`，所以多个空对象会被视为同一个键，导致只保留一个空对象。

**优点**

- 可以去除对象（因为对象转为字符串后相同引用或相同结构？实际上只保留一个空对象，但不同引用的空对象会被合并，这可能是副作用也可能是优点）。
- 时间复杂度 O(n)。

**缺点**

- **无法区分 `true` 和 `"true"`、`NaN` 和 `"NaN"`**，因为对象键会强制转为字符串。
- 不同对象如果字符串化后相同（如 `{a:1}` 和 `{a:1}` 转为 `"[object Object]"`）会被误判为重复。
- 不适合需要严格区分类型和值的场景。

**适用场景**  
当你希望将不同引用的相同结构的对象视为重复（如去重对象数组）时，但要注意类型转换带来的副作用。

---

## 6. Set + Array.from / 扩展运算符

**定义和用法**  
ES6 提供的 `Set` 数据结构天生不允许重复元素。将数组传入 `Set`，再转换回数组即可去重。

**原理**  
`Set` 内部使用 `SameValueZero` 比较，可以正确识别 `NaN`，但不能区分引用类型（不同对象视为不同）。

**代码实现**

```javascript
function distinct(arr) {
  return Array.from(new Set(arr));
  // 或 return [...new Set(arr)];
}

console.log(distinct(arr));
// [1, "true", true, 15, false, undefined, null, NaN, "NaN", 0, "a", {…}, {…}]
```

**优点**

- 代码极简，性能好（时间复杂度 O(n)）。
- 能正确去除 `NaN`。
- 不改变原数组。

**缺点**

- 无法去除引用类型（对象、数组等），因为 `Set` 比较的是引用。
- 需要 ES6+ 环境（可 polyfill）。

**适用场景**  
大多数现代浏览器环境，数组不含对象时首选。

---

## 7. Map + 新数组

**定义和用法**  
利用 `Map` 的键唯一性，与对象方法类似，但 `Map` 的键可以是任意类型（包括 `NaN`），且不会进行类型转换。

**原理**

- 创建 `Map` 实例和空数组。
- 遍历原数组，调用 `map.has(value)` 判断键是否存在。
- 若不存在，则 `map.set(value, true)` 并将值加入新数组。

**代码实现**

```javascript
function distinct(arr) {
  const map = new Map();
  const newArr = [];
  for (let i = 0; i < arr.length; i++) {
    if (!map.has(arr[i])) {
      map.set(arr[i], true);
      newArr.push(arr[i]);
    }
  }
  return newArr;
}

console.log(distinct(arr));
// [1, "true", true, 15, false, undefined, null, NaN, "NaN", 0, "a", {…}, {…}]
```

**优点**

- 能正确区分 `NaN` 和 `"NaN"`，以及 `true` 和 `"true"`（因为 `Map` 键不转换类型）。
- 时间复杂度 O(n)。
- 不改变原数组。

**缺点**

- 仍无法去除不同引用的对象（因为 `map.has({})` 每次都是不同的键）。
- 需要 ES6+ 环境。

**适用场景**  
需要精确区分基本类型（包括 `NaN`）且不含引用类型的情况。

---

## 8. sort + 相邻比较

**定义和用法**  
先对数组进行排序，然后遍历排序后的数组，只保留与前一个元素不同的元素。

**原理**

- 调用 `sort()` 方法对原数组排序（注意默认排序会转换为字符串，导致 `true` 和 `"true"` 等问题）。
- 遍历排序后的数组，若当前元素与上一个元素不相等，则加入新数组。

**代码实现**

```javascript
function distinct(arr) {
  const sorted = arr.sort();
  const newArr = [];
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1]) {
      newArr.push(sorted[i]);
    }
  }
  return newArr;
}

console.log(distinct(arr));
// [0, 1, 15, NaN, NaN, "NaN", {…}, {…}, "a", false, null, "true", true, undefined]
```

**优点**

- 排序后去重只需 O(n) 遍历。

**缺点**

- `sort()` 默认将元素转为字符串，导致 `true` 和 `"true"` 相邻、`NaN` 无法正确排序（`NaN` 与任何值都不等，但排序后位置不确定，且 `NaN` 之间不相等，导致两个 `NaN` 都可能被保留）。
- 无法去除对象（对象比较的是引用）。
- 会改变原数组（排序），且结果顺序与原数组不同。
- 非常不推荐用于去重。

**适用场景**  
基本不推荐，除非你明确知道数组元素都是原始类型且排序后顺序无所谓。

---

## 9. reduce + 相邻比较（排序后）

**定义和用法**  
先对数组排序，然后使用 `reduce` 累积结果，仅当当前元素与累积结果最后一个元素不同时才加入。

**原理**  
与 `sort + 相邻比较` 类似，但使用 `reduce` 实现。

**代码实现**

```javascript
function distinct(arr) {
  return arr.sort().reduce((acc, cur) => {
    if (acc.length === 0 || acc[acc.length - 1] !== cur) {
      acc.push(cur);
    }
    return acc;
  }, []);
}

console.log(distinct(arr));
// [0, 1, 15, NaN, NaN, "NaN", {…}, {…}, "a", false, null, "true", true, undefined]
```

**优点**

- 代码函数式风格。

**缺点**

- 同方法8，排序带来的类型转换问题依然存在，无法正确处理 `NaN` 和对象。
- 不推荐使用。

---

## 10. Lodash uniqWith（深度比较/自定义比较器）

**定义和用法**  
`_.uniqWith` 是 Lodash 工具库提供的高级去重方法，接收一个**比较器函数**，允许你自定义两个元素是否相等的判断逻辑。尤其适用于**对象数组的深度比较去重**（例如去除相同内容的对象）。

**原理**  
维护一个结果数组，遍历原数组每个元素，用比较器与结果数组中已有的所有元素逐一比较。若无重复则添加。时间复杂度 O(n²)，但灵活性极高。

**代码实现**

```javascript
// 需要先引入 Lodash（假设通过 CDN 或模块化引入）
// const _ = require('lodash');

function distinct(arr) {
  return _.uniqWith(arr, _.isEqual); // 使用深度比较
}

// 测试对象数组
const objArr = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 1, name: 'Charlie' }, // id 相同但 name 不同，此处不重复
];

// 仅按 id 去重
const uniqueById = _.uniqWith(objArr, (a, b) => a.id === b.id);
console.log(uniqueById);
// [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]

// 深度比较（完整内容相同才去重）
const deepUnique = _.uniqWith(objArr, _.isEqual);
console.log(deepUnique);
// 三个对象内容均不同，所以全部保留

// 对于原始测试数据 arr（包含 NaN、对象等）
console.log(_.uniqWith(arr, _.isEqual));
// 注意：{} 和 {} 会被 _.isEqual 判定为相等（内容相同），所以只会保留一个空对象
// 输出示例：[1, "true", true, 15, false, undefined, null, NaN, "NaN", 0, "a", {}]
```

**优点**

- **可处理任意复杂度的深度比较**（如对象、数组嵌套）。
- 支持自定义比较器，灵活性最强。
- 不改变原数组，返回新数组。

**缺点**

- 需要引入 Lodash 库（增加项目体积）。
- 时间复杂度 O(n²)，不适合超大数据量（>1000）。
- 对于原始类型，不如原生 Set 性能好。

**适用场景**

- 需要深度去重对象数组（例如根据对象所有属性值去重）。
- 需要自定义去重逻辑（如根据对象的几个字段组合）。
- 数据量不大，且原生方法无法满足需求。

**手写简化版本（理解原理）**

```javascript
function uniqWith(array, comparator) {
  if (!Array.isArray(array) || array.length === 0) return [];
  const result = [];
  for (let i = 0; i < array.length; i++) {
    let isDuplicate = false;
    for (let j = 0; j < result.length; j++) {
      if (comparator(array[i], result[j])) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) result.push(array[i]);
  }
  return result;
}

// 使用手写版本测试
const customUnique = uniqWith(arr, (a, b) => {
  if (typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return a === b;
});
```

---

## 11. 方法对比总结

| 方法                      | 是否改变原数组 | 能否去重 NaN   | 能否去重对象（引用/内容） | 时间复杂度 | 适用场景                               |
| ------------------------- | -------------- | -------------- | ------------------------- | ---------- | -------------------------------------- |
| 双重循环 + splice（正向） | ✅             | ❌             | ❌                        | O(n²)      | 小数组，不含 NaN 和对象，需修改原数组  |
| 双重循环 + splice（逆向） | ✅             | ❌             | ❌                        | O(n²)      | 同上                                   |
| includes + 新数组         | ❌             | ✅             | ❌                        | O(n²)      | 数组含 NaN 但不含对象                  |
| indexOf + 新数组          | ❌             | ❌             | ❌                        | O(n²)      | 不含 NaN 和对象的小数组                |
| 对象属性（哈希）          | ❌             | ⚠️ 与'NaN'冲突 | ⚠️ 合并相同字符串化的对象 | O(n)       | 需要合并相同结构的对象（牺牲类型区分） |
| Set                       | ❌             | ✅             | ❌（仅引用）              | O(n)       | 现代开发首选，不含对象时               |
| Map                       | ❌             | ✅             | ❌（仅引用）              | O(n)       | 需区分 NaN 和 'NaN'，不含对象          |
| sort + 相邻比较           | ✅（排序）     | ❌             | ❌                        | O(n log n) | **不推荐**，有严重缺陷                 |
| reduce + 排序后相邻比较   | ✅（排序）     | ❌             | ❌                        | O(n log n) | **不推荐**                             |
| Lodash uniqWith           | ❌             | ✅（可配置）   | ✅（深度比较或自定义）    | O(n²)      | 需要深度比较对象数组，或自定义去重逻辑 |

**推荐总结**：

- **基本类型数组去重**：优先使用 `Set`（`[...new Set(arr)]`），性能好且能处理 `NaN`。
- **对象数组按属性去重**：使用 `Map` 或 `_.uniqBy`（Lodash）。
- **对象数组深度去重（内容相同）**：使用 `_.uniqWith(arr, _.isEqual)` 或手写深度比较。
- **不推荐**：双重循环、排序去重等方法，除非数据量极小且有特殊需求。

掌握这 10 种方法，可以应对几乎所有数组去重场景。
