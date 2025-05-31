/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Widget from '../Widget'
import State from '../../state/State'
import Icons from '../../icons'
import { DomUtil } from '../../utils'

class ZoomController extends Widget {
  constructor() {
    super()
    this._wrapper = DomUtil.create('div', 'widget zoom-controller')
    this._zoomInEl = undefined
    this._zoomOutEl = undefined
    this._refreshEl = undefined
    this._state = State.INITIALIZED
  }

  get type() {
    return Widget.getWidgetType('zoom_controller')
  }

  /**
   *
   * @param scene
   * @returns {Cartesian3}
   * @private
   */
  _getCameraFocus(scene) {
    const ray = new Cesium.Ray(
      scene.camera.positionWC,
      scene.camera.directionWC
    )
    const intersections = Cesium.IntersectionTests.rayEllipsoid(
      ray,
      Cesium.Ellipsoid.WGS84
    )
    if (intersections) {
      return Cesium.Ray.getPoint(ray, intersections.start)
    }
    // Camera direction is not pointing at the globe, so use the ellipsoid horizon point as
    // the focal point.
    return Cesium.IntersectionTests.grazingAltitudeLocation(
      ray,
      Cesium.Ellipsoid.WGS84
    )
  }

  /**
   *
   * @param camera
   * @param focus
   * @param scalar
   * @returns {Cartesian3}
   * @private
   */
  _getCameraPosition(camera, focus, scalar) {
    const cartesian3Scratch = new Cesium.Cartesian3()
    let direction = Cesium.Cartesian3.subtract(
      focus,
      camera.position,
      cartesian3Scratch
    )
    let movementVector = Cesium.Cartesian3.multiplyByScalar(
      direction,
      scalar,
      cartesian3Scratch
    )
    return Cesium.Cartesian3.add(
      camera.position,
      movementVector,
      cartesian3Scratch
    )
  }

  /**
   *
   * @returns {boolean}
   * @private
   */
  _zoomIn() {
    let scene = this._viewer.scene
    let camera = scene.camera
    let sscc = scene.screenSpaceCameraController
    if (
      scene.mode === Cesium.SceneMode.MORPHING ||
      !sscc.enableInputs ||
      scene.mode === Cesium.SceneMode.COLUMBUS_VIEW
    ) {
      return true
    } else if (scene.mode === Cesium.SceneMode.SCENE2D) {
      camera.zoomIn(camera.positionCartographic.height * 0.5)
    } else if (scene.mode === Cesium.SceneMode.SCENE3D) {
      let focus = this._getCameraFocus(scene)
      let cameraPosition = this._getCameraPosition(camera, focus, 1 / 2)
      camera.flyTo({
        destination: cameraPosition,
        orientation: {
          heading: camera.heading,
          pitch: camera.pitch,
          roll: camera.roll,
        },
        duration: 0.5,
        convert: false,
      })
    }
  }

  /**
   *
   * @private
   */
  _refresh() {
    this._viewer.camera.flyHome(1.5)
  }

  /**
   *
   * @returns {boolean}
   * @private
   */
  _zoomOut() {
    let scene = this._viewer.scene
    let camera = scene.camera
    let sscc = scene.screenSpaceCameraController
    if (
      scene.mode === Cesium.SceneMode.MORPHING ||
      !sscc.enableInputs ||
      scene.mode === Cesium.SceneMode.COLUMBUS_VIEW
    ) {
      return true
    } else if (scene.mode === Cesium.SceneMode.SCENE2D) {
      camera.zoomOut(camera.positionCartographic.height)
    } else if (scene.mode === Cesium.SceneMode.SCENE3D) {
      let focus = this._getCameraFocus(scene)
      let cameraPosition = this._getCameraPosition(camera, focus, -1)
      camera.flyTo({
        destination: cameraPosition,
        orientation: {
          heading: camera.heading,
          pitch: camera.pitch,
          roll: camera.roll,
        },
        duration: 0.5,
        convert: false,
      })
    }
  }

  /**
   *
   * @private
   */
  _installHook() {
    const self = this
    Object.defineProperty(this._viewer, 'zoomController', {
      get() {
        return self
      },
    })
  }

  /**
   *
   * @private
   */
  _mountContent() {
    this._zoomInEl = DomUtil.parseDom(Icons.increase, true, 'zoom-in')
    this._refreshEl = DomUtil.parseDom(Icons.refresh, true, 'refresh')
    this._zoomOutEl = DomUtil.parseDom(Icons.decrease, true, 'zoom-out')
    this._wrapper.appendChild(this._zoomInEl)
    this._wrapper.appendChild(this._refreshEl)
    this._wrapper.appendChild(this._zoomOutEl)
    let self = this
    this._zoomInEl.onclick = () => {
      self._zoomIn()
    }
    this._refreshEl.onclick = () => {
      self._refresh()
    }
    this._zoomOutEl.onclick = () => {
      self._zoomOut()
    }
    this._ready = true
  }
}

Widget.registerType('zoom_controller')

export default ZoomController
