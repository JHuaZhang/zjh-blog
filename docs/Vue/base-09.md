---
group:
  title: 【01】vue基础篇
  order: 1
title: vue指令v-bind属性绑定
order: 9
nav:
  title: Vue
  order: 4
---

## 1. v-bind 指令介绍

在 Vue.js 中，`v-bind` 指令用于动态地绑定一个或多个属性，或者一个组件的 prop 到表达式。当我们需要将 HTML 元素的属性值设置为变量（而非固定字符串）时，就可以使用 `v-bind`。

**基本语法**：

```vue
<img v-bind:src="imageSrc">
<!-- 简写形式（最常用） -->
<img :src="imageSrc">
```

**子组件中获取父组件传递的属性**：

```javascript
// 方式一：通过 $props 访问
created() {
  console.log(this.$props);
}

// 方式二：声明 props 后直接使用
export default {
  props: ['test'],
  created() {
    console.log(this.test);
  }
};
```

---

## 2. 基础用法

### 2.1 绑定单个属性

通过 `v-bind:属性名="表达式"` 或简写 `:属性名="表达式"` 实现动态绑定：

```vue
<img :src="imageUrl" alt="动态图片">
<a :href="linkUrl">动态链接</a>
```

当绑定的数据变化时，属性值会自动更新。

**示例**：

```vue
<template>
  <div>
    <a :href="page" target="_blank">跳转到页面</a>
    <button @click="changePage">点击切换地址为淘宝</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      page: 'https://www.baidu.com'
    };
  },
  methods: {
    changePage() {
      this.page = 'https://www.taobao.com';
    }
  }
};
</script>
```

### 2.2 绑定布尔属性

适用于 `disabled`、`checked`、`readonly` 等布尔属性，Vue 会根据表达式的真值自动添加或移除属性：

```vue
<button :disabled="isDisabled">提交</button>
```

当 `isDisabled` 为 `true` 时，按钮禁用（`disabled` 属性存在）；为 `false` 时，按钮正常（属性被移除）。

### 2.3 样式绑定方式

#### 2.3.1 绑定 class 的对象语法

```vue
<div :class="{ active: isActive, 'text-danger': hasError }"></div>
```

- `active` 这个 class 是否存在取决于 `isActive` 的值。
- `text-danger` 是否存在取决于 `hasError` 的值。

**示例**：

```vue
<template>
  <div>
    <div :class="{ active: isActive, 'text-danger': hasError }">样式测试</div>
    <button @click="changeColor">点击切换样式</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isActive: false,
      hasError: false
    };
  },
  methods: {
    changeColor() {
      this.isActive = !this.isActive;
      this.hasError = !this.hasError;
    }
  }
};
</script>

<style>
.active {
  background-color: yellow;
}
.text-danger {
  color: red;
}
</style>
```

#### 2.3.2 绑定 class 的数组语法

```vue
<div :class="[activeClass, errorClass]"></div>
```

其中 `activeClass` 和 `errorClass` 是数据变量，它们的值将作为 class 名。

**示例**：

```vue
<template>
  <div :class="[activeClass, errorClass]">样式测试</div>
</template>

<script>
export default {
  data() {
    return {
      activeClass: 'active',
      errorClass: 'text-danger'
    };
  }
};
</script>

<style>
.active {
  background-color: yellow;
}
.text-danger {
  color: red;
}
</style>
```

#### 2.3.3 绑定 style 的对象语法

```vue
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
```

- 属性名可以使用驼峰式（`fontSize`）或短横线分隔（`'font-size'`，需加引号）。
- **推荐使用驼峰命名**，因为这是 JavaScript 对象属性的标准写法。Vue 会在渲染时自动将驼峰属性转换为正确的 CSS 属性名。

**示例**：

```vue
<template>
  <div :style="{ color: activeColor, fontSize: fontSize + 'px' }">样式测试</div>
</template>

<script>
export default {
  data() {
    return {
      activeColor: 'blue',
      fontSize: 30
    };
  }
};
</script>
```

#### 2.3.4 绑定 style 的数组语法

可以将多个样式对象应用到同一个元素上：

```vue
<div :style="[baseStyles, overridingStyles]"></div>
```

**示例**：

```vue
<template>
  <div :style="[baseStyles, overridingStyles]">样式测试</div>
</template>

<script>
export default {
  data() {
    return {
      baseStyles: {
        width: '200px',
        height: '200px',
        backgroundColor: 'lightgray'
      },
      overridingStyles: {
        backgroundColor: 'orange',
        border: '5px solid black'
      }
    };
  }
};
</script>
```

后面对象中的相同属性会覆盖前面对象中的属性（如上例中 `backgroundColor` 最终为 `orange`）。

---

## 3. 高级特性

### 3.1 动态属性名（Vue 3 支持）

Vue 3 允许使用动态属性名，语法为 `:[dynamicKey]="value"`：

```vue
<button :[dynamicKey]="value">测试</button>
```

其中 `dynamicKey` 是动态计算的属性名，`value` 是相应的值。

**示例**：

```vue
<template>
  <button :[dynamicKey]="value">测试</button>
</template>

<script>
export default {
  data() {
    return {
      dynamicKey: 'id',
      value: 'dynamic-button'
    };
  }
};
</script>
```

渲染结果为 `<button id="dynamic-button">测试</button>`。

### 3.2 `<style>` 中的动态绑定（Vue 3 新增）

在单文件组件的 `<style>` 块中，可以直接使用 `v-bind` 绑定组件状态，实现 CSS 变量动态化：

```vue
<template>
  <div class="text">使用 v-bind 绑定样式属性</div>
</template>

<script>
export default {
  data() {
    return {
      theme: {
        color: 'red'
      }
    };
  }
};
</script>

<style scoped>
.text {
  color: v-bind('theme.color');
}
</style>
```

当 `theme.color` 的值变化时，CSS 变量的值也会自动更新。

### 3.3 多根节点下的属性透传（Vue 3）

Vue 3 支持多根组件（Fragment）。如果组件有多个根节点，父组件传递的属性（非 `props`）不会自动透传，需要显式绑定到某个元素上。

```vue
<!-- 子组件 -->
<template>
  <header v-bind="$attrs">
    <h1>Header 内容</h1>
  </header>
  <main></main>
</template>
```

**父组件使用**：

```vue
<DemoThree id="header" data-test="header" custom-attr="foo" />
```

最终渲染的 `<header>` 元素会获得这些属性：`<header id="header" data-test="header" custom-attr="foo">`。

**`$attrs` 的作用**：
- 包含父组件传递给子组件的所有**非 `props` 属性**（如 `id`、`data-test`、`custom-attr`）。
- 默认情况下，在单根节点组件中，这些属性会自动绑定到根元素上；但在多根节点组件中，需要手动使用 `v-bind="$attrs"` 指定绑定到哪个元素，以避免歧义。

---

## 4. v-bind 的原理剖析

### 4.1 响应式属性更新的机制

`v-bind` 的本质是将数据模型与 DOM 属性建立响应式连接。当绑定表达式所依赖的响应式数据发生变化时，Vue 会更新对应的 DOM 属性。

**工作流程**：

1. **编译阶段**：Vue 编译器解析模板中的 `v-bind` 指令，生成渲染函数。渲染函数中会包含对数据属性的读取。
2. **依赖收集**：在组件初次渲染时，渲染函数执行，读取绑定表达式中的数据，触发这些数据的 getter。每个数据属性的 `Dep`（依赖管理器）会收集当前的渲染 `Watcher` 作为依赖。
3. **更新阶段**：当数据变化时，setter 触发，通知 `Dep` 中收集的所有 `Watcher`（包括渲染 `Watcher`）重新执行。
4. **DOM 更新**：`Watcher` 触发重新渲染，新的渲染函数会生成新的 VNode，其中包含最新的属性值。Vue 通过 `patch` 过程将新旧 VNode 进行对比，并更新真实 DOM 中对应的属性。

### 4.2 对 class 和 style 的特殊优化

`v-bind` 在处理 `class` 和 `style` 时做了额外优化：
- 支持对象和数组语法，允许动态组合多个 class 或样式。
- Vue 会智能合并 class 和 style，例如将静态的 `class` 属性和动态绑定的 `:class` 合并在一起，不会互相覆盖。
- 对于 `style` 绑定的对象，Vue 会自动添加浏览器前缀（如 `transform` 的 `-webkit-` 前缀），并处理某些属性的单位（如 `fontSize` 自动添加 `px`）。

### 4.3 与 props 的关系

当 `v-bind` 用于子组件时，它会将绑定的值作为 `props` 传递给子组件。原理如下：

- 父组件模板中 `<Child :propName="value">`，编译后生成渲染函数，其中会创建子组件的 VNode，并设置其 `props` 对象。
- 子组件通过 `props` 选项声明接收的属性，Vue 会将传递的值赋值给子组件实例的相应属性，并使其成为响应式的。
- 当父组件中绑定的 `value` 变化时，子组件的对应 `prop` 会自动更新，并触发子组件的重新渲染（如果子组件也使用了该 `prop`）。

---

## 5. 总结

- `v-bind` 是 Vue 中用于动态绑定 HTML 属性、组件 `props` 以及样式/类名的核心指令。
- 简写形式 `:` 是最常用的写法，应优先使用。
- 支持多种语法：单个属性、布尔属性、class 对象/数组、style 对象/数组。
- Vue 3 新增了动态属性名、`<style>` 中 `v-bind` 以及多根节点属性透传等特性。
- 原理基于 Vue 的响应式系统：编译时生成渲染函数，运行时依赖收集，数据变化后触发重新渲染并更新 DOM。
- 合理使用 `v-bind` 可以极大提升代码的动态性和可维护性，是 Vue 开发中不可或缺的工具。
