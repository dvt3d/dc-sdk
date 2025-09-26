/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import { MouseEventType } from '../EventType'
import Event from '../Event'

/**
 * Mouse events in 3D scene, optimized Cesium event model
 */
class MouseEvent extends Event {
  constructor(viewer, options = {}) {
    super(MouseEventType)
    this._viewer = viewer
    this._selected = undefined
    this._enableEventPropagation = options.enableEventPropagation
    this._enableMouseOver = options.enableMouseOver
    this._enableMouseMovePick = options.enableMouseMovePick
    this._registerEvent()
    this._addDefaultEvent()
  }

  set enableEventPropagation(enableEventPropagation) {
    this._enableEventPropagation = enableEventPropagation
  }

  get enableEventPropagation() {
    return this._enableEventPropagation
  }

  set enableMouseOver(enableMouseOver) {
    this._enableMouseOver = enableMouseOver
  }

  get enableMouseOver() {
    return this._enableMouseOver
  }

  set enableMouseMovePick(enableMouseMovePick) {
    this._enableMouseMovePick = enableMouseMovePick
  }

  get enableMouseMovePick() {
    return this._enableMouseMovePick
  }

  /**
   *
   * @private
   */
  _registerEvent() {
    let handler = new Cesium.ScreenSpaceEventHandler(this._viewer.canvas)
    Object.keys(Cesium.ScreenSpaceEventType).forEach((key) => {
      let type = Cesium.ScreenSpaceEventType[key]
      this._cache[type] = new Cesium.Event()
      handler.setInputAction((movement) => {
        this._cache[type].raiseEvent(movement)
      }, type)
    })
  }

  /**
   * add default event for the viewer
   * @private
   */
  _addDefaultEvent() {
    this.on(this._types.LEFT_DOWN, this._leftDownHandler, this)
    this.on(this._types.LEFT_UP, this._leftUpHandler, this)
    this.on(this._types.CLICK, this._clickHandler, this)
    this.on(this._types.DB_CLICK, this._dbClickHandler, this)
    this.on(this._types.RIGHT_DOWN, this._rightDownHandler, this)
    this.on(this._types.RIGHT_UP, this._rightUpHandler, this)
    this.on(this._types.RIGHT_CLICK, this._rightClickHandler, this)
    this.on(this._types.MOUSE_MOVE, this._mouseMoveHandler, this)
    this.on(this._types.WHEEL, this._mouseWheelHandler, this)
  }

  /**
   * 调整位置，将视图位置从像素坐标转换为归一化设备独立像素坐标。
   * 这个函数用于处理不同设备上因DPI不同导致的显示问题，确保在高DPI设备上也能正确显示。
   *
   * @param {Object} position - 像素坐标，包含x和y属性。
   * @returns {Cesium.Cartesian2} - 归一化设备独立像素坐标。
   */
  _adjustPosition(position) {
    const rect = this._viewer.canvas.getBoundingClientRect()
    const scale_x = this._viewer.canvas.offsetWidth / rect.width
    const scale_y = this._viewer.canvas.offsetHeight / rect.height
    return new Cesium.Cartesian2(position.x * scale_x, position.y * scale_y)
  }

  /**
   *
   * @param {*} windowPosition
   * @returns
   */
  _getMousePosition(windowPosition) {
    let scene = this._viewer.scene
    let position = undefined
    let wgs84Position = undefined
    let surfacePosition = undefined
    let wgs84SurfacePosition = undefined

    const cartesianToWGS84 = (cartesian) => {
      if (!cartesian) {
        return undefined
      }
      let c = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian)
      if (!c) {
        return undefined
      }
      return {
        lng: Cesium.Math.toDegrees(c.longitude),
        lat: Cesium.Math.toDegrees(c.latitude),
        alt: c.height,
      }
    }

    if (scene.pickPositionSupported) {
      position = scene.pickPosition(windowPosition)
      wgs84Position = cartesianToWGS84(position)
    }

    if (
      scene.mode === Cesium.SceneMode.SCENE3D &&
      !(this._viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider)
    ) {
      let ray = scene.camera.getPickRay(windowPosition)
      surfacePosition = scene.globe.pick(ray, scene)
    } else {
      surfacePosition = scene.camera.pickEllipsoid(
        windowPosition,
        Cesium.Ellipsoid.WGS84
      )
    }
    wgs84SurfacePosition = cartesianToWGS84(surfacePosition)
    return {
      windowPosition,
      position,
      wgs84Position,
      surfacePosition,
      wgs84SurfacePosition,
    }
  }

  /**
   *
   * Gets the mouse information for the mouse event
   * @param position
   * @private
   *
   */
  _getMouseInfo(position) {
    return {
      ...this._getMousePosition(this._adjustPosition(position)),
      target: this._viewer.scene.pick(this._adjustPosition(position)),
    }
  }

  /**
   * Gets the drill pick overlays for the mouse event
   * @param windowPosition
   * @param exclude
   * @returns {*[]}
   * @private
   */
  _getDrillInfos(windowPosition, exclude) {
    let drillInfos = []
    const scene = this._viewer.scene
    const targets = scene.drillPick(windowPosition) || []
    for (const target of targets) {
      const targetInfo = this._getTargetInfo(target)
      if (targetInfo?.overlay?.overlayId !== exclude.overlayId) {
        drillInfos.push(targetInfo)
      }
    }
    return drillInfos
  }

  /**
   *
   * @param target
   * @returns {{overlayId: (function(): Overlay._id)|*, layerId: (function(): Layer._id)|string|*, object: undefined, feature: undefined}}
   * @private
   */
  _getTargetObject(target) {
    let feature = null
    let object = null
    if (target?.id instanceof Cesium.Entity) {
      object = target.id
    } else if (target instanceof Cesium.Cesium3DTileFeature) {
      object = target.tileset
      feature = target
    } else if (target?.primitive instanceof Cesium.Cesium3DTileset) {
      object = target.primitive
    } else if (target?.primitive) {
      object = target.primitive
    }
    return {
      overlayId: object?.overlayId,
      layerId: object?.layerId,
      object,
      feature,
    }
  }

  /**
   * Returns the target information for the mouse event
   * @param target
   * @returns {{instanceId: *, overlay: undefined, feature: undefined, layer: undefined}}
   * @private
   */
  _getTargetInfo(target) {
    const { overlayId, layerId, feature } = this._getTargetObject(target)
    const layers = this._viewer.getLayers()
    const layer = layerId
      ? layers.find((item) => item.layerId === layerId)
      : null
    const overlay =
      overlayId && layer?.getOverlay ? layer.getOverlay(overlayId) : null
    if (overlay && feature?.getPropertyNames) {
      let propertyNames = feature.getPropertyNames() || []
      for (const propertyName of propertyNames) {
        overlay.attr[propertyName] = feature.getProperty(propertyName)
      }
    }
    return {
      layer: layer,
      overlay: overlay,
      feature: feature,
      instanceId: target?.instanceId,
    }
  }

  /**
   * Trigger subscription event
   * @param type
   * @param mouseInfo
   * @private
   */
  _raiseEvent(type, mouseInfo = {}) {
    const targetInfo = this._getTargetInfo(mouseInfo.target) || {}
    const { overlay, layer } = targetInfo

    const doRaise = (eventHost, payload) => {
      if (!eventHost || typeof eventHost.getEvent !== 'function') return false
      const event = eventHost.getEvent(type)
      if (!event || event.numberOfListeners <= 0) return false
      event.raiseEvent(payload)
      return true
    }

    // raise event for overlay
    const eventParams = { ...targetInfo, ...mouseInfo }
    let handled = doRaise(overlay?.overlayEvent, eventParams)
    if (overlay?.allowDrillPicking) {
      const drillInfos =
        this._getDrillInfos(mouseInfo.windowPosition, overlay) || []
      for (const drillInfo of drillInfos) {
        const dOverlay = drillInfo?.overlay
        const dLayer = drillInfo?.layer
        const drillEventParams = { ...drillInfo, ...mouseInfo }
        let dHandled = doRaise(dOverlay.overlayEvent, drillEventParams)
        if (!dHandled) {
          doRaise(dLayer?.layerEvent, drillEventParams)
        }
      }
    }

    // raise event for layer
    if (!handled || this._enableEventPropagation) {
      handled = doRaise(layer?.layerEvent, eventParams)
    }

    // raise event for viewer
    if (!handled || this._enableEventPropagation) {
      doRaise(this._viewer?.viewerEvent, eventParams)
    }
  }

  /**
   * Default click event handler
   * @param movement
   * @returns {boolean}
   * @private
   */
  _clickHandler(movement) {
    if (!movement?.position) {
      return false
    }
    this._raiseEvent(
      MouseEventType.CLICK,
      this._getMouseInfo(movement.position)
    )
  }

  /**
   * Default dbClick event handler
   * @param movement
   * @returns {boolean}
   * @private
   */
  _dbClickHandler(movement) {
    if (!movement?.position) {
      return false
    }
    this._raiseEvent(
      MouseEventType.DB_CLICK,
      this._getMouseInfo(movement.position)
    )
  }

  /**
   * Default rightClick event handler
   * @param movement
   * @returns {boolean}
   * @private
   */
  _rightClickHandler(movement) {
    if (!movement?.position) {
      return false
    }
    this._raiseEvent(
      MouseEventType.RIGHT_CLICK,
      this._getMouseInfo(movement.position)
    )
  }

  /**
   * Default mousemove event handler
   * @param movement
   * @returns {boolean}
   * @private
   */
  _mouseMoveHandler(movement) {
    if (!movement?.endPosition) {
      return false
    }
    if (this._enableMouseMovePick) {
      let mouseInfo = this._getMouseInfo(movement.endPosition)
      this._viewer.canvas.style.cursor = mouseInfo.target
        ? 'pointer'
        : 'default'
      this._raiseEvent(MouseEventType.MOUSE_MOVE, mouseInfo)
      if (this._enableMouseOver) {
        if (
          !this._selected ||
          this._getTargetObject(this._selected.target).overlayId !==
            this._getTargetObject(mouseInfo.target).overlayId
        ) {
          // add event for overlay
          this._raiseEvent(MouseEventType.MOUSE_OUT, this._selected)
          this._raiseEvent(MouseEventType.MOUSE_OVER, mouseInfo)
          this._selected = mouseInfo
        }
      }
    } else {
      this._raiseEvent(
        MouseEventType.MOUSE_MOVE,
        this._getMousePosition(this._adjustPosition(movement.endPosition))
      )
    }
  }

  /**
   * Default mouse left down event handler
   * @param movement
   * @private
   */
  _leftDownHandler(movement) {
    if (!movement?.position) {
      return false
    }
    this._raiseEvent(
      MouseEventType.LEFT_DOWN,
      this._getMouseInfo(movement.position)
    )
  }

  /**
   * Default mouse left up event handler
   * @param movement
   * @private
   */
  _leftUpHandler(movement) {
    if (!movement?.position) {
      return false
    }
    this._raiseEvent(
      MouseEventType.LEFT_UP,
      this._getMouseInfo(movement.position)
    )
  }

  /**
   * Default mouse right down event handler
   * @param movement
   * @private
   */
  _rightDownHandler(movement) {
    if (!movement?.position) {
      return false
    }
    this._raiseEvent(
      MouseEventType.RIGHT_DOWN,
      this._getMouseInfo(movement.position)
    )
  }

  /**
   * Default mouse right up event handler
   * @param movement
   * @private
   */
  _rightUpHandler(movement) {
    if (!movement?.position) {
      return false
    }
    this._raiseEvent(
      MouseEventType.RIGHT_UP,
      this._getMouseInfo(movement.position)
    )
  }

  /**
   * Default mouse wheel event handler
   * @param movement
   * @private
   */
  _mouseWheelHandler(movement) {
    this._raiseEvent(MouseEventType.WHEEL, { movement })
  }
}

export default MouseEvent
