# 工具 API 🌎

三维场景中的辅助工具，方便在场景中进行各种标绘、测量、位置编辑

## DC.Plot

> 标绘类

### example

```js
let plot = new DC.Plot(viewer, {})
plot.draw(DC.OverlayType.POINT, (overlay) => {
}, {})
```

### creation

- **_constructor(viewer,[options])_**

  构造函数

  - 参数
    - `{Viewer} viewer`：场景
    - `{Object} options`：属性
  - 返回值 `plot`

```js
// options（属性可选）
const options = {
  "icon_center": "**.png", // 自定义的中心点图标
  "icon_anchor": "**.png", //自定义的锚点图标
  "icon_midAnchor": "**.png", //自定义的中心锚点图标
  "icon_size": [12, 12],//自定义的中心锚点大小
  "clampToModel": false // 点位是否获取模型表面坐标
}
```

### methods

- **_draw(type,callback,[style],[clampToModel])_**

标绘

- 参数
  - `{String} type`：覆盖物类型，参照 [OverlayType](./global#overlaytype)
  - `{Function} callback`：标绘完成的回调函数，参数为覆盖物
  - `{Object} style`：标绘的覆盖物样式设置
  - `{Boolean} clampToModel`：点位是否获取模型表面坐标
- 返回值 `this`

- **_edit(overlay,callback,[clampToModel])_**

编辑

- 参数
  - `{Overlay} overlay`：覆盖物
  - `{Function} callback`：编辑完成的回调函数，参数为覆盖物
  - `{Boolean} clampToModel`：点位是否获取模型表面坐标
- 返回值 `this`

- **_stop()_**

停止

- 返回值 `this`

## DC.Measure

> 三维空间分析

### example

```js
let measure = new DC.Measure(viewer)
```

### creation

- **_constructor(viewer)_**

  构造函数

  - 参数
    - `{Viewer} viewer`：场景
  - 返回值 `measure`

### methods

- **_angle([options])_**

  角度

  - 参数
    - `{Object} options`：配置
  - 返回值 `this`

- **_area([options])_**

  面积

  - 参数
    - `{Object} options`：配置
  - 返回值 `this`

- **_areaSurface([options])_**

  表面面积

  - 参数
    - `{Object} options`：配置
  - 返回值 `this`

- **_distance([options])_**

  距离

  - 参数
    - `{Object} options`：配置
  - 返回值 `this`

- **_distanceSurface([options])_**

  表面距离

  - 参数
    - `{Object} options`：配置
  - 返回值 `this`

- **_heading([options])_**

  偏航角

  - 参数
    - `{Object} options`：配置
  - 返回值 `this`

- **_height([options])_**

  高度

  - 参数
    - `{Object} options`：配置
  - 返回值 `this`

- **_triangleHeight([options])_**

  三角测量

  - 参数
    - `{Object} options`：配置
  - 返回值 `this`

- **_activate(type,[options])_**

  根据类型分析

  - 参数
    - `{String} type`：分析类型，参考 `DC.MeasureType`,
    - `{Object} options`：配置
  - 返回值 `this`

```js
// options（属性可选）
const options = {
  "icon_center": "**.png", // 自定义的中心点图标
  "icon_anchor": "**.png", //自定义的锚点图标
  "icon_midAnchor": "**.png", //自定义的中心锚点图标
  "icon_size": [12, 12], //自定义的中心锚点大小
  "clampToModel": false //点位是否获取模型表面坐标
}
```

- **_deactivate()_**

  释放空间分析

  - 返回值 `this`
