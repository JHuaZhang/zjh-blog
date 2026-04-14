---
group:
  title: 【06】js运算符
  order: 6
order: 1
title: js运算符汇总
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

运算符用于执行程序中的各种运算。JavaScript 提供了丰富的运算符，包括算术、赋值、比较、逻辑、位运算、条件（三元）、类型运算符等。理解运算符的优先级和结合性对于正确编写表达式至关重要。本文将详细介绍每个运算符的核心行为，特别是一些容易混淆的细节（如 `++i` 与 `i++` 的区别、逻辑运算符的短路求值等）。

---

## 2. 算术运算符

用于数值计算（支持数字和可转换为数字的值）。

| 运算符 | 说明 | 示例 | 结果 |
|--------|------|------|------|
| `+` | 加法 / 字符串拼接 | `5 + 2`<br>`'hello' + ' world'` | `7`<br>`'hello world'` |
| `-` | 减法 | `5 - 2` | `3` |
| `*` | 乘法 | `5 * 2` | `10` |
| `/` | 除法（返回浮点数） | `5 / 2` | `2.5` |
| `%` | 取余（模运算） | `5 % 2` | `1` |
| `**` | 幂运算（ES2016） | `2 ** 3` | `8` |
| `++` | 自增（前置/后置） | 见下文详解 | — |
| `--` | 自减（前置/后置） | 见下文详解 | — |

### 2.1 `++` 和 `--` 运算符详解

自增 (`++`) 和自减 (`--`) 运算符可以放在操作数的前面（前置）或后面（后置），行为不同。

**前置 (`++i` / `--i`)**：先将变量的值增加/减少 1，然后**返回增加后的值**。

**后置 (`i++` / `i--`)**：先返回变量的**原值**，然后再将变量的值增加/减少 1。

```javascript
let a = 1;
let b = ++a;   // a 先变成 2，然后 b 得到 2
console.log(a, b); // 2, 2

let c = 1;
let d = c++;   // 先返回 c 的原值 1 给 d，然后 c 变成 2
console.log(c, d); // 2, 1
```

**在表达式中使用**：

```javascript
let x = 5;
let y = 10;
let z = x++ + ++y;   // 从左到右：x++ 返回 5，然后 x 变为 6；++y 将 y 变为 11 并返回 11；5+11=16
console.log(x, y, z); // 6, 11, 16
```

**注意事项**：
- 自增/自减只能用于变量（或可引用的属性），不能直接用于字面量（如 `5++` 错误）。
- 在循环中，后置自增更常见（`for(let i=0; i<10; i++)`），因为通常只需要循环结束后的增量效果，而不关心表达式的返回值。
- 避免在复杂表达式中混用前置和后置自增，容易造成混淆，建议单独成行。

---

## 3. 赋值运算符

用于给变量赋值，并结合其他运算。

| 运算符 | 说明 | 等价于 |
|--------|------|--------|
| `=` | 赋值 | `a = b` |
| `+=` | 加法赋值 | `a = a + b` |
| `-=` | 减法赋值 | `a = a - b` |
| `*=` | 乘法赋值 | `a = a * b` |
| `/=` | 除法赋值 | `a = a / b` |
| `%=` | 取余赋值 | `a = a % b` |
| `**=` | 幂赋值 | `a = a ** b` |
| `&=` | 按位与赋值 | `a = a & b` |
| `\|=` | 按位或赋值 | `a = a \| b` |
| `^=` | 按位异或赋值 | `a = a ^ b` |
| `<<=` | 左移赋值 | `a = a << b` |
| `>>=` | 右移赋值 | `a = a >> b` |
| `>>>=` | 无符号右移赋值 | `a = a >>> b` |
| `&&=` | 逻辑与赋值（ES2021） | `a && (a = b)` |
| `\|\|=` | 逻辑或赋值（ES2021） | `a \|\| (a = b)` |
| `??=` | 空值合并赋值（ES2021） | `a ?? (a = b)` |

**示例**：

```javascript
let a = 5;
a += 3;   // a = 8
a **= 2;  // a = 64

let b = null;
b ??= 10; // b = 10
```

---

## 4. 比较运算符

比较两个值，返回布尔值 `true` 或 `false`。

| 运算符 | 说明 | 示例 |
|--------|------|------|
| `==` | 相等（值相等，允许类型转换） | `5 == '5'` → `true` |
| `===` | 严格相等（值和类型都相等） | `5 === '5'` → `false` |
| `!=` | 不等（值不等，允许类型转换） | `5 != '5'` → `false` |
| `!==` | 严格不等（值或类型不等） | `5 !== '5'` → `true` |
| `>` | 大于 | `5 > 3` → `true` |
| `>=` | 大于等于 | `5 >= 5` → `true` |
| `<` | 小于 | `3 < 5` → `true` |
| `<=` | 小于等于 | `3 <= 3` → `true` |

**注意**：
- `==` 会进行类型转换（如 `0 == false` → `true`，`null == undefined` → `true`），容易导致意外结果，**推荐使用 `===`**。
- 比较字符串时按字典序（Unicode 码点）。
- `NaN` 与任何值（包括自身）比较都不相等，包括 `==` 和 `===`。用 `Number.isNaN()` 判断。

```javascript
console.log(NaN === NaN); // false
console.log(Object.is(NaN, NaN)); // true（特殊方法）
```

---

## 5. 逻辑运算符

用于组合布尔值或条件表达式，返回布尔值或其中一个操作数（**短路运算**）。

| 运算符 | 说明 | 短路行为 |
|--------|------|----------|
| `&&` | 逻辑与 | 如果左边为 falsy，返回左边，否则返回右边 |
| `\|\|` | 逻辑或 | 如果左边为 truthy，返回左边，否则返回右边 |
| `!` | 逻辑非 | 返回布尔值（取反） |

**Falsy 值**：`false`, `0`, `-0`, `0n`, `''`（空字符串）, `null`, `undefined`, `NaN`。其他值均为 truthy。

### 5.1 逻辑与 `&&` 的详细行为

- 表达式 `a && b` 首先计算 `a`（左侧）。
- 如果 `a` 是 **falsy**，则直接返回 `a` 的值，**不再计算 `b`**（短路）。
- 如果 `a` 是 **truthy**，则返回 `b` 的值（无论 `b` 是什么）。

**示例**：

```javascript
console.log(0 && 100);        // 0（左侧 falsy，返回左侧，右侧不执行）
console.log(1 && 200);        // 200（左侧 truthy，返回右侧）
console.log(true && false);   // false（左侧 truthy，返回右侧 false）
console.log(false && true);   // false（左侧 falsy，返回左侧 false）
```

**副作用示例**（验证短路）：
```javascript
let x = 0;
let y = (x && someFunction()); // 由于 x=0 是 falsy，someFunction 不会被调用
```

### 5.2 逻辑或 `||` 的详细行为

- 表达式 `a || b` 首先计算 `a`（左侧）。
- 如果 `a` 是 **truthy**，则直接返回 `a` 的值，**不再计算 `b`**（短路）。
- 如果 `a` 是 **falsy**，则返回 `b` 的值。

**示例**：

```javascript
console.log(1 || 100);        // 1（左侧 truthy，返回左侧）
console.log(0 || 200);        // 200（左侧 falsy，返回右侧）
console.log(false || true);   // true（左侧 falsy，返回右侧 true）
console.log(true || false);   // true（左侧 truthy，返回左侧 true）
```

**短路特性**：

```javascript
let isReady = true;
isReady && doSomething();   // 如果 isReady 为 true，才调用 doSomething
let name = inputName || 'Guest';  // 如果 inputName 为 falsy，则使用默认值
```

### 5.3 逻辑非 `!`

- 返回布尔值的取反：`!truthy` → `false`，`!falsy` → `true`。
- 可以连续使用两次 `!!` 将任意值转换为布尔值（相当于 `Boolean(value)`）。

```javascript
console.log(!true);      // false
console.log(!0);         // true
console.log(!!'hello');  // true（等价于 Boolean('hello')）
```

---

## 6. 位运算符

将操作数视为 32 位二进制整数进行操作（实际运算前转为 32 位有符号整数，结果再转回 JavaScript 数字）。

| 运算符 | 说明 | 示例 |
|--------|------|------|
| `&` | 按位与 | `5 & 1` → `1`（0101 & 0001 = 0001） |
| `\|` | 按位或 | `5 \| 1` → `5`（0101 \| 0001 = 0101） |
| `^` | 按位异或 | `5 ^ 1` → `4`（0101 ^ 0001 = 0100） |
| `~` | 按位非 | `~5` → `-6`（~0101 = ...1010） |
| `<<` | 左移 | `5 << 1` → `10`（0101 << 1 = 1010） |
| `>>` | 右移（保留符号位） | `-5 >> 1` → `-3` |
| `>>>` | 无符号右移 | `-5 >>> 1` → `2147483645` |

**注意**：位运算符通常用于权限控制、标志位、颜色值处理等底层场景，普通业务代码中不常用。

---

## 7. 条件（三元）运算符

语法：`condition ? exprIfTrue : exprIfFalse`

```javascript
let age = 18;
let status = age >= 18 ? 'adult' : 'minor';
```

**求值细节**：
- 首先计算 `condition`，将其转为布尔值。
- 如果为 `true`，则计算并返回 `exprIfTrue`，**不计算** `exprIfFalse`。
- 如果为 `false`，则计算并返回 `exprIfFalse`，**不计算** `exprIfTrue`。

因此，三元运算符也具备短路行为。

```javascript
let x = 0;
let y = (x > 0) ? computeExpensive1() : computeExpensive2(); // 只调用其中一个函数
```

---

## 8. 类型运算符

| 运算符 | 说明 | 返回值 |
|--------|------|--------|
| `typeof` | 返回操作数的类型字符串 | `'string'`, `'number'`, `'boolean'`, `'undefined'`, `'object'`, `'function'`, `'symbol'`, `'bigint'` |
| `instanceof` | 检查对象是否为某个构造函数的实例 | `true` / `false` |

**注意**：
- `typeof null` → `'object'`（历史遗留 bug）。
- `typeof function(){}` → `'function'`。
- `instanceof` 检查原型链，可用于区分数组、对象等，但跨窗口时可能失效。

```javascript
console.log(typeof 42);          // 'number'
console.log(typeof {});          // 'object'
console.log([] instanceof Array); // true
```

---

## 9. 其他运算符

### 9.1 空值合并运算符（`??`，ES2020）

只判断 `null` 或 `undefined`，返回第一个非 `null`/`undefined` 的操作数。

```javascript
let x = null ?? 'default';  // 'default'
let y = 0 ?? 'default';     // 0（0 不是 null/undefined）
```

**短路行为**：与 `||` 类似，如果左侧不是 `null` 或 `undefined`，则右侧不计算。

```javascript
function expensive() { console.log('run'); return 42; }
let a = 5 ?? expensive();   // 5，expensive 不会被调用
let b = null ?? expensive(); // 调用 expensive，返回 42
```

**与 `||` 的区别**：`||` 会忽略所有 falsy 值（包括 `0`、`''`、`false`），而 `??` 只忽略 `null` 和 `undefined`。

### 9.2 可选链运算符（`?.`，ES2020）

在访问深层属性时，如果中间某个属性是 `null` 或 `undefined`，表达式短路返回 `undefined`，不会抛出错误。

```javascript
let obj = { a: { b: 1 } };
console.log(obj?.a?.b);   // 1
console.log(obj?.x?.y);   // undefined（不报错）

// 也可用于函数调用
let result = someObj.someMethod?.();
```

**短路行为**：一旦遇到 `?.` 前的值为 `null`/`undefined`，整个表达式立即返回 `undefined`，后续属性/方法不再计算。

### 9.3 `in` 运算符

`in` 运算符用于检查对象（或数组）是否包含某个属性（键）。如果指定的属性存在于对象或其原型链中，返回 `true`，否则 `false`。

**语法**：`prop in obj`

- `prop`：属性名（字符串或 Symbol）或数组索引（数字）。
- `obj`：要检查的对象。

**基本行为**：

```javascript
let obj = { a: 1, b: 2 };
console.log('a' in obj);   // true
console.log('c' in obj);   // false
console.log('toString' in obj); // true（继承自 Object.prototype）
```

**数组中的应用**：

```javascript
let arr = [10, 20, 30];
console.log(0 in arr);     // true（索引 0 存在）
console.log(3 in arr);     // false（索引 3 不存在）
console.log('length' in arr); // true（数组的 length 属性）
```

**稀疏数组**：

```javascript
let sparse = [1, , 3];
console.log(1 in sparse);   // false（索引 1 是空位，不存在）
```

**与 `hasOwnProperty` 的区别**：
- `in` 会检查**原型链**上的属性。
- `obj.hasOwnProperty(prop)` 只检查**对象自身**的属性。

```javascript
let obj = { a: 1 };
console.log('toString' in obj);           // true（原型链上有）
console.log(obj.hasOwnProperty('toString')); // false（自身没有）
```

**对基本类型的处理**：
- `in` 运算符右侧必须是一个对象。如果右侧是基本类型，JavaScript 会将其装箱为对应的包装对象（`String`、`Number` 等），然后再检查属性。

```javascript
console.log('length' in 'hello'); // true（字符串有 length 属性）
console.log(0 in 'hello');        // true（字符串索引 0 存在）
console.log(1 in 'hello');        // true
console.log(10 in 'hello');       // false
```

**注意**：
- `in` 运算符不能用于 `null` 或 `undefined`，会抛出 `TypeError`。
- 对于数组，推荐使用 `Array.isArray()` 和索引范围检查，而非 `in` 来判断元素是否存在，因为 `in` 检查的是属性是否存在（包括空位和原型链），不一定是“元素值存在”。

```javascript
let arr = [1, 2, 3];
console.log(0 in arr); // true，即使 arr[0] 是 1（非空）
```

### 9.4 逗号运算符（`,`）

从左到右依次执行每个表达式，并返回最后一个表达式的值。

```javascript
let a = (1, 2, 3); // a = 3
let b = 0;
let c = (b++, b + 2); // c = 3
```

### 9.5 `delete` 运算符

删除对象的属性。返回布尔值表示是否删除成功。

```javascript
let obj = { x: 1, y: 2 };
delete obj.x;
console.log(obj); // { y: 2 }
```

**注意**：不能删除用 `var`/`let`/`const` 声明的变量，也不能删除不可配置的属性。

### 9.6 `void` 运算符

计算表达式并返回 `undefined`。常用于避免表达式返回值（如 `javascript:void(0)`）。

```javascript
console.log(void 0);     // undefined
console.log(void (2+3)); // undefined
```

---

## 10. 运算符优先级

优先级高的运算符先执行。可以用圆括号 `()` 改变运算顺序。下面列出常用运算符优先级（从高到低）：

| 优先级 | 运算符类型 | 运算符 |
|--------|------------|--------|
| 1 | 成员访问、函数调用 | `.` `[]` `()` |
| 2 | 后缀自增/自减 | `++` `--` |
| 3 | 逻辑非、按位非、一元加减、`typeof`、`void`、`delete`、`await` | `!` `~` `+` `-` `typeof` `void` `delete` `await` |
| 4 | 幂 | `**` |
| 5 | 乘、除、取余 | `*` `/` `%` |
| 6 | 加、减 | `+` `-` |
| 7 | 位移 | `<<` `>>` `>>>` |
| 8 | 比较 | `<` `<=` `>` `>=` `in` `instanceof` |
| 9 | 相等 | `==` `!=` `===` `!==` |
| 10 | 按位与 | `&` |
| 11 | 按位异或 | `^` |
| 12 | 按位或 | `\|` |
| 13 | 逻辑与 | `&&` |
| 14 | 逻辑或 | `\|\|` |
| 15 | 空值合并 | `??` |
| 16 | 条件（三元） | `? :` |
| 17 | 赋值 | `=` `+=` `-=` `*=` `/=` `%=` `**=` `&=` `\|=` `^=` `<<=` `>>=` `>>>=` `&&=` `\|\|=` `??=` |
| 18 | 逗号 | `,` |

**示例**：

```javascript
let result = 2 + 3 * 4;   // 14（* 优先级高）
let result2 = (2 + 3) * 4; // 20（括号改变优先级）
```

---

## 11. 总结

| 分类 | 运算符 |
|------|--------|
| 算术 | `+` `-` `*` `/` `%` `**` `++` `--` |
| 赋值 | `=` `+=` `-=` `*=` `/=` `%=` `**=` `&=` `\|=` `^=` `<<=` `>>=` `>>>=` `&&=` `\|\|=` `??=` |
| 比较 | `==` `===` `!=` `!==` `>` `>=` `<` `<=` |
| 逻辑 | `&&` `\|\|` `!` |
| 位运算 | `&` `\|` `^` `~` `<<` `>>` `>>>` |
| 条件 | `? :` |
| 类型 | `typeof` `instanceof` |
| 其他 | `??` `?.` `in` `,` `delete` `void` |

**关键点回顾**：
- 前置/后置自增的区别：前置先改变后返回，后置先返回后改变。
- 逻辑与 `&&` 左侧为 falsy 时短路并返回左侧；逻辑或 `||` 左侧为 truthy 时短路并返回左侧。
- 空值合并 `??` 只针对 `null`/`undefined` 短路。
- 可选链 `?.` 遇到 `null`/`undefined` 短路为 `undefined`。
- 条件（三元）运算符也具备短路特性，只执行被选中的分支。
- `in` 运算符检查属性是否存在于对象或其原型链中，与 `hasOwnProperty` 不同。
- 掌握运算符的优先级和不同类型的行为，可以写出更准确、高效的 JavaScript 代码。在日常开发中，推荐使用 `===` 和 `!==` 代替 `==` 和 `!=`，使用 `??` 处理默认值（针对 `null`/`undefined`），使用可选链 `?.` 安全访问深层属性。
