/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import State from '../../state/State'

class I3S extends Overlay {
  constructor(url, options = {}) {
    super()
    this._delegate = Cesium.I3SDataProvider.fromUrl(url, options)
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('i3s')
  }

  /**
   *
   * @param {*} callback
   * @returns
   */
  ready(callback) {
    this._delegate.then(callback)
    return this
  }

  /**
   *
   * @param {*} text
   * @param {*} textStyle
   */
  setLabel(text, textStyle) {
    console.warn('not support this function')
    return this
  }
}

Overlay.registerType('i3s')

export default I3S
