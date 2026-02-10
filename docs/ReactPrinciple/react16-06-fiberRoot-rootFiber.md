---
group:
  title: React16原理
order: 5
title: FiberRoot和RootFiber

nav:
  title: React原理
  order: 4
---


## 1、介绍
在React的源码中，FiberRoot和RootFiber是两个非常关键的概念，它们共同构成了React应用的根节点结构，支撑着整个Fiber架构的协调（reconciliation）过程。

### 1.1、FiberRoot介绍
FiberRoot是一个对象，代表整个React应用的“根容器”或“根宿主”。它不是组件，也不是DOM节点，而是React内部用来管理应用根状态的顶层对象。

**主要职责：**

:::color1
+ 存储整个应用的根信息。
+ 管理更新队列（如setState触发的更新）。
+ 指向当前正在渲染的Fiber树（current）和待提交的Fiber树（finishedWork）。
+ 存储副作用队列（用于commit阶段）。
+ 包含调度相关的信息（如优先级、过期时间等）。

:::

**关键属性：**

```javascript
FiberRoot {
  current: Fiber,            // 指向当前正在使用的 Fiber 树（即 HostRoot）
  containerInfo: any,        // 宿主容器，比如 document.getElementById('root')
  pendingChildren: any,      // 待处理的子树（旧版本用得较多）
  finishedWork: Fiber,       // 协调完成后准备提交的 Fiber 树
  pendingCommitExpirationTime: ExpirationTime,
  currentEventTime: number,
  pendingLanes: Lanes,       // 当前待处理的更新优先级
  finishedLanes: Lanes,      // 已完成的 lanes
  callbackNode: any,
  callbackPriority: number,
  // ...其他调度与副作用相关字段
}
```

FiberRoot是通过createContainer创建的，比如在ReactDOM.createRoot(rootNode)时生成。

### 1.2、RootFiber（HostRoot）
RootFiber是一个特殊的Fiber节点，类型为HostRoot，它是Fiber树的根节点。每个React应用都有至少一个这样的根Fiber节点。

特点：

:::color1
+ 类型是HostRoot（定义在ReactWorkTags.js中）。
+ 是Fiber树的起点，其stateNode指向对应的FiberRoot。
+ 它本身不对应任何具体的React组件，而是作为挂载点存在。
+ 它的return（父节点）为null，是整棵树的顶端。

:::

**关键属性：**

```javascript
RootFiber (Fiber) {
  tag: HostRoot,
  stateNode: FiberRoot,      // 指回 FiberRoot 实例
  type: null,
  key: null,
  elementType: null,
  return: null,              // 没有父节点
  child: Fiber,              // 子树的入口，通常是你的 <App /> 组件
  memoizedState: {           // 存储根级别的状态，比如 context、baseState 等
    element: <App />,
    context: ...
  }
}
```

RootFiber是Fiber节点的一种，而FiberRoot是一个独立的对象，两者通过stateNode和current字段相互引用。

```javascript
+------------------+        +------------------+
|   FiberRoot      |        |   RootFiber      |
|                  |        | (tag: HostRoot)  |
| current ────────────────→ | stateNode ───────┼──┐
|                  |        |                  |  │
| containerInfo    |        | child ──→ <App />│  │
| finishedWork     |        |                  |  │
| pendingLanes     |        +------------------+  │
|                  |                              │
|                  | ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←┘
+------------------+

```

这种设计使得：

+ 调度器可以通过FiberRoot找到当前的Fiber树进行更新。
+ 在协调过程中，从RootFiber出发遍历整棵组件树。
+ 提交阶段可以拿到FiberRoot获取宿主容器（如DOM节点）来执行插入/更新。

当调用如下代码：

```javascript
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

React内部会：

:::color1
1. 创建一个FiberRoot对象（通过 createFiberRoot）。
2. 创建一个HostRoot类型的Fiber节点作为RootFiber。
3. 建立双向连接：
    1. FiberRoot.current = RootFiber。
    2. RootFiber.stateNode = FiberRoot。
4. 将 `<App />` 作为RootFiber的子节点开始构建Fiber树。

:::

常见误区：

| 误解 | 正确理解 |
| --- | --- |
| FiberRoot是根组件 | ❌ 它是内部管理对象，不是组件 |
| RootFiber是DOM节点 | ❌ 它是内存中的Fiber节点 |
| 只有一个FiberRoot | ✅ 每个createRoot调用都会创建一个独立的FiberRoot |


## 2、举例介绍
```javascript
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
```

如上代码中，React内部会创建两个核心对象：

:::color1
+ fiberRoot：代表整个应用的“根容器”。
+ rootFiber：代表Fiber树的根节点（即HostRoot节点）。

:::

**①、模拟FiberRoot对象：**

```javascript
const fiberRoot = {
  // 指向当前正在使用的 Fiber 树（双缓存机制中的 current 树）
  current: null, // 稍后指向 rootFiber

  // 宿主容器，比如 DOM 的 #root 元素
  containerInfo: document.getElementById('root'),

  // 协调完成后准备提交到页面的 Fiber 树（workInProgress 树完成后的结果）
  finishedWork: null,

  // 当前待处理的更新优先级（简化为数字表示优先级）
  pendingLanes: 1,

  // 已完成的 lanes
  finishedLanes: 0,

  // 回调相关（如 useTransition、startTransition）
  callbackNode: null,
  callbackPriority: 0,

  // 是否有未完成的提交任务
  hasPendingPing: false,

  // 其他调度和上下文信息...
};
```

fiberRoot.current初始为null，接下来我们会让它指向rootFiber。

**②、模拟RootFiber对象：**

```javascript
const rootFiber = {
  // Fiber 节点类型：5 表示 HostRoot（React 中定义的常量）
  tag: 3, // 3 = HostRoot (实际源码中是常量)

  // 指向外部管理对象 fiberRoot
  stateNode: fiberRoot,

  // 根节点没有 type 和 key
  type: null,
  key: null,
  elementType: null,

  // 指向父节点（这里是 null，因为它是树顶）
  return: null,

  // 子节点是我们写的 <App /> 组件对应的 Fiber
  child: null, // 稰后指向 AppFiber

  // 指向兄弟节点（无）
  sibling: null,

  // memoizedState 存储根级别的状态，比如当前渲染的元素
  memoizedState: {
    element: { $$typeof: 'REACT_ELEMENT_TYPE', type: 'App', props: {} },
    isDehydrated: false,
    cachePool: null,
  },

  // 更新队列（比如 setState 触发的更新）
  updateQueue: null,

  // 副作用相关字段（commit 阶段使用）
  flags: 0,
  subtreeFlags: 0,
  deletions: null,

  // 指向 alternate 树（用于双缓存）
  alternate: null,

  // 其他字段...
};
```

这个rootFiber就是整棵React组件树的起点。它的child最终会连接到 `<App />` 组件。

现在我们把fiberRoot和rootFiber关联起来：

```javascript
// fiberRoot.current 指向当前的 rootFiber
fiberRoot.current = rootFiber;

// rootFiber.stateNode 指回 fiberRoot（已经写在上面了）
// rootFiber.stateNode = fiberRoot; ← 已设置
```

**③、此时形成了经典的双向指针结构：**

```javascript
fiberRoot.current.stateNode === fiberRoot;           // true
rootFiber.stateNode.current === rootFiber;           // true
```

这就是React实现“从任何节点都能找到全局上下文”的关键设计！

**④、构建子树：连接`<App />`**

假设`<App />`是一个函数组件，React会为它创建一个Fiber节点：

```javascript
const appFiber = {
  tag: 0, // FunctionComponent
  type: 'App',
  key: null,
  elementType: 'App',
  stateNode: null, // 函数组件没有实例
  return: rootFiber, // 父节点是 rootFiber
  child: null,       // 可能有 children，比如 <div>...</div>
  sibling: null,
  memoizedState: null,
  memoizedProps: {},
  flags: 0,
};

// 设置 rootFiber 的 child
rootFiber.child = appFiber;
```

最终结构如下：

```javascript
fiberRoot
   │
   ↓ current
rootFiber (HostRoot)
   │
   ↓ child
appFiber (<App />)
   │
   ↓ child
DOM Elements (<div>, <h1>, etc.)
```

**渲染流程中的角色分工：**

| 阶段 | fiberRoot的作用 | rootFiber的作用 |
| --- | --- | --- |
| 初始化 | 创建容器、管理宿主环境 | 作为Fiber树的根节点开始遍历 |
| 协调（Render） | 提供pendingLanes、调度优先级 | 作为workLoop的入口，触发beginWork |
| 提交（Commit） | 提供containerInfo执行DOM插入 | 提供副作用链表，执行layout effect等 |
| 更新 | 接收新的update，重新调度 | 作为双缓存树的起点重建子树 |


**总结为：**

```javascript
+-----------------------------+
|        FiberRoot            |
|                             |
|  current ───────────────┐   |
|  containerInfo ──→ #root │  |
|  pendingLanes: 1         │  |
|  finishedWork: null      │  |
+--------------------------+  |
                             ↓
+--------------------------------------------------+
|                 RootFiber (HostRoot)             |
|                                                  |
|  stateNode ──────────────────────────────────────┘
|  return: null                                    |
|  child ──→ appFiber                              |
|  memoizedState.element = <App />                 |
|                                                  |
+--------------------------------------------------+
                             ↓
                       appFiber (FunctionComponent)
                             ↓
                      divFiber, h1Fiber, ...
```

## 3、为什么要设计FiberRoot和RootFiber
FiberRoot和RootFiber的设计并不是偶然的，而是React团队在重构引擎（从Stack Reconciler到Fiber Reconciler）时，为了解决 性能、可中断渲染、并发更新、优先级调度 等一系列复杂问题而精心设计的架构成果。

| 名称 | 类型 | 角色 |
| --- | --- | --- |
| FiberRoot | 宿主容器对象 | 整个应用的“操作系统”——管理调度、更新队列、副作用、宿主环境等 |
| RootFiber | Fiber节点 | UI 树的根节点（HostRoot），是协调过程的起点 |


它们之间通过双向指针连接：

```javascript
fiberRoot.current = rootFiber;
rootFiber.stateNode = fiberRoot;
```

这种“外部管理器 + 内部树节点”的分离设计，是React Fiber架构的关键创新之一。为什么要这样设计？

**①、支持「可中断的渲染」**

旧版React使用栈式递归（Stack Reconciler），一旦开始渲染就必须一口气完成。如果组件树很大，会阻塞主线程，导致页面卡顿。引入Fiber架构 —— 把渲染拆成一个个小任务，浏览器有空就做一点，没空就暂停。

**设计体现：**

+ FiberRoot存储全局状态（如当前优先级、是否被挂起）。
+ workInProgress树可以在中途暂停，恢复时从FiberRoot拿回上下文继续。

**②、实现「双缓存机制」**

不能一边渲染新UI，一边修改老UI——会导致视觉闪烁或错误状态。

解法：维护两棵Fiber树：

:::color1
+ current：正在显示的树。
+ workInProgress：正在构建的新树。

:::

只有当新树完全准备好后，才原子性地切换：

```javascript
fiberRoot.current = finishedWork; // 交换指针
```

设计体现：

+ FiberRoot.current指向当前展示的RootFiber。
+ 每次更新创建一个新的workInProgress 树。
+ 构建完成后赋值给fiberRoot.finishedWork，准备提交。

**③、统一调度中心：支持「并发模式」和「优先级」**

用户点击按钮要立即响应，但数据加载可以慢一点。React需要能区分紧急vs非紧急更新。

解法：引入Lane模型（优先级车道）、时间切片（Time Slicing）、可中断更新。

设计体现：

+ FiberRoot.pendingLanes记录所有待处理的更新优先级。
+ 调度器根据FiberRoot的lanes决定是否启动新一轮渲染。
+ 高优先级更新可以打断低优先级渲染。

```javascript
// 紧急更新（输入框）
dispatchAction(Update, lane: SyncLane)

// 非紧急更新（动画）
startTransition(() => setData(...)) // lane: TransitionLane
```

所有这些信息都集中存储在FiberRoot中，它是整个应用的“交通指挥中心”。

**④、解耦「宿主环境」与「UI 结构」**

React不仅用于DOM，还用于Native、Canvas、WebGL等。如何让核心逻辑不依赖具体平台？

分层设计：

:::color1
+ FiberRoot 负责与宿主通信（如获取container、插入DOM）。
+ RootFiber 只关心协调逻辑，不直接操作DOM。

:::

设计体现：

```javascript
const root = ReactDOM.createRoot(domContainer);
//              ↑
// 这里传入宿主环境，由 FiberRoot 保存
```

+ fiberRoot.containerInfo = domContainer。
+ 在commit阶段，React通过fiberRoot.containerInfo拿到容器并插入子树。

好处：同样的Fiber协调逻辑，可以用在React Native（`<View>`）、React Three Fiber（3D场景）等不同平台上。

**⑤、提供稳定的「全局上下文」访问路径**

任何一个Fiber节点都要能快速找到：

+ 当前应用的调度器？
+ 是否有更高优先级的更新要打断我？
+ 如何发起一次新的更新？

每个Fiber节点都有.return指针向上找父节点，最终一定会到达RootFiber → .stateNode指向FiberRoot。

```javascript
function someFiberFunction(fiber) {
  // 从任意节点出发，都能找到 FiberRoot
  let node = fiber;
  while (node.return !== null) {
    node = node.return;
  }
  const root = node.stateNode; // ← FiberRoot
  return root;
}
```

这让React的很多机制（如context、updateQueue、suspense）都能高效运作。

## 4、问题解答
### 4.1、多个FiberRoot如何共存？
在React应用中，可以同时存在多个FiberRoot —— 这正是React支持“多根渲染”、“微前端集成”、“独立组件沙箱”等场景的基础。

每个通过ReactDOM.createRoot(...)创建的根实例，都会对应一个独立的FiberRoot对象。

```javascript
// 根1：主应用
const container1 = document.getElementById('app');
const root1 = ReactDOM.createRoot(container1);
root1.render(<App />);

// 根2：侧边栏小工具
const container2 = document.getElementById('sidebar');
const root2 = ReactDOM.createRoot(container2);
root2.render(<ChatWidget />);

// 根3：弹窗或仪表盘
const container3 = document.getElementById('dashboard');
const root3 = ReactDOM.createRoot(container3);
root3.render(<Dashboard />);
```

此时页面上有3个FiberRoot实例，彼此独立运行。每个FiberRoot管理自己的Fiber树、更新队列、调度任务。

**它们是如何做到“共存”的？**

**①、每个宿主容器独立管理**

+ FiberRoot.containerInfo指向各自的DOM节点（如 #app, #sidebar）。
+ 渲染和提交阶段只操作自己范围内的DOM。
+ 不会干扰其他根的UI。

**②、各自拥有独立的更新队列和优先级系统**

每个FiberRoot都有：

+ pendingLanes：自己的更新优先级。
+ eventTimes：记录事件时间。
+ callbackNode：独立的调度回调。

这意味着：主应用正在做高优更新？不影响侧边栏的低优先级动画。一个根被Suspense暂停，其他根照常响应用户输入。

**③、共享同一个Scheduler（调度器），但任务隔离**

虽然所有FiberRoot都使用同一个全局Scheduler（来自scheduler npm包），但每次调度回调绑定的是特定的 root，调度器根据优先级动态选择下一个执行哪个根的任务。

```javascript
// 每个 root 的回调是独立的
scheduleCallback(NormalPriority, () => {
  performConcurrentWorkOnRoot(root1); // 只处理 root1
});

scheduleCallback(LowPriority, () => {
  performConcurrentWorkOnRoot(root2); // 只处理 root2
});
```

调度器就像一个“多线程操作系统”，可以公平地切换不同应用的任务。

源码级机制说明：

scheduleCallback是全局函数：

```javascript
import { scheduleCallback, NormalPriority } from 'scheduler';

// 不管来自哪个 FiberRoot，都调用同一个函数
const callbackNode = scheduleCallback(NormalPriority, performWork);
```

Scheduler维护一个优先级队列：

```javascript
const taskQueue = [];

function scheduleCallback(priorityLevel, callback) {
  const newTask = {
    id: taskId++,
    callback,
    priorityLevel,
    startTime: now(),
    expirationTime: computeExpirationTime(priorityLevel),
  };

  push(taskQueue, newTask); // 插入堆结构，按优先级排序

  // 启动工作循环
  requestHostCallback(flushWork);
}
```

所有根的任务都在这个队列里排队。

### 4.2、createPortal是如何打破树结构但仍受FiberRoot管理的？
createPortal看似“打破了React组件树的结构”——把子节点渲染到DOM的任意位置，但它仍然完全受FiberRoot管理，这是React架构设计精妙之处。

```javascript
ReactDOM.createPortal(
  <ModalContent />,           // 要渲染的内容
  document.getElementById('modal-root')  // 真实 DOM 插入点（可以是 body 下）
)
```

表面现象，`<ModalContent />`在DOM树中出现在#modal-root中（远离主组件树），视觉上像是“脱离了父组件”，实际它在Fiber树中仍属于原组件层级，只是“渲染目标”不同。Portal改变的是DOM渲染位置，不改变Fiber树结构。

比如：

**原始JSX结构：**

```javascript
<App>
  <Layout>
    <Sidebar />
    <Main>
      <Button onClick={open}>打开弹窗</Button>
      {show && createPortal(
        <Dialog>你好</Dialog>,
        modalContainer  // 如: document.body
      )}
    </Main>
  </Layout>
</App>
```

对应的Fiber树（内存中）：

```javascript
App
 └── Layout
      ├── Sidebar
      └── Main
           └── Button
           └── HostPortal
                └── Dialog
                     └── Text("你好")
```

**实际生成的DOM树：**

```javascript
<body>
  <div id="root">           <!-- App 的宿主 -->
    <div><Sidebar /></div>
    <main>
      <button>打开弹窗</button>
    </main>
  </div>

  <div id="modal-container"> <!-- Portal 渲染到这里 -->
    <div>你好</div>           <!-- Dialog 的真实 DOM -->
  </div>
</body>

```

因此在Fiber树下Dialog是Main的孩子，而DOM 树Dialog在body下，远离#root。其原理是当调用createPortal时，React创建一个特殊的Fiber节点：

```javascript
const portalFiber = {
  tag: HostPortal,                    // 类型标记
  stateNode: modalContainer,          // 宿主容器（如 document.body）
  type: null,
  pendingProps: {
    children: <Dialog>你好</Dialog>,
    containerInfo: modalContainer,
    implementation: null,
  },
  return: mainFiber,                  // 父亲仍是 Main 组件
  child: dialogFiber,
};
```

这个HostPortal节点保留在Fiber树中，作为桥梁。在commit阶段，React会根据Fiber类型决定如何插入DOM。当遇到HostPortal节点时：

```javascript
function commitPlacement(finishedWork) {
  if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
    const parent = getHostParent(finishedWork); // 获取宿主父元素
    insertOrAppend(finishedWork, parent);
  }
}
```

而getHostParent的逻辑很聪明：

```javascript
function getHostParent(fiber) {
  let parent = fiber.return;
  while (parent !== null) {
    if (parent.tag === HostComponent) {
      return parent.stateNode; // 普通DOM节点
    } else if (parent.tag === HostRoot) {
      return parent.stateNode.containerInfo; // 根容器
    } else if (parent.tag === HostPortal) {
      return parent.stateNode; // ← 关键！遇到Portal就跳转到它的容器
    }
    parent = parent.return;
  }
}
```

因此createPortal中的更新机制，context传递，事件冒泡，错误边界等都是沿着Fiber树向下的。而不是沿着展示出来的真实的DOM。
