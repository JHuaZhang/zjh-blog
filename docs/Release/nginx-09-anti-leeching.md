---
group:
  title: Nginx
order: 9
title: nginx与防盗链

nav:
  title: 发布部署
  order: 6
---


## 1、防盗链概念介绍
防盗链 是一种防止其他网站直接引用（盗用）你网站资源（如图片、视频、音频、CSS、JS 等）的技术。如果别人直接在他们的网页中嵌入你的图片链接（例如 `<img src="[https://your-site.com/photo.jpg">`](`https://your-site.com/photo.jpg">`），就会产生“盗链”行为。

**为什么需要防盗链？**

+ 节省带宽和服务器资源：别人用了你的资源，但流量和成本由你承担。
+ 防止内容被滥用：比如你的高清图片被竞品网站直接使用。
+ 保护版权：避免未经授权的内容分发。

**防盗链如何利用Referer实现：**

最常见的防盗链机制就是检查 HTTP 请求中的 Referer 字段。

1. 用户访问A网站（site-a.com），A网站的HTML中引用了B网站（site-b.com）的一张图片。
2. 浏览器向site-b.com请求该图片时，会自动带上Referer: [`https://site-a.com/...`](https://site-a.com/...)。
3. site-b.com的服务器收到请求后，检查Referer：
    1. 如果Referer是自己域名（如site-b.com）或白名单域名 → 允许访问，返回图片。
    2. 如果Referer是其他域名（如site-a.com）→ 拒绝访问，返回403错误 或 替换为“禁止盗链”图片。

**防盗链的局限性：**

虽然基于Referer的防盗链很常用，但它不是绝对安全的，原因包括：

①、Referer 可伪造：攻击者可以用工具（如 curl、Postman）手动设置任意 Referer。

```bash
curl -H "Referer: https://yourdomain.com" https://your-site.com/image.jpg
```

②、Referer可能为空：

+ 用户从 HTTPS 页面跳转到 HTTP 资源（浏览器出于安全不发送 Referer）。
+ 用户设置了浏览器隐私模式或禁用 Referer。
+ 使用 <meta name="referrer" content="no-referrer"> 标签。

③、无法阻止下载工具或爬虫：专业工具可绕过Referer检查。

**更强的防盗链方案：**

+ 签名URL（Token验证）：URL中包含时效性签名，如 [`https://cdn.com/image.jpg?token=abc123&expire=1712345678`](https://cdn.com/image.jpg?token=abc123&expire=1712345678)。
+ 用户登录验证：资源仅对已登录用户开放。
+ IP 白名单 / 速率限制。
+ 使用CDN提供的防盗链功能（如阿里云OSS、腾讯云COS）。

## 2、HTTP Referer介绍
Referer是HTTP请求头（Request Header）中的一个字段，用于标识当前请求是从哪个页面发起的。HTTP Referer是由浏览器自动添加的请求头（Request Header），开发者无法通过JavaScript直接修改或删除它（出于安全和隐私考虑）。

**作用：**

告诉服务器：用户是从哪个网页跳转过来的。

**常用于：**

+ 统计分析（比如知道用户从百度搜索进入你的网站）。
+ 安全控制（如防盗链）。
+ 个性化推荐。

假设在 [https://example.com/page1.html](https://example.com/page1.html) 页面上点击了一个链接，跳转到 [https://api.example.com/image.jpg](`https://api.example.com/image.jpg`)，那么浏览器在请求 image.jpg 时，会自动带上如下请求头：

```plain
Referer: https://example.com/page1.html
```

注意：出于隐私考虑，某些情况下（如HTTPS → HTTP跳转、使用<meta referrer>标签等），浏览器可能不会发送Referer，或者只发送部分信息。

**详细机制：**

| 场景 | 浏览器是否自动添加Referer？ | 说明 |
| --- | --- | --- |
| 页面 A 跳转到页面 B（<a href>） | ✅ 是 | Referer = A的URL |
| 页面 A 中加载图片/脚本/CSS（`<img src="...">`） | ✅ 是 | Referer = A的URL |
| fetch()或XMLHttpRequest发起请求 | ✅ 是（默认） | Referer = 当前页面URL |
| 用户直接在地址栏输入URL | ❌ 否 | 没有“来源页面”，所以不发 |
| HTTPS 页面 → HTTP 资源 | ❌ 否（默认策略） | 防止敏感信息泄露 |
| 使用<meta name="referrer">控制 | ⚠️ 可控制发送策略 | 见下文 |


**前端如何影响Referer行为？**

虽然不能直接设置Referer，但你可以通过以下方式控制它的发送策略：

**①、使用<meta name="referrer">标签（推荐）**

在HTML的<head>中加入：

```html
<!-- 完全不发送 Referer -->
<meta name="referrer" content="no-referrer">

<!-- 只发送 origin（协议+域名+端口），不带路径 -->
<meta name="referrer" content="origin">

<!-- 默认行为：同站发完整 URL，跨站只发 origin（现代浏览器默认） -->
<meta name="referrer" content="strict-origin-when-cross-origin">
```

**②、在 `<a>`或`<img>`上使用referrerpolicy属性**

```javascript
// React 示例
function MyComponent() {
  return (
    <div>
    {/* 这个链接跳转时不发送 Referer */}
    <a 
  href="https://example.com" 
  referrerPolicy="no-referrer"
    >
    外部链接
    </a>

  {/* 这张图片加载时不发送 Referer */}
  <img 
  src="https://cdn.example.com/photo.jpg" 
  referrerPolicy="no-referrer"
  alt="示例"
    />
    </div>
  );
}
```

**举例介绍：**

下面就使用node和react的方式来举例：

```javascript
// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// 允许跨域（方便测试）
app.use(require('cors')());

// 白名单：只允许这些来源访问图片
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  '', // 允许空 Referer（比如用户直接打开图片链接）
];

// 防盗链中间件
function antiHotlink(req, res, next) {
  const referer = req.get('Referer') || '';
  const origin = referer ? new URL(referer).origin : '';

  console.log('🔍 请求来源 Referer:', referer);

  // 检查是否在白名单中
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin === '';
  console.log('✅ 是否允许访问:', isAllowed, origin);

  if (!isAllowed) {
    console.log('🚫 盗链请求被拒绝！来源:', origin);
    return res.status(403).send('❌ 禁止盗链！请勿直接引用本站资源。');
  }

  next(); // 允许通过
}

// 提供一张测试图片
app.use('/public', express.static(path.join(__dirname, 'public/')));

// 受保护的图片接口
app.get('/api/image', antiHotlink, (req, res) => {
  const image = path.join(__dirname, 'public/image.jpg');
  const imageBase64 = fs.readFileSync(image, 'base64');
  const buffer = Buffer.from(imageBase64, 'base64');
  res.set('Content-Type', 'image/png');
  res.send(buffer);
});

app.listen(4000, () => {
  console.log('✅ 后端启动：http://localhost:4000');
  console.log('🖼️ 测试图片地址：http://localhost:4000/public/image.jpg');
  console.log('🖼️  受保护图片地址：http://localhost:4000/api/image');
});
```

```javascript
// src/App.jsx
export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>✅ 我是合法网站（localhost:5173）</h1>
      <p>我有权加载这张图片：</p>

      {/* 正常加载受保护的图片 */}
      <img
        src="http://localhost:4000/api/image"
        alt="受保护图片"
        width="200"
        style={{ border: '2px solid green', padding: '5px' }}
      />

      <p style={{ marginTop: '20px', color: 'green' }}>✔ 图片应正常显示（绿色边框）</p>
    </div>
  );
}
```

```javascript
// src/App.jsx
export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>我是不合法网站（localhost:8080）</h1>
      <p>我无权加载这张图片：</p>

      {/* 正常加载受保护的图片 */}
      <img src="http://localhost:4000/api/image" alt="受保护图片" width="200" />
    </div>
  );
}
```

如上有一个node服务，接口本地返回了public中的图片，其中设置了5173端口能够正常访问该图片，而8080端口不行。因此5173端口的react能够正确获取到图片，8080的则是无权获取。

局限性：

上面的例子中，如果我给react应用的入口加上：

```javascript
<meta name="referrer" content="no-referrer">
```

  则上面的node服务失去效果，更强的防盗效果我们前面介绍过，这里就不更多的赘述了。

## 3、nginx中配置防盗链
nginx通过检查HTTP请求头中的Referer字段，判断请求是否来自“合法”网站。

**工作流程：**

1. 用户在 A 网站（如 [https://your-site.com](https://your-site.com)）加载一张图片。
2. 浏览器向你的服务器请求图片，自动带上：

```plain
Referer: https://your-site.com/page.html
```

3. nginx 收到请求，检查 Referer 是否在白名单中：
    - ✅ 是 → 返回真实图片。
    - ❌ 否 → 返回403错误或替换图片。

注意：nginx的Referer检查只对静态资源有效（如图片、视频、CSS、JS），对API接口意义不大。

**nginx防盗链核心指令：**

**①、valid_referers**

定义哪些Referer是合法的。

```nginx
valid_referers none blocked *.yourdomain.com yourdomain.com;
```

| 参数 | 说明 |
| --- | --- |
| none | 允许没有Referer的请求（如用户直接在地址栏输入图片 URL） |
| blocked | 允许Referer被防火墙/代理删除的情况（值非空但被截断） |
| server_names | 允许指定的域名（支持通配符*.example.com） |
| ~ regex | 支持正则表达式 |


**②、$invalid_referer**

+ 如果Referer不在valid_referers列表中，该变量值为1。
+ 否则为 ""（空）。

通常配合 if 使用：

```nginx
if ($invalid_referer) {
  return 403;
}
```

大致配置方式如下：

```nginx
server {
  listen 80;
  server_name yourdomain.com;

  location ~* \.(jpg|jpeg|png|gif|webp)$ {
    # 定义合法的 Referer 来源
    valid_referers none blocked *.yourdomain.com yourdomain.com;

    # 如果 Referer 不合法，返回 403
    if ($invalid_referer) {
      return 403;
      # 或者返回一张“禁止盗链”图片：
      # rewrite ^/.*$ /hotlink-denied.png last;
    }
    # 其他正常处理
    root /var/www/html;
  }
}
```

