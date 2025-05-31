/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import WallDiffuseMaterial from '../shader/wall/WallDiffuseMaterial.glsl'
import WallImageTrailMaterial from '../shader/wall/WallImageTrailMaterial.glsl'
import WallLineTrailMaterial from '../shader/wall/WallLineTrailMaterial.glsl'
import WallTrailMaterial from '../shader/wall/WallTrailMaterial.glsl'

/**
 * WallDiffuse
 * @type {string}
 */
Cesium.Material.WallDiffuseType = 'WallDiffuse'
Cesium.Material._materialCache.addMaterial(Cesium.Material.WallDiffuseType, {
  fabric: {
    type: Cesium.Material.WallDiffuseType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
    },
    source: WallDiffuseMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 * WallImageTrail
 * @type {string}
 */
Cesium.Material.WallImageTrailType = 'WallImageTrail'
Cesium.Material._materialCache.addMaterial(Cesium.Material.WallImageTrailType, {
  fabric: {
    type: Cesium.Material.WallImageTrailType,
    uniforms: {
      image: Cesium.Material.DefaultImageId,
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      speed: 3.0,
      repeat: new Cesium.Cartesian2(1, 1),
    },
    source: WallImageTrailMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 *  WallLineTrail
 * @type {string}
 */
Cesium.Material.WallLineTrailType = 'WallLineTrail'
Cesium.Material._materialCache.addMaterial(Cesium.Material.WallLineTrailType, {
  fabric: {
    type: Cesium.Material.WallLineTrailType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      image: Cesium.Material.DefaultImageId,
      repeat: new Cesium.Cartesian2(1, 1),
      speed: 3.0,
    },
    source: WallLineTrailMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 * WallTrail
 * @type {string}
 */
Cesium.Material.WallTrailType = 'WallTrail'
Cesium.Material._materialCache.addMaterial(Cesium.Material.WallTrailType, {
  fabric: {
    type: Cesium.Material.WallTrailType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      image: Cesium.Material.DefaultImageId,
      speed: 1,
    },
    source: WallTrailMaterial,
  },
  translucent: function (material) {
    return true
  },
})
