/**
 * PolylineFence Material Property
 * @Author : Converted from fh2
 */

import { Cesium } from '../../../../libs'
import MaterialProperty from '../../MaterialProperty'

class PolylineFenceMaterialProperty extends MaterialProperty {
  constructor(options = {}) {
    super(options)
    this.color = options.color || Cesium.Color.WHITE
    this._outlineColor = undefined
    this._outlineColorSubscription = undefined
    this.outlineColor = options.outlineColor || new Cesium.Color(1, 1, 1, 0)
    this._outlineWidth = undefined
    this._outlineWidthSubscription = undefined
    this.outlineWidth = options.outlineWidth ?? 10
    this._maskLength = undefined
    this._maskLengthSubscription = undefined
    this.maskLength = options.maskLength ?? 20
  }

  getType(time) {
    return Cesium.Material.PolylineFenceType
  }

  getValue(time, result) {
    if (!result) {
      result = {}
    }
    result.color = Cesium.Property.getValueOrUndefined(this._color, time)
    result.outlineColor = Cesium.Property.getValueOrUndefined(this._outlineColor, time)
    result.outlineWidth = Cesium.Property.getValueOrUndefined(this._outlineWidth, time)
    result.maskLength = Cesium.Property.getValueOrUndefined(this._maskLength, time)
    return result
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof PolylineFenceMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._outlineColor, other._outlineColor) &&
        Cesium.Property.equals(this._outlineWidth, other._outlineWidth) &&
        Cesium.Property.equals(this._maskLength, other._maskLength))
    )
  }
}

Object.defineProperties(PolylineFenceMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  outlineColor: Cesium.createPropertyDescriptor('outlineColor'),
  outlineWidth: Cesium.createPropertyDescriptor('outlineWidth'),
  maskLength: Cesium.createPropertyDescriptor('maskLength'),
})

export default PolylineFenceMaterialProperty
