---
group:
  title: TypeScript基础
order: 4
title: type和interface介绍

nav:
  title: TypeScript
  order: 1
---

## 1、type(类型别名)介绍

type：类型别名用来给一个类型起个新名字，可以多次使用同一个类型并用一个名称。
使用场景：当同一类型（复杂）被多次使用时，可以通过类型别名，简化该类型的使用。
类型别名不仅可以用来表示基本类型，还可以用来**表示对象类型、联合类型、元组和交集**。

```typescript
// 改造前
const arr1: (number | string)[] = [1, 2, 'a', 'b'];
const arr2: (number | string)[] = [3, 4, 'c', 'd', 'e'];

// 改造后
type StringAndNumberList = (number | string)[];
const arr3: StringAndNumberList = [1, 2, 'a', 'b'];
const arr4: StringAndNumberList = [3, 4, 'c', 'd', 'e'];
```

```typescript
// type类型别名语法：
// 1.使用type关键字来创建类型别名。
// 2.类型别名可以是任意合法的变量名称
type Point = {
  x: number;
  y: number;
};
// 创建类型别名后，直接使用类型别名作为类型的注释即可。
function getPoint(pt: Point) {
  return { x: -pt.x, y: -pt.y };
}
getPoint({ x: 1, y: 2 });
```

可以使用类型别名为任何类型命名，而不仅仅是对象类型，常用于联合类型。

```typescript
type test = number; //基本类型
let num: test = 10;
type userOjb = { name: string }; // 对象
type getName = () => string; // 函数
type data = [number, string]; // 元组
type numOrFun = number | getName; // 联合类型
```

### 1.1、type 定义的类型继承

使用 type 定义的类型其实是对后面的变量取的一个别名，也就是说他并没真正意义上的继承，如果确实要对 type 定义的数据进行继承的话可以使用 & 来进行复用继承（两个对象里面的属性进行交叉）。

```typescript
/* type继承 */
type Product = {
  title: string;
  price: number;
};

// 不是继承，只是把两个代码进行混合在一起取了一个别名
type Tshirt = Product & {
  size: 'S' | 'L' | 'M';
};

let product: Tshirt = {
  title: '牛仔裤',
  price: 100,
  size: 'M',
};
```

> 使用 & 来进行复用继承，并没有真正意义上的继承，只是把他们两个代码进行了混合然后重新取了一个别名。

## 2、interface(接口)介绍

在 TypeScript 中，我们可以使用接口（interface）来描述对象的结构，包括对象的属性和方法。**接口也可以用于描述对象的索引类型和通过索引获取的值的类型**。
接口是命名数据结构（例如对象）的另一种方式；**与 type 不同，interface 仅限于描述对象类型**。

### 2.1、描述索引的类型

当我们一个对象能通过特定类型的键来访问相应类型的值时，我们可以使用索引类型。通过在接口中定义索引签名，我们可以指定键的类型和对应值的类型。例如：

```typescript
interface Dictionary {
  [key: string]: number;
}
```

在这个例子中，我们定义了一个接口 Dictionary，它具有字符串类型的键和相应的数字类型的值。

### 2.2、通过索引获取的值的类型

当我们使用索引访问对象的属性时，TypeScript 会根据索引签名定义的类型来确定获取的值的类型。例如：

```typescript
const myDictionary: Dictionary = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
};

const value = myDictionary.TWO; //value在鼠标悬浮的时候会自动显示为number类型
```

在这个例子中，myDictionary对象的键是字符串，值是数字。当我们通过索引获取键为TWO的值时，TypeScript 知道该值的类型为number，因为我们在Dictionary接口中定义了索引签名。

通过接口描述索引的类型和通过索引获取的值的类型，可以使我们在编写代码时更加安全和可靠，因为 TypeScript 会进行类型检查，确保我们使用正确的键和值类型。

```typescript
interface RoleDic {
  [id: number]: string;
}
const role1: RoleDic = {
  0: 'super_admin',
  1: 'admin',
};
const role2: RoleDic = {
  s: 'super_admin', // error 不能将类型"{ s: string; a: string; }"分配给类型"RoleDic"。
  a: 'admin',
};
const role3: RoleDic = ['super_admin', 'admin'];
```

在这个示例中，我们使用了索引签名（Index Signature）来定义了一个接口 RoleDic。索引签名允许我们定义对象或数组的索引的类型和相应的值的类型。
在 RoleDic 接口中，我们使用了数字索引签名，即[id: number]: string;，这表示该接口允许使用数字作为索引，并且索引对应的值的类型必须是字符串。
然后，我们创建了三个变量 role1、role2 和 role3，它们都是 RoleDic 接口的实例。

> - role1 使用了数字索引，符合 RoleDic 接口的定义，因此没有问题。
> - role2 使用了非数字索引（'s'和'a'），它的类型不符合 RoleDic 接口的定义，所以会产生类型错误。
> - role3 是一个数组，它的索引是数字，符合 RoleDic 接口的定义，因此也是合法的。

### 2.3、接口继承 extends

接口的继承是 TypeScript 中一种非常有用的特性，它允许一个接口（子接口）继承另一个接口（父接口）的成员，从而在子接口中拥有父接口的所有属性和方法，同时还可以在子接口中添加新的属性和方法。
通过继承，子接口可以复用父接口的定义，避免了重复书写相似的结构。这样做不仅提高了代码的可读性和可维护性，还能更好地表示对象之间的关系。

```typescript
// 父接口
interface Shape {
  color: string;
}
// 子接口继承父接口
interface Circle extends Shape {
  radius: number;
}
// 子接口可以拥有父接口的属性和方法
const circle: Circle = {
  color: 'red',
  radius: 10,
};
```

在这个例子中，Circle 接口继承了 Shape 接口，因此 Circle 接口拥有了 color 属性。当我们创建一个 Circle 类型的对象时，它必须包含 color 和 radius 属性，符合 Circle 接口的定义。
**接口的继承使得代码更具有结构和可读性，能够更好地表示对象之间的关系，并提供了类型安全性，确保了实例的结构与接口定义的要求相符。**
同时，在 TypeScript 中，一个接口可以继承多个接口，允许将多个接口的成员合并到一个接口中。这样，新接口就拥有了所有被继承接口的属性和方法。

```typescript
interface Vegetables {
  color: string;
}
interface Food {
  type: string;
}
interface Tomato extends Food, Vegetables {
  radius: number;
}
const tomato: Tomato = {
  type: 'vegetables',
  color: 'red',
  radius: 1.2,
}; // 在定义tomato变量时将继承过来的color和type属性同时声明
```

在给定的例子中，有三个接口：Vegetables，Food，和 Tomato。Tomato 接口继承了 Food 和 Vegetables 接口，因此它拥有了这两个接口中定义的所有属性。 Tomato 接口包含了 type（从 Food 继承）和 color（从 Vegetables 继承）属性，以及它自己定义的 radius 属性。

### 2.4、方法和属性继承 implements

实现，一个新的类，从父类或者接口实现所有的属性和方法，同时可以重写属性和方法，包含一些新的功能
一个类通过关键字 implements 声明自己使用一个或者多个接口。
在 js 中，一个 class 只能继承自另一个 class，若其他类中的方法与属性也想继承，则很麻烦。而在 ts 中可以使用 implements 来实现一些类共有方法属性的提取。

```typescript
interface IPerson {
  age: number;
  name: string;
  sex?: string;
}
class User implements IPerson {
  // 类实现接口
  age: number;
  name: string;
  // sex:number   //类型“User”中的属性“sex”不可分配给基类型“IPerson”中的同一属性。不能将类型“number”分配给类型“string”。
}
```

如上面的例子中，我们写 User implements 自 IPerson，那么 User 中就必须有 IPerson 中必须有的属性，如上 demo 中是不会报错的，但是如果 User 中没有 age 或 name 属性，就会报错。而且 age 和 name 的类型必须和 IPerson 中的属性类型必须一致。

```typescript
interface Person {
  money: number;
}
//implements是对某个接口的实现，必须满足接口的类型规范
class Father implements Person {
  public money: number = 1000;
}
```

implements，实现父类，子类不可以覆盖父类的方法或者变量。即使子类定义与父类相同的变量或者函数，也会被父类取代掉。  
 这两种实现的具体使用，是要看项目的实际情况，需要实现，不可以修改 implements，只定义接口需要具体实现，或者可以被修改扩展性好，用 extends。

### 2.5、混合类型接口

在 TypeScript 中，混合类型接口（Hybrid Types）是指一个接口可以描述一个对象具有多种类型的能力，即可以同时具有函数和属性的特征。
意味着一个对象可以被当作函数来调用，同时也可以包含其他属性和方法。
一个常见的例子是实现一个计数器，既可以被当作函数来调用，又可以包含一个属性来保存计数状态。在混合类型接口中，我们可以定义一个函数的签名以及属性的结构。

```typescript
interface Counter {
  (): void; // 函数签名，表示这个接口可以被调用
  count: number; // 属性，表示这个接口包含一个名为count的属性，类型为number
}

function getCounter(): Counter {
  const c = () => {
    c.count++;
  };
  c.count = 0;
  return c;
}

const counter: Counter = getCounter();
counter(); // 调用函数，递增count属性
console.log(counter.count); // 输出 1
counter(); // 调用函数，再次递增count属性
console.log(counter.count); // 输出 2
```

在这个例子中，Counter 接口同时描述了一个可以被调用的函数和一个具有 count 属性的对象。getCounter 函数返回了一个满足 Counter 接口定义的对象，该对象既可以被当作函数来调用，也可以访问 count 属性。

## 3、type 和 interface 的区别

在 TypeScript 中，interface 和 type 是用来定义对象类型的关键字，它们有一些区别和不同的使用场景。

**定义方式：**

- interface：使用 interface 关键字进行定义，可以通过扩展或合并其他接口。
- type：使用 type 关键字进行定义，可以通过联合类型、交叉类型、索引类型等进行更复杂的类型操作。

**合并能力：**

- interface：可以通过声明合并来扩展其他同名的接口，将相同名称的成员进行合并。**当 interface 接口重名, 后面的属性会追加到接口里面去** 。
- type：无法进行合并，如果定义了同名的 type，则会产生命名冲突错误。

**表达能力：**

- interface：主要用于描述对象的形状（属性和方法），也可以用于描述函数类型。
- type：可以描述更复杂的类型，包括联合类型（|）、交叉类型（&）、类型别名和条件类型等，更加灵活和强大。

**兼容性：**

- interface：在接口之间存在逆变和协变的关系，即一个接口可以被赋值给另一个更宽泛或更特定的接口。
- type：在类型之间不存在逆变和协变的关系，即它们是完全互斥的，不能相互赋值。

**在选择使用 interface 还是 type 时，可以根据具体情况和需求做出决策：**

> - 如果需要描述对象的形状以及函数类型，或者需要进行合并扩展其他接口，通常使用 interface。
> - 如果需要描述更复杂的类型，如联合类型、交叉类型等，并且不需要进行合并操作，或者需要使用类型别名（Type Aliases），则可以使用 type。

需要注意的是，interface 和 type 并不是完全互斥的，它们可以在一定程度上互补使用，具体使用哪个关键字取决于具体需求和项目团队的约定。

### 3.1、type 优势

#### 1、定义基本类型别名

type 可以定义基本类型别名, 但是 interface 无法定义,如：

```typescript
type userName = string;
type stuNo = number;
```

#### 2、声明联合类型

type 可以声明联合类型, 例如：

```typescript
type Student = { stuNo: number } | { classId: number };
```

#### 3、声明元组

type 可以声明 元组类型：

```typescript
type Data = [number, string];
```

#### 4、索引签名问题

如果经常使用 TypeScript, 一定遇到过相似的错误：

```typescript
Type 'xxx' is not assignable to type 'yyy'
Index signature is missing in type 'xxx'.
```

看个例子来理解问题：

```typescript
interface propType {
  [key: string]: string;
}

let props: propType;

type dataType = {
  title: string;
};
interface dataType1 {
  title: string;
}
const data: dataType = { title: '订单页面' };
const data1: dataType1 = { title: '订单页面' };
props = data;
// Error:类型“dataType1”不可分配给类型“propType”; 类型“dataType1”中缺少索引签名
props = data1;
```

原因：由于 interface 可以进行声明合并，所以总有可能将新成员添加到同一个 interface 定义的类型上，也就是说 interface 定义的类型是不确定的；而 type 一旦声明类型，就无法更改它们。因此，索引签名是已知的。

#### 5、type 支持使用 in 关键字去遍历成映射类型

```typescript
type names = 'firstName' | 'lastName' | 'AKA';
type nameType = {
  [key in names]: string;
};
/*
    真实的 nameType 类型
    {
        firstName: string
        lastName: string
        AKA: string
    }
*/
```

### 3.2、interface 优势

#### 1、声明合并

如果多次声明一个同名的接口，TypeScript 会将它们合并到一个声明中，并将它们视为一个接口。这称为声明合并， 例如：

```typescript
interface Person {
  name: string;
}
interface Person {
  age: number;
}

let user: Person = {
  name: 'Tolu',
  age: 0,
};
```

这种情况下，如果是 type 的话，重复使用 Person 是会报错的：

```typescript

type Person { name: string };

// Error: 标识符“Person”重复。ts(2300)
type Person { age: number }
```

#### 2、对于 ES6 模块化语法的默认导出语法

interface 支持声明的同时进行默认导出：

```typescript
export default interface User {
  name: string;
  age: number;
}
```

type 必须先声明, 在默认导出：

```typescript
type User = {
  name: string;
  age: number;
};
export default User;
```

必须要先声明好, 在进行默认导出, 如果直接连写默认导出, 会报错。

## 4、总结

- 官方推荐用 interface，其他无法满足需求的情况下用 type。
- 但联合类型 和 交叉类型 是很常用的，所以避免不了大量使用 type 的场景，一些复杂类型也需要通过组装后形成类型别名来使用。
- 所以，如果想保持代码统一，还是可选择使用 type。通过上面的对比，类型别名 其实可涵盖 interface 的大部分场景。
- 编写三方库时使用 interface，其更加灵活自动的类型合并可应对未知的复杂使用场景。
