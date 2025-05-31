/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import Layer from '../Layer'

class RasterTileLayer extends Layer {
  constructor(id, provider, options) {
    super(id)
    this._delegate = Cesium.ImageryLayer.fromProviderAsync(provider, options)
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('raster-tile')
  }
}

Layer.registerType('raster-tile')

export default RasterTileLayer
