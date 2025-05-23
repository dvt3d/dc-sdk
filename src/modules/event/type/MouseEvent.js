/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../namespace'
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
   * @param {*} position
   * @returns
   */
  _getMousePosition(position) {
    let scene = this._viewer.scene
    let cartesian = undefined
    let surfaceCartesian = undefined
    let wgs84Position = undefined
    let wgs84SurfacePosition = undefined
    if (scene.pickPositionSupported) {
      cartesian = scene.pickPosition(position)
    }
    if (cartesian) {
      let c = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian)
      if (c) {
        wgs84Position = {
          lng: Cesium.Math.toDegrees(c.longitude),
          lat: Cesium.Math.toDegrees(c.latitude),
          alt: c.height,
        }
      }
    }
    if (
      scene.mode === Cesium.SceneMode.SCENE3D &&
      !(this._viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider)
    ) {
      let ray = scene.camera.getPickRay(position)
      surfaceCartesian = scene.globe.pick(ray, scene)
    } else {
      surfaceCartesian = scene.camera.pickEllipsoid(
        position,
        Cesium.Ellipsoid.WGS84
      )
    }
    if (surfaceCartesian) {
      let c = Cesium.Ellipsoid.WGS84.cartesianToCartographic(surfaceCartesian)
      if (c) {
        wgs84SurfacePosition = {
          lng: Cesium.Math.toDegrees(c.longitude),
          lat: Cesium.Math.toDegrees(c.latitude),
          alt: c.height,
        }
      }
    }
    return {
      windowPosition: position,
      position: cartesian,
      wgs84Position: wgs84Position,
      surfacePosition: surfaceCartesian,
      wgs84SurfacePosition: wgs84SurfacePosition,
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
   * @param position
   * @returns {[]}
   * @private
   */
  _getDrillInfos(position) {
    let drillInfos = []
    let scene = this._viewer.scene
    let targets = scene.drillPick(position)
    if (targets && targets.length) {
      targets.forEach((target) => {
        drillInfos.push(this._getTargetInfo(target))
      })
    }
    return drillInfos
  }

  /**
   * Return the Overlay id
   * @param target
   * @returns {any}
   * @private
   */
  _getOverlayId(target) {
    let overlayId = undefined

    // for Entity
    if (target?.id instanceof Cesium.Entity) {
      overlayId = target.id.overlayId
    }

    // for Cesium3DTileFeature
    else if (target instanceof Cesium.Cesium3DTileFeature) {
      overlayId = target.tileset.overlayId
    }

    // for Cesium3DTileset
    else if (target?.primitive instanceof Cesium.Cesium3DTileset) {
      overlayId = target.primitive.overlayId
    }

    // for Primitive
    else if (target?.primitive) {
      overlayId = target.primitive.overlayId
    }

    return overlayId
  }

  /**
   * Returns the target information for the mouse event
   * @param target
   * @returns {{instanceId: *, overlay: undefined, feature: undefined, layer: undefined}}
   * @private
   */
  _getTargetInfo(target) {
    let overlay = undefined
    let layer = undefined
    let feature = undefined

    // for Entity
    if (target?.id instanceof Cesium.Entity) {
      layer = this._viewer
        .getLayers()
        .filter((item) => item.layerId === target.id.layerId)[0]
      if (layer?.getOverlay) {
        overlay = layer.getOverlay(target.id.overlayId)
      }
    }

    // for Cesium3DTileFeature
    else if (target instanceof Cesium.Cesium3DTileFeature) {
      layer = this._viewer
        .getLayers()
        .filter((item) => item.layerId === target.tileset.layerId)[0]
      feature = target
      if (layer?.getOverlay) {
        overlay = layer.getOverlay(target.tileset.overlayId)
        if (feature && feature.getPropertyNames) {
          let propertyNames = feature.getPropertyNames()
          propertyNames.forEach((item) => {
            overlay.attr[item] = feature.getProperty(item)
          })
        }
      }
    }

    // for Cesium3DTileset
    else if (target?.primitive instanceof Cesium.Cesium3DTileset) {
      layer = this._viewer
        .getLayers()
        .filter((item) => item.layerId === target.primitive.layerId)[0]
      if (layer?.getOverlay) {
        overlay = layer.getOverlay(target.primitive.overlayId)
      }
    }

    // for Primitive
    else if (target?.primitive) {
      layer = this._viewer
        .getLayers()
        .filter((item) => item.layerId === target.primitive.layerId)[0]
      if (layer?.getOverlay) {
        overlay = layer.getOverlay(target.primitive.overlayId)
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
    let event = undefined
    let targetInfo = this._getTargetInfo(mouseInfo.target)
    let overlay = targetInfo?.overlay
    let layer = targetInfo?.layer

    // get Overlay Event
    if (overlay?.overlayEvent) {
      event = overlay.overlayEvent.getEvent(type)
      event &&
        event.numberOfListeners > 0 &&
        event.raiseEvent({
          ...targetInfo,
          ...mouseInfo,
        })
    }

    // get Layer Event
    if (
      (!event || event.numberOfListeners === 0 || this._eventPropagation) &&
      layer?.layerEvent
    ) {
      event = layer.layerEvent.getEvent(type)
      event &&
        event.numberOfListeners > 0 &&
        event.raiseEvent({
          ...targetInfo,
          ...mouseInfo,
        })
    }

    // get Viewer Event
    if (
      (!event ||
        event.numberOfListeners === 0 ||
        this._enableEventPropagation) &&
      this._viewer?.viewerEvent
    ) {
      event = this._viewer.viewerEvent.getEvent(type)
      event &&
        event.numberOfListeners > 0 &&
        event.raiseEvent({
          ...targetInfo,
          ...mouseInfo,
        })
    }

    // get Drill Pick Event
    if (overlay?.allowDrillPicking) {
      let drillInfos = this._getDrillInfos(mouseInfo.windowPosition)
      drillInfos.forEach((drillInfo) => {
        let dillOverlay = drillInfo?.overlay
        let dillLayer = drillInfo?.layer
        if (
          dillOverlay?.overlayId !== overlay.overlayId &&
          dillOverlay?.overlayEvent
        ) {
          // get Overlay Event
          event = dillOverlay.overlayEvent.getEvent(type)
          // get Layer Event
          if (
            (!event || event.numberOfListeners === 0) &&
            dillLayer?.layerEvent
          ) {
            event = dillLayer.layerEvent.getEvent(type)
          }
          event &&
            event.numberOfListeners > 0 &&
            event.raiseEvent({
              ...drillInfo,
              ...mouseInfo,
            })
        }
      })
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
      // add event for overlay
      if (this._enableMouseOver) {
        if (
          !this._selected ||
          this._getOverlayId(this._selected.target) !==
            this._getOverlayId(mouseInfo.target)
        ) {
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
