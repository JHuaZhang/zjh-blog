---
group:
  title: 【01】vue基础篇
  order: 1
title: vue指令v-if与v-show条件渲染
order: 7
nav:
  title: Vue
  order: 4
---

## 1. v-if 指令介绍

`v-if` 是 Vue.js 中用于条件渲染的指令。它根据表达式的真假值来决定是否渲染一个元素或组件。

**基本用法**：

```vue
<div v-if="condition">这个元素会根据 condition 的真假值进行渲染或销毁</div>
```

**特点**：

- **条件渲染**：当条件为真时，元素被渲染到 DOM 中；条件为假时，元素从 DOM 中移除（而不仅仅是隐藏）。
- **响应式**：当条件值发生变化时，Vue 会自动更新 DOM，根据新的条件值渲染或移除元素。
- **与 `v-else` 和 `v-else-if` 配合使用**：可以实现多个条件分支。

```vue
<div v-if="type === 'A'">A</div>
<div v-else-if="type === 'B'">B</div>
<div v-else>C</div>
```

### 1.1 key 属性

Vue 会尽可能高效地渲染元素，通常会复用已有元素而不是从头开始渲染。如果你不希望复用元素，可以使用 `key` 属性来标识元素的唯一性。

```vue
<template v-if="loginType === 'username'">
  <label>Username</label>
  <input placeholder="Enter your username" key="username-input" />
</template>
<template v-else>
  <label>Email</label>
  <input placeholder="Enter your email address" key="email-input" />
</template>
```

在添加 `key` 属性后，每次切换条件时，输入框都会被重新渲染，而不是被复用。Vue 默认会尝试复用相同类型的元素。例如，若两个模板中都包含 `<input>`，Vue 可能直接复用该元素，仅修改其属性（如 `placeholder`），而不会销毁旧元素并重新创建新元素。

若输入框有状态（如 `v-model` 绑定值），切换条件时可能保留旧值，导致数据错乱。完整示例如下：

```vue
<template>
  <div id="app">
    <h1>v-if 加 key 与不加 key 的对比</h1>
    <button @click="toggleLoginType">切换登录方式 (当前: {{ loginType }})</button>
    <div class="demo-container">
      <!-- 不加 key 的示例 -->
      <div class="demo-section">
        <h2>不加 key (Vue 会复用元素，状态保留)</h2>
        <template v-if="loginType === 'username'">
          <label>用户名：</label>
          <input placeholder="请输入用户名" />
          <p class="hint">输入一些文字，然后切换登录方式看看</p>
        </template>
        <template v-else>
          <label>邮箱：</label>
          <input placeholder="请输入邮箱地址" />
          <p class="hint">注意：输入内容被保留了</p>
        </template>
      </div>

      <!-- 加 key 的示例 -->
      <div class="demo-section">
        <h2>加 key (Vue 会创建新元素，状态重置)</h2>
        <template v-if="loginType === 'username'">
          <label>用户名：</label>
          <input placeholder="请输入用户名" key="username-input" />
          <p class="hint">输入一些文字，然后切换登录方式看看</p>
        </template>
        <template v-else>
          <label>邮箱：</label>
          <input placeholder="请输入邮箱地址" key="email-input" />
          <p class="hint">注意：输入内容被重置了</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginType: 'username',
    };
  },
  methods: {
    toggleLoginType() {
      this.loginType = this.loginType === 'username' ? 'email' : 'username';
    },
  },
};
</script>
```

在“不加 key”的输入框中输入一些文字，然后点击按钮切换登录方式，你会发现输入的内容被保留了，只是 `placeholder` 发生了变化。而在添加了 key 的表单中，输入内容会被重置。

### 1.2 性能优化

**① 避免高频切换**

- 问题：`v-if` 通过销毁/重建 DOM 元素实现条件渲染，频繁切换会导致性能损耗。
- 解决方案：对频繁切换的场景（如选项卡、模态框），优先使用 `v-show`（仅切换 CSS `display` 属性）。

```vue
<!-- 高频切换用 v-show -->
<button @click="isVisible = !isVisible">切换</button>
<div v-show="isVisible">高频切换内容</div>

<!-- 低频切换用 v-if -->
<button @click="isLoaded = !isLoaded">加载数据</button>
<div v-if="isLoaded">耗时内容（如 API 数据）</div>
```

**② 减少 DOM 操作**

- `v-if` 的销毁/重建会触发组件生命周期钩子（如 `mounted`/`destroyed`），增加开销。
- 对静态内容使用 `v-once` 避免重复渲染：

```vue
<div v-once>{{ staticContent }}</div>
```

### 1.3 v-else 和 v-else-if 介绍

`v-else` 必须紧跟在带有 `v-if` 或 `v-else-if` 的元素之后。当 `v-if` 或 `v-else-if` 的条件不满足时，`v-else` 对应的元素将会被渲染。

```vue
<div v-if="condition">条件为真时显示</div>
<div v-else>条件为假时显示</div>
```

**特点**：

- 必须紧跟在 `v-if` 或 `v-else-if` 之后，否则不会被识别。
- 不需要表达式，表示之前所有条件都不满足的情况。
- 可以用于多个元素，使用 `<template>` 包裹。

```vue
<template>
  <div>
    <template v-if="condition">
      <div>
        <h1>标题</h1>
        <p>段落1</p>
        <p>段落2</p>
      </div>
    </template>
    <template v-else>
      <div>
        <h1>另一个标题</h1>
        <p>另一个段落</p>
      </div>
    </template>
  </div>
</template>
```

与 `v-else-if` 结合使用：

```vue
<div id="app">
  <p v-if="score >= 90">优秀</p>
  <p v-else-if="score >= 80">良好</p>
  <p v-else-if="score >= 60">及格</p>
  <p v-else>不及格</p>
</div>
```

### 1.4 条件渲染注意事项

**① 避免与 v-for 混用**

- 问题：`v-for` 优先级高于 `v-if`，会导致每次循环都执行条件判断，降低性能。
- 当两者共存时，Vue 会先执行 `v-for` 循环生成所有元素，再通过 `v-if` 过滤掉不符合条件的元素。即使最终只渲染少量元素，仍需为整个列表创建 VNode，造成不必要的计算和内存消耗。
- 优化：通过计算属性预过滤数据。

```vue
<ul>
  <li v-for="item in filteredItems" :key="item.id">{{ item.name }}</li>
</ul>
computed: { filteredItems() { return this.items.filter(item => item.visible); } }
```

**② 明确条件分支**

- 未覆盖所有条件分支可能导致意外渲染。使用 `v-else-if` 和 `v-else` 明确逻辑分支。

```vue
<div v-if="status === 'loading'">加载中...</div>
<div v-else-if="status === 'success'">成功！</div>
<div v-else>错误：{{ errorMessage }}</div>
```

---

## 2. v-show 指令介绍

### 2.1 基本作用

`v-show` 根据表达式的真假值，切换元素的 CSS `display` 属性，从而控制元素的显示与隐藏。

- 表达式为真值：元素显示（`display: block` 或其他合适值）。
- 表达式为假值：元素隐藏（`display: none`）。

**基本语法**：

```vue
<div v-show="expression">这个元素会根据 expression 的真假来显示或隐藏</div>
```

### 2.2 核心特点和工作原理

- **DOM 元素始终存在**：无论初始条件是真还是假，元素都会被完整渲染到 DOM 中。
- **仅通过 CSS 切换**：Vue 动态绑定内联样式 `display`，条件变化时只修改这个样式，不涉及元素的销毁或重建。

**示例代码**：

```vue
<template>
  <div>
    <button @click="isVisible = !isVisible">切换显示</button>
    <p v-show="isVisible">你好！我是由 v-show 控制的段落。</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isVisible: true,
    };
  },
};
</script>
```

初始状态 `isVisible` 为 `true`，`<p>` 样式为 `display: block`；点击后变为 `false`，样式改为 `display: none`，元素隐藏但仍存在于 DOM 中。

---

## 3. v-if 与 v-show 的区别

### 3.1 差异汇总

| 特性           | v-show                                                       | v-if                                                 |
| -------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| 实现机制       | CSS 切换（`display` 属性）                                   | 动态添加/移除 DOM 元素                               |
| 初始渲染成本   | 高，无论条件如何，元素都会被初始渲染                         | 低，只有在条件为真时才会渲染                         |
| 切换成本       | 低，只是切换 CSS，非常高效                                   | 高，涉及组件的销毁和重建，会触发生命周期钩子         |
| 编译与数据绑定 | 元素始终被编译，内部指令（如 `v-model`）会一直绑定           | 条件为假时，元素及其内部指令不会被编译/绑定          |
| 适用场景       | 需要非常频繁切换显示状态的元素（如标签页、折叠面板、工具栏） | 条件在运行时很少改变，或者需要惰性渲染以提升初始性能 |

### 3.2 使用场景建议

**优先使用 `v-show`**：

- 频繁切换（如按钮控制提示框、折叠面板）。
- 初始隐藏成本可接受（页面加载时即渲染隐藏元素）。

**优先使用 `v-if`**：

- 条件很少改变（如权限控制）。
- 需要惰性渲染（条件为假时完全不渲染，减轻初始负载）。
- 与 `v-else` / `v-else-if` 搭配使用（`v-show` 不支持这些）。
- 需要组件完全重载（条件变化时重新触发生命周期）。

**注意事项**：

- `v-show` 不能用在 `<template>` 标签上，因为它需要作用在真实 DOM 元素上切换样式。
- 当 `v-show` 和 `v-for` 用于同一元素时，`v-for` 优先级更高，会导致每个列表项都应用 `v-show` 判断，通常应使用计算属性过滤数据。

---

## 4. 原理剖析

### 4.1 v-if 的实现原理

`v-if` 在 Vue 的编译和渲染过程中，会生成一个**条件分支**的渲染函数。

1. **编译阶段**：Vue 模板编译器遇到 `v-if` 时，会将其转换为一个三元表达式或条件判断逻辑。对于 `v-if` / `v-else-if` / `v-else` 结构，会生成一个**条件渲染函数**，该函数根据条件值返回不同的虚拟节点（VNode）。
2. **渲染阶段**：在组件初次渲染或数据变化触发更新时，渲染函数会被执行。Vue 根据当前条件表达式的值，决定创建哪个分支的 VNode。
   - 如果条件为真，则创建对应元素的 VNode，并挂载到真实 DOM。
   - 如果条件为假，则返回一个空的注释节点（`<!-- -->`），之前存在的真实 DOM 会被销毁。
3. **更新阶段**：当条件值变化时，Vue 会重新执行渲染函数，对比新旧 VNode 树。
   - 旧 VNode 对应的真实 DOM 会被移除（触发 `beforeDestroy`/`destroyed` 钩子）。
   - 新 VNode 被创建并挂载到 DOM（触发 `beforeCreate`/`created`/`mounted` 等钩子）。
4. **关键点**：`v-if` 是**真正的条件渲染**，因为它能确保在条件为假时，事件监听器和子组件完全被销毁，从而节省内存并避免不必要的绑定。

### 4.2 v-show 的实现原理

`v-show` 的实现相对简单，不涉及 DOM 的销毁与重建。

1. **编译阶段**：Vue 编译器识别 `v-show` 指令，并将其转换为一个**样式绑定**。本质上等同于：
   ```vue
   <div :style="{ display: condition ? '' : 'none' }"></div>
   ```
2. **渲染阶段**：无论 `v-show` 的条件是真是假，元素都会被渲染成真实的 DOM 节点。Vue 会为该元素添加一个内联样式绑定，初始 `display` 值根据条件设置。
3. **更新阶段**：当条件值发生变化时，Vue 会更新该元素的内联样式，将 `display` 在 `none` 和原始值（通常是空字符串或 `block`/`inline` 等）之间切换。
   - 注意：`v-show` 不触发任何生命周期钩子，因为元素始终存在。
4. **原理优势**：切换成本极低（仅样式修改），适合频繁切换的场景。

### 4.3 底层对比总结

| 维度         | v-if                         | v-show            |
| ------------ | ---------------------------- | ----------------- |
| 编译产物     | 条件分支渲染函数（三元运算） | 样式绑定指令      |
| 是否保留 DOM | 条件为假时 DOM 被移除        | 始终保留 DOM      |
| 生命周期影响 | 有（销毁/重建触发钩子）      | 无                |
| 初始渲染开销 | 仅渲染真分支                 | 渲染所有元素      |
| 切换开销     | 高（DOM 操作 + 生命周期）    | 低（仅 CSS 修改） |

### 4.4 相关源码位置（Vue 2）

- `v-if` 处理逻辑：`src/compiler/parser/index.js` 中解析 `v-if` 指令，生成 `ifConditions` 数组；`src/core/vdom/render.js` 中的 `render` 函数调用 `resolveSlots` 等。
- `v-show` 处理逻辑：`src/platforms/web/runtime/directives/show.js`，该指令定义了 `bind`、`update` 等钩子，通过 `el.style.display` 控制显示隐藏。

理解这些原理有助于在复杂的应用中做出合理的性能决策，避免不必要的重绘和组件重建开销。

---

## 5. 总结

- `v-if` 是“真实”的条件渲染，适合条件变化少、需要惰性渲染的场景，但切换成本高。
- `v-show` 是“视觉”上的切换，适合频繁切换的场景，但初始渲染成本高。
- 选择依据：切换频率和初始渲染成本。高频切换用 `v-show`，低频或惰性渲染用 `v-if`。
- 注意与 `v-for` 配合时的优先级问题，避免性能陷阱。
- 通过 `key` 属性可控制元素是否复用，解决状态残留问题。

掌握 `v-if` 和 `v-show` 的区别与原理，是编写高性能 Vue 应用的基础。
