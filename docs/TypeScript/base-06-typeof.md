---
group:
  title: TypeScript基础
order: 6
title: ts中的typeof

nav:
  title: TypeScript
  order: 1
---

## 1、介绍
typeof在Js中也是常用来判断变量类型的关键字，我们先回顾一下typeof在js中的使用：
```typescript
console.log(typeof undefined);//undefined
console.log(typeof null);//object
console.log(typeof true);//boolean
console.log(typeof 1);//number
console.log(typeof 'string');//string
console.log(typeof []);//object
console.log(typeof {});//object
console.log(typeof BigInt(1));//bigint
console.log(typeof Symbol(1));//symbol
console.log(typeof function a() {});//function
```
实际上ts也提供了typeof操作符。可以在【类型上下文】中进行类型查询。但是注意这里只能进行变量或者属性的查询。
### 1.1、typeof的类型保护与条件类型
typeof 运算符的真正强大之处在于它与条件类型的结合使用。通过将 typeof 与条件类型结合，我们可以在运行时对不同类型的代码进行条件分支。
举个例子：
比如我们想要实现一个函数，将传入的数字或者字符串类型的数据自增1并返回
```typescript
function test (num: number | string): number | string {
  return num++
}
//这时候ts报错，提示：An arithmetic operand must be of type 'any', 'number', 'bigint' or an enum type.
//意思是：算术操作数的类型必须是“any”、“number”、“bigint”或枚举类型
```
这个时候typeof就可以派上用场，改造如下：
```typescript
function test (num: number | string): number | string {
  if (typeof num === 'number') {
    return ++num;
  } else {
    return +num + 1;
  }
}
```
### 1.2、typeof解析类型
typeof 判断复杂类型时和js中的用法一样"object"、“function”、“symbol” 等等。
接下来我们看一下实际在开发中用的场景：

**①、例如我们有个对象，如果对象嵌套深或者对象属性较多时，那么就可以直接用tyoeof来获取这个对象的属性中的所有类型。**
```typescript
const person = {
  name: 'app',
  age: 20,
  sex: 'male',
  info: {
    name: 'app',
    age: 20,
    sex: 'male',
  },
};

type Person = typeof person;
function getNewPerson(person: Person) {
  return person;
}
getNewPerson(person);

```
上面例子中，typeof会去解析person，获取person所有数据的类型。因此生成的type Person为
```typescript
type Person = {
    name: string;
    age: number;
    sex: string;
    info: {
        name: string;
        age: number;
        sex: string;
    };
}
```
**②、也可以获取对象中单个属性的类型**
```typescript
type PersonName = typeof person.name //string
```
**③、当我想要通过函数创建并获取类的实例，那么就可以通过typeof获取到class构造函数的类型**
```typescript
class APP {
  name: string;
  img: string;
  constructor(name: string, img: string) {
    this.name = name;
    this.img = img;
  }
}
//(parameter) CP: new (name: string, img: string) => APP
function createApp(CP: typeof APP, name: string, img: string) {
  return new CP(name, img);
}

createApp(APP, '123', '123');

```
**④、typeof只能用来查询变量或者属性的类型。无法查询其他形式的类型。比如说返回调用的类型。**
```typescript
let p = {
  num1: 10,
  num2: 20,
};

function add(param: typeof p): number {
  return param.num1 + param.num2;
}

let sum:typeof add(4,8)//逗号运算符的左侧未使用，没有任何副作用。

```
## 2、举例说明
```typescript
export interface RemoteSearchOptions {
  /** 输入防抖延迟，默认为 200（单位 ms） */
  debounceTime?: number;
  /** 下拉框模式，默认为 `'single'`，与多选下拉框一起使用时，需要将该选项设置为 `'multiple'` */
  mode?: 'single' | 'multiple';
  /** 远程搜索关联 Field 对象 */
  /** 根据 value 获取相应 label 的异步函数 */
  fetchLabel?: (value: any) => Promise<any>;
  /** value 发生变化时，是否自动清空搜索关键字 */
  resetSearchWhenValueChange?: boolean;
  /** 调试名称。无实际作用，仅用于调试 */
  name?: string;
}
declare type DataSource = Array<{
  label: string;
  value: string;
}>;
/**
 * 远程搜索辅助函数，用于简化 Select 远程搜索的实现.
 *
 * 目前支持以下特性：
 * - 搜索防抖： 默认为 200ms，可通过 options.debounceTime 进行调整
 * - label 缓存： 当 value 动态发生变化时，优先使用内部缓存的 label，并在必要时按需获取 label
 *   （需要配置 options.field & options.fetchLabel）
 * - loading 状态： dataSource 加载过程中，自动设置 state='loading'
 * - 多选：支持多选模式下的远程搜索
 * */
export declare class RemoteSearch {
  readonly search: (keyword: string) => Promise<DataSource>;
  private static _globalCount;
  readonly name: string;
  _isFetchingLabel: boolean;
  _searchValue: string;
  _debouncedSearchValue: string;
  private readonly options;
  /** 所有 value -> item 的缓存 */
  private readonly _itemCache;
  /** 根据搜索获取的数据源 */
  private readonly _dataSourceFromSearch$;
  private _debounceHandle;
  private readonly _disposers;
  get mode(): 'multiple' | 'single';
  constructor(search: (keyword: string) => Promise<DataSource>, options?: RemoteSearchOptions);
  dispose(): void;
  addDataSource(items: DataSource): void;
  getLabel(key: string): string;
  getItem(key: string): {
    label: string;
    value: string;
  };
  invalidateCache(): void;
  get dataSource(): DataSource;
  setSearchValue: (nextSearchValue: string, debounce?: boolean) => void;
  get selectProps(): {
    mode: 'multiple' | 'single';
    showSearch: boolean;
    filterLocal: boolean;
    searchValue: string;
    onSearch: (nextSearchValue: string, debounce?: boolean) => void;
    dataSource: DataSource;
    state: string;
  };
}

```
```typescript
import { AsyncValue, RemoteSearch } from '@alife/hippo-xform';
export function useRemoteSearch(...args: ConstructorParameters<typeof RemoteSearch>) {
  const [remoteSearch] = useState(() => new RemoteSearch(...args));

  useEffect(() => {
    return () => {
      remoteSearch.dispose();
    };
  }, []);

  return remoteSearch;
}
```
我们这里的类型用typeof来解析@alife/hippo-xform库中设置的RemoteSearch类。因为这里组件库并没有单独定义一个接口供用户使用，而是直接使用的类，这种情况下我们就只能使用typeof解析该抛出的类。
