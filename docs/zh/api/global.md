# 全局 API 🌎

## config

> 框架全局配置,用于配置资源文件以及accessToken

```js
 DC.config.baseUrl = "../***/***/"
```

- 参数
  - `{Object} config`：配置参数
- 返回值 `Promise`

```js
//config（属性可选）
const config = {
  "baseUrl": "<Cesium 静态资源路径，默认值为：“./libs/dc-sdk/resources/” >"
}
```

## registerLib()

> 框架中注册第三方框架包，

```js
DC.registerLib('turf', turf)
console.log(DC.getLib('turf'))
```

- 参数
  - `{String} name`：名称
  - `{Object} lib`: 库模块

## getLib()

> 获取框架中注册的第三方框架包，

```js
let turf = DC.getLib('turf')
```

- 参数
  - `{String} name`：名称
- 返回值 `Object`

## 常量

> 框架内部默认常量

::: warning
开发时请使用默认常量进行开发
:::

### MouseEventType

**_`DC.MouseEventType.LEFT_DOWN`_**: (场景、图层、覆盖物)鼠标左键按下事件

**_`DC.MouseEventType.LEFT_UP`_**: (场景、图层、覆盖物)鼠标左键抬升事件

**_`DC.MouseEventType.CLICK`_**: (场景、图层、覆盖物)鼠标点击事件

**_`DC.MouseEventType.RIGHT_DOWN`_**: (场景、图层、覆盖物)鼠标右键按下事件

**_`DC.MouseEventType.RIGHT_UP`_**: (场景、图层、覆盖物)鼠标右键按下事件

**_`DC.MouseEventType.RIGHT_CLICK`_**: (场景、图层、覆盖物)鼠标右击事件

**_`DC.MouseEventType.DB_CLICK`_**: (场景、图层、覆盖物)鼠标双击事件

**_`DC.MouseEventType.MOUSE_MOVE`_**: 场景鼠标移动事件

**_`DC.MouseEventType.WHEEL`_**: 场景鼠标滚轮事件

**_`DC.MouseEventType.MOUSE_OVER`_**: 覆盖物鼠标移入事件

**_`DC.MouseEventType.MOUSE_OUT`_**: 覆盖物鼠标移出事件

### SceneEventType

**_`DC.SceneEventType.CAMERA_MOVE_END`_**: 相机移动完成

**_`DC.SceneEventType.CAMERA_CHANGED`_**: 相机位置完成

**_`DC.SceneEventType.PRE_UPDATE`_**: 场景更新前

**_`DC.SceneEventType.POST_UPDATE`_**: 场景更新后

**_`DC.SceneEventType.PRE_RENDER`_**: 场景渲染前

**_`DC.SceneEventType.POST_RENDER`_**: 场景渲染后

**_`DC.SceneEventType.MORPH_COMPLETE`_**: 场景模式变换完成

**_`DC.SceneEventType.CLOCK_TICK`_**: 时钟跳动

**_`DC.SceneEventType.RENDER_ERROR`_**: 渲染错误

### MouseMode

**_`DC.MouseMode.LEFT_MIDDLE`_**: 左键拖动，中键翻转(默认)

**_`DC.MouseMode.LEFT_RIGHT`_**: 左键拖动，右键翻转

### ImageryType

**_`DC.ImageryType.ARCGIS`_**: arcgis 地图

**_`DC.ImageryType.SINGLE_TILE`_**: 单图片地图

**_`DC.ImageryType.WMS`_**: WMS 地图

**_`DC.ImageryType.WMTS`_**: WMTS 地图

**_`DC.ImageryType.XYZ`_**: xyz 格式地图

**_`DC.ImageryType.COORD`_**: 瓦片坐标地图

**_`DC.ImageryType.AMAP`_**: 高德地图

**_`DC.ImageryType.BAIDU`_**: 百度地图

**_`DC.ImageryType.GOOGLE`_**: 谷歌地图

**_`DC.ImageryType.TDT`_**: 天地图

**_`DC.ImageryType.TENCENT`_**: 腾讯地图

**_`DC.ImageryType.GEO_VIS`_**: 星图地图

### TerrainType

**_`DC.TerrainType.NONE`_**: 无地形

**_`DC.TerrainType.TDT`_**: 天地图 DEM 地形

**_`DC.TerrainType.XYZ`_**: xyz 格式地形

**_`DC.TerrainType.GOOGLE`_**: 谷歌地形

**_`DC.TerrainType.ARCGIS`_**: arcgis 地形

**_`DC.TerrainType.VR`_**: VR 地形

### LayerType

**_`DC.LayerType.VECTOR`_**: 矢量图层

**_`DC.LayerType.PRIMITIVE`_**: 图元图层

**_`DC.LayerType.TILESET`_**: 3d-tiles 图层

**_`DC.LayerType.I3S`_**: i3s 图层

**_`DC.LayerType.HTML`_**: html 图层

**_`DC.LayerType.GEOJSON`_**: geoJson 图层

**_`DC.LayerType.TDT_LABEL`_**: 天地图三维地名图层

**_`DC.LayerType.CLUSTER`_**: 聚合图层

**_`DC.LayerType.KML`_**: kml 图层

**_`DC.LayerType.CZML`_**: czml 图层

**_`DC.LayerType.HEAT`_**: 热区图层

**_`DC.LayerType.CHART`_**: echarts 图层

### OverlayType

**_`DC.OverlayType.POINT`_**: 点 **_`可标绘`_**

**_`DC.OverlayType.POLYLINE`_**: 线 **_`可标绘`_**

**_`DC.OverlayType.POLYGON`_**: 面 **_`可标绘`_**

**_`DC.OverlayType.MODEL`_**: 模型

**_`DC.OverlayType.BILLBOARD`_**: 图标点 **_`可标绘`_**

**_`DC.OverlayType.RECTANGLE`_**: 矩形 **_`可标绘`_**

**_`DC.OverlayType.CIRCLE`_**: 圆 **_`可标绘`_**

**_`DC.OverlayType.LABEL`_**: 标签

**_`DC.OverlayType.TILESET`_**: 3DTiles

**_`DC.OverlayType.I3S`_**: i3s

**_`DC.OverlayType.BOX`_**: 盒

**_`DC.OverlayType.CORRIDOR`_**: 走廊

**_`DC.OverlayType.CYLINDER`_**: 圆柱

**_`DC.OverlayType.ELLIPSE`_**: 椭圆

**_`DC.OverlayType.ELLIPSOID`_**: 球体

**_`DC.OverlayType.PLANE`_**: 面板

**_`DC.OverlayType.POLYLINE_VOLUME`_**: 管道

**_`DC.OverlayType.WALL`_**: 墙体

**_`DC.OverlayType.DYNAMIC_BILLBOARD`_**: 动态图标点

**_`DC.OverlayType.DYNAMIC_MODEL`_**: 动态模型点

**_`DC.OverlayType.CUSTOM_BILLBOARD`_**: 自定义图标

**_`DC.OverlayType.CUSTOM_LABEL`_**: 自定义标签

**_`DC.OverlayType.ATTACK_ARROW`_**: 攻击箭头 **_`可标绘`_**

**_`DC.OverlayType.DOUBLE_ARROW`_**: 双箭头 **_`可标绘`_**

**_`DC.OverlayType.FINE_ARROW`_**: 直箭头 **_`可标绘`_**

**_`DC.OverlayType.GATHERING_PLACE`_**: 聚集地 **_`可标绘`_**

**_`DC.OverlayType.TAILED_ATTACK_ARROW`_**: 燕尾攻击箭头 **_`可标绘`_**

**_`DC.OverlayType.BILLBOARD_PRIMITIVE`_**: 图标图元

**_`DC.OverlayType.DIFFUSE_WALL_PRIMITIVE`_**: 扩散墙图元

**_`DC.OverlayType.ELEC_ELLIPSOID_PRIMITIVE`_**: 电弧球图元

**_`DC.OverlayType.FLOW_LINE_PRIMITIVE`_**: 流动线图元

**_`DC.OverlayType.LABEL_PRIMITIVE`_**: 文本图元

**_`DC.OverlayType.MODEL_PRIMITIVE`_**: 模型图元

**_`DC.OverlayType.POINT_PRIMITIVE`_**: 点图元

**_`DC.OverlayType.POLYLINE_PRIMITIVE`_**: 线图元

**_`DC.OverlayType.SCAN_CIRCLE_PRIMITIVE`_**: 扫描圆图元

**_`DC.OverlayType.TRAIL_LINE_PRIMITIVE`_**: 轨迹线图元

**_`DC.OverlayType.WATER_PRIMITIVE`_**: 水面图元

**_`DC.OverlayType.VIDEO_PRIMITIVE`_**: 视频图元

### TrackViewMode

**_`DC.TrackViewMode.FP`_**: 第一人称视角

**_`DC.TrackViewMode.TP`_**: 第三人称视角

**_`DC.TrackViewMode.TRACKED`_**: 跟随视角

**_`DC.TrackViewMode.FREE`_**: 自由视角
