---
group:
  title: 【03】js数组及数组方法
  order: 3
order: 10
title: 数组深浅拷贝方法
nav:
  title: JavaScript
  order: 2
---

在 JavaScript 中，数组是引用类型。当我们直接将一个数组赋值给另一个变量时，两者指向同一内存地址，导致一个修改会影响另一个。为了解决这个问题，我们需要使用拷贝（浅拷贝或深拷贝）。本文将详细介绍数组的深浅拷贝概念、常见实现方法及其区别。

---

## 1. 直接赋值（引用传递）

**定义和用法**  
直接将数组变量赋值给另一个变量，两个变量指向同一内存地址，属于引用传递，不是拷贝。

**举例学习**

```javascript
const arr = [1, 2, 3, 4, 5];
const arr1 = arr;
arr1[0] = 99;
console.log(arr);  // [99, 2, 3, 4, 5]
console.log(arr1); // [99, 2, 3, 4, 5]
```

**原理**  
JavaScript 中的对象（包括数组）存储在堆内存中，变量保存的是内存地址。直接赋值只是复制了地址，因此两个变量操作同一对象。

**注意事项**  
- 修改 `arr1` 会直接影响 `arr`。
- 这种方式不是拷贝，不推荐用于需要独立数组的场景。

---

## 2. 浅拷贝（第一层独立，深层共享）

浅拷贝创建一个新数组，但只复制原数组的第一层元素。如果元素是基本类型，则复制其值；如果元素是引用类型（对象、数组等），则复制其引用（内存地址），因此新数组和原数组中的引用类型元素指向同一对象。

### 2.1 数组内部不包含引用类型（此时效果等同于深拷贝）

当数组元素都是基本类型时，浅拷贝的结果是每个元素独立，修改新数组不会影响原数组（因为基本类型值直接复制）。

**方法一：`concat()`**

```javascript
const arr = [1, 2, 3, 4, 5];
const arr1 = arr.concat();
arr1[0] = 99;
console.log(arr);  // [1, 2, 3, 4, 5]（不变）
console.log(arr1); // [99, 2, 3, 4, 5]
```

**方法二：`slice()`**

```javascript
const arr = [1, 2, 3, 4, 5];
const arr1 = arr.slice();
arr1[0] = 99;
console.log(arr);  // [1, 2, 3, 4, 5]（不变）
console.log(arr1); // [99, 2, 3, 4, 5]
```

**方法三：扩展运算符 `...`**

```javascript
const arr = [1, 2, 3, 4, 5];
const arr1 = [...arr];
arr1[0] = 99;
console.log(arr);  // [1, 2, 3, 4, 5]（不变）
console.log(arr1); // [99, 2, 3, 4, 5]
```

**方法四：`Array.from()`**

```javascript
const arr = [1, 2, 3, 4, 5];
const arr1 = Array.from(arr);
arr1[0] = 99;
console.log(arr);  // [1, 2, 3, 4, 5]（不变）
console.log(arr1); // [99, 2, 3, 4, 5]
```

### 2.2 数组内部包含引用类型（浅拷贝的局限）

当数组元素包含对象或数组时，上述方法只会复制引用，因此修改新数组中的对象属性会影响原数组。

**示例（`concat()`）**

```javascript
const arr = [1, 2, { name: 'zhangsan' }];
const arr1 = arr.concat();
// 修改基本类型元素（不影响原数组）
arr1[0] = 99;
console.log(arr[0]);  // 1（不变）
// 修改引用类型元素的属性（影响原数组）
arr1[2].name = 'lisi';
console.log(arr[2].name);  // 'lisi'（被修改）
```

**示例（`slice()`、扩展运算符、`Array.from()` 结果相同）**

```javascript
const arr = [1, 2, { name: 'zhangsan' }];
const arr1 = arr.slice();
arr1[2].name = 'lisi';
console.log(arr[2].name); // 'lisi'（原数组也被修改）
```

**注意事项**  
- 浅拷贝只复制第一层，对于多层嵌套结构，内层仍然是共享的。
- 基本类型元素拷贝值，引用类型元素拷贝引用。

**适用场景**  
- 数组元素都是基本类型，或者不需要修改内层对象。
- 性能要求较高，深拷贝开销大时。

---

## 3. 深拷贝（完全独立）

深拷贝递归复制数组中的所有层级，使得新数组与原数组完全独立，任何修改互不影响。

### 3.1 JSON 序列化（`JSON.parse(JSON.stringify(arr))`）

**原理**  
将数组转换为 JSON 字符串，再解析为新的数组。这种方法简单高效，但有局限性。

**举例学习**

```javascript
const arr = [1, 2, { name: 'zhangsan' }];
const arr1 = JSON.parse(JSON.stringify(arr));
arr1[2].name = 'lisi';
console.log(arr[2].name);  // 'zhangsan'（原数组不变）
console.log(arr1[2].name); // 'lisi'
```

**注意事项**  
- 无法复制函数、`undefined`、`Symbol`、`BigInt`、循环引用等。
- 对于 `Date` 对象，会转为字符串；对于 `RegExp`、`Error` 对象，会转为空对象。
- 性能一般，适合大部分普通对象数组。

**适用场景**  
- 数组包含纯数据（JSON 可序列化内容），无函数、循环引用等。

### 3.2 递归实现

**原理**  
手动编写递归函数，判断每个元素是否为对象（或数组），如果是则递归拷贝，否则直接复制值。

**举例学习**

```javascript
function deepClone(obj) {
  // 非对象或 null 直接返回
  if (obj === null || typeof obj !== 'object') return obj;
  // 根据类型创建新容器
  const clone = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
}

const arr = [1, 2, { name: 'zhangsan' }, [3, 4]];
const arr1 = deepClone(arr);
arr1[2].name = 'lisi';
arr1[3][0] = 99;
console.log(arr);  // [1, 2, { name: 'zhangsan' }, [3, 4]]（不变）
console.log(arr1); // [1, 2, { name: 'lisi' }, [99, 4]]
```

**注意事项**  
- 需要处理循环引用（否则栈溢出），可增加 `WeakMap` 缓存。
- 需要处理特殊对象（`Date`、`RegExp`、`Map`、`Set` 等）可扩展。
- 代码量较大，但可控性高。

**适用场景**  
- 需要自定义深拷贝逻辑。
- 处理复杂对象（包含函数、循环引用等）。

### 3.3 使用 `structuredClone`（现代浏览器原生深拷贝）

**定义和用法**  
`structuredClone` 是 JavaScript 内置的全局函数，用于创建对象的深拷贝。它支持大多数内置类型（如对象、数组、Map、Set、Date、RegExp、ArrayBuffer 等），并能正确处理循环引用。

**语法规则**
```javascript
const clone = structuredClone(value);
```

**参数**  
`value` — 要拷贝的值（可以是任何可结构化克隆的类型）。

**返回值**  
返回该值的深拷贝。

**举例学习**

```javascript
const arr = [1, 2, { name: 'zhangsan' }, new Date()];
const arr1 = structuredClone(arr);
arr1[2].name = 'lisi';
console.log(arr[2].name); // 'zhangsan'（原数组不变）
console.log(arr1[2].name); // 'lisi'

// 支持循环引用
const obj = { a: 1 };
obj.self = obj;
const cloned = structuredClone(obj);
console.log(cloned.self === cloned); // true
```

**注意事项**  
- 不能拷贝函数、DOM 节点、某些宿主对象等。
- 现代浏览器（Chrome 98+、Firefox 94+、Safari 15.4+）和 Node.js 17+ 支持，旧环境需 polyfill。
- 性能通常优于 `JSON` 方法，且能处理 `Date`、`Map`、`Set` 等。

**适用场景**  
- 需要深度拷贝且目标环境支持，推荐作为首选深拷贝方案。

### 3.4 使用第三方库（如 Lodash）

**`_.cloneDeep(arr)`**

```javascript
const _ = require('lodash');
const arr = [1, 2, { name: 'zhangsan' }];
const arr1 = _.cloneDeep(arr);
arr1[2].name = 'lisi';
console.log(arr[2].name); // 'zhangsan'
```

**优点**  
- 可靠处理各种边界情况（循环引用、特殊对象）。
- 性能较好。

**缺点**  
- 需要引入库，增加体积。

---

## 4. 方法对比总结

| 方法                     | 是否拷贝嵌套对象 | 性能   | 适用场景                                   |
| ------------------------ | ---------------- | ------ | ------------------------------------------ |
| 直接赋值（`=`）          | ❌（引用）        | 最高   | 不需要独立数组，只需别名                   |
| `concat()` / `slice()` / `...` / `Array.from()` | ❌（浅拷贝）      | 高     | 数组元素为基本类型或不需要修改嵌套对象     |
| `JSON.parse(JSON.stringify())` | ✅（深拷贝）      | 中等   | 纯数据数组（无函数、undefined、循环引用）  |
| 递归实现                 | ✅（深拷贝）      | 低     | 需要自定义拷贝逻辑或处理特殊对象           |
| `structuredClone`        | ✅（深拷贝）      | 中等   | 现代浏览器首选，支持 Date、Map、Set、循环引用 |
| `_.cloneDeep`（Lodash）  | ✅（深拷贝）      | 中等   | 生产环境推荐，处理复杂情况                 |

**推荐**：
- **基本类型数组**：直接使用扩展运算符 `[...arr]` 或 `arr.slice()` 即可达到“深拷贝”效果（因为无嵌套）。
- **包含对象但无函数/循环引用**：优先使用 `structuredClone`（如果环境支持）或 `JSON.parse(JSON.stringify(arr))`。
- **包含函数、循环引用等复杂情况**：使用 `structuredClone`（支持循环引用）或 Lodash 的 `_.cloneDeep`。
- **性能要求极高且只操作第一层**：浅拷贝即可。

---

## 5. 总结

- **直接赋值**：不是拷贝，共享引用。
- **浅拷贝**：复制第一层，内层引用类型共享。方法：`concat()`、`slice()`、扩展运算符、`Array.from()`。
- **深拷贝**：完全独立，递归复制所有层级。方法：`JSON` 序列化、递归、`structuredClone`、Lodash `_.cloneDeep`。

理解深浅拷贝的区别，可以避免因意外共享引用导致的 bug，并根据场景选择合适的拷贝方式。
