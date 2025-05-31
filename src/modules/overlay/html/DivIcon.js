/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import Parse from '../../parse/Parse'
import State from '../../state/State'
import { Transform } from '../../transform'
import { isBetween } from '../../math'
import { Util, DomUtil } from '../../utils'
import { MouseEventType } from '../../event'

class DivIcon extends Overlay {
  constructor(position, content) {
    super()
    this._delegate = DomUtil.create('div', 'div-icon')
    this._position = Parse.parsePosition(position)
    this._delegate.setAttribute('id', this._id)
    Util.merge(this._delegate.style, {
      position: 'absolute',
      top: '0',
      left: '0',
    })
    this.content = content
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('div_icon')
  }

  set show(show) {
    this._show = show
    this._delegate.style.visibility = this._show ? 'visible' : 'hidden'
  }

  get show() {
    return this._show
  }

  set position(position) {
    this._position = Parse.parsePosition(position)
  }

  get position() {
    return this._position
  }

  set content(content) {
    if (content && typeof content === 'string') {
      this._delegate.innerHTML = content
    } else if (content && content instanceof Element) {
      while (this._delegate.hasChildNodes()) {
        this._delegate.removeChild(this._delegate.firstChild)
      }
      this._delegate.appendChild(content)
    }
  }

  get content() {
    return this._delegate.childNodes || []
  }

  /**
   * Updates style
   * @param windowCoord
   * @param distance
   * @param isFront
   * @private
   */
  _updateStyle(windowCoord, distance, isFront) {
    if (!this._show || !windowCoord) {
      return
    }

    // set translate
    let x = windowCoord.x - this._delegate.offsetWidth / 2
    let y = windowCoord.y - this._delegate.offsetHeight / 2

    if (this._style.position === 'topleft') {
      x = windowCoord.x - this._delegate.offsetWidth
      y = windowCoord.y - this._delegate.offsetHeight
    } else if (this._style.position === 'topright') {
      x = windowCoord.x
      y = windowCoord.y - this._delegate.offsetHeight
    } else if (this._style.position === 'bottomleft') {
      x = windowCoord.x - this._delegate.offsetWidth
      y = windowCoord.y
    } else if (this._style.position === 'bottomright') {
      x = windowCoord.x
      y = windowCoord.y
    }
    let translate3d = `translate3d(${Math.round(x)}px,${Math.round(y)}px, 0)`

    // set scale
    let scale3d = 'scale3d(1,1,1)'
    let scaleByDistance = this._style.scaleByDistance
    if (distance && scaleByDistance) {
      let near = scaleByDistance.near || 0.0
      let nearValue = scaleByDistance.nearValue || 1.0
      let far = scaleByDistance.far || Number.MAX_VALUE
      let farValue = scaleByDistance.farValue || 0.0
      let f = distance / far
      if (distance < near) {
        scale3d = `scale3d(${nearValue},${nearValue},1)`
      } else if (distance > far) {
        scale3d = `scale3d(${farValue},${farValue},1)`
      } else {
        let scale = farValue + f * (nearValue - farValue)
        scale3d = `scale3d(${scale},${scale},1)`
      }
    }

    // set condition
    let isDisplay = true
    let distanceDisplayCondition = this._style.distanceDisplayCondition
    if (distance && distanceDisplayCondition) {
      isDisplay = isBetween(
        distance,
        distanceDisplayCondition.near || 0.0,
        distanceDisplayCondition.far || Number.MAX_VALUE
      )
    }

    // update style
    this._delegate.style.transform = `${translate3d} ${scale3d}`
    this._delegate.style.visibility =
      isDisplay && isFront ? 'visible' : 'hidden'
  }

  /**
   *
   * @param layer
   * @returns {boolean}
   * @private
   */
  _onAdd(layer) {
    this._layer = layer
    this._layer.delegate.appendChild(this._delegate)
    let params = {
      layer: layer,
      overlay: this,
      position: Transform.transformWGS84ToCartesian(this._position),
    }

    this._delegate.addEventListener('click', () => {
      this._overlayEvent.fire(MouseEventType.CLICK, params)
    })

    this._delegate.addEventListener('mouseover', () => {
      this._overlayEvent.fire(MouseEventType.MOUSE_OVER, params)
    })

    this._delegate.addEventListener('mouseout', () => {
      this._overlayEvent.fire(MouseEventType.MOUSE_OUT, params)
    })

    this._state = State.ADDED
  }

  /**
   *
   * @private
   */
  _onRemove() {
    if (this._layer) {
      this._layer.delegate.removeChild(this._delegate)
      this._state = State.REMOVED
    }
  }

  /**
   * Sets text
   * @param text
   * @param textStyle
   * @returns {DivIcon}
   */
  setLabel(text, textStyle) {
    return this
  }

  /**
   * Sets style
   * @param style
   * @returns {DivIcon}
   */
  setStyle(style) {
    if (!style || Object.keys(style).length === 0) {
      return this
    }
    Util.merge(this._style, style)
    this._style.className &&
      DomUtil.addClass(this._delegate, this._style.className)
    return this
  }

  /**
   * Parse from entity
   * @param entity
   * @param content
   * @returns {DivIcon}
   */
  static fromEntity(entity, content) {
    let divIcon
    let now = Cesium.JulianDate.now()
    let position = Transform.transformCartesianToWGS84(
      entity.position.getValue(now)
    )
    divIcon = new DivIcon(position, content)
    if (entity.billboard) {
      divIcon.attr = {
        ...entity?.properties?.getValue(now),
      }
    }
    return divIcon
  }
}

Overlay.registerType('div_icon')

export default DivIcon
