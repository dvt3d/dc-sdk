import { Cesium } from '../../../libs'
import TdtTerrainDecoder, {
  isTerrainRequestCancelled,
} from '../tdt/TdtTerrainDecoder'
import TdtTerrainData from '../tdt/TdtTerrainData'

const TERRAIN_URL =
  'https://t{s}.tianditu.gov.cn/mapservice/swdx?T=elv_c&x={x}&y={y}&l={z}&tk={key}'

// Adapted from tianditu-cesium-ext's GeoTerrainProvider DEM format.
class TdtTerrainProvider extends Cesium.CustomHeightmapTerrainProvider {
  constructor(options = {}) {
    super({
      callback: () => undefined,
      width: 64,
      height: 64,
      ellipsoid: options.ellipsoid || Cesium.Ellipsoid.WGS84,
      credit: options.credit ?? '天地图',
    })
    const key = options.key ?? options.token ?? ''
    this._url = Cesium.Resource.createIfNeeded(
      options.url || TERRAIN_URL
    ).getDerivedResource({
      templateValues: { key, token: key },
      proxy: options.proxy,
    })
    this._subdomains = options.subdomains ?? '01234567'
    this._dataType = options.dataType ?? 'int16'
    this._decoder = new TdtTerrainDecoder(options)
    this._activeRequests = 0
    this._cacheSize = options.cacheSize ?? 256
    this._tileCache = new Map()
    // Service L6–L12 corresponds to Cesium levels 5–11.
    this._minimumLevel = options.minimumLevel ?? 5
    this._maximumLevel = options.maximumLevel ?? 11
    if (options.worker !== undefined && typeof options.worker !== 'boolean') {
      throw new Cesium.DeveloperError('worker must be a boolean.')
    }
    if (
      options.workerUrl !== undefined &&
      (typeof options.workerUrl !== 'string' || !options.workerUrl)
    ) {
      throw new Cesium.DeveloperError('workerUrl must be a non-empty string.')
    }
    if (!['int16', 'float'].includes(this._dataType)) {
      throw new Cesium.DeveloperError('dataType must be int16 or float.')
    }
    if (!Number.isInteger(this._cacheSize) || this._cacheSize < 0) {
      throw new Cesium.DeveloperError(
        'cacheSize must be a non-negative integer.'
      )
    }
    if (
      !Number.isInteger(this._minimumLevel) ||
      !Number.isInteger(this._maximumLevel) ||
      this._minimumLevel < 0 ||
      this._maximumLevel < this._minimumLevel ||
      this._maximumLevel > 11
    ) {
      throw new Cesium.DeveloperError(
        'Expected 0 <= minimumLevel <= maximumLevel <= 11.'
      )
    }
    this._availability = new Cesium.TileAvailability(
      this.tilingScheme,
      this._maximumLevel
    )
    for (let level = 0; level <= this._maximumLevel; level++) {
      this._availability.addAvailableTileRange(
        level,
        0,
        0,
        this.tilingScheme.getNumberOfXTilesAtLevel(level) - 1,
        this.tilingScheme.getNumberOfYTilesAtLevel(level) - 1
      )
    }
  }

  get availability() {
    return this._availability
  }

  requestTileGeometry(x, y, level, request) {
    if (!this.getTileDataAvailable(x, y, level)) {
      return Promise.reject(
        new Cesium.RuntimeError(
          'TDT terrain tile is outside the supported range.'
        )
      )
    }
    if (isTerrainRequestCancelled(request)) return Promise.resolve(undefined)
    if (level < this._minimumLevel) {
      return Promise.resolve(
        this._createTerrainData(new Float32Array(64 * 64), level)
      )
    }
    const key = `${level}/${x}/${y}`
    const cached = this._tileCache.get(key)
    if (cached) {
      this._tileCache.delete(key)
      this._tileCache.set(key, cached)
      return Promise.resolve(this._createTerrainData(cached.slice(), level))
    }
    // Bound network + decode work together; Cesium retries deferred tiles.
    if (this._activeRequests >= 32) return undefined
    const subdomains = this._subdomains
    const z = level + 1
    const resource = this._url.getDerivedResource({
      templateValues: {
        x,
        y,
        z,
        s: subdomains.length ? subdomains[(x + y + z) % subdomains.length] : '',
      },
      request,
    })
    const promise = resource.fetchArrayBuffer()
    // Preserve Cesium's throttling contract so the scheduler can retry.
    if (!promise) {
      return undefined
    }
    this._activeRequests++
    return promise
      .then((buffer) => this._decoder.decode(buffer, this._dataType, request))
      .then((samples) => {
        if (!samples || isTerrainRequestCancelled(request)) return undefined
        if (this._cacheSize > 0) {
          // TerrainData owns its buffer; retain only a bounded copy of the DEM.
          this._tileCache.delete(key)
          this._tileCache.set(key, samples.slice())
          if (this._tileCache.size > this._cacheSize) {
            this._tileCache.delete(this._tileCache.keys().next().value)
          }
        }
        return this._createTerrainData(samples, level)
      })
      .finally(() => this._activeRequests--)
  }

  getTileDataAvailable(x, y, level) {
    return (
      Number.isInteger(level) &&
      level >= 0 &&
      level <= this._maximumLevel &&
      Number.isInteger(x) &&
      Number.isInteger(y) &&
      x >= 0 &&
      y >= 0 &&
      x < this.tilingScheme.getNumberOfXTilesAtLevel(level) &&
      y < this.tilingScheme.getNumberOfYTilesAtLevel(level)
    )
  }

  _createTerrainData(buffer, level) {
    return new TdtTerrainData({
      buffer,
      width: 64,
      height: 64,
      childTileMask: level < this._maximumLevel ? 15 : 0,
    })
  }
}

export default TdtTerrainProvider
