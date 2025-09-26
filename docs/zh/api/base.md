# 基础 API 🌎

## DC.Viewer

> 3D 场景主要接口，在给定的 DivId 中构建三维场景

### example

```html

<div id="viewer-container"></div>
```

```js
let viewer = DC.Viewer('viewer-container')
global.viewer = viewer // 添加到全局变量
```

:::warning
如果开发使用的是 Vue 这样的 MVVM 框架，不要将 viewer、layer、overlay 添加到数据模型中。由于 3D
场景中会不停的刷新每一帧，如果将数据添加到数据模型中，长时间的话会导致浏览器的压力增大而奔溃。
:::

### creation

- **_constructor(container,[options])_**

  构造函数

  - 参数
    - `{String | Cesium.Viewer } container`：容器
    - `{Object} options`：属性
  - 返回值 `viewer`

```js
//属性参数（可选）
const config = {
  "contextOptions": {
    "webgl": {
      "alpha": false, //背景
      "depth": true,
      "stencil": false,
      "antialias": true,
      "powerPreference": "high-performance",
      "premultipliedAlpha": true,
      "preserveDrawingBuffer": false,
      "failIfMajorPerformanceCaveat": false
    },
    "allowTextureFilterAnisotropic": true
  },
  "sceneMode": 3,
  //1: 2.5D，2: 2D，3: 3D
  "enableEventPropagation": false,
  //是否开启鼠标事件冒泡
  "enableMouseMovePick": false,
  // 是否开启鼠标移动拾取功能，开启后当覆盖物较多的情况下，帧率会下降
  "enableMouseOver": false
  //是否开启鼠标移入事件，需要开启鼠标移动拾取功能
}
```

### properties

- `{Element} container`：场景容器 **_`readonly`_**
- `{Element} widgetContainer`：场景组件容器 **_`readonly`_**
- `{Element} layerContainer`：场景图层容器 **_`readonly`_**
- `{Object} scene`：场景 **_`readonly`_**，详情参考：[Scene](http://resource.dvgis.cn/cesium-docs/Scene.html)
- `{Object} camera`：相机 **_`readonly`_**，详情参考：[Camera](http://resource.dvgis.cn/cesium-docs/Scene.html)
- `{Element} canvas`：canvas 节点 **_`readonly`_**
- `{Object} clock`：时钟，详情参考：[Clock](http://resource.dvgis.cn/cesium-docs/Clock.html)
- `{Object} dataSources`
  ：数据资源集合，详情参考：[DataSourceCollection](http://resource.dvgis.cn/cesium-docs/DataSourceCollection.html)
- `{Object} imageryLayers`
  ：瓦片集合，详情参考：[ImageryLayerCollection](http://resource.dvgis.cn/cesium-docs/ImageryLayerCollection.html)
- `{Object} entities`：实体集合，详情参考：[EntityCollection](http://resource.dvgis.cn/cesium-docs/EntityCollection.html)
- [`{Popup} popup`](#popup)：气泡窗口 **_`readonly`_**
- [`{ContextMenu} contextMenu`](#contextmenu)：右击弹框 **_`readonly`_**
- [`{Tooltip} tooltip`](#tooltip)：提示框 **_`readonly`_**
- [`{MapSplit} mapSplit`](#mapsplit)：地图分割 **_`readonly`_**
- [`{TilesetSplit} tilesetSplit`](#tilesetsplit)：模型分割 **_`readonly`_**
- [`{SceneSplit} sceneSplit`](#scenesplit)：场景分割 **_`readonly`_**
- [`{Compass} compass`](#compass)：罗盘 **_`readonly`_**
- [`{ZoomController} zoomController`](#zoomcontroller)：罗盘 **_`readonly`_**
- [`{LocationBar} locationBar`](#locationbar)：坐标信息 **_`readonly`_**
- [`{DistanceLegend} distanceLegend`](#distancelegend)：比例尺 **_`readonly`_**
- [`{LoadingMask} loadingMask`](#loadingmask)：加载蒙层 **_`readonly`_**
- `{Position} cameraPosition`：相机位置 **_`readonly`_**
- `{Number} resolution`：分辨率 **_`readonly`_**
- `{Number} zoom`: 当前层级 **_`readonly`_**
- `{Rect} viewBounds`：视野范围 **_`readonly`_**
- `{Boolean} enableEventPropagation`: 是否开启鼠标事件冒泡
- `{Boolean} enableMouseMovePick`: 是否开启鼠标移动拾取功能，开启后当覆盖物较多的情况下，帧率会下降
- `{Boolean} enableMouseOver`: 是否开启鼠标移入事件，需要开启鼠标移动拾取功能

### methods

- **_setOptions(options)_**

  设置属性

  - 参数
    - `{Object} options`：属性对象
      - 返回值 `this`

```js
// 属性参数(可选)
const config = {
  "shadows": false,// 是否开启阴影
  "resolutionScale": 1,// 设置渲染分辨率的缩放比例
  "showAtmosphere": true,//是否显示大气层
  "showSun": true,//是否显示太阳
  "showMoon": true, //是否显示月亮
  "enableFxaa": true,//是否开启抗锯齿
  "msaaSamples": 1,//msaa抗拒出取样度
  "cameraController": { // 相机控制
    "enableRotate": true,// 是否可以旋转
    "enableTilt": true,// 是否可以翻转
    "enableTranslate": true,// 是否可以平移
    "enableZoom": true,// 是否可以缩放
    "enableCollisionDetection": true,// 是否支持碰撞检测
    "minimumZoomDistance": 1.0,// 最小缩放距离
    "maximumZoomDistance": 40489014.0// 最大缩放距离
  },
  "globe": {
    "show": true,// 是否显示地球
    "showGroundAtmosphere": true,// 显示地面大气
    "enableLighting": false,//是否开启灯光，开启后地球会根据当前时间启用灯光
    "depthTestAgainstTerrain": false, //是否开启深度测试
    "tileCacheSize": 100, // 默认瓦片缓存大小
    "preloadSiblings": false,//是否应预加载渲染同级图块
    "terrainExaggeration": 1,//地形夸张系数
    "terrainExaggerationRelativeHeight": 1,//地形相对高度夸张系数
    "baseColor": new DC.Color(0, 0, 0.5, 1), //地球默认底色
    "filterColor": newDC.Color(0, 0, 0, 0),//瓦片过滤色,设置后不可逆
    "translucency": { //地表透明
      "enabled": false, // 是否开启地表透明
      "backFaceAlpha": 1,  // 地球背面透明度
      "backFaceAlphaByDistance": null, //根据距离设置地球背面透明度: {near:400,nearValue:0.2,far:800,farValue:1}
      "frontFaceAlpha": 1,  // 地球正面透明度
      "frontFaceAlphaByDistance": null //根据距离设置地球正面透明度: {near:400,nearValue:0.2,far:800,farValue:1}
    }
  },
  "skyBox": {
    "sources": {}, // 六个面的贴图
    "show": true, //是否显示
    "offsetAngle": 0 //旋转角度
  }
}
```

- **_setPitchRange(min,max)_**

  设置翻转角度

  - 参数
    - `{Number} min`：最小角度
    - `{Number} max`：最大角度
  - 返回值 `this`

- **_changeSceneMode(sceneMode, duration)_**

  改变场景模式

  - 参数
    - `{Number} sceneMode`：场景模式 ，2：2D，3：3D，2.5：2.5D
    - `{Number} duration`：间隔时间
  - 返回值 `this`

- **_changeMouseMode(mouseMode)_**

  改变鼠标使用模式

  - 参数
    - `{Number} mouseMode`：鼠标模式，详情参考：`DC.MouseMode`
  - 返回值 `this`

- **_addBaseLayer(baseLayers,options)_**

  添加地图

  - 参数
    - `{baseLayer|Array<baseLayer>} baseLayers`：地图
    - `{Object} options`：属性
  - 返回值 `this`

```js
//属性参数 (可选)
const options = {
  "name": "电子地图",//名称
  "iconUrl": "../preview.png",//缩略图
  "alpha": 1.0,
  "nightAlpha": 1.0,
  "dayAlpha": 1.0,
  "brightness": 1.0,
  "contrast": 1.0,
  "hue": 1.0,
  "saturation": 1.0,
  "gamma": 1.0
}
```

- **_changeBaseLayer(index)_**

  更改地图

  - 参数
    - `{Number} index`：地图索引
  - 返回值 `this`

- **_getImageryLayerInfo(windowPosition)_**

  获取瓦片信息

  - 参数
    - `{Object} windowPosition`：窗口坐标
  - 返回值 `promise`

- **_setTerrain(terrain)_**

  设置地形

  - 参数
    - `{Terrain} terrain`：地形
  - 返回值 `this`

- **_addLayerGroup(layerGroup)_**

  添加图层组

  - 参数
    - `{LayerGroup} layerGroup`：图层组
  - 返回值 `this`

- **_removeLayerGroup(layerGroup)_**

  移除图层组

  - 参数
    - `{LayerGroup} layerGroup`：图层组
  - 返回值 `this`

- **_getLayerGroup(id)_**

  获取图层组

  - 参数
    - `{String} id`：图层组 ID
  - 返回值 `layerGroup`

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

- **_eachLayer(method, context)_**

  遍历所有图层

  - 参数
    - `{Function} method`：回调函数
    - `{Object} context`：上下文，默认为 this
  - 返回值 `this`

  ```js
  viewer.eachLayer((layer) => {})
  ```

- **_flyTo(target,duration)_**

  飞向目标

  - 参数
    - `{VectorLayer|Overlay} target` ：目标
    - `{Number} duration`：飞到位置时间，单位：秒
  - 返回值 `this`

- **_zoomTo(target)_**

  缩放到目标

  - 参数
    - `{VectorLayer|Overlay} target` ：目标
  - 返回值 `this`

- **_flyToPosition(position, completeCallback, duration)_**

  飞到具体位置

  - 参数
    - `{Position} position`：位置
    - `{Function} completeCallback`：飞完之后触发的回调
    - `{Number} duration`：飞到位置时间，单位：秒
  - 返回值 `this`

- **_zoomToPosition(position, completeCallback)_**

  缩放到具体位置

  - 参数
    - `{DC.Position} position`：位置
    - `{Function} completeCallback`：缩放完成后触发的回调
  - 返回值 `this`

- **_flyToBounds(bounds,{heading,pitch,roll}, completeCallback, duration)_**

  飞到指定的范围

  - 参数
    - `{String|Array} bounds`：范围，格式:[minX,minY,maxX,maxY]
    - `{Object} hpr`：方位角
    - `{Function} completeCallback`：飞完之后触发的回调
    - `{Number} duration`：飞到位置时间，单位：秒
  - 返回值 `this`

- **_zoomToBounds(bounds,{heading,pitch,roll}, completeCallback)_**

  缩放到指定的范围

  - 参数
    - `{String|Array} bounds`：范围，格式:[minX,minY,maxX,maxY]
    - `{Object} hpr`：方位角
    - `{Function} completeCallback`：缩放完之后触发的回调
  - 返回值 `this`

- **_on(type, callback, context)_**

  事件订阅

  - 参数
    - `{Object} type` ：订阅类型
    - `{Function} callback` ：订阅回调
    - `{Object} context` ：上下文
  - 返回值 `this`

- **_once(type, callback, context)_**

  事件订阅(一次)

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

- **_destroy()_**

  销毁三维场景

  - 返回值 `this`

- **_exportScene(name)_**

  导出场景

  - 参数
    - `{String} name` ：名称，默认为 scene
  - 返回值 `this`

## Popup

> 气泡窗口

### example

```js
let popup = viewer.popup
popup.setContent('<div></div>')
```

### properties

- `{String} state`：状态 **_`readonly`_**
- `{Object} config`：配置 **_`writeOnly`_**

```js
// 配置（可选),配置后会影响全局的popup的显示样式，请慎重。
const config = {
  "position": "center",// popup的位于鼠标的点击位置的方向,有：center，left ，right
  "customClass": "custom"// 添加自定义的Css 类名到popup中，多个用空格隔开
}
```

### methods

- **_setPosition(position)_**

  设置位置

  - 参数
    - `{Cartesian3} position`：世界坐标
  - 返回值 `this`

- **_setContent(content)_**

  设置内容

  - 参数
    - `{String|Element} content`：内容
  - 返回值 `this`

- **_setWrapper(wrapper)_**

  设置容器

  - 参数
    - `{Element} wrapper`：容器 **_`(一般用于 MVVM 框架的模板)`_**
  - 返回值 `this`

- **_showAt(position, content)_**

  设置内容

  - 参数
    - `{Cartesian3} position`：世界坐标
    - `{String|Element} content`：内容
  - 返回值 `this`

- **_hide()_**

  隐藏气泡窗口

  - 返回值 `this`

## ContextMenu

> 右击菜单

### example

```js
let contextMenu = viewer.contextMenu
contextMenu.enable = true
contextMenu.DEFAULT_MENU = [
  {
    label: '测试',
    callback: (e) => {
    }, // e是一个对象主要包括 windowPosition,position,surfacePosition,overlay
    context: this,
  },
] // 设置默认的右击菜单，会影响全局右击菜单(慎用)。
```

### properties

- `{Boolean} enable`：是否启用
- `{String} state`：状态 **_`readonly`_**
- `{Array} DEFAULT_MENU`：默认菜单，菜单的回调函数参数为一个对象 **_`writeOnly`_**

## Tooltip

> 提示框

### example

```js
let tooltip = viewer.tooltip
tooltip.enable = true
tooltip.showAt({ x: 100, y: 100 }, '测试')
```

### properties

- `{Boolean} enable`：是否启用
- `{String} state`：状态 **_`readonly`_**

### methods

- **_showAt(position,content)_**

  设置位置

  - 参数
    - `{Cartesian2} position`：屏幕坐标
    - `{String|Element} content`：内容
  - 返回值 `this`

## MapSplit

> 地图分割

### examples

```js
let baseLayer_elc = DC.ImageryLayerFactory.createGoogleImageryLayer()
viewer.mapSplit.enable = true
viewer.mapSplit.addBaseLayer(baseLayer_elc, -1)
```

### properties

- `{Boolean} enable`：是否启用
- `{String} state`：状态 **_`readonly`_**

### methods

- **_addBaseLayer(baseLayer,[splitDirection])_**

  添加地图

  - 参数
    - `{BaseLayer} baseLayer`：地图
    - `{Number} splitDirection`：分割方向，-1：左，0：无，1：右
  - 返回值 `this`

## TilesetSplit

> 模型分割

### examples

```js
let tileset = new DC.Tileset('**/tileset.json')
tileset.setSplitDirection(1)
viewer.tilesetSplit.enable = true
viewer.tilesetSplit.addTileset(tileset)
```

### properties

- `{Boolean} enable`：是否启用
- `{String} state`：状态 **_`readonly`_**

### methods

- **_addTileset(tileset)_**

  添加地图

  - 参数
    - `{Tileset} tileset`：模型
  - 返回值 `this`

## SceneSplit

> 场景分割

### examples

```js
let tileset = new DC.Tileset('**/tileset.json')
tileset.setSplitDirection(1)
viewer.sceneSplit.enable = true
viewer.sceneSplit.addTileset(tileset)
```

### properties

- `{Boolean} enable`：是否启用
- `{String} state`：状态 **_`readonly`_**

### methods

- **_addBaseLayer(baseLayer)_**

  添加地图

  - 参数
    - `{BaseLayer} baseLayer`：地图
  - 返回值 `this`

- **_addTileset(tileset)_**

  添加地图

  - 参数
    - `{Tileset} tileset`：模型
  - 返回值 `this`

## Compass

> 罗盘

### examples

```js
viewer.compass.enable = true
```

### properties

- `{Boolean} enable`：是否启用
- `{String} state`：状态 **_`readonly`_**

## ZoomController

> 缩放控制

### examples

```js
viewer.zoomController.enable = true
```

### properties

- `{Boolean} enable`：是否启用
- `{String} state`：状态 **_`readonly`_**

## LocationBar

> 坐标信息

### examples

```js
viewer.locationBar.enable = true
```

### properties

- `{Boolean} enable`：是否启用
- `{String} state`：状态 **_`readonly`_**

## DistanceLegend

> 比例尺

### examples

```js
viewer.distanceLegend.enable = true
```

### properties

- `{Boolean} enable`：是否启用
- `{String} state`：状态 **_`readonly`_**

## LoadingMask

> 加载蒙层

### examples

```js
viewer.loadingMask.enable = true
```

### properties

- `{Boolean} enable`：是否启用
- `{String} state`：状态 **_`readonly`_**

## DC.SkyBox

> 天空盒，[详情参考](http://resource.dvgis.cn/cesium-docs/SkyBox.html)

### example

```js
scene.skyBox = new DC.SkyBox({
  sources: {
    positiveX: 'skybox_px.png',
    negativeX: 'skybox_nx.png',
    positiveY: 'skybox_py.png',
    negativeY: 'skybox_ny.png',
    positiveZ: 'skybox_pz.png',
    negativeZ: 'skybox_nz.png',
  },
})
```

### creation

- **_constructor(id)_**

  构造函数

  - 参数
    - `{Object} options`：配置
  - 返回值 `skyBox`

```js
//options(可选)
const options = {
  "sources": {},// 六个面的贴图
  "show": true//显示
}
```

### properties

- `{Object} sources`：六个面的贴图
- `{Boolean} show`：显示

## DC.GroundSkyBox

> 近地天空盒，[详情参考](http://resource.dvgis.cn/cesium-docs/SkyBox.html)

### example

```js
scene.skyBox = new DC.GroundSkyBox({
  sources: {
    positiveX: 'skybox_px.png',
    negativeX: 'skybox_nx.png',
    positiveY: 'skybox_py.png',
    negativeY: 'skybox_ny.png',
    positiveZ: 'skybox_pz.png',
    negativeZ: 'skybox_nz.png',
  },
})
```

### creation

- **_constructor(id)_**

  构造函数

  - 参数
    - `{Object} options`：配置
  - 返回值 `skyBox`

```js
//options(可选)
const options = {
  "sources": {},// 六个面的贴图
  "show": true,//显示
  "offsetAngle": 0//旋转角度
}
```

### properties

- `{Object} sources`：六个面的贴图
- `{Boolean} show`：显示
- `{Number} offsetAngle`：旋转角度

## DC.Position

> 坐标类，用于描述物体在场景中的具体位置，采用右手标准

### example

```js
let position = new DC.Position(120, 22, 102)

let position1 = DC.Position.fromString('120,22,102')

let position2 = DC.Position.fromArray([120, 22, 102])

let position3 = DC.Position.fromObject({ lng: 120, lat: 22, height: 102 })
```

### creation

- **_constructor(lng,lat,alt,heading,pitch,roll)_**

  构造函数

  - 参数
    - `{Number} lng`：经度
    - `{Number} lat`：纬度
    - `{Number} alt`：高度，单位：米，默认：0
    - `{Number} heading`：偏航角度，可能其他框架作 yaw，表示绕 Z 轴旋转。默认：0
    - `{Number} pitch`：俯仰角度，表示绕 Y 轴旋转。默认：0
    - `{Number} roll`：翻转角度，表示绕 X 轴旋转。默认：0
  - 返回值 `position`

### properties

- `{Number} lng`：经度
- `{Number} lat`：纬度
- `{Number} alt`：高度，单位：米，默认：0
- `{Number} heading`：偏航角度，可能其他框架作 yaw，表示绕 Z 轴旋转。默认：0
- `{Number} pitch`：俯仰角度，表示绕 Y 轴旋转。默认：0
- `{Number} roll`：翻转角度，表示绕 X 轴旋转。默认：0

### methods

- **_serialize()_**

  序列化

  - 返回值 `string`

- **_copy()_**

  复制一个新的位置

  - 返回值 `position`

- **_toString()_**

  将坐标字符化

  - 返回值 `string`

- **_toArray()_**

  将坐标数组化

  - 返回值 `array`

- **_toObject()_**

  将坐标对象化

  - 返回值 `Object`

### static methods

- **_fromString(str)_**

  将字符化坐标转换为坐标对象

  - 参数
    - `{String} str`：字符化坐标
  - 返回值 `position`

- **_fromArray(array)_**

  将数组化坐标转换为坐标对象

  - 参数
    - `{Array} array`：数组化坐标
  - 返回值 `position`

- **_fromObject(obj)_**

  将 Json 对象坐标转换为坐标对象

  - 参数
    - `{Object} obj`：Json 对象坐标
  - 返回值 `position`

- **_fromCoordString(str)_** `deprecated`

  字符坐标串转换为坐标对象

  - 参数
    - `{String} str`：字符坐标串
  - 返回值 `position`

- **_fromCoordArray(array)_** `deprecated`

  坐标数组转换为坐标对象

  - 参数
    - `{Array<String|Number>} array`：坐标数组
  - 返回值 `position`

- **_deserialize(valStr)_**

  反序列化

  - 参数
    - `{String} valStr`：序列化的对象
  - 返回值 `position`

## DC.Color

> 颜色类

### example

```js
let red = DC.Color.RED
```

### properties

- `{Color} RED`：红色
- `{Color} YELLOW`：黄色
- `{Color} WHITE`：白色
- `{Color} GREEN`：绿色

[其他颜色](http://resource.dvgis.cn/cesium-docs/Color.html)

## DC.TilesetStyle

> tileset 样式，用于设置 3dtiles 的颜色设置

### example

```js
let style = new DC.TilesetStyle()
style.color = {
  conditions: [
    ['${floor} >= 5', 'rgb(198, 106, 11)'],
    ['true', 'rgb(127, 59, 8)'],
  ],
}
```

[详情参考](http://resource.dvgis.cn/cesium-docs/Cesium3DTileStyle.html)

## DC.JulianDate

> 朱莉安日历

```js
let date = DC.JulianDate.now()
```

### static methods

- **_now()_**

  当前朱莉安时间

  - 返回值 `date`

- **_fromDate(date)_**

  通过 Js 时间创建朱莉安时间

  - 参数
    - `{Date} date`：Js 时间
  - 返回值 `date`

[JulianDate](http://resource.dvgis.cn/cesium-docs/JulianDate.html)

## DC.Rectangle

> 矩形相关函数

### example

```js
let r = DC.Rectangle.fromDegrees(10, 20, 12, 31)
```

[详情参考](http://resource.dvgis.cn/cesium-docs/Rectangle.html)

## DC.CallbackProperty

> 回调属性，用户通过自定义回调函数来返回需要的值。回调函数中，用户可以使用 time 给定 value，也可以自定设置。

```js
let position = new DC.Position(120, 20)
let point = new DC.Point(position)
let size = 0
point.setStyle({
  pixelSize: new DC.CallbackProperty((time) => {
    size += 1
    if (size == 10) {
      size = 0
    }
    return size
  }),
})
```

## DC.Parse

> 坐标解析工具类,可简写为 DC.P

```js
let position = DC.P.parsePosition('123,32,0')
```

### static methods

- **_parsePosition(position)_**

  解析坐标为 DC.Position

  - 参数
    - `{String|Array|Position} position`：坐标
  - 返回值 `position`

- **_parsePositions(positions)_**

  解析坐标为 Array<DC.Position>

  - 参数
    - `{String|Array} positions`： 坐标
  - 返回值 `array`

- **_parsePointCoordToArray(position)_**

  解析点位坐标为数组

  - 参数
    - `{String|Position} position`：点位坐标
  - 返回值 `array`

- **_parsePolylineCoordToArray(positions)_**

  解析线坐标为二维数组

  - 参数
    - `{String|Array} positions`：线坐标
  - 返回值 `array`

- **_parsePolygonCoordToArray(positions,loop)_**

  解析面坐标为三维数组

  - 参数
    - `{String|Array} positions`：面坐标
    - `{Boolean} loop`：闭合
  - 返回值 `array`

## DC.Transform

> 坐标转换工具类 ,可简写为 DC.T

```js
let cartesian3 = DC.T.transformWGS84ToCartesian(new DC.Position(120, 20))
```

### static methods

- **_transformCartesianToWGS84(cartesian)_**

  世界坐标转换为 84 坐标

  - 参数
    - `{Cartesian3} cartesian`：世界坐标
  - 返回值 `position`

- **_transformWGS84ToCartesian(position)_**

  84 坐标转换为世界坐标

  - 参数
    - `{Position} position`：84 坐标
  - 返回值 `cartesian`

- **_transformWGS84ToCartographic(position)_**

  84 坐标转换为制图坐标

  - 参数
    - `{Position} position`：84 坐标
  - 返回值 `cartographic`

- **_transformCartesianArrayToWGS84Array(cartesianArr)_**

  世界坐标数组转 84 坐标数组

  - 参数
    - `{Array<cartesian3>} cartesianArr`：世界坐标数组
  - 返回值 `array`

- **_transformWGS84ArrayToCartesianArray(WGS84Arr)_**

  84 坐标数组转世界坐标数组

  - 参数
    - `{Array<cartesian3>} WGS84Arr`：84 坐标数组
  - 返回值 `array`

- **_transformWGS84ToMercator(position)_**

  84 坐标转 Mercator

  - 参数
    - `{Position} position`：84 坐标
  - 返回值 `position`

- **_transformMercatorToWGS84(position)_**

  Mercator 坐标转 84

  - 参数
    - `{Position} position`：Mercator 坐标
  - 返回值 `position`

- **_transformWindowToWGS84(position,viewer)_**

  屏幕坐标转 84

  - 参数
    - `{Object} position`： 屏幕坐标，格式`{x:1,y:1}`
    - `{Viewer} viewer`：3D 场景
  - 返回值 `position`

- **_transformWGS84ToWindow(position,viewer)_**

  84 转屏幕坐标

  - 参数
    - `{Position} position`： 84 坐标
    - `{Viewer} viewer`：3D 场景
  - 返回值 `Object`

## DC.CoordTransform

> 国内坐标转换工具

```js
let point = DC.CoordTransform.BD09ToGCJ02(120, 20)
```

### static methods

- **_BD09ToGCJ02(lng, lat)_**

  百度坐标系 (BD-09) 的转换 火星坐标系 (GCJ-02)

  - 参数
    - `{Number} lng`：经度
    - `{Number} lat`：纬度
  - 返回值 `[]`

- **_GCJ02ToBD09(lng, lat)_**

  火星坐标系 (GCJ-02) 转换为 百度坐标系 (BD-09)

  - 参数
    - `{Number} lng`：经度
    - `{Number} lat`：纬度
  - 返回值 `[]`

- **_WGS84ToGCJ02(lng, lat)_**

  WGS-84 转换为 火星坐标系 (GCJ-02)

  - 参数
    - `{Number} lng`：经度
    - `{Number} lat`：纬度
  - 返回值 `[]`

- **_GCJ02ToWGS84(lng, lat)_**

  火星坐标系 (GCJ-02) 转换为 WGS-84

  - 参数
    - `{Number} lng`：经度
    - `{Number} lat`：纬度
  - 返回值 `[]`

## DC.Math

> 基本函数类

### static methods

- **_area(positions)_**

  面积，单位：平方米

  - 参数
    - `{Array<Position>} positions`： 点位数据
  - 返回值 `number`

- **_bounds(positions , expand)_**

  边界

  - 参数
    - `{Array<Position>} positions`： 点位数据
    - `{Number}} expand`： 扩展比例：0~1
  - 返回值 `object`

- **_mid(start , end)_**

  两点之间的中心点

  - 参数
    - `start`： 开始位置
    - `end`： 结束位置
  - 返回值 `position`

- **_center(positions)_**

  中心点

  - 参数
    - `{Array<Position>} positions`： 点位数据
  - 返回值 `position`

- **_distance(positions)_**

  距离,单位：米

  - 参数
    - `{Array<Position>} positions`： 点位数据
  - 返回值 `number`

- **_heading(start,end)_**

  偏转角度,单位：度

  - 参数
    - `start`： 开始位置
    - `end`： 结束位置
  - 返回值 `number`

- **_parabola(start, end,height,count)_**

  抛物线

  - 参数
    - `start`： 开始位置
    - `end`： 结束位置
    - `{Number} height`： 最高点高度
    - `{Number} count`： 点位数量
  - 返回值 `Array`

> [more](http://resource.dvgis.cn/cesium-docs/Math.html)

## DC.Util

> 工具类

### static methods

- **_uuid(prefix)_**

  生成 uuid

  - 参数
    - `{String} prefix`：前缀，默认为 D
  - 返回值 `string`

- **_merge(dest, ...sources)_**

  属性合并

  - 参数
    - `{Object} dest`：目标对象
    - `{Object|Array} sources`：需要合并的属性
  - 返回值 `object`

- **_emptyImageUrl()_**

  空图片

- **_debounce(fn,delay)_**

  防抖

- **_throttle(fn,delay)_**

  节流

## DC.DomUtil

> Dom 工具类

### static methods

- **_get(id)_**

  创建 dom

  - 参数
    - `{String} id`： 要素 ID
  - 返回值 `Element`

- **_create(tagName, className, [container])_**

  创建 dom

  - 参数
    - `{String} tagName`： 标签名
    - `{String} className`： 样式名，多个用空格隔开
    - `{Element} [container]`： 父容器
  - 返回值 `Element`

- **_addClass(el, name)_**

  添加类名

  - 参数
    - `{Element} el`： 要素
    - `{String} className`： 样式名，多个用空格隔开

- **_removeClass(el, name)_**

  删除类名

  - 参数
    - `{Element} el`： 要素
    - `{String} className`： 样式名，多个用空格隔开

- **_addClass(el, name)_**

  添加类名

  - 参数
    - `{Element} el`： 要素
    - `{String} className`： 样式名，多个用空格隔开

- **_createSvg(width, height, path, [container])_**

  添加类名

  - 参数
    - `{Number} width`： 宽度
    - `{Number} height`： 高度
    - `{String} path`： 路径
    - `{Element} [container]`： 父容器
  - 返回值 `svg`

- **_parseDom(domStr, [withWrapper], [className])_**

  字符串转 Dom

  - 参数
    - `{String} domStr`： dom 字符串
    - `{Boolean} withWrapper`：返回是否含有父容器
    - `{String} className`： 类样式名称
  - 返回值 `Element | Nodes`

- **_enterFullscreen(el)_**

  进入全屏

  - 参数
    - `{Element} el`： 要素

- **_exitFullscreen()_**

  退出全屏

- **_createVideo(url, className, [container])_**

  创建视频节点

  - 参数
    - `{String} url`： 视频地址
    - `{String} className`： 样式名，多个用空格隔开
    - `{Element} [container]`： 父容器
  - 返回值 `Element | Nodes`
