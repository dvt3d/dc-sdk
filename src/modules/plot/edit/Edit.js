/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import { PlotEventType } from '../../event'
import { Transform } from '../../transform'

class Edit {
  constructor(overlay) {
    this._viewer = undefined
    this._layer = undefined
    this._overlay = overlay
    this._overlay.show = false
    this._delegate = new Cesium.Entity()
    this._delegate.merge(overlay.delegate)
    this._options = {}
    this._positions = []
  }

  get editTool() {
    return this._viewer.editTool
  }

  /**
   *
   * @private
   */
  _mountedHook() {}

  /**
   *
   * @private
   */
  _stoppedHook() {
    this._overlay.positions = Transform.transformCartesianArrayToWGS84Array(
      this._positions
    )
    this._overlay.show = true
    this._options.onEditStop && this._options.onEditStop(this._overlay)
  }

  /**
   *
   * @private
   */
  _mountAnchor() {
    this._positions = [].concat(
      Transform.transformWGS84ArrayToCartesianArray(this._overlay.positions)
    )
    this._positions.forEach((item, index) => {
      this.editTool.fire(PlotEventType.CREATE_ANCHOR, {
        position: item,
        index: index,
      })
    })
  }

  /**
   *
   * @param pickedAnchor
   * @param position
   * @returns {boolean}
   * @private
   */
  _onEditAnchorStop({ pickedAnchor, position }) {
    let properties = pickedAnchor.properties.getValue(Cesium.JulianDate.now())
    this._positions[properties.index] = position
  }

  /**
   *
   * @param pickedAnchor
   * @param position
   * @private
   */
  _onAnchorMoving({ pickedAnchor, position }) {
    let properties = pickedAnchor.properties.getValue(Cesium.JulianDate.now())
    this._positions[properties.index] = position
  }

  /**
   *
   * @param pickedAnchor
   * @param position
   * @private
   */
  _onEditStop({ pickedAnchor, position }) {
    this._unbindEvent()
    this._viewer.editTool.deactivate()
    this._layer.entities.remove(this._delegate)
    this._stoppedHook()
  }

  /**
   *
   * @returns {Edit}
   * @private
   */
  _bindEvent() {
    this.editTool.on(PlotEventType.ANCHOR_MOVING, this._onAnchorMoving, this)
    this.editTool.on(
      PlotEventType.EDIT_ANCHOR_STOP,
      this._onEditAnchorStop,
      this
    )
    this.editTool.on(PlotEventType.EDIT_STOP, this._onEditStop, this)
    return this
  }

  /**
   *
   * @private
   */
  _unbindEvent() {
    this.editTool.off(PlotEventType.ANCHOR_MOVING, this._onAnchorMoving, this)
    this.editTool.off(
      PlotEventType.EDIT_ANCHOR_STOP,
      this._onEditAnchorStop,
      this
    )
    this.editTool.off(PlotEventType.EDIT_STOP, this._onEditStop, this)
  }

  /**
   *
   * @param plot
   * @param options
   * @returns {Edit}
   */
  start(plot, options) {
    this._viewer = plot.viewer
    this._layer = plot.layer
    this._options = options
    this._viewer.editTool.deactivate()
    this._viewer.editTool.tooltipMess = '点击锚点移动,右击结束编辑'
    this._viewer.editTool.activate(options)
    this._mountedHook()
    this._mountAnchor()
    this._unbindEvent()
    this._bindEvent()
    return this
  }

  /**
   *
   * @returns {Edit}
   */
  stop() {
    this.editTool.fire(PlotEventType.EDIT_STOP, {
      pickedAnchor: null,
      position: null,
    })
    return this
  }
}

export default Edit
