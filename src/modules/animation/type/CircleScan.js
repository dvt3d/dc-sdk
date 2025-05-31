/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import AnimationType from '../AnimationType'
import Animation from '../Animation'
import { Util } from '../../utils'
import { Transform } from '../../transform'
import Parse from '../../parse/Parse.js'
import CircleScanShader from '../../material/shader/circle/CircleScanShader.glsl'

class CircleScan extends Animation {
  constructor(viewer, position, radius, options = {}) {
    super(viewer)
    this._delegate = undefined
    this._position = Parse.parsePosition(position)
    this._radius = radius || 100
    this._color = options.color || Cesium.Color.RED
    this._speed = options.speed || 2
  }

  get type() {
    return AnimationType.CIRCLE_SCAN
  }

  /**
   *
   * @private
   */
  _mountContent() {
    let center = Transform.transformWGS84ToCartesian(this._position)
    let up = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(
      center,
      new Cesium.Cartesian3()
    )
    let self = this
    this._delegate = new Cesium.PostProcessStage({
      name: Util.uuid(),
      fragmentShader: CircleScanShader,
      uniforms: {
        centerWC: function () {
          return center
        },
        normalWC: function () {
          return up
        },
        radius: function () {
          return self._radius
        },
        speed: function () {
          return self._speed
        },
        color: function () {
          return self._color
        },
      },
    })
  }

  /**
   *
   * @returns {CircleScan}
   */
  start() {
    !this._delegate && this._mountContent()
    this._delegate && this._viewer.scene.postProcessStages.add(this._delegate)
    return this
  }

  /**
   *
   * @returns {CircleScan}
   */
  stop() {
    this._delegate &&
      this._viewer.scene.postProcessStages.remove(this._delegate)
    this._delegate = undefined
    return this
  }
}

AnimationType.CIRCLE_SCAN = 'circle_scan'

export default CircleScan
