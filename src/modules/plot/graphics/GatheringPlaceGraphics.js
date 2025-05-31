/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Parse from '../../parse/Parse'
import { Transform } from '../../transform'
import { PlotUtil } from '../../utils'

const HALF_PI = Math.PI / 2

const FITTING_COUNT = 100

class GatheringPlaceGraphics {
  constructor(options) {
    this._positions = options?.positions || []
    this.t = 0.4
  }

  set positions(positions) {
    this._positions = positions
  }

  get positions() {
    return this._positions
  }

  get hierarchy() {
    return this._createHierarchy()
  }

  _createHierarchy() {
    let pnts = Parse.parsePolygonCoordToArray(
      Transform.transformCartesianArrayToWGS84Array(this._positions)
    )[0]
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
}

export default GatheringPlaceGraphics
