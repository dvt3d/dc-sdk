/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import State from '../../state/State'
import Parse from '../../parse/Parse'
import { Util } from '../../utils'
import { Transform } from '../../transform'

class Plane extends Overlay {
  constructor(position, width, height, plane = {}) {
    super()
    this._position = Parse.parsePosition(position)
    this._width = +width || 100
    this._height = +height || 100
    if (plane.normal && typeof plane.normal === 'string') {
      let n = String(plane.normal).toLocaleUpperCase()
      plane.normal =
        n === 'X'
          ? Cesium.Cartesian3.UNIT_X
          : n === 'Y'
          ? Cesium.Cartesian3.UNIT_Y
          : Cesium.Cartesian3.UNIT_Z
    } else {
      plane.normal = Cesium.Cartesian3.UNIT_Z
    }
    this._normal = plane.normal
    this._distance = plane.distance || 0
    this._delegate = new Cesium.Entity({
      plane: {
        dimensions: {
          x: this._width,
          y: this._height,
        },
        plane: new Cesium.Plane(this._normal, this._distance),
      },
    })
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('plane')
  }

  set position(position) {
    this._position = Parse.parsePosition(position)
    this._delegate.position = Transform.transformWGS84ToCartesian(
      this._position
    )
    this._delegate.orientation = Cesium.Transforms.headingPitchRollQuaternion(
      Transform.transformWGS84ToCartesian(this._position),
      new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(this._position.heading),
        Cesium.Math.toRadians(this._position.pitch),
        Cesium.Math.toRadians(this._position.roll)
      )
    )
  }

  get position() {
    return this._position
  }

  set width(width) {
    const dimensions = this._delegate.plane.dimensions.getValue()
    this._width = +width || 0
    dimensions.x = this._width
  }

  get width() {
    return this._width
  }

  set height(height) {
    const dimensions = this._delegate.plane.dimensions.getValue()
    this._height = +height || 0
    dimensions.y = this._height
  }

  get height() {
    return this._height
  }

  set distance(distance) {
    const plane = this.entityGraphic.plane.getValue()
    this._distance = distance
    plane.distance = distance
  }

  get distance() {
    return this._distance
  }

  _mountedHook() {
    /**
     * set the location
     */
    this.position = this._position
    /**
     *  initialize the Overlay parameter
     */
    this.distance = this._distance
  }

  /**
   * Sets Style
   * @param style
   * @returns {Plane}
   */
  setStyle(style) {
    if (Object.keys(style).length === 0) {
      return this
    }
    delete style['dimensions'] && delete ['plane']
    Util.merge(this._style, style)
    Util.merge(this._delegate.plane, style)
    return this
  }
}

Overlay.registerType('plane')

export default Plane
