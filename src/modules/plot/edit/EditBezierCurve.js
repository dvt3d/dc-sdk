/**
 * EditBezierCurve - 编辑贝塞尔曲线工具
 * @Author : zishang520
 */

import { Cesium } from '../../../libs'
import Edit from './Edit'
import { PlotEventType } from '../../event'
import { Transform } from '../../transform'

class EditBezierCurve extends Edit {
  constructor(overlay, options = {}) {
    super(overlay)
    this._options = {
      showAnchors: true,
      allowAddPoints: true,
      allowRemovePoints: true,
      minPoints: 2,
      maxPoints: 20,
      ...options,
    }

    this._previewCurve = overlay
    this._anchors = []
    this._isEditing = false
  }

  /**
   * 挂载钩子
   * @private
   */
  _mountedHook() {
    try {
      // 设置动态更新
      this._delegate.polyline.positions = new Cesium.CallbackProperty(() => {
        if (this._positions.length >= 2) {
          const wgs84Positions = Transform.transformCartesianArrayToWGS84Array(
            this._positions
          )
          this._previewCurve.positions = wgs84Positions
          return this._previewCurve._calculateBezierPoints()
        }
        return this._positions
      }, false)

      // 添加编辑模式样式
      this._delegate.polyline.width = (this._delegate.polyline.width || 3) + 1
      this._delegate.polyline.material = Cesium.Color.ORANGE.withAlpha(0.8)

      this._layer.entities.add(this._delegate)
      this._createAnchors()
      this._setupDragHandlers()
      this._isEditing = true

      this.editTool?.fire(PlotEventType.EDIT_START, {
        overlay: this._overlay,
        positions: this._positions,
      })
    } catch (error) {
      console.error('Failed to mount EditBezierCurve:', error)
      this._cleanup()
    }
  }

  /**
   * 创建锚点
   * @private
   */
  _createAnchors() {
    if (!this._options.showAnchors) return

    this._cleanupAnchors()
    this._anchors = []

    this._positions.forEach((position, index) => {
      const anchor = this._layer.entities.add({
        position: position,
        point: {
          pixelSize: 10,
          color: Cesium.Color.LIME,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: `C${index}`,
          font: '12pt sans-serif',
          pixelOffset: new Cesium.Cartesian2(0, -30),
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        },
      })

      anchor._editIndex = index
      this._anchors.push(anchor)
    })
  }

  /**
   * 设置拖拽处理器
   * @private
   */
  _setupDragHandlers() {
    if (!this.editTool || !this.editTool.viewer) return

    const viewer = this.editTool.viewer
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    let isDragging = false
    let draggedAnchor = null
    let draggedIndex = -1

    // 左键按下事件
    handler.setInputAction((click) => {
      const pickedObject = viewer.scene.pick(click.position)
      if (
        pickedObject &&
        pickedObject.id &&
        this._anchors.includes(pickedObject.id)
      ) {
        isDragging = true
        draggedAnchor = pickedObject.id
        draggedIndex = draggedAnchor._editIndex
        viewer.scene.screenSpaceCameraController.enableRotate = false
        viewer.scene.screenSpaceCameraController.enableTranslate = false
        viewer.scene.screenSpaceCameraController.enableZoom = false
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

    // 鼠标移动事件
    handler.setInputAction((movement) => {
      if (isDragging && draggedAnchor) {
        const ray = viewer.camera.getPickRay(movement.endPosition)
        const newPosition = viewer.scene.globe.pick(ray, viewer.scene)

        if (newPosition) {
          this.updateAnchorPosition(draggedIndex, newPosition)
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 左键释放事件
    handler.setInputAction(() => {
      if (isDragging) {
        isDragging = false
        draggedAnchor = null
        draggedIndex = -1
        viewer.scene.screenSpaceCameraController.enableRotate = true
        viewer.scene.screenSpaceCameraController.enableTranslate = true
        viewer.scene.screenSpaceCameraController.enableZoom = true
      }
    }, Cesium.ScreenSpaceEventType.LEFT_UP)

    // 右键菜单事件（可选功能：添加/删除控制点）
    handler.setInputAction((click) => {
      const pickedObject = viewer.scene.pick(click.position)
      if (
        pickedObject &&
        pickedObject.id &&
        this._anchors.includes(pickedObject.id)
      ) {
        const anchorIndex = pickedObject.id._editIndex
        this._showContextMenu(click.position, anchorIndex)
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    // 存储handler以便清理
    this._dragHandler = handler
  }

  /**
   * 显示右键菜单
   * @param {Cesium.Cartesian2} position
   * @param {number} anchorIndex
   * @private
   */
  _showContextMenu(position, anchorIndex) {
    // 这里可以集成一个简单的上下文菜单
    const actions = []

    if (
      this._options.allowAddPoints &&
      this._positions.length < this._options.maxPoints
    ) {
      actions.push({
        text: '在此处插入点',
        action: () => {
          const ray = this.editTool.viewer.camera.getPickRay(position)
          const newPosition = this.editTool.viewer.scene.globe.pick(
            ray,
            this.editTool.viewer.scene
          )
          if (newPosition) {
            this.addControlPoint(newPosition, anchorIndex + 1)
          }
        },
      })
    }

    if (
      this._options.allowRemovePoints &&
      this._positions.length > this._options.minPoints
    ) {
      actions.push({
        text: '删除此点',
        action: () => {
          this.removeControlPoint(anchorIndex)
        },
      })
    }

    // 触发菜单事件，让外部处理菜单显示
    this.editTool?.fire(PlotEventType.SHOW_CONTEXT_MENU, {
      position,
      anchorIndex,
      actions,
      overlay: this._overlay,
    })
  }

  /**
   * @param {number} anchorIndex
   * @param {Cesium.Cartesian3} newPosition
   */
  updateAnchorPosition(anchorIndex, newPosition) {
    if (anchorIndex >= 0 && anchorIndex < this._positions.length) {
      this._positions[anchorIndex] = newPosition

      // 更新锚点显示
      if (this._anchors[anchorIndex]) {
        this._anchors[anchorIndex].position = newPosition
      }

      // 更新原始覆盖物
      const wgs84Positions = Transform.transformCartesianArrayToWGS84Array(
        this._positions
      )
      this._overlay.positions = wgs84Positions

      this.editTool?.fire(PlotEventType.EDIT_ANCHOR_UPDATE, {
        overlay: this._overlay,
        anchorIndex,
        position: newPosition,
        positions: this._positions,
      })
    }
  }

  /**
   * 添加控制点
   * @param {Cesium.Cartesian3} position
   * @param {number} insertIndex
   */
  addControlPoint(position, insertIndex = -1) {
    if (this._positions.length >= this._options.maxPoints) {
      console.warn(`已达到最大控制点数量 (${this._options.maxPoints})`)
      return false
    }

    if (insertIndex === -1) {
      this._positions.push(position)
    } else {
      this._positions.splice(insertIndex, 0, position)
    }

    this._createAnchors()

    const wgs84Positions = Transform.transformCartesianArrayToWGS84Array(
      this._positions
    )
    this._overlay.positions = wgs84Positions

    this.editTool?.fire(PlotEventType.EDIT_ANCHOR_ADD, {
      overlay: this._overlay,
      position,
      insertIndex,
      positions: this._positions,
    })

    return true
  }

  /**
   * 删除控制点
   * @param {number} anchorIndex
   */
  removeControlPoint(anchorIndex) {
    if (this._positions.length <= this._options.minPoints) {
      console.warn(`至少需要 ${this._options.minPoints} 个控制点`)
      return false
    }

    if (anchorIndex >= 0 && anchorIndex < this._positions.length) {
      const removedPosition = this._positions.splice(anchorIndex, 1)[0]
      this._createAnchors()

      const wgs84Positions = Transform.transformCartesianArrayToWGS84Array(
        this._positions
      )
      this._overlay.positions = wgs84Positions

      this.editTool?.fire(PlotEventType.EDIT_ANCHOR_REMOVE, {
        overlay: this._overlay,
        anchorIndex,
        removedPosition,
        positions: this._positions,
      })

      return true
    }
    return false
  }

  /**
   * 清理锚点
   * @private
   */
  _cleanupAnchors() {
    if (this._anchors) {
      this._anchors.forEach((anchor) => {
        this._layer.entities.remove(anchor)
      })
      this._anchors = []
    }
  }

  /**
   * 完成编辑
   */
  finishEdit() {
    if (this._isEditing) {
      this._cleanup()
      this._cleanupAnchors()
      if (this._dragHandler) {
        this._dragHandler.destroy()
        this._dragHandler = null
      }
      this._isEditing = false

      this.editTool?.fire(PlotEventType.EDIT_STOP, {
        overlay: this._overlay,
        positions: this._positions
      })
    }
  }

  /**
   * 取消编辑
   */
  cancelEdit() {
    if (this._isEditing) {
      // 恢复原始位置
      this._overlay.positions = this._originalPositions

      this._cleanup()
      this.editTool?.fire(PlotEventType.EDIT_CANCEL, {
        overlay: this._overlay,
      })
      this._isEditing = false
    }
  }

  /**
   * 获取编辑状态
   */
  getEditState() {
    return {
      isEditing: this._isEditing,
      positions: this._positions,
      controlPointCount: this._positions.length,
      canAddPoints: this._positions.length < this._options.maxPoints,
      canRemovePoints: this._positions.length > this._options.minPoints,
      curveType: this._overlay.curveType,
      curveLength: this._overlay.getCurveLength(),
    }
  }

  /**
   * 清理资源
   * @private
   */
  _cleanup() {
    this._cleanupAnchors()

    // 清理拖拽处理器
    if (this._dragHandler) {
      this._dragHandler.destroy()
      this._dragHandler = null
    }

    // 恢复相机控制
    if (this.editTool && this.editTool.viewer) {
      const viewer = this.editTool.viewer
      viewer.scene.screenSpaceCameraController.enableRotate = true
      viewer.scene.screenSpaceCameraController.enableTranslate = true
      viewer.scene.screenSpaceCameraController.enableZoom = true
    }

    super._cleanup?.()
  }

  /**
   * 销毁
   */
  destroy() {
    this.cancelEdit()
    this._previewCurve = null
    super.destroy?.()
  }
}

export default EditBezierCurve
