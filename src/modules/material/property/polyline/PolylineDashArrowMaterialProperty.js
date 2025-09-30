/**
 * PolylineDashArrow Material Property
 * @Author : Converted from fh2
 */

import { Cesium } from '../../../../libs'
import MaterialProperty from '../../MaterialProperty'

/**
 * PolylineDashArrowMaterialProperty
 */
class PolylineDashArrowMaterialProperty extends MaterialProperty {
  constructor(options = {}) {
    super(options)
  }

  getType(time) {
    return Cesium.Material.PolylineDashArrowType
  }

  getValue(time, result) {
    if (!result) {
      result = {}
    }
    result.color = Cesium.Property.getValueOrUndefined(this._color, time)
    return result
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof PolylineDashArrowMaterialProperty &&
        Cesium.Property.equals(this._color, other._color))
    )
  }
}

Object.defineProperties(PolylineDashArrowMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
})

export default PolylineDashArrowMaterialProperty
