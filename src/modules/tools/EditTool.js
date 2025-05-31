/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import { MouseEventType, PlotEventType, PlotEvent } from '../event'
import IMG_CIRCLE_RED from '../images/circle_red.png'
import IMG_CIRCLE_BLUE from '../images/circle_blue.png'
import IMG_CIRCLE_YELLOW from '../images/circle_yellow.png'

const DEF_OPTS = {
  icon_center: IMG_CIRCLE_YELLOW,
  icon_anchor: IMG_CIRCLE_RED,
  icon_midAnchor: IMG_CIRCLE_BLUE,
  icon_size: [12, 12],
  clampToModel: true,
}

class EditTool {
  constructor() {
    this._viewer = undefined
    this._anchorLayer = new Cesium.CustomDataSource('edit-anchor-layer')
    this._options = {}
    this._plotEvent = new PlotEvent()
    this._tooltipMess = undefined
    this._pickedAnchor = undefined
    this._isMoving = false
    this._anchors = []
  }

  set tooltipMess(tooltipMess) {
    this._tooltipMess = tooltipMess
  }

  /**
   *
   * @param e
   * @returns {boolean}
   * @private
   */
  _onClick(e) {
    if (this._isMoving) {
      let position =
        this._options.clampToModel && e.position
          ? e.position
          : e.surfacePosition
      if (!position) {
        return false
      }
      if (
        this._pickedAnchor &&
        this._pickedAnchor.position &&
        this._pickedAnchor.properties
      ) {
        this._pickedAnchor.position.setValue(position)
        this._plotEvent.fire(PlotEventType.EDIT_ANCHOR_STOP, {
          pickedAnchor: this._pickedAnchor,
          position,
        })
      }
      this._isMoving = false
    } else {
      if (!e.target || !e.target.id) {
        return false
      }
      this._pickedAnchor = e.target.id
      this._isMoving = true
    }
  }

  /**
   *
   * @param e
   * @private
   */
  _onMouseMove(e) {
    this._viewer.tooltip.showAt(e.windowPosition, this._tooltipMess)
    if (!this._isMoving && this._anchors.length !== 0) {
      return false
    }
    let position =
      this._options.clampToModel && e.position ? e.position : e.surfacePosition
    if (!position) {
      return false
    }
    if (
      this._pickedAnchor &&
      this._pickedAnchor.position &&
      this._pickedAnchor.properties
    ) {
      this._pickedAnchor.position.setValue(position)
      this._plotEvent.fire(PlotEventType.ANCHOR_MOVING, {
        pickedAnchor: this._pickedAnchor,
        position,
      })
    } else if (this._anchors.length === 0) {
      this._plotEvent.fire(PlotEventType.ANCHOR_MOVING, {
        position,
      })
    }
  }

  /**
   *
   * @param e
   * @private
   */
  _onRightClick(e) {
    let position =
      this._options.clampToModel && e.position ? e.position : e.surfacePosition
    this._plotEvent.fire(PlotEventType.EDIT_STOP, {
      pickedAnchor: this._pickedAnchor,
      position,
    })
  }

  /**
   *
   * @param position
   * @param index
   * @param isCenter
   * @param isMid
   * @private
   */
  _onCreateAnchor({ position, index, isCenter = false, isMid = false }) {
    let image = isMid
      ? this._options.icon_midAnchor
      : isCenter
      ? this._options.icon_center
      : this._options.icon_anchor
    let anchor = this._anchorLayer.entities.add({
      position: position,
      billboard: {
        image: image,
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
      properties: {
        isMid: isMid,
        index: index,
      },
    })
    this._anchors.push(anchor)
  }

  /**
   *
   * @param index
   * @param position
   * @private
   */
  _onUpdateAnchor({ index, position }) {
    this._anchors[index] && this._anchors[index].position.setValue(position)
  }

  /**
   *
   * @private
   */
  _onClearAnchor() {
    this._anchorLayer.entities.removeAll()
    this._anchors = []
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
    this._plotEvent.on(PlotEventType.UPDATE_ANCHOR, this._onUpdateAnchor, this)
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
    this._plotEvent.off(PlotEventType.UPDATE_ANCHOR, this._onUpdateAnchor, this)
    this._plotEvent.off(PlotEventType.CLEAR_ANCHOR, this._onClearAnchor, this)
  }

  /**
   *
   * @param type
   * @param callback
   * @param context
   * @returns {EditTool}
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
   * @returns {EditTool}
   */
  off(type, callback, context) {
    this._plotEvent.off(type, callback, context || this)
    return this
  }

  /**
   *
   * @param type
   * @param parmas
   * @returns {EditTool}
   */
  fire(type, parmas) {
    this._plotEvent.fire(type, parmas)
    return this
  }

  /**
   *
   * @param options
   * @returns {EditTool}
   */
  activate(options = {}) {
    this._anchorLayer.entities.removeAll()
    this._anchors = []
    this._viewer.tooltip.enable = true
    this._options = { ...DEF_OPTS, ...options }
    this._unbindEvent()
    this._bindEvent()
    this.fire(PlotEventType.EDIT_START, this._options)
    return this
  }

  /**
   *
   * @returns {EditTool}
   */
  deactivate() {
    this._unbindEvent()
    this._viewer.tooltip.enable = false
    this._anchorLayer.entities.removeAll()
    this._anchors = []
    return this
  }

  /**
   *
   * @param viewer
   */
  install(viewer) {
    this._viewer = viewer
    this._viewer.dataSources.add(this._anchorLayer)
    Object.defineProperty(this._viewer, 'editTool', {
      value: this,
      writable: false,
    })
  }
}

export default EditTool
