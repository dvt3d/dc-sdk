/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import Layer from '../Layer'

/**
 * PrimitiveLayer is used to add primitive
 */
class PrimitiveLayer extends Layer {
  constructor(id) {
    super(id)
    this._delegate = new Cesium.PrimitiveCollection()
    this._points = this._delegate.add(new Cesium.PointPrimitiveCollection())
    this._labels = this._delegate.add(new Cesium.LabelCollection())
    this._billboards = this._delegate.add(new Cesium.BillboardCollection())
    this._polylines = this._delegate.add(new Cesium.PolylineCollection())
    this._clouds = this._delegate.add(new Cesium.CloudCollection())
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('primitive')
  }

  get points() {
    return this._points
  }

  get labels() {
    return this._labels
  }

  get billboards() {
    return this._billboards
  }

  get polylines() {
    return this._polylines
  }

  get clouds() {
    return this._clouds
  }

  /**
   * Clears all primitives
   * @returns {PrimitiveLayer}
   */
  clear() {
    this._delegate && this._delegate.removeAll()
    this._points = this._delegate.add(new Cesium.PointPrimitiveCollection())
    this._labels = this._delegate.add(new Cesium.LabelCollection())
    this._billboards = this._delegate.add(new Cesium.BillboardCollection())
    this._polylines = this._delegate.add(new Cesium.PolylineCollection())
    this._clouds = this._delegate.add(new Cesium.CloudCollection())
    this._cache = {}
    this._state = State.CLEARED
    return this
  }
}

Layer.registerType('primitive')

export default PrimitiveLayer
