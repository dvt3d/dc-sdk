/**
 * @Author : Caven Chen
 */

import { Cesium } from '../../libs'

const BaseEventType = {
  ADD: 'add',
  REMOVE: 'remove',
}

const MouseEventType = {
  LEFT_DOWN: Cesium.ScreenSpaceEventType.LEFT_DOWN,
  LEFT_UP: Cesium.ScreenSpaceEventType.LEFT_UP,
  CLICK: Cesium.ScreenSpaceEventType.LEFT_CLICK,
  RIGHT_DOWN: Cesium.ScreenSpaceEventType.RIGHT_DOWN,
  RIGHT_UP: Cesium.ScreenSpaceEventType.RIGHT_UP,
  RIGHT_CLICK: Cesium.ScreenSpaceEventType.RIGHT_CLICK,
  DB_CLICK: Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
  MOUSE_MOVE: Cesium.ScreenSpaceEventType.MOUSE_MOVE,
  WHEEL: Cesium.ScreenSpaceEventType.WHEEL,
  MOUSE_OVER: 'mouseover',
  MOUSE_OUT: 'mouseout',
}

const ViewerEventType = {
  ADD_LAYER: 'addLayer',
  REMOVE_LAYER: 'removeLayer',
  ADD_EFFECT: 'addEffect',
  REMOVE_EFFECT: 'removeEffect',
  LEFT_DOWN: Cesium.ScreenSpaceEventType.LEFT_DOWN,
  LEFT_UP: Cesium.ScreenSpaceEventType.LEFT_UP,
  CLICK: Cesium.ScreenSpaceEventType.LEFT_CLICK,
  RIGHT_DOWN: Cesium.ScreenSpaceEventType.RIGHT_DOWN,
  RIGHT_UP: Cesium.ScreenSpaceEventType.RIGHT_UP,
  RIGHT_CLICK: Cesium.ScreenSpaceEventType.RIGHT_CLICK,
  DB_CLICK: Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
  MOUSE_MOVE: Cesium.ScreenSpaceEventType.MOUSE_MOVE,
  WHEEL: Cesium.ScreenSpaceEventType.WHEEL,
}

const SceneEventType = {
  CAMERA_MOVE_END: 'cameraMoveEnd',
  CAMERA_CHANGED: 'cameraChanged',
  PRE_UPDATE: 'preUpdate',
  POST_UPDATE: 'postUpdate',
  PRE_RENDER: 'preRender',
  POST_RENDER: 'postRender',
  MORPH_COMPLETE: 'morphComplete',
  CLOCK_TICK: 'clockTick',
  RENDER_ERROR: 'renderError',
}

const OverlayEventType = {
  ...BaseEventType,
  LEFT_DOWN: Cesium.ScreenSpaceEventType.LEFT_DOWN,
  LEFT_UP: Cesium.ScreenSpaceEventType.LEFT_UP,
  CLICK: Cesium.ScreenSpaceEventType.LEFT_CLICK,
  RIGHT_DOWN: Cesium.ScreenSpaceEventType.RIGHT_DOWN,
  RIGHT_UP: Cesium.ScreenSpaceEventType.RIGHT_UP,
  RIGHT_CLICK: Cesium.ScreenSpaceEventType.RIGHT_CLICK,
  DB_CLICK: Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
  MOUSE_MOVE: Cesium.ScreenSpaceEventType.MOUSE_MOVE,
  MOUSE_OVER: 'mouseover',
  MOUSE_OUT: 'mouseout',
  POSITION_UPDATE: 'positionUpdate',
}

const ModelEventType = {
  READY: 'ready',
  TEX_READY: 'texturesReady',
}

const TileSetEventType = {
  INITIAL_TILES_LOADED: 'initialTilesLoaded',
  ALL_TILES_LOADED: 'allTilesLoaded ',
  LOAD_PROGRESS: 'loadProgress ',
  TILE_FAILED: 'tileFailed ',
  TILE_LOAD: 'tileLoad',
  TILE_UNLOAD: 'tileUnload',
  TILE_VISIBLE: 'tileVisible',
}

const LayerGroupEventType = BaseEventType

const LayerEventType = {
  ...BaseEventType,
  LEFT_DOWN: Cesium.ScreenSpaceEventType.LEFT_DOWN,
  LEFT_UP: Cesium.ScreenSpaceEventType.LEFT_UP,
  CLICK: Cesium.ScreenSpaceEventType.LEFT_CLICK,
  RIGHT_DOWN: Cesium.ScreenSpaceEventType.RIGHT_DOWN,
  RIGHT_UP: Cesium.ScreenSpaceEventType.RIGHT_UP,
  RIGHT_CLICK: Cesium.ScreenSpaceEventType.RIGHT_CLICK,
  DB_CLICK: Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
}

const TrackEventType = {
  ...BaseEventType,
  POST_RENDER: 'postRender',
  ACTIVATE: 'activate',
  DEACTIVATE: 'deactivate',
  RESET_TIME_LINE: 'restTimeLine',
}

const PathEventType = {
  ...BaseEventType,
  POST_RENDER: 'postRender',
  RESET_TIME_LINE: 'restTimeLine',
}

const PlotEventType = {
  DRAW_START: 'drawStart',
  DRAW_STOP: 'drawStop',
  EDIT_START: 'editStart',
  EDIT_STOP: 'editEnd',
  DRAW_ANCHOR: 'drawAnchor',
  CREATE_ANCHOR: 'createAnchor',
  UPDATE_ANCHOR: 'updateAnchor',
  ANCHOR_MOVING: 'anchorMoving',
  EDIT_ANCHOR_STOP: 'editAnchorStop',
  CLEAR_ANCHOR: 'clearAnchor',
}

export {
  MouseEventType,
  ViewerEventType,
  SceneEventType,
  LayerGroupEventType,
  LayerEventType,
  OverlayEventType,
  TileSetEventType,
  ModelEventType,
  TrackEventType,
  PathEventType,
  PlotEventType,
}
