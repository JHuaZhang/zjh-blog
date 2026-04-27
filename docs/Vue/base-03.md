---
group:
  title: 【01】vue基础篇
  order: 1
title: 插值表达式{{}}与数据绑定
order: 3
nav:
  title: Vue
  order: 4
---

## 1. 什么是插值表达式

插值表达式是 Vue.js 框架提供的一种**数据绑定**语法，最常见的形式是使用 **Mustache** 语法（双大括号 `{{ }}`）进行文本插值。

**基本作用**：将 Vue 实例中 `data` 对象的数据属性渲染到视图（DOM）中。当绑定的数据发生变化时，插值处的内容会自动更新。

```html
<div id="app">
  <p>Message: {{ msg }}</p>
</div>

<script>
  var vm = new Vue({
    el: '#app',
    data: {
      msg: 'Hello Vue!',
    },
  });
</script>
```

> 上述示例中，`{{ msg }}` 会被替换为 `data.msg` 的值 `'Hello Vue!'`，并且当 `msg` 改变时，页面内容也会同步更新。

---

## 2. 插值表达式的支持范围

在 `{{ }}` 内部，除了直接绑定模型变量外，Vue 还支持编写**简短的 JavaScript 表达式**。这些表达式会在当前 Vue 实例的数据作用域下求值。

### 2.1 字面量

可以直接输出字符串、数字等字面量：

```html
<div id="app">
  <p>{{ 'Hello Vue' }}</p>
  <!-- 输出：Hello Vue -->
  <p>{{ 123 }}</p>
  <!-- 输出：123 -->
  <p>{{ true }}</p>
  <!-- 输出：true -->
</div>
```

### 2.2 四则运算

支持加法、减法、乘法、除法等基本运算：

```html
<div id="app">
  <p>{{ 1 + 2 }}</p>
  <!-- 3 -->
  <p>{{ 'Hello' + ' ' + 'Vue' }}</p>
  <!-- Hello Vue -->
  <p>{{ 10 * 2 }}</p>
  <!-- 20 -->
  <p>{{ 100 / 50 }}</p>
  <!-- 2 -->
</div>
```

### 2.3 逻辑运算

支持 `&&`、`||`、`!` 等逻辑运算符：

```html
<div id="app">
  <p>{{ true && false }}</p>
  <!-- false -->
  <p>{{ true || false }}</p>
  <!-- true -->
  <p>{{ !true }}</p>
  <!-- false -->
</div>
```

### 2.4 三目运算

支持条件（三元）运算符：

```html
<div id="app">
  <p>{{ 20 > 18 ? '成年' : '未成年' }}</p>
  <!-- 成年 -->
  <p>{{ isLogin ? '欢迎回来' : '请先登录' }}</p>
</div>
```

### 2.5 调用全局函数

可以访问部分全局 JavaScript 内置对象和方法，例如 `Math`、`parseInt` 等：

```html
<div id="app">
  <p>{{ Math.random() }}</p>
  <!-- 输出随机数 -->
  <p>{{ parseInt(12.23) }}</p>
  <!-- 12 -->
  <p>{{ Date.now() }}</p>
  <!-- 当前时间戳 -->
</div>
```

### 2.6 访问数组/对象属性及方法调用

```html
<div id="app">
  <p>{{ message.split('').reverse().join('') }}</p>
  <!-- 字符串反转 -->
  <p>{{ userInfo.name }}</p>
  <!-- 显示对象属性 -->
  <p>{{ list[0] }}</p>
  <!-- 访问数组元素 -->
</div>

<script>
  new Vue({
    el: '#app',
    data: {
      message: 'Hello',
      userInfo: { name: '张三' },
      list: ['苹果', '香蕉'],
    },
  });
</script>
```

---

## 3. 注意事项与限制

虽然插值表达式非常灵活，但仍有一些**使用限制**：

1. **只能包含单行表达式**：不能写多行语句或复杂的流程控制（如 `if`、`for`）。
2. **不能访问用户自定义的全局变量**：只能访问 Vue 实例数据（`data`、`computed`、`methods` 中的方法）以及部分白名单全局对象（如 `Math`、`Date`）。
3. **不能使用 `console.log`、`alert` 等**：这些是语句而非表达式，不会执行。
4. **不能用于 HTML 属性绑定**：属性绑定需要使用 `v-bind` 指令，而不是 `{{ }}`。

**错误示例**：

```html
<!-- 错误：这是语句，不是表达式 -->
{{ if (ok) { return 'yes' } }}

<!-- 错误：不能定义变量 -->
{{ var a = 10 }}

<!-- 错误：不能使用 console.log -->
{{ console.log(msg) }}
```

---

## 4. 关于 `this` 的使用说明

### 4.1 插值表达式中不要使用 `this`

在 Vue 模板的 `{{ }}` 插值表达式中，**不需要也不应该使用 `this`** 来访问数据属性。Vue 在解析模板时已经将表达式的作用域指向当前组件实例，直接写属性名即可。

```html
<!-- 正确写法 -->
<div id="app">
  <p>{{ message }}</p>
  <!-- 直接写 data 中的变量名 -->
  <p>{{ fullName() }}</p>
  <!-- 直接写 methods 中的方法名 -->
</div>

<!-- 错误写法（不要这样写） -->
<div id="app">
  <p>{{ this.message }}</p>
  <!-- 多余且会报错 -->
  <p>{{ vm.$data.message }}</p>
  <!-- 错误 -->
</div>
```

**原因**：Vue 内部的表达式求值上下文并不是直接使用当前的 `this`，而是将 `data`、`computed`、`methods` 等属性挂载到一个代理对象上。在表达式中使用 `this` 可能会导致 `undefined` 或运行时报错。

### 4.2 Vue 中哪些场景需要使用 `this`

虽然模板插值中不需要 `this`，但在 **Vue 组件的 JavaScript 代码中**（如 `methods`、`computed`、`生命周期钩子` 等），访问当前实例的数据、方法、计算属性等**必须使用 `this`**。

| 场景                                    | 是否需要 this | 示例                                    |
| --------------------------------------- | ------------- | --------------------------------------- |
| 模板插值 `{{ }}`                        | ❌ 不需要     | `{{ count }}`                           |
| `methods` 中访问数据                    | ✅ 必须使用   | `this.count`                            |
| `computed` 中访问其他属性               | ✅ 必须使用   | `return this.firstName + this.lastName` |
| 生命周期钩子（`mounted`、`created` 等） | ✅ 必须使用   | `this.message = 'updated'`              |
| `watch` 中访问数据                      | ✅ 必须使用   | `this.newValue`                         |
| 事件处理器（`@click` 调用的方法内部）   | ✅ 必须使用   | `this.count++`                          |

**示例对比**：

```html
<div id="app">
  <!-- 模板中直接写变量名，不要 this -->
  <p>{{ message }}</p>
  <button @click="updateMessage">更新</button>
</div>

<script>
  new Vue({
    el: '#app',
    data: {
      message: 'Hello',
    },
    methods: {
      updateMessage() {
        // 在 methods 内部必须使用 this 来访问 data 中的属性
        this.message = 'Updated via method';
        console.log(this.message);
      },
    },
    mounted() {
      // 生命周期钩子中也必须使用 this
      console.log(this.message);
    },
  });
</script>
```

**总结**：

- 模板中（`{{ }}`、`v-bind` 等）直接使用变量名，不要加 `this`。
- 在 Vue 实例的 `methods`、`computed`、`watch`、生命周期函数等 JavaScript 代码中，访问实例属性/方法时**必须加 `this`**。

---

## 5. 完整示例

以下是一个综合示例，展示了插值表达式的各种用法：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>插值表达式示例</title>
    <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
  </head>
  <body>
    <div id="app">
      <h2>基本绑定</h2>
      <p>{{ message }}</p>

      <h2>算术运算</h2>
      <p>1 + 2 = {{ 1 + 2 }}</p>
      <p>单价 {{ price }} 元，数量 {{ quantity }}，总价 {{ price * quantity }} 元</p>

      <h2>逻辑运算</h2>
      <p>{{ isVIP ? 'VIP会员' : '普通用户' }}</p>
      <p>登录状态：{{ isLogin ? '已登录' : '未登录' }}</p>

      <h2>调用方法</h2>
      <p>{{ message.split('').reverse().join('') }}</p>
      <p>随机数：{{ Math.random().toFixed(2) }}</p>
    </div>

    <script>
      new Vue({
        el: '#app',
        data: {
          message: 'Hello Vue.js',
          price: 100,
          quantity: 3,
          isVIP: true,
          isLogin: false,
        },
      });
    </script>
  </body>
</html>
```

---

## 6. 总结

- **插值表达式** `{{ }}` 是 Vue 中最基础的数据绑定形式，用于在视图中显示动态数据。
- 支持字面量、算术运算、逻辑运算、三目运算以及部分全局函数调用。
- 只能包含**单个表达式**，不能写语句或定义变量。
- 当绑定的数据变化时，视图会自动更新，这是 Vue 响应式系统的核心体现。
- **模板中不要使用 `this`**；但在 `methods`、`computed`、生命周期等 JavaScript 代码中访问 Vue 实例属性时必须使用 `this`。

掌握插值表达式是学习 Vue 的第一步，后续将结合指令、计算属性等实现更复杂的交互逻辑。
