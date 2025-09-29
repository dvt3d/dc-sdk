import { defineConfig } from 'vitepress'
import zhConfig from './locales/zh.config.js'
import enConfig from './locales/en.config.js'
export default defineConfig({
  base: '/dc-docs/',
  cleanUrls: 'without-subfolders',
  head: [['link', { rel: 'icon', href: '/dc-docs/assets/favicon.png' }]],
  locales: {
    root: zhConfig,
    // en: enConfig,
  },
  themeConfig: {
    logo: '/assets/logo.svg',
    search: {
      provider: 'local',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/dvgis/dc-sdk' }],
    footer: {
      copyright: '版权所有 © 2019 - 2025 数字视界科技(Digital Visual)',
    },
  },
})
