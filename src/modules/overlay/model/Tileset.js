/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import Parse from '../../parse/Parse'
import State from '../../state/State'
import { TilesetEvent } from '../../event'

class Tileset extends Overlay {
  constructor(url, options = {}) {
    super()
    this._delegate = Cesium.Cesium3DTileset.fromUrl(url, options)
    this._tilesetEvent = new TilesetEvent(this._delegate)
    this._tileVisibleCallback = undefined
    this._properties = undefined
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('tileset')
  }

  set show(show) {
    this._show = show
    this._delegate.then((tileset) => {
      tileset.show = show
    })
  }

  /**
   *
   * @private
   */
  _bindVisibleEvent() {
    this._tileVisibleCallback && this._tileVisibleCallback()
    this._tileVisibleCallback = this._delegate.then((tileset) => {
      tileset.tileVisible.addEventListener(this._updateTile, this)
    })
  }

  /**
   * Updates tile
   * @param tile
   * @private
   */
  _updateTile(tile) {
    let content = tile.content
    // sets properties
    for (let i = 0; i < content.featuresLength; i++) {
      let feature = content.getFeature(i)
      if (this._properties && this._properties.length) {
        this._properties.forEach((property) => {
          if (
            feature.hasProperty(property['key']) &&
            feature.getProperty(property['key']) === property['keyValue']
          ) {
            feature.setProperty(
              property['propertyName'],
              property['propertyValue']
            )
          }
        })
      }
    }
  }

  /**
   *
   * @param {*} callback
   * @returns
   */
  ready(callback) {
    this._delegate.then(callback)
    return this
  }

  /**
   * Sets position
   * @param position
   * @returns {Tileset}
   */
  setPosition(position) {
    position = Parse.parsePosition(position)
    this._delegate.then((tileset) => {
      let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
        Cesium.Cartesian3.fromDegrees(position.lng, position.lat, position.alt)
      )
      let rotation = Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromHeadingPitchRoll(
          new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(position.heading),
            Cesium.Math.toRadians(position.pitch),
            Cesium.Math.toRadians(position.roll)
          )
        )
      )
      Cesium.Matrix4.multiply(modelMatrix, rotation, modelMatrix)
      tileset.root.transform = modelMatrix
    })
    return this
  }

  /**
   *
   * @param heading
   * @param pitch
   * @param roll
   * @returns {Tileset}
   */
  setHeadingPitchRoll(heading, pitch, roll) {
    this._delegate.then((tileset) => {
      let modelMatrix = tileset.root.transform
      let rotation = Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromHeadingPitchRoll(
          new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(heading || 0),
            Cesium.Math.toRadians(pitch || 0),
            Cesium.Math.toRadians(roll || 0)
          )
        )
      )
      Cesium.Matrix4.multiply(modelMatrix, rotation, modelMatrix)
      tileset.root.transform = modelMatrix
    })
    return this
  }

  /**
   *
   * @param {*} text
   * @param {*} textStyle
   */
  setLabel(text, textStyle) {
    console.warn('not support this function')
    return this
  }

  /**
   * Clamps To Ground
   * @returns {Tileset}
   */
  clampToGround() {
    this._delegate.then((tileset) => {
      let center = Cesium.Cartographic.fromCartesian(
        tileset.boundingSphere.center
      )
      let surface = Cesium.Cartesian3.fromRadians(
        center.longitude,
        center.latitude,
        center.height
      )
      let offset = Cesium.Cartesian3.fromRadians(
        center.longitude,
        center.latitude,
        0
      )
      let translation = Cesium.Cartesian3.subtract(
        offset,
        surface,
        new Cesium.Cartesian3()
      )
      tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
    })
    return this
  }

  /**
   * Sets height
   * @param height
   * @param isAbsolute
   * @returns {Tileset}
   */
  setHeight(height, isAbsolute = false) {
    this._delegate.then((tileset) => {
      let center = Cesium.Cartographic.fromCartesian(
        tileset.boundingSphere.center
      )
      let surface = Cesium.Cartesian3.fromRadians(
        center.longitude,
        center.latitude,
        center.height
      )
      let offset = Cesium.Cartesian3.fromRadians(
        center.longitude,
        center.latitude,
        isAbsolute ? height : center.height + height
      )
      let translation = Cesium.Cartesian3.subtract(
        offset,
        surface,
        new Cesium.Cartesian3()
      )
      tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
    })
    return this
  }

  /**
   * Sets scale
   * @param scale
   * @returns {Tileset}
   */
  setScale(scale) {
    this._delegate.then((tileset) => {
      let modelMatrix = tileset.root.transform
      if (scale > 0 && scale !== 1) {
        Cesium.Matrix4.multiplyByUniformScale(modelMatrix, scale, modelMatrix)
      }
      tileset.root.transform = modelMatrix
    })
    return this
  }

  /**
   * Sets feature property
   * @param properties
   * @returns {Tileset}
   */
  setProperties(properties) {
    this._properties = properties
    this._bindVisibleEvent()
    return this
  }

  /**
   *
   * @param splitDirection
   * @return {Tileset}
   */
  setSplitDirection(splitDirection) {
    this._delegate.then((tileset) => {
      tileset.splitDirection = splitDirection
    })
    return this
  }

  /**
   *
   * @param customShader
   * @return {Tileset}
   */
  setCustomShader(customShader) {
    this._delegate.then((tileset) => {
      tileset.customShader = customShader
    })
    return this
  }

  /**
   * Sets style
   * @param style
   * @returns {Tileset}
   */
  setStyle(style) {
    if (style && style instanceof Cesium.Cesium3DTileStyle) {
      this._style = style
      this._delegate.then((tileset) => {
        tileset.style = style
      })
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
    this._tilesetEvent.on(type, callback, context || this)
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
    this._tilesetEvent.off(type, callback, context || this)
    return this
  }
}

Overlay.registerType('tileset')

export default Tileset
