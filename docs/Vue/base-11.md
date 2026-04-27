---
group:
  title: 【01】vue基础篇
  order: 1
title: vue自定义指令
order: 11
nav:
  title: Vue
  order: 4
---

## 1. 介绍

自定义指令是 Vue.js 提供的一种扩展机制，允许开发者直接操作 DOM 元素，实现底层逻辑的复用。它通过封装特定行为，弥补了模板语法在复杂 DOM 操作上的不足。

自定义指令通过 `Vue.directive` 全局注册或组件内局部注册，用于在元素生命周期中注入自定义逻辑。`Vue.directive` 的语法规则分为**全局注册**和**局部注册**，支持**函数式**和**对象式**两种定义方式，同时需遵循特定的命名规范。

### 1.1 全局注册语法

通过 `Vue.directive()` 全局定义，适用于所有组件：

**语法规则：**

```javascript
// Vue 2 语法
Vue.directive('指令名', {
  bind(el, binding) {
    /* ... */
  },
  inserted(el, binding) {
    /* ... */
  },
  update(el, binding) {
    /* ... */
  },
  componentUpdated(el, binding) {
    /* ... */
  },
  unbind(el) {
    /* ... */
  },
});

// Vue 3 语法（钩子函数更名）
const app = Vue.createApp({});
app.directive('指令名', {
  beforeMount(el, binding) {
    /* ... */
  },
  mounted(el, binding) {
    /* ... */
  },
  beforeUpdate(el, binding) {
    /* ... */
  },
  updated(el, binding) {
    /* ... */
  },
  beforeUnmount(el, binding) {
    /* ... */
  },
  unmounted(el, binding) {
    /* ... */
  },
});
```

**举例使用：**

```javascript
Vue.directive('debounce', {
  inserted(el, binding) {
    let timeout;
    el.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        binding.value(); // 执行回调
      }, 500);
    });
  },
});
```

```vue
<template>
  <div>
    <input v-debounce="onSearch" placeholder="搜索..." />
  </div>
</template>

<script>
export default {
  methods: {
    onSearch() {
      console.log('搜索触发');
    },
  },
};
</script>
```

如上的 demo 中，我们将方法通过 `Vue.directive` 放在了 `main.js` 中，但是这种写法在自定义插件比较多的时候，就会导致 `main.js` 中的内容过于杂乱，因此我们可以将这个内容进行一个抽离，大概的目录如下：

```
src/
├── utils/
│   ├── directives/
│       ├── focus.js       # 单个指令定义
│       ├── permission.js  # 其他指令
│       └── index.js       # 批量导出指令
└── main.js
```

**指令定义（`utils/directives/focus.js`）**，定义一个全局自动聚焦指令。

```javascript
export default {
  inserted(el) {
    el.focus();
  },
};
```

**批量导出指令（`utils/directives/index.js`）**

```javascript
// 导入所有指令
import focus from './focus';

// 导出指令集合
const directives = {
  focus,
};
// 通过 Vue.use 注册（需配合插件机制）
export default {
  install(Vue) {
    Object.keys(directives).forEach((key) => {
      Vue.directive(key, directives[key]);
    });
  },
};
```

**在 main.js 中全局注册：**

```javascript
import Vue from 'vue';
import App from './App.vue';
import directives from './utils/directives'; // 导入指令插件

// 使用插件机制注册所有指令
Vue.use(directives);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
```

这里之所以可以这么写，因为当调用 `Vue.use(plugin)` 时，Vue 会检查插件对象是否包含 `install` 方法。如果存在，则调用该方法，并将 `Vue` 构造函数作为参数传入：

```javascript
// Vue 源码简化逻辑
function initUse(Vue) {
  Vue.use = function (plugin) {
    if (plugin.install) {
      plugin.install(Vue); // 关键：将 Vue 构造函数传入 install
    }
  };
}
```

`install` 方法是插件的入口，通过它可以向 Vue 添加全局方法、指令、混入等。其第一个参数 `Vue` 是构造函数，通过它可以访问全局 API（如 `Vue.directive`），这里我们重点学习 `Vue.directive`，`Vue.use` 只是简单的提一嘴，后续学习中我们将进一步深入探究。

### 1.2 局部注册语法

在组件选项中通过 `directives` 字段定义，仅当前组件有效。

**语法规则：**

```javascript
export default {
  directives: {
    指令名: {
      // 钩子函数（Vue 3 推荐简写）
      mounted(el, binding) {
        /* ... */
      },
    },
  },
};
```

**举例使用：**

```vue
<template>
  <div>
    <div><input v-debounce="onSearch" placeholder="搜索..." /></div>
    <div><input v-focus placeholder="自动获取焦点" /></div>
  </div>
</template>

<script>
export default {
  methods: {
    onSearch() {
      console.log('搜索触发');
    },
  },
  directives: {
    focus: {
      inserted(el) {
        el.focus();
      },
    },
    debounce: {
      inserted(el, binding) {
        let timer = null;
        el.addEventListener('input', () => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            binding.value();
          }, 500);
        });
      },
    },
  },
};
</script>
```

---

## 2. 钩子函数

自定义指令提供了多个钩子函数，用于在不同阶段执行相应操作：

- `bind`：只调用一次，指令第一次绑定到元素时调用。
- `inserted`：被绑定元素插入父节点时调用。
- `update`：所在组件的 VNode 更新时调用。
- `componentUpdated`：指令所在组件的 VNode 及其子 VNode 全部更新后调用。
- `unbind`：只调用一次，指令与元素解绑时调用。

### 2.1 bind

`bind` 钩子函数在指令第一次绑定到元素时调用，且只调用一次。主要特点：

- 一次性：在整个指令生命周期中只执行一次。
- 早期阶段：在元素插入 DOM 之前调用。
- 无父节点：此时元素的 `parentNode` 为 `null`。
- 适合初始化：适合进行一次性设置工作。

**`bind` 钩子函数的参数：**

```javascript
Vue.directive('my-directive', {
  bind(el, binding, vnode) {
    // el: 指令绑定的元素
    // binding: 包含指令信息的对象
    // vnode: Vue 编译生成的虚拟节点
    console.log(binding);
    // 输出类似：
    // {
    //   name: '指令名',
    //   value: '指令的绑定值',
    //   oldValue: '前一个值',
    //   expression: '绑定值的字符串形式',
    //   arg: '传给指令的参数',
    //   modifiers: '包含修饰符的对象'
    // }
  },
});
```

注意这里的 `arg` 参数，比如我们这个例子中：

```vue
<button v-tooltip.force style="width: auto">按钮提示</button>
```

`force` 就是我们传递给自定义指令的参数。这样我们就可以针对不同的场景，使用特定的处理方式。

**`bind` 钩子的最佳实践：**

- **适合在 `bind` 中执行的操作：**
  - 事件监听器的绑定
  - 初始样式的设置
  - 数据属性的设置
  - 一次性配置工作
- **避免在 `bind` 中执行的操作：**
  - 依赖父节点的 DOM 操作
  - 需要元素尺寸或位置的计算
  - 依赖元素已插入文档流的操作

同时记得在 `unbind` 钩子中清理在 `bind` 中创建的资源：

```javascript
Vue.directive('my-directive', {
  bind(el) {
    // 创建资源
    el._myHandler = function () {
      /* ... */
    };
    el.addEventListener('click', el._myHandler);
  },
  unbind(el) {
    // 清理资源
    el.removeEventListener('click', el._myHandler);
  },
});
```

通过合理使用 `bind` 钩子，可以创建高效、可维护的自定义指令，在指令生命周期的早期阶段完成必要的初始化工作。

**与 `inserted` 钩子的区别：**

- `bind`：只调用一次，指令第一次绑定到元素时调用。此时元素还未插入到 DOM 中。
- `inserted`：也只调用一次，被绑定元素插入父节点时调用（仅保证父节点存在，但不一定已被插入文档中）。

因此，如果我们需要在元素插入到 DOM 之后执行操作（例如需要获取元素的尺寸或位置），就应该使用 `inserted` 钩子。

**举例使用：**

```vue
<template>
  <div v-color="'blue'">这是一个示例</div>
</template>

<script>
export default {
  directives: {
    color: {
      bind(el, binding) {
        console.log(binding);
        el.style.color = binding.value;
      },
      inserted(el, binding) {
        console.log('inserted: 元素已经插入到DOM中');
        // 现在可以获取元素的宽度等属性
        console.log('元素宽度:', el.offsetWidth);
      },
    },
  },
};
</script>
```

### 2.2 inserted

`inserted` 钩子函数在被绑定元素插入父节点时调用（父节点存在即可调用，不必存在于 document 中）。主要特点：

- 一次调用：在元素插入父节点时调用，仅调用一次。
- 可访问父节点：此时可以访问到元素的父节点，因此可以执行依赖父节点布局的操作。
- 适合 DOM 操作：适合执行需要元素已经插入 DOM 树的操作，如获取元素的 `offsetWidth`、`offsetHeight` 等。

**参数：**

与 `bind` 相同，`inserted` 钩子函数也接收三个参数：

- `el`：指令所绑定的元素，可以用来直接操作 DOM。
- `binding`：一个对象，包含指令的很多信息。
- `vnode`：Vue 编译生成的虚拟节点。

我们之前已经见过，自动聚焦指令通常使用 `inserted`，因为 `focus` 方法需要在元素插入 DOM 后才能调用。

```javascript
Vue.directive('focus', {
  inserted: function (el) {
    el.focus();
  },
});
```

**举例使用：**

**① 依赖父元素尺寸的计算**

```javascript
export default {
  inserted(el) {
    // 需要父元素存在才能计算位置
    const parent = el.parentElement;
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      el.style.position = 'absolute';
      el.style.left = `${(parentRect.width - elRect.width) / 2}px`;
      el.style.top = `${(parentRect.height - elRect.height) / 2}px`;
    }
  },
};
```

```vue
<!-- inserted介绍 -->
<template>
  <div style="position: relative; width: 300px; height: 200px; border: 1px solid #ccc">
    <div v-center style="width: 100px; height: 50px; background: lightblue;text-align: center;">
      居中元素
    </div>
  </div>
</template>
```

**② 图片懒加载**

```javascript
export default {
  inserted(el, binding) {
    // 创建观察器，需要元素在DOM中才能观察
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 元素进入视口，加载图片
          el.src = binding.value;
          el.classList.add('loaded');
          observer.unobserve(el);
        }
      });
    });

    // 设置占位图
    el.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==';

    // 开始观察
    observer.observe(el);
    el._lazyObserver = observer;
  },
  unbind(el) {
    // 清理观察器
    if (el._lazyObserver) {
      el._lazyObserver.unobserve(el);
    }
  },
};
```

### 2.3 update

`update` 钩子函数在组件的 VNode 更新时调用，但可能发生在子组件更新之前。指令的值可能发生变化，也可能没有变化。主要特点：

- 多次调用：只要组件更新，就会调用（即使指令的值未改变）。
- 无保证顺序：可能在子组件更新之前调用。
- 适合响应式更新：适合根据指令值的变化来更新 DOM。

**参数介绍：**

`update` 钩子函数接收与 `bind` 和 `inserted` 相同的参数：

- `el`：指令所绑定的元素。
- `binding`：一个对象，包含以下属性：
  - `name`：指令名，不包括 `v-` 前缀。
  - `value`：指令的绑定值，例如：`v-my-directive="1 + 1"` 中，绑定值为 `2`。
  - `oldValue`：指令绑定的前一个值，仅在 `update` 和 `componentUpdated` 钩子中可用。无论值是否改变都可用。
  - `expression`：字符串形式的指令表达式。例如 `v-my-directive="1 + 1"` 中，表达式为 `"1 + 1"`。
  - `arg`：传给指令的参数。例如 `v-my-directive:foo` 中，参数为 `"foo"`。
  - `modifiers`：一个包含修饰符的对象。例如 `v-my-directive.foo.bar` 中，修饰符对象为 `{ foo: true, bar: true }`。
- `vnode`：Vue 编译生成的虚拟节点。
- `oldVnode`：上一个虚拟节点，仅在 `update` 和 `componentUpdated` 钩子中可用。

**使用场景：**

- 响应式更新：当指令绑定的值发生变化时，需要更新 DOM。
- 条件渲染：根据值的变化显示或隐藏元素。
- 动态样式：根据值的变化动态改变样式。

**举例说明：**

动态样式指令，根据绑定的值动态改变元素的背景颜色。

```javascript
Vue.directive('bg-color', {
  bind(el, binding) {
    el.style.backgroundColor = binding.value;
  },
  update(el, binding) {
    // 只有当值确实改变时才更新背景色
    if (binding.value !== binding.oldValue) {
      el.style.backgroundColor = binding.value;
    }
  },
});
```

```vue
<template>
  <div>
    <div v-bg-color="color">{{ message }}</div>
    <button @click="changeColor">改变颜色</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      color: 'red',
      message: '动态背景颜色',
    };
  },
  methods: {
    changeColor() {
      this.color = this.color === 'red' ? 'blue' : 'red';
    },
  },
};
</script>
```

**注意事项：**

- 避免不必要的更新：由于 `update` 在每次组件更新时都会调用，即使指令绑定的值没有变化。因此，在更新逻辑中最好判断值是否真的发生了变化。
- 与 `componentUpdated` 的区别：`update` 在子组件更新之前调用，而 `componentUpdated` 在子组件更新之后调用。如果你的操作依赖于子组件的状态，可能需要使用 `componentUpdated`。

总结：`update` 钩子函数在指令绑定的值发生变化或组件更新时被调用，适合处理指令值的响应式更新。通过比较 `binding.value` 和 `binding.oldValue` 可以避免不必要的操作，提高性能。

### 2.4 componentUpdated

`componentUpdated` 钩子函数在指令所在的组件及其子组件全部更新后调用。主要特点：

- 整个组件更新完成：包括所有子组件都更新完毕。
- DOM 已更新：可以安全地访问更新后的 DOM。
- 适合操作：需要依赖子组件更新后的 DOM 结构的操作。

**`componentUpdated` 钩子函数的参数：**

```javascript
Vue.directive('my-directive', {
  componentUpdated(el, binding, vnode, oldVnode) {
    // el: 指令绑定的元素
    // binding: 包含指令信息的对象
    // vnode: Vue 编译生成的新虚拟节点
    // oldVnode: 上一个虚拟节点
  },
});
```

**`componentUpdated` vs `update` 对比**

| 特性     | update                                  | componentUpdated            |
| -------- | --------------------------------------- | --------------------------- |
| 调用时机 | 组件 VNode 更新时，但子组件可能还未更新 | 组件和子组件都更新后        |
| DOM 状态 | 子组件可能尚未更新，DOM 可能不是最新的  | DOM 已经更新完成            |
| 适合操作 | 准备更新、响应数据变化                  | 执行依赖完整 DOM 结构的操作 |

**举例说明：**

```javascript
Vue.directive('auto-height', {
  bind(el, binding) {
    el._updateHeight = () => {
      const content = el.querySelector('.content');
      if (content) {
        const height = content.scrollHeight;
        el.style.height = height + 'px';
      }
    };
  },
  componentUpdated(el, binding) {
    // 在内容完全渲染后更新高度
    Vue.nextTick(() => {
      el._updateHeight();
    });
  },
  unbind(el) {
    el._updateHeight = null;
  },
});
```

**最佳实践：**

**① 与 `Vue.nextTick()` 配合使用**

```javascript
Vue.directive('my-directive', {
  componentUpdated(el, binding) {
    // 确保 DOM 更新周期完成
    Vue.nextTick(() => {
      this.performDomOperation(el);
    });
  },
});
```

**② 避免不必要的操作**

```javascript
Vue.directive('optimized', {
  componentUpdated(el, binding) {
    // 只有当值真正改变时才执行操作
    if (binding.value !== binding.oldValue) {
      Vue.nextTick(() => {
        this.expensiveOperation(el, binding.value);
      });
    }
  },
});
```

**③ 与 `update` 钩子配合使用**

```javascript
Vue.directive('comprehensive', {
  update(el, binding) {
    // 在更新前做一些准备工作
    if (binding.value !== binding.oldValue) {
      this.prepareForUpdate(el, binding.value);
    }
  },
  componentUpdated(el, binding) {
    // 在完全更新后执行最终操作
    if (binding.value !== binding.oldValue) {
      Vue.nextTick(() => {
        this.finalizeUpdate(el, binding.value);
      });
    }
  },
});
```

### 2.5 unbind

`unbind` 钩子函数在指令与元素解绑时调用，且只调用一次。主要特点：

- 一次性：在整个指令生命周期中只执行一次。
- 清理时机：在指令与元素解绑时调用。
- 适合操作：清理工作，如移除事件监听器、取消定时器、销毁第三方插件实例等。

什么时候会触发解绑呢？比如绑定的元素在 DOM 中被移除，比如使用了 `v-if` 等条件渲染，当然还有页面关闭，路由切换之类的，都会导致 `unbind` 的触发。

**使用场景：**

- 移除在指令中绑定的事件监听器。
- 清除在指令中设置的定时器。
- 销毁在指令中初始化的第三方库实例。
- 其他任何需要清理的工作，避免内存泄漏。

**`unbind` 钩子函数的参数：**

```javascript
Vue.directive('my-directive', {
  unbind(el, binding, vnode) {
    // el: 指令绑定的元素
    // binding: 包含指令信息的对象（注意：此时 binding 对象是只读的，且是解绑前的值）
    // vnode: Vue 编译生成的虚拟节点
  },
});
```

**举例说明：**

```javascript
Vue.directive('click-outside', {
  bind(el, binding, vnode) {
    el._clickOutsideHandler = function (event) {
      if (!el.contains(event.target)) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el._clickOutsideHandler);
  },
  unbind(el) {
    // 移除事件监听器
    document.removeEventListener('click', el._clickOutsideHandler);
    el._clickOutsideHandler = null;
  },
});
```

**生命周期钩子完整流程：**

| 钩子函数         | 调用时机                  | 主要用途                   |
| ---------------- | ------------------------- | -------------------------- |
| bind             | 指令第一次绑定到元素时    | 一次性初始化设置           |
| inserted         | 元素插入父节点时          | DOM 操作、依赖父节点的操作 |
| update           | 组件 VNode 更新时         | 响应数据变化               |
| componentUpdated | 组件和子组件 VNode 更新后 | 依赖完整 DOM 的操作        |
| unbind           | 指令与元素解绑时          | 清理资源、防止内存泄漏     |

---

## 3. Vue 3 对钩子函数的调整

Vue 3 对自定义指令进行了一些调整，使其更符合组件的生命周期，并引入了一些新特性。

| 特性                         | Vue 2                                            | Vue 3                                                                          |
| ---------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------ |
| 钩子函数名称                 | bind，inserted，update，componentUpdated，unbind | created，beforeMount，mounted，beforeUpdate，updated，beforeUnmount，unmounted |
| 钩子函数与组件生命周期一致性 | 不一致                                           | 保持一致                                                                       |
| 在多个根节点组件上的行为     | 未明确支持多根节点组件                           | 支持多根节点组件，指令通过 `$attrs` 传递                                       |
| 局部指令注册                 | 在组件选项的 `directives` 中定义                 | 必须以 `v` 开头的驼峰式命名（如 `vMyDirective`）                               |

在 Vue 3 中，自定义指令的钩子函数与组件的生命周期钩子更加一致。每个钩子函数都有特定的参数，让你能精确控制指令的行为：

- `el`：指令绑定的 DOM 元素，可以直接对它进行操作。
- `binding`：一个对象，包含以下属性：
  - `instance`：使用指令的组件实例。
  - `value`：传递给指令的值（例如 `v-my-directive="1 + 1"` 中，值为 `2`）。
  - `oldValue`：指令的旧值，仅在 `beforeUpdate` 和 `updated` 中可用。
  - `arg`：传递给指令的参数（例如 `v-my-directive:foo` 中，`arg` 为 `foo`）。
  - `modifiers`：一个包含修饰符的对象（例如 `v-my-directive.foo.bar` 中，`modifiers` 为 `{ foo: true, bar: true }`）。
  - `dir`：指令的定义对象本身。
- `vnode`：代表绑定元素的底层 VNode。
- `prevNode`：之前的虚拟节点，仅在 `beforeUpdate` 和 `updated` 钩子中可用。

后续我们将在 Vue 3 的学习中再来回顾这个内容。
