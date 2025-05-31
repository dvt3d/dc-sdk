/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import { PlotEventType } from '../../event'
import { midCartesian } from '../../math'
import Edit from './Edit'

class EditPolyline extends Edit {
  constructor(overlay) {
    super(overlay)
  }

  /**
   *
   * @private
   */
  _mountedHook() {
    this.editTool.tooltipMess = '点击锚点移动,右击结束编辑'
    this._delegate.polyline.positions = new Cesium.CallbackProperty(() => {
      if (this._positions.length > 1) {
        return this._positions
      } else {
        return null
      }
    }, false)
    this._layer.entities.add(this._delegate)
  }

  /**
   *
   * @private
   */
  _mountAnchor() {
    let positions = [].concat(
      this._overlay.polyline.positions.getValue(Cesium.JulianDate.now())
    )
    if (this._options.maxAnchorSize > 2) {
      for (let i = 0; i < positions.length - 1; i++) {
        let mid = midCartesian(positions[i], positions[i + 1])
        this._positions.push(positions[i])
        this._positions.push(mid)
      }
      this._positions.push(positions[positions.length - 1])
      this._positions.forEach((item, index) => {
        this.editTool.fire(PlotEventType.CREATE_ANCHOR, {
          position: item,
          index: index,
          isMid: index % 2 !== 0,
        })
      })
    } else {
      this._positions = positions
      this._positions.forEach((item, index) => {
        this.editTool.fire(PlotEventType.CREATE_ANCHOR, {
          position: item,
          index: index,
        })
      })
    }
    this._layer.entities.remove(this._overlay)
  }

  /**
   *
   * @param pickedAnchor
   * @param position
   * @returns {boolean}
   * @private
   */
  _onEditAnchorStop({ pickedAnchor, position }) {
    let properties = pickedAnchor.properties.getValue(Cesium.JulianDate.now())
    let currentIndex = properties.index
    if (properties.isMid) {
      let preMidPosition = midCartesian(
        this._positions[currentIndex],
        this._positions[currentIndex - 1]
      )
      let nextMidPosition = midCartesian(
        this._positions[currentIndex],
        this._positions[currentIndex + 1]
      )
      this._positions.splice(
        currentIndex,
        1,
        preMidPosition,
        position,
        nextMidPosition
      )
      this.editTool.fire(PlotEventType.CLEAR_ANCHOR)
      this._positions.forEach((item, index) => {
        this.editTool.fire(PlotEventType.CREATE_ANCHOR, {
          position: item,
          index: index,
          isMid: index % 2 !== 0,
        })
      })
    }
  }

  /**
   *
   * @param pickedAnchor
   * @param position
   * @private
   */
  _onAnchorMoving({ pickedAnchor, position }) {
    let properties = pickedAnchor.properties.getValue(Cesium.JulianDate.now())
    let currentIndex = properties.index
    this._positions[currentIndex] = position
    if (!properties.isMid && this._options.maxAnchorSize > 2) {
      let preAnchorIndex = -1
      let preMidAnchorIndex = -1
      let nextAnchorIndex = -1
      let nextMidAnchorIndex = -1
      let len = this._positions.length

      if (currentIndex === 0) {
        nextAnchorIndex = currentIndex + 2
        nextMidAnchorIndex = currentIndex + 1
      } else if (properties.index === len - 1) {
        preAnchorIndex = currentIndex - 2
        preMidAnchorIndex = currentIndex - 1
      } else {
        preAnchorIndex = currentIndex - 2
        preMidAnchorIndex = currentIndex - 1
        nextAnchorIndex = currentIndex + 2
        nextMidAnchorIndex = currentIndex + 1
      }

      if (preAnchorIndex > 0) {
        let preMidPosition = midCartesian(
          this._positions[preAnchorIndex],
          this._positions[currentIndex]
        )
        this._positions[preMidAnchorIndex] = preMidPosition
        this.editTool.fire(PlotEventType.UPDATE_ANCHOR, {
          index: preMidAnchorIndex,
          position: preMidPosition,
        })
      }

      if (nextAnchorIndex > 0) {
        let nextMidPosition = midCartesian(
          this._positions[nextAnchorIndex],
          this._positions[currentIndex]
        )
        this._positions[nextMidAnchorIndex] = nextMidPosition
        this.editTool.fire(PlotEventType.UPDATE_ANCHOR, {
          index: nextMidAnchorIndex,
          position: nextMidPosition,
        })
      }
    }
    this._options.onCalc && this._options.onCalc(this._positions)
  }
}

export default EditPolyline
