/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'
const {
  BoxGeometry,
  Cartesian3,
  defined,
  DeveloperError,
  GeometryPipeline,
  Matrix3,
  Matrix4,
  Transforms,
  VertexFormat,
  BufferUsage,
  CubeMap,
  loadCubeMap,
  RenderState,
  VertexArray,
  BlendingState,
  SceneMode,
  ShaderProgram,
  ShaderSource,
  SkyBox,
} = Cesium

const SkyBoxFS = `
  uniform samplerCube u_cubeMap;
  in vec3 v_texCoord;
  void main()
  {
    vec4 color = czm_textureCube(u_cubeMap, normalize(v_texCoord));
    out_FragColor = vec4(czm_gammaCorrect(color).rgb, czm_morphTime);
  }
`

const SkyBoxVS = `
  in vec3 position;
  out vec3 v_texCoord;
  uniform mat3 u_rotateMatrix;
  void main()
  {
    vec3 p = czm_viewRotation * u_rotateMatrix * (czm_temeToPseudoFixed * (czm_entireFrustum.y * position));
    gl_Position = czm_projection * vec4(p, 1.0);
    v_texCoord = position.xyz;
  }
`

class GroundSkyBox extends SkyBox {
  constructor(options = {}) {
    super(options)
    this.offsetAngle = options?.offsetAngle || 0
  }

  update(frameState, useHdr) {
    const that = this

    if (!this.show) {
      return undefined
    }

    if (
      frameState.mode !== SceneMode.SCENE3D &&
      frameState.mode !== SceneMode.MORPHING
    ) {
      return undefined
    }

    if (!frameState.passes.render) {
      return undefined
    }

    const context = frameState.context

    if (this._sources !== this.sources) {
      this._sources = this.sources
      const sources = this.sources

      if (
        !defined(sources.positiveX) ||
        !defined(sources.negativeX) ||
        !defined(sources.positiveY) ||
        !defined(sources.negativeY) ||
        !defined(sources.positiveZ) ||
        !defined(sources.negativeZ)
      ) {
        throw new DeveloperError(
          'this.sources is required and must have positiveX, negativeX, positiveY, negativeY, positiveZ, and negativeZ properties.'
        )
      }

      if (
        typeof sources.positiveX !== typeof sources.negativeX ||
        typeof sources.positiveX !== typeof sources.positiveY ||
        typeof sources.positiveX !== typeof sources.negativeY ||
        typeof sources.positiveX !== typeof sources.positiveZ ||
        typeof sources.positiveX !== typeof sources.negativeZ
      ) {
        throw new DeveloperError(
          'this.sources properties must all be the same type.'
        )
      }

      if (typeof sources.positiveX === 'string') {
        // Given urls for cube-map images. Load them.
        loadCubeMap(context, this._sources).then(function (cubeMap) {
          that._cubeMap = that._cubeMap && that._cubeMap.destroy()
          that._cubeMap = cubeMap
        })
      } else {
        this._cubeMap = this._cubeMap && this._cubeMap.destroy()
        this._cubeMap = new CubeMap({
          context: context,
          source: sources,
        })
      }
    }

    const command = this._command

    command.modelMatrix = Transforms.eastNorthUpToFixedFrame(
      frameState.camera.positionWC
    )

    if (this.offsetAngle !== 0) {
      Matrix4.multiply(
        command.modelMatrix,
        Matrix4.fromRotationTranslation(
          Matrix3.fromRotationZ((this.offsetAngle / 180) * Math.PI)
        ),
        command.modelMatrix
      )
    }

    if (!defined(command.vertexArray)) {
      command.uniformMap = {
        u_cubeMap: function () {
          return that._cubeMap
        },
        u_rotateMatrix: function () {
          return Matrix4.getMatrix3(command.modelMatrix, new Matrix3())
        },
      }

      const geometry = BoxGeometry.createGeometry(
        BoxGeometry.fromDimensions({
          dimensions: new Cartesian3(2.0, 2.0, 2.0),
          vertexFormat: VertexFormat.POSITION_ONLY,
        })
      )
      const attributeLocations = (this._attributeLocations =
        GeometryPipeline.createAttributeLocations(geometry))

      command.vertexArray = VertexArray.fromGeometry({
        context: context,
        geometry: geometry,
        attributeLocations: attributeLocations,
        bufferUsage: BufferUsage._DRAW,
      })

      command.renderState = RenderState.fromCache({
        blending: BlendingState.ALPHA_BLEND,
      })
    }

    if (!defined(command.shaderProgram) || this._useHdr !== useHdr) {
      const fs = new ShaderSource({
        defines: [useHdr ? 'HDR' : ''],
        sources: [SkyBoxFS],
      })
      command.shaderProgram = ShaderProgram.fromCache({
        context: context,
        vertexShaderSource: SkyBoxVS,
        fragmentShaderSource: fs,
        attributeLocations: this._attributeLocations,
      })
      this._useHdr = useHdr
    }

    if (!defined(this._cubeMap)) {
      return undefined
    }
    return command
  }
}

export default GroundSkyBox
