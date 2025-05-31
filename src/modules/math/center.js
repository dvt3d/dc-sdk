/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import { Transform } from '../transform'
import Position from '../position/Position'

export default function center(positions) {
  if (positions && Array.isArray(positions)) {
    let heightMax = 0
    positions.forEach(({ alt }) => (heightMax = Math.max(heightMax, alt)))

    let boundingSphere = Cesium.BoundingSphere.fromPoints(
      Transform.transformWGS84ArrayToCartesianArray(positions)
    )
    const position = Transform.transformCartesianToWGS84(boundingSphere.center)
    position.alt = heightMax
    return position
  }

  return new Position()
}
