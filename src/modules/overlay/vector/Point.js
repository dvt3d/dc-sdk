/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import State from '../../state/State'
import Parse from '../../parse/Parse'
import { Util } from '../../utils'
import { Transform } from '../../transform'

const DEF_STYLE = {
  pixelSize: 8,
  outlineColor: Cesium.Color.BLUE,
  outlineWidth: 2,
}

class Point extends Overlay {
  constructor(position) {
    super()
    this._delegate = new Cesium.Entity({ point: {} })
    this._position = Parse.parsePosition(position)
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('point')
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

  _mountedHook() {
    /**
     * set the location
     */
    this.position = this._position

    /**
     *  initialize the Overlay parameter
     */
    Util.merge(this._delegate.point, DEF_STYLE, this._style)
  }

  /**
   * Set style
   * @param style
   * @returns {Point}
   */
  setStyle(style) {
    if (!style || Object.keys(style).length === 0) {
      return this
    }
    delete style['position']
    Util.merge(this._style, style)
    Util.merge(this._delegate.point, DEF_STYLE, this._style)
    return this
  }

  /**
   * Parse from entity
   * @param entity
   * @returns {any}
   */
  static fromEntity(entity) {
    let point = undefined
    let now = Cesium.JulianDate.now()
    let position = Transform.transformCartesianToWGS84(
      entity.position.getValue(now)
    )
    point = new Point(position)
    point.attr = {
      ...entity?.properties?.getValue(now),
    }
    return point
  }
}

Overlay.registerType('point')

export default Point
