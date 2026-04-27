---
group:
  title: 【01】vue基础篇
  order: 1
title: vue指令v-on事件绑定
order: 10
nav:
  title: Vue
  order: 4
---

## 1. v-on 指令介绍

Vue 中的 `v-on` 指令是事件绑定的核心工具，用于监听 DOM 事件或组件自定义事件，并执行相应的方法。

**语法规则**：

- 基本语法：`v-on:event="handler"`
- 缩写形式：`@event="handler"`

**示例**：

```vue
<button @click="handleClick">点击</button>
<input @keyup.enter="submitForm" />
```

> **与 React 的区别**：在 Vue 中，`@click` 可以绑定一个方法，也可以直接执行一个函数调用；而 React 的 `onClick` 一般只能绑定函数引用，不能直接写函数调用。

### 1.1 参数传递

- **默认传递事件对象**：若方法无参数，`event` 对象会自动传入。
- **显式传递参数**：若需要传递自定义参数，同时又要保留事件对象，需通过 `$event` 显式传递。

```vue
<template>
  <div id="app">
    <button @click="handleClick">点击</button>
    <button @click="handleClickWithParam('param', $event)">带参数点击</button>
  </div>
</template>

<script>
export default {
  methods: {
    handleClick(e) {
      console.log(e); // 原生事件对象
    },
    handleClickWithParam(param, e) {
      console.log(param, e);
    },
  },
};
</script>
```

---

## 2. 事件修饰符

Vue 提供了事件修饰符来处理 DOM 事件细节。修饰符是由点开头的指令后缀表示，用于指示指令以特殊方式绑定。

### 2.1 `.stop` - 阻止事件冒泡

等价于原生 `event.stopPropagation()`。

```vue
<button @click.stop="doThis"></button>
```

**示例**：

```vue
<template>
  <div>
    <div @click="parentClick" class="parent">
      父元素
      <button @click.stop="childClick">子按钮（阻止冒泡）</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    parentClick() {
      console.log('父元素被点击');
    },
    childClick() {
      console.log('子按钮被点击');
    },
  },
};
</script>
```

当点击子按钮时，父元素的点击事件不会被触发。

### 2.2 `.prevent` - 阻止默认行为

等价于原生 `event.preventDefault()`。

```vue
<form @submit.prevent="onSubmit"></form>
<a href="https://vuejs.org" @click.prevent="handleClick">链接</a>
```

**示例**：阻止表单提交刷新页面。

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="username" placeholder="用户名" />
    <button type="submit">提交（不刷新页面）</button>
  </form>
</template>

<script>
export default {
  data() {
    return { username: '' };
  },
  methods: {
    handleSubmit() {
      console.log('表单提交:', this.username);
    },
  },
};
</script>
```

### 2.3 `.capture` - 事件捕获模式

使用事件捕获模式，即在捕获阶段（从外到内）就触发事件处理函数，而不是默认的冒泡阶段。

**事件流示意图**：

```
window → document → html → body → 父元素 → 目标元素 → 父元素 → body → html → document → window
    |________________________|          |         |___________________________|
            捕获阶段                    目标阶段                冒泡阶段
```

**示例**：

```vue
<template>
  <div @click.capture="parentCapture" class="outer">
    外层
    <button @click="childClick">点击</button>
  </div>
</template>

<script>
export default {
  methods: {
    parentCapture() {
      console.log('外层捕获阶段');
    },
    childClick() {
      console.log('按钮冒泡阶段');
    },
  },
};
</script>
```

点击按钮时输出顺序：先输出"外层捕获阶段"，再输出"按钮冒泡阶段"。

**适用场景**：

- 需要在外层元素优先拦截事件时（如全局点击外部关闭菜单）。
- 事件代理性能优化。
- 需要精确控制事件流顺序时。

### 2.4 `.self` - 仅元素自身触发

仅当事件从绑定元素自身触发时才执行。当事件通过子元素冒泡到父元素时，`.self` 会阻止父元素的事件处理函数执行，但事件仍会继续冒泡到更上层。

```vue
<div @click.self="handleClick">点击自身才触发</div>
```

**与 `.stop` 的区别**：

- `.stop`：强制终止传播链，无论事件来源。
- `.self`：仅条件限制（事件必须是 `event.target === 当前元素`），不阻断传播。

**示例**：

```vue
<template>
  <div @click="log('外层')" class="outer">
    外层
    <div @click.self="log('内层')" class="inner">
      <div @click="log('文本')">点击文本</div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    log(msg) {
      console.log(msg);
    },
  },
};
</script>
```

点击最内层文本时，输出顺序：`内层`（不会触发，因为不是点击 `inner` 自身），然后 `外层`。内层 `.self` 不会触发，事件继续冒泡到外层。

### 2.5 `.once` - 只触发一次

事件处理函数只会被执行一次，之后即使再次触发事件也不会调用。

```vue
<button @click.once="showAlert">仅触发一次</button>
```

**示例**：

```vue
<template>
  <button @click.once="incrementOnce">只增加一次: {{ onceCount }}</button>
</template>

<script>
export default {
  data() {
    return { onceCount: 0 };
  },
  methods: {
    incrementOnce() {
      this.onceCount++;
    },
  },
};
</script>
```

> **注意**：当与 `.prevent` 等修饰符同时使用时，`.once` 会使 `.prevent` 也只生效一次。若需要永久阻止默认行为，应将 `.once` 应用于事件处理函数内部逻辑而非修饰符。

### 2.6 `.passive` - 不阻止默认行为（性能优化）

告诉浏览器事件处理函数不会调用 `preventDefault()`，浏览器可以立即执行默认行为（如滚动、触摸移动），无需等待事件处理函数完成，从而提升流畅度。常用于滚动、触摸等高频事件。

```vue
<div @scroll.passive="handleScroll">...</div>
<div @touchmove.passive="onTouchMove">...</div>
```

**原理**：原生 `addEventListener` 的 `passive: true` 选项，避免浏览器因检查 `preventDefault` 而阻塞主线程。

```vue
<template>
  <div @scroll.passive="handleScroll" class="scroll-area">
    <!-- 大量内容 -->
  </div>
</template>
```

---

## 3. 键盘与系统修饰符

### 3.1 按键修饰符

Vue 允许在 `v-on` 监听键盘事件时添加按键修饰符，指定只有在特定按键触发时才调用处理函数。

**常用按键别名**：

| 别名      | 对应按键           |
| --------- | ------------------ |
| `.enter`  | Enter              |
| `.tab`    | Tab                |
| `.delete` | Delete / Backspace |
| `.esc`    | Esc                |
| `.space`  | Space              |
| `.up`     | 上箭头             |
| `.down`   | 下箭头             |
| `.left`   | 左箭头             |
| `.right`  | 右箭头             |

**使用方法**：

```vue
<input @keyup.enter="submit" />
```

### 3.2 系统修饰键

用于监听与 `Ctrl`、`Alt`、`Shift`、`Meta`（Windows 键 / Command）组合的按键或鼠标事件。

```vue
<!-- Alt + C -->
<input @keyup.alt.67="clear" />
```

### 3.3 `.exact` - 精确控制

只有精确按下的系统修饰键才触发事件，没有额外修饰键。

```vue
<!-- 即使 Alt 或 Shift 也被按下，依然触发 -->
<button @click.ctrl="onClick">A</button>

<!-- 有且只有 Ctrl 被按下的时候才触发 -->
<button @click.ctrl.exact="onCtrlClick">B</button>

<!-- 没有任何系统修饰符被按下的时候才触发 -->
<button @click.exact="onClick">C</button>
```

### 3.4 鼠标按钮修饰符

- `.left` (左键)
- `.right` (右键)
- `.middle` (中键)

```vue
<button @click.right="openContextMenu">右键菜单</button>
```

### 3.5 自定义按键修饰符（Vue 2 / Vue 3）

**Vue 2**：通过 `Vue.config.keyCodes` 自定义。

```javascript
Vue.config.keyCodes.f1 = 112;
```

**Vue 3**：不再支持 `keyCode`，推荐使用按键的 kebab-case 名称作为修饰符。

```vue
<input @keyup.page-down="nextPage" />
<input @keyup.kebab="handleKebab" />
<input @keypress.q="quit" />
<!-- 匹配 'q' 或 'Q' -->
```

---

## 4. 动态事件与对象语法

### 4.1 动态事件名

使用方括号绑定动态事件名。

```vue
<button @[eventName]="handler">动态事件</button>
```

```javascript
data() {
  return { eventName: 'click' };
}
```

### 4.2 对象语法

同时绑定多个事件。

```vue
<div v-on="{ click: handleClick, mouseover: handleHover }"></div>
```

---

## 5. 组件事件绑定

### 5.1 原生事件监听（Vue 2 需要 `.native`，Vue 3 默认支持）

在 Vue 2 中，直接监听组件根元素的原生事件需使用 `.native` 修饰符。

```vue
<!-- Vue 2 -->
<my-component @click.native="handleClick"></my-component>
```

Vue 3 中，`v-on` 在组件上默认监听原生事件，除非子组件内显式使用 `$emit` 同名事件。

### 5.2 自定义事件（子组件向父组件通信）

子组件通过 `$emit` 触发自定义事件，父组件通过 `v-on` 监听。

**子组件**：

```vue
<button @click="$emit('custom-event', payload)">触发事件</button>
```

**父组件**：

```vue
<my-component @custom-event="handleCustom"></my-component>
```

---

## 6. v-on 的原理剖析

### 6.1 编译阶段

Vue 编译器在解析模板时，遇到 `v-on` 指令（或 `@` 简写）会将其转换为事件绑定代码。对于 DOM 原生事件，会在生成渲染函数时创建事件监听器；对于自定义事件，会创建组件事件监听器。

### 6.2 事件监听器的添加

- **原生事件**：在将虚拟 DOM 挂载为真实 DOM 时，通过 `addEventListener` 添加事件监听。Vue 内部使用 `createEventListener` 辅助函数处理，并支持修饰符（如 `.stop`、`.prevent` 等）的逻辑封装。
- **自定义事件**：Vue 在子组件实例上维护一个事件中心，父组件通过 `$on` 监听子组件 `$emit` 触发的事件。

### 6.3 修饰符的实现原理

修饰符本质上是对原生事件对象的包装。例如：

- `.stop`：在执行用户处理函数前，调用 `event.stopPropagation()`。
- `.prevent`：调用 `event.preventDefault()`。
- `.capture`：在 `addEventListener` 时设置 `useCapture = true`。
- `.once`：使用一个包装函数，执行一次后自动移除监听。
- `.passive`：设置 `addEventListener` 的 `passive` 选项为 `true`。

Vue 内部会解析修饰符字符串，生成相应的事件监听配置对象。

### 6.4 与响应式系统的关系

事件处理函数中访问的响应式数据（如 `this.count`）会被依赖收集。当处理函数执行时，如果修改了数据，会触发视图更新。Vue 确保在事件处理函数中同步修改数据后，`nextTick` 中更新 DOM，避免频繁的 DOM 操作。

---

## 7. 总结

- `v-on` 是 Vue 事件绑定的核心指令，简写为 `@`，支持原生 DOM 事件和组件自定义事件。
- 事件修饰符（`.stop`、`.prevent`、`.capture`、`.self`、`.once`、`.passive`）提供了精细的事件控制能力。
- 键盘修饰符和系统修饰符方便处理组合键、精确按键等场景。
- 动态事件名和对象语法使事件绑定更加灵活。
- 组件事件绑定是父子组件通信的重要方式，`$emit` + `v-on` 实现子传父。
- 原理层面，`v-on` 在编译阶段转换为事件绑定代码，通过原生 `addEventListener` 或自定义事件中心实现，修饰符通过对事件对象的包装实现。

合理使用 `v-on` 及其修饰符可以极大提升用户交互体验，并保证代码清晰可维护。
