/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import AnimationType from '../AnimationType'
import Animation from '../Animation'
import { Util } from '../../utils'
import { Transform } from '../../transform'
import Parse from '../../parse/Parse.js'
import RadarScanShader from '../../material/shader/radar/RadarScanShader.glsl'

class RadarScan extends Animation {
  constructor(viewer, position, radius, options = {}) {
    super(viewer)
    this._position = Parse.parsePosition(position)
    this._radius = radius || 100
    this._color = options.color || Cesium.Color.BLUE
    this._speed = options.speed || 3
    this._delegate = undefined
  }

  get type() {
    return AnimationType.RADAR_SCAN
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
    let time = new Date().getTime()
    let self = this
    this._delegate = new Cesium.PostProcessStage({
      name: Util.uuid(),
      fragmentShader: RadarScanShader,
      uniforms: {
        centerWC: function () {
          return center
        },
        planeNormalWC: function () {
          return up
        },
        lineNormalWC: function () {
          let rotateQ = new Cesium.Quaternion()
          let rotateM = new Cesium.Matrix3()
          let east = Cesium.Cartesian3.cross(
            Cesium.Cartesian3.UNIT_Z,
            up,
            new Cesium.Cartesian3()
          )
          let now = new Date().getTime()
          let angle = Cesium.Math.PI * 2 * ((now - time) / 1e4) * self._speed
          Cesium.Quaternion.fromAxisAngle(up, angle, rotateQ)
          Cesium.Matrix3.fromQuaternion(rotateQ, rotateM)
          Cesium.Matrix3.multiplyByVector(rotateM, east, east)
          Cesium.Cartesian3.normalize(east, east)
          return east
        },
        radius: function () {
          return self._radius
        },
        color: function () {
          return self._color
        },
      },
    })
  }

  /**
   *
   * @returns {RadarScan}
   */
  start() {
    !this._delegate && this._mountContent()
    this._delegate && this._viewer.scene.postProcessStages.add(this._delegate)
    return this
  }

  /**
   *
   * @returns {RadarScan}
   */
  stop() {
    this._delegate &&
      this._viewer.scene.postProcessStages.remove(this._delegate)
    this._delegate = undefined
    return this
  }
}

AnimationType.RADAR_SCAN = 'radar_scan'

export default RadarScan
