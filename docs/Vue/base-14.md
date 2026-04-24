---
group:
  title: 【01】vue基础篇
  order: 1
title: vue实例方法methods
order: 14
nav:
  title: Vue
  order: 4
---

## 1. methods 介绍

在 Vue 中，`methods`（方法）是 Vue 实例的一个选项，用于定义可以在模板中调用的函数。这些方法通常用于处理用户交互、事件处理、或者封装可重用的逻辑。在 Vue 实例中，可以通过 `methods` 选项来定义方法。这些方法可以在模板中通过指令（如 `v-on`）或者在其他方法中通过 `this` 来调用。

**语法规则：**

```vue
<template>
  <div id="app">
    <button v-on:click="greet">Greet</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello Vue!',
    };
  },
  methods: {
    greet: function () {
      alert(this.message);
    },
    test: function () {
      this.greet();
    },
  },
};
</script>
```

- 模板中：通过事件绑定（如 `@click="greet"`）直接调用。
- 在 JavaScript 中：通过 `this.greet()` 在生命周期钩子或其他方法中调用。

---

## 2. 方法中的 this 指向

在 Vue 的 `methods` 中，`this` **自动绑定为 Vue 实例**。这意味着你可以在方法中访问 `data` 中的属性、计算属性、以及其他方法。

> **重要注意**：避免使用箭头函数来定义方法，因为箭头函数会绑定父级作用域的上下文，导致 `this` 不会指向 Vue 实例。

```vue
<template>
  <div>
    <button @click="hello">hello 方法</button>
    <button @click="test">test 方法</button>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    hello() {
      console.log('hello demo2');
      console.log(this);    // 输出 Vue 组件实例
    },
    test: () => {
      console.log(this);    // 输出 undefined（严格模式）或 window
    },
  },
};
</script>
```

**解析**：
- `hello` 是普通函数，Vue 在初始化时会通过 `Function.prototype.bind` 将方法内部的 `this` 显式绑定到组件实例。因此输出的 `this` 是 Vue 组件实例。
- `test` 是箭头函数，箭头函数没有自己的 `this`，其 `this` 继承自**定义时的外层作用域**。在 Vue 中，若箭头函数定义在 `methods` 中，其外层作用域通常是全局对象（浏览器中为 `window`）或模块作用域（严格模式下为 `undefined`），因此上面 `test` 方法最终输出 `undefined`（或 `window`）。

**Vue 中 this 的通用规则：**

| 场景 | this 指向 | 原因 |
| --- | --- | --- |
| `methods` 普通函数 | Vue 实例 | Vue 自动绑定 `this` 到实例 |
| `methods` 箭头函数 | 外层作用域（如 `window`），严格模式下为 `undefined` | 箭头函数无自己的 `this`，继承定义时的上下文 |
| 生命周期钩子 | Vue 实例 | 钩子函数被 Vue 自动绑定 |
| 事件回调/异步操作 | Vue 实例（需正确绑定） | 若使用箭头函数或未绑定，可能导致 `this` 丢失 |

**最佳实践**：始终使用普通函数（`function() {}` 或方法简写 `methodName() {}`）定义 `methods`，避免使用箭头函数。

---

## 3. 方法中的参数传递

### 3.1 模板中直接传递

在模板中通过事件绑定（如 `@click`）调用方法时，可直接在括号内传递参数：

```vue
<button @click="sayHello('Vue')">点击</button>
```

```javascript
methods: {
  sayHello(greeting) {
    console.log(greeting); // 输出 "Vue"
  }
}
```

- 参数需在模板中显式声明，方法定义时需声明同名参数。
- 支持传递基本类型（字符串、数字）和引用类型（对象、数组）。

### 3.2 获取原生事件对象 `$event`

通过 `$event` 可访问原生 DOM 事件对象，常用于阻止默认行为或获取事件属性。

```vue
<template>
  <div>
    <button @click="handleClick('提交', $event)">提交1</button>
    <button @click="handleClick($event, '提交')">提交2</button>
  </div>
</template>

<script>
export default {
  methods: {
    handleClick(message, event) {
      event.preventDefault();         // 阻止默认行为
      console.log(message, event);
    },
  },
};
</script>
```

- 若方法不需要事件对象，可省略 `$event`。
- 注意参数顺序：在模板中传递的参数会按顺序传递给方法，`$event` 可以是任意位置。

### 3.3 多个参数传递

参数按定义顺序匹配，支持任意数量：

```vue
<template>
  <div>
    <button @click="sum(1, 2, 3)">计算</button>
  </div>
</template>

<script>
export default {
  methods: {
    sum(a, b, c) {
      console.log(a + b + c); // 输出 6
    },
  },
};
</script>
```

- 参数数量需与方法定义一致，未传递的参数为 `undefined`。

### 3.4 动态参数传递

通过 `v-bind` 传递动态数据（如变量或计算属性）：

```vue
<template>
  <div>
    <button @click="fetchData(id)">加载数据</button>
  </div>
</template>

<script>
export default {
  data() {
    return { id: 100 };
  },
  methods: {
    fetchData(id) {
      console.log(id); // 输出 100
    },
  },
};
</script>
```

- 动态参数需通过 `v-bind` 或简写 `:` 绑定。

### 3.5 对象参数传递

通过对象传递多个参数，提升代码可读性：

```vue
<template>
  <div>
    <button @click="submitForm({ name: 'Vue', version: 3 })">提交</button>
  </div>
</template>

<script>
export default {
  methods: {
    submitForm(config) {
      console.log(config.name); // 输出 "Vue"
    },
  },
};
</script>
```

- 对象参数需用 `{}` 包裹，方法内通过解构或属性名访问。

---

## 4. 在模板中调用方法

除了事件绑定，也可以在模板中直接调用方法（例如在插值表达式中），但通常更推荐使用**计算属性**，因为计算属性有缓存。

```vue
<template>
  <div>
    <p>{{ reverseMessage() }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello Vue.js!',
    };
  },
  methods: {
    reverseMessage: function () {
      return this.message.split('').reverse().join('');
    },
  },
};
</script>
```

页面上展示的效果为：`!sj.euV olleH`。

> **注意**：每次重新渲染时，该方法都会**重新执行**，而计算属性则基于依赖缓存。因此，对于开销较大的计算，应优先使用计算属性。

---

## 5. 方法与计算属性的区别

| 特性 | methods | computed |
|------|---------|----------|
| 缓存 | 无缓存，每次调用都会重新执行 | 有缓存，基于响应式依赖缓存，依赖不变时不会重新计算 |
| 使用场景 | 事件处理、执行操作、需要参数传递的逻辑 | 基于现有数据派生新数据，无参数或参数固定 |
| 语法 | 方法形式，可以接受参数 | 属性形式，不接受参数 |
| 调用方式 | 模板中 `{{ methodName() }}` 或 `@click="methodName"` | 模板中 `{{ computedName }}`，无需括号 |

**总结**：
- 计算属性适用于需要根据现有数据计算新值的场景，且对性能有要求。
- 方法更适合用于执行操作（如事件处理）或者不需要缓存的计算。

---

## 6. 注意事项（重点）

1. **不要使用箭头函数定义方法**：箭头函数会绑定父级作用域的 `this`，导致 `this` 不再指向 Vue 实例，从而无法访问 `data`、`computed`、其他 `methods` 等。**务必使用普通函数**（`function` 或方法简写）。

2. **方法通常用于响应事件或需要主动调用的逻辑**：而对于基于数据变化的渲染，应优先考虑计算属性。

3. **如果方法用于在模板中渲染数据，且计算开销较大，考虑使用计算属性来利用缓存**，避免不必要的性能损耗。

4. **方法可以相互调用**：在一个方法内部，通过 `this.otherMethodName()` 可以调用其他方法。

5. **避免在模板中调用高开销方法**：因为模板渲染频繁，每次重新渲染都会执行该方法，可能影响性能。可以将结果缓存到 `data` 中，或使用计算属性。

6. **事件处理中的参数传递**：当需要同时传递自定义参数和原生事件对象时，必须使用 `$event` 显式传递，且注意参数顺序。

7. **异步方法中的 `this`**：在 `setTimeout`、`Promise` 等异步回调中，`this` 可能会丢失。此时可以使用箭头函数（因为箭头函数不会改变 `this`）或在外层保存 `this` 变量（`const self = this`）。

   ```javascript
   methods: {
     asyncMethod() {
       setTimeout(() => {
         this.message = 'updated'; // 正确，箭头函数保留了 this
       }, 1000);
     }
   }
   ```

8. **生命周期钩子中调用方法**：可以在 `created`、`mounted` 等生命周期中通过 `this.methodName()` 调用方法，进行初始化操作。

9. **命名规范**：方法名应使用小驼峰（`camelCase`），避免与内置属性或 API 冲突（如不要命名为 `$emit`、`_update` 等）。

---

## 7. 总结

- `methods` 是 Vue 组件中定义可复用逻辑和事件处理的核心选项。
- 普通函数定义的方法中 `this` 指向当前 Vue 实例，箭头函数会导致 `this` 错误，应避免使用。
- 方法支持多种参数传递方式（直接传参、`$event`、动态参数、对象参数）。
- 模板中直接调用方法可用于简单计算，但推荐使用计算属性以获得缓存优势。
- 注意异步回调中的 `this` 保持，以及不要在模板中执行高开销方法。

正确使用 `methods` 可以极大提升代码的组织性和可维护性，是与用户交互的桥梁。
