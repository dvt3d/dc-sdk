/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import { Util, DomUtil } from '../../utils'
import { SceneEventType } from '../../event'
import Widget from '../Widget'

class HawkeyeMap extends Widget {
  constructor() {
    super()
    this._wrapper = DomUtil.create('div', 'widget hawkeye-map', null)
    this._wrapper.setAttribute('id', Util.uuid())
    this._map = undefined
    this._state = State.INITIALIZED
  }

  get type() {
    return Widget.getWidgetType('hawkeye_map')
  }

  /**
   *
   * @private
   */
  _mountContent() {
    let map = new Cesium.CesiumWidget(this._wrapper, {
      sceneMode: Cesium.SceneMode.SCENE2D,
      creditContainer: document.createElement('div'),
      creditViewport: document.createElement('div'),
      baseLayer: false,
    })
    map.imageryLayers.removeAll()
    map.canvas.parentNode.className = 'viewer-canvas'
    Util.merge(map.scene.screenSpaceCameraController, {
      enableRotate: false,
      enableTranslate: false,
      enableZoom: false,
      enableTilt: false,
      enableLook: false,
      maximumZoomDistance: 40489014.0,
    })
    this._map = map
    this._ready = true
  }

  /**
   *
   * @private
   */
  _bindEvent() {
    this._viewer.on(SceneEventType.CAMERA_CHANGED, this._syncMap, this)
  }

  /**
   *
   * @private
   */
  _unbindEvent() {
    this._viewer.off(SceneEventType.CAMERA_CHANGED, this._syncMap, this)
  }

  /**
   *
   * @private
   */
  _installHook() {
    const self = this
    Object.defineProperty(this._viewer, 'hawkeyeMap', {
      get() {
        return self
      },
    })
    this._viewer.camera.percentageChanged = 0.01
  }

  /**
   *
   * @returns {boolean}
   * @private
   */
  _syncMap() {
    let viewCenter = new Cesium.Cartesian2(
      Math.floor(this._viewer.canvas.clientWidth / 2),
      Math.floor(this._viewer.canvas.clientHeight / 2)
    )
    let worldPosition = this._viewer.scene.camera.pickEllipsoid(viewCenter)
    if (!worldPosition) {
      return false
    }
    let distance = Cesium.Cartesian3.distance(
      worldPosition,
      this._viewer.scene.camera.positionWC
    )
    this._map.scene.camera.lookAt(
      worldPosition,
      new Cesium.Cartesian3(0.0, 0.0, distance)
    )
  }

  /**
   *
   * @param baseLayer
   * @returns {HawkeyeMap}
   */
  addBaseLayer(baseLayer) {
    if (!this._map || !this._enable) {
      return this
    }
    if (baseLayer) {
      this._map.imageryLayers.removeAll()
      if (!Array.isArray(baseLayer)) {
        baseLayer = [baseLayer]
      }
      baseLayer.forEach((item) => {
        this._map.imageryLayers.add(
          Cesium.ImageryLayer.fromProviderAsync(item, {})
        )
      })
    }
    return this
  }
}

Widget.registerType('hawkeye_map')

export default HawkeyeMap
