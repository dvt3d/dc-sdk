/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import Layer from '../Layer'

/**
 * TilesetLayer is used to add various tileset
 */
class TilesetLayer extends Layer {
  constructor(id) {
    super(id)
    this._delegate = new Cesium.PrimitiveCollection()
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('tileset')
  }

  /**
   * Clear all tileset
   * @returns {TilesetLayer}
   */
  clear() {
    this._delegate.removeAll()
    this._cache = {}
    this._state = State.CLEARED
    return this
  }
}

Layer.registerType('tileset')

export default TilesetLayer
