import { Cesium } from '../../../libs'
import Layer from '../Layer'
import State from '../../state/State'
import { parseTdtTile, parseTdtRoads } from '../tdt/TdtTileParser'
import { createTdtEntity } from '../tdt/TdtLabelStyle'
import TdtLabelCollision from '../tdt/TdtLabelCollision'

const rectangleScratch = new Cesium.Rectangle()
const cartographicScratch = new Cesium.Cartographic()
const northWestScratch = new Cesium.Cartesian2()
const southEastScratch = new Cesium.Cartesian2()
const targetScratch = new Cesium.Cartesian2()
const pixelSizeScratch = new Cesium.Cartesian2()
const boundsScratch = new Cesium.OrientedBoundingBox()

const DEF_OPTS = {
  url: new Cesium.Resource({
    url: 'https://t{s}.tianditu.gov.cn/mapservice/GetTiles?lxys={z},{x},{y}&VERSION=1.0.0&tk={key}',
    // Preserve the service's literal separators; template values stay escaped.
    parseUrl: false,
  }),
  icoUrl: 'https://t{s}.tianditu.gov.cn/mapservice/GetIcon?id={id}&tk={key}',
  autoCollide: false,
  // Extra spacing can make separate characters in service labels hide each other.
  collisionPadding: [0, 0, 0, 0],
  cacheSize: 256,
  maximumRequests: 8,
  maximumTiles: 128,
  maximumLabels: 1000,
}

function createSource(type, url, metadata = {}) {
  if (
    !(typeof url === 'string' && url.length) &&
    !(url instanceof Cesium.Resource)
  ) {
    throw new Cesium.DeveloperError(
      'TDT service url must be a string or Resource.'
    )
  }
  const { minLevel = 1, maxLevel = 20, boundBox } = metadata
  if (
    !Number.isInteger(minLevel) ||
    !Number.isInteger(maxLevel) ||
    minLevel < 1 ||
    maxLevel < minLevel ||
    maxLevel > 20
  ) {
    throw new Cesium.DeveloperError('Expected 1 <= minLevel <= maxLevel <= 20.')
  }
  if (
    boundBox &&
    (!['minX', 'minY', 'maxX', 'maxY'].every((key) =>
      Number.isFinite(boundBox[key])
    ) ||
      Math.abs(boundBox.minX) > 180 ||
      Math.abs(boundBox.maxX) > 180 ||
      boundBox.minY < -90 ||
      boundBox.maxY > 90 ||
      boundBox.minY >= boundBox.maxY ||
      boundBox.minX === boundBox.maxX)
  ) {
    throw new Cesium.DeveloperError('Invalid TDT metadata boundBox.')
  }
  return {
    type,
    url: Cesium.Resource.createIfNeeded(url),
    minLevel,
    maxLevel,
    rectangle: boundBox
      ? Cesium.Rectangle.fromDegrees(
          boundBox.minX,
          boundBox.minY,
          boundBox.maxX,
          boundBox.maxY
        )
      : Cesium.Rectangle.MAX_VALUE,
  }
}

class TdtLabelLayer extends Layer {
  constructor(id, options = {}) {
    super(id)
    this._options = { ...DEF_OPTS, ...options }
    this._options.autoCollide =
      options.autoCollide ?? options.aotuCollide ?? false
    for (const name of [
      'cacheSize',
      'maximumRequests',
      'maximumTiles',
      'maximumLabels',
    ]) {
      if (!Number.isInteger(this._options[name]) || this._options[name] < 1) {
        throw new Cesium.DeveloperError(`${name} must be a positive integer.`)
      }
    }
    if (
      !Array.isArray(this._options.collisionPadding) ||
      this._options.collisionPadding.length !== 4 ||
      this._options.collisionPadding.some(
        (value) => !Number.isFinite(value) || value < 0
      )
    ) {
      throw new Cesium.DeveloperError(
        'collisionPadding must contain four nonnegative numbers.'
      )
    }
    this._sources = [createSource('poi', this._options.url, options.metadata)]
    if (options.roadUrl) {
      this._sources.push(
        createSource('road', options.roadUrl, options.roadMetadata)
      )
    }
    this._delegate = new Cesium.CustomDataSource(id)
    this._tilingScheme = new Cesium.GeographicTilingScheme()
    this._tiles = new Map()
    this._visibleTiles = new Map()
    this._displayTiles = new Map()
    this._pending = new Map()
    this._retryAt = new Map()
    this._generation = 0
    this._lastUpdate = 0
    this._entitiesDirty = false
    this._removePostUpdate = undefined
    this._errorEvent = new Cesium.Event()
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('tdt_label')
  }

  get errorEvent() {
    return this._errorEvent
  }

  set show(show) {
    super.show = show
    if (!show) {
      this._cancelRequests()
    } else if (this._state === State.ADDED) {
      this._collision?.invalidateTerrain()
      this._refreshTiles()
    }
    this._viewer?.scene.requestRender()
  }

  get show() {
    return this._show
  }

  _addOverlay() {}
  _removeOverlay() {}

  _onAdd(viewer) {
    this._viewer = viewer
    const attachment = {}
    this._attachment = attachment
    // DataSourceCollection.add is asynchronous. Serialize attachments so a
    // remove/re-add before resolution cannot leave a duplicate data source.
    this._attachPromise = (this._attachPromise || Promise.resolve())
      .then(async () => {
        if (
          this._attachment !== attachment ||
          viewer.dataSources.isDestroyed()
        ) {
          return
        }
        await viewer.dataSources.add(this._delegate)
        if (
          this._attachment !== attachment &&
          !viewer.dataSources.isDestroyed()
        ) {
          viewer.dataSources.remove(this._delegate)
        }
      })
      .catch((error) => this._errorEvent.raiseEvent({ layer: this, error }))
    this._state = State.ADDED
    this._addedHook()
  }

  _addedHook() {
    this._delegate.show = this._show
    // postUpdate also runs in requestRenderMode when no frame is drawn.
    this._removePostUpdate = this._viewer.scene.postUpdate.addEventListener(
      this._update,
      this
    )
    this._removeTileProgress =
      this._viewer.scene.globe?.tileLoadProgressEvent?.addEventListener(
        (remaining) => {
          if (!this._show || this._state !== State.ADDED) return
          this._collision?.invalidateTerrain(remaining === 0)
          this._viewer?.scene.requestRender()
        }
      )
    this._refreshTiles()
  }

  _onRemove() {
    this._attachment = undefined
    this._removePostUpdate?.()
    this._removePostUpdate = undefined
    this._removeTileProgress?.()
    this._removeTileProgress = undefined
    this.clear()
    super._onRemove()
    this._viewer = undefined
    this._context = undefined
  }

  _update() {
    if (this._state !== State.ADDED || !this._show) {
      return
    }
    const now = Date.now()
    if (now - this._lastUpdate >= 250) {
      this._lastUpdate = now
      this._refreshTiles()
    }
    this._flushEntities()
    // Horizon culling still applies when overlap avoidance is disabled.
    this._updateCollision()
  }

  _getLabelLevel() {
    const { camera, canvas, globe, mode } = this._viewer.scene
    const width = canvas?.clientWidth
    const height = canvas?.clientHeight
    const position = camera?.positionCartographic
    let distance = position?.height
    if (
      !Number.isFinite(width) ||
      width <= 0 ||
      !Number.isFinite(height) ||
      height <= 0 ||
      !Number.isFinite(distance) ||
      !Number.isFinite(position?.longitude) ||
      !Number.isFinite(position?.latitude) ||
      typeof camera?.frustum?.getPixelDimensions !== 'function'
    ) {
      return undefined
    }
    if (
      (mode === Cesium.SceneMode.SCENE3D ||
        mode === Cesium.SceneMode.COLUMBUS_VIEW) &&
      !(camera.frustum instanceof Cesium.OrthographicFrustum) &&
      !(camera.frustum instanceof Cesium.OrthographicOffCenterFrustum)
    ) {
      // getHeight samples the displayed terrain, including exaggeration.
      // Height above that surface keeps the scale stable while rotating.
      const ground = globe?.getHeight?.(position)
      if (Number.isFinite(ground)) distance = Math.max(distance - ground, 1)
    }
    if (distance <= 0) return undefined
    try {
      // CSS pixels keep label detail independent of the drawing-buffer ratio.
      camera.frustum.getPixelDimensions(
        width,
        height,
        distance,
        1,
        pixelSizeScratch
      )
    } catch {
      return undefined
    }
    const metersPerPixel = Math.max(pixelSizeScratch.x, pixelSizeScratch.y)
    if (!Number.isFinite(metersPerPixel) || metersPerPixel <= 0) {
      return undefined
    }
    const rootResolution =
      (Math.PI * this._tilingScheme.ellipsoid.maximumRadius) / 256
    return Cesium.Math.clamp(
      Math.round(Math.log2(rootResolution / metersPerPixel)),
      0,
      19
    )
  }

  _getVisibleTiles() {
    // Isolate Cesium's version-sensitive rendered-tile access here. The service
    // grid is geographic even when the active terrain uses a different scheme.
    const scene = this._viewer.scene
    const rendered = scene.globe?._surface?._tilesToRender || []
    const tiles = new Map()
    const scheme = this._tilingScheme
    // Use terrain coverage, but choose service detail independently of its LOD.
    const labelLevel = this._getLabelLevel()
    const adaptive =
      labelLevel !== undefined &&
      scene.mode === Cesium.SceneMode.SCENE3D &&
      Cesium.defined(scene.camera.positionWC)
    const sorted =
      labelLevel === undefined
        ? [...rendered].sort((a, b) => b.level - a.level)
        : rendered
    for (const source of this._sources) {
      let count = 0
      const ranges = []
      for (const tile of sorted) {
        if (labelLevel === undefined && count >= this._options.maximumTiles)
          break
        const requestedLevel = labelLevel ?? tile.level
        if (!adaptive && requestedLevel + 1 < source.minLevel) {
          continue
        }
        const rectangle = Cesium.Rectangle.intersection(
          tile.rectangle,
          source.rectangle,
          rectangleScratch
        )
        if (!rectangle) {
          continue
        }
        const level = adaptive
          ? source.maxLevel - 1
          : Math.min(requestedLevel, source.maxLevel - 1)
        scheme.positionToTileXY(
          Cesium.Rectangle.northwest(rectangle, cartographicScratch),
          level,
          northWestScratch
        )
        Cesium.Rectangle.southeast(rectangle, cartographicScratch)
        cartographicScratch.longitude -= Cesium.Math.EPSILON12
        cartographicScratch.latitude += Cesium.Math.EPSILON12
        scheme.positionToTileXY(cartographicScratch, level, southEastScratch)
        if (labelLevel !== undefined) {
          const range = {
            minX: northWestScratch.x,
            maxX: southEastScratch.x,
            minY: northWestScratch.y,
            maxY: southEastScratch.y,
            minimumHeight: tile.data?.tileBoundingRegion?.minimumHeight,
            maximumHeight: tile.data?.tileBoundingRegion?.maximumHeight,
          }
          if (range.minX > range.maxX) {
            ranges.push({
              ...range,
              maxX: scheme.getNumberOfXTilesAtLevel(level) - 1,
            })
            range.minX = 0
          }
          ranges.push(range)
          continue
        }
        for (
          let y = northWestScratch.y;
          y <= southEastScratch.y && count < this._options.maximumTiles;
          y++
        ) {
          for (
            let x = northWestScratch.x;
            x <= southEastScratch.x && count < this._options.maximumTiles;
            x++
          ) {
            const key = `${source.type}/${level}/${x}/${y}`
            if (!tiles.has(key)) {
              tiles.set(key, { ...source, key, x, y, level })
              count++
            }
          }
        }
      }
      if (ranges.length) {
        this._selectLabelTiles(
          source,
          adaptive
            ? source.maxLevel - 1
            : Math.min(labelLevel, source.maxLevel - 1),
          ranges,
          tiles
        )
      }
    }
    return tiles
  }

  _selectLabelTiles(source, level, ranges, tiles) {
    const scheme = this._tilingScheme
    const width = scheme.getNumberOfXTilesAtLevel(level)
    const { camera, canvas, globe, mode } = this._viewer.scene
    const viewWidth = canvas?.clientWidth
    const viewHeight = canvas?.clientHeight
    const positionWC = camera.positionWC
    const adaptive =
      mode === Cesium.SceneMode.SCENE3D &&
      Cesium.defined(positionWC) &&
      viewWidth > 0 &&
      viewHeight > 0 &&
      typeof camera.frustum.getPixelDimensions === 'function'
    const position = camera.positionCartographic
    cartographicScratch.longitude = Cesium.Math.negativePiToPi(
      position.longitude
    )
    cartographicScratch.latitude = Cesium.Math.clamp(
      position.latitude,
      -Math.PI / 2,
      Math.PI / 2
    )
    const target = scheme.positionToTileXY(
      cartographicScratch,
      level,
      targetScratch
    )
    const targetWest = target.x - width
    const targetEast = target.x + width
    const targetX = target.x
    const targetY = target.y
    const cullingVolume =
      mode === Cesium.SceneMode.SCENE3D &&
      typeof camera.frustum.computeCullingVolume === 'function'
        ? camera.frustum.computeCullingVolume(
            positionWC,
            camera.directionWC,
            camera.upWC
          )
        : undefined
    const ground = adaptive ? globe?.getHeight?.(position) : undefined
    const fallbackHeight = Number.isFinite(ground) ? ground : 0
    const minimumLevel = source.minLevel - 1
    const maximumTiles = this._options.maximumTiles
    const rootResolution = (Math.PI * scheme.ellipsoid.maximumRadius) / 256
    const compare = (a, b) =>
      a.outside - b.outside ||
      (adaptive
        ? Number(b.required) - Number(a.required) || b.detail - a.detail
        : 0) ||
      a.distance - b.distance ||
      a.minY - b.minY ||
      a.minX - b.minX
    const queue = new Cesium.Heap({ comparator: compare })
    const createTile = (x, y, tileLevel) => {
      const scale = 2 ** (level - tileLevel)
      const minX = x * scale
      const maxX = (x + 1) * scale - 1
      const minY = y * scale
      const maxY = (y + 1) * scale - 1
      let intersects = false
      let minimumHeight = Infinity
      let maximumHeight = -Infinity
      for (const range of ranges) {
        if (
          minX > range.maxX ||
          maxX < range.minX ||
          minY > range.maxY ||
          maxY < range.minY
        ) {
          continue
        }
        intersects = true
        minimumHeight = Math.min(
          minimumHeight,
          Number.isFinite(range.minimumHeight)
            ? range.minimumHeight
            : fallbackHeight
        )
        maximumHeight = Math.max(
          maximumHeight,
          Number.isFinite(range.maximumHeight)
            ? range.maximumHeight
            : fallbackHeight
        )
      }
      if (!intersects) return undefined
      let outside = 0
      let desiredLevel = level
      if (adaptive || cullingVolume) {
        scheme.tileXYToRectangle(x, y, tileLevel, rectangleScratch)
        Cesium.OrientedBoundingBox.fromRectangle(
          rectangleScratch,
          minimumHeight,
          maximumHeight,
          scheme.ellipsoid,
          boundsScratch
        )
        if (adaptive) {
          const distance = Math.max(
            Math.sqrt(boundsScratch.distanceSquaredTo(positionWC)),
            1
          )
          camera.frustum.getPixelDimensions(
            viewWidth,
            viewHeight,
            distance,
            1,
            pixelSizeScratch
          )
          desiredLevel = Math.min(
            level,
            Math.round(
              Math.log2(
                rootResolution /
                  Math.max(pixelSizeScratch.x, pixelSizeScratch.y)
              )
            )
          )
        }
        if (cullingVolume) {
          outside = Number(
            cullingVolume.computeVisibility(boundsScratch) ===
              Cesium.Intersect.OUTSIDE
          )
        }
      }
      if (tileLevel < minimumLevel && desiredLevel < minimumLevel) {
        return undefined
      }
      const dx = Math.min(
        Math.max(minX - targetWest, 0, targetWest - maxX),
        Math.max(minX - targetX, 0, targetX - maxX),
        Math.max(minX - targetEast, 0, targetEast - maxX)
      )
      const dy = Math.max(minY - targetY, 0, targetY - maxY)
      return {
        key: `${source.type}/${tileLevel}/${x}/${y}`,
        x,
        y,
        level: tileLevel,
        minX,
        minY,
        outside,
        required: tileLevel < minimumLevel,
        detail: desiredLevel - tileLevel,
        distance: dx * dx + dy * dy,
      }
    }
    const children = []
    const getChildren = (tile) => {
      children.length = 0
      for (let child = 0; child < 4; child++) {
        const next = createTile(
          tile.x * 2 + (child % 2),
          tile.y * 2 + Math.floor(child / 2),
          tile.level + 1
        )
        if (next) children.push(next)
      }
      return children
    }
    const roots = [createTile(0, 0, 0), createTile(1, 0, 0)]
      .filter(Boolean)
      .sort(compare)
    if (!adaptive) {
      roots.forEach((tile) => queue.insert(tile))
      let count = 0
      while (queue.length && count < maximumTiles) {
        const tile = queue.pop()
        if (tile.level === level) {
          const { key, x, y } = tile
          tiles.set(key, { ...source, key, x, y, level })
          count++
        } else {
          for (const child of getChildren(tile)) queue.insert(child)
        }
      }
      return
    }
    // Keep a covering set of tiles. Replacing a parent is optional once its
    // children would exceed the budget, so distant ground keeps coarse labels.
    const selected = new Map()
    const add = (tile) => {
      selected.set(tile.key, tile)
      if (tile.required || tile.detail > 0) queue.insert(tile)
    }
    roots.slice(0, maximumTiles).forEach(add)
    while (queue.length) {
      const tile = queue.pop()
      if (!selected.has(tile.key)) continue
      const children = getChildren(tile)
      let available = maximumTiles - selected.size + 1
      if (!tile.outside && children.length > available) {
        children.sort(compare)
        while (
          children.length > available &&
          children[children.length - 1]?.outside
        ) {
          children.pop()
        }
        for (const candidate of selected.values()) {
          if (children.length <= available) break
          if (candidate.outside) {
            selected.delete(candidate.key)
            available++
          }
        }
      }
      if (children.length > available) {
        if (!tile.required) continue
        // A source's minimum level cannot be replaced by a coarser request.
        children.sort(compare).length = available
      }
      selected.delete(tile.key)
      children.forEach(add)
    }
    for (const { key, x, y, level: tileLevel } of selected.values()) {
      if (tileLevel >= minimumLevel) {
        tiles.set(key, { ...source, key, x, y, level: tileLevel })
      }
    }
  }

  _refreshTiles() {
    if (this._state !== State.ADDED || !this._show) {
      return
    }
    const visible = this._getVisibleTiles()
    let changed = visible.size !== this._visibleTiles.size
    if (!changed) {
      for (const key of visible.keys()) {
        if (!this._visibleTiles.has(key)) {
          changed = true
          break
        }
      }
    }
    this._visibleTiles = visible
    for (const [key, request] of this._pending) {
      if (!visible.has(key)) {
        request.cancel()
        this._pending.delete(key)
      }
    }
    for (const key of this._retryAt.keys()) {
      if (!visible.has(key)) {
        this._retryAt.delete(key)
      }
    }
    if (changed) {
      this._entitiesDirty = true
    }
    this._flushEntities()
    this._pumpRequests()
  }

  _pumpRequests() {
    if (this._state !== State.ADDED || !this._show) {
      return
    }
    const now = Date.now()
    for (const [key, tile] of this._visibleTiles) {
      if (this._pending.size >= this._options.maximumRequests) {
        break
      }
      if (
        this._tiles.has(key) ||
        this._pending.has(key) ||
        (this._retryAt.get(key) || 0) > now
      ) {
        continue
      }
      this._requestTile(tile)
    }
  }

  _requestTile(tile) {
    const generation = this._generation
    const request = new Cesium.Request({
      throttle: true,
      throttleByServer: true,
      type: Cesium.RequestType.OTHER,
    })
    const subdomains = this._options.subdomains ?? '01234567'
    const key = this._options.key ?? this._options.token ?? ''
    const { x, y } = tile
    const z = tile.level + 1
    const resource = tile.url.getDerivedResource({
      templateValues: {
        x,
        y,
        z,
        s: subdomains.length ? subdomains[(x + y + z) % subdomains.length] : '',
        key,
        token: key,
      },
      proxy: this._options.proxy,
      request,
    })
    const promise =
      tile.type === 'road' ? resource.fetchJson() : resource.fetchArrayBuffer()
    if (!promise) {
      this._scheduleRetry()
      return
    }
    this._pending.set(tile.key, request)
    promise
      .then((buffer) => {
        if (generation !== this._generation || request.cancelled) {
          return
        }
        tile.data =
          tile.type === 'road' ? parseTdtRoads(buffer) : parseTdtTile(buffer)
        this._tiles.set(tile.key, tile)
        this._retryAt.delete(tile.key)
        // Merge replies once per scene update rather than scanning every POI
        // for each individual network completion.
        this._entitiesDirty = true
        this._viewer.scene.requestRender()
      })
      .catch((error) => {
        if (generation === this._generation && !request.cancelled) {
          // Scheduler eviction sets state without setting request.cancelled.
          const cancelled = request.state === Cesium.RequestState.CANCELLED
          this._retryAt.set(tile.key, Date.now() + (cancelled ? 250 : 5000))
          this._scheduleRetry()
          if (!cancelled) {
            this._errorEvent.raiseEvent({
              layer: this,
              tile: {
                x: tile.x,
                y: tile.y,
                level: tile.level,
                type: tile.type,
              },
              error,
            })
          }
        }
      })
      .finally(() => {
        if (this._pending.get(tile.key) === request) {
          this._pending.delete(tile.key)
        }
        if (generation === this._generation) {
          this._pumpRequests()
        }
      })
  }

  _syncEntities() {
    const entities = this._delegate.entities
    const wanted = new Set()
    const display = new Map()
    for (const key of this._visibleTiles.keys()) {
      const loaded = this._tiles.get(key)
      if (loaded) display.set(key, loaded)
    }
    const maximum = this._options.maximumTiles * this._sources.length
    for (const [key, visible] of this._visibleTiles) {
      if (display.has(key)) continue
      // Keep overlapping loaded labels while a new LOD is pending. Remove
      // them as soon as its response arrives, including a valid empty tile.
      for (const [previousKey, previous] of this._displayTiles) {
        if (display.size >= maximum) break
        const level = Math.min(visible.level, previous.level)
        const currentScale = 2 ** (visible.level - level)
        const previousScale = 2 ** (previous.level - level)
        if (
          previous.type === visible.type &&
          Math.floor(visible.x / currentScale) ===
            Math.floor(previous.x / previousScale) &&
          Math.floor(visible.y / currentScale) ===
            Math.floor(previous.y / previousScale)
        ) {
          display.set(previousKey, previous)
        }
      }
    }
    this._displayTiles = display
    const candidates = []
    for (const [key, tile] of display) {
      this._tiles.delete(key)
      this._tiles.set(key, tile)
      for (const poi of tile.data.pois) {
        candidates.push({ poi, tile })
      }
    }
    candidates.sort((a, b) => (a.poi.priority ?? 0) - (b.poi.priority ?? 0))
    entities.suspendEvents()
    try {
      for (const { poi, tile } of candidates) {
        if (wanted.size >= this._options.maximumLabels) break
        const id = `${tile.type}/${poi.oid}`
        let entity = entities.getById(id)
        if (!entity) {
          entity = createTdtEntity(poi, tile, this._options, id)
          if (entity) entities.add(entity)
        }
        if (entity) wanted.add(id)
      }
      for (const entity of [...entities.values]) {
        if (!wanted.has(entity.id)) {
          entities.remove(entity)
        }
      }
    } finally {
      entities.resumeEvents()
    }
    this._viewer?.scene.requestRender()
  }

  _flushEntities() {
    if (this._entitiesDirty) {
      this._entitiesDirty = false
      this._syncEntities()
      this._trimCache()
    }
  }

  _trimCache() {
    for (const key of this._tiles.keys()) {
      if (this._tiles.size <= this._options.cacheSize) {
        break
      }
      if (!this._visibleTiles.has(key) && !this._displayTiles.has(key)) {
        this._tiles.delete(key)
      }
    }
  }

  _updateCollision() {
    if (this._options.autoCollide) {
      this._context ||= document.createElement('canvas').getContext('2d')
    }
    this._collision ||= new TdtLabelCollision(
      this._delegate.entities,
      this._context
    )
    if (
      this._collision.update(
        this._viewer.scene,
        this._viewer.clock.currentTime,
        this._options.collisionPadding,
        this._options.autoCollide
      )
    ) {
      this._viewer.scene.requestRender()
    }
  }

  _cancelRequests() {
    clearTimeout(this._retryTimer)
    this._retryTimer = undefined
    this._generation++
    for (const request of this._pending.values()) {
      request.cancel()
    }
    this._pending.clear()
    this._retryAt.clear()
  }

  _scheduleRetry() {
    if (!this._retryTimer) {
      this._retryTimer = setTimeout(() => {
        this._retryTimer = undefined
        this._refreshTiles()
        if (this._retryAt.size) {
          this._scheduleRetry()
        }
      }, 250)
    }
  }

  clear() {
    this._state = State.CLEARED
    this._cancelRequests()
    this._tiles.clear()
    this._visibleTiles.clear()
    this._displayTiles.clear()
    this._entitiesDirty = false
    this._collision?.destroy()
    this._collision = undefined
    this._delegate.entities.removeAll()
    this._viewer?.scene.requestRender()
    return this
  }

  refresh() {
    this.clear()
    if (this._viewer) {
      this._state = State.ADDED
      this._refreshTiles()
    }
    return this
  }
}

Layer.registerType('tdt_label')

export default TdtLabelLayer
