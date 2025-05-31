/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Edit from './Edit'
import { Transform } from '../../transform'

class EditPoint extends Edit {
  constructor(overlay) {
    super(overlay)
    this._position = undefined
  }

  /**
   *
   * @private
   */
  _mountedHook() {
    this.editTool.tooltipMess = '右击结束编辑'
    this._position = this._delegate.position.getValue(Cesium.JulianDate.now())
    this._delegate.position = new Cesium.CallbackProperty(() => {
      return this._position
    }, false)
    this._layer.entities.add(this._delegate)
  }

  /**
   *
   * @private
   */
  _stoppedHook() {
    this._overlay.position = Transform.transformCartesianToWGS84(this._position)
    this._overlay.show = true
    this._options.onEditStop && this._options.onEditStop(this._overlay)
  }

  /**
   *
   * @param pickedAnchor
   * @param position
   * @private
   */
  _onAnchorMoving({ pickedAnchor, position }) {
    this._position = position
  }
}

export default EditPoint
