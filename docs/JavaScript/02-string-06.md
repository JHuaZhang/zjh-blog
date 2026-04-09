---
group:
  title: 【02】js字符串及字符串方法
  order: 2
order: 6
title: 字符串切割方法
nav:
  title: JavaScript
  order: 2
---

在 JavaScript 中，字符串的切割（分割）是常见操作，通常用于将字符串拆分为子字符串数组或提取部分内容。以下是常用的字符串切割方法，包括 `split()`、`substring()`、`slice()`、`substr()`（已弃用）、`match()`、`replace()` 及正则表达式相关技巧。

---

### 1. `split()`

**语法规则**：`str.split(separator, limit)`

**参数介绍**：

- `separator` — 必需。指定分隔符，可以是字符串或正则表达式。如果省略，返回包含整个字符串的数组；如果为空字符串 `''`，则每个字符（按 UTF-16 码元）拆分为数组元素。
- `limit` — 可选。限制返回数组的最大长度，超出部分会被忽略。

**返回值**：返回一个数组，包含分割后的子字符串。

**举例使用**：

```javascript
const str = 'apple,banana,orange';

// 使用逗号分割
const fruits = str.split(',');
console.log(fruits); // ['apple', 'banana', 'orange']

// 限制返回长度
const fruitsLimit = str.split(',', 2);
console.log(fruitsLimit); // ['apple', 'banana']

// 使用空字符串分割（按字符）
const chars = str.split('');
console.log(chars); // ['a','p','p','l','e',',','b','a','n','a','n','a',',','o','r','a','n','g','e']

// 使用正则表达式分割
const regexSplit = str.split(/[,]/);
console.log(regexSplit); // ['apple', 'banana', 'orange']

// 处理复杂分隔符
const str2 = 'apple,banana;orange|grape';
const multiSplit = str2.split(/[,;|]/);
console.log(multiSplit); // ['apple', 'banana', 'orange', 'grape']
```

**代码解释**：

- `split()` 根据 `separator` 将字符串切分，返回子串数组。
- `separator` 可以是正则，匹配多种分隔符。
- `limit` 参数可以控制数组长度，常用于只取前几项。

**注意事项**：

- 当 `separator` 为空字符串时，`split('')` 会将每个 UTF-16 码元作为单独元素，无法正确处理 Unicode 辅助平面字符（如表情符号），建议使用 `Array.from(str)` 或 `[...str]` 代替。
- 如果 `separator` 是正则且包含捕获组，捕获组的内容也会包含在结果数组中。

---

### 2. `substring()`

**语法规则**：`str.substring(startIndex, endIndex)`

**参数介绍**：

- `startIndex` — 必需。起始索引（包含）。
- `endIndex` — 可选。结束索引（不包含）。如果省略，提取到字符串末尾。

**返回值**：返回提取的新字符串。

**举例使用**：

```javascript
const str = 'Hello, World!';

// 提取从索引 7 到结尾
const world = str.substring(7);
console.log(world); // 'World!'

// 提取从索引 0 到 5
const hello = str.substring(0, 5);
console.log(hello); // 'Hello'

// 自动交换参数（start > end）
const reversed = str.substring(5, 0);
console.log(reversed); // 'Hello'
```

**代码解释**：

- `substring()` 返回指定索引区间的子串。
- 如果 `startIndex` 大于 `endIndex`，方法会自动交换两者。
- 任何小于 0 的参数被视为 0，大于字符串长度的参数视为字符串长度。

**注意事项**：

- 不支持负数索引。
- 与 `slice()` 类似，但处理负参数和参数交换的方式不同。

---

### 3. `slice()`

**语法规则**：`str.slice(startIndex, endIndex)`

**参数介绍**：

- `startIndex` — 必需。起始索引（包含）。支持负数（从末尾倒数）。
- `endIndex` — 可选。结束索引（不包含）。支持负数。如果省略，提取到字符串末尾。

**返回值**：返回提取的新字符串。

**举例使用**：

```javascript
const str = 'Hello, World!';

// 提取从索引 7 到结尾
const world = str.slice(7);
console.log(world); // 'World!'

// 提取从索引 0 到 5
const hello = str.slice(0, 5);
console.log(hello); // 'Hello'

// 使用负数索引
const lastChar = str.slice(-1);
console.log(lastChar); // '!'

const lastFive = str.slice(-6);
console.log(lastFive); // 'World!'
```

**代码解释**：

- `slice()` 与 `substring()` 类似，但支持负数索引（-1 表示最后一个字符）。
- 如果 `startIndex` 大于 `endIndex`，不会交换参数，而是返回空字符串。
- 负数索引会被加上字符串长度转换为正数。

**注意事项**：

- 推荐使用 `slice()` 代替 `substring()` 和已弃用的 `substr()`，因为它更灵活且行为一致。

---

### 4. `substr()`（已弃用）

**语法规则**：`str.substr(startIndex, length)`

**参数介绍**：

- `startIndex` — 必需。起始索引。支持负数（从末尾倒数）。
- `length` — 可选。要提取的字符数。如果省略，提取到字符串末尾。

**返回值**：返回提取的新字符串。

**举例使用**：

```javascript
const str = 'Hello, World!';

// 从索引 7 开始提取 5 个字符
const world = str.substr(7, 5);
console.log(world); // 'World'

// 使用负数索引
const lastFive = str.substr(-6);
console.log(lastFive); // 'World!'
```

**代码解释**：

- `substr()` 提取从 `startIndex` 开始的 `length` 个字符。
- 负数 `startIndex` 表示从末尾倒数。

**注意事项**：

- **该方法已弃用**，不推荐在新项目中使用。请使用 `slice()` 或 `substring()` 代替。

---

### 5. `match()`

**语法规则**：`str.match(regexp)`

**参数介绍**：

- `regexp` — 必需。正则表达式对象。如果传入非正则，会隐式转换为正则。

**返回值**：

- 如果正则带有 `g` 标志，返回所有匹配子串组成的数组。
- 如果没有 `g` 标志，返回第一个匹配及捕获组的数组，或 `null`。

**举例使用**：

```javascript
const str = 'The quick brown fox jumps over the lazy dog';

// 提取所有单词
const words = str.match(/\b\w+\b/g);
console.log(words); // ['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog']

// 提取数字
const numbers = '123abc456def789'.match(/\d+/g);
console.log(numbers); // ['123', '456', '789']

// 不带 g 标志
const firstNumber = '123abc456'.match(/\d+/);
console.log(firstNumber); // ['123', index: 0, input: '123abc456', groups: undefined]
```

**代码解释**：

- `match()` 配合正则表达式可以提取符合模式的子串。
- 常用于提取单词、数字、邮箱等特定格式的内容。

**注意事项**：

- 如果正则没有 `g` 标志，结果数组会包含 `index` 和 `input` 属性。
- 若未匹配到任何内容，返回 `null`。

---

### 6. `replace()` 与替换切割

**语法规则**：`str.replace(regexp|substr, newSubstr|function)`

**参数介绍**：

- `search` — 必需。要替换的子串或正则表达式。
- `replacement` — 必需。替换字符串或函数。

**返回值**：返回替换后的新字符串。

**举例使用**：

```javascript
const str = 'apple,banana,orange';

// 将逗号替换为空格（间接实现“切割”效果）
const replaced = str.replace(/,/g, ' ');
console.log(replaced); // 'apple banana orange'

// 使用函数动态替换（将每个单词转为大写）
const upper = str.replace(/\b\w+\b/g, (match) => match.toUpperCase());
console.log(upper); // 'APPLE,BANANA,ORANGE'
```

**代码解释**：

- `replace()` 通常用于替换，但配合全局正则可以将分隔符替换为其他字符，达到类似切割后拼接的效果。
- 替换函数可以对每个匹配项进行复杂处理。

**注意事项**：

- `replace()` 不会修改原字符串，返回新字符串。
- 如需全部替换，正则必须带 `g` 标志。

---

### 7. 正则表达式直接切割

除了 `split()` 使用正则，还可以通过 `match()` 或 `exec()` 实现更灵活的切割。

**示例：提取所有非分隔符的片段**

```javascript
const str = 'apple,banana;orange|grape';
const parts = str.match(/[^,;|]+/g);
console.log(parts); // ['apple', 'banana', 'orange', 'grape']
```

**代码解释**：

- 使用否定字符类 `[^,;|]` 匹配除了分隔符以外的字符，`+` 匹配一个或多个。
- `match()` 配合 `g` 返回所有匹配片段，相当于按多个分隔符切割。

---

## 总结

| 方法          | 描述                                               | 示例                                         |
| ------------- | -------------------------------------------------- | -------------------------------------------- |
| `split()`     | 根据分隔符将字符串拆分为数组                       | `'a,b,c'.split(',')` → `['a','b','c']`       |
| `substring()` | 提取指定索引区间的子串（不支持负数，自动交换参数） | `'Hello'.substring(1,3)` → `'el'`            |
| `slice()`     | 提取指定索引区间的子串（支持负数，不交换参数）     | `'Hello'.slice(-3)` → `'llo'`                |
| `substr()`    | 从指定位置提取指定长度（已弃用）                   | `'Hello'.substr(1,3)` → `'ell'`              |
| `match()`     | 提取符合正则的子串数组                             | `'123abc'.match(/\d+/g)` → `['123']`         |
| `replace()`   | 替换匹配内容（可结合全局正则实现“切割后拼接”）     | `'a,b,c'.replace(/,/g,' ')` → `'a b c'`      |
| 正则直接切割  | 用 `match` 提取非分隔符片段                        | `'a,b;c'.match(/[^,;]+/g)` → `['a','b','c']` |

根据实际需求选择合适的方法：

- 需要按分隔符拆分数组 → `split()`
- 需要提取子串 → `slice()` 或 `substring()`
- 需要提取符合模式的多个片段 → `match()` 配合正则
- 需要替换并间接“切割” → `replace()` 全局替换

掌握这些方法可以高效处理字符串切割任务。
