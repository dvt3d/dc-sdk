/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import { Transform } from '../transform'
import Parse from '../parse/Parse'

export default function heading(start, end) {
  let startPosition = start
  let endPosition = end
  if (!startPosition || !endPosition) {
    return 0
  }

  if (!(start instanceof Cesium.Cartesian3)) {
    startPosition = Parse.parsePosition(start)
    startPosition = Transform.transformWGS84ToCartesian(startPosition)
  }

  if (!(end instanceof Cesium.Cartesian3)) {
    endPosition = Parse.parsePosition(end)
    endPosition = Transform.transformWGS84ToCartesian(endPosition)
  }

  let ff = Cesium.Transforms.eastNorthUpToFixedFrame(startPosition)
  let v = Cesium.Cartesian3.subtract(
    endPosition,
    startPosition,
    new Cesium.Cartesian3()
  )
  let vector = Cesium.Matrix4.multiplyByPointAsVector(
    Cesium.Matrix4.inverse(ff, new Cesium.Matrix4()),
    v,
    new Cesium.Cartesian3()
  )

  let heading = Math.atan2(vector.y, vector.x) - Cesium.Math.PI_OVER_TWO

  heading = Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)

  return isNaN(heading) ? 0 : heading
}
