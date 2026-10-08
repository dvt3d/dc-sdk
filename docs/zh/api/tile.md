# 地图 API 🌎

构建地球表面的地形和图片，展现地球表面的真实状态

## DC.CustomGeographicTilingScheme

> 自定义地理平铺方案

根据瓦片的比例尺`(degrees/px)`和切图原点重新计算瓦片行列号,最终会采用`EPSG:4326`的瓦片计算规则平铺瓦片`(可能会存在偏移)`

### example

```js
 viewer.addBaseLayer(DC.ImageryLayerFactory.createCoordImageryLayer({
  tilingScheme: new DC.CustomGeographicTilingScheme(
    {
      origin: [-180, 90],
      resolutions: [
        0.703125,
        0.3515625,
        0.17578125,
        0.087890625
      ],
    }
  ),
}))

```

### creation

- **_constructor(options)_**

  构造函数

  - 参数
    - `{Object} options`：配置
  - 返回值 `tilingScheme`

```js
// options（属性可选）
const options = {
  "origin": [-180, 90], // 切图原点，默认为[-180,90]，必选
  "zoomOffset": 0, //瓦片的0级对应Cesium的瓦片层级，值为： 0 - Cesium层级，若瓦片的0级对应Cesium的10级，则值为 0 - 10 = -10，同时在瓦片请求时{z}的数值替换时也需加上这个层级偏移值
  "tileSize": 256, //瓦片的大小，默认为256，即一张瓦片的大小为 256 * 256
  "resolutions": [],//瓦片每一层级分辨率
  "ellipsoid": DC.Ellipsoid.WGS84,// 平铺的椭球体,默认为 WGS84 椭球
  "rectangle": DC.Rectangle.MAX_VALUE,//平铺方案覆盖的矩形（以弧度表示）
}
```

## DC.CustomMercatorTilingScheme

> 自定义墨卡托平铺方案

根据瓦片的比例尺`(meters/px)`和切图原点重新计算瓦片行列号,最终会采用`EPSG:3857`的瓦片计算规则平铺瓦片`(可能会存在偏移)`

### example

```js
 viewer.addBaseLayer(DC.ImageryLayerFactory.createCoordImageryLayer({
  tilingScheme: new DC.CustomGeographicTilingScheme(
    {
      origin: [-20037508.3427892, 20037508.3427892],
      resolutions: [
        156543.033928,
        78271.516964,
        39135.758482,
        19567.879241,
        9783.939621,
      ],
    }
  ),
}))

```

### creation

- **_constructor(options)_**

  构造函数

  - 参数
    - `{Object} options`：配置
  - 返回值 `tilingScheme`

```js
// options（属性可选）
const options = {
  "origin": [-20037508.3427892, 20037508.3427892], //切图原点，默认为[-20037508.3427892, 20037508.3427892]，必选
  "zoomOffset": 0, //瓦片的0级对应Cesium的瓦片层级，值为： 0 - Cesium层级，若瓦片的0级对应Cesium的10级，则值为 0 - 10 = -10，同时在瓦片请求时{z}的数值替换时也需加上这个层级偏移值
  "tileSize": 256, //瓦片的大小，默认为256，即一张瓦片的大小为 256 * 256
  "resolutions": [],//瓦片每一层级分辨率，必选
  "ellipsoid": DC.Ellipsoid.WGS84,// 平铺的椭球体,默认为 WGS84 椭球
  "rectangleSouthwestInMeters": null,//切片方案覆盖的矩形的西南角，以米为单位。如果不指定该参数或矩形NortheastInMeters，则在经度方向上覆盖整个地球，在纬度方向上覆盖等距离，形成正方形投影
  "rectangleNortheastInMeters": null,//切片方案覆盖的矩形的东北角（以米为单位）。如果未指定此参数或矩形SouthwestInMeters，则在经度方向上覆盖整个地球，并在纬度方向上覆盖相等的距离，从而形成方形投影。
}

```

## DC.ImageryLayerFactory

> 地图工厂, 用于创建各类地图瓦片

### example

```js
let baseLayer = DC.ImageryLayerFactory.createAMapImageryLayer({
  style: 'img',
})
viewer.addBaseLayer(baseLayer, {
  name: '地图',
  iconUrl: '../preview.png',
})
```

### static methods

- **_createAMapImageryLayer(options)_**

  创建高德地图

  - 参数
    - `{Object} options`：属性
  - 返回值 `Promise<baseLayer>`

- **_createBaiduImageryLayer(options)_**

  创建百度地图

  - 参数
    - `{Object} options`：属性
  - 返回值 `Promise<baseLayer>`

- **_createGoogleImageryLayer(options)_**

  创建谷歌地图

  - 参数
    - `{Object} options`：属性
  - 返回值 `Promise<baseLayer>`

- **_createTdtImageryLayer(options)_**

  创建天地图 WMTS 图层。沿用 `style`、`key` 和 Promise 返回方式，默认使用 HTTPS、矢量底图及球面墨卡托投影。

  - 参数
    - `{Object} options`：属性
  - 返回值 `Promise<baseLayer>`

  | 参数 | 类型 | 默认值 | 说明 |
  | --- | --- | --- | --- |
  | style | String | `'vec'` | `vec` 矢量底图、`cva` 矢量注记、`img` 影像底图、`cia` 影像注记、`ter` 地形晕渲、`cta` 地形注记、`ibo` 全球境界 |
  | tileMatrixSetID | String | `'w'` | `w` 球面墨卡托，`c` 经纬度；自动匹配对应瓦片网格和服务层级 |
  | key / token | String | `''` | 天地图密钥，`key` 优先；参数值自动转义 |
  | protocol | String | `'https:'` | 支持 `'http:'` / `'https:'`，也接受不带冒号的写法；仅作用于默认地址 |
  | subdomains | String / String[] | `'01234567'` | 用于 `t0`～`t7` 分发请求；可指定部分子域，例如 `['0', '4']` |
  | url | String / Resource | 天地图 WMTS | 自定义完整地址模板；支持 `{s}`、`{x}`、`{y}`、`{z}`、`{TileMatrix}`、`{style}`、`{tileMatrixSetID}`、`{key}`、`{token}` |
  | minimumLevel | Number | `0` | Cesium 最小层级；默认对应服务 L1 |
  | maximumLevel | Number | `17` | Cesium 最大层级；默认对应服务 L18，可按具体图层的覆盖层级调整 |
  | rectangle | Rectangle | 对应投影的全球范围 | 限制加载范围，坐标使用弧度 |
  | proxy | Proxy | 无 | Cesium 代理，提供 `getURL(url)` |
  | credit | String / Credit | `'天地图'` | 数据来源说明 |

  默认请求路径为 `/{style}_{tileMatrixSetID}/wmts`，携带 `SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER={style}&STYLE=default&TILEMATRIXSET={tileMatrixSetID}&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={y}&TILECOL={x}&tk={key}`。

  `{z}` 为本 Provider 的 Cesium 层级，`{TileMatrix}` 为服务层级，等于 `{z} + 1`。根网格为 `w: 2×2`、`c: 2×1`，均从服务 L1 起步，避免影像失败后回退请求不存在的服务 L0。自定义地址需包含服务要求的完整参数；不要仅改变 URL 的 `c/w` 后缀而保留另一种投影的网格。`ter` 是二维晕渲图，实际高程使用 `TerrainFactory.createTdtTerrain()`；三维地名使用 `TdtLabelLayer` 的 `GetTiles` 服务。

  ```js
  const options = { key: 'YOUR_TIANDITU_KEY', tileMatrixSetID: 'c' }
  viewer.addBaseLayer([
    DC.ImageryLayerFactory.createTdtImageryLayer({ ...options, style: 'img' }),
    DC.ImageryLayerFactory.createTdtImageryLayer({ ...options, style: 'cia' }),
  ])
  ```

- **_createTencentImageryLayer(options)_**

  创建腾讯地图

  - 参数
    - `{Object} options`：属性
  - 返回值 `Promise<baseLayer>`

- **_createArcGisImageryLayer(options)_**

  创建 Arcgis 地图

  - 参数
    - `{Object} options`
      ：属性，详情参考 [ArcGis](http://resource.dvgis.cn/cesium-docs/ArcGisMapServerImageryProvider.html#.ConstructorOptions)
  - 返回值 `Promise<baseLayer>`

- **_createSingleTileImageryLayer(options)_**

  创建单图片地图

  - 参数
    - `{Object} options`
      ：属性，详情参考 [Single](http://resource.dvgis.cn/cesium-docs/SingleTileImageryProvider.html#.ConstructorOptions)
  - 返回值 `Promise<baseLayer>`

- **_createWMSImageryLayer(options)_**

  创建 WMS 地图

  - 参数
    - `{Object} options`
      ：属性，详情参考 [WMS](http://resource.dvgis.cn/cesium-docs/WebMapServiceImageryProvider.html#.ConstructorOptions)
  - 返回值 `Promise<baseLayer>`

- **_createWMTSImageryLayer(options)_**

  创建 WMTS 地图

  - 参数
    - `{Object} options`
      ：属性，详情参考 [WMTS](http://resource.dvgis.cn/cesium-docs/WebMapTileServiceImageryProvider.html#.ConstructorOptions)
  - 返回值 `Promise<baseLayer>`

- **_createXYZImageryLayer(options)_**

  创建 X/Y/Z 地图

  - 参数
    - `{Object} options`
      ：属性，详情参考 [X/Y/Z](http://resource.dvgis.cn/cesium-docs/UrlTemplateImageryProvider.html#.ConstructorOptions)
  - 返回值 `Promise<baseLayer>`

- **_createCoordImageryLayer(options)_**

  创建坐标系地图

  - 参数
    - `{Object} options`：属性
  - 返回值 `Promise<baseLayer>`

- **_createGridImageryLayer(options)_**

  创建网格地图

  - 参数
    - `{Object} options`
      ：属性，详情参考 [Grid](http://resource.dvgis.cn/cesium-docs/GridImageryProvider.html#.ConstructorOptions)
  - 返回值 `Promise<baseLayer>`

- **_createMapboxImageryLayer(options)_**

  创建 Mapbox 地图

  - 参数
    - `{Object} options`
      ：属性，详情参考 [Mapbox](http://resource.dvgis.cn/cesium-docs/MapboxImageryProvider.html#.ConstructorOptions)
  - 返回值 `Promise<baseLayer>`

- **_createMapboxStyleImageryLayer(options)_**

  创建 Mapbox 样式地图

  - 参数
    - `{Object} options`
      ：属性，详情参考 [Mapbox Style](http://resource.dvgis.cn/cesium-docs/MapboxStyleImageryProvider.html#.ConstructorOptions)
  - 返回值 `Promise<baseLayer>`

- **_createTMSImageryLayer(options)_**

  创建 TMS 地图

  - 参数
    - `{Object} options`
      ：属性，详情参考 [TMS](http://resource.dvgis.cn/cesium-docs/TileMapServiceImageryProvider.html#.ConstructorOptions)
  - 返回值 `Promise<baseLayer>l`

- **_createImageryLayer(type, options)_**

  根据类型创建地图

  - 参数
    - `{String} type`：类型，参考：DC.ImageryType
    - `{Object} options`：属性
  - 返回值 `Promise<baseLayer>`

```js
// options（属性可选）
const options = {
  "url": "", //地址：arcgis/wmts/xyx/single 有效
  "style": "img", //样式：img、elec、ter。百度：normal，dark，腾讯：img,1、4
  "key": "", //认证，仅天地图有效
  "subdomains": [],
  "crs": "WGS84", // 坐标系: WGS84 、BD09 、GCJ02，仅百度、高德有效
  "protocol": null, // http、https
  "tilingScheme": null, // 瓦片切片模式：GeographicTilingScheme , WebMercatorTilingScheme
  "rectangle": {
    "west": 0,
    "south": 0,
    "east": 0,
    "north": 0
  }// 瓦片范围，有west，south，east，north 单位为: 弧度，使用经纬度时需将转为弧度
}
```

## DC.TerrainFactory

> 地形工厂, 用于创建地形

### example

```js
let terrain = DC.TerrainFactory.createUrlTerrain({
  url: '****/***',
})
viewer.setTerrain(terrain)
```

### static methods

- **_createEllipsoidTerrain()_**

  创建默认地形

  returns `Promise<terrain>`

- **_createUrlTerrain(options)_**

  根据 url 创建地形

  - 参数
    - `{Object} options`：属性
  - 返回值 `Promise<terrain>`

- **_createGoogleTerrain(options)_**

  创建谷歌地形

  - 参数
    - `{Object} options`：属性
  - 返回值 `Promise<terrain>`

- **_createTdtTerrain(options)_**

  创建天地图 DEM 地形，等价于 `createTerrain(DC.TerrainType.TDT, options)`。
  与 `ImageryType.TDT` 的 `style: 'ter'` 地形底图不同，此服务提供实际高程。

  ```js
  viewer.setTerrain(
    DC.TerrainFactory.createTdtTerrain({ key: 'YOUR_TIANDITU_KEY' })
  )
  ```

  | 参数 | 类型 | 默认值 | 说明 |
  | --- | --- | --- | --- |
  | key | String | `''` | 天地图 Key；也接受 `token`，同时传入时以 `key` 为准 |
  | url | String / Resource | 天地图 `swdx` 服务 | 自定义模板支持 `{s}`、`{x}`、`{y}`、`{z}`、`{key}`、`{token}`；自定义地址自行提供鉴权参数 |
  | subdomains | String / String[] | `'01234567'` | 子域名字符或名称列表 |
  | dataType | String | `'int16'` | 小端有符号 `int16` 或 `float`（Float32） |
  | worker | Boolean | `true` | 使用后台线程解压与重采样；设为 `false` 时逐瓦片在主线程处理 |
  | workerUrl | String | `DC.config.baseUrl + 'Workers/DC/decodeTdtTerrain.js'` | 可选的 Worker 地址，默认使用 SDK 资源目录 |
  | cacheSize | Number | `256` | 已解码 DEM 的 LRU 缓存瓦片数，非负整数；`0` 禁用缓存 |
  | minimumLevel | Number | `5` | Cesium 起始请求层级；更低层级返回零高程 |
  | maximumLevel | Number | `11` | Cesium 最大层级，范围为 `minimumLevel`～`11`；更深层级由 Cesium 上采样 |
  | ellipsoid | Ellipsoid | WGS84 | 地理分块方案所用椭球 |
  | credit | String / Credit | `'天地图'` | 数据来源信息 |
  | proxy | Proxy | 无 | Cesium 代理对象，需提供 `getURL(url)` |

  返回 `Promise<terrain>`。服务层级为 Cesium 层级加一，因此默认请求天地图 L6～L12。

  默认按需启动最多两个解码 Worker，每个 Provider 最多同时处理 32 个网络或解码任务；超出后由 Cesium 延迟重试。压缩数据和结果使用 ArrayBuffer 转移，空闲 30 秒后释放线程。网络请求继续使用 Cesium 调度。
  成功解码的 DEM 按 Provider 独立缓存。命中时跳过请求和解码，为本次地形数据提供独立的高度缓冲；失败和取消的请求不写入缓存。默认最多保留 256 份 64×64 Float32 样本，约 4 MiB，不包含渲染网格和其他运行时内存。该缓存减少移出视野后再次返回时的重复工作，不改变 Cesium 的地形画质、网格缓存上限或原始高程采样。

  构建时会生成 `resources/Workers/DC/decodeTdtTerrain.js`，需随 SDK 资源部署；使用外部 Cesium 资源目录时，可通过 `workerUrl` 指向 SDK 的该文件。CDN 地址需要支持 CORS，跨域 Worker 使用 Blob 模块入口。Worker 不可用、资源加载失败或启动超时会回退到主线程逐瓦片处理；已转移数据后发生线程故障则按瓦片请求失败处理，不会返回错误高程。
  原始 zlib 数据按 150×150 网格解析，采用来源实现的最近邻采样生成 64×64 高程网格。
  超过 `maximumLevel`，或源瓦片请求失败需要父地形回退时，统一使用 Cesium 原生 Worker 将已有网格裁切为子瓦片，避免在主线程为每个子瓦片重复插值完整的 64×64 网格。原始 DEM 仍保留高度图的数据与采样方式，回退不会阻止后续可用源瓦片的请求。裁切不会增加原始 DEM 的精度，存在 Cesium 网格编码的量化误差。`worker: false` 只关闭 DEM 解码 Worker，地形网格仍使用 Cesium Worker，需正常部署 Cesium 的资源目录。
  保留 -2000～10000 米的有限高程值，异常采样值归零；请求、解压或长度错误会使瓦片加载失败，不会伪装成成功加载。

- **_createArcgisTerrain(options)_**

  创建 Arcgis 地形

  - 参数
    - `{Object} options`：属性
  - 返回值 `Promise<terrain>`

- **_createVRTerrain(options)_**

  创建 VR 地形

  - 参数
    - `{Object} options`：属性
  - 返回值 `Promise<terrain>`

- **_createTerrain(type，options)_**

  根据类型创建地形

  - 参数
    - `{String} type`：类型，参考：DC.TerrainType
    - `{Object} options`：属性
  - 返回值 `Promise<terrain>`

```js
// options（属性可选）
const options = {
  "url": "" // 服务地址
}
```
