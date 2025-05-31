/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Draw from './Draw'
import { PlotEventType } from '../../event'
import { Transform } from '../../transform'
import { Rect } from '../../overlay'

const DEF_STYLE = {
  material: Cesium.Color.YELLOW.withAlpha(0.6),
}

class DrawRectangle extends Draw {
  constructor(style) {
    super()
    this._maxAnchorSize = 2
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
    this.drawTool.tooltipMess = '左击选择点位'
    this._delegate = new Cesium.Entity({
      rectangle: {
        ...this._style,
        coordinates: new Cesium.CallbackProperty((time) => {
          if (this._positions.length > 1) {
            return Cesium.Rectangle.fromCartesianArray(this._positions)
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
    let rectangle = null
    if (this._positions.length) {
      rectangle = new Rect(
        Transform.transformCartesianArrayToWGS84Array(this._positions)
      ).setStyle(this._style)
    }
    this._options.onDrawStop && this._options.onDrawStop(rectangle)
  }

  /**
   *
   * @param position
   * @private
   */
  _onDrawAnchor(position) {
    let len = this._positions.length
    this._positions.push(position)
    this.drawTool.fire(PlotEventType.CREATE_ANCHOR, { position })
    if (len >= this._maxAnchorSize) {
      this._positions.pop()
      this.drawTool.fire(PlotEventType.DRAW_STOP)
    }
  }
}

export default DrawRectangle
