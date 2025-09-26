# 快速开始

## 框架安装

`npm / yarn / pnpm`

npm / yarn / pnpm 的方式安装，它能更好地和 `webpack` 打包工具配合使用。

```shell
npm install @dvgis/dc-sdk
# yarn add @dvgis/dc-sdk
# pnpm add @dvgis/dc-sdk
```

```js
import * as DC from '@dvgis/dc-sdk'
import '@dvgis/dc-sdk/dist/dc.min.css'
```

`CDN`

[下载链接](https://github.com/dvgis/dc-sdk/releases)

```html

<script src="https://cdn.jsdelivr.net/npm/@dvgis/dc-sdk/dist/dc.min.js"></script>
<link
  href="https://cdn.jsdelivr.net/npm/@dvgis/dc-sdk/dist/dc.min.css"
  rel="stylesheet"
  type="text/css"
/>
```

## 创建应用

> [框架安装](#框架安装) 和 [配置](#应用配置) 后，就可以开发属于自己的 **_`WebGis`_** 应用了

`构建三维容器`

```html

<div class="viewer-container" id="viewer-container"></div>
<!-- id属性必须赋值，否则无法创建三维场景 -->
```

`构建三维场景`

```js
let viewer = new DC.Viewer('viewer-container')
```

`运行效果` [更多示例](http://dc.dvgis.cn/#/examples)

<iframe src="https://dc.dvgis.cn/#/editor?type=start&subType=create&example=create" frameborder="0" height="500px" width="100%" >
</iframe>

## 应用配置

由于 DC 框架将 Cesium 静态资源默认路径设置为 `./libs/dc-sdk/resources/`，这样需将 `Cesium` 相关的静态资源文件: `Assets`、
`Workers` 、`ThirdParty` 复制到工程的 `libs/dc-sdk/resources` 目录下以保证三维场景能够正常呈现,也可通过全局函数进行
`Cesium` 相关的静态资源路基设置

> `npm / yarn / pnpm`

`Webpack` [工程模板](https://github.com/cavencj/dc-vue-app)

```js
// webpack.config.js

const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const dvgisDist = './node_modules/@dvgis'

module.exports = {
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(dvgisDist, 'dc-sdk/dist/resources'),
        to: 'libs/dc-sdk/resources',
      },
    ]),
  ],
}
```

`Vue2.x` [工程模板](https://github.com/dvgis/dc-vue)

```js
// vue.config.js

const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const dvgisDist = './node_modules/@dvgis'

module.exports = {
  // 其他配置
  chainWebpack: (config) => {
    config.plugin('copy').use(CopyWebpackPlugin, [
      [
        {
          from: path.join(dvgisDist, 'dc-sdk/dist/resources'),
          to: 'libs/dc-sdk/resources',
        },
      ],
    ])
  },
}
```

`Vue3.x` [工程模板](https://github.com/dvgis/dc-vue-next)

```js
// vue.config.js

const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const dvgisDist = './node_modules/@dvgis'

module.exports = {
  // 其他配置
  chainWebpack: (config) => {
    config.plugin('copy').use(CopyWebpackPlugin, [
      {
        patterns: [
          {
            from: path.join(dvgisDist, 'dc-sdk/dist/resources'),
            to: path.join(__dirname, 'dist', 'libs/dc-sdk/resources'),
          },
        ],
      },
    ])
  },
}
```

`Vite` [工程模板](https://github.com/dvgis/dc-vite)

```shell
npm install @dvgis/vite-plugin-dc
# yarn add @dvgis/vite-plugin-dc
# pnpm add @dvgis/vite-plugin-dc
```

```js
// vite.config.js
import { defineConfig } from 'vite'
import DC from '@dvgis/vite-plugin-dc'

export default defineConfig({
  plugins: [DC()],
})
```

`CDN`

直接通过[网站](https://github.com/dvgis/dc-sdk/releases)下载当前版本的资源文件

:::danger
CDN 模式下开发时尽量不要使用 DC 为变量名或者命名空间，避免框架无法正常使用。
:::

## 代码提示

通过安装代码提示工具包，能够在开发过程中提示和自动完成框架内部的接口，更好地提高开发效率

```shell
npm install @dvgis/dc-sdk-types -D
# yarn add @dvgis/dc-sdk-types -D
# pnpm add @dvgis/dc-sdk-types -D
```
