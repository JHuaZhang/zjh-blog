---
group:
  title: 【01】vue基础篇
  order: 1
title: vue cli脚手架使用
order: 2
nav:
  title: Vue
  order: 4
---

## 1. 介绍

Vue 项目开发中，通常需要借助**脚手架**或**构建工具**来快速搭建项目结构、配置开发服务器、热更新、打包优化等。本章主要介绍两种主流方式：

- **Vue CLI**：Vue 官方基于 Webpack 的脚手架工具，提供开箱即用的配置，分为 2.x 和 3+ 两个主要版本。
- **Vite**：新一代前端构建工具，基于原生 ES 模块，启动和热更新速度极快，Vue 官方已推荐为新项目的首选。

> **通用注意**：所有操作路径建议使用英文命名，避免编码问题。同时确保 Node.js（版本 ≥ 16）已安装。

---

## 2. 前置准备（镜像源）

国内访问 npm 官方源较慢，建议配置淘宝镜像以提高速度：

```bash
# 设置 registry 为淘宝镜像
npm config set registry https://registry.npmmirror.com

# 全局安装 cnpm（国内镜像版 npm）
npm install -g cnpm --registry=https://registry.npmmirror.com

# （可选）全局安装 webpack-cli
cnpm install webpack-cli -g
```

---

## 3. Vue CLI 2.x（vue-cli）

Vue CLI 2.x 是基于 Webpack 3 的旧版脚手架，目前仍用于维护部分老项目。新项目建议使用 Vue CLI 3+ 或 Vite。

### 3.1 安装与初始化项目

**安装 2.9.6 版本：**

```bash
npm install -g vue-cli@2.9.6
```

安装后查看版本：

```bash
vue --version
```

**初始化项目：**

```bash
vue init webpack my-vue2-project
```

进入项目目录并安装依赖：

```bash
cd my-vue2-project
cnpm i
```

> **常见报错解决**：如果运行 `cnpm i` 后提示缺少 `vue-hot-reload-api`，例如：
>
> ```
> This dependency was not found: * vue-hot-reload-api in ./src/App.vue ...
> ```
>
> 执行以下命令安装：
>
> ```bash
> npm install --save vue-hot-reload-api
> ```
>
> 然后重新运行项目即可。

#### 附：`vue-hot-reload-api` 作用简介

`vue-hot-reload-api` 是 Vue 热模块替换（HMR）的核心依赖。它的主要作用包括：

- **实现无刷新更新**：开发时修改 `.vue` 文件，无需刷新整个页面即可看到变更效果。
- **保留组件状态**：尽可能保留组件内部状态（如表单输入、data 等），提升调试效率。
- **与 `vue-loader` 集成**：`vue-loader` 利用此 API 生成热更新代码，当文件变化后，重新渲染组件或递归更新子组件。

在 Vue CLI 2.x 中由于依赖解析不完整，有时需要手动安装。新版 Vue CLI 3+ 和 Vite 已内置此依赖。

### 3.2 目录结构详解

```bash
my-vue2-project/
├── build/                # 构建相关脚本（核心配置）
│   ├── build.js          # 生产环境构建入口
│   ├── check-versions.js # 检查 Node/npm 版本
│   ├── utils.js          # 构建工具方法
│   ├── vue-loader.conf.js # Vue 单文件组件加载配置
│   ├── webpack.base.conf.js # 基础 Webpack 配置
│   ├── webpack.dev.conf.js  # 开发环境配置
│   └── webpack.prod.conf.js # 生产环境配置
├── config/               # 环境配置（关键）
│   ├── dev.env.js        # 开发环境变量（如 API 地址）
│   ├── index.js          # 全局配置（端口、代理等）
│   └── prod.env.js       # 生产环境变量
├── node_modules/         # 依赖模块（自动生成）
├── src/                  # 源代码核心目录
│   ├── assets/           # 静态资源（图片、字体等，会被 Webpack 处理）
│   ├── components/       # 可复用 Vue 组件
│   ├── router/           # 路由配置（vue-router）
│   ├── store/            # Vuex 状态管理（可选）
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件（初始化 Vue 实例）
├── static/               # 纯静态资源（直接复制到 dist/）
├── .babelrc              # Babel 转译配置
├── .editorconfig         # 代码格式规范
├── .gitignore            # Git 忽略文件配置
├── index.html            # 主页面入口（模板）
├── package.json          # 项目依赖和脚本
└── README.md             # 项目说明文档
```

**关键目录与文件详解：**

- **build/构建配置**
  - `webpack.base.conf.js`：基础配置，包含入口文件、输出路径、Loader规则（如 vue-loader、babel-loader）。
  - `webpack.dev.conf.js`：开发环境配置，启用热更新（HMR）、Source Map等。
  - `webpack.prod.conf.js`：生产环境配置，代码压缩、资源优化（如 UglifyJsPlugin）。
- **config/环境变量**
  - `index.js`：定义全局配置，如开发服务器端口（`dev.port`）、代理规则（`dev.proxyTable`）。
  - `dev.env.js` 和 `prod.env.js`：通过 `process.env` 区分环境变量，例如 API 接口地址。
- **src/源代码**
  - `assets/`：存放图片、全局样式，资源会被 Webpack 处理（如 Base64 编码）。
  - `components/`：存放可复用的 Vue 组件（如按钮、表单）。
  - `router/`：定义路由映射（`index.js` 中配置路由规则）。
  - `store/`：Vuex 状态管理文件（`index.js` 中定义模块化状态）。
- **static/静态资源**
  - 直接复制到 `dist/` 目录，不经过 Webpack 处理（如 `favicon.ico`、第三方字体文件）。
- **index.html**
  - 主页面模板，通过 `<!-- built files will be auto injected -->` 注入构建后的 JS/CSS。

### 3.3 Vue CLI 2.x 特性

1. **Webpack 3.x 集成**：默认使用 Webpack 3，需手动升级到 4.x 以支持新特性（如 Tree Shaking）。
2. **Babel 6/7 兼容**：通过 `.babelrc` 配置预设（如 `es2015`），注意插件版本兼容性。
3. **开发服务器配置**：在 `config/index.js` 中修改 `dev` 对象的 `host`、`port`、`autoOpenBrowser` 等参数。
4. **生产环境优化**：代码压缩通过 `uglifyjs-webpack-plugin` 实现；资源指纹通过 `[hash]` 后缀缓存管理（需手动配置）。

### 3.4 与 Vue CLI 3+ 的差异

| 特性               | Vue CLI 2.x                    | Vue CLI 3.x+                      |
| :----------------- | :----------------------------- | :-------------------------------- |
| **配置文件**       | `build/` 和 `config/` 目录分离 | 集中式 `vue.config.js`            |
| **插件系统**       | 依赖手动配置                   | 基于 `@vue/cli-plugin-*` 插件体系 |
| **模式与环境变量** | 通过 `config/dev.env.js` 定义  | 支持 `.env.development` 文件      |
| **默认依赖版本**   | Webpack 3、Babel 6/7           | Webpack 4+、Babel 7+              |

### 3.5 常见问题

**① 如何修改端口？**

在 `config/index.js` 中修改 `dev.port` 的值。

**② 如何配置代理解决跨域？**

在 `config/index.js` 的 `dev.proxyTable` 中添加代理规则：

```javascript
proxyTable: {
  '/api': {
    target: 'http://api.example.com',
    changeOrigin: true,
    pathRewrite: { '^/api': '' }
  }
}
```

---

## 4. Vue CLI 3+（@vue/cli）

Vue CLI 3.x 及以上版本使用 `@vue/cli` 包，提供了图形化界面、零配置原型开发、可插拔插件体系等更现代化的功能。

### 4.1 安装与创建项目

如果之前安装过旧版 vue-cli，需先卸载：

```bash
cnpm uninstall -g vue-cli
cnpm uninstall -g @vue/cli
```

安装最新版 `@vue/cli`：

```bash
cnpm install -g @vue/cli
```

验证安装成功：

```bash
vue --version   # 例如 @vue/cli 5.0.9
```

**创建 Vue 3 项目：**

```bash
vue create my-vue3-project
```

在交互式界面中确认 Vue 版本：

```bash
? Choose a version of Vue.js that you want to start the project with
  2.x
> 3.x   # 选择 Vue 3
```

其他配置（如 Babel、ESLint、Router、Vuex 等）根据需求选择即可。

### 4.2 目录结构详解

```bash
my-vue3-project/
├── public/               # 静态资源（直接复制）
│   ├── index.html        # 主 HTML 模板（Vue 挂载点）
│   └── favicon.ico       # 网站图标
├── src/                  # 源代码核心目录
│   ├── assets/           # 静态资源（图片、字体、未编译的样式）
│   ├── components/       # 可复用组件（单文件组件 .vue）
│   ├── views/            # 页面级组件（与路由对应）
│   ├── router/           # 路由配置（定义路径与组件映射）
│   ├── store/            # 状态管理（Vuex/Pinia）
│   ├── App.vue           # 根组件（全局布局）
│   └── main.js           # 入口文件（初始化 Vue 实例）
├── .gitignore            # Git 忽略文件（如 node_modules）
├── package.json          # 项目依赖和脚本
├── babel.config.js       # Babel 编译配置
└── vue.config.js         # Vue CLI 自定义配置（可选）
```

**核心目录解析：**

- **public/ 目录**：存放构建时直接复制的静态资源（无需 Webpack 处理）。`index.html` 是应用入口模板，Vue 实例挂载到 `<div id="app"></div>`。
- **src/ 目录**：
  - `assets/`：存放图片、字体等静态资源，支持通过 `import` 引用并编译。
  - `components/`：存放可复用的 Vue 组件（单文件组件 .vue），例如 `Header.vue`、`Footer.vue`。
  - `views/`：页面级组件，通常与路由配置对应（如 `Home.vue` 对应首页）。
  - `router/index.js`：定义路径与组件的映射关系。
  - `store/`：状态管理配置（Vuex 或 Pinia），集中管理全局状态。
  - `App.vue`：根组件，定义全局布局，通过 `<router-view>` 渲染子路由。
  - `main.js`：入口文件，创建并挂载 Vue 应用。
- **根目录文件**：
  - `.gitignore`：指定 Git 忽略的文件。
  - `package.json`：定义项目依赖和脚本命令（如 `npm run serve` 启动开发服务器）。
  - `vue.config.js`：Vue CLI 扩展配置（如代理设置、构建输出路径）。

### 4.3 使用 TypeScript 创建 Vue 3 项目

```bash
vue create my-vue3-ts-project
```

选择预设模式：按 `↓` 键选择 **Manually select features**（手动配置），回车确认。

勾选核心功能（通过方向键选择，空格选中）：

```bash
? Check features needed for your project:
 ◉ Babel
 ◉ TypeScript      # 关键：勾选 TypeScript
 ◉ Progressive Web App (PWA) Support
 ◉ Router          # 可选：路由支持
 ◉ Vuex/Pinia      # 可选：状态管理
 ◉ CSS Pre-processors
 ◉ Linter / Formatter
 ◉ Unit Testing
 ◉ E2E Testing
```

**配置 TypeScript 选项：**

- Vue 版本：选择 **3.x**（必须）。
- 类组件语法：按需选择（推荐 **No**，直接使用 Composition API 更简洁）。
- Babel 集成：选择 **Yes**（兼容旧浏览器）。
- 路由模式：选择 **Y** 使用 History 模式（需后端配合）。
- CSS 预处理器：按需选择（如 Sass/LESS）。
- 代码规范：选择 ESLint + Prettier。

生成的项目结构（TypeScript 相关注释）：

```bash
my-vue3-ts-project/
├── src/
│   ├── assets/           # 静态资源
│   ├── components/       # 可复用组件
│   ├── views/            # 页面组件
│   ├── router/           # 路由配置（index.ts）
│   ├── store/            # 状态管理（store.ts）
│   ├── App.vue           # 根组件（含 TypeScript 类型）
│   └── main.ts           # 入口文件（.ts 后缀）
├── tsconfig.json         # TypeScript 核心配置
├── env.d.ts              # 环境变量类型声明
├── .eslintrc.js          # ESLint 配置（含 TypeScript 规则）
└── package.json          # 依赖包含 typescript、vue-tsc 等
```

**核心配置说明：**

- **tsconfig.json 关键配置**：

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "strict": true, // 启用严格类型检查
    "jsx": "preserve", // 支持 JSX/TSX
    "moduleResolution": "Node",
    "esModuleInterop": true, // 兼容 CommonJS 模块
    "lib": ["ESNext", "DOM"], // 内置库
    "types": ["vite/client"] // Vite 客户端类型（若使用 Vite）
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

- **组件示例（HelloWorld.vue）**：

```vue
<template>
  <div>
    <h1>{{ msg }}</h1>
    <button @click="increment">Count: {{ count }}</button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// 响应式变量（自动类型推断）
const count = ref<number>(0);
const msg = ref<string>('Hello Vue3 + TS!');

// 方法类型注解
const increment = (): void => {
  count.value++;
};
</script>
```

### 4.4 配置代理（vue.config.js）

在 `vue.config.js` 中配置开发服务器代理解决跨域：

```javascript
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },
};
```

---

## 5. Vite 创建 Vue 项目

### 5.1 Vite 简介

[Vite](https://vitejs.dev/) 是一个基于原生 ES 模块的开发服务器和构建工具，利用浏览器对 `import` 的支持，实现**极速冷启动**和**即时热更新**。Vue 官方已从 CLI 推荐转向 Vite。

### 5.2 创建 Vue 3 项目（默认）

```bash
# 使用 npm 创建
npm create vite@latest my-vue3-app -- --template vue

# 或使用 yarn
yarn create vite my-vue3-app --template vue

# 进入目录并安装依赖
cd my-vue3-app
npm install
npm run dev
```

**其他 Vue 3 模板**：

- `vue-ts`：包含 TypeScript 支持的 Vue 3 项目。

### 5.3 创建 Vue 3 + TypeScript 项目

```bash
npm create vite@latest my-vue3-ts-app -- --template vue-ts
```

生成的模板已配置好 `tsconfig.json`、`env.d.ts` 和组件示例（`.vue` 文件中使用 `<script setup lang="ts">`）。

### 5.4 创建 Vue 2 项目

Vite 官方模板默认为 Vue 3，若要创建 Vue 2 项目，需要借助社区插件 `@vitejs/plugin-vue2`。

#### 方式一：使用 `create-vite` 并指定官方实验模板

从 Vite 4.3+ 开始，官方提供了 `vue2` 模板：

```bash
npm create vite@latest my-vue2-app -- --template vue2
```

#### 方式二：手动搭建 Vue 2 + Vite

```bash
# 1. 创建项目并初始化
mkdir my-vue2-app && cd my-vue2-app
npm init -y

# 2. 安装 Vite 和相关插件
npm install vite @vitejs/plugin-vue2 vue@2 vue-router@3

# 3. 创建 vite.config.js
```

`vite.config.js` 内容：

```javascript
import { defineConfig } from 'vite';
import vue2 from '@vitejs/plugin-vue2';

export default defineConfig({
  plugins: [vue2()],
});
```

创建 `index.html`、`src/main.js`、`src/App.vue` 等文件（与 Vue CLI 2 类似，但使用 Vite 入口语法）。

**快速模板推荐**：使用 [vite-vue2-starter](https://github.com/underfin/vite-vue2-starter) 或直接克隆示例。

### 5.5 Vue 2 + TypeScript + Vite

安装 TypeScript 相关依赖：

```bash
npm install -D typescript @types/node @vue/runtime-dom
```

创建 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

修改 `vite.config.js` 添加 TypeScript 支持（Vite 默认支持 `.ts` 文件）。将 `src/main.js` 改为 `main.ts`，并在 `.vue` 文件中使用 `<script lang="ts">`。

> **注意**：Vue 2 官方对 TypeScript 的支持有限，某些高级类型可能无法完美推断。对于新项目，更推荐使用 Vue 3 + Vite + TypeScript。

---

## 6. 总结

- **Vue CLI 2.x**：仅用于维护老旧项目，注意可能需手动安装 `vue-hot-reload-api` 解决热更新缺失。
- **Vue CLI 3+**：适合需要 Webpack 丰富生态的企业项目，支持 TypeScript 和插件化配置。
- **Vite**：新一代构建工具，启动和热更新极快，官方推荐用于新项目（尤其是 Vue 3）。
  - Vue 3 + Vite + TS 是当前最佳实践。
  - Vue 2 也可用 Vite，但需使用 `@vitejs/plugin-vue2`，且 TS 支持不如 Vue 3 完善。

根据项目需求选择合适的工具：

- 老项目维护 → Vue CLI 2.x
- 需要 Webpack 生态（如大量自定义 loader） → Vue CLI 3+
- 追求极致开发体验和速度 → Vite + Vue 3
