/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import State from '../state/State'
import { Util } from '../utils'
import { OverlayEventType, OverlayEvent } from '../event'
import OverlayType from './OverlayType'

class Overlay {
  constructor() {
    this._id = Util.uuid()
    this._bid = Util.uuid() // Business id
    this._delegate = undefined
    this._layer = undefined
    this._state = undefined
    this._show = true
    this._style = {}
    this._attr = {}
    this._allowDrillPicking = false
    this._contextMenu = []
    this._overlayEvent = new OverlayEvent()
    this._overlayEvent.on(OverlayEventType.ADD, this._onAdd, this)
    this._overlayEvent.on(OverlayEventType.REMOVE, this._onRemove, this)
  }

  get overlayId() {
    return this._id
  }

  get type() {
    return ''
  }

  set id(id) {
    this._bid = id
  }

  get id() {
    return this._bid
  }

  set show(show) {
    this._show = show
    if (Util.isPromise(this._delegate)) {
      this._delegate.then((obj) => {
        obj.show = this._show
      })
    } else {
      this._delegate && (this._delegate.show = this._show)
    }
  }

  get show() {
    return this._show
  }

  set attr(attr) {
    this._attr = attr
  }

  get attr() {
    return this._attr
  }

  set allowDrillPicking(allowDrillPicking) {
    this._allowDrillPicking = allowDrillPicking
  }

  get allowDrillPicking() {
    return this._allowDrillPicking
  }

  get overlayEvent() {
    return this._overlayEvent
  }

  get delegate() {
    return this._delegate
  }

  get state() {
    return this._state
  }

  set contextMenu(menus) {
    this._contextMenu = menus
  }

  get contextMenu() {
    return this._contextMenu
  }

  /**
   *
   * @param type
   * @return {undefined}
   * @private
   */
  _getLayerCollection(type) {
    let collection = undefined
    switch (type) {
      case 'point_primitive':
        collection = this._layer.points
        break
      case 'billboard_primitive':
      case 'bounce_billboard_primitive':
        collection = this._layer.billboards
        break
      case 'label_primitive':
      case 'bounce_label_primitive':
        collection = this._layer.labels
        break
      case 'polyline_primitive':
        collection = this._layer.polylines
        break
      case 'cloud_primitive':
        collection = this._layer.clouds
        break
      default:
        break
    }
    return collection
  }

  /**
   * The hook for mount layer
   * Subclasses need to be overridden
   * @private
   */
  _mountedHook() {}

  /**
   * The hook for added
   * @returns {boolean}
   * @private
   */
  _addedHook() {
    if (!this._delegate) {
      return false
    }
    if (this._delegate instanceof Promise) {
      this._delegate.then((obj) => {
        obj.layerId = this._layer?.layerId
        obj.overlayId = this._id
      })
    } else {
      this._delegate.layerId = this._layer?.layerId
      this._delegate.overlayId = this._id
    }
  }

  /**
   * The hook for removed
   * Subclasses need to be overridden
   * @private
   */
  _removedHook() {}

  /**
   * Add handler
   * @param layer
   * @private
   */
  _onAdd(layer) {
    if (!layer) {
      return
    }
    this._layer = layer

    this._mountedHook && this._mountedHook()

    // for Entity
    if (this._layer?.delegate?.entities && this._delegate) {
      this._layer.delegate.entities.add(this._delegate)
    }
    // for Primitive
    else if (this._layer?.delegate?.add) {
      let collection = this._getLayerCollection(this.type)
      if (collection) {
        this._delegate && (this._delegate = collection.add(this._delegate))
        Util.merge(this._delegate, this._style)
        // for bounce primitive
        if (this['update'] && this['destroy']) {
          this._layer.delegate.add(this)
        }
      } else if (Util.isPromise(this._delegate)) {
        // for 3d-tiles and i3s
        this._delegate.then((obj) => {
          this._layer.delegate.add(obj)
        })
      } else if (this['update'] && this['destroy']) {
        this._layer.delegate.add(this)
      } else {
        this._delegate && this._layer.delegate.add(this._delegate)
      }
    }
    this._addedHook && this._addedHook()
    this._state = State.ADDED
  }

  /**
   * Remove handler
   * @private
   */
  _onRemove() {
    if (!this._layer) {
      return
    }
    // for Entity
    if (this._layer?.delegate?.entities) {
      this._layer.delegate.entities.remove(this._delegate)
    }
    // for Primitive
    else if (this._layer?.delegate?.remove) {
      let collection = this._getLayerCollection(this.type)
      if (collection) {
        this._delegate && collection.remove(this._delegate)
        // for bounce primitive
        if (this['update'] && this['destroy']) {
          this._layer.delegate.remove(this)
        }
      } else if (Util.isPromise(this._delegate)) {
        // for 3d-tiles and i3s
        this._delegate.then((obj) => {
          this._layer.delegate.remove(obj)
        })
      } else if (this['update'] && this['destroy']) {
        this._layer.delegate.remove(this)
      } else {
        this._delegate && this._layer.delegate.remove(this._delegate)
      }
    }
    this._removedHook && this._removedHook()
    this._state = State.REMOVED
  }

  /**
   * Sets Text with Style
   * @param text
   * @param textStyle
   * @returns {Overlay}
   */
  setLabel(text, textStyle) {
    if (!this._delegate) {
      return this
    }
    if (this._delegate instanceof Cesium.Entity) {
      this._delegate.label = {
        ...textStyle,
        text: text,
      }
    }
    return this
  }

  /**
   * Sets style
   * @param style
   * @returns {Overlay}
   */
  setStyle(style) {
    return this
  }

  /**
   * Removes from layer
   * @returns {Overlay}
   */
  remove() {
    if (this._layer) {
      this._layer.removeOverlay(this)
    }
    return this
  }

  /**
   * adds to layer
   * @param layer
   * @returns {Overlay}
   */
  addTo(layer) {
    if (layer && layer.addOverlay) {
      layer.addOverlay(this)
    }
    return this
  }

  /**
   * Subscribe event
   * @param type
   * @param callback
   * @param context
   * @returns {Overlay}
   */
  on(type, callback, context) {
    this._overlayEvent.on(type, callback, context || this)
    return this
  }

  /**
   * Unsubscribe event
   * @param type
   * @param callback
   * @param context
   * @returns {Overlay}
   */
  off(type, callback, context) {
    this._overlayEvent.off(type, callback, context || this)
    return this
  }

  /**
   * Trigger subscription event
   * @param type
   * @param params
   * @returns {Overlay}
   */
  fire(type, params) {
    this._overlayEvent.fire(type, params)
    return this
  }

  /**
   *
   * @param type
   */
  static registerType(type) {
    if (type) {
      OverlayType[type.toLocaleUpperCase()] = type.toLocaleLowerCase()
    }
  }

  /**
   *
   * @param type
   * @returns {*|undefined}
   */
  static getOverlayType(type) {
    return OverlayType[type.toLocaleUpperCase()] || undefined
  }
}

export default Overlay
