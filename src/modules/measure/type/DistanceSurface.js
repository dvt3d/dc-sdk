/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import DrawPolyline from '../draw/DrawPolyline'
import EditPolyline from '../edit/EditPolyline'
import MeasureBase from '../MeasureBase'

class DistanceSurface extends MeasureBase {
  constructor() {
    super()
    this._maxAnchorSize = 9999
  }

  /**
   *
   * @param start
   * @param end
   * @param num
   * @returns {*[]}
   * @private
   */
  _lerp(start, end, num = 5) {
    let lerpPositions = []
    let c1 = Cesium.Cartographic.fromCartesian(start)
    let c2 = Cesium.Cartographic.fromCartesian(end)
    for (let i = 0; i < num; i++) {
      let lng = Cesium.Math.lerp(c1.longitude, c2.longitude, i / num)
      let lat = Cesium.Math.lerp(c1.latitude, c2.latitude, i / num)
      let alt = c1.height - (c1.height - c2.height) * (i / num)
      lerpPositions.push(Cesium.Cartesian3.fromRadians(lng, lat, alt))
    }
    return lerpPositions
  }

  /**
   *
   * @param entity
   * @private
   */
  _onDrawStop(entity) {
    new EditPolyline(entity).start(
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
      let lerpPositions = [positions[0]]
      this._resultLabel.position = positions[positions.length - 1]
      for (let i = 0; i < positions.length - 1; i++) {
        lerpPositions = lerpPositions.concat(
          this._lerp(positions[i], positions[i + 1], this._options.lerpNum)
        )
      }
      lerpPositions.push(positions[positions.length - 1])
      this._getSampledHeight(lerpPositions)
        .then(([updatedCartographics, updatedCartesians]) => {
          return updatedCartographics.map((item, index) =>
            Cesium.Cartesian3.fromDegrees(
              Cesium.Math.toDegrees(item.longitude),
              Cesium.Math.toDegrees(item.latitude),
              Math.max(
                item.height || 0,
                updatedCartesians[index]
                  ? Cesium.Cartographic.fromCartesian(updatedCartesians[index])
                      .height
                  : 0
              )
            )
          )
        })
        .then((positions) => {
          let sum = 0
          for (let i = 0; i < positions.length - 1; i++) {
            let s = Cesium.Cartesian3.distance(positions[i], positions[i + 1])
            sum += s
          }
          this._resultLabel.label.text =
            sum > 1000
              ? `距离：${(sum / 1000).toFixed(2)} 公里`
              : `距离：${sum.toFixed(2)} 米`
        })
    }
  }

  /**
   *
   * @param measure
   * @param options
   * @returns {DistanceSurface}
   */
  start(measure, options) {
    this._startHook(measure, options)
    new DrawPolyline({
      material: options.material || Cesium.Color.YELLOW.withAlpha(0.6),
      depthFailMaterial:
        options.depthFailMaterial ||
        new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW.withAlpha(0.6),
        }),
      width: options.width || 2,
      clampToGround: true,
    }).start(measure, {
      ...this._options,
      ...{ maxAnchorSize: this._maxAnchorSize },
    })
    return this
  }
}

export default DistanceSurface
