/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Widget from '../Widget'
import State from '../../state/State'
import { DomUtil } from '../../utils'
import { MouseEventType, SceneEventType } from '../../event'

class LocationBar extends Widget {
  constructor() {
    super()
    this._wrapper = DomUtil.create('div', 'widget location-bar')
    this._mouseEl = undefined
    this._cameraEl = undefined
    this._fpsEl = undefined
    this._msEl = undefined
    this._lastMouseSampleTime = Cesium.getTimestamp()
    this._lastCameraSampleTime = Cesium.getTimestamp()
    this._lastFpsSampleTime = Cesium.getTimestamp()
    this._lastMsSampleTime = Cesium.getTimestamp()
    this._fpsFrameCount = 0
    this._msFrameCount = 0
    this._state = State.INITIALIZED
  }

  get type() {
    return Widget.getWidgetType('location_bar')
  }

  /**
   *
   * @private
   */
  _installHook() {
    const self = this
    Object.defineProperty(this._viewer, 'locationBar', {
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
    this._viewer.on(MouseEventType.MOUSE_MOVE, this._onMove, this)
    this._viewer.on(SceneEventType.CAMERA_CHANGED, this._onCameraChanged, this)
    this._viewer.on(SceneEventType.POST_UPDATE, this._onPostUpdate, this)
  }

  /**
   *
   * @private
   */
  _unbindEvent() {
    this._viewer.off(MouseEventType.MOUSE_MOVE, this._onMove, this)
    this._viewer.off(SceneEventType.CAMERA_CHANGED, this._onCameraChanged, this)
    this._viewer.off(SceneEventType.POST_UPDATE, this._onPostUpdate, this)
  }

  /**
   *
   * @private
   */
  _mountContent() {
    this._mouseEl = DomUtil.create('div', 'mouse-bar', this._wrapper)
    this._cameraEl = DomUtil.create('div', 'camera-bar', this._wrapper)
    this._msEl = DomUtil.create('div', 'ms-bar', this._wrapper)
    this._fpsEl = DomUtil.create('div', 'fps-bar', this._wrapper)
    this._ready = true
  }

  /**
   *
   * @param e
   * @private
   */
  _onMove(e) {
    let now = Cesium.getTimestamp()
    if (now < this._lastMouseSampleTime + 300) {
      return
    }

    let position = e.wgs84SurfacePosition
    this._mouseEl.innerHTML = `
      <span>经度：${position?.lng.toFixed(8) || Number.NaN}</span>
      <span>纬度：${position?.lat.toFixed(8) || Number.NaN}</span>
      <span>海拔：${position?.alt.toFixed(2) || Number.NaN} 米</span>`
    this._lastMouseSampleTime = now
  }

  /**
   *
   * @private
   */
  _onCameraChanged() {
    let now = Cesium.getTimestamp()
    if (now < this._lastCameraSampleTime + 300) {
      return
    }
    let cameraPosition = this._viewer.cameraPosition
    this._cameraEl.innerHTML = `
      <span>视角：${(+cameraPosition.pitch).toFixed(2)}</span>
      <span>视高：${(+cameraPosition.alt).toFixed(2)} 米</span>
    `
    this._lastCameraSampleTime = now
  }

  /**
   *
   * @private
   */
  _onPostUpdate() {
    let now = Cesium.getTimestamp()

    // ms
    this._msFrameCount++
    let msElapsedTime = now - this._lastMsSampleTime
    if (msElapsedTime > 200) {
      let ms = (msElapsedTime / this._msFrameCount).toFixed(2)
      this._msEl.innerHTML = `<span>${ms} MS</span>`
      this._lastMsSampleTime = now
      this._msFrameCount = 0
    }

    // fps
    this._fpsFrameCount++
    let fpsElapsedTime = now - this._lastFpsSampleTime
    if (fpsElapsedTime > 1000) {
      let fps = ((this._fpsFrameCount * 1000) / fpsElapsedTime) | 0
      this._fpsEl.innerHTML = `<span>${fps} FPS</span>`
      this._lastFpsSampleTime = now
      this._fpsFrameCount = 0
    }
  }
}

Widget.registerType('location_bar')

export default LocationBar
