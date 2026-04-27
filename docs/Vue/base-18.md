---
group:
  title: 【01】vue基础篇
  order: 1
title: vue组件通信
order: 18
nav:
  title: Vue
  order: 4
---

## 1. 组件通信概述

在 Vue 应用中，组件往往需要相互传递数据、触发行为。Vue 提供了多种组件通信方式，适用于不同的场景。掌握这些通信方式，是构建复杂应用的基础。

| 通信方式 | 适用场景 | 传递方向 | 响应式特点 |
|---------|----------|----------|------------|
| `props` / `$emit` | 父子组件直接通信 | 父→子（props）；子→父（$emit） | 响应式（props 更新触发子组件渲染） |
| `$refs` / `$parent` / `$children` | 父组件直接访问子组件实例 | 父↔子 | 非响应式，直接获取实例 |
| `provide` / `inject` | 跨多层嵌套组件（祖先→后代） | 祖先→后代 | 默认非响应式，可配置响应式 |
| `$attrs` / `$listeners` | 祖孙组件透传属性和事件 | 祖先→后代 | 响应式（属性变化会传递） |
| 事件总线（Event Bus） | 任意组件，特别是无直接关系 | 任意 | 响应式（需手动管理） |
| Vuex / Pinia | 大型应用，全局状态管理 | 任意 | 响应式 |

---

## 2. 父子组件通信

### 2.1 父传子：`props`

父组件通过**自定义属性**向子组件传递数据，子组件通过 `props` 选项接收。

#### 2.1.1 能传递什么内容？

`props` 可以传递**任何 JavaScript 类型**的数据，包括：

| 类型 | 示例 | 说明 |
|------|------|------|
| 字符串、数字、布尔 | `:msg="'hello'"` `:count="10"` `:is-visible="true"` | 最常用，传值即传字面量或变量 |
| 对象 | `:user="{ name: '张三' }"` | 传递对象引用，子组件修改对象内部属性会影响父组件（如果对象是响应式）——**不推荐直接修改** |
| 数组 | `:list="['a','b']"` | 一样是引用，应避免子组件直接修改 |
| 函数 | `:callback="parentMethod"` | 父组件可以将方法作为 `props` 传递，子组件调用该方法实现回调（但官方更推荐 `$emit`） |
| 其他（Symbol、BigInt 等） | 不常用 | Vue 本身支持，但注意响应式 |

**传递函数示例**：

```vue
<!-- 父组件 -->
<template>
  <child :on-custom-click="handleClick"></child>
</template>
<script>
export default {
  methods: {
    handleClick(data) { console.log('父组件收到', data); }
  }
}
</script>

<!-- 子组件 -->
<template>
  <button @click="emitClick">点击</button>
</template>
<script>
export default {
  props: ['onCustomClick'],
  methods: {
    emitClick() {
      this.onCustomClick && this.onCustomClick('子组件数据');
    }
  }
}
</script>
```

#### 2.1.2 `props` 的校验与默认值

为了让组件更加健壮，Vue 允许对 `props` 进行类型校验、设置默认值、标记必填等。支持的类型包括：

- `String`
- `Number`
- `Boolean`
- `Array`
- `Object`
- `Date`
- `Function`
- `Symbol`
- 自定义构造函数（如 `Person`）

**子组件完整示例**：

```vue
<template>
  <div class="child">
    <h3>子组件 - props 校验示例</h3>
    <p>title: {{ title }}</p>
    <p>count: {{ count }} (类型: {{ typeof count }})</p>
    <p>user: {{ user.name }} - {{ user.age }}</p>
    <p>tags: {{ tags.join(', ') }}</p>
    <p>isActive: {{ isActive }}</p>
    <p>birth: {{ birth }}</p>
    <button v-if="onCustomClick" @click="onCustomClick('hello')">调用父组件传入的函数</button>
  </div>
</template>

<script>
export default {
  props: {
    // 基础类型检查（null 和 undefined 会跳过任何类型检查）
    title: String,
    // 多种可能的类型
    count: [Number, String],
    // 带默认值的对象（注意：对象和数组的默认值必须从工厂函数返回）
    user: {
      type: Object,
      default: () => ({ name: '匿名', age: 0 })
    },
    // 必填的数组
    tags: {
      type: Array,
      required: true
    },
    // 布尔值，带默认值
    isActive: {
      type: Boolean,
      default: false
    },
    // 日期类型
    birth: Date,
    // 自定义验证函数
    age: {
      validator(value) {
        return value >= 0 && value <= 150
      }
    },
    // 函数类型，带默认值（空函数避免调用错误）
    onCustomClick: {
      type: Function,
      default: () => () => {}
    },
    // 使用自定义构造函数进行类型检查
    // author: Person   // 假设有 Person 类
  }
}
</script>
```

**父组件使用示例**：

```vue
<template>
  <div>
    <!-- 基本使用 -->
    <ChildProps 
      title="固定标题"
      :count="123"
      :user="{ name: '李雷', age: 25 }"
      :tags="['vue', '组件']"
      :isActive="true"
      :birth="new Date(1990, 0, 1)"
      :age="30"
      :onCustomClick="handleClick"
    />
    
    <!-- 缺少必填 tags 会报错 -->
    <ChildProps title="错误示例" />
  </div>
</template>

<script>
import ChildProps from './ChildProps.vue'

export default {
  components: { ChildProps },
  methods: {
    handleClick(msg) {
      alert('父组件收到：' + msg)
    }
  }
}
</script>
```

#### 2.1.3 常见的坑与注意事项

1. **单向数据流**  
   父组件传递的 `props` 不能在子组件内部直接修改。如果确实需要修改，应触发 `$emit` 通知父组件修改，或者将 `props` 赋值到 `data` 中作为本地数据（但这样会失去与父组件的联动）。

   ```javascript
   // ❌ 错误
   this.user.name = '李四'   // 如果 user 是对象，会破坏单向数据流
   // ✅ 正确：通知父组件修改
   this.$emit('update:user', newUser)
   ```

2. **引用类型传递的副作用**  
   如果传递的是对象或数组，子组件内部直接修改其属性，父组件的数据也会被修改（因为引用相同）。这种做法虽然可以省去事件通知，但会让数据流难以追踪，不推荐。

3. **`props` 名称大小写**  
   在 HTML 模板中必须使用 kebab-case（`my-prop`），在 JavaScript 中可以使用 camelCase（`myProp`）。Vue 会自动转换。

4. **传递函数的性能考虑**  
   - 如果父组件传递的函数是**内联箭头函数**（如 `:onClick="() => doSomething()"`），每次父组件重新渲染都会生成一个新的函数引用，这会导致子组件的 `props` 发生变化，从而触发子组件不必要的重新渲染。
   - 推荐直接传递**方法引用**（如 `:onClick="doSomething"`），因为方法引用在组件实例上是稳定的，不会引起无谓的子组件更新。
   - 如果需要传递额外参数，可以使用 `@click="() => doSomething(arg)"` 或 `v-on:click="doSomething(arg)"`。Vue 在编译模板时会自动将这种方式包装成一个内联函数，但现代 JavaScript 引擎和 Vue 的更新机制下，这种开销通常可以忽略不计。只有在极端高频渲染场景才需要关注。

5. **传递大量数据**  
   如果一个对象很大，父组件修改了该对象的某个属性，子组件会整体重新渲染（因为 `props` 是响应式对象）。必要时可以使用计算属性提取子组件真正需要的字段，或者使用 `v-once`、函数式组件等优化手段。

### 2.2 子传父：`$emit`

子组件通过 `$emit` 触发自定义事件，父组件通过 `v-on` 监听该事件。

#### 2.2.1 能传递什么内容？

`$emit` 可以传递**任何 JavaScript 类型**的数据，通常传递简单值或对象。

```javascript
// 子组件
this.$emit('update', { id: 1, name: 'newName' })
this.$emit('some-event', 'string', 123)   // 可以传递多个参数
```

父组件监听时，通过 `$event` 获取第一个参数，或者使用多参数写法：

```vue
<child @update="handleUpdate"></child>
<script>
handleUpdate(payload) { console.log(payload) }   // payload 为 { id:1, name:'newName' }
</script>
```

如果子组件 `$emit` 多个参数，父组件可以使用 `arguments` 或 rest 语法：

```vue
<child @some-event="handleMulti"></child>
<script>
handleMulti(first, second) { console.log(first, second) }
// 或
handleMulti(...args) { console.log(args) }
</script>
```

#### 2.2.2 常见的坑与注意事项

1. **事件名命名**：推荐使用 kebab-case（如 `my-event`），因为 HTML 模板对大小写不敏感。虽然在 JavaScript 中使用 camelCase 也可以，但模板中必须写成 kebab-case。

2. **`$emit` 与 `v-model` 的关系**：`v-model` 是 `props` 和 `$emit` 的语法糖。默认情况下，组件上的 `v-model` 会绑定 `value` prop 并监听 `input` 事件。在 Vue 3 中，可以配置 `modelValue` 和 `update:modelValue`。

3. **事件冒泡**：自定义事件不会像原生 DOM 事件一样冒泡。仅在父子组件之间直接传递。

4. **同一事件多次监听**：父组件可以在同一个子组件同一个事件上绑定多个处理函数，都会执行。

5. **在循环中使用 `$emit`**：如果 `v-for` 生成了多个子组件，每个子组件的 `$emit` 都会独立触发父组件的事件处理函数。可通过传递标识（如 `id`）区分来源。

### 2.3 双向绑定：`v-model` 与 `.sync`（Vue 2）

#### 2.3.1 `v-model` 基本使用

`v-model` 是一个语法糖，内部是 `props` + `$emit`。在自定义组件上使用 `v-model` 可以实现简洁的双向绑定。

```vue
<!-- 父组件 -->
<child v-model="parentValue"></child>

<!-- 子组件 -->
<template>
  <input :value="value" @input="$emit('input', $event.target.value)">
</template>
<script>
export default {
  props: ['value']
}
</script>
```

在 Vue 2 中，默认的 prop 是 `value`，事件是 `input`。在 Vue 3 中，默认 prop 变为 `modelValue`，事件变为 `update:modelValue`，并且可以绑定多个 `v-model`。

**使用场景**：表单组件等需要双向同步值的场景。其他情况应优先使用单向 `props` + 事件。

#### 2.3.2 `.sync` 修饰符（Vue 2 特有）

`.sync` 是父组件监听子组件更新特定 prop 的语法糖，类似 `v-model` 但可支持多个 prop。

```vue
<!-- 父组件 -->
<child :title.sync="pageTitle"></child>
<!-- 等价于 -->
<child :title="pageTitle" @update:title="val => pageTitle = val"></child>

<!-- 子组件 -->
<script>
this.$emit('update:title', newTitle)
</script>
```

在 Vue 3 中，`.sync` 已被移除，统一使用 `v-model:propName`。

### 2.4 父组件调用子组件方法：`$refs` 与 `$children`

#### 2.4.1 `$refs` 详细说明

父组件可以通过给子组件添加 `ref` 属性，然后通过 `this.$refs.xxx` 访问子组件实例，从而调用子组件的方法或直接修改子组件的数据。

**完整示例**：

```vue
<!-- 子组件 Child.vue -->
<template>
  <div>
    <p>child data: {{ internalValue }}</p>
    <button @click="increase">内部增加</button>
  </div>
</template>
<script>
export default {
  data() {
    return { internalValue: 0 }
  },
  methods: {
    increase() {
      this.internalValue++
    },
    reset() {
      this.internalValue = 0
    }
  }
}
</script>

<!-- 父组件 Parent.vue -->
<template>
  <div>
    <Child ref="childComp" />
    <button @click="callChildReset">调用子组件的 reset 方法</button>
    <button @click="readChildData">读取子组件 internalValue</button>
  </div>
</template>
<script>
import Child from './Child.vue'
export default {
  components: { Child },
  methods: {
    callChildReset() {
      this.$refs.childComp.reset()
    },
    readChildData() {
      alert(this.$refs.childComp.internalValue)
    }
  }
}
</script>
```

#### 2.4.2 `$children` 的说明

`this.$children` 返回当前组件直接子组件的数组（无序）。**一般不推荐使用**，因为依赖子组件顺序，难以维护。取而代之应使用 `$refs`。

#### 2.4.3 常见坑与注意事项

1. **`$refs` 不是响应式的**：不要在模板或计算属性中依赖 `$refs`，因为它在组件渲染完成后才填充，且在组件更新后不会自动通知变化。

2. **`ref` 命名唯一性**：确保 `ref` 属性值在组件内唯一。如果在 `v-for` 中使用，`$refs` 会是一个数组。

3. **生命周期中的可用性**：`$refs` 在 `mounted` 之后才能访问到，在 `created` 中没有。如果需要在 `created` 中调用子组件方法，可以延迟到 `$nextTick` 或直接将逻辑放在 `mounted` 中。

4. **破坏组件封装性**：过度使用 `$refs` 会让父子组件紧密耦合，子组件的内部实现变化可能影响父组件。建议仅在必须直接操作子组件 DOM 或无法通过 `prop`/`event` 实现时使用（例如调用子组件的 `focus()` 方法）。

5. **在 `v-for` 中使用 `ref`**：会得到一个组件实例数组，顺序与循环顺序一致。如果列表动态变化，`$refs` 会自动更新，但请注意数组索引可能变化。

### 2.5 子组件访问父组件：`$parent`

在子组件内部，可以通过 `this.$parent` 访问父组件实例，进而调用父组件的方法或访问数据。

#### 2.5.1 使用示例

```vue
<!-- 子组件 -->
<template>
  <button @click="modifyParent">修改父组件数据</button>
</template>
<script>
export default {
  methods: {
    modifyParent() {
      this.$parent.parentMsg = '被改了'
    }
  }
}
</script>
```

#### 2.5.2 常见坑与注意事项

1. **强耦合**：`$parent` 让子组件直接依赖父组件结构，一旦父组件发生变化或重构，子组件就可能失效。**强烈不推荐在正常业务逻辑中使用**，仅作为临时调试手段或极特殊场景（比如需要与父组件实例进行底层交互）。

2. **多层嵌套时 `$parent` 不一定是直接父组件**：如果有多个层级，`$parent` 只会指向最近的父组件，而不是根组件。

3. **替代方案**：如果确实需要访问祖先组件的数据/方法，优先使用 `provide/inject` 或全局状态管理。

### 2.6 通过插槽（slot）传递复杂内容

插槽不是严格意义上的数据通信，但可以实现父组件向子组件传递 HTML 结构/组件实例。

```vue
<!-- 子组件 ChildWithSlot.vue -->
<template>
  <div class="card">
    <div class="header">卡片标题</div>
    <div class="content">
      <slot></slot>   <!-- 父组件传入的内容显示在这里 -->
    </div>
    <div class="footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<!-- 父组件使用 -->
<template>
  <ChildWithSlot>
    <p>这是默认插槽内容</p>
    <template v-slot:footer>
      <button>确定</button>
    </template>
  </ChildWithSlot>
</template>
```

**插槽可以传递任何内容**：文本、HTML、数据、甚至组件实例（通过作用域插槽）。这是非常灵活的内容分发方式。

---

## 3. 跨层级组件通信

### 3.1 祖先与后代：`provide` / `inject`

`provide` 和 `inject` 用于祖先组件向其所有后代组件注入依赖，无论层级多深，只要后代组件使用 `inject` 即可接收。

#### 3.1.1 能传递什么？

可以传递**任意类型的数据**，包括基本类型、对象、数组、函数，甚至可以传递组件实例（但一般不推荐）。最常见的是注入一个全局状态对象或方法。

```javascript
// 祖先组件
provide() {
  return {
    theme: 'dark',
    user: this.user,
    updateUser: this.updateUser
  }
}
```

后代通过 `inject` 接收：

```javascript
inject: ['theme', 'user', 'updateUser']
```

#### 3.1.2 响应式问题

默认情况下，`provide` 提供的值**不是响应式的**。如果希望后代组件能响应式更新，需要提供响应式数据：

- **方法一**：直接提供一个响应式对象（如 `data` 中的属性）。
  ```javascript
  data() {
    return { sharedState: { count: 0 } }
  },
  provide() {
    return { sharedState: this.sharedState }
  }
  ```
- **方法二**：在 Vue 2 中使用 `Vue.observable` 包装对象；在 Vue 3 中可以直接传递 `ref` 或 `reactive` 对象（Vue 3 的 `provide`/`inject` 本身支持响应式）。

#### 3.1.3 完整的响应式 provide 示例

**祖先组件**：

```vue
<template>
  <div>
    <button @click="changeTheme">切换主题色</button>
    <Parent />
  </div>
</template>
<script>
import Parent from './Parent.vue'
export default {
  components: { Parent },
  data() {
    return { themeColor: 'blue' }
  },
  provide() {
    // 提供一个可响应的对象
    const reactiveTheme = this.$observable({ color: this.themeColor })
    this.reactiveTheme = reactiveTheme
    return { theme: reactiveTheme }
  },
  methods: {
    changeTheme() {
      this.themeColor = this.themeColor === 'blue' ? 'red' : 'blue'
      this.reactiveTheme.color = this.themeColor   // 手动更新响应式对象
    }
  }
}
</script>
```

**后代组件**：

```vue
<template>
  <div :style="{ color: theme.color }">
    当前主题色：{{ theme.color }}
  </div>
</template>
<script>
export default {
  inject: ['theme']
}
</script>
```

#### 3.1.4 常见坑与注意事项

1. **非响应式陷阱**：如果 `provide` 一个原始值（如 `theme: 'dark'`）且父组件后续修改了这个原始值，后代组件不会自动更新。必须改为响应式对象。

2. **`inject` 的默认值**：可以设置默认值，避免祖先未提供时出错。
   ```javascript
   inject: {
     theme: { default: 'light' }
   }
   ```

3. **作用域**：`provide` 只在祖先组件及其后代中有效，不能跨过不是同一祖先链的组件。

4. **与 `props` 的区别**：`props` 是显式传递，适合层级较少的父子组件；`provide/inject` 适合深层嵌套且中间组件不需要使用这些数据的场景，避免 props 逐层透传（props drilling）。

5. **在 Vue 3 中的改进**：Vue 3 的 `provide` 和 `inject` 原生支持响应式（可以直接传递 `ref`、`reactive`），并且可以在 `setup` 函数中使用组合式 API，更加方便。

### 3.2 透传属性和事件：`$attrs` 和 `$listeners`（Vue 2）

在多层组件中，有时需要将父组件的非 `props` 属性和事件传递给更深层的子组件。

- `$attrs`：包含了父组件传入但未声明为 `props` 的属性（包括 `class`、`style`、普通属性，以及自定义属性）。
- `$listeners`：包含了父组件绑定的事件监听器（不含 `.native` 修饰符）。

#### 3.2.1 完整透传示例

**中间组件 `Wrapper.vue`**：

```vue
<template>
  <!-- 将属性和事件原样传递给更深层的子组件 -->
  <RealChild v-bind="$attrs" v-on="$listeners"></RealChild>
</template>
<script>
import RealChild from './RealChild.vue'
export default {
  components: { RealChild },
  inheritAttrs: false   // 让根元素不自动继承 $attrs
}
</script>
```

**真实子组件 `RealChild.vue`**：

```vue
<template>
  <button :style="{ backgroundColor: bgColor }" @click="handleClick">
    透传按钮
  </button>
</template>
<script>
export default {
  props: ['bgColor'],
  methods: {
    handleClick(e) {
      this.$emit('click', e)
    }
  }
}
</script>
```

**顶层父组件使用**：

```vue
<template>
  <Wrapper bgColor="red" @click="onButtonClick" />
</template>
<script>
import Wrapper from './Wrapper.vue'
export default {
  components: { Wrapper },
  methods: {
    onButtonClick() { alert('按钮被点击') }
  }
}
</script>
```

#### 3.2.2 常见坑与注意事项

1. **`inheritAttrs`**：默认情况下，组件根元素会自动继承所有 `$attrs`（除了 `class` 和 `style`）。如果希望手动控制，可以设置 `inheritAttrs: false`。

2. **`$listeners` 在 Vue 3 中的变化**：Vue 3 将 `$listeners` 合并到 `$attrs` 中，不再单独存在。用法统一为 `v-bind="$attrs"`，事件监听器也会作为 `$attrs` 中的属性（如 `onClick`）。

3. **`class` 和 `style` 的特殊性**：这两个属性总是会合并到根元素上，即使手动绑定 `$attrs` 也会保留。

4. **使用场景**：适用于包装组件（如高阶组件、组件库），避免逐层声明 `props` 和事件。

---

## 4. 任意组件通信

### 4.1 事件总线（Event Bus）

事件总线是一种**发布-订阅**模式，用于在任意两个组件之间通信。通常创建一个空的 Vue 实例作为中央事件总线。

#### 4.1.1 能传递什么？

可以通过 `$emit` 传递**任何 JavaScript 数据**，接收方通过 `$on` 获取。

#### 4.1.2 完整实现

**1. 创建 event-bus.js**

```javascript
import Vue from 'vue'
export const EventBus = new Vue()
```

**2. 发送组件 Sender.vue**

```vue
<template>
  <div>
    <button @click="send">发送消息</button>
  </div>
</template>
<script>
import { EventBus } from './event-bus.js'
export default {
  methods: {
    send() {
      EventBus.$emit('global-message', {
        from: 'Sender',
        text: 'Hello World'
      })
    }
  }
}
</script>
```

**3. 接收组件 Receiver.vue**

```vue
<template>
  <div>
    <p>收到消息：{{ message }}</p>
  </div>
</template>
<script>
import { EventBus } from './event-bus.js'
export default {
  data() {
    return { message: '' }
  },
  created() {
    EventBus.$on('global-message', this.handleMessage)
  },
  beforeDestroy() {
    // 关键：必须移除监听，防止内存泄漏
    EventBus.$off('global-message', this.handleMessage)
  },
  methods: {
    handleMessage(payload) {
      this.message = `${payload.from}: ${payload.text}`
    }
  }
}
</script>
```

#### 4.1.3 常见坑与注意事项

1. **必须手动解除监听**：组件销毁时必须调用 `$off`，否则事件回调会残留在事件总线上，导致内存泄漏和重复执行。

2. **事件名全局唯一**：事件名容易冲突，建议使用命名空间或常量，例如 `'user/logout'`。

3. **调试困难**：大量使用事件总线会使数据流变得隐晦，难以追踪变化来源。大型项目应避免，改用 Vuex/Pinia。

4. **与 `$root` 的区别**：`$root` 也可以作为事件总线，但可能与其他全局事件冲突，且根实例通常承担更多职责。专门创建的空实例更安全。

### 4.2 全局状态管理：Vuex 和 Pinia

当应用规模较大，组件间共享状态复杂时，推荐使用 Vuex（Vue 2）或 Pinia（Vue 3 推荐）进行集中式状态管理。

#### 4.2.1 Vuex 完整示例

**store/index.js**

```javascript
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: { name: '张三', age: 20 },
    count: 0
  },
  getters: {
    userDescription: state => `${state.user.name} (${state.user.age}岁)`
  },
  mutations: {
    SET_USER_NAME(state, name) {
      state.user.name = name
    },
    INCREMENT(state, payload = 1) {
      state.count += payload
    }
  },
  actions: {
    async fetchUser({ commit }, userId) {
      const res = await fetch(`/api/user/${userId}`)
      const data = await res.json()
      commit('SET_USER_NAME', data.name)
    }
  }
})
```

**在组件中使用**：

```vue
<template>
  <div>
    <p>用户：{{ user.name }} - {{ user.age }}</p>
    <p>描述：{{ userDescription }}</p>
    <p>计数：{{ count }}</p>
    <button @click="updateName">修改姓名</button>
    <button @click="incrementCount">增加计数</button>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  computed: {
    ...mapState(['user', 'count']),
    ...mapGetters(['userDescription'])
  },
  methods: {
    ...mapMutations(['SET_USER_NAME', 'INCREMENT']),
    updateName() { this.SET_USER_NAME('李四') },
    incrementCount() { this.INCREMENT(1) }
  }
}
</script>
```

#### 4.2.2 Pinia 完整示例（Vue 3 推荐）

**stores/user.js**

```javascript
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '张三',
    age: 20
  }),
  getters: {
    description: (state) => `${state.name} (${state.age}岁)`
  },
  actions: {
    updateName(newName) {
      this.name = newName
    },
    async fetchUser(id) {
      const res = await fetch(`/api/user/${id}`)
      const data = await res.json()
      this.name = data.name
      this.age = data.age
    }
  }
})
```

**组件使用**：

```vue
<template>
  <div>
    <p>{{ userStore.name }} - {{ userStore.age }}</p>
    <p>{{ userStore.description }}</p>
    <button @click="userStore.updateName('李四')">改名</button>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
</script>
```

#### 4.2.3 常见坑与注意事项

1. **不要在 mutation 外部直接修改 state**（Vuex 严格模式下报错）。Pinia 允许直接修改，但推荐在 action 内进行。

2. **Vuex 模块命名空间**：使用 `namespaced: true` 后，map 辅助函数需要指定模块名。

3. **响应式丢失**：在 Vuex 中，如果直接替换一个对象或数组，新对象必须保持响应式（使用 `Vue.set` 或扩展运算符）。Pinia 基于 `reactive`，一般无此问题。

4. **性能**：合理设计 state 结构，避免过于深层的嵌套。使用 getter 缓存计算结果。

5. **服务端渲染（SSR）**：每个请求应使用新的 store 实例，避免状态污染。

#### 4.2.4 Vuex 与 Pinia 的选择

- Vue 2 项目：Vuex 4 或 使用 Pinia（需要安装 `@vue/composition-api`，但官方推荐 Vuex）。
- Vue 3 项目：优先选择 Pinia（更轻量、更好的 TS 支持、简洁的 API）。

---

## 5. 通信方式选择决策表

| 需求 | 推荐方式 | 理由 |
|------|----------|------|
| 父向子传递简单数据 | `props` | 显式、响应式、规范 |
| 父向子传递复杂内容（HTML） | 插槽（slot） | 更灵活 |
| 子向父传递事件/数据 | `$emit` | 语义清晰，保持单向数据流 |
| 父组件主动操作子组件 | `$refs` | 直接调用方法/访问属性 |
| 祖先组件向后代提供数据，中间不关心 | `provide/inject` | 避免 props 逐层传递 |
| 封装高阶组件，透传属性和事件 | `$attrs` / `$listeners` | 高效透传 |
| 任意两个组件，小型项目 | 事件总线 | 简单，但注意清理 |
| 大型应用，复杂状态共享 | Vuex / Pinia | 可追踪、可维护、支持插件 |
| 极少数情况访问父或根 | `$parent` / `$root` | 慎用，容易耦合 |

---

## 6. 总结

- **父子通信**最常用 `props` + `$emit`，保持单向数据流。`$refs` 仅用于必要时调用子方法。
- **跨层级通信**推荐 `provide/inject` 或 `$attrs`/`$listeners`，避免过度使用事件总线。
- **全局状态**在大型应用中必须选用 Vuex/Pinia，确保状态管理可预测、可调试。
- **注意每种方式的坑**：`props` 不要直接修改、Event Bus 必须解绑、`provide` 默认非响应式等。
- **选择方法的原则**：优先选择耦合度低、清晰度高的方式。不要为了“方便”而滥用 `$parent` 或事件总线。
