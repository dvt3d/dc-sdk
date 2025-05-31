/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Edit from './Edit'

class EditRectangle extends Edit {
  constructor(overlay) {
    super(overlay)
    this._overlay = overlay
  }

  /**
   *
   * @private
   */
  _mountedHook() {
    this._delegate.rectangle.coordinates = new Cesium.CallbackProperty(
      (time) => {
        if (this._positions.length > 1) {
          return Cesium.Rectangle.fromCartesianArray(this._positions)
        } else {
          return null
        }
      },
      false
    )
    this._layer.entities.add(this._delegate)
  }
}

export default EditRectangle
