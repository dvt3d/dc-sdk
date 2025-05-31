/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'

class BlackAndWhite {
  constructor(viewer) {
    this._viewer = viewer
    this._delegate = undefined
    this._enable = false
    this._gradations = 1
    this._selected = []
    this._state = State.INITIALIZED
  }

  get type() {
    return 'black_and_white'
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

  set gradations(gradations) {
    this._gradations = gradations
    this._delegate && (this._delegate.uniforms.gradations = gradations)
  }

  get gradations() {
    return this._gradations
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
    this._delegate = Cesium.PostProcessStageLibrary.createBlackAndWhiteStage()
    if (this._delegate) {
      this._delegate.uniforms.gradations = this._gradations
      this._viewer.scene.postProcessStages.add(this._delegate)
    }
  }
}

export default BlackAndWhite
