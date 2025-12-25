---
group:
  title: TypeScript基础
order: 8
title: 类型推断和类型断言as

nav:
  title: TypeScript
  order: 1
---

## 1、类型推断

类型推断和类型变换是 ts 中很重要的一部分功能，能保证我们写出更高质量的 ts 代码。ts 能根据一些简单的规则来推断变量的类型，而不需要我们给每个参数、变量定义类型。
**发生在类型推论的常见场景**：

- 声明变量并初始化值时。
- 函数设置默认参数值和决定函数返回值时。

### 1.1、赋值推断

变量的类型可以由定义推断，从赋的值中推断出来。

```typescript
let x = 3;
// x = '3'//不能将类型“string”分配给类型“number”。

let y; //使用let未进行赋值时，此时的y默认为any
y = 3;
y = '3';
```

这里要注意使用 const 关键字的时候，因为 const 定义的变量是不能修改的。

```typescript
const z = 4;
// z = 5//无法分配到 "z" ，因为它是常数。
```

### 1.2、返回值推断

根据函数返回值推断出参数的类型。

```typescript
function add(num1: number, num2: number) {
  return num1 + num2;
}
const result = add(1, 2); //result number
```

### 1.3、函数推断

函数从左到右进行推断。

```typescript
type Sum = (a: string, b: string) => string;
const sum: Sum = (a, b) => a + b;
```

### 1.4、属性推断

可以通过属性值推断属性的类型。

```typescript
// 属性推断
let obj = {
  names: 'zhangsan',
  age: 18,
};
let { names, age } = obj; //name:string,age:number
```

## 2、类型断言 as

有时候 ts 对类型的推断并不符合我们的预期，而我们又明确知道类型是什么，这时我们可以使用类型断言手动指定值的类型。
由于类型断言会破坏编译器的类型推断，所以当我们使用类型断言时需要小心，编译的时候不报错，不代表运行的时候不报错。
**语法格式：**

> <类型>值或 值 as 类型

**举例：**

```typescript
// as的两种语法
interface Foo {
  a: string;
  b: number;
}

const foo = {} as Foo;
// 或者
// const foo = <Foo>{};
foo.a = 'a';
foo.b = 1;
```

`<Foo>`这种写法跟 jsx 语法有冲突，写在 typescript 文件里会报错。另外它跟 ts 泛型写法类似，容易混淆。在 typescript 语法（React 的 jsx 语法的 ts 版）中必须使用值 as 类型。
形如 `<Foo>`的语法在 typescript 中表示的是一个 ReactNode，在 ts 中除了表示类型断言之外，也可能是表示一个泛型。因此在使用类型断言时，统一使用 值 as 类型 的语法。

### 2.1、类型断言使用限制

类型断言并非可以随意使用，下面的断言就会报错：

```typescript
const foo = 'string' as number;
```

将 string 类型断言成 number 类型，这明显是不合理的，所以 ts 不允许这样的情况。
S 类型要想断言成 T 类型，S 和 T 需要互相兼容。可以简单理解为 S 是 T 的子类型或者 T 是 S 的子类型，但有例外：

```typescript
const foo = 1 as 2; // 1不是2的子类型，2不是1的子类型，但断言成功
```

断言把两种能**有重叠关系的数据类型进行相互转换**的一种 TS 语法，把其中的一种数据类型转换成另外一种数据类型。类型断言和类型转换产生的效果一样，但语法格式不同。类型断言语法格式为 “A 数据类型的变量 as B 数据类型”（A 数据类型和 B 数据类型必须具有重叠关系）。以下几种场景都属于重叠关系；

#### 2.1.1、如果 A，B 是类，并且有继承关系

【 extends 关系】无论 A，B 谁是父类或子类， A 的对象变量可以断言成 B 类型，B 的对象变量可以断言成 A 类型 。但大多数场景下都是把父类的对象变量断言成子类。

```typescript
// A，B 是类，并且有继承关系

class People {
  public username!: string;
  public age!: number;
  constructor() {}
  step() {}
}

class Student extends People {
  public username!: string;
  public age!: number;
  public address!: string;
  constructor(username: string, age: number, address: string) {
    super();
    this.address = address;
  }
  study() {}
}
let people = new People();
// people.study() // 类型“People”上不存在属性“study”。

// 绝大多数是父类断言成子类
let res = people as Student; // 类型断言 正确（父类断言成子类）
res.study(); // 正确，Student类上有study方法
res.step(); // 正确，Student类上有step方法

// 子类断言成子类父类
let student = new Student('wangwu', 23, '北京');
let res1 = student as People; // 正确
// res1.study() // 类型“People”上不存在属性“study”。
```

如上的例子中，我们的 Student 继承自 People，而 study 方法仅在 Student 中存在，因此在我们 new People 的时候，新声明的 people 是没有 study 方法的，而如果我们将 people 给断言(as)为 Student 后，我们就能访问 Student 上的方法。相反，当我们 new Student 后再将定义的 student as 为 People，这个时候我们的 res1 就被断言为 People，因此这样就只能访问 People 中的属性和方法。

#### 2.1.2、A，B 如果是类，没有继承关系但是有一方的 public 属性覆盖另一方的

两个类中的任意一个类的所有的 public 实例属性【不包括静态属性】加上所有的 public 实例方法和另一个类的所有 public 实例属性加上所有的 public 实例方法完全相同或是另外一个类的子集，则这两个类可以相互断言，否则这两个类就不能相互断言。

```typescript
// A，B 如果是类，没有继承关系但是有一方的public属性覆盖另一方的

class Person {
  constructor(public username: string, public age: number) {}
}

class Stu {
  public username!: string;
  public age!: number;
  public address!: string;
  constructor(username: string, age: number, address: string) {
    this.address = address;
  }
  public study() {}
}

let people1 = new Person('wangwu', 23);
let stuedConvert = people1 as Stu; // 没有报错，Stu包含了Person的所有public属性，所以Person的属性是Stu的子集
let stu = new Stu('wangwu', 23, '北京');
let peopledConvert = stu as Person; // 正确 Person是Stu的子集
```

#### 2.1.3、如果 A 是类，B 是接口，并且 A 类实现了 B 接口【implements】

如果 A 是类，B 是接口，并且 A 类实现了 B 接口【implements】；

- A 的对象变量可以断言成 B 接口类型，同样 B 接口类型的对象变量也可以断言成 A 类型，类似第一项。

```typescript
// 如果 A 是类，B 是接口，并且 A 类实现了 B 接口【implements】
interface People2 {
  username: string;
  age: number;
  address: string;
}

// Stu 实现了People接口
class Stu1 implements People2 {
  public username!: string;
  public age!: number;
  public address!: string;
}

// people对象实现了People接口
let people2: People2 = {
  username: 'wangwu',
  age: 23,
  address: '11',
};
let result1 = people2 as Stu1; // 正确，people可以断言成Stu，Stu类实现看People接口
let stu1 = new Stu('wangwu', 23, '北京');
stu as People2; // 正确，
```

#### 2.1.4、如果 A 是类，B 是接口，并且 A 类没有实现了 B 接口，但是有一方的 public 属性覆盖另一方的

A 是类，B 是接口，没有继承关系，但是如果一方可以覆盖另外一方就可以断言，类似第二点。

```typescript
// 如果 A 是类，B 是接口，并且 A 类没有实现了 B 接口，但是有一方的public属性覆盖另一方的
interface Peo {
  username: string;
  age: number;
  address: string;
}
let peo: Peo = {
  username: 'wangwu',
  age: 23,
  address: '11',
};
class Test {
  public username!: string;
  public age!: number;
  public address!: string;
  public phone!: string;
  public sex!: number;
  public old!: number;

  constructor(username: string, age: number, address: string) {
    this.address = address;
  }
}

let re = peo as Test; //正确
let test = new Test('wangwu', 23, '北京');
test as Peo; // 正确，属性完全相同或者一方覆盖另外一方
```

#### 2.1.5、如果 A 是一个函数上参数变量的联合类型

string |number，那么在函数内部可以断言成 string 或 number 类型。

#### 2.1.6、多个类组成的联合类型断言方式

例如：let vechile: Car | Bus | Trunck。 vechile 可以断言成其中任意一种数据类型。 例如 vechile as Car， vechile as Bus ， vechile as Trunck 。

#### 2.1.7、任何数据类型都可以转换成 any 或 unknown 类型

any 或 unknown 类型也可以转换成任何其他数据类型。

### 2.2、常用场景

#### 2.2.1、html 元素及 window 断言

如下，如果我们要获取一个 canvas 对象，然后对该对象进行操作。而 document.getElementById 方法给我们返回的是一个 HTMLElement 类型，但是 HTMLElement 类型中是没有 canvas 的方法的，因此我们需要将获取的 element 元素断言为 HTMLCanvasElement。

```typescript
const canvasEle = document.getElementById('my-canvas') as HTMLCanvasElement;
const context = canvasEle.getContext('2d'); // 类型“HTMLElement”上不存在属性“getContext”
```

同样的在 a 标签中有的时候也需要类似做法：

```typescript
const aEle = document.getElementById('my-a') as HTMLAnchorElement;
aEle.href = 'http://www.baidu.com';
```

针对 window，即使我们在 window 设置了一个属性，我们也没办法直接访问，会报类型“Window & typeof globalThis”上不存在属性“\_APIMAP_ENV”。

```typescript
['prod', 'production', 'product'].includes((window as any)._APIMAP_ENV); //类型“Window & typeof globalThis”上不存在属性“_APIMAP_ENV”。
```

#### 2.2.2、const 断言

形如值 as const 或<const>值。const 断言有以下几个作用：

> - 字面量类型不会扩宽，如下面的 x 类型是"hello"而不是 string;
> - 数组字面量变成只读元组；
> - 对象字面量属性变成只读。

```typescript
// Type '"hello"'
let q = 'hello' as const;
// Type 'readonly [10, 20]'
let w = [10, 20] as const;
// Type '{ readonly text: "hello" }'
let e = { text: 'hello' } as const;
```

如下是我们在 CRM 需求上的类型定义：

```typescript
export const ELEMENT_GOODS_SHORT_NAME = {
  code: 'goodsShortName',
  estimatedCharCount: 25,
  name: '#商品简称#',
  getLabel: (order = '1') => `#商品简称${order}#`,
  isGoodsRelated: true,
} as const;
```

将鼠标放到 ELEMENT_GOODS_SHORT_NAME 可以看到这里相当于定义了 readonly 的数据。

```typescript
const ELEMENT_GOODS_SHORT_NAME: {
  readonly code: 'goodsShortName';
  readonly estimatedCharCount: 25;
  readonly name: '#商品简称#';
  readonly getLabel: (order?: string) => string;
  readonly isGoodsRelated: true;
};
```

### 2.3、双重断言

上面说过，要想断言成功，值的类型需要和断言的类型兼容。而 any 和 unknown 与其他类型都兼容，所以可以通过下面的双重断言来避免断言错误：

```typescript
const foo1 = 'aaa' as unknown as number; //number
```

这样我们就把一个 string 的 foo1 断言成了 number。

### 2.4、慎用类型断言

考虑下面这段代码：

```typescript
interface Too {
  a: number;
  b: string;
}

const to = {} as Too;

to.a = 1;
to.b = 'hello';
// 类型“{}”上不存在属性“a”。
// 类型“{}”上不存在属性“b”。
```

类似的情况大家在日常中经常接触，ts 会报错。解决办法之一是将{}断言成 Too,但这样子会丢失 ts 发现错误的能力，假如我们给 to.a 赋值之前就使用它：

```typescript
const to = {} as Too;
const total = to.a + 2; // NaN
```

得到的 total 并不符合我们预期，而 ts 并没有任何提示。

> 所以，能不使用类型断言我们尽量不要使用。
> 当你想用类型断言的时候，可以先看看能否换成类型声明。

## 3、注意区分映射类型中 key 重映射的 as 从句

映射类型中 key 的重映射可能会用到跟类型断言一样的 as 关键字，但它不属于类型断言，这里简单介绍说明一下。
映射类型中 key 的重映射形式如下：

```typescript
type MappedTypeWithNewKeys<T> = {
  [K in keyof T as NewKeyType]: T[K];
};
```

具体应用：
结合模板字面量类型将 key 转成 getKey。

```typescript
interface Person {
  name: string;
  age: number;
  location: string;
}

type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type LazyPerson = Getters<Person>;
```

类型体操 PickByType，类似于实现 ts 内置的 Pick 类型。

```typescript
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};
```

## 4、总结

> - 当我们比 ts 更清楚值的类型时，可以通过类型断言手动指定；
> - 类型断言有两种写法，建议统一使用 as 关键字；
> - 类型不兼容时类型断言会报错，可以使用双重断言解决；
> - 类型断言是编译时概念，不等同于运行时的类型转换；
> - 尽量少用类型断言，因为它可能隐藏掉代码中的坏味道；
> - const 断言是一种特殊的类型断言，某些场景下比较有用；
> - 映射类型中 key 的重映射中也用到了 as 关键字，但不属于类型断言，注意区分。
