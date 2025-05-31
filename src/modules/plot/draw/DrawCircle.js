/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import { PlotEventType } from '../../event'
import { Transform } from '../../transform'
import { Circle } from '../../overlay'
import Draw from './Draw'

const DEF_STYLE = {
  material: Cesium.Color.YELLOW.withAlpha(0.6),
  fill: true,
}

class DrawCircle extends Draw {
  constructor(style) {
    super()
    this._maxAnchorSize = 2
    this._radius = 0
    this._style = {
      ...DEF_STYLE,
      ...style,
    }
  }

  /**
   *
   * @private
   */
  _mountedHook() {
    this.drawTool.tooltipMess = '单击选择点位'
    this._delegate = new Cesium.Entity({
      polygon: {
        ...this._style,
        hierarchy: new Cesium.CallbackProperty(() => {
          if (this._positions.length > 1) {
            this._radius = Cesium.Cartesian3.distance(
              this._positions[0],
              this._positions[1]
            )
            if (this._radius <= 0) {
              return null
            }
            let cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions(
              {
                center: this._positions[0],
                semiMajorAxis: this._radius,
                semiMinorAxis: this._radius,
                rotation: 0,
                granularity: 0.005,
              },
              false,
              true
            )
            let pnts = Cesium.Cartesian3.unpackArray(cep.outerPositions)
            pnts.push(pnts[0])
            return new Cesium.PolygonHierarchy(pnts)
          } else {
            return null
          }
        }, false),
      },
    })
    this._layer.entities.add(this._delegate)
  }

  /**
   *
   * @private
   */
  _stoppedHook() {
    let circle = null
    if (this._positions.length) {
      circle = new Circle(
        Transform.transformCartesianToWGS84(this._positions[0]),
        this._radius
      ).setStyle(this._style)
    }
    this._options.onDrawStop && this._options.onDrawStop(circle)
  }

  /**
   *
   * @param position
   * @private
   */
  _onDrawAnchor(position) {
    let len = this._positions.length
    this._positions.push(position)
    this.drawTool.fire(PlotEventType.CREATE_ANCHOR, {
      position,
      isCenter: len === 1,
    })
    if (len >= this._maxAnchorSize) {
      this._positions.pop()
      this.drawTool.fire(PlotEventType.DRAW_STOP)
    }
  }
}

export default DrawCircle
