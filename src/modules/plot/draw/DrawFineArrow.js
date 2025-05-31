/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Draw from './Draw'
import { Transform } from '../../transform'
import { PlotEventType } from '../../event'
import { FineArrow } from '../../overlay'

import FineArrowGraphics from '../graphics/FineArrowGraphics'

const DEF_STYLE = {
  material: Cesium.Color.YELLOW.withAlpha(0.6),
  fill: true,
}

class DrawFineArrow extends Draw {
  constructor(style) {
    super()
    this._maxAnchorSize = 2
    this._style = {
      ...DEF_STYLE,
      ...style,
    }
    this._graphics = new FineArrowGraphics()
  }

  /**
   *
   * @private
   */
  _mountedHook() {
    this.drawTool.tooltipMess = '单击选择点位'
    this._delegate = new Cesium.Entity({
      polygon: {
        ...this._style,
        hierarchy: new Cesium.CallbackProperty(() => {
          if (this._positions.length > 1) {
            this._graphics.positions = this._positions
            return this._graphics.hierarchy
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
    let fineArrow = null
    if (this._positions.length) {
      fineArrow = new FineArrow(
        Transform.transformCartesianArrayToWGS84Array(this._positions)
      ).setStyle(this._style)
    }
    this._options.onDrawStop && this._options.onDrawStop(fineArrow)
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
    this._graphics.positions = this._positions
    if (len >= this._maxAnchorSize) {
      this._positions.pop()
      this.drawTool.fire(PlotEventType.DRAW_STOP)
    }
  }
}

export default DrawFineArrow
