/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import State from '../../state/State'
import Parse from '../../parse/Parse'
import { Util } from '../../utils'
import { Transform } from '../../transform'

class Circle extends Overlay {
  constructor(center, radius) {
    super()
    this._delegate = new Cesium.Entity({ ellipse: {} })
    this._center = Parse.parsePosition(center)
    this._radius = +radius || 0
    this._rotateAmount = 0
    this._stRotation = 0
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('circle')
  }

  set center(center) {
    this._center = Parse.parsePosition(center)
    this._delegate.position = Transform.transformWGS84ToCartesian(this._center)
  }

  get center() {
    return this._center
  }

  set radius(radius) {
    this._radius = +radius
    this._delegate.ellipse.semiMajorAxis = this._radius
    this._delegate.ellipse.semiMinorAxis = this._radius
  }

  get radius() {
    return this._radius
  }

  set rotateAmount(amount) {
    this._rotateAmount = +amount
    this._delegate.ellipse.stRotation = new Cesium.CallbackProperty(() => {
      this._stRotation += this._rotateAmount
      if (this._stRotation >= 360 || this._stRotation <= -360) {
        this._stRotation = 0
      }
      return Cesium.Math.toRadians(this._stRotation)
    }, false)
  }

  get rotateAmount() {
    return this._rotateAmount
  }

  _mountedHook() {
    /**
     * set the location
     */
    this.center = this._center
    this.radius = this._radius
  }

  /**
   * Sets Text with Style
   * @param text
   * @param textStyle
   * @returns {Circle}
   */
  setLabel(text, textStyle) {
    this._delegate.position = Transform.transformWGS84ToCartesian(this._center)
    this._delegate.label = {
      ...textStyle,
      text: text,
    }
    return this
  }

  /**
   *
   * @param style
   * @returns {Circle}
   */
  setStyle(style) {
    if (!style || Object.keys(style).length === 0) {
      return this
    }
    delete style['center']
    Util.merge(this._style, style)
    Util.merge(this._delegate.ellipse, style)
    return this
  }
}

Overlay.registerType('circle')

export default Circle
