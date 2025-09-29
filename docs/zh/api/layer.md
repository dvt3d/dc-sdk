# 图层 API 🌎

将具有相同业务逻辑或属性的覆盖元素进行分类，以便于同一管理

## DC.Layer

> 图层的基类，其子类是实例化后需添加到三维场景中方可展示各类三维数据

:::warning
该基本类无法实例化，既视实例化后也无法使用
:::

### properties

- `{String} id`：唯一标识 **_`readonly`_**
- `{Boolean} show`：是否显示
- `{Object} attr`：业务属性
- `{String} state`：图层状态 **_`readonly`_**
- `{String} type`：图层类型 **_`readonly`_**

### methods

- **_addOverlay(overlay)_**

  添加覆盖物

  - 参数
    - `{Overlay} overlay`：覆盖物
  - 返回值 `this`

- **_addOverlays(overlays)_**

  添加覆盖物数组

  - 参数
    - `{Array<Overlay>} overlays`：覆盖物数组
  - 返回值 `this`

- **_removeOverlay(overlay)_**

  删除覆盖物

  - 参数
    - `{Overlay} overlay`：覆盖物
  - 返回值 `this`

- **_getOverlay(overlayId)_**

  根据 Id 获取覆盖物`(不推荐用)`

  - 参数
    - `{String} overlayId`：覆盖物唯一标识(默认产生)
  - 返回值 `overlay`

- **_getOverlayById(Id)_**

  根据业务 Id 获取覆盖物`(推荐用)`

  - 参数
    - `{String} Id`：覆盖物业务唯一标识
  - 返回值 `overlay`

- **_getOverlaysByAttr(attrName, attrVal)_**

  根据覆盖物属性获取覆盖物

  - 参数
    - `{String} attrName`：属性名称
    - `{Object} attrVal`：属性值
  - 返回值 `array`

  ```js
  overlay.attr.name = 'test' //设置覆盖物的属性
  let arr = layer.getOverlaysByAttr('name', 'test') //根据属性获取覆盖物
  ```

- **_getOverlays()_**

  获取所有覆盖物

  - 返回值 `array`

- **_eachOverlay(method, context)_**

  遍历覆盖物

  - 参数
    - `{Function} method`：回调函数，参数为每一个覆盖物
    - `{Object} context`：上下文
  - 返回值 `this`

  ```js
  layer.eachOverlay((item) => {})
  ```

- **_clear()_**

  清空图层

  - 返回值 `this`

- **_remove()_**

  删除图层

  - 返回值 `this`

- **_addTo(viewer)_**

  添加图层到场景

  - 参数
    - `{Viewer|World} viewer`：场景
  - 返回值 `this`

- **_on(type, callback, context)_**

  事件订阅

  - 参数
    - `{Object} type` ：订阅类型
    - `{Function} callback` ：订阅回调
    - `{Object} context` ：上下文
  - 返回值 `this`

- **_off(type, callback, context)_**

  取消事件订阅

  - 参数
    - `{Object} type` ：订阅类型
    - `{Function} callback` ：订阅回调
    - `{Object} context` ：上下文
  - 返回值 `this`

- **_fire(type,params)_**

  触发事件

  - 参数
    - `{Object} type` ：订阅类型
    - `{Object} params` ：参数
  - 返回值 `this`

### static methods

- **_registerType(type)_**

  注册图层类型

  - 参数
    - `{String} type`：图层类型

- **_getLayerType()_**

  获取图层类型

  - 返回值 `string`

## DC.LayerGroup

> 图层组，将图层按一定的逻辑分组，方便统一管理

### example

```js
let layerGroup = new DC.LayerGroup('id')
viewer.addLayerGroup(layerGroup)
let layer = new DC.VectorLayer('layer')
layerGroup.addLayer(layer)
```

### creation

- **_constructor(id)_**

  构造函数

  - 参数
    - `{String} id`：图层组唯一标识
  - 返回值 `layerGroup`

### properties

- `{String} id`：唯一标识 **_`readonly`_**
- `{Boolean} show`：是否显示
- `{String} type`：图层类型 **_`readonly`_**

### methods

- **_addLayer(layer)_**

  添加图层

  - 参数
    - `{Layer} layer`：图层
  - 返回值 `this`

- **_removeLayer(layer)_**

  删除图层

  - 参数
    - `{Layer} layer`：图层
  - 返回值 `this`

- **_getLayer(id)_**

  获取图层

  - 参数
    - `{String} id`：图层 ID
  - 返回值 `layer`

- **_getLayers()_**

  获取所有图层，不包括地图

  - 返回值 `layer`

- **_remove()_**

  删除图层组

  - 返回值 `this`

- **_addTo(viewer)_**

  添加图层到场景

  - 参数
    - `{Viewer|World} viewer`：场景
  - 返回值 `this`

## DC.VectorLayer

> 矢量图层，用于添加各类矢量数据（点、线、面等），将矢量数据按一定的逻辑分组，方便统一管理，继承于[Layer](#dc-layer)

### example

```js
let layer = new DC.VectorLayer('id')
viewer.addLayer(layer)
```

### creation

- **_constructor(id)_**

  构造函数

  - 参数
    - `{String} id`：图层唯一标识
  - 返回值 `vectorLayer`

## DC.DynamicLayer

> 动态图层，用于添加各类动态矢量数据（图标、模型等），将矢量数据按一定的逻辑分组，方便统一管理，继承于[Layer](#dc-layer)

### example

```js
let layer = new DC.DynamicLayer('id')
viewer.addLayer(layer)
```

### creation

- **_constructor(id)_**

  构造函数

  - 参数
    - `{String} id`：图层唯一标识
  - 返回值 `dynamicLayer`

## DC.PrimitiveLayer

> 图元图层，用于添加各类图元数据，将图元数据按一定的逻辑分组，方便统一管理，继承于[Layer](#dc-layer)

### example

```js
let layer = new DC.PrimitiveLayer('id')
viewer.addLayer(layer)
```

### creation

- **_constructor(id)_**

  构造函数

  - 参数
    - `{String} id`：图层唯一标识
  - 返回值 `primitiveLayer`

## DC.GroundPrimitiveLayer

> 贴地图元图层，用于添加各类贴地图元数据，将贴地图元数据按一定的逻辑分组，方便统一管理，继承于[Layer](#dc-layer)

### example

```js
let layer = new DC.GroundPrimitiveLayer('id')
viewer.addLayer(layer)
```

### creation

- **_constructor(id)_**

  构造函数

  - 参数
    - `{String} id`：图层唯一标识
  - 返回值 `groundPrimitiveLayer`

## DC.TilesetLayer

> 3dTiles 图层，用于添加 3dTiles 模型数据， 继承于[Layer](#dc-layer)

### example

```js
let layer = new DC.TilesetLayer('id')
viewer.addLayer(layer)
```

### creation

- **_constructor(id)_**

  构造函数

  - 参数
    - `{String} id`：图层唯一标识
  - 返回值 `tilesetLayer`

## DC.GeoJsonLayer

> GeoJson 图层，用于加载 GeoJson 格式数据，继承于[Layer](#dc-layer)，

### example

```js
let layer = new DC.GeoJsonLayer('id', '**/**.geojson')
layer.eachOverlay((item) => {
  // item 为一个entity,
  if (item.polyline) {
    //todo
    let polyline = DC.Polyline.fromEntity(item)
  }
  if (item.polygon) {
    //todo
    let polygon = DC.Polygon.fromEntity(item)
  }
  if (item.billboard) {
    //todo
    let point = DC.Point.fromEntity(item)
    let divIcon = DC.DivIcon.fromEntity(item)
    let billboard = DC.Billboard.fromEntity(item)
  }
})
```

### creation

- **_constructor(id,url,[options])_**

  构造函数

  - 参数
    - `{String} id`：图层唯一标识
    - `{String} url`：数据地址
    - `{Object} options`
      ：属性配置，详情参考：[GeoJsonDataSource](http://resource.dvgis.cn/cesium-docs/GeoJsonDataSource.html)
  - 返回值 `geoJsonLayer`

### methods

- **_toVectorLayer()_**

  转换为矢量图层

  - 返回值 `vectorLayer`

- **_toModelLayer(modelUrl)_**

  转换为模型图层

  - 参数
    - `{String} modelUrl`：模型地址
  - 返回值 `vectorLayer`

## DC.TopoJsonLayer

> TopoJson 图层，用于加载 TopoJson 格式数据，继承于[Layer](#dc-layer)，

### example

```js
let layer = new DC.GeoJsonLayer('id', '**/**.geojson')
layer.eachOverlay((item) => {
  // item 为一个entity,
  if (item.polyline) {
    //todo
    let polyline = DC.Polyline.fromEntity(item)
  }
  if (item.polygon) {
    //todo
    let polygon = DC.Polygon.fromEntity(item)
  }
  if (item.billboard) {
    //todo
    let point = DC.Point.fromEntity(item)
    let divIcon = DC.DivIcon.fromEntity(item)
    let billboard = DC.Billboard.fromEntity(item)
  }
})
```

### creation

- **_constructor(id,url,[options])_**

  构造函数

  - 参数
    - `{String} id`：图层唯一标识
    - `{String} url`：数据地址
    - `{Object} options`
      ：属性配置，详情参考：[GeoJsonDataSource](http://resource.dvgis.cn/cesium-docs/GeoJsonDataSource.html)
  - 返回值 `topoJsonLayer`

### methods

- **_toVectorLayer()_**

  转换为矢量图层

  - 返回值 `vectorLayer`

- **_toModelLayer(modelUrl)_**

  转换为模型图层

  - 参数
    - `{String} modelUrl`：模型地址
  - 返回值 `vectorLayer`

## DC.HtmlLayer

> Html 图层，用于加载 DivIcon 节点，继承于[Layer](#dc-layer)，

### example

```js
let layer = new DC.HtmlLayer('dom')
viewer.addLayer(layer)
```

### creation

- **_constructor(id)_**

  构造函数

  - 参数
    - `{String} id`：图层唯一标识
  - 返回值 `htmlLayer`

## DC.CzmlLayer

> Czml 图层，用于加载 Czml 数据，继承于[Layer](#dc-layer)

### example

```js
let layer = new DC.CzmlLayer('id', '**/**.czml')
layer.eachOverlay((item) => {
  if (item.polyline) {
    //todo
  }
  if (item.polygon) {
    //todo
  }
  if (item.billboard) {
    //todo
  }
})
```

### creation

- **_constructor(id,url,[options])_**

  构造函数

  - 参数
    - `{String} id`：图层唯一标识
    - `{String} url`：数据地址
    - `{Object} options`：属性配置，详情参考：[CzmlDataSource](http://resource.dvgis.cn/cesium-docs/CzmlDataSource.html)
  - 返回值 `czmlLayer`

## DC.KmlLayer

> Kml 图层，用于加载 Kml 数据，继承于[Layer](#dc-layer)

### example

```js
let layer = new DC.KmlLayer('id', '**/**.kml')
layer.eachOverlay((item) => {
  if (item.polyline) {
    //todo
  }
  if (item.polygon) {
    //todo
  }
  if (item.billboard) {
    //todo
  }
})
```

### creation

- **_constructor(id,url,[options])_**

  构造函数

  - 参数
    - `{String} id`：图层唯一标识
    - `{String} url`：数据地址
    - `{Object} options`：属性配置，详情参考：[KmlDataSource](http://resource.dvgis.cn/cesium-docs/KmlDataSource.html)
  - 返回值 `kmlLayer`

## DC.GpxLayer

> GPX 图层，用于加载 gpx 数据，继承于[Layer](#dc-layer)

### example

```js
let layer = new DC.GpxLayer('id', '**/**.gpx')
```

### creation

- **_constructor(id,url,[options])_**

  构造函数

  - 参数
    - `{String} id`：图层唯一标识
    - `{String} url`：数据地址
    - `{Object} options`：属性配置，详情参考：[GpxDataSource](http://resource.dvgis.cn/cesium-docs/GpxDataSource.html)
  - 返回值 `gpxLayer`

## DC.ClusterLayer

> 聚合图层，继承于[Layer](#dc-layer)

### example

```js
let layer = new DC.ClusterLayer('id', { image: '' })
viewer.addLayer(layer)
```

### creation

- **_constructor(id,[options])_**

  构造函数

  - 参数
    - `{String} id`：图层唯一标识
    - `{Object} options`：属性配置
  - 返回值 `clusterLayer`

```js
// options(属性可选)
const options = {
  "radius": 40,//像素范围
  "maxZoom": 25,
  "image": "<单个点图片地址>",
  "style": "circle", // circle 、 clustering 、custom
  "gradientColors": {
    "0.0001": DC.Color.DEEPSKYBLUE,
    "0.001": DC.Color.GREEN,
    "0.01": DC.Color.ORANGE,
    "0.1": DC.Color.RED
  },//幅度颜色设置
  "gradientImages": {},//幅度图片设置，仅当style为custom有效
  "clusterSize": 16, //集合图标尺寸
  "fontSize": 12,// 字体大小
  "fontColor": DC.Color.BLACK, //字体颜色
  "getCountOffset": (count) => {
    return { x: 0, y: 0 }
  } //字体偏移函数
}
```

### methods

- **_setPoints(points)_**

  设置点位

  - 参数
    - `{Array<Object>} points`：点位信息
  - 返回值 `clusterLayer`

## DC.HeatMapLayer

> 热区图层，继承于[Layer](#dc-layer)

### example

```js
let layer = new DC.HeatMapLayer('layer')
viewer.addLayer(layer)
```

### creation

- **_constructor(id,bounds,[options])_**

  构造函数

  - 参数
    - `{String} id`：图层唯一标识
    - `{Object} options`：属性配置
  - 返回值 `heatMapLayer`

```js
// options(属性可选)
const options = {
  "gradient": {
    "0.5": "green",
    "0.6": "orange",
    "0.95": "red"
  },//颜色设置
  "height": 0,// 高度
  "radius": 30, // 半径
  "useGround": false,//是否使用贴地模式
  "classificationType": 2//分类 是否影响地形，3D切片或同时影响这两者。0:地形、1:3D切片、2：两者。贴地模式下生效
}
```

### methods

- **_setPoints(points)_**

  设置点位

  - 参数
    - `{Array<Object>} points`：点位信息
  - 返回值 `heatMapLayer`

```js
// 点位信息参数
const point = {
  "lng": "",//经度
  "lat": "", //纬度
  "value": 10//强度
}
```

## DC.WindLayer

> 风向图层，继承于[Layer](#dc-layer)

### example

```js
let layer = new DC.WindLayer('id')
viewer.addLayer(layer)
```

### creation

- **_constructor(id,[options])_**

  构造函数

  - 参数
    - `{String} id`：图层唯一标识
    - `{Object} options`：属性配置
  - 返回值 `windLayer`

```js
//options(属性可选)
const options = {
  "globalAlpha": 0.9,//透明度
  "lineWidth": 1,// 线宽
  "colorScale": "#fff",//颜色
  "velocityScale": 1 / 25,
  "maxAge": 90,
  "paths": 800,// 路径数
  "frameRate": 20,
  "useCoordsDraw": true,
  "gpet": true
}
```

### methods

- **_setData(data,[options])_**

  设置风向数据

  - 参数
    - `{Object} data`：风向数据
    - `{Object} options`：配置信息，参考构造函数的配置信息
  - 返回值 `windLayer`

- **_setOptions(options)_**

  设置风向数据

  - 参数
    - `{Object} options`：配置信息，参考构造函数的配置信息
  - 返回值 `windLayer`

## DC.ChartLayer

> 图表图层，继承于[Layer](#dc-layer)

### example

```js
let chartLayer = new DC.ChartLayer('layer')
viewer.addLayer(chartLayer)
```

:::warning
图表图层依赖于 echarts 库，使用前请确保全局变量中能够获取到 echarts
:::

### creation

- **_constructor([id],[option])_**

  构造函数

  - 参数
    - `{String} id`：唯一标识
    - `{Object} option`：echarts 配置，详情参考：[echarts](https://www.echartsjs.com/zh/option.html#title)
  - 返回值 `chartLayer`

```js
// options，其他的参数参考 echarts
const options = {
  "animation": false,  // 必须要加
  "GLMap": {},  //地图
  "series": [
    {
      "coordinateSystem": "GLMap" // 坐标系统
    }
  ]
}
```

### methods

- **_setOption(option)_**

  设置点位

  - 参数
    - `{Object} option`：echarts 配置，详情参考：[echarts](https://www.echartsjs.com/zh/option.html#title)
  - 返回值 `this`
