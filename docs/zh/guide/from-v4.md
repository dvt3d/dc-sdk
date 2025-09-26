# 从 2.x 迁移

## 修改框架引入方式修改

```js
import * as DC from '@dvgis/dc-sdk'
import '@dvgis/dc-sdk/dist/dc.min.css'
```

## 修改框架初始函数

```js
// DC.ready().then(initViewer)
let viewer = new DC.Viewer("viewer-container")
```
