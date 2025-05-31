/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'

class DepthOfField {
  constructor(viewer) {
    this._viewer = viewer
    this._delegate = undefined
    this._enable = false
    this._focalDistance = 87
    this._delta = 1
    this._sigma = 3.8
    this._stepSize = 2.5
    this._selected = []
    this._state = State.INITIALIZED
  }

  get type() {
    return 'depth_of_field'
  }

  set enable(enable) {
    this._enable = enable
    if (
      Cesium.PostProcessStageLibrary.isDepthOfFieldSupported(
        this._viewer.scene
      ) &&
      !this._delegate
    ) {
      this._createPostProcessStage()
    }
    this._delegate && (this._delegate.enabled = enable)
    this._state = enable ? State.ENABLED : State.DISABLED
  }

  get enable() {
    return this._enable
  }

  set focalDistance(focalDistance) {
    this._focalDistance = focalDistance
    this._delegate && (this._delegate.uniforms.focalDistance = focalDistance)
  }

  get focalDistance() {
    return this._focalDistance
  }

  set delta(delta) {
    this._delta = delta
    this._delegate && (this._delegate.uniforms.delta = delta)
  }

  get delta() {
    return this._delta
  }

  set sigma(sigma) {
    this._sigma = sigma
    this._delegate && (this._delegate.uniforms.sigma = sigma)
  }

  get sigma() {
    return this._sigma
  }

  set stepSize(stepSize) {
    this._stepSize = stepSize
    this._delegate && (this._delegate.uniforms.stepSize = stepSize)
  }

  get stepSize() {
    return this._stepSize
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
    this._delegate = Cesium.PostProcessStageLibrary.createDepthOfFieldStage()
    if (this._delegate) {
      this._delegate.uniforms.focalDistance = this._focalDistance
      this._delegate.uniforms.delta = this._delta
      this._delegate.uniforms.sigma = this._sigma
      this._delegate.uniforms.stepSize = this._stepSize
      this._viewer.scene.postProcessStages.add(this._delegate)
    }
  }
}

export default DepthOfField
