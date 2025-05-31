/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import State from '../../state/State'
import Parse from '../../parse/Parse'
import { Util } from '../../utils'
import { Transform } from '../../transform'

class Rect extends Overlay {
  constructor(positions) {
    super()
    this._positions = Parse.parsePositions(positions)
    this._delegate = new Cesium.Entity({ rectangle: {} })
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('rect')
  }

  set positions(positions) {
    this._positions = Parse.parsePositions(positions)
    this._delegate.rectangle.coordinates = Cesium.Rectangle.fromCartesianArray(
      Transform.transformWGS84ArrayToCartesianArray(this._positions)
    )
  }

  get positions() {
    return this._positions
  }

  _mountedHook() {
    /**
     * set the location
     */
    this.positions = this._positions
  }

  /**
   * @param text
   * @param textStyle
   * @returns {Rect}
   */
  setLabel(text, textStyle) {
    const rectangle = this._delegate.rectangle.coordinates.getValue()
    this._delegate.position = Cesium.Cartographic.toCartesian(
      Cesium.Rectangle.center(rectangle, new Cesium.Cartographic())
    )
    this._delegate.label = {
      ...textStyle,
      text: text,
    }
    return this
  }

  /**
   * Sets Style
   * @param style
   * @returns {Rect}
   */
  setStyle(style) {
    if (Object.keys(style).length === 0) {
      return this
    }
    delete style['positions']
    Util.merge(this._style, style)
    Util.merge(this._delegate.rectangle, style)
    return this
  }
}

Overlay.registerType('rect')

export default Rect
