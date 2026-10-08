/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import ImageryType from '../ImageryType'

const MAP_URL =
  'https://t{s}.tianditu.gov.cn/{style}_{tileMatrixSetID}/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER={style}&STYLE=default&TILEMATRIXSET={tileMatrixSetID}&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={y}&TILECOL={x}&tk={key}'

class TdtImageryProvider extends Cesium.UrlTemplateImageryProvider {
  constructor(options = {}) {
    const tileMatrixSetID = options.tileMatrixSetID ?? 'w'
    if (!['c', 'w'].includes(tileMatrixSetID)) {
      throw new Cesium.DeveloperError('tileMatrixSetID must be c or w.')
    }
    const geographic = tileMatrixSetID === 'c'
    const protocol = (options.protocol || 'https:').replace(/:$/, '') + ':'
    const key = options.key ?? options.token ?? ''
    const resource = Cesium.Resource.createIfNeeded(
      options.url || MAP_URL.replace('https:', protocol)
    ).getDerivedResource({
      templateValues: {
        style: options.style || 'vec',
        tileMatrixSetID,
        key,
        token: key,
      },
      proxy: options.proxy,
    })
    super({
      url: resource,
      subdomains: options.subdomains ?? '01234567',
      tilingScheme: geographic
        ? new Cesium.GeographicTilingScheme()
        : new Cesium.WebMercatorTilingScheme({
            numberOfLevelZeroTilesX: 2,
            numberOfLevelZeroTilesY: 2,
          }),
      // Root tiles match service L1: 2x1 geographic, 2x2 Mercator.
      // Starting here also keeps Cesium's parent fallback off service L0.
      minimumLevel: options.minimumLevel ?? 0,
      maximumLevel: options.maximumLevel ?? 17,
      rectangle: options.rectangle,
      credit: options.credit ?? '天地图',
      customTags: {
        TileMatrix: (provider, x, y, level) => level + 1,
      },
    })
  }
}

ImageryType.TDT = 'tdt'

export default TdtImageryProvider
