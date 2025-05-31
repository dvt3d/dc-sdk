/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import State from '../../state/State'
import Parse from '../../parse/Parse'
import { Transform } from '../../transform'
import { Util } from '../../utils'

class WaterPrimitive extends Overlay {
  constructor(positions, holes = []) {
    super()
    this._positions = Parse.parsePositions(positions)
    this._holes = holes.map((item) => Parse.parsePositions(item))
    this._delegate = new Cesium.GroundPrimitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: {},
      }),
      asynchronous: true,
    })
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('water_primitive')
  }

  set positions(positions) {
    this._positions = Parse.parsePositions(positions)
    this._delegate.geometryInstances.geometry = new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(
        Transform.transformWGS84ArrayToCartesianArray(this._positions),
        this._holes.map(
          (item) =>
            new Cesium.PolygonHierarchy(
              Transform.transformWGS84ArrayToCartesianArray(item)
            )
        )
      ),
      height: this._style?.height,
      extrudedHeight: this._style?.extrudedHeight,
      closeTop: this._style?.closeTop,
      closeBottom: this._style?.closeBottom,
      vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
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
    if (!this._style) {
      return
    }
    this._delegate.appearance = new Cesium.EllipsoidSurfaceAppearance({
      material: Cesium.Material.fromType('Water', {
        baseWaterColor:
          this._style?.baseWaterColor || new Cesium.Color(0.2, 0.3, 0.6, 1.0),
        blendColor:
          this._style?.blendColor || new Cesium.Color(0.0, 1.0, 0.699, 1.0),
        specularMap: this._style?.specularMap || Cesium.Material.DefaultImageId,
        normalMap: this._style?.normalMap || Cesium.Material.DefaultImageId,
        frequency: this._style?.frequency || 1000.0,
        animationSpeed: this._style?.animationSpeed || 0.01,
        amplitude: this._style?.amplitude || 10,
        specularIntensity: this._style?.specularIntensity || 0.5,
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
   * Sets Style
   * @param style
   * @returns {WaterPrimitive}
   */
  setStyle(style) {
    if (Object.keys(style).length === 0) {
      return this
    }
    Util.merge(this._style, style)
    if (this._style?.classificationType) {
      this._delegate.classificationType = this._style.classificationType
    }
    this._setAppearance()
    return this
  }
}

Overlay.registerType('water_primitive')

export default WaterPrimitive
