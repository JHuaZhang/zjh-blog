---
group:
  title: 【01】js数据类型介绍及转换
  order: 1
order: 1
title: js数据类型介绍
nav:
  title: JavaScript
  order: 2
---

## 1. 数据类型简介

JavaScript 一共包含八大数据类型，分为两大类：

- **原始类型（基本数据类型）**：Number、Boolean、String、null、undefined、Symbol（ES6）、BigInt（ES2020）。
- **对象类型（引用数据类型）**：Object（包括 Object、Array、Function、Date 等）。

---

## 2. 基本数据类型特点

### 2.1 按值访问

基本数据类型的变量直接保存实际的值，操作时直接操作该值。

### 2.2 值不可变

基本数据类型的值本身无法被修改。任何方法返回的都是新值，原值不变。

```javascript
let name = 'zhangsan';
name.substr(1);
console.log(name); // "zhangsan" 未变

let age = 'firstblood';
age.toUpperCase();
console.log(age); // "firstblood" 未变
```

```javascript
let name = 'zhangsan';
name = 'lisi'; // 指针指向新值，原值 "zhangsan" 并未改变
console.log(name); // "lisi"
```

### 2.3 不可添加属性和方法

尝试给基本类型添加属性或方法会失败（返回 undefined）。

```javascript
let user = 'zhangsan';
user.age = 18;
user.method = function () {};
console.log(user.age); // undefined
console.log(user.method); // undefined
```

### 2.4 赋值是值拷贝

从一个变量向另一个变量赋值基本类型时，会在栈中创建一个新值，两者独立。

```javascript
let a = 18;
let b = a;
a++;
console.log(a); // 19
console.log(b); // 18
```

### 2.5 比较是值的比较

基本类型的比较基于实际值。

```javascript
let a = '{}';
let b = '{}';
console.log(a === b); // true
```

### 2.6 存储于栈内存

基本类型大小固定，存储在栈内存中，分配和释放速度快。

```javascript
let name = 'zhangsan';
let age = 18;
let weight = '60kg';
```

**栈内存示意图**：

| 标识符 | 值         |
| ------ | ---------- |
| name   | "zhangsan" |
| age    | 18         |
| weight | "60kg"     |

---

## 3. 堆栈角度对比基本数据类型与引用数据类型

### 3.1 基本数据类型（Primitive Types）

- **类型**：undefined、null、boolean、number、string、symbol、bigint。
- **存储位置**：栈内存（Stack）。
- **特点**：
  - 按值访问，变量直接保存数据。
  - 不可变性：修改会创建新值，原值不变。
  - 固定大小（如 number 为 64 位）。
- **示例**：

```javascript
let a = 10; // 栈中存储 10
let b = a; // 复制值到 b
b = 20; // a 仍为 10
```

**内存示意图**：

```
栈内存
a → 10
b → 20
```

### 3.2 引用数据类型（Reference Types）

- **类型**：object、array、function、Date 等。
- **存储位置**：
  - 数据本体存储在堆内存（Heap）。
  - 引用地址（指针）存储在栈内存。
- **特点**：
  - 按引用访问：变量保存指向堆内存的地址。
  - 可变性：修改对象属性时，所有引用该地址的变量同步变化。
  - 动态大小，适合堆内存动态分配。
- **示例**：

```javascript
let obj1 = { name: 'Alice' }; // 堆中存对象，栈中存地址
let obj2 = obj1; // 复制地址
obj2.name = 'Bob'; // 修改堆中对象
console.log(obj1.name); // "Bob"
```

**内存示意图**：

```
栈内存          堆内存
obj1 → 地址1 → { name: "Bob" }
obj2 → 地址1
```

### 3.3 堆栈交互的关键行为

#### 3.3.1 变量赋值

- **基本类型**：复制值本身，互不影响。

```javascript
let x = 5;
let y = x;
y = 10;
console.log(x); // 5
```

- **引用类型**：复制引用地址，指向同一对象。

```javascript
let arr1 = [1, 2];
let arr2 = arr1;
arr2.push(3);
console.log(arr1); // [1, 2, 3]
```

#### 3.3.2 函数参数传递

- **基本类型**：传递值的副本，函数内修改不影响外部。

```javascript
function change(num) {
  num = 100;
}
let n = 10;
change(n);
console.log(n); // 10
```

- **引用类型**：传递地址的副本，函数内修改对象属性会影响外部。

```javascript
function update(obj) {
  obj.value = 100;
}
let data = { value: 10 };
update(data);
console.log(data.value); // 100
```

#### 3.3.3 内存回收

- **栈内存**：随函数执行上下文自动释放。
- **堆内存**：依赖垃圾回收机制（标记清除、引用计数等）。

### 3.4 特殊情况与注意事项

#### 3.4.1 闭包中的变量

闭包引用的外部变量会保留在堆内存中，即使函数执行完毕。

```javascript
function createCounter() {
  let count = 0; // 因闭包保留在堆中
  return () => count++;
}
const counter = createCounter();
console.log(counter()); // 0
console.log(counter()); // 1
```

#### 3.4.2 基本类型的“对象包装”

访问基本类型的方法时，会临时创建包装对象（如 String、Number），使用后立即销毁。

```javascript
let str = 'hello';
str.toUpperCase(); // 临时包装对象，调用后销毁
```

#### 3.4.3 Symbol 与 BigInt 的特殊性

两者虽是基本类型，但唯一性（Symbol）或大数值（BigInt）不影响存储位置，仍存于栈中。

### 3.5 堆栈视角下的性能影响

- **栈内存**：分配释放快，但容量有限（通常几 MB）。
- **堆内存**：分配灵活，但管理复杂，频繁操作可能引发内存泄漏或 GC 压力。

### 3.6 总结对比

| 维度     | 基本数据类型       | 引用数据类型               |
| -------- | ------------------ | -------------------------- |
| 存储位置 | 栈内存（直接存值） | 堆内存（存本体），栈存地址 |
| 赋值行为 | 复制值             | 复制地址                   |
| 可变性   | 不可变             | 可变                       |
| 参数传递 | 按值传递（副本）   | 按引用传递（地址副本）     |
| 内存管理 | 自动释放           | 依赖垃圾回收               |

**开发建议**：

- 避免无意共享引用类型数据，可使用深拷贝隔离对象。
- 警惕闭包导致的内存泄漏，及时解除无用引用。
- 基本类型适合高频操作的小数据，引用类型适合复杂结构。
