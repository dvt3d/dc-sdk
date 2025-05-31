/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import { Label } from '../../overlay'
import Layer from '../Layer'

class LabelLayer extends Layer {
  constructor(id, url = '') {
    super(id)
    this._dataSource = Cesium.GeoJsonDataSource.load(url)
    this._delegate = new Cesium.CustomDataSource(id)
    this._initLabel()
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('label')
  }

  _createLabel(entity) {
    if (entity.position && entity.name) {
      return Label.fromEntity(entity)
    }
  }

  _initLabel() {
    this._dataSource.then((dataSource) => {
      let entities = dataSource.entities.values
      entities.forEach((item) => {
        let label = this._createLabel(item)
        this.addOverlay(label)
      })
    })
  }
}

Layer.registerType('label')

export default LabelLayer
