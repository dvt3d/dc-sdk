/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import DrawPolyline from '../draw/DrawPolyline'
import EditPolyline from '../edit/EditPolyline'
import MeasureBase from '../MeasureBase'

class Angle extends MeasureBase {
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
      this._resultLabel.position = positions[1]

      let up = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(
        positions[0],
        new Cesium.Cartesian3()
      )

      let plane = Cesium.Plane.fromPointNormal(positions[0], up)

      this._helpLinePositions = [
        positions[0],
        Cesium.Plane.projectPointOntoPlane(
          plane,
          positions[1],
          new Cesium.Cartesian3()
        ),
        positions[1],
      ]

      let hegiht = Math.abs(Cesium.Plane.getPointDistance(plane, positions[1]))

      this._resultLabel.label.text = `角度：${Cesium.Math.toDegrees(
        Math.asin(
          hegiht / Cesium.Cartesian3.distance(positions[0], positions[1])
        )
      ).toFixed(2)} 度`
    }
  }

  /**
   *
   * @param measure
   * @param options
   * @returns {Angle}
   */
  start(measure, options) {
    this._startHook(measure, options)
    let helpLineMaterial = new Cesium.PolylineDashMaterialProperty({
      color: Cesium.Color.GREENYELLOW,
    })
    this._helpLine.polyline.material = helpLineMaterial
    this._helpLine.polyline.depthFailMaterial = helpLineMaterial
    this._layer.entities.add(this._helpLine)
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

export default Angle
