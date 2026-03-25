import { defineConfig } from 'dumi';
import { defineThemeConfig } from 'dumi-theme-antd/dist/defineThemeConfig';

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development' || process.env.DUMI_ENV === 'devbuild';

export default defineConfig({
  favicons: isDev ? ['/logo.ico'] : ['/zjh-blog/logo.ico'],
  outputPath: 'dist',
  history: {
    type: 'browser',
  },
  base: isDev ? '/' : '/zjh-blog/',
  publicPath: isDev ? '/' : '/zjh-blog/',
  title: 'zjh-blog',
  themeConfig: defineThemeConfig({
    name: '❤️沐钦',
    title: '❤️沐钦',
    logo: isDev ? '/logo.png' : '/zjh-blog/logo.png',
    description: '',
    socialLinks: {
      github: 'https://github.com/JHuaZhang/zjh-blog',
    },
    footer: 'Copyright © 2025 zjh',
  }),
});
