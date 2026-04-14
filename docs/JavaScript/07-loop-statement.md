---
order: 7
title: 【07】循环语句详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

循环语句用于重复执行一段代码块，直到满足某个条件。JavaScript 提供了多种循环结构：`while`、`do...while`、`for`、`for...in`、`for...of`。此外，`break` 和 `continue` 语句用于在循环内部进行流程控制。本文将详细讲解每种循环的语法、执行过程，以及 `break` 和 `continue` 在不同循环中的行为差异，并深入分析标签（label）、与 `return` 的区别以及跳出多层循环的方法。

---

## 2. 通用控制语句：`break` 和 `continue`

### 2.1 `break` 语句

- **作用**：立即终止当前所在的循环（或 `switch` 语句），程序继续执行循环后的代码。
- **适用循环**：`while`、`do...while`、`for`、`for...in`、`for...of`，以及 `switch`。
- **在嵌套循环中**：默认只跳出最内层循环。可以使用 **标签（label）** 跳出指定层循环。

**原理**：当解释器遇到 `break` 时，会查找当前循环的最内层封闭结构（或指定标签的循环），并立即将控制流转移到该结构之后的第一条语句。不会执行 `break` 之后的任何循环体代码，也不会再执行更新表达式（对于 `for` 循环）。

**示例**：

```javascript
for (let i = 0; i < 5; i++) {
  if (i === 3) break;
  console.log(i);
}
// 输出：0,1,2
```

### 2.2 `continue` 语句

- **作用**：跳过当前循环迭代中 `continue` 之后的所有代码，立即进入下一次迭代。
- **适用循环**：`while`、`do...while`、`for`、`for...in`、`for...of`。
- **注意**：`continue` 不能在 `switch` 中使用。
- **在 `while` / `do...while` 中**：如果 `continue` 跳过了更新循环变量的语句，可能导致无限循环，需格外小心。

**原理**：解释器遇到 `continue` 时，会跳过当前迭代的剩余部分，然后根据循环类型决定下一步：
- 对于 `while` / `do...while`：直接跳转到条件判断。
- 对于 `for`：先执行更新表达式，再跳转到条件判断。
- 对于 `for...in` / `for...of`：跳转到下一个属性/值。

**示例**：

```javascript
for (let i = 0; i < 5; i++) {
  if (i === 2) continue;
  console.log(i);
}
// 输出：0,1,3,4
```

### 2.3 `return` 与 `break` / `continue` 的区别

- `return` 用于函数内部，**不仅退出循环，还退出整个函数**，并返回一个值（如果有）。
- `break` 和 `continue` 只能在循环或 `switch` 中使用，不能出现在函数顶层（除非在循环内）。
- 在多层循环中，`return` 可以直接退出所有循环并结束函数，而 `break` 需要配合标签才能跳出多层。

**示例**：

```javascript
function test() {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (i === 1 && j === 1) return; // 直接退出整个函数
    }
  }
  console.log('这行不会执行');
}
test(); // 函数直接返回，无输出
```

---

## 3. 标签（label）详解

标签是为语句（`statement`）指定的标识符，用于 `break` 或 `continue` 时控制流程。其语法为：

```javascript
label: statement
```

- `label` 可以是任意合法的标识符（不能是保留字）。
- `statement` 可以是任意 JavaScript 语句（如 `{...}` 块、`if`、`for`、`while` 等），但只有**循环语句和 `switch` 语句**才能与 `break` / `continue` 配合使用。

### 3.1 `statement` 的类型与行为

#### 3.1.1 标签作用于循环（最常用）

```javascript
loop1: for (let i = 0; i < 3; i++) {
  console.log('外层', i);
  loop2: for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break loop1; // 跳出外层循环
    console.log('  内层', j);
  }
}
// 输出：
// 外层 0
//   内层 0,1,2
// 外层 1
//   内层 0
// 然后退出，不再输出外层 2 及其内层
```

#### 3.1.2 标签作用于代码块 `{}`

- 可以为任意代码块（`{ ... }`）添加标签。
- `break` 可以跳出该代码块（但 `continue` 不能，因为代码块不是循环）。
- 这种用法不常见，但合法。

```javascript
block: {
  console.log('进入代码块');
  if (true) break block; // 跳出该块
  console.log('这行不会执行');
}
console.log('跳出块之后');
// 输出：
// 进入代码块
// 跳出块之后
```

#### 3.1.3 标签作用于其他语句（`if`、`switch` 等）

- `break` 可以跳出标签所在的任何语句，但只有循环和 `switch` 才能配合 `continue`。
- 对于 `if` 语句，`break label` 会直接退出整个 `if` 块（如果标签在 `if` 上），但很少这样用。

```javascript
myIf: if (true) {
  console.log('进入 if');
  break myIf;   // 退出 if 块
  console.log('不会执行');
}
console.log('if 块之后');
```

### 3.2 `outer` 和 `inner` 标签的作用与区别

在嵌套循环中，常用 `outer` 表示外层循环，`inner` 表示内层循环。它们只是标识符名称，没有固定含义，但遵循这样的命名约定有助于代码可读性。

#### 3.2.1 `break` 与标签

- `break outer`：立即终止 `outer` 标签所在的循环（包括其内部所有嵌套循环），控制权转移到 `outer` 循环之后。
- `break inner`：终止 `inner` 标签所在的循环（即内层循环），效果等同于不带标签的 `break`（因为默认跳出最内层）。

```javascript
outer: for (let i = 0; i < 3; i++) {
  inner: for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer; // 跳出外层循环
    console.log(i, j);
  }
}
// 输出：
// 0 0, 0 1, 0 2, 1 0
// 然后直接退出，不会执行 i=1 后面的迭代和 i=2 的迭代
```

如果改为 `break inner`，则只会跳出内层循环，外层继续：

```javascript
outer: for (let i = 0; i < 3; i++) {
  inner: for (let j = 0; j < 3; j++) {
    if (j === 1) break inner; // 跳出内层循环，但外层继续
    console.log(i, j);
  }
}
// 输出：
// 0 0, 1 0, 2 0
```

#### 3.2.2 `continue` 与标签

- `continue outer`：跳过当前 `outer` 循环的**本次迭代**中剩余的所有代码（包括内层循环未执行的部分），直接进入 `outer` 循环的下一次迭代（会先执行 `outer` 循环的更新表达式）。
- `continue inner`：跳过当前 `inner` 循环的本次迭代，进入内层循环的下一次迭代（等同于不带标签的 `continue`）。

```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) continue outer; // 跳过整个内层循环剩余部分，直接进入下一次 i
    console.log(i, j);
  }
}
// 输出：
// 0 0, 1 0, 2 0
```

注意：`continue outer` 会**终止当前 `outer` 迭代中所有后续代码**，包括内层循环尚未执行的迭代，然后执行 `i++`，再判断 `i<3`。

#### 3.2.3 区别总结

| 标签 | `break label` 效果 | `continue label` 效果 |
|------|--------------------|------------------------|
| `outer` | 完全终止 `outer` 循环 | 跳过当前 `outer` 迭代的剩余部分，进入下一次 `outer` 迭代 |
| `inner` | 终止 `inner` 循环（同无标签 `break`） | 跳过当前 `inner` 迭代，进入下一次 `inner` 迭代（同无标签 `continue`） |

### 3.3 注意事项

- 标签不能重复（同一作用域内标签必须唯一）。
- 不能从非循环语句中 `break` 或 `continue` 到标签（例如从 `if` 块中 `break` 到循环标签会报错）。
- 过度使用标签会降低代码可读性，应尽量使用函数拆分或重构逻辑。
- 标签可以用于任何语句块（比如 `{ ... }`），但只有循环和 `switch` 才能配合 `continue` 使用；`break` 可以配合任何标签退出该语句块。

---

## 4. 跳出多层循环的常见方法

### 4.1 使用标签（推荐）

```javascript
outer: for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    if (i === 2 && j === 2) break outer;
  }
}
```

### 4.2 使用 `return`（如果在函数内）

```javascript
function findElement(matrix, target) {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === target) return true;
    }
  }
  return false;
}
```

### 4.3 使用标志变量

```javascript
let found = false;
for (let i = 0; i < 5 && !found; i++) {
  for (let j = 0; j < 5; j++) {
    if (condition) {
      found = true;
      break;
    }
  }
}
```

但这种方法需要在外层循环条件中检查标志，且不能立即退出所有嵌套（内层 `break` 后外层还会继续判断，但可以配合外层条件停止）。

---

## 5. 各循环中 `break` / `continue` 的详细使用规则

### 5.1 `while` 循环

| 语句 | 是否可用 | 行为说明 |
|------|---------|----------|
| `break` | ✅ | 立即终止 `while` 循环 |
| `continue` | ✅ | 跳过本次迭代剩余代码，跳转到条件判断；**如果 `continue` 在更新循环变量之前，可能导致死循环** |

**示例**：

```javascript
let i = 0;
while (i < 5) {
  i++;
  if (i === 3) continue;
  console.log(i);
}
// 输出：1,2,4,5
```

### 5.2 `do...while` 循环

| 语句 | 是否可用 | 行为说明 |
|------|---------|----------|
| `break` | ✅ | 立即终止循环 |
| `continue` | ✅ | 跳过本次迭代剩余代码，跳转到条件判断；同样需注意更新变量的位置 |

**示例**：

```javascript
let i = 0;
do {
  i++;
  if (i === 3) continue;
  console.log(i);
} while (i < 5);
// 输出：1,2,4,5
```

### 5.3 `for` 循环

| 语句 | 是否可用 | 行为说明 |
|------|---------|----------|
| `break` | ✅ | 终止循环，不再执行更新表达式 |
| `continue` | ✅ | 跳过本次循环体，**但仍然执行更新表达式**，然后进行条件判断 |

**示例**：

```javascript
for (let i = 0; i < 5; i++) {
  if (i === 2) continue;
  console.log(i);
}
// 输出：0,1,3,4
```

### 5.4 `for...in` 循环

| 语句 | 是否可用 | 行为说明 |
|------|---------|----------|
| `break` | ✅ | 终止循环 |
| `continue` | ✅ | 跳过当前属性，继续下一个属性 |

**注意**：遍历的是对象的可枚举属性名（包括原型链上的），不要用于数组。

### 5.5 `for...of` 循环

| 语句 | 是否可用 | 行为说明 |
|------|---------|----------|
| `break` | ✅ | 终止循环 |
| `continue` | ✅ | 跳过当前值，继续下一个值 |

---

## 6. 总结与对比

| 循环类型 | `break` 可用 | `continue` 可用 | 注意事项 |
|---------|-------------|----------------|----------|
| `while` | ✅ | ✅ | `continue` 跳过更新可能死循环 |
| `do...while` | ✅ | ✅ | 同上，但至少执行一次 |
| `for` | ✅ | ✅ | `continue` 自动执行更新，安全 |
| `for...in` | ✅ | ✅ | 遍历属性名，不推荐数组 |
| `for...of` | ✅ | ✅ | 遍历值，推荐数组 |

**跳出多层循环的方法**：
1. **标签**：最直接，可跳出任意层。
2. **`return`**：如果循环在函数内，可直接退出函数。
3. **标志变量**：较笨拙，不推荐。

**原理总结**：
- `break`：控制权转移到循环结束之后。
- `continue`：控制权转移到循环的下一次迭代开始（`for` 会先执行更新）。
- `return`：退出整个函数，所有循环终止。

掌握这些控制语句，能够编写更灵活、高效的循环逻辑。
