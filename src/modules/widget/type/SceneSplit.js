/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Widget from '../Widget'
import State from '../../state/State'
import Icons from '../../icons'
import { DomUtil } from '../../utils'

class SceneSplit extends Widget {
  constructor() {
    super()
    this._wrapper = DomUtil.create('div', 'widget slider')
    this._tileset = undefined
    this._baseLayer = undefined
    this._moveActive = false
    this._state = State.INITIALIZED
  }

  get type() {
    return Widget.getWidgetType('scene_split')
  }

  /**
   *
   * @private
   */
  _installHook() {
    const self = this
    Object.defineProperty(this._viewer, 'sceneSplit', {
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
    this._viewer.scene.splitPosition = 1
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
   * @param tileset
   * @return {SceneSplit}
   */
  addTileset(tileset) {
    if (!this._viewer || !this._enable) {
      return this
    }
    if (tileset) {
      this._tileset && this._viewer.scene.primitives.remove(this._tileset)
      Promise.resolve(tileset.delegate || tileset).then((tileset) => {
        this._tileset = this._viewer.scene.primitives.add(tileset)
      })
    }
    return this
  }

  /**
   *
   * @param baseLayer
   * @returns {SceneSplit}
   */
  addBaseLayer(baseLayer) {
    if (!this._viewer || !this._enable) {
      return this
    }
    if (baseLayer) {
      this._baseLayer && this._viewer.imageryLayers.remove(this._baseLayer)
      Promise.resolve(baseLayer).then((provider) => {
        this._baseLayer =
          this._viewer.imageryLayers.addImageryProvider(provider)
        this._baseLayer.splitDirection = 1
      })
    }
    return this
  }
}

Widget.registerType('scene_split')

export default SceneSplit
