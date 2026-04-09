---
group:
  title: 【01】js数据类型介绍及转换
  order: 1
order: 3
title: js数据类型转换
nav:
  title: JavaScript
  order: 2
---

## 1. 类型转换概述

JavaScript 是一种动态类型语言，变量本身不固定数据类型。在运算或函数调用过程中，JavaScript 引擎会根据需要自动执行数据类型转换，这个过程称为类型转换（Type Coercion）。

类型转换分为两种：

- **显式类型转换（Explicit Coercion）**：开发者通过语法明确指示类型转换。
- **隐式类型转换（Implicit Coercion）**：JavaScript 引擎在运算中自动转换类型。

---

## 2. 显式类型转换（强制类型转换）

显式类型转换是指开发者明确调用函数或操作符，将值从一种类型转换为另一种类型。

### 2.1 转换为字符串

常用方法：

- `String(value)`
- `value.toString()`
- `num.toFixed()`（仅数字）

#### 2.1.1 `String()` 函数

`String()` 可以将任意值转换为字符串，转换规则如下：

- `null` → `"null"`，`undefined` → `"undefined"`
- 布尔值 → `"true"` / `"false"`
- 数字 → 对应的字符串形式（如 `123` → `"123"`）
- 对象 → 调用对象的 `toString()` 方法（可被重写）
- Symbol → `"Symbol(description)"`
- BigInt → 对应数字字符串，不带 `n` 后缀
- 无参数 → 空字符串 `""`

```javascript
console.log(String(123)); // "123"
console.log(String(true)); // "true"
console.log(String(null)); // "null"
console.log(String(undefined)); // "undefined"
console.log(String(Symbol('x'))); // "Symbol(x)"
console.log(String(123n)); // "123"
console.log(String({})); // "[object Object]"
console.log(String([])); // ""（空数组转空字符串）
console.log(String([1, 2, 3])); // "1,2,3"
```

#### 2.1.2 `toString()` 方法

几乎所有值（除 `null` 和 `undefined`）都拥有 `toString()` 方法。调用后返回该值的字符串表示。

- 数字可接受进制参数：`(10).toString(2)` → `"1010"`
- 数组返回逗号分隔的元素字符串
- 函数返回函数源代码字符串
- 日期返回可读的日期时间字符串
- 普通对象默认返回 `"[object Object]"`（可重写）

```javascript
console.log((123).toString()); // "123"
console.log(true.toString()); // "true"
console.log([1, 2, 3].toString()); // "1,2,3"
console.log({ a: 1 }.toString()); // "[object Object]"
console.log(function () {}.toString()); // "function(){}"
console.log(new Date().toString()); // 如 "Mon May 06 2024 22:05:15 GMT+0800"
```

⚠️ 注意：`null` 和 `undefined` 没有 `toString()` 方法，调用会报错。

#### 2.1.3 `toFixed()` 方法

仅适用于数字，将数字格式化为指定小数位数的字符串，并进行四舍五入。

```javascript
let num = 123.456;
console.log(num.toFixed()); // "123"
console.log(num.toFixed(2)); // "123.46"
console.log(num.toFixed(5)); // "123.45600"
```

### 2.2 转换为数字

常用方法：

- `Number(value)`
- `parseInt(value, radix)`、`parseFloat(value)`
- 一元加号 `+value`

#### 2.2.1 `Number()` 函数

转换规则：

- 布尔值：`true` → `1`，`false` → `0`
- `null` → `0`
- `undefined` → `NaN`
- 字符串：纯数字字符串 → 对应数字，空字符串 → `0`，其他 → `NaN`
- 对象：先调用 `valueOf()`，若结果不是原始值再调用 `toString()`，最后转换为数字
- Symbol 会抛出错误
- BigInt 转换为对应数字（可能丢失精度）

```javascript
console.log(Number('123')); // 123
console.log(Number('')); // 0
console.log(Number('12px')); // NaN
console.log(Number(true)); // 1
console.log(Number(false)); // 0
console.log(Number(null)); // 0
console.log(Number(undefined)); // NaN
console.log(Number([1, 2, 3])); // NaN（数组先转字符串 "1,2,3" 再转数字 → NaN）
console.log(Number([])); // 0（空数组转空字符串 → 0）
console.log(Number({})); // NaN
```

#### 2.2.2 `parseInt()` 和 `parseFloat()`

两者专门用于将字符串解析为数字，遇到非数字字符会停止解析（忽略前导空格）。

- `parseInt(string, radix)`：返回整数，可指定进制（2~36）。若字符串以 `0x` 开头，默认解析为十六进制。
- `parseFloat(string)`：返回浮点数，只解析十进制。

```javascript
console.log(parseInt('123.456')); // 123
console.log(parseInt('123px')); // 123
console.log(parseInt('0xFF', 16)); // 255
console.log(parseInt('10', 2)); // 2
console.log(parseInt('  10')); // 10
console.log(parseInt('abc')); // NaN

console.log(parseFloat('123.456')); // 123.456
console.log(parseFloat('123.00')); // 123
console.log(parseFloat('123px')); // 123
console.log(parseFloat('12.34.56')); // 12.34
console.log(parseFloat('  -12.3')); // -12.3
console.log(parseFloat('abc')); // NaN
```

#### 2.2.3 一元加号 `+`

`+value` 可以快速将值转换为数字，效果与 `Number(value)` 相同。

```javascript
let str = '5';
let bool = true;
let arr = [1];
let date = new Date();

console.log(+str); // 5
console.log(+bool); // 1
console.log(+arr); // 1（[1] 转字符串 "1" 再转数字）
console.log(+date); // 毫秒时间戳
console.log(+null); // 0
console.log(+undefined); // NaN
```

### 2.3 转换为布尔值

常用方法：`Boolean(value)`

转换规则：以下值转为 `false`，其余均为 `true`。

- `false`
- `0`、`-0`
- `0n`（BigInt 零）
- `""`（空字符串）
- `null`
- `undefined`
- `NaN`

```javascript
console.log(Boolean(0)); // false
console.log(Boolean('')); // false
console.log(Boolean(null)); // false
console.log(Boolean(undefined)); // false
console.log(Boolean(NaN)); // false
console.log(Boolean({})); // true
console.log(Boolean([])); // true
console.log(Boolean(' ')); // true（非空字符串）
```

---

## 3. 隐式类型转换

隐式转换发生在运算符对不同类型进行操作时，引擎自动转换类型。

### 3.1 算术运算中的隐式转换

- **加法 `+`**：如果任一操作数是字符串，则将另一个操作数转为字符串进行拼接。
- **其他算术运算 `-`、`*`、`/`、`%`**：将操作数转为数字进行计算（无法转为数字则得到 `NaN`）。

```javascript
console.log('5' + 2); // "52"
console.log('5' - 2); // 3
console.log('5' * '2'); // 10
console.log('5' / 2); // 2.5
console.log('a' - 1); // NaN
console.log(true + 1); // 2（true → 1）
console.log(false + 1); // 1（false → 0）
```

### 3.2 比较运算中的隐式转换

- **相等 `==`**：当类型不同时，会尝试转换为数字再比较。
- **`>`、`<`、`>=`、`<=`**：也会进行类型转换。

```javascript
console.log('5' == 5); // true（字符串转数字）
console.log(0 == false); // true（false → 0）
console.log(null == undefined); // true（特殊规则）
console.log(null == 0); // false（null 只等于 undefined 和自身）
console.log(NaN == NaN); // false
```

⚠️ 建议使用严格相等 `===` 避免隐式转换带来的意外。

### 3.3 逻辑运算中的隐式转换

逻辑运算符 `&&`、`||`、`!` 会将操作数转为布尔值进行判断，但返回的是原始操作数，而不是布尔值。

- `&&`：若第一个为假，返回第一个；否则返回第二个。
- `||`：若第一个为真，返回第一个；否则返回第二个。
- `!`：返回布尔值。

```javascript
console.log('hello' && 'world'); // "world"
console.log(0 && 'world'); // 0
console.log('hello' || 'world'); // "hello"
console.log(0 || 'world'); // "world"
console.log(!!'hello'); // true
```

### 3.4 条件语句中的隐式转换

`if`、`while`、`for` 等条件表达式会将值隐式转为布尔值。

```javascript
let obj = {};
if (obj) {
  console.log('obj is truthy'); // 执行
}
```

### 3.5 对象到原始值的转换

当对象参与运算（如 `+`、`-`、`==`）或需要原始值时，会尝试调用 `Symbol.toPrimitive`（优先）、`valueOf()`、`toString()` 方法。

- 转为数字时：先调 `valueOf()`，若返回非原始值再调 `toString()`。
- 转为字符串时：先调 `toString()`，若返回非原始值再调 `valueOf()`。
- 无偏好时（如 `==`）：默认按数字处理（但 Date 对象按字符串处理）。

可以通过 `Symbol.toPrimitive` 自定义转换行为。

```javascript
let obj = {
  valueOf() {
    return 1;
  },
  toString() {
    return '2';
  },
};
console.log(obj + 1); // 2（valueOf 返回数字 1，1+1=2）
console.log(`${obj}`); // "2"（toString 返回 "2"）
```

```javascript
let obj2 = {
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return 100;
    if (hint === 'string') return 'hello';
    return true;
  },
};
console.log(+obj2); // 100
console.log(`${obj2}`); // "hello"
console.log(obj2 + 1); // 2（无偏好，默认 number → 100+1=101? 但这里 hint 可能是 "default"，实际测试返回 true，true+1=2）
```

---

## 4. 综合练习

### 题目：分析以下表达式的输出

```javascript
console.log(++[[]][+[]] + [+[]]); // 输出什么？
```

**逐步解析：**

1. 表达式拆解为：`++[[]][+[]]` 与 `[+[]]` 相加。
2. 先计算 `+[]`：
   - 空数组 `[]` 需要转为数字：先调用 `valueOf()` 返回数组本身，不是原始值，再调用 `toString()` 返回空字符串 `""`。
   - `+""` → `0`。
   - 因此 `+[]` 的结果是 `0`。
3. 所以 `[+[]]` 就是 `[0]`。
4. 再看 `++[[]][+[]]`：
   - `[[]]` 是一个包含空数组的数组，即 `[ [] ]`。
   - `[[]][0]` 取出第一个元素，即 `[]`（空数组）。
   - 然后对 `[]` 执行 `++` 前置自增操作。但 `++[]` 在语法上是错误的，因为 `++` 要求操作数是变量或可引用属性，不能直接对字面量数组使用。
   - 然而这里实际运算顺序是：`++[[]][0]`，即 `++([])`，仍然是对空数组字面量使用自增，会报错？

   实际上，该表达式在 JavaScript 中是可以运行的，原因在于解析规则：`++[[]][+[]]` 等价于 `++([[]][+[]])`，而 `[[]][+[]]` 先被计算为 `[]`，然后对 `[]` 执行 `++`。`++[]` 会先将 `[]` 转换为数字：`Number([])` 为 `0`，然后自增得到 `1`。因此 `++[]` 的结果是数字 `1`。

5. 因此 `++[[]][+[]]` 最终得到数字 `1`。
6. 最后 `1 + [0]`：由于 `+` 运算符，当一侧为字符串或对象时，会将另一侧转为字符串拼接。`[0]` 转为字符串 `"0"`，所以 `1 + "0"` → `"10"`。

**最终输出：** `"10"`（字符串类型）

---

## 5. 总结

- **显式转换**：使用 `String()`、`Number()`、`Boolean()`、`toString()`、`parseInt/parseFloat`、一元加号等，可预测且安全。
- **隐式转换**：由 JavaScript 自动完成，常见于算术、比较、逻辑运算中，容易产生意外结果，建议使用严格相等 `===` 和显式转换来避免歧义。
- **对象转原始值**：遵循 `[Symbol.toPrimitive]` → `valueOf()` → `toString()` 的调用链，可以根据转换提示（hint）自定义行为。
- 理解转换规则有助于编写更健壮的代码，减少因类型问题导致的 bug。
