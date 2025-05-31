/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import Layer from '../Layer'

const DEF_OPTS = {
  radialColor: Cesium.Color.WHITE,
  radialWidth: 2,
  showRadial: true,
  LabelColor: Cesium.Color.YELLOW,
  weftColor: Cesium.Color.WHITE,
  weftWidth: 2,
}

class GraticuleLayer extends Layer {
  constructor(id, options) {
    super(id)
    this._options = {
      ...DEF_OPTS,
      ...options,
    }
    this._delegate = new Cesium.CustomDataSource(id)
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('graticule')
  }

  _addedHook() {
    for (let i = 0; i < 36; i++) {
      this._delegate.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            i * 10,
            89.5,
            i * 10,
            -89.5,
          ]),
          material: this._options.radialColor,
          width: this._options.radialWidth,
        },
        show: this._options.showRadial,
      })

      this._delegate.entities.add({
        position: Cesium.Cartesian3.fromDegrees(i * 10, 0.0),
        label: {
          text: i * 10 + '°',
          font: '12px',
          fillColor: this._options.LabelColor,
        },
      })
    }

    for (let i = 0; i < 18; i++) {
      let coords = []
      for (let k = 0; k < 129; k++) {
        coords.push(-180 + k * (360 / 128), (i < 9 ? i : -i) * 10)
      }
      this._delegate.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(coords),
          material: this._options.weftColor,
          width: this._options.weftWidth,
        },
      })
    }
  }
}

Layer.registerType('graticule')

export default GraticuleLayer
