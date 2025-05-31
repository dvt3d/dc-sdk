/**
 * @Author : Caven Chen
 */
import { getLib } from '../../global-api/lib-utils.js'
import { Layer } from '../layer'
import State from '../state/State'
import { registerGLMap } from './GLMap'

class ChartLayer extends Layer {
  constructor(id, option) {
    if (!getLib('echarts')) {
      throw new Error('miss the echarts lib')
    }
    super(id)
    this._option = option
    this._delegate = undefined
    this._chart = undefined
  }

  set show(show) {
    this._show = show
    this._delegate.style.visibility = show ? 'visible' : 'hidden'
  }

  get show() {
    return this._show
  }

  /**
   *
   * @returns {HTMLDivElement}
   * @private
   */
  _createChartElement() {
    let canvas = this._viewer.scene.canvas
    let el = document.createElement('div')
    el.setAttribute('id', this._id)
    el.setAttribute('data-layer-type', 'chart-layer')
    el.style.cssText = `position:absolute; top:0; left:0; width: ${canvas.clientWidth}px; height: ${canvas.clientHeight}px;pointer-events:none;`
    this._viewer.layerContainer.appendChild(el)
    return el
  }

  _onAdd(viewer) {
    const echarts = getLib('echarts')
    registerGLMap(echarts)
    this._viewer = viewer
    this._viewer.canvas.setAttribute('tabIndex', '0')
    this._delegate = this._createChartElement()
    this._chart = echarts.init(this._delegate)
    Object(this._chart.getZr()).viewer = viewer
    this._option &&
      this._chart.setOption({ ...this._option, GLMap: {}, animation: false })
    this._state = State.ADDED
  }

  _onRemove() {
    if (this._delegate && this._viewer) {
      this._chart.dispose()
      this._viewer.layerContainer.removeChild(this._delegate)
      this._state = State.REMOVED
    }
  }

  /**
   *
   * @param option
   * @returns {ChartLayer}
   */
  setOption(option = {}) {
    this._option = option
    if (this._chart) {
      this._chart.setOption({ ...option, GLMap: {}, animation: false })
    }
    return this
  }

  /**
   *
   * @returns {ChartLayer}
   */
  clear() {
    this._chart.clear()
    return this
  }

  /**
   *
   * @returns {ChartLayer}
   */
  resize() {
    this._chart.resize()
    return this
  }
}

export default ChartLayer
