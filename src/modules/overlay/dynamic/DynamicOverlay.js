/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import Parse from '../../parse/Parse'
import State from '../../state/State'
import { Transform } from '../../transform'

class DynamicOverlay extends Overlay {
  constructor() {
    super()
    this._startTime = undefined
    this._lastTime = undefined
    this._sampledPosition = new Cesium.SampledPositionProperty()
    this._cache = []
    this._maxCacheSize = 10
    this._state = State.INITIALIZED
  }

  set maxCacheSize(maxCacheSize) {
    this._maxCacheSize = maxCacheSize
  }

  get maxCacheSize() {
    return this._maxCacheSize
  }

  get position() {
    return Transform.transformCartesianToWGS84(
      this._sampledPosition.getValue(Cesium.JulianDate.now())
    )
  }

  /**
   *
   * @private
   */
  _removePosition() {
    if (this._cache.length > this._maxCacheSize) {
      let start = Cesium.JulianDate.addSeconds(
        this._cache[0],
        -0.2,
        new Cesium.JulianDate()
      )
      let stop = Cesium.JulianDate.addSeconds(
        this._cache[this._cache.length - this._maxCacheSize],
        -0.2,
        new Cesium.JulianDate()
      )
      this._sampledPosition.removeSamples(
        new Cesium.TimeInterval({
          start: start,
          stop: stop,
        })
      )
      this._cache.splice(0, this._cache.length - this._maxCacheSize)
    }
  }

  /**
   *
   * @param position
   * @param interval
   * @returns {DynamicOverlay}
   */
  addPosition(position, interval) {
    this._removePosition()
    let now = Cesium.JulianDate.now()
    let time = Cesium.JulianDate.addSeconds(
      now,
      interval,
      new Cesium.JulianDate()
    )
    this._sampledPosition.addSample(
      time,
      Transform.transformWGS84ToCartesian(Parse.parsePosition(position))
    )
    this._lastTime = time
    this._cache.push(this._lastTime)
    return this
  }

  /**
   *
   * @param content
   * @returns {DynamicOverlay}
   */
  bindDom(content) {
    return this
  }
}

export default DynamicOverlay
