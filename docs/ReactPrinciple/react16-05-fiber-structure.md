---
group:
  title: React16原理
order: 5
title: Fiber数据结构介绍

nav:
  title: React原理
  order: 4
---


## 1、什么是Fiber
React Fiber是React框架的一种底层架构，为了改进React的渲染引擎，使其更加高效、灵活和可扩展。  
传统上，**React使用一种称为堆栈调和递归算法来处理虚拟DOM的更新**，这种方法在大型应用或者频繁更新的情况下可能会产生性能问题。React Fiber则是基于一种增量渲染的思想，它将更新任务分解成小的、可中断的单元，使得React在更新时可以更灵活地控制和切换任务，提高应用的响应性。  
**ReactFiber的核心特点包括：**

:::color1
+ **增量渲染**： React Fiber将更新任务拆分成多个小任务单元（称为 “fiber”），并使用优先级调度器来处理这些任务，以提高响应性和用户体验。
+ **优先级调度**： Fiber引入了优先级概念，使React能够根据任务的优先级来决定任务的执行顺序，确保高优先级任务得到及时处理。
+ **中断与恢复**： React Fiber允许在渲染过程中中断任务，然后在适当的时机恢复执行，从而避免了阻塞的情况。
+ **任务取消**： Fiber具备任务取消的能力，可以取消不必要的更新，提高性能。

:::

React Fiber架构的引入使得React更适用于构建大型、复杂的应用，同时也为引入一些新的功能（如异步渲染、懒加载等）提供了基础。需要注意的是，从用户角度看，React Fiber并不会引入显著的变化，它是在底层实现上进行的优化，但这些优化在一些场景下可能会显著地提升应用的性能。

### 1.1、Fiber数据类型
如下是Fiber的ts类型定义。

```typescript
// AFiberis work on a Component that needs to be done or was done. There can
// be more than one per component.
export typeFiber= {|
  /** 
  ******************************DOM实例相关属性***********************************
  */
  // tag: 标记不同的组件类型,表示Fiber节点的类型，可以是函数组件、类组件、原生组件等。
  tag: WorkTag,
  // key: 用于标识列表中的子元素，在协调时用于优化更新。
  key: null | string,
  //elementType: 元素的类型，通常为 React 组件的类型或 HTML 标签的字符串。
  elementType: any,
  // type: 与 elementType 类似，通常指向函数或类组件的类型。
  type: any,
  // stateNode:Fiber节点对应的实际DOM节点或组件实例。
  // 实例对象，如类组件的实例，原生dom实例，而function组件没有实例，该属性为空
  stateNode: any,

  /** 
  ******************************构建Fiber树相关属性***********************************
  */
 // return: 指向当前节点的父节点。
  return:Fiber| null,
  // child: 指向当前节点的第一个子节点。
  child:Fiber| null,
  // sibling: 指向当前节点的下一个兄弟节点。
  sibling:Fiber| null,
  // index: 在父节点的子节点列表中的索引。
  index: number,
  // ref: 用于在 React 中引用DOM或组件实例。
  ref:
    | null
    | (((handle: mixed) => void) & {_stringRef: ?string, ...})
    | RefObject,

  /** 
  ******************************状态数据相关***********************************
  */
  // pendingProps: 待处理的属性，即组件接收到的新属性。即即将更新的props
  pendingProps: any,
  // memoizedProps: 记忆的属性，即之前处理过的属性。
  memoizedProps: any, 
  // memoizedState: 记忆的状态，即之前的组件状态，state。
  memoizedState: any,

  /** 
  ******************************副作用相关***********************************
  */
  // updateQueue: 用于存储组件的更新状态。表示的是任务队列，比如组件的状态更新，组件的渲染，都会存储这里
  // 会存在多个任务的情况，比如多次触发setState，更新并不是马上发生的，react会将多个更新操作放在队列中，然后批量执行操作。
  updateQueue: UpdateQueue<any> | null,
  // dependencies: 用于追踪组件更新时的依赖关系。
  dependencies: Dependencies | null,
  // mode: 表示当前 React 渲染模式的类型，如 同步模式、异步模式、Concurrent 模式。
  mode: TypeOfMode,
  // effectTag: 表示Fiber节点的副作用类型，如更新、插入、删除等。
  effectTag: SideEffectTag,
  // nextEffect: 下一个需要处理的副作用节点。
  nextEffect:Fiber| null,
  // firstEffect: 第一个副作用节点。
  firstEffect:Fiber| null,
  // lastEffect: 最后一个副作用节点。
  lastEffect:Fiber| null,
  // expirationTime: 表示任务的到期时间，用于调度更新的优先级。
  expirationTime: ExpirationTime,
  // childExpirationTime: 子节点的到期时间。
  childExpirationTime: ExpirationTime,
  // alternate: 指向与当前Fiber相关的另一个Fiber对象，用于在更新过程中进行比较和回溯。
  alternate:Fiber| null,
  // actualDuration: 实际渲染时间的持续时间。
  actualDuration?: number,
  // actualStartTime: 实际渲染开始的时间。
  actualStartTime?: number,
  // selfBaseDuration: 组件自身渲染时间的持续时间。
  selfBaseDuration?: number,
  // treeBaseDuration: 整个组件子树渲染时间的持续时间。
  treeBaseDuration?: number,
  // _debugID: 用于调试的Fiber节点的 ID。
  _debugID?: number,
  // _debugSource: 用于调试的源码信息。
  _debugSource?: Source | null,
  // _debugOwner: 用于调试的Fiber节点的所有者。
  _debugOwner?:Fiber| null,
  // _debugIsCurrentlyTiming: 是否当前正在进行性能计时。
  _debugIsCurrentlyTiming?: boolean,
  // _debugNeedsRemount: 是否需要重新挂载。
  _debugNeedsRemount?: boolean,
  // _debugHookTypes: 用于调试的 Hook 类型数组。
  _debugHookTypes?: Array<HookType> | null,
|};
```

所以，在本质上，Fiber是一个JavaScript对象，代表React的一个工作单元，它包含了与组件相关的信息。一个简化的Fiber对象长这样：

```javascript
{
  type: 'h1',  // 组件类型
  key: null,   // React key
  props: { ... }, // 输入的props
  state: { ... }, // 组件的state (如果是class组件或带有state的function组件)
  child:Fiber| null,  // 第一个子元素的Fiber
  sibling:Fiber| null,  // 下一个兄弟元素的Fiber
  return:Fiber| null,  // 父元素的Fiber
  alternate: FiberNode {tag: 3, key: null, elementType: null, type: null, stateNode: FiberRootNode, …}
  firstEffect: FiberNode {tag: 0, key: null, stateNode: null, elementType: ƒ, type: ƒ, …}
  lastEffect: FiberNode {tag: 0, key: null, stateNode: null, elementType: ƒ, type: ƒ, …}
  updateQueue: {baseState: {…}, baseQueue: null, shared: {…}, effects: null}
  // ...其他属性
}
```

当React开始工作时，它会沿着Fiber树形结构进行，试图完成每个Fiber的工作（例如，比较新旧props，确定是否需要更新组件等）。如果主线程有更重要的工作（例如，响应用户输入），则React可以中断当前工作并返回执行主线程上的任务。因此，Fiber不仅仅是代表组件的一个内部对象，它还是React的调度和更新机制的核心组成部分。

如上的数据结构我们知道Fiber工作原理中的几个关键点：

:::color1
+ **单元工作**：每个Fiber节点代表一个单元，所有Fiber节点共同组成一个Fiber链表树（有链接属性，同时又有树的结构），这种结构让React可以细粒度控制节点的行为。
+ **链接属性**：child、sibling和return字段构成了Fiber之间的链接关系，使React能够遍历组件树并知道从哪里开始、继续或停止工作。

:::

### 1.2、Fiber各属性详解
#### 1.2.1、tag
```javascript
tag: WorkTag
```

表示这个Fiber节点的类型。

**常见值包括：**

:::color1
+ FunctionComponent (0)：函数组件。
+ ClassComponent (1)：类组件。
+ HostRoot (3)：根节点（ReactDOM.render的容器）。
+ HostComponent (5)：原生DOM元素（如div、span）。
+ HostText (6)：文本节点。
+ Fragment (7)：<></>片段。
+ ContextProvider (8)：Context.Provider。
+ MemoComponent (14)：React.memo包裹的组件。

:::

 决定了后续如何处理该节点（执行函数？实例化类？创建 DOM？）。

#### 1.2.2、type
```javascript
type: any
```

:::color1
+ 对于原生标签（如 div），type === 'div'。
+ 对于自定义组件，type === MyComponent。
+ 对于 context provider，type === React.createContext().Provider。

:::

可以通过typeof fiber.type === 'function'判断是不是函数组件。

注意：type和elementType有时不同（比如带$$typeof的懒加载组件）。

#### 1.2.3、key
```javascript
key: null | string
```

来自JSX中的key属性，用于diff算法中识别节点是否可复用。用于帮助React识别哪些元素发生了变化、被添加或被删除。

```javascript
items.map(item => <li key={item.id}>{item.name}</li>)
```

#### 1.2.4、elementType
描述元素的类型，可能包含Symbol（如 React.memo, React.lazy）。比type更原始。

:::color1
+ elementType：表示原始的、未经处理的组件类型（如React.lazy()返回的对象）。换句话说是“开发者写了什么”。
+ type：表示经过处理后的实际类型，通常用于创建元素或判断如何渲染，换句话说是React“拿来用的是什么”。

:::

| 属性 | 含义 | 常见值 | 使用阶段 | 是否会被包装 |
| --- | --- | --- | --- | --- |
| elementType | 组件的原始类型 | FunctionComponent, ClassComponent, React.lazy(), React.memo()等 | 创建Fiber阶段保留 | 可能是包装对象（如 lazy） |
| type | 实际要渲染的类型 | 对于lazy是{ $$typeof: REACT_LAZY_TYPE }；对于普通函数是函数本身 | Diff和渲染时参考 | 已解包或标准化 |


比如这个代码中：

```javascript
const MemoDemo = React.memo(() => {
  return <div>react memo</div>;
});

export default MemoDemo;
```

+ elementType: {$$typeof: Symbol(react.memo), compare: null, type: ƒ}
+ type: () => {…}

**源码层面解释：**

在ReactElement.js中创建元素时：

```javascript
export function jsx(type, props, key) {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: null,
    props: props,
    // ...
  };
}
```

然后在createFiberFromTypeAndProps中：

```javascript
function createFiberFromTypeAndProps(type, props) {
  let fiberTag = IndeterminateComponent;
  let resolvedType = type;

  if (typeof type === 'function') {
    // 函数组件
    fiberTag = FunctionComponent;
  } else if (typeof type === 'string') {
    // DOM 元素
    fiberTag = HostComponent;
  } else if (type != null && type.$$typeof === REACT_LAZY_TYPE) {
    fiberTag = LazyComponent;
    resolvedType = null; // 暂时不解析
  } else if (type != null && type.$$typeof === REACT_MEMO_TYPE) {
    fiberTag = MemoComponent;
  }

  return createFiber(fiberTag, pendingProps, key, resolvedType);
}

```

这里传入的type就是elementType，而resolvedType最终赋给fiber.type。但在大多数情况下，type和elementType是相等的，只是语义不同。

#### 1.2.5、stateNode
```javascript
stateNode: any
```

指向与此Fiber关联的局部状态实例：

:::color1
+ 类组件：组件实例（new MyComponent()）。
+ 函数组件：通常是null（无实例）。
+ HostComponent：真实DOM节点（如<div>对应的HTMLDivElement）。
+ HostRoot：根容器（如document.getElementById('root')）。

:::

举例：

```javascript
stateNode: FiberRootNode {tag: 0, current: FiberNode, containerInfo: div#root, pendingChildren: null, pingCache: null, …}
```

#### 1.2.6、树结构指针
:::color1
+ return: Fiber | null，父Fiber节点。相当于“父级”。类似于调用栈中的“调用者”。
+ child: Fiber | null，第一个子Fiber节点。
+ sibling: Fiber | null，下一个兄弟Fiber节点。

:::

这三个指针构成了链表树结构：

```javascript
         return
     ┌───────────────┐
     ▼               │
[parent]         [current]
     │               ▲
     └───child────▶ [child1] ───sibling──▶ [child2] ──▶ null
```

这样设计的好处是：

+ 可以从任意节点向上遍历（通过 return）。
+ 子节点以链表形式连接，避免使用数组导致频繁分配内存。

#### 1.2.7、alternate
```javascript
alternate: Fiber | null
```

双缓存技术的关键！React 在渲染时维护两棵Fiber树：

+ Current Tree：当前屏幕上显示的内容。
+ WorkInProgress Tree：正在构建的新树（尚未提交）。

每个Fiber节点都有一个alternate指向另一棵树上的对应节点。初始时：fiber.alternate === null，首次更新后：建立双向连接。

**目的：**

+ 提高性能：只在需要时创建新节点。
+ 支持增量更新：一边构建新树，一边保留旧树供展示。

#### 1.2.8、状态与Props
| 属性 | 用途 |
| --- | --- |
| pendingProps | 正在处理的新props（下一次渲染要用的） |
| memoizedProps | 上一次成功渲染所用的props（缓存） |
| memoizedState | 上一次渲染后的状态（class的this.state，function的hooks状态） |


协调器会比较pendingProps vs memoizedProps来判断是否需要重新渲染。

:::color1
这句话让我产生了一个疑问，这里不是React.memo的功能吗？正常的父组件触发render，子组件都会重新render的，子组件被重新执行了，虽然后面diff后发现内容无变化。那这里和React.memo有什么区别呢？

:::

**pendingProps !== memoizedProps的比较是所有组件默认行为的一部分（包括函数组件和类组件），它发生在协调阶段（Reconciliation）。**而 React.memo是在此基础上的优化手段：即使props改变了，也可以跳过渲染。并且state变化一定会导致组件进入更新流程，但是否“真正执行 render”，还要看其他因素（如 shouldComponentUpdate/React.memo）。

协调器做这个比较的目的不是为了“跳过 render”，而是为了：

**①、决定是否复用旧的Fiber节点**

Fiber 节点是工作单元。如果：

:::color1
+ type相同。
+ key相同。
+ （某些情况下）pendingProps === memoizedProps。

:::

React可以复用这个Fiber节点，避免重建。

**②、触发副作用**

React需要知道哪些依赖项变了。通过比较新旧props/state，判断是否要触发useEffect、useCallback等。

**③、配合 shouldComponentUpdate（类组件）**

```javascript
class Child extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.name !== this.props.name;
  }
}
```

这里比较的就是nextProps（即pendingProps）和当前this.props（即memoizedProps）。

**完整流程图：**

```text
流程图：  
                ┌─────────────────┐
                │ Parent 更新触发   │
                └─────────────────┘
                          ↓
           子组件收到 newProps → pendingProps
                          ↓
     协调器：pendingProps ≠ memoizedProps ?
                ↙                   ↘
         需要更新              可能可复用（fiber 层）
               ↓
       是否有 shouldComponentUpdate?
               ↓
        返回 false? ──→ 跳过 render
               ↓
        返回 true 或无 SCU
               ↓
         执行 render() 或函数体
               ↓
         生成新的 React Elements
               ↓
          构建 WorkInProgress Tree
```

只有shouldComponentUpdate或React.memo才能跳过render阶段。

#### 1.2.9、dependencies
```javascript
dependencies: Dependencies | null
```

记录当前组件依赖的外部状态，主要用于：

+ Context订阅检测。
+ 在readContext()时收集依赖。

当context值变化时，React会检查此列表决定是否触发重新渲染。

#### 1.2.10、副作用标记系统
React使用副作用链来高效执行DOM更新、生命周期钩子等操作。

| 字段 | 作用 |
| --- | --- |
| flags: Flags | 标记此节点有哪些副作用（如 Placement、Update、Deletion） |
| nextEffect | 指向下一个有副作用的节点（形成单向链表） |
| firstEffect | 指向副作用链的第一个节点 |
| lastEffect | 指向副作用链的最后一个节点 |


在commit阶段，React遍历firstEffect → ... → lastEffect执行所有副作用。

**常见flags：s**

+ Placement：插入节点。
+ Update：更新节点。
+ Deletion：删除节点。
+ Callback：需要调用useEffect或类组件生命周期。
+ Ref：需要更新ref。

#### 1.2.11、updateQueue
```javascript
updateQueue: UpdateQueue<any> | null
```

存储该Fiber上的所有更新操作。结构类似队列，包含：

+ baseState: 基础状态。
+ shared.pending: 待处理的更新（如多次setState合并）。
+ effects: 回调数组（如useEffect的销毁函数）。

用于实现：多次setState()合并，函数组件中useState/useReducer的更新管理。

#### 1.2.12、index
```javascript
index: number
```

在同一父节点下的兄弟节点中的索引位置。通常为0，除非是数组渲染（如 `list.map((_, i) => <Item key={i} />)`），用于辅助diff。

#### 1.2.13、调试相关字段
| 字段 | 说明 |
| --- | --- |
| _debugSource | 源码位置（文件名、行号） |
| _debugOwner | 创建该节点的组件Fiber |
| _debugHookTypes | 函数组件中使用的Hook类型顺序（开发工具用） |


这些仅在DEV模式下存在，帮助DevTools定位问题。

## 2、ReactElement和React Fiber的区别
| 特性 | React Element | Fiber节点 |
| --- | --- | --- |
| 本质 | 不可变的普通JS对象 | 动态的数据结构，工作单元 |
| 目的 | 描述UI在某一时刻的轻量级快照（是什么） | 承载组件状态、副作用，用于调度和更新（怎么做） |
| 创建时机 | 每次render时都会重新创建 | 在协调过程中创建和复用 |
| 数据结构 | 简单的对象，包含type, props, key<br/>等 | 复杂的链表结构，包含child, sibling, return等指针 |
| 可变性 | 不可变 (immutable) | 可变 (mutable)，属性在更新时会改变 |


**ReactElement到Fiber的转换过程**

在React的渲染过程中，首先会将JSX编译成ReactElement树（虚拟DOM），然后根据这个ReactElement树创建对应的Fiber树。Fiber树是一个链表结构，每个Fiber节点对应一个ReactElement，并包含了组件的状态、副作用等信息。

**转换全过程图解**

从React Element到Fiber节点的转换是其渲染和更新机制的核心。

```text
转换全过程图解：
              JSX
               ↓
        React.createElement
               ↓
       构造ReactElement对象
               ↓
   ReactElement.type + props
               ↓
createFiberFromTypeAndProps()
               ↓
创建Fiber节点（tag, type, pendingProps...）
               ↓
  链接到Fiber树（child/sibling/return）
               ↓
进入beginWork/render阶段：执行组件函数or实例化类
               ↓
      生成子元素 → 递归创建更多Fiber
               ↓
      形成完整的WorkInProgress Tree
               ↓
      commit阶段：应用变更到真实 DOM
```

当组件因为setState、useReducer、useState或父组件更新而需要重新渲染时，React的执行顺序如下：

```text
1. 组件更新被调度（scheduleUpdate）
   ↓
2. 进入 render 阶段（beginWork）
   ↓
3. 执行组件函数（即你的 render 函数体）
   ↓
4. 返回新的 ReactElement（JSX 结果）
   ↓
5. 根据 ReactElement 创建或复用 Fiber 节点
   ↓
6. 构建 WorkInProgress Fiber 树
   ↓
7. 进入 commit 阶段 → 更新 DOM
```

所以可以理解更新的时候：先render → 生成ReactElement → 再构建Fiber。

## 3、Fiber中的指针算法
每个Fiber节点都有以下四个核心指针，构成一个非递归的树形结构：

| 指针 | 含义 |
| --- | --- |
| child | 第一个子节点 |
| sibling | 下一个兄弟节点 |
| return | 父节点（不是“返回值”，而是“返回路径”） |
| alternate | 另一棵树上的对应节点（双缓存） |


没有parent或children[]数组，这是为了避免递归调用和栈溢出。

**为什么不用递归？为什么要用指针？**

**传统递归方式：**

```javascript
function render(node) {
  doWork(node);
  node.children.forEach(render); // 压栈 → 不可中断
}
```

+ 整棵树必须一口气处理完。
+ 如果页面复杂，会阻塞主线程（导致卡顿）。

**而Fiber的设计目标：**

```javascript
可以暂停 → 做一点工作 → 放弃控制权给浏览器 → 再继续。
```

所以React改用循环 + 指针跳转的方式遍历树。

**举例说明：**

我们用最简单的方式模拟一个Fiber树结构，并写一个遍历函数，理解React是如何通过child、sibling和return指针进行非递归遍历的。

```javascript
// 模拟一个 Fiber 节点
function createFiber(tag, child = null, sibling = null, returnFiber = null) {
  return {
    tag,           // 节点名称（比如 'A', 'B'）
    child,         // 第一个子节点
    sibling,       // 下一个兄弟节点
    return: returnFiber,  // 父节点（关键字不能叫 parent，所以用 return）
  };
}
```

构造如下树形结构：

```text
树形结构：
        A
      / | \
     B  C  D
        |
        E
```

对应代码：

```javascript
// 模拟一个 Fiber 节点
function createFiber(tag, child = null, sibling = null, returnFiber = null) {
  return {
    tag, // 节点名称（比如 'A', 'B'）
    child, // 第一个子节点
    sibling, // 下一个兄弟节点
    return: returnFiber, // 父节点（关键字不能叫 parent，所以用 return）
  };
}

const E = createFiber('E');
const C = createFiber('C', E);
const B = createFiber('B');
const D = createFiber('D');
A = createFiber('A', B); // A.child = B
B.sibling = C; // B 的兄弟是 C
C.sibling = D; // C 的兄弟是 D
D.sibling = null; // D 是最后一个
// 设置 return 指针（父节点）
B.return = A;
C.return = A;
D.return = A;
E.return = C;
console.log(A);

function walk(fiber) {
  let current = fiber;
  while (current !== null) {
    console.log('下行 → 开始处理:', current.tag); // beginWork
    // 如果有孩子，先深入第一个孩子
    if (current.child) {
      current = current.child;
      continue;
    }
    // 到叶子了，开始回退并找兄弟
    while (current !== null) {
      console.log('上行 → 完成处理:', current.tag); // completeWork
      // 如果有兄弟，跳到兄弟
      if (current.sibling) {
        current = current.sibling;
        break; // 回到外层循环
      }
      // 没兄弟了，回到父节点
      current = current.return;
    }
  }
}
walk(A)
```

输出结果为：

```javascript
下行 → 开始处理: A
下行 → 开始处理: B
上行 → 完成处理: B
下行 → 开始处理: C
下行 → 开始处理: E
上行 → 完成处理: E
上行 → 完成处理: C
下行 → 开始处理: D
上行 → 完成处理: D
上行 → 完成处理: A
```

**注意：**

+ 子节点是以链表形式连接的（B → C → D），不是数组。
+ 每个节点都知道自己的“下一个兄弟”和“返回路径”。
+ 没有children[] 数组，也没有递归调用栈。

**这里如何实现暂停的？**

```javascript
if (时间用完了) {
  return current; // 保存当前进度
}
```

下面我们就模拟暂停的效果：

```javascript
function createFiber(tag, child = null, sibling = null, returnFiber = null) {
  return { tag, child, sibling, return: returnFiber };
}

const E = createFiber('E');
const C = createFiber('C', E);
const B = createFiber('B');
const D = createFiber('D');
const A = createFiber('A', B);
B.sibling = C;
C.sibling = D;
B.return = A;
C.return = A;
D.return = A;
E.return = C;
let nextUnitOfWork = A;

// 每个节点处理模拟5ms耗时
function simulateWork(timeMs) {
  const start = performance.now();
  while (performance.now() - start < timeMs) {
    // 空循环，阻塞主线程
  }
}
function performUnitOfWork(fiber) {
  console.log('下行 → 开始处理:', fiber.tag);
  simulateWork(5); // 每个节点处理 5ms
  if (fiber.child) {
    return fiber.child;
  }
  return completeWork(fiber);
}

function completeWork(fiber) {
  console.log('上行 → 完成处理:', fiber.tag);
  simulateWork(2); // 完成也花点时间
  if (fiber.sibling) {
    return fiber.sibling;
  }
  if (fiber.return) {
    return completeWork(fiber.return);
  }
  return null;
}

const DEADLINE_TIME = 10; // 允许最多运行10ms

function performWorkUntilDeadline() {
  const startTime = performance.now();
  while (
    nextUnitOfWork !== null &&
    performance.now() - startTime < DEADLINE_TIME
  ) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  if (nextUnitOfWork !== null) {
    console.log('⏸️ 时间片用完，暂停 1 秒...');
    setTimeout(() => {
      console.log('▶️ 恢复工作！');
      performWorkUntilDeadline();
    }, 1000);
  } else {
    console.log('✅ 全部完成！');
  }
}
// 开始
performWorkUntilDeadline();
```

输出的结果：

```javascript
下行 → 开始处理: A
下行 → 开始处理: B
上行 → 完成处理: B
⏸️ 时间片用完，暂停 1 秒...
▶️ 恢复工作！
下行 → 开始处理: C
下行 → 开始处理: E
上行 → 完成处理: E
上行 → 完成处理: C
⏸️ 时间片用完，暂停 1 秒...
下行 → 开始处理: D
▶️ 恢复工作！
上行 → 完成处理: D
上行 → 完成处理: A
✅ 全部完成！
```

**关键机制：**

| Fiber 树 = 链表树 | 用child/sibling/return<br/> 构建可遍历结构 |
| --- | --- |
| 工作单元（Unit of Work） | 每个Fiber节点是一个任务 |
| 时间切片（Time Slicing） | 每次只运行最多 10ms |
| 可中断渲染 | 超时就暂停，保存nextUnitOfWork |
| 恢复能力 | 通过setTimeout继续从断点开始 |
| 不依赖调用栈 | 所有控制流靠数据结构驱动 |


**类比React真实源码：**

| 本模拟代码 | React源码对应 |
| --- | --- |
| nextUnitOfWork | workInProgress |
| performUnitOfWork | beginWork() |
| completeWork | completeWork() |
| DEADLINE_TIME | frameDeadline（来自 Scheduler） |
| setTimeout | MessageChannel/Scheduler |
| simulateWork | render函数、DOM 创建等真实工作 |



