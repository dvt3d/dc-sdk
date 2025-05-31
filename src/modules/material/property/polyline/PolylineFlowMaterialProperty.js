/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../../libs'
import MaterialProperty from '../../MaterialProperty'

class PolylineFlowMaterialProperty extends MaterialProperty {
  constructor(options = {}) {
    super(options)
    this._percent = undefined
    this._percentSubscription = undefined
    this._gradient = undefined
    this._gradientSubscription = undefined
    this.percent = options.percent || 0.03
    this.gradient = options.gradient || 0.1
  }

  getType(time) {
    return Cesium.Material.PolylineFlowType
  }

  getValue(time, result) {
    if (!result) {
      result = {}
    }
    result.color = Cesium.Property.getValueOrUndefined(this._color, time)
    result.speed = Cesium.Property.getValueOrUndefined(this._speed, time)
    result.percent = Cesium.Property.getValueOrUndefined(this._percent, time)
    result.gradient = Cesium.Property.getValueOrUndefined(this._gradient, time)
    return result
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof PolylineFlowMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._speed, other._speed) &&
        Cesium.Property.equals(this._percent, other._percent) &&
        Cesium.Property.equals(this._gradient, other._gradient))
    )
  }
}

Object.defineProperties(PolylineFlowMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  speed: Cesium.createPropertyDescriptor('speed'),
  percent: Cesium.createPropertyDescriptor('percent'),
  gradient: Cesium.createPropertyDescriptor('gradient'),
})

export default PolylineFlowMaterialProperty
