/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'

class Brightness {
  constructor(viewer) {
    this._viewer = viewer
    this._delegate = undefined
    this._enable = false
    this._intensity = 1
    this._selected = []
    this._state = State.INITIALIZED
  }

  get type() {
    return 'brightness'
  }

  set enable(enable) {
    this._enable = enable
    !this._delegate && this._createPostProcessStage()
    this._delegate.enabled = enable
    this._state = enable ? State.ENABLED : State.DISABLED
  }

  get enable() {
    return this._enable
  }

  set intensity(intensity) {
    this._intensity = intensity
    this._delegate && (this._delegate.uniforms.brightness = intensity)
  }

  get intensity() {
    return this._intensity
  }

  set selected(selected) {
    this._selected = selected
    this._delegate && (this._delegate.selected = selected)
  }

  get selected() {
    return this._selected
  }

  /**
   *
   * @private
   */
  _createPostProcessStage() {
    this._delegate = Cesium.PostProcessStageLibrary.createBrightnessStage()
    if (this._delegate) {
      this._delegate.uniforms.brightness = this._intensity
      this._viewer.scene.postProcessStages.add(this._delegate)
    }
  }
}

export default Brightness
