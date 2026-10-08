import { Cesium } from '../../../libs'

const upsampleTaskProcessor = new Cesium.TaskProcessor(
  'upsampleQuantizedTerrainMesh',
  Cesium.TerrainData.maximumAsynchronousTasks
)
const uv0Scratch = new Cesium.Cartesian2()
const uv1Scratch = new Cesium.Cartesian2()
const uv2Scratch = new Cesium.Cartesian2()
const weightsScratch = new Cesium.Cartesian3()

class TdtQuantizedTerrainData extends Cesium.QuantizedMeshTerrainData {
  static createChild(
    terrainData,
    tilingScheme,
    thisX,
    thisY,
    thisLevel,
    descendantX,
    descendantY,
    descendantLevel
  ) {
    if (
      descendantLevel !== thisLevel + 1 ||
      Math.floor(descendantX / 2) !== thisX ||
      Math.floor(descendantY / 2) !== thisY
    ) {
      throw new Cesium.DeveloperError(
        'Expected an immediate child terrain tile.'
      )
    }
    // Both terrain types own their rendered mesh. Keep Cesium's internal-field
    // bridge here and never transfer those buffers to the clipping worker.
    const mesh = terrainData._mesh
    if (!mesh) return undefined
    const isEastChild = descendantX !== thisX * 2
    const isNorthChild = descendantY === thisY * 2
    const promise = upsampleTaskProcessor.scheduleTask({
      vertices: mesh.vertices,
      vertexCountWithoutSkirts: mesh.vertexCountWithoutSkirts,
      indices: mesh.indices,
      indexCountWithoutSkirts: mesh.indexCountWithoutSkirts,
      encoding: mesh.encoding,
      minimumHeight: terrainData._minimumHeight ?? mesh.minimumHeight,
      maximumHeight: terrainData._maximumHeight ?? mesh.maximumHeight,
      isEastChild,
      isNorthChild,
      childRectangle: tilingScheme.tileXYToRectangle(
        descendantX,
        descendantY,
        descendantLevel
      ),
      ellipsoid: tilingScheme.ellipsoid,
    })
    // Preserve Cesium's deferred-task contract when the worker is saturated.
    if (!promise) return undefined
    const west = terrainData._westSkirtHeight ?? terrainData._skirtHeight
    const south = terrainData._southSkirtHeight ?? terrainData._skirtHeight
    const east = terrainData._eastSkirtHeight ?? terrainData._skirtHeight
    const north = terrainData._northSkirtHeight ?? terrainData._skirtHeight
    const skirt = Math.min(west, south, east, north) / 2
    const credits = terrainData.credits
    return promise.then((result) => {
      const vertices = new Uint16Array(result.vertices)
      return new TdtQuantizedTerrainData({
        quantizedVertices: vertices,
        indices: Cesium.IndexDatatype.createTypedArray(
          vertices.length / 3,
          result.indices
        ),
        encodedNormals: result.encodedNormals
          ? new Uint8Array(result.encodedNormals)
          : undefined,
        minimumHeight: result.minimumHeight,
        maximumHeight: result.maximumHeight,
        boundingSphere: Cesium.BoundingSphere.clone(result.boundingSphere),
        orientedBoundingBox: Cesium.OrientedBoundingBox.clone(
          result.orientedBoundingBox
        ),
        horizonOcclusionPoint: Cesium.Cartesian3.clone(
          result.horizonOcclusionPoint
        ),
        westIndices: result.westIndices,
        southIndices: result.southIndices,
        eastIndices: result.eastIndices,
        northIndices: result.northIndices,
        westSkirtHeight: isEastChild ? skirt : west,
        southSkirtHeight: isNorthChild ? skirt : south,
        eastSkirtHeight: isEastChild ? east : skirt,
        northSkirtHeight: isNorthChild ? north : skirt,
        childTileMask: 0,
        credits,
        createdByUpsampling: true,
      })
    })
  }

  upsample(...args) {
    return TdtQuantizedTerrainData.createChild(this, ...args)
  }

  interpolateHeight(rectangle, longitude, latitude) {
    const mesh = this._mesh
    if (!mesh) {
      return super.interpolateHeight(rectangle, longitude, latitude)
    }
    // Mesh UVs are normalized; only the pre-mesh data uses 0..32767.
    const u = Cesium.Math.clamp(
      (longitude - rectangle.west) / rectangle.width,
      0,
      1
    )
    const v = Cesium.Math.clamp(
      (latitude - rectangle.south) / rectangle.height,
      0,
      1
    )
    const { vertices, indices, encoding, indexCountWithoutSkirts } = mesh
    const epsilon = Cesium.Math.EPSILON12
    for (let i = 0; i < indexCountWithoutSkirts; i += 3) {
      const i0 = indices[i]
      const i1 = indices[i + 1]
      const i2 = indices[i + 2]
      const a = encoding.decodeTextureCoordinates(vertices, i0, uv0Scratch)
      const b = encoding.decodeTextureCoordinates(vertices, i1, uv1Scratch)
      const c = encoding.decodeTextureCoordinates(vertices, i2, uv2Scratch)
      if (
        u < Math.min(a.x, b.x, c.x) - epsilon ||
        u > Math.max(a.x, b.x, c.x) + epsilon ||
        v < Math.min(a.y, b.y, c.y) - epsilon ||
        v > Math.max(a.y, b.y, c.y) + epsilon
      ) {
        continue
      }
      const weights = Cesium.Intersections2D.computeBarycentricCoordinates(
        u,
        v,
        a.x,
        a.y,
        b.x,
        b.y,
        c.x,
        c.y,
        weightsScratch
      )
      if (
        weights.x >= -epsilon &&
        weights.y >= -epsilon &&
        weights.z >= -epsilon
      ) {
        return (
          weights.x * encoding.decodeHeight(vertices, i0) +
          weights.y * encoding.decodeHeight(vertices, i1) +
          weights.z * encoding.decodeHeight(vertices, i2)
        )
      }
    }
    return undefined
  }
}

export default TdtQuantizedTerrainData
