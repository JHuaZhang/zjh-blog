---
group:
  title: 【03】js数组及数组方法
  order: 3
order: 7
title: 数组转字符串方法
nav:
  title: JavaScript
  order: 2
---

JavaScript 数组提供了多种方法将其转换为字符串，以便于输出、存储或传输。常用的方法有 `toString()`、`toLocaleString()` 和 `join()`。它们各自有不同的行为特征和适用场景。本文将详细介绍这三种方法，并通过示例说明它们的使用及区别。

---

## 1. toString() – 转换为逗号分隔的字符串

**定义和用法**  
`toString()` 方法将数组的每个元素转换为字符串（如果是对象则调用其 `toString()`），然后用逗号 `,` 连接成一个字符串。当数组用于字符串环境时（如拼接操作），JavaScript 会自动调用该方法。

**语法规则**

```javascript
arr.toString();
```

**参数**  
无

**返回值**  
`string` — 由数组元素转换成的字符串，元素之间用逗号分隔。

**原理**

- 遍历数组元素。
- 对每个元素调用其 `toString()` 方法（基本类型转为对应字符串，对象默认返回 `"[object Object]"`）。
- 将所有结果用逗号 `,` 连接。

**注意事项**

- 不会修改原数组。
- 如果数组元素是 `null` 或 `undefined`，它们会被转换为空字符串。
- 多维数组会被递归展开为一维字符串，元素之间仍用逗号分隔。
- 如果数组包含对象，对象会转为 `"[object Object]"`，通常不是预期结果。

**举例学习**

### 1.1 基本用法

```javascript
const a = [1, 2, 3, 4, 5];
const s = a.toString();
console.log(s); // "1,2,3,4,5"
console.log(typeof s); // "string"
```

### 1.2 自动调用（字符串拼接）

```javascript
const a = [1, 2, 3];
const b = [4, 5, 6];
const s = a + b; // 自动调用 toString()
console.log(s); // "1,2,34,5,6"
console.log(typeof s); // "string"
```

注意：`a + b` 实际上先分别调用 `a.toString()` 得到 `"1,2,3"`，`b.toString()` 得到 `"4,5,6"`，然后拼接成 `"1,2,34,5,6"`。

### 1.3 多维数组

```javascript
const arr = [
  [1, [2, 3], [4, 5]],
  [6, [7, [8, 9], 0]],
];
console.log(arr.toString()); // "1,2,3,4,5,6,7,8,9,0"
```

多维数组会被完全扁平化，所有元素以逗号连接。

### 1.4 包含对象

```javascript
const arr = [1, 2, { name: 'zhangsan' }];
console.log(arr.toString()); // "1,2,[object Object]"
```

对象转换为 `"[object Object]"`，通常不满足需求。

### 1.5 `null` 和 `undefined` 的处理

```javascript
const arr = [1, null, undefined, 2];
console.log(arr.toString()); // "1,,,2"
```

`null` 和 `undefined` 转为空字符串。

**适用场景**

- 快速将一维数组转为逗号分隔字符串。
- 用于调试或简单的数据展示。
- 不适用于包含对象或需要自定义分隔符的场景。

---

## 2. toLocaleString() – 本地化转换

**定义和用法**  
`toLocaleString()` 方法将数组的每个元素使用其自身的 `toLocaleString()` 方法转换为本地化字符串，然后用**地区特定的分隔符**（通常也是逗号）连接成一个字符串。对于数字和日期等类型，会产生与地区相关的格式（如千位分隔符、日期格式）。

**语法规则**

```javascript
arr.toLocaleString([locales[, options]])
```

**参数**

- `locales`（可选）— 语言标签字符串或数组，如 `'zh-CN'`、`'en-US'`。
- `options`（可选）— 配置对象，用于数字或日期格式化。

**返回值**  
`string` — 本地化后的字符串。

**原理**

- 遍历数组元素。
- 对每个元素调用其 `toLocaleString(locales, options)` 方法（基本类型会有对应的包装对象方法）。
- 使用当前环境的分隔符（通常是逗号）连接结果。

**注意事项**

- 不会修改原数组。
- 对于数字，`toLocaleString()` 可能会添加千位分隔符。
- 对于日期，会返回本地化的日期时间字符串。
- 对象默认调用 `Object.prototype.toLocaleString()`，通常返回 `"[object Object]"`，除非对象自定义了该方法。
- 性能比 `toString()` 稍低，因为涉及本地化处理。

**举例学习**

### 2.1 基本类型（数字、日期）

```javascript
const arr = [123456.789, new Date(2025, 3, 10, 14, 30, 0)];
console.log(arr.toString()); // "123456.789,Tue Apr 10 2025 14:30:00 GMT+0800 (中国标准时间)"
console.log(arr.toLocaleString()); // 取决于本地环境，如 "123,456.789,2025/4/10 14:30:00"（中国）
```

### 2.2 指定语言环境

```javascript
const num = 123456.789;
const arr = [num];
console.log(arr.toLocaleString('en-US')); // "123,456.789"
console.log(arr.toLocaleString('de-DE')); // "123.456,789"
console.log(arr.toLocaleString('zh-CN')); // "123,456.789"
```

### 2.3 数字与日期混合

```javascript
const arr = [12345, new Date()];
console.log(arr.toLocaleString('en-GB'));
// 可能输出: "12,345,10/04/2025, 14:30:00"
```

### 2.4 对象

```javascript
const arr = [{ name: 'Alice' }];
console.log(arr.toLocaleString()); // "[object Object]"
```

**区别与 `toString()`**

- `toLocaleString()` 对数字和日期会进行本地化格式化，而 `toString()` 只是简单转为字符串。
- `toLocaleString()` 可以指定语言环境参数，`toString()` 不能。
- 对于普通对象，两者都返回 `"[object Object]"`。

**适用场景**

- 需要向用户展示数字、日期等具有本地化格式的数组。
- 国际化的 Web 应用。

---

## 3. join() – 自定义分隔符连接

**定义和用法**  
`join()` 方法将数组的所有元素连接成一个字符串，并可以**指定分隔符**。如果不提供分隔符，默认使用逗号 `,`，与 `toString()` 效果相同。分隔符可以是任意字符串。

**语法规则**

```javascript
arr.join([separator]);
```

**参数**  
`separator`（可选）— 用于分隔元素的字符串。如果省略，默认为逗号 `,`。如果 `separator` 为空字符串 `''`，则元素之间没有分隔符直接相连。

**返回值**  
`string` — 连接后的字符串。

**原理**

- 遍历数组元素，将每个元素转换为字符串（`null` 和 `undefined` 转为空字符串）。
- 在元素之间插入 `separator`。
- 返回拼接结果。

**注意事项**

- 不会修改原数组。
- 如果数组长度为 0，返回空字符串。
- 如果只有一个元素，返回该元素的字符串表示（不添加分隔符）。
- 对于稀疏数组，空位会转换为空字符串，不会抛出错误。

**举例学习**

### 3.1 默认分隔符（逗号）

```javascript
const a = [1, 2, 3, 4, 5];
console.log(a.join()); // "1,2,3,4,5"
console.log(a.join(',')); // "1,2,3,4,5"（显式逗号）
```

### 3.2 自定义分隔符

```javascript
console.log(a.join('==')); // "1==2==3==4==5"
console.log(a.join(' - ')); // "1 - 2 - 3 - 4 - 5"
console.log(a.join('')); // "12345"（无分隔符）
```

### 3.3 处理 `null` 和 `undefined`

```javascript
const arr = [1, null, undefined, 2];
console.log(arr.join('-')); // "1---2"
```

### 3.4 多维数组

```javascript
const multi = [
  [1, 2],
  [3, 4],
];
console.log(multi.join('-')); // "1,2-3,4"
```

注意：`join()` 只处理一层，内部数组会被 `toString()` 转换为字符串（如 `[1,2]` 变为 `"1,2"`），然后再拼接。

### 3.5 空数组

```javascript
console.log([].join('-')); // ""
```

**适用场景**

- 需要自定义分隔符（如 `&`、`|`、换行符等）时。
- 构建查询字符串、CSV 行、日志等。
- 需要无分隔符直接拼接时（`join('')`）。

---

## 4. 三种方法对比总结

| 方法               | 是否支持自定义分隔符 | 是否本地化数字/日期 | 对 `null`/`undefined` 处理 | 多维数组行为                 | 典型用途                    |
| ------------------ | -------------------- | ------------------- | -------------------------- | ---------------------------- | --------------------------- |
| `toString()`       | ❌（固定逗号）       | ❌                  | 转为空字符串               | 递归扁平化，逗号连接         | 简单输出，调试              |
| `toLocaleString()` | ❌（本地分隔符）     | ✅                  | 转为空字符串               | 递归扁平化，本地化连接       | 国际化显示，格式化数字/日期 |
| `join()`           | ✅（任意字符串）     | ❌                  | 转为空字符串               | 仅处理第一层，子数组转字符串 | 自定义格式，CSV、URL 参数等 |

**注意**：`toLocaleString()` 和 `toString()` 都会递归处理多维数组，而 `join()` 只处理第一层，子数组会先被转换为字符串（通过 `toString()`）。

---

## 5. 综合示例

```javascript
const arr = [1, 'hello', true, null, undefined, [2, 3], { name: 'Tom' }];

console.log('toString():', arr.toString());
// 输出: "1,hello,true,,,2,3,[object Object]"

console.log('toLocaleString():', arr.toLocaleString());
// 输出: "1,hello,true,,,2,3,[object Object]"（数字无本地化效果，因为整数较小）

const numArr = [1234567.89, new Date()];
console.log('toLocaleString with zh-CN:', numArr.toLocaleString('zh-CN'));
// 输出: "1,234,567.89,2025/4/10 14:30:00"

console.log('join with "|":', arr.join('|'));
// 输出: "1|hello|true|||2,3|[object Object]"
```

---

## 6. 性能与建议

- **性能**：`join()` 通常比 `toString()` 稍快，因为 `toString()` 内部实际上调用了 `join(',')`，但微乎其微。`toLocaleString()` 最慢，因为涉及本地化计算。
- **建议**：
  - 默认使用 `join()`，因为它最灵活且性能好。
  - 如果需要默认逗号分隔且无需自定义，用 `toString()` 更简洁。
  - 需要本地化数字/日期格式时，使用 `toLocaleString()`。

---

通过掌握这三种方法，可以根据实际需求灵活地将数组转换为字符串。
