/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import DrawPolyline from '../draw/DrawPolyline'
import EditPolyline from '../edit/EditPolyline'
import MeasureBase from '../MeasureBase'

class Distance extends MeasureBase {
  constructor() {
    super()
    this._maxAnchorSize = 9999
  }

  /**
   *
   * @param entity
   * @private
   */
  _onDrawStop(entity) {
    new EditPolyline(entity).start(
      {
        viewer: this._viewer,
        layer: this._layer,
      },
      {
        ...this._options,
        ...{ maxAnchorSize: this._maxAnchorSize },
      }
    )
  }

  /**
   *
   * @param positions
   * @private
   */
  _onCalc(positions) {
    if (positions.length > 0) {
      this._startLabel.position = positions[0]
    }
    if (positions.length > 1) {
      this._resultLabel.position = positions[positions.length - 1]
      let sum = 0
      for (let i = 0; i < positions.length - 1; i++) {
        let s = Cesium.Cartesian3.distance(positions[i], positions[i + 1])
        sum += s
      }
      this._resultLabel.label.text =
        sum > 1000
          ? `距离：${(sum / 1000).toFixed(2)} 公里`
          : `距离：${sum.toFixed(2)} 米`
    }
  }

  /**
   *
   * @param measure
   * @param options
   * @returns {Distance}
   */
  start(measure, options) {
    this._startHook(measure, options)
    new DrawPolyline({
      material: options.material || Cesium.Color.YELLOW.withAlpha(0.6),
      depthFailMaterial:
        options.depthFailMaterial ||
        new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW.withAlpha(0.6),
        }),
      width: options.width || 2,
      clampToGround: false,
    }).start(measure, {
      ...options,
      ...{ maxAnchorSize: this._maxAnchorSize },
    })
    return this
  }
}

export default Distance
