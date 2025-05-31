/**
 * @Author : Caven Chen
 */
import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import Parse from '../../parse/Parse'
import State from '../../state/State'
import { Transform } from '../../transform'
import { Util } from '../../utils'

class CustomBillboard extends Overlay {
  constructor(position, icon) {
    super()
    this._delegate = new Cesium.Entity({ billboard: {} })
    this._position = Parse.parsePosition(position)
    this._icon = icon
    this._size = [32, 32]
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('custom_billboard')
  }

  set position(position) {
    this._position = Parse.parsePosition(position)
    this._delegate.position = Transform.transformWGS84ToCartesian(
      this._position
    )
  }

  get position() {
    return this._position
  }

  set icon(icon) {
    this._icon = icon
    this._delegate.billboard.image = this._icon
  }

  get icon() {
    return this._icon
  }

  set size(size) {
    if (!Array.isArray(size)) {
      throw new Error('CustomBillboard: the size invalid')
    }
    this._size = size
    this._delegate.billboard.width = this._size[0] || 32
    this._delegate.billboard.height = this._size[1] || 32
  }

  get size() {
    return this._size
  }

  _mountedHook() {
    /**
     * set the location
     */
    this.position = this._position
    /**
     *  initialize the Overlay parameter
     */
    this.icon = this._icon
    this.size = this._size
  }

  /**
   * Sets label
   * @param text
   * @param textStyle
   * @returns {CustomBillboard}
   */
  setLabel(text, textStyle) {
    this._delegate.label = {
      ...textStyle,
      text: text,
    }
    return this
  }

  /**
   * Sets Style
   * @param style
   * @returns {CustomBillboard}
   */
  setStyle(style) {
    if (!style || Object.keys(style).length === 0) {
      return this
    }
    delete style['image'] && delete style['width'] && delete style['height']
    Util.merge(this._style, style)
    Util.merge(this._delegate.billboard, style)
    return this
  }

  /**
   * Sets VLine style
   * @param style
   * @returns {CustomBillboard}
   */
  setVLine(style = {}) {
    if (this._position.alt > 0 && !this._delegate.polyline) {
      let position = this._position.copy()
      position.alt = style.height || 0
      this._delegate.polyline = {
        ...style,
        positions: Transform.transformWGS84ArrayToCartesianArray([
          position,
          this._position,
        ]),
      }
    }
    return this
  }

  /**
   * @param {*} radius
   * @param {*} style
   * @param {*} rotateAmount
   */
  setBottomCircle(radius, style = {}, rotateAmount = 0) {
    let stRotation = 0
    let amount = rotateAmount
    this._delegate.ellipse = {
      ...style,
      semiMajorAxis: radius,
      semiMinorAxis: radius,
      stRotation: new Cesium.CallbackProperty(() => {
        stRotation += amount
        if (stRotation >= 360 || stRotation <= -360) {
          stRotation = 0
        }
        return stRotation
      }, false),
    }
    return this
  }
}

Overlay.registerType('custom_billboard')

export default CustomBillboard
