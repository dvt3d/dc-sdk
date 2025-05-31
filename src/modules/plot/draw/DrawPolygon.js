/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import { PlotEventType } from '../../event'
import { Transform } from '../../transform'
import { Polygon } from '../../overlay'
import Draw from './Draw'

const DEF_STYLE = {
  material: Cesium.Color.YELLOW.withAlpha(0.6),
  fill: true,
}

class DrawPolygon extends Draw {
  constructor(style) {
    super()
    this._style = {
      ...DEF_STYLE,
      ...style,
    }
  }

  /**
   *
   * @private
   */
  _mountedHook() {
    this.drawTool.tooltipMess = '左击选择点位,右击结束'
    this._delegate = new Cesium.Entity({
      polygon: {
        ...this._style,
        hierarchy: new Cesium.CallbackProperty(() => {
          if (this._positions.length > 2) {
            return new Cesium.PolygonHierarchy(
              this._positions.map((item) => item.clone())
            )
          } else {
            return null
          }
        }, false),
      },
    })
    this._layer.entities.add(this._delegate)
  }

  /**
   *
   * @private
   */
  _stoppedHook() {
    let polygon = null
    if (this._positions.length) {
      polygon = new Polygon(
        Transform.transformCartesianArrayToWGS84Array(this._positions)
      ).setStyle(this._style)
    }
    this._options.onDrawStop && this._options.onDrawStop(polygon)
  }

  /**
   *
   * @param position
   * @private
   */
  _onDrawAnchor(position) {
    this._positions.push(position)
    this.drawTool.fire(PlotEventType.CREATE_ANCHOR, { position })
  }
}

export default DrawPolygon
