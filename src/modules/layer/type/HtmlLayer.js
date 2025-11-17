/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import State from '../../state/State'
import { Util, DomUtil } from '../../utils'
import { Transform } from '../../transform'
import Layer from '../Layer'

class HtmlLayer extends Layer {
  constructor(id) {
    super(id)
    this._delegate = DomUtil.create('div', 'html-layer', undefined)
    this._delegate.setAttribute('id', this._id)
    Util.merge(this._delegate.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    })

    this._renderRemoveCallback = undefined
    this._state = State.INITIALIZED
  }

  get type() {
    return Layer.getLayerType('html')
  }

  set show(show) {
    this._show = show
    this._delegate.style.visibility = this._show ? 'visible' : 'hidden'
    Object.keys(this._cache).forEach((key) => {
      this._cache[key].show = show
    })
  }

  get show() {
    return this._show
  }

  /**
   * add handler
   * @param viewer
   * @private
   */
  _onAdd(viewer) {
    this._viewer = viewer
    this._viewer.layerContainer.appendChild(this._delegate)
    let scene = this._viewer.scene
    this._renderRemoveCallback = scene.postRender.addEventListener(() => {
      let cp = this._viewer.camera.positionWC
      let cd = this._viewer.camera.direction

      this.eachOverlay((item) => {
        if (item && item.position) {
          let position = Transform.transformWGS84ToCartesian(item.position)
          let up = scene.globe.ellipsoid.geodeticSurfaceNormal(
            position,
            new Cesium.Cartesian3()
          )
          let windowCoord = Cesium.SceneTransforms.worldToWindowCoordinates(
            scene,
            position
          )
          item._updateStyle(
            windowCoord,
            Cesium.Cartesian3.distance(position, cp),
            Cesium.Cartesian3.dot(cd, up) <= 0
          )
        }
      }, this)
    }, this)
    this._state = State.ADDED
  }

  /**
   * remove handler
   * @returns {boolean}
   * @private
   */
  _onRemove() {
    this._renderRemoveCallback && this._renderRemoveCallback()
    this._viewer.layerContainer.removeChild(this._delegate)
    this._state = State.REMOVED
  }

  /**
   * Clears all divIcons
   * @returns {HtmlLayer}
   */
  clear() {
    while (this._delegate.hasChildNodes()) {
      this._delegate.removeChild(this._delegate.firstChild)
    }
    this._cache = {}
    this._state = State.CLEARED
    return this
  }
}

Layer.registerType('html')

export default HtmlLayer
