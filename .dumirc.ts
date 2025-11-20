import { defineConfig } from 'dumi';
import { defineThemeConfig } from 'dumi-theme-antd/dist/defineThemeConfig';

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development' || process.env.DUMI_ENV === 'devbuild';

export default defineConfig({
  favicons: ['https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png'],
  outputPath: 'dist',
  history: {
    type: 'browser',
  },
  base: isDev ? '/' : '/zjh-blog/',
  publicPath: isDev ? '/' : '/zjh-blog/',
  title: 'zjh-blog',
  themeConfig: defineThemeConfig({
    name: '建华的blog',
    title: '建华的blog',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png',
    description: '',
    socialLinks: {
      github: 'https://github.com/JHuaZhang/zjh-blog',
    },
    footer: 'Copyright © 2025 zjh',
  }),
  styles: [
    `.dumi-default-header-left {
      width: 280px !important;
    }`,
    `
    /* 确保 body 和根容器最小高度为视口高度 */
    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* dumi 默认的布局容器类名（关键） */
    .dumi-default-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* 主内容区域占满剩余空间 */
    .dumi-default-layout-main {
      flex: 1;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .rc-footer-bottom{
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      position: relative;
      bottom: 0;
      background-color: #f5f5f5;
      text-align: center;
      box-sizing: border-box;

  /* 关键：确保在有侧边栏时也能居中 */
  left: 0;
  right: 0;
    }
    `,
  ],
  // 如果需要对 Ant Design 组件样式进行主题定制，可以使用 theme 配置项
  /*
  theme: {
    '@c-primary': '#your-primary-color', // 定制主色调
  },
  */
});
