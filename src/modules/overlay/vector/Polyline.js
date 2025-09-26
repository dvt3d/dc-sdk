/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import State from '../../state/State'
import Parse from '../../parse/Parse'
import { Util } from '../../utils'
import { Transform } from '../../transform'
import { center, distance } from '../../math'

class Polyline extends Overlay {
  constructor(positions) {
    super()
    this._positions = Parse.parsePositions(positions)
    this._delegate = new Cesium.Entity({
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          return Transform.transformWGS84ArrayToCartesianArray(this._positions)
        }, false),
      },
    })
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('polyline')
  }

  set positions(positions) {
    this._positions = Parse.parsePositions(positions)
  }

  get positions() {
    return this._positions
  }

  get center() {
    return center(this._positions)
  }

  get distance() {
    return distance(this._positions)
  }

  _mountedHook() {
    /**
     *  initialize the Overlay parameter
     */
    this.positions = this._positions
  }

  /**
   * Sets Text
   * @param text
   * @param textStyle
   * @returns {Polyline}
   */
  setLabel(text, textStyle) {
    this._delegate.position = Transform.transformWGS84ToCartesian(this.center)
    this._delegate.label = {
      text: text,
      ...textStyle,
    }
    return this
  }

  /**
   * Sets style
   * @param style
   * @returns {Polyline}
   */
  setStyle(style) {
    if (!style || Object.keys(style).length === 0) {
      return this
    }
    delete style['positions']
    Util.merge(this._style, style)
    Util.merge(this._delegate.polyline, style)
    return this
  }

  /**
   * Parse from entity
   * @param entity
   * @returns {Polyline}
   */
  static fromEntity(entity) {
    let polyline = undefined
    let now = Cesium.JulianDate.now()
    if (entity.polyline) {
      let positions = Transform.transformCartesianArrayToWGS84Array(
        entity.polyline.positions.getValue(now)
      )
      polyline = new Polyline(positions)
      polyline.attr = {
        ...entity?.properties?.getValue(now),
      }
    }
    return polyline
  }
}

Overlay.registerType('polyline')

export default Polyline
