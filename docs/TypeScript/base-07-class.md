---
group:
  title: TypeScript基础
order: 7
title: ts中的class类

nav:
  title: TypeScript
  order: 1
---

## 1、介绍

class 可以用来做数据的存储和回显，能够将页面的数据分离出来并提取到 class 内，函数也可以抽离到 class，实例化 class 进行调用。ts 中的 class 类与 js 的 class 类基本相同，不同点在于 ts 的 class 有数据类型约束，在使用 class 的时候，必须遵守定义数据类型约束，class 中有一个 constructor，它可以更改 class 的属性，实例化 class 进行传值的时候，传入的值也必须符合 constructor 参数的类型规定。

**基本使用：**

```typescript
class ZhangSan {
  //声明初始值，可省略类型注释，ts推论为string
  name: 'zhansan';
  // 声明成员类型为number没有初始值
  age: number;
}
```

**构造函数：**

同样的我们也可以写构造函数。在 class 构造函数中，需要为构造函数指定类型注解，否则会被隐式推断为 any，构造函数不需要返回值类型。

```typescript
class Lisi {
  name: 'lisi';
  age: number;
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}
const lisi1 = new Lisi(1, 2);
console.log(lisi1, 'lisi1'); //Lisi { name: 1, age: 2 } lisi1
```

如上的例子中，我们在 constructor 没有给 name 和 age 设置类型所以默认为 any，因此后续创建 list1 实例是不会报错的。

但是如果我们给 name 设置为 string 则会报错，因为在 List 中我们设置 name 为 lisi，因此 constructor 中 name 的类型只能为具体的字符串'lisi'。

```typescript
class Lisi {
  name: 'lisi';
  age: number;
  constructor(name: string, age: number) {
    this.name = name; //不能将类型“string”分配给类型“"lisi"”。
    this.age = age;
  }
}
const lisi1 = new Lisi('lisi', 2);
console.log(lisi1, 'lisi1'); //Lisi { name: 'lisi', age: 2 } lisi1
```

## 2、class 继承

在 ts 中 class 类的继承有两种方式：

> - extend 继承父类
> - implements 实现接口

**在 js 中 class 的继承只有 extend，而 implements 则是 TS 提供的。**

```typescript
/*
 *extends方法
 */
class Animail {
  move() {
    console.log('moving');
  }
}

// 子类Dog继承父类Animal，则Dog的实例对象dog就同时具有了父类
class Dog extends Animail {
  name: 'dog';
  bark() {
    console.log('dog bark');
  }
}

const dog = new Dog();
dog.move();
dog.bark();
```

```typescript
/*
 *implements方法
 */
interface Singable {
  name: string;
  sing: () => void;
}
// Person类实现接口Singable就必须提供Singble接口中指定的方法和属性
class Person implements Singable {
  name = '张三';
  sing() {
    console.log('开始黄牛叫了......');
  }
}
```

## 3、class 类成员的修饰符

| public    | 公共的，在子类和类定义外部都可以使用                       |
| --------- | ---------------------------------------------------------- |
| protected | 在子类中可以访问，在类定义外部无法访问                     |
| private   | 私有的，只能在类的内部进行使用，类的外部和子类中都无法访问 |
| readonly  | 定义只读属性                                               |

### 3.1、public 公有的

> - public 表示公共、公有的，公有成员可以被任何地方访问
> - public: 是默认可见性，所以可以直接少略

```typescript
/*
 *  public
 */
class Demo {
  public name: 'demo'; //不写默认就为public
  public doing() {
    console.log('i am doing');
  }
}
class DemoSon extends Demo {
  myName: 'demoSon';
}
const demo = new DemoSon();
console.log(demo.name);
console.log(demo.myName);
console.log(demo.doing());
```

### 3.2、protected 受保护的

表示受保护的，仅对其所在类和子类中（非实例对象）可见。在子类的方法内部可以通过 this 来访问父类中受保护的成员，但是对实例不可见。

```typescript
/*
 *  protected
 */

class Test {
  name: 'test';
  protected age: 5;
  protected say() {
    console.log('i am say');
  }
  getSay() {
    //内部可以调用protected定义的方法
    this.say();
  }
}

class TestSon extends Test {
  getTestSay() {
    //继承的TestSon中也可以获取到父集中protected定义的方法和属性
    this.say();
    this.getSay();
  }
}

const newTest = new TestSon();
console.log(newTest.getTestSay); //newTest实例上就这三个属性or方法
console.log(newTest.name);
console.log(newTest.getSay);
```

### 3.3、private 私有的

表示私有的，只在当前类中可见，对实例对象以及子类也是不可见的。

```typescript
/*
 *  private
 */

class privateDemo {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }
  public showName() {
    console.log(this.name);
  }
}

class privateDemoSon extends privateDemo {
  // name:'demo'//类“privateDemoSon”错误扩展基类“privateDemo”。属性“name”在类型“privateDemo”中是私有属性，但在类型“privateDemoSon”中不是。
  showName() {
    super.showName();
  }
}

const test = new privateDemoSon('demo');
test.name; //属性“name”为私有属性，只能在类“privateDemo”中访问。
test.showName; //只有这一个方法是对外的
```

### 3.4、readonly 只读

readonly 表示只读，用来防止在构造函数之外对属性进行赋值。

```typescript
/*
 * readonly
 */

class readOnlyDemo {
  // 注意，只要使用了readonly修饰符，必须手动明确属性，否则就是字面量类型
  readonly name: string = 'readonly';
  constructor(name) {
    this.name = name;
  }
  // readonly getName(){ //"readonly" 修饰符仅可出现在属性声明或索引签名中。
  //   console.log(this.name)
  // }
  // setName(){
  //   this.name ='setName';//无法为“name”赋值，因为它是只读属性。
  // }
}

class readOnlyDemoSon extends readOnlyDemo {
  name: string = 'readOnlyDemoSon';
  setName() {
    this.name = 'changeName';
    console.log(this.name, 'this.name'); //changeName
  }
}
const demo = new readOnlyDemoSon('readOnlyDemoSon');
console.log(demo.name, 'demo.name'); //readOnlyDemoSon
console.log(demo.setName()); //undefined
```

在接口和{}表示的对象类型中，也可以使用 readonly 。

```typescript
interface IReadOnlyDemo {
  readonly name: string;
}
let readonlyDemo: IReadOnlyDemo = {
  name: 'readonlyDemo',
};
readOnlyDemo.name = 'demo'; //无法为“name”赋值，因为它是只读属性。
```
