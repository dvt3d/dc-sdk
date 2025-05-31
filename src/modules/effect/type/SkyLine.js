/**
 * @Author: Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import SkyLineRedShader from '../../material/shader/skyline/SkyLineRedShader.glsl'
import SkyLineShader from '../../material/shader/skyline/SkyLineShader.glsl'

class SkyLine {
  constructor(viewer) {
    this._viewer = viewer
    this._delegate = undefined
    this._enable = false
    this._depthThreshold = 0.00001
    this._color = Cesium.Color.RED
    this._state = State.INITIALIZED
  }

  get type() {
    return 'skyLine'
  }

  set enable(enable) {
    this._enable = enable
    !this._delegate && this._createPostProcessStage()
    this._delegate.enabled = enable
    this._state = enable ? State.ENABLED : State.DISABLED
  }

  get enable() {
    return this._enable
  }

  set depthThreshold(depthThreshold) {
    this._depthThreshold = depthThreshold
  }

  get depthThreshold() {
    return this._depthThreshold
  }

  set color(color) {
    this._color = color
  }

  get color() {
    return this._color
  }
  /**
   *
   * @private
   */
  _createPostProcessStage() {
    const edgeDetection =
      Cesium.PostProcessStageLibrary.createEdgeDetectionStage()

    const self = this
    const redStage = new Cesium.PostProcessStage({
      fragmentShader: SkyLineRedShader,
      uniforms: {
        u_depthThreshold: function () {
          return self._depthThreshold
        },
      },
    })
    const stage = new Cesium.PostProcessStage({
      fragmentShader: SkyLineShader,
      uniforms: {
        u_silhouetteTexture: edgeDetection.name,
        u_redTexture: redStage.name,
        u_color: function () {
          return self._color
        },
      },
    })

    this._delegate = new Cesium.PostProcessStageComposite({
      stages: [edgeDetection, redStage, stage],
      inputPreviousStageTexture: false,
      uniforms: edgeDetection.uniforms,
    })
    this._viewer.scene.postProcessStages.add(this._delegate)
  }
}

export default SkyLine
