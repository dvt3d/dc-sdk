/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import Icons from '../../icons'
import { DomUtil } from '../../utils'
import { SceneEventType } from '../../event'
import Widget from '../Widget'

class Compass extends Widget {
  constructor() {
    super()
    this._wrapper = DomUtil.create('div', `widget compass`)
    this._compassRectangle = undefined
    this._outRing = undefined
    this._gyro = undefined
    this._rotation_marker = undefined
    this._orbitCursorAngle = 0
    this._orbitCursorOpacity = 0.0
    this._orbitLastTimestamp = 0
    this._orbitFrame = undefined
    this._orbitIsLook = false
    this._rotateInitialCursorAngle = undefined
    this._rotateFrame = undefined
    this._mouseMoveHandle = undefined
    this._mouseUpHandle = undefined
    this._state = State.INITIALIZED
  }

  get type() {
    return Widget.getWidgetType('compass')
  }

  /**
   *
   * @private
   */
  _installHook() {
    const self = this
    Object.defineProperty(this._viewer, 'compass', {
      get() {
        return self
      },
    })
    this._wrapper.onmousedown = (e) => {
      this._handleMouseDown(e)
    }
    this._wrapper.ondblclick = (e) => {
      this._handleDoubleClick(e)
    }
  }

  /**
   *
   * @private
   */
  _bindEvent() {
    this._viewer.on(SceneEventType.POST_RENDER, this._postRenderHandler, this)
  }

  /**
   *
   * @private
   */
  _unbindEvent() {
    this._viewer.off(SceneEventType.POST_RENDER, this._postRenderHandler, this)
  }

  /**
   *
   * @private
   */
  _postRenderHandler() {
    let heading = this._viewer.camera.heading
    this._outRing &&
      (this._outRing.style.cssText = `
      transform : rotate(-${heading}rad);
      -webkit-transform : rotate(-${heading}rad);
      `)
  }

  /**
   *
   * @private
   */
  _mountContent() {
    DomUtil.create('div', 'out-ring-bg', this._wrapper)
    this._outRing = DomUtil.parseDom(Icons.compass_outer, true, 'out-ring')
    this._wrapper.appendChild(this._outRing)
    this._gyro = DomUtil.parseDom(Icons.compass_inner, true, 'gyro')
    this._wrapper.appendChild(this._gyro)
    this._rotation_marker = DomUtil.parseDom(
      Icons.compass_rotation_marker,
      true,
      'rotation_marker'
    )
    this._wrapper.appendChild(this._rotation_marker)
    this._rotation_marker.style.visibility = 'hidden'
    this._ready = true
  }

  _handleMouseDown(e) {
    let scene = this._viewer.scene
    if (scene.mode === Cesium.SceneMode.MORPHING) {
      return true
    }
    this._compassRectangle = e.currentTarget.getBoundingClientRect()
    let maxDistance = this._compassRectangle.width / 2.0
    let vector = this._getVector(e)
    let distanceFraction = Cesium.Cartesian2.magnitude(vector) / maxDistance
    if (distanceFraction < 50 / 145) {
      this._orbit(vector)
    } else if (distanceFraction < 1.0) {
      this._rotate(vector)
    } else {
      return true
    }
  }

  _handleDoubleClick() {
    let scene = this._viewer.scene
    let camera = scene.camera
    let sscc = scene.screenSpaceCameraController
    if (scene.mode === Cesium.SceneMode.MORPHING || !sscc.enableInputs) {
      return true
    }
    if (
      scene.mode === Cesium.SceneMode.COLUMBUS_VIEW &&
      !sscc.enableTranslate
    ) {
      return
    }
    if (
      scene.mode === Cesium.SceneMode.SCENE3D ||
      scene.mode === Cesium.SceneMode.COLUMBUS_VIEW
    ) {
      if (!sscc.enableLook) {
        return
      }
      if (scene.mode === Cesium.SceneMode.SCENE3D) {
        if (!sscc.enableRotate) {
          return
        }
      }
    }
    let center = this._getCameraFocus(true)
    if (!center) {
      return
    }
    let cameraPosition = scene.globe.ellipsoid.cartographicToCartesian(
      camera.positionCartographic
    )
    let surfaceNormal = scene.globe.ellipsoid.geodeticSurfaceNormal(center)
    let focusBoundingSphere = new Cesium.BoundingSphere(center, 0)
    camera.flyToBoundingSphere(focusBoundingSphere, {
      offset: new Cesium.HeadingPitchRange(
        0,
        Cesium.Math.PI_OVER_TWO -
          Cesium.Cartesian3.angleBetween(surfaceNormal, camera.directionWC),
        Cesium.Cartesian3.distance(cameraPosition, center)
      ),
      duration: 1.5,
    })
  }

  _getCameraFocus(inWorldCoordinates) {
    let result = new Cesium.Cartesian3()
    let scene = this._viewer.scene
    let camera = scene.camera
    if (scene.mode === Cesium.SceneMode.MORPHING) {
      return undefined
    }
    if (this._viewer.delegate.trackedEntity) {
      result = this._viewer.delegate.trackedEntity.position.getValue(
        this._viewer.clock.currentTime
      )
    } else {
      let rayScratch = new Cesium.Ray()
      rayScratch.origin = camera.positionWC
      rayScratch.direction = camera.directionWC
      result = scene.globe.pick(rayScratch, scene)
    }
    if (!result) {
      return undefined
    }
    if (
      scene.mode === Cesium.SceneMode.SCENE2D ||
      scene.mode === Cesium.SceneMode.COLUMBUS_VIEW
    ) {
      result = camera.worldToCameraCoordinatesPoint(result)
      let unprojectedScratch = new Cesium.Cartographic()
      if (inWorldCoordinates) {
        result = scene.globe.ellipsoid.cartographicToCartesian(
          scene.mapProjection.unproject(result, unprojectedScratch)
        )
      }
    } else {
      if (!inWorldCoordinates) {
        result = camera.worldToCameraCoordinatesPoint(result)
      }
    }
    return result
  }

  _orbit(vector) {
    let scene = this._viewer.scene
    let sscc = scene.screenSpaceCameraController
    let camera = scene.camera
    if (scene.mode === Cesium.SceneMode.MORPHING || !sscc.enableInputs) {
      return
    }
    switch (scene.mode) {
      case Cesium.SceneMode.COLUMBUS_VIEW:
        if (sscc.enableLook) {
          break
        }
        if (!sscc.enableTranslate || !sscc.enableTilt) {
          return
        }
        break
      case Cesium.SceneMode.SCENE3D:
        if (sscc.enableLook) {
          break
        }
        if (!sscc.enableTilt || !sscc.enableRotate) {
          return
        }
        break
      case Cesium.SceneMode.SCENE2D:
        if (!sscc.enableTranslate) {
          return
        }
        break
    }

    this._mouseMoveHandle = (e) => {
      this._orbitMouseMoveFunction(e)
    }
    this._mouseUpHandle = () => {
      this._orbitMouseUpFunction()
    }

    document.removeEventListener('mousemove', this._mouseMoveHandle, false)
    document.removeEventListener('mouseup', this._mouseUpHandle, false)

    this._orbitLastTimestamp = Cesium.getTimestamp()

    if (this._viewer.delegate.trackedEntity) {
      this._orbitFrame = undefined
      this._orbitIsLook = false
    } else {
      let center = this._getCameraFocus(true)

      if (!center) {
        this._orbitFrame = Cesium.Transforms.eastNorthUpToFixedFrame(
          camera.positionWC,
          scene.globe.ellipsoid
        )
        this._orbitIsLook = true
      } else {
        this._orbitFrame = Cesium.Transforms.eastNorthUpToFixedFrame(
          center,
          scene.globe.ellipsoid
        )
        this._orbitIsLook = false
      }
    }

    this._rotation_marker.style.visibility = 'visible'
    this._gyro.className += ' gyro-active'
    document.addEventListener('mousemove', this._mouseMoveHandle, false)
    document.addEventListener('mouseup', this._mouseUpHandle, false)
    this._viewer.clock.onTick.addEventListener(this._orbitTickFunction, this)
    this._updateAngleAndOpacity(vector, this._compassRectangle.width)
  }

  _orbitTickFunction() {
    let scene = this._viewer.scene
    let camera = this._viewer.camera
    let timestamp = Cesium.getTimestamp()
    let deltaT = timestamp - this._orbitLastTimestamp
    let rate = ((this._orbitCursorOpacity - 0.5) * 2.5) / 1000
    let distance = deltaT * rate
    let angle = this._orbitCursorAngle + Cesium.Math.PI_OVER_TWO
    let x = Math.cos(angle) * distance
    let y = Math.sin(angle) * distance
    let oldTransform

    if (this._orbitFrame) {
      oldTransform = Cesium.Matrix4.clone(camera.transform)
      camera.lookAtTransform(this._orbitFrame)
    }

    if (scene.mode === Cesium.SceneMode.SCENE2D) {
      camera.move(
        new Cesium.Cartesian3(x, y, 0),
        (Math.max(scene.canvas.clientWidth, scene.canvas.clientHeight) / 100) *
          camera.positionCartographic.height *
          distance
      )
    } else {
      if (this._orbitIsLook) {
        camera.look(Cesium.Cartesian3.UNIT_Z, -x)
        camera.look(camera.right, -y)
      } else {
        camera.rotateLeft(x)
        camera.rotateUp(y)
      }
    }
    if (this._orbitFrame && oldTransform) {
      camera.lookAtTransform(oldTransform)
    }
    this._orbitLastTimestamp = timestamp
  }

  _updateAngleAndOpacity(vector, compassWidth) {
    let angle = Math.atan2(-vector.y, vector.x)
    this._orbitCursorAngle = Cesium.Math.zeroToTwoPi(
      angle - Cesium.Math.PI_OVER_TWO
    )
    let distance = Cesium.Cartesian2.magnitude(vector)
    let maxDistance = compassWidth / 2.0
    let distanceFraction = Math.min(distance / maxDistance, 1.0)
    this._orbitCursorOpacity = 0.5 * distanceFraction * distanceFraction + 0.5
    this._rotation_marker.style.cssText = `
      transform: rotate(-${this._orbitCursorAngle}rad);
      opacity: ${this._orbitCursorOpacity}`
  }

  _orbitMouseMoveFunction(e) {
    this._updateAngleAndOpacity(
      this._getVector(e),
      this._compassRectangle.width
    )
  }

  _orbitMouseUpFunction() {
    document.removeEventListener('mousemove', this._mouseMoveHandle, false)
    document.removeEventListener('mouseup', this._mouseUpHandle, false)
    this._viewer.clock.onTick.removeEventListener(this._orbitTickFunction, this)
    this._mouseMoveHandle = undefined
    this._mouseUpHandle = undefined
    this._rotation_marker.style.visibility = 'hidden'
    this._gyro.className = this._gyro.className.replace(' gyro-active', '')
  }

  _rotate(vector) {
    let scene = this._viewer.scene
    let camera = scene.camera
    let sscc = scene.screenSpaceCameraController
    if (
      scene.mode === Cesium.SceneMode.MORPHING ||
      scene.mode === Cesium.SceneMode.SCENE2D ||
      !sscc.enableInputs
    ) {
      return
    }
    if (
      !sscc.enableLook &&
      (scene.mode === Cesium.SceneMode.COLUMBUS_VIEW ||
        (scene.mode === Cesium.SceneMode.SCENE3D && !sscc.enableRotate))
    ) {
      return
    }
    this._mouseMoveHandle = (e) => {
      this._rotateMouseMoveFunction(e)
    }
    this._mouseUpHandle = () => {
      this._rotateMouseUpFunction()
    }
    document.removeEventListener('mousemove', this._mouseMoveHandle, false)
    document.removeEventListener('mouseup', this._mouseUpHandle, false)
    this._rotateInitialCursorAngle = Math.atan2(-vector.y, vector.x)
    if (this._viewer.delegate.trackedEntity) {
      this._rotateFrame = undefined
    } else {
      let center = this._getCameraFocus(true)
      if (
        !center ||
        (scene.mode === Cesium.SceneMode.COLUMBUS_VIEW &&
          !sscc.enableLook &&
          !sscc.enableTranslate)
      ) {
        this._rotateFrame = Cesium.Transforms.eastNorthUpToFixedFrame(
          camera.positionWC,
          scene.globe.ellipsoid
        )
      } else {
        this._rotateFrame = Cesium.Transforms.eastNorthUpToFixedFrame(
          center,
          scene.globe.ellipsoid
        )
      }
    }
    let oldTransform
    if (this._rotateFrame) {
      oldTransform = Cesium.Matrix4.clone(camera.transform)
      camera.lookAtTransform(this._rotateFrame)
    }
    this._rotateInitialCameraAngle = -camera.heading
    if (this._rotateFrame && oldTransform) {
      camera.lookAtTransform(oldTransform)
    }
    document.addEventListener('mousemove', this._mouseMoveHandle, false)
    document.addEventListener('mouseup', this._mouseUpHandle, false)
  }

  _rotateMouseMoveFunction(e) {
    let camera = this._viewer.camera
    let vector = this._getVector(e)
    let angle = Math.atan2(-vector.y, vector.x)
    let angleDifference = angle - this._rotateInitialCursorAngle
    let newCameraAngle = Cesium.Math.zeroToTwoPi(
      this._rotateInitialCameraAngle - angleDifference
    )
    let oldTransform
    if (this._rotateFrame) {
      oldTransform = Cesium.Matrix4.clone(camera.transform)
      camera.lookAtTransform(this._rotateFrame)
    }
    let currentCameraAngle = -camera.heading
    camera.rotateRight(newCameraAngle - currentCameraAngle)
    if (this._rotateFrame && oldTransform) {
      camera.lookAtTransform(oldTransform)
    }
  }

  _rotateMouseUpFunction() {
    document.removeEventListener('mousemove', this._mouseMoveHandle, false)
    document.removeEventListener('mouseup', this._mouseUpHandle, false)
    this._mouseMoveHandle = undefined
    this._mouseUpHandle = undefined
  }

  _getVector(e) {
    let compassRectangle = this._compassRectangle
    let center = new Cesium.Cartesian2(
      (compassRectangle.right - compassRectangle.left) / 2.0,
      (compassRectangle.bottom - compassRectangle.top) / 2.0
    )
    let clickLocation = new Cesium.Cartesian2(
      e.clientX - compassRectangle.left,
      e.clientY - compassRectangle.top
    )
    let vector = new Cesium.Cartesian2()
    Cesium.Cartesian2.subtract(clickLocation, center, vector)
    return vector
  }
}

Widget.registerType('compass')

export default Compass
