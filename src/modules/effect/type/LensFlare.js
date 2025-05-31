/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'

class LensFlare {
  constructor(viewer) {
    this._viewer = viewer
    this._delegate = undefined
    this._enable = false
    this._intensity = 6
    this._distortion = 61
    this._dirtAmount = 0.4
    this._haloWidth = 0.4
    this._selected = []
    this._state = State.INITIALIZED
  }

  get type() {
    return 'lens_flare'
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
    this._delegate && (this._delegate.uniforms.intensity = intensity)
  }

  get intensity() {
    return this._intensity
  }

  set distortion(distortion) {
    this._distortion = distortion
    this._delegate && (this._delegate.uniforms.distortion = distortion)
  }

  get distortion() {
    return this._distortion
  }

  set dirtAmount(dirtAmount) {
    this._dirtAmount = dirtAmount
    this._delegate && (this._delegate.uniforms.dirtAmount = dirtAmount)
  }

  get dirtAmount() {
    return this._dirtAmount
  }

  set haloWidth(haloWidth) {
    this._haloWidth = haloWidth
    this._delegate && (this._delegate.uniforms.haloWidth = haloWidth)
  }

  get haloWidth() {
    return this._haloWidth
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
    this._delegate = Cesium.PostProcessStageLibrary.createLensFlareStage()
    if (this._delegate) {
      this._delegate.uniforms.intensity = this._intensity
      this._delegate.uniforms.distortion = this._distortion
      this._delegate.uniforms.dirtAmount = this._dirtAmount
      this._delegate.uniforms.haloWidth = this._haloWidth
      this._viewer.scene.postProcessStages.add(this._delegate)
    }
  }
}

export default LensFlare
