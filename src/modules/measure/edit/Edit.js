/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import { PlotEventType } from '../../event'

class Edit {
  constructor(overlay) {
    this._viewer = undefined
    this._layer = undefined
    this._overlay = overlay
    this._delegate = new Cesium.Entity()
    this._delegate.merge(overlay)
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
  _mountAnchor() {}

  /**
   *
   * @param index
   * @param position
   * @private
   */
  _onAnchorMoving({ pickedAnchor, position }) {}

  /**
   *
   * @param pickedAnchor
   * @param position
   * @private
   */
  _onEditAnchorStop({ pickedAnchor, position }) {}

  /**
   *
   * @param pickedAnchor
   * @param position
   * @private
   */
  _onEditStop({ pickedAnchor, position }) {
    this._unbindEvent()
    this._viewer.editTool.deactivate()
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
   * @param measure
   * @param options
   * @returns {Edit}
   */
  start(measure, options) {
    this._viewer = measure.viewer
    this._layer = measure.layer
    this._options = options
    this._viewer.editTool.deactivate()
    this._viewer.editTool.activate(options)
    this._mountedHook()
    this._mountAnchor()
    this._unbindEvent()
    this._bindEvent()
    return this
  }
}

export default Edit
