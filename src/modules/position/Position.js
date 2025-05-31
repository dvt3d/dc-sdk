/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import { Transform } from '../transform'

class Position {
  constructor(lng, lat, alt, heading, pitch, roll) {
    this._lng = +lng || 0
    this._lat = +lat || 0
    this._alt = +alt || 0
    this._heading = +heading || 0
    this._pitch = +pitch || 0
    this._roll = +roll || 0
  }

  set lng(lng) {
    this._lng = +lng
  }

  get lng() {
    return this._lng
  }

  set lat(lat) {
    this._lat = +lat
  }

  get lat() {
    return this._lat
  }

  set alt(alt) {
    this._alt = +alt
  }

  get alt() {
    return this._alt
  }

  set heading(heading) {
    this._heading = +heading
  }

  get heading() {
    return this._heading
  }

  set pitch(pitch) {
    this._pitch = +pitch
  }

  get pitch() {
    return this._pitch
  }

  set roll(roll) {
    this._roll = +roll
  }

  get roll() {
    return this._roll
  }

  /**
   *
   * @returns {string}
   */
  serialize() {
    let position = new Position(
      this._lng,
      this._lat,
      this._alt,
      this._heading,
      this._pitch,
      this._roll
    )
    return JSON.stringify(position)
  }

  /**
   * Calculate the distance between two positions
   * @param target
   * @returns {number}
   */
  distance(target) {
    if (!target || !(target instanceof Position)) {
      return 0
    }
    return Cesium.Cartesian3.distance(
      Transform.transformWGS84ToCartesian(this),
      Transform.transformWGS84ToCartesian(target)
    )
  }

  /**
   * clone a position
   * @returns {Position}
   */
  clone() {
    let position = new Position()
    position.lng = this.lng || 0
    position.lat = this.lat || 0
    position.alt = this.alt || 0
    position.heading = this.heading || 0
    position.pitch = this.pitch || 0
    position.roll = this.roll || 0
    return position
  }

  /**
   * clone a position
   * @deprecated
   * @returns {Position}
   */
  copy() {
    return this.clone()
  }

  /**
   *
   * @returns {*[]}
   */
  toArray() {
    return [this.lng, this.lat, this.alt, this.heading, this.pitch, this.roll]
  }

  /**
   *
   * @returns {string}
   */
  toString() {
    return `${this.lng},${this.lat},${this.alt},${this.heading},${this.pitch},${this.roll}`
  }

  /**
   *
   * @returns {{lng, heading, alt, roll, pitch, lat}}
   */
  toObject() {
    return {
      lng: this.lng,
      lat: this.lat,
      alt: this.alt,
      heading: this.heading,
      pitch: this.pitch,
      roll: this.roll,
    }
  }

  /**
   *
   * @param arr
   * @returns {Position}
   */
  static fromArray(arr) {
    let position = new Position()
    if (Array.isArray(arr)) {
      position.lng = arr[0] || 0
      position.lat = arr[1] || 0
      position.alt = arr[2] || 0
      position.heading = arr[3] || 0
      position.pitch = arr[4] || 0
      position.roll = arr[5] || 0
    }
    return position
  }

  /**
   *
   * @param str
   * @returns {Position}
   */
  static fromString(str) {
    let position = new Position()
    if (str && typeof str === 'string') {
      let arr = str.split(',')
      position = this.fromArray(arr)
    }
    return position
  }

  /**
   *
   * @param obj
   * @returns {Position}
   */
  static fromObject(obj) {
    return new Position(
      obj.lng,
      obj.lat,
      obj.alt,
      obj.heading,
      obj.pitch,
      obj.roll
    )
  }

  /**
   * Deserialize
   * @param valStr
   * @returns {Position}
   */
  static deserialize(valStr) {
    let position = new Position()
    let obj = JSON.parse(valStr)
    if (obj) {
      position.lng = obj.lng || 0
      position.lat = obj.lat || 0
      position.alt = obj.alt || 0
      position.heading = obj.heading || 0
      position.pitch = obj.pitch || 0
      position.roll = obj.roll || 0
    }
    return position
  }
}

export default Position
