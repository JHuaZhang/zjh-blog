---
order: 5
title: 【05】变量命名规则
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

在 JavaScript 中，变量用于存储数据值。变量的命名必须遵循一定的规则，否则会导致语法错误或意外的行为。同时，遵循良好的命名习惯可以提高代码的可读性和可维护性。

---

## 2. 命名规则（必须遵守）

| 规则 | 说明 | 正确示例 | 错误示例 |
|------|------|----------|----------|
| 首字符必须是字母、下划线 `_` 或美元符号 `$` | 数字不能作为变量名的第一个字符 | `name`, `_count`, `$price` | `1name`, `@age` |
| 后续字符可以是字母、数字、下划线或美元符号 | 变量名可以由这些字符任意组合 | `user1`, `first_name`, `$value$` | `user-name`, `full name` |
| 变量名区分大小写 | `myVar` 和 `myvar` 是两个不同的变量 | `age`, `Age`（不同） | — |
| 不能使用保留字（关键字） | 语言内置的关键字（如 `var`, `function`, `for` 等）不能作为变量名 | `myFor`, `_class` | `for`, `function` |

**示例**：

```javascript
// 有效变量名
var myVar;
var _myVar;
var $myVar;
var myVar123;
var v2;
var $value;
var _temp_var;

// 无效变量名
// var 1myVar;   // 错误：不能以数字开头
// var my-var;   // 错误：不能包含连字符
// var for;      // 错误：for 是保留字
```

---

## 3. 保留字（Reserved Words）

保留字是 JavaScript 语言内部使用的关键字或未来可能使用的关键字，不能用作变量名（包括函数名、参数名等）。如果试图使用保留字作为变量名，会抛出语法错误。

### 3.1 关键字（在当前 JavaScript 版本中使用）

这些是语言当前正在使用的关键字，不能用作标识符。

| 分类 | 保留字 |
|------|--------|
| 控制流 | `break`, `case`, `catch`, `continue`, `default`, `do`, `else`, `finally`, `for`, `if`, `return`, `switch`, `throw`, `try`, `while` |
| 声明 | `var`, `let`, `const`, `function`, `class`, `async`, `await` |
| 操作符 | `delete`, `in`, `instanceof`, `new`, `typeof`, `void`, `with` |
| 值/字面量 | `true`, `false`, `null`, `undefined`, `NaN`, `Infinity` |
| 模块/导出 | `export`, `import`, `default`, `as`, `from` |
| 对象/原型 | `this`, `super`, `extends`, `new`, `implements`（严格模式） |
| 其他 | `debugger`, `yield`, `static`, `enum` |

**注意**：`await` 仅在 `async` 函数内作为保留字，但最好避免用作变量名。

### 3.2 未来保留字（可能在将来版本中使用）

这些单词目前没有被 JavaScript 使用，但已经被预留，不能用作变量名（特别是在严格模式下）。

| 分类 | 保留字 |
|------|--------|
| 严格模式保留字 | `implements`, `interface`, `let`, `package`, `private`, `protected`, `public`, `static` |
| 模块相关 | `await`（在模块顶层也保留） |
| 其他 | `enum`, `export`, `import`, `super`（已使用，但列在这里） |

### 3.3 特殊保留字（已经弃用或环境特定）

| 保留字 | 说明 |
|--------|------|
| `arguments` | 函数内部对象，不能作为参数名，但可以作为变量名？实际上不推荐，容易混淆 |
| `eval` | 函数名，不能用作变量名 |
| `set`, `get` | 对象存取器语法保留字（但在严格模式下不能用作变量名） |

### 3.4 完整列表

以下是完整的保留字列表（适用于普通模式，严格模式更严格）：

```
break, case, catch, class, const, continue, debugger, default, delete, do, else, 
export, extends, false, finally, for, function, if, import, in, instanceof, let, 
new, null, return, super, switch, this, throw, true, try, typeof, var, void, 
while, with, yield, enum, implements, interface, package, private, protected, 
public, static, await, async
```

**注意**：`undefined`, `NaN`, `Infinity` 虽然是全局属性，但可以被覆盖（不推荐），也建议避免用作变量名。

---

## 4. 命名规范（强烈建议）

虽然不是语法强制要求，但遵循以下规范有助于写出更清晰、易协作的代码。

### 4.1 驼峰命名法（camelCase）

- **规则**：第一个单词首字母小写，后续每个单词首字母大写。
- **用途**：变量名、函数名、对象属性名。

```javascript
var myFavoriteColor;
var theCurrentDate;
var listOfUsers;
var getUserById;
```

### 4.2 帕斯卡命名法（PascalCase）

- **规则**：每个单词首字母大写。
- **用途**：构造函数名、类名。

```javascript
function Person() {}
class DataService {}
```

### 4.3 常量命名（全大写 + 下划线）

- **规则**：所有字母大写，单词间用下划线分隔。
- **用途**：表示不会改变的值（常量）。

```javascript
const MAX_SIZE = 100;
const API_BASE_URL = 'https://api.example.com';
```

### 4.4 下划线前缀（`_`）

- **规则**：以单下划线开头。
- **用途**：约定表示“私有”属性或内部变量（JavaScript 本身无真正的私有保护，仅作为约定）。

```javascript
var _internalData;
function _privateMethod() {}
```

---

## 5. 变量声明关键字

| 关键字 | 作用域 | 可重复声明 | 变量提升 | 说明 |
|--------|--------|------------|----------|------|
| `var` | 函数作用域 | 是 | 是（初始为 `undefined`） | 旧式声明，不推荐使用 |
| `let` | 块作用域 `{}` | 否 | 是（但暂存死区，未初始化前不可访问） | 现代推荐，用于可变变量 |
| `const` | 块作用域 `{}` | 否 | 是（同样有暂存死区） | 声明常量，必须立即赋值，不能重新赋值 |

```javascript
let score = 100;   // 可修改
const PI = 3.14;   // 不可修改
```

---

## 6. 最佳实践

1. **变量名应具有描述性**：使用有意义的名称，避免单字母（除非临时循环变量 `i`, `j`）。
   ```javascript
   // 不推荐
   var d;
   // 推荐
   var elapsedDays;
   ```

2. **避免使用 `var`**：使用 `let` 和 `const`，减少作用域污染和意外全局变量。

3. **统一命名风格**：团队内保持一致的命名规范（如统一使用驼峰）。

4. **避免过度缩写**：除非是公认缩写（如 `idx` → index, `len` → length），否则写全称。

5. **注意暂存死区（TDZ）**：使用 `let` 和 `const` 时，不能在声明前访问变量。

```javascript
console.log(x); // ReferenceError: Cannot access 'x' before initialization
let x = 5;
```

---

## 7. 总结

- 变量命名必须遵守 JavaScript 的**语法规则**（首字符、组成字符、不保留字、区分大小写）。
- 保留字包括关键字和未来保留字，完整列表已提供，应避免使用。
- 推荐遵循**驼峰命名法**等代码风格规范，提高代码可读性。
- 根据是否需要修改选择 `let` 或 `const`，避免使用 `var`。
- 清晰的变量命名是写出可维护代码的第一步。
