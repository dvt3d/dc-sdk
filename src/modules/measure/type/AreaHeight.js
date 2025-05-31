/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import DrawPolygon from '../draw/DrawPolygon'
import EditPolygon from '../edit/EditPolygon'
import MeasureBase from '../MeasureBase'

class AreaHeight extends MeasureBase {
  constructor() {
    super()
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
   * @param positions
   * @private
   */
  _onCalc(positions) {
    if (positions.length > 2) {
      let lerpPositions = this._lerp(
        Cesium.Rectangle.fromCartesianArray(positions),
        this._options.lerpNum
      )

      this._getSampledHeight(lerpPositions, true)
        .then(([updatedCartographics, updatedCartesians]) => {
          return updatedCartographics.map((item, index) => {
            return {
              lng: item.longitude,
              lat: item.latitude,
              alt: Math.max(
                item.height || 0,
                updatedCartesians[index]
                  ? Cesium.Cartographic.fromCartesian(updatedCartesians[index])
                      .height
                  : 0
              ),
            }
          })
        })
        .then((positions) => {
          let max = 0
          let position = undefined
          positions.forEach((item) => {
            if (item.alt > max) {
              max = item.alt
              position = item
            }
          })
          if (position) {
            this._resultLabel.position = Cesium.Cartesian3.fromRadians(
              position.lng,
              position.lat,
              position.alt
            )
            this._resultLabel.label.text = `高度：${max.toFixed(2)} 米`
          }
        })
    }
  }

  /**
   *
   * @param measure
   * @param options
   * @returns {AreaHeight}
   */
  start(measure, options) {
    this._startHook(measure, options)
    new DrawPolygon({
      material: options.material || Cesium.Color.YELLOW.withAlpha(0.6),
    }).start(measure, this._options)
    return this
  }
}

export default AreaHeight
