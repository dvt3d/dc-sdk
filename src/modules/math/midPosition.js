/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import { Transform } from '../transform'
import Parse from '../parse/Parse'
import Position from '../position/Position'

export default function midPosition(start, end) {
  let startPosition = Parse.parsePosition(start)
  let endPosition = Parse.parsePosition(end)
  startPosition = Transform.transformWGS84ToCartographic(startPosition)
  endPosition = Transform.transformWGS84ToCartographic(endPosition)
  let mc = new Cesium.EllipsoidGeodesic(
    startPosition,
    endPosition
  ).interpolateUsingFraction(0.5)

  return new Position(
    Cesium.Math.toDegrees(mc.longitude),
    Cesium.Math.toDegrees(mc.latitude),
    mc.height
  )
}
