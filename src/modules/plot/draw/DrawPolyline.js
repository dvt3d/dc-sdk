/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import { PlotEventType } from '../../event'
import { Transform } from '../../transform'
import { Polyline } from '../../overlay'
import Draw from './Draw'

const DEF_STYLE = {
  width: 3,
  material: Cesium.Color.YELLOW.withAlpha(0.6),
}

class DrawPolyline extends Draw {
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
   * @private
   */
  _stoppedHook() {
    let polyline = null
    if (this._positions.length) {
      polyline = new Polyline(
        Transform.transformCartesianArrayToWGS84Array(this._positions)
      ).setStyle(this._style)
    }
    this._options.onDrawStop && this._options.onDrawStop(polyline)
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
    this.drawTool.fire(PlotEventType.CREATE_ANCHOR, { position })
    if (len >= this._options.maxAnchorSize) {
      this._positions.pop()
      this.drawTool.fire(PlotEventType.DRAW_STOP)
    }
  }
}

export default DrawPolyline
