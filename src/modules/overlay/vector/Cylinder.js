/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import State from '../../state/State'
import Parse from '../../parse/Parse'
import { Util } from '../../utils'
import { Transform } from '../../transform'

class Cylinder extends Overlay {
  constructor(position, length, topRadius, bottomRadius) {
    super()
    this._position = Parse.parsePosition(position)
    this._length = +length || 0
    this._topRadius = +topRadius || 0
    this._bottomRadius = +bottomRadius || 0
    this._delegate = new Cesium.Entity({ cylinder: {} })
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('cylinder')
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

  set length(length) {
    this._length = +length || 0
    this._delegate.cylinder.length = this._length
  }

  get length() {
    return this._length
  }

  set topRadius(topRadius) {
    this._topRadius = +topRadius || 0
    this._delegate.cylinder.topRadius = this._topRadius
  }

  get topRadius() {
    return this._topRadius
  }

  set bottomRadius(bottomRadius) {
    this._bottomRadius = +bottomRadius || 0
    this._delegate.cylinder.bottomRadius = this._bottomRadius
  }

  get bottomRadius() {
    return this._bottomRadius
  }

  _mountedHook() {
    /**
     * set the location
     */
    this.position = this._position
    /**
     *  initialize the Overlay parameter
     */
    this.length = this._length
    this.topRadius = this._topRadius
    this.bottomRadius = this._bottomRadius
  }

  /**
   *
   * @param {*} text
   * @param {*} textStyle
   */
  setLabel(text, textStyle) {
    return this
  }

  /**
   * Sets Style
   * @param style
   * @returns {Cylinder}
   */
  setStyle(style) {
    if (Object.keys(style).length === 0) {
      return this
    }

    delete style['length'] &&
      delete style['topRadius'] &&
      delete style['bottomRadius']

    Util.merge(this._style, style)
    Util.merge(this._delegate.cylinder, style)
    return this
  }
}

Overlay.registerType('cylinder')

export default Cylinder
