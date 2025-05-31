/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Parse from '../../parse/Parse'
import { Transform } from '../../transform'
import { PlotUtil } from '../../utils'

const HALF_PI = Math.PI / 2

class FineArrowGraphics {
  constructor(options) {
    this._positions = options?.positions || []
    this.tailWidthFactor = 0.15
    this.neckWidthFactor = 0.2
    this.headWidthFactor = 0.25
    this.headAngle = Math.PI / 8.5
    this.neckAngle = Math.PI / 13
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
    let pnt1 = pnts[0]
    let pnt2 = pnts[1]
    let len = PlotUtil.getBaseLength(pnts)
    let tailWidth = len * this.tailWidthFactor
    let neckWidth = len * this.neckWidthFactor
    let headWidth = len * this.headWidthFactor
    let tailLeft = PlotUtil.getThirdPoint(pnt2, pnt1, HALF_PI, tailWidth, true)
    let tailRight = PlotUtil.getThirdPoint(
      pnt2,
      pnt1,
      HALF_PI,
      tailWidth,
      false
    )
    let headLeft = PlotUtil.getThirdPoint(
      pnt1,
      pnt2,
      this.headAngle,
      headWidth,
      false
    )
    let headRight = PlotUtil.getThirdPoint(
      pnt1,
      pnt2,
      this.headAngle,
      headWidth,
      true
    )
    let neckLeft = PlotUtil.getThirdPoint(
      pnt1,
      pnt2,
      this.neckAngle,
      neckWidth,
      false
    )
    let neckRight = PlotUtil.getThirdPoint(
      pnt1,
      pnt2,
      this.neckAngle,
      neckWidth,
      true
    )
    return new Cesium.PolygonHierarchy(
      Transform.transformWGS84ArrayToCartesianArray(
        Parse.parsePositions([
          tailLeft,
          neckLeft,
          headLeft,
          pnt2,
          headRight,
          neckRight,
          tailRight,
        ])
      )
    )
  }
}

export default FineArrowGraphics
