/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import TerrainType from './TerrainType'

class TerrainFactory {
  /**
   *
   * @param options
   * @returns {Promise<EllipsoidTerrainProvider>}
   */
  static createEllipsoidTerrain(options) {
    return Promise.resolve(new Cesium.EllipsoidTerrainProvider(options))
  }

  /**
   * Create url terrain
   * @param options
   * @returns {Promise<CesiumTerrainProvider>}
   */
  static createUrlTerrain(options) {
    return Cesium.CesiumTerrainProvider.fromUrl(options.url, options)
  }

  /**
   * Create google terrain
   * @param options
   * @returns {Promise<GoogleEarthEnterpriseTerrainProvider>}
   */
  static createGoogleTerrain(options) {
    return Cesium.GoogleEarthEnterpriseTerrainProvider.fromUrl(
      options.url,
      options
    )
  }

  /**
   * Create arcgis terrain
   * @param options
   * @returns {Promise<ArcGISTiledElevationTerrainProvider>}
   */
  static createArcgisTerrain(options) {
    return Cesium.ArcGISTiledElevationTerrainProvider.fromUrl(
      options.url,
      options
    )
  }

  /**
   * Create vr terrain
   * @param options
   * @returns {Promise<VRTheWorldTerrainProvider>}
   */
  static createVRTerrain(options) {
    return Cesium.VRTheWorldTerrainProvider.fromUrl(options.url, options)
  }

  /**
   * Create Terrain
   * @param type
   * @param options
   * @returns {any}
   */
  static createTerrain(type, options) {
    let promise = undefined
    switch (type) {
      case TerrainType.NONE:
        promise = this.createEllipsoidTerrain(options)
        break
      case TerrainType.XYZ:
        promise = this.createUrlTerrain(options)
        break
      case TerrainType.GOOGLE:
        promise = this.createGoogleTerrain(options)
        break
      case TerrainType.ARCGIS:
        promise = this.createArcgisTerrain(options)
        break
      case TerrainType.VR:
        promise = this.createVRTerrain(options)
        break
      default:
        break
    }
    return promise
  }
}

export default TerrainFactory
