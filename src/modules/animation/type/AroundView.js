/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import AnimationType from '../AnimationType'
import Animation from '../Animation'

class AroundView extends Animation {
  constructor(viewer, options = {}) {
    super(viewer)
    this._options = options
    this._heading = viewer.camera.heading
    this._aroundAmount = 0.2
  }

  get type() {
    return AnimationType.AROUND_VIEW
  }

  set aroundAmount(aroundAmount) {
    this._aroundAmount = aroundAmount
  }

  /**
   *
   * @private
   */
  _bindEvent() {
    this._viewer.clock.onTick.addEventListener(this._onAround, this)
  }

  /**
   *
   * @private
   */
  _unbindEvent() {
    this._viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
    this._viewer.clock.onTick.removeEventListener(this._onAround, this)
  }

  /**
   *
   * @param scene
   * @param time
   * @private
   */
  _onAround(scene, time) {
    this._heading += Cesium.Math.toRadians(this._aroundAmount)
    if (this._heading >= Math.PI * 2 || this._heading <= -Math.PI * 2) {
      this._heading = 0
    }
    this._viewer.camera.setView({
      orientation: {
        heading: this._heading,
        pitch: this._options.pitch
          ? Cesium.Math.toRadians(this._options.pitch)
          : this._viewer.camera.pitch,
        roll: this._options.roll
          ? Cesium.Math.toRadians(this._options.roll)
          : this._viewer.camera.roll,
      },
    })
  }
}

AnimationType.AROUND_VIEW = 'around_view'

export default AroundView
