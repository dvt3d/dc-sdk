/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import AnimationType from '../AnimationType'
import Animation from '../Animation'
import { Transform } from '../../transform'
import Parse from '../../parse/Parse.js'

class AroundPoint extends Animation {
  constructor(viewer, position, options = {}) {
    super(viewer)
    this._position = Parse.parsePosition(position)
    this._options = options
    this._heading = viewer.camera.heading
    this._aroundAmount = 0.2
  }

  get type() {
    return AnimationType.AROUND_POINT
  }

  set position(position) {
    this._position = Parse.parsePosition(position)
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
    this._viewer.camera.lookAt(
      Transform.transformWGS84ToCartesian(this._position),
      new Cesium.HeadingPitchRange(
        this._heading,
        Cesium.Math.toRadians(this._options.pitch || 0),
        this._options.range || 1000
      )
    )
  }
}

AnimationType.AROUND_POINT = 'around_point'

export default AroundPoint
