/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../../libs'
import MaterialProperty from '../../MaterialProperty'

class CircleBlurMaterialProperty extends MaterialProperty {
  constructor(options = {}) {
    super(options)
  }

  getType(time) {
    return Cesium.Material.CircleBlurType
  }

  getValue(time, result) {
    result = Cesium.defaultValue(result, {})
    result.color = Cesium.Property.getValueOrUndefined(this._color, time)
    result.speed = Cesium.Property.getValueOrUndefined(this._speed, time)
    return result
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof CircleBlurMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._speed, other._speed))
    )
  }
}

Object.defineProperties(CircleBlurMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  speed: Cesium.createPropertyDescriptor('speed'),
})

export default CircleBlurMaterialProperty
