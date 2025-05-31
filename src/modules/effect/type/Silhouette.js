/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'

class Silhouette {
  constructor(viewer) {
    this._viewer = viewer
    this._delegate = undefined
    this._enable = false
    this._color = Cesium.Color.GREEN
    this._length = 0.5
    this._selected = []
    this._state = State.INITIALIZED
  }

  get type() {
    return 'silhouette'
  }

  set enable(enable) {
    this._enable = enable
    if (
      Cesium.PostProcessStageLibrary.isSilhouetteSupported(
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

  set color(color) {
    this._color = color
    this._delegate && (this._delegate.uniforms.color = color)
  }

  get color() {
    return this._color
  }

  set length(length) {
    this._length = length
    this._delegate && (this._delegate.uniforms.length = length)
  }

  get length() {
    return this._length
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
    this._delegate = Cesium.PostProcessStageLibrary.createSilhouetteStage()
    if (this._delegate) {
      this._delegate.uniforms.color = this._color
      this._delegate.uniforms.length = this._length
      this._viewer.scene.postProcessStages.add(this._delegate)
    }
  }
}

export default Silhouette
