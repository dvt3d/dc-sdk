/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import { Util } from '../../utils'
import FogShader from '../../material/shader/weather/FogShader.glsl'

class Fog {
  constructor(viewer) {
    this._id = Util.uuid()
    this._viewer = viewer
    this._delegate = undefined
    this._enable = false
    this._fogByDistance = { near: 10, nearValue: 0, far: 2000, farValue: 1.0 }
    this._color = new Cesium.Color(0, 0, 0, 1)
    this._state = State.INITIALIZED
  }

  get type() {
    return 'fog'
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

  set fogByDistance(fogByDistance) {
    this._fogByDistance = fogByDistance
    this._delegate &&
      (this._delegate.uniforms.fogByDistance = new Cesium.Cartesian4(
        this._fogByDistance?.near || 10,
        this._fogByDistance?.nearValue || 0.0,
        this._fogByDistance?.far || 2000,
        this._fogByDistance?.farValue || 1.0
      ))
  }

  get fogByDistance() {
    return this._fogByDistance
  }

  set color(color) {
    this._color = color
    this._delegate && (this._delegate.uniforms.fogColor = color)
  }

  get color() {
    return this._color
  }

  /**
   *
   * @private
   */
  _createPostProcessStage() {
    this._delegate = new Cesium.PostProcessStage({
      name: this._id,
      fragmentShader: FogShader,
      uniforms: {
        fogByDistance: new Cesium.Cartesian4(
          this._fogByDistance?.near || 10,
          this._fogByDistance?.nearValue || 0.0,
          this._fogByDistance?.far || 200,
          this._fogByDistance?.farValue || 1.0
        ),
        fogColor: this._color,
      },
    })
    this._viewer.scene.postProcessStages.add(this._delegate)
  }
}

export default Fog
