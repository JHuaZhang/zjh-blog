---
group:
  title: React16原理
order: 1
title: 搭建React源码本地调试环境

nav:
  title: React原理
  order: 4
---

## 1、搭建步骤

### 1.1、使用create-react-app脚手架创建项目

```bash
npx create-react-app demo
```

### 1.2、弹射create-react-app脚手架内部配置

```bash
npm run eject
```

### 1.3、克隆react官方源码到src中(在项目的根目录下进行克隆)

```bash
git clone --branch v16.13.1 --depth=1 https://github.com/facebook/react.git
```

因为我们这里create-react-app中使用到的react版本为18.1.0，因此这里我们就使用这个版本的react。

### 1.4、链接本地源码

```javascript
// 文件位置为create-react-app创建的demo弹射后的webpack.config.js中
resolve:{
  alias:{
    "react-native":"react-native-web",
    "react":path.resolve(__dirname,"../src/react/packages/react-dom"),
    "shared":path.resolve(__dirname,"../src/react/packages/shared"),
    "react-reconciler":path.resolve(__dirname,"../src/react/packages/react-reconciler"),
    "leacy-events":path.resolve(__dirname,"../src/react/packages/leacy-events"),
  }
}
```

我们打开文件中存在alias对象，为：

```javascript
alias: {
  // Support React Native Web
  // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
  'react-native': 'react-native-web',
    // Allows for better profiling with ReactDevTools
    ...(isEnvProductionProfile && {
      'react-dom$': 'react-dom/profiling',
      'scheduler/tracing': 'scheduler/tracing-profiling',
    }),
    ...(modules.webpackAliases || {}),
    },
```

我们直接将上面的alias进行一个替换就行了。

### 1.5、修改环境变量

文件位置：config/env.js。

```javascript
const stringified = {
  'process.env': Object.keys(raw).reduce((env, key) => {
    env[key] = JSON.stringify(raw[key]);
    return env;
  }, {}),
  __DEV__: true,
  shareArrayBuffer: true,
  spyOnDev: true,
  SpyOnDevAndProd: true,
  spyOnProd: true,
  __PROFILE__: true,
  __UMD__: true,
  __EXPERIMENTAL__: true,
  __VARIANT__: true,
  gate: true,
  trustedTypes: true,
};
```

同样的我们打开该文件，其前值为：

```javascript
const stringified = {
  'process.env': Object.keys(raw).reduce((env, key) => {
    env[key] = JSON.stringify(raw[key]);
    return env;
  }, {}),
};
```

我们直接复制上面的内容覆盖过来即可。

### 1.6、告诉babel在转换代码的时忽略类型检查

需要安装babel插件，在项目demo中安装下面babel工具

```bash
npm install @babel/plugin-transform-flow-strip-types -D
```

安装完成后我们在config/webpack.config.js中找到module下的rules下的oneOf中的plugins，配置如下内容：

```javascript
plugins:{
  require.resolve("@babel/plugin-transform-flow-strip-types"),
}
```

### 1.7、导出HostConfig

在react/packages/react-reconciler/src/ReactFiberHostConfig.js中，直接增加：

```javascript
export * from './forks/ReactFiberHostConfig.dom';
```

### 1.8、修改ReactSharedInternals.js文件

该文件在react/packages/shared/ReactSharedInternals.js，打开为如下代码，我们直接注释前2行，

```javascript
import * as React from 'react';

const ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
```

修改为：

```javascript
import ReactSharedInternals from '../react/src/ReactSharedInternals';
```

记得注释：

```javascript
// 第七步：注释这里
// invariant(false, 'This module must be shimmed by a specific renderer.');
```

### 1.9、关闭eslint扩展

文件位置为react/.eslintrc.js,找到extends中内容，并注释：

```javascript
// extends: ['fbjs', 'prettier'],
```

### 1.10、禁止invariant报错

文件位置为react/packages/shared/invariant.js

```javascript
export default function invariant(condition, format, a, b, c, d, e, f) {
  if (condition) return; //增加此行
  throw new Error(
    'Internal React error: invariant() is meant to be replaced at compile ' +
      'time. There is no runtime version.',
  );
}
```

### 1.11、eslint配置

在react源码文件夹中新建.eslintrc.json并添加如下配置：

```javascript
{
  "extend":"react-app",
  "globls":{
    "SharedArraruBuffer":true,
    "spyOnDev":true,
    "spyOnDevAndProd":true,
    "spyOnProd":true,
    "__PROFILE__":true,
    "__UMD__":true,
    "__EXPERIMETAL__":true,
    "__VARTANT__":true,
    "gate":true,
    "trustedTypes":true
  }
}

```

### 1.12、修改react react-dom引入方式

```javascript
import * as React from 'react';
import * as ReactDOM from 'react-dom';
```

注意：所有React和ReactDOM的引入都要修改。

### 1.13、删除node_modules重新install

这个时候我们直接run start会报错，因此我们需要删除node_modules后重新install，再run start。

### 1.14、验证

我们在react文件夹下找到react/src/index,在export前面增加一个console，来验证我们当前react是否使用的本地的包：

```javascript
console.log('this is local react');
```

可以看到我们的控制台成功输出了这句话。

## 2、注意

①、现在我们直接用create-react-app创建出来的脚手架为18版本的react，找了半天创建16.13.1的方法都失败了，因此这里我就直接创建的18的脚手架，然后将react和react-dom本地安装成16.13.1的，这里我们就要注意将react-srcipt的版本指定为3.4.1。  
②、因为我们的脚手架是基于react18的，我们给修改成了16.13.1，所以这里使用ReactDOM的方式要修改如下方式：

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';
ReactDOM.render(<App />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
```

③、注意我们所有的页面组件，React的导入方式都要修改：

```javascript
import * as React from 'react';

export default function App() {
  return <div>1111</div>;
}
```

不然会报这个错误：

```javascript
Attempted import error: 'react' does not contain a default export
  (imported as 'React').
```
