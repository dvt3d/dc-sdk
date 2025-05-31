/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Parse from '../../parse/Parse'
import { Transform } from '../../transform'
import { PlotUtil } from '../../utils'

const HALF_PI = Math.PI / 2

class AttackArrowGraphics {
  constructor(options) {
    this._positions = options?.positions || []
    this.headHeightFactor = 0.18
    this.headWidthFactor = 0.3
    this.neckHeightFactor = 0.85
    this.neckWidthFactor = 0.15
    this.headTailFactor = 0.8
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

  _getArrowHeadPoints(points, tailLeft, tailRight) {
    let len = PlotUtil.getBaseLength(points)
    let headHeight = len * this.headHeightFactor
    let headPnt = points[points.length - 1]
    len = PlotUtil.distance(headPnt, points[points.length - 2])
    let tailWidth = PlotUtil.distance(tailLeft, tailRight)
    if (headHeight > tailWidth * this.headTailFactor) {
      headHeight = tailWidth * this.headTailFactor
    }
    let headWidth = headHeight * this.headWidthFactor
    let neckWidth = headHeight * this.neckWidthFactor
    headHeight = headHeight > len ? len : headHeight
    let neckHeight = headHeight * this.neckHeightFactor
    let headEndPnt = PlotUtil.getThirdPoint(
      points[points.length - 2],
      headPnt,
      0,
      headHeight,
      true
    )
    let neckEndPnt = PlotUtil.getThirdPoint(
      points[points.length - 2],
      headPnt,
      0,
      neckHeight,
      true
    )
    let headLeft = PlotUtil.getThirdPoint(
      headPnt,
      headEndPnt,
      HALF_PI,
      headWidth,
      false
    )
    let headRight = PlotUtil.getThirdPoint(
      headPnt,
      headEndPnt,
      HALF_PI,
      headWidth,
      true
    )
    let neckLeft = PlotUtil.getThirdPoint(
      headPnt,
      neckEndPnt,
      HALF_PI,
      neckWidth,
      false
    )
    let neckRight = PlotUtil.getThirdPoint(
      headPnt,
      neckEndPnt,
      HALF_PI,
      neckWidth,
      true
    )
    return [neckLeft, headLeft, headPnt, headRight, neckRight]
  }

  _getArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
    let allLen = PlotUtil.wholeDistance(points)
    let len = PlotUtil.getBaseLength(points)
    let tailWidth = len * tailWidthFactor
    let neckWidth = PlotUtil.distance(neckLeft, neckRight)
    let widthDif = (tailWidth - neckWidth) / 2
    let tempLen = 0
    let leftBodyPnts = []
    let rightBodyPnts = []
    for (let i = 1; i < points.length - 1; i++) {
      let angle =
        PlotUtil.getAngleOfThreePoints(
          points[i - 1],
          points[i],
          points[i + 1]
        ) / 2
      tempLen += PlotUtil.distance(points[i - 1], points[i])
      let w = (tailWidth / 2 - (tempLen / allLen) * widthDif) / Math.sin(angle)
      let left = PlotUtil.getThirdPoint(
        points[i - 1],
        points[i],
        Math.PI - angle,
        w,
        true
      )
      let right = PlotUtil.getThirdPoint(
        points[i - 1],
        points[i],
        angle,
        w,
        false
      )
      leftBodyPnts.push(left)
      rightBodyPnts.push(right)
    }
    return leftBodyPnts.concat(rightBodyPnts)
  }

  _createHierarchy() {
    let pnts = Parse.parsePolygonCoordToArray(
      Transform.transformCartesianArrayToWGS84Array(this._positions)
    )[0]
    let tailLeft = pnts[0]
    let tailRight = pnts[1]
    if (PlotUtil.isClockWise(pnts[0], pnts[1], pnts[2])) {
      tailLeft = pnts[1]
      tailRight = pnts[0]
    }
    let midTail = PlotUtil.mid(tailLeft, tailRight)
    let bonePnts = [midTail].concat(pnts.slice(2))
    // 计算箭头
    let headPnts = this._getArrowHeadPoints(bonePnts, tailLeft, tailRight)
    let neckLeft = headPnts[0]
    let neckRight = headPnts[4]
    let tailWidthFactor =
      PlotUtil.distance(tailLeft, tailRight) / PlotUtil.getBaseLength(bonePnts)
    // 计算箭身
    let bodyPnts = this._getArrowBodyPoints(
      bonePnts,
      neckLeft,
      neckRight,
      tailWidthFactor
    )
    // 整合
    let count = bodyPnts.length
    let leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2))
    leftPnts.push(neckLeft)
    let rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count))
    rightPnts.push(neckRight)
    leftPnts = PlotUtil.getQBSplinePoints(leftPnts)
    rightPnts = PlotUtil.getQBSplinePoints(rightPnts)
    return new Cesium.PolygonHierarchy(
      Transform.transformWGS84ArrayToCartesianArray(
        Parse.parsePositions(leftPnts.concat(headPnts, rightPnts.reverse()))
      )
    )
  }
}

export default AttackArrowGraphics
