---
order: 3
title: tsconfig.json配置

nav:
  title: TypeScript
  order: 5
---

## 1、介绍

tsconfig.json 文件是 TypeScript 项目的配置文件，我们可以在我们的项目中使用 tsc --init 命令创建 tsconfig.json 文件，该包含了编译器的配置选项。常用的配置属性如下：

```
compilerOptions: 编译器的选项，如语言版本、目标 JavaScript 版本、生成的 sourcemap 等。
include: 指定需要编译的文件路径或文件夹路径。
exclude: 指定不需要编译的文件路径或文件夹路径。
files: 指定需要编译的文件列表。
extends: 指定继承自另一个 tsconfig.json 文件。
compileOnSave : 指定是否在保存时编译文件。
buildOnSave: 指定是否在保存时编译文件。
target：编译目标 JavaScript 版本，可以是 "ES3"，"ES5" 或 "ES2015" 等。
module：指定模块系统，可以是 "CommonJS"，"AMD" 或 "System" 等。
sourceMap：是否生成 sourcemap 文件。
outDir：编译输出目录。
rootDir：设置项目的根目录。
strict：是否开启严格类型检查。
noImplicitAny：是否禁止隐式 any 类型。
lib：指定要包含在编译中的库文件，如 "es2015"。
paths: 指定模块路径别名。
baseUrl: 指定基础目录。
jsx: 指定 JSX 的处理方式。
allowJs: 是否允许编译 JavaScript 文件。
checkJs: 是否检查 JavaScript 文件。
declaration: 是否生成声明文件。
declarationMap: 是否生成声明文件的 sourcemap。
emitDecoratorMetadata: 是否支持装饰器。
experimentalDecorators: 是否支持实验性装饰器。
listEmittedFiles: 是否列出所有输出的文件。
listFiles: 是否列出所有编译过的文件。
locale: 指定本地化语言。
mapRoot: 指定 sourcemap 文件的根目录。
moduleResolution: 指定模块解析策略。
noEmit: 是否禁止输出 JavaScript 代码。
noEmitHelpers: 是否禁止输出辅助函数。
noEmitOnError: 是否在发生错误时禁止输出 JavaScript 代码。
noImplicitReturns: 是否禁止隐式返回。
noUnusedLocals: 是否检查未使用的局部变量。
noUnusedParameters: 是否检查未使用的参数。
preserveConstEnums: 是否保留 const 枚举。
pretty: 是否格式化输出的 JavaScript 代码。
removeComments: 是否移除注释。
skipLibCheck: 是否跳过检查库文件。
sourceRoot: 指定源文件的根目录。
suppressExcessPropertyErrors: 是否禁止过多属性错误。
suppressImplicitAnyIndexErrors: 是否禁止隐式 any 类型索引错误。
typeRoots: 指定类型声明文件的根目录。
types: 指定需要包含在编译中的类型声明文件。
watch: 是否监视文件变化并重新编译。
```

## 2、简单通过例子介绍 tsconfig.json 中的一些配置

### 2.1、target

用于指定 TS 编译完之后的版本目标。

```json
{
  "compilerOptions": {
    /* 这里除了可以使用es5,es6等写法之外，还可以使用es2016，es2017等格式 */
    "target": "ES5"
    // "noEmitOnError": true,
  },
  "include": ["src/**/*"]
}
```

```typescript
let arr = [1, 2, 3, 4, 5];

const a = arr.find((res) => {
  return res;
});
```

上面的例子会报错，因为 find 是 es6 新增的属性，但是我们的 tsconfig 中配置的是 es5，所以会直接报错

```
error TS2550: Property 'find' does not exist on type 'number[]'.
Do you need to change your target library? Try changing the 'lib'
compiler option to 'es2015' or later.
```

但是我们要注意这里运行 tsc 01-target.typescript 的时候还是会编译出来 js，这是因为我们没有配置"noEmitOnError": true。

### 2.2、module

module 定义 TypeScript 文件中的 module，采用何种方式实现，可选项为：none、commonjs、amd、system、umd、es6、es2015、es2020、es2022、esnext、node16、nodenext。

- AMD：不要使用它，它仅能在浏览器工作；
- SystemJS：这是一个好的实验，已经被 ES 模块替代；
- ES 模块：ES 规范，import 导入， export 导出
- COMMONJS 模块：NodeJS 规范，require 导入，exports 导出

如果你使用了 module: commonjs 选项， moduleResolution: node 将会默认开启。
我们常设置为 commonjs。

### 2.3、lib

lib 用于指定要包含在编译中的库文件。

```json
"lib": ["DOM", "ES6"]
```

lib 是一个新的 typescript 2 功能，因此它仍然缺乏文档。使用 --lib 可以指定内置 API 声明组的列表您可以选择包含在您的项目中.例如，如果你希望您的运行时支持 Map、Set 和 Promise(例如当今大多数常绿浏览器)，只需包含 --libes2015.collection,es2015.promise.同样你可以排除您不想包含在项目中的声明，例如 DOM 如果您正在使用 --lib es5,es6 处理节点项目。

```json
{
  "compilerOptions": {
    "target": "ES6",
    "lib": ["ES5"]
    // "noEmitOnError": true,
  },
  "include": ["src/**/*"]
}
```

```typescript
let arr = [1, 2, 3, 4, 5];
// 属性“find”在类型“number[]”上不存在。是否需要更改目标库? 请尝试将 “lib” 编译器选项更改为“es2015”或更高版本。t
arr.find((res) => {
  // 需要在lib上添加"DOM"
  // 找不到名称“console”。是否需要更改目标库? 请尝试更改 “lib” 编译器选项以包括 “dom”。
  console.log(res, 'res');
});
```

如上，刚开始的时候我们将 lib 设置为 ES5，这个时候会提示 find 方法是不支持的，我们需要使用 ES6，而我们在里面 console 了一下，这个则需要添加上 console，不然也会报错的。

```json
"lib": [
  "ES6",
  "DOM"
]
```

### 2.4、allowJs

allowJs 设置的值为 true 或 false，用来指定是否允许编译 JS 文件，默认是 false，即不编译 JS 文件。

```typescript
import { menu } from './demo3';
console.log('this is demo1', menu);
```

```js
export const menu = [
  {
    label: 'demo',
    value: '123456',
  },
];
```

如上，虽然我们在 typescript 文件中引入的 jsx 文件，但是因为没有配置 allowJs，导致我们运行 tsc 的时候，编译出的结果为：

```typescript
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const demo3_1 = require('./demo3');
console.log('this is demo1', demo3_1.menu);
```

但是实际上我们的 demo3 是没有被编译到 dist 目录下的。

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES6",
    "lib": ["ES6", "DOM"],
    "jsx": "preserve",
    "allowJs": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

### 2.5、checkJs

checkJs 的值为 true 或 false，用来指定是否检查和报告 JS 文件中的错误，默认是 false。

### 2.6、jsx

指定 jsx 代码用于的开发环境：preserve、react-native、react 等。

### 2.7、declaration 和 declarationDir

- declaration 的值为 true 或 false，用来指定是否在编译的时候生成相应的 .d.ts 声明文件。如果设为 true，编译每个 ts 文件之后会生成一个 js 文件和一个声明文件。
- declarationDir 指定编译生成的类型声明文件输出的目录。不提供的话，默认和生成的 js 文件放在一起。
- 但是 declaration 和 allowJs 不能同时设为 true。

```typescript
interface Person {
  name: string;
  age: number;
}

function People(people: Person) {
  this.name = people.name;
  this.age = people.age;
}

const xiaoming = new People({ name: 'xiaoming', age: 18 });
console.log(xiaoming, 'xiaoming');
```

```typescript
interface Person {
  name: string;
  age: number;
}
declare function People(people: Person): void;
declare const xiaoming: any;
```

如上我们写的 ts 代码，在 tsconfig.json 中配置了 declaration，运行 tsc，注意不是运行指定的文件，即在终端中输入 tsc，而不是 tsc index.typescript，这样我们发现会输出一个 index.d.ts 文件，专门暴露我们的 ts 定义。

### 2.8、outDir

outDir 用来指定输出文件夹，值为一个文件夹路径字符串，输出的文件都将放置在这个文件夹。上面我们就在例子中使用过了，我们就不继续举例使用了。

### 2.9、outFile

- outFile 用于指定将输出文件合并为一个文件，他的值为一个文件路径名。
- 比如设置为 ./dist/main.js，则输出的文件为一个 main.js 文件。
- 但是要注意，只有设置 module 值为 amd 和 system 模块时才支持这个配置。

### 2.10、removeComments

值为 true 或 false。默认为 false
用于指定是否将编译后的文件中的注释删掉。

```typescript
// 这里编辑后会输出吗？
console.log('demo');
```

```typescript
console.log('demo');
```

### 2.11、noEmit 和 noEmitError

noEmit：不生产编译文件。
noEmitError：Ts 发成错误时不生产编译文件。
