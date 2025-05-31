/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import DrawPolyline from '../draw/DrawPolyline'
import EditPolyline from '../edit/EditPolyline'
import MeasureBase from '../MeasureBase'

class TriangleHeight extends MeasureBase {
  constructor() {
    super()
    this._maxAnchorSize = 2
    this._helpLinePositions = []
    this._helpLine = new Cesium.Entity({
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          if (this._helpLinePositions.length > 1) {
            return this._helpLinePositions
          } else {
            return null
          }
        }, false),
      },
    })
    this._lengthLabel = new Cesium.Entity({
      label: {
        font: '12px',
        pixelOffset: { x: 0, y: -15 },
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        showBackground: true,
      },
    })
    this._heightLabel = new Cesium.Entity({
      label: {
        font: '12px',
        pixelOffset: { x: 0, y: -15 },
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        showBackground: true,
      },
    })
    this._distanceLabel = new Cesium.Entity({
      label: {
        font: '12px',
        pixelOffset: { x: 0, y: -15 },
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        showBackground: true,
      },
    })
  }

  /**
   *
   * @param delegate
   * @private
   */
  _onDrawStop(delegate) {
    new EditPolyline(delegate).start(
      {
        viewer: this._viewer,
        layer: this._layer,
      },
      {
        ...this._options,
        ...{ maxAnchorSize: this._maxAnchorSize },
      }
    )
  }

  /**
   *
   * @param positions
   * @private
   */
  _onCalc(positions) {
    if (positions.length > 0) {
      this._startLabel.position = positions[0]
    }
    if (positions.length > 1) {
      let up = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(
        positions[0],
        new Cesium.Cartesian3()
      )

      let plane = Cesium.Plane.fromPointNormal(positions[0], up)

      let projectPoint = Cesium.Plane.projectPointOntoPlane(
        plane,
        positions[1],
        new Cesium.Cartesian3()
      )

      this._helpLinePositions = [positions[0], projectPoint, positions[1]]

      let length = Cesium.Cartesian3.distance(positions[0], projectPoint)

      let hegiht = Math.abs(Cesium.Plane.getPointDistance(plane, positions[1]))

      let distance = Cesium.Cartesian3.distance(positions[0], positions[1])

      this._lengthLabel.position = Cesium.Cartesian3.midpoint(
        positions[0],
        projectPoint,
        new Cesium.Cartesian3()
      )

      this._lengthLabel.label.text =
        length > 1000
          ? `${(length / 1000).toFixed(2)} 公里`
          : `${length.toFixed(2)} 米`

      this._distanceLabel.position = Cesium.Cartesian3.midpoint(
        positions[0],
        positions[1],
        new Cesium.Cartesian3()
      )
      this._distanceLabel.label.text =
        distance > 1000
          ? `${(distance / 1000).toFixed(2)} 公里`
          : `${distance.toFixed(2)} 米`

      this._heightLabel.position = Cesium.Cartesian3.midpoint(
        projectPoint,
        positions[1],
        new Cesium.Cartesian3()
      )
      this._heightLabel.label.text =
        hegiht > 1000
          ? `${(hegiht / 1000).toFixed(2)} 公里`
          : `${hegiht.toFixed(2)} 米`
    }
  }

  /**
   *
   * @param measure
   * @param options
   * @returns {TriangleHeight}
   */
  start(measure, options) {
    this._startHook(measure, options)
    let helpLineMaterial = new Cesium.PolylineDashMaterialProperty({
      color: Cesium.Color.GREENYELLOW,
    })
    this._helpLine.polyline.material = helpLineMaterial
    this._helpLine.polyline.depthFailMaterial = helpLineMaterial
    this._layer.entities.add(this._helpLine)
    this._layer.entities.add(this._lengthLabel)
    this._layer.entities.add(this._heightLabel)
    this._layer.entities.add(this._distanceLabel)
    new DrawPolyline({
      material: options.material || Cesium.Color.YELLOW.withAlpha(0.6),
      depthFailMaterial:
        options.depthFailMaterial ||
        new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW.withAlpha(0.6),
        }),
      width: options.width || 2,
      clampToGround: false,
    }).start(measure, {
      ...options,
      ...{ maxAnchorSize: this._maxAnchorSize },
    })
    return this
  }
}

export default TriangleHeight
