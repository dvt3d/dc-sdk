/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
const { ImageryLayer } = Cesium

class BaseLayerPicker {
  constructor(options) {
    if (!options.globe) {
      throw new Error('globe is required')
    }
    this._globe = options.globe
    this._imageryLayers = []
    this._selectedImageryLayer = undefined
    this._count = 0
  }

  set selectedImageryLayer(imageryLayer) {
    if (!imageryLayer || !imageryLayer.layers) {
      new Error('imagery format error')
    }

    if (
      this._selectedImageryLayer &&
      imageryLayer.id === this._selectedImageryLayer.id
    ) {
      return
    }

    if (
      this._selectedImageryLayer &&
      imageryLayer.id !== this._selectedImageryLayer.id
    ) {
      for (let i = 0; i < this._selectedImageryLayer.cache.length; i++) {
        this._globe.imageryLayers.remove(this._selectedImageryLayer.cache[i])
      }
      imageryLayer.cache = []
    }

    for (let i = imageryLayer.layers.length - 1; i >= 0; i--) {
      let layer = imageryLayer.layers[i]
      let imagery = ImageryLayer.fromProviderAsync(layer, imageryLayer.options)
      layer && this._globe.imageryLayers.add(imagery, 0)
      imageryLayer.cache.push(imagery)
    }
    this._selectedImageryLayer = imageryLayer
  }

  get selectedImageryLayer() {
    return this._selectedImageryLayer
  }

  /**
   *
   * @param imageryLayer
   * @param options
   * @returns {BaseLayerPicker}
   */
  addImageryLayer(imageryLayer, options = {}) {
    let imageryLayers = []
    if (Array.isArray(imageryLayer)) {
      imageryLayers = imageryLayer.slice(0)
    } else {
      imageryLayers = [imageryLayer]
    }
    this._count++
    this._imageryLayers.push({
      id: `imagery-no-${this._count}`,
      layers: imageryLayers,
      cache: [],
      options,
    })
    return this
  }

  /**
   *
   * @param index
   * @returns {BaseLayerPicker}
   */
  changeImageryLayer(index) {
    if (index > this._imageryLayers.length - 1) {
      throw new Error('index error')
    }
    this.selectedImageryLayer = this._imageryLayers[index]
    return this
  }
}

export default BaseLayerPicker
