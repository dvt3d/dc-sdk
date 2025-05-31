/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'

class KeyboardRoaming {
  constructor(viewer) {
    this._viewer = viewer
    this._enable = false
    this._moveRate = 100.0
    this._rotateRate = 0.01
    this._flags = {
      moveForward: false,
      moveBackward: false,
      moveUp: false,
      moveDown: false,
      moveLeft: false,
      moveRight: false,
      turnLeft: false,
      turnRight: false,
    }
  }

  set enable(enable) {
    if (this._enable === enable) {
      return
    }
    if (this._viewer.scene.mode !== Cesium.SceneMode.SCENE3D) {
      return
    }
    this._enable = enable
    this._enable ? this._bindEvent() : this._unbindEvent()
  }

  get enable() {
    return this._enable
  }

  set moveRate(moveRate) {
    this._moveRate = moveRate
  }

  get moveRate() {
    return this._moveRate
  }

  set rotateRate(rotateRate) {
    this._rotateRate = rotateRate
  }

  get rotateRate() {
    return this._rotateRate
  }

  /**
   *
   * @private
   */
  _bindEvent() {
    let canvas = this._viewer.scene.canvas
    canvas.setAttribute('tabindex', '0')
    canvas.addEventListener('click', this._onClick.bind(this), false)
    this._viewer.clock.onTick.addEventListener(this._onTick, this)
    document.addEventListener('keydown', this._onKeydown.bind(this), false)
    document.addEventListener('keyup', this._onKeyup.bind(this), false)
  }

  /**
   *
   * @private
   */
  _unbindEvent() {
    Object.keys(this._flags).forEach((key) => {
      this._flags[key] = false
    })
    let canvas = this._viewer.scene.canvas
    canvas.removeAttribute('tabindex')
    canvas.removeEventListener('click', this._onClick, false)
    this._viewer.clock.onTick.removeEventListener(this._onTick, this)
    document.removeEventListener('keydown', this._onKeydown, false)
    document.removeEventListener('keyup', this._onKeyup, false)
  }

  /**
   *
   * @param e
   * @returns {undefined}
   * @private
   */
  _getFlagForKeyCode(e) {
    let flag = undefined
    switch (e.keyCode) {
      case 'W'.charCodeAt(0):
      case 38:
        if (e.shiftKey) {
          flag = 'moveUp'
        } else {
          flag = 'moveForward'
        }
        break
      case 'S'.charCodeAt(0):
      case 40:
        if (e.shiftKey) {
          flag = 'moveDown'
        } else {
          flag = 'moveBackward'
        }
        break
      case 'A'.charCodeAt(0):
      case 37:
        flag = 'moveLeft'
        break
      case 'D'.charCodeAt(0):
      case 39:
        flag = 'moveRight'
        break
      case 'Q'.charCodeAt(0):
        flag = 'turnLeft'
        break
      case 'E'.charCodeAt(0):
        flag = 'turnRight'
        break
      default:
        break
    }
    return flag
  }

  /**
   *
   * @private
   */
  _onClick() {
    let canvas = this._viewer.scene.canvas
    canvas.focus()
  }

  /**
   *
   * @param e
   * @private
   */
  _onKeydown(e) {
    let flag = this._getFlagForKeyCode(e)
    if (flag) {
      this._flags[flag] = true
    }
  }

  /**
   *
   * @param e
   * @private
   */
  _onKeyup(e) {
    Object.keys(this._flags).forEach((key) => {
      this._flags[key] = false
    })
  }

  /**
   *
   * @private
   */
  _onTick() {
    let camera = this._viewer.scene.camera
    let cameraHeight =
      this._viewer.scene.globe.ellipsoid.cartesianToCartographic(
        camera.position
      ).height
    let moveRate = cameraHeight / this._moveRate
    let axis = Cesium.Cartesian3.clone(camera.position, new Cesium.Cartesian3())
    this._flags.moveForward && camera.moveForward(moveRate)
    this._flags.moveBackward && camera.moveBackward(moveRate)
    this._flags.moveUp && camera.moveUp(moveRate)
    this._flags.moveDown && camera.moveDown(moveRate)
    this._flags.moveLeft && camera.moveLeft(moveRate)
    this._flags.moveRight && camera.moveRight(moveRate)
    this._flags.turnLeft && camera.rotate(axis, -this._rotateRate)
    this._flags.turnRight && camera.rotate(axis, this._rotateRate)
  }
}

export default KeyboardRoaming
