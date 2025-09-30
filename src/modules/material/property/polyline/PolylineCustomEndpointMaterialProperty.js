/**
 * PolylineCustomEndpoint Material Property
 * @Author : Converted from fh2
 */

import { Cesium } from '../../../../libs'
import MaterialProperty from '../../MaterialProperty'

/**
 * PolylineCustomEndpointMaterialProperty
 */
class PolylineCustomEndpointMaterialProperty extends MaterialProperty {
  constructor(options = {}) {
    super(options)
    this.color = options.color || Cesium.Color.WHITE

    this._startType = undefined
    this._startTypeSubscription = undefined
    this.startType = options.startType
    this._endType = undefined
    this._endTypeSubscription = undefined
    this.endType = options.endType
    this._outlineShow = undefined
    this._outlineShowSubscription = undefined
    this.outlineShow = options.outlineShow || false
    this._lineWidth = undefined
    this._lineWidthSubscription = undefined
    this.lineWidth = options.lineWidth
    this._outlineColor = undefined
    this._outlineColorSubscription = undefined
    this.outlineColor =
      options.outlineColor ||
      (this.outlineShow ? Cesium.Color.WHITE : this.color)
  }

  getType(time) {
    return Cesium.Material.PolylineCustomEndpointType
  }

  getValue(time, result) {
    if (!result) {
      result = {}
    }
    result.color = Cesium.Property.getValueOrUndefined(this._color, time)
    result.startType = Cesium.Property.getValueOrUndefined(this._startType, time)
    result.endType = Cesium.Property.getValueOrUndefined(this._endType, time)
    result.outlineShow = Cesium.Property.getValueOrUndefined(this._outlineShow, time)
    result.lineWidth = Cesium.Property.getValueOrUndefined(this._lineWidth, time)
    result.outlineColor = Cesium.Property.getValueOrUndefined(this._outlineColor, time)
    return result
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof PolylineCustomEndpointMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._startType, other._startType) &&
        Cesium.Property.equals(this._endType, other._endType) &&
        Cesium.Property.equals(this._outlineShow, other._outlineShow) &&
        Cesium.Property.equals(this._lineWidth, other._lineWidth) &&
        Cesium.Property.equals(this._outlineColor, other._outlineColor))
    )
  }
}

Object.defineProperties(PolylineCustomEndpointMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  startType: Cesium.createPropertyDescriptor('startType'),
  endType: Cesium.createPropertyDescriptor('endType'),
  outlineShow: Cesium.createPropertyDescriptor('outlineShow'),
  lineWidth: Cesium.createPropertyDescriptor('lineWidth'),
  outlineColor: Cesium.createPropertyDescriptor('outlineColor'),
})

export default PolylineCustomEndpointMaterialProperty
