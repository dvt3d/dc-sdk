# 图层 API 🌎

将具有相同业务逻辑或属性的覆盖元素进行分类，以便于同一管理

## DC.TdtLabelLayer

> 天地图三维地名图层，包含 POI 标签、图标及可选的道路标签，继承自 `DC.Layer`。

```js
const labels = new DC.TdtLabelLayer('tdt-labels', {
  key: 'YOUR_TIANDITU_KEY',
  autoCollide: true,
  serverFirstStyle: true,
}).addTo(viewer)

labels.show = false
labels.show = true
labels.clear() // 清空并暂停加载
labels.refresh() // 清空缓存并恢复加载当前视野
viewer.removeLayer(labels)
viewer.addLayer(labels) // 可重新添加
```

### creation

- **_constructor(id, options)_**
  - `{String} id`：业务标识。
  - `{Object} options`：服务和显示配置，见下表。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| key / token | String | `''` | 天地图 Key；`key` 优先 |
| url | String / Resource | 天地图 `GetTiles` | POI 瓦片模板，支持 `{s}`、`{x}`、`{y}`、`{z}`、`{key}`、`{token}` |
| icoUrl | String / Resource | 天地图 `GetIcon` | 图标模板，额外支持 `{id}`；传入 `''` 禁用图标 |
| subdomains | String / String[] | `'01234567'` | 使用实际的子域名值替换 `{s}` |
| metadata | Object | 全球、L1～L20 | `{ boundBox: { minX, minY, maxX, maxY }, minLevel, maxLevel }`；范围为经纬度，层级为天地图服务层级 |
| roadUrl | String / Resource | 无 | 可选道路 JSON 瓦片地址，支持与 `url` 相同的模板变量 |
| roadMetadata | Object | 全球、L1～L20 | 道路服务的范围和层级，与 `metadata` 格式相同 |
| labelGraphics | Object | 白字黑边 | Cesium LabelGraphics 样式 |
| billboardGraphics | Object | 18×18 图标 | Cesium BillboardGraphics 样式 |
| serverFirstStyle | Boolean | `false` | 优先使用 POI 服务返回的字体、颜色、描边和图标尺寸 |
| autoCollide | Boolean | `false` | 按优先级避让标签和图标；也兼容来源参数 `aotuCollide`，新名称优先 |
| collisionPadding | Number[] | `[0, 0, 0, 0]` | 避让额外边距 `[上, 右, 下, 左]`，单位为 CSS 像素 |
| cacheSize | Number | `256` | 缓存瓦片目标上限，当前可见瓦片保留至离开视野 |
| maximumRequests | Number | `8` | 同时进行的瓦片请求上限 |
| maximumTiles | Number | `128` | 每个服务当前视野最多加载的瓦片数；优先细化屏内区域，预算不足时保留允许请求的粗层级覆盖 |
| maximumLabels | Number | `1000` | 图层显示实体上限，优先保留较小 Priority 值；按场景需要调高 |
| proxy | Proxy | 无 | Cesium 代理对象，需提供 `getURL(url)` |

### properties

继承 `id`、`type`、`show`、`state`、`attr` 和 `delegate`。`delegate` 为此图层独立拥有的 `CustomDataSource`。

- `{Event} errorEvent`：服务请求或解析失败事件，可通过 `labels.errorEvent.addEventListener(({ layer, tile, error }) => {})` 监听；数据源挂载失败时 `tile` 可能为空。

### methods

- **_clear()_**：取消请求、清除缓存和实体，暂停自动加载，返回 `this`。
- **_refresh()_**：清除缓存并恢复当前视野加载，返回 `this`。
- **_addTo(viewer)_**、**_remove()_**：沿用 Layer 挂载与移除方式；移除后可重新添加，Viewer 销毁时自动清理。

图层自行管理服务实体，不支持用 `addOverlay/removeOverlay` 管理业务覆盖物；业务覆盖物放入独立的 `VectorLayer`。
隐藏、清空和移除会取消未完成请求，迟到的响应不会重新添加实体，也不会修改其他图层或相机的 `percentageChanged`。
地名请求层级根据视锥和 CSS 视口尺寸估算。三维场景结合各瓦片的地形高度范围及其距相机的最近距离选择细节：透视近景使用细瓦片，远景使用粗瓦片，避免贴地斜视时仅加载相机脚下。已加载地表高度包含地形夸张效果；贴地时采用正的最小距离，避免浮点误差使层级突然回退。二维、哥伦布和正交场景沿用相应视锥比例尺，无法取得有效比例尺时沿用地形层级。
优先细化视锥内的地表区域；子瓦片超出预算时保留其粗父瓦片覆盖，来源的最小和最大层级仍然生效。屏外区域仅在预算允许时作为后备，为屏内细节让出名额。同一覆盖范围、地形高度和视锥下的选择不受地形瓦片分块和遍历顺序影响。层级切换时，暂时保留重叠区域已加载的标签，新瓦片到齐后再替换，减少加载过程中的闪空。
回退瓦片与新瓦片的总数也受 `maximumTiles × 服务数` 限制；标签数量超过 `maximumLabels` 时按优先级截取。
同一场景更新周期内的瓦片回包合并处理。避让使用屏幕网格、有界文字测量缓存，以及按实体缓存的贴地位置和相对边界；相机移动时复用静态数据，地形加载、字体或实体变化时更新。动态属性和距离显示条件仍按当前帧计算；相机、视口及实体未改变时复用上次结果。支持 Cesium 的 `requestRenderMode`。
加载进度通知会合并处理，加载期间静态贴地位置的刷新间隔为 250 毫秒；加载完成、地形切换或图层重新显示时，在下一次场景更新中立即刷新。不依赖地形的静态位置继续复用缓存，动态位置和动态高度模式仍逐帧计算。
地名文字和图标默认设置 `disableDepthTestDistance: Number.POSITIVE_INFINITY`，避免低角度斜视时被地形裁剪；地球背面的地名仍会隐藏，且不依赖 `autoCollide`。如需让地形或模型遮挡地名，可分别在 `labelGraphics`、`billboardGraphics` 中将 `disableDepthTestDistance` 设为 `0`。
负高程地名关闭深度检测时，仅使用椭球表面位置判断地平线，保留实际显示高度；高空地名仍按实际位置判断。文字和图标分别处理高度参考、深度距离和 `eyeOffset`，被地平线裁剪的部分不占用避让空间。动态深度参数、场景默认值或椭球变化在相机静止时也会更新判断，并复用静态位置和文字尺寸缓存。
当前 Cesium 版本中，显式 `disableDepthTestDistance: 0` 使用场景的 `minimumDisableDepthTestDistance`，场景默认值为 `0` 时始终启用深度检测；`Infinity` 始终关闭深度检测。显式 `undefined` 保持原生默认行为，不强制继承场景值。
开启 `autoCollide` 时，默认仅按文字和图标的估算边界避让，不额外扩大间距，避免“渤海”等按单字返回的地名在旋转后因空白边距重叠而缺字。需要更宽间距时可显式设置 `collisionPadding`；边界实际重叠时仍按优先级隐藏标签。

### 服务格式与兼容范围

- POI 使用来源插件的 19 字节头、9 字节尾及 proto2 瓦片格式，兼容 V1～V3 共有及可选字段；64 位 ID 保持字符串精度。道路格式为 `[{ LabelPoint: { X, Y, Z }, Feature: { properties: { Name } } }]`。
- 渲染点型地名；线、面 POI 几何不作为业务线面绘制。高度类型支持贴地、海平面、相对地面和绝对高度。
- 避让使用 CSS 像素估算字体与图标边界，优先保留较小的 Priority 值。自定义旋转图标、背景、特殊字体的估算范围可能与实际像素有差异。
- 地名服务使用地理瓦片及从一开始的层级。为确定当前地表覆盖范围，仅在此图层内部读取 Cesium 的 `_surface._tilesToRender`；升级 Cesium 时需重跑对应浏览器回归。不修改 Cesium 全局对象，也不加载来源插件的引擎补丁。
- 默认服务需要具有对应权限的天地图 Key。自定义 `url`、`icoUrl`、`roadUrl` 自行提供鉴权模板。已有的二维影像及注记继续使用 `ImageryLayerFactory.createTdtImageryLayer()`；叠加三维地名时可省略二维注记以避免重复。
- 默认 POI 请求为 `GetTiles?lxys={z},{x},{y}&VERSION=1.0.0&tk={key}`，`lxys` 依次是服务层级、列号、行号，保留逗号分隔符。默认地址使用 `Resource({ url, parseUrl: false })` 保持该格式，Key 等模板值仍会转义。自定义服务地址需自行提供对应的版本等参数。

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
      ：属性配置，[详细使用说明](http://resource.dvgis.cn/cesium-docs/GeoJsonDataSource.html)
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
      ：属性配置，[详细使用说明](http://resource.dvgis.cn/cesium-docs/GeoJsonDataSource.html)
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
    - `{Object} options`：属性配置 [详细使用说明](http://resource.dvgis.cn/cesium-docs/CzmlDataSource.html)
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
    - `{Object} options`：属性配置，[详细使用说明](http://resource.dvgis.cn/cesium-docs/KmlDataSource.html)
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
    - `{Object} options`：属性配置，[详细使用说明](http://resource.dvgis.cn/cesium-docs/GpxDataSource.html)
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
    - `{Object} option`：echarts 配置，[详细使用说明](https://www.echartsjs.com/zh/option.html#title)
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
    - `{Object} option`：echarts 配置，[详细使用说明](https://www.echartsjs.com/zh/option.html#title)
  - 返回值 `this`
