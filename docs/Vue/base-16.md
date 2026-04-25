---
group:
  title: 【01】vue基础篇
  order: 1
title: vue侦听器watch
order: 16
nav:
  title: Vue
  order: 4
---

## 1. watch 介绍

Vue 的 `watch` 选项用于监听响应式数据的变化，当数据发生变化时执行指定的回调函数。它适用于**需要根据数据变化执行异步操作或开销较大的操作**的场景。

**基本语法：**

```vue
<template>
  <div>
    <input v-model="question" placeholder="输入问题" />
    <p>{{ answer }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      question: '',
      answer: '等待输入...'
    }
  },
  watch: {
    // 监听 question 的变化
    question(newVal, oldVal) {
      if (newVal.includes('?')) {
        this.getAnswer()
      }
    }
  },
  methods: {
    getAnswer() {
      // 模拟异步操作
      setTimeout(() => {
        this.answer = '答案是：' + this.question
      }, 500)
    }
  }
}
</script>
```

**如何使用？**

`watch` 与 `data`、`computed`、`methods` 同级，用于监听 `data`、`computed` 或 `props` 中的数据变化。当被监听的数据变化时，会执行对应的回调函数。

**特点（注意点）**

- **支持异步操作**：可以在回调中执行异步请求、定时器等。
- **不支持缓存**：数据变化时立即执行回调，不会缓存结果。
- **可以深度监听**：通过 `deep: true` 监听对象内部嵌套属性的变化。
- **可以立即执行**：通过 `immediate: true` 在组件初始化时立即执行一次回调。

---

## 2. watch 的基本用法

### 2.1 监听基础数据类型

```vue
<template>
  <div>
    <p>姓名：{{ fullName }}</p>
    <button @click="firstName = '王'">改变姓</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      firstName: '张',
      lastName: '三',
      fullName: '张三'
    }
  },
  watch: {
    // 监听 firstName 的变化
    firstName(newVal, oldVal) {
      console.log(`firstName 从 ${oldVal} 变为 ${newVal}`)
      this.fullName = newVal + this.lastName
    },
    // 监听 lastName 的变化
    lastName(newVal) {
      this.fullName = this.firstName + newVal
    }
  }
}
</script>
```

### 2.2 监听引用数据类型（对象、数组）

默认情况下，`watch` 无法监听到对象内部属性的变化，需要开启深度监听。

```vue
<template>
  <div>
    <p>用户信息：{{ user }}</p>
    <button @click="user.name = '李四'">修改对象属性</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {
        name: '张三',
        age: 20
      }
    }
  },
  watch: {
    // ❌ 错误：默认无法监听对象内部变化
    user(newVal) {
      console.log('user 变化了', newVal)
    }
  }
}
</script>
```

上面代码中，点击按钮修改 `user.name`，`watch` 不会触发回调。正确的做法是使用深度监听：

```vue
watch: {
  user: {
    handler(newVal, oldVal) {
      console.log('user 内部属性变化了', newVal)
    },
    deep: true   // 开启深度监听
  }
}
```

**注意**：深度监听会递归遍历对象的所有属性，性能开销较大，建议仅在必要时使用。

### 2.3 立即执行（immediate）

如果希望组件初始化时立即执行一次回调，可以使用 `immediate: true`。

```vue
watch: {
  searchText: {
    handler(newVal) {
      this.fetchData(newVal)
    },
    immediate: true   // 立即执行一次
  }
}
```

### 2.4 监听对象中的某个属性

如果只需要监听对象中的某个具体属性，可以使用字符串路径形式：

```vue
watch: {
  'user.name': {
    handler(newVal) {
      console.log('用户名变为：', newVal)
    },
    deep: false   // 不需要深度监听
  }
}
```

这种方式比深度监听性能更好，推荐使用。

### 2.5 监听多个数据源

可以使用数组形式同时监听多个数据，并在回调中统一处理（较少使用，通常使用计算属性或分别监听）。

```vue
watch: {
  firstName(newVal) {
    this.updateFullName()
  },
  lastName(newVal) {
    this.updateFullName()
  }
}
```

或者使用计算属性将多个数据合并后再监听。

---

## 3. watch 的高级用法

### 3.1 监听路由变化

在 Vue 单页应用中，经常需要监听路由参数的变化来重新获取数据。

```vue
<script>
export default {
  watch: {
    // 监听路由参数 id 的变化
    '$route.params.id': {
      handler(newId) {
        this.fetchData(newId)
      },
      immediate: true
    }
  },
  methods: {
    fetchData(id) {
      console.log('获取数据，id:', id)
      // 异步请求...
    }
  }
}
</script>
```

### 3.2 监听计算属性

`watch` 不仅可以监听 `data` 中的属性，也可以监听 `computed` 计算属性。

```vue
<script>
export default {
  data() {
    return {
      firstName: '张',
      lastName: '三'
    }
  },
  computed: {
    fullName() {
      return this.firstName + this.lastName
    }
  },
  watch: {
    fullName(newVal) {
      console.log('全名变化了：', newVal)
    }
  }
}
</script>
```

### 3.3 监听多个属性并执行相同回调

如果需要监听多个属性，执行相同的操作，可以封装成一个方法，并在每个 watch 中调用。

```vue
<script>
export default {
  data() {
    return {
      width: 100,
      height: 200
    }
  },
  watch: {
    width() {
      this.calculateArea()
    },
    height() {
      this.calculateArea()
    }
  },
  methods: {
    calculateArea() {
      console.log('面积：', this.width * this.height)
    }
  }
}
</script>
```

或者使用计算属性将多个依赖合并：

```vue
computed: {
  areaDeps() {
    return { width: this.width, height: this.height }
  }
},
watch: {
  areaDeps: {
    handler() {
      this.calculateArea()
    },
    deep: true
  }
}
```

---

## 4. watch 与 computed 的区别

| 特性 | computed | watch |
|------|----------|-------|
| 缓存 | 有缓存，依赖不变则不重新计算 | 无缓存，数据变化立即执行回调 |
| 异步支持 | 不支持异步 | 支持异步 |
| 返回值 | 必须有返回值，作为属性使用 | 无返回值，执行副作用操作 |
| 适用场景 | 派生数据（如全名、总价） | 异步操作、开销大的操作、监听某个值变化后执行动作 |
| 语法 | 函数或 getter/setter 对象 | 函数、字符串、对象（handler+选项） |
| 依赖收集 | 自动收集响应式依赖 | 手动指定监听的源 |

**使用建议**：
- 能用 `computed` 实现的，优先使用 `computed`，因为它更简洁且性能更好。
- 当需要执行异步操作、或数据变化后需要执行复杂逻辑时，使用 `watch`。

---

## 5. watch 的原理简述

`watch` 的实现基于 Vue 的响应式系统和 `Watcher` 类。每个 `watch` 都会创建一个用户自定义的 `Watcher` 实例。

**工作流程**：

1. **初始化阶段**：Vue 在初始化组件时，会遍历 `watch` 配置对象，为每个监听字段创建一个 `Watcher`。
2. **依赖收集**：`Watcher` 会读取被监听字段的值（如 `this.question`），触发该字段的 getter，从而将该 `Watcher` 添加到字段的依赖列表（`Dep`）中。
3. **回调执行**：当被监听字段的值发生变化时，setter 会通知 `Dep`，`Dep` 再通知所有依赖该字段的 `Watcher` 执行更新。`Watcher` 会调用我们定义的回调函数，并传入新值和旧值。
4. **选项处理**：
   - `immediate`：在 `Watcher` 创建后立即执行一次回调，不等待数据变化。
   - `deep`：递归遍历对象的所有属性，为每个属性都添加当前 `Watcher` 作为依赖，从而任何嵌套属性变化都会触发回调。
   - `handler`：当监听选项为对象形式时，实际的回调函数定义在 `handler` 属性中。

**源码简化示例**：

```javascript
// Vue 2 源码简化版
function initWatch(vm, watch) {
  for (const key in watch) {
    const handler = watch[key]
    createWatcher(vm, key, handler)
  }
}

function createWatcher(vm, expOrFn, handler, options) {
  return vm.$watch(expOrFn, handler, options)
}

// $watch 方法内部创建 Watcher
Vue.prototype.$watch = function(expOrFn, cb, options) {
  const watcher = new Watcher(this, expOrFn, cb, options)
  if (options.immediate) {
    cb.call(this, watcher.value)
  }
}
```

---

## 6. 注意事项与常见问题

### 6.1 箭头函数问题

不要在 `watch` 回调中使用箭头函数，否则 `this` 不会指向 Vue 实例。

```javascript
watch: {
  count: (newVal) => {
    console.log(this) // ❌ 这里的 this 不是 Vue 实例，可能为 undefined
  }
}
```

正确写法：

```javascript
watch: {
  count(newVal) {
    console.log(this) // ✅ 指向 Vue 实例
  }
}
```

### 6.2 深度监听的性能问题

`deep: true` 会递归遍历对象的所有属性并添加依赖，如果对象很大或嵌套很深，性能会显著下降。建议：
- 尽量监听对象的特定属性，使用字符串路径。
- 如果需要监听整个对象变化，考虑使用计算属性返回一个新对象，或手动序列化。

### 6.3 监听数组的变化

Vue 能够检测到通过变异方法（`push`、`pop`、`shift`、`unshift`、`splice`、`sort`、`reverse`）修改数组，但对于直接通过索引修改或修改 `length` 属性，无法触发 `watch`。

```javascript
// ❌ 不会触发 watch
this.arr[0] = 'new value'
this.arr.length = 0

// ✅ 会触发 watch
this.arr.splice(0, 1, 'new value')
this.arr = []
```

如果需要监听数组内部元素的变化，可以开启深度监听：

```javascript
watch: {
  arr: {
    handler() { ... },
    deep: true
  }
}
```

### 6.4 监听对象属性时 oldValue 的问题

在深度监听对象时，`oldValue` 可能与 `newValue` 相同，因为它们是同一个对象的引用（对象内部属性变了但对象本身没变）。此时如果需要保留旧值的快照，需要手动深拷贝。

```javascript
watch: {
  user: {
    handler(newVal, oldVal) {
      // 注意：newVal === oldVal，oldVal 已被修改
      console.log(oldVal) // 输出的是新值
    },
    deep: true
  }
}
```

解决方案：手动拷贝旧值。

```javascript
data() {
  return {
    user: { name: '张三' },
    userCopy: null
  }
},
watch: {
  user: {
    handler(newVal) {
      if (this.userCopy) {
        console.log('旧值：', this.userCopy)
      }
      this.userCopy = JSON.parse(JSON.stringify(newVal))
    },
    deep: true,
    immediate: true
  }
}
```

### 6.5 停止监听

`$watch` 方法会返回一个取消监听的函数，可以在不需要时手动停止。

```javascript
const unwatch = this.$watch('count', (newVal) => {
  console.log(newVal)
})

// 某个时刻取消监听
unwatch()
```

---

## 7. 总结

- **`watch` 的作用**：监听响应式数据的变化，执行自定义逻辑（如异步请求、开销大的操作）。
- **支持异步**：与 `computed` 不同，`watch` 可以在回调中执行异步代码。
- **选项**：`deep`（深度监听）、`immediate`（立即执行）、`handler`（回调函数）。
- **适用场景**：异步操作、频繁变化时的控制（如防抖）、依赖多个数据变化执行相同操作、监听路由参数等。
- **与 `computed` 的关系**：能用 `computed` 的优先用 `computed`，需要异步或副作用时用 `watch`。
- **性能注意**：深度监听会消耗性能，尽量监听具体属性；避免使用箭头函数导致 `this` 错误。

掌握 `watch` 可以让你更灵活地应对复杂的交互逻辑，与 `computed` 合理搭配，写出高效、清晰的 Vue 代码。
