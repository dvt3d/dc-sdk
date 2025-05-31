/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import Layer from '../Layer'

class DynamicLayer extends Layer {
  constructor(id) {
    super(id)
    this._delegate = new Cesium.CustomDataSource(id)
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('dynamic')
  }

  /**
   * Clears all entities
   * @returns {DynamicLayer}
   */
  clear() {
    this._delegate.entities && this._delegate.entities.removeAll()
    this._cache = {}
    this._state = State.CLEARED
    return this
  }
}

Layer.registerType('dynamic')

export default DynamicLayer
