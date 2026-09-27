/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import 'sweetalert2/dist/sweetalert2.min.css';

import { getConfig } from '@/lib/config';
import RuntimeConfig from '@/lib/runtime';

import { GlobalErrorIndicator } from '../components/GlobalErrorIndicator';
import { SiteProvider } from '../components/SiteProvider';
import { ThemeProvider } from '../components/ThemeProvider';
import ThemeStatusBar from '../components/ThemeStatusBar';
import { headers } from 'next/headers'; // 导入 headers

const inter = Inter({ subsets: ['latin'] });

// 辅助函数，用于检测 Android 用户代理
function isAndroid(userAgent: string): boolean {
  return /Android/i.test(userAgent);
}

// 动态生成 metadata，支持配置更新后的标题变化
export async function generateMetadata(): Promise<Metadata> {
  let siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'JoyFlix';
  if (process.env.NEXT_PUBLIC_STORAGE_TYPE !== 'upstash') {
    const config = await getConfig();
    siteName = config.SiteConfig.SiteName;
  }

  return {
    title: siteName,
    description: '影视聚合',
    manifest: '/manifest.json',
  };
}

export const viewport: Viewport = {
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isAndroidDevice = isAndroid(userAgent);

  let siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'JoyFlix';
  let announcement =
    process.env.ANNOUNCEMENT || '切勿分享本站，以维持使用体验哦 ʕ •ᴥ•ʔ～✰✰';
  let doubanProxyType = process.env.NEXT_PUBLIC_DOUBAN_PROXY_TYPE || 'direct';
  let doubanProxy = process.env.NEXT_PUBLIC_DOUBAN_PROXY || '';
  let doubanImageProxyType =
    process.env.NEXT_PUBLIC_DOUBAN_IMAGE_PROXY_TYPE || 'direct';
  let doubanImageProxy = process.env.NEXT_PUBLIC_DOUBAN_IMAGE_PROXY || '';
  let customCategories = (RuntimeConfig as any).custom_category?.map((category: any) => ({
      name: 'name' in category ? category.name : '',
      type: category.type,
      query: category.query,
    })) || ([] as Array<{ name: string; type: 'movie' | 'tv'; query: string }>);
  if (process.env.NEXT_PUBLIC_STORAGE_TYPE !== 'upstash') {
    const config = await getConfig();
    siteName = config.SiteConfig.SiteName;
    announcement = config.SiteConfig.Announcement;
    doubanProxyType = config.SiteConfig.DoubanProxyType;
    doubanProxy = config.SiteConfig.DoubanProxy;
    doubanImageProxyType = config.SiteConfig.DoubanImageProxyType;
    doubanImageProxy = config.SiteConfig.DoubanImageProxy;
    customCategories = config.CustomCategories.filter(
      (category) => !category.disabled
    ).map((category) => ({
      name: category.name || '',
      type: category.type,
      query: category.query,
    }));
  }

  // 将运行时配置注入到全局 window 对象，供客户端在运行时读取
  const runtimeConfig = {
    STORAGE_TYPE: process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage',
    DOUBAN_PROXY_TYPE: doubanProxyType,
    DOUBAN_PROXY: doubanProxy,
    DOUBAN_IMAGE_PROXY_TYPE: doubanImageProxyType,
    DOUBAN_IMAGE_PROXY: doubanImageProxy,
    CUSTOM_CATEGORIES: customCategories,
  };

  return (
    <html lang='zh-CN' suppressHydrationWarning>
      <head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0, viewport-fit=cover'
        />
        <link rel='apple-touch-icon' href='/icons/icon-192x192.png' />
        {/* 
          为移动端浏览器状态栏设置主题颜色。
          浅色模式下，iOS 状态栏为白色背景、深色文字，Android 为浅灰色背景、深色文字。
          深色模式下，状态栏统一为黑色背景、浅色文字。
          这确保了应用在不同设备和主题下都有一致的视觉体验。
        */}
        <meta name="theme-color" content="#C5D8E2" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />

        {/* 将配置序列化后直接写入脚本，浏览器端可通过 window.RUNTIME_CONFIG 获取 */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.RUNTIME_CONFIG = ${JSON.stringify(runtimeConfig)};`,
          }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-white text-gray-900 dark:bg-black dark:text-gray-200`}
      >
        <div className="light-theme-background fixed inset-0 -z-10" />
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          disableTransitionOnChange
        >
          <SiteProvider siteName={siteName} announcement={announcement}>
            {children}
            <ThemeStatusBar />
            <GlobalErrorIndicator />
          </SiteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
