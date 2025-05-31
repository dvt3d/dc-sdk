/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import State from '../../state/State'
import Parse from '../../parse/Parse'
import { Transform } from '../../transform'
import { Util } from '../../utils'

class FlowLinePrimitive extends Overlay {
  constructor(positions, width = 1) {
    super()
    this._positions = Parse.parsePositions(positions)
    this._width = width
    this._delegate = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: {},
      }),
    })
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('flow_line_primitive')
  }

  set positions(positions) {
    this._positions = Parse.parsePositions(positions)
    this._delegate.geometryInstances.geometry = new Cesium.PolylineGeometry({
      positions: Transform.transformWGS84ArrayToCartesianArray(this._positions),
      width: this._width,
    })
  }

  get positions() {
    return this._positions
  }

  /**
   *
   * @private
   */
  _setAppearance() {
    this._delegate.appearance = new Cesium.PolylineMaterialAppearance({
      material: Cesium.Material.fromType('PolylineFlow', {
        color: this._style?.color || new Cesium.Color(1.0, 0.0, 0.0, 0.7),
        speed: this._style?.speed || 1,
        percent: this._style?.percent || 0.03,
        gradient: this._style?.gradient || 0.1,
      }),
    })
  }

  _mountedHook() {
    /**
     *  set the positions
     */
    this.positions = this._positions
    /**
     * set the appearance
     */
    !this._delegate.appearance && this._setAppearance()
  }

  /**
   *
   * @param text
   * @param textStyle
   * @returns {FlowLinePrimitive}
   */
  setLabel(text, textStyle) {
    return this
  }

  /**
   * Sets Style
   * @param style
   * @returns {FlowLinePrimitive}
   */
  setStyle(style = {}) {
    if (Object.keys(style).length === 0) {
      return this
    }
    Util.merge(this._style, style)
    style.classificationType &&
      (this._delegate.classificationType = this._style.classificationType)
    this._setAppearance()
    return this
  }
}

Overlay.registerType('flow_line_primitive')

export default FlowLinePrimitive
