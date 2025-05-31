/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import State from '../state/State'
import Parse from '../parse/Parse'
import { PathEventType, PathEvent } from '../event'
import { Util } from '../utils'
import { Transform } from '../transform'
import { heading, distance } from '../math'

class RoamingPath {
  constructor(positions, duration, pathMode) {
    this._id = Util.uuid()
    this._bid = undefined
    this._positions = Parse.parsePositions(positions)
    this._duration = duration || 20
    this._pathMode = pathMode || 'speed'
    this._timeLine = []
    this._sampledPosition = undefined
    this._actived = false
    this._endTime = Cesium.JulianDate.now()
    this._pathEvent = new PathEvent()
    this._pathEvent.on(PathEventType.ADD, this._onAdd, this)
    this._pathEvent.on(PathEventType.REMOVE, this._onRemove, this)
    this._pathEvent.on(PathEventType.POST_RENDER, this._onPostRender, this)
    this._pathEvent.on(PathEventType.RESET_TIME_LINE, this._resetTimeLine, this)
    this._state = State.INITIALIZED
  }

  get pathId() {
    return this._id
  }

  set id(id) {
    this._bid = id
  }

  get id() {
    return this._bid
  }

  set positions(postions) {
    this._positions = Parse.parsePositions(postions)
  }

  get positions() {
    return this._positions
  }

  set duration(duration) {
    this._duration = duration
  }

  get duration() {
    return this._duration
  }

  set pathMode(pathMode) {
    this._pathMode = pathMode
  }

  get pathMode() {
    return this._pathMode
  }

  get pathEvent() {
    return this._pathEvent
  }

  set actived(actived) {
    this._actived = actived
  }

  get actived() {
    return this._actived
  }

  get state() {
    return this._state
  }

  _onAdd() {
    this._state = State.ADDED
  }

  _onRemove() {
    this._state = State.REMOVED
  }

  /**
   *
   * @param viewer
   * @param viewOption
   * @private
   */
  _onPostRender({ viewer, viewOption }) {
    if (!this.actived) {
      return false
    }
    let now = Cesium.JulianDate.now()
    if (
      Cesium.JulianDate.lessThan(now, this._endTime) &&
      this._sampledPosition
    ) {
      let p = this._sampledPosition.getValue(now)
      let next_p = this._sampledPosition.getValue(
        Cesium.JulianDate.addSeconds(now, 0.001, new Cesium.JulianDate())
      )
      if (p && next_p) {
        viewer.camera.lookAt(
          p,
          new Cesium.HeadingPitchRange(
            heading(p, next_p),
            Cesium.Math.toRadians(viewOption?.pitch || -20),
            viewOption?.range || 2000
          )
        )
      }
    } else {
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
      this._actived = false
    }
  }

  /**
   *
   * @private
   */
  _resetTimeLine() {
    if (!this._positions || !this._positions.length) {
      return false
    }
    let now = Cesium.JulianDate.now()
    let interval = 0
    let timeLine = []
    if (this._pathMode === 'speed') {
      let v = distance(this._positions) / this._duration
      timeLine = this._positions.map((item, index, arr) => {
        if (index !== 0) {
          interval += distance([arr[index - 1], item]) / v
        }
        return Cesium.JulianDate.addSeconds(
          now,
          interval,
          new Cesium.JulianDate()
        )
      })
    } else {
      let len = this._positions.length
      let interval = (this._duration - (this._duration % len)) / len
      timeLine = this._positions.map((item, index) => {
        return Cesium.JulianDate.addSeconds(
          now,
          index * interval,
          new Cesium.JulianDate()
        )
      })
    }
    this._sampledPosition = new Cesium.SampledPositionProperty()
    this._sampledPosition.addSamples(
      timeLine,
      Transform.transformWGS84ArrayToCartesianArray(this._positions)
    )
    this._sampledPosition.forwardExtrapolationType =
      Cesium.ExtrapolationType.HOLD
    this._sampledPosition.setInterpolationOptions({
      interpolationDegree: 2,
      interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
    })
    this._endTime = timeLine[timeLine.length - 1]
    this._actived = true
  }
}

export default RoamingPath
