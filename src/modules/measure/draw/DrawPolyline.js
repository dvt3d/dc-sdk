/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import { PlotEventType } from '../../event'
import Draw from './Draw'

class DrawPolyline extends Draw {
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
      polyline: {
        ...this._style,
        positions: new Cesium.CallbackProperty(() => {
          return this._positions
        }, false),
      },
    })
    this._layer.entities.add(this._delegate)
  }

  /**
   *
   * @param position
   * @returns {boolean}
   * @private
   */
  _onDrawAnchor(position) {
    let len = this._positions.length
    this._positions.push(position)
    if (len > 0) {
      this.drawTool.fire(PlotEventType.CREATE_ANCHOR, { position })
    }
    if (len >= this._options.maxAnchorSize) {
      this._positions.pop()
      this.drawTool.fire(PlotEventType.DRAW_STOP, position)
    }
  }
}

export default DrawPolyline
