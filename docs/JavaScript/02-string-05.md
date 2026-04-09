---
group:
  title: 【02】js字符串及字符串方法
  order: 2
order: 5
title: 字符串遍历方法
nav:
  title: JavaScript
  order: 2
---

在 JavaScript 中，有多种方法可以遍历字符串的每个字符。本文详细介绍每种遍历方式，包括语法规则、参数、返回值、代码解释及示例。

---

## 1. `for` 循环

**语法规则**：`for (let i = 0; i < str.length; i++) { // 使用 str[i] }`

**参数介绍**：无（循环控制语句）

**返回值**：无（直接执行循环体）

**举例使用**：

```javascript
const str = 'example';
for (let i = 0; i < str.length; i++) {
  console.log(str[i]);
}
// 输出：e x a m p l e
```

**代码解释**：

- `let i = 0`：初始化索引变量 `i`，从 0 开始。
- `i < str.length`：循环条件，当 `i` 小于字符串长度时继续。
- `i++`：每次循环后索引自增。
- `str[i]`：通过索引访问字符。

---

## 2. `for...of` 循环

**语法规则**：`for (const char of str) { // 使用 char }`

**参数介绍**：无（直接遍历可迭代对象）

**返回值**：无（直接执行循环体）

**举例使用**：

```javascript
const str = 'test';
for (const char of str) {
  console.log(char);
}
// 输出：t e s t
```

**代码解释**：

- `const char of str`：每次循环将 `char` 赋值为字符串中的下一个字符。
- 无需手动管理索引，代码简洁直观。

**原理说明**：
`for...of` 循环要求遍历的对象必须实现 **可迭代协议（Iterable protocol）**，即对象内部有一个 `[Symbol.iterator]` 方法。字符串是内置的可迭代对象，其 `[Symbol.iterator]` 方法返回一个迭代器，该迭代器按顺序返回字符串中的每个字符（**正确处理 Unicode 码点**，能够将代理对（如表情符号）作为一个字符返回，而不会像索引访问那样拆成两个码元）。

**`[Symbol.iterator]` 示例**：

```javascript
const str = '😀a';
const iterator = str[Symbol.iterator]();
console.log(iterator.next()); // { value: '😀', done: false }
console.log(iterator.next()); // { value: 'a', done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

可以看到，`[Symbol.iterator]` 将字符串按 Unicode 码点进行迭代，而不是按 UTF-16 码元。这确保了特殊字符（如表情符号）能被正确处理。

---

## 3. `forEach` 结合 `Array.from()`

**语法规则**：`Array.from(str).forEach(callback)`

**参数介绍**：

- `callback` — 必需。对每个字符执行的函数，参数为 `(char, index, array)`。

**返回值**：无（`forEach` 返回 `undefined`）

**举例使用**：

```javascript
const str = 'hello';
Array.from(str).forEach((char) => {
  console.log(char);
});
// 输出：h e l l o
```

**代码解释**：

- `Array.from(str)`：将字符串转换为字符数组（也会正确拆分 Unicode 字符）。
- `forEach`：对数组每个元素执行回调函数。
- 回调参数 `char` 为当前字符。

---

## 4. `while` 循环

**语法规则**：`let i = 0; while (i < str.length) { // 使用 str[i]; i++; }`

**参数介绍**：无（循环控制语句）

**返回值**：无（直接执行循环体）

**举例使用**：

```javascript
const str = 'abc';
let i = 0;
while (i < str.length) {
  console.log(str[i]);
  i++;
}
// 输出：a b c
```

**代码解释**：

- `let i = 0`：初始化索引变量。
- `i < str.length`：循环条件。
- `str[i]`：访问当前字符。
- `i++`：索引自增。

---

## 5. `map` 结合 `Array.from()`

**语法规则**：`Array.from(str).map(callback)`

**参数介绍**：

- `callback` — 必需。对每个字符执行的函数，返回值将组成新数组。

**返回值**：返回一个新数组，包含回调函数的返回值。

**举例使用**：

```javascript
const str = 'def';
const result = Array.from(str).map((char) => {
  console.log(char);
  return char.toUpperCase();
});
console.log(result);
// 输出：d e f
//      [ 'D', 'E', 'F' ]
```

**代码解释**：

- `Array.from(str)`：将字符串转换为字符数组。
- `map`：对每个元素执行回调，返回新数组。
- 回调函数中可进行字符处理（如转大写）。

---

## 6. `split('')` 结合 `forEach`

**语法规则**：`str.split('').forEach(callback)`

**参数介绍**：

- `callback` — 必需。对每个字符执行的函数，参数为 `(char, index, array)`。

**返回值**：无（`forEach` 返回 `undefined`）

**举例使用**：

```javascript
const str = 'hi';
str.split('').forEach((char) => console.log(char));
// 输出：h i
```

**代码解释**：

- `str.split('')`：将字符串按空字符分割为字符数组。注意：该方法按 UTF-16 码元分割，对于表情符号等会错误分割。
- `forEach`：遍历数组每个元素。

---

## 7. 扩展运算符 `...` 结合 `forEach`

**语法规则**：`[...str].forEach(callback)`

**参数介绍**：

- `callback` — 必需。对每个字符执行的函数，参数为 `(char, index, array)`。

**返回值**：无（`forEach` 返回 `undefined`）

**举例使用**：

```javascript
const str = 'ok';
[...str].forEach((char) => console.log(char));
// 输出：o k
```

**代码解释**：

- `[...str]`：扩展运算符内部调用字符串的 `[Symbol.iterator]` 方法，将字符串展开为字符数组（正确处理 Unicode）。
- `forEach`：遍历数组。

---

## 8. `for...in` 循环（不推荐）

**语法规则**：`for (let index in str) { // 使用 str[index] }`

**参数介绍**：无

**返回值**：无

**举例使用**：

```javascript
const str = 'hi';
for (let index in str) {
  console.log(str[index]);
}
// 输出：h i
```

**代码解释**：

- `for...in` 遍历字符串的可枚举属性（包括索引），但可能遍历到原型链上的其他可枚举属性，因此不推荐用于字符串遍历。

**为什么 `for...in` 也能遍历字符串？**
字符串在 JavaScript 中虽然是原始类型，但访问属性时会被临时包装为 `String` 对象。`String` 对象拥有数字索引属性（从 0 到 `length-1`），这些属性是**可枚举**的。`for...in` 会遍历对象的所有可枚举属性，包括这些数字索引。因此，`for...in` 可以逐个输出字符串的每个字符。然而，它还会遍历继承的属性和方法（如 `toString`、`valueOf` 等），除非这些属性被设置为不可枚举。因此，`for...in` 的结果不可预测，且性能较差，应避免使用。

**对比示例**：

```javascript
String.prototype.foo = 'bar';
const str = 'hi';
for (let i in str) {
  console.log(i, str[i]);
}
// 输出：0 'h'  1 'i'  foo 'bar'（原型属性也被遍历）
```

---

## 9. 总结

| 方法                         | 适用场景                   | 优点                                 | 缺点                                             |
| ---------------------------- | -------------------------- | ------------------------------------ | ------------------------------------------------ |
| `for` 循环                   | 需要索引访问或控制循环流程 | 兼容性好，灵活                       | 代码稍显冗长                                     |
| `for...of`                   | 仅需字符值，不需要索引     | 简洁直观，ES6 推荐，正确处理 Unicode | 无法直接获取索引                                 |
| `forEach + Array.from()`     | 需要遍历并执行操作         | 函数式风格                           | 需转换数组，额外开销                             |
| `while` 循环                 | 需要复杂循环条件           | 灵活                                 | 容易忘记自增导致死循环                           |
| `map + Array.from()`         | 需要遍历并返回新数组       | 可同时转换数据                       | 需转换数组，额外开销                             |
| `split('') + forEach`        | 简单遍历                   | 直接                                 | 不能正确处理 Unicode 字符                        |
| 扩展运算符 `...` + `forEach` | 简洁遍历                   | 语法简洁，正确处理 Unicode           | 创建中间数组                                     |
| `for...in`                   | 不推荐                     | -                                    | 可能遍历原型属性，有副作用，不能正确处理 Unicode |

**推荐做法**：

- 大多数情况使用 `for...of`，代码最简洁且正确处理 Unicode。
- 需要索引时使用传统 `for` 循环（注意 `str[i]` 按 UTF-16 码元访问，对于非 BMP 字符会拆分为两个）。
- 需要函数式操作（如过滤、映射）时，先使用 `[...str]` 或 `Array.from(str)` 转换为数组再操作。

掌握这些遍历方法，可以根据实际需求选择最合适的方案。
