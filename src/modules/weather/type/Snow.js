/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import { Util } from '../../utils'
import SnowShader from '../../material/shader/weather/SnowShader.glsl'

class Snow {
  constructor(viewer) {
    this._id = Util.uuid()
    this._viewer = viewer
    this._delegate = undefined
    this._enable = false
    this._speed = 10.0
    this._state = State.INITIALIZED
  }

  get type() {
    return 'snow'
  }

  set enable(enable) {
    this._enable = enable
    if (enable && this._viewer && !this._delegate) {
      this._createPostProcessStage()
    }
    this._delegate && (this._delegate.enabled = enable)
  }

  get enable() {
    return this._enable
  }

  set speed(speed) {
    this._speed = speed
    this._delegate && (this._delegate.uniforms.speed = speed)
  }

  get speed() {
    return this._speed
  }

  /**
   *
   * @private
   */
  _createPostProcessStage() {
    this._delegate = new Cesium.PostProcessStage({
      name: this._id,
      fragmentShader: SnowShader,
      uniforms: {
        speed: this._speed,
      },
    })
    this._viewer.scene.postProcessStages.add(this._delegate)
  }
}

export default Snow
