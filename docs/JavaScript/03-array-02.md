---
group:
  title: 【03】js数组及数组方法
  order: 3
order: 2
title: 会改变原数组的方法
nav:
  title: JavaScript
  order: 2
---

这些方法会直接修改调用它们的原数组。

## 1. push() – 末尾添加，返回新长度

**定义和用法**  
`push()` 方法将一个或多个元素添加到数组的末尾，并返回数组的新长度。

**语法规则**

```javascript
arr.push(element1, ..., elementN)
```

**参数**  
`element1, ..., elementN` — 必需。要添加到数组末尾的元素。

**返回值**  
`number` — 数组添加元素后的新长度。

**原理**  
`push` 方法在数组内部维护 `length` 属性，每次添加元素时，将元素放在 `length` 索引处，然后 `length` 自增。如果传入多个参数，则依次添加。

**手写实现**

```javascript
Array.prototype.myPush = function (...items) {
  for (let i = 0; i < items.length; i++) {
    this[this.length] = items[i];
  }
  return this.length;
};
```

**注意事项**

- `push` 会修改原数组，并返回新长度，而不是新数组。
- 可以一次添加多个元素。
- 如果数组长度为 `2^53 - 1` 时再添加会报错，但实际场景不会遇到。

**举例学习**

```javascript
let arr = [1, 2, 3];
console.log(arr.push(4)); // 4
console.log(arr); // [1, 2, 3, 4]
console.log(arr.push(5, 6)); // 6
console.log(arr); // [1, 2, 3, 4, 5, 6]
```

**面试题：合并两个数组**

```javascript
let arr1 = [1, 2];
let arr2 = [3, 4];
Array.prototype.push.apply(arr1, arr2);
console.log(arr1); // [1, 2, 3, 4]
```

---

## 2. pop() – 末尾删除，返回被删元素

**定义和用法**  
`pop()` 方法删除数组的最后一个元素，并返回该元素。数组为空时返回 `undefined`。

**语法规则**

```javascript
arr.pop();
```

**参数**  
无

**返回值**  
`any` — 被删除的元素；数组为空则返回 `undefined`。

**原理**  
记录当前 `length`，取出索引 `length-1` 处的元素，然后删除该属性，将 `length` 减1，返回取出的元素。

**手写实现**

```javascript
Array.prototype.myPop = function () {
  if (this.length === 0) return undefined;
  const last = this[this.length - 1];
  delete this[this.length - 1];
  this.length--;
  return last;
};
```

**注意事项**

- 原数组的 `length` 会减1。
- 空数组调用 `pop` 返回 `undefined` 且不报错。

**举例学习**

```javascript
let arr = [1, 2, 3, 4];
let last = arr.pop();
console.log(last); // 4
console.log(arr); // [1, 2, 3]
```

---

## 3. shift() – 开头删除，返回被删元素

**定义和用法**  
`shift()` 方法删除数组的第一个元素，并返回该元素。所有后续元素索引减1。

**语法规则**

```javascript
arr.shift();
```

**参数**  
无

**返回值**  
`any` — 被删除的元素；数组为空则返回 `undefined`。

**原理**  
取出索引0的元素，然后循环将后续元素依次前移一位，最后删除最后一个属性，`length` 减1。

**手写实现**

```javascript
Array.prototype.myShift = function () {
  if (this.length === 0) return undefined;
  const first = this[0];
  for (let i = 0; i < this.length - 1; i++) {
    this[i] = this[i + 1];
  }
  delete this[this.length - 1];
  this.length--;
  return first;
};
```

**注意事项**

- 操作成本高（O(n)），频繁使用可能影响性能，大数据量下建议用队列替代。
- 空数组返回 `undefined`。

**举例学习**

```javascript
let arr = [1, 2, 3];
let first = arr.shift();
console.log(first); // 1
console.log(arr); // [2, 3]
```

---

## 4. unshift() – 开头添加，返回新长度

**定义和用法**  
`unshift()` 方法将一个或多个元素添加到数组的开头，并返回新长度。所有现有元素索引增加。

**语法规则**

```javascript
arr.unshift(element1, ..., elementN)
```

**参数**  
`element1, ..., elementN` — 必需。要添加到开头的元素。

**返回值**  
`number` — 数组的新长度。

**原理**  
先将原数组元素向后移动（为新元素腾出空间），然后将新元素依次放入开头位置，最后更新 `length`。

**手写实现**

```javascript
Array.prototype.myUnshift = function (...items) {
  const len = items.length;
  for (let i = this.length - 1; i >= 0; i--) {
    this[i + len] = this[i];
  }
  for (let i = 0; i < len; i++) {
    this[i] = items[i];
  }
  return this.length;
};
```

**注意事项**

- 时间复杂度 O(n)，频繁使用影响性能。
- 可以一次添加多个元素。

**举例学习**

```javascript
let arr = [3, 4];
console.log(arr.unshift(1, 2)); // 4
console.log(arr); // [1, 2, 3, 4]
```

---

## 5. reverse() – 反转数组

**定义和用法**  
`reverse()` 方法反转数组中元素的顺序，并返回原数组的引用。

**语法规则**

```javascript
arr.reverse();
```

**参数**  
无

**返回值**  
`Array` — 反转后的原数组。

**原理**  
对称交换首尾元素，直到中间位置。

**手写实现**

```javascript
Array.prototype.myReverse = function () {
  const len = this.length;
  for (let i = 0; i < Math.floor(len / 2); i++) {
    const temp = this[i];
    this[i] = this[len - 1 - i];
    this[len - 1 - i] = temp;
  }
  return this;
};
```

**注意事项**

- 会直接修改原数组。
- 对于稀疏数组，空槽会被保留并随着交换移动。

**举例学习**

```javascript
let arr = [1, 2, 3, 4];
let reversed = arr.reverse();
console.log(reversed); // [4, 3, 2, 1]
console.log(arr); // [4, 3, 2, 1]（同一个对象）
```

---

## 6. sort() – 排序

**定义和用法**  
`sort()` 方法对数组元素进行排序（默认按字符串 UTF-16 升序），并返回原数组。可传入比较函数自定义规则。

**语法规则**

```javascript
arr.sort([compareFunction]);
```

**参数**  
`compareFunction`（可选）— 比较函数，接收 `(a, b)`，返回负数表示 a<b，正数表示 a>b，0 表示相等。

**返回值**  
`Array` — 排序后的原数组。

**原理**  
不同引擎实现不同（V8 使用 TimSort 等），但整体上基于比较函数对元素进行重排。比较函数决定了元素顺序。

**手写实现**（简单冒泡排序，仅用于理解）

```javascript
Array.prototype.mySort = function (compareFn) {
  const fn = compareFn || ((a, b) => (String(a) > String(b) ? 1 : -1));
  const len = this.length;
  for (let i = 0; i < len - 1; i++) {
    for (let j = 0; j < len - 1 - i; j++) {
      if (fn(this[j], this[j + 1]) > 0) {
        [this[j], this[j + 1]] = [this[j + 1], this[j]];
      }
    }
  }
  return this;
};
```

**注意事项**

- 默认排序会将元素转为字符串比较，所以 `[1, 30, 4]` 排序成 `[1, 30, 4]` 而不是 `[1, 4, 30]`。
- 比较函数必须稳定（ES2019 后要求稳定排序）。
- `undefined` 元素会被排到末尾。

**举例学习**

```javascript
let arr = [1, 30, 4, 21];
arr.sort();
console.log(arr); // [1, 21, 30, 4]（字符串排序）

arr.sort((a, b) => a - b);
console.log(arr); // [1, 4, 21, 30]
```

**面试题：随机排序**

```javascript
let arr = [1, 2, 3, 4];
arr.sort(() => Math.random() - 0.5);
console.log(arr); // 随机顺序（不保证均匀分布）
```

---

## 7. splice() – 添加/删除/替换元素

**定义和用法**  
`splice()` 方法通过删除、替换或添加元素来修改数组，并返回被删除的元素数组。

**语法规则**

```javascript
arr.splice(start[, deleteCount[, item1[, item2[, ...]]]])
```

**参数**

- `start` — 必需。修改的起始索引。负数表示从末尾倒数。
- `deleteCount`（可选）— 要删除的元素个数。为0或省略则不删除。
- `item1, item2, ...`（可选）— 要插入的新元素。

**返回值**  
`Array` — 包含被删除元素的数组，无删除则为空数组。

**原理**

1. 根据 `start` 和 `deleteCount` 确定要删除的元素区间。
2. 将删除的元素收集到结果数组。
3. 根据插入元素个数与删除元素个数的差异，移动原数组元素腾出或填补空间。
4. 将新元素插入指定位置。
5. 更新 `length`。

**手写实现**（简化版）

```javascript
Array.prototype.mySplice = function (start, deleteCount, ...items) {
  start = start < 0 ? this.length + start : start;
  if (start < 0) start = 0;
  if (start > this.length) start = this.length;
  if (deleteCount === undefined) deleteCount = this.length - start;
  deleteCount = Math.min(deleteCount, this.length - start);

  const removed = this.slice(start, start + deleteCount);
  const rightPart = this.slice(start + deleteCount);
  const newLen = start + items.length + rightPart.length;
  this.length = newLen;

  for (let i = 0; i < items.length; i++) {
    this[start + i] = items[i];
  }
  for (let i = 0; i < rightPart.length; i++) {
    this[start + items.length + i] = rightPart[i];
  }
  return removed;
};
```

**注意事项**

- 如果 `deleteCount` 省略，会删除从 `start` 到末尾的所有元素。
- `start` 可以超出数组长度（此时在末尾添加元素）。
- 负的 `start` 从末尾计算。

**举例学习**

```javascript
let arr = [1, 2, 3, 4, 5];
// 删除2个元素（从索引2开始）
let removed = arr.splice(2, 2);
console.log(removed); // [3, 4]
console.log(arr); // [1, 2, 5]

// 替换：删除2个并插入'a','b'
arr = [1, 2, 3, 4];
removed = arr.splice(1, 2, 'a', 'b');
console.log(removed); // [2, 3]
console.log(arr); // [1, 'a', 'b', 4]

// 插入（deleteCount=0）
arr = [1, 2, 4];
arr.splice(2, 0, 3);
console.log(arr); // [1, 2, 3, 4]
```

**面试题：清空数组**

```javascript
let arr = [1, 2, 3];
arr.splice(0, arr.length);
console.log(arr); // []
```

---

## 8. fill() – 填充

**定义和用法**  
`fill()` 方法用固定值填充数组中从起始索引到终止索引（不包括）的所有元素，并返回原数组。

**语法规则**

```javascript
arr.fill(value[, start[, end]])
```

**参数**

- `value` — 必需。填充的值。
- `start`（可选）— 起始索引（默认0）。
- `end`（可选）— 终止索引（不包括，默认 `length`）。

**返回值**  
`Array` — 修改后的原数组。

**原理**  
遍历从 `start` 到 `end-1` 的索引，将每个位置赋值为 `value`。负索引会被转换为 `length + 负值`。

**手写实现**

```javascript
Array.prototype.myFill = function (value, start = 0, end = this.length) {
  if (start < 0) start = this.length + start;
  if (end < 0) end = this.length + end;
  start = Math.max(start, 0);
  end = Math.min(end, this.length);
  for (let i = start; i < end; i++) {
    this[i] = value;
  }
  return this;
};
```

**注意事项**

- 会修改原数组。
- 如果 `start` 或 `end` 为负数，从末尾计数。
- 如果 `start >= end`，则不填充任何元素。

**举例学习**

```javascript
let arr = [1, 2, 3, 4];
arr.fill(0);
console.log(arr); // [0, 0, 0, 0]

arr = [1, 2, 3, 4];
arr.fill(0, 1, 3);
console.log(arr); // [1, 0, 0, 4]
```

---

## 9. copyWithin() – 内部复制

**定义和用法**  
`copyWithin()` 方法浅复制数组的一部分到同一数组的另一个位置，并返回原数组。长度不变。

**语法规则**

```javascript
arr.copyWithin(target[, start[, end]])
```

**参数**

- `target` — 必需。复制到的目标索引（会被覆盖）。
- `start`（可选）— 复制源的起始索引（默认0）。
- `end`（可选）— 复制源的结束索引（不包括，默认 `length`）。

**返回值**  
`Array` — 修改后的原数组。

**原理**  
根据 `start` 和 `end` 截取一段元素（浅拷贝），然后从 `target` 位置开始粘贴，如果重叠则根据方向处理避免覆盖未复制的元素。

**手写实现**（简单实现，未处理方向优化）

```javascript
Array.prototype.myCopyWithin = function (target, start = 0, end = this.length) {
  if (target < 0) target = this.length + target;
  if (start < 0) start = this.length + start;
  if (end < 0) end = this.length + end;
  target = Math.max(target, 0);
  start = Math.max(start, 0);
  end = Math.min(end, this.length);

  const length = end - start;
  const temp = [];
  for (let i = 0; i < length; i++) {
    temp[i] = this[start + i];
  }
  for (let i = 0; i < length; i++) {
    if (target + i < this.length) {
      this[target + i] = temp[i];
    }
  }
  return this;
};
```

**注意事项**

- 会修改原数组。
- 如果 `target` 与复制区域重叠，引擎会正确处理（本手写实现用临时数组解决了重叠问题）。
- 负索引处理同 `fill`。

**举例学习**

```javascript
let arr = [1, 2, 3, 4, 5];
arr.copyWithin(0, 3, 5);
console.log(arr); // [4, 5, 3, 4, 5]

arr = [1, 2, 3, 4, 5];
arr.copyWithin(2, 0, 2);
console.log(arr); // [1, 2, 1, 2, 5]
```
