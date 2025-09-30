/**
 * BezierCurve - 贝塞尔曲线覆盖物
 * @Author : zishang520
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import Parse from '../../parse/Parse'
import State from '../../state/State'
import { Transform } from '../../transform'
import { Util } from '../../utils'

class BezierCurve extends Overlay {
  constructor(positions, options = {}) {
    super()
    this._positions = Parse.parsePositions(positions)
    this._delegate = new Cesium.Entity({ polyline: {} })

    // 贝塞尔曲线配置参数
    this.resolution = options.resolution || 100 // 曲线分段数
    this.curveType = options.curveType || 'spline' // 'quadratic' | 'cubic' | 'auto'
    this.showControlPoints = options.showControlPoints || false
    this.controlPointStyle = options.controlPointStyle || {
      pixelSize: 8,
      color: Cesium.Color.YELLOW,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    }

    this._controlPointEntities = []
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('bezier_curve')
  }

  set positions(positions) {
    this._positions = Parse.parsePositions(positions)
    this._updateCurve()
  }

  get positions() {
    return this._positions
  }

  /**
   * 计算贝塞尔曲线点
   * @private
   */
  _calculateBezierPoints() {
    if (this._positions.length < 2) {
      return []
    }

    const cartesianPositions = Transform.transformWGS84ArrayToCartesianArray(
      this._positions
    )

    // 根据控制点数量决定曲线类型
    let curvePoints = []
    const pointCount = cartesianPositions.length

    if (this.curveType === 'auto') {
      if (pointCount === 2) {
        curvePoints = this._calculateLinear(cartesianPositions)
      } else if (pointCount === 3) {
        curvePoints = this._calculateQuadraticBezier(cartesianPositions)
      } else if (pointCount === 4) {
        curvePoints = this._calculateCubicBezier(cartesianPositions)
      } else {
        // 使用Cardinal样条处理多个点
        curvePoints = this._calculateCardinalSpline(cartesianPositions)
      }
    } else if (this.curveType === 'quadratic' && pointCount >= 3) {
      curvePoints = this._calculateQuadraticBezier(
        cartesianPositions.slice(0, 3)
      )
    } else if (this.curveType === 'cubic' && pointCount >= 4) {
      curvePoints = this._calculateCubicBezier(cartesianPositions.slice(0, 4))
    } else if (this.curveType === 'spline') {
      // 新增样条类型
      curvePoints = this._calculateCardinalSpline(cartesianPositions)
    } else {
      curvePoints = this._calculateLinear(cartesianPositions)
    }

    return curvePoints
  }

  /**
   * 计算线性插值
   * @param {Array} points
   * @private
   */
  _calculateLinear(points) {
    if (points.length < 2) return points

    const result = []
    const p0 = points[0]
    const p1 = points[1]

    for (let i = 0; i <= this.resolution; i++) {
      const t = i / this.resolution
      const point = new Cesium.Cartesian3(
        p0.x + t * (p1.x - p0.x),
        p0.y + t * (p1.y - p0.y),
        p0.z + t * (p1.z - p0.z)
      )
      result.push(point)
    }

    return result
  }

  /**
   * 计算二次贝塞尔曲线
   * @param {Array} points [P0, P1, P2]
   * @private
   */
  _calculateQuadraticBezier(points) {
    if (points.length < 3) return points

    const result = []
    const [p0, p1, p2] = points

    for (let i = 0; i <= this.resolution; i++) {
      const t = i / this.resolution
      const u = 1 - t

      // B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
      const point = new Cesium.Cartesian3(
        u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
        u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
        u * u * p0.z + 2 * u * t * p1.z + t * t * p2.z
      )
      result.push(point)
    }

    return result
  }

  /**
   * 计算三次贝塞尔曲线
   * @param {Array} points [P0, P1, P2, P3]
   * @private
   */
  _calculateCubicBezier(points) {
    if (points.length < 4) return points

    const result = []
    const [p0, p1, p2, p3] = points

    for (let i = 0; i <= this.resolution; i++) {
      const t = i / this.resolution
      const u = 1 - t

      // B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
      const point = new Cesium.Cartesian3(
        u * u * u * p0.x +
          3 * u * u * t * p1.x +
          3 * u * t * t * p2.x +
          t * t * t * p3.x,
        u * u * u * p0.y +
          3 * u * u * t * p1.y +
          3 * u * t * t * p2.y +
          t * t * t * p3.y,
        u * u * u * p0.z +
          3 * u * u * t * p1.z +
          3 * u * t * t * p2.z +
          t * t * t * p3.z
      )
      result.push(point)
    }

    return result
  }

  /**
   * 计算多段贝塞尔曲线（使用Catmull-Rom样条或连续三次贝塞尔）
   * @param {Array} points
   * @private
   */
  _calculateMultiSegmentBezier(points) {
    if (points.length < 4) {
      return points.length === 3
        ? this._calculateQuadraticBezier(points)
        : this._calculateLinear(points)
    }

    // 使用连续的三次贝塞尔曲线方法
    return this._calculateContinuousCubicBezier(points)
  }

  /**
   * 计算连续三次贝塞尔曲线
   * 使用控制点生成平滑的连续曲线
   * @param {Array} points
   * @private
   */
  _calculateContinuousCubicBezier(points) {
    if (points.length < 4) {
      return this._calculateQuadraticBezier(points.slice(0, 3))
    }

    const result = []

    // 方法1: 使用原始控制点序列作为贝塞尔控制点
    if (points.length === 4) {
      return this._calculateCubicBezier(points)
    }

    // 方法2: 对于超过4个点，使用分段插值
    // 将控制点作为关键点，生成中间的控制点
    const keyPoints = points
    const segments = keyPoints.length - 1

    for (let i = 0; i < segments; i++) {
      const p0 = keyPoints[Math.max(0, i - 1)]
      const p1 = keyPoints[i]
      const p2 = keyPoints[i + 1]
      const p3 = keyPoints[Math.min(keyPoints.length - 1, i + 2)]

      // 使用Catmull-Rom样条的控制点计算方法
      const segmentPoints = this._generateBezierControlPoints(p0, p1, p2, p3)
      const segmentCurve = this._calculateCubicBezier(segmentPoints)

      // 避免重复点
      const startFrom = i === 0 ? 0 : 1
      result.push(...segmentCurve.slice(startFrom))
    }

    return result
  }

  /**
   * 根据四个关键点生成三次贝塞尔控制点
   * 使用Catmull-Rom样条的切线方法
   * @param {Cesium.Cartesian3} p0
   * @param {Cesium.Cartesian3} p1
   * @param {Cesium.Cartesian3} p2
   * @param {Cesium.Cartesian3} p3
   * @private
   */
  _generateBezierControlPoints(p0, p1, p2, p3) {
    // Catmull-Rom to Bezier conversion
    const tension = 0.5 // 可调节张力参数

    // 计算切线
    const t1 = new Cesium.Cartesian3(
      tension * (p2.x - p0.x),
      tension * (p2.y - p0.y),
      tension * (p2.z - p0.z)
    )

    const t2 = new Cesium.Cartesian3(
      tension * (p3.x - p1.x),
      tension * (p3.y - p1.y),
      tension * (p3.z - p1.z)
    )

    // 生成贝塞尔控制点
    const cp1 = new Cesium.Cartesian3(
      p1.x + t1.x / 3,
      p1.y + t1.y / 3,
      p1.z + t1.z / 3
    )

    const cp2 = new Cesium.Cartesian3(
      p2.x - t2.x / 3,
      p2.y - t2.y / 3,
      p2.z - t2.z / 3
    )

    return [p1, cp1, cp2, p2]
  }

  /**
   * 使用Cardinal样条方法（备选实现）
   * @param {Array} points
   * @private
   */
  _calculateCardinalSpline(points) {
    if (points.length < 3) {
      return this._calculateLinear(points)
    }

    const result = []
    const tension = 0.5

    // 添加虚拟端点以确保曲线通过第一个和最后一个点
    const extendedPoints = [
      points[0], // 重复第一个点
      ...points,
      points[points.length - 1], // 重复最后一个点
    ]

    for (let i = 1; i < extendedPoints.length - 2; i++) {
      const p0 = extendedPoints[i - 1]
      const p1 = extendedPoints[i]
      const p2 = extendedPoints[i + 1]
      const p3 = extendedPoints[i + 2]

      // Cardinal spline interpolation
      for (let t = 0; t <= 1; t += 1 / this.resolution) {
        if (i === 1 && t === 0) {
          // 添加起始点
          result.push(p1)
          continue
        }

        const t2 = t * t
        const t3 = t2 * t

        // Cardinal spline基函数
        const h1 = 2 * t3 - 3 * t2 + 1
        const h2 = -2 * t3 + 3 * t2
        const h3 = t3 - 2 * t2 + t
        const h4 = t3 - t2

        // 切线向量
        const tan1 = new Cesium.Cartesian3(
          tension * (p2.x - p0.x),
          tension * (p2.y - p0.y),
          tension * (p2.z - p0.z)
        )

        const tan2 = new Cesium.Cartesian3(
          tension * (p3.x - p1.x),
          tension * (p3.y - p1.y),
          tension * (p3.z - p1.z)
        )

        const point = new Cesium.Cartesian3(
          h1 * p1.x + h2 * p2.x + h3 * tan1.x + h4 * tan2.x,
          h1 * p1.y + h2 * p2.y + h3 * tan1.y + h4 * tan2.y,
          h1 * p1.z + h2 * p2.z + h3 * tan1.z + h4 * tan2.z
        )

        result.push(point)
      }
    }

    return result
  }

  /**
   * 更新曲线
   * @private
   */
  _updateCurve() {
    const curvePoints = this._calculateBezierPoints()
    this._delegate.polyline.positions = curvePoints

    if (this.showControlPoints) {
      this._updateControlPoints()
    }
  }

  /**
   * 更新控制点显示
   * @private
   */
  _updateControlPoints() {
    // 清除现有控制点
    this._clearControlPoints()

    if (!this.showControlPoints) return

    const cartesianPositions = Transform.transformWGS84ArrayToCartesianArray(
      this._positions
    )

    cartesianPositions.forEach((position, index) => {
      const controlPoint = new Cesium.Entity({
        position: position,
        point: {
          ...this.controlPointStyle,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: `C${index}`,
          font: '12pt sans-serif',
          pixelOffset: new Cesium.Cartesian2(0, -25),
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 1,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      })

      this._controlPointEntities.push(controlPoint)
    })
  }

  /**
   * 清除控制点
   * @private
   */
  _clearControlPoints() {
    this._controlPointEntities.forEach((entity) => {
      if (entity && entity.parent) {
        entity.parent.entities.remove(entity)
      }
    })
    this._controlPointEntities = []
  }

  /**
   * 挂载钩子
   * @private
   */
  _mountedHook() {
    this.positions = this._positions
  }

  /**
   * 设置曲线类型
   * @param {string} type 'linear' | 'quadratic' | 'cubic' | 'auto' | 'spline'
   * @returns {BezierCurve}
   */
  setCurveType(type) {
    this.curveType = type
    this._updateCurve()
    return this
  }

  /**
   * 设置分辨率
   * @param {number} resolution
   * @returns {BezierCurve}
   */
  setResolution(resolution) {
    this.resolution = Math.max(10, Math.min(1000, resolution))
    this._updateCurve()
    return this
  }

  /**
   * 显示/隐藏控制点
   * @param {boolean} show
   * @returns {BezierCurve}
   */
  setShowControlPoints(show) {
    this.showControlPoints = show
    if (show) {
      this._updateControlPoints()
    } else {
      this._clearControlPoints()
    }
    return this
  }

  /**
   * 设置标签（贝塞尔曲线通常不需要标签，但保持接口一致性）
   * @param {string} text
   * @param {Object} textStyle
   * @returns {BezierCurve}
   */
  setLabel(text, textStyle) {
    // 可以在曲线中点添加标签
    if (text) {
      const curvePoints = this._calculateBezierPoints()
      if (curvePoints.length > 0) {
        const midIndex = Math.floor(curvePoints.length / 2)
        this._delegate.label = {
          text: text,
          position: curvePoints[midIndex],
          ...textStyle,
        }
      }
    }
    return this
  }

  /**
   * 设置样式
   * @param {Object} style
   * @returns {BezierCurve}
   */
  setStyle(style) {
    if (Object.keys(style).length === 0) {
      return this
    }

    delete style['positions']
    Util.merge(this._style, style)
    Util.merge(this._delegate.polyline, style)

    // 更新控制点样式
    if (style.controlPointStyle) {
      this.controlPointStyle = {
        ...this.controlPointStyle,
        ...style.controlPointStyle,
      }
      if (this.showControlPoints) {
        this._updateControlPoints()
      }
    }

    return this
  }

  /**
   * 获取曲线长度（近似）
   * @returns {number}
   */
  getCurveLength() {
    const curvePoints = this._calculateBezierPoints()
    let length = 0

    for (let i = 1; i < curvePoints.length; i++) {
      length += Cesium.Cartesian3.distance(curvePoints[i - 1], curvePoints[i])
    }

    return length
  }

  /**
   * 在曲线上获取指定参数t处的点
   * @param {number} t 参数值 (0-1)
   * @returns {Cesium.Cartesian3}
   */
  getPointAtParameter(t) {
    t = Math.max(0, Math.min(1, t))
    const curvePoints = this._calculateBezierPoints()
    const index = Math.floor(t * (curvePoints.length - 1))
    return curvePoints[index] || curvePoints[curvePoints.length - 1]
  }

  /**
   * 销毁
   */
  destroy() {
    this._clearControlPoints()
    super.destroy?.()
  }
}

// 注册覆盖物类型
Overlay.registerType('bezier_curve')

export default BezierCurve
