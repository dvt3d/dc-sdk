/**
 * @Author : Caven Chen
 */

import Widget from '../Widget'
import State from '../../state/State'
import { DomUtil } from '../../utils'

class Tooltip extends Widget {
  constructor() {
    super()
    this._wrapper = DomUtil.create('div', 'widget tool-tip')
    this._ready = true
    this._state = State.INITIALIZED
  }

  get type() {
    return Widget.getWidgetType('tooltip')
  }

  /**
   *
   * @private
   */
  _installHook() {
    const self = this
    Object.defineProperty(this._viewer, 'tooltip', {
      get() {
        return self
      },
    })
  }

  /**
   *
   * @param {*} windowCoord
   *
   */
  _updateWindowCoord(windowCoord) {
    let x = windowCoord.x + 10
    let y = windowCoord.y - this._wrapper.offsetHeight / 2

    // x += offset.x
    // y += offset.y
    this._wrapper.style.cssText = `
    visibility:visible;
    z-index:1;
    transform:translate3d(${Math.round(x)}px,${Math.round(y)}px, 0);
    `
  }

  /**
   *
   * @param {*} position
   * @param {*} content
   *
   */
  showAt(position, content) {
    if (!this._enable) {
      return this
    }

    position && this._updateWindowCoord(position)
    this.setContent(content)
    return this
  }
}

Widget.registerType('tooltip')

export default Tooltip
