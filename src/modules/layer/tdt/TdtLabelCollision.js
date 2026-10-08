import { Cesium } from '../../../libs'
import { getTdtLabelBounds, getTdtLabelPosition } from './TdtLabelStyle'

// Only properties read by getTdtLabelBounds affect the relative box.
const BOUNDS_PROPERTIES = [
  'text',
  'font',
  'scale',
  'outlineWidth',
  'pixelOffset',
  'horizontalOrigin',
  'verticalOrigin',
  'width',
  'height',
]
const GRAPHIC_PROPERTIES = [
  ...BOUNDS_PROPERTIES,
  'show',
  'distanceDisplayCondition',
  'heightReference',
  'disableDepthTestDistance',
  'eyeOffset',
  'showBackground',
  'backgroundPadding',
]
const TERRAIN_UPDATE_INTERVAL = 250
const HAS_TEXT = /[^\n]/
const pointScratch = new Cesium.Cartesian2()
const scaledPositionScratch = new Cesium.Cartesian3()
const eyePositionScratch = new Cesium.Cartesian3()
const eyeOffsetScratch = new Cesium.Cartesian3()

class TdtLabelCollision {
  constructor(entities, context) {
    this._entities = entities
    this._context = context
    this._textWidths = new Map()
    this._positions = new WeakMap()
    this._terrainVersion = 0
    this._terrainDirty = false
    this._terrainImmediate = false
    this._lastTerrainUpdate = -Infinity
    this._bounds = new WeakMap()
    this._dirty = true
    this._sorted = undefined
    this._removeChanged = entities.collectionChanged.addEventListener(
      (_, added, removed, changed) => {
        if (this._updating) return
        for (const entity of [...removed, ...changed]) {
          this._positions.delete(entity)
          this._bounds.delete(entity)
        }
        this.invalidate()
      }
    )
    this._fonts = typeof document === 'undefined' ? undefined : document.fonts
    this._fontsChanged = () => {
      this._textWidths.clear()
      this._bounds = new WeakMap()
      this.invalidate(false)
    }
    this._fonts?.addEventListener('loadingdone', this._fontsChanged)
    this._measureText = (font, text) => {
      const key = `${font}\0${text}`
      if (!this._textWidths.has(key)) {
        if (this._textWidths.size >= 2048) {
          this._textWidths.delete(this._textWidths.keys().next().value)
        }
        this._context.font = font
        this._textWidths.set(key, this._context.measureText(text).width)
      }
      return this._textWidths.get(key)
    }
  }

  invalidate(sort = true) {
    this._dirty = true
    if (sort) this._sorted = undefined
  }

  invalidateTerrain(immediate = true) {
    // Coalesce notifications until the next update. Progress events also include
    // imagery loading; completion and explicit terrain changes bypass throttling.
    this._terrainDirty = true
    this._terrainImmediate ||= immediate
  }

  // Clip the screen grid so large offscreen boxes cannot grow it unboundedly.
  _addBounds(box, cells) {
    if (
      !box ||
      !Number.isFinite(box.left) ||
      !Number.isFinite(box.right) ||
      !Number.isFinite(box.top) ||
      !Number.isFinite(box.bottom) ||
      box.right <= box.left ||
      box.bottom <= box.top ||
      box.right < 0 ||
      box.bottom < 0 ||
      box.left > this._width ||
      box.top > this._height
    ) {
      return false
    }
    const left = Math.floor(Math.max(0, box.left) / 64)
    const right = Math.floor(Math.min(this._width, box.right) / 64)
    const top = Math.floor(Math.max(0, box.top) / 64)
    const bottom = Math.floor(Math.min(this._height, box.bottom) / 64)
    const columns = Math.floor(this._width / 64) + 1
    for (let y = top; y <= bottom; y++) {
      for (let x = left; x <= right; x++) {
        const cell = cells.get(y * columns + x)
        if (!cell) continue
        for (const other of cell) {
          if (
            box.left < other.right &&
            box.right > other.left &&
            box.top < other.bottom &&
            box.bottom > other.top
          ) {
            return false
          }
        }
      }
    }
    for (let y = top; y <= bottom; y++) {
      for (let x = left; x <= right; x++) {
        const key = y * columns + x
        const cell = cells.get(key)
        if (cell) {
          cell.push(box)
        } else {
          cells.set(key, [box])
        }
      }
    }
    return true
  }

  _getPosition(entity, scene, time, graphic = entity.label) {
    const labelPosition = this._positions.get(entity)
    const reference = Cesium.Property.getValueOrDefault(
      graphic.heightReference,
      time,
      Cesium.HeightReference.NONE
    )
    const isLabel = graphic === entity.label
    // The common label/icon height reference shares one terrain sample.
    if (!isLabel && labelPosition.reference === reference) return labelPosition
    let cached = isLabel ? labelPosition : labelPosition.billboard
    if (!cached) {
      cached = {
        constant:
          Cesium.Property.isConstant(entity.position) &&
          Cesium.Property.isConstant(graphic.heightReference),
      }
      if (isLabel) this._positions.set(entity, cached)
      else labelPosition.billboard = cached
    }
    if (
      cached.reference !== reference ||
      !cached.constant ||
      (cached.terrain && cached.version !== this._terrainVersion)
    ) {
      cached.value = getTdtLabelPosition(
        entity,
        scene,
        time,
        cached.value,
        reference
      )
      cached.reference = reference
      cached.terrain =
        reference === Cesium.HeightReference.CLAMP_TO_GROUND ||
        reference === Cesium.HeightReference.RELATIVE_TO_GROUND
      cached.version = this._terrainVersion
      cached.ellipsoid = undefined
    }
    const ellipsoid = scene.globe?.ellipsoid || Cesium.Ellipsoid.WGS84
    if (
      scene.mode === Cesium.SceneMode.SCENE3D &&
      cached.ellipsoid !== ellipsoid
    ) {
      cached.ellipsoid = ellipsoid
      // A surface proxy is only for the horizon test, never the render position.
      cached.surface =
        cached.value &&
        Cesium.Cartesian3.magnitudeSquared(
          ellipsoid.transformPositionToScaledSpace(
            cached.value,
            scaledPositionScratch
          )
        ) < 1
          ? ellipsoid.scaleToGeodeticSurface(cached.value, cached.surface)
          : undefined
    }
    return cached
  }

  _getDistanceSquared(graphic, position, scene, time) {
    const offset = Cesium.Property.getValueOrDefault(
      graphic.eyeOffset,
      time,
      Cesium.Cartesian3.ZERO,
      eyeOffsetScratch
    )
    if (
      scene.mode !== Cesium.SceneMode.SCENE3D ||
      Cesium.Cartesian3.equals(offset, Cesium.Cartesian3.ZERO)
    ) {
      return Cesium.Cartesian3.distanceSquared(
        scene.camera.positionWC,
        position.value
      )
    }
    const eye = Cesium.Matrix4.multiplyByPoint(
      scene.camera.viewMatrix,
      position.value,
      eyePositionScratch
    )
    // Match BillboardCollectionVS: vec4 normalization and clamped z adjustment.
    const z =
      offset.z *
      (position.reference === Cesium.HeightReference.NONE ? 1 : 1.005)
    const scale = 1 + z / Math.sqrt(Cesium.Cartesian3.magnitudeSquared(eye) + 1)
    eye.x = eye.x * scale + offset.x
    eye.y = eye.y * scale + offset.y
    eye.z *= scale
    return Cesium.Cartesian3.magnitudeSquared(eye)
  }

  _isVisible(
    graphic,
    position,
    scene,
    time,
    occluder,
    distanceSquared,
    isLabel
  ) {
    if (Cesium.Property.getValueOrDefault(graphic.scale, time, 1) <= 0)
      return false
    if (isLabel) {
      if (
        !HAS_TEXT.test(
          Cesium.Property.getValueOrDefault(graphic.text, time, '')
        )
      )
        return false
    } else if (
      Cesium.Property.getValueOrDefault(graphic.width, time, 18) <= 0 ||
      Cesium.Property.getValueOrDefault(graphic.height, time, 18) <= 0
    )
      return false
    const range = Cesium.Property.getValueOrUndefined(
      graphic.distanceDisplayCondition,
      time
    )
    if (range && distanceSquared !== undefined) {
      if (scene.mode === Cesium.SceneMode.SCENE3D) {
        if (
          distanceSquared < range.near * range.near ||
          distanceSquared > range.far * range.far
        )
          return false
      } else {
        const distance = Math.sqrt(distanceSquared)
        if (!(distance >= range.near && distance <= range.far)) return false
      }
    }
    if (!occluder || occluder.isPointVisible(position.value)) return true
    if (!position.surface) return false
    let limit = Cesium.Property.getValueOrUndefined(
      graphic.disableDepthTestDistance,
      time
    )
    // In Cesium 1.145, only explicit zero inherits the scene-level default.
    if (limit === 0) limit = scene.minimumDisableDepthTestDistance
    if (limit !== Infinity) {
      if (!(limit > 0)) return false
      distanceSquared ??= this._getDistanceSquared(
        graphic,
        position,
        scene,
        time
      )
      if (!(distanceSquared > 0 && distanceSquared < limit * limit))
        return false
    }
    return occluder.isPointVisible(position.surface)
  }

  _getBounds(entity, graphic, time) {
    // Keep geometry independent of visibility, projection and layer padding.
    let bounds = this._bounds.get(entity)
    if (!bounds) {
      bounds = { screen: {} }
      this._bounds.set(entity, bounds)
    }
    const key = graphic === entity.label ? 'label' : 'billboard'
    let cached = bounds[key]
    if (!cached || !cached.constant) {
      const value = getTdtLabelBounds(
        graphic,
        time,
        this._measureText,
        key === 'label'
      )
      if (!cached) {
        cached = {
          constant: BOUNDS_PROPERTIES.every((name) =>
            Cesium.Property.isConstant(graphic[name])
          ),
          value,
        }
        bounds[key] = cached
      } else {
        cached.value = value
      }
    }
    return cached.value
  }

  update(scene, time, padding, autoCollide = true) {
    const camera = scene.camera
    const width = scene.canvas.clientWidth
    const height = scene.canvas.clientHeight
    const projection = camera.frustum.projectionMatrix
    const ellipsoid = scene.globe?.ellipsoid || Cesium.Ellipsoid.WGS84
    if (
      this._terrain !== scene.terrainProvider ||
      this._globe !== scene.globe ||
      this._ellipsoid !== ellipsoid ||
      this._mode !== scene.mode ||
      this._exaggeration !== scene.verticalExaggeration ||
      this._relativeHeight !== scene.verticalExaggerationRelativeHeight
    ) {
      this.invalidateTerrain()
    }
    if (this._terrainDirty) {
      const now = performance.now()
      if (
        this._terrainImmediate ||
        now - this._lastTerrainUpdate >= TERRAIN_UPDATE_INTERVAL
      ) {
        this._terrainVersion++
        this._terrainDirty = false
        this._terrainImmediate = false
        this._lastTerrainUpdate = now
        this.invalidate(false)
      }
    }
    if (
      !this._dirty &&
      !this._dynamic &&
      this._width === width &&
      this._height === height &&
      this._autoCollide === autoCollide &&
      this._minimumDisableDepthTestDistance ===
        scene.minimumDisableDepthTestDistance &&
      Cesium.Matrix4.equals(this._view, camera.viewMatrix) &&
      Cesium.Matrix4.equals(this._projection, projection)
    ) {
      return false
    }
    this._view = Cesium.Matrix4.clone(camera.viewMatrix, this._view)
    this._projection = Cesium.Matrix4.clone(projection, this._projection)
    this._width = width
    this._height = height
    this._mode = scene.mode
    this._autoCollide = autoCollide
    this._terrain = scene.terrainProvider
    this._globe = scene.globe
    this._ellipsoid = ellipsoid
    this._minimumDisableDepthTestDistance =
      scene.minimumDisableDepthTestDistance
    this._exaggeration = scene.verticalExaggeration
    this._relativeHeight = scene.verticalExaggerationRelativeHeight
    this._dirty = false
    if (!this._sorted) {
      this._sorted = [...this._entities.values].sort(
        (a, b) => a._tdtPriority - b._tdtPriority
      )
      this._dynamic = this._sorted.some(
        (entity) =>
          entity.availability ||
          !Cesium.Property.isConstant(entity.position) ||
          [entity.label, entity.billboard].some(
            (graphic) =>
              graphic &&
              GRAPHIC_PROPERTIES.some(
                (name) => !Cesium.Property.isConstant(graphic[name])
              )
          )
      )
    }
    const cells = autoCollide ? new Map() : undefined
    const occluder =
      scene.mode === Cesium.SceneMode.SCENE3D
        ? new Cesium.EllipsoidalOccluder(ellipsoid, camera.positionWC)
        : undefined
    let changed = false
    this._updating = true
    this._entities.suspendEvents()
    try {
      for (const entity of this._sorted) {
        let show = false
        let box
        if (entity.isAvailable(time)) {
          const labelPosition = this._getPosition(entity, scene, time)
          let projectedPosition
          let point
          for (let index = 0; index < 2; index++) {
            const graphic = index === 0 ? entity.label : entity.billboard
            if (
              !graphic ||
              !Cesium.Property.getValueOrDefault(graphic.show, time, true)
            )
              continue
            const position =
              index === 0
                ? labelPosition
                : this._getPosition(entity, scene, time, graphic)
            if (!position.value) continue
            const distanceSquared =
              graphic.distanceDisplayCondition &&
              (cells || scene.mode === Cesium.SceneMode.SCENE3D)
                ? this._getDistanceSquared(graphic, position, scene, time)
                : undefined
            if (
              !this._isVisible(
                graphic,
                position,
                scene,
                time,
                occluder,
                distanceSquared,
                index === 0
              )
            )
              continue
            show = true
            if (!cells) continue
            if (projectedPosition !== position) {
              point = Cesium.SceneTransforms.worldToWindowCoordinates(
                scene,
                position.value,
                pointScratch
              )
              projectedPosition = position
            }
            if (!point) continue
            const component = this._getBounds(entity, graphic, time)
            if (component) {
              const left = point.x + component.left
              const right = point.x + component.right
              const top = point.y + component.top
              const bottom = point.y + component.bottom
              if (box) {
                box.left = Math.min(box.left, left)
                box.right = Math.max(box.right, right)
                box.top = Math.min(box.top, top)
                box.bottom = Math.max(box.bottom, bottom)
              } else {
                box = this._bounds.get(entity).screen
                box.left = left
                box.right = right
                box.top = top
                box.bottom = bottom
              }
            }
          }
          if (cells) {
            if (box) {
              box.left -= padding[3]
              box.right += padding[1]
              box.top -= padding[0]
              box.bottom += padding[2]
            }
            show = this._addBounds(box, cells)
          }
        }
        if (entity.show !== show) {
          entity.show = show
          changed = true
        }
      }
    } finally {
      this._entities.resumeEvents()
      this._updating = false
    }
    return changed
  }

  destroy() {
    this._removeChanged()
    this._fonts?.removeEventListener('loadingdone', this._fontsChanged)
  }
}

export default TdtLabelCollision
