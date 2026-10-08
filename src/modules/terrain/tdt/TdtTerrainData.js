import { Cesium } from '../../../libs'
import TdtQuantizedTerrainData from './TdtQuantizedTerrainData'

class TdtTerrainData extends Cesium.HeightmapTerrainData {
  upsample(...args) {
    // Failed source tiles need the same worker-based fallback as finer levels.
    return TdtQuantizedTerrainData.createChild(this, ...args)
  }
}

export default TdtTerrainData
