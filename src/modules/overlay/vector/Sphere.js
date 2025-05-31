/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import State from '../../state/State'
import Parse from '../../parse/Parse'
import { Util } from '../../utils'
import { Transform } from '../../transform'

class Sphere extends Overlay {
  constructor(position, radius) {
    super()
    this._position = Parse.parsePosition(position)
    this._radius = radius || { x: 10, y: 10, z: 10 }
    this._delegate = new Cesium.Entity({ ellipsoid: {} })
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('sphere')
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

  set radius(radius) {
    this._radius = radius || { x: 10, y: 10, z: 10 }
    this._delegate.ellipsoid.radii = this._radius
  }

  get radius() {
    return this._radius
  }

  _mountedHook() {
    /**
     * set the location
     */
    this.position = this._position

    /**
     *  initialize the Overlay parameter
     */
    this.radius = this._radius
  }

  /**
   * Sets Style
   * @param style
   * @returns {Sphere}
   */
  setStyle(style) {
    if (Object.keys(style).length === 0) {
      return this
    }
    delete style['radius']
    Util.merge(this._style, style)
    Util.merge(this._delegate.ellipsoid, style)
    return this
  }
}

Overlay.registerType('ellipsoid')

export default Sphere
