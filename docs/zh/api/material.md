# 材质 API 🌎

在真实世界里，每个物体会对光产生不同的反应。钢看起来比陶瓷花瓶更闪闪发光，一个木头箱子不会像钢箱子一样对光产生很强的反射。每个物体对镜面高光也有不同的反应。有些物体不会散射(
Scatter)很多光却会反射(Reflect)很多光，结果看起来就有一个较小的高光点(Highlight)，有些物体散射了很多，它们就会产生一个半径更大的高光。如果我们想要在
OpenGL 中模拟多种类型的物体，我们必须为每个物体分别定义材质(Material)属性。

## DC.ColorMaterialProperty

> 颜色材质

### example

```js
let material = new DC.ColorMaterialProperty(DC.Color.RED)
```

### creation

- **_constructor(color)_**

  构造函数

  - 参数
    - `{DC.Color} color`：颜色
  - 返回值 `material`

## DC.ImageMaterialProperty

> 图片材质

### example

```js
let material = new DC.ImageMaterialProperty({
  image: '**/**.png',
  transparent: true,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `material`

```js
// options（属性可选）
const options = {
  "image": "", // 图片地址
  "repeat": { "x": 1, "y": 1 }, // 图片重复
  "color": DC.Color.WHITE, // 图片颜色
  "transparent": false // 材质是否透明
}
```

### properties

- `{String} image`：图片地址
- `{Object} repeat`：图片重复
- `{DC.Color} color`：图片颜色
- `{Boolean} transparent`：材质是否透明

## DC.CircleBlurMaterialProperty

> 模糊圆材质

### example

```js
let material = new DC.CircleBlurMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE, // 颜色
  "speed": 10 // 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.CircleDiffuseMaterialProperty

> 扩散圆材质

### example

```js
let material = new DC.CircleDiffuseMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE, // 颜色
  "speed": 10// 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.CircleFadeMaterialProperty

> 逐渐消逝圆材质

### example

```js
let material = new DC.CircleFadeMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "speed": 10// 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.CirclePulseMaterialProperty

> 脉冲圆材质

### example

```js
let material = new DC.CirclePulseMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE, // 颜色
  "speed": 10// 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.CircleScanMaterialProperty

> 扫描圆材质

### example

```js
let material = new DC.CircleScanMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "speed": 10// 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.CircleSpiralMaterialProperty

> 螺旋圆材质

### example

```js
let material = new DC.CircleSpiralMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "speed": 10 // 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.CircleVaryMaterialProperty

> 多彩圆材质

### example

```js
let material = new DC.CircleVaryMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
      - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "speed": 10// 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.CircleWaveMaterialProperty

> 波纹圆材质

### example

```js
let material = new DC.CircleWaveMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "speed": 10, // 速度
  "count": 5, //数量
  "gradient": 0.1  //强度
}
```

### properties

- `{Color} color`：颜色
- `{Number} speed`：速度
- `{Number} count`：数量
- `{Number} gradient`：强度

## DC.EllipsoidElectricMaterialProperty

> 电弧球材质

### example

```js
let material = new DC.EllipsoidElectricMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "speed": 10 // 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.EllipsoidTrailMaterialProperty

> 轨迹球材质

### example

```js
let material = new DC.EllipsoidTrailMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE, // 颜色
  "speed": 10  // 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.PolylineDashMaterialProperty

> 虚线材质

### example

```js
let material = new DC.PolylineDashMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 虚线颜色
  "gapColor": DC.Color.TRANSPARENT,// 间隔颜色
  "dashLength": 16.0// 虚线片段长度
}
```

### properties

- `{DC.Color} color`：虚线颜色
- `{DC.Color} gapColor`：间隔颜色
- `{Number} dashLength`：虚线片段长度

## DC.PolylineArrowMaterialProperty

> 箭头材质

### example

```js
let material = new DC.PolylineArrowMaterialProperty(DC.Color.WHITE)
```

### creation

- **_constructor(color)_**

  构造函数

  - 参数
    - `{DC.Color} color`：箭头颜色
  - 返回值 `materialProperty`

### properties

- `{DC.Color} color`：箭头颜色

## DC.PolylineOutlineMaterialProperty

> 边线材质

### example

```js
let material = new DC.PolylineOutlineMaterialProperty({
  color: DC.Color.WHITE,
  outlineColor: DC.Color.BLACK,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "outlineColor": DC.Color.BLACK,// 边线颜色
  "outlineWidth": 1// 边线宽度
}
```

### properties

- `{DC.Color} color`：颜色
- `{DC.Color} outlineColor`：边线颜色
- `{Number} outlineWidth`：边线宽度

## DC.PolylineGlowMaterialProperty

> 光晕材质

### example

```js
let material = new DC.PolylineGlowMaterialProperty({
  color: DC.Color.WHITE,
  glowPower: 0.25,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "glowPower": 0.25,// 发光强度，以总线宽的百分比表示
  "taperPower": 1 // 渐缩效果的强度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} glowPower`：发光强度
- `{Number} taperPower`：渐缩效果的强度

## DC.PolylineFlickerMaterialProperty

> 闪烁线材质

### example

```js
let material = new DC.PolylineFlickerMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "speed": 10 // 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.PolylineFlowMaterialProperty

> 流动线材质

### example

```js
let material = new DC.PolylineFlowMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "speed": 10, // 速度,
  "percent": 0.3,// 比例
  "gradient": 0.1 // 透明程度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度
- `{Number} percent`：比例,
- `{Number} gradient`：透明程度,

## DC.PolylineImageTrailMaterialProperty

> 图片轨迹线材质

### example

```js
let material = new DC.PolylineImageTrailMaterialProperty({
  color: DC.Color.WHITE,
  image: '**/*.png',
  repeat: { x: 10, y: 1 },
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "speed": 10,// 速度
  "image": "**/*.png",// 图片地址
  "repeat": {
    "x": 10,
    "y": 1
  } //重复规则
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度
- `{String} image`：图片地址
- `{Object} repeat`：重复规则

## DC.PolylineLightingMaterialProperty

> 发光线材质

### example

```js
let material = new DC.PolylineLightingMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE // 颜色
}
```

### properties

- `{DC.Color} color`：颜色

## DC.PolylineLightingTrailMaterialProperty

> 颜色轨迹线材质

### example

```js
let material = new DC.PolylineLightingTrailMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "speed": 10// 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.PolylineTrailMaterialProperty

> 颜色轨迹线材质

### example

```js
let material = new DC.PolylineTrailMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "speed": 10 // 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.RadarLineMaterialProperty

> 雷达线材质

### example

```js
let material = new DC.RadarLineMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "speed": 10// 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.RadarWaveMaterialProperty

> 波纹雷达材质

### example

```js
let material = new DC.RadarWaveMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "speed": 10// 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.WallImageTrailMaterialProperty

> 图片轨迹墙体材质

### example

```js
let material = new DC.WallImageTrailMaterialProperty({
  color: DC.Color.WHITE,
  image: '**/*.png',
  repeat: { x: 10, y: 1 },
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE,// 颜色
  "speed": 10,// 速度
  "image": "**/*.png",// 图片地址
  "repeat": {
    "x": 10,
    "y": 1
  } //重复规则
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度
- `{String} image`：图片地址
- `{Object} repeat`：重复规则

## DC.WallTrailMaterialProperty

> 流动墙材质

### example

```js
let material = new DC.WallTrailMaterialProperty({
  color: DC.Color.WHITE,
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "color": DC.Color.WHITE, // 颜色
  "speed": 10// 速度
}
```

### properties

- `{DC.Color} color`：颜色
- `{Number} speed`：速度

## DC.WaterMaterialProperty

> 流动水材质

### example

```js
let material = new DC.WaterMaterialProperty({
  baseWaterColor: DC.Color.WHITE,
  normalMap: '**/**.png',
})
```

### creation

- **_constructor([options])_**

  构造函数

  - 参数
    - `{Object} options`：属性
  - 返回值 `materialProperty`

```js
// options（属性可选）
const options = {
  "baseWaterColor": DC.Color.WHITE,// 水体颜色
  "blendColor": DC.Color.WHITE,// 混合颜色
  "specularMap": "",// 镜面图
  "normalMap": "", // 法线图
  "frequency": 1000, //波纹数量
  "animationSpeed": 0.03, // 动画速度
  "amplitude": 10, //水波振幅
  "specularIntensity": 10 //镜面反射强度
} 
```

### properties

- `{DC.Color} baseWaterColor`：颜色
- `{DC.Color} blendColor`：混合颜色
- `{String} normalMap`：法线图
- `{String} specularMap`：镜面图
