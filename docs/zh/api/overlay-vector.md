# 矢量要素 🌎

## DC.Overlay

> 覆盖物基类

:::warning
该类作为一个基类，不建议实例化使用
:::

### properties

- `{String} overlayId`：唯一标识 **_`readonly`_**
- `{String} id`：业务唯一标识
- `{Boolean} show`：是否显示
- `{Object} attr`：业务属性
- `{Array} contextMenu`：设置右击菜单，菜单的回调函数参数为 viewer,overlay
- `{String} state`：覆盖物状态 **_`readonly`_**
- `{String} type`：覆盖物类型 **_`readonly`_**
- `{Boolean} allowDrillPicking`：是否可以穿透选择，默认为 false，如果为 true 时，覆盖物为穿透选择其后面的所有覆盖物，并触发其后面的所有覆盖物的鼠标事件

### methods

- **_addTo(layer)_**

  添加到图层

  - 参数
    - `{Layer} layer` ：图层
  - 返回值 `this`

- **_remove()_**

  删除

  - 返回值 `this`

- **_setLabel(text, textStyle)_**

  设置标签

  - 参数
    - `{String} text`：文本
    - `{String} textStyle`：文本样式，[详细使用说明](#dc-label)
  - 返回值 `this`

:::warning
该函数仅对下列覆盖物有效：Point、Circle、Polygon、Billboard、Ellipse、Rectangle
:::

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

  注册覆盖物类型

  - 参数
    - `{String} type`：覆盖物类型

- **_getOverlayType(type)_**

  获取覆盖物类型

  - 参数
    - `{String} type`：覆盖物类型
  - 返回值 `string`

## DC.Point

> 点位要素，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let point = new DC.Point(position)
point.setStyle({
  pixelSize: 10,
})
```

### creation

- **_constructor(position)_**

  构造函数

  - 参数
    - `{Position|String|Array|Object} position`：坐标
  - 返回值 `point`

### properties

- `{Position|String|Array|Object} position`：坐标

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/PointGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "pixelSize": 1, //像素大小
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "color": DC.Color.WHITE, //颜色
  "outlineColor": DC.Color.WHITE, //边框颜色
  "outlineWidth": 0, //边框大小，
  "scaleByDistance": {
    "near": 0, //最近距离
    "nearValue": 0, //最近距离值
    "far": 1, //最远距离值
    "farValue": 0 //最远距离值
  }, //根据距离设置比例
  "translucencyByDistance": {
    "near": 0, //最近距离
    "nearValue": 0, //最近距离值
    "far": 1, //最远距离值
    "farValue": 0 //最远距离值
  }, //根据距离设置透明度
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  }, //根据距离设置可见
  "disableDepthTestDistance": 0 // 深度检测距离，用于防止剪切地形，设置为零时，将始终应用深度测试。设置为Number.POSITIVE_INFINITY时，永远不会应用深度测试。
}
```

- **_fromEntity(entity)_**

  Entity 转换为 Overlay

  - 参数
    - `{Object} entity`：Cesium 覆盖物
  - 返回值 `point`

## DC.Polyline

> 线要素，继承于[Overlay](#overlay)

### example

```js
let polyline = new DC.Polyline('120,20;120,30')
polyline.setStyle({
  width: 10,
})
```

### creation

- **_constructor(positions)_**

  构造函数

  - 参数
    - `{String|Array<Position|Number|String|Object>} positions`：坐标串
  - 返回值 `polyline`

### properties

- `{String|Array<Position|Number|String|Object>} positions`：坐标串
- `{DC.Position} center`：中心点 **_`readonly`_**
- `{Number} distance`：距离,单位：米 **_`readonly`_**

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/PolylineGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "width": 1, //线宽
  "material": DC.Color.WHITE, //材质
  "clampToGround": false, //是否贴地
  "shadows": 0, //阴影类型，0：禁用、1：启用 、2：投射、3：接受
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  }, //根据距离设置可见
  "classificationType": 2, //分类 是否影响地形，3D切片或同时影响这两者。0:地形、1:3D切片、2：两者
  "zIndex": 0 //层级
}
```

- **_fromEntity(entity)_**

  Entity 转换为 Overlay

  - 参数
    - `{Object} entity`：Cesium 覆盖物
  - 返回值 `polyline`

## DC.Polygon

> 面要素，继承于[Overlay](#overlay)

### example

```js
let polygon = new DC.Polygon('120,20;120,30;122,30')
polygon.setStyle({
  height: 10,
})
```

### creation

- **_constructor(positions)_**

  构造函数

  - 参数
    - `{String|Array<Position|Number|String|Object} positions`：坐标串
  - 返回值 `polygon`

### properties

- `{String|Array<Position|Number|String|Object>} positions`：坐标串
- `{String|Array<Position|Number|String|Object>} holes`：洞坐标串
- `{DC.Position} center`：中心点 **_`readonly`_**
- `{Number} area`：距离，单位：平方米 **_`readonly`_**

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/PolygonGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "height": 1, //高度
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "extrudedHeight": 0, //拉升高度
  "stRotation": 0, //旋转角度
  "fill": true, //是否用提供的材料填充多边形。
  "material": DC.Color.WHITE, //材质
  "outline": false, //是否显示边框
  "outlineColor": DC.Color.BLACK, //边框颜色
  "outlineWidth": 0, //边框宽度
  "closeTop": true, //顶面是否闭合
  "closeBottom": true, //底面是否闭合
  "shadows": 0, //阴影类型，0：禁用、1：启用 、2：投射、3：接受
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  }, //根据距离设置可见
  "classificationType": 2, //分类 是否影响地形，3D切片或同时影响这两者。0:地形、1:3D切片、2：两者
  "zIndex": 0 //层级
}
```

- **_fromEntity(entity)_**

  Entity 转换为 Overlay

  - 参数
    - `{Object} entity`：Cesium 覆盖物
  - 返回值 `polygon`

## DC.Billboard

> 图标要素，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let billboard = new DC.Billboard(position, '***/**.png')
billboard.size = [20, 20]
```

### creation

- **_constructor(position,icon)_**

  构造函数

  - 参数
    - `{Position|String|Array|Object} position`：坐标
    - `{String} icon`：图标地址
  - 返回值 `billboard`

### properties

- `{Position|String|Array|Object} position`：坐标
- `{String} icon`：图标地址
- `{Array<Number>} size`：图标大小

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/BillboardGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "scale": 1, //比例
  "pixelOffset": { "x": 0, "y": 0 }, //偏移像素
  "rotation": 0, //旋转角度
  "translucencyByDistance": {
    "near": 0, //最近距离
    "nearValue": 0, //最近距离值
    "far": 1, //最远距离值
    "farValue": 0 //最远距离值
  }, //根据距离设置透明度
  "scaleByDistance": {
    "near": 0, //最近距离
    "nearValue": 0, //最近距离值
    "far": 1, //最远距离值
    "farValue": 0 //最远距离值
  }, //根据距离设置比例
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  }, //根据距离设置可见
  "disableDepthTestDistance": 0 // 深度检测距离，用于防止剪切地形，设置为零时，将始终应用深度测试。设置为Number.POSITIVE_INFINITY时，永远不会应用深度测试。
}
```

- **_fromEntity(entity)_**

  Entity 转换为 Overlay

  - 参数
    - `{Object} entity`：Cesium 覆盖物
  - 返回值 `billboard`

## DC.Label

> 标签要素，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let Label = new DC.Label(position, 'test')
```

### creation

- **_constructor(position,text)_**

  构造函数

  - 参数
    - `{Position|String|Array|Object} position`：坐标
    - `{String} text`：文本
  - 返回值 `label`

### properties

- `{Position} position`：坐标
- `{String} text`：文本

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/LabelGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "font": "30px sans-serif", // CSS 字体设置
  "scale": 1, //比例
  "pixelOffset": { "x": 0, "y": 0 }, //偏移像素
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "showBackground": false, //是否显示背景
  "backgroundColor": DC.Color.BLACK, //背景颜色
  "backgroundPadding": { "x": 0, "y": 0 }, //背景间隙
  "fillColor": DC.Color.BLACK, //文字颜色
  "outlineColor": DC.Color.WHITE, //边框颜色
  "outlineWidth": 0, //边框大小，
  "scaleByDistance": {
    "near": 0, //最近距离
    "nearValue": 0, //最近距离值
    "far": 1, //最远距离值
    "farValue": 0 //最远距离值
  }, //根据距离设置比例
  "translucencyByDistance": {
    "near": 0, //最近距离
    "nearValue": 0, //最近距离值
    "far": 1, //最远距离值
    "farValue": 0 //最远距离值
  }, //根据距离设置透明度
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  }, //根据距离设置可见
  "disableDepthTestDistance": 0 // 深度检测距离，用于防止剪切地形，设置为零时，将始终应用深度测试。设置为Number.POSITIVE_INFINITY时，永远不会应用深度测试。
}
```

- **_fromEntity(entity,text)_**

  Entity 转换为 Overlay

  - 参数
    - `{Object} entity`：Cesium 覆盖物
    - `{String} text`：文本
  - 返回值 `label`

## DC.Circle

> 圆要素，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let circle = new DC.Circle(position, 200)
```

### creation

- **_constructor(center, radius)_**

  构造函数

  - 参数
    - `{Position|String|Array|Object} center`：圆心
    - `{String} radius`：半径
  - 返回值 `billboard`

### properties

- `{Position} center`：圆心
- `{String} radius`：半径

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/EllipseGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "height": 1, //高度
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "extrudedHeight": 0, //拉升高度
  "rotation": 0, //顺时针旋转角度
  "stRotation": 0, //逆时针旋转角度
  "fill": true, //是否用提供的材料填充多边形。
  "material": DC.Color.WHITE, //材质
  "outline": false, //是否显示边框
  "outlineColor": DC.Color.BLACK, //边框颜色
  "outlineWidth": 0, //边框宽度
  "shadows": 0, //阴影类型，0：禁用、1：启用 、2：投射、3：接受
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  }, //根据距离设置可见
  "classificationType": 2, //分类 是否影响地形，3D切片或同时影响这两者。0:地形、1:3D切片、2：两者
  "zIndex": 0 //层级
}
```

## DC.Rect

> 矩形要素，继承于[Overlay](#overlay)

### example

```js
let rectangle = new DC.Rect('-90.0,32.0;-94.0,36.0;')
```

### creation

- **_constructor(positions)_**

  构造函数

  - 参数
    - `{String|Array<Position|Number|String>} positions`：坐标串
  - 返回值 `rectangle`

### properties

- `{String|Array<Position|Number|String>} positions`：坐标串

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/RectangleGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "height": 1, //高度
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "extrudedHeight": 0, //拉升高度
  "rotation": 0, //顺时针旋转角度
  "stRotation": 0, //逆时针旋转角度
  "fill": true, //是否用提供的材料填充多边形。
  "material": DC.Color.WHITE, //材质
  "outline": false, //是否显示边框
  "outlineColor": DC.Color.BLACK, //边框颜色
  "outlineWidth": 0, //边框宽度
  "shadows": 0, //阴影类型，0：禁用、1：启用 、2：投射、3：接受
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  }, //根据距离设置可见
  "classificationType": 2, //分类 是否影响地形，3D切片或同时影响这两者。0:地形、1:3D切片、2：两者
  "zIndex": 0 //层级
}
```

## DC.Wall

> 墙体要素，继承于[Overlay](#overlay)

### example

```js
let wall = new DC.Wall('-90.0,32.0,1000;-94.0,36.0,1000;')
```

### creation

- **_constructor(positions)_**

  构造函数

  - 参数
    - `{String|Array<Position|Number|String>} positions`：坐标串
  - 返回值 `wall`

### properties

- `{String|Array<Position|Number|String>} positions`：坐标串

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/WallGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "fill": true, //是否用提供的材料填充多边形。
  "material": DC.Color.WHITE, //材质
  "outline": false, //是否显示边框
  "outlineColor": DC.Color.BLACK, //边框颜色
  "outlineWidth": 0, //边框宽度
  "shadows": 0, //阴影类型，0：禁用、1：启用 、2：投射、3：接受
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  }, //根据距离设置可见
  "classificationType": 2 //分类 是否影响地形，3D切片或同时影响这两者。0:地形、1:3D切片、2：两者
}
```

- **_fromEntity(entity)_**

  Entity 转换为 Overlay

  - 参数
    - `{Object} entity`：Cesium 覆盖物
  - 返回值 `wall`

## DC.Model

> 模型要素，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let model = new DC.Model(position, '**/**.glb')
```

### creation

- **_constructor(position, modelUrl)_**

  构造函数

  - 参数
    - ``{Position|String|Array|Object} position`：坐标
    - `{String} modelUrl`：模型地址
  - 返回值 `model`

### properties

- `{Position} position`：坐标
- `{String} modelUrl`：模型地址

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/ModelGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "scale": 1, //比例
  "minimumPixelSize": 0, //指定模型的最小像素大小，而不考虑缩放
  "maximumScale": 0, //指定模型的最大比例
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "shadows": 0, //阴影类型，0：禁用、1：启用 、2：投射、3：接受
  "silhouetteColor": DC.Color.RED, //轮廓颜色
  "silhouetteSize": 0, //轮廓宽度
  "lightColor": DC.Color.RED, //模型着色时指定灯光颜色
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  } //根据距离设置可见
}
```

- **_fromEntity(entity,modelUrl)_**

  Entity 转换为 Overlay

  - 参数
    - `{Object} entity`：Cesium 覆盖物
    - `{String} modelUrl`：模型地址
  - 返回值 `model`

## DC.Tileset

> 3Dtiles 模型要素，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let tileset = new DC.Tileset('**/tileset.json')
tileset.setPosition(position)
```

### creation

- **_constructor(url,[options])_**

  构造函数

  - 参数
    - `{String} url`：模型地址
    - `{Object} options`：参数设置，[详细使用说明](http://resource.dvgis.cn/cesium-docs/Cesium3DTileset.html)
  - 返回值 `tileset`

### properties

- `{Promise} readyPromise`：加载完成后的异步函数 **_`readonly`_**

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style` ：样式，[详细使用说明](https://github.com/CesiumGS/3d-tiles/tree/master/specification/Styling)
  - 返回值 `this`

  ```js
  let style = new DC.TilesetStyle({
    color: {
      conditions: [
        ['${Height} >= 100', 'color("purple", 0.5)'], //Height 为模型设置的属性
        ['${Height} >= 50', 'color("red")'],
        ['true', 'color("blue")'],
      ],
    },
    show: '${Height} > 0',
  })
  ```

- **_setPosition(position)_**

  设置位置

  - 参数
    - `{Position|String|Array|Object} position`：位置
  - 返回值 `this`

- **_setHeadingPitchRoll(heading, pitch, roll)_**

  设置方位角

  - 参数
    - `{Number} heading`：偏航角度，可能其他框架作 yaw，表示绕 Z 轴旋转。默认：0
    - `{Number} pitch`：俯仰角度，表示绕 Y 轴旋转。默认：0
    - `{Number} roll`：翻转角度，表示绕 X 轴旋转。默认：0
  - 返回值 `this`

- **_setHeight(height,isAbsolute)_**

  设置高度

  - 参数
    - `{Number} height`：高度
    - `{Boolean} isAbsolute`：是否为绝对高度，如果为 true，将不根据模型中心高度计算
  - 返回值 `this`

- **_setScale(scale)_**

  设置比例

  - 参数
    - `{Number} scale`：比例
  - 返回值 `this`

- **_setCustomShader(customShader)_**

  设置自定义片元着色器

  - 参数
    - `{String} customShader`：片元着色器
  - 返回值 `this`

- **_setProperties(properties)_**

  根据现有的属性添加属性

  - 参数
    - `{Array<Object>} properties`: 属性
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "key": "name",
  //已有属性名称
  "keyValue": "1",
  //已有属性值
  "propertyName": "highlight",
  //新增属性名称
  "propertyValue": true
  //新增属性值
}
```

## DC.DivIcon

> DivIcon 要素，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let divIcon = new DC.DivIcon(position, '<div></div>')
```

### creation

- **_constructor(position, content)_**

  构造函数

  - 参数
    - `{Position|String|Array|Object} position`：坐标
    - `{String|Element} content`：内容
  - 返回值 `divIcon`

### properties

- `{Position|String|Array} position`：坐标
- `{String|Element} content`：内容 **_`writeOnly`_**

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "className": "test",//样式名
  "scaleByDistance": {
    "near": 0,//最近距离
    "nearValue": 0, //最近距离值
    "far": 1, //最远距离值
    "farValue": 0//最远距离值
  }, //根据距离设置比例
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE//最远距离
  }//根据距离设置可见
}
```

- **_fromEntity(entity,content)_**

  Entity 转换为 Overlay

  - 参数
    - `{Object} entity`：Cesium 覆盖物
    - `{String|Element} content`：内容
  - 返回值 `divIcon`

## DC.Box

> 盒要素，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let box = new DC.Box(position, 20, 30, 40)
```

### creation

- **_constructor(position, length, width, height)_**

  构造函数

  - 参数
    - `{Position|String|Array|Object} position`：坐标
    - `{Number} length`：长度
    - `{Number} width`：宽度
    - `{Number} height`：高度
  - 返回值 `box`

### properties

- `{Position} position`：坐标
- `{Number} length`：长度
- `{Number} width`：宽度
- `{Number} height`：高度

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/BoxGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "fill": true, //是否用提供的材料填充多边形。
  "material": DC.Color.WHITE, //材质
  "outline": false, //是否显示边框
  "outlineColor": DC.Color.BLACK, //边框颜色
  "outlineWidth": 0, //边框宽度
  "shadows": 0, //阴影类型，0：禁用、1：启用 、2：投射、3：接受
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE//最远距离
  }//根据距离设置可见
}
```

## DC.Corridor

> 走廊要素，继承于[Overlay](#overlay)

### example

```js
let corridor = new DC.Corridor('120,20;120,30')
corridor.setStyle({
  width: 10,
})
```

### creation

- **_constructor(positions)_**

  构造函数

  - 参数
    - `{String|Array<Position|Number|String|Object>} positions`：坐标串
  - 返回值 `corridor`

### properties

- `{Array<Position>} positions`：坐标串

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/CorridorGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "width": 1, //线宽
  "height": 0, //高度
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "cornerType": 0, //转角类别，0：圆角、1：直角、2：斜角
  "fill": true, //是否用提供的材料填充多边形。
  "material": DC.Color.WHITE, //材质
  "outline": false, //是否显示边框
  "outlineColor": DC.Color.BLACK, //边框颜色
  "outlineWidth": 0, //边框宽度
  "shadows": 0, //阴影类型，0：禁用、1：启用 、2：投射、3：接受
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  }, //根据距离设置可见
  "classificationType": 2, //分类 是否影响地形，3D切片或同时影响这两者。0:地形、1:3D切片、2：两者
  "zIndex": 0 //层级
}
```

- **_fromEntity(entity)_**

  Entity 转换为 Overlay

  - 参数
    - `{Object} entity`：Cesium 覆盖物
  - 返回值 `corridor`

## DC.Cylinder

> 圆柱要素，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let cylinder = new DC.Cylinder(position, 20, 30, 40)
```

### creation

- **_constructor(position, length, topRadius, bottomRadius)_**

  构造函数

  - 参数
    - `{Position|Number|String|Object} position`：坐标
    - `{Number} length`：长度
    - `{Number} topRadius`：上半径
    - `{Number} bottomRadius`：下半径
  - 返回值 `cylinder`

### properties

- `{Position} position`：坐标
- `{Number} length`：长度
- `{Number} topRadius`：上半径
- `{Number} bottomRadius`：下半径

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/CylinderGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "fill": true, //是否用提供的材料填充多边形。
  "material": DC.Color.WHITE, //材质
  "outline": false, //是否显示边框
  "outlineColor": DC.Color.BLACK, //边框颜色
  "outlineWidth": 0, //边框宽度
  "shadows": 0, //阴影类型，0：禁用、1：启用 、2：投射、3：接受
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  } //根据距离设置可见
}
```

## DC.Ellipse

> 椭圆要素，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let ellipse = new DC.Ellipse(position, 20, 30)
```

### creation

- **_constructor(position, semiMajorAxis, semiMinorAxis)_**

  构造函数

  - 参数
    - `{Position|Number|String|Object} position`：坐标
    - `{Number} semiMajorAxis`：长半轴
    - `{Number} semiMinorAxis`：短半轴
  - 返回值 `ellipse`

### properties

- `{Position} position`：坐标
- `{Number} semiMajorAxis`：长半轴
- `{Number} semiMinorAxis`：短半轴

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/EllipseGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "height": 1, //高度
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "extrudedHeight": 0, //拉升高度
  "rotation": 0, //顺时针旋转角度
  "stRotation": 0, //逆时针旋转角度
  "fill": true, //是否用提供的材料填充多边形。
  "material": DC.Color.WHITE, //材质
  "outline": false, //是否显示边框
  "outlineColor": DC.Color.BLACK, //边框颜色
  "outlineWidth": 0, //边框宽度
  "shadows": 0, //阴影类型，0：禁用、1：启用 、2：投射、3：接受
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  }, //根据距离设置可见
  "classificationType": 2, //分类 是否影响地形，3D切片或同时影响这两者。0:地形、1:3D切片、2：两者
  "zIndex": 0 //层级
}
```

## DC.Sphere

> 球体要素，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let ellipsoid = new DC.Sphere(position, { x: 30, y: 30, z: 30 })
```

### creation

- **_constructor(position, radius)_**

  构造函数

  - 参数
    - `{Position|Number|String|Object} position`：坐标
    - `{Object} radius`：半径，格式是：`{x: 30, y: 30, z: 30}`
  - 返回值 `sphere`

### properties

- `{Position} position`：坐标
- `{Object} radius`：半径，格式是：`{x: 30, y: 30, z: 30}`

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/EllipsoidGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "fill": true, //是否用提供的材料填充多边形。
  "material": DC.Color.WHITE, //材质
  "outline": false, //是否显示边框
  "outlineColor": DC.Color.BLACK, //边框颜色
  "outlineWidth": 0, //边框宽度
  "shadows": 0, //阴影类型，0：禁用、1：启用 、2：投射、3：接受
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  } //根据距离设置可见
}
  ```

## DC.Plane

> 平面要素，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let plane = new DC.Plane(position, 20, 30, { normal: 'x' })
```

### creation

- **_constructor(position, width, height, direction)_**

  构造函数

  - 参数
    - `{Position|Number|String|Object} position`：坐标
    - `{Number} width`：宽度
    - `{Number} height`：高度
    - `{Object} plane`：面板格式
  - 返回值 `plane`

```js
// style（属性可选）
const style = {
  "normal": "x", // 法线,x,y,z其中一个
  "distance": 0// 距离
}
```

### properties

- `{Position} position`：坐标
- `{Number} width`：宽度
- `{Number} height`：高度
- `{Number} distance`：距离

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/PlaneGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "fill": true, //是否用提供的材料填充多边形。
  "material": DC.Color.WHITE, //材质
  "outline": false, //是否显示边框
  "outlineColor": DC.Color.BLACK, //边框颜色
  "outlineWidth": 0, //边框宽度
  "shadows": 0, //阴影类型，0：禁用、1：启用 、2：投射、3：接受
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  } //根据距离设置可见
}
```

## DC.PolylineVolume

> 管道要素，继承于[Overlay](#overlay)

### example

```js
function computeCircle(radius) {
  var positions = []
  for (var i = 0; i < 360; i++) {
    var radians = DC.Math.toRadians(i)
    positions.push({
      x: radius * Math.cos(radians),
      y: radius * Math.sin(radians),
    })
  }
  return positions
}

let polylineVolume = new DC.PolylineVolume(
  '-90.0,32.0,0.0;-90.0,36.0,100000.0;-94.0,36.0,0.0;',
  computeCircle(60000)
)
```

### creation

- **_constructor(positions, shape)_**

  构造函数

  - 参数
    - `{String|Array<Position|Number|String|Object>} positions`：坐标串
    - `{Array} shape`：形状
  - 返回值 `polylineVolume`

### properties

- `{Array<Position>} positions`：坐标串
- `{Array} shape`：形状

### methods

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/PolylineVolumeGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "cornerType": 0, //转角类别，0：圆角、1：直角、2：斜角
  "fill": true, //是否用提供的材料填充多边形。
  "material": DC.Color.WHITE, //材质
  "outline": false, //是否显示边框
  "outlineColor": DC.Color.BLACK, //边框颜色
  "outlineWidth": 0, //边框宽度
  "shadows": 0, //阴影类型，0：禁用、1：启用 、2：投射、3：接受
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  } //根据距离设置可见
}
```

- **_fromEntity(entity)_**

  Entity 转换为 Overlay

  - 参数
    - `{Object} entity`：Cesium 覆盖物
  - 返回值 `polylineVolume`

## DC.DynamicBillboard

> 动态图标，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let billboard = new DC.DynamicBillboard(position, '***/**.png')
billboard.size = [20, 20]
```

### creation

- **_constructor(position,icon)_**

  构造函数

  - 参数
    - `{Position|String|Array|Object} position`：坐标
    - `{String} icon`：图标地址
  - 返回值 `billboard`

### properties

- `{Position} position`：坐标 **_`readonly`_**
- `{String} icon`：图标地址
- `{Array<Number>} size`：图标大小

### methods

- **_addPosition(position,interval)_**

  添加点位

  - 参数
    - `{Position|Array|String|Object} position`：点位
    - `{Number} interval`：间隔，单位：秒
  - 返回值 `this`

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/BillboardGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "scale": 1, //比例
  "pixelOffset": { "x": 0, "y": 0 }, //偏移像素
  "rotation": 0, //旋转角度
  "translucencyByDistance": {
    "near": 0, //最近距离
    "nearValue": 0, //最近距离值
    "far": 1, //最远距离值
    "farValue": 0 //最远距离值
  }, //根据距离设置透明度
  "scaleByDistance": {
    "near": 0, //最近距离
    "nearValue": 0, //最近距离值
    "far": 1, //最远距离值
    "farValue": 0 //最远距离值
  }, //根据距离设置比例
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  }, //根据距离设置可见
  "disableDepthTestDistance": 0 // 深度检测距离，用于防止剪切地形，设置为零时，将始终应用深度测试。设置为Number.POSITIVE_INFINITY时，永远不会应用深度测试。
}
```

## DC.DynamicModel

> 动态模型要素，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let model = new DC.DynamicModel(position, '**/**.glb')
```

### creation

- **_constructor(position, modelUrl)_**

  构造函数

  - 参数
    - `{Position|String|Array|Object} position`：坐标
    - `{String} modelUrl`：模型地址
  - 返回值 `model`

### properties

- `{Position} position`：坐标 **_`readonly`_**
- `{String} modelUrl`：模型地址

### methods

- **_addPosition(position,interval)_**

  添加点位

  - 参数
    - `{Position|Array|String|Object} position`：点位
    - `{Number} interval`：间隔，单位：秒
  - 返回值 `this`

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/ModelGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "scale": 1, //比例
  "minimumPixelSize": 0, //指定模型的最小像素大小，而不考虑缩放
  "maximumScale": 0, //指定模型的最大比例
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "shadows": 0, //阴影类型，0：禁用、1：启用 、2：投射、3：接受
  "silhouetteColor": DC.Color.RED, //轮廓颜色
  "silhouetteSize": 0, //轮廓宽度
  "lightColor": DC.Color.RED, //模型着色时指定灯光颜色
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  } //根据距离设置可见
}
```

## DC.CustomBillboard

> 自定义图标，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let billboard = new DC.CustomBillboard(position, '***/**.png')
billboard.size = [20, 20]
```

### creation

- **_constructor(position,icon)_**

  构造函数

  - 参数
    - `{Position|String|Array|Object} position`：坐标
    - `{String} icon`：图标地址
  - 返回值 `billboard`

### properties

- `{Position} position`：坐标
- `{String} icon`：图标地址
- `{Array<Number>} size`：图标大小

### methods

- **_setVLine(style)_**

  设置垂直线

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/PolylineGraphics.html)
  - 返回值 `this`

- **_setBottomCircle(radius,style,rotateAmount)_**

  设置底圆

  - 参数
    - `{Number} radius`：半径
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/EllipseGraphics.html)
    - `{Number} rotateAmount`：旋转量
  - 返回值 `this`

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/BillboardGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "scale": 1, //比例
  "pixelOffset": { "x": 0, "y": 0 }, //偏移像素
  "rotation": 0, //旋转角度
  "translucencyByDistance": {
    "near": 0, //最近距离
    "nearValue": 0, //最近距离值
    "far": 1, //最远距离值
    "farValue": 0 //最远距离值
  }, //根据距离设置透明度
  "scaleByDistance": {
    "near": 0, //最近距离
    "nearValue": 0, //最近距离值
    "far": 1, //最远距离值
    "farValue": 0 //最远距离值
  }, //根据距离设置比例
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  }, //根据距离设置可见
  "disableDepthTestDistance": 0 // 深度检测距离，用于防止剪切地形，设置为零时，将始终应用深度测试。设置为Number.POSITIVE_INFINITY时，永远不会应用深度测试。
}
```

## DC.CustomLabel

> 自定义文本，继承于[Overlay](#overlay)

### example

```js
let position = new DC.Position(120, 20)
let label = new DC.CustomLabel(position, 'test')
```

### creation

- **_constructor(position,text)_**

  构造函数

  - 参数
    - `{Position|String|Array|Object} position`：坐标
    - `{String} text`：文本
  - 返回值 `label`

### properties

- `{Position} position`：坐标
- `{String} text`：文本

### methods

- **_setVLine(style)_**

  设置垂直线

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/PolylineGraphics.html)
  - 返回值 `this`

- **_setBottomCircle(radius,style,rotateAmount)_**

  设置底圆

  - 参数
    - `{Number} radius`：半径
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/EllipseGraphics.html)
    - `{Number} rotateAmount`：旋转量
  - 返回值 `this`

- **_setStyle(style)_**

  设置样式

  - 参数
    - `{Object} style`：样式，[详细使用说明](http://resource.dvgis.cn/cesium-docs/LabelGraphics.html)
  - 返回值 `this`

```js
// style（属性可选）
const style = {
  "heightReference": 0, //高度参照，0：位置无参照，位置是绝对的，1：位置固定在地形上 2：位置高度是指地形上方的高度。
  "scale": 1, //比例
  "pixelOffset": { "x": 0, "y": 0 }, //偏移像素
  "rotation": 0, //旋转角度
  "translucencyByDistance": {
    "near": 0, //最近距离
    "nearValue": 0, //最近距离值
    "far": 1, //最远距离值
    "farValue": 0 //最远距离值
  }, //根据距离设置透明度
  "scaleByDistance": {
    "near": 0, //最近距离
    "nearValue": 0, //最近距离值
    "far": 1, //最远距离值
    "farValue": 0 //最远距离值
  }, //根据距离设置比例
  "distanceDisplayCondition": {
    "near": 0, //最近距离
    "far": Number.MAX_VALUE //最远距离
  }, //根据距离设置可见
  "disableDepthTestDistance": 0 // 深度检测距离，用于防止剪切地形，设置为零时，将始终应用深度测试。设置为Number.POSITIVE_INFINITY时，永远不会应用深度测试。
}
```
