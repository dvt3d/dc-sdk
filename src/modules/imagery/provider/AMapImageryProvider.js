/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import ImageryType from '../ImageryType'
import GCJ02TilingScheme from '../tiling-scheme/GCJ02TilingScheme.js'

const TILE_URL = {
  img: '//webst{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
  elec: '//webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
  cva: '//webst{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
}

class AMapImageryProvider extends Cesium.UrlTemplateImageryProvider {
  constructor(options = {}) {
    options['url'] =
      options.url ||
      [
        options.protocol || '',
        TILE_URL[options.style] || TILE_URL['elec'],
      ].join('')
    options['subdomains'] = options.subdomains || ['01', '02', '03', '04']
    if (options.crs === 'WGS84') {
      options['tilingScheme'] = new GCJ02TilingScheme()
    }
    super(options)
  }
}

ImageryType.AMAP = 'amap'

export default AMapImageryProvider
