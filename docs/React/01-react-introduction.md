---
title: 初识React
order: 1
nav:
  title: React
  order: 3
---

## 1、什么是react以及react的特点

- React 是一个用于构建用户界面的 JAVASCRIPT 库。
- React 主要用于构建UI，很多人认为 React 是 MVC 中的 V（视图）。
- React 起源于 Facebook 的内部项目，用来架设 Instagram 的网站，并于 2013 年开源。
- React 拥有较高的性能，代码逻辑非常简单，越来越多的人已开始关注和使用它。

**React特点**

> - 声明式设计 −React采用声明范式，可以轻松描述应用。
> - 高效 −React通过对DOM的模拟，最大限度地减少与DOM的交互。
> - 灵活 −React可以与已知的库或框架很好地配合。
> - JSX − JSX 是 JavaScript 语法的扩展。React 开发不一定使用 JSX ，但我们建议使用它。
> - 组件 − 通过 React 构建组件，使得代码更加容易得到复用，能够很好的应用在大项目的 开发中。
> - 单向响应的数据流 − React 实现了单向响应的数据流，从而减少了重复代码，这也是它为什么比传统数据绑定更简单。
> - 在React Native中可以使用React语法进行移动端开发。
> - **使用虚拟dom和优秀的Diffing算法，尽量减少与真实DOM的交互。**

**简单的说：react主要关注页面，它是一个将数据渲染为HTML视图的开源JS库。**

**React的优缺点**

- 缺点：对于一个简单的例子也要编写很多代码。

- 优点：避免构建复杂的程序结构，利用函数式编程的思维来解决用户界面渲染的问题，使开发效率大大提高。对于大型项目更易管理，整个 React 应用要做的就是渲染，开发者关注的是渲染成成什么样子，而不用关心如何实现增量 渲染。

**React 的理念 ，归结为一个公式: UI=render(data)**

让我们来看看这个公式表达的含义，用户看到的界面( UI)，应该是一个函数(在这 里叫 render)的执行结果，只接受数据( data)作为参数。 这个函数是一个纯函数，所谓 纯函数，指的是没有任何副作用，输出完全依赖于输入的函数，两次函数调用如果输人 相同，得到的结果也绝对相同 。 如此一来，最终的用户界面，在 render 函数确定的情况 下完全取决于输入数据 。
对于开发者来说，重要的是区分开哪些属于 data，哪些属于 render，想要更新用户 界面，要做的就是更新 data，用户界面自然会做出响应，所以 React实践的也是“响应 式编程”( Reactive Programming)的思想，这也就是 React 为什么叫做 React 的原因 。

## 2、react的安装

React 可以直接下载使用，也可以使用官方提供的CDN地址，或者使用npm安装，以及使用 create-react-app 快速构建 React 开发环境。

### 2.1、直接使用官方提供的 CDN 地址

```html
<script src="https://unpkg.com/react@16/umd/react.development.js"></script>

<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>

<!-- 生产环境中不建议使用 -->
<script src="https://unpkg.com/babel-standalone@6.15.0/babel.min.js"></script>

```

**解析：**
上面我们引入了三个库： react.development.min.js 、react-dom.development.min.js 和 babel.min.js：
react.min.js - React 的核心库
react-dom.min.js - 提供与 DOM 相关的功能
babel.min.js - Babel 可以将 ES6 代码转为 ES5 代码，这样我们就能在目前不支持 ES6 浏览器上执行 React 代码。Babel 内嵌了对 JSX 的支持。通过将 Babel 和 babel-sublime 包（package）一同使用可以让源码的语法渲染上升到一个全新的水平。

### 2.2、通过npm使用React

建议在 React 中使用 CommonJS 模块系统，比如 browserify 或 webpack。

接下来，我们可以尝试一下，使用 `npm` 安装 React 到我们的项目中。在我们的工作目录，按住 `shift` 点击鼠标右键，在弹出的菜单中选取“在此处打开命令行”，创建一个项目的文件夹，例如 `learn-react` ，使用 `cd` 命令切换至文件夹中，输入：

```
npm init -y
```

使用默认设置初始化我们的项目的 `npm` 配置，在项目目录中会生成一个 `package.json` 文件，里面会保存我们项目的基本信息、命令脚本以及依赖的库等信息。再然后，我们可以通过命令：

```
cnpm install react react-dom --save
```

来安装 React，并将其保存到我们的项目依赖当中。现在再来看一下 `package.json` 文件，我们可以看到其中的 `dependencies` 已经保存了 react 的信息了。

我们可以通过`npm info react`获取react的安装信息。
国内使用 npm 速度很慢，你可以使用淘宝定制的 cnpm (gzip 压缩支持) 命令行工具代替默认的 npm:

```bash
$ npm install -g cnpm --registry=https://registry.npm.taobao.org
$ npm config set registry https://registry.npm.taobao.org
```

这样就可以使用 cnpm 命令来安装模块了。

### 2.3、使用 create-react-app 命令行工具

通过 `npm`，我们可以安装许多命令行工具。 React 官方专门为我们准备了专用的 React 项目生成工具 `create-react-app`，只需要简单几行代码即可生成 React 项目，并且在开发时还支持实时更新，自动重载等功能。

```bash
npm install -g create-react-app
create-react-app my-app
cd my-app
npm start
```

如果是我们完全地手工配置，则需要配置安装 Webpack/Babel 等工具库。所以对于初学者或想要快速开发应用的同学，`create-react-app` 就是你最好的选择。

## 3、举例使用React

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>初识react</title>

    <!-- 引入react时是有顺序的，首先要引入react核心库 -->
    <script src="https://cdn.staticfile.org/react/16.4.0/umd/react.development.js"></script>

    <!-- 引入react-dom，用于支持react操作DOM -->
    <script src="https://cdn.staticfile.org/react-dom/16.4.0/umd/react-dom.development.js"></script>
    <!-- 引入babel，用于将jsx转为js -->
    <script src="https://cdn.staticfile.org/babel-standalone/6.26.0/babel.min.js"></script>

</head>

<body>
    <!-- 准备一个容器div -->
    <div id="example"></div>

    <script type="text/babel">  /* 此处一定要写babel，不然就会默认为js文件 */
        /* 这里的步骤有： */
        //  1、创建虚拟DOM
        const VDOM = <h1>Hello,React</h1>  /* 此处一定不要写引号，因为不是字符串 */
        //  2、渲染虚拟DOM到页面
        // ReactDOM.render(虚拟DOM,容器) 该方法是来自于react-dom
        ReactDOM.render(VDOM,document.getElementById('example'));
    </script>

</script>

</body>

</html>

```
