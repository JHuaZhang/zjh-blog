---
order: 2
title: TypeScript类型分类

nav:
  title: TypeScript
  order: 5
---

## 1、ts 类型声明

在前面的学习中，我们知道 TypeScript 能够对变量进行类型限制，方便我们在大型项目中开发。TypeScript 支持与 JavaScript 几乎相同的数据类型，此外还提供了实用的枚举类型、元祖方便我们使用。

**类型声明是 TS 非常重要的一个特点：**

- ​ 通过类型声明可以指定 TS 中变量(参数，形参)的类型。
- ​ 指定类型后，当变量赋值时，TS 编译器会自动检查值是否符合类型声明，符合则赋值，否则报错。
- ​ 简而言之，类型声明给变量设置了类型，使得变量只能存储某种类型的值。

**语法：**

```t'y'p'e's'c'r'i'p't
let 变量：类型；
let 变量：类型 = 值；
function fn（参数：类型，参数：类型）：（函数返回值）类型{
	...
}
```

**自动类型判断：**

- TS 拥有自动类型判断机制。
- 当对变量的声明和赋值是同时进行的，TS 编译器会自动判断变量的类型。
- 所以如果你的变量的声明和赋值是同时进行的，可以省略掉类型声明。

```typescript
let d = true;
d = 1; //不能将类型“number”分配给类型“boolean”
```

**类型：**

|  类型   |       例子        |              描述               |
| :-----: | :---------------: | :-----------------------------: |
| number  |    1，-33,2.5     |            任意数字             |
| string  |    'hi','demo'    |           任意字符串            |
| boolean |    true，false    |      布尔值 true 或 false       |
| 字面量  |      其本身       |  限制变量的值就是该字面量的值   |
|   any   |        \*         |            任意类型             |
| unknown |        \*         |         类型安全的 any          |
|  void   | 空值（undefined） |     没有值（或 undefined）      |
|  never  |      没有值       |          不能是任何值           |
| object  | {name:'zhangsan'} |         任意的 js 对象          |
|  array  |      [1,2,3]      |         任意的 js 数组          |
|  tuple  |       [4,5]       | 元素，TS 新增类型，固定长度数组 |
|  enum   |     enum{A,B}     |       枚举，TS 中新增类型       |

​ 我们可以参照 ts 中文网：https://typescript.bootcss.com/basic-types.html 。下面我们就逐个介绍 ts 中的类型声明。

### 1.1、数字 number

和 JavaScript 一样，TypeScript 里的所有数字都是浮点数。 这些浮点数的类型是`number`。 除了支持十进制和十六进制字面量，TypeScript 还支持 ECMAScript 2015 中引入的二进制和八进制字面量。

```typescript
let decLiteral: number = 6;
let hexLiteral: number = 0xf5;
let binaryLiteral: number = 0b1010;
let octalLiteral: number = 0o744;
console.log(decLiteral); //6
console.log(hexLiteral); //245  输出的为10进制的值
console.log(binaryLiteral); //10
console.log(octalLiteral); //484
```

​ 同样的我们无法修改其为其他非数字类型值。

### 1.2、字符串 string

​ JavaScript 程序的另一项基本操作是处理网页或服务器端的文本数据。 像其它语言里一样，我们使用`string`表示文本数据类型。 和 JavaScript 一样，可以使用双引号（`"`）或单引号（`'`）表示字符串。

```typescript
let b: string = 'a';
b = 'b';
console.log(b); //b
// b = 123 //eslint直接报错

let name: string = 'zjh';
let age: number = 18;
let sentence: string = `Hello, my name is ${name},my age is ${age}`;
console.log(sentence); //Hello, my name is zjh,my age is 18
```

还可以使用模版字符串，它可以定义多行文本和内嵌表达式。 这种字符串是被反引号包围（``），并且以${ expr}这种形式嵌入表达式。

这与下面定义`sentence`的方式效果相同：

```typescript
let sentence: string = 'Hello, my name is ' + name + ',my age is' + age;
```

### 1.3、布尔值 boolean

​ 最基本的数据类型就是简单的 true/false 值，在 JavaScript 和 TypeScript 里叫做 boolean（其它语言中也一样）。

```typescript
let value: boolean;
value = true;
// value = 1; // 会报错
console.log(value); //true

let bool: boolean = true;
console.log(bool); //true
```

### 1.4、字面量

​ 我们可以直接使用字面量进行类型声明，这样该变量只能为设置的字面量，不能赋予其他的值，如下面的例子中：

```typescript
//例1
let a: 10;
a = 10; //此处不给赋值，下面a显示报错，在赋值前使用了变量
console.log(a);

// 例2
// a = 11//直接报错，不能将类型11分配给10
```

### 1.5、联合类型

​ 上面我们介绍了字面量的使用，除了可以使用字面量设置某一变量只能为该值之外，我们还可以通过`|`来连接多个类型，因此被称为联合类型。如下例：

```typescript
let b: 'man' | 'woman';
b = 'man';
console.log(b); //man
b = 'woman';
console.log(b); //woman
// b = 'test'//Type '"test"' is not assignable to type '"man" | "woman"'.
```

​ 当然除此之外，我们还能通过 TS 中的类型来进行设置：

```typescript
let b: string | number;
b = 'a';
console.log(b); //a
b = 2;
console.log(b); //2
// b = true//Type 'boolean' is not assignable to type 'string | number'.
```

### 1.5、任意类型 any

​ any 表示任意类型, **一个变量设置 any 后相当于对该变量关闭的 TS 类型检测**，当我们不清楚某个值的具体类型的时候我们就可以使用 any，**任何数据类型的值都可以赋值给 any 类型**，一般用于定义一些通用性比较强的变量, 或者用于保存从其它框架中获取的不确定类型的值。

注意不要过多使用 any，因为什么都是 any 那 ts 就变成 js 了。

```typescript
let d: any; // 定义了一个可以保存任意类型数据的变量
d = 'hello';
d = 10;
d = true;
```

​ 前面我们介绍了，TS 的自动类型判断，即当对变量的声明和赋值是同时进行的，TS 编译器会自动判断变量的类型，当时当我们只声明变量，不指定类型时，则 TS 解析器会自动判断变量的类型为 any（隐式 any）。

### 1.6、unknown 未知类型

​ TypeScript 在 3.0 版本引入了 unknown，顾名思义，unknown 表示未知，因此 unknown 也可以用于表示任意类型，如：

```typescript
let e: unknown;
e = 10;
e = 'hello';
e = true;
```

​ 可以看到 unknown 貌似也可以指代任意类型，那它和 any 到底有什么区别呢？

​ `any` 类型本质上是类型系统的一个逃逸舱。作为开发者，这给了我们很大的自由：TypeScript 允许我们对 `any` 类型的值执行任何操作，而无需事先执行任何形式的检查。

​ 在上述例子中，变量 `value` 被定义成类型 `any`。也是因此，TypeScript 认为以下所有操作都是类型正确的：

```typescript
let value: any;

value.foo.bar; // OK
value.trim(); // OK
value(); // OK
new value(); // OK
value[0][1]; // OK
```

​ 这许多场景下，这样的机制都太宽松了。使用`any`类型，可以很容易地编写类型正确但是执行异常的代码。如果我们使用 `any` 类型，就无法享受 TypeScript 大量的保护机制。

​ 但如果能有顶级类型也能默认保持安全呢？这就是 `unknown` 到来的原因。

就像所有类型都可以被归为 `any`，所有类型也都可以被归为 `unknown`。这使得 `unknown` 成为 TypeScript 类型系统的另一种顶级类型（另一种是 `any`）。

这是我们之前看到的相同的一组赋值示例，这次使用类型为 `unknown` 的变量：

```typescript
let value: unknown;

value = true; // OK
value = 42; // OK
value = 'Hello World'; // OK
value = []; // OK
value = {}; // OK
value = Math.random; // OK
value = null; // OK
value = undefined; // OK
value = new TypeError(); // OK
value = Symbol('type'); // OK
```

​ 对 `value` 变量的所有赋值都被认为是类型正确的。

​ 当我们尝试将类型为 `unknown` 的值赋值给其他类型的变量时会发生什么？

```typescript
let value: unknown;

let value1: unknown = value; // OK
let value2: any = value; // OK
let value3: boolean = value; // Error
let value4: number = value; // Error
let value5: string = value; // Error
let value6: object = value; // Error
let value7: any[] = value; // Error
let value8: Function = value; // Error
```

​ `unknown` 类型只能被赋值给 `any` 类型和 `unknown` 类型本身。直观的说，这是有道理的：只有能够保存任意类型值的容器才能保存 `unknown` 类型的值。毕竟我们不知道变量 `value` 中存储了什么类型的值。

​ 现在让我们看看当我们尝试对类型为 `unknown` 的值执行操作时会发生什么。以下是我们之前看过的相同操作：

```typescript
let value: unknown;

value.foo.bar; // Error
value.trim(); // Error
value(); // Error
new value(); // Error
value[0][1]; // Error
```

​ 将 `value` 变量类型设置为 `unknown` 后，这些操作都不再被认为是类型正确的。通过改变 `any` 类型到 `unknown` 类型，我们的默认设置从允许一切翻转式的改变成了几乎什么都不允许。

​ 这是 `unknown` 类型的主要价值主张：TypeScript 不允许我们对类型为 `unknown` 的值执行任意操作。相反，我们必须首先执行某种类型检查以缩小我们正在使用的值的类型范围。

**缩小 `unknown` 类型范围**

​ 我们可以通过不同的方式将 `unknown` 类型缩小为更具体的类型范围，包括 `typeof` 运算符，`instanceof` 运算符和自定义类型保护函数。所有这些缩小类型范围的技术都有助于 TypeScript 的基于控制流的类型分析。

```typescript
function format1(value: any) {
  value.toFixed(2); // 不飘红，想干什么干什么，very dangerous
}

function format2(value: unknown) {
  value.toFixed(2); // 代码会飘红，阻止你这么做

  // 你需要收窄类型范围，例如：

  // 1、类型断言 —— 不飘红，但执行时可能错误
  (value as Number).toFixed(2);

  // 2、类型守卫 —— 不飘红，且确保正常执行
  if (typeof value === 'number') {
    // 推断出类型: number
    value.toFixed(2);
  }

  // 3、类型断言函数，抛出错误 —— 不飘红，且确保正常执行
  assertIsNumber(value);
  value.toFixed(2);
}

/** 类型断言函数，抛出错误 */
function assertIsNumber(arg: unknown): asserts arg is Number {
  if (!(arg instanceof Number)) {
    thrownewTypeError('Not a Number: ' + arg);
  }
}
```

**联合类型中的 `unknown` 类型**

在联合类型中，`unknown` 类型会吸收任何类型。这就意味着如果任一组成类型是 `unknown`，联合类型也会相当于 `unknown`：

```typescript
type UnionType1 = unknown | null; // unknown
type UnionType2 = unknown | undefined; // unknown
type UnionType3 = unknown | string; // unknown
type UnionType4 = unknown | number[]; // unknown
```

​ 这条规则的一个意外是 `any` 类型。如果至少一种组成类型是 `any`，联合类型会相当于 `any`：

```typescript
type UnionType5 = unknown | any; // any
```

**交叉类型中的 `unknown` 类型**

​ 在交叉类型中，任何类型都可以吸收 `unknown` 类型。这意味着将任何类型与 `unknown` 相交不会改变结果类型：

```typescript
type IntersectionType1 = unknown & null; // null
type IntersectionType2 = unknown & undefined; // undefined
type IntersectionType3 = unknown & string; // string
type IntersectionType4 = unknown & number[]; // number[]
type IntersectionType5 = unknown & any; // any
```

### 1.7、空值 void

​ 某种程度上来说，`void`类型像是与`any`类型相反，它表示没有任何类型。 当一个函数没有返回值时，你通常会见到其返回值类型是`void`：

```typescript
// 例1 因为函数返回值为undefined，因此为void类型
function warnUser(): void {
  alert('This is my warning message');
}

// 例2 // error TS2322: Type 'boolean' is not assignable to type 'void'.
// function demo():void{
//     return true
// }

// 例3
function test() {
  // return undefined
  return null;
}
```

​ 声明一个`void`类型的变量没有什么大用，因为你只能为它赋予`undefined`和`null`：

```typescript
let unusable: void = undefined;
```

### 1.8、 不存在的值 Never

​ `never`类型表示的是那些永不存在的值的类型。 例如，`never`类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型； 变量也可能是`never`类型，当它们被永不为真的类型保护所约束时。

​ `never`类型是任何类型的子类型，也可以赋值给任何类型；然而，*没有*类型是`never`的子类型或可以赋值给`never`类型（除了`never`本身之外）。 即使`any`也不可以赋值给`never`。

​ 下面是一些返回`never`类型的函数：

```typescript
// 返回never的函数必须存在无法达到的终点
function error(message: string): never {
  throw new Error(message);
}

// 推断的返回值类型为never
function fail() {
  return error('Something failed');
}

// 返回never的函数必须存在无法达到的终点
function infiniteLoop(): never {
  while (true) {}
}
```

### 1.9、对象 object

​ 在 TS 中，我们也可以通过 object 来限制某一值为对象，如下面这种用法：

```typescript
let a: object;
a = {};
a = Number;
a = Function;
```

​ 但是直接这么使用的情况很少，因为在 js 中万物皆对象，因此我们一般不会这么使用。最常用的方式是下面这种方法：

```typescript
let b: { name: string };
b = { name: '1' };
// b = {name:'2',age:12}//报错，结构必须一致，不然会报错
```

​ `{}`用来指定对象中可以包含哪些属性，语法规则为：`{属性名：属性值，属性名：属性值}`，但是注意了，结构必须一致，不能多出内容来，如上面多出的 age，则会报错。

​ 这明显满足不了我们开发中的一些需求，因此我们可以通过在属性名后加上`？`，表示属性是可选的。

```typescript
let c: { name: string; age?: number };
c = { name: 'z' };
c = { name: 'z', age: 1 };
c = { name: 'z', age: 1, sex: '女' }; //报错，同样的结构需一致，age可选可不选
```

​ 但是有的时候，我们只是想单独给对象中某一属性做限制，如对象中必须有 name，但是其他内容随意，这个时候我们该怎么办呢？

```typescript
let d: { name: string; [propName: string]: any }; //[propName:string]:any表示任意类型的值，当然这里的propName是任意取的
d = { name: 'z', age: 15, sex: '女' };
// d = {age:15}//报错，必须有name属性
```

### 1.10、数组 array

​TypeScript 像 JavaScript 一样可以操作数组元素。 有两种方式可以定义数组。 第一种，可以在元素类型后面接上`[]`，表示由此类型元素组成的一个数组：

```
let list: number[] = [1, 2, 3];
```

​ 第二种方式是使用数组泛型，`Array<元素类型>`：

```
let list: Array<number> = [1, 2, 3];
```

举例使用：

```typescript
// 例1
// const list:number[] = [1,2,3,4]
// list.push('3')//Argument of type 'string' is not assignable to parameter of type 'number'.

let list: Array<number> = [1, 2, 3];
list.push(5);
list.push('3'); //报错，Argument of type 'string' is not assignable to parameter of type 'number'.
```

**联合类型数组声明**

​ 前面我们介绍到了联合类型，当然在数组中，我们也能设置数组中的值为联合类型：
如：联合类型声明数组 (number | string)[ ]

```typescript
let arr3: (number | string)[];
// 表示定义了一个名称叫做arr3的数组, 这个数组中将来既可以存储数值类型的数据, 也可以存储字符串类型的数据
arr3 = [1, 'b', 2, 'c'];
// arr3 = [1, 'b', 2, 'c', false]; // 报错
console.log(arr3);
```

### 1.11、元组

​ 我们知道数组中元素的数据类型都一般是相同的（any[] 类型的数组可以不同），如果存储的元素数据类型不同，则需要使用元组。
​ 元组中允许存储不同类型的元素，元组可以作为参数传递给函数。
​ 简单的说：元组就是，一个数组可以存放不同的数据类型，比如，Sstring，Number，放在一起；这个数组就是元组，下面就详细的介绍一下这个元组：

**限定数据类型的数组，数组个数，每一个数据类型都必须一一对应(元组)，数组长度固定，每一项元素对应的数据类型固定 则使用元组。**

```typescript
let user: [string, number] = ['age', 20];
```

**但是注意：**

使用数组方法可以突破预先只能存储俩个数据的限制，但是推入的数组必须为声明时的数据类型,可以推出:
user.push(123)
user.push('hello')

​ 数组和元组在使用上的区别：数组一般用于保存相同类型元素集合，元祖可以存储不同类型元素集合。

例：

```typescript
let user: [string, number];
user = ['name', 20]; //这里必须保证值和长度和上面一致
// user = ['name',20,111] //报错，不可超长
// user = ['name','20']////报错，第二位需要为数字
user.push(123); //这样是可以push进去的,但是注意,user数组会默认成为string | number类型
console.log(user); //[ 'name', 20, 123 ]
// user.push({name:123})//类型“{ name: number; }”的参数不能赋给类型“string | number”的参数
```

### 1.12、枚举类型 enum

​ 枚举用于表示固定的几个取值,例如: 一年只有四季、人的性别只能是男或者女。
​ 枚举类型是 TS 为 JS 扩展的一种类型, 在原生的 JS 中是没有枚举类型的。

定义：

```typescript
enum Gender {
  Male,
  Femal,
}
console.log(Gender); //{ '0': 'Male', '1': 'Femal', Male: 0, Femal: 1 }
```

​ 我们可以看到，定义的 Gender 可以不给初始值，则会默认按照顺序给定 0 和 1。

​ 当然我们也可以自定义一些值：

```typescript
enum Demo {
  name = 'zjh',
  age = 18,
  sex = 'man',
}
console.log(Demo); //{ '18': 'age', name: 'zjh', age: 18, sex: 'man' }
```

​ **定义了一个名称叫做 val 的变量, 这个变量中只能保存 Male 或者 Femal。**

```typescript
let val: Gender;
// 定义了一个名称叫做val的变量, 这个变量中只能保存Male或者Femal
val = Gender.Male;
val = Gender.Femal;
// val = 'nan'; // 报错
// val  = false;// 报错

// 注意点: TS中的枚举底层实现的本质其实就是数值类型, 所以赋值一个数值不会报错
// val = 666; // 不会报错
// console.log(Gender.Male); // 0
// console.log(Gender.Femal);// 1

// 注意点: TS中的枚举类型的取值, 默认是从上至下从0开始递增的
//         虽然默认是从0开始递增的, 但是我们也可以手动的指定枚举的取值的值
// 注意点: 如果手动指定了前面枚举值的取值, 那么后面枚举值的取值会根据前面的值来递增
// console.log(Gender.Male); // 6
// console.log(Gender.Femal);// 7

// 注意点: 如果手动指定了后面枚举值的取值, 那么前面枚举值的取值不会受到影响
// console.log(Gender.Male); // 0
// console.log(Gender.Femal);// 6

// 注意点: 我们还可以同时修改多个枚举值的取值, 如果同时修改了多个, 那么修改的是什么最后就是什么
// console.log(Gender.Male); // 8
// console.log(Gender.Femal);// 6
```

```typescript
// 我们可以通过枚举值拿到它对应的数据
console.log(Gender.Male); // 0
// 我们还可以通过它对应的数据拿到它的枚举值
console.log(Gender[0]); // Male
```

## 2、类型别名 type

**类型别名用来给一个类型起个新名字**，使用 type 创建类型别名，类型别名常用于联合类型。

```typescript
type nameStr = string;
type nameArr = string[];
type nameType = nameStr | nameArr;
```

在实际应用中，有些类型名字比较长或者难以记忆，重新命名是一个较好的解决方案。

结合上面所了解到的联合类型，我们可以将自定义的字面量类型组合成一个新的联合类型：

```typescript
type Weekdays = 1 | 2 | 3 | 4 | 5;

let day: Weekdays = 1; // ok
day = 5; // ok
day = 6; // error: Type '6' is not assignable to type 'Weekdays'.
```

​ 这样我们还可能定义另一个变量，同样适用 Weekdays 类型，这样我们就不用重复定义了。
