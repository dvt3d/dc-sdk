/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'

class MeasureBase {
  constructor() {
    this._viewer = undefined
    this._layer = undefined
    this._startLabel = new Cesium.Entity({
      label: {
        text: '开始',
        font: '12px',
        pixelOffset: { x: 0, y: -15 },
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        showBackground: true,
      },
    })
    this._resultLabel = new Cesium.Entity({
      label: {
        font: '12px',
        pixelOffset: { x: 0, y: -15 },
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        showBackground: true,
      },
    })
    this._options = {}
  }

  /**
   *
   * @param positions
   * @param includeModel
   * @returns {*}
   */
  _getSampledHeight(positions, includeModel = false) {
    let terrainPromise =
      this._viewer.terrainProvider &&
      !(this._viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider)
        ? Cesium.sampleTerrainMostDetailed(
            this._viewer.terrainProvider,
            positions.map((item) => Cesium.Cartographic.fromCartesian(item))
          )
        : Promise.resolve(
            positions.map((item) => Cesium.Cartographic.fromCartesian(item))
          )

    let modelPromise =
      this._viewer.scene.clampToHeightSupported && includeModel
        ? this._viewer.scene.clampToHeightMostDetailed(
            positions,
            this._layer.entities.values
          )
        : Promise.resolve(positions)

    return Promise.all([terrainPromise, modelPromise])
  }

  /**
   *
   * @private
   */
  _onDrawStop(delegate) {}

  /**
   *
   * @param positions
   * @private
   */
  _onCalc(positions) {}

  /**
   *
   * @param measure
   * @param options
   */
  _startHook(measure, options) {
    this._viewer = measure.viewer
    this._layer = measure.layer
    this._options = options
    this._options.onDrawStop = this._onDrawStop.bind(this)
    this._options.onCalc = this._onCalc.bind(this)
    this._layer.entities.add(this._startLabel)
    this._layer.entities.add(this._resultLabel)
  }

  /**
   *
   * @param measure
   * @param options
   * @returns {MeasureBase}
   */
  start(measure, options) {
    return this
  }
}

export default MeasureBase
