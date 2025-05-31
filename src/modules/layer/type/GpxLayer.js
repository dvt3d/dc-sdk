/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import Layer from '../Layer'

class GpxLayer extends Layer {
  constructor(id, url, options = {}) {
    if (!url) {
      throw new Error('GpxLayer: the url is empty')
    }
    super(id)
    this._delegate = Cesium.KmlDataSource.load(url, options)
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('gpx')
  }

  set show(show) {
    this._show = show
    this._delegate &&
      this._delegate.then((dataSource) => {
        dataSource.show = this._show
      })
  }

  get show() {
    return this._show
  }

  eachOverlay(method, context) {
    if (this._delegate) {
      this._delegate.then((dataSource) => {
        let entities = dataSource.entities.values
        entities.forEach((item) => {
          method.call(context, item)
        })
      })
      return this
    }
  }
}

Layer.registerType('gpx')

export default GpxLayer
