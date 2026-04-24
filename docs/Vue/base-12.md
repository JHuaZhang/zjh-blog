---
group:
  title: 【01】vue基础篇
  order: 1
title: vue过滤器filter
order: 12
nav:
  title: Vue
  order: 4
---

## 1. Vue 过滤器介绍

Vue.js 允许自定义过滤器，可被用于一些常见的文本格式化（也就是修饰文本，但是文本内容不会改变）。过滤器可以用在两个地方：**双花括号插值**和 **`v-bind` 表达式**（后者从 2.1.0+ 开始支持）。过滤器应该被添加在 JavaScript 表达式的尾部，由管道符 `|` 指示，表达式的值将作为形参传入到 filter 中。

过滤器使用管道符号 `|` 来调用，语法如下：

```vue
<!-- 在双花括号中使用 -->
{{ message | capitalize }}

<!-- 在 v-bind 中使用 -->
<div :id="rawId | formatId"></div>
```

其中，`message` 和 `rawId` 是数据，`capitalize` 和 `formatId` 是过滤器的名称。

过滤器分**全局过滤器**和**局部过滤器**：

- 全局过滤器：`Vue.filter`
- 局部自定义指令：`filters`

---

## 2. 全局过滤器

全局过滤器可以在所有组件中使用，通过 `Vue.filter()` 方法来定义。

```javascript
// main.js
import Vue from 'vue';
import App from './App.vue';

// 定义全局过滤器
Vue.filter('currency', function (value) {
  if (typeof value !== 'number') {
    return value;
  }
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  return formatter.format(value);
});

new Vue({
  render: (h) => h(App),
}).$mount('#app');
```

**使用范围**：跨组件全局可用，适用于多个页面或组件复用的场景。

```vue
<!-- App.vue -->
<template>
  <div>
    <p>{{ price | currency }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      price: 1234.56,
    };
  },
};
</script>
```

在上述代码中，在 `main.js` 中定义了一个名为 `currency` 的全局过滤器，它的作用是将数字格式化为美元货币格式。在 `App.vue` 组件中可以直接使用该过滤器。

---

## 3. 局部过滤器

局部过滤器只能在定义它的组件中使用，在组件选项中通过 `filters` 选项来定义。

```vue
<template>
  <div>
    <!-- 使用过滤器 -->
    <p>{{ message | capitalize }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'hello world',
    };
  },
  filters: {
    // 定义局部过滤器
    capitalize(value) {
      if (!value) return '';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },
};
</script>
```

在上述代码中，定义了一个名为 `capitalize` 的局部过滤器，它的作用是将字符串的首字母大写。在模板中使用 `{{ message | capitalize }}` 调用该过滤器，将 `message` 的值进行处理后显示。

---

## 4. 过滤器的链式调用

过滤器可以进行链式调用，即一个过滤器的输出可以作为另一个过滤器的输入。

```vue
<template>
  <div>
    <!-- 链式调用过滤器 -->
    <p>{{ message | capitalize | reverse }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'hello world',
    };
  },
  filters: {
    capitalize(value) {
      if (!value) return '';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    reverse(value) {
      if (!value) return '';
      value = value.toString();
      return value.split('').reverse().join('');
    },
  },
};
</script>
```

在上述代码中，先调用 `capitalize` 过滤器将字符串首字母大写，然后将结果作为输入传递给 `reverse` 过滤器进行反转。

---

## 5. 过滤器的参数

过滤器可以接受参数，参数在过滤器名称后面通过逗号分隔。

```vue
<template>
  <div>
    <!-- 使用带参数的过滤器 -->
    <p>{{ message | slice(3, 7) }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'hello world',
    };
  },
  filters: {
    slice(value, start, end) {
      if (!value) return '';
      value = value.toString();
      return value.slice(start, end);
    },
  },
};
</script>
```

在上述代码中，`slice` 过滤器接受 `start` 和 `end` 两个参数，用于截取字符串的指定部分。

---

## 6. 注意事项

1. 过滤器应该是**纯函数**，即相同的输入应该始终返回相同的输出，不应该有副作用。
2. 在 **Vue 3 中，`filter` 被移除了**，官方建议使用 `computed` 或 `method` 来替代。这是因为 `filter` 在模板中使用的语法与 JavaScript 表达式不一致，而且需要额外的上下文，这增加了学习和使用的成本。

---

## 7. 使用 computed 替代 filter

在 Vue 中，过滤器（filter）主要用于文本格式化，而计算属性（computed）是依赖于响应式数据进行计算并返回结果的。在 Vue 3 中，`filter` 被移除了，官方建议使用 `computed` 或 `method` 来替代。这是因为 filter 在模板中使用的语法与 JavaScript 表达式不一致，而且需要额外的上下文，这增加了学习和使用的成本。

### 7.1 简单文本格式化

假设之前使用过滤器将字符串首字母大写，以下是使用过滤器和计算属性的对比示例。

**使用过滤器：**

```vue
<template>
  <div>
    {{ message | capitalize }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'hello world',
    };
  },
  filters: {
    capitalize(value) {
      if (!value) return '';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },
};
</script>
```

**使用计算属性替代：**

```vue
<template>
  <div>
    {{ capitalizedMessage }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'hello world',
    };
  },
  computed: {
    capitalizedMessage() {
      if (!this.message) return '';
      return this.message.charAt(0).toUpperCase() + this.message.slice(1);
    },
  },
};
</script>
```

在这个例子中，原本通过过滤器 `capitalize` 实现的首字母大写功能，现在使用计算属性 `capitalizedMessage` 来实现。计算属性会根据 `message` 的变化自动更新结果。

### 7.2 数字格式化

比如将数字格式化为货币形式，同样对比过滤器和计算属性的实现。

**使用过滤器：**

```vue
<template>
  <div>
    {{ price | currency }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      price: 1234.56,
    };
  },
  filters: {
    currency(value) {
      if (typeof value !== 'number') {
        return value;
      }
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
      return formatter.format(value);
    },
  },
};
</script>
```

**使用计算属性替代：**

```vue
<template>
  <div>
    {{ formattedPrice }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      price: 1234.56,
    };
  },
  computed: {
    formattedPrice() {
      if (typeof this.price !== 'number') {
        return this.price;
      }
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
      return formatter.format(this.price);
    },
  },
};
</script>
```

这里原本使用过滤器 `currency` 进行数字格式化，现在使用计算属性 `formattedPrice` 来完成相同的功能。

### 7.3 链式过滤器替代

如果有链式过滤器，也可以用多个计算属性组合来替代。

**使用链式过滤器：**

```vue
<template>
  <div>
    {{ message | capitalize | reverse }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'hello world',
    };
  },
  filters: {
    capitalize(value) {
      if (!value) return '';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    reverse(value) {
      if (!value) return '';
      value = value.toString();
      return value.split('').reverse().join('');
    },
  },
};
</script>
```

**使用计算属性替代：**

```vue
<template>
  <div>
    {{ reversedCapitalizedMessage }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'hello world',
    };
  },
  computed: {
    capitalizedMessage() {
      if (!this.message) return '';
      return this.message.charAt(0).toUpperCase() + this.message.slice(1);
    },
    reversedCapitalizedMessage() {
      if (!this.capitalizedMessage) return '';
      return this.capitalizedMessage.split('').reverse().join('');
    },
  },
};
</script>
```

在这个例子中，原本的链式过滤器 `capitalize` 和 `reverse` 被两个计算属性 `capitalizedMessage` 和 `reversedCapitalizedMessage` 替代。

综上所述，计算属性可以很好地替代过滤器的功能，并且计算属性具有更好的可读性和可维护性，尤其是在处理复杂逻辑时优势更明显。
