/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import { area } from '../../math'
import EditPolygon from '../edit/EditPolygon'
import DrawPolygon from '../draw/DrawPolygon'
import MeasureBase from '../MeasureBase'

class AreaSurface extends MeasureBase {
  constructor() {
    super()
  }

  /**
   *
   * @param rectangle
   * @param num
   * @returns {*[]}
   * @private
   */
  _lerp(rectangle, num = 4) {
    let lerpPositions = []
    for (let y = 0; y < num; ++y) {
      for (let x = 0; x < num; ++x) {
        let longitude = Cesium.Math.lerp(
          rectangle.west,
          rectangle.east,
          x / (num - 1)
        )
        let latitude = Cesium.Math.lerp(
          rectangle.south,
          rectangle.north,
          y / (num - 1)
        )
        lerpPositions.push(Cesium.Cartesian3.fromRadians(longitude, latitude))
      }
    }
    return lerpPositions
  }

  /**
   *
   * @param entity
   * @private
   */
  _onDrawStop(entity) {
    new EditPolygon(entity).start(
      {
        viewer: this._viewer,
        layer: this._layer,
      },
      this._options
    )
  }

  /**
   *
   * @param positions
   * @private
   */
  _onCalc(positions) {
    if (positions.length > 2) {
      this._resultLabel.position =
        Cesium.BoundingSphere.fromPoints(positions)?.center

      let lerpPositions = this._lerp(
        Cesium.Rectangle.fromCartesianArray(positions),
        this._options.lerpNum
      )

      this._getSampledHeight(lerpPositions.concat(positions), false)
        .then(([updatedCartographics]) => {
          return updatedCartographics.map((item) =>
            Cesium.Cartesian3.fromDegrees(
              Cesium.Math.toDegrees(item.longitude),
              Cesium.Math.toDegrees(item.latitude),
              item.height
            )
          )
        })
        .then((positions) => {
          this._resultLabel.label.text = `面积：${area(positions).toFixed(
            2
          )} 平方米`
        })
    }
  }

  /**
   *
   * @param measure
   * @param options
   * @returns {AreaSurface}
   */
  start(measure, options) {
    this._startHook(measure, options)
    new DrawPolygon({
      material: options.material || Cesium.Color.YELLOW.withAlpha(0.6),
    }).start(measure, this._options)
    return this
  }
}

export default AreaSurface
