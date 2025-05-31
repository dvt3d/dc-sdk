/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import Layer from '../Layer'

class CzmlLayer extends Layer {
  constructor(id, url = '', options = {}) {
    super(id)
    this._delegate = Cesium.CzmlDataSource.load(url, options)
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('czml')
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

  /**
   *
   * @param method
   * @param context
   * @returns {CzmlLayer}
   */
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

Layer.registerType('czml')

export default CzmlLayer
