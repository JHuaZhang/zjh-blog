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

### 2.3 监听对象中的某个属性

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

### 2.4 监听多个数据源

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

## 3. watch 的完整语法：handler、deep、immediate

在 `watch` 中，除了直接写函数外，还可以使用**对象形式**，该对象包含三个常用选项：`handler`（必需）、`deep`（可选）、`immediate`（可选）。对象形式提供了更精细的控制能力。

### 3.1 handler——回调函数

`handler` 是监听触发时实际执行的函数，它可以是一个函数名（字符串）或直接定义函数。

**基本结构**：

```javascript
watch: {
  someData: {
    handler(newVal, oldVal) {
      // 处理逻辑
    },
    deep: false,      // 默认 false
    immediate: false   // 默认 false
  }
}
```

**两种定义方式**：

1. **直接定义函数**（最常见）：
   ```javascript
   handler(newVal, oldVal) { /* ... */ }
   ```

2. **使用 methods 中定义的方法名**（字符串）：
   ```javascript
   handler: 'methodName'
   ```
   这种方式可以使回调逻辑复用，且代码更清晰。

**示例**：

```vue
<template>
  <div>
    <input v-model="keyword" />
  </div>
</template>

<script>
export default {
  data() {
    return { keyword: '' }
  },
  watch: {
    keyword: {
      handler: 'debouncedSearch',  // 指向 methods 中的方法
      immediate: true
    }
  },
  methods: {
    debouncedSearch(newVal, oldVal) {
      console.log('搜索关键词变化：', oldVal, '->', newVal)
      // 实际搜索逻辑...
    }
  }
}
</script>
```

### 3.2 deep——深度监听

- **作用**：监听对象内部嵌套属性的变化（默认情况下，对象属性变化不会触发 `watch`）。
- **使用场景**：需要监听整个对象或深层嵌套对象的变化时。
- **性能注意**：`deep: true` 会递归遍历对象的所有属性并添加依赖，如果对象很深或很大会有性能损耗，应谨慎使用。

**示例**：

```javascript
data() {
  return {
    user: { name: '张三', address: { city: '北京' } }
  }
},
watch: {
  user: {
    handler(newVal) {
      console.log('user 或其内部任何属性变化', newVal)
    },
    deep: true
  }
}
```

此时，修改 `user.name` 或 `user.address.city` 都会触发回调。

### 3.3 immediate——立即执行

- **作用**：在组件初始化时立即执行一次 `handler`，而不仅仅是等待数据变化。
- **使用场景**：需要根据当前数据立即执行某些逻辑（如初始数据格式化、请求初始数据等）。

**示例**：

```javascript
watch: {
  userId: {
    handler(newId) {
      this.fetchUserData(newId)
    },
    immediate: true   // 组件创建时立即执行一次
  }
}
```

### 3.4 三种写法的对比与总结

| 写法 | 语法 | 支持 deep | 支持 immediate | 适用场景 |
|------|------|-----------|----------------|----------|
| 函数简写 | `someData(newVal, oldVal) { ... }` | ❌ | ❌ | 简单监听，只需执行回调 |
| 对象形式（无选项） | `someData: { handler() { ... } }` | ❌ | ❌ | 代码结构统一，但无特殊需求 |
| 对象形式（含选项） | `someData: { handler, deep, immediate }` | ✅ | ✅ | 需要深度监听或立即执行 |

**推荐做法**：
- 当只需要执行一个简单回调时，使用函数简写（代码简洁）。
- 当需要 `deep` 或 `immediate` 时，使用对象形式并配置相应选项。
- 当回调逻辑复杂或需要复用时，可将 `handler` 指向 `methods` 中的方法名。

---

## 4. watch 的高级用法

### 4.1 监听路由变化

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

### 4.2 监听计算属性

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

### 4.3 监听多个属性并执行相同回调

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

## 5. watch 与 computed 的区别

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

## 6. watch 的原理简述

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
  return function unwatch() {
    watcher.teardown()
  }
}
```

---

## 7. 实例方法 `$watch` 详解

除了在组件选项中使用 `watch`，Vue 还提供了**实例方法 `$watch`**，允许你动态地添加侦听器。`this.$watch` 是 Vue 实例上的一个方法，可以在任何地方（如 `mounted` 钩子、`methods` 中）调用，灵活控制监听的生命周期。

### 7.1 为什么可以写 `this.$watch`？

`$watch` 是 Vue 实例的原型方法，在每个 Vue 组件实例上都可以直接调用。这得益于 Vue 在初始化实例时，会将 `$watch` 方法挂载到实例上，其内部访问了 Vue 的响应式系统。

**核心原因**：
- 每个组件实例都拥有独立的响应式数据（`data`、`computed`、`props` 等）。
- `$watch` 方法内部会创建一个 `Watcher` 对象，并将当前实例作为上下文，从而能够访问到实例的所有响应式属性。
- 由于 JavaScript 的语言特性（原型链），`this.$watch` 可以被所有组件实例共享。

### 7.2 `$watch` 的语法

```javascript
vm.$watch(expOrFn, callback, [options])
```

- `expOrFn`：要监听的字段路径（字符串）或返回值的函数。
- `callback`：数据变化时调用的回调，接收 `(newValue, oldValue)` 两个参数。
- `options`（可选）：
  - `deep`：布尔，是否深度监听。
  - `immediate`：布尔，是否立即执行回调。

返回值：**取消监听函数**，调用它即可停止监听。

### 7.3 基本使用示例

```javascript
export default {
  data() {
    return {
      count: 0
    }
  },
  mounted() {
    // 监听 count 的变化
    const unwatch = this.$watch('count', (newVal, oldVal) => {
      console.log(`count 从 ${oldVal} 变为 ${newVal}`)
    })
    // 5秒后取消监听
    setTimeout(() => {
      unwatch()
    }, 5000)
  }
}
```

### 7.4 监听函数（getter）形式

第一个参数也可以是函数，用于监听复杂的计算表达式。

```javascript
this.$watch(
  () => this.firstName + this.lastName,
  (newFull, oldFull) => {
    console.log('全名变化：', oldFull, '->', newFull)
  }
)
```

### 7.5 深度监听与立即执行

```javascript
this.$watch('user', (newVal) => {
  console.log('user 变化了', newVal)
}, { deep: true, immediate: true })
```

### 7.6 为什么能这样写？原理深度剖析

当我们调用 `this.$watch` 时，Vue 内部会执行以下步骤：

1. **创建 `Watcher` 实例**：`const watcher = new Watcher(vm, expOrFn, cb, options)`。这个 `Watcher` 专门用于自定义监听。
2. **依赖收集**：`Watcher` 的构造函数中，会执行 `expOrFn`（如果是函数则调用，如果是字符串则解析路径并读取值）。在这个过程中，会触发被监听数据的 getter，从而将该 `Watcher` 加入到数据的依赖（`Dep`）中。
3. **处理 `immediate`**：如果 `immediate` 为 `true`，则立即执行一次 `cb`，传入当前值。
4. **处理 `deep`**：如果 `deep` 为 `true`，Vue 会递归遍历对象的所有属性，为每个属性都执行依赖收集，确保任何嵌套属性变化都能触发回调。
5. **返回取消函数**：返回一个函数，该函数调用 `watcher.teardown()`，将 `watcher` 从所有依赖中移除，从而停止监听。

**关键点**：`$watch` 利用了 Vue 响应式系统的“发布-订阅”模式。每个响应式属性都拥有一个 `Dep`（依赖列表），当属性变化时，`Dep` 会通知所有订阅了它的 `Watcher`。`$watch` 创建的自定义 `Watcher` 就是订阅者之一。

### 7.7 实战示例：count 大于 5 时自动停止监听

下面是一个具体场景：监听 `count` 的变化，每次变化时将 `currentWatchCount` 更新为 `count + 5`，当 `count > 5` 时自动断开监听。

```vue
<template>
  <div>
    <button @click="count++">点击给 count + 1</button>
    <div>监听到了 count 的变化，当前 currentWatchCount 为 {{ currentWatchCount }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0,
      currentWatchCount: 0,
      unwatch: null,   // 保存取消监听的函数
    };
  },
  mounted() {
    // 使用 $watch 动态创建监听，并保存取消函数
    this.unwatch = this.$watch(
      'count',
      (newVal) => {
        // 更新 currentWatchCount 为 count + 5
        this.currentWatchCount = newVal + 5;

        // 当 count 大于 5 时，断开监听
        if (newVal > 5) {
          this.unwatch();   // 调用取消函数停止监听
          console.log('count 已大于 5，监听已断开');
        }
      },
      { immediate: true }   // 立即执行一次，让 currentWatchCount 初始化为 5
    );
  },
  beforeDestroy() {
    // 组件销毁前确保取消监听（可选，Vue 会自动清理，但手动取消是好习惯）
    if (this.unwatch) {
      this.unwatch();
    }
  },
};
</script>
```

**说明**：
- 使用 `$watch` 获得取消函数 `unwatch`。
- 在回调中更新 `currentWatchCount`，并判断 `newVal > 5` 时调用 `unwatch()` 停止监听。
- 设置 `immediate: true` 以便组件初始化时立即执行一次，使 `currentWatchCount` 初始化为 `0 + 5 = 5`，与初始 `count=0` 保持一致。
- 组件销毁前再次调用 `unwatch` 是防御性编程，虽然 Vue 会自动清理，但显式取消更安全。

---

## 8. 注意事项与常见问题

### 8.1 箭头函数问题

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

### 8.2 深度监听的性能问题

`deep: true` 会递归遍历对象的所有属性并添加依赖，如果对象很大或嵌套很深，性能会显著下降。建议：
- 尽量监听对象的特定属性，使用字符串路径。
- 如果需要监听整个对象变化，考虑使用计算属性返回一个新对象，或手动序列化。

### 8.3 监听数组的变化

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

### 8.4 监听对象属性时 oldValue 的问题

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

---

## 9. 总结

- **`watch` 的作用**：监听响应式数据的变化，执行自定义逻辑（如异步请求、开销大的操作）。
- **支持异步**：与 `computed` 不同，`watch` 可以在回调中执行异步代码。
- **完整语法**：可以通过对象形式配置 `handler`、`deep`（深度监听）、`immediate`（立即执行）。
- **三种写法**：函数简写（仅回调）、对象无选项、对象含选项，根据需求选择。
- **适用场景**：异步操作、频繁变化时的控制（如防抖）、依赖多个数据变化执行相同操作、监听路由参数等。
- **与 `computed` 的关系**：能用 `computed` 的优先用 `computed`，需要异步或副作用时用 `watch`。
- **性能注意**：深度监听会消耗性能，尽量监听具体属性；避免使用箭头函数导致 `this` 错误。
- **动态监听**：使用 `$watch` 实例方法可以灵活添加、取消侦听器，并支持函数形式的 getter。
- **手动停止监听**：`$watch` 返回取消函数，通过调用它可精确控制监听的生命周期。`watch` 选项中定义的侦听器无法手动停止，它们随组件销毁而销毁。
