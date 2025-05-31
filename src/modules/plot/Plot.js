/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import { OverlayType } from '../overlay'

import DrawPoint from './draw/DrawPoint'
import DrawPolyline from './draw/DrawPolyline'
import DrawPolygon from './draw/DrawPolygon'
import DrawCircle from './draw/DrawCircle'
import DrawRectangle from './draw/DrawRectangle'
import DrawBillboard from './draw/DrawBillboard'
import DrawAttackArrow from './draw/DrawAttackArrow'
import DrawDoubleArrow from './draw/DrawDoubleArrow'
import DrawFineArrow from './draw/DrawFineArrow'
import DrawGatheringPlace from './draw/DrawGatheringPlace'
import DrawTailedAttackArrow from './draw/DrawTailedAttackArrow'

import EditPoint from './edit/EditPoint'
import EditPolyline from './edit/EditPolyline'
import EditPolygon from './edit/EditPolygon'
import EditCircle from './edit/EditCircle'
import EditRectangle from './edit/EditRectangle'
import EditBillboard from './edit/EditBillboard'
import EditAttackArrow from './edit/EditAttackArrow'
import EditDoubleArrow from './edit/EditDoubleArrow'
import EditFineArrow from './edit/EditFineArrow'
import EditGatheringPlace from './edit/EditGatheringPlace'
import EditTailedAttackArrow from './edit/EditTailedAttackArrow'

class Plot {
  constructor(viewer, options = {}) {
    this._viewer = viewer
    this._options = options
    this._layer = new Cesium.CustomDataSource('plot-layer')
    this._viewer.dataSources.add(this._layer)
    this._currentWorker = undefined
    this._state = undefined
  }

  get viewer() {
    return this._viewer
  }

  get layer() {
    return this._layer
  }

  get state() {
    return this._state
  }

  /**
   *
   * @param type
   * @param style
   * @private
   */
  _createDrawWorker(type, style) {
    let drawWorker = undefined
    switch (type) {
      case OverlayType.POINT:
        drawWorker = new DrawPoint(style)
        break
      case OverlayType.POLYLINE:
        drawWorker = new DrawPolyline(style)
        break
      case OverlayType.POLYGON:
        drawWorker = new DrawPolygon(style)
        break
      case OverlayType.CIRCLE:
        drawWorker = new DrawCircle(style)
        break
      case OverlayType.RECT:
        drawWorker = new DrawRectangle(style)
        break
      case OverlayType.BILLBOARD:
        drawWorker = new DrawBillboard(style)
        break
      case OverlayType.ATTACK_ARROW:
        drawWorker = new DrawAttackArrow(style)
        break
      case OverlayType.DOUBLE_ARROW:
        drawWorker = new DrawDoubleArrow(style)
        break
      case OverlayType.FINE_ARROW:
        drawWorker = new DrawFineArrow(style)
        break
      case OverlayType.TAILED_ATTACK_ARROW:
        drawWorker = new DrawTailedAttackArrow(style)
        break
      case OverlayType.GATHERING_PLACE:
        drawWorker = new DrawGatheringPlace(style)
        break
      default:
        break
    }
    return drawWorker
  }

  /**
   *
   * @param overlay
   * @private
   */
  _createEditWorker(overlay) {
    let editWorker = undefined
    switch (overlay.type) {
      case OverlayType.POINT:
        editWorker = new EditPoint(overlay)
        break
      case OverlayType.POLYLINE:
        editWorker = new EditPolyline(overlay)
        break
      case OverlayType.POLYGON:
        editWorker = new EditPolygon(overlay)
        break
      case OverlayType.CIRCLE:
        editWorker = new EditCircle(overlay)
        break
      case OverlayType.RECT:
        editWorker = new EditRectangle(overlay)
        break
      case OverlayType.BILLBOARD:
        editWorker = new EditBillboard(overlay)
        break
      case OverlayType.ATTACK_ARROW:
        editWorker = new EditAttackArrow(overlay)
        break
      case OverlayType.DOUBLE_ARROW:
        editWorker = new EditDoubleArrow(overlay)
        break
      case OverlayType.FINE_ARROW:
        editWorker = new EditFineArrow(overlay)
        break
      case OverlayType.TAILED_ATTACK_ARROW:
        editWorker = new EditTailedAttackArrow(overlay)
        break
      case OverlayType.GATHERING_PLACE:
        editWorker = new EditGatheringPlace(overlay)
        break
      default:
        break
    }
    return editWorker
  }

  /**
   *
   * @param type
   * @param callback
   * @param style
   * @param clampToModel
   * @returns {Plot}
   */
  draw(type, callback, style = {}, clampToModel = false) {
    this._state = 'draw'
    if (this._currentWorker) {
      this._currentWorker.stop()
    }
    let maxAnchorSize = style?.maxAnchorSize || 999
    style && delete style['maxAnchorSize']
    this._currentWorker = this._createDrawWorker(type, style)?.start(this, {
      ...this._options,
      maxAnchorSize: maxAnchorSize,
      onDrawStop: callback,
      clampToModel: clampToModel ?? this._options.clampToModel,
    })
    return this
  }

  /**
   *
   * @param overlay
   * @param callback
   * @param clampToModel
   * @returns {Plot}
   */
  edit(overlay, callback, clampToModel = false) {
    this._state = 'edit'
    if (this._currentWorker) {
      this._currentWorker.stop()
    }
    this._currentWorker = this._createEditWorker(overlay)?.start(this, {
      ...this._options,
      onEditStop: callback,
      clampToModel: clampToModel ?? this._options.clampToModel,
    })
    return this
  }

  /**
   *
   * @return {Plot}
   */
  stop() {
    if (this._currentWorker) {
      this._currentWorker.stop()
    }
    this._currentWorker = null
    return undefined
  }

  /**
   *
   * @returns {Plot}
   */
  destroy() {
    this._viewer.dataSources.remove(this._layer)
    this._viewer = undefined
    return this
  }
}

export default Plot
