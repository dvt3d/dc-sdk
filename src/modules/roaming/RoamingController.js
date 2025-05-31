/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import { SceneEventType, PathEventType } from '../event'

class RoamingController {
  constructor(viewer) {
    this._viewer = viewer
    this._viewOption = {}
    this._cache = {}
    this._activedPath = undefined
  }

  /**
   *
   * @returns {boolean}
   * @private
   */
  _onPostRender() {
    if (!this._activedPath) {
      return false
    }
    this._activedPath.pathEvent &&
      this._activedPath.pathEvent.fire(PathEventType.POST_RENDER, {
        viewer: this._viewer,
        viewOption: this._viewOption,
      })
  }

  /**
   *
   * @param path
   * @returns {RoamingController}
   */
  addPath(path) {
    if (path && !this._cache.hasOwnProperty(path.pathId)) {
      path.pathEvent.fire(PathEventType.ADD)
      this._cache[path.pathId] = path
    }
    return this
  }

  /**
   *
   * @param paths
   * @returns {RoamingController}
   */
  addPaths(paths) {
    if (Array.isArray(paths)) {
      paths.forEach((item) => {
        this.addPath(item)
      })
    }
    return this
  }

  /**
   *
   * @param path
   * @returns {RoamingController}
   */
  removePath(path) {
    if (path && this._cache.hasOwnProperty(path.pathId)) {
      delete this._cache[path.pathId]
      path.pathEvent.fire(PathEventType.REMOVE)
    }
    return this
  }

  /**
   *
   * @param id
   * @returns {*|undefined}
   */
  getPath(id) {
    let filters = this.getPaths().filter((item) => item.id === id)
    return filters && filters.length ? filters[0] : undefined
  }

  /**
   *
   * @returns {*[]}
   */
  getPaths() {
    let result = []
    Object.keys(this._cache).forEach((key) => {
      result.push(this._cache[key])
    })
    return result
  }

  /**
   *
   * @param path
   * @param viewOption
   * @returns {RoamingController}
   */
  activate(path, viewOption = {}) {
    if (
      !path ||
      path?.pathId === this._activedPath?.pathId ||
      !this._cache.hasOwnProperty(path?.pathId)
    ) {
      return this
    }
    this._viewOption = viewOption
    this._activedPath && this.deactivate()
    this._activedPath = path
    this._activedPath.pathEvent &&
      this._activedPath.pathEvent.fire(PathEventType.RESET_TIME_LINE)
    this._viewer.on(SceneEventType.POST_RENDER, this._onPostRender, this)
    return this
  }

  /**
   *
   * @returns {RoamingController}
   */
  deactivate() {
    this._activedPath && (this._activedPath.actived = false)
    this._activedPath = undefined
    this._viewer.off(SceneEventType.POST_RENDER, this._onPostRender, this)
    this._viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
    return this
  }

  /**
   *
   * @returns {RoamingController}
   */
  clear() {
    this._cache = {}
    this._activedPath && (this._activedPath.actived = false)
    this._activedPath = undefined
    this._viewer.off(SceneEventType.POST_RENDER, this._onPostRender, this)
    this._viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
    return this
  }
}

export default RoamingController
