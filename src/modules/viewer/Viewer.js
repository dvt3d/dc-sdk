/**
 * @Author: Caven
 * @Date: 2019-12-27 17:13:24
 */

import { Cesium } from '../../libs'
import { getParam } from '../../global-api'
import Parse from '../parse/Parse'
import {
  LayerGroupEventType,
  LayerEventType,
  MouseEvent,
  ViewerEvent,
  SceneEvent,
} from '../event'
import { ViewerOption, CameraOption } from '../option'
import { Util, DomUtil } from '../utils'
import { Transform } from '../transform'
import createWidgets from '../widget'
import createTools from '../tools'
import { BaseLayerPicker } from '../exts'

const DEF_OPTS = {
  creditContainer: document.createElement('div'),
  creditViewport: document.createElement('div'),
  baseLayer: false,
  shouldAnimate: true,
}

class Viewer {
  constructor(container, options = {}) {
    __cmdOut && __cmdOut()
    if (
      !container ||
      (typeof container === 'string' && !document.getElementById(container))
    ) {
      throw new Error('Viewer: the container is empty')
    }
    if (container instanceof HTMLElement) {
      throw new Error('Viewer: not support the type container')
    }

    if (typeof container === 'string') {
      const baseUrl = getParam('baseUrl')
      baseUrl && Cesium.buildModuleUrl.setBaseUrl(baseUrl) // Initialize the Cesium_BASE_URL
    }

    this._delegate =
      typeof container !== 'string'
        ? container
        : new Cesium.CesiumWidget(container, {
            ...DEF_OPTS,
            ...options,
          }) // Initialize the viewer
    this._delegate.canvas.parentNode.className = 'viewer-canvas' //re-name the default class

    /**
     *  Registers events
     */
    this._mouseEvent = new MouseEvent(this, options) // Register global mouse events
    this._viewerEvent = new ViewerEvent() // Register viewer events
    this._sceneEvent = new SceneEvent(this) // Register scene events

    this._viewerOption = new ViewerOption(this) // Initialize the viewer option
    this._cameraOption = new CameraOption(this) // Initialize the camera option

    /**
     * Registers Container
     *
     */
    this._widgetContainer = DomUtil.create(
      'div',
      'viewer-widgets',
      typeof container === 'string'
        ? document.getElementById(container)
        : this._delegate.container
    ) //Register the widgets container

    this._layerContainer = DomUtil.create(
      'div',
      'viewer-layers',
      typeof container === 'string'
        ? document.getElementById(container)
        : this._delegate.container
    ) //Register the layers container

    this._baseLayerPicker = new BaseLayerPicker({
      globe: this._delegate.scene.globe,
    }) //Initialize the baseLayer picker

    this._layerGroupCache = {}
    this._layerCache = {}

    /**
     * Registers default widgets
     */
    let widgets = createWidgets()
    Object.keys(widgets).forEach((key) => {
      this._use(widgets[key])
    })

    /**
     * Registers default tools
     */
    let tools = createTools()
    Object.keys(tools).forEach((key) => {
      this._use(tools[key])
    })
  }

  get delegate() {
    return this._delegate
  }

  get container() {
    return this._delegate.container
  }

  get widgetContainer() {
    return this._widgetContainer
  }

  get layerContainer() {
    return this._layerContainer
  }

  get scene() {
    return this._delegate.scene
  }

  get camera() {
    return this._delegate.camera
  }

  get canvas() {
    return this._delegate.scene.canvas
  }

  get dataSources() {
    return this._delegate.dataSources
  }

  get imageryLayers() {
    return this._delegate.imageryLayers
  }

  get terrainProvider() {
    return this._delegate.terrainProvider
  }

  get entities() {
    return this._delegate.entities
  }

  get postProcessStages() {
    return this._delegate.scene.postProcessStages
  }

  get clock() {
    return this._delegate.clock
  }

  get viewerEvent() {
    return this._viewerEvent
  }

  get cameraPosition() {
    let position = Transform.transformCartographicToWGS84(
      this.camera?.positionCartographic
    )
    if (position) {
      position.heading = Cesium.Math.toDegrees(this.camera?.heading ?? 0)
      position.pitch = Cesium.Math.toDegrees(this.camera?.pitch ?? 0)
      position.roll = Cesium.Math.toDegrees(this.camera?.roll ?? 0)
    }
    return position
  }

  get resolution() {
    let width = this.scene.canvas.width
    let height = this.scene.canvas.height
    let min = Transform.transformWindowToWGS84(
      new Cesium.Cartesian2((width / 2) | 0, height - 1),
      this
    )
    let max = Transform.transformWindowToWGS84(
      new Cesium.Cartesian2((1 + width / 2) | 0, height - 1),
      this
    )
    if (!min || !max) {
      return 1
    }
    return Math.abs(min.lng - max.lng)
  }

  get viewBounds() {
    let width = this.scene.canvas.width
    let height = this.scene.canvas.height
    let min = Transform.transformWindowToWGS84(
      new Cesium.Cartesian2(0, height),
      this
    )
    let max = Transform.transformWindowToWGS84(
      new Cesium.Cartesian2(width, 0),
      this
    )
    if (!min || !max) {
      return Cesium.Rectangle.MAX_VALUE
    }
    return Cesium.Rectangle.fromDegrees(min.lng, min.lat, max.lng, max.lat)
  }

  get zoom() {
    let height = this.camera.positionCartographic.height
    let A = 40487.57
    let B = 0.00007096758
    let C = 91610.74
    let D = -40467.74
    return Math.round(D + (A - D) / (1 + Math.pow(height / C, B)))
  }

  set enableEventPropagation(enableEventPropagation) {
    this._mouseEvent.enableEventPropagation = enableEventPropagation
  }

  get enableEventPropagation() {
    return this._mouseEvent.enableEventPropagation
  }

  set enableMouseOver(enableMouseOver) {
    this._mouseEvent.enableMouseOver = enableMouseOver
  }

  get enableMouseOver() {
    return this._mouseEvent.enableMouseOver
  }

  set enableMouseMovePick(enableMouseMovePick) {
    this._mouseEvent.enableMouseMovePick = enableMouseMovePick
  }

  get enableMouseMovePick() {
    return this._mouseEvent.enableMouseMovePick
  }

  /**
   * Adds a plugin
   * @param plugin
   * @returns {Viewer}
   */
  _use(plugin) {
    if (plugin && plugin.install) {
      plugin.install(this)
    }
    return this
  }

  /***
   *
   * @param layerGroup
   * @private
   */
  _addLayerGroup(layerGroup) {
    if (
      layerGroup?.layerGroupEvent &&
      // eslint-disable-next-line no-prototype-builtins
      !Object(this._layerGroupCache).hasOwnProperty(layerGroup.id)
    ) {
      layerGroup.layerGroupEvent.fire(LayerGroupEventType.ADD, this)
      this._layerGroupCache[layerGroup.id] = layerGroup
    }
  }

  /**
   *
   * @param layerGroup
   * @private
   */
  _removeLayerGroup(layerGroup) {
    if (
      layerGroup?.layerGroupEvent &&
      // eslint-disable-next-line no-prototype-builtins
      Object(this._layerGroupCache).hasOwnProperty(layerGroup.id)
    ) {
      layerGroup.layerGroupEvent.fire(LayerGroupEventType.REMOVE, this)
      delete this._layerGroupCache[layerGroup.id]
    }
  }

  /**
   * @param layer
   * @private
   */
  _addLayer(layer) {
    !this._layerCache[layer.type] && (this._layerCache[layer.type] = {})
    // eslint-disable-next-line no-prototype-builtins
    if (!Object(this._layerCache[layer.type]).hasOwnProperty(layer.id)) {
      layer.fire(LayerEventType.ADD, this)
      this._layerCache[layer.type][layer.id] = layer
    }
  }

  /**
   * @param layer
   * @private
   */
  _removeLayer(layer) {
    // eslint-disable-next-line no-prototype-builtins
    if (Object(this._layerCache[layer.type]).hasOwnProperty(layer.id)) {
      layer.fire(LayerEventType.REMOVE, this)
      delete this._layerCache[layer.type][layer.id]
    }
  }

  /**
   * Sets viewer options
   * @param options
   * @returns {Viewer}
   */
  setOptions(options) {
    this._viewerOption.setOptions(options)
    return this
  }

  /**
   * Sets camera pitch range
   * @param min
   * @param max
   * @returns {Viewer}
   */
  setPitchRange(min = -90, max = -20) {
    this._cameraOption.setPitchRange(min, max)
    return this
  }

  /**
   * Changes Scene Mode，2：2D，2.5：2.5D，3：3D
   * @param sceneMode
   * @param duration
   * @returns {Viewer}
   */
  changeSceneMode(sceneMode, duration = 0) {
    if (sceneMode === 2) {
      this._delegate.scene.morphTo2D(duration)
    } else if (sceneMode === 3) {
      this._delegate.scene.morphTo3D(duration)
    } else if (sceneMode === 2.5) {
      this._delegate.scene.morphToColumbusView(duration)
    }
    return this
  }

  /**
   * Changes Mouse Mode，0：Default，1: Change the tiltEventTypes to CameraEventType.RIGHT_DRAG
   * @param mouseMode
   * @returns {Viewer}
   */
  changeMouseMode(mouseMode) {
    this._cameraOption.changeMouseMode(mouseMode)
    return this
  }

  /**
   *
   * @param terrain
   * @return {Viewer}
   */
  setTerrain(terrain) {
    this._delegate.scene.setTerrain(
      new Cesium.Terrain(
        terrain || Promise.resolve(new Cesium.EllipsoidTerrainProvider())
      )
    )
    return this
  }

  /**
   * Adds the baseLayer .
   * The baseLayer can be a single or an array,
   * and when the baseLayer is an array, the baseLayer will be loaded together
   * @param baseLayer
   * @param options
   * @returns {Viewer}
   */
  addBaseLayer(baseLayer, options = {}) {
    if (!baseLayer) {
      return this
    }
    this._baseLayerPicker.addImageryLayer(baseLayer, options)
    if (!this._baseLayerPicker.selectedImageryLayer) {
      this._baseLayerPicker.changeImageryLayer(0)
    }
    this['mapSwitch'] && this['mapSwitch'].addMap(options)
    return this
  }

  /**
   * Changes the current globe display of the baseLayer
   * @param index
   * @returns {Viewer}
   */
  changeBaseLayer(index) {
    this._baseLayerPicker.changeImageryLayer(index)
    return this
  }

  /**
   *
   * @param windowPosition
   * @returns {Promise}
   */
  getImageryLayerInfo(windowPosition) {
    let ray = this._delegate.camera.getPickRay(windowPosition)
    return this._delegate.imageryLayers.pickImageryLayerFeatures(
      ray,
      this._delegate.scene
    )
  }

  /**
   *
   * @param layerGroup
   * @returns {Viewer}
   */
  addLayerGroup(layerGroup) {
    this._addLayerGroup(layerGroup)
    return this
  }

  /**
   *
   * @param layerGroup
   * @returns {Viewer}
   */
  removeLayerGroup(layerGroup) {
    this._removeLayerGroup(layerGroup)
    return this
  }

  /**
   *
   * @param id
   * @returns {undefined}
   */
  getLayerGroup(id) {
    return this._layerGroupCache[id] || undefined
  }

  /**
   * add a layer
   * @param layer
   * @returns {Viewer}
   */
  addLayer(layer) {
    this._addLayer(layer)
    return this
  }

  /**
   * Removes a layer
   * @param layer
   * @returns {Viewer}
   */
  removeLayer(layer) {
    this._removeLayer(layer)
    return this
  }

  /**
   * Checks to see if the layer is included
   * @param layer
   * @returns {boolean}
   */
  hasLayer(layer) {
    // eslint-disable-next-line no-prototype-builtins
    return Object(this._layerCache[layer.type]).hasOwnProperty(layer.id)
  }

  /**
   * Returns a layer by id
   * @param id
   * @returns {*|undefined}
   */
  getLayer(id) {
    let filters = this.getLayers().filter((item) => item.id === id)
    return filters && filters.length ? filters[0] : undefined
  }

  /**
   * Returns all layers
   * @returns {[]}
   */
  getLayers() {
    let result = []
    Object.keys(this._layerCache).forEach((type) => {
      let cache = this._layerCache[type]
      Object.keys(cache).forEach((layerId) => {
        result.push(cache[layerId])
      })
    })
    return result
  }

  /**
   * Iterate through each layer and pass it as an argument to the callback function
   * @param method
   * @param context
   * @returns {Viewer}
   */
  eachLayer(method, context) {
    Object.keys(this._layerCache).forEach((type) => {
      let cache = this._layerCache[type]
      Object.keys(cache).forEach((layerId) => {
        method.call(context, cache[layerId])
      })
    })
    return this
  }

  /**
   * @param target
   * @param duration
   * @returns {Viewer}
   */
  flyTo(target, duration) {
    this._delegate.flyTo(target?.delegate || target, {
      duration,
    })
    return this
  }

  /**
   * @param target
   * @returns {Viewer}
   */
  zoomTo(target) {
    this._delegate.zoomTo(target?.delegate || target)
    return this
  }

  /**
   * Camera fly to a position
   * @param position
   * @param completeCallback
   * @param duration
   * @returns {Viewer}
   */
  flyToPosition(position, completeCallback, duration) {
    position = Parse.parsePosition(position)
    this.camera.flyTo({
      destination: Transform.transformWGS84ToCartesian(position),
      orientation: {
        heading: Cesium.Math.toRadians(position.heading),
        pitch: Cesium.Math.toRadians(position.pitch),
        roll: Cesium.Math.toRadians(position.roll),
      },
      complete: completeCallback,
      duration: duration,
    })
    return this
  }

  /**
   * Camera zoom to a position
   * @param position
   * @param completeCallback
   * @returns {Viewer}
   */
  zoomToPosition(position, completeCallback) {
    this.flyToPosition(position, completeCallback, 0)
    return this
  }

  /**
   * Camera fly to bounds
   * @param bounds
   * @param heading
   * @param pitch
   * @param roll
   * @param completeCallback
   * @param duration
   * @return {Viewer}
   */
  flyToBounds(
    bounds,
    { heading = 0, pitch = 0, roll = 0 },
    completeCallback,
    duration
  ) {
    if (!bounds) {
      return this
    }
    if (!Array.isArray(bounds)) {
      bounds = bounds.split(',')
    }
    this.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees(
        bounds[0],
        bounds[1],
        bounds[2],
        bounds[3]
      ),
      orientation: {
        heading: Cesium.Math.toRadians(heading),
        pitch: Cesium.Math.toRadians(pitch),
        roll: Cesium.Math.toRadians(roll),
      },
      complete: completeCallback,
      duration: duration,
    })
    return this
  }

  /**
   *
   * @param bounds
   * @param heading
   * @param pitch
   * @param roll
   * @param completeCallback
   * @return {Viewer}
   */
  zoomToBounds(bounds, { heading = 0, pitch = 0, roll = 0 }, completeCallback) {
    this.flyToBounds(bounds, { heading, pitch, roll }, completeCallback)
    return this
  }

  /**
   *
   * @param type
   * @param callback
   * @param context
   * @returns {Viewer}
   */
  on(type, callback, context) {
    this._viewerEvent.on(type, callback, context || this)
    this._sceneEvent.on(type, callback, context || this)
    return this
  }

  /**
   *
   * @param type
   * @param callback
   * @param context
   * @returns {Viewer}
   */
  once(type, callback, context) {
    this._viewerEvent.once(type, callback, context || this)
    return this
  }

  /**
   *
   * @param type
   * @param callback
   * @param context
   * @returns {Viewer}
   */
  off(type, callback, context) {
    this._viewerEvent.off(type, callback, context || this)
    this._sceneEvent.off(type, callback, context || this)
    return this
  }

  /**
   * Destroys the viewer.
   */
  destroy() {
    Object.keys(this._layerCache).forEach((type) => {
      let cache = this._layerCache[type]
      Object.keys(cache).forEach((layerId) => {
        this._removeLayer(cache[layerId])
      })
    })
    this._delegate.destroy()
    this._delegate = undefined
    this._baseLayerPicker = undefined
    this._layerCache = {}
    this._widgetContainer.parentNode.removeChild(this._widgetContainer)
    this._widgetContainer = undefined
    this._layerContainer.parentNode.removeChild(this._layerContainer)
    this._layerContainer = undefined
    return this
  }

  /**
   * Export scene to image
   * @param name
   * @returns {Viewer}
   */
  exportScene(name) {
    this.scene.render()
    let canvas = this.canvas
    let image = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream')
    let link = document.createElement('a')
    let blob = Util.dataURLtoBlob(image)
    let objUrl = URL.createObjectURL(blob)
    link.download = `${name || 'scene'}.png`
    link.href = objUrl
    link.click()
    return this
  }

  /**
   *
   * @returns
   */
  getOffset() {
    const offset = { x: 0, y: 0 }
    const container = this._delegate?.container
    if (container) {
      if (container.getBoundingClientRect) {
        const rect = container.getBoundingClientRect()
        offset.x = rect.left
        offset.y = rect.top
      } else {
        offset.x = container.offsetLeft
        offset.y = container.offsetTop
      }
    }
    return offset
  }

  /**
   *
   * @returns {Viewer}
   */
  resize() {
    this._delegate.resize()
    return this
  }
}

export default Viewer
