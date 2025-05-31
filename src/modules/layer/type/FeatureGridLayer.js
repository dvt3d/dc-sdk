/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import Layer from '../Layer'
import VectorLayer from './VectorLayer'

const DEF_OPTS = {
  name: '',
  count: 10,
  maximumLevel: 21,
  dataProperty: '',
  callback: () => {
    return null
  },
}

class FeatureGridLayer extends Layer {
  constructor(id, url, options = {}) {
    super(id)
    this._url = url
    this._options = {
      ...DEF_OPTS,
      ...options,
    }
    this._levelLayers = {}
    this._tileWidth = 256
    this._tileHeight = 256
    this._maximumLevel = this._options.maximumLevel
    this._tilingScheme =
      this._options.tilingScheme || new Cesium.GeographicTilingScheme()
    this._rectangle = this._tilingScheme.rectangle
    this._credit = undefined
    this._token = undefined
    for (let i = 0; i < this.maximumLevel; i++) {
      this._levelLayers[String(i)] = new VectorLayer(id + '-grid-' + i)
    }
    this._viewer = undefined
    this._imageryLayer = undefined
    this._imagery = document.createElement('canvas')
    this._imagery.width = this._tileWidth
    this._imagery.height = this._tileHeight
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('feature_grid')
  }

  get url() {
    return this._url
  }

  set show(show) {
    this._show = show
    Object.keys(this._levelLayers).forEach((key) => {
      this._levelLayers[key].show = show
    })
  }

  get show() {
    return this._show
  }

  get token() {
    return this._token
  }

  get tileWidth() {
    if (!this.ready) {
      throw new Cesium.DeveloperError(
        'tileWidth must not be called before the imagery provider is ready.'
      )
    }
    return this._tileWidth
  }

  get tileHeight() {
    if (!this.ready) {
      throw new Cesium.DeveloperError(
        'tileHeight must not be called before the imagery provider is ready.'
      )
    }
    return this._tileHeight
  }

  get maximumLevel() {
    if (!this.ready) {
      throw new Cesium.DeveloperError(
        'maximumLevel must not be called before the imagery provider is ready.'
      )
    }
    return this._maximumLevel
  }

  get minimumLevel() {
    if (!this.ready) {
      throw new Cesium.DeveloperError(
        'minimumLevel must not be called before the imagery provider is ready.'
      )
    }
    return 0
  }

  get tilingScheme() {
    if (!this.ready) {
      throw new Cesium.DeveloperError(
        'tilingScheme must not be called before the imagery provider is ready.'
      )
    }
    return this._tilingScheme
  }

  get rectangle() {
    if (!this.ready) {
      throw new Cesium.DeveloperError(
        'rectangle must not be called before the imagery provider is ready.'
      )
    }
    return this._rectangle
  }

  get ready() {
    return !!this._url
  }

  get credit() {
    return this._credit
  }

  get hasAlphaChannel() {
    return true
  }

  /**
   *
   * @param {*} viewer
   * @returns
   */
  _onAdd(viewer) {
    this._viewer = viewer
    this._imageryLayer = this._viewer.imageryLayers.addImageryProvider(this)
    Object.keys(this._levelLayers).forEach((key) => {
      this._viewer.addLayer(this._levelLayers[key])
    })
    this._state = State.ADDED
  }

  _onRemove() {
    this._imageryLayer && this._viewer.imageryLayers.remove(this._imageryLayer)
    Object.keys(this._levelLayers).forEach((key) => {
      this._viewer.removeLayer(this._levelLayers[key])
    })
    this._state = State.REMOVED
  }

  getTileCredits(x, y, level) {}

  /**
   *
   * @param {*} x
   * @param {*} y
   * @param {*} level
   * @param {*} request
   * @returns
   */
  requestImage(x, y, level, request) {
    let layer = this._levelLayers[String(level)]
    let rectangle = this._tilingScheme.tileXYToRectangle(x, y, level)
    if (
      this._viewer &&
      rectangle &&
      layer &&
      Cesium.Rectangle.intersection(rectangle, this._viewer.viewBounds)
    ) {
      Cesium.Resource.fetchJson({
        url: this._url,
        queryParameters: {
          minX: Cesium.Math.toDegrees(rectangle.west),
          minY: Cesium.Math.toDegrees(rectangle.south),
          maxX: Cesium.Math.toDegrees(rectangle.east),
          maxY: Cesium.Math.toDegrees(rectangle.north),
          count: this._options.count,
        },
      }).then((res) => {
        let dataList = res
        if (this._options.dataProperty) {
          dataList = res[this._options.dataProperty]
        }
        if (dataList && dataList.length) {
          for (let i = level + 3; i < this._maximumLevel; i++) {
            this._levelLayers[String(i)] && this._levelLayers[String(i)].clear()
          }
          dataList.forEach((item) => {
            let overlay = this._options.callback(item)
            overlay && layer.addOverlay(overlay)
          })
        }
      })
    }
    return this._imagery
  }

  /**
   *
   */
  clear() {
    Object.keys(this._levelLayers).forEach((key) => {
      this._levelLayers[key].clear()
    })
    this._state = State.CLEARED
  }
}

Layer.registerType('feature_grid')

export default FeatureGridLayer
