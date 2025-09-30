/**
 * PolylineDirection Material Property
 * @Author : Converted from fh2
 */

import { Cesium } from '../../../../libs'
import MaterialProperty from '../../MaterialProperty'

/**
 * PolylineDirectionMaterialProperty
 */
class PolylineDirectionMaterialProperty extends MaterialProperty {
  constructor(options = {}) {
    super(options)
    this._outlineWidth = undefined
    this._outlineWidthSubscription = undefined
    this.outlineWidth = options.outlineWidth
    this._outlineColor = undefined
    this._outlineColorSubscription = undefined
    this.outlineColor = options.outlineColor
  }

  getType(time) {
    return Cesium.Material.PolylineDirectionType
  }

  getValue(time, result) {
    if (!result) {
      result = {}
    }
    result.color = Cesium.Property.getValueOrUndefined(this._color, time)
    result.outlineWidth = Cesium.Property.getValueOrUndefined(
      this._outlineWidth,
      time
    )
    result.outlineColor = Cesium.Property.getValueOrUndefined(
      this._outlineColor,
      time
    )
    return result
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof PolylineDirectionMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._outlineWidth, other._outlineWidth) &&
        Cesium.Property.equals(this._outlineColor, other._outlineColor))
    )
  }
}

Object.defineProperties(PolylineDirectionMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  outlineWidth: Cesium.createPropertyDescriptor('outlineWidth'),
  outlineColor: Cesium.createPropertyDescriptor('outlineColor'),
})

export default PolylineDirectionMaterialProperty
