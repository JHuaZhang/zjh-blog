import type { DocsThemeConfig } from 'nextra-theme-docs';
import { useConfig } from 'nextra-theme-docs';
import { useRouter } from 'next/router';
import Image from 'next/image';

const logo = (
  <span>
    <Image
      style={{ display: 'inline-block', marginRight: 4, borderRadius: 24 }}
      src="/favicon.ico"
      width={24}
      height={24}
      alt=""
    />
    JH学习笔记
    <style jsx>{`
      span {
        padding: 0.5rem 0.5rem 0.5rem 0;
        mask-image: linear-gradient(60deg, black 25%, rgba(0, 0, 0, 0.2) 50%, black 75%);
        mask-size: 400%;
        mask-position: 0%;
      }
      span:hover {
        mask-position: 100%;
        transition: mask-position 1s ease, -webkit-mask-position 1s ease;
      }
    `}</style>
  </span>
);

const config: DocsThemeConfig = {
  project: {
    link: 'https://github.com',
  },
  docsRepositoryBase: 'https://github.com',
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== '/') {
      return {
        titleTemplate: '%s',
      };
    }else{
      return {
        titleTemplate: 'JH学习笔记',
      };
    }
  },
  logo,
  head: function useHead() {
    const { title } = useConfig();
    return (
      <>
        <meta name="msapplication-TileColor" content="#fff" />
        <meta name="theme-color" content="#fff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta name="description" content="Make beautiful websites with Next.js & MDX." />
        <meta name="og:description" content="Make beautiful websites with Next.js & MDX." />
        <meta name="og:title" content={title ? title + ' – 建华' : '建华'} />
        <meta name="apple-mobile-web-app-title" content="建华" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </>
    );
  },
  editLink: {
    text: '',
  },
  feedback: {
    content: '',
    labels: 'feedback',
  },
  sidebar: {
    titleComponent({ title, type }) {
      if (type === 'separator') {
        return <span className="cursor-default">{title}</span>;
      }
      return <>{title}</>;
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  footer: {
    text: `MIT 2025 ©建华`,
  },
};

export default config;
