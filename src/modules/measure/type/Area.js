/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import { area } from '../../math'
import DrawPolygon from '../draw/DrawPolygon'
import EditPolygon from '../edit/EditPolygon'
import MeasureBase from '../MeasureBase'

class Area extends MeasureBase {
  constructor() {
    super()
  }

  /**
   *
   * @param entity
   * @private
   */
  _onDrawStop(entity) {
    new EditPolygon(entity).start(
      {
        viewer: this._viewer,
        layer: this._layer,
      },
      this._options
    )
  }

  /**
   *
   * @param positions
   * @private
   */
  _onCalc(positions) {
    if (positions.length > 2) {
      this._resultLabel.position =
        Cesium.BoundingSphere.fromPoints(positions)?.center
      this._resultLabel.label.text = `面积：${area(positions).toFixed(
        2
      )} 平方米`
    }
  }

  /**
   *
   * @param measure
   * @param options
   * @returns {Area}
   */
  start(measure, options) {
    this._startHook(measure, options)
    new DrawPolygon({
      material: options.material || Cesium.Color.YELLOW.withAlpha(0.6),
      perPositionHeight: true,
    }).start(measure, this._options)
    return this
  }
}

export default Area
