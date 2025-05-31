/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import { TrackEvent, TrackEventType } from '../event'
import State from '../state/State'
import Parse from '../parse/Parse'
import { Util } from '../utils'
import { Transform } from '../transform'
import { heading, distance } from '../math'
import TrackViewMode from './TrackViewMode'

const DEF_OPTS = {
  clampToGround: false,
  clampToTileset: false,
  interpolationType: 'Linear',
  interpolationDegree: 2,
  endDelayTime: 0.5,
  headingOffset: 0,
}

const DEF_PATH_STYLE = {
  width: 2,
  material: Cesium.Color.ORANGE,
  clampToGround: true,
  depthFailMaterial: Cesium.Color.ORANGE.withAlpha(0.8),
}

class Track {
  constructor(positions, duration, callback, options) {
    this._id = Util.uuid()
    this._bid = undefined
    this._positions = Parse.parsePositions(positions)
    this._duration = duration || 20
    this._callback = callback
    this._options = {
      ...DEF_OPTS,
      ...options,
    }
    this._controller = undefined
    this._sampledPosition = undefined
    this._velocityOrientation = undefined
    this._viewed = false
    this._delegate = new Cesium.Entity()
    this._pathPositions = []
    this._path = new Cesium.Entity({
      show: false,
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          return this._pathPositions
        }, false),
      },
    })
    this._positionIndex = 0
    this._timeLine = []
    this._startTime = undefined
    this._endTime = undefined
    this._trackEvent = new TrackEvent()
    this._trackEvent.on(TrackEventType.POST_RENDER, this._onPostRender, this)
    this._trackEvent.on(TrackEventType.ADD, this._onAdd, this)
    this._trackEvent.on(TrackEventType.REMOVE, this._onRemove, this)
    this._trackEvent.on(
      TrackEventType.RESET_TIME_LINE,
      this._resetTimeLine,
      this
    )
    this._state = State.INITIALIZED
  }
  get currentDistance() {
    return distance(Parse.parsePositions(this._pathPositions))
  }
  get currentPosition() {
    const [pos] = this._pathPositions.slice(-1)
    return Parse.parsePosition(pos)
  }
  get allDistance() {
    return distance(this._positions)
  }

  get trackId() {
    return this._id
  }

  set id(id) {
    this._bid = id
  }

  get id() {
    return this._bid
  }

  set positions(positions) {
    this._positions = Parse.parsePositions(positions)
    this._resetTimeLine({})
  }

  get positions() {
    return this._positions
  }

  set duration(duration) {
    this._duration = duration
    this._resetTimeLine({})
  }

  get duration() {
    return this._duration
  }

  set startTime(startTime) {
    if (startTime instanceof Date) {
      this._startTime = Cesium.JulianDate.fromDate(startTime)
    } else {
      this._startTime = startTime
    }
    this._resetTimeLine({})
  }

  get startTime() {
    return this._startTime
  }

  set viewed(viewed) {
    this._viewed = viewed
  }

  get viewed() {
    return this._viewed
  }

  get trackEvent() {
    return this._trackEvent
  }

  get state() {
    return this._state
  }

  /**
   * add to entities
   * @param controller
   * @private
   */
  _onAdd(controller) {
    if (!controller) {
      return false
    }
    this._controller = controller
    this._controller.delegate.add(this._delegate)
    this._controller.delegate.add(this._path)
    !this._startTime && (this._startTime = Cesium.JulianDate.now())
    this._state = State.ADDED
  }

  /**
   * remove from entities
   * @private
   */
  _onRemove() {
    if (!this._controller) {
      return false
    }
    this._controller.delegate.remove(this._delegate)
    this._controller.delegate.remove(this._path)
    this._viewed = false
    this._startTime = undefined
    this._state = State.REMOVED
  }

  /**
   *
   * @param viewer
   * @param viewOption
   * @private
   */
  _onPostRender({ viewer, viewOption }) {
    if (!this._startTime || !this._endTime) {
      return false
    }
    let now = Cesium.JulianDate.now()
    if (Cesium.JulianDate.lessThanOrEquals(now, this._endTime)) {
      let p = this._sampledPosition.getValue(now)
      if (!p) {
        return false
      }
      this._pathPositions.push(p)
      if (this._options.clampToTileset) {
        this._delegate.position = viewer.scene.clampToHeight(p, [
          this._delegate,
        ])
      } else {
        this._delegate.position = p
      }
      let orientation = this._velocityOrientation.getValue(now)
      if (orientation) {
        let quaternion = Cesium.Quaternion.fromHeadingPitchRoll(
          new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(this._options.headingOffset || 0),
            0,
            0
          ),
          new Cesium.Quaternion()
        )
        this._delegate.orientation = Cesium.Quaternion.multiply(
          orientation,
          quaternion,
          new Cesium.Quaternion()
        )
      }
      let time = this._timeLine[this._positionIndex]
      if (time) {
        let timeDiff = Cesium.JulianDate.secondsDifference(now, time)
        if (timeDiff >= 0 && timeDiff <= 1) {
          let position = this._positions[this._positionIndex] || undefined
          if (position && orientation) {
            let mat = Cesium.Matrix3.fromQuaternion(orientation)
            let mat4 = Cesium.Matrix4.fromRotationTranslation(mat, p)
            let hpr = Cesium.Transforms.fixedFrameToHeadingPitchRoll(mat4)
            position.heading = Cesium.Math.toDegrees(hpr.heading)
            position.pitch = Cesium.Math.toDegrees(hpr.pitch)
            position.roll = Cesium.Math.toDegrees(hpr.roll)
          }
          this._callback &&
            this._callback(
              position,
              this._positionIndex + 1 === this._positions.length
            )
          this._positionIndex++
          // 无限循环
          if (
            this._options.loop &&
            this._positionIndex === this._positions.length
          ) {
            this._restart()
          }
        }
      }
    }
    this._setCameraView(viewer, viewOption)
  }

  /**
   * 重头开始播放动画
   */
  _restart() {
    this._startTime = Cesium.JulianDate.now()
    this._resetTimeLine({})
  }

  /**
   * Sets camera position
   * @param viewer
   * @param viewOption
   * @private
   */
  _setCameraView(viewer, viewOption) {
    if (!this._viewed) {
      return false
    }
    let now = Cesium.JulianDate.now()
    if (Cesium.JulianDate.greaterThan(now, this._endTime)) {
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
      viewer.delegate.trackedEntity &&
        (viewer.delegate.trackedEntity = undefined)
      this._viewed = false
    } else {
      let p = this._sampledPosition.getValue(now)
      let next_p = this._sampledPosition.getValue(
        Cesium.JulianDate.addSeconds(now, 1 / 60, new Cesium.JulianDate())
      )
      if (p && next_p) {
        if (
          viewOption?.mode === TrackViewMode.TRACKED &&
          viewer.delegate?.trackedEntity?.id !== this._delegate?.id
        ) {
          viewer.delegate.trackedEntity = this._delegate
        } else if (viewOption?.mode === TrackViewMode.FP) {
          viewer.camera.lookAt(
            p,
            new Cesium.HeadingPitchRange(
              heading(p, next_p),
              Cesium.Math.toRadians(viewOption?.pitch || 0),
              viewOption?.range || 10
            )
          )
        } else if (viewOption?.mode === TrackViewMode.TP) {
          viewer.camera.lookAt(
            p,
            new Cesium.HeadingPitchRange(
              0,
              Cesium.Math.toRadians(viewOption?.pitch || -90),
              viewOption?.range || 1000
            )
          )
        }
      }
    }
  }

  /**
   *
   * @param params
   * @returns {boolean}
   * @private
   */
  _resetTimeLine(params) {
    if (!this._startTime || !this._duration || !this._positions?.length) {
      return false
    }
    let interval = 0
    if (!params?.stopTime && !params?.duration) {
      let v = distance(this._positions) / this._duration
      this._timeLine = this._positions.map((item, index, arr) => {
        if (index !== 0) {
          interval += distance([arr[index - 1], item]) / v
        }
        return Cesium.JulianDate.addSeconds(
          this._startTime,
          interval,
          new Cesium.JulianDate()
        )
      })
      this._pathPositions = []
      this._positionIndex = 0
    } else if (params?.stopTime && params?.duration) {
      this._duration += params.duration
      this._timeLine = this._timeLine.map((item) => {
        if (Cesium.JulianDate.greaterThan(item, params.stopTime)) {
          item = Cesium.JulianDate.addSeconds(
            item,
            params.duration,
            new Cesium.JulianDate()
          )
        }
        return item
      })
    }
    this._sampledPosition = new Cesium.SampledPositionProperty()
    this._sampledPosition.addSamples(
      this._timeLine,
      Transform.transformWGS84ArrayToCartesianArray(this._positions)
    )
    this._sampledPosition.forwardExtrapolationType =
      Cesium.ExtrapolationType.HOLD
    /// setInterpolationOptions
    if (this._options.interpolationType === 'Hermite') {
      this._sampledPosition.setInterpolationOptions({
        interpolationDegree: this._options.interpolationDegree || 2,
        interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
      })
    } else if (this._options.interpolationType === 'Linear') {
      this._sampledPosition.setInterpolationOptions({
        interpolationDegree: this._options.interpolationDegree || 1,
        interpolationAlgorithm: Cesium.LinearApproximation,
      })
    } else if (this._options.interpolationType === 'Lagrange') {
      this._sampledPosition.setInterpolationOptions({
        interpolationDegree: this._options.interpolationDegree || 5,
        interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
      })
    }
    this._velocityOrientation = new Cesium.VelocityOrientationProperty(
      this._sampledPosition
    )
    this._endTime = Cesium.JulianDate.addSeconds(
      this._timeLine[this._timeLine.length - 1],
      this._options.endDelayTime,
      new Cesium.JulianDate()
    )
  }

  /**
   * Adds Position
   * @param position
   * @param duration
   * @returns {Track}
   */
  addPosition(position, duration) {
    this._positions.push(Parse.parsePosition(position))
    this._duration += duration
    this._resetTimeLine({})
    return this
  }

  /**
   * Sets model
   * @param modelPath
   * @param style
   * @returns {Track}
   */
  setModel(modelPath, style) {
    this._delegate.model = {
      ...style,
      uri: modelPath,
      heightReference: this._options.clampToGround
        ? Cesium.HeightReference.CLAMP_TO_GROUND
        : Cesium.HeightReference.NONE,
    }
    return this
  }

  /**
   * Sets billboard
   * @param icon
   * @param style
   * @returns {Track}
   */
  setBillboard(icon, style) {
    this._delegate.billboard = {
      ...style,
      image: icon,
      heightReference: this._options.clampToGround
        ? Cesium.HeightReference.CLAMP_TO_GROUND
        : Cesium.HeightReference.NONE,
    }
    return this
  }

  /**
   * Sets label
   * @param text
   * @param style
   * @returns {Track}
   */
  setLabel(text, style) {
    this._delegate.label = {
      ...style,
      text: text,
      heightReference: this._options.clampToGround
        ? Cesium.HeightReference.CLAMP_TO_GROUND
        : Cesium.HeightReference.NONE,
    }
    return this
  }

  /**
   *
   * @param visible
   * @param style
   * @returns {Track}
   */
  setPath(visible, style = {}) {
    this._path.show = !!visible
    Util.merge(this._path.polyline, DEF_PATH_STYLE, style)
    return this
  }
}

export default Track
