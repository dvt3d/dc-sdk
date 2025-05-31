/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'

class Event {
  constructor(types) {
    this._types = types
    this._cache = {}
  }

  /**
   * @param type
   * @param callback
   * @param context
   * @returns {any}
   * @private
   */
  _on(type, callback, context) {
    let event = this.getEvent(type)
    let removeCallback = undefined
    if (event && callback) {
      removeCallback = event.addEventListener(callback, context || this)
    }
    return removeCallback
  }

  /**
   * @param type
   * @param callback
   * @param context
   * @returns {boolean}
   * @private
   */
  _off(type, callback, context) {
    let event = this.getEvent(type)
    let removed = false
    if (event && callback) {
      removed = event.removeEventListener(callback, context || this)
    }
    return removed
  }

  /**
   * @param type
   * @param params
   * @private
   */
  _fire(type, params) {
    let event = this.getEvent(type)
    if (event) {
      event.raiseEvent(params)
    }
  }

  /**
   * Event registration
   * Subclasses need to override
   *
   */
  _registerEvent() {
    Object.keys(this._types).forEach((key) => {
      let type = this._types[key]
      this._cache[type] = new Cesium.Event()
    })
  }

  /**
   * Subscribe event
   * @param type
   * @param callback
   * @param context
   * @returns remove callback function
   */
  on(type, callback, context) {
    return this._on(type, callback, context)
  }

  /**
   * Subscribe once event
   * @param type
   * @param callback
   * @param context
   */
  once(type, callback, context) {
    let removeCallback = this._on(
      type,
      (e) => {
        callback(e)
        removeCallback && removeCallback()
      },
      context
    )
  }

  /**
   * Unsubscribe event
   * @param type
   * @param callback
   * @param context
   * @returns Boolean
   */
  off(type, callback, context) {
    return this._off(type, callback, context)
  }

  /**
   * Trigger subscription event
   * @param type
   * @param params
   */
  fire(type, params) {
    this._fire(type, params)
  }

  /**
   * Returns events by type
   * @param type
   * @returns Event
   */
  getEvent(type) {
    return this._cache[type] || undefined
  }
}

export default Event
