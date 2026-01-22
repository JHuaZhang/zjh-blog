---
group:
  title: React16原理
order: 3
title: ReactElement函数介绍

nav:
  title: React原理
  order: 4
---

# ReactElement函数介绍

## 1、ReactElement函数
### 1.1、介绍
经过前面的学习，我们知道写React组件的时候，会使JSX，比如：

```javascript
<div className="App">
  <h1 className="title">I am the title</h1>
  <p className="content">
    <h3>this is h3</h3>
    <em>this is em</em>
  </p>
</div>

```

会被babel编译成多层嵌套的React.createElement函数调用：

```javascript
"use strict";
React.createElement("div", {
  className: "App"
}, React.createElement("h1", {
  className: "title"
}, "I am the title"), React.createElement("p", {
  className: "content"
}, React.createElement("h3", null, "this is h3"), React.createElement("em", null, "this is em")));
```

React.createElement在react包中，接受：

> + 元素的 type；
> + 组件的 props（包括 key 和 ref）；
> + 其余参数则是子元素，同样是 ReactElement 类型；
>

该方法会返回一个对象，这个对象就是ReactElement。ReactElement函数源码为：

```javascript
/*
 *  接收参数，返回ReactElement
 */
const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    /*
    * $$typeof介绍：
    * 组件的类型，十六进制数值或者Symbol值，看浏览器是否支持Symbol，不支持则以16进制数
    * React在渲染DOM的时候，需要确保元素的类型为REACT_ELEMENT_TYPE，需要此属性作为判断依据
    * 只有属性为REACT_ELEMENT_TYPE才会被渲染成真正的DOM
    */
    $$typeof: REACT_ELEMENT_TYPE,  
    /*
    * type介绍：
    * 元素具体的类型值 如果是元素节点type属性中存储的就是div span等
    * 如果元素是组件 type属性中存储的就是组件的构造函数
    */
    type: type,
    /*
    * key介绍：
    * 元素的唯一标识
    * 用作内部vdom比对，提升DOM操作性能
    */
    key: key,
    /*
    * ref介绍：
    * 存储元素DOM对象或者组件 实例对象
    */
    ref: ref,
    /*
    * props介绍：
    * 存储向组件内部传递的数据
    */
    props: props,
    /*
    * _owner介绍：
    * 记录当前元素所属组件(记录当前元素是哪个组件创建的)
    */
    _owner: owner,
  };

  if (__DEV__) {
    element._store = {};
    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false,
    });
    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self,
    });
    Object.defineProperty(element, '_source', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source,
    });
    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }
  // 返回ReactElement
  return element;
};
```

ReactElement函数是React中的一个核心函数，用于创建虚拟DOM元素。它接受三个参数：type、props和children，然后返回一个描述虚拟DOM元素的对象。

+ type参数表示要创建的元素类型，可以是字符串表示的HTML标签名，也可以是一个React组件。
+ props参数是一个包含了元素属性的对象，可以包括元素的属性和事件处理函数等。
+ children参数表示元素的子元素，可以是文本节点、其他React元素或者数组。

ReactElement函数创建的虚拟DOM元素可以通过ReactDOM进行渲染，最终转化为真实的DOM元素插入到页面中。这种虚拟DOM的创建和渲染方式能够提高页面的性能和响应速度，是React的核心特性之一。

**ReactElement本质是一个普通的、不可变的JavaScript对象，ReactElement 是不可变的（immutable），意味着一旦创建，就不能再修改它的type、props、key等属性。如果想“改变”它，只能基于原对象创建一个新的对象。**

```javascript
const element = <h1>Hello</h1>;
// ❌ 不应该这样做：
element.props.children = "Hi"; // 错误！违反不可变性

// ✅ 正确做法：创建新元素
const newElement = React.cloneElement(element, null, "Hi");
```

**ReactElement结构如下：**

```javascript
{
  $$typeof: Symbol | number,
  type: string | Function | Class,
  key: string | null,
  ref: object | string | Function | null,
  props: Object,
  _owner: ReactComponent | null,
  _store: { validated: boolean } | null,
  _self: ReactElement | null,
  _source: {
    fileName: string,
    lineNumber: number
  } | null
}
```

我们可以将ReactElement认为是一个虚拟DOM节点（为描述更简洁，称作 vdom），用来做新旧虚拟DOM树的对比。我们将上面的例子修改一下并输出：

```javascript
export default function App() {
  const fragmentObject = (
    <div className="App">
      <h1 className="title">I am the title</h1>
      <p className="content">
        <h3>this is h3</h3>
        <em>this is em</em>
      </p>
    </div>
  );
  console.log(fragmentObject,'fragmentObject')
  return fragmentObject;
}

```

可以看到输出的DOM结构如下：

```javascript
{
  $$typeof: Symbol(react.element)
  key: null
  props: children: Array(2)
  0: {$$typeof: Symbol(react.element), type: 'h1', key: null, ref: null, props: {…}, …}
  1: {$$typeof: Symbol(react.element), type: 'p', key: null, ref: null, props: {…}, …}
  length: 2
    [[Prototype]]: Array(0)
  className: "App"
    [[Prototype]]: Object
  ref: null
  type: "div"
  _owner: FiberNode {tag: 0, key: null, stateNode: null, elementType: ƒ, type: ƒ, …}
  _store: {validated: false}
  _self: null
  _source: {fileName: '/Users/jianhuazhang/Desktop/study-demo/自学/react-st…-React原理篇/【04】ReactElement函数介绍/01-demo/src/App.js', lineNumber: 5, columnNumber: 5}
  [[Prototype]]: Object
}
```

可以看到这个就是经过ReactElement函数处理后生成的虚拟DOM节点结构。实际上，所谓的“虚拟 DOM”，就是整个ReactElement树，即：由嵌套的ReactElement构成的一棵JavaScript对象树。因此，上面的对象是虚拟DOM树中的一个分支（子树），而不是完整整棵树，但它的本质确实是“虚拟 DOM”的一部分。

**注意：ReactElement ≠ Fiber Node（真正的内部树）**

虽然我们常说“虚拟 DOM”，但在React内部真正用于协调（reconciliation）的是Fiber树，而不是ReactElement树。所以严格来说：

+ ReactElement是声明性的蓝图（像建筑的设计图）。
+ Fiber是运行时的状态容器（像正在施工的工地）。

React在每次渲染时，会根据新的ReactElement树与旧的Fiber树进行对比（diff），然后更新真实DOM。

### 1.2、ReactElement对象各个字段解析
#### 1.2.1、$$typeof的作用
+ 类型：Symbol或number。
+ 作用：用于标识该对象是一个React元素（Element）。
+ 值：REACT_ELEMENT_TYPE，在开发环境中通常是Symbol.for('react.element')，在不支持Symbol的环境中回退为数字0xeac7。
+ 目的：防止XSS攻击，确保只有合法的React元素被渲染。

**REACT_ELEMENT_TYPE介绍：**

REACT_ELEMENT_TYPE是React中的一个内置常量，用于标识一个对象是否是React元素。它在React源码中用于类型检查和判断一个对象是否是React元素。在React中，虚拟DOM元素是通过ReactElement函数创建的，而REACT_ELEMENT_TYPE常量可以用于区分普通的JavaScript对象和React元素。  
	当使用React.createElement或JSX语法创建虚拟DOM元素时，最终会生成一个具有REACT_ELEMENT_TYPE常量的对象，这个对象描述了要创建的虚拟DOM元素的类型、属性和子元素。这种机制使得React能够准确地识别和处理虚拟DOM元素，从而进行高效的渲染和更新。总之，REACT_ELEMENT_TYPE在React中起着标识和区分React元素的作用，是React内部的一种标记机制。

```javascript
const hasSymbol = typeof Symbol === 'function' && Symbol.for;

export const REACT_ELEMENT_TYPE = hasSymbol
  ? Symbol.for('react.element')
  : 0xeac7;
```

如上代码可知，这里其实就是定义了一个常量，通过判断是否支持Symbol语法，如果支持Symbol语法，则$$typeof赋值Symbol.for('react.element')，不然则是赋值为0xeac7。

#### 1.2.2、type的作用
在 ReactElement对象中：

```javascript
{
  type: string | Function | Class | Symbol
}
```

React通过type的类型和值来判断元素的“本质”。以下是完整的分类：

##### 1.2.2.1、字符串类型：原生DOM元素
```javascript
<div />
<h1>Hello</h1>
<input type="text" />
```

编译后：

```javascript
React.createElement('div', null)
React.createElement('h1', null, 'Hello')
React.createElement('input', { type: 'text' })
```

type值分别为：

```javascript
type: 'div'     // 字符串
type: 'h1'
type: 'input'
```

**特点：**

:::color1
+ React会为这些元素创建真实的DOM节点（如document.createElement('div')）
+ 属于Host Component（宿主组件）。
+ 在Fiber架构中对应HostComponent类型的 Fiber 节点。
+ 源码中通过typeof type === 'string'来识别原生标签。

:::

##### 1.2.2.2、函数或类：自定义组件
```javascript
function Welcome(props) {
  return <h1>Hello {props.name}</h1>;
}

<Welcome name="React" />
```

type值为：

```javascript
type: Welcome  // 指向函数本身
```

```javascript
class App extends React.Component {
  render() {
    return <div>Hello</div>;
  }
}

<App />
```

type值为：

```javascript
type: App  // 指向类构造函数
```

**特点：**

:::color1
+ React需要“执行”这个组件来获取其返回的子元素（即render方法的结果）
+ 在Fiber架构中对应ClassComponent或FunctionComponent类型的Fiber节点。
+ React会通过new Type(props, context)（类）或Type(props, context)（函数）来“求值”。
+ 源码中通过 typeof type === 'function' 来识别组件。

:::

##### 1.2.2.3、Symbol/内置类型：React内部组件
React定义了一些特殊的Symbol类型，用于表示内置的语义化组件。

```javascript
type: Symbol.for('react.fragment')  // 或 0xeacb（无 Symbol 环境）
type: Symbol.for('react.profiler')  // 或 0xead2
type: Symbol.for('react.strict_mode')  // 或 0xeacc
type: Symbol.for('react.suspense')  // 或 0xead1
```

例如：React.memo(MyComponent) 返回的对象的type是 { $$typeof: REACT_MEMO_TYPE, type: MyComponent, ... }

##### 1.2.2.4、React如何根据type做判断
在React的协调（Reconciliation）过程中，会根据type判断元素类型，决定如何处理。

源码中的关键判断逻辑（简化），在react-reconciler中，会通过elementType（即element.type）来创建对应的 Fiber：

```javascript
function createFiberFromElement(element) {
  const type = element.type;
  const key = element.key;
  const pendingProps = element.props;

  let fiber;

  if (typeof type === 'string') {
    // <div />、<span /> 等原生标签
    fiber = createFiberFromTypeAndProps(type, null, pendingProps, key);
  } else if (typeof type === 'function') {
    // 函数或类组件
    fiber = createFiberFromTypeAndProps(type, type, pendingProps, key);
  } else if (typeof type === 'symbol') {
    // 特殊内置组件：Fragment、Suspense 等
    switch (type) {
      case REACT_FRAGMENT_TYPE:
        return createFiberFromFragment(pendingProps.children, key);
      case REACT_SUSPENSE_TYPE:
        return createFiberFromSuspense(pendingProps, key);
      // ...
    }
  }
  // ...
}
```

#### 1.2.3、key的作用
##### 1.2.3.1、key的核心作用
key是ReactElement中一个极其重要的属性。它虽然不会传递给组件的props，但在列表渲染、Diff 算法和性能优化中起着决定性作用。

```javascript
{
  key: string | null
}
```

+ 类型：字符串（推荐使用稳定 ID），也可以是数字或表达式结果。
+ 默认值：null。
+ 不传递给组件：this.props.key是undefined。
+ 仅用于React内部Diff算法。

**正确用法：**

```javascript
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}
```

**错误用法（常见性能陷阱）：**

```javascript
{items.map((item, index) => (
  <li key={index}>{item.name}</li>  // ❌ 不稳定key
))}
```

**key的核心作用：提升Diff效率与状态稳定性：**

```javascript
// 初始
<ul>
  <li>A</li>
  <li>B</li>
  <li>C</li>
</ul>

// 更新后（顺序调换）
<ul>
  <li>C</li>
  <li>A</li>
  <li>B</li>
</ul>
```

如果没有key，React只能通过位置索引来对比：

| 旧位置 | 新位置 |
| --- | --- |
| A (0) → C (0) | ❌ 不同，销毁 A，创建 C |
| B (1) → A (1) | ❌ 不同，销毁 B，创建 A |
| C (2) → B (2) | ❌ 不同，销毁 C，创建 B |


结果：全部DOM被重新创建，性能极差！

加上key后的Diff逻辑：React会基于key做映射：

| key | 旧节点 | 新位置 | 操作 |
| --- | --- | --- | --- |
| a | 位置 0 | 位置 1 | 移动（保留实例/DOM） |
| b | 位置 1 | 位置 2 | 移动 |
| c | 位置 2 | 位置 0 | 移动 |


结果：只做移动操作，不销毁重建，性能大幅提升！

##### 1.2.3.2、key在源码中的实现机制
在ReactElement中：

```javascript
{
  key: 'abc' || null
}
```

在Fiber节点中：

```javascript
fiber.key = element.key;
```

当父组件渲染一个数组子元素时，React会调用：

```javascript
function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren)
```

这个函数的核心任务就是：将旧的Fiber链表与新的ReactElement数组进行高效匹配。实现策略分两步：

**①、单遍预处理（利用key快速匹配）**

React会先遍历旧的Fiber链表，构建一个以key为键的Map：

```javascript
const existingChildren = mapRemainingChildren(returnFiber, currentFirstChild);
// 形如: { 'a': fiberA, 'b': fiberB, 'c': fiberC }
```

然后遍历新的newChildren数组，尝试通过key查找可复用的旧Fiber。

```javascript
for (let i = 0; i < newChildren.length; i++) {
  const newChild = newChildren[i];
  const key = newChild.key ?? null;

  const matchedFiber = existingChildren.get(key);
  if (matchedFiber !== undefined) {
    // 复用该 Fiber（可能是移动）
    useFiber(matchedFiber, newChild.pendingProps);
  } else {
    // 创建新 Fiber
    createFiberFromElement(newChild);
  }
}
```

**②、处理无key或冲突情况（退化为index匹配）**

如果开发者没有写key，React只能使用数组索引作为隐式key：

```javascript
key = null; // 相当于所有元素 key 都一样
```

此时React无法区分谁是谁，只能按顺序一一对应，导致：

+ 插入/删除/移动都会引起大量不必要的更新。
+ 组件状态错乱（尤其是带内部state的组件）。

源码中会警告：

```javascript
Warning: Each child in a list should have a unique "key" prop.
```

**key如何影响Fiber复用：**

在ReactFiberReconciler.js中，关键判断如下：

```javascript
function placeChild(newFiber, lastPlacedIndex, newIndex) {
  const key = newFiber.key;
  const existingFiber = existingChildren.get(key);

  if (existingFiber === undefined) {
    // 新增节点
    newFiber.flags = Placement;
  } else {
    // 复用节点（可能需要移动）
    if (shouldMove(existingFiber, newIndex)) {
      const index = existingFiber.index;
      if (index < lastPlacedIndex) {
        newFiber.flags = Placement; // 标记为移动
        return lastPlacedIndex;
      }
    }
    // 否则就地复用，不标记移动
  }
  return Math.max(newIndex, lastPlacedIndex);
}
```

## 2、图例说明React渲染流程图
上面我们了解到了ReactElement是什么，以及其中的一些属性的关键作用，但是看到这里，我们就会继续懵逼，ReactElement创建之后，后面React又做了什么操作呢？这里我们就以流程图的形式，明确后面将接触到的内容。

React渲染流程图（JSX → ReactElement → Fiber → DOM）

```javascript
+------------------+
|     编写 JSX     |
| <Button>Click</Button> |
+--------+---------+
         |
         ↓
+---------------------+
| Babel 编译为 JS     |
| React.createElement( |
|   Button,           |
|   { onClick: fn },  |
|   "Click"           |
| )                   |
+--------+------------+
         |
         ↓
+---------------------------+
| React.createElement 执行 |
| 生成 ReactElement 对象     |
|                           |
| {                         |
|   $$typeof: Symbol(...),   |
|   type: Button,           |
|   props: { onClick, ... },|
|   key: null, ref: null,   |
|   _owner: AppFiber        |
| }                         |
+--------+------------------+
         |
         ↓
+-----------------------------+
| 组件 render() 返回该对象     |
| (如 App.render())            |
|                              |
| React 核心接收这个“虚拟 DOM” |
+--------+---------------------+
         |
         ↓
+-------------------------------+
| 协调器 (Reconciler) 开始工作    |
| 调用 reconcileChildren         |
|                                |
| 为每个 ReactElement 创建 Fiber |
| 节点                           |
+--------+-----------------------+
         |
         ↓
+----------------------------------+
| createFiberFromElement(element)   |
|                                  |
| 生成 Fiber 节点：                 |
|                                  |
| {                                |
|   type: Button,                  |
|   tag: CLASS_COMPONENT,          |
|   pendingProps: element.props,   | ←─ 来自 ReactElement
|   return: appFiber,              |
|   child: null,                   |
|   stateNode: null                |
| }                                |
+--------+-------------------------+
         |
         ↓
+----------------------------------+
| 工作循环 (beginWork)              |
|                                  |
| updateClassComponent(...)        |
|   → new Button()                 |
|   → 调用 Button.render()         |
|     返回 <button> 的 ReactElement|
+--------+-------------------------+
         |
         ↓
+----------------------------------+
| 再次 createFiberFromElement       |
| 生成 HostComponent Fiber          |
|                                  |
| {                                |
|   type: 'button',                |
|   tag: HOST_COMPONENT,           |
|   pendingProps: { ... },         |
|   stateNode: null                |
| }                                |
+--------+-------------------------+
         |
         ↓
+----------------------------------+
| 提交阶段 (commit phase)           |
| commitPlacement(...)              |
|                                  |
| document.createElement('button') |
| setAttribute('class', 'btn')     |
| appendChild 到父节点              |
|                                  |
| 最终：Fiber.stateNode = 真实DOM   |
+----------------------------------+
         |
         ↓
+---------------------+
| 页面上看到按钮！     |
| <button>Click</button> |
+---------------------+
```

## 3、补充
### 3.1、isValidElement验证是否为React元素
简单的说isValidElement方法的作用是用于检查给定的对象是否为React元素。该方法会检查对象是否具有特定的属性和方法，并且是否由React创建。如果对象符合这些条件，则返回true；否则返回false。这个方法通常用于在处理React元素时进行类型检查和验证。

```javascript
/**
 * Verifies the object is a ReactElement.
 * See https://reactjs.org/docs/react-api.html#isvalidelement
 * @param {?object} object
 * @return {boolean} True if `object` is a ReactElement.
 * @final
 */
export function isValidElement(object) {
  return (
    typeof object === 'object' &&
    object !== null &&
    object.$$typeof === REACT_ELEMENT_TYPE
  );
}
```


