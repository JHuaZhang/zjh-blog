---
group:
  title: React16原理
order: 7
title: Fiber的双缓存技术

nav:
  title: React原理
  order: 4
---

## 1、介绍
Fiber是React 16引入的一个全新的协调（reconciliation）引擎，用于实现更高效、可中断的渲染机制。其中，“双缓存技术”（Double Buffering）是Fiber架构中一个核心的设计思想，它帮助React实现了“增量渲染”和“无阻塞更新”。

在计算机图形学中，“双缓存”通常指使用两个缓冲区（前台缓冲和后台缓冲）来避免画面撕裂：一个用于显示（前台），另一个用于绘制下一帧（后台），绘制完成后交换两者。在React Fiber中，双缓存技术指的是维护两棵Fiber树：

:::color1
+ Current Tree（当前树）：代表当前屏幕上渲染的UI对应的Fiber树。
+ WorkInProgress Tree（进行中的树）：正在构建或更新的新版本Fiber树，尚未提交到DOM。

:::

这两棵树通过alternate字段相互引用，形成“双缓存”的结构。

**双缓存的核心原理：**

每个Fiber节点都有一个alternate属性，指向另一个树中对应的Fiber节点。例如：

```javascript
currentFiber.alternate === workInProgressFiber;
workInProgressFiber.alternate === currentFiber;
```

**当React开始一次更新时：**

:::color1
1. 基于Current Tree创建一棵新的WorkInProgress Tree。
2. 所有的更新、计算、副作用都发生在WorkInProgress Tree上。
3. 当这棵新树构建完成且准备就绪后，React会将ReactDOM的根节点指向这棵新树。
4. 此时，新树变成Current Tree，而旧的Current Tree可以被回收或作为下一次更新的起点。

:::

这个过程就像是“翻转缓冲区” —— 一旦新帧（新UI）准备好了，就一次性切换。

**双缓存的作用与优势：**

:::color1
1. 支持可中断的渲染：由于更新是在WorkInProgress树上进行的，React可以随时暂停、恢复或丢弃这个过程，而不会影响当前用户看到的界面（Current Tree保持稳定）。
2. 保证UI一致性：只有当整个新树构建完成并验证无误后，才会通过一次“提交”（commit）操作切换到新树。这避免了用户看到不完整或中间状态的UI。
3. 提升性能与用户体验：结合优先级调度（如useTransition、startTransition），React可以优先处理高优先级更新，低优先级的WorkInProgress树可以被中断甚至放弃，从而实现流畅的交互。
4. 便于错误恢复：如果在构建WorkInProgress树的过程中发生错误，React可以回退到稳定的 Current Tree，保证应用不至于崩溃。

:::

**双缓存的工作流程示例：**

假设我们有一个简单的组件更新过程：

1. 用户触发setState。
2. React创建一个基于当前Fiber树的副本，作为WorkInProgress树。
3. 在WorkInProgress树上执行render阶段（调用函数组件、diff子节点等）。
4. 如果过程中浏览器需要处理高优先级任务（如点击响应），React暂停构建。
5. 等待空闲时继续构建，直到整棵树完成。
6. 进入commit阶段，将WorkInProgress树提交为新的Current Tree，更新真实DOM。
7. 完成后，原来的Current Tree成为下一次更新的备选基础。

## 2、alternate属性介绍
刚开始熟悉双缓存的时候，在页面的初始化的输出中看到hostRootFiber上的alternate中有内容，而其他的fiber节点的alternate属性都为null，就直接以为alternate属性只有在hostRootFiber中才存在，而其他的节点中都为null的错误观点。

实际上alternate字段并不仅限于HostRootFiber，而是几乎每一个Fiber节点都有alternate属性。每个Fiber节点通过alternate指针连接到它在另一棵树中的“镜像节点”：

```javascript
currentFiber.alternate === workInProgressFiber;
workInProgressFiber.alternate === currentFiber;
```

这就像两个人轮流写同一份文档：一个人读旧版（current），另一个人写新版（workInProgress），写完后交换角色。

假设我们有一个简单组件树：

```javascript
<App>
  <Button />
</App>
```

首次渲染完成后，结构如下：

```javascript
Current Tree (展示中)
     ↓
   AppFiber ── alternate → null
     ↓
 ButtonFiber ── alternate → null
```

当发生更新（如 setState）时，React创建workInProgress树：

```javascript
Current Tree             WorkInProgress Tree
(App 正在显示)            (正在构建的新版本)

   AppFiber                AppFiber (new)
     │                       ↑
     └── alternate ──────────┘
     ↓
 ButtonFiber           ButtonFiber (new)
     │                   ↑
     └── alternate ──────┘
```

此时：

```javascript
appFiber.current.alternate === appFiber.workInProgress;
appFiber.workInProgress.alternate === appFiber.current;
```

所有节点都有alternate，不只是HostRoot才出现。

```javascript
const fiber = {
  tag: FunctionComponent,
  type: App,
  stateNode: null,
  return: null,
  child: null,
  sibling: null,
  memoizedState: null,
  memoizedProps: null,
  pendingProps: {},
  dependencies: null,
  mode: 0,
  flags: 0,
  subtreeFlags: 0,
  deletions: null,
  alternate: null, // ← 初始为 null
};
```

直到第一次更新开始，React才会调用createWorkInProgress(fiber) 建立alternate关系。

## 3、双缓存替换全流程
核心目标：在不阻塞主线程的前提下，安全、高效地将新UI替换旧UI。

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);
```

用户点击按钮 → 触发setCount(c => c + 1)，我们将追踪这个动作如何引发整个双缓存树的构建与替换。

### 3.1、触发更新dispatchSetState
**①、用户点击按钮**

```javascript
onClick={() => setCount(...)}
```

**②、调用dispatchSetState(fiber, queue, action)**

这是由useState创建的闭包函数，保存了：

:::color1
+ fiber：当前组件对应的 Fiber 节点（CounterFiber）。
+ queue：该Hook的updateQueue。
+ action：(c) => c + 1。

:::

**③、创建Update对象**

```javascript
const update = {
  lane: getCurrentUpdateLane(),     // 如 DefaultLane (16)
  action: (c) => c + 1,
  hasEagerState: false,
  eagerState: null,
  next: null
};
```

**④、将update加入queue**

```javascript
const pending = queue.pending;
if (pending === null) {
  update.next = update;
} else {
  update.next = pending.next;
  pending.next = update;
}
queue.pending = update;
```

形成环状链表，便于后续遍历。

### 3.2、向上冒泡，定位根节点
**①、调用markUpdateLaneFromFiberToRoot(fiber, lane)**

从CounterFiber开始，沿着.return向上遍历，直到找到HostRootFiber。

```javascript
let node = fiber;
while (node.return !== null) {
  node = node.return;
}
// node 现在是 HostRootFiber
```

**②、获取FiberRoot**

```javascript
const root = node.stateNode; // HostRootFiber.stateNode → FiberRoot
```

**③、标记优先级**

```javascript
root.pendingLanes |= lane; // 例如：DefaultLane = 16
```

此时全局调度器知道：“有一个默认优先级的更新需要处理”。

### 3.3、请求调度
**①、调用ensureRootIsScheduled(root, now())**

检查是否有正在运行的任务：

```javascript
if (existingCallbackPriority === newPriority) {
  // 已有同优先级任务 → 不重复调度
} else {
  // 取消旧任务，启动新任务
  cancelCallback(root.callbackNode);
}
```

**②、向Scheduler提交任务**

```javascript
const newCallbackNode = scheduleCallback(
  priorityLevel, 
  performConcurrentWorkOnRoot.bind(null, root)
);
```

**③、保存回调引用**

```javascript
root.callbackNode = newCallbackNode;
root.callbackPriority = priorityLevel;
```

调度器会在浏览器空闲时执行performConcurrentWorkOnRoot。

### 3.4、准备workInProgress树（双缓存初始化）
当performConcurrentWorkOnRoot执行时：

**①、设置全局变量**

```javascript
workInProgressRoot = root;
workInProgressRootRenderLanes = lanes;
```

**②、创建或复用workInProgress树**

```javascript
const workInProgressRootFiber = createWorkInProgress(root.current, null);
```

createWorkInProgress(current, pendingProps) 做了什么？

```javascript
function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;

  if (workInProgress === null) {
    // 第一次更新：没有 alternate，需新建
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode
    );
    workInProgress.elementType = current.elementType;
    workInProgress.stateNode = current.stateNode;

    // 建立双向连接
    workInProgress.alternate = current;
    current.alternate = workInProgress;

    workInProgress.flags |= Placement; // 标记为插入
  } else {
    // 复用已有的 alternate
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;
  }

  workInProgress.child = current.child; // 初始复用子树结构

  return workInProgress;
}

```

此时HostRootFiber.current.alternate指向新的workInProgress树根，整个树的“草稿版本”已建立。

**③、初始化工作单元**

```javascript
workInProgress = workInProgressRootFiber;
```

### 3.5、协调阶段(构建workInProgress树)
**①、workLoop()开始**

```javascript
function workLoop() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}
```

**②、performUnitOfWork(unitOfWork)**

```javascript
const current = unitOfWork.alternate;
const next = beginWork(current, unitOfWork, renderLanes);
```

+ 如果 next !== null：继续向下（如还有子节点）。
+ 如果 next === null：进入completeUnitOfWork。

**③、beginWork(current, workInProgress, ...)**

根据tag分发处理：

```javascript
switch (workInProgress.tag) {
  case HostRoot:
    return updateHostRoot(current, workInProgress, lanes);
  case FunctionComponent:
    return updateFunctionComponent(current, workInProgress, Component, nextProps);
  case HostComponent:
    return updateHostComponent(current, workInProgress, type, newProps);
}
```

子步骤：updateFunctionComponent

```javascript
function updateFunctionComponent(current, workInProgress, Component, nextProps) {
  // 执行组件函数
  const nextChildren = Component(nextProps);

  // 调和子节点
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);

  return workInProgress.child;
}
```

只有当前组件真正需要更新时才会执行Component()，否则会bailout。什么是 “Bailout”（跳过更新），当React处理一个组件时，它会先检查：

```javascript
current.memoizedProps === newProps &&
!hasRemainingLanes(current.lanes) &&
// 其他条件...
```

如果满足，就直接复用当前的子树，不再向下遍历。这叫Bailout on Props或Render Phase Bailout。

子步骤：reconcileChildren → createWorkInProgress for children

对每个子节点调用createWorkInProgress(childCurrent, newProps)，递归建立workInProgress子树。直到叶子节点（如文本节点）。

**④、遇到叶子节点，返回null → 进入completeWork**

```javascript
completeUnitOfWork(unitOfWork);
```

逐层向上回溯，执行副作用收集、DOM创建等。

**⑤、整棵树构建完成**

```javascript
workInProgress = null;
```

设置：

```javascript
root.finishedWork = workInProgressRootFiber;
```

此时内存中有两棵树：

+ current：旧树（仍在显示）。
+ workInProgress：新树（已构建完成，待提交）。

### 3.6、提交阶段
**①、调用commitRoot(root)**

这是一个同步不可中断的过程。

三个子阶段：

1. Before Mutation：触发getSnapshotBeforeUpdate，准备DOM结构变更。

```javascript
commitBeforeMutationEffects(root, finishedWork);
```

2. Mutation：执行真实DOM操作：Placement → 插入节点，Deletion → 删除节点，Update → 修改属性

```javascript
commitMutationEffects(root, RenderPhase);
```

遍历finishedWork树，根据flags执行DOM操作。此时用户看到界面已更新。

3. Layout：调用useLayoutEffect，调用componentDidMount/Update，调度useEffect。

```javascript
commitLayoutEffects(root, root.context);
```

### 3.7、双缓存正式替换
交换current和workInProgress：

```javascript
// 完成后清理
root.current = finishedWork;           // 新树成为 current
root.finishedWork = null;             // 清空待提交树
root.callbackNode = null;             // 清空调度任务
root.callbackPriority = NoLane;       // 重置优先级
```

关键操作：

```javascript
root.current = finishedWork;
```

这行代码完成了双缓存树的角色切换：

## 4、常见问题总结
### 4.1、切换的过程中是只切换变化的Fiber吗？
在Commit阶段结束时，React会将整棵workInProgress树原子性地替换为新的current树。不是“只替换变化的节点”，而是整个Fiber树的根指针切换。

每个Fiber节点都有一个alternate属性：

```javascript
// current 树中的节点
const currentFiber = {
  stateNode: divElement,
  memoizedProps: { className: 'old' },
  alternate: workInProgressFiber, // 👈 指向 workInProgress 树中对应节点
  ...
};

// workInProgress 树中的节点
const workInProgressFiber = {
  stateNode: divElement, // 复用同一个 DOM 节点
  memoizedProps: { className: 'new' },
  alternate: currentFiber, // 👈 指向 current 树中对应节点
  ...
};
```

currentFiber.alternate.alternate === currentFiber（互相指向）

当Commit阶段完成所有DOM操作后，React执行：

```javascript
// fiberRoot是整个应用的根容器，注意这里指的是HostRootFiber，而不是FiberRoot
fiberRoot.current = fiberRoot.current.alternate;
```

:::color1
这个操作意味着：这是“整棵树”的切换，不是逐节点替换。

:::

**❌****误解 1：“只有变化的节点会被替换”**

+ 错误！Fiber树是整体切换的。
+ 但未变化的子树可以通过bailout跳过协调，直接复用整个子树的Fiber节点。

**❌**** 误解 2：“alternate 是子树指针”**

+ 错误！alternate是同位置节点的指针，不是子树。
+ 它用于在Render阶段访问上一次的状态（如current.memoizedState）。

:::color1
正确认知：树切换是原子的（整棵树），节点复用是细粒度的（通过alternate + bailout）。

:::

### 4.2、子Fiber节点alternate的核心作用
既然是整个树切换，节点上的alternate是不是就没用了？

实际上每个子Fiber节点的alternate属性，是双缓冲机制得以在细粒度上工作的关键。fiber.alternate指向另一棵树中“相同位置”的Fiber节点，使得Render阶段能访问上一次渲染的状态（如props、state、hooks），用于 diff、复用和bailout。其主要作用有如下内容：

#### 4.2.1、访问上一次的状态（用于对比）
在Render阶段，workInProgress节点需要知道：

:::color1
+ 上次的props是什么？→ 决定是否更新DOM。
+ 上次的state是什么？→ 类组件复用状态。
+ 上次的hooks链表是什么？→ 函数组件复用hooks。

:::

这些信息都存储在current = workInProgress.alternate中。

```javascript
// 在 beginWork 中
const current = workInProgress.alternate;
if (current !== null) {
  const oldProps = current.memoizedProps;
  const newProps = workInProgress.pendingProps;
  if (oldProps === newProps) {
    // 可能 bailout
  }
}
```

#### 4.2.2、实现双缓冲的节点级复用
每次更新，两棵树的角色互换，alternate让节点能在两棵树之间“轮换使用”，避免频繁创建/销毁对象。当React处理一个Fiber节点（如函数组件、类组件、HostComponent）时，会调用：

```javascript
reconcileChildren(current, workInProgress, nextChildren, renderLanes);
```

这个函数决定是否复用current.child，如何创建/更新子Fiber节点，而reconcileChildren内部会根据是否是首次渲染，调用mountChildFibers（首次渲染）和reconcileChildFibers（更新渲染），reconcileChildFibers才是判断“能否复用”的核心函数。

```javascript
function reconcileChildFibers(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any,
  lanes: Lanes
): Fiber | null {
  // ... 类型判断
  const isObject = typeof newChild === 'object' && newChild !== null;

  if (isObject) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        return placeSingleChild(
          reconcileSingleElement(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes
          )
        );
      case REACT_FRAGMENT_TYPE:
        return reconcileChildFibers(...); // 递归处理
    }
  } else if (typeof newChild === 'string' || typeof newChild === 'number') {
    return reconcileSingleTextNode(...);
  } else if (isArray(newChild)) {
    return reconcileChildrenArray(...);
  }
}
```

单节点协调：reconcileSingleElement，这是最常见的情况（如 `<div>`, `<MyComp />`）：

```javascript
function reconcileSingleElement(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  element: ReactElement,
  lanes: Lanes
): Fiber {
  const key = element.key;
  let child = currentFirstChild;

  // 🔍 关键：遍历 current 的子节点，寻找可复用的节点
  while (child !== null) {
    if (child.key === key) {
      // key 匹配！检查 type 是否相同
      if (child.elementType === element.type) {
        // ✅ type 和 key 都匹配 → 复用！
        deleteRemainingChildren(returnFiber, child.sibling);
        const existing = useFiber(child, element.props);
        existing.ref = coerceRef(returnFiber, child, element);
        existing.return = returnFiber;
        return existing;
      } else {
        // type 不同 → 不能复用，删除整个子树
        deleteRemainingChildren(returnFiber, child);
        break;
      }
    } else {
      // key 不匹配 → 标记删除
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }
  // 未找到可复用节点 → 创建新 Fiber
  const created = createFiberFromElement(element, returnFiber.mode, lanes);
  created.ref = coerceRef(returnFiber, currentFirstChild, element);
  created.return = returnFiber;
  return created;
}
```

复用条件：key相同且elementType相同，如果父组件只是上面的一些props属性发生变更，而子组件未发生任何变化，依旧会去复用子组件的，父组件的Fiber节点也会被复用（通过useFiber）。

```javascript
// 更新前
<Parent title="Old" />

// 更新后
<Parent title="New" />
```

父组件的协调（在父父组件中）：

```javascript
// 在 Parent 的父组件（如 App）的 reconcileChildren 中
reconcileSingleElement(
  appFiber,
  currentFirstChild: Parent_old,  // 旧 Parent Fiber
  newChild: <Parent title="New" />, // 新元素
  lanes
);
```

reconcileSingleElement比较；

```javascript
if (child.key === newChild.key) { // key 相同（都为 null）
  if (child.elementType === newChild.type) { // elementType 相同！
    // ✅ 复用节点！
    deleteRemainingChildren(returnFiber, child.sibling);
    const existing = useFiber(child, newChild.props); // 👈 关键！
    existing.ref = coerceRef(returnFiber, child, newChild);
    existing.return = returnFiber;
    return existing;
  }
}
```

useFiber(child, newProps) 是复用的核心！

```javascript
function useFiber(fiber: Fiber, pendingProps: any): Fiber {
  // 复用 alternate 节点（节点级复用）
  const clone = createWorkInProgress(fiber, pendingProps);
  clone.index = 0;
  clone.sibling = null;
  return clone;
}
```

结果就是workInProgress节点复用了current的alternate，workInProgress.pendingProps = { title: "New" }，其他字段（如child）被重置，等待重新协调。

#### 4.2.3、支持bailout（跳过子树更新）
如果props/context未变，直接复用current.child作为workInProgress.child，这依赖于current节点的存在（即workInProgress.alternate），有关bailout详细内容，可参考Render阶段汇总。


