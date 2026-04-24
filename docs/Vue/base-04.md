---
group:
  title: 【01】vue基础篇
  order: 1
title: vue指令v-html与v-text
order: 4
nav:
  title: Vue
  order: 4
---

## 1. 初识 Vue 指令

Vue 指令（Directives）是带有 `v-` 前缀的特殊属性。Vue 为 HTML 元素增加了这些自定义属性，其职责是：**当表达式的值改变时，将其产生的连带影响，响应式地作用于 DOM**。

一些指令可以带参数和修饰符（如 `v-bind:title`、`v-on:click.prevent`），本章重点介绍两个最基础的文本/内容渲染指令：`v-html` 和 `v-text`。

---

## 2. v-html 指令

### 2.1 基本作用

`v-html` 指令用于将绑定的 **HTML 字符串** 解析为真实 DOM 元素并渲染到页面上。它不会转义 HTML 标签，而是直接作为 HTML 结构输出。

```vue
<template>
  <div v-html="htmlContent"></div>
</template>

<script>
export default {
  data() {
    return {
      htmlContent: '<p><strong>加粗文本</strong></p>',
    };
  },
};
</script>
```

上面示例中，`v-html="htmlContent"` 会渲染出一个带有加粗文字的段落。

### 2.2 与普通插值（`{{ }}`）的区别

| 方式               | 渲染效果      | HTML 标签处理                          |
| ------------------ | ------------- | -------------------------------------- |
| `{{ rawHtml }}`    | 纯文本        | 转义为 HTML 实体（如 `<` 变成 `&lt;`） |
| `v-html="rawHtml"` | 真实 DOM 元素 | 解析并渲染标签                         |

```vue
<template>
  <div>
    <!-- 显示原字符串：<b>粗体</b> -->
    <p>{{ rawHtml }}</p>
    <!-- 渲染为加粗文本 -->
    <p v-html="rawHtml"></p>
  </div>
</template>

<script>
export default {
  data() {
    return { rawHtml: '<b>粗体</b>' };
  },
};
</script>
```

### 2.3 核心应用场景

- **富文本编辑器内容展示**：如博客系统、CMS 后台，将用户编辑的富文本（含格式）渲染到前端。
- **动态模板渲染**：从服务器获取 HTML 片段（如邮件模板、公告、协议内容）并插入页面。
- **Markdown 转换后的内容展示**：配合 Markdown 解析库（如 `marked`），将 `.md` 文本转为 HTML 后使用 `v-html` 渲染。

```vue
<template>
  <div v-html="renderedMarkdown"></div>
</template>

<script>
import { marked } from 'marked';
export default {
  data() {
    return { markdownText: '# 标题\n\n正文内容...' };
  },
  computed: {
    renderedMarkdown() {
      return marked(this.markdownText);
    },
  },
};
</script>
```

### 2.4 安全风险与应对措施

#### ⚠️ XSS 攻击风险

`v-html` 直接解析 HTML 字符串，如果内容来自不可信用户输入，就可能注入恶意脚本（XSS 攻击）。例如：

```vue
<template>
  <div>
    <input v-model="userInput" placeholder="输入恶意代码" />
    <div v-html="userInput"></div>
  </div>
</template>

<script>
export default {
  data() {
    return { userInput: '' };
  },
};
</script>
```

当用户输入 `<img src=x onerror=alert('XSS')>` 时，`onerror` 中的 JavaScript 会被执行。

#### ✅ 安全实践

1. **绝不将用户提供的内容直接用于 `v-html`**，仅对管理员或完全可信的源使用。
2. **使用 HTML 净化库**（如 [DOMPurify](https://github.com/cure53/DOMPurify)）过滤恶意标签和属性。

```bash
npm install dompurify
```

```javascript
import DOMPurify from 'dompurify';

export default {
  data() {
    return { rawHtml: '<b>用户内容</b><script>alert("xss")</script>' };
  },
  computed: {
    sanitizedHtml() {
      return DOMPurify.sanitize(this.rawHtml);
    },
  },
};
```

3. **手动过滤危险内容**（简单但不推荐生产使用）：

```javascript
methods: {
  simpleSanitize(html) {
    return html
      .replace(/<script.*?>.*?<\/script>/gi, '')
      .replace(/on\w+=["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '');
  }
}
```

---

## 3. v-text 指令

### 3.1 基本作用

`v-text` 用于将数据作为 **纯文本** 插入到元素中。它会 **替换元素内部原有的所有文本内容**（包括子节点）。如果数据中包含 HTML 标签，这些标签会被转义为 HTML 实体，不会被解析。

### 3.2 基本用法

```vue
<template>
  <div>
    <!-- 输出：hello v-text -->
    <h3 v-text="dec"></h3>

    <!-- 支持表达式：输出 hello v-text111 -->
    <h3 v-text="dec + '111'"></h3>

    <!-- 三目运算符：输出 小于 -->
    <h3 v-text="1 > 2 ? '大于' : '小于'"></h3>

    <!-- 变量拼接 -->
    <h3 v-text="dec + dec"></h3>

    <!-- v-text 会替换原有内容 -->
    <p v-text="dec">原始文本将被清除</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dec: 'hello v-text',
    };
  },
};
</script>
```

### 3.3 v-text 与插值表达式的区别

- **插值 `{{ }}`**：只替换自身的位置，不会清空元素内的其他内容。
- **`v-text`**：会 **完全替换** 元素内的所有文本内容，优先级高于插值表达式。

```vue
<template>
  <div>
    <!-- 显示：前缀 hello vue 后缀 -->
    <p>前缀 {{ msg }} 后缀</p>

    <!-- 显示：hello vue（原有内容“前缀 后缀”被完全替换） -->
    <p v-text="msg">前缀 后缀</p>
  </div>
</template>
```

---

## 4. v-html 与 v-text 的比较

### 4.1 优先级

当同一个元素上同时使用 `v-html` 和 `v-text` 时，**后写的指令会生效**（两者互斥，不共存）。

```html
<!-- 最终显示李四（v-text 后写，覆盖） -->
<p v-html="res[0].name" v-text="res[1].name">测试</p>

<!-- 最终显示李四（v-html 后写，覆盖） -->
<p v-text="res[0].name" v-html="res[1].name">测试</p>
```

```javascript
data: {
  res: [{ name: '张三' }, { name: '李四' }];
}
```

> 实际开发中应避免在同一元素上混用两者，以免产生歧义。

### 4.2 核心区别

| 指令     | 是否解析 HTML     | 安全性      | 典型用途             |
| -------- | ----------------- | ----------- | -------------------- |
| `v-text` | ❌ 转义为纯文本   | 安全        | 显示纯文本内容       |
| `v-html` | ✅ 解析为真实 DOM | 有 XSS 风险 | 渲染富文本/动态 HTML |

```vue
<template>
  <div>
    <!-- v-html 会解析标签，显示红色文字 -->
    <p v-html="des"></p>

    <!-- v-text 显示原始 HTML 字符串 -->
    <p v-text="des"></p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      des: '<p style="color:red">验证v-html和v-text的区别</p>',
    };
  },
};
</script>
```

效果：

- `v-html`：红色文字“验证v-html和v-text的区别”
- `v-text`：显示字符串 `<p style="color:red">验证v-html和v-text的区别</p>`

---

## 5. 总结

| 指令     | 作用                 | 是否转义 HTML | 替换内容行为             |
| -------- | -------------------- | ------------- | ------------------------ |
| `v-text` | 更新元素的纯文本内容 | 是（转义）    | 完全替换元素内所有文本   |
| `v-html` | 渲染真实 HTML 结构   | 否（解析）    | 完全替换元素内所有子节点 |

**选择建议**：

- 只需要显示文本 → 优先使用插值 `{{ }}` 或 `v-text`（插值更灵活，不覆盖整个元素）。
- 需要渲染富文本 / HTML 结构 → 使用 `v-html`，但必须确保内容安全（使用 DOMPurify 等净化库）。
- 牢记：**永远不要对用户提供的内容直接使用 `v-html`**，避免 XSS 攻击。

掌握这两个指令有助于理解 Vue 如何将数据映射到 DOM，是学习更复杂指令和组件通信的基础。
