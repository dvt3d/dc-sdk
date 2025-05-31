/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import { SceneEventType, TrackEventType } from '../event'
import State from '../state/State'
import TrackViewMode from './TrackViewMode'

class TrackController {
  constructor(viewer) {
    this._viewer = viewer
    this._cache = {}
    this._delegete = new Cesium.CustomDataSource('history-track-layer')
    this._viewer.dataSources.add(this._delegete)
    this._activedTrack = undefined
    this._viewOption = {}
    this._stopTime = undefined
    this._state = State.INITIALIZED
  }

  get delegate() {
    return this._delegete.entities
  }

  get state() {
    return this._state
  }

  /**
   * @private
   */
  _onPostRender() {
    Object.keys(this._cache).forEach((key) => {
      let track = this._cache[key]
      track.trackEvent &&
        track.trackEvent.fire(TrackEventType.POST_RENDER, {
          viewer: this._viewer,
          viewOption: this._viewOption,
        })
    })
    this._viewer.scene.requestRender()
  }

  /**
   *
   * @param track
   * @returns {TrackController}
   */
  addTrack(track) {
    if (
      track &&
      track.trackEvent &&
      // eslint-disable-next-line no-prototype-builtins
      !this._cache.hasOwnProperty(track.trackId)
    ) {
      track.trackEvent.fire(TrackEventType.ADD, this)
      this._cache[track.trackId] = track
    }
    return this
  }

  /**
   *
   * @param tracks
   * @returns {TrackController}
   */
  addTracks(tracks) {
    if (Array.isArray(tracks)) {
      tracks.forEach((item) => {
        this.addTrack(item)
      })
    }
    return this
  }

  /**
   * Returns a track
   * @param id
   * @returns {*|undefined}
   */
  getTrack(id) {
    let filters = this.getTracks().filter((item) => item.id === id)
    return filters && filters.length ? filters[0] : undefined
  }

  /**
   * Removes a track
   * @param track
   * @returns {TrackController}
   */
  removeTrack(track) {
    if (
      track &&
      track.trackEvent &&
      // eslint-disable-next-line no-prototype-builtins
      this._cache.hasOwnProperty(track.trackId)
    ) {
      track.trackEvent.fire(TrackEventType.REMOVE, this)
      delete this._cache[track.trackId]
    }
    return this
  }

  /**
   *
   * @returns {*[]}
   */
  getTracks() {
    let result = []
    Object.keys(this._cache).forEach((key) => {
      result.push(this._cache[key])
    })
    return result
  }

  /**
   * Starts play all path
   * @returns {TrackController}
   */
  play() {
    let now = Cesium.JulianDate.now()
    Object.keys(this._cache).forEach((key) => {
      let track = this._cache[key]
      track.startTime = now
      track.viewed = false
    })
    this._activedTrack = undefined
    this._stopTime = undefined
    this._viewer.off(SceneEventType.POST_RENDER, this._onPostRender, this)
    this._viewer.on(SceneEventType.POST_RENDER, this._onPostRender, this)
    this._state = State.PLAY
    return this
  }

  /**
   *
   */
  pause() {
    this._stopTime = Cesium.JulianDate.now()
    this._viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
    this._viewer.delegate.trackedEntity = undefined
    this._viewer.off(SceneEventType.POST_RENDER, this._onPostRender, this)
    this._state = State.PAUSE
    return this
  }

  /**
   *
   */
  restore() {
    if (this._state !== State.PAUSE) {
      return this
    }
    if (this._stopTime) {
      let now = Cesium.JulianDate.now()
      Object.keys(this._cache).forEach((key) => {
        let track = this._cache[key]
        track.trackEvent.fire(TrackEventType.RESET_TIME_LINE, {
          stopTime: this._stopTime,
          duration: Cesium.JulianDate.secondsDifference(now, this._stopTime),
        })
      })
    }
    this._viewer.off(SceneEventType.POST_RENDER, this._onPostRender, this)
    this._viewer.on(SceneEventType.POST_RENDER, this._onPostRender, this)
    this._state = State.PLAY
    return this
  }

  // /**
  //  *
  //  * @param speed
  //  * @returns {TrackController}
  //  */
  // changeSpeed(speed) {
  //   this._viewer.clock.multiplier = speed
  //   return this
  // }

  /**
   *
   * @param track
   * @param viewOption
   * @returns {TrackController}
   */
  viewTrack(track, viewOption = {}) {
    // eslint-disable-next-line no-prototype-builtins
    if (!this._cache.hasOwnProperty(track.trackId)) {
      throw new Error('TrackController: track does not added ')
    }
    this._viewOption = viewOption
    if (this._activedTrack) {
      this._activedTrack.viewed = false
    }
    track.viewed = true
    this._activedTrack = track
    if (viewOption.mode === TrackViewMode.FREE) {
      this._viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
      this._viewer.delegate.trackedEntity = undefined
    }
    return this
  }

  /**
   *
   * @param track
   * @returns {TrackController}
   */
  releaseTrack(track) {
    // eslint-disable-next-line no-prototype-builtins
    if (!this._cache.hasOwnProperty(track.trackId)) {
      throw new Error('TrackController: track does not added ')
    }
    if (track.viewed) {
      track.viewed = false
    }
    this._activedTrack = undefined
    this._viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
    this._viewer.delegate.trackedEntity = undefined
    return this
  }

  /**
   *
   * @returns {TrackController}
   */
  clear() {
    Object.keys(this._cache).forEach((key) => {
      this.removeTrack(this._cache[key])
    })
    this._activedTrack && (this._activedTrack.viewed = false)
    this._activedTrack = undefined
    this._viewer.off(SceneEventType.POST_RENDER, this._onPostRender, this)
    this._viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
    this._viewer.delegate.trackedEntity = undefined
    return this
  }
}

export default TrackController
