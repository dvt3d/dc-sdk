/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
import { Util } from '../utils'

import area from './area'
import bounds from './bounds'
import center from './center'
import curve from './curve'
import distance from './distance'
import heading from './heading'
import isBetween from './isBetween'
import midCartesian from './midCartesian'
import midPosition from './midPosition'
import parabola from './parabola'

const { Math: CesiumMath } = Cesium

let Math = {}

Util.merge(Math, CesiumMath, {
  area,
  bounds,
  center,
  curve,
  distance,
  heading,
  isBetween,
  midCartesian,
  midPosition,
  parabola,
})

export {
  area,
  bounds,
  center,
  curve,
  distance,
  heading,
  isBetween,
  midCartesian,
  midPosition,
  parabola,
  Math,
}
