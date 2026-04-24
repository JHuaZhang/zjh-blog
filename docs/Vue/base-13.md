---
group:
  title: 【01】vue基础篇
  order: 1
title: vue组件数据data介绍
order: 13
nav:
  title: Vue
  order: 4
---

## 1. data 介绍

`data` 是一个**函数**（组件中必须为函数，实例中可为对象），返回一个包含响应式数据属性的对象。这些属性可在模板、方法、计算属性中被访问和修改，且数据变化会自动触发视图更新。

**简单来说：**

- **数据仓库**：`data` 是组件的“私有数据仓库”，用于存储组件内部状态。
- **响应式核心**：当 `data` 中的数据发生变化时，Vue 会自动检测到这一变化，并相应地更新依赖于这些数据的 DOM。

**数据类型与结构：**

**① 支持的数据类型**

- 基本类型：字符串、数字、布尔值等（如 `message: 'Hello'`）。
- 复杂类型：对象、数组（如 `user: { name: 'John' }` 或 `items: [1,2,3]`）。
- 特殊说明：直接通过索引修改数组（如 `arr[0] = 1`）或添加新属性（如 `obj.newKey = 'value'`）**不会触发响应式更新**，需使用 `Vue.set` 或 `vm.$set`。

**② 组件中的特殊性**

组件的 `data` **必须为函数**，确保每个实例拥有独立的数据副本。若定义为对象，所有实例会共享同一数据，导致数据污染。

**基本语法和使用方式：**

**① 在 Vue 组件中（.vue 文件）**

在单文件组件（SFC）中，`data` 必须被声明为一个函数，该函数返回一个对象。

```vue
export default {
  name: 'MyComponent',
  data() {
    // 这个函数返回一个对象
    return {
      message: 'Hello Vue!',
      count: 0,
      user: {
        name: 'Alice',
        age: 25
      },
      todos: [
        { id: 1, text: 'Learn Vue', done: true },
        { id: 2, text: 'Build something awesome', done: false }
      ]
    };
  },
  methods: {
    increment() {
      this.count++; // 通过 `this` 访问 data 中的属性
    }
  }
}
```

通过 `this.message`、`this.count` 等方式在组件内的任何地方（如 `methods`、`computed`、模板等）访问和修改数据。直接修改 `this.count` 的值，视图会自动更新。

**② 在根 Vue 实例中（main.js）**

对于根实例（通过 `new Vue()` 创建的实例），`data` 可以是一个对象（但通常为了统一，也写成函数形式）。

```javascript
new Vue({
  el: '#app',
  // 在根实例中，data 可以是对象（虽然函数也可以）
  data: {
    appName: 'My Vue App',
  },
  // 或者更推荐写成函数形式，返回对象
  // data() {
  //   return {
  //     appName: 'My Vue App'
  //   }
  // }
});
```

---

## 2. 为什么 data 必须是一个函数？

> 这是一个非常常见的面试题，也是理解 Vue 组件化的关键。

**核心原因：避免数据共享和污染。**

如果 `data` 是一个普通的对象，那么**所有使用这个组件的实例将共享同一个数据对象**！因此在一个组件里修改了 `count`，所有其他相同组件的 `count` 都会跟着变。

通过将 `data` 定义为**函数**，每次创建组件实例时，都会调用这个函数，**返回一个全新的、独立的数据对象副本**。这就确保了每个组件实例都有自己独立的数据空间，互不干扰。

**因此始终使用函数形式**：无论在组件还是根实例，养成使用 `data() { return {} }` 的习惯。

---

## 3. 响应式数据原理

Vue 2.x 使用 `Object.defineProperty` 来实现响应式。当你把一个普通的 JavaScript 对象传入 Vue 实例作为 `data` 选项，Vue 将遍历此对象所有的属性，并使用 `Object.defineProperty` 把这些属性全部转为 getter / setter。

**Getter / Setter 的作用：**

- **Getter**：当读取属性（如 `this.message`）时触发。
- **Setter**：当设置属性（如 `this.message = 'Hi'`）时触发。Setter 是关键，当数据被修改时，Setter 会通知 Vue：“我这个数据变了！”。Vue 内部会有一个依赖追踪系统，它会知道哪些组件依赖于这个数据，并触发一个“重新渲染”的流程，最终更新视图。

---

## 4. 注意事项和常见问题

### 4.1 对于对象和数组的变更检测

Vue 无法检测到对象属性的添加或删除，以及直接通过索引设置数组项。

#### 对象

```vue
<template>
  <div>
    <div>user 对象: {{ user }}</div>
    <button @click="addAgeBad">点击调用 addAgeBad</button>
    <button @click="addAgeGood">点击调用 addAgeGood</button>
    <button @click="deleteNameBad">点击调用 deleteNameBad</button>
    <button @click="deleteNameGood">点击调用 deleteNameGood</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {
        name: 'Alice',
      },
    };
  },
  methods: {
    addAgeBad() {
      // ❌ 错误！非响应式，视图不会更新
      this.user.age = 25;
    },
    addAgeGood() {
      // ✅ 正确！使用 Vue.set 或 this.$set
      this.$set(this.user, 'age', 25);
      // 或者使用新对象赋值
      this.user = { ...this.user, age: 25 };
    },
    deleteNameBad() {
      // ❌ 错误！非响应式
      delete this.user.name;
    },
    deleteNameGood() {
      // ✅ 正确！使用 Vue.delete 或 this.$delete
      this.$delete(this.user, 'name');
    },
  },
};
</script>
```

**效果说明**：依次点击 4 个按钮后，页面显示的 `user` 分别为：

- 初始：`{ "name": "Alice" }`
- 点击 `addAgeBad`：无变化（非响应式）
- 点击 `addAgeGood`：`{ "name": "Alice", "age": 25 }`
- 点击 `deleteNameBad`：无变化（非响应式，但实际数据已被删除）
- 点击 `deleteNameGood`：`{ "age": 25 }`（`name` 被删除且视图更新）

若 `addAgeBad` 设置的是其他属性，例如：

```vue
addAgeBad() { // ❌ 错误！非响应式，视图不会更新 this.user.test = 25; }, addAgeGood() { // ✅ 正确！
this.$set(this.user, 'age', 25); }
```

依次点击 `addAgeBad` 和 `addAgeGood`，页面最终显示：`{ "name": "Alice", "test": 25, "age": 25 }`。

#### 数组

```vue
<template>
  <div>
    <div>list 数组: {{ list }}</div>
    <button @click="updateItemBad(1, 'x')">点击调用 updateItemBad</button>
    <button @click="updateItemGood(1, 'y')">点击调用 updateItemGood</button>
    <button @click="changeLengthBad">点击调用 changeLengthBad</button>
    <button @click="changeLengthGood">点击调用 changeLengthGood</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: ['a', 'b', 'c'],
    };
  },
  methods: {
    updateItemBad(index, newVal) {
      // ❌ 错误！非响应式
      this.list[index] = newVal;
    },
    updateItemGood(index, newVal) {
      // ✅ 正确！使用 Vue.set 或 splice
      this.$set(this.list, index, newVal);
      // 或者使用数组的 splice 方法
      this.list.splice(index, 1, newVal);
    },
    changeLengthBad() {
      // ❌ 错误！非响应式
      this.list.length = 2;
    },
    changeLengthGood() {
      // ✅ 正确！使用 splice
      this.list.splice(2);
    },
  },
};
</script>
```

**为什么数组的 `push`、`pop` 等方法是响应式的？**

Vue 重写了数组的**变异方法**（`push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`），所以调用这些方法可以触发视图更新。

### 4.2 数据初始化

所有需要在模板中使用的响应式数据，**都必须在 `data` 中预先声明**，哪怕初始值是 `null`、`undefined` 或空字符串。

```javascript
data() {
  return {
    // 好的实践：即使初始为空，也先声明
    newTodoText: '',
    todos: [],
    currentUser: null,
    someFutureData: undefined
  };
}
```

如果之后才给 `this` 添加一个新的属性（如 `this.newProperty = 'value'`），它**不会是响应式的**。

### 4.3 data 属性的命名

避免使用 `$` 和 `_` 开头命名属性，因为它们可能与 Vue 的内置 API 或私有属性冲突。

---

## 5. 总结

- 组件的 `data` **必须是一个函数**，返回独立的数据对象，避免实例间数据共享。
- Vue 2 通过 `Object.defineProperty` 将 `data` 中的属性转换为 getter/setter，实现响应式。
- 直接添加对象新属性或通过索引修改数组元素**不会触发视图更新**，应使用 `Vue.set` / `this.$set` 或数组变异方法。
- 所有响应式数据应提前在 `data` 中声明，避免使用 `$` 或 `_` 前缀作为属性名。
