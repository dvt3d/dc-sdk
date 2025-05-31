/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import { DomUtil } from '../../utils'
import { SceneEventType } from '../../event'
import Widget from '../Widget'

const geodesic = new Cesium.EllipsoidGeodesic()

const BASE = [1, 2, 3, 5]

const DIS = [
  ...BASE,
  ...BASE.map((item) => item * 10),
  ...BASE.map((item) => item * 100),
  ...BASE.map((item) => item * 1000),
  ...BASE.map((item) => item * 10000),
  ...BASE.map((item) => item * 100000),
  ...BASE.map((item) => item * 1000000),
]

class DistanceLegend extends Widget {
  constructor() {
    super()
    this._wrapper = DomUtil.create('div', 'widget distance-legend')
    this._labelEl = undefined
    this._scaleBarEl = undefined
    this._lastUpdate = Cesium.getTimestamp()
    this._state = State.INITIALIZED
  }

  get type() {
    return Widget.getWidgetType('distance_legend')
  }

  /**
   *
   * @private
   */
  _installHook() {
    const self = this
    Object.defineProperty(this._viewer, 'distanceLegend', {
      get() {
        return self
      },
    })
  }

  /**
   *
   * @private
   */
  _bindEvent() {
    this._viewer.on(SceneEventType.POST_RENDER, this._updateContent, this)
  }

  /**
   *
   * @private
   */
  _unbindEvent() {
    this._viewer.off(SceneEventType.POST_RENDER, this._updateContent, this)
  }

  /**
   *
   * @param scene
   * @param time
   * @returns
   * @private
   */
  _updateContent(scene, time) {
    let now = Cesium.getTimestamp()
    if (now < this._lastUpdate + 250) {
      return
    }
    if (!this._labelEl || !this._scaleBarEl) {
      return
    }
    this._lastUpdate = now
    let width = scene.canvas.width
    let height = scene.canvas.height
    let left = scene.camera.getPickRay(
      new Cesium.Cartesian2((width / 2) | 0, height - 1)
    )
    let right = scene.camera.getPickRay(
      new Cesium.Cartesian2((1 + width / 2) | 0, height - 1)
    )
    let leftPosition = scene.globe.pick(left, scene)
    let rightPosition = scene.globe.pick(right, scene)
    if (!leftPosition || !rightPosition) {
      return
    }
    geodesic.setEndPoints(
      scene.globe.ellipsoid.cartesianToCartographic(leftPosition),
      scene.globe.ellipsoid.cartesianToCartographic(rightPosition)
    )
    let pixelDistance = geodesic.surfaceDistance
    let maxBarWidth = 100
    let distance = 0
    for (let i = DIS.length - 1; i >= 0; --i) {
      if (DIS[i] / pixelDistance < maxBarWidth) {
        distance = DIS[i]
        break
      }
    }
    if (distance) {
      this._wrapper.style.visibility = 'visible'
      this._labelEl.innerHTML =
        distance >= 1000 ? `${distance / 1000} km` : `${distance} m`
      let barWidth = (distance / pixelDistance) | 0
      this._scaleBarEl.style.cssText = `width: ${barWidth}px; left: ${
        (125 - barWidth) / 2
      }px;`
    }
  }

  /**
   *
   * @private
   */
  _mountContent() {
    this._labelEl = DomUtil.create('div', 'label', this._wrapper)
    this._scaleBarEl = DomUtil.create('div', 'scale-bar', this._wrapper)
    this._wrapper.style.visibility = 'hidden'
    this._ready = true
  }
}

Widget.registerType('distance_legend')

export default DistanceLegend
