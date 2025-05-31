/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import { Billboard, Polyline, Polygon, Model } from '../../overlay'
import Layer from '../Layer'
import VectorLayer from './VectorLayer'

class GeoJsonLayer extends Layer {
  constructor(id, url, options = {}) {
    if (!url) {
      throw new Error('GeoJsonLayer：the url invalid')
    }
    super(id)
    this._delegate = Cesium.GeoJsonDataSource.load(url, options)
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('geojson')
  }

  set show(show) {
    this._show = show
    this._delegate &&
      this._delegate.then((dataSource) => {
        dataSource.show = this._show
      })
  }

  get show() {
    return this._show
  }

  _createBillboard(entity) {
    if (entity.position && entity.billboard) {
      return Billboard.fromEntity(entity)
    }
  }

  /**
   * Returns polyline Entity
   * @param entity
   * @returns {any}
   * @private
   */
  _createPolyline(entity) {
    if (entity.polyline) {
      return Polyline.fromEntity(entity)
    }
  }

  /**
   * Returns polygon Entity
   * @param entity
   * @returns {any}
   * @private
   */
  _createPolygon(entity) {
    if (entity.polygon) {
      return Polygon.fromEntity(entity)
    }
  }

  /**
   * Returns model Entity
   * @param entity
   * @param modelUrl
   * @returns {Model}
   * @private
   */
  _createModel(entity, modelUrl) {
    if (entity) {
      return Model.fromEntity(entity, modelUrl)
    }
  }

  /**
   *
   * @param method
   * @param context
   * @returns {GeoJsonLayer}
   */
  eachOverlay(method, context) {
    if (this._delegate) {
      this._delegate.then((dataSource) => {
        let entities = dataSource.entities.values
        entities.forEach((item) => {
          method.call(context, item)
        })
      })
      return this
    }
  }

  /**
   * Converts to VectorLayer
   * @returns {VectorLayer}
   */
  toVectorLayer() {
    let layer = new VectorLayer(this.id)
    this.eachOverlay((item) => {
      if (item.billboard) {
        layer.addOverlay(this._createBillboard(item))
      } else if (item.polyline) {
        layer.addOverlay(this._createPolyline(item))
      } else if (item.polygon) {
        layer.addOverlay(this._createPolygon(item))
      }
    }, this)
    return layer
  }

  /**
   * Converts to VectorLayer
   * @param modelUrl
   * @returns {VectorLayer}
   */
  toModelLayer(modelUrl) {
    let layer = new VectorLayer(this.id)
    this.eachOverlay((item) => {
      layer.addOverlay(this._createModel(item, modelUrl))
    }, this)
    return layer
  }
}

Layer.registerType('geojson')

export default GeoJsonLayer
