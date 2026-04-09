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

### 3.3 `instanceof` 的原理（重要澄清）

#### 常见误解澄清

- ❌ **误解1**：`instanceof` 检查实例的原型上是否有 `Array` 这个属性。  
  ✅ **事实**：`[]` 的原型（`__proto__`）指向 `Array.prototype` 对象，该对象上并没有一个叫 `Array` 的属性。`Array` 是构造函数，不是原型上的属性。

- ❌ **误解2**：`instanceof` 依赖原型上的 `constructor` 属性。  
  ✅ **事实**：`constructor` 只是原型上的一个普通属性，指向构造函数本身。删除它不会影响 `instanceof` 的结果。

#### 具体执行步骤

当执行 `obj instanceof Constructor` 时，引擎执行以下算法：

1. 获取 `Constructor.prototype` 的值。
2. 获取 `obj` 的内部 `[[Prototype]]`（即 `obj.__proto__`）。
3. 循环遍历原型链：
   - 如果当前 `[[Prototype]]` 为 `null`，返回 `false`。
   - 如果当前 `[[Prototype]]` **全等于** `Constructor.prototype`，返回 `true`。
   - 否则，将当前 `[[Prototype]]` 设置为它的原型，继续循环。

**关键点**：比较的是**对象引用**，而不是属性名或属性值。

#### 图解原型链关系

```
       +---------------------+
       |   Array (构造函数)   |
       |                     |
       |  .prototype --------+----->  +------------------+
       +---------------------+         | Array.prototype  | <--- 这就是 [] 的原型
                                       |                  |
                                       |  .constructor ----+-----> Array (构造函数)
                                       |  .push, .map...   |
                                       +------------------+
                                              ^
                                              |
                                      [] 的 __proto__ 指向这里
```

#### 代码验证

```javascript
const arr = [];

// 1. instanceof 的本质：比较原型链上的对象引用
console.log(Object.getPrototypeOf(arr) === Array.prototype); // true
console.log(arr instanceof Array); // true

// 2. 原型上并没有一个叫 "Array" 的属性
console.log('Array' in arr.__proto__); // false

// 3. 原型上确实有一个 constructor 属性指向 Array
console.log(arr.__proto__.constructor === Array); // true

// 4. 即使删除 constructor，instanceof 依然为 true
delete Array.prototype.constructor;
console.log(arr instanceof Array); // 依然是 true
// 证明 instanceof 不依赖 constructor 属性
```

#### 为什么 `[]` 的原型是 `Array.prototype`？

当你创建一个数组字面量 `[]` 时，JavaScript 内部会调用 `new Array()` 构造器，并将新对象的 `[[Prototype]]` 设置为 `Array.prototype`。因此所有数组实例都共享同一个原型对象。

### 3.4 注意：`null` 和 `undefined` 不能使用 `instanceof`

```javascript
console.log(null instanceof Object); // false（不会报错，但永远为 false）
console.log(undefined instanceof Object); // false
```

> `null` 和 `undefined` 没有构造函数，因此 `instanceof` 始终返回 `false`，不会报错。但直接对 `null` 或 `undefined` 使用 `instanceof` 是合法的，只是结果固定为 `false`。

### 3.5 `instanceof` 判断不准的情况

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

---

## 8. TypeScript 中的类型检测封装实践

在前端项目中，我们经常需要封装一套类型检测工具，以便在 TypeScript 中获得更好的类型推断和代码提示。下面是一套完整的 TypeScript 实现，利用 `Object.prototype.toString` 作为底层检测，并提供了类型守卫、常量定义和常用快捷方法。

```typescript
/**
 * ============================================================================
 * 1. 类型常量定义 (The Source of Truth)
 * ============================================================================
 * 使用 as const 确保值是字面量类型，而不是宽泛的 string。
 * 这样在使用 TYPE_NAMES.ARRAY 时，TS 知道它确切是 "Array" 而不是 string。
 */
export const TYPE_NAMES = {
  // 基本类型
  STRING: 'String',
  NUMBER: 'Number',
  BOOLEAN: 'Boolean',
  NULL: 'Null',
  UNDEFINED: 'Undefined',
  SYMBOL: 'Symbol',
  BIGINT: 'BigInt',

  // 引用类型 - 基础
  OBJECT: 'Object',
  ARRAY: 'Array',
  FUNCTION: 'Function',

  // 引用类型 - 日期/正则/错误
  DATE: 'Date',
  REGEXP: 'RegExp',
  ERROR: 'Error',

  // 具体错误类型 (可选，根据需要开启)
  EVAL_ERROR: 'EvalError',
  RANGE_ERROR: 'RangeError',
  REFERENCE_ERROR: 'ReferenceError',
  SYNTAX_ERROR: 'SyntaxError',
  TYPE_ERROR: 'TypeError',
  URI_ERROR: 'URIError',

  // 引用类型 - 集合
  MAP: 'Map',
  SET: 'Set',
  WEAK_MAP: 'WeakMap',
  WEAK_SET: 'WeakSet',

  // 引用类型 - 异步/迭代
  PROMISE: 'Promise',
  GENERATOR: 'Generator',
  GENERATOR_FUNCTION: 'GeneratorFunction',
  ASYNC_FUNCTION: 'AsyncFunction',

  // 引用类型 - 二进制数据 (TypedArrays)
  INT8_ARRAY: 'Int8Array',
  UINT8_ARRAY: 'Uint8Array',
  UINT8_CLAMPED_ARRAY: 'Uint8ClampedArray',
  INT16_ARRAY: 'Int16Array',
  UINT16_ARRAY: 'Uint16Array',
  INT32_ARRAY: 'Int32Array',
  UINT32_ARRAY: 'Uint32Array',
  FLOAT32_ARRAY: 'Float32Array',
  FLOAT64_ARRAY: 'Float64Array',
  BIG_INT64_ARRAY: 'BigInt64Array',
  BIG_UINT64_ARRAY: 'BigUint64Array',

  // 引用类型 - 缓冲区
  ARRAY_BUFFER: 'ArrayBuffer',
  SHARED_ARRAY_BUFFER: 'SharedArrayBuffer',
  DATA_VIEW: 'DataView',
} as const;

/**
 * 从常量对象中提取出所有的值类型联合
 * 结果类似: "String" | "Number" | "Array" | ...
 */
export type TypeName = (typeof TYPE_NAMES)[keyof typeof TYPE_NAMES];

/**
 * ============================================================================
 * 2. 类型映射 (Type Mapping)
 * ============================================================================
 * 将字符串类型映射回具体的 TypeScript 类型，用于 isType 的类型守卫
 */
type TypeMap = {
  [TYPE_NAMES.STRING]: string;
  [TYPE_NAMES.NUMBER]: number;
  [TYPE_NAMES.BOOLEAN]: boolean;
  [TYPE_NAMES.NULL]: null;
  [TYPE_NAMES.UNDEFINED]: undefined;
  [TYPE_NAMES.SYMBOL]: symbol;
  [TYPE_NAMES.BIGINT]: bigint;

  [TYPE_NAMES.ARRAY]: unknown[];
  [TYPE_NAMES.OBJECT]: Record<PropertyKey, unknown>;
  [TYPE_NAMES.FUNCTION]: Function;

  [TYPE_NAMES.DATE]: Date;
  [TYPE_NAMES.REGEXP]: RegExp;
  [TYPE_NAMES.ERROR]: Error;

  [TYPE_NAMES.MAP]: Map<unknown, unknown>;
  [TYPE_NAMES.SET]: Set<unknown>;
  [TYPE_NAMES.WEAK_MAP]: WeakMap<object, unknown>;
  [TYPE_NAMES.WEAK_SET]: WeakSet<object>;

  [TYPE_NAMES.PROMISE]: Promise<unknown>;

  // Typed Arrays 映射
  [TYPE_NAMES.INT8_ARRAY]: Int8Array;
  [TYPE_NAMES.UINT8_ARRAY]: Uint8Array;
  [TYPE_NAMES.UINT8_CLAMPED_ARRAY]: Uint8ClampedArray;
  [TYPE_NAMES.INT16_ARRAY]: Int16Array;
  [TYPE_NAMES.UINT16_ARRAY]: Uint16Array;
  [TYPE_NAMES.INT32_ARRAY]: Int32Array;
  [TYPE_NAMES.UINT32_ARRAY]: Uint32Array;
  [TYPE_NAMES.FLOAT32_ARRAY]: Float32Array;
  [TYPE_NAMES.FLOAT64_ARRAY]: Float64Array;
  [TYPE_NAMES.BIG_INT64_ARRAY]: BigInt64Array;
  [TYPE_NAMES.BIG_UINT64_ARRAY]: BigUint64Array;

  [TYPE_NAMES.ARRAY_BUFFER]: ArrayBuffer;
  [TYPE_NAMES.SHARED_ARRAY_BUFFER]: SharedArrayBuffer;
  [TYPE_NAMES.DATA_VIEW]: DataView;

  // 其他未明确映射的默认返回 unknown
  [key: string]: unknown;
};

/**
 * ============================================================================
 * 3. 核心检测函数
 * ============================================================================
 */

/**
 * 获取任意值的精确原生类型字符串
 * @example
 * getType([]) // "Array"
 * getType(null) // "Null"
 */
export function getType(target: unknown): TypeName {
  return Object.prototype.toString.call(target).slice(8, -1) as TypeName;
}

/**
 * 类型守卫：判断目标是否属于指定类型
 *
 * @param target - 待检测的目标
 * @param typeName - 使用 TYPE_NAMES 中的常量，如 TYPE_NAMES.ARRAY
 * @returns boolean，且在 true 分支中自动缩小 target 的类型
 *
 * @example
 * if (isType(val, TYPE_NAMES.ARRAY)) {
 *   val.push(1); // TS 知道 val 是 unknown[]
 * }
 */
export function isType<T extends TypeName>(target: unknown, typeName: T): target is TypeMap[T] {
  return getType(target) === typeName;
}

/**
 * ============================================================================
 * 4. 常用快捷方法 (Syntactic Sugar)
 * ============================================================================
 * 为了方便日常使用，提供一些不需要传参的快捷判断
 */

export const isString = (val: unknown): val is string => getType(val) === TYPE_NAMES.STRING;
export const isNumber = (val: unknown): val is number => getType(val) === TYPE_NAMES.NUMBER;
export const isBoolean = (val: unknown): val is boolean => getType(val) === TYPE_NAMES.BOOLEAN;
export const isNull = (val: unknown): val is null => getType(val) === TYPE_NAMES.NULL;
export const isUndefined = (val: unknown): val is undefined =>
  getType(val) === TYPE_NAMES.UNDEFINED;
export const isSymbol = (val: unknown): val is symbol => getType(val) === TYPE_NAMES.SYMBOL;
export const isBigInt = (val: unknown): val is bigint => getType(val) === TYPE_NAMES.BIGINT;

export const isArray = (val: unknown): val is unknown[] => getType(val) === TYPE_NAMES.ARRAY;
export const isObject = (val: unknown): val is Record<PropertyKey, unknown> =>
  getType(val) === TYPE_NAMES.OBJECT;
export const isFunction = (val: unknown): val is Function => getType(val) === TYPE_NAMES.FUNCTION;

export const isDate = (val: unknown): val is Date => getType(val) === TYPE_NAMES.DATE;
export const isRegExp = (val: unknown): val is RegExp => getType(val) === TYPE_NAMES.REGEXP;
export const isError = (val: unknown): val is Error => getType(val) === TYPE_NAMES.ERROR;

export const isPromise = (val: unknown): val is Promise<unknown> =>
  getType(val) === TYPE_NAMES.PROMISE;
export const isMap = (val: unknown): val is Map<unknown, unknown> =>
  getType(val) === TYPE_NAMES.MAP;
export const isSet = (val: unknown): val is Set<unknown> => getType(val) === TYPE_NAMES.SET;

// 判断是否为空值 (null 或 undefined)
export const isNil = (val: unknown): val is null | undefined => val === null || val === undefined;

// 判断是否为空对象或空数组
export const isEmpty = (val: unknown): boolean => {
  if (isNil(val)) return true;
  if (isArray(val) || isString(val)) return val.length === 0;
  if (isObject(val)) return Object.keys(val).length === 0;
  if (isMap(val) || isSet(val)) return val.size === 0;
  return false;
};
```

### 8.1 设计亮点

- **类型常量 `as const`**：确保每个类型名称都是字面量类型，避免宽泛的 `string`，便于 TypeScript 进行精确类型推断。
- **类型映射 `TypeMap`**：将字符串类型名称映射为实际的 TypeScript 类型，用于 `isType` 守卫，让类型自动缩小。
- **类型守卫 `isType`**：通过泛型参数和返回类型 `target is TypeMap[T]`，实现精确的类型保护。
- **快捷方法**：提供常用的 `isArray`、`isObject` 等，减少重复代码，提升可读性。
- **空值处理**：`isNil` 和 `isEmpty` 覆盖了常见场景，避免重复判断。

### 8.2 使用示例

```typescript
import { isType, TYPE_NAMES, isArray, isEmpty } from './type-guards';

function process(data: unknown) {
  if (isType(data, TYPE_NAMES.ARRAY)) {
    // data 被推断为 unknown[]
    data.push(1);
  }

  if (isArray(data)) {
    // 同样推断为 unknown[]
    console.log(data.length);
  }

  if (isEmpty(data)) {
    // 处理空值、空数组、空对象、空 Set/Map
    console.log('数据为空');
  }
}
```

这套工具函数可以直接用于项目，提供可靠且类型安全的类型检测能力。
