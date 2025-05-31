/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import { Layer } from '../layer'
import State from '../state/State'
import Field from './Field'
import WindCanvas from './WindCanvas'

const DEF_OPTS = {
  globalAlpha: 0.9,
  lineWidth: 1,
  colorScale: '#fff',
  velocityScale: 1 / 25,
  maxAge: 90,
  paths: 800,
  frameRate: 20,
  useCoordsDraw: true,
  gpet: true,
}

class WindLayer extends Layer {
  constructor(id, options = {}) {
    super(id)
    this._options = {
      ...DEF_OPTS,
      ...options,
    }
    this._data = undefined
    this._canvas = document.createElement('canvas')
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('wind')
  }

  set show(show) {
    this._show = show
    this._canvas.style.visibility = show ? 'visible' : 'hidden'
  }

  get show() {
    return this._show
  }

  /**
   *
   * @param data
   * @returns {Field|undefined}
   * @private
   */
  _formatData(data) {
    let uComp
    let vComp
    data.forEach(function (record) {
      switch (
        record.header.parameterCategory +
        ',' +
        record.header.parameterNumber
      ) {
        case '1,2':
        case '2,2':
          uComp = record
          break
        case '1,3':
        case '2,3':
          vComp = record
          break
      }
    })
    if (!vComp || !uComp) {
      return undefined
    }
    let header = uComp.header
    return new Field({
      xmin: header.lo1,
      ymin: header.la1,
      xmax: header.lo2,
      ymax: header.la2,
      deltaX: header.dx,
      deltaY: header.dy,
      cols: header.nx,
      rows: header.ny,
      us: uComp.data,
      vs: vComp.data,
    })
  }

  /**
   *
   * @private
   */
  _mountCanvas() {
    if (!this._viewer || !this._canvas) {
      return
    }
    this._canvas.style.cssText =
      'position:absolute; left:0; top:0;user-select:none;pointer-events: none;'
    this._canvas.className = 'dc-wind-layer'
    const { width, height } = this._viewer.canvas
    this._canvas.width = width
    this._canvas.height = height
    this._canvas.style.width = width + 'px'
    this._canvas.style.height = height + 'px'
    this._viewer.layerContainer.appendChild(this._canvas)
  }

  /**
   *
   * @private
   */
  _addedHook() {
    let scene = this._viewer.scene
    let camera = this._viewer.camera
    let ellipsoid = Cesium.Ellipsoid.WGS84
    this._delegate.intersectsCoordinate = (coordinate) => {
      if (scene.mode === Cesium.SceneMode.SCENE3D) {
        let occluder = new Cesium.EllipsoidalOccluder(
          ellipsoid,
          camera.position
        )
        let point = Cesium.Cartesian3.fromDegrees(coordinate[0], coordinate[1])
        return occluder.isPointVisible(point)
      } else if (scene.mode === Cesium.SceneMode.SCENE2D) {
        return !(coordinate[0] === -180 || coordinate[0] === 180)
      }
      return true
    }

    this._delegate.project = (coordinate) => {
      let position = Cesium.Cartesian3.fromDegrees(coordinate[0], coordinate[1])
      let coord = Cesium.SceneTransforms.worldToWindowCoordinates(
        scene,
        position
      )
      return [coord.x, coord.y]
    }

    this._delegate.unProject = (pixel) => {
      let pick = new Cesium.Cartesian2(pixel[0], pixel[1])
      let cartesian = undefined
      if (scene.mode === Cesium.SceneMode.SCENE3D) {
        cartesian = scene.globe.pick(camera.getPickRay(pick), scene)
      } else {
        cartesian = scene.camera.pickEllipsoid(pick, ellipsoid)
      }
      if (!cartesian) {
        return null
      }
      let cartographic = ellipsoid.cartesianToCartographic(cartesian)
      let lat = Cesium.Math.toDegrees(cartographic.latitude)
      let lng = Cesium.Math.toDegrees(cartographic.longitude)
      return [lng, lat]
    }
  }

  /**
   *
   * @param viewer
   * @private
   */
  _onAdd(viewer) {
    this._viewer = viewer
    this._mountCanvas()
    let ctx = this._canvas.getContext('2d')
    if (!this._delegate) {
      this._delegate = new WindCanvas(ctx)
      this._delegate.setOptions(this._options)
      this._addedHook()
    }
    if (this._data) {
      this._delegate.setData(this._data)
      this._delegate.prerender()
      this._delegate.render()
    }
  }

  /**
   *
   * @private
   */
  _onRemove() {
    if (this._delegate) {
      this._delegate.stop()
    }
    if (this._canvas) {
      this._viewer.layerContainer.removeChild(this._canvas)
    }
    delete this._canvas
  }

  /**
   *
   * @param data
   * @param options
   * @returns {WindLayer}
   */
  setData(data, options) {
    if (data && data.checkFields && data.checkFields()) {
      this._data = data
    } else if (Array.isArray(data)) {
      this._data = this._formatData(data)
    }
    if (this._delegate) {
      this._delegate.setData(this._data)
      if (options) {
        this._options = {
          ...this._options,
          ...options,
        }
        this._delegate.setOptions(this._options)
      }
      this._delegate.prerender()
      this._delegate.render()
    }
    return this
  }

  /**
   *
   * @param options
   * @returns {WindLayer}
   */
  setOptions(options) {
    this._options = {
      ...this._options,
      ...options,
    }
    if (this._delegate) {
      this._delegate.setOptions(this._options)
      this._delegate.prerender()
      this._delegate.render()
    }
    return this
  }
}

Layer.registerType('wind')

export default WindLayer
