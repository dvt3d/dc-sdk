/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Edit from './Edit'
import GatheringPlaceGraphics from '../graphics/GatheringPlaceGraphics'

class EditGatheringPlace extends Edit {
  constructor(overlay) {
    super(overlay)
    this._graphics = new GatheringPlaceGraphics()
  }

  /**
   *
   * @private
   */
  _mountedHook() {
    this._delegate.polygon.hierarchy = new Cesium.CallbackProperty(() => {
      if (this._positions.length > 1) {
        this._graphics.positions = this._positions
        return this._graphics.hierarchy
      } else {
        return null
      }
    }, false)
    this._layer.entities.add(this._delegate)
  }
}

export default EditGatheringPlace
