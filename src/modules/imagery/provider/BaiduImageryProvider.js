/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import ImageryType from '../ImageryType'
import BD09TilingScheme from '../tiling-scheme/BD09TilingScheme.js'

const TILE_URL = {
  img: '//shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46',
  vec: '//online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl&v=020',
  custom:
    '//api{s}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&customid={style}',
  traffic:
    '//its.map.baidu.com:8002/traffic/TrafficTileService?time={time}&label={labelStyle}&v=016&level={z}&x={x}&y={y}&scaler=2',
}

class BaiduImageryProvider extends Cesium.UrlTemplateImageryProvider {
  constructor(options = {}) {
    options['url'] =
      options.url ||
      [
        options.protocol || '',
        TILE_URL[options.style] || TILE_URL['custom'],
      ].join('')

    if (options.crs === 'WGS84') {
      let resolutions = []
      for (let i = 0; i < 19; i++) {
        resolutions[i] = 256 * Math.pow(2, 18 - i)
      }
      options['tilingScheme'] = new BD09TilingScheme({
        resolutions,
        rectangleSouthwestInMeters: new Cesium.Cartesian2(
          -20037726.37,
          -12474104.17
        ),
        rectangleNortheastInMeters: new Cesium.Cartesian2(
          20037726.37,
          12474104.17
        ),
      })
    } else {
      options['tilingScheme'] = new Cesium.WebMercatorTilingScheme({
        rectangleSouthwestInMeters: new Cesium.Cartesian2(-33554054, -33746824),
        rectangleNortheastInMeters: new Cesium.Cartesian2(33554054, 33746824),
      })
    }
    options['maximumLevel'] = 18
    super(options)
    this._rectangle = this._tilingScheme.rectangle
    this._url = options.url
    this._crs = options.crs || 'BD09'
    this._style = options.style || 'normal'
  }

  requestImage(x, y, level) {
    let xTiles = this._tilingScheme.getNumberOfXTilesAtLevel(level)
    let yTiles = this._tilingScheme.getNumberOfYTilesAtLevel(level)
    let url = this._url
      .replace('{z}', level)
      .replace('{s}', String(1))
      .replace('{style}', this._style)
    if (this._crs === 'WGS84') {
      url = url.replace('{x}', String(x)).replace('{y}', String(-y))
    } else {
      url = url
        .replace('{x}', String(x - xTiles / 2))
        .replace('{y}', String(yTiles / 2 - y - 1))
    }
    return Cesium.ImageryProvider.loadImage(this, url)
  }
}

ImageryType.BAIDU = 'baidu'

export default BaiduImageryProvider
