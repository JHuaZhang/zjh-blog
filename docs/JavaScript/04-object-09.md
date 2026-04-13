---
group:
  title: 【04】js对象及对象方法
  order: 4
order: 9
title: Object.freeze与Object.isFrozen详解
nav:
  title: JavaScript
  order: 2
---

## 1. 概述

`Object.freeze()` 方法用于**冻结**一个对象，使其变为不可变：不能添加新属性、不能删除已有属性、不能修改已有属性的值、不能修改属性的可枚举性/可配置性/可写性，也不能修改原型。`Object.isFrozen()` 用于判断一个对象是否已被冻结。两者配合可用于实现不可变数据模式。

---

## 2. Object.freeze

### 2.1 定义与语法

`Object.freeze()` 冻结对象，返回原对象。

```javascript
Object.freeze(obj);
```

- **`obj`**：要被冻结的对象。
- **返回值**：被冻结的对象（即传入的 `obj`）。

**原理**：冻结操作会设置对象内部的 `[[Extensible]]` 标志为 `false`，并遍历对象的所有自身属性，将每个属性的 `configurable` 特性设为 `false`（对于数据属性，还会将 `writable` 设为 `false`，但 `setter` 属性不受影响）。这样引擎在后续操作中会检查这些标志，禁止修改。冻结是**浅层**的，只影响对象自身，不递归处理属性值。

**示例**：

```javascript
const obj = { prop: 42 };
Object.freeze(obj);
obj.prop = 33; // 静默失败（非严格模式）
console.log(obj.prop); // 42

obj.newProp = 'test'; // 无法添加新属性
delete obj.prop; // 无法删除
console.log(obj.newProp); // undefined
```

### 2.2 特性与用途

- **不可变性**：创建不可变对象，防止意外修改。
- **提高安全性**：避免对象被篡改。
- **响应式优化**：在 Vue 中冻结对象可阻止响应式转换，提升性能。
- **函数式编程**：辅助实现不可变数据。

### 2.3 应用场景示例

**场景1：Vue 中优化大型静态数据**

```javascript
// 在 Vue data 中返回冻结对象，Vue 不会为其添加响应式监听
export default {
  data() {
    return {
      staticConfig: Object.freeze({ apiUrl: '...', timeout: 5000 }),
    };
  },
};
```

**场景2：React 中配合 `React.memo` / `PureComponent` 避免不必要的重渲染**

在 React 中，父组件每次渲染时如果创建新对象，即使内容相同，子组件的 `memo` 浅比较也会认为 props 变化，导致子组件重新渲染。使用冻结对象并确保引用稳定可以优化此问题。

```js
import React, { memo } from 'react';

// 将冻结对象定义在组件外部，引用始终不变
const frozenConfig = Object.freeze({
  apiUrl: 'https://api.example.com',
  timeout: 5000,
});

const ChildComponent = memo(({ config }) => {
  console.log('ChildComponent rendered');
  return <div>API: {config.apiUrl}</div>;
});

function ParentComponent() {
  // 每次渲染都传递同一个 frozenConfig 引用
  return <ChildComponent config={frozenConfig} />;
}
```

如果对象需要动态计算，可使用 `useMemo` 结合 `Object.freeze`：

```js
const config = useMemo(
  () =>
    Object.freeze({
      apiUrl: baseUrl + '/v1',
      timeout: 5000,
    }),
  [baseUrl],
);
```

冻结对象本身不改变引用，但配合稳定引用策略，可以让 `memo` 正确工作，避免不必要的重渲染。

**场景3：定义常量配置对象**

```javascript
const APP_CONFIG = Object.freeze({
  VERSION: '1.0.0',
  API_BASE: 'https://api.example.com',
});
// APP_CONFIG.VERSION = '2.0.0'; // 无效
```

**场景4：在 Redux 中确保 reducer 的不可变性（辅助）**

```javascript
const initialState = Object.freeze({ count: 0 });
function counter(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return Object.freeze({ count: state.count + 1 });
    default:
      return state;
  }
}
```

**场景5：深层冻结（递归冻结）**

```javascript
function deepFreeze(obj) {
  Object.freeze(obj);
  Object.values(obj).forEach((value) => {
    if (value !== null && typeof value === 'object') deepFreeze(value);
  });
  return obj;
}
const nested = { a: { b: 1 } };
deepFreeze(nested);
nested.a.b = 2; // 无效（严格模式报错）
```

### 2.4 注意事项

- **浅冻结**：只冻结对象本身，属性值如果是对象，该对象不会被冻结。
- **不可逆**：冻结后无法解冻，不能恢复。
- **性能影响**：冻结后的对象读写可能略慢（引擎需检查不可变性），但通常可忽略；在 Vue 中可提升性能（避免响应式开销）。
- **严格模式**：在严格模式下，尝试修改冻结对象会抛出 `TypeError`，有助于及早发现错误。

---

## 3. Object.isFrozen

### 3.1 定义与语法

`Object.isFrozen()` 判断对象是否被冻结。

```javascript
Object.isFrozen(obj);
```

- **`obj`**：要检测的对象。
- **返回值**：`true` 如果对象已冻结，否则 `false`。

**原理**：检查对象的 `[[Extensible]]` 标志是否为 `false`，以及所有自身属性是否都不可配置（且数据属性不可写）。若全部满足，返回 `true`；否则返回 `false`。

**示例**：

```javascript
const obj = { a: 1 };
console.log(Object.isFrozen(obj)); // false
Object.freeze(obj);
console.log(Object.isFrozen(obj)); // true
```

### 3.2 特性与用途

- **状态检测**：确认对象是否已被冻结，用于条件逻辑。
- **调试断言**：在开发中验证对象不可变状态。
- **库开发**：某些函数要求传入对象不可变，可用此方法校验。

### 3.3 应用场景示例

**场景1：条件性修改对象（仅在未冻结时）**

```javascript
function safeUpdate(obj, key, value) {
  if (!Object.isFrozen(obj)) {
    obj[key] = value;
  } else {
    console.warn('Cannot update frozen object');
  }
}
```

**场景2：断言确保对象为不可变**

```javascript
function assertImmutable(obj) {
  if (!Object.isFrozen(obj)) {
    throw new Error('Expected a frozen object');
  }
}
```

**场景3：在单元测试中验证对象状态**

```javascript
test('config should be frozen', () => {
  const config = getConfig();
  expect(Object.isFrozen(config)).toBe(true);
});
```

### 3.4 注意事项

- 只检查对象本身的冻结状态，不递归检查属性对象。
- 与 `Object.isSealed`、`Object.isExtensible` 有区别，需区分使用。

---

## 4. 对比总结

| 特性               | `Object.freeze`                                      | `Object.isFrozen`                |
| ------------------ | ---------------------------------------------------- | -------------------------------- |
| **作用**           | 冻结对象（使其不可变）                               | 检测对象是否已被冻结             |
| **返回值**         | 被冻结的对象                                         | 布尔值                           |
| **是否改变原对象** | 是                                                   | 否                               |
| **浅/深**          | 浅冻结（只冻结自身）                                 | 只检测自身                       |
| **可逆性**         | 不可逆                                               | -                                |
| **性能影响**       | 冻结操作有一定开销；冻结后访问略慢（但可优化响应式） | 无显著性能影响                   |
| **典型用途**       | 创建不可变对象、Vue/React 性能优化                   | 验证对象冻结状态、调试、条件判断 |

**补充**：与 `Object.seal` 不同，`freeze` 还禁止修改已有属性的值（即 `writable: false`），而 `seal` 只禁止添加/删除属性，仍可修改属性值。

---

## 5. 总结

- `Object.freeze` 是创建浅层不可变对象的标准方法，适用于需要保护对象不被修改的场景，同时可在 Vue 中避免响应式开销。
- `Object.isFrozen` 用于检测对象是否已被冻结，常与 `freeze` 配合进行状态校验或条件逻辑。
- 注意 `freeze` 是浅层的，如需深层冻结需递归处理。
- 在严格模式下，对冻结对象的非法操作会抛出错误，有助于及早发现 bug。在实际开发中，合理使用 `freeze` 可以增强代码的健壮性和可维护性。
