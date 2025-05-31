/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import State from '../../state/State'
import Parse from '../../parse/Parse'
import { Util } from '../../utils'
import { Transform } from '../../transform'

class Box extends Overlay {
  constructor(position, length, width, height) {
    super()
    this._position = Parse.parsePosition(position)
    this._length = length
    this._width = width
    this._height = height
    this._delegate = new Cesium.Entity({
      box: {
        dimensions: {
          x: +this._length,
          y: +this._width,
          z: +this._height,
        },
      },
    })
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('box')
  }

  /**
   *
   * @param position
   * @returns {Box}
   */
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
    const dimensions = this._delegate.box.dimensions.getValue()
    this._length = length || 0
    dimensions.x = +this._length
    this._delegate.box.dimensions.setValue(dimensions)
  }

  get length() {
    return this._length
  }

  set width(width) {
    const dimensions = this._delegate.box.dimensions.getValue()
    this._width = width || 0
    dimensions.y = +this._width
    this._delegate.box.dimensions.setValue(dimensions)
  }

  get width() {
    return this._width
  }

  set height(height) {
    const dimensions = this._delegate.box.dimensions.getValue()
    this._height = height || 0
    dimensions.z = +this._height
    this._delegate.box.dimensions.setValue(dimensions)
  }

  get height() {
    return this._height
  }

  _mountedHook() {
    /**
     * set the location
     */
    this.position = this._position
  }

  /**
   * Sets Style
   * @param style
   * @returns {Box}
   */
  setStyle(style) {
    if (Object.keys(style).length === 0) {
      return this
    }
    delete style['length'] && delete style['width'] && delete style['height']
    Util.merge(this._style, style)
    Util.merge(this._delegate.box, style)
    return this
  }
}

Overlay.registerType('box')

export default Box
