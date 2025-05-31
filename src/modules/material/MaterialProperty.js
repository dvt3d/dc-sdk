/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'

class MaterialProperty {
  constructor(options = {}) {
    this._definitionChanged = new Cesium.Event()
    this._color = undefined
    this._colorSubscription = undefined
    this._speed = undefined
    this._speedSubscription = undefined
    this.color = options.color || Cesium.Color.fromBytes(0, 255, 255, 255)
    this.speed = options.speed || 1
  }

  get isConstant() {
    return false
  }

  get definitionChanged() {
    return this._definitionChanged
  }

  getType(time) {
    return null
  }

  getValue(time, result) {
    result = Cesium.defaultValue(result, {})
    return result
  }

  equals(other) {
    return this === other
  }
}

export default MaterialProperty
