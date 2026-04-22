import { defineConfig } from 'dumi';
import { defineThemeConfig } from 'dumi-theme-antd/dist/defineThemeConfig';

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development' || process.env.DUMI_ENV === 'devbuild';
const basePath = process.env.BASE_PATH || (isDev ? '/' : '/zjh-blog/');

export default defineConfig({
  favicons: [`${basePath}logo.ico`],
  outputPath: 'dist',
  history: { type: 'browser' },
  base: basePath,
  publicPath: basePath,
  title: 'zjh-blog',
  themeConfig: defineThemeConfig({
    name: '❤️沐钦',
    title: '❤️沐钦',
    logo: `${basePath}logo.png`,
    description: '',
    socialLinks: {
      github: 'https://github.com/JHuaZhang/zjh-blog',
    },
    footer: 'Copyright © 2026 zjh',
  }),
});
