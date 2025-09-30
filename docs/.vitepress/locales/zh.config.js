export default {
  label: '中文',
  lang: 'zh',
  link: '/zh/',
  title: 'DC-SDK 开发文档',
  themeConfig: {
    nav: [
      {
        text: '文档',
        items: [
          { text: '快速上手', link: '/zh/guide/get-start' },
          { text: '架构图', link: '/zh/guide/framework-chart' },
          { text: 'v2.x', link: 'https://resource.dvgis.cn/dc-api/v2.x/zh/' },
          { text: 'Cesium', link: 'https://github.com/CesiumGS/cesium/' },
        ],
      },
      { text: 'API', link: '/zh/api/global' },
      {
        text: '周边社区',
        items: [
          {
            text: 'Vue',
            items: [
              { text: 'dc-vue', link: 'https://github.com/dvgis/dc-vue' },
              {
                text: 'dc-vue-next',
                link: 'https://github.com/dvgis/dc-vue-next',
              },
            ],
          },
          {
            text: 'vite',
            items: [
              {
                text: 'vite-plugin-dc',
                link: 'https://github.com/dvgis/vite-plugin-dc',
              },
              { text: 'dc-vite', link: 'https://github.com/dvgis/dc-vite' },
            ],
          },
        ],
      },
      { text: '赞助', link: '/zh/donation/' },
    ],
    sidebar: {
      '/zh/guide/': [
        {
          text: '文档',
          items: [
            { text: '简介', link: '/zh/guide/introduction' },
            { text: '快速上手', link: '/zh/guide/get-start' },
            { text: '运行环境', link: '/zh/guide/run-env' },
            { text: '架构图', link: '/zh/guide/framework-chart' },
            { text: '从旧版本迁移', link: '/zh/guide/from-old-version' },
            { text: '技术扩展', link: '/zh/guide/tec-ext' },
          ],
        },
      ],
      '/zh/api/': [
        {
          items: [
            { text: '全局 API', link: '/zh/api/global' },
            { text: '基础 API', link: '/zh/api/base' },
            { text: '原生 API', link: '/zh/api/origin' },
            { text: '地图 API', link: '/zh/api/tile' },
            { text: '图层 API', link: '/zh/api/layer' },
            {
              text: '<b>要素 API</b>',
              items: [
                { text: '矢量要素', link: '/zh/api/overlay-vector' },
                { text: '图元要素', link: '/zh/api/overlay-primitive' },
                { text: '标绘要素', link: '/zh/api/overlay-plot' },
              ],
            },
            { text: '材质 API', link: '/zh/api/material' },
            { text: '工具 API', link: '/zh/api/tools' },
            {
              text: '效果 API',
              items: [
                { text: '场景效果', link: '/zh/api/effect-scene' },
                { text: '动画效果', link: '/zh/api/effect-animation' },
              ],
            },
          ],
        },
      ],
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    outlineTitle: '目录',
    search: {
      provider: 'local',
    },
  },
}
