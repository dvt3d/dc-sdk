/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import Layer from '../Layer'

/**
 * I3SLayer is used to add various I3S
 */
class I3SLayer extends Layer {
  constructor(id) {
    super(id)
    this._delegate = new Cesium.PrimitiveCollection()
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('i3s')
  }

  /**
   * Clear all tileset
   * @returns {I3SLayer}
   */
  clear() {
    this._delegate.removeAll()
    this._cache = {}
    this._state = State.CLEARED
    return this
  }
}

Layer.registerType('i3s')

export default I3SLayer
