/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import { MouseEventType, PlotEventType, PlotEvent } from '../event'
import IMG_CIRCLE_RED from '../images/circle_red.png'
import IMG_CIRCLE_YELLOW from '../images/circle_yellow.png'

const DEF_OPTS = {
  icon_center: IMG_CIRCLE_YELLOW,
  icon_anchor: IMG_CIRCLE_RED,
  icon_size: [12, 12],
  clampToModel: false,
  maxAnchorSize: 999,
}

class DrawTool {
  constructor() {
    this._viewer = undefined
    this._anchorLayer = new Cesium.CustomDataSource('draw-anchor-layer')
    this._floatingAnchor = undefined
    this._options = {}
    this._plotEvent = new PlotEvent()
    this._tooltipMess = undefined
  }

  set tooltipMess(tooltipMess) {
    this._tooltipMess = tooltipMess
  }

  _getEventPosition(e) {
    return this._options.clampToModel && e.position
      ? e.position
      : e.surfacePosition
  }

  /**
   *
   * @param e
   * @returns {boolean}
   * @private
   */
  _onClick(e) {
    let position = this._getEventPosition(e)
    if (!position) {
      return false
    }
    if (!this._floatingAnchor) {
      this._floatingAnchor = this._onCreateAnchor({ position })
    }
    this._plotEvent.fire(PlotEventType.DRAW_ANCHOR, position)
  }

  /**
   *
   * @param e
   * @private
   */
  _onMouseMove(e) {
    this._viewer.tooltip.showAt(e.windowPosition, this._tooltipMess)
    let position = this._getEventPosition(e)
    if (!position) {
      return false
    }
    this._floatingAnchor && this._floatingAnchor.position.setValue(position)
    this._plotEvent.fire(PlotEventType.ANCHOR_MOVING, position)
  }

  /**
   *
   * @param e
   * @private
   */
  _onRightClick(e) {
    this._plotEvent.fire(PlotEventType.DRAW_STOP, this._getEventPosition(e))
  }

  /**
   *
   * @param position
   * @param isCenter
   * @returns {*}
   * @private
   */
  _onCreateAnchor({ position, isCenter = false }) {
    return this._anchorLayer.entities.add({
      position: position,
      billboard: {
        image: isCenter ? this._options.icon_center : this._options.icon_anchor,
        width: this._options.icon_size[0],
        height: this._options.icon_size[1],
        pixelOffset: this._options.pixelOffset || new Cesium.Cartesian2(0, 0),
        eyeOffset: this._options.eyeOffset || new Cesium.Cartesian3(0, 0, -100),
        disableDepthTestDistance: this._options.disableDepthTestDistance ?? 0,
        heightReference:
          this._viewer.scene.mode === Cesium.SceneMode.SCENE3D &&
          !this._options.clampToModel
            ? Cesium.HeightReference.CLAMP_TO_GROUND
            : Cesium.HeightReference.NONE,
      },
    })
  }

  /**
   *
   * @private
   */
  _onClearAnchor() {
    this._anchorLayer.entities.removeAll()
  }

  /**
   *
   * @private
   */
  _bindEvent() {
    this._viewer.on(MouseEventType.CLICK, this._onClick, this)
    this._viewer.on(MouseEventType.MOUSE_MOVE, this._onMouseMove, this)
    this._viewer.on(MouseEventType.RIGHT_CLICK, this._onRightClick, this)
    this._plotEvent.on(PlotEventType.CREATE_ANCHOR, this._onCreateAnchor, this)
    this._plotEvent.on(PlotEventType.CLEAR_ANCHOR, this._onClearAnchor, this)
  }

  /**
   *
   * @private
   */
  _unbindEvent() {
    this._viewer.off(MouseEventType.CLICK, this._onClick, this)
    this._viewer.off(MouseEventType.MOUSE_MOVE, this._onMouseMove, this)
    this._viewer.off(MouseEventType.RIGHT_CLICK, this._onRightClick, this)
    this._plotEvent.off(PlotEventType.CREATE_ANCHOR, this._onCreateAnchor, this)
    this._plotEvent.off(PlotEventType.CLEAR_ANCHOR, this._onClearAnchor, this)
  }

  /**
   *
   * @param type
   * @param callback
   * @param context
   * @returns {DrawTool}
   */
  on(type, callback, context) {
    this._plotEvent.on(type, callback, context || this)
    return this
  }

  /**
   *
   * @param type
   * @param callback
   * @param context
   * @returns {DrawTool}
   */
  off(type, callback, context) {
    this._plotEvent.off(type, callback, context || this)
    return this
  }

  /**
   *
   * @param type
   * @param params
   * @returns {DrawTool}
   */
  fire(type, params = {}) {
    this._plotEvent.fire(type, params)
    return this
  }

  /**
   *
   * @param options
   * @returns {DrawTool}
   */
  activate(options = {}) {
    this._viewer.tooltip.enable = true
    this._options = { ...DEF_OPTS, ...options }
    this._unbindEvent()
    this._bindEvent()
    this.fire(PlotEventType.DRAW_START, this._options)
    return this
  }

  /**
   *
   * @returns {DrawTool}
   */
  deactivate() {
    this._unbindEvent()
    this._viewer.tooltip.enable = false
    this._anchorLayer.entities.removeAll()
    this._floatingAnchor = undefined
    return this
  }

  /**
   *
   * @param viewer
   */
  install(viewer) {
    this._viewer = viewer
    this._viewer.dataSources.add(this._anchorLayer)
    Object.defineProperty(this._viewer, 'drawTool', {
      value: this,
      writable: false,
    })
  }
}

export default DrawTool
