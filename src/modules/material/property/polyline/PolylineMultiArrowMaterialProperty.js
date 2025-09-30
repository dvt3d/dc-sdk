/**
 * PolylineMultiArrow Material Property
 * @Author : Converted from fh2
 */

import { Cesium } from '../../../../libs'
import MaterialProperty from '../../MaterialProperty'

/**
 * PolylineMultiArrowMaterialProperty
 */
class PolylineMultiArrowMaterialProperty extends MaterialProperty {
  constructor(options = {}) {
    super(options)
    this._repeatFactor = undefined
    this._repeatFactorSubscription = undefined
    this.repeatFactor = options.repeatFactor
    this._antiClockWise = undefined
    this._antiClockWiseSubscription = undefined
    this.antiClockWise = options.antiClockWise
  }

  getType(time) {
    return Cesium.Material.PolylineMultiArrowType
  }

  getValue(time, result) {
    if (!result) {
      result = {}
    }
    result.color = Cesium.Property.getValueOrUndefined(this._color, time)
    result.repeatFactor = Cesium.Property.getValueOrUndefined(
      this._repeatFactor,
      time
    )
    result.antiClockWise = Cesium.Property.getValueOrUndefined(
      this._antiClockWise,
      time
    )
    return result
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof PolylineMultiArrowMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._repeatFactor, other._repeatFactor) &&
        Cesium.Property.equals(this._antiClockWise, other._antiClockWise))
    )
  }
}

Object.defineProperties(PolylineMultiArrowMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  repeatFactor: Cesium.createPropertyDescriptor('repeatFactor'),
  antiClockWise: Cesium.createPropertyDescriptor('antiClockWise'),
})

export default PolylineMultiArrowMaterialProperty
