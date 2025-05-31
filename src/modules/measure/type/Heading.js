/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import { heading } from '../../math'
import DrawPolyline from '../draw/DrawPolyline'
import EditPolyline from '../edit/EditPolyline'
import MeasureBase from '../MeasureBase'

class Heading extends MeasureBase {
  constructor() {
    super()
    this._maxAnchorSize = 2
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
      this._resultLabel.label.text = `偏航：${Cesium.Math.toDegrees(
        heading(positions[0], positions[1])
      ).toFixed(1)} 度`
    }
  }

  /**
   *
   * @param measure
   * @param options
   * @returns {Heading}
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
    }).start(measure, {
      ...this._options,
      ...{ maxAnchorSize: this._maxAnchorSize },
    })
    return this
  }
}

export default Heading
