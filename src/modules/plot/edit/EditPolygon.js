/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Edit from './Edit'
import { PlotEventType } from '../../event'
import { midCartesian } from '../../math'
import { Transform } from '../../transform'

class EditPolygon extends Edit {
  constructor(overlay) {
    super(overlay)
  }

  /**
   *
   * @private
   */
  _mountedHook() {
    this._delegate.polygon.hierarchy = new Cesium.CallbackProperty((time) => {
      if (this._positions.length > 2) {
        return new Cesium.PolygonHierarchy(
          this._positions.map((item) => item.clone())
        )
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
  _stoppedHook() {
    this._overlay.positions = Transform.transformCartesianArrayToWGS84Array(
      this._positions.filter((item, index) => index % 2 === 0)
    )
    this._overlay.show = true
    this._options.onEditStop && this._options.onEditStop(this._overlay)
  }

  /**
   *
   * @private
   */
  _mountAnchor() {
    this._positions = []
    let positions = this._overlay.delegate.polygon.hierarchy.getValue(
      Cesium.JulianDate.now()
    ).positions
    positions.push(positions[0])
    for (let i = 0; i < positions.length - 1; i++) {
      let mid = midCartesian(positions[i], positions[i + 1])
      this._positions.push(positions[i])
      this._positions.push(mid)
    }
    this._positions.forEach((item, index) => {
      this.editTool.fire(PlotEventType.CREATE_ANCHOR, {
        position: item,
        index: index,
        isMid: index % 2 !== 0,
      })
    })
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
      let preMidPosition
      let nextMidPosition
      let len = this._positions.length
      if (currentIndex === len - 1) {
        preMidPosition = midCartesian(
          this._positions[currentIndex],
          this._positions[currentIndex - 1]
        )
        nextMidPosition = midCartesian(
          this._positions[currentIndex],
          this._positions[0]
        )
      } else {
        preMidPosition = midCartesian(
          this._positions[currentIndex],
          this._positions[currentIndex - 1]
        )
        nextMidPosition = midCartesian(
          this._positions[currentIndex],
          this._positions[currentIndex + 1]
        )
      }
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
    let len = this._positions.length
    if (!properties.isMid) {
      let preAnchorIndex = -1
      let preMidAnchorIndex = -1
      let nextAnchorIndex = -1
      let nextMidAnchorIndex = -1
      if (currentIndex === 0) {
        preAnchorIndex = len - 2
        preMidAnchorIndex = len - 1
        nextAnchorIndex = currentIndex + 2
        nextMidAnchorIndex = currentIndex + 1
      } else if (currentIndex === len - 2) {
        preAnchorIndex = currentIndex - 2
        preMidAnchorIndex = currentIndex - 1
        nextAnchorIndex = 0
        nextMidAnchorIndex = len - 1
      } else {
        preAnchorIndex = currentIndex - 2
        preMidAnchorIndex = currentIndex - 1
        nextAnchorIndex = currentIndex + 2
        nextMidAnchorIndex = currentIndex + 1
      }
      let preMidPosition = midCartesian(
        this._positions[preAnchorIndex],
        this._positions[currentIndex]
      )
      let nextMidPosition = midCartesian(
        this._positions[nextAnchorIndex],
        this._positions[currentIndex]
      )
      this._positions[preMidAnchorIndex] = preMidPosition
      this._positions[nextMidAnchorIndex] = nextMidPosition
      this.editTool.fire(PlotEventType.UPDATE_ANCHOR, {
        index: preMidAnchorIndex,
        position: preMidPosition,
      })
      this.editTool.fire(PlotEventType.UPDATE_ANCHOR, {
        index: nextMidAnchorIndex,
        position: nextMidPosition,
      })
    }
  }
}

export default EditPolygon
