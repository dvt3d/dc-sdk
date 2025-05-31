/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import Parse from '../../parse/Parse'
import { Util } from '../../utils'
import { Transform } from '../../transform'
import Overlay from '../Overlay'

class Wall extends Overlay {
  constructor(positions) {
    super()
    this._positions = Parse.parsePositions(positions)
    this._delegate = new Cesium.Entity({ wall: {} })
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('wall')
  }

  set positions(positions) {
    this._positions = Parse.parsePositions(positions)
    this._delegate.wall.positions =
      Transform.transformWGS84ArrayToCartesianArray(this._positions)
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
   *
   * @param text
   * @param textStyle
   * @returns {Wall}
   */
  setLabel(text, textStyle) {
    return this
  }

  /**
   * Sets Style
   * @param style
   * @returns {Wall}
   */
  setStyle(style) {
    if (Object.keys(style).length === 0) {
      return this
    }
    delete style['positions']
    Util.merge(this._style, style)
    Util.merge(this._delegate.wall, style)
    return this
  }

  /**
   * Parses from entity
   * @param entity
   * @returns {Wall|any}
   */
  static fromEntity(entity) {
    let wall = undefined
    let now = Cesium.JulianDate.now()
    if (entity.polyline) {
      let positions = Transform.transformCartesianArrayToWGS84Array(
        entity.polyline.positions.getValue(now)
      )
      wall = new Wall(positions)
      wall.attr = {
        ...entity?.properties?.getValue(now),
      }
    }
    return wall
  }
}

Overlay.registerType('wall')

export default Wall
