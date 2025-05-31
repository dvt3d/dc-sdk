/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import ImageryType from '../ImageryType'

const TILE_URL =
  '//tiles{s}.geovisearth.com/base/v1/{style}/{z}/{x}/{y}?format={format}&tmsIds=w&token={key}'

class GeoVisImageryProvider extends Cesium.UrlTemplateImageryProvider {
  constructor(options = {}) {
    options['url'] =
      options.url ||
      [
        options.protocol || '',
        TILE_URL.replace(/\{style\}/g, options.style || 'vec')
          .replace(/\{format\}/g, options.format || 'png')
          .replace(/\{key\}/g, options.key || ''),
      ].join('')
    options['subdomains'] = options.subdomains || ['1', '2', '3']
    super(options)
  }
}

ImageryType.GEO_VIS = 'geoVis'

export default GeoVisImageryProvider
