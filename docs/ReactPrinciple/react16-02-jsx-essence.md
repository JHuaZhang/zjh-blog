---
group:
  title: React16原理
order: 2
title: jsx本质及createElement将jsx转为React Element

nav:
  title: React原理
  order: 4
---

## 1、介绍

JSX是一种语法，并不是React中的内容，时下接入JSX语法的框架越来越多，但与之缘分最深的仍然是React。本节来讲一下React是如何摇身一变成为DOM的。  
我们平时在写React时会用JSX来描述组件的内容，例如下面的代码中，render方法return的内容就是JSX代码。

```javascript
import * as React from 'react';

export default function App() {
  return (
    <div className="App">
      <h1 className="title">I am the title</h1>
      <p className="content">
        <h3>this is h3</h3>
        <em>this is em</em>
      </p>
    </div>
  );
}
```

我们考虑以下三个问题：

> - JSX 的本质是什么，它和 JS 之间到底是什么关系？
> - React 为什么要用 JSX？
> - JSX 是如何映射为 DOM 的？

## 2、JSX的本质是什么？它和JS之间的到底是什么关系？

JSX到底是什么，我们先来看看React官网给出的一段定义：

> JSX是JavaScript的一种语法扩展，它和模板语言很接近，但是它充分具备JavaScript的能力。

“语法扩展”这一点在理解上几乎不会产生歧义，不过“它充分具备 JavaScript 的能力”这句，却总让人摸不着头脑，JSX 和 JS 怎么看也不像是一路人啊？这就引出了“JSX 语法是如何在 JavaScript 中生效的”这个问题。  
JSX 是 JavaScript 的扩展，而不是 JavaScript 的某个版本，因此浏览器并不会天然支持，那么 JSX 是如何在 JavaScript 中生效的呢？  
React 官网是这样的解释的：

> JSX 会被编译为React.createElement()， React.createElement()将返回一个叫作“React Element”的JS对象。

**那么JSX如何转换成React.createElement() 的呢？答案就是通过babel转换。**  
我们直接打开 [babel playground](https://babeljs.io/repl) 来写一段JSX代码看一下babel转换后的结果。

```javascript
<div className="App">
  <h1 className="title">I am the title</h1>
  <p className="content">
    <h3>this is h3</h3>
    <em>this is em</em>
  </p>
</div>
```

使用babel编译后的结果为：

```javascript
'use strict';
React.createElement(
  'div',
  {
    className: 'App',
  },
  React.createElement(
    'h1',
    {
      className: 'title',
    },
    'I am the title',
  ),
  React.createElement(
    'p',
    {
      className: 'content',
    },
    React.createElement('h3', null, 'this is h3'),
    React.createElement('em', null, 'this is em'),
  ),
);
```

可以看到JSX代码都被转换成了React.createElement调用。  
接下来我们总结一下来回答标题提到的两个问题。

> - JSX 是 JavaScript 的扩展，不是 JavaScipt 的某个版本，需要通过 Babel 进行转换成 JavaScript 代码。
> - JSX 会被 babel 转换为 React.CreateElement(...) 调用的形式，执行后返回的结果是一个对象。

⚠️注意：在react17之后，react就使用\_jsxs替代createElement并不是React自身的公开API变更，而是由Babel或TypeScript编译JSX时生成的运行时辅助函数。因此上面的代码在最新的babel中编译的内容为：

```javascript
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/*#__PURE__*/ _jsxs('div', {
  className: 'App',
  children: [
    /*#__PURE__*/ _jsx('h1', {
      className: 'title',
      children: 'I am the title',
    }),
    /*#__PURE__*/ _jsxs('p', {
      className: 'content',
      children: [
        /*#__PURE__*/ _jsx('h3', {
          children: 'this is h3',
        }),
        /*#__PURE__*/ _jsx('em', {
          children: 'this is em',
        }),
      ],
    }),
  ],
});
```

这个我们暂时只做了解，等后续学习到react 18的时候，我们再进一步深入了解。

## 3、React为什么要用JSX？

从上一节我们知道JSX等价于一次React.createElement调用，那么React官方为什么不直接引导我们用React.createElement来创建元素呢？  
 在实际功能效果一致的前提下，JSX代码层次分明、嵌套关系清晰；而React.createElement代码则给人一种非常混乱的“杂糅感”，这样的代码不仅读起来不友好，写起来也费劲。  
 JSX语法糖允许前端开发者使用我们最为熟悉的类HTML标签语法来创建虚拟DOM，在降低学习成本的同时，也提升了研发效率与研发体验。

## 4、createElement函数介绍

在React中，createElement函数是用于创建虚拟DOM元素的函数。它是React的核心之一，通常用于在JSX语法不可用的环境中手动创建React元素。  
**createElement函数的基本语法如下：**

```javascript
React.createElement(type, props, ...children);
```

:::color1

- type：表示要创建的元素类型，可以是HTML标签名（如'div'、'span'），也可以是自定义组件。
- props：表示元素的属性，通常以对象的形式传入。
- children：表示该元素的子元素，可以是文本节点、其他React元素或者其他内容。

:::

例如，要创建一个简单的div元素，可以使用如下代码：

```javascript
const element = React.createElement('div', { className: 'container' }, 'Hello, World');
```

上述代码将使用createElement函数创建一个<div>元素，带有className属性，并且其内容为文本节点 "Hello, World"。在使用JSX语法编写React组件时，createElement函数通常由JSX编译器自动转换为更易读的JSX语法，因此大部分情况下开发者无需手动调用createElement，只有在我们需要编写一些工具库的时候，可能会使用到这个api。

### 4.1、从源码角度看createElement做了什么

如下是createElement的源码：

```javascript
export function createElement(type, config, children) {
  /*
   * propName,属性名称，用于后面的for循环
   */
  let propName;
  /*
   * props存储reactElement中普通元素，即不包含key，ref，self，source
   */
  const props = {};

  let key = null;
  let ref = null;
  let self = null;
  let source = null;
  if (config != null) {
    // 如果config对象中有合法的ref对象
    if (hasValidRef(config)) {
      // 将config.ref属性提取到ref变量中
      ref = config.ref;
      // 在开发环境中
      if (__DEV__) {
        // 如果ref属性被设置成了一个字符串形式，就报一个提示
        // 说明此用法会在将来的版本中被删掉
        warnIfStringRefCannotBeAutoConverted(config);
      }
    }
    // 如果config中有合法的key属性
    if (hasValidKey(config)) {
      // 将config.key属性提取到key变量中
      key = '' + config.key;
    }
    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // 遍历config对象
    for (propName in config) {
      // 如果遍历到的属性是对象的自身属性
      // 并且在RESERVED_PROPS对象中不存在该属性
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        // 将满足条件的属性添加到props对象中(普通属性)
        props[propName] = config[propName];
      }
    }
  }
  /*
   * 将三个及之后的参数挂载到props.children属性中
   * 如果子元素是多个props.children则为数组
   * 如果子元素是一个props.children则为对象
   */
  // arguments实参集合，由于从第三个参数开始及以后都表示子元素
  // 所以减去前两个参数的结果就是子元素的数量
  const childrenLength = arguments.length - 2;
  // 如果子元素的数量为1
  if (childrenLength === 1) {
    props.children = children;
  }
  // 如果子元素的数量大于1
  else if (childrenLength > 1) {
    // 创建数组，数组中的元素数量等于子元素的数量
    const childArray = Array(childrenLength);
    // 开启循环 循环匹配子元素的数量
    for (let i = 0; i < childrenLength; i++) {
      // 将子元素添加到childArray数组中
      // i+2的原因是因为前面2个参数不是子元素
      childArray[i] = arguments[i + 2];
    }
    // 如果是开发环境
    if (__DEV__) {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    props.children = childArray;
  }
  /*
   * 如果当前处理的是组件
   * 且组件中有defaultProps属性
   * 这个属性中存储的props对象中属性的默认值
   * 遍历defaultProps对象，查看对应的props属性值是否为undefined
   * 如果为undefined则将defaultProps中的属性值赋给props
   */
  // 将type属性视为函数 查看其中是否具有defaultProps属性
  if (type && type.defaultProps) {
    // 将type函数下的defaultProps属性赋值给变量defaultProps变量
    const defaultProps = type.defaultProps;
    // 遍历defaultProps对象中的属性 将属性名称赋值给propName变量
    for (propName in defaultProps) {
      // 如果props对象该属性值为undefined
      if (props[propName] === undefined) {
        // 将defaultProps对象中的对应属性的值赋给props对象中的对应属性
        props[propName] = defaultProps[propName];
      }
    }
  }
  // 判断当前为开发环境
  if (__DEV__) {
    // 如果key或ref属性存在
    if (key || ref) {
      const displayName =
        typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;
      // 如果key属性存在
      if (key) {
        // 为props对象添加key属性
        // 并指定当通过props对象获取key属性时报错
        defineKeyPropWarningGetter(props, displayName);
      }
      // 如果ref属性存在
      if (ref) {
        // 为props对象添加ref属性
        // 并指定当通过props对象获取ref属性时报错
        defineRefPropWarningGetter(props, displayName);
      }
    }
  }
  // 接收参数，返回ReactElement
  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
}
```

我们来看React 16中createElement的源码。在React中，createElement函数是用于创建React元素的。它接收三个参数：type, config, children。下面我们逐步解析。我们可以将createElement函数分成4个步骤：

```javascript
export function createElement(type, config, children) {
  // 1. 处理config
  // 2. 处理children
  // 3. 处理默认的props
  // 4. 返回ReactElement
}
```

#### 4.1.1、处理config

```javascript
/*
 * propName,属性名称，用于后面的for循环
 */
let propName;
/*
 * props存储reactElement中普通元素，即不包含key，ref，self，source
 */
const props = {};

let key = null;
let ref = null;
let self = null;
let source = null;
if (config != null) {
  // 如果config对象中有合法的ref对象
  if (hasValidRef(config)) {
    // 将config.ref属性提取到ref变量中
    ref = config.ref;
    // 在开发环境中
    if (__DEV__) {
      // 如果ref属性被设置成了一个字符串形式，就报一个提示
      // 说明此用法会在将来的版本中被删掉
      warnIfStringRefCannotBeAutoConverted(config);
    }
  }
  // 如果config中有合法的key属性
  if (hasValidKey(config)) {
    // 将config.key属性提取到key变量中
    key = '' + config.key;
  }
  self = config.__self === undefined ? null : config.__self;
  source = config.__source === undefined ? null : config.__source;
  // 遍历config对象
  for (propName in config) {
    // 如果遍历到的属性是对象的自身属性
    // 并且在RESERVED_PROPS对象中不存在该属性
    if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
      // 将满足条件的属性添加到props对象中(普通属性)
      props[propName] = config[propName];
    }
  }
}
```

这里，首先从config中提取出一些保留属性（如key、ref、**self、**source），其余属性被添加到props对象中。RESERVED_PROPS是一个包含保留属性名的集合。

```javascript
const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};
```

**知识补充：**

对于key和ref，我们经常会使用到，因此比较熟悉，但是这个**self和**source是什么呢？

| 参数       | 作用                                                             |
| ---------- | ---------------------------------------------------------------- |
| \_\_source | 记录JSX元素在源码中的文件路径和行号，用于错误堆栈中定位问题      |
| \_\_self   | 指向当前组件实例（仅在老式类组件中使用），用于调试时识别组件自身 |

它们只在 开发环境（development） 生效，生产环境（production）会被移除或忽略。

**①、\_\_source**

当在浏览器控制台看到这样的报错：

```javascript
Warning: Each child in a list should have a unique "key" prop.
    at li (ListItem.js:5)
    at ul
    at MyList (List.js:10)
```

其中的ListItem.js:5就是通过\_\_source提供的信息！它长这样：

```javascript
{
  __source: {
    fileName: '/path/to/MyComponent.js',
    lineNumber: 10
  }
}
```

Babel（或其他编译器）在转换JSX时，如果启用了开发模式支持，会自动注入这个字段。这样当发生warning或error时，React就能告诉你：“这个元素是在哪写的”。

**②、\_\_self**

\_\_self被设置为当前组件的this，即组件实例本身。

主要用途：

- 在警告或错误中显示“哪个组件渲染了这个有问题的元素”。
- 帮助React DevTools定位组件树结构。
- 配合owner字段做内部追踪（旧架构）。

如：

```javascript
class Button extends Component {
  render() {
    return (
      <span __self={this} __source={...}>Click me</span>
    );
  }
}
```

这里的__self={this}告诉 React：“这个<span>是由Button实例创建的”。但是不需要手动写__self和__source，它们是由Babel插件在开发环境下自动添加的。例如使用@babel/preset-react时，在开发模式下会自动启用：

```javascript
{
  "plugins": [
    ["@babel/plugin-transform-react-jsx", {
      "development": true,
      "throwIfNamespace": false
    }]
  ]
}
```

#### 4.1.2、处理children

```javascript
/*
 * 将三个及之后的参数挂载到props.children属性中
 * 如果子元素是多个props.children则为数组
 * 如果子元素是一个props.children则为对象
 */
// arguments实参集合，由于从第三个参数开始及以后都表示子元素
// 所以减去前两个参数的结果就是子元素的数量
const childrenLength = arguments.length - 2;
// 如果子元素的数量为1
if (childrenLength === 1) {
  props.children = children;
}
// 如果子元素的数量大于1
else if (childrenLength > 1) {
  // 创建数组，数组中的元素数量等于子元素的数量
  const childArray = Array(childrenLength);
  // 开启循环 循环匹配子元素的数量
  for (let i = 0; i < childrenLength; i++) {
    // 将子元素添加到childArray数组中
    // i+2的原因是因为前面2个参数不是子元素
    childArray[i] = arguments[i + 2];
  }
  // 如果是开发环境
  if (__DEV__) {
    if (Object.freeze) {
      Object.freeze(childArray);
    }
  }
  props.children = childArray;
}
```

children参数是从第三个参数开始的所有参数。如果只有一个children，则直接赋值给props.children；如果有多个，则将这些参数组成一个数组再赋值给props.children。

#### 4.1.3、 处理默认的props

```javascript
/*
 * 如果当前处理的是组件
 * 且组件中有defaultProps属性
 * 这个属性中存储的props对象中属性的默认值
 * 遍历defaultProps对象，查看对应的props属性值是否为undefined
 * 如果为undefined则将defaultProps中的属性值赋给props
 */
// 将type属性视为函数 查看其中是否具有defaultProps属性
if (type && type.defaultProps) {
  // 将type函数下的defaultProps属性赋值给变量defaultProps变量
  const defaultProps = type.defaultProps;
  // 遍历defaultProps对象中的属性 将属性名称赋值给propName变量
  for (propName in defaultProps) {
    // 如果props对象该属性值为undefined
    if (props[propName] === undefined) {
      // 将defaultProps对象中的对应属性的值赋给props对象中的对应属性
      props[propName] = defaultProps[propName];
    }
  }
}
```

如果组件的type有defaultProps，并且props中某个prop为undefined，则使用defaultProps中对应的默认值。

#### 4.1.4、返回ReactElement

```javascript
return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
```

最后，调用ReactElement函数（一个工厂函数）来创建并返回一个React元素。ReactElement函数定义如下：

```javascript
const ReactElement = function (type, key, ref, self, source, owner, props) {
  const element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  };

  // ... 在开发环境下可能会添加一些额外的字段，如__self和__source

  return element;
};
```

注意，React元素就是一个简单的对象，它描述了需要在UI中看到的内容。它包含类型（type）、属性（props）、键（key）和引用（ref）等。而这里的ReactElement，就是我们常说的虚拟DOM上的节点，后续我们进一步学习ReactElement做了什么的时候，会进一步学习。

### 4.2、createElement传入自定义组件

在React中，自定义组件有两种形式：

- 函数组件：一个返回React元素的函数。
- 类组件：一个继承自React.Component的类。

当我们使用JSX或直接调用React.createElement并传入一个函数或类作为第一个参数时，React会如何处理？

```javascript
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

class WelcomeClass extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}

// 使用函数组件
const element1 = React.createElement(Welcome, { name: 'Sara' });

// 使用类组件
const element2 = React.createElement(WelcomeClass, { name: 'Sara' });
```

在createElement中，并不会区分传入的type是函数组件、类组件还是原生标签（字符串）。它只是创建一个React元素对象，这个对象的type字段就是传入的函数或类。

在后续的渲染过程中（例如ReactDOM.render），React会检查元素的type类型，如果是字符串，就认为是原生DOM元素；如果是函数或类，就认为是组件。

具体来说，当React渲染组件时，会判断type的类型：

- 如果是函数，则调用该函数（传入props）并返回渲染结果（函数组件）。
- 如果是类（即type.prototype.isReactComponent存在），则会实例化该类并调用其render方法（类组件）。

在createElement阶段，React仅仅创建了一个描述性的对象，例如：

```javascript
{
$$typeof: Symbol(react.element),
type: Welcome, // 可能是函数、类或字符串
key: null,
ref: null,
props: { name: 'Sara' },
// ... 其他内部属性
}
```

因此，当我们传入自定义组件时，createElement的处理步骤和传入原生标签字符串时基本相同，除了在解析默认props时会使用type.defaultProps。

注意：在createElement中，会检查type是否存在defaultProps，如果存在，并且props中相应的值为undefined，则会使用defaultProps中的默认值。

例如，如果Welcome组件有defaultProps：

```javascript
Welcome.defaultProps = { name: 'Unknown' };
```

那么当createElement时，如果config中没有传入name，则props.name会被设置为'Unknown'。

**总结：**

createElement并不关心type是自定义组件还是原生标签，它只是按照相同的逻辑创建一个React元素对象。组件的实际渲染是由React的渲染器（如ReactDOM）在后续阶段处理的。

### 4.3、总结createElement的作用

综上所述，jsx转为ReactElement一共经历如下几个过程：

:::color1
jsx ---》通过babel转为React.createElement的调用---》二次处理key、ref、self、source四个属性值---》遍历config，筛选出可以提取进props里的属性---》提取子元素，推入childArray(即props.children)数组---》格式化defaultProps---》综合以上数据作为入参，发起ReactElement调用。

:::

createElement中并没有十分复杂的涉及算法或真实DOM的逻辑，它的每一个步骤几乎都是在格式化数据。说得更直白点，createElement就像是开发者和ReactElement调用之间的一个“转换器”、一个数据处理层。它可以从开发者处接受相对简单的参数，然后将这些参数按照ReactElement的预期做一层格式化，最终通过调用 ReactElement来实现元素的创建。

ReactElement函数是React中的一个核心函数，用于创建虚拟DOM元素。它接受三个参数：type、props和children，然后返回一个描述虚拟DOM元素的对象。

type参数表示要创建的元素类型，可以是字符串表示的HTML标签名，也可以是一个React组件。props参数是一个包含了元素属性的对象，可以包括元素的属性和事件处理函数等。children参数表示元素的子元素，可以是文本节点、其他React元素或者数组。

ReactElement函数创建的虚拟DOM元素可以通过ReactDOM进行渲染，最终转化为真实的DOM元素插入到页面中。这种虚拟DOM的创建和渲染方式能够提高页面的性能和响应速度，是React的核心特性之一。

## 5、补充

### 5.1、props属性检查

在 React 中，有一些属性是不能直接透传到子组件的，这些属性包括：

1. key：key 是用于帮助 React 识别列表中各个元素的唯一标识，它不应该被作为普通的 props 传递给子组件。
2. ref：ref 用于引用 React 元素或组件的实例，它也不应该被直接透传给子组件。
3. \_\_source：记录JSX元素在源码中的文件路径和行号，用于错误堆栈中定位问题。
4. \_\_self：指向当前组件实例（仅在老式类组件中使用），用于调试时识别组件自身。

这些属性通常由React自身进行处理和管理，所以不应该直接作为props传递给子组件。如果将它们作为props传递给子组件，React会发出警告，因为这样做可能会引起意外的行为。

**因此这上面的4个属性我们都不能直接在子组件的props种提取到的。而key和ref给我们加了警告，因为**source和**self只有在开发环境中使用到，因此这里没有加提示的。**

除了上述的属性，一般情况下，其他属性都可以直接透传给子组件。当然，具体要透传哪些属性还是需要根据组件的需求和设计来确定。  
而当我们错误的使用key当做props使用的使用，react就会给我们报错，如：

```javascript
ReactElement.js:60 App: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop
```

具体的代码为：

```javascript
ReactDOM.render(<App key={1111} />, document.getElementById('root'));

export default function App(props) {
  console.log(props.key, 'key');
  return <div>1111</div>;
}
```

**注意：这里是因为使用了props.key获取key的时候才发生的报错，并不是因为给App设置了key导致的，给组件设置key是为了方便diff算法的。**

如上，可知其实这个判断被写在了createElement方法上，改方法中有这么断：

```javascript
// 判断当前为开发环境
if (__DEV__) {
  // 如果key或ref属性存在
  if (key || ref) {
    const displayName =
      typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;
    // 如果key属性存在
    if (key) {
      // 为props对象添加key属性
      // 并指定当通过props对象获取key属性时报错
      defineKeyPropWarningGetter(props, displayName);
    }
    // 如果ref属性存在
    if (ref) {
      // 为props对象添加ref属性
      // 并指定当通过props对象获取ref属性时报错
      defineRefPropWarningGetter(props, displayName);
    }
  }
}
```

```javascript
function defineKeyPropWarningGetter(props, displayName) {
  const warnAboutAccessingKey = function () {
    if (__DEV__) {
      if (!specialPropKeyWarningShown) {
        specialPropKeyWarningShown = true;
        console.error(
          '%s: `key` is not a prop. Trying to access it will result ' +
            'in `undefined` being returned. If you need to access the same ' +
            'value within the child component, you should pass it as a different ' +
            'prop. (https://fb.me/react-special-props)',
          displayName,
        );
      }
    }
  };
  warnAboutAccessingKey.isReactWarning = true;
  Object.defineProperty(props, 'key', {
    get: warnAboutAccessingKey,
    configurable: true,
  });
}

function defineRefPropWarningGetter(props, displayName) {
  const warnAboutAccessingRef = function () {
    if (__DEV__) {
      if (!specialPropRefWarningShown) {
        specialPropRefWarningShown = true;
        console.error(
          '%s: `ref` is not a prop. Trying to access it will result ' +
            'in `undefined` being returned. If you need to access the same ' +
            'value within the child component, you should pass it as a different ' +
            'prop. (https://fb.me/react-special-props)',
          displayName,
        );
      }
    }
  };
  warnAboutAccessingRef.isReactWarning = true;
  Object.defineProperty(props, 'ref', {
    get: warnAboutAccessingRef,
    configurable: true,
  });
}
```

这2个的报错信息就直接通过defineKeyPropWarningGetter方法和defineRefPropWarningGetter直接分别console.error出错误。然后定义了一个specialPropRefWarningShown全局变量，这样让错误只会输出一次，而不用重复输出。

综上所述：react用于检查props中的属性，是通过createElement增加判断来控制的。
