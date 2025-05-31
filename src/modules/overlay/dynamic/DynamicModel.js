/**
 * @Author : Caven Chen
 */
import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import DynamicOverlay from './DynamicOverlay'
import Parse from '../../parse/Parse'
import State from '../../state/State'
import { Transform } from '../../transform'
import { Util } from '../../utils'

class DynamicModel extends DynamicOverlay {
  constructor(position, modelUrl) {
    super()
    this._position = Parse.parsePosition(position)
    this._modelUrl = modelUrl
    this._delegate = new Cesium.Entity({ model: {} })
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('dynamic_model')
  }

  set modelUrl(modelUrl) {
    this._modelUrl = modelUrl
    this._delegate.model.uri = this._modelUrl
  }

  get modelUrl() {
    return this._modelUrl
  }

  _mountedHook() {
    /**
     * set the location
     */
    this._sampledPosition.forwardExtrapolationType =
      Cesium.ExtrapolationType.HOLD
    this._startTime = Cesium.JulianDate.now()
    this._sampledPosition.addSample(
      this._startTime,
      Transform.transformWGS84ToCartesian(this._position)
    )
    this._delegate.position = this._sampledPosition
    this._delegate.orientation = new Cesium.VelocityOrientationProperty(
      this._sampledPosition
    )
    this._cache.push(this._startTime)
    /**
     *  initialize the Overlay parameter
     */
    this.modelUrl = this._modelUrl
  }

  /**
   * Sets style
   * @param style
   * @returns {DynamicModel}
   */
  setStyle(style) {
    if (!style || Object.keys(style).length === 0) {
      return this
    }
    delete style['uri']
    Util.merge(this._style, style)
    Util.merge(this._delegate.model, style)
    return this
  }
}

Overlay.registerType('dynamic_model')

export default DynamicModel
