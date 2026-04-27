---
group:
  title: 【01】vue基础篇
  order: 1
title: vue组件介绍
order: 17
nav:
  title: Vue
  order: 4
---

## 1. 组件介绍

组件是 Vue 中的一个重要概念，是一个可以重复使用的 Vue 实例，它拥有独一无二的组件名称，它可以扩展 HTML 元素，以组件名称的方式作为自定义的 HTML 标签。因为组件是可复用的 Vue 实例，所以它们与 `new Vue()` 接收相同的选项，例如 `data`、`computed`、`watch`、`methods` 以及生命周期钩子等。仅有的例外是像 `el` 这样根实例特有的选项。

把一些公共的模块抽取出来，然后写成单独的工具组件或者页面，在需要的页面中就直接引入即可。例如页面头部、侧边栏、内容区、尾部、上传图片等，多个页面要用到一样的就可以做成组件，提高了代码的复用率。

组件是 Vue.js 最强大的功能之一，组件可以扩展 HTML 元素，封装可重用的代码。组件系统让我们可以用独立可复用的小组件来构建大型应用，几乎任意类型的应用的界面都可以抽象为一个组件树。

---

## 2. 组件的使用

组件的使用分成三个核心步骤：

1. **创建组件构造器**：调用 `Vue.extend()` 方法创建组件构造器（或直接写组件选项对象）。
2. **注册组件**：使用 `Vue.component()` 全局注册，或在组件的 `components` 选项中局部注册。
3. **使用组件**：在 Vue 实例或父组件的模板中，以自定义标签的形式使用。

下面详细讲解这三种方式。

### 2.1 创建组件构造器 `Vue.extend()`

#### 2.1.1 什么是 `Vue.extend()`？

`Vue.extend()` 是一个全局 API，用来创建一个**组件构造器**（也就是 Vue 的子类）。它接收一个选项对象，该对象与 `new Vue()` 的选项几乎相同，唯一的区别是：

- 没有 `el` 选项（因为组件不由自己决定挂载点）。
- `data` 必须是一个函数（为了保证每个组件实例拥有独立的数据副本）。

调用 `Vue.extend()` 返回的是一个**可复用的构造函数**，你可以通过 `new` 关键字创建该构造函数的实例，并且手动挂载到某个 DOM 元素上。不过在实际开发中，我们很少直接调用 `Vue.extend()`，因为 `Vue.component()` 和单文件组件内部已经帮我们做了这一层转换。

#### 2.1.2 语法

```javascript
const MyComponentConstructor = Vue.extend({
  // 选项对象
  template: '<div>Hello {{ msg }}</div>',
  data() {
    return { msg: 'World' };
  },
  methods: {
    sayHi() {
      console.log(this.msg);
    },
  },
});
```

#### 2.1.3 返回值

返回值是一个**Vue 子类的构造函数**，命名为 `VueComponent`。你可以使用 `new` 操作符创建实例，并手动调用 `$mount()` 挂载：

```javascript
const instance = new MyComponentConstructor();
instance.$mount('#app'); // 挂载到已有 DOM
// 或者创建后追加
const instance2 = new MyComponentConstructor().$mount();
document.body.appendChild(instance2.$el);
```

#### 2.1.4 与直接传递对象给 `Vue.component` 的关系

当我们写 `Vue.component('my-comp', { template: '...' })` 时，Vue 内部会自动调用 `Vue.extend()` 将这个对象转换成一个组件构造器。所以绝大多数场景下，我们不需要显式调用 `Vue.extend()`，直接编写组件选项对象即可。

显式使用 `Vue.extend()` 的场景主要有：

- 需要基于某个组件构造器进行扩展（继承）。
- 需要动态挂载组件实例（例如编程式创建弹窗）。
- 在非单文件组件环境下，定义一个基础构造器再重复注册。

#### 2.1.5 基本示例

```vue
<div id="app"></div>
<script src="./Vuejs/vue2-6-12.js"></script>
<script>
// 创建一个组件构造器
const MyComponent = Vue.extend({
  template: `
      <div>
        <h2>{{ title }}</h2>
        <button @click="count++">点击次数：{{ count }}</button>
      </div>
    `,
  data() {
    return {
      title: 'Vue.extend 示例',
      count: 0,
    };
  },
});
// 手动挂载到 #app
new MyComponent().$mount('#app');
</script>
```

#### 2.1.6 使用场景举例：编程式创建 Toast 组件

```javascript
// toast.js
import Vue from 'vue';
import ToastComponent from './Toast.vue';

const ToastConstructor = Vue.extend(ToastComponent);
let toastInstance = null;

function showToast(message, duration = 2000) {
  if (toastInstance) {
    toastInstance.message = message;
    return;
  }
  toastInstance = new ToastConstructor({ data: { message } });
  toastInstance.$mount();
  document.body.appendChild(toastInstance.$el);
  setTimeout(() => {
    toastInstance.$destroy();
    toastInstance.$el.remove();
    toastInstance = null;
  }, duration);
}
```

这种模式在很多 UI 组件库中用于创建动态提示、弹窗等。

#### 2.1.7 关于 `template` 字符串书写规范

在使用 `template` 选项定义多行模板时，**必须使用反引号（模板字符串）**，因为普通单引号或双引号不支持直接换行。

| 引号类型    | 是否支持直接换行 | 正确性       |
| ----------- | ---------------- | ------------ |
| 反引号（`） | ✅ 支持          | 推荐使用     |
| 单引号（'） | ❌ 不支持        | 会报语法错误 |
| 双引号（"） | ❌ 不支持        | 会报语法错误 |

**错误写法**：

```javascript
template: '<div>
  这是错误的
</div>'   // 报错：字符串未终止
```

**正确写法**：

```javascript
template: `
  <div>
    这是正确的
  </div>
`;
```

如果因特殊原因必须使用普通引号，只能通过字符串拼接或转义字符 `\n` 实现，但可读性极差，不推荐。

#### 2.1.8 ⚠️ 常见陷阱：runtime-only 构建版本不支持 `template` 选项

##### 📌 问题现象

在项目中使用 `Vue.component` 全局注册一个带有 `template` 选项的组件时，控制台报错：

```
[Vue warn]: You are using the runtime-only build of Vue where the template compiler is not available. Either pre-compile the templates into render functions, or use the compiler-included build.

found in

---> <MyBtn>
       <App> at src/App.vue
         <Root>
```

**示例代码**（main.js）：
```javascript
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

// 全局注册一个使用 template 选项的组件
Vue.component('my-btn', { template: '<button>点我</button>' })

new Vue({
  render: h => h(App),
}).$mount('#app')
```

在 App.vue 的模板中使用了 `<my-btn />`，但页面上不显示按钮，控制台报上述错误。

##### 🧠 根本原因

Vue 有两种构建版本：

- **runtime-only**（默认）：体积更小，但不包含模板编译器，无法将字符串模板（`template` 选项）编译为渲染函数。此版本要求所有模板必须预编译（如使用单文件组件的 `<template>` 或 `render` 函数）。
- **compiler-included**（完整版）：包含模板编译器，支持 `template` 选项，但体积大约大 30%。

通过 Vue CLI 创建的项目默认使用的是 **runtime-only** 版本，因此直接写 `{ template: '<button>点我</button>' }` 会报错。

##### ✅ 解决方案

**方案一：改用 `render` 函数（推荐）**

```javascript
Vue.component('my-btn', {
  render(h) {
    return h('button', '点我')
  }
})
```

`render` 函数不需要编译器，运行时直接生成虚拟节点，是官方推荐的高效写法。

**方案二：使用单文件组件（SFC）**

创建 `components/MyBtn.vue`：
```vue
<template>
  <button>点我</button>
</template>
```

在 `main.js` 中导入并注册：
```javascript
import MyBtn from './components/MyBtn.vue'
Vue.component('my-btn', MyBtn)
```

单文件组件的 `<template>` 在构建时已经预编译成 `render` 函数，因此运行时不依赖编译器。

**方案三：切换到完整版 Vue（不推荐，会增加打包体积）**

在 `vue.config.js` 中添加：
```javascript
module.exports = {
  runtimeCompiler: true
}
```
然后重启项目。此选项会强制使用包含编译器的 Vue 版本，但会使最终打包体积增大。

##### 📝 总结与最佳实践

| 注册方式                                     | 是否需要编译器 | 适用场景                       |
| -------------------------------------------- | -------------- | ------------------------------ |
| `Vue.component('tag', { template: '...' })` | ✅ 需要        | 仅限完整版 Vue，不推荐现代项目 |
| `Vue.component('tag', { render(h) {...} })` | ❌ 不需要      | 动态组件、高阶组件             |
| 单文件组件（.vue）                           | ❌ 不需要      | **日常开发首选**               |

**日常开发建议**：
- 始终使用单文件组件（`.vue`），在 `<template>` 中编写模板。
- 如果必须全局注册一个简单组件，使用 `render` 函数。
- 避免在 runtime-only 环境下使用 `template` 选项，除非你明确切换到完整版。

### 2.2 注册组件

注册组件就是让 Vue 知道组件构造器对应的标签名称，从而在模板中使用。注册方式分为**全局注册**和**局部注册**。

#### 2.2.1 全局注册 `Vue.component()`

调用 `Vue.component()` 是将一个组件选项对象（或组件构造器）注册为**全局组件**，之后可以在任意 Vue 实例（或其子组件）的模板中使用。

```javascript
Vue.component('组件标签名', {
  // 组件选项
  template: '...',
  data() {
    return {};
  },
  // ...
});
```

你也可以传入一个已经由 `Vue.extend()` 创建好的构造器：

```javascript
const MyCpnCon = Vue.extend({ template: '<div>...</div>' });
Vue.component('my-cpn', MyCpnCon);
```

两种写法最终效果完全一样。

**完整示例**：

```vue
<div id="app">
  <global-comp></global-comp>
</div>
<div id="app2">
  <global-comp></global-comp>   <!-- 在另一个实例中也能使用 -->
</div>
<script>
// 全局注册，任何 Vue 实例都能用
Vue.component('global-comp', {
  template: '<button>全局按钮</button>',
});
new Vue({ el: '#app' });
new Vue({ el: '#app2' });
</script>
```

**特点**：

- 在任何 Vue 实例（包括所有子组件）的模板中都可以使用。
- 适用于基础组件（如按钮、输入框），避免重复注册。
- 全局注册的组件会在整个应用启动时全部初始化，即使某些页面从未使用，也会增加初始加载负担。对于大型应用，推荐按需局部注册。

#### 2.2.2 局部注册

局部注册是在**某个 Vue 实例或父组件**的 `components` 选项中定义，只有该实例（或组件及其子组件）的模板可以使用。

**① 在根 Vue 实例中局部注册**

```vue
<div id="app">
  <local-comp></local-comp>
</div>
<script>
new Vue({
  el: '#app',
  components: {
    'local-comp': {
      template: '<div>局部组件，只能在 #app 中使用</div>',
    },
  },
});
</script>
```

**② 在组件内部局部注册子组件**

```vue
<!-- 父组件 Parent.vue -->
<template>
  <div>
    <child-comp></child-comp>
  </div>
</template>
<script>
import ChildComp from './ChildComp.vue'; // 导入子组件
export default {
  components: {
    'child-comp': ChildComp, // 局部注册
    // 如果组件名与导入名相同，可以简写：ChildComp
  },
};
</script>
```

**特点**：

- 仅在当前组件及其后代组件中生效。
- 更利于代码拆分和按需加载，减少初始开销。
- 推荐在单文件组件中始终使用局部注册。

#### 2.2.3 全局注册与局部注册的对比

| 特性         | 全局注册                     | 局部注册                               |
| ------------ | ---------------------------- | -------------------------------------- |
| 使用范围     | 任何 Vue 实例 / 组件模板     | 仅当前注册的 Vue 实例 / 组件及其子组件 |
| 注册方式     | `Vue.component(...)`         | 在 `components` 对象中声明             |
| 适用场景     | 基础高频组件（如 UI 库）     | 业务组件、按需加载                     |
| 打包影响     | 即使不用也会被打包进最终文件 | 仅在使用到的组件中打包                 |
| 命名冲突风险 | 较高（全局唯一）             | 较低（作用域隔离）                     |

**总结**：优先使用局部注册，除非组件确实需要全局可用。

### 2.3 在单文件组件（.vue）中注册和使用组件

现代 Vue 项目（通过 Vue CLI 或 Vite）通常使用单文件组件。在 `.vue` 文件中，组件的注册和使用非常简洁：

```vue
<!-- 页面组件 Home.vue -->
<template>
  <div>
    <h1>首页</h1>
    <!-- 3️⃣ 使用子组件（标签名使用 kebab-case） -->
    <user-card></user-card>
    <blog-post :title="postTitle"></blog-post>
  </div>
</template>

<script>
// 1️⃣ 导入子组件
import UserCard from '@/components/UserCard.vue';
import BlogPost from '@/components/BlogPost.vue';

export default {
  // 2️⃣ 局部注册组件（推荐始终使用局部注册）
  components: {
    UserCard, // ES6 简写，等价于 UserCard: UserCard
    BlogPost,
  },
  data() {
    return {
      postTitle: 'Vue 组件入门',
    };
  },
};
</script>
```

**步骤说明**：

1. **导入**：使用 `import` 语句导入组件文件。
2. **注册**：在 `components` 对象中注册组件，可以自定义标签名（推荐保持与原组件名一致，使用 PascalCase 导入，模板中用 kebab-case 使用）。
3. **使用**：在 `<template>` 中通过注册的标签名（kebab-case）使用组件。

### 2.4 在模板中使用组件

注册了组件之后，最重要的就是如何在模板中正确地**调用**它们。这一节集中介绍所有的使用方式。

#### 2.4.1 基本使用

只要组件已经注册（全局或局部），就可以在 Vue 实例或父组件的模板中直接使用其标签名。例如：

```vue
<div id="app">
  <!-- 使用全局组件 -->
  <my-button></my-button>
  <!-- 使用局部组件 -->
  <user-card></user-card>
</div>

<script>
// 全局注册
Vue.component('my-button', {
  template: '<button>全局按钮</button>',
});
new Vue({
  el: '#app',
  components: {
    'user-card': {
      template: '<div>用户卡片</div>',
    },
  },
});
</script>
```

页面渲染结果：按钮和“用户卡片”并排显示。

#### 2.4.2 标签命名的大小写规则

根据组件注册时的名称风格，在**模板中的使用方式**有差异：

| 注册时的写法                  | 在模板中必须使用的写法          | 说明                    |
| ----------------------------- | ------------------------------- | ----------------------- |
| `'my-component'` (kebab-case) | `<my-component></my-component>` | 保持一致                |
| `'myComponent'` (camelCase)   | `<my-component></my-component>` | 必须转换为 kebab-case   |
| `'MyComponent'` (PascalCase)  | `<my-component></my-component>` | 也必须转换为 kebab-case |

**重要**：在**普通 HTML 文件**（如 `index.html`）或**字符串模板**中，**一律使用 kebab-case**。在**单文件组件的 `<template>`** 中，可以使用 PascalCase 直接作为标签名（例如 `<MyComponent />`），但为了跨平台兼容性，官方仍然推荐使用 kebab-case。

#### 2.4.3 自闭合与双标签

组件标签可以像普通 HTML 元素一样使用**双标签**形式，也可以使用**自闭合**形式（如果组件没有插槽内容）。

```vue
<!-- 双标签形式（推荐，内容更明确） -->
<my-component></my-component>

<!-- 自闭合形式（简洁，适合无子内容） -->
<my-component />
```

在 Vue 模板中两者等价，但 DOM 模板（在 `index.html` 中直接写）中，自闭合标签可能不被某些浏览器解析，建议一律使用双标签形式。

#### 2.4.4 在嵌套组件中使用子组件

当组件内部需要调用其他组件时，必须在**父组件的 `components` 选项中注册子组件**，然后在父组件的模板中使用。

```vue
<!-- 父组件 Parent.vue -->
<template>
  <div class="parent">
    <h2>我是父组件</h2>
    <!-- 直接使用子组件标签 -->
    <child-component></child-component>
  </div>
</template>

<script>
import ChildComponent from './ChildComponent.vue';

export default {
  components: {
    ChildComponent, // 必须注册
  },
};
</script>
```

**错误示例**：在父组件模板中直接写子组件标签但没有注册，Vue 会警告 `Unknown component`。

#### 2.4.5 通过 props 向组件传递数据

组件通常需要接收外部数据，通过 `props` 属性实现：

```vue
<template>
  <div>
    <!-- 传递静态字符串 -->
    <blog-post title="我的博客"></blog-post>
    <!-- 传递动态变量 -->
    <blog-post :title="postTitle"></blog-post>
  </div>
</template>

<script>
import BlogPost from './BlogPost.vue';
export default {
  components: { BlogPost },
  data() {
    return { postTitle: 'Vue 组件基础' };
  },
};
</script>
```

子组件通过 `props` 接收：

```vue
<!-- BlogPost.vue -->
<template>
  <h3>{{ title }}</h3>
</template>
<script>
export default {
  props: ['title'],
};
</script>
```

#### 2.4.6 使用插槽 (slot) 分发内容

如果需要在组件标签内部嵌入自定义内容，可以使用插槽：

```vue
<!-- 父组件模板 -->
<my-card>
  <p>这是卡片内部的内容</p>
</my-card>
```

子组件中放置 `<slot>` 标签：

```vue
<!-- MyCard.vue -->
<div class="card">
  <div class="header">卡片标题</div>
  <div class="body">
    <slot></slot>  <!-- 父组件传入的内容会显示在这里 -->
  </div>
</div>
```

#### 2.4.7 注意事项与常见错误

1. **组件名必须与注册名严格匹配**（包括大小写转换规则）。
2. **不要在模板中使用未注册的组件**，否则 Vue 会报错。
3. **在 DOM 模板（直接在 `index.html` 中编写）**中，不能使用自闭合标签，也不支持 PascalCase（会被视为原生标签），**必须全部使用 kebab-case**。
4. **组件标签内不能直接书写文本或子元素**，除非子组件定义了 `<slot>`，否则会被忽略。

### 2.5 注册命名的注意事项

- **HTML 模板中必须使用 kebab-case**（短横线分隔），因为 HTML 标签不区分大小写。
- **在字符串模板（如 `template` 选项）或单文件组件中**，可以使用 PascalCase 直接作为标签名，但为了跨平台兼容，仍建议统一使用 kebab-case。
- **组件注册名**（`components` 对象中的 key）可以用 kebab-case 或 PascalCase，Vue 都能正确识别，但推荐统一用 kebab-case 以保持模板一致性。

### 2.6 页面中注册组件的完整流程总结

| 场景                           | 注册方式                                        | 代码示例                                                                       |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------ |
| 全局注册（main.js 或任何地方） | `Vue.component('tag', { ... })`                 | `Vue.component('my-btn', { template: '<button>点我</button>' })`               |
| 根实例局部注册                 | `new Vue({ components: { 'tag': {...} } })`     | `components: { 'my-panel': { template: '<div>面板</div>' } }`                  |
| 单文件组件内部注册             | 导入 + `export default { components: { ... } }` | `import MyComp from './MyComp.vue'; export default { components: { MyComp } }` |

理解并熟练运用这些注册方式，是构建 Vue 应用的基础。

---

## 3. 组件嵌套

所谓组件嵌套，就是在子组件的父级模板中用标签的形式调用子组件。嵌套规则：子组件要在父组件上注册，父组件要在 Vue 实例（或更上层组件）上注册。

```vue
<div id="app">
  <my-parent></my-parent>
</div>
<script src="./Vuejs/vue2-6-12.js"></script>
<script>
var child = {
  template: `
      <div>
        <h4>这是child组件</h4>
      </div>
    `,
};
var parent = {
  template: `
      <div style="border:1px solid red">
        <h4>这是parent组件</h4>
        <my-child></my-child>
      </div>
    `,
  components: {
    'my-child': child,
  },
};
new Vue({
  el: '#app',
  components: {
    'my-parent': parent,
  },
});
</script>
```

**关键点**：

1. 除了没有 `el` 选项外，组件中可以包含 `data`、`methods`、`components` 等选项。
2. 要在父组件中使用子组件，必须在父组件的 `components` 中注册子组件，并在父组件的模板中写入子组件的标签（如 `<my-child></my-child>`）。
3. 在根实例的模板中直接写成 `<my-parent><my-child></my-child></my-parent>` 是无效的，因为 `<my-child>` 是注册在父组件内部的，应由父组件自己管理。
4. **最重要的一点**：每个组件的 `template` 中只能有一个根元素。错误示例：

```vue
<!-- ❌ 错误：两个根元素 -->
<template id="father">
  <h1>我是父组件中的template</h1>
  <son1></son1>
</template>
```

正确写法：

```vue
<!-- ✅ 正确：用一个 div 包裹 -->
<template id="father">
  <div>
    <h1>我是父组件中的template</h1>
    <son1></son1>
  </div>
</template>
```

---

## 4. 组件命名规范

当注册组件（或者 prop）时，可以使用以下三种命名风格：

- **kebab-case**（短横线分隔命名）：`my-component-name`
- **camelCase**（驼峰式命名）：`myComponentName`
- **PascalCase**（单词首字母大写命名）：`MyComponentName`

**注意**：虽然在注册时可以使用 camelCase 或 PascalCase，但在 HTML 模板中使用时，**必须转换为 kebab-case 形式**（因为 HTML 对大小写不敏感）。例如：

```vue
<div id="app">
  <kebab-case-component></kebab-case-component>
  <camel-case-component></camel-case-component>   <!-- 注册时用了 camelCase，使用时写 kebab-case -->
  <pascal-case></pascal-case>                     <!-- 注册时用了 PascalCase，使用时写 kebab-case -->
</div>
<script>
new Vue({
  el: '#app',
  components: {
    'kebab-case-component': { template: '<div>短横线分隔命名</div>' },
    camelCaseComponent: { template: '<div>驼峰式命名</div>' },
    PascalCase: { template: '<div>单词首字母大写</div>' },
  },
});
</script>
```

---

## 5. 组件的 `name` 选项

在定义组件时，除了注册时指定的名称外，还可以在组件内部使用 `name` 选项为组件指定一个**内部名称**。`name` 选项有以下重要作用：

### 5.1 作用概述

| 作用                   | 说明                                                                        |
| ---------------------- | --------------------------------------------------------------------------- |
| **递归组件**           | 组件可以在其模板中通过 `name` 递归调用自身（例如树形菜单、评论嵌套）。      |
| **调试工具标识**       | Vue Devtools 中显示的组件名称会使用 `name` 选项，便于调试。                 |
| **保持组件身份**       | 当使用 `keep-alive` 缓存组件时，`include`/`exclude` 匹配的是组件的 `name`。 |
| **简化局部注册语法**   | 在局部注册时，如果组件已经定义了 `name`，注册时可以简写。                   |
| **提供更好的错误提示** | Vue 在报错时会显示组件的 `name`，帮助定位问题。                             |

### 5.2 基本语法

在单文件组件（SFC）中：

```vue
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  name: 'MyComponent', // 组件内部名称
  data() {
    return { message: 'Hello' };
  },
};
</script>
```

在使用 `Vue.component` 全局注册时，通常注册名称就是组件名，但也可以在组件定义中添加 `name`：

```javascript
Vue.component('my-component', {
  name: 'MyInternalName', // 内部名称，调试时显示
  template: '<div>...</div>',
});
```

### 5.3 递归组件

组件可以通过 `name` 在自己的模板中调用自身，实现递归渲染。**注意**：必须同时设置 `name` 和 `v-if` 终止条件，否则会无限循环。

**示例：树形菜单**

```vue
<template>
  <div class="tree-node">
    <span @click="toggle">{{ node.name }}</span>
    <div v-if="node.children && node.children.length" class="children">
      <tree-node v-for="child in node.children" :key="child.id" :node="child"></tree-node>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeNode', // 递归必须定义 name
  props: ['node'],
  methods: {
    toggle() {
      // 展开/收起逻辑
    },
  },
};
</script>
```

### 5.4 与 `keep-alive` 配合使用

`keep-alive` 组件的 `include` 和 `exclude` 属性根据组件的 `name` 来决定哪些组件需要被缓存。

```vue
<template>
  <keep-alive include="UserList,UserDetail">
    <router-view></router-view>
  </keep-alive>
</template>
```

在上面的例子中，只有 `name` 为 `UserList` 或 `UserDetail` 的组件会被缓存。如果组件没有定义 `name`，则使用注册名称，但显式定义 `name` 更可靠。

### 5.5 在 Vue Devtools 中的显示

当打开 Vue Devtools 浏览器插件时，组件树中显示的名称优先使用组件定义中的 `name` 选项。如果没有 `name`，则使用注册标签名（kebab-case 会被转换为 PascalCase 显示）。定义清晰的 `name` 能大大提高调试效率。

- 有 `name` 的组件：

  ```javascript
  export default { name: 'UserProfile' };
  ```

  在 Devtools 中显示为 `UserProfile`。

- 无 `name` 的组件：
  ```javascript
  export default {};
  ```
  在 Devtools 中根据注册名显示（如 `user-profile` 显示为 `UserProfile`），但不够直观。

### 5.6 命名最佳实践

- **推荐使用 PascalCase**（首字母大写驼峰）定义 `name`，例如 `UserCard`、`TodoItem`。
- 名称应具有语义化，清晰表达组件的功能。
- 避免与 HTML 原生标签同名。
- 在单文件组件中，建议始终显式定义 `name`，即使它看起来“多余”，但能为调试和递归提供便利。

---

## 6. 组件中的 data 为什么是一个函数

**核心原因**：**防止数据复用，保证每个组件实例拥有独立的数据副本。**

- Vue 组件是用来复用的，如果 `data` 是一个对象，那么所有组件实例将共享同一个数据对象，一个实例修改数据会影响其他实例。
- 通过将 `data` 定义为**返回一个对象的函数**，每次创建组件实例时，都会调用该函数并返回一个全新的对象副本，从而每个实例都有自己独立的数据空间，互不干扰。

**错误示例**（如果 data 是对象，实际不能这样写，Vue 会报错，但原理如此）：

```javascript
// ❌ 错误：data 为对象（实际 Vue 会发出警告）
data: {
  num: 0;
}
```

**正确示例**：

```javascript
data() {
  return {
    num: 0
  }
}
```

**演示**：

```vue
<div id="app">
  <btn></btn>
  <btn></btn>
</div>
<script src="./Vuejs/vue2-6-12.js"></script>
<script>
var btn1 = Vue.extend({
  template: `
      <button @click="reg">you clicked me {{ num }} 次</button>
    `,
  methods: {
    reg() {
      this.num++;
      console.log(this.num);
    },
  },
  data() {
    return {
      num: 0,
    };
  },
});
Vue.component('btn', btn1);
new Vue({ el: '#app' });
</script>
```

点击第一个按钮两次，第一个按钮的 `num` 变为 2；点击第二个按钮，它的 `num` 从 0 开始增加，互不影响。这正是因为每个组件实例拥有独立的数据副本。

---

## 7. template 分离写法

### 7.1 为什么使用分离写法

组件的模板内容如果直接在 JavaScript 对象中通过字符串定义，当 HTML 结构复杂时会变得难以维护和理解。将模板内容分离到 `<template>` 标签中，可以让代码更加清晰，便于开发和维护。

### 7.2 三种模板定义方式回顾

1. **直接写在选项里的模板**（内联模板）：

   ```javascript
   Vue.component('my-comp', {
     template: '<div>内联模板</div>',
   });
   ```

2. **写在 `<template>` 标签里的模板**（推荐）：

   ```html
   <template id="myTemplate">
     <div>分离式模板内容</div>
   </template>
   ```

3. **写在 `<script>` 标签里的模板**（类型指定为 `text/x-template`，较少用）：
   ```html
   <script type="text/x-template" id="myScriptTemplate">
     <div>script 模板</div>
   </script>
   ```

### 7.3 实际示例

```vue
<div id="app">
  <h3>template 模板分离式写法举例</h3>
  <mycpn></mycpn>
  <myson></myson>
</div>

<template id="hobby">
  <div>
    <h1>好好学习，天天向上</h1>
  </div>
</template>

<template id="soncomponent">
  <div>
    <button @click="fn">我是子组件，点我打印1</button>
  </div>
</template>

<script>
let myson = {
  template: '#soncomponent',
  methods: {
    fn() {
      console.log(1);
    },
  },
};
// 可以使用全局注册
// Vue.component("mycpn", { template: "#hobby" });

const app = new Vue({
  el: '#app',
  data: {},
  components: {
    mycpn: { template: '#hobby' }, // 使用分离模板
    myson, // ES6 简写，等价于 myson: myson
  },
});
</script>
```

**说明**：`<template>` 标签中的内容不会被浏览器解析为真实的 DOM 元素，Vue 会将其内容提取出来作为组件的模板。这种方式大大提高了模板的可读性和可维护性。

---

## 8. 总结

- **组件**是可复用的 Vue 实例，拥有与 `new Vue()` 几乎相同的选项（除 `el` 等根特有选项）。
- **`Vue.extend()`**：创建组件构造器（Vue 子类），通常不需要显式调用，但可用于动态挂载或继承。
- **注册组件**：
  - **全局注册**：`Vue.component('tag', { ... })`，任何 Vue 实例都可用。
  - **局部注册**：在 `components` 选项中注册，仅当前实例（或父组件）可用。
  - **单文件组件中注册**：`import` + `components` 选项，推荐始终使用局部注册。
- **在模板中使用组件**：
  - 标签名必须与注册名一致（注意大小写转换规则）。
  - 可以使用自闭合或双标签形式。
  - 通过 `props` 传递数据，通过 `<slot>` 分发内容。
  - 嵌套组件时，父组件必须注册子组件。
- **组件嵌套**：子组件必须在父组件的 `components` 中注册，并在父组件的模板中使用。
- **模板根节点**：每个组件的 `template` 必须有且只有一个根元素。
- **命名规范**：推荐使用 kebab-case 在模板中使用；注册时可用 camelCase 或 PascalCase，但在模板中需转为 kebab-case。
- **`name` 选项**：用于递归组件、调试工具显示、`keep-alive` 匹配及错误提示。强烈建议在每个组件中显式定义有意义的 `name`（PascalCase）。
- **data 必须是函数**：确保每个组件实例拥有独立的数据作用域，避免数据污染。
- **模板分离**：使用 `<template>` 标签定义模板内容，提高代码可维护性。
- **`template` 字符串书写规范**：必须使用反引号（`）包裹多行模板，普通单引号或双引号不能直接换行。
- **⚠️ runtime-only 构建限制**：默认 Vue CLI 项目不含模板编译器，如需使用 `{ template: '...' }` 注册组件，请改用 `render` 函数或单文件组件，否则会报错。
