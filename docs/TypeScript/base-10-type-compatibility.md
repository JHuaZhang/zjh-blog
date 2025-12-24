---
group:
  title: TypeScript基础
order: 10
title: 类型的兼容性&类型保护

nav:
  title: TypeScript
  order: 1
---

## 1、介绍

当一个类型 Y 可以赋值给另外一个类型 X 的时候，我们就可以说类型类型 X 兼容类型 Y。即 X(目标类型)：Y(源类型)。简单的一句话概括就是**重新赋值不报错（类型自动转化）**。

```typescript
interface Named {
  name: string;
}
class ClassDemo {
  name: string;
  constructor(name) {
    this.name = name;
  }
}
let p: Named;
// 虽然 ClassDemo 类没有明确说明其实现了 Named 接口。但是依然能够编译成功，这就是兼容性
p = new ClassDemo('这就兼容了');
```

## 2、类型兼容性的几种情况

### 2.1、子类型都兼容父类型

**①、所有的子类型都和它的父类型都兼容。**

```typescript
// demo1
let a: number;
let b = 2;
a = b;

// demo2
interface Test {
  name: string;
}
interface TestSon extends Test {
  age: number;
}
let newC: Test;
let newTestSon: TestSon = { name: 'test', age: 12 };
newC = newTestSon;
// C 是父接口虽然结构上看比TestSon少
// 但是子类型赋值父类型没问题

// demo3
class Animal {
  name: string;
}
class Dog extends Animal {
  run() {}
}
let animal: Animal;
let dog = new Dog();
// Dog 继承了Animal 同理 最后DOG 可以赋值给Animal
animal = dog;
```

### 2.2、结构类型

如果 x 要兼容 y，那么 y 至少具有与 x 相同的属性，可以把**多的赋值给少的**，但是**不能把少的赋值给多的**。

**①、x 要兼容 y，那么 y 至少具有与 x 相同的属性 满足即下面都能互相兼容。**

```typescript
// 定义类型方式不同但字段参数类型都相同
class Q {
  name = 1;
}
interface W {
  name: number;
}
type E = {
  name: number;
};
// 字面量
const f = { name: 2 };
let q: Q = f;
let w: W = q;
let e: E = w;
```

**②、y 拥有 x 所有属性且拥有 y 不具备属性。**
一个类型不仅拥有另外一个类型全部的属性和方法，还包含其他的属性和方法（如同继承自另外一个类型的子类一样），那么前者是可以兼容后者的**多的赋值给少的**。

```typescript
// y 拥有x 所有属性且拥有y不具备属性
class Demo1 {
  name = 1;
  age = 1;
}
interface Demo2 {
  name: number;
}
type Demo3 = {
  name: number;
};
// 字面量
const d = { name: 2 };
let demo2: Demo2 = new Demo1();
let demo3: Demo3 = new Demo1();
// 报错 类型 "{ name: number; }" 中缺少属性 "age"，但类型 "Demo1" 中需要该属性。
let demo1: Demo1 = d; // 报错 少的赋值给多的了
```

⚠️ 注意这里多赋给少的有一个特性：**如果是字面量的对象不能直接兼容**。

非字面量的情况完美兼容：

```typescript
class A {
  name = 1;
  age = 1;
}
interface B {
  name: number;
}
let b: B = new A();
```

字面量情况：

```typescript
interface B {
  name: number;
}

let b: B = { id: 1, name: 1 }; // 报错

// 需要先打破freshness 特性,即赋值一次做中转
const a = { id: 1, name: 1 };
b = a; // ok

// 或者使用断言,断言必须是子父关系 将低等级断言给高等级的
// 其实满足之前说到多的可以兼容少的
const c: B = { id: 1, name: 1 } as B;

// interface B {
//   name: number
//   age: number
// }
// // 这样断言成功因为 { age: 1 } 是B的子集
// const c: B = { age: 1 } as B
```

### 2.3、类的兼容性

**①、如果两个类包含私有、受保护的属性和方法，则仅当这些属性和方法源自同一个类，它们才兼容**。

```typescript
class C1 {
  name = '1';
  private id = 1;
  protected age = 30;
}
class C2 {
  name = '2';
  private id = 1;
  protected age = 30;
}
let InstC2: C2 = new C1(); // 报错
// 不能将类型“C1”分配给类型“C2”。类型具有私有属性“id”的单独声明。
```

**②、类有静态部分和实例部分的类型。 比较两个类类型的对象时，只有实例的成员会被比较。 静态成员和构造函数不在比较的范围内**。

```typescript
class AnimalClass {
  public static age: number;
  constructor(public name: string) {}
}
class PeopleClass {
  public static age: string;
  constructor(public name: string) {}
}
class FoodIsClass {
  constructor(public name: number) {}
}
let animals: AnimalClass = new AnimalClass('w');
let people: PeopleClass = new PeopleClass('w');
let food: FoodIsClass = new FoodIsClass(1);
people = animals;
animal = food; // 报错
// 不能将类型“FoodIsClass”分配给类型“Animal”。
//属性“name”的类型不兼容。不能将类型“number”分配给类型“string”
```

上面的案例`AnimalClass` 和`PeopleClass`,中 因为 static 是静态类方法所以他们 age 属性是不影响他们相互赋值，比较的都是实例成员，也因此`FoodIsClass` 的 name 属性类型和另外两个不一致不能相互赋值。

### 2.4、函数的兼容性

**①、参数个数一致，类型不同，是不能相互赋值的。**

```typescript
let xx = (a: number) => 0;
let yy = (a: string) => 0;
// xx = yy // 报错参数类型不一致
```

**②、参数个数不一致，相同类型参数的位置也不一致，是不可以相互赋值的。**

```typescript
let x = (c: number) => 0;
let y = (a: string, b: number) => 0;
// xx = yy // 报错
```

**③、参数个数不一致，相同类型参数的位置一致，可以相互赋值，但是'只能把少的赋值给多的。**
解释为什么只能把少的赋值给多的，你把少的赋值给多，多的那个没被赋值的参数相当于'undefind' 没有影响，但是你把多的赋值给少的，少的无缘无故多了一个参数那就报错了。

```typescript
let x = (a: number) => 0;
let y = (a: number, b: string) => 0;
y = x; // 把少的 给多的，多的可以只用一个参数另一不用
// x = y // 把多的参数，赋值给少参数，因为x定义只有一个a，
//你多给他一个b他也用不了
```

**④、当一个函数有剩余参数时，它被当做无限个可选参数。**

```typescript
const getSum = (nlist: number[], callback: (...args: number[]) => number) => {
  callback(...nlist);
};
getSum([1, 2, 3], (...args: number[]) => {
  const sum = args.reduce((a, b) => a + b);
  console.log(sum); // 6

  return sum;
});
getSum([1, 2, 3], (n1: number, n2: number) => {
  console.log(n1 + n2);
  return n1 + n2;
});
```

**⑤、当 A 的参数类型不确定，B 的参数类型为 A 中不确定参数类型中的一个。可以吧多类型赋值给少类型的。**

```typescript
let funcA = (arg1: number | string) => {};
let funcB = (arg1: number) => {};
// funcA = funcB // 错误的
funcB = funcA;
```

**⑥、函数返回类型可以把少的赋值给多的，多的不能赋值给少的。**

```typescript
let funcTypeA = (): string | number => 0;
let funcTypeB = (): number => 0;
funcTypeA = funcTypeB;
// funcTypeB = funcTypeA // 报错
```

**⑦、重载类型不一致怎么赋值都是错。**

```typescript
function merge(n1: number, n2: number): number;
function merge(n1: string, n2: string): string;
// 虽然是any 但是只能是 string 或者 number
function merge(n1: any, n2: any): any {
  return n1 + n2;
}
function sum(n1: number, n2: number): number;
function sum(n1: any, n2: any): any {
  return n1 + n2;
}
// 问题重载类型不一致怎么赋值都是错
// merge = sum // 报错
// sum = merge // 报错
```

### 2.5、泛型的兼容性

泛型在判断兼容性的时候会先判断具体的类型，然后再进行兼容性判断。

- 接口内容为空没有用到泛型的时候是可以的。

```typescript
interface Empty<T> {}
let x!: Empty<string>;
let y!: Empty<number>;
x = y; // YES
```

对于没指定泛型类型的泛型参数时，会把所有泛型参数当成 any 比较。然后用结果类型进行比较。

- 接口内容不为空的时候不可以

```typescript
interface noEmpty<T> {
  data: T;
}
let m!: noEmpty<string>;
let n!: noEmpty<number>;
m = n; // ERROR 不能将类型“noEmpty<number>”分配给类型“noEmpty<string>”。
```

实现原理如下，先判断具体的类型在判断兼容性：

```typescript
interface noEmptyString {
  data: string;
}
interface noEmptyNumber {
  data: number;
}
// 前一个 data 是 字符串类型，后一个是 数字类型，所以 不能兼容
```

### 2.6、枚举的兼容性

- 枚举类型与数字类型兼容，并且数字类型与枚举类型兼容
- 不同枚举类型之间是不兼容的

```typescript
// 数字可以赋给枚举
enum Colors {
  Red,
  Yellow,
}
let c: Colors;
c = Colors.Red; // 0
c = 1; // YES
c = '1'; // ERROR

// 枚举值可以赋给数字
let n: number;
n = 1;
n = Colors.Red; // YES
```
