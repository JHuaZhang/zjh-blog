---
group:
  title: 【01】vue基础篇
  order: 1
title: vue计算属性computed
order: 15
nav:
  title: Vue
  order: 4
---

## 1. computed 介绍

Vue 的 `computed` 属性是用于声明式地生成基于响应式数据的派生值的特性。它通过缓存机制和依赖追踪优化性能，适用于需要复杂计算或逻辑复用的场景。它用于声明式地定义依赖于其他数据的衍生数据。当依赖的数据发生变化时，计算属性会自动重新计算并返回新的结果。

**基本语法：**

```vue
<template>
  <div>
    <h2>计算属性 computed 示例</h2>
    <p>姓名：{{ fullName }}</p>
    <p>单价：{{ price }}</p>
    <p>数量：{{ quantity }}</p>
    <p>总价：{{ total }}</p>
    <button @click="total += 100">总价加100</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      firstName: '张',
      lastName: '三',
      price: 100,
      quantity: 2,
    };
  },
  computed: {
    // 基本用法
    fullName() {
      return this.firstName + ' ' + this.lastName;
    },
    // 带 getter 和 setter
    total: {
      get() {
        return this.price * this.quantity;
      },
      set(newValue) {
        this.quantity = newValue / this.price;
      },
    },
  },
};
</script>
```

**如何使用？**

`computed` 和 `data` 同级，计算属性写在 `computed` 中；写起来像方法，用起来像属性。

**特点（注意点）**

- 一定要有返回值。
- 可以使用 `data` 中的已知值。
- 只要跟计算属性相关的数据发生了变化，计算属性就会重新计算，不相关的属性无论如何变化，都不会导致计算属性变化。
- 计算属性名**不能和 `data` 中的数据重名**（因为要使用 `data` 中的数据）。

**什么时候使用？**

想要根据 `data` 中的已知值，得到一个新值，并且这个新值会随着相关数据的变化而变化。我们可以将同一函数定义为一个 `method` 而不是一个计算属性。对于最终的结果，两种方式确实是相同的。然而，不同的是**计算属性是基于它们的依赖进行缓存的**。计算属性只有在它的相关依赖发生改变时才会重新求值。这就意味着只要 `message` 还没有发生改变，多次访问 `reversedMessage` 计算属性会立即返回之前的计算结果，而不必再次执行函数。而使用 `methods`，在重新渲染的时候，函数总会重新调用执行。

---

## 2. computed 和 watch 的区别

### 2.1 计算属性 computed 特点

- **支持缓存**，只有依赖数据发生改变，才会重新进行计算。
- **不支持异步**，当 `computed` 内有异步操作时无效，无法监听数据的变化。
- `computed` 属性值会默认走缓存，计算属性是基于它们的响应式依赖进行缓存的，也就是基于 `data` 中声明过或者父组件传递的 `props` 中的数据通过计算得到的值。
- 如果一个属性是由其他属性计算而来的，这个属性依赖其他属性，是一个**多对一**或者**一对一**，一般用 `computed`。
- 如果 `computed` 属性值是函数，那么默认会走 `get` 方法；函数的返回值就是属性的属性值；在 `computed` 中的属性，都有一个 `get` 和一个 `set` 方法，当数据变化时，调用 `set` 方法。

### 2.2 侦听属性 watch 特点

- **不支持缓存**，数据变，直接会触发相应的操作。
- `watch` **支持异步**。
- 监听的函数接收两个参数，第一个参数是最新的值；第二个参数是输入之前的值。
- 当一个属性发生变化时，需要执行对应的操作；**一对多**；监听数据必须是 `data` 中声明过或者父组件传递过来的 `props` 中的数据，当数据变化时，触发其他操作，函数有两个参数：
  - `immediate`：组件加载立即触发回调函数执行。
  - `deep`：深度监听，为了发现对象内部值的变化，复杂类型的数据时使用，例如数组中的对象内容的改变，注意监听数组的变动不需要这么做。注意：`deep` 无法监听到数组的变动和对象的新增，参考 Vue 数组变异，只有以响应式的方式触发才会被监听到。

### 2.3 如何选择使用 watch 和 computed

Vue 提供了一种更通用的方式来观察和响应 Vue 实例上的数据变动：**侦听属性**。当你有一些数据需要随着其它数据变动而变动时，很容易滥用 `watch`，然而，通常更好的做法是使用计算属性而不是命令式的 `watch` 回调。

当需要在数据变化时执行异步或开销较大的操作时，`watch` 方式是最有用的。其允许我们执行异步操作（访问一个 API），限制我们执行该操作的频率，并在我们得到最终结果前，设置中间状态。这些都是计算属性无法做到的。

> 这样来看，`watch` 完全可以替代 `computed`？什么情况下，只能使用 `computed` 呢？

回顾 `computed` 最大特点就是**缓存**，所以上述问题可以转换为：哪些情况下，我们需要依赖缓存？

当改变 `data` 变量值时，整个应用会重新渲染，Vue 会将数据重新渲染到 DOM 中。这时，如果我们使用 `methods`，随着渲染，方法也会被调用，而 `computed` 不会重新进行计算，从而性能开销比较小。当新的值需要大量计算才能得到，缓存的意义就非常大。

如果 `computed` 所依赖的数据发生改变时，计算属性才会重新计算，并进行缓存；当改变其他数据时，`computed` 属性并不会重新计算，从而提升性能。

**示例对比：**

```javascript
<div id="demo">{{ fullName }}</div>;

// 用 watch 实现
var vm = new Vue({
  el: '#demo',
  data: {
    firstName: 'Foo',
    lastName: 'Bar',
    fullName: 'Foo Bar',
  },
  watch: {
    firstName: function (val) {
      this.fullName = val + ' ' + this.lastName;
    },
    lastName: function (val) {
      this.fullName = this.firstName + ' ' + val;
    },
  },
});
```

```javascript
// 用 computed 实现
var vm = new Vue({
  el: '#demo',
  data: {
    firstName: 'Foo',
    lastName: 'Bar',
  },
  computed: {
    fullName: function () {
      return this.firstName + ' ' + this.lastName;
    },
  },
});
```

很明显 `computed` 实现起来更简洁、更方便，也更容易理解。

**结论**：`computed` 更加简单高效，因此优先考虑使用 `computed`。而有些必须使用到 `watch` 的场景（如需要进行异步操作），则使用 `watch`。

---

## 3. computed 和 methods 的区别

理论上，`computed` 所有实现可以使用 `methods` 完全替换。

```html
<p>Reversed message: "{{ reversedMessage() }}"</p>
<p>Reversed message: "{{ reversedMessage }}"</p>
```

```javascript
// 计算属性
computed: {
  reversedMessage () {
    return this.message.split('').reverse().join('')
  }
}

// 方法
methods: {
  reversedMessage: function () {
    return this.message.split('').reverse().join('')
  }
}
```

**计算属性是基于它们的响应式依赖进行缓存的**。只在相关响应式依赖发生改变时它们才会重新求值。这就意味着只要 `message` 还没有发生改变，多次访问 `reversedMessage` 计算属性会立即返回之前的计算结果，而不必再次执行函数。而方法却会执行。

这也同样意味着下面的计算属性将不再更新，因为 `Date.now()` 不是响应式依赖：

```javascript
computed: {
  now: function () {
    return Date.now()
  }
}
```

**我们为什么需要缓存？** 假设我们有一个性能开销比较大的计算属性 **A**，它需要遍历一个巨大的数组并做大量的计算。然后我们可能有其他的计算属性依赖于 **A**。如果没有缓存，我们将不可避免的多次执行 **A** 的 `getter`！**如果你不希望有缓存，请用方法来替代。**

---

## 4. get 和 set 回调函数的使用

`computed` 计算属性中包含了 `set` 和 `get` 两个方法（回调函数）。

- `get` 回调函数：当需要读取当前属性值时调用，根据相关的数据计算并返回当前属性的值。
- `set` 回调函数：监视当前属性值发生改变时调用，更新相关的属性值。

一般情况下，我们只是使用了 `computed` 中的 `getter` 属性，默认只有 `getter`。

**只有当 `computed` 监测的值变化的时候，也就是下面例子中的 `fullName` 变化的时候，`set` 才会被调用。**

```html
<div id="app">全名为：{{fullName}}</div>
<script>
  var vm = new Vue({
    el: '#app',
    data: {
      firstName: 'zhang',
      lastName: 'jianhua',
    },
    computed: {
      fullName() {
        return this.firstName + this.lastName;
      },
    },
  });
</script>
```

如上，当我们直接这样使用的时候，其实它只调用了 `getter` 属性，读取到对应的值。只有当我们修改对应的值，才会触发其中的 `set` 方法。

```html
<body>
  <div id="app">全名为：{{fullName}}</div>
  <script>
    var vm = new Vue({
      el: '#app',
      data: {
        firstName: 'zhang',
        lastName: 'jianhua',
      },
      computed: {
        fullName: {
          get() {
            console.log('---调用了fullName的get方法---');
            return this.firstName + '' + this.lastName;
          },
          set(newValue) {
            // 我们可以在控制台输入 vm.fullName = '新值' 修改数据，这样就会触发该方法
            console.log('---调用了fullName的set方法---');
            console.log(newValue); // 该值为我们修改的内容
          },
        },
      },
    });
  </script>
</body>
```

**实际应用场景示例（分页组件）：**

如下例子是一个分页组件的部分内容，这里我们需要父组件给子组件传入 `page`，因此 `page` 放在了 `props` 中，而我们想在分页组件中使用这个传入的 `page`，如果直接在页面中使用的话，我们是无法在分页组件中修改 `page` 的值的。通常我们可以通过点击等事件将修改发送给父组件，再触发父组件的内容来进行修改，这样就存在一个问题：无论 `page` 的值是否修改，只要点击了对应的事件，就会触发父组件中的事件，这会对性能等有一定影响。虽然能够达到相同的效果，但是使用 `computed` 更加合适。

```javascript
computed: {
  currentPage: {
    get() {
      return this.page
    },
    set(val) {
      this.$emit('update:page', val)
    }
  }
}
```

这样我们就可以在 `get` 中获取对应 `props` 传过来的值，当我们在子组件中操作修改值的时候，就调用 `set` 方法，进而修改父组件。

---

## 5. 问题解读

### 5.1 computed 为什么不支持异步

- **响应式依赖追踪**：计算属性通过响应式系统自动追踪其依赖。当依赖发生变化时，计算属性会重新计算。这个机制是同步的，因为 Vue 需要在同一个事件循环中完成依赖收集和更新，以保持数据的一致性。
- **缓存特性**：计算属性具有缓存功能，只有当其依赖发生改变时才会重新计算。这种缓存机制依赖于同步操作，因为异步操作的结果无法立即返回，也就无法在同一个事件循环中确定依赖关系。
- **模板渲染的同步性**：在 Vue 的模板渲染中，计算属性通常用于模板绑定。模板渲染是同步的过程，如果计算属性是异步的，那么模板可能无法及时获取到正确的值，导致渲染结果不符合预期。
- **设计哲学**：Vue 将异步操作放在 `watch` 选项或者方法中处理，这样可以让开发者明确地知道哪些操作是异步的。而计算属性则专注于基于依赖的同步计算。

尽管 `computed` 本身不支持异步，但在实际开发中，我们确实有需要根据异步操作的结果来派生状态的情况。Vue 提供了几种替代方案：

- 使用 `watch` 或 `watchEffect`：可以监听数据的变化，并在变化时执行异步操作，然后将结果赋值给一个响应式数据。
- 使用异步函数和 `then`：在需要的地方调用异步函数，然后更新数据。
- Vue 3 的 Composition API 中的 `computed` 与异步：在 Vue 3 中，虽然 `computed` 仍然是同步的，但我们可以结合 `ref` 和异步函数来实现类似异步计算属性的效果。

### 5.2 在 computed 中编写异步代码会发生什么？

尽管我们理解了 `computed` 不支持异步的原因，但很多开发者在实际开发中可能会尝试在计算属性中编写异步代码（比如 `setTimeout`、`Promise`、`async/await`）。下面通过具体示例来展示这样做会产生什么问题，以便加深理解。

#### 5.2.1 计算属性中直接返回 Promise

```vue
<template>
  <div>
    <p>用户 ID: {{ userId }}</p>
    <p>用户信息: {{ userInfo }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userId: 1,
    };
  },
  computed: {
    userInfo() {
      // ❌ 错误：返回 Promise 对象，而不是数据本身
      return fetch(`https://jsonplaceholder.typicode.com/users/${this.userId}`).then((res) =>
        res.json(),
      );
    },
  },
};
</script>
```

**结果**：页面上会直接显示 `[object Promise]`，而不是我们期望的用户数据。  
**原因**：计算属性的要求是**同步返回一个具体的值**。Vue 在模板渲染时会直接取这个返回值，不会等待 Promise 完成。因此渲染时得到的是一个 Promise 实例对象，而不是异步结果。

#### 5.2.2 计算属性中使用 async/await

```vue
<template>
  <div>
    <p>用户 ID: {{ userId }}</p>
    <p>用户信息: {{ userInfo }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userId: 1,
    };
  },
  computed: {
    async userInfo() {
      // ❌ 错误：async 函数总是返回 Promise
      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${this.userId}`);
      return await res.json();
    },
  },
};
</script>
```

**结果**：同样会在页面上显示 `[object Promise]`，因为 `async` 函数的返回值始终是一个 Promise 对象，而不是实际数据。Vue 不会等待该 Promise 决议。

#### 5.2.3 试图使用回调或定时器

```vue
<template>
  <div>
    <p>当前时间: {{ currentTime }}</p>
  </div>
</template>

<script>
export default {
  computed: {
    currentTime() {
      let result = null;
      // ❌ 错误：setTimeout 异步更新 result，但计算属性已经返回了
      setTimeout(() => {
        result = new Date().toLocaleTimeString();
      }, 1000);
      return result; // 永远返回 null
    },
  },
};
</script>
```

**结果**：页面一直显示 `null`，永远不会更新。  
**原因**：`computed` 的执行是同步的，`setTimeout` 的回调在将来执行，而此时计算属性已经返回了最初的 `result` 值（`null`）。Vue 不会因为异步回调中修改了变量就去重新触发计算属性的更新（除非该变量是响应式数据，但这里只是普通变量）。

#### 5.2.4 依赖响应式数据仍无法触发异步更新

```vue
<template>
  <div>
    <p>用户 ID: {{ userId }}</p>
    <p>处理后的描述: {{ processedDescription }}</p>
    <button @click="userId++">切换用户</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userId: 1,
      description: '原始描述',
    };
  },
  computed: {
    processedDescription() {
      // 虽然 this.userId 是响应式依赖，但里面包含异步操作
      setTimeout(() => {
        // 异步修改 description
        this.description = `用户 ${this.userId} 的描述已更新`;
      }, 500);
      return this.description; // 立即返回旧的 description
    },
  },
};
</script>
```

**结果**：点击按钮切换 `userId` 时，页面显示的 `processedDescription` 仍然是旧的 `description` 值，不会立即更新。即使 500ms 后 `description` 被修改了，`computed` 的返回值也不会自动刷新，因为 `computed` 的依赖追踪只收集了 `this.description`（读取它），但没有追踪 `setTimeout` 回调中的写入。而且 `setTimeout` 改变了 `description`，但由于 `description` 本身是响应式数据，视图确实会在数据变化时重新渲染，但此时 `computed` 不会因为 `setTimeout` 内的赋值而重新执行（因为执行时机已经过去了）。最终可能会导致视图与数据不同步，逻辑混乱。

#### 5.2.5 为什么 computed 不等待异步？

从源码层面看，`computed` 的 getter 在执行时会创建一个计算属性 Watcher，该 Watcher 会立刻执行 getter 并记录获取到的响应式依赖。如果 getter 中包含了异步操作（例如 Promise、setTimeout），那么：

- 异步操作中的依赖（比如在 `then` 里读取另一个响应式数据）不会被收集到当前这个计算属性的依赖列表中，因为依赖收集是同步发生的。
- 计算属性执行 getter 后，会直接返回一个值（可能是 `undefined` 或 Promise），而 Vue 并不会等待异步完成。后续异步操作完成时，计算属性早已返回，且没有机制重新触发计算。

因此，**在计算属性中编写异步代码不仅无法得到预期结果，还可能导致依赖追踪错乱、性能下降或页面渲染异常**。

#### 5.2.6 正确处理异步派生状态的方案

如果你需要根据异步操作的结果来派生状态，推荐使用 `watch` 或 `watchEffect` 配合普通响应式变量，或者使用方法并在合适时机调用。例如：

```vue
<template>
  <div>
    <p>用户 ID: {{ userId }}</p>
    <p>用户信息: {{ userInfo }}</p>
    <button @click="userId++">切换用户</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userId: 1,
      userInfo: null,
    };
  },
  watch: {
    userId: {
      immediate: true, // 立即执行一次
      handler(newId) {
        // 执行异步操作，并将结果赋给 userInfo
        fetch(`https://jsonplaceholder.typicode.com/users/${newId}`)
          .then((res) => res.json())
          .then((data) => {
            this.userInfo = data;
          });
      },
    },
  },
};
</script>
```

或者使用 Vue 3 的 `watchEffect`：

```vue
<script setup>
import { ref, watchEffect } from 'vue';

const userId = ref(1);
const userInfo = ref(null);

watchEffect(async () => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId.value}`);
  userInfo.value = await res.json();
});
</script>
```

这些方式都明确地处理了异步逻辑，并且能够正确响应依赖变化，更新视图。

#### 5.2.7 小结

| 错误做法                                    | 正确替代                                |
| ------------------------------------------- | --------------------------------------- |
| 在 `computed` 中返回 Promise / 使用 `async` | 使用 `watch` + `data` 属性              |
| 在 `computed` 中写 `setTimeout` / 回调      | 使用 `watch` 或 `methods` 手动触发      |
| 依赖异步数据但希望自动更新                  | 使用 `watchEffect` (Vue 3) 或组合式 API |

总结：**`computed` 是同步的、有缓存的、依赖可追踪的派生状态工具，不应在其中编写任何异步代码。** 若需要响应异步数据变化，请使用 `watch` / `watchEffect` 结合响应式变量。

---

## 6. 总结

- **计算属性 `computed`** 是基于响应式依赖进行缓存的派生数据，具有高效、自动追踪依赖的特点。
- **与 `methods` 的区别**：`computed` 有缓存，`methods` 无缓存；`computed` 适合无副作用的派生数据，`methods` 适合事件处理或需要主动调用的逻辑。
- **与 `watch` 的区别**：`computed` 多对一/一对一依赖且支持缓存；`watch` 一对多、支持异步、不支持缓存。优先使用 `computed` 满足需求，必要时使用 `watch`。
- **支持 `getter` 和 `setter`**：可以定义可写的计算属性，实现双向绑定的衍生逻辑。
- **不支持异步**：设计上保持同步和缓存一致性，异步场景应使用 `watch` 或组合式 API。
- **命名注意**：计算属性名不能与 `data` 中的属性名重复。
- **错误用法警告**：在 `computed` 中编写异步代码（Promise、async/await、setTimeout 等）将导致无法得到正确结果，应使用 `watch` 等合适的方式处理异步逻辑。

正确使用 `computed` 可以显著提高代码性能和可维护性，避免不必要的重复计算。
