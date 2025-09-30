/**
 * DrawBezierCurve - 绘制贝塞尔曲线工具
 * @Author : zisahng520
 */

import { Cesium } from '../../../libs'
import Draw from './Draw'
import { PlotEventType } from '../../event'
import { Transform } from '../../transform'
import { BezierCurve } from '../../overlay'

const DEF_STYLE = {
  width: 3,
  material: Cesium.Color.CYAN,
  clampToGround: true,
}

class DrawBezierCurve extends Draw {
  constructor(style, options = {}) {
    super()
    this._minAnchorSize = options.minPoints || 2
    this._curveType = options.curveType || 'spline'
    this._resolution = options.resolution || 100
    this._showControlPoints = (options.showControlPoints || false) !== false

    this._style = {
      ...DEF_STYLE,
      ...style,
    }

    this._previewCurve = new BezierCurve([], {
      curveType: this._curveType,
      resolution: this._resolution,
      showControlPoints: this._showControlPoints,
    })
  }

  /**
   * 挂载钩子
   * @private
   */
  _mountedHook() {
    this.drawTool.tooltipMess = '单击添加控制点，右击完成绘制'

    this._delegate = new Cesium.Entity({
      polyline: {
        ...this._style,
        positions: new Cesium.CallbackProperty(() => {
          if (this._positions.length >= this._minAnchorSize) {
            const wgs84Positions =
              Transform.transformCartesianArrayToWGS84Array(this._positions)
            this._previewCurve.positions = wgs84Positions
            return this._previewCurve._calculateBezierPoints()
          }
          return this._positions
        }, false),
      },
    })

    this._layer.entities.add(this._delegate)
    this._createControlPointsPreview()
  }

  /**
   * 创建控制点预览
   * @private
   */
  _createControlPointsPreview() {
    if (!this._showControlPoints) return

    this._controlPointsEntity = new Cesium.Entity({
      point: {
        pixelSize: 0, // 隐藏主点
      },
    })

    // 使用 CallbackProperty 动态显示控制点
    this._controlPointsEntity.position = new Cesium.CallbackProperty(() => {
      return (
        this._positions[this._positions.length - 1] || new Cesium.Cartesian3()
      )
    }, false)

    this._layer.entities.add(this._controlPointsEntity)
  }

  /**
   * 停止钩子
   * @private
   */
  _stoppedHook() {
    let bezierCurve = null
    if (this._positions.length >= this._minAnchorSize) {
      const wgs84Positions = Transform.transformCartesianArrayToWGS84Array(
        this._positions
      )
      bezierCurve = new BezierCurve(wgs84Positions, {
        curveType: this._curveType,
        resolution: this._resolution,
        showControlPoints: this._showControlPoints,
      }).setStyle(this._style)
    }
    this._options.onDrawStop && this._options.onDrawStop(bezierCurve)
  }

  /**
   * 锚点绘制处理
   * @param {Cesium.Cartesian3} position
   * @private
   */
  _onDrawAnchor(position) {
    this._positions.push(position)
    this.drawTool.fire(PlotEventType.CREATE_ANCHOR, { position })

    // 创建控制点可视化
    if (this._showControlPoints) {
      const controlPoint = this._layer.entities.add({
        position: position,
        point: {
          pixelSize: 8,
          color: Cesium.Color.YELLOW,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: `C${this._positions.length - 1}`,
          font: '12pt sans-serif',
          pixelOffset: new Cesium.Cartesian2(0, -25),
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 1,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        },
      })

      if (!this._tempControlPoints) {
        this._tempControlPoints = []
      }
      this._tempControlPoints.push(controlPoint)
    }

    // 更新提示信息
    if (this._positions.length < this._minAnchorSize) {
      this.drawTool.tooltipMess = `还需要 ${
        this._minAnchorSize - this._positions.length
      } 个控制点`
    } else {
      this.drawTool.tooltipMess = '继续添加控制点或右击完成'
    }
  }

  /**
   * 右键完成绘制
   * @param {Cesium.Cartesian3} position
   * @private
   */
  _onDrawRight(position) {
    if (this._positions.length >= this._minAnchorSize) {
      this.drawTool.fire(PlotEventType.DRAW_STOP)
    }
  }

  /**
   * 设置曲线类型
   * @param {string} type
   */
  setCurveType(type) {
    this._curveType = type
    if (this._previewCurve) {
      this._previewCurve.setCurveType(type)
    }
  }

  /**
   * 设置分辨率
   * @param {number} resolution
   */
  setResolution(resolution) {
    this._resolution = resolution
    if (this._previewCurve) {
      this._previewCurve.setResolution(resolution)
    }
  }

  /**
   * 清理临时控制点
   * @private
   */
  _cleanup() {
    if (this._tempControlPoints) {
      this._tempControlPoints.forEach((point) => {
        this._layer.entities.remove(point)
      })
      this._tempControlPoints = []
    }
    super._cleanup?.()
  }
}

export default DrawBezierCurve
