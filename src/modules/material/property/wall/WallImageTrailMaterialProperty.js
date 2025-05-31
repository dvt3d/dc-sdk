/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../../libs'
import MaterialProperty from '../../MaterialProperty'

class WallImageTrailMaterialProperty extends MaterialProperty {
  constructor(options = {}) {
    super(options)
    this._image = undefined
    this._imageSubscription = undefined
    this._repeat = undefined
    this._repeatSubscription = undefined
    this.image = options.image
    this.repeat = new Cesium.Cartesian2(
      options.repeat?.x || 1,
      options.repeat?.y || 1
    )
  }

  getType(time) {
    return Cesium.Material.WallImageTrailType
  }

  getValue(time, result) {
    result = Cesium.defaultValue(result, {})
    result.color = Cesium.Property.getValueOrUndefined(this._color, time)
    result.image = Cesium.Property.getValueOrUndefined(this._image, time)
    result.repeat = Cesium.Property.getValueOrUndefined(this._repeat, time)
    result.speed = Cesium.Property.getValueOrUndefined(this._speed, time)
    return result
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof WallImageTrailMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._image, other._image) &&
        Cesium.Property.equals(this._repeat, other._repeat) &&
        Cesium.Property.equals(this._speed, other._speed))
    )
  }
}

Object.defineProperties(WallImageTrailMaterialProperty.prototype, {
  image: Cesium.createPropertyDescriptor('image'),
  color: Cesium.createPropertyDescriptor('color'),
  speed: Cesium.createPropertyDescriptor('speed'),
  repeat: Cesium.createPropertyDescriptor('repeat'),
})

export default WallImageTrailMaterialProperty
