/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Draw from './Draw'
import { PlotEventType } from '../../event'
import { Transform } from '../../transform'
import { Billboard } from '../../overlay'
import IMG_CIRCLE_RED from '../../images/circle_red.png'

class DrawPoint extends Draw {
  constructor(style) {
    super()
    this._position = Cesium.Cartesian3.ZERO
    this._style = {
      image: IMG_CIRCLE_RED,
      ...style,
    }
  }

  /**
   *
   * @private
   */
  _mountedHook() {
    this.drawTool.tooltipMess = '单击选择点位'
    this._delegate = new Cesium.Entity({
      position: new Cesium.CallbackProperty(() => {
        return this._position
      }, false),
      billboard: {
        ...this._style,
      },
    })
    this._layer.entities.add(this._delegate)
  }

  /**
   *
   * @private
   */
  _stoppedHook() {
    let billboard = null
    if (this._position) {
      billboard = new Billboard(
        Transform.transformCartesianToWGS84(this._position),
        this._style.image
      ).setStyle(this._style)
    }
    this._options.onDrawStop && this._options.onDrawStop(billboard)
  }

  /**
   *
   * @param position
   * @private
   */
  _onDrawAnchor(position) {
    this._position = position
    this.drawTool.fire(PlotEventType.DRAW_STOP)
  }

  /**
   *
   * @param position
   * @private
   */
  _onAnchorMoving(position) {
    this._position = position
  }
}

export default DrawPoint
