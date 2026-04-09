---
group:
  title: 【02】js字符串及字符串方法
  order: 2
order: 1
title: 字符串介绍
nav:
  title: JavaScript
  order: 2
---

## 1. 字符串概述

JavaScript 字符串（String）用于存储和操作文本信息，例如单词、句子或任意字符序列。字符串可以包含字母、数字、标点符号、特殊字符等。在 JavaScript 中，字符串是不可变的（一旦创建，不能修改），任何修改操作都会返回一个新字符串。

字符串可以通过三种字面量方式创建：

- **单引号**：`'Hello, world!'`
- **双引号**：`"Hello, world!"`
- **反引号（模板字符串，ES6 引入）**：`` `Hello, world!` ``

---

## 2. 字符串特性

- **不可变性**：字符串一旦创建，其内容无法直接修改。对字符串的操作（如拼接、替换、截取）都会返回一个新的字符串，原字符串保持不变。
- **长度可变**：字符串长度可以是 0 到任意大（受内存限制）。
- **模板字符串支持**：可以嵌入变量和表达式，保留空格和换行，使动态字符串创建更便捷。

---

## 3. 创建字符串的方式

有三种方式可以创建字符串：

1. **字符串字面量（直接量）**：使用引号或反引号直接定义。
2. **`String()` 函数**：将其他类型显式转换为字符串类型。
3. **`new String()` 构造函数**：创建一个 `String` 对象（不推荐，因为得到的是对象而非原始值）。

```javascript
let str1 = 'Hello'; // 字面量
let str2 = String(123); // 函数转换 → "123"
let str3 = new String(123); // 构造函数 → String 对象 { "123" }

console.log(typeof str1); // "string"
console.log(typeof str2); // "string"
console.log(typeof str3); // "object"
```

### 3.1 字面量与构造函数的区别

- 使用字面量（`''`、`""`、``` `）或 `String()` 函数创建的字符串是**原始类型**，存储在栈内存中（常量池）。
- 使用 `new String()` 创建的是**引用类型**对象，存储在堆内存中，指向一个字符串对象。

```javascript
let a = new String(1);
let b = String(2);
let c = 'a';

console.log(a); // [String: '1']
console.log(b); // "2"
console.log(c); // "a"
```

**⚠️ 注意**：`new String()` 始终返回一个对象，即使值相同，不同对象也不相等。因此不应使用 `new String()` 创建字符串，除非有特殊需求（如需要对象方法扩展）。

```javascript
let s1 = new String('abc');
let s2 = new String('abc');
console.log(s1 == s2); // false（不同对象）
console.log(s1 === s2); // false
```

推荐始终使用字面量或 `String()` 函数。

---

## 4. 模板字符串（Template Strings）

模板字符串是 ES6 引入的一种新的字符串语法，使用反引号（`` ` ``）包裹，提供了更强大的字符串构建能力。

### 4.1 主要特性

#### 4.1.1 字符串插值

通过 `${expression}` 嵌入变量或表达式的值，表达式会被计算后替换。

```javascript
let name = 'John';
let age = 25;
let greeting = `Hello, ${name}! You are ${age + 1} years old next year.`;
console.log(greeting); // "Hello, John! You are 26 years old next year."
```

#### 4.1.2 多行字符串

模板字符串会保留内部的换行符和空格，无需使用 `\n` 或字符串拼接。

```javascript
let multiLine = `This is a string
that spans across
multiple lines.`;
console.log(multiLine);
// 输出：
// This is a string
// that spans across
// multiple lines.
```

#### 4.1.3 标签模板（Tagged Templates）

允许通过一个函数对模板字符串进行自定义处理。函数接收字符串片段数组和插值列表，可以返回任意结果。

```javascript
function tag(strings, ...values) {
  console.log(strings); // ["This is a ", " and this is a ", "!"]
  console.log(values); // ["cat", "dog"]
  return 'Some return value';
}

let animal1 = 'cat';
let animal2 = 'dog';
let result = tag`This is a ${animal1} and this is a ${animal2}!`;
console.log(result); // "Some return value"
```

标签模板可用于国际化、HTML 转义、条件格式化等高级场景。

### 4.2 与传统字符串的对比

| 特性         | 传统字符串（引号）        | 模板字符串（反引号）                     |
| ------------ | ------------------------- | ---------------------------------------- |
| 字符串拼接   | 使用 `+` 运算符，可读性差 | `${}` 内嵌表达式，简洁清晰               |
| 多行支持     | 需要 `\n` 或逐行拼接      | 直接换行书写，保留格式                   |
| 表达式嵌入   | 不支持，需先计算再拼接    | 直接嵌入任意 JavaScript 表达式           |
| 标签函数处理 | 不支持                    | 支持，可自定义字符串处理逻辑             |
| 性能         | 较优（简单场景）          | 与拼接相当，但解析略有开销（可忽略不计） |

---

## 5. 总结

- JavaScript 字符串是存储文本的原始类型，具有不可变性。
- 创建字符串推荐使用字面量（`''`、`""`、``` `）或 `String()` 函数，避免使用 `new String()`。
- 模板字符串（反引号）提供了插值、多行、标签模板等强大特性，是现代 JavaScript 开发中处理动态字符串的首选方式。
- 理解字符串的不可变性有助于避免意外的性能问题（如循环中频繁拼接字符串，应使用数组或 `+=` 优化）。

掌握字符串的基础知识和模板字符串的用法，可以编写更清晰、高效的代码。
