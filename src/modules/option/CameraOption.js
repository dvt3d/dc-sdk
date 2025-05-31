/**
 * @Author : Caven Chen
 */
import { Cesium } from '../../libs'
import MouseMode from './MouseMode'

class CameraOption {
  constructor(viewer) {
    this._viewer = viewer
    this._mouseMode = 0
  }

  /**
   * @param min
   * @param max
   */
  setPitchRange(min, max) {
    let handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas)
    if (this._viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
      handler.setInputAction(
        (movement) => {
          handler.setInputAction((movement) => {
            let enableTilt = true
            let isUp = movement.endPosition.y < movement.startPosition.y
            if (
              isUp &&
              this._viewer.camera.pitch > Cesium.Math.toRadians(max)
            ) {
              enableTilt = false
            } else if (
              !isUp &&
              this._viewer.camera.pitch < Cesium.Math.toRadians(min)
            ) {
              enableTilt = false
            } else {
              enableTilt = true
            }
            this._viewer.scene.screenSpaceCameraController.enableTilt =
              enableTilt
          }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        },
        this._mouseMode === MouseMode.LEFT_MIDDLE
          ? Cesium.ScreenSpaceEventType.MIDDLE_DOWN
          : Cesium.ScreenSpaceEventType.RIGHT_DOWN
      )
      handler.setInputAction(
        (movement) => {
          this._viewer.scene.screenSpaceCameraController.enableTilt = true
          handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        },
        this._mouseMode === MouseMode.LEFT_MIDDLE
          ? Cesium.ScreenSpaceEventType.MIDDLE_UP
          : Cesium.ScreenSpaceEventType.RIGHT_UP
      )
    }
  }

  /**
   *
   * @param mouseMode
   */
  changeMouseMode(mouseMode) {
    this._mouseMode = mouseMode || MouseMode.LEFT_MIDDLE
    if (mouseMode === MouseMode.LEFT_MIDDLE) {
      this._viewer.scene.screenSpaceCameraController.tiltEventTypes = [
        Cesium.CameraEventType.MIDDLE_DRAG,
        Cesium.CameraEventType.PINCH,
        {
          eventType: Cesium.CameraEventType.LEFT_DRAG,
          modifier: Cesium.KeyboardEventModifier.CTRL,
        },
        {
          eventType: Cesium.CameraEventType.RIGHT_DRAG,
          modifier: Cesium.KeyboardEventModifier.CTRL,
        },
      ]
      this._viewer.scene.screenSpaceCameraController.zoomEventTypes = [
        Cesium.CameraEventType.RIGHT_DRAG,
        Cesium.CameraEventType.WHEEL,
        Cesium.CameraEventType.PINCH,
      ]
    } else if (mouseMode === MouseMode.LEFT_RIGHT) {
      this._viewer.scene.screenSpaceCameraController.tiltEventTypes = [
        Cesium.CameraEventType.RIGHT_DRAG,
        Cesium.CameraEventType.PINCH,
        {
          eventType: Cesium.CameraEventType.LEFT_DRAG,
          modifier: Cesium.KeyboardEventModifier.CTRL,
        },
        {
          eventType: Cesium.CameraEventType.RIGHT_DRAG,
          modifier: Cesium.KeyboardEventModifier.CTRL,
        },
      ]
      this._viewer.scene.screenSpaceCameraController.zoomEventTypes = [
        Cesium.CameraEventType.WHEEL,
        Cesium.CameraEventType.PINCH,
      ]
    }
  }
}

export default CameraOption
