/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import { Transform } from '../transform'

/**
 *
 * @param p0
 * @param p1
 * @param p2
 * @returns {number}
 * @private
 */
function triangleArea(p0, p1, p2) {
  let v0 = Cesium.Cartesian3.subtract(p0, p1, new Cesium.Cartesian3())
  let v1 = Cesium.Cartesian3.subtract(p2, p1, new Cesium.Cartesian3())
  let cross = Cesium.Cartesian3.cross(v0, v1, v0)
  return Cesium.Cartesian3.magnitude(cross) * 0.5
}

export default function area(positions) {
  let result = 0
  if (!Array.isArray(positions)) {
    return result
  }
  if (!(positions[0] instanceof Cesium.Cartesian3)) {
    positions = Transform.transformWGS84ArrayToCartesianArray(positions)
  }
  let geometry = Cesium.CoplanarPolygonGeometry.createGeometry(
    Cesium.CoplanarPolygonGeometry.fromPositions({
      positions: positions,
      vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
    })
  )
  if (!geometry) {
    return result
  }
  let flatPositions = geometry.attributes.position.values
  let indices = geometry.indices
  for (let i = 0; i < indices.length; i += 3) {
    let p0 = Cesium.Cartesian3.unpack(
      flatPositions,
      indices[i] * 3,
      new Cesium.Cartesian3()
    )
    let p1 = Cesium.Cartesian3.unpack(
      flatPositions,
      indices[i + 1] * 3,
      new Cesium.Cartesian3()
    )
    let p2 = Cesium.Cartesian3.unpack(
      flatPositions,
      indices[i + 2] * 3,
      new Cesium.Cartesian3()
    )
    result += triangleArea(p0, p1, p2)
  }
  return result
}
