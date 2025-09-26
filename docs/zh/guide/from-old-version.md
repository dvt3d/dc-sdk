# 从旧版本迁移

## 从 2.x 迁移

### 修改框架引入方式修改

```js
// import DC from '@dvgis/dc-sdk/dist/dc.02.基础.min'
// import DcCore from '@dvgis/dc-sdk/dist/dc.core.min'
// import DcChart from '@dvgis/dc-sdk/dist/dc.chart.min'
// import DcMapv from '@dvgis/dc-sdk/dist/dc.mapv.min'
// import DcS3M from '@dvgis/dc-sdk/dist/dc.s3m.min'
// import '@dvgis/dc-sdk/dist/dc.core.min.css'
import * as DC from '@dvgis/dc-sdk'
import '@dvgis/dc-sdk/dist/dc.min.css'
```

### 修改框架初始函数

```js
let viewer = new DC.Viewer("viewer-container")
```

## 从 3.x 和 4.x 迁移

### 修改框架初始函数

```js
// DC.ready().then(initViewer)
let viewer = new DC.Viewer("viewer-container")
```

