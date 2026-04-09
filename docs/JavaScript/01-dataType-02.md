---
group:
  title: 【01】js数据类型介绍及转换
  order: 1
order: 2
title: js数据类型检测
nav:
  title: JavaScript
  order: 2
---

## 1. 数据类型检测方法概览

JavaScript 中一共有八大数据类型（原始类型：String、Number、Boolean、Null、Undefined、Symbol、BigInt；引用类型：Object）。当我们需要确定一个变量具体属于哪种类型时，有多种方法可供选择，每种方法各有优缺点和适用场景。下面依次介绍四种常用检测方法，并深入剖析其底层原理，同时说明各种方法可能出现判断不准的情况。

---

## 2. typeof 操作符

`typeof` 操作符返回一个字符串，表示未经计算的操作数的类型。

### 2.1 基本使用

```javascript
console.log(typeof ''); // "string"
console.log(typeof 1); // "number"
console.log(typeof NaN); // "number"
console.log(typeof true); // "boolean"
console.log(typeof Symbol(1)); // "symbol"
console.log(typeof undefined); // "undefined"
console.log(typeof function () {}); // "function"

// 特殊情况
console.log(typeof null); // "object"
console.log(typeof []); // "object"
console.log(typeof {}); // "object"
```

**总结**：`typeof` 对除 `null` 以外的原始类型和函数判断准确，但对数组、对象、`null` 均返回 `"object"`，无法进一步区分。

### 2.2 typeof 的原理

在 JavaScript 引擎底层，每个值都有一个**类型标签**（type tag）来标识其类型。早期的 JavaScript 实现中，类型标签存储在值的低 3 位（或更多位）中：

- 000：对象（object）
- 001：整数（int）
- 010：浮点数（double）
- 100：字符串（string）
- 111：布尔（boolean）
- 无标签：undefined（-2^30 等特殊值）
- 函数是一种特殊的对象，会额外处理返回 "function"

`typeof` 操作符实际上就是读取这个类型标签并返回对应的字符串。

### 2.3 为什么 `typeof null === "object"`？

`null` 的值在底层通常用**空指针**表示，在大多数平台上空指针的机器码为 `0x00`。而对象的类型标签恰好也是 `000`。当引擎读取 `null` 的类型标签时，看到 `000`，就误认为它是一个对象，因此返回 `"object"`。这是 JavaScript 语言早期设计的一个遗留 bug，但由于大量现有代码依赖此行为，标准一直未予修复。

**注意**：在 ES6 的 `Symbol` 和 `BigInt` 出现后，`typeof` 能正确返回 `"symbol"` 和 `"bigint"`，但 `null` 的问题依然存在。

### 2.4 注意：暂时性死区的影响

在 ES6 之前，`typeof` 对于未声明的变量会返回 `"undefined"`，不会报错。但 ES6 引入 `let`/`const` 和暂时性死区后，在变量声明前使用 `typeof` 会抛出 `ReferenceError`。

```javascript
let a = 1;
console.log(typeof a); // "number"

console.log(typeof c); // ReferenceError: c is not defined
let c = 1;
```

### 2.5 `typeof` 判断不准的情况

- **`null` 被误判为 `"object"`**：如上所述，这是语言的历史遗留问题，无法避免。
- **对未声明的变量使用 `typeof`（在 ES6 块级作用域内）**：如果变量是用 `let` 或 `const` 声明但尚未初始化（暂时性死区），会抛出 `ReferenceError`，而不是返回 `"undefined"`。
- **无法区分自定义对象的具体类型**：所有自定义对象、数组、日期、正则等都会返回 `"object"`。
- **`typeof` 对于 `document.all` 的返回值为 `"undefined"`**：这是浏览器环境的特殊处理（为了兼容历史），虽然 `document.all` 实际上是一个类数组对象，但 `typeof document.all === "undefined"`。

---

## 3. instanceof 操作符

`instanceof` 用于检测构造函数的 `prototype` 属性是否出现在某个实例对象的原型链上。它通常用来判断**对象**的具体类型，不能用于原始类型（除非通过包装对象）。

### 3.1 基本使用

```javascript
console.log([] instanceof Array); // true
console.log([] instanceof Object); // true（数组的原型链上也有 Object）

console.log({} instanceof Object); // true
console.log(function () {} instanceof Function); // true
console.log(function () {} instanceof Object); // true

// 包装对象
console.log(new String('1') instanceof String); // true
console.log(new Number(1) instanceof Number); // true
console.log(new Boolean(true) instanceof Boolean); // true
```

### 3.2 原始类型直接使用会返回 false

```javascript
console.log('1' instanceof String); // false
console.log(1 instanceof Number); // false
console.log(true instanceof Boolean); // false
```

### 3.3 `instanceof` 的原理

`instanceof` 的原理基于**原型链查找**。当执行 `obj instanceof Constructor` 时，引擎执行以下步骤：

1. 获取 `Constructor.prototype` 的值。
2. 获取 `obj` 的内部 `[[Prototype]]`（即 `obj.__proto__`）。
3. 循环遍历原型链：
   - 如果当前 `[[Prototype]]` 为 `null`，返回 `false`。
   - 如果当前 `[[Prototype]]` 等于 `Constructor.prototype`，返回 `true`。
   - 否则，将当前 `[[Prototype]]` 设置为其自身的原型，继续循环。

因此，`instanceof` 判断的是**整个原型链**上是否存在目标构造函数的 `prototype`。这也意味着，如果修改了原型链，结果可能改变。

```javascript
function A() {}
function B() {}
const obj = new A();
console.log(obj instanceof A); // true
console.log(obj instanceof B); // false
Object.setPrototypeOf(obj, B.prototype);
console.log(obj instanceof B); // true（原型链已改变）
```

### 3.4 注意：`null` 和 `undefined` 不能使用 `instanceof`

```javascript
console.log(null instanceof Object); // false（不会报错，但永远为 false）
console.log(undefined instanceof Object); // false
```

> `null` 和 `undefined` 没有构造函数，因此 `instanceof` 始终返回 `false`，不会报错。但直接对 `null` 或 `undefined` 使用 `instanceof` 是合法的，只是结果固定为 `false`。

### 3.5 `instanceof` 与基本类型的包装

```javascript
console.log(new Number(1) == 1); // true（== 会进行类型转换）
console.log(new Number(1) === 1); // false（类型不同）
```

### 3.6 `instanceof` 判断不准的情况

- **跨框架/跨窗口（iframe）问题**：不同执行环境（如不同 `<iframe>`）拥有独立的全局对象和构造函数。例如，一个数组在父窗口创建，传入子窗口后，`childArray instanceof parent.Array` 为 `false`，因为原型链不相等。同理，`instanceof` 在多个全局环境之间会失效。
- **原型链被动态修改**：如果通过 `Object.setPrototypeOf` 或直接修改 `__proto__` 改变了对象的原型链，`instanceof` 的结果会随之改变，可能不符合原始预期。
- **原始类型直接使用**：`'abc' instanceof String` 返回 `false`，无法判断原始字符串类型。但有时需要判断原始类型时，这会成为限制。
- **对非对象操作数**：如果右操作数不是构造函数（没有 `prototype` 属性），会抛出 `TypeError`。例如 `1 instanceof {}` 会报错，因为 `{}` 不是构造函数。
- **`null` 和 `undefined` 始终返回 `false`**，但可能造成混淆：开发者可能期望 `null instanceof Object` 返回 `true` 或抛出错误，但实际上它返回 `false`。

---

## 4. constructor 属性

每个实例对象都拥有 `constructor` 属性，指向创建该对象的构造函数。

### 4.1 基本使用

```javascript
console.log('1'.constructor === String); // true
console.log((1).constructor === Number); // true
console.log(NaN.constructor === Number); // true
console.log(true.constructor === Boolean); // true
console.log([].constructor === Array); // true
console.log(function () {}.constructor === Function); // true
console.log({}.constructor === Object); // true
console.log(Symbol(1).constructor === Symbol); // true
```

### 4.2 `constructor` 的原理

`constructor` 属性并不是对象自身的属性，而是来自其**原型链**上的 `constructor`。默认情况下，每个函数的 `prototype` 对象都会自动获得一个 `constructor` 属性，指向函数本身。当创建一个实例对象时，实例的内部 `[[Prototype]]` 会指向构造函数的 `prototype`，因此实例可以访问 `constructor` 属性。

```javascript
function Fn() {}
const f = new Fn();
console.log(f.constructor === Fn); // true
console.log(Fn.prototype.constructor === Fn); // true
```

**易变性**：由于 `constructor` 属性来自原型，任何对原型的修改都会影响 `constructor` 的指向。

```javascript
function Fn() {}
Fn.prototype = new Array(); // 改变原型
var f = new Fn();

console.log(f.constructor === Fn); // false
console.log(f.constructor === Array); // true
```

因此，`constructor` 在原型被修改后不再可靠。

### 4.3 注意：`null` 和 `undefined` 没有 `constructor`

```javascript
console.log(null.constructor); // TypeError: Cannot read property 'constructor' of null
console.log(undefined.constructor); // TypeError: Cannot read property 'constructor' of undefined
```

### 4.4 `constructor` 判断不准的情况

- **原型被覆盖**：如上所述，当构造函数的 `prototype` 被完全替换（而非修改）时，新原型上的 `constructor` 可能丢失或指向错误。例如 `Fn.prototype = {}` 后，实例的 `constructor` 将指向 `Object` 而不是 `Fn`。
- **跨框架问题**：与 `instanceof` 类似，不同全局环境下的 `constructor` 属性指向不同的构造函数对象，因此 `arr.constructor === Array` 在跨窗口时可能为 `false`。
- **`null` 和 `undefined` 会抛出错误**：无法直接使用，需要先判空。
- **原始类型的临时包装对象**：对于原始值，访问 `constructor` 属性时，JavaScript 会临时创建一个包装对象，因此 `(1).constructor === Number` 为 `true`。但这个过程是隐式的，在某些严格环境下可能被禁止或产生额外开销。不过这不是“不准”，而是需要注意。
- **自定义对象可以随意修改 `constructor` 属性**：开发者可以直接给实例添加 `constructor` 属性，覆盖原型链上的值，导致检测结果错误。

---

## 5. Object.prototype.toString.call()

这是最通用、最准确的类型检测方法，可以精确区分所有内置类型（包括 `null`、`undefined`、数组、函数、日期等）。

### 5.1 基本使用

```javascript
const toString = Object.prototype.toString;

console.log(toString.call(1)); // "[object Number]"
console.log(toString.call('1')); // "[object String]"
console.log(toString.call(NaN)); // "[object Number]"
console.log(toString.call(true)); // "[object Boolean]"
console.log(toString.call(Symbol(1))); // "[object Symbol]"
console.log(toString.call(null)); // "[object Null]"
console.log(toString.call(undefined)); // "[object Undefined]"
console.log(toString.call([])); // "[object Array]"
console.log(toString.call({})); // "[object Object]"
console.log(toString.call(function () {})); // "[object Function]"

function Fn() {}
console.log(toString.call(Fn)); // "[object Function]"
```

### 5.2 `Object.prototype.toString.call()` 的原理

每个 JavaScript 对象都有一个内部的 `[[Class]]` 属性（在现代规范中称为 `[ [TypedArray] ]` 等，但概念类似），用于表示对象的**内置类型**。这个属性在对象创建时被确定，并且通常**无法被修改**。`Object.prototype.toString` 方法在被调用时，会执行以下步骤：

1. 获取 `this` 值的 `[[Class]]`（或相应的内部类型名称）。
2. 返回一个字符串，格式为 `"[object " + 类型名称 + "]"`。

**为什么必须使用 `Object.prototype.toString` 而不是直接调用 `obj.toString()`？**

因为很多内置类型（如 `Array`、`Function`、`Date`）都重写了 `toString` 方法，返回了其他格式的字符串。只有 `Object.prototype.toString` 保留了原始的返回 `[object Type]` 的行为。

**示意图（文字描述）**：

```
原始值/对象 -> 通过 call/apply 将 this 绑定到 Object.prototype.toString 方法
      ↓
Object.prototype.toString 内部读取 this 的内部 [[Class]] 属性
      ↓
返回字符串 "[object " + [[Class]] + "]"
```

例如：

- 传入 `null` -> [[Class]] = "Null" -> "[object Null]"
- 传入 `[1,2,3]` -> [[Class]] = "Array" -> "[object Array]"

### 5.3 封装为通用函数

```javascript
function getType(target) {
  return Object.prototype.toString.call(target).slice(8, -1);
}

console.log(getType(1)); // "Number"
console.log(getType('1')); // "String"
console.log(getType(null)); // "Null"
console.log(getType(undefined)); // "Undefined"
console.log(getType([])); // "Array"
console.log(getType({})); // "Object"
console.log(getType(function () {})); // "Function"
```

### 5.4 为什么不能用 `obj.toString()` 直接获取类型？

因为许多内置类型（如 Array、Function、Date 等）重写了自身的 `toString` 方法，调用时会返回其他内容（如数组转为字符串、函数返回函数体字符串）。只有 `Object.prototype.toString` 保留了原始的类型标签功能。

```javascript
let arr = [1, 2, 3];
console.log(arr.toString()); // "1,2,3"（被重写）
delete Array.prototype.toString;
console.log(arr.toString()); // "[object Array]"（恢复为 Object.prototype.toString）
```

### 5.5 `Object.prototype.toString.call()` 判断不准的情况

- **无法区分自定义构造函数的实例**：所有通过 `new MyClass()` 创建的对象，`toString.call` 都会返回 `"[object Object]"`，无法得知具体的 `MyClass` 类型。这是因为自定义对象的内部 `[[Class]]` 就是 `"Object"`。要区分自定义类型，仍需使用 `instanceof` 或 `constructor`。
- **跨框架/跨窗口问题**：虽然 `toString.call` 能够正确返回 `"[object Array]"` 等，但对于跨窗口传递的对象，`toString.call` 依然返回正确的内置类型（如数组仍是 `"[object Array]"`），因此比 `instanceof` 更可靠。但无法识别跨窗口的自定义类型（仍是 `"[object Object]"`）。
- **`Symbol.toStringTag` 的影响**：ES6 引入了 `Symbol.toStringTag` 属性，允许自定义对象的 `Object.prototype.toString` 行为。如果某个对象设置了 `Symbol.toStringTag`，那么 `toString.call` 将返回该标签值而不是内置 `[[Class]]`。例如：
  ```javascript
  let obj = { [Symbol.toStringTag]: 'MyCustom' };
  console.log(Object.prototype.toString.call(obj)); // "[object MyCustom]"
  ```
  这可能导致类型判断结果与预期不符（但通常这是期望的行为，用于自定义类型标识）。
- **宿主对象（如浏览器环境中的 DOM 元素）**：某些宿主对象的 `toString` 行为可能不规范，或者 `Symbol.toStringTag` 被设置为特定值，导致返回的字符串不是标准的 `"[object HTMLDivElement]"` 等。不过大多数现代浏览器已符合规范。
- **`null` 和 `undefined` 返回 `"[object Null]"` 和 `"[object Undefined]"`**：这本身是准确的，但需要注意在 ES5 之前的环境中，`toString.call(null)` 可能返回 `"[object Object]"`（旧浏览器 bug），现在已修复。
- **对包装对象和原始值的区分**：`toString.call(new Number(1))` 返回 `"[object Number]"`，而 `toString.call(1)` 也返回 `"[object Number]"`。因此无法区分原始数值和包装对象。如果需要区分，可以结合 `typeof` 或 `instanceof`。

---

## 6. 四种方法对比总结

| 方法                               | 适用范围                            | 优点           | 缺点                                                 |
| ---------------------------------- | ----------------------------------- | -------------- | ---------------------------------------------------- |
| `typeof`                           | 原始类型（除 `null`）及函数         | 简单、快速     | 无法区分对象、数组、`null`，对 `null` 误判           |
| `instanceof`                       | 对象（包括包装对象）                | 能检测继承关系 | 不能用于原始类型，且可能因原型改变而不准确           |
| `constructor`                      | 大多数对象（有 `constructor` 属性） | 相对准确       | 易被修改，`null`/`undefined` 会报错                  |
| `Object.prototype.toString.call()` | 所有内置类型                        | 最准确、最全面 | 无法区分自定义类型，可能被 `Symbol.toStringTag` 影响 |

**推荐**：在需要精确判断任何类型的场景下，使用 `Object.prototype.toString.call()` 是最佳实践。对于自定义类型，可结合 `instanceof` 使用。

---

## 7. 扩展：检测是否为数组

ES5 提供了 `Array.isArray()` 方法，专门用于判断一个值是否为数组。

```javascript
console.log(Array.isArray([])); // true
console.log(Array.isArray({})); // false
console.log(Array.isArray(null)); // false
```

这是目前检测数组最简洁可靠的方式。`Array.isArray` 能正确区分跨窗口的数组，且不受 `Symbol.toStringTag` 影响（除非恶意修改）。
