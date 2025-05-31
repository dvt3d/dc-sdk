/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import Icons from '../../icons'
import { DomUtil } from '../../utils'
import Widget from '../Widget'

class MapSplit extends Widget {
  constructor() {
    super()
    this._wrapper = DomUtil.create('div', 'widget slider')
    this._baseLayer = undefined
    this._moveActive = false
    this._state = State.INITIALIZED
  }

  get type() {
    return Widget.getWidgetType('map_split')
  }

  /**
   *
   * @private
   */
  _installHook() {
    const self = this
    Object.defineProperty(this._viewer, 'mapSplit', {
      get() {
        return self
      },
    })
  }

  /**
   *
   * @private
   */
  _bindEvent() {
    this._viewer.scene.splitPosition = 0.5
    this._wrapper.style.left = '50%'
  }

  /**
   *
   * @private
   */
  _unbindEvent() {
    if (this._baseLayer) {
      this._viewer.scene.splitPosition =
        this._baseLayer.splitDirection > 0 ? 1 : 0
    } else {
      this._viewer.scene.splitPosition = 0
    }
  }

  /**
   *
   * @private
   */
  _mountContent() {
    let splitter = DomUtil.parseDom(Icons.splitter, true, 'splitter')
    this._wrapper.appendChild(splitter)
    let handler = new Cesium.ScreenSpaceEventHandler(splitter)
    let self = this
    handler.setInputAction(() => {
      self._moveActive = true
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)
    handler.setInputAction(() => {
      self._moveActive = true
    }, Cesium.ScreenSpaceEventType.PINCH_START)

    handler.setInputAction((movement) => {
      self._moveHandler(movement)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction((movement) => {
      self._moveHandler(movement)
    }, Cesium.ScreenSpaceEventType.PINCH_MOVE)

    handler.setInputAction(() => {
      self._moveActive = false
    }, Cesium.ScreenSpaceEventType.LEFT_UP)
    handler.setInputAction(() => {
      self._moveActive = false
    }, Cesium.ScreenSpaceEventType.PINCH_END)
    this._ready = true
  }

  /**
   *
   * @param movement
   * @private
   */
  _moveHandler(movement) {
    if (!this._moveActive || !this._enable) {
      return
    }
    let relativeOffset = movement.endPosition.x
    let splitPosition =
      (this._wrapper.offsetLeft + relativeOffset) /
      this._wrapper.parentElement.offsetWidth
    this._wrapper.style.left = 100.0 * splitPosition + '%'
    this._viewer.scene.splitPosition = splitPosition
  }

  /**
   *
   * @param baseLayer
   * @param splitDirection
   * @returns {MapSplit}
   */
  addBaseLayer(baseLayer, splitDirection = 1) {
    if (!this._viewer || !this._enable) {
      return this
    }
    if (baseLayer) {
      this._baseLayer && this._viewer.imageryLayers.remove(this._baseLayer)
      this._baseLayer = this._viewer.imageryLayers.addImageryProvider(baseLayer)
      this._baseLayer.splitDirection = splitDirection || 0
      this._viewer.scene.splitPosition =
        this._wrapper.offsetLeft / this._wrapper.parentElement.offsetWidth
    }
    return this
  }
}

Widget.registerType('map_split')

export default MapSplit
