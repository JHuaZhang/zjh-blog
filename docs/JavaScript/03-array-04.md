---
group:
  title: 【03】js数组及数组方法
  order: 3
order: 4
title: 数组遍历方法
nav:
  title: JavaScript
  order: 2
---

这些方法用于遍历数组元素，执行回调函数或生成新的数组/值。它们都不会修改原数组（除非回调内部显式修改）。

## 1. forEach() – 遍历执行

**定义和用法**  
`forEach()` 方法对数组每个元素执行一次回调函数，返回 `undefined`。常用于替代 `for` 循环。

**语法规则**
```javascript
arr.forEach(callback(currentValue[, index[, array]])[, thisArg])
```

**参数**  
- `callback` — 必需。对每个元素执行的函数，接收三个参数：
  - `currentValue`：当前元素的值。
  - `index`（可选）：当前元素的索引。
  - `array`（可选）：调用 `forEach` 的数组本身。
- `thisArg`（可选）— 执行 `callback` 时，用作 `this` 的值。

**返回值**  
`undefined`

**原理**  
遍历数组，对每个存在的元素（跳过稀疏数组的空位）调用回调函数。

**手写实现**
```javascript
Array.prototype.myForEach = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this) { // 跳过空位
      callback.call(thisArg, this[i], i, this);
    }
  }
};
```

**注意事项**  
- 不修改原数组，但回调函数内可以修改原数组（例如修改 `array[i]` 或修改对象的属性）。
- 不能中途终止（若要终止可用 `some` 或 `every` 或 `for` 循环）。
- 稀疏数组的空位不会被遍历。
- **通过 `item` 修改原数组**：如果元素是对象，修改 `item` 的属性会影响原数组；如果元素是基本类型，直接修改 `item` 不会影响原数组，但可以通过 `array[index] = newValue` 来修改。
- **能否使用 `break` / `continue`**：❌ 不能。`forEach` 是函数调用，无法在回调中使用 `break` 或 `continue` 语法。若要提前终止，应使用 `for` 循环或 `some` / `every` / `find` 等方法。

**举例学习**
```javascript
let arr = [1, 2, 3];
arr.forEach((v, i, a) => a[i] = v * 2);
console.log(arr); // [2, 4, 6]（原数组被修改）

let objArr = [{ val: 1 }, { val: 2 }];
objArr.forEach(item => item.val *= 2);
console.log(objArr); // [{ val: 2 }, { val: 4 }]（对象属性被修改）
```

---

## 2. map() – 映射为新数组

**定义和用法**  
`map()` 方法对每个元素执行回调，返回由回调结果组成的新数组，长度与原数组相同。

**语法规则**
```javascript
arr.map(callback(currentValue[, index[, array]])[, thisArg])
```

**参数**  
- `callback` — 必需。对每个元素执行的函数，接收三个参数：
  - `currentValue`：当前元素的值。
  - `index`（可选）：当前元素的索引。
  - `array`（可选）：调用 `map` 的数组本身。
- `thisArg`（可选）— 执行 `callback` 时，用作 `this` 的值。

**返回值**  
`Array` — 新数组，每个元素是回调的返回值。

**原理**  
创建新数组，遍历原数组，将回调结果放入新数组对应位置（稀疏数组保留空位）。

**手写实现**
```javascript
Array.prototype.myMap = function(callback, thisArg) {
  const result = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result[i] = callback.call(thisArg, this[i], i, this);
    }
  }
  return result;
};
```

**注意事项**  
- 原数组不变。
- 返回新数组，长度与原数组相同。
- 稀疏数组的空位在新数组中也是空位。
- 回调中修改 `item` 不会影响原数组（因为是按值传递，基本类型不改变原数组，对象属性修改会影响原数组，但通常不推荐在 `map` 中修改原数组）。
- **能否使用 `break` / `continue`**：❌ 不能。`map` 总是遍历所有元素，无法提前终止。

**举例学习**
```javascript
let arr = [1, 2, 3];
let doubled = arr.map(x => x * 2);
console.log(doubled); // [2, 4, 6]
console.log(arr);     // [1, 2, 3]
```

**面试题：使用 map 从对象数组提取属性**
```javascript
let users = [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }];
let names = users.map(u => u.name);
console.log(names); // ['Alice', 'Bob']
```

---

## 3. filter() – 过滤出符合条件的元素

**定义和用法**  
`filter()` 方法返回通过回调测试的元素组成的新数组。

**语法规则**
```javascript
arr.filter(callback(element[, index[, array]])[, thisArg])
```

**参数**  
- `callback` — 必需。对每个元素执行的函数，接收三个参数：
  - `element`：当前元素的值。
  - `index`（可选）：当前元素的索引。
  - `array`（可选）：调用 `filter` 的数组本身。  
  该函数应返回布尔值，`true` 表示保留该元素。
- `thisArg`（可选）— 执行 `callback` 时，用作 `this` 的值。

**返回值**  
`Array` — 包含测试通过的元素的新数组。

**原理**  
遍历数组，对每个元素执行回调，如果返回 `true` 则将该元素添加到结果数组。

**手写实现**
```javascript
Array.prototype.myFilter = function(callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};
```

**注意事项**  
- 原数组不变。
- 结果数组总是密集的（跳过空位）。
- **能否使用 `break` / `continue`**：❌ 不能。`filter` 总是遍历所有元素，不能提前终止。

**举例学习**
```javascript
let arr = [1, 2, 3, 4];
let evens = arr.filter(x => x % 2 === 0);
console.log(evens); // [2, 4]
```

---

## 4. reduce() – 累积计算（从左到右）

**定义和用法**  
`reduce()` 方法对数组每个元素执行回调，将结果累积为单个值（从左到右）。

**语法规则**
```javascript
arr.reduce(callback(accumulator, currentValue[, index[, array]])[, initialValue])
```

**参数**  
- `callback` — 必需。累积函数，接收四个参数：
  - `accumulator`：上一次调用累积的返回值，或提供的 `initialValue`。
  - `currentValue`：当前元素的值。
  - `index`（可选）：当前元素的索引。
  - `array`（可选）：调用 `reduce` 的数组本身。
- `initialValue`（可选）— 初始值。如果省略，则使用数组第一个元素作为初始值，并从第二个元素开始遍历。

**返回值**  
`any` — 最终累积结果。

**原理**  
如果没有提供 `initialValue`，则将第一个元素作为初始值，从索引1开始遍历；否则从索引0开始，将初始值和当前元素传给回调，更新累积值。

**手写实现**
```javascript
Array.prototype.myReduce = function(callback, initialValue) {
  let accumulator = initialValue;
  let startIndex = 0;
  if (arguments.length === 1) {
    if (this.length === 0) throw new TypeError('Reduce of empty array with no initial value');
    accumulator = this[0];
    startIndex = 1;
  }
  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      accumulator = callback(accumulator, this[i], i, this);
    }
  }
  return accumulator;
};
```

**注意事项**  
- 空数组且没有初始值时抛出错误。
- 稀疏数组跳过空位。
- 原数组不变。
- **能否使用 `break` / `continue`**：❌ 不能。`reduce` 总是遍历所有元素（或直到结束），无法提前终止。若需要提前终止，可改用 `for` 循环或结合 `some` 等。

**举例学习**
```javascript
let arr = [1, 2, 3, 4];
let sum = arr.reduce((acc, cur) => acc + cur, 0);
console.log(sum); // 10

let product = arr.reduce((acc, cur) => acc * cur);
console.log(product); // 24
```

**面试题：数组去重**
```javascript
let arr = [1, 2, 2, 3, 3, 4];
let unique = arr.reduce((acc, cur) => {
  if (!acc.includes(cur)) acc.push(cur);
  return acc;
}, []);
console.log(unique); // [1, 2, 3, 4]
```

---

## 5. reduceRight() – 累积计算（从右到左）

**定义和用法**  
`reduceRight()` 与 `reduce` 类似，但从右向左累积。

**语法规则**
```javascript
arr.reduceRight(callback(accumulator, currentValue[, index[, array]])[, initialValue])
```

**参数**  
- `callback` — 必需。累积函数，接收四个参数：
  - `accumulator`：上一次调用累积的返回值，或提供的 `initialValue`。
  - `currentValue`：当前元素的值。
  - `index`（可选）：当前元素的索引。
  - `array`（可选）：调用 `reduceRight` 的数组本身。
- `initialValue`（可选）— 初始值。如果省略，则使用数组最后一个元素作为初始值，并从倒数第二个元素开始遍历。

**返回值**  
`any` — 最终累积结果。

**原理**  
从最后一个元素开始，逆向遍历。

**手写实现**
```javascript
Array.prototype.myReduceRight = function(callback, initialValue) {
  let accumulator = initialValue;
  let startIndex = this.length - 1;
  if (arguments.length === 1) {
    if (this.length === 0) throw new TypeError('Reduce of empty array with no initial value');
    accumulator = this[this.length - 1];
    startIndex = this.length - 2;
  }
  for (let i = startIndex; i >= 0; i--) {
    if (i in this) {
      accumulator = callback(accumulator, this[i], i, this);
    }
  }
  return accumulator;
};
```

**注意事项**  
同 `reduce`。
- **能否使用 `break` / `continue`**：❌ 不能。与 `reduce` 相同，无法提前终止。

**举例学习**
```javascript
let arr = [[0, 1], [2, 3], [4, 5]];
let flat = arr.reduceRight((acc, cur) => acc.concat(cur), []);
console.log(flat); // [4, 5, 2, 3, 0, 1]
```

---

## 6. some() – 是否有元素通过测试

**定义和用法**  
`some()` 方法测试数组中是否至少有一个元素通过回调测试，返回布尔值。

**语法规则**
```javascript
arr.some(callback(element[, index[, array]])[, thisArg])
```

**参数**  
- `callback` — 必需。对每个元素执行的函数，接收三个参数：
  - `element`：当前元素的值。
  - `index`（可选）：当前元素的索引。
  - `array`（可选）：调用 `some` 的数组本身。  
  该函数应返回布尔值。
- `thisArg`（可选）— 执行 `callback` 时，用作 `this` 的值。

**返回值**  
`boolean` — 存在返回 `true`，否则 `false`。

**原理**  
遍历数组，一旦回调返回 `true` 则立即返回 `true`；遍历结束返回 `false`。

**手写实现**
```javascript
Array.prototype.mySome = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      return true;
    }
  }
  return false;
};
```

**注意事项**  
- 空数组始终返回 `false`。
- 遇到第一个通过测试的元素即停止遍历。
- **能否使用 `break` / `continue`**：✅ 间接支持。`some` 本身不支持 `break`/`continue` 语法，但可以通过回调返回 `true` 来**终止**循环（类似 `break`）。无法实现 `continue` 效果（跳过当前元素继续后续），因为 `some` 的终止条件是遇到 `true`，而 `false` 会继续。若需要跳过某些元素而不终止，可在回调内编写条件，不返回 `true` 即可。

**break 示例（使用 some 模拟 break）**
```javascript
let arr = [1, 2, 3, 4, 5];
let result = 0;
arr.some(num => {
  if (num === 3) return true; // 当遇到 3 时终止循环
  result += num;
  return false;
});
console.log(result); // 1 + 2 = 3，遇到3后停止，不再累加4和5
```

**continue 示例（使用 some 模拟跳过）**
```javascript
// 跳过偶数，只累加奇数，但继续遍历（不是真的 continue，而是条件控制）
let arr = [1, 2, 3, 4, 5];
let sum = 0;
arr.some(num => {
  if (num % 2 === 0) return false; // 偶数跳过，继续
  sum += num;
  return false;
});
console.log(sum); // 1 + 3 + 5 = 9
```

---

## 7. every() – 是否所有元素通过测试

**定义和用法**  
`every()` 方法测试数组中是否所有元素都通过回调测试，返回布尔值。

**语法规则**
```javascript
arr.every(callback(element[, index[, array]])[, thisArg])
```

**参数**  
- `callback` — 必需。对每个元素执行的函数，接收三个参数：
  - `element`：当前元素的值。
  - `index`（可选）：当前元素的索引。
  - `array`（可选）：调用 `every` 的数组本身。  
  该函数应返回布尔值。
- `thisArg`（可选）— 执行 `callback` 时，用作 `this` 的值。

**返回值**  
`boolean` — 全部通过返回 `true`，否则 `false`。

**原理**  
遍历数组，一旦回调返回 `false` 则立即返回 `false`；遍历结束返回 `true`。

**手写实现**
```javascript
Array.prototype.myEvery = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && !callback.call(thisArg, this[i], i, this)) {
      return false;
    }
  }
  return true;
};
```

**注意事项**  
- 空数组始终返回 `true`。
- 遇到第一个不通过的元素即停止遍历。
- **能否使用 `break` / `continue`**：✅ 间接支持。`every` 可以通过回调返回 `false` 来**终止**循环（类似 `break`）。无法实现 `continue`，但可以通过条件控制，对于要跳过的元素返回 `true` 即可继续。

**break 示例（使用 every 模拟 break）**
```javascript
let arr = [2, 4, 6, 7, 8];
let result = 0;
arr.every(num => {
  if (num % 2 !== 0) return false; // 遇到奇数时终止
  result += num;
  return true;
});
console.log(result); // 2 + 4 + 6 = 12，遇到7后停止，不再累加8
```

**continue 示例（使用 every 模拟跳过）**
```javascript
// 跳过大于10的数，累加其他数（继续遍历）
let arr = [5, 12, 8, 15, 3];
let sum = 0;
arr.every(num => {
  if (num > 10) return true; // 跳过大于10的数，继续
  sum += num;
  return true;
});
console.log(sum); // 5 + 8 + 3 = 16
```

---

## 8. find() – 查找第一个元素

**定义和用法**  
`find()` 方法返回数组中第一个通过回调测试的元素，否则返回 `undefined`。

**语法规则**
```javascript
arr.find(callback(element[, index[, array]])[, thisArg])
```

**参数**  
- `callback` — 必需。对每个元素执行的函数，接收三个参数：
  - `element`：当前元素的值。
  - `index`（可选）：当前元素的索引。
  - `array`（可选）：调用 `find` 的数组本身。  
  该函数应返回布尔值。
- `thisArg`（可选）— 执行 `callback` 时，用作 `this` 的值。

**返回值**  
`any` — 第一个满足条件的元素，未找到返回 `undefined`。

**原理**  
遍历数组，当回调返回 `true` 时返回当前元素，遍历结束返回 `undefined`。

**手写实现**
```javascript
Array.prototype.myFind = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      return this[i];
    }
  }
  return undefined;
};
```

**注意事项**  
- 原数组不变。
- 空位会被跳过。
- **能否使用 `break` / `continue`**：✅ 间接支持。`find` 会在找到第一个满足条件的元素时立即返回，相当于 `break`。无法实现 `continue`，因为一旦匹配就终止。

**break 示例（find 自然行为）**
```javascript
let arr = [10, 20, 30, 40, 50];
let found = arr.find(num => {
  console.log(num);
  return num > 25;
});
// 输出 10,20,30，找到30后停止
console.log(found); // 30
```

---

## 9. findIndex() – 查找第一个索引

**定义和用法**  
`findIndex()` 返回第一个满足回调测试的元素索引，否则返回 -1。

**语法规则**
```javascript
arr.findIndex(callback(element[, index[, array]])[, thisArg])
```

**参数**  
- `callback` — 必需。对每个元素执行的函数，接收三个参数：
  - `element`：当前元素的值。
  - `index`（可选）：当前元素的索引。
  - `array`（可选）：调用 `findIndex` 的数组本身。  
  该函数应返回布尔值。
- `thisArg`（可选）— 执行 `callback` 时，用作 `this` 的值。

**返回值**  
`number` — 元素索引，未找到返回 -1。

**原理**  
同 `find`，但返回索引而非值。

**手写实现**
```javascript
Array.prototype.myFindIndex = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      return i;
    }
  }
  return -1;
};
```

**注意事项**  
- **能否使用 `break` / `continue`**：✅ 间接支持。与 `find` 类似，找到第一个满足条件的索引后立即返回，相当于 `break`。

**break 示例（findIndex 自然行为）**
```javascript
let arr = [5, 12, 8, 130];
let index = arr.findIndex(num => {
  console.log(num);
  return num > 10;
});
// 输出 5,12，找到12后停止
console.log(index); // 1
```

---

## 10. flatMap() – 映射后扁平化

**定义和用法**  
`flatMap()` 方法先对每个元素执行映射函数，然后将结果扁平化深度为1，相当于 `map().flat(1)`，但效率更高。

**语法规则**
```javascript
arr.flatMap(callback(currentValue[, index[, array]])[, thisArg])
```

**参数**  
- `callback` — 必需。对每个元素执行的函数，接收三个参数：
  - `currentValue`：当前元素的值。
  - `index`（可选）：当前元素的索引。
  - `array`（可选）：调用 `flatMap` 的数组本身。  
  该函数应返回一个数组（或任何值，如果是非数组则直接放入结果）。
- `thisArg`（可选）— 执行 `callback` 时，用作 `this` 的值。

**返回值**  
`Array` — 新数组，先映射后扁平化深度1。

**原理**  
遍历数组，对每个元素调用回调，将返回值（应为数组）的元素添加到结果数组。

**手写实现**
```javascript
Array.prototype.myFlatMap = function(callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      const mapped = callback.call(thisArg, this[i], i, this);
      if (Array.isArray(mapped)) {
        for (let val of mapped) result.push(val);
      } else {
        result.push(mapped);
      }
    }
  }
  return result;
};
```

**注意事项**  
- **能否使用 `break` / `continue`**：❌ 不能。`flatMap` 总是遍历所有元素，无法提前终止。

**举例学习**
```javascript
let arr = [1, 2, 3];
let result = arr.flatMap(x => [x, x * 2]);
console.log(result); // [1, 2, 2, 4, 3, 6]
```

---

## 11. keys() – 索引迭代器

**定义和用法**  
`keys()` 方法返回一个包含数组索引的迭代器对象。

**语法规则**
```javascript
arr.keys()
```

**参数**  
无

**返回值**  
`Array Iterator` — 迭代器对象，包含每个索引值。

**原理**  
生成一个迭代器，每次 `next()` 返回下一个索引，直到结束。

**手写实现**
```javascript
Array.prototype.myKeys = function() {
  let index = 0;
  const self = this;
  return {
    next() {
      if (index < self.length) {
        return { value: index++, done: false };
      } else {
        return { done: true };
      }
    },
    [Symbol.iterator]() { return this; }
  };
};
```

**注意事项**  
- 原数组不变。
- 迭代器会包含稀疏数组的空位索引（因为索引本身存在）。
- **能否使用 `break` / `continue`**：迭代器本身不直接支持，但可以在 `for...of` 循环中使用 `break` 或 `continue` 来控制迭代过程。

**break 和 continue 示例**
```javascript
let arr = ['a', 'b', 'c', 'd'];
// break 示例
for (let key of arr.keys()) {
  if (key === 2) break;
  console.log(key); // 0, 1
}
// continue 示例
for (let key of arr.keys()) {
  if (key === 1) continue;
  console.log(key); // 0, 2, 3
}
```

---

## 12. values() – 值迭代器

**定义和用法**  
`values()` 方法返回一个包含数组值的迭代器对象。

**语法规则**
```javascript
arr.values()
```

**参数**  
无

**返回值**  
`Array Iterator` — 迭代器对象，包含每个元素的值。

**原理**  
遍历数组，依次返回每个元素的值（稀疏数组的空位返回 `undefined`）。

**手写实现**
```javascript
Array.prototype.myValues = function() {
  let index = 0;
  const self = this;
  return {
    next() {
      if (index < self.length) {
        const value = index in self ? self[index] : undefined;
        return { value, done: false, index: index++ };
      } else {
        return { done: true };
      }
    },
    [Symbol.iterator]() { return this; }
  };
};
```

**注意事项**  
- 原数组不变。
- 稀疏数组的空位会返回 `undefined`（但索引本身存在）。
- **能否使用 `break` / `continue`**：与 `keys` 类似，可以在 `for...of` 循环中使用 `break`/`continue`。

**break 和 continue 示例**
```javascript
let arr = ['a', 'b', 'c', 'd'];
// break 示例
for (let val of arr.values()) {
  if (val === 'c') break;
  console.log(val); // 'a', 'b'
}
// continue 示例
for (let val of arr.values()) {
  if (val === 'b') continue;
  console.log(val); // 'a', 'c', 'd'
}
```

---

## 13. entries() – 键值对迭代器

**定义和用法**  
`entries()` 方法返回一个包含 `[index, value]` 对的迭代器对象。

**语法规则**
```javascript
arr.entries()
```

**参数**  
无

**返回值**  
`Array Iterator` — 迭代器对象，每个元素是 `[index, value]` 数组。

**原理**  
同时提供索引和值，内部结合索引和值迭代。

**手写实现**
```javascript
Array.prototype.myEntries = function() {
  let index = 0;
  const self = this;
  return {
    next() {
      if (index < self.length) {
        const value = index in self ? self[index] : undefined;
        return { value: [index, value], done: false, index: index++ };
      } else {
        return { done: true };
      }
    },
    [Symbol.iterator]() { return this; }
  };
};
```

**注意事项**  
- **能否使用 `break` / `continue`**：与 `keys`、`values` 相同，可以在 `for...of` 循环中使用 `break`/`continue`。

**break 和 continue 示例**
```javascript
let arr = ['a', 'b', 'c', 'd'];
// break 示例
for (let [i, v] of arr.entries()) {
  if (i === 2) break;
  console.log(i, v); // 0 'a', 1 'b'
}
// continue 示例
for (let [i, v] of arr.entries()) {
  if (v === 'b') continue;
  console.log(i, v); // 0 'a', 2 'c', 3 'd'
}
```

---

## 14. 方法对比总结

| 方法          | 返回值                       | 是否返回新数组 | 是否修改原数组 | 遍历空位 | 可终止 | 回调参数                |
| ------------- | ---------------------------- | -------------- | -------------- | -------- | ------ | ----------------------- |
| `forEach`     | `undefined`                  | ❌              | ❌（但可手动）  | 跳过     | ❌      | (value, index, array)   |
| `map`         | 新数组                       | ✅              | ❌              | 保留空位 | ❌      | (value, index, array)   |
| `filter`      | 新数组                       | ✅              | ❌              | 跳过     | ❌      | (value, index, array)   |
| `reduce`      | 累积值                       | ❌              | ❌              | 跳过     | ❌      | (acc, cur, index, array)|
| `reduceRight` | 累积值                       | ❌              | ❌              | 跳过     | ❌      | (acc, cur, index, array)|
| `some`        | 布尔值                       | ❌              | ❌              | 跳过     | ✅（遇 true）| (value, index, array)   |
| `every`       | 布尔值                       | ❌              | ❌              | 跳过     | ✅（遇 false）| (value, index, array)   |
| `find`        | 元素或 `undefined`           | ❌              | ❌              | 跳过     | ✅（遇 true）| (value, index, array)   |
| `findIndex`   | 索引或 -1                    | ❌              | ❌              | 跳过     | ✅（遇 true）| (value, index, array)   |
| `flatMap`     | 新数组                       | ✅              | ❌              | 跳过     | ❌      | (value, index, array)   |
| `keys`        | 迭代器                       | ❌              | ❌              | 包含索引 | ❌      | 无回调                  |
| `values`      | 迭代器                       | ❌              | ❌              | 返回空位 | ❌      | 无回调                  |
| `entries`     | 迭代器                       | ❌              | ❌              | 包含空位 | ❌      | 无回调                  |

**关于“修改原数组”的说明**

- **`forEach`、`map`、`filter` 等遍历方法本身不修改原数组**，但回调函数中可以通过 `array[index] = newValue` 直接修改原数组，或修改数组元素的属性（如果元素是对象）。因此实际是否修改取决于回调的实现。
- **建议**：在 `map` 和 `filter` 中尽量避免修改原数组，保持纯函数风格；`forEach` 常用于有副作用的操作。
- **`reduce` 和 `reduceRight`** 通常不用于修改原数组，而是返回累积值。

---

## 15. 常见区别详解

### 15.1 forEach 与 map 的区别

| 特性         | `forEach`                          | `map`                              |
| ------------ | ---------------------------------- | ---------------------------------- |
| 返回值       | `undefined`                        | 新数组                             |
| 是否可链式调用 | 否（因为返回 undefined）           | 是（返回数组后可继续调用其他数组方法） |
| 主要用途     | 执行副作用（如打印、修改外部变量） | 转换数据，生成新数组               |
| 是否修改原数组 | 不会自动修改，但可手动修改         | 不会修改原数组                     |
| 性能         | 几乎相同                           | 几乎相同                           |

**示例**：
```javascript
let arr = [1, 2, 3];
// forEach 用于副作用
arr.forEach(x => console.log(x));
// map 用于转换
let doubled = arr.map(x => x * 2);
```

### 15.2 map 与 some 的区别

| 特性         | `map`                              | `some`                             |
| ------------ | ---------------------------------- | ---------------------------------- |
| 返回值       | 新数组（长度与原数组相同）         | 布尔值                             |
| 主要用途     | 转换每个元素                       | 判断是否存在满足条件的元素         |
| 回调返回值   | 任意值（作为新数组的元素）         | 布尔值（决定是否停止遍历）         |
| 短路行为     | 无（总是遍历全部元素）             | 有（一旦返回 `true` 就停止）       |

**示例**：
```javascript
let arr = [1, 2, 3];
let allDoubled = arr.map(x => x * 2);   // [2,4,6]
let hasEven = arr.some(x => x % 2 === 0); // true
```

### 15.3 some 与 every 的区别

| 特性         | `some`                             | `every`                            |
| ------------ | ---------------------------------- | ---------------------------------- |
| 返回条件     | 至少一个元素满足条件               | 所有元素都满足条件                 |
| 空数组返回值 | `false`                            | `true`                             |
| 短路行为     | 遇到第一个满足条件的元素停止       | 遇到第一个不满足条件的元素停止     |
| 典型使用     | 检查数组中是否有符合条件的项       | 检查数组中是否全部符合条件         |

**示例**：
```javascript
let arr = [2, 4, 6];
console.log(arr.some(x => x > 5));  // true（6 > 5）
console.log(arr.every(x => x > 5)); // false（2 和 4 不大于 5）
```

---

### 15.4 如何选择合适的方法？

- **需要遍历且无返回值**：`forEach`
- **需要转换每个元素为新数组**：`map`
- **需要筛选元素**：`filter`
- **需要将数组归约为一个值**：`reduce` / `reduceRight`
- **需要判断是否存在**：`some`
- **需要判断是否全部满足**：`every`
- **需要查找第一个元素**：`find`
- **需要查找第一个索引**：`findIndex`
- **需要映射并扁平化**：`flatMap`
- **需要获取迭代器**：`keys` / `values` / `entries`

掌握这些遍历方法的差异，能够编写更清晰、高效的代码。
