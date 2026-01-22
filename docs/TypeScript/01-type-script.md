---
order: 1
title: TypeScript介绍

nav:
  title: TypeScript
  order: 5
---

## 1、TypeScript 由来

​ TypeScript 是微软开发的一个开源的编程语言，通过在 JavaScript 的基础上添加静态类型定义构建而成。TypeScript 通过 TypeScript 编译器或 Babel 转译为 JavaScript 代码，可运行在任何浏览器，任何操作系统。

​ 目前主流的前端框架 vue、react、angular 都支持使用 TypeScript 来进行开发，TypeScript 被认为是 JavaScript 的超集，主要提供了类型系统和对 es6 的支持。

​ **但是注意 TypeScript 是不能直接被 JS 解析器直接执行的，需要先编译成 JS。**

**产生的意义和特点**

- TypeScript 起源于使用 JavaScript 开发的大型项目 。由于 JavaScript 语言本身的局限性，难以胜任和维护大型项目开发。因此微软开发了 TypeScript ，使得其能够胜任开发大型项目。
- TypeScript 是 JavaScript 添加了可选的静态类型和基于类的面向对象编程。
- TypeScript 是一门弱类型的语言。
- TypeScript 扩展了 JavaScript 的语法，所以任何现有的 JavaScript 程序可以运行在 TypeScript 环境中。
- TypeScript 是 JavaScript 的超集，.js 文件可以直接重命名为 .ts 即可。
- 即使没有显式的定义类型，也能够自动做出类型推论。
- 可以定义从简单到复杂的几乎一切类型。
- 即使 TypeScript 编译报错，也可以生成 JavaScript 文件。
- 兼容第三方库，即使第三方库不是用 TypeScript 写的，也可以编写单独的类型文件供 TypeScript 读取
  类型系统增加了代码的可读性和可维护性。
- 拥有活跃的社区，并且支持 ES6 规范。

## 2、为什么需要 TypeScript

​ 为什么在大型项目中，更需要使用 TypeScript 呢，TypeScript 则是以 JavaScript 为基础构建的语言，而 JavaScript 存在一些隐患，TypeScript 则是为了解决这些隐患，因此 TypeScript 被称为 JavaScript 的超集，下面我们就来简单介绍一下这些隐患。

**js 存在动态类型不确定隐患：**

​ 我们都知道 js 有八大数据类型，这不是很明确了吗？为什么还会说 js 存在类型不定的隐患呢？

​ 这是因为在 js 中，比如我们`var a = 123`，而后我们在给 a 赋值为`String a`，这在 js 中是很常见的，不会出现报错。而在一些大型项目中，如果我们有一个函数被多个不同地方调用，而传递的参数的类型总是变化，我们不能像 vue 给 props 限制类型一样，这样在调用函数出问题时很难进行排查。

​ 而 TypeScript 则解决了这个问题，我们从名字中就可以知道 Type，即类型，这个在后续我们将继续学习 TypeScript 如何使用。

## 3、 Javascript 和 Typescript 的区别

- TypeScript 代码通过 TypeScript 编译器或 Babel 转译为 JavaScript 代码。
- TypeScript 可以使用 JavaScript 中的所有代码和编码概念，TypeScript 是为了使 JavaScript 的开发变得更加容易而创建的。TypeScript 从核心语言方面和类概念的模塑方面对 JavaScript 对象模型进行扩展。
- JavaScript 代码可以在无需任何修改的情况下与 TypeScript 一同工作，同时可以使用编译器将 TypeScript 代码转换为 JavaScript。
- TypeScript 通过类型注解提供编译时的静态类型检查。TypeScript 中的数据要求带有明确的类型，JavaScript 不要求。
- TypeScript 为函数提供了缺省参数值。
- TypeScript 引入了 JavaScript 中没有的“类”概念。
- TypeScript 中引入了模块的概念，可以把声明、数据、函数和类封装在模块中。

**ts 解决了 js 的一些痛点**

（1）js 弱类型和没有命名空间，导致很难模块化。

（2）js 不适合开发大型程序。

（3）ts 提供了一些语法糖来帮助更方便地实践面向对象的编程。

（4）ts 的一个设计亮点就是并没有抛弃 js 的语法，ts 是 js 的超级，任何合法的 Js 语句在 ts 下都是合法的。

## 4、ts 开发环境搭建

​ 首先准备好 node 环境，然后全局安装 typescript。

```bash
npm install -g typescript
```

安装完成后检查版本：tsc -v

## 5、ts 初体验

​ 这里我们直接创建一个 hello.ts 文件，在之前我们介绍过 ts 是完全支持 js 的，因此这里我们直接写如下代码：

```
console.log('hello TS');
```

​ 这个时候我们想该如何执行该代码，在 js 文件中，我们可以直接在 node 环境下使用`node hello.ts`执行 js 文件，同样的在这里我们也是可以使用 node hello.ts 的方式输出结果的。

​ 而 ts 多给了我们一个`tsc hello.ts`，使用该命令可以创建一个 js 文件，即将 ts 中的内容编译成 js 文件，因此在上面例子中，我们会创建一个 hello.js 文件，该文件中的内容依旧是`console.log('hello TS');`。

除此之外我们还能下载使用 ts-node 来执行 ts 文件，使用方式为`ts-node hello.ts`，该命令会将 ts 文件编译成 js 文件，然后再执行 js 文件。
