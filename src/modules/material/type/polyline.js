/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import LineFlickerMaterial from '../shader/polyline/PolylineFlickerMaterial.glsl'
import LineFlowMaterial from '../shader/polyline/PolylineFlowMaterial.glsl'
import LineImageTrailMaterial from '../shader/polyline/PolylineImageTrailMaterial.glsl'
import LineLightingMaterial from '../shader/polyline/PolylineLightingMaterial.glsl'
import LineLightingTrailMaterial from '../shader/polyline/PolylineLightingTrailMaterial.glsl'
import LineTrailMaterial from '../shader/polyline/PolylineTrailMaterial.glsl'
import LineFenceMaterial from '../shader/polyline/PolylineFenceMaterial.glsl'
import LineMultiArrowMaterial from '../shader/polyline/PolylineMultiArrowMaterial.glsl'
import LineDashArrowMaterial from '../shader/polyline/PolylineDashArrowMaterial.glsl'
import LineDirectionMaterial from '../shader/polyline/PolylineDirectionMaterial.glsl'
import LineCustomEndpointMaterial from '../shader/polyline/PolylineCustomEndpointMaterial.glsl'

/**
 * PolylineFlicker
 * @type {string}
 */
Cesium.Material.PolylineFlickerType = 'PolylineFlicker'
Cesium.Material._materialCache.addMaterial(
  Cesium.Material.PolylineFlickerType,
  {
    fabric: {
      type: Cesium.Material.PolylineFlickerType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
        speed: 1,
      },
      source: LineFlickerMaterial,
    },
    translucent: function (material) {
      return true
    },
  }
)

/**
 * PolylineFlow
 * @type {string}
 */
Cesium.Material.PolylineFlowType = 'PolylineFlow'
Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineFlowType, {
  fabric: {
    type: Cesium.Material.PolylineFlowType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      speed: 1,
      percent: 0.03,
      gradient: 0.1,
    },
    source: LineFlowMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 * PolylineImageTrail
 * @type {string}
 */
Cesium.Material.PolylineImageTrailType = 'PolylineImageTrail'
Cesium.Material._materialCache.addMaterial(
  Cesium.Material.PolylineImageTrailType,
  {
    fabric: {
      type: Cesium.Material.PolylineImageTrailType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
        image: Cesium.Material.DefaultImageId,
        speed: 1,
        repeat: new Cesium.Cartesian2(1, 1),
      },
      source: LineImageTrailMaterial,
    },
    translucent: function (material) {
      return true
    },
  }
)

/**
 * PolylineLighting
 * @type {string}
 */
Cesium.Material.PolylineLightingType = 'PolylineLighting'
Cesium.Material._materialCache.addMaterial(
  Cesium.Material.PolylineLightingType,
  {
    fabric: {
      type: Cesium.Material.PolylineLightingType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
        image: Cesium.Material.DefaultImageId,
      },
      source: LineLightingMaterial,
    },
    translucent: function (material) {
      return true
    },
  }
)

/**
 * PolylineLightingTrail
 * @type {string}
 */
Cesium.Material.PolylineLightingTrailType = 'PolylineLightingTrail'
Cesium.Material._materialCache.addMaterial(
  Cesium.Material.PolylineLightingTrailType,
  {
    fabric: {
      type: Cesium.Material.PolylineLightingTrailType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
        image: Cesium.Material.DefaultImageId,
        speed: 3.0,
      },
      source: LineLightingTrailMaterial,
    },
    translucent: function (material) {
      return true
    },
  }
)

/**
 * PolylineTrail
 * @type {string}
 */
Cesium.Material.PolylineTrailType = 'PolylineTrail'
Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailType, {
  fabric: {
    type: Cesium.Material.PolylineTrailType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
      image: Cesium.Material.DefaultImageId,
      speed: 1,
      repeat: new Cesium.Cartesian2(1, 1),
    },
    source: LineTrailMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 * PolylineFence
 * @type {string}
 */
Cesium.Material.PolylineFenceType = 'PolylineFence'
Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineFenceType, {
  fabric: {
    type: Cesium.Material.PolylineFenceType,
    uniforms: {
      color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
      outlineColor: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
      dashLength: 10,
      dashPattern: 15,
      outlineWidth: 16,
      maskLength: 20,
    },
    source: LineFenceMaterial,
  },
  translucent: function (material) {
    return true
  },
})

/**
 * PolylineMultiArrow
 * @type {string}
 */
Cesium.Material.PolylineMultiArrowType = 'PolylineMultiArrow'
Cesium.Material._materialCache.addMaterial(
  Cesium.Material.PolylineMultiArrowType,
  {
    strict: true,
    fabric: {
      type: Cesium.Material.PolylineMultiArrowType,
      uniforms: {
        color: Cesium.Color.WHITE,
        repeatFactor: 1,
        antiClockWise: true,
      },
      source: LineMultiArrowMaterial,
    },
    translucent: function (material) {
      return true
    },
  }
)

/**
 * PolylineDashArrow
 * @type {string}
 */
Cesium.Material.PolylineDashArrowType = 'PolylineDashArrow'
Cesium.Material._materialCache.addMaterial(
  Cesium.Material.PolylineDashArrowType,
  {
    strict: true,
    fabric: {
      type: Cesium.Material.PolylineDashArrowType,
      uniforms: {
        color: Cesium.Color.WHITE,
        gapColor: Cesium.Color.TRANSPARENT,
        dashLength: 16,
        dashPattern: 255,
      },
      source: LineDashArrowMaterial,
    },
    translucent: function (material) {
      return true
    },
  }
)

/**
 * PolylineDirection
 * @type {string}
 */
Cesium.Material.PolylineDirectionType = 'PolylineDirection'
Cesium.Material._materialCache.addMaterial(
  Cesium.Material.PolylineDirectionType,
  {
    fabric: {
      type: Cesium.Material.PolylineDirectionType,
      uniforms: {
        color: new Cesium.Color(0, 1, 1, 1),
        directionColor: new Cesium.Color(1, 1, 1, 1),
        outlineColor: new Cesium.Color(1, 1, 1, 1),
        outlineWidth: 0,
      },
      source: LineDirectionMaterial,
    },
    translucent: function (material) {
      return true
    },
  }
)

/**
 * PolylineCustomEndpoint
 * @type {string}
 */
Cesium.Material.PolylineCustomEndpointType = 'PolylineCustomEndpoint'
Cesium.Material._materialCache.addMaterial(
  Cesium.Material.PolylineCustomEndpointType,
  {
    strict: true,
    fabric: {
      type: Cesium.Material.PolylineCustomEndpointType,
      uniforms: {
        color: Cesium.Color.WHITE,
        startType: 0.0, // 普通 0.0; 箭头 1.0; 圆 2.0; 终止竖线 3.0
        endType: 0.0, // 普通 0.0; 箭头 1.0; 圆 2.0; 终止竖线 3.0
        outlineColor: Cesium.Color.WHITE,
        outlineShow: !1,
        lineWidth: 3,
      },
      source: LineCustomEndpointMaterial,
    },
    translucent: function (material) {
      return true
    },
  }
)
