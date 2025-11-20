---
nav:
  title: 首页
  path: /
  order: 0
---

<!-- 自定义首页：顶部纯视频 Banner + 正常内容 -->
<div class="custom-welcome">

  <!-- 纯视频头部（仅装饰，不叠加文字） -->
  <div class="video-banner">
    <video class="banner-video" autoplay muted loop playsinline>
      <source src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/file/A*uYT7SZwhJnUAAAAAAAAAAAAADgCCAQ" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>

  <!-- 正常内容区域：Logo + 标题 + 按钮 + 特性 -->
  <div class="content-section">
    <div class="welcome-container">
      <div class="welcome-logo">
        <img src="https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png" alt="logo" />
      </div>
      <div class="welcome-title">react-antd-xform</div>
      <p class="desc">基于 React + Ant Design 的表单解决方案</p>
      <div class="welcome-buttons">
        <a href="/introduction" class="button primary">快速开始</a>
        <a href="https://github.com/JHuaZhang/react-antd-xform" target="_blank" class="button outline">GitHub</a>
      </div>
    </div>
  </div>

  <!-- 特性介绍 -->
  <div class="features-section">
    <div class="features-container">
      <div class="feature">
        <h3>🚀 开箱即用</h3>
        <p>集成 Ant Design，无需复杂配置即可使用。</p>
      </div>
      <div class="feature">
        <h3>📊 JSON Schema</h3>
        <p>支持动态表单结构定义，轻松实现配置化开发。</p>
      </div>
      <div class="feature">
        <h3>🔧 高度可扩展</h3>
        <p>支持自定义控件、校验规则和插件体系。</p>
      </div>
    </div>
  </div>

</div>

<style>
  .custom-welcome {
    width: 100%;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .video-banner {
    width: 100%;
    height: 300px;
    overflow: hidden;
    position: relative;
  }

  .banner-video {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 填满容器，裁剪多余 */
    display: block;
  }
  .content-section {
    text-align: center;
    padding: 60px 20px 40px;
    background: #fff;
    color: #333;
  }
  .welcome-container {
    font-weight: 900 !important;
    font-size: 40px !important;
  }
  .welcome-logo img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 3px solid #e6f7ff;
    object-fit: cover;
  }
  .content-section h1 {
    font-size: 2.5rem;
    margin: 16px 0;
    font-weight: 700;
    color: #1890ff;
  }
  .content-section .desc {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 24px;
  }
  .welcome-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  .button {
    display: inline-block;
    padding: 10px 24px;
    font-size: 15px;
    text-decoration: none;
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  .button.primary {
    background: #1890ff;
    color: white;
    border: none;
  }
  .button.primary:hover {
    background: #40a9ff;
    transform: translateY(-2px);
  }
  .button.outline {
    background: #fff;
    color: #1890ff;
    border: 1px solid #1890ff;
  }

  .button.outline:hover {
    background: #f5f5f5;
    transform: translateY(-2px);
  }
  .features-section {
    padding: 60px 20px;
    color: #333;
  }
  .features-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .feature {
    flex: 1 1 240px;
    max-width: 280px;
    border: 1px solid rgb(240, 240, 240);
    padding: 20px;
    text-align: left;
  }
  .feature h3 {
    color: #1890ff;
    margin-bottom: 8px;
    font-size: 1.3rem;
  }
  .feature p {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  /* =============== 移动端适配 =============== */
  @media (max-width: 768px) {
    .content-section h1 {
      font-size: 2rem;
    }
    .video-banner {
      height: 100px;
    }
    .button {
      width: 100%;
      max-width: 260px;
    }
    .features-section,
    .content-section {
      padding: 40px 16px;
    }
  }
</style>
