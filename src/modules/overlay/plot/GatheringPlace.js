/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import Parse from '../../parse/Parse'
import State from '../../state/State'
import { Transform } from '../../transform'
import { Util, PlotUtil } from '../../utils'

const HALF_PI = Math.PI / 2

const FITTING_COUNT = 100

class GatheringPlace extends Overlay {
  constructor(positions) {
    super()
    this._positions = Parse.parsePositions(positions)
    this._delegate = new Cesium.Entity({ polygon: {} })
    this.t = 0.4
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('gathering_place')
  }

  set positions(positions) {
    this._positions = Parse.parsePositions(positions)
    this._delegate.polygon.hierarchy = this._getHierarchy()
  }

  get positions() {
    return this._positions
  }

  _getHierarchy() {
    let pnts = Parse.parsePolygonCoordToArray(this._positions)[0]
    if (this._positions.length === 2) {
      let mid = PlotUtil.mid(pnts[0], pnts[1])
      let d = PlotUtil.distance(pnts[0], mid) / 0.9
      let pnt = PlotUtil.getThirdPoint(pnts[0], mid, HALF_PI, d, true)
      pnts = [pnts[0], pnt, pnts[1]]
    }
    let mid = PlotUtil.mid(pnts[0], pnts[2])
    pnts.push(mid, pnts[0], pnts[1])
    let normals = []
    for (let i = 0; i < pnts.length - 2; i++) {
      let pnt1 = pnts[i]
      let pnt2 = pnts[i + 1]
      let pnt3 = pnts[i + 2]
      let normalPoints = PlotUtil.getBisectorNormals(this.t, pnt1, pnt2, pnt3)
      normals = normals.concat(normalPoints)
    }
    let count = normals.length
    normals = [normals[count - 1]].concat(normals.slice(0, count - 1))
    let pList = []
    for (let i = 0; i < pnts.length - 2; i++) {
      let pnt1 = pnts[i]
      let pnt2 = pnts[i + 1]
      pList.push(pnt1)
      for (let t = 0; t <= FITTING_COUNT; t++) {
        let pnt = PlotUtil.getCubicValue(
          t / FITTING_COUNT,
          pnt1,
          normals[i * 2],
          normals[i * 2 + 1],
          pnt2
        )
        pList.push(pnt)
      }
      pList.push(pnt2)
    }
    return new Cesium.PolygonHierarchy(
      Transform.transformWGS84ArrayToCartesianArray(Parse.parsePositions(pList))
    )
  }

  _mountedHook() {
    /**
     *  set the location
     */
    this.positions = this._positions
  }

  /**
   *
   * @param text
   * @param textStyle
   * @returns {GatheringPlace}
   */
  setLabel(text, textStyle) {
    return this
  }

  /**
   * Sets Style
   * @param style
   * @returns {GatheringPlace}
   */
  setStyle(style) {
    if (Object.keys(style).length === 0) {
      return this
    }
    delete style['positions']
    Util.merge(this._style, style)
    Util.merge(this._delegate.polygon, style)
    return this
  }
}

Overlay.registerType('gathering_place')

export default GatheringPlace
