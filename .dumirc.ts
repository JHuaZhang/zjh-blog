import { defineConfig } from 'dumi';
import { defineThemeConfig } from 'dumi-theme-antd/dist/defineThemeConfig';

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development' || process.env.DUMI_ENV === 'devbuild';

export default defineConfig({
  favicons: ['https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png'],
  // 输出目录
  outputPath: 'dist',
  history: {
    type: 'browser',
  },
  // 站点的基础路径，如果你的站点要部署在非根路径下，需要修改此选项，例如 '/my-project/'
  base: isDev ? '/' : '/zjh-blog/',
  // 设置公共路径，通常用于指定静态资源的基础路径
  publicPath: isDev ? '/' : '/zjh-blog/',
  // 主题配置是 dumi-theme-antd的核心配置区域
  title: 'zjh-blog',
  themeConfig: defineThemeConfig({
    name: 'zjh-blog',
    title: '建华',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png',
    description: 'blog',
    socialLinks: {
      github: 'https://github.com/JHuaZhang/zjh-blog',
    },
    footer: 'Copyright © 2025 zjh',
  }),
  // 如果需要对默认主题的样式进行细微调整，可以使用 styles 配置项注入全局样式
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
