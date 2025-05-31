import { Cesium } from '../../libs'
import { Layer } from '../layer'
import State from '../state/State'
import { createWebGLHeatmap } from './webgl-heatmap'

const WMP = new Cesium.WebMercatorProjection()

const DEF_OPTS = {
  radius: 30,
  height: 0,
  gradient: undefined,
  useGround: false,
  classificationType: 2,
}

class HeatMapLayer extends Layer {
  constructor(id, options = {}) {
    super(id)
    this._options = {
      ...DEF_OPTS,
      ...options,
    }
    this._delegate = new Cesium.PrimitiveCollection()
    this._isGround = this._options.useGround
    this._canvas = document.createElement('canvas')
    this._canvas.setAttribute('id', id)
    this._heat = undefined
    this._scale = 1
    this._points = []
    this._bounds = new Cesium.Rectangle()
    this._boundsInMeter = undefined
    this._primitive = this._delegate.add(
      this._isGround
        ? new Cesium.GroundPrimitive({
            geometryInstances: new Cesium.GeometryInstance({
              geometry: {},
            }),
            classificationType: this._options.classificationType,
          })
        : new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
              geometry: {},
            }),
          })
    )
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('heat-map')
  }

  /**
   *
   * @private
   */
  _addedHook() {
    this._canvas.style.cssText = `
      visibility:hidden;
      width:${this._viewer.canvas.width}px;
      height:${this._viewer.canvas.height}px;
    `
    this._viewer.layerContainer.appendChild(this._canvas)
    if (this._points && this._points.length) {
      this._heat = createWebGLHeatmap({
        canvas: this._canvas,
        gradientTexture: this._createGradientTexture(),
      })
      this._scale = Math.min(
        Math.abs(this._boundsInMeter.west - this._boundsInMeter.east) /
          this._viewer.canvas.width,
        Math.abs(this._boundsInMeter.north - this._boundsInMeter.south) /
          this._viewer.canvas.height
      )
      this._heat.blur()
      this._heat.addPoints(this._parsePoints(this._points))
      this._update()
    }
  }

  /**
   *
   * @returns {HTMLCanvasElement|undefined}
   * @private
   */
  _createGradientTexture() {
    if (!this._options.gradient) {
      return undefined
    }
    let canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 10
    let ctx = canvas.getContext('2d')
    let grd = ctx.createLinearGradient(0, 0, 200, 0)
    for (let key in this._options.gradient) {
      grd.addColorStop(+key, this._options.gradient[key])
    }
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, 200, 10)
    return canvas
  }

  /**
   *
   * @param points
   * @returns {*}
   * @private
   */
  _parsePoints(points) {
    return points.map((point) => {
      let c = WMP.project(Cesium.Cartographic.fromDegrees(point.lng, point.lat))
      return {
        x: (c.x - this._boundsInMeter.west) / this._scale,
        y: (c.y - this._boundsInMeter.south) / this._scale,
        size: this._options.radius,
        intensity: point.value || Math.random(),
      }
    })
  }

  /**
   *
   * @private
   */
  _computeBounds() {
    Cesium.Rectangle.fromCartographicArray(
      this._points.map((item) =>
        Cesium.Cartographic.fromDegrees(item.lng, item.lat)
      ),
      this._bounds
    )
  }

  /**
   *
   * @returns {{east, south, north, west}}
   * @private
   */
  _computeBoundsInMeter() {
    let swInMeter = WMP.project(Cesium.Rectangle.southwest(this._bounds))
    let neInMeter = WMP.project(Cesium.Rectangle.northeast(this._bounds))
    this._boundsInMeter = new Cesium.Rectangle(
      swInMeter.x,
      swInMeter.y,
      neInMeter.x,
      neInMeter.y
    )
  }

  /**
   *
   * @returns {boolean}
   * @private
   */
  _update() {
    if (!this._points || !this._points.length) {
      return false
    }
    this._heat.adjustSize()
    this._heat.update()
    this._heat.display()
    if (this._primitive && this._primitive.geometryInstances) {
      this._primitive.geometryInstances.geometry = new Cesium.RectangleGeometry(
        {
          rectangle: this._bounds,
          height: this._options.height,
        }
      )
    }
    this._primitive.appearance = new Cesium.MaterialAppearance({
      material: new Cesium.Material({
        fabric: {
          type: 'Heat-Image',
          uniforms: {
            image: this._canvas,
          },
          source: `
             uniform sampler2D image;
             czm_material czm_getMaterial(czm_materialInput materialInput){
               czm_material material = czm_getDefaultMaterial(materialInput);
               vec2 st = materialInput.st;
               vec4 colorImage = texture(image,st);
               if(colorImage.rgb == vec3(1.0) || colorImage.rgb == vec3(0.0)){
                  discard;
               }
               material.diffuse = colorImage.rgb;
               material.alpha = colorImage.a;
               return material;
             }
            `,
        },
        translucent: function (material) {
          return true
        },
      }),
      flat: true,
    })
  }

  /**
   *
   * @param points
   * @returns {HeatMapLayer}
   */
  setPoints(points) {
    this._points = points
    this._computeBounds()
    this._computeBoundsInMeter()
    if (this._viewer) {
      this._scale = Math.min(
        Math.abs(this._boundsInMeter.west - this._boundsInMeter.east) /
          this._viewer.canvas.width,
        Math.abs(this._boundsInMeter.north - this._boundsInMeter.south) /
          this._viewer.canvas.height
      )
      this._heat = createWebGLHeatmap({
        canvas: this._canvas,
        gradientTexture: this._createGradientTexture(),
      })
    }
    if (this._heat) {
      this._heat.blur()
      this._heat.addPoints(this._parsePoints(this._points))
      this._update()
    }

    return this
  }

  /**
   *
   * @return {HeatMapLayer}
   */
  clear() {
    this._heat.clear()
    this._points = []
    this._state = State.CLEARED
    return this
  }
}

Layer.registerType('heat-map')

export default HeatMapLayer
