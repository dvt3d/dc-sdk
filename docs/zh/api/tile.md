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

## CustomMercatorTilingScheme

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

  创建天地图

  - 参数
    - `{Object} options`：属性
  - 返回值 `Promise<baseLayer>`

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
