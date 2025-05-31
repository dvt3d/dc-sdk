/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import { PlotEventType } from '../../event'
import Draw from './Draw'

class DrawPolygon extends Draw {
  constructor(style) {
    super(style)
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
   * @param position
   * @private
   */
  _onDrawAnchor(position) {
    this._positions.push(position)
    this.drawTool.fire(PlotEventType.CREATE_ANCHOR, { position })
  }
}

export default DrawPolygon
