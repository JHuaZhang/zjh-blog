---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 4
title: Object.defineProperty详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

`Object.defineProperty` 是 JavaScript 中的一个方法，可以在对象上**定义新属性**或**修改现有属性**，并返回对象本身。通过这个方法，可以精确控制属性的行为（是否可枚举、可写、可配置等），是实现响应式系统（如 Vue 2）的核心工具。

**语法**

```javascript
Object.defineProperty(obj, prop, descriptor);
```

**参数**

- `obj`：要在其上定义属性的对象。
- `prop`：要定义或修改的属性名（字符串或 `Symbol`）。
- `descriptor`：属性描述符对象，用于配置属性的行为。

**返回值**：修改后的对象。

**基础使用示例**

```javascript
// 定义一个普通对象
const person = {};

// 添加 name 属性，设置为可写、可枚举、可配置
Object.defineProperty(person, 'name', {
  value: '张三',
  writable: true,
  enumerable: true,
  configurable: true,
});
console.log(person.name); // '张三'

// 添加 age 属性，设置为只读、不可枚举
Object.defineProperty(person, 'age', {
  value: 25,
  writable: false, // 不可修改
  enumerable: false, // 遍历时隐藏
});
person.age = 30; // 无效
console.log(person.age); // 25
for (let key in person) console.log(key); // 仅输出 'name'
```

---

## 2. 属性描述符

属性描述符分为两类：**数据描述符**和**存取描述符**。两者不能混用（即不能同时设置 `value`/`writable` 和 `get`/`set`）。

### 2.1 数据描述符

- **`value`**：属性的值，默认为 `undefined`。
- **`writable`**：布尔值，确定属性是否可以被赋值运算符（`=`）改变。默认为 `false`。
- **`enumerable`**：布尔值，确定属性是否可枚举（即是否出现在 `for...in` 或 `Object.keys` 中）。默认为 `false`。
- **`configurable`**：布尔值，确定是否可删除属性，以及是否可更改属性类型或修改非 `value` 的描述符。默认为 `false`。

### 2.2 存取描述符

- **`get`**：读取属性时调用的函数，返回值作为属性值。默认为 `undefined`。
- **`set`**：写入属性时调用的函数，接收一个参数（新值）。默认为 `undefined`。
- **`enumerable`**、**`configurable`**：同上。

**注意**：如果同时使用数据描述符和存取描述符（例如同时指定 `value` 和 `get`），会抛出错误。

---

## 3. 基本用法示例

### 3.1 定义新属性或修改属性

```javascript
const obj = { name: '张三' };

// 添加 age 属性
Object.defineProperty(obj, 'age', {
  value: 18,
  writable: true,
  enumerable: true,
  configurable: true,
});
console.log(obj); // { name: '张三', age: 18 }

// 修改 age 的值
Object.defineProperty(obj, 'age', {
  value: 20,
});
console.log(obj); // { name: '张三', age: 20 }
```

### 3.2 `writable` 属性

控制属性是否可以被赋值运算符修改。

```javascript
const obj = { name: '张三', age: 18 };
Object.defineProperty(obj, 'sex', {
  value: '男',
  writable: false, // 不可写
  enumerable: true,
  configurable: true,
});

obj.sex = '女'; // 静默失败（非严格模式）
console.log(obj.sex); // '男'

// 但依然可以通过 defineProperty 修改
Object.defineProperty(obj, 'sex', { value: '女' });
console.log(obj.sex); // '女'
```

### 3.3 `enumerable` 属性

控制属性是否出现在枚举中。

```javascript
const obj = { name: '张三', age: 18 };
Object.defineProperty(obj, 'sex', {
  value: '男',
  enumerable: false, // 不可枚举
});

console.log(obj); // { name: '张三', age: 18 }（sex 不显示）
for (let key in obj) {
  console.log(key); // 'name', 'age'（没有 'sex'）
}

// 原型链上的属性示例
Object.prototype.demo = 'demo';
for (let key in obj) {
  console.log(key); // 'name', 'age', 'demo'
}
// 内置属性（如 constructor）不可枚举，因为它们的 enumerable 为 false
```

### 3.4 `configurable` 属性

控制属性是否可删除，以及是否可修改描述符（除 `writable` 从 `true` 改为 `false` 外，其他修改通常受限）。

```javascript
const obj = { name: '张三', age: 18 };
Object.defineProperty(obj, 'sex', {
  value: '男',
  writable: true,
  enumerable: true,
  configurable: false, // 不可配置
});

delete obj.sex; // 无效
console.log(obj.sex); // '男'

// 尝试重新定义属性（会报错，因为 configurable: false）
// Object.defineProperty(obj, 'sex', { value: '女' }); // TypeError
```

### 3.5 存取描述符（getter/setter）

使用 `get` 和 `set` 可以定义计算属性，并执行额外逻辑。

```javascript
let value = 0;
const obj = {};

Object.defineProperty(obj, 'property', {
  get() {
    console.log('getter 被调用');
    return value;
  },
  set(newValue) {
    console.log('setter 被调用，新值：', newValue);
    value = newValue;
  },
  enumerable: true,
  configurable: true,
});

obj.property = 5; // setter 被调用，新值：5
console.log(obj.property); // getter 被调用，输出 5
```

**注意**：使用存取描述符时不能同时有 `value` 或 `writable`。

---

## 4. 实际应用场景

### 4.1 数据劫持与响应式系统（Vue 2 原理详解）

Vue 2 的核心响应式系统基于 `Object.defineProperty`。下面通过一个完整的模拟实现，详细解释其原理。

#### 4.1.1 核心概念

- **数据劫持**：将普通对象的属性转换为 `getter/setter`，在属性被访问或修改时执行额外逻辑。
- **依赖收集**：当 `getter` 被调用时，记录当前正在执行的“观察者”（Watcher），建立属性与观察者的映射关系。
- **派发更新**：当 `setter` 被调用时，通知所有依赖于该属性的观察者，触发更新。

#### 4.1.2 简化版 Vue 响应式系统实现

```javascript
// 1. 依赖管理器（Dep）
class Dep {
  constructor() {
    this.subscribers = new Set(); // 存储所有依赖该属性的 Watcher
  }

  // 添加依赖：将当前活跃的 Watcher 加入集合
  depend() {
    if (Dep.target) {
      this.subscribers.add(Dep.target);
    }
  }

  // 通知所有 Watcher 更新
  notify() {
    this.subscribers.forEach((watcher) => watcher.update());
  }
}
// 全局变量，指向当前正在执行的 Watcher
Dep.target = null;

// 2. 观察者（Watcher）
class Watcher {
  constructor(vm, key, callback) {
    this.vm = vm; // Vue 实例
    this.key = key; // 监听的属性名
    this.callback = callback; // 属性变化时执行的回调
    this.value = this.get(); // 立即获取当前值，并触发依赖收集
  }

  // 获取当前属性值，同时建立依赖关系
  get() {
    Dep.target = this; // 将当前 Watcher 设置为全局目标
    const value = this.vm[this.key]; // 访问属性，触发 getter
    Dep.target = null; // 恢复
    return value;
  }

  // 当依赖的属性变化时调用
  update() {
    const oldValue = this.value;
    const newValue = this.get();
    if (oldValue !== newValue) {
      this.callback(newValue, oldValue);
    }
  }
}

// 3. 将普通对象转换为响应式对象
function observe(data) {
  if (typeof data !== 'object' || data === null) return data;
  Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
}

// 4. 定义响应式属性
function defineReactive(obj, key, val) {
  // 递归处理嵌套对象
  observe(val);
  const dep = new Dep();

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      dep.depend(); // 依赖收集
      return val;
    },
    set(newVal) {
      if (val === newVal) return;
      val = newVal;
      observe(val); // 新值如果是对象，继续劫持
      dep.notify(); // 派发更新
    },
  });
}

// 5. 简易 Vue 构造函数
class Vue {
  constructor(options) {
    this._data = options.data();
    // 将 _data 上的属性代理到实例本身
    Object.keys(this._data).forEach((key) => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get: () => this._data[key],
        set: (newVal) => {
          this._data[key] = newVal;
        },
      });
    });
    // 使数据响应式
    observe(this._data);
    // 执行挂载等...（省略模板编译）
    if (options.mounted) options.mounted.call(this);
  }
}

// 6. 使用示例
const app = new Vue({
  data() {
    return {
      message: 'Hello Vue!',
      count: 0,
    };
  },
  mounted() {
    // 创建 Watcher 监听 message 变化
    new Watcher(this, 'message', (newVal, oldVal) => {
      console.log(`message 变了：${oldVal} -> ${newVal}`);
      // 模拟更新 DOM
      document.getElementById('app').innerText = newVal;
    });
    new Watcher(this, 'count', (newVal, oldVal) => {
      console.log(`count 变了：${oldVal} -> ${newVal}`);
    });
  },
});

// 测试
setTimeout(() => {
  app.message = 'Hello World!'; // 触发 setter，通知 Watcher
  app.count = 10;
}, 1000);
```

#### 4.1.3 原理说明

1. **`observe` 函数**：递归遍历对象属性，为每个属性调用 `defineReactive`。
2. **`defineReactive`**：使用 `Object.defineProperty` 重新定义属性。在 `get` 中调用 `dep.depend()` 收集当前活跃的 `Watcher`；在 `set` 中调用 `dep.notify()` 触发更新。
3. **`Dep` 类**：每个响应式属性对应一个 `Dep` 实例，用于存储依赖该属性的所有 `Watcher`。`depend` 将当前 `Watcher` 加入集合，`notify` 遍历集合调用每个 `Watcher` 的 `update` 方法。
4. **`Watcher` 类**：代表一个观察者，在实例化时会主动访问一次属性值，从而触发 `get`，将自身添加到对应属性的 `Dep` 中。当属性值变化时，`Watcher` 的 `update` 被调用，执行回调（如重新渲染组件）。
5. **全局 `Dep.target`**：确保在正确的时间将当前 `Watcher` 添加到依赖集合中，避免了不必要的依赖收集。

这个简化模型揭示了 Vue 2 响应式系统的核心：**数据劫持 + 发布-订阅模式**。实际 Vue 源码中还处理了数组变异、计算属性、组件更新队列等复杂情况，但基本原理一致。

### 4.2 创建只读属性

通过设置 `writable: false` 和 `configurable: false` 可以创建不可修改、不可删除的常量属性。

```javascript
const obj = {};
Object.defineProperty(obj, 'PI', {
  value: 3.14159,
  writable: false,
  configurable: false,
});
obj.PI = 3.14; // 无效
delete obj.PI; // 无效
```

### 4.3 隐藏内部实现细节

利用不可枚举属性隐藏辅助方法或内部状态，避免被外部遍历。

```javascript
function createCounter(initial = 0) {
  let count = initial;
  const obj = {};
  Object.defineProperty(obj, 'value', {
    get() {
      return count;
    },
    enumerable: false, // 外部 for...in 看不到
  });
  obj.increment = () => count++;
  obj.decrement = () => count--;
  return obj;
}
const counter = createCounter(5);
console.log(counter.value); // 5
for (let k in counter) console.log(k); // 'increment', 'decrement'（没有 'value'）
```

### 4.4 数据验证与日志

在 setter 中加入验证或日志逻辑。

```javascript
const user = {};
Object.defineProperty(user, 'age', {
  set(age) {
    if (age < 0 || age > 150) throw new Error('Invalid age');
    this._age = age;
  },
  get() {
    return this._age;
  },
});
user.age = 25; // 正常
// user.age = -5; // 抛出错误
```

---

## 5. 与 Vue 3 的 Proxy 对比

| 特性              | `Object.defineProperty` (Vue 2)                  | `Proxy` (Vue 3)                      |
| ----------------- | ------------------------------------------------ | ------------------------------------ |
| **拦截粒度**      | 只能针对**单个属性**，需要递归遍历对象           | 可以代理**整个对象**，无需递归       |
| **数组监听**      | 无法直接监听索引赋值和 `length` 变化，需特殊处理 | 可以完美监听数组变化                 |
| **新增/删除属性** | 无法检测，需要 `Vue.set` / `Vue.delete`          | 可以检测到属性的添加和删除           |
| **性能**          | 初始化时需要递归遍历所有属性，开销较大           | 懒代理，只有访问时才拦截，性能更好   |
| **兼容性**        | 支持 IE9+，兼容性好                              | 不支持 IE，现代浏览器和 Node.js 可用 |

**总结**：`Proxy` 解决了 `defineProperty` 的诸多限制，是更现代的响应式方案。但在需要兼容旧环境或处理少量属性时，`defineProperty` 仍然有效。

---

## 6. 注意事项

- 使用 `defineProperty` 定义的属性，如果不指定 `enumerable`、`writable`、`configurable`，默认值均为 `false`。
- 不能在同一属性上同时使用数据描述符（`value`/`writable`）和存取描述符（`get`/`set`）。
- 当 `configurable: false` 时，只能将 `writable` 从 `true` 改为 `false`，不能反向，也不能修改其他描述符。
- 对于数组，`defineProperty` 可以设置索引属性，但无法拦截 `push`、`pop` 等方法，Vue 2 通过重写数组方法实现响应式。

---

## 7. 总结

`Object.defineProperty` 是 JavaScript 中精确控制对象属性的重要方法。它通过属性描述符允许开发者定义属性的读写行为、可枚举性、可配置性等。尽管在 Vue 3 中被 `Proxy` 取代，但它在需要细粒度控制属性、实现数据劫持、创建只读或隐藏属性等场景中仍然非常有用。理解其原理和限制，有助于编写更健壮的代码。
