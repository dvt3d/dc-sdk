/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import CircleBlurMaterial from '../shader/circle/CircleBlurMaterial.glsl'
import CircleDiffuseMaterial from '../shader/circle/CircleDiffuseMaterial.glsl'
import CircleFadeMaterial from '../shader/circle/CircleFadeMaterial.glsl'
import CirclePulseMaterial from '../shader/circle/CirclePulseMaterial.glsl'
import CircleRingMaterial from '../shader/circle/CircleRingMaterial.glsl'
import CircleRotateMaterial from '../shader/circle/CircleRotateMaterial.glsl'
import CircleScanMaterial from '../shader/circle/CircleScanMaterial.glsl'
import CircleSpiralMaterial from '../shader/circle/CircleSpiralMaterial.glsl'
import CircleVaryMaterial from '../shader/circle/CircleVaryMaterial.glsl'
import CircleWaveMaterial from '../shader/circle/CircleWaveMaterial.glsl'

/**
 * CircleBlur
 * @type {string}
 */
Cesium.Material.CircleBlurType = 'CircleBlur'
Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleBlurType, {
  fabric: {
    type: Cesium.Material.CircleBlurType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      speed: 3.0,
    },
    source: CircleBlurMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 * CircleDiffuse
 * @type {string}
 */
Cesium.Material.CircleDiffuseType = 'CircleDiffuse'
Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleDiffuseType, {
  fabric: {
    type: Cesium.Material.CircleDiffuseType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      speed: 3.0,
    },
    source: CircleDiffuseMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 * CircleFade
 * @type {string}
 */
Cesium.Material.CircleFadeType = 'CircleFade'
Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleFadeType, {
  fabric: {
    type: Cesium.Material.CircleFadeType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      speed: 3.0,
    },
    source: CircleFadeMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 * CirclePulse
 * @type {string}
 */
Cesium.Material.CirclePulseType = 'CirclePulse'
Cesium.Material._materialCache.addMaterial(Cesium.Material.CirclePulseType, {
  fabric: {
    type: Cesium.Material.CirclePulseType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      speed: 12.0,
    },
    source: CirclePulseMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 * CircleRing
 * @type {string}
 */
Cesium.Material.CircleRingType = 'CircleRing'
Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleRingType, {
  fabric: {
    type: Cesium.Material.CircleRingType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
    },
    source: CircleRingMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 * CircleRotate
 * @type {string}
 */
Cesium.Material.CircleRotateType = 'CircleRotate'
Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleRotateType, {
  fabric: {
    type: Cesium.Material.CircleRotateType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      image: Cesium.Material.DefaultImageId,
    },
    source: CircleRotateMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 * CircleScan
 * @type {string}
 */
Cesium.Material.CircleScanType = 'CircleScan'
Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleScanType, {
  fabric: {
    type: Cesium.Material.CircleScanType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      speed: 1,
    },
    source: CircleScanMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 * CircleSpiral
 * @type {string}
 */
Cesium.Material.CircleSpiralType = 'CircleSpiral'
Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleSpiralType, {
  fabric: {
    type: Cesium.Material.CircleSpiralType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      speed: 3.0,
    },
    source: CircleSpiralMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 * CircleVary
 * @type {string}
 */
Cesium.Material.CircleVaryType = 'CircleVary'
Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleVaryType, {
  fabric: {
    type: Cesium.Material.CircleVaryType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      speed: 3.0,
    },
    source: CircleVaryMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 * CircleWave
 * @type {string}
 */
Cesium.Material.CircleWaveType = 'CircleWave'
Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleWaveType, {
  fabric: {
    type: Cesium.Material.CircleWaveType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      speed: 3.0,
      count: 1,
      gradient: 0.1,
    },
    source: CircleWaveMaterial,
  },
  translucent: function (material) {
    return true
  },
})
