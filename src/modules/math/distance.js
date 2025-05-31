/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import { Transform } from '../transform'

export default function distance(positions) {
  let distance = 0
  if (positions && Array.isArray(positions)) {
    for (let i = 0; i < positions.length - 1; i++) {
      let c1 = Transform.transformWGS84ToCartographic(positions[i])
      let c2 = Transform.transformWGS84ToCartographic(positions[i + 1])
      let geodesic = new Cesium.EllipsoidGeodesic()
      geodesic.setEndPoints(c1, c2)
      let s = geodesic.surfaceDistance
      s = Math.sqrt(Math.pow(s, 2) + Math.pow(c2.height - c1.height, 2))
      distance += s
    }
  }

  return distance.toFixed(3)
}
