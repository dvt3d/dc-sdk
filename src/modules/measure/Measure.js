/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import Angle from './type/Angle'
import Area from './type/Area'
import AreaHeight from './type/AreaHeight'
import AreaSurface from './type/AreaSurface'
import Distance from './type/Distance'
import DistanceSurface from './type/DistanceSurface'
import Heading from './type/Heading'
import Height from './type/Height'
import TriangleHeight from './type/TriangleHeight'
import MeasureType from './MeasureType'

class Measure {
  constructor(viewer) {
    if (!viewer) {
      throw Error('missing viewer param')
    }
    this._viewer = viewer
    this._layer = new Cesium.CustomDataSource('measure-layer')
    this._viewer.dataSources.add(this._layer)
  }

  get viewer() {
    return this._viewer
  }

  get layer() {
    return this._layer
  }

  /**
   *
   * @param options
   * @returns {Measure}
   */
  angle(options = {}) {
    new Angle().start(this, options)
    return this
  }

  /**
   *
   * @param options
   * @returns {Measure}
   */
  area(options = {}) {
    new Area().start(this, options)
    return this
  }

  /**
   *
   * @param options
   * @returns {Measure}
   */
  areaHeight(options = {}) {
    new AreaHeight().start(this, options)
    return this
  }

  /**
   *
   * @param options
   * @returns {Measure}
   */
  areaSurface(options = {}) {
    new AreaSurface().start(this, options)
    return this
  }

  /**
   *
   * @param options
   * @returns {Measure}
   */
  distance(options = {}) {
    new Distance().start(this, options)
    return this
  }

  /**
   *
   * @param options
   * @returns {Measure}
   */
  distanceSurface(options = {}) {
    new DistanceSurface().start(this, options)
    return this
  }

  /**
   *
   * @param options
   * @returns {Measure}
   */
  heading(options = {}) {
    new Heading().start(this, options)
    return this
  }

  /**
   *
   * @param options
   * @returns {Measure}
   */
  height(options = {}) {
    new Height().start(this, options)
    return this
  }

  /**
   *
   * @param options
   * @returns {Measure}
   */
  triangleHeight(options = {}) {
    new TriangleHeight().start(this, options)
    return this
  }

  /**
   *
   * @param type
   * @param options
   * @returns {Measure}
   */
  activate(type, options) {
    switch (type) {
      case MeasureType.ANGLE:
        this.angle(options)
        break
      case MeasureType.AREA:
        this.area(options)
        break
      case MeasureType.AREA_HEIGHT:
        this.areaHeight(options)
        break
      case MeasureType.AREA_SURFACE:
        this.areaSurface(options)
        break
      case MeasureType.DISTANCE:
        this.distance(options)
        break
      case MeasureType.DISTANCE_SURFACE:
        this.distanceSurface(options)
        break
      case MeasureType.HEADING:
        this.heading(options)
        break
      case MeasureType.HEIGHT:
        this.height(options)
        break
      case MeasureType.TRIANGLE_HEIGHT:
        this.triangleHeight(options)
        break
      default:
        break
    }
    return this
  }

  /**
   *
   * @returns {Measure}
   */
  deactivate() {
    this._layer.entities.removeAll()
    this._viewer.drawTool.tooltipMess = ''
    this._viewer.drawTool.deactivate()
    this._viewer.editTool.tooltipMess = ''
    this._viewer.editTool.deactivate()
    return this
  }
}

export default Measure
