/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../../libs'
import Overlay from '../Overlay'
import State from '../../state/State'
import Parse from '../../parse/Parse'
import { Transform } from '../../transform'
import { Util } from '../../utils'
import { IMG_PARTICLES } from '../../images/base64'

const DEF_STYLE = {
  color: Cesium.Color.ORANGE,
}

class LightCylinderPrimitive extends Overlay {
  constructor(center, length, topRadius, bottomRadius) {
    super()
    this._center = Parse.parsePosition(center)
    this._length = length || 100
    this._topRadius = topRadius || 1
    this._bottomRadius = bottomRadius || 50
    this._delegate = new Cesium.PrimitiveCollection()
    this._style = { ...DEF_STYLE }
    this._state = State.INITIALIZED
  }

  get type() {
    return Overlay.getOverlayType('light-cylinder-primitive')
  }

  set center(position) {
    this._center = Parse.parsePosition(position)
    this._updatePrimitives()
  }

  get center() {
    return this._center
  }

  set length(length) {
    this._length = length
    this._updatePrimitives()
  }

  get length() {
    return this._length
  }

  set topRadius(topRadius) {
    this._topRadius = topRadius
    this._updatePrimitives()
  }

  get topRadius() {
    return this._topRadius
  }

  set bottomRadius(bottomRadius) {
    this._bottomRadius = bottomRadius
    this._updatePrimitives()
  }

  get bottomRadius() {
    return this._bottomRadius
  }

  /**
   *
   * @param center
   * @param radius
   * @return {[]}
   * @private
   */
  _computeEllipsePositions(center, radius) {
    let cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions(
      {
        center: Transform.transformWGS84ToCartesian(center),
        semiMajorAxis: radius,
        semiMinorAxis: radius,
        rotation: 0,
        granularity: 0.005,
      },
      false,
      true
    )
    let pnts = Cesium.Cartesian3.unpackArray(cep.outerPositions)
    pnts.push(pnts[0])
    return pnts
  }

  /**
   *
   * @param topPts
   * @param bottomPts
   * @param height
   * @return {Cesium.GeometryInstance}
   */
  _createCylinderInstance(topPts, bottomPts, height) {
    let new_pts = bottomPts.slice()
    let length = bottomPts.length
    let len_2 = 2 * length
    let sts = []
    let st_interval = 1.0 / (length - 1)
    let define_indices = []
    let ep = []
    const addHeight = (p, alt = 0) => {
      let c = Cesium.Cartographic.fromCartesian(p)
      c.height += alt
      return Cesium.Cartographic.toCartesian(c)
    }
    for (let i = 0; i < length; i++) {
      ep.push(addHeight(topPts[i], height))
      sts.push(i * st_interval, 0)
      let i_1 = i + 1
      let i_11 = (i + 1) % length
      let len_2_i_1 = len_2 - i_1
      define_indices.push(...[len_2_i_1 - 1, len_2_i_1, i])
      define_indices.push(...[i, i_11, len_2_i_1 - 1])
    }

    for (let i in ep) {
      new_pts.push(ep[length - i - 1])
      sts.push(1 - i * st_interval, 1)
    }

    let polygon = Cesium.PolygonGeometry.createGeometry(
      new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(new_pts),
        perPositionHeight: true,
      })
    )
    polygon.indices = define_indices
    polygon.attributes.st.values = sts
    return new Cesium.GeometryInstance({
      geometry: polygon,
    })
  }

  /**
   *
   * @return {HTMLCanvasElement}
   * @private
   */
  _getCircleImage() {
    let canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    let ctx = canvas.getContext('2d')
    ctx.fillStyle = 'rgba(255,255,255,0)'
    ctx.strokeStyle = 'rgba(255, 255, 255,255)'
    ctx.setLineDash([50, 50])
    ctx.lineWidth = 30
    ctx.beginPath()
    ctx.arc(256, 256, 150, 0, Math.PI * 2, true)
    ctx.stroke()
    ctx.restore()
    return canvas
  }

  /**
   *
   * @param image
   * @return {HTMLCanvasElement}
   * @private
   */
  _getParticlesImage(image) {
    let canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 256
    let ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 64, 256)
    ctx.drawImage(image, 0, 0)
    ctx.drawImage(image, 33, 0)
    return canvas
  }

  /**
   *
   * @private
   */
  _updatePrimitives() {
    this._delegate.removeAll()

    const isGround = this._center.alt === 0

    let topPositions = this._computeEllipsePositions(
      this._center,
      this._topRadius
    )
    let innerBottomPostions = this._computeEllipsePositions(
      this._center,
      this._bottomRadius * 0.7
    )
    let bottomPositions = this._computeEllipsePositions(
      this._center,
      this._bottomRadius
    )

    // update buttom circle
    const circleOpt = {
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(
            this._computeEllipsePositions(this._center, this._bottomRadius * 2)
          ),
          perPositionHeight: !isGround,
        }),
        asynchronous: false,
      }),
    }

    // ring
    let ring = isGround
      ? new Cesium.GroundPrimitive(circleOpt)
      : new Cesium.Primitive(circleOpt)

    ring.appearance = new Cesium.EllipsoidSurfaceAppearance({
      material: Cesium.Material.fromType(Cesium.Material.CircleRingType, {
        color: this._style.color,
      }),
    })

    // circle
    let circle = isGround
      ? new Cesium.GroundPrimitive(circleOpt)
      : new Cesium.Primitive(circleOpt)

    circle.appearance = new Cesium.EllipsoidSurfaceAppearance({
      material: Cesium.Material.fromType(Cesium.Material.CircleRotateType, {
        color: this._style.color,
        image: this._getCircleImage(),
      }),
    })

    // cylinder
    let cylinder = new Cesium.Primitive({
      geometryInstances: this._createCylinderInstance(
        topPositions,
        innerBottomPostions,
        this._length
      ),
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: Cesium.Material.fromType(Cesium.Material.CylinderFadeType, {
          color: this._style.color,
        }),
      }),
      asynchronous: false,
    })

    if (isGround) {
      Cesium.GroundPrimitive.initializeTerrainHeights().then(() => {
        this._delegate.add(ring)
        this._delegate.add(circle)
        this._delegate.add(cylinder)
      })
    } else {
      this._delegate.add(ring)
      this._delegate.add(circle)
      this._delegate.add(cylinder)
    }

    // particles
    Cesium.Resource.fetchImage({ url: IMG_PARTICLES }).then((image) => {
      let particles = new Cesium.Primitive({
        geometryInstances: this._createCylinderInstance(
          topPositions,
          bottomPositions,
          this._length
        ),
        appearance: new Cesium.EllipsoidSurfaceAppearance({
          material: Cesium.Material.fromType(
            Cesium.Material.CylinderParticlesType,
            {
              color: this._style.color,
              image: this._getParticlesImage(image),
            }
          ),
        }),
        asynchronous: false,
      })
      this._delegate.add(particles)
    })
  }

  /**
   *
   * @private
   */
  _mountedHook() {
    /**
     *  set the positions
     */
    this.center = this._center
  }

  /**
   *
   * @param frameState
   */
  update(frameState) {
    this._delegate.update(frameState)
  }

  /**
   *
   * @param style
   * @returns {LightCylinderPrimitive}
   */
  setStyle(style) {
    if (!style || Object.keys(style).length === 0) {
      return this
    }
    Util.merge(this._style, style)
    return this
  }

  destroy() {
    return Cesium.destroyObject(this)
  }
}

Overlay.registerType('light-cylinder-primitive')

export default LightCylinderPrimitive
