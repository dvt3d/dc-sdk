/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import State from '../../state/State'
import Parse from '../../parse/Parse'
import { Util } from '../../utils'
import { Transform } from '../../transform'

class Corridor extends Overlay {
  constructor(positions) {
    super()
    this._positions = Parse.parsePositions(positions)
    this._delegate = new Cesium.Entity({ corridor: {} })
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('corridor')
  }

  set positions(positions) {
    this._positions = Parse.parsePositions(positions)
    this._delegate.corridor.positions =
      Transform.transformWGS84ArrayToCartesianArray(this._positions)
  }

  get positions() {
    return this._positions
  }

  _mountedHook() {
    /**
     *  set the location
     */
    this.positions = this._positions
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
   * @returns {Corridor}
   */
  setStyle(style) {
    if (Object.keys(style).length === 0) {
      return this
    }
    delete style['positions']
    Util.merge(this._style, style)
    Util.merge(this._delegate.corridor, style)
    return this
  }

  /**
   * Parses from entity
   * @param entity
   * @returns {Corridor|any}
   */
  static fromEntity(entity) {
    let corridor = undefined
    let now = Cesium.JulianDate.now()
    if (entity.polyline) {
      let positions = Transform.transformCartesianArrayToWGS84Array(
        entity.polyline.positions.getValue(now)
      )
      corridor = new Corridor(positions)
      corridor.attr = {
        ...entity?.properties?.getValue(now),
      }
    }
    return corridor
  }
}

Overlay.registerType('corridor')

export default Corridor
