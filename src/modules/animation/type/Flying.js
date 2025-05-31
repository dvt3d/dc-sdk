/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import AnimationType from '../AnimationType'
import Animation from '../Animation'
import { Transform } from '../../transform'
import Parse from '../../parse/Parse.js'

class Flying extends Animation {
  constructor(viewer, options = {}) {
    super(viewer)
    this._options = options
    this._positions = []
    this._durations = [3]
    this._currentIndex = 0
    this._timer = undefined
  }

  get type() {
    return AnimationType.FLYING
  }

  set positions(positions) {
    this._positions = Parse.parsePositions(positions)
  }

  get positions() {
    return this._positions
  }

  set durations(durations) {
    this._durations = durations
  }

  get durations() {
    return this._durations
  }

  /**
   *
   * @private
   */
  _cameraFly() {
    let self = this
    let camera = this._viewer.camera
    let position = this._positions[this._currentIndex]
    let callback = () => {
      let nextPosition = self._positions[self._currentIndex + 1]
      if (nextPosition) {
        self._currentIndex++
        if (self._currentIndex <= self._positions.length - 1) {
          self._timer = setTimeout(() => {
            self._cameraFly()
          }, (self._options.dwellTime || 1) * 1e3)
        }
      } else if (!nextPosition && self._options.loop) {
        self._currentIndex = 0
        self._timer = setTimeout(() => {
          self._cameraFly()
        }, (self._options.dwellTime || 1) * 1e3)
      }
      self._options.callback && self._options.callback(self._currentIndex)
    }
    if (position) {
      camera.flyTo({
        destination: Transform.transformWGS84ToCartesian(position),
        orientation: {
          heading: Cesium.Math.toRadians(position.heading),
          pitch: Cesium.Math.toRadians(position.pitch),
          roll: Cesium.Math.toRadians(position.roll),
        },
        complete: callback,
        duration:
          this._durations.length === 1
            ? this._durations[0]
            : this._durations[this._currentIndex],
      })
    }
  }

  /**
   *
   * @returns {Flying}
   */
  start() {
    if (this._positions && this._positions.length) {
      this._currentIndex = 0
      this._cameraFly()
    }
    return this
  }

  /**
   *
   * @returns {Flying}
   */
  pause() {
    this._viewer.camera.cancelFlight()
    this._timer && clearTimeout(this._timer)
    return this
  }

  /**
   *
   * @returns {Flying}
   */
  restore() {
    if (this._positions && this._positions.length) {
      this._cameraFly()
    }
    return this
  }
}

AnimationType.FLYING = 'flying'

export default Flying
