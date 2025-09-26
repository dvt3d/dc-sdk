/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../../libs'
import MaterialProperty from '../../MaterialProperty'

class RadarOuterMaterialProperty extends MaterialProperty {
  constructor(options = {}) {
    super(options)
    this._repeat = undefined
    this._repeatSubscription = undefined
    this._thickness = undefined
    this._thicknessSubscription = undefined
    this.repeat = options.repeat || 30.0
    this.thickness = options.thickness || 0.3
  }

  getType(time) {
    return Cesium.Material.RadarOuterType
  }

  getValue(time, result) {
    result = Cesium.defaultValue(result, {})
    result.color = Cesium.Property.getValueOrUndefined(this._color, time)
    result.speed = Cesium.Property.getValueOrUndefined(this._speed, time)
    result.repeat = Cesium.Property.getValueOrUndefined(this._repeat, time)
    result.thickness = Cesium.Property.getValueOrUndefined(
      this._thickness,
      time
    )
    return result
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof RadarOuterMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._speed, other._speed) &&
        Cesium.Property.equals(this._repeat, other._repeat) &&
        Cesium.Property.equals(this._thickness, other._thickness))
    )
  }
}

Object.defineProperties(RadarOuterMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  repeat: Cesium.createPropertyDescriptor('repeat'),
  thickness: Cesium.createPropertyDescriptor('thickness'),
  speed: Cesium.createPropertyDescriptor('speed'),
})

export default RadarOuterMaterialProperty
