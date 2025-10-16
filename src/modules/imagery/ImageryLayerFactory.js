/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import ImageryType from './ImageryType'
import AMapImageryProvider from './provider/AMapImageryProvider.js'
import BaiduImageryProvider from './provider/BaiduImageryProvider'
import GeoVisImageryProvider from './provider/GeoVisImageryProvider.js'
import GoogleImageryProvider from './provider/GoogleImageryProvider'
import TdtImageryProvider from './provider/TdtImageryProvider'
import TencentImageryProvider from './provider/TencentImageryProvider'

class ImageryLayerFactory {
  /**
   * Create amap imagery layer
   * @param options
   * @returns {Promise<AMapImageryProvider>}
   */
  static createAMapImageryLayer(options) {
    return Promise.resolve(new AMapImageryProvider(options))
  }

  /**
   * Create baidu imagery layer
   * @param options
   * @returns {Promise<BaiduImageryProvider>}
   */
  static createBaiduImageryLayer(options) {
    return Promise.resolve(new BaiduImageryProvider(options))
  }

  /**
   * Create geoVis imagery layer
   * @param options
   * @returns {Promise<GeoVisImageryProvider>}
   */
  static createGeoVisImageryLayer(options) {
    return Promise.resolve(new GeoVisImageryProvider(options))
  }

  /**
   * Create google imagery layer
   * @param options
   * @returns {Promise<GoogleImageryProvider>}
   */
  static createGoogleImageryLayer(options) {
    return Promise.resolve(new GoogleImageryProvider(options))
  }

  /**
   * Create tdt imagery layer
   * @param options
   * @returns {Promise<TdtImageryProvider>}
   */
  static createTdtImageryLayer(options) {
    return Promise.resolve(new TdtImageryProvider(options))
  }

  /**
   * Create tencent imagery layer
   * @param options
   * @returns {Promise<TencentImageryProvider>}
   */
  static createTencentImageryLayer(options) {
    return Promise.resolve(new TencentImageryProvider(options))
  }

  /**
   *
   * Create arcgis imagery layer
   * @param options
   * @returns {Promise<ArcGisMapServerImageryProvider>}
   */
  static createArcGisImageryLayer(options) {
    return Cesium.ArcGisMapServerImageryProvider.fromUrl(options.url, options)
  }

  /**
   *
   * @param options
   * @returns {Promise<BingMapsImageryProvider>}
   */
  static createBingImageryLayer(options) {
    return Cesium.BingMapsImageryProvider.fromUrl(options.url, options)
  }

  /**
   *
   * @param options
   * @returns {Promise<OpenStreetMapImageryProvider>}
   */
  static createOSMImageryLayer(options) {
    return Promise.resolve(new Cesium.OpenStreetMapImageryProvider(options))
  }

  /**
   * Create TMS imagery layer
   * @param options
   * @returns {Promise<TileMapServiceImageryProvider>}
   */
  static createTMSImageryLayer(options) {
    return Cesium.TileMapServiceImageryProvider.fromUrl(options.url, options)
  }

  /**
   * Create grid imagery layer
   * @param options
   * @returns {Promise<GridImageryProvider>}
   */
  static createGridImageryLayer(options) {
    return Promise.resolve(new Cesium.GridImageryProvider(options))
  }

  /**
   * Create google 2d imagery layer
   * @param options
   * @returns {Promise<Google2DImageryProvider>}
   */
  static createGoogle2DImageryLayer(options) {
    let provider = Cesium.Google2DImageryProvider
    return options.assetId
      ? provider.fromIonAssetId(options)
      : provider.fromUrl(options)
  }

  /**
   * Create mapbox imagery layer
   * @param options
   * @returns {Promise<MapboxImageryProvider>}
   */
  static createMapboxImageryLayer(options) {
    return Promise.resolve(new Cesium.MapboxImageryProvider(options))
  }

  /**
   * Create mapbox style imagery layer
   * @param options
   * @returns {Promise<MapboxStyleImageryProvider>}
   */
  static createMapboxStyleImageryLayer(options) {
    return Promise.resolve(new Cesium.MapboxStyleImageryProvider(options))
  }

  /**
   * Create single tile imagery layer
   * @param options
   * @returns {<SingleTileImageryProvider>}
   */
  static createSingleTileImageryLayer(options) {
    return Cesium.SingleTileImageryProvider.fromUrl(options.url, options)
  }

  /**
   * Create coord imagery layer
   * @param options
   * @returns {Promise<TileCoordinatesImageryProvider>}
   */
  static createCoordImageryLayer(options) {
    return Promise.resolve(new Cesium.TileCoordinatesImageryProvider(options))
  }

  /**
   * Create xyz imagery layer
   * @param options
   * @returns {Promise<UrlTemplateImageryProvider>}
   */
  static createXYZImageryLayer(options) {
    return Promise.resolve(new Cesium.UrlTemplateImageryProvider(options))
  }

  /**
   * Create WMS imagery layer
   * @param options
   * @returns {Promise<WebMapServiceImageryProvider>}
   */
  static createWMSImageryLayer(options) {
    return Promise.resolve(new Cesium.WebMapServiceImageryProvider(options))
  }

  /**
   * Create WMTS imagery layer
   * @param options
   * @returns {Promise<WebMapTileServiceImageryProvider>}
   */
  static createWMTSImageryLayer(options) {
    return Promise.resolve(new Cesium.WebMapTileServiceImageryProvider(options))
  }

  /**
   * Create Imagery Layer by Type
   * @param type
   * @param options
   * @returns {any}
   */
  static createImageryLayer(type, options) {
    let promise = undefined
    switch (type) {
      case ImageryType.AMAP:
        promise = this.createAMapImageryLayer(options)
        break
      case ImageryType.BAIDU:
        promise = this.createBaiduImageryLayer(options)
        break
      case ImageryType.GEO_VIS:
        promise = this.createGeoVisImageryLayer(options)
        break
      case ImageryType.GOOGLE:
        promise = this.createGoogleImageryLayer(options)
        break
      case ImageryType.TDT:
        promise = this.createTdtImageryLayer(options)
        break
      case ImageryType.TENCENT:
        promise = this.createTencentImageryLayer(options)
        break
      case ImageryType.ARCGIS:
        promise = this.createArcGisImageryLayer(options)
        break
      case ImageryType.BING:
        promise = this.createBingImageryLayer(options)
        break
      case ImageryType.OSM:
        promise = this.createOSMImageryLayer(options)
        break
      case ImageryType.SINGLE_TILE:
        promise = this.createSingleTileImageryLayer(options)
        break
      case ImageryType.WMS:
        promise = this.createWMSImageryLayer(options)
        break
      case ImageryType.WMTS:
        promise = this.createWMTSImageryLayer(options)
        break
      case ImageryType.XYZ:
        promise = this.createXYZImageryLayer(options)
        break
      case ImageryType.COORD:
        promise = this.createCoordImageryLayer(options)
        break
      case ImageryType.GRID:
        promise = this.createGridImageryLayer(options)
        break
      case ImageryType.GOOGLE_2D:
        promise = this.createGoogle2DImageryLayer(options)
        break
      case ImageryType.MAPBOX:
        promise = this.createMapboxImageryLayer(options)
        break
      case ImageryType.MAPBOX_STYLE:
        promise = this.createMapboxStyleImageryLayer(options)
        break
      case ImageryType.TMS:
        promise = this.createTMSImageryLayer(options)
        break
      default:
        break
    }
    return promise
  }
}

export default ImageryLayerFactory
