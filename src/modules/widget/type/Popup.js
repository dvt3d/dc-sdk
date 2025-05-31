/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Widget from '../Widget'
import State from '../../state/State'
import { DomUtil } from '../../utils'

class Popup extends Widget {
  constructor() {
    super()
    this._wrapper = DomUtil.create('div', 'widget popup')
    this._config = { customClass: '' }
    this._position = undefined
    this._state = State.INITIALIZED
  }

  get type() {
    return Widget.getWidgetType('popup')
  }

  set config(config) {
    this._config = config
    config.customClass && this._setCustomClass()
  }

  /**
   * binds event
   * @private
   */
  _bindEvent() {
    if (this._viewer && this._wrapper) {
      let self = this
      let scene = this._viewer.scene
      scene.postRender.addEventListener(() => {
        if (
          self._position &&
          self._enable &&
          self._updateWindowCoord &&
          self._wrapper.style.visibility === 'visible'
        ) {
          let windowCoord = Cesium.SceneTransforms.worldToWindowCoordinates(
            scene,
            self._position
          )
          windowCoord && self._updateWindowCoord(windowCoord)
        }
      })
    }
  }

  /**
   *
   * @private
   */
  _mountContent() {
    this._wrapper.style.visibility = 'hidden'
  }

  /**
   *
   * @private
   */
  _installHook() {
    this.enable = true
    this._bindEvent()
    const self = this
    Object.defineProperty(this._viewer, 'popup', {
      get() {
        return self
      },
    })
  }

  /**
   *
   * @param windowCoord
   * @private
   */
  _updateWindowCoord(windowCoord) {
    let x = windowCoord.x - this._wrapper.offsetWidth / 2
    let y = windowCoord.y - this._wrapper.offsetHeight

    if (this._config.position === 'topleft') {
      x = windowCoord.x - this._wrapper.offsetWidth
      y = windowCoord.y - this._wrapper.offsetHeight
    } else if (this._config.position === 'topright') {
      x = windowCoord.x
      y = windowCoord.y - this._wrapper.offsetHeight
    } else if (this._config.position === 'bottomleft') {
      x = windowCoord.x - this._wrapper.offsetWidth
      y = windowCoord.y
    } else if (this._config.position === 'bottomright') {
      x = windowCoord.x
      y = windowCoord.y
    }
    this._wrapper.style.cssText = `
    visibility:visible;
    z-index:1;
    transform:translate3d(${Math.round(x)}px,${Math.round(y)}px, 0);
    `
  }

  /**
   *
   * @private
   */
  _setCustomClass() {
    DomUtil.setClass(this._wrapper, `widget popup ${this._config.customClass}`)
  }

  /**
   * Setting  wrapper
   * @param wrapper
   * @returns {Widget}
   */
  setWrapper(wrapper) {
    if (wrapper && wrapper instanceof Element) {
      this._wrapper = wrapper
      DomUtil.addClass(this._wrapper, 'widget popup')
    }
    return this
  }

  /**
   *
   * Setting widget position
   * @param {*} position
   *
   */
  setPosition(position) {
    this._position = position
    this._wrapper &&
      (this._wrapper.style.cssText = `
    visibility:visible;
    `)
    return this
  }

  /**
   *
   * @param {*} position
   * @param {*} content
   */
  showAt(position, content) {
    this.setPosition(position).setContent(content)
    return this
  }
}

Widget.registerType('popup')

export default Popup
