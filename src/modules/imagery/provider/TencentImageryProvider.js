/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import ImageryType from '../ImageryType'

const TILE_URL = {
  img: '//p{s}.map.gtimg.com/sateTiles/{z}/{sx}/{sy}/{x}_{reverseY}.jpg?version=400',
  elec: '//rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={reverseY}&styleid={style}&scene=0&version=347',
}

class TencentImageryProvider extends Cesium.UrlTemplateImageryProvider {
  constructor(options = {}) {
    let url =
      options.url ||
      [
        options.protocol || '',
        TILE_URL[options.style] || TILE_URL['elec'],
      ].join('')
    options['url'] = url.replace('{style}', options.style || 1)
    options['subdomains'] = options.subdomains || ['1', '2', '3']
    if (options.style === 'img') {
      options['customTags'] = {
        sx: (imageryProvider, x, y, level) => {
          return x >> 4
        },
        sy: (imageryProvider, x, y, level) => {
          return ((1 << level) - y) >> 4
        },
      }
    }
    super(options)
  }
}

ImageryType.TENCENT = 'tencent'

export default TencentImageryProvider
