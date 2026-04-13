---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 17
title: Object.prototype.toString详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

`Object.prototype.toString()` 是 JavaScript 中 `Object` 原型上的一个方法，用于返回对象的字符串表示。几乎所有对象都继承了这个方法（除非被重写）。该方法常用于**类型检测**和调试，因为它能够返回对象内部 `[[Class]]` 属性的值，从而精确识别内置类型。

**语法**

```javascript
obj.toString();
```

- **`obj`**：要转换为字符串的对象实例。

**返回值**：默认情况下，返回格式为 `"[object Type]"` 的字符串，其中 `Type` 是对象的内部 `[[Class]]` 名称（如 `Array`、`Date`、`Null` 等）。

**基本示例**

```javascript
console.log({}.toString()); // "[object Object]"
console.log([].toString()); // ""（数组重写了 toString，返回元素拼接）
```

为了获取准确的 `[object Type]` 信息，通常需要借用 `Object.prototype.toString` 并改变 `this` 指向：

```javascript
const toString = Object.prototype.toString;
console.log(toString.call([])); // "[object Array]"
console.log(toString.call(new Date())); // "[object Date]"
console.log(toString.call(null)); // "[object Null]"
```

---

## 2. 原理

`Object.prototype.toString` 的内部行为由 ECMAScript 规范中的 **`Object.prototype.toString`** 方法定义。执行步骤如下：

1. 获取 `this` 值，记作 `O`。
2. 如果 `O` 是 `undefined`，返回 `"[object Undefined]"`。
3. 如果 `O` 是 `null`，返回 `"[object Null]"`。
4. 将 `O` 转换为一个对象（实际上已经是对象，但规范中仍会处理）。
5. 获取 `O` 的 **`[[Class]]`** 内部属性（在 ES5 中）或通过其他方式确定内置类型（ES6+ 中规范有变化，但效果类似）。这个内部类型值通常对应内置构造器的名称，如 `Array`、`Date`、`RegExp`、`Error` 等。
6. 返回 `"[object " + 类型名称 + "]"` 字符串。

**关键点**：

- 该方法返回的是对象的**内置类型标签**，不是构造函数名（例如对于自定义类的实例，返回 `"[object Object]"`）。
- 由于许多内置类型（如 `Array`、`Function`、`Date`）重写了 `toString`，直接调用 `obj.toString()` 得不到预期结果，必须使用 `Object.prototype.toString.call(obj)`。
- 该方法在 ES5 及以后版本中稳定可靠，是判断内置类型的最准确方法。

---

## 3. 常见用法

### 3.1 精确判断内置类型

`typeof` 和 `instanceof` 在某些场景下无法区分（如 `null`、数组、正则等），而 `Object.prototype.toString` 可以。

```javascript
const type = (value) => Object.prototype.toString.call(value).slice(8, -1);
console.log(type([])); // "Array"
console.log(type(null)); // "Null"
console.log(type(/\d/)); // "RegExp"
console.log(type(new Date())); // "Date"
console.log(type(Promise.resolve())); // "Promise"
```

### 3.2 判断是否为纯对象（Plain Object）

```javascript
function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}
console.log(isPlainObject({})); // true
console.log(isPlainObject([])); // false
console.log(isPlainObject(new Date())); // false
```

### 3.3 区分 `null` 和 `undefined`

```javascript
console.log(Object.prototype.toString.call(null)); // "[object Null]"
console.log(Object.prototype.toString.call(undefined)); // "[object Undefined]"
```

### 3.4 在库或框架中实现可靠的类型检测

很多库（如 Lodash、jQuery）内部使用该方法进行类型判断，避免跨环境问题。

```javascript
function isArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}
```

---

## 4. 自定义 `toString`

许多对象会重写 `toString` 方法以提供更有意义的字符串表示。这常用于调试或输出。

```javascript
const person = {
  name: 'Alice',
  age: 25,
  toString() {
    return `Name: ${this.name}, Age: ${this.age}`;
  },
};
console.log(person.toString()); // "Name: Alice, Age: 25"
```

**注意**：重写会影响 `String(obj)` 转换和模板字符串 `${obj}` 的结果，但不会影响 `Object.prototype.toString.call(obj)` 返回的内置类型标签。

---

## 5. 注意事项

- 直接调用 `obj.toString()` 可能得到不同的结果（若被重写），因此进行类型检测时**必须**使用 `Object.prototype.toString.call(obj)`。
- 返回的字符串中的 `Type` 首字母大写，如 `"Array"`、`"Date"`。
- 对于自定义类的实例，始终返回 `"[object Object]"`，除非自定义类内部重写了 `Symbol.toStringTag`。
- ES6 引入了 `Symbol.toStringTag`，可以自定义 `Object.prototype.toString` 返回的标签：

```javascript
class MyClass {
  get [Symbol.toStringTag]() {
    return 'MyCustomClass';
  }
}
const obj = new MyClass();
console.log(Object.prototype.toString.call(obj)); // "[object MyCustomClass]"
```

- 兼容性：所有现代浏览器和 Node.js 均支持。

---

## 6. 与其他类型检测方法的对比

| 方法                               | 能否区分 `null`               | 能否区分数组与普通对象                | 能否区分 `NaN`                           | 能否区分自定义类                                                |
| ---------------------------------- | ----------------------------- | ------------------------------------- | ---------------------------------------- | --------------------------------------------------------------- |
| `typeof`                           | ❌（`null` 返回 `"object"`）  | ❌（数组也是 `"object"`）             | ❌（返回 `"number"`）                    | ❌（返回 `"object"`）                                           |
| `instanceof`                       | ❌（`null` 会报错或 `false`） | ✅（`[] instanceof Array` 为 `true`） | ❌（`NaN` 是 `Number` 实例）             | ✅（对于自定义类有效）                                          |
| `constructor`                      | ❌（`null`/`undefined` 报错） | ✅（`[].constructor === Array`）      | ❌（`NaN.constructor === Number`）       | ✅（但可能被修改）                                              |
| `Object.prototype.toString.call()` | ✅（`"[object Null]"`）       | ✅（`"[object Array]"`）              | ✅（`"[object Number]"` 但值仍是 `NaN`） | ❌（返回 `"[object Object]"`，除非自定义 `Symbol.toStringTag`） |

**总结**：`Object.prototype.toString` 是判断**内置类型**最准确的方法，但无法区分自定义类型（除非使用 `Symbol.toStringTag`）。对于自定义类型，`instanceof` 更合适。

---

## 7. 总结

- `Object.prototype.toString` 是获取对象内置类型标签的可靠方法，常用于跨平台、跨框架的类型检测。
- 为了避免内置类型重写 `toString` 的干扰，必须通过 `Object.prototype.toString.call(obj)` 调用。
- 该方法可以精确区分 `null`、`undefined`、数组、日期、正则等内置对象。
- 对于自定义类，可以设置 `Symbol.toStringTag` 来定制返回标签。
- 在日常开发中，若仅需基本类型检测，`typeof` 和 `instanceof` 通常足够；但在需要严谨类型识别的场景（如库开发、序列化、跨窗口通信），`Object.prototype.toString` 是首选。
