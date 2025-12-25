---
group:
  title: TypeScript基础
order: 5
title: 枚举enum

nav:
  title: TypeScript
  order: 1
---

## 1、介绍

枚举: 枚举的意思就是一一列举, 把所有情况都列举出来, 那么取值的时候, 只有这几个可以使用, 其他的都不行，计算机语言里面的枚举( enumerations ) : 把所有的常量放在一个集合内, 让若干个常量变成一组有关联的内容。
在之前的 js 中，我们一般创建枚举的方式是通过创建对象或者字面量的方式来创建一个枚举:

```typescript
export const NUMBER_MAP = {
  0: '一',
  1: '二',
  2: '三',
};
export const platFormCode = 'wdk_market_interactive';
```

而在 ts 中，我们则是通过 enum 关键字定义一个枚举。比如这里有一个业务，我们需要上下左右的四个属性，我们可能就会直接这样使用联合类型，但是当数据多的时候就会很难维护。

```typescript
const UP = 'up';
const RIGHT = 'right';
const DOWN = 'down';
const LEFT = 'left';
```

```typescript
function getDir(dir: 'up' | 'right' | 'down' | 'left') {
  return dir;
}
getDir('up');
```

在 TS 中, 我们可以利用 enum 关键字创建一个枚举集合, 把上面需要的四个常量放进去：

```typescript
enum Direction {
  UP = 'up',
  RIGHT = 'right',
  DOWN = 'down',
  LEFT = 'left',
}
function getDirection(dir: Direction) {
  return dir;
}
getDirection(Direction.UP);
```

这就约定了, dir 这个参数的值只能是 Direction 这个枚举集合里面的常量, 其他都不行。

## 2、数字枚举

数字枚举 : 枚举类型中的每一个常量都是数字，在 TS 中, 枚举内的每一个常量, 当不设置值的时候, 默认就是 number 类型。

```typescript
enum NumberObj {
  ZERO, //0
  ONE, //1
  TWO, //2
  THREE, //3
}
```

在枚举内的常量, 第一个默认值是 0, 后面的依次 +1 递增，此时。

```typescript
NumberObj.ZERO === 0;
NumberObj.ONE === 1;
NumberObj.TWO === 2;
NumberObj.THREE === 3;
```

我们也可以自己指定值:

```typescript
enum NumberObj1 {
  TEN = 10,
  TWENTY = 20,
  THIRTY = 30,
}
```

这个时候枚举集合内的常量就是我们指定好的值，我们也可以指定部分值。

```typescript
enum NumberObj2 {
  TEN = 10,
  ELEVEN, //11
  TWELVE, //12
  THIRTEEN, //13
}
```

指定常量后面的未指定常量, 就会按照 +1 的规则一次递增。

```typescript
enum Pages {
  ONE, // 0
  TWO = 10, // 10
  THREE, // 11
}
enum Pages1 {
  ONE, // 0
  TWO = 10, // 10
  THREE, // 11
  FOUR = 30, // 30
  FIVE, // 31
}
```

## 3、字符串枚举

字符串枚举 : 枚举集合中的每一个常量的值都是 string 类型，在 TS 内, 必须要指定一个值, 才可能会出现 string 类型。

```typescript
enum Direction {
  UP = 'up',
  RIGHT = 'right',
  DOWN = 'down',
  LEFT = 'left',
}
```

在 TS 中, 枚举常量和任何内容都是不一样的, 包括原始字符串

```typescript
function util(dir: DirectionDemo) {}
util(DirectionDemo.UP);
util('up'); //类型“"up"”的参数不能赋给类型“DirectionDemo”的参数。
```

这是因为, 在 TS 中, 枚举内的每一个常量都是一个独一无二的值，所以当用枚举去限定一个数据的时候, 用的时候也只能用枚举内的值，这样也避免因为手误出现的单词错误。

## 4、异构枚举

异构枚举 : 其实就是在一个枚举集合内同时混合了数字枚举和字符串枚举，但是大概率是不会这样使用的, 因为我们作为一组数据的集合, 一般不会把数字和字符串混合在一起使用。

```typescript
enum Info {
  ONE,
  UP = 'up',
  TWO = 2,
  ThREE,
  LEFT = 'left',
  Five, //枚举成员必须具有初始化表达式。
}
Info.ONE === 0;
Info.ThREE === 3;
```

在这里有一个点需要注意，因为在枚举集合内, 当某一个 key 没有设置值的时候, 会默认按照上一个的值 +1，所以如果前一个是 **字符串枚举, 那么下一个必须要手动赋值, 不然会报错**，如果前一个是 数字枚举, 那么下一个可以不必要手动赋值, 会按照上一个 +1 计算。

## 5、枚举合并

在 TS 内的枚举, 是支持合并的，多个枚举类型可以分开书写, 会在编译的时候自动合并。

```typescript
enum PERSON {
  NAME,
  AGE,
}

enum PERSON {
  LIKE = 'study ts',
  TEST = 1,
  // AGE  标识符“AGE”重复。
}
```

这里定义的两个枚举都叫做 PERSON, 会在编译的时候自动放在一起, 不会出现冲突。这里即使 AGE 和 TEST 都是指代的 1，但是是不会报错的，而如果另外一个里面有重复的 AGE，则会报错。

## 6、反向映射

TS 内的数字枚举, 在编译的时候, 会同时将 key 和 value 分别颠倒编译一次。

```typescript
enum Page {
  ONE, // 0
  TWO, // 1
  THREE, // 2
}
```

我们将对应的代码编译成 js 代码则为：

```typescript
/*
 * enum 反向映射
 */
var Page;
(function (Page) {
  Page[(Page['ONE'] = 0)] = 'ONE';
  Page[(Page['TWO'] = 1)] = 'TWO';
  Page[(Page['THREE'] = 2)] = 'THREE'; // 2
})(Page || (Page = {}));
```

在我们编辑完成的 js 文件中打印 Page，并使用 node 运行一下该 js 文件，输出为：

```typescript
console.log(Page)
{
  '0': 'ONE',
  '1': 'TWO',
  '2': 'THREE',
  ONE: 0,
  TWO: 1,
  THREE: 2
}
```

也就是说, 我们在 TS 内使用的时候, 如果是数字枚举，那么我们可以通过 key 得到对应的数字, 也可以通过对应的数字得到对应的 key。

```typescript
enum Pages {
  ONE, // 0
  TWO, // 1
  THREE, // 2
}

console.log(Pages.ONE); // 0
console.log(Pages.TWO); // 1
console.log(Pages.THREE); // 2
console.log(Pages[0]); // 'ONE'
console.log(Pages[1]); // 'TWO'
console.log(Pages[2]); // 'THREE'
```

注意这里只针对数字枚举，针对 string 是不生效的。

```typescript
enum Page {
  ONE, // 0
  TWO, // 1
  THREE, // 2
  STRING = 'string',
}
```

```typescript
var Page;
(function (Page) {
  Page[(Page['ONE'] = 0)] = 'ONE';
  Page[(Page['TWO'] = 1)] = 'TWO';
  Page[(Page['THREE'] = 2)] = 'THREE';
  Page['STRING'] = 'string';
})(Page || (Page = {}));

console.log(Page);
/*
{
  '0': 'ONE',
  '1': 'TWO',
  '2': 'THREE',
  ONE: 0,
  TWO: 1,
  THREE: 2,
  STRING: 'string'
}
*/
```

## 7、常量枚举

常量枚举, 是在枚举的基础上再加上 const 关键字来修饰，会在编译的时候, 把枚举内容删除, 只保留编译结果，并且对于数字枚举来说, 不在支持反向映射能力, 只能利用 key 来访问，非常量枚举。

```typescript
const enum Demos {
  ONE, // 0
  TWO, // 1
  THREE, // 2
}

console.log(Demos.ONE);
console.log(Demos.TWO);
console.log(Demos.THREE);
```

```typescript
/*
 * enum 常量枚举
 */
const enum Demos {
  ONE, // 0
  TWO, // 1
  THREE, // 2
}
console.log(1111);
```

```typescript
console.log(1111);
```

可以看到使用了 const 的 enum，会在编译的时候, 把枚举内容删除。

## 8、实际应用

如下是我们在 hema 工作的时候的 ts 定义，这里创建了一个枚举 TARGET_TYPE，然后通过 namespace 的方式创建一个获取转译的方法 getText 以及获取枚举组成的 dataSource 的数据。

```typescript
export enum TARGET_TYPE {
  /** 店均MAC */
  AVG_MAC = 'avgMac',

  /** 会员月度跃迁规模 */
  MONTHLY_MIGRATION_MEMBERS = 'monthlyMigrationMembers',

  /** 未指定 */
  NOT_DEFINE = 'not_define',
}

export namespace TARGET_TYPE {
  export const text: { [key in TARGET_TYPE]: string } = {
    [TARGET_TYPE.AVG_MAC]: '店均MAC',
    [TARGET_TYPE.MONTHLY_MIGRATION_MEMBERS]: '会员月度跃迁规模',
    [TARGET_TYPE.NOT_DEFINE]: '未指定',
  };

  export function getText(type: TARGET_TYPE) {
    if (type && TARGET_TYPE.text[type]) {
      return TARGET_TYPE.text[type];
    }
    return type;
  }

  export const dataSource = [TARGET_TYPE.AVG_MAC, TARGET_TYPE.MONTHLY_MIGRATION_MEMBERS].map(
    (value) => ({
      value,
      label: TARGET_TYPE.getText(value),
    })
  );
}
```

这样我们在页面中就可以直接导入后使用：

```typescript
import { TARGET_TYPE } from '@common/enum';
<FormItem
  label="指标"
  name="targetType"
  component="input"
  value={TARGET_TYPE.getText(plan?.targetType)}
/>;
```
