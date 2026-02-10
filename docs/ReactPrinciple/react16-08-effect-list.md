---
group:
  title: React16原理
order: 8
title: Effect List副作用链表剖析

nav:
  title: React原理
  order: 4
---


## 1、介绍
“副作用链表”（Effect List）是React源码中的一个重要概念，尤其在Fiber架构和协调（Reconciliation）过程中起着关键作用。它并不是一个独立的数据结构，而是由Fiber节点通过effectList链接形成的链表，用于记录需要执行副作用（Side Effects）的组件。

在React的协调（reconciliation）过程中，并不是每个组件更新后都要立即提交到DOM。React会先构建一个新的Fiber树（workInProgress tree），然后对比旧树（current tree），找出需要变更的地方。这些“需要变更”的信息被记录在Fiber节点上，而所有包含副作用的Fiber节点会被串联成一个单向链表，这个链表就是Effect List。

**什么是副作用（Side Effect）？**

在React中，副作用是指那些不能在渲染阶段直接完成的操作，例如：

:::color1
+ DOM更新（插入、更新、删除）。
+ 调用useEffect或useLayoutEffect。
+ 触发生命周期方法（如 componentDidMount、componentDidUpdate）。
+ 销毁组件前的清理操作。
+ 需要重置context、ref等。

:::

这些操作不能在“渲染”阶段同步完成，而必须在“提交”（Commit）阶段统一处理。

React使用Fiber架构实现可中断的异步渲染。每个React元素对应一个Fiber节点，构成一棵Fiber树。在协调过程中，React会构建一棵新的Fiber树（workInProgress tree），并与旧树对比，找出变更。为了高效地执行副作用，React不遍历整棵树，而是通过副作用链表（effect list）只访问那些有副作用的节点。

**副作用链表的结构：**

每个Fiber节点包含以下与副作用链表相关的字段：

```javascript
// Fiber 节点结构（简化）
{
  // 组件类型（FunctionComponent = 0）
  tag: WorkTag,      
  // 存放 hooks 链表和 effect 链表
  updateQueue: any,       
  firstEffect: Fiber | null,
  lastEffect: Fiber | null,
  nextEffect: Fiber | null,
  // 位标志，表示该节点有哪些副作用（如 Placement, Update, Passive 等）
  effectTag: number, 
}
```

+ firstEffect：指向该子树中第一个需要执行副作用的节点。
+ lastEffect：指向最后一个。
+ nextEffect：连接所有有副作用的节点，形成链表。
+ <font style="color:rgb(0, 0, 0);">effectTag（v17+改为flags）</font>：表示当前节点有哪些副作用（如Placement、Update、Deletion等）。

:::color1
注意：effectList并不是显式命名的字段，而是开发者对firstEffect/lastEffect/nextEffect所构成链表的统称。

:::

**Effect Tag位标志（定义在ReactSideEffectTags.js）：**

```javascript
/ 表示无任何副作用，用作初始值或空操作
export const NoEffect = 0b0000000000000;
// 仅用于 Profiler 调试，表示该 Fiber 已执行工作，不触发实际 DOM 操作
export const PerformedWork = 0b0000000000001;
// 表示节点需要被插入到 DOM 中（新增）
export const Placement = 0b0000000000010;
// 表示节点需要更新（如 props 或文本内容变更）
export const Update = 0b0000000000100;
// Placement | Update，表示节点既要插入又要更新
export const PlacementAndUpdate = 0b0000000000110;
// 表示节点需要从 DOM 中删除（包括子树）
export const Deletion = 0b0000000001000;
// 表示需要重置元素的文本内容（如清空 innerText）
export const ContentReset = 0b0000000010000;
// 表示需要在 commit 阶段执行生命周期回调（如 componentDidMount / componentDidUpdate）
export const Callback = 0b0000000100000;
// 表示错误边界已捕获错误，用于错误处理流程
export const DidCapture = 0b0000001000000;
// 标记一个 Fiber 节点需要在 commit 阶段的 “layout 阶段之前” 执行快照（snapshot）相关的逻辑。
export const Snapshot = 0b0000100000000;
// 表示需要更新 ref（调用 ref 回调或赋值）
export const Ref = 0b0000010000000;
// 表示需在异步时机（如 requestIdleCallback）执行 useEffect 的副作用
export const Passive = 0b0001000000000;
// 表示正在服务端渲染（SSR）注水（hydration）过程中
export const Hydrating = 0b0010000000000;
// Hydrating | Update，表示注水时还需更新节点
export const HydratingAndUpdate = 0b0010000000100;
// 所有与生命周期/用户代码相关的副作用掩码（用于调度和清理）
export const LifecycleEffectMask = 0b0001110100100;
// 所有可能的宿主（DOM）副作用的并集，用于过滤非宿主副作用
export const HostEffectMask = 0b0011111111111;
// 表示 Fiber 树构建未完成（如被中断），用于 Suspense 或并发渲染
export const Incomplete = 0b0100000000000;
// 表示错误边界应捕获后代抛出的错误（触发错误处理流程）
export const ShouldCapture = 0b1000000000000;
```

useLayoutEffect不使用effectTag，而是通过hook自身的tag字段区分。

## 2、firstEffect介绍
### 2.1、firstEffect的作用
#### 2.1.1、构建副作用链表（Effect List）
在render阶段（也叫render/reconcile阶段），React会遍历Fiber树，为每个发生变更的节点打上“副作用标签”（如Update, Deletion, Placement等）。然后通过递归回溯的方式，将这些有副作用的节点连接成一个链表。

firstEffect就是这个链表的入口。整个Fiber树根节点（如HostRoot或Component）的firstEffect字段，保存了所有需要在commit阶段处理的副作用节点的头指针。

假设有3个组件发生了状态更新，它们的DOM需要更新。React在render阶段会把这些Fiber节点通过nextEffect连接起来，并将根节点的firstEffect指向第一个节点。

#### 2.1.2、提高commit阶段的遍历效率
在commit阶段，React不需要重新遍历整棵Fiber树来查找哪些节点需要更新，而是直接从根节点的firstEffect开始，沿着nextEffect链表逐个执行副作用。这大大提升了性能，避免了O(n)的全树扫描。

```javascript
// commit 阶段伪代码
function commitMutationEffects(root: FiberRoot) {
  let effect = root.current.firstEffect;
  while (effect !== null) {
    const { tag, flags } = effect;

    if (flags & Deletion) {
      commitDeletion(effect);
    } else if (flags & Update) {
      commitUpdate(effect);
    }

    effect = effect.nextEffect;
  }
}
```

### 2.2、firstEffect是如何构建的
#### 2.2.1、副作用标记
在render阶段，当某个组件的状态变化导致需要更新时，React会给对应的Fiber节点添加副作用标（flags）：

```javascript
export const Update = 0b000000000001;     // 需要更新
export const Deletion = 0b000000000010;    // 需要删除
export const Placement = 0b000000000100;   // 需要插入
```

#### 2.2.2、构建effect list
在完成一个Fiber节点的beginWork和completeWork后，React会调用completeWork的后续逻辑来收集副作用。关键函数：appendAllChildrenToEffectList或bubbleProperties（具体名称可能随版本变化）。

大致逻辑如下：

```javascript
function completeWork(workInProgress) {
  // ... 处理当前 Fiber（比如创建 DOM、打标记等）

  if (hasEffect(workInProgress)) {
    // 给当前节点打上 flags（effectTag）
    workInProgress.flags |= SomeEffect;

    if (returnFiber) {
      // 将当前节点添加到父节点的 effect list 中
      if (!returnFiber.firstEffect) {
        returnFiber.firstEffect = workInProgress;
      }
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = workInProgress;
      }
      returnFiber.lastEffect = workInProgress;
    }
  }

  // 把子 fiber 的 effect list 接到当前 fiber 的后面
  const childEffect = workInProgress.firstEffect;
  if (childEffect) {
    if (!workInProgress.firstEffect) {
      workInProgress.firstEffect = childEffect;
    }
    if (workInProgress.lastEffect) {
      workInProgress.lastEffect.nextEffect = childEffect;
    }
    workInProgress.lastEffect = childFiber.lastEffect;

    // 清除子 fiber 的 first/last，避免重复使用
    childFiber.firstEffect = childFiber.lastEffect = null;
  }

  // 如果当前节点也有副作用，把它追加到最后
  if (workInProgress.flags & PerformedWork) {
    if (workInProgress.lastEffect) {
      workInProgress.lastEffect.nextEffect = workInProgress;
    } else {
      workInProgress.firstEffect = workInProgress;
    }
    workInProgress.lastEffect = workInProgress;
  }
}
```

如果当前节点有副作用（flags !== NoFlags），就会被加入到父节点的effect list中。最终，根节点的firstEffect就汇总了整棵树中所有需要处理的副作用节点。

注意：nextEffect是双端队列中的指针，不是父/子/兄弟关系，而是专门用于遍历副作用的链表指针。

**链式结构示意图：**

```javascript
RootFiber.firstEffect ──→ FiberA ──→ FiberB ──→ FiberC ──→ null
                             ↓         ↓         ↓
                       .nextEffect .nextEffect .nextEffect

RootFiber.lastEffect ─────────────────────────────┘

```

也就是说：

:::color1
+ RootFiber.firstEffect指向第一个有副作用的节点。
+ 每个节点通过.nextEffect指向下一个。
+ RootFiber.lastEffect指向最后一个。
+ 整个effect list是一条单向链表。

:::

**关键点总结：**

+ 自底向上构建：从叶子节点开始，逐层合并effect list。
+ 先挂载子effect list，再判断自己是否有副作用，有的话追加到末尾。
+ 所有副作用节点最终都会被合并到 根Fiber（HostRoot）的firstEffect -> ... -> lastEffect链表中。

#### 2.2.3、多副作用合并
一个Fiber节点只能在effect list中出现一次，即使它有多种副作用（比如同时有DOM更新 + ref变更 + useEffect），它也只会作为一个节点出现在链表中，其effectTag是所有副作用的位掩码合并值。所以：

:::color1
+ ❌ 不会因为多个副作用就重复加入链表。
+ ✅ 多个副作用通过effectTag标记在一起。
+ 🔗 effect list仍然是一个单向链表，每个Fiber最多出现一次。

:::

在completeWork阶段，React会为当前Fiber添加各种flag：

```javascript
// react-reconciler/src/ReactFiberCompleteWork.js
if (flags & Update) {
  // 标记需要更新 props
}

if (current !== null && ref !== current.ref) {
  // 如果 ref 改变，添加 Ref 标志
  workInProgress.effectTag |= Ref;
}

// useLayoutEffect / useEffect 也会设置对应的 flag
if (firstEffectOfHook !== null) {
  workInProgress.effectTag |= Passive; // 或 LayoutMask
}

```

终这个Fiber的effectTag就是一个组合值，例如：

```javascript
fiber.effectTag = 4 /* Update */ | 64 /* Ref */ | 128 /* Passive */;
// 结果：196
```

然后在整个子树完成之后，把这个fiber加入父级的effect list（如果它有副作用）。

所以：

:::color1
+ 先把所有子节点的effect拼起来。
+ 再把自己（带多个副作用）追加到最后。
+ 自己只出现一次。

:::

注意这里如果有多个兄弟组件，也只是将兄弟组件的effect list放在父级的前面，而不会放在最先处理的子节点前面，即：

```javascript
App
|-- Child1
|-- Child2
```

效果为：依次为Child1到Child1 -> Child2，再到Child1 -> Child2 -> App。因此这个时候的firstEffect是Child1，而不是Child2。

### 2.3、Effect List在commit阶段如何使用
在commit阶段，React从根节点的firstEffect开始，通过nextEffect遍历整个链表，依次执行副作用。

三个子阶段：

:::color1
+ Before Mutation：读取DOM状态（如获取滚动位置）。
+ Mutation：执行DOM变更（删除、插入）。
+ Layout：调用生命周期、useLayoutEffect。

:::

```javascript
function commitRoot(root) {
  const { firstEffect } = root.current;

  // 阶段1：Before Mutation
  nextEffect = firstEffect;
  while (nextEffect !== null) {
    const callback = commitBeforeMutationEffectsOnFiber(nextEffect);
    nextEffect = nextEffect.nextEffect;
  }

  // 阶段2：Mutation
  nextEffect = firstEffect;
  while (nextEffect !== null) {
    commitMutationEffectsOnFiber(nextEffect, root);
    nextEffect = nextEffect.nextEffect;
  }

  // 提交完成后切换 current 和 workInProgress 树
  root.current = finishedWork;

  // 阶段3：Layout
  nextEffect = firstEffect;
  while (nextEffect !== null) {
    commitLayoutEffectsOnFiber(nextEffect, root);
    nextEffect = nextEffect.nextEffect;
  }
}
```

很多时候看到这里就会觉得这里也是和Fiber的构建一样，是先叶子节点再到父节点，因此以为是从lastEffect开始的，而实际上effectList的遍历是从firstEffect开始，到lastEffect结束，是“从前向后”的顺序，而不是从lastEffect开始。

```javascript
nextEffect = firstEffect;
while (nextEffect !== null) {
  commitMutationEffectsOnFiber(nextEffect);
  nextEffect = nextEffect.nextEffect;
}
```

之所以会出现这种错觉，是因为在Fiber树完成协调时（completeUnitOfWork / completeWork），React是从叶子节点往根节点回溯的。在这个过程中：

:::color1
+ 子节点先完成，把自己的副作用加入链表。
+ 父节点再把自己或子节点的effect list合并进来。
+ 最终整个树的firstEffect和lastEffect挂在根上。

:::

这就导致构建effect list顺序是自底向上，单最终形成的链表是“子effect在前，父effect在后”吗？不！恰恰相反。

:::color1
**关键结论：effect list的执行顺序 ≈ 先子后父（删除）、先父后子（插入）**

:::

这取决于副作用类型！

| 副作用类型 | 执行顺序 | 原因 |
| --- | --- | --- |
| Deletion（删除） | 子节点先删，父节点后删 | 防止删父节点时DOM已被移除 |
| Placement（插入） | 父节点先插入，子节点再插入 | 必须先有容器才能appendChild |
| Update/Layout Effects | 按链表顺序执行 | 通常是父 → 子 → 更深后代 |


但注意：链表本身的构造逻辑决定了顺序，并非简单按父子层级排列。

假设组件结构：

```javascript
<App>
  <div>
    <p>hello</p>
  </div>
</App>
```

更新时可能产生以下effect链：

```javascript
firstEffect → p(FiberHostComponent) → div → App(FunctionComponent) → lastEffect
```

遍历时依次执行：

:::color1
+ 更新<p>文本。
+ 更新<div>属性。
+ 执行useEffect或类组件生命周期（在 App 上）。

:::

所以链表顺序是从最深需要更新的节点开始，逐步向上合并，但最终链式结构仍是firstEffect到lastEffect正向遍历。

:::color1
**因此读取EffectList的时候，并不是每个Fiber都去读取的，直接读取最顶层HostFiberRoot上的Effect List即可整个遍历Effect List。**

:::

## 3、lastEffect介绍
lastEffect不用于遍历，而是用于链表拼接！比如一个父Fiber合并子Fiber的effect list：

```javascript
parent.firstEffect = child.firstEffect;
parent.lastEffect = child.lastEffect;

// 如果自己也有副作用，追加到末尾
if (hasOwnEffect) {
  if (parent.lastEffect) {
    parent.lastEffect.nextEffect = parent; // 接在最后
  } else {
    parent.firstEffect = parent;
  }
  parent.lastEffect = parent;
}
```

所以lastEffect 的作用是快速定位链表末尾，方便高效拼接新节点（O(1) 时间）。

## 4、Effect List的执行时机
在React中，Effect List（副作用链表）的执行时机是在Commit阶段。Commit阶段被分为三个子阶段，每个子阶段都会遍历Effect List并执行相应的操作。下面详细说明：

**Commit阶段概览：**

在Render阶段（包括递阶段和归阶段）结束后，React已经构建了一棵新的Fiber树，并生成了Effect List。Effect List是一个链表，包含了所有需要执行副作用的Fiber节点。Commit阶段的主要任务就是执行这些副作用，包括DOM更新、生命周期方法的调用以及Hook相关副作用的执行。

**Commit阶段的三个子阶段**

Commit阶段分为三个子阶段，每个子阶段都会遍历Effect List，但每个阶段执行的任务不同：

**①、before mutation阶段（DOM修改前）**

这个阶段会执行一些在DOM修改之前需要完成的工作，例如读取DOM状态（用于后续的更新）。具体操作包括：

:::color1
+ 执行getSnapshotBeforeUpdate生命周期方法（对于类组件）。
+ 调度useEffect的销毁和回调函数（注意，这里只是调度，并不直接执行）。

:::

**②、mutation阶段（DOM修改）**

这个阶段会执行实际的DOM操作，包括插入、更新、删除DOM节点。具体操作包括：

:::color1
+ 将新的Fiber树挂载到DOM上（插入节点）。
+ 更新DOM节点的属性（更新节点）。
+ 删除不需要的DOM节点（删除节点）。
+ 同时，在mutation阶段还会执行一些生命周期方法和Hook的清理函数，例如：
    - 对于类组件，会调用componentWillUnmount（在删除节点时）。
    - 对于函数组件，会执行useLayoutEffect的清理函数（注意，不是useEffect的清理函数，useEffect的清理函数在Commit阶段的其他地方执行）。

:::

**③、layout阶段（DOM修改后）**

这个阶段在DOM修改之后立即执行，可以访问到更新后的DOM。具体操作包括：

:::color1
+ 执行componentDidMount、componentDidUpdate等生命周期方法（对于类组件）。
+ 执行useLayoutEffect的回调函数（对于函数组件）。
+ 同时，这个阶段还会将更新后的Ref赋值给对应的ref属性。

:::

**Effect List的遍历**

在Commit阶段的每个子阶段，React都会遍历Effect List，但是每个子阶段只处理与自己相关的副作用。每个Fiber节点上的flags（或旧版中的effectTag）标识了该节点需要执行哪些副作用。在遍历时，React会根据flags来判断是否需要在该阶段执行操作。

**注意：**

useEffect的调度是在before mutation阶段，但是它的执行是异步的，会在浏览器绘制之后执行。而useLayoutEffect的回调函数和清理函数是同步执行的，在mutation阶段和layout阶段执行。在mutation阶段执行完DOM操作后，React会同步执行layout阶段，因此useLayoutEffect的回调函数可以同步访问到更新后的DOM。

**总结：**

Effect List的执行时机是在Commit阶段，具体分为三个子阶段：

:::color1
+ before mutation：读取DOM，调度useEffect，执行getSnapshotBeforeUpdate。
+ mutation：执行DOM操作，执行useLayoutEffect的清理函数和componentWillUnmount。
+ layout：执行useLayoutEffect的回调函数，执行componentDidMount、componentDidUpdate，更新ref。

:::

通过这样的划分，React确保了在更新过程中能够按照正确的顺序执行副作用，避免出现UI不一致的问题。

## 5、问题及总结
### 5.1、Effect List如何构建
Effect List的构建发生在Render阶段的"归"阶段（归阶段也是completeWork阶段），主要通过completeUnitOfWork函数中的循环来完成。这是一个深度优先遍历的过程，子节点的Effect List会先于父节点被构建。

具体来说，在completeUnitOfWork中，当一个Fiber节点（记为completedWork）完成completeWork后：

:::color1
1. 处理子节点的Effect List：如果当前节点（completedWork）的firstEffect不为空，意味着其子节点已经有了一条Effect List。React会将这条子节点的Effect List"冒泡"（合并）到父节点（returnFiber）的Effect List中。这通过更新父节点的firstEffect和lastEffect指针来实现。
2. 添加自身到Effect List：如果当前节点自身也有副作用（即flags或effectTag大于PerformedWork），React会将这个节点本身也添加到父节点的Effect List的末尾。这确保了在后续遍历Effect List时，子节点的副作用总是在父节点之前被执行。

:::

通过这种机制，副作用链表会从叶子节点开始，像"冒泡"一样逐层向上合并，最终在根节点（rootFiber）上形成一条完整的Effect List，其中包含了所有需要执行副作用的Fiber节点，且子节点总是在父节点之前。

### 5.2、父子组件useEffect的执行顺序
从前面的Effect List构建方式，我们就能清晰的知道当父子组件之中都有useEffect执行的时候，useEffect的执行顺序，如下的例子：

```javascript
import * as React from 'react';
import UseEffectDemo from './components/UseEffectDemo';

export default function App() {
  React.useEffect(() => {
    console.log('App mounted');
  }, []);
  return (
    <div>
      <UseEffectDemo />
    </div>
  );
}
```

```javascript
import * as React from 'react';

const UseEffectDemo = () => {
  React.useEffect(() => {
    console.log('UseEffectDemo');
  }, []);
  return <div>UseEffectDemo</div>;
};

export default UseEffectDemo;
```

因为UseEffectDemo是App的子组件，因此UseEffectDemo的Effect List会被放在App的前面，因此调用的时候，UseEffectDemo中的内容会先被触发。

我们对Demo进行调整：

```javascript
import * as React from 'react';
import StateDemo from './components/StateDemo';
import UseEffectDemo from './components/UseEffectDemo';

export default function App() {
  React.useEffect(() => {
    console.log('App mounted');
  }, []);
  return (
    <div>
      <StateDemo />
      <UseEffectDemo />
    </div>
  );
}
```

```javascript
import * as React from 'react';
import UseEffectDemo from '../UseEffectDemo';

const StateDemo = () => {
  const [count, setCount] = React.useState(0);

   React.useEffect(() => {
      console.log('StateDemo');
    }, []);

  return (
    <div>
      <div>count值为{count}</div>
      <div>
        <button onClick={() => setCount(count + 1)}>点击count+1</button>
      </div>
      <UseEffectDemo />
    </div>
  );
};

export default StateDemo;
```

如上我们加了一个兄弟组件StateDemo，并且StateDemo中也调用了UseEffectDemo，这个时候的输出会是怎样的呢？结果是先输出StateDemo中的UseEffectDemo上的useEffect，接着才是StateDemo上的useEffect，然后才到App上的UseEffectDemo中的useEffect，最后才是执行App上了。这个就和我们前面了解到副作用的构建顺序相关。



