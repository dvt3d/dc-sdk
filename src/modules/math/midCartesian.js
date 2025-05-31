/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'

export default function midCartesian(start, end) {
  return Cesium.Cartesian3.midpoint(start, end, new Cesium.Cartesian3())
}
