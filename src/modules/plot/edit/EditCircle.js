/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Edit from './Edit'
import { PlotEventType } from '../../event'
import { Transform } from '../../transform'

class EditCircle extends Edit {
  constructor(overlay) {
    super(overlay)
    this._center = undefined
    this._radius = 0
  }

  /**
   *
   * @private
   */
  _mountedHook() {
    this._radius = this._overlay.radius
    this._center = Transform.transformWGS84ToCartesian(this._overlay.center)
    this._positions = [].concat([
      this._center,
      this._computeCirclePoints(this._center, this._radius)[0],
    ])
    this._delegate.ellipse = null
    this._delegate.polygon = {
      ...this._overlay._style,
    }
    this._delegate.polygon.hierarchy = new Cesium.CallbackProperty((time) => {
      if (this._positions.length > 1) {
        this._radius = Cesium.Cartesian3.distance(
          this._positions[0],
          this._positions[1]
        )
        if (this._radius <= 0) {
          return null
        }
        let pnts = this._computeCirclePoints(this._positions[0], this._radius)
        pnts.push(pnts[0])
        return new Cesium.PolygonHierarchy(pnts)
      } else {
        return null
      }
    }, false)
    this._layer.entities.add(this._delegate)
  }

  /**
   *
   * @param center
   * @param radius
   * @returns {*[]}
   * @private
   */
  _computeCirclePoints(center, radius) {
    let pnts = []
    let cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions(
      {
        center: center,
        semiMajorAxis: radius,
        semiMinorAxis: radius,
        rotation: 0,
        granularity: 0.005,
      },
      false,
      true
    )
    if (cep && cep.outerPositions) {
      pnts = Cesium.Cartesian3.unpackArray(cep.outerPositions)
    }
    return pnts
  }

  /**
   *
   * @private
   */
  _stoppedHook() {
    this._overlay.center = Transform.transformCartesianToWGS84(
      this._positions[0]
    )
    this._overlay.radius = this._radius
    this._overlay.show = true
    this._options.onEditStop && this._options.onEditStop(this._overlay)
  }

  /**
   *
   * @private
   */
  _mountAnchor() {
    this._positions.forEach((item, index) => {
      this.editTool.fire(PlotEventType.CREATE_ANCHOR, {
        position: item,
        index: index,
        isCenter: index % 2 === 0,
      })
    })
  }
}

export default EditCircle
