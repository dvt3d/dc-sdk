/**
 * @Author : Caven Chen
 */

import { Cesium, Supercluster } from '../../../libs'
import State from '../../state/State'
import Layer from '../Layer'
import Parse from '../../parse/Parse'
import { Util } from '../../utils'

const DEF_OPT = {
  radius: 60,
  maxZoom: 25,
  style: 'circle',
  image: '',
  gradientColors: {
    0.0001: Cesium.Color.DEEPSKYBLUE,
    0.001: Cesium.Color.GREEN,
    0.01: Cesium.Color.ORANGE,
    0.1: Cesium.Color.RED,
  },
  gradientImages: {},
  showCount: true,
  fontSize: 12,
  clusterSize: 16,
  fontColor: Cesium.Color.BLACK,
  getCountOffset: (count) => {
    return {
      x: -3.542857 * String(count).length + 1.066667,
      y: String(count).length > 3 ? 5 : 4,
    }
  },
}

class ClusterLayer extends Layer {
  constructor(id, options = {}) {
    super(id)
    this._delegate = new Cesium.PrimitiveCollection()
    this._options = {
      ...DEF_OPT,
      ...options,
    }
    this._billboards = this._delegate.add(new Cesium.BillboardCollection())
    this._labels = this._delegate.add(new Cesium.LabelCollection())
    this._cluster = new Supercluster({
      radius: this._options.radius,
      maxZoom: this._options.maxZoom,
    })
    this._allCount = 0
    this._changedRemoveCallback = undefined
    this._lastChangedTime = null
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('cluster')
  }

  _addOverlay(overlay) {}
  _removeOverlay(overlay) {}

  /**
   *
   * @param color
   * @param count
   * @returns {*}
   * @private
   */
  _getCircleImage(color, count) {
    let size = this._options.clusterSize * (String(count).length + 1)
    let key = color.toCssColorString() + '-' + count
    if (!this._cache[key]) {
      let canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      let context2D = canvas.getContext('2d')
      context2D.save()
      context2D.scale(size / 24, size / 24) //Added to auto-generated code to scale up to desired size.
      context2D.fillStyle = color.withAlpha(0.2).toCssColorString() //Modified from auto-generated code.
      context2D.beginPath()
      context2D.arc(12, 12, 9, 0, 2 * Math.PI)
      context2D.closePath()
      context2D.fill()
      context2D.beginPath()
      context2D.arc(12, 12, 6, 0, 2 * Math.PI)
      context2D.fillStyle = color.toCssColorString()
      context2D.closePath()
      context2D.fill()
      context2D.restore()
      this._cache[key] = canvas.toDataURL()
    }
    return this._cache[key]
  }

  /**
   *
   * @param color
   * @param count
   * @returns {*}
   * @private
   */
  _getClusteringImage(color, count) {
    let size = this._options.clusterSize * (String(count).length + 1)
    let key = color.toCssColorString() + '-' + count
    let startAngle = -Math.PI / 12
    let angle = Math.PI / 2
    let intervalAngle = Math.PI / 6
    if (!this._cache[key]) {
      let canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      let context2D = canvas.getContext('2d')
      context2D.save()
      context2D.scale(size / 24, size / 24) //Added to auto-generated code to scale up to desired size.
      context2D.beginPath()
      context2D.arc(12, 12, 6, 0, 2 * Math.PI)
      context2D.fillStyle = color.toCssColorString()
      context2D.fill()
      context2D.closePath()
      context2D.lineWidth = 2
      for (let i = 0; i < 3; i++) {
        context2D.beginPath()
        context2D.arc(12, 12, 8, startAngle, startAngle + angle, false)
        context2D.strokeStyle = color.withAlpha(0.4).toCssColorString()
        context2D.stroke()
        context2D.arc(12, 12, 11, startAngle, startAngle + angle, false)
        context2D.strokeStyle = color.withAlpha(0.2).toCssColorString()
        context2D.stroke()
        context2D.closePath()
        startAngle = startAngle + angle + intervalAngle
      }
      context2D.restore()
      this._cache[key] = canvas.toDataURL()
    }
    return this._cache[key]
  }

  _getClusterImage(count) {
    let rate = count / this._allCount
    let image = undefined
    if (this._options.style === 'custom') {
      let keys = Object.keys(this._options.gradientImages).sort(
        (a, b) => Number(a) - Number(b)
      )
      for (let i = keys.length - 1; i >= 0; i--) {
        if (rate >= Number(keys[i])) {
          image = this._options.gradientImages[keys[i]]
          break
        }
      }
      if (!image) {
        image = this._options.gradientImages[keys[0]]
      }
    } else {
      let keys = Object.keys(this._options.gradientColors).sort(
        (a, b) => Number(a) - Number(b)
      )
      let color = undefined
      for (let i = keys.length - 1; i >= 0; i--) {
        if (rate >= Number(keys[i])) {
          color = this._options.gradientColors[keys[i]]
          break
        }
      }
      if (!color) {
        color = this._options.gradientColors[keys[0]]
      }
      image =
        this._options.style === 'circle'
          ? this._getCircleImage(color, count)
          : this._getClusteringImage(color, count)
    }
    return image
  }

  _changeCluster(time) {
    let now = Cesium.getTimestamp()
    if (this._lastChangedTime && now - this._lastChangedTime <= 1000) {
      return
    }
    this._lastChangedTime = now
    this._cache = {}
    this._billboards.removeAll()
    this._labels.removeAll()
    let rectangle = this._viewer.camera.computeViewRectangle()
    if (!rectangle) {
      rectangle = this._viewer.viewBounds
    }
    if (this._allCount) {
      let result = this._cluster.getClusters(
        [
          Cesium.Math.toDegrees(rectangle.west),
          Cesium.Math.toDegrees(rectangle.south),
          Cesium.Math.toDegrees(rectangle.east),
          Cesium.Math.toDegrees(rectangle.north),
        ],
        this._viewer.zoom
      )
      result.forEach((item) => {
        let overlayId = Util.uuid()
        if (item.properties.cluster) {
          let count = item.properties.point_count
          let billboard = this._billboards.add({
            position: Cesium.Cartesian3.fromDegrees(
              +item.geometry.coordinates[0],
              +item.geometry.coordinates[1]
            ),
            image: this._getClusterImage(count),
          })
          billboard.layerId = this.layerId
          billboard.overlayId = overlayId
          billboard.attr = { count: count }
          this._cache[overlayId] = billboard
          if (this._options.showCount) {
            let label = this._labels.add({
              position: Cesium.Cartesian3.fromDegrees(
                +item.geometry.coordinates[0],
                +item.geometry.coordinates[1]
              ),
              text: String(count),
              font: `${this._options.fontSize} px sans-serif`,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              fillColor: this._options.fontColor,
              scale: 0.8,
              pixelOffset: this._options.getCountOffset(count),
            })
            label.layerId = this.layerId
            label.overlayId = overlayId
            label.attr = { count: count }
            this._cache[overlayId] = label
          }
        } else {
          let billboard = this._billboards.add({
            position: Cesium.Cartesian3.fromDegrees(
              +item.geometry.coordinates[0],
              +item.geometry.coordinates[1]
            ),
            image: this._options.image,
            ...item.properties.style,
          })
          billboard.layerId = this.layerId
          billboard.overlayId = overlayId
          billboard.attr = item.properties
          this._cache[overlayId] = billboard
        }
      })
    }
  }

  _addedHook() {
    this._changedRemoveCallback = this._viewer.camera.changed.addEventListener(
      this._changeCluster,
      this
    )
  }

  _removedHook() {
    this._changedRemoveCallback && this._changedRemoveCallback()
  }

  /**
   *
   * @param points
   * @returns {ClusterLayer}
   */
  setPoints(points = []) {
    if (points.length) {
      this._allCount = points.length
      this._cluster.load(
        points.map((item) => {
          let position = Parse.parsePosition(item)
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [position.lng, position.lat],
            },
            properties: item.attr || {},
          }
        })
      )
    }
    return this
  }

  clear() {
    this._cache = {}
    this._allCount = 0
    this._state = State.CLEARED
    return this
  }
}

Layer.registerType('cluster')

export default ClusterLayer
