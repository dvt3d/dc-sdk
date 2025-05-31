/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'

class NightVision {
  constructor(viewer) {
    this._viewer = viewer
    this._enable = false
    this._selected = []
    this._state = State.INITIALIZED
  }

  get type() {
    return 'night'
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
    this._delegate = Cesium.PostProcessStageLibrary.createNightVisionStage()
    if (this._delegate) {
      this._viewer.scene.postProcessStages.add(this._delegate)
    }
  }
}

export default NightVision
