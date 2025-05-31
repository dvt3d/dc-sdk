/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import State from '../../state/State'
import Parse from '../../parse/Parse'
import { Util } from '../../utils'
import { Transform } from '../../transform'
import { center, area } from '../../math'

class Polygon extends Overlay {
  constructor(positions) {
    super()
    this._delegate = new Cesium.Entity({ polygon: {} })
    this._positions = Parse.parsePositions(positions)
    this._holes = []
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('polygon')
  }

  set positions(positions) {
    this._positions = Parse.parsePositions(positions)
    this._delegate.polygon.hierarchy = this._computeHierarchy()
  }

  get positions() {
    return this._positions
  }

  set holes(holes) {
    if (holes && holes.length) {
      this._holes = holes.map((item) => Parse.parsePositions(item))
      this._delegate.polygon.hierarchy = this._computeHierarchy()
    }
  }

  get holes() {
    return this._holes
  }

  get center() {
    return center([...this._positions, this._positions[0]])
  }

  get area() {
    return area(this._positions)
  }

  /**
   *
   * @private
   */
  _computeHierarchy() {
    let result = new Cesium.PolygonHierarchy()
    result.positions = Transform.transformWGS84ArrayToCartesianArray(
      this._positions
    )
    result.holes = this._holes.map(
      (item) =>
        new Cesium.PolygonHierarchy(
          Transform.transformWGS84ArrayToCartesianArray(item)
        )
    )
    return result
  }

  _mountedHook() {
    /**
     *  initialize the Overlay parameter
     */
    this.positions = this._positions
  }

  /**
   * Sets text
   * @param text
   * @param textStyle
   * @returns {Polygon}
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
   * @returns {Polygon}
   */
  setStyle(style) {
    if (!style || Object.keys(style).length === 0) {
      return this
    }
    delete style['positions']
    Util.merge(this._style, style)
    Util.merge(this._delegate.polygon, style)
    return this
  }

  /**
   * Parse from entity
   * @param entity
   * @returns {any}
   */
  static fromEntity(entity) {
    let polygon = undefined
    let now = Cesium.JulianDate.now()
    if (entity.polygon) {
      let positions = Transform.transformCartesianArrayToWGS84Array(
        entity.polygon.hierarchy.getValue(now).positions
      )
      polygon = new Polygon(positions)
      polygon.attr = {
        ...entity?.properties?.getValue(now),
      }
    }
    return polygon
  }
}

Overlay.registerType('polygon')

export default Polygon
