const EXAMPLE_LIST = [
  {
    name: '基础开始',
    folder: 'info',
    children: [
      {
        name: '开始',
        page: 'start.html',
      },
      {
        name: '坐标参考-地理平铺',
        page: 'crs_geographic.html',
      },
      {
        name: '坐标参考-Web墨卡托平铺',
        page: 'crs_webMercator.html',
      },
      {
        name: '坐标参考-自定义地理平铺',
        page: 'crs_custom_geographic.html',
      },
      {
        name: '坐标参考-自定义墨卡托平铺',
        page: 'crs_custom_mercator.html',
      },
      {
        name: '自定义Cesium版本',
        page: 'custom.html',
      },
    ],
  },
  {
    name: '地图组件',
    folder: 'widget',
    children: [
      {
        name: '罗盘',
        page: 'compass.html',
      },
      {
        name: '层级控制',
        page: 'zoom_controller.html',
      },
      {
        name: '比例尺',
        page: 'distance_legend.html',
      },
      {
        name: '工具栏',
        page: 'locationbar.html',
      },
      {
        name: '鹰眼图',
        page: 'hawkeye_map.html',
      },
      {
        name: '加载蒙层',
        page: 'loading_mask.html',
      },
      {
        name: '右击菜单',
        page: 'contextmenu.html',
      },
      {
        name: '信息框',
        page: 'popup.html',
      },
      {
        name: '提示框',
        page: 'tooltip.html',
      },
      {
        name: '场景分割',
        page: 'scene_split.html',
      },
    ],
  },
  {
    name: '场景设置',
    folder: 'setting',
    children: [
      {
        name: '基础',
        page: 'base.html',
      },
      {
        name: '相机',
        page: 'camera.html',
      },
      {
        name: '地球',
        page: 'globe.html',
      },
      {
        name: '天空盒',
        page: 'skybox.html',
      },
      {
        name: '近地天空盒',
        page: 'ground_sky_box.html',
      },
      {
        name: '地球(裁剪)',
        page: 'globe_clip_polygon.html',
      },
    ],
  },
  {
    name: '场景事件',
    folder: 'event',
    children: [
      {
        name: '场景生命周期钩子',
        page: 'scene_hooks.html',
      },
      {
        name: '场景鼠标事件',
        page: 'viewer_mouse.html',
      },
      {
        name: '矢量图层鼠标事件',
        page: 'layer_mouse.html',
      },
      {
        name: '要素鼠标事件',
        page: 'overlay_mouse.html',
      },
      {
        name: '要素鼠标事件(支持冒泡)',
        page: 'overlay_mouse_propagation.html',
      },
      {
        name: '相机事件',
        page: 'camera.html',
      },
      {
        name: '时钟事件',
        page: 'clock.html',
      },
    ],
  },
  {
    name: '在线地图',
    folder: 'baseLayer',
    children: [
      {
        name: '高德地图',
        page: 'amap.html',
      },
      {
        name: '高德地图（偏移纠正）',
        page: 'amap_no_offset.html',
      },
      {
        name: 'Arcgis',
        page: 'arcgis.html',
      },
      {
        name: '百度地图',
        page: 'baidu.html',
      },
      {
        name: '百度地图（偏移纠正）',
        page: 'baidu_no_offset.html',
      },
      {
        name: '星图地图',
        page: 'geovis.html',
      },
      {
        name: '谷歌地图',
        page: 'google.html',
      },
      {
        name: '谷歌地图（偏移纠正）',
        page: 'google_no_offset.html',
      },
      {
        name: '天地图',
        page: 'tdt.html',
      },
      {
        name: '腾讯地图',
        page: 'tencent.html',
      },
    ],
  },
  {
    name: '离线地图',
    folder: 'offline',
    children: [
      {
        name: '蓝色',
        page: 'blue.html',
      },
      {
        name: '日间',
        page: 'day.html',
      },
      {
        name: '影像',
        page: 'img.html',
      },
      {
        name: '夜晚',
        page: 'night.html',
      },
    ],
  },
  {
    name: '地形设置',
    folder: 'terrain',
    children: [
      {
        name: '地形（中国）',
        page: 'ter_ch.html',
      },
      {
        name: '地形（夸张）',
        page: 'ter_exaggeration.html',
      },
    ],
  },
  {
    name: '要素图层',
    folder: 'layer',
    children: [
      {
        name: '矢量图层',
        page: 'vector.html',
      },
      {
        name: '3d-tiles图层',
        page: 'tileset.html',
      },
      {
        name: 'GeoJson图层',
        page: 'geojson.html',
      },
      {
        name: 'Html图层',
        page: 'html.html',
      },
      {
        name: '聚合图层',
        page: 'cluster_clustering.html',
      },
      {
        name: '聚合图层(圆)',
        page: 'cluster_circle.html',
      },
      {
        name: '聚合图层(自定义图片)',
        page: 'cluster_clustering_image.html',
      },
      {
        name: '经纬网格图层',
        page: 'graticule.html',
      },
      {
        name: '栅格瓦片图层(数据图层)',
        page: 'raster_tile.html',
      },
      {
        name: 'i3s模型图层',
        page: 'i3s.html',
      },
    ],
  },
  {
    name: '矢量要素',
    folder: 'vector',
    children: [
      {
        name: '点',
        page: 'point_base.html',
      },
      {
        name: '图标点',
        page: 'point_icon.html',
      },
      {
        name: '文字点',
        page: 'point_text.html',
      },
      {
        name: '图标点(大数量)',
        page: 'point_icon_m.html',
      },
      {
        name: '自定义图标点',
        page: 'point_icon_custom.html',
      },
      {
        name: '自定义文字点',
        page: 'point_text_custom.html',
      },
      {
        name: '线',
        page: 'polyline_base.html',
      },
      {
        name: '材质线',
        page: 'polyline_material.html',
      },
      {
        name: '颜色轨迹线',
        page: 'polyline_trail.html',
      },
      {
        name: '图片轨迹线',
        page: 'polyline_image_trail.html',
      },
      {
        name: '流动线',
        page: 'polyline_flow.html',
      },
      {
        name: '闪烁线',
        page: 'polyline_flicker.html',
      },
      {
        name: '发光线',
        page: 'polyline_lighting.html',
      },
      {
        name: '发光轨迹线',
        page: 'polyline_lighting_trail.html',
      },
      {
        name: '围栏线',
        page: 'polyline_fence.html',
      },
      {
        name: '多箭头线',
        page: 'polyline_multi_arrow.html',
      },
      {
        name: '虚线箭头线',
        page: 'polyline_dash_arrow.html',
      },
      {
        name: '方向线',
        page: 'polyline_direction.html',
      },
      {
        name: '自定义端点线',
        page: 'polyline_custom_endpoint.html',
      },
      {
        name: '面',
        page: 'polygon_base.html',
      },
      {
        name: '含洞面',
        page: 'polygon_holes.html',
      },
      {
        name: '高度面',
        page: 'polygon_height.html',
      },
      {
        name: '拉伸面',
        page: 'polygon_extruded.html',
      },
      {
        name: '圆',
        page: 'circle.html',
      },
      {
        name: '动画圆',
        page: 'circle_dynamic.html',
      },
      {
        name: '波纹圆',
        page: 'circle_wave.html',
      },
      {
        name: '消逝圆',
        page: 'circle_fade.html',
      },
      {
        name: '模糊圆',
        page: 'circle_blur.html',
      },
      {
        name: '扩散圆',
        page: 'circle_diffuse.html',
      },
      {
        name: '螺旋圆',
        page: 'circle_spiral.html',
      },
      {
        name: '脉冲圆',
        page: 'circle_pulse.html',
      },
      {
        name: '多彩圆',
        page: 'circle_vary.html',
      },
      {
        name: '雷达线',
        page: 'radar_line.html',
      },
      {
        name: '图片雷达',
        page: 'radar_pic.html',
      },
      {
        name: '波纹雷达',
        page: 'radar_wave.html',
      },
      {
        name: '雷达脉冲',
        page: 'radar_outer.html',
      },
      {
        name: '墙',
        page: 'wall.html',
      },
      {
        name: '轨迹墙',
        page: 'wall_trail.html',
      },
      {
        name: '图片轨迹墙',
        page: 'wall_image_trail.html',
      },
      {
        name: '球',
        page: 'sphere.html',
      },
      {
        name: '轨迹球',
        page: 'sphere_trail.html',
      },
      {
        name: '平面',
        page: 'plane.html',
      },
      {
        name: '圆柱',
        page: 'cylinder.html',
      },
      {
        name: '动态图标',
        page: 'dynamic_billboard.html',
      },
    ],
  },
  {
    name: '图元要素',
    folder: 'primitive',
    children: [
      {
        name: '点',
        page: 'point.html',
      },
      {
        name: '线',
        page: 'polyline.html',
      },
      {
        name: '流动线',
        page: 'flow_line.html',
      },
      {
        name: '流动线(竖)',
        page: 'flow_line_v.html',
      },
      {
        name: '图标',
        page: 'billboard.html',
      },
      {
        name: '图标(大数量)',
        page: 'billboard_m.html',
      },
      {
        name: '跳动图标',
        page: 'bounce_billboard.html',
      },
      {
        name: '标签',
        page: 'label.html',
      },
      {
        name: '跳动标签',
        page: 'bounce_label.html',
      },
      {
        name: '扫描圆',
        page: 'scan_circle.html',
      },
      {
        name: '扩散墙',
        page: 'wall_diffuse.html',
      },
      {
        name: '电弧球',
        page: 'elec_ellipsoid.html',
      },
      {
        name: '发光柱',
        page: 'light_cylinder.html',
      },
      {
        name: '云',
        page: 'cloud.html',
      },
      {
        name: '水',
        page: 'water.html',
      },
      {
        name: '视频',
        page: 'video.html',
      },
    ],
  },
  {
    name: '模型要素',
    folder: 'model',
    children: [
      {
        name: '模型（矢量）',
        page: 'model_vector.html',
      },
      {
        name: '动画模型（矢量）',
        page: 'model_vector_d.html',
      },
      {
        name: '模型（图元）',
        page: 'model_primitive.html',
      },
      {
        name: '模型动画（图元）',
        page: 'model_primitive_d.html',
      },
      {
        name: '3dtiles-3dmax',
        page: '3dtiles_3dmax.html',
      },
      {
        name: '3dtiles-osgb',
        page: '3dtiles_osgb.html',
      },
      {
        name: '3dtiles-3dgs',
        page: '3dtiles_3dgs.html',
      },
      {
        name: '3dtiles-shp',
        page: '3dtiles_shp.html',
      },
      {
        name: '3dtiles-自定shader',
        page: '3dtiles_custom_shader.html',
      },
      {
        name: '3dtiles-样式和自定shader',
        page: '3dtiles_style_and_shader.html',
      },

      { name: 'i3s', page: 'i3s.html' },
    ],
  },
  {
    name: 'DOM要素',
    folder: 'html',
    children: [
      {
        name: 'html点',
        page: 'point_html.html',
      },
    ],
  },
  {
    name: '场景工具',
    folder: 'tools',
    children: [
      {
        name: '标绘',
        page: 'plot.html',
      },
      {
        name: '测量',
        page: 'measure.html',
      },
    ],
  },
  {
    name: '场景动画',
    folder: 'animation',
    children: [
      {
        name: '地球自转',
        page: 'globe_rotate.html',
      },
      {
        name: '定点环绕',
        page: 'around_point.html',
      },
      {
        name: '相机环绕',
        page: 'around_view.html',
      },
      {
        name: '定点巡航',
        page: 'flying.html',
      },
      {
        name: '路径漫游',
        page: 'roaming_path.html',
      },
      {
        name: '键盘漫游',
        page: 'roaming_keyboard.html',
      },
      {
        name: '轨迹回放',
        page: 'track.html',
      },
      {
        name: '轨迹回放（事件）',
        page: 'track_event.html',
      },
      {
        name: '轨迹贴地',
        page: 'track_clamp_to_ground.html',
      },
      {
        name: '轨迹贴模型',
        page: 'track_clamp_to_tileset.html',
      },
    ],
  },
  {
    name: '场景效果',
    folder: 'effect',
    children: [
      {
        name: '天气效果',
        page: 'weather.html',
      },
      {
        name: '扫描圆',
        page: 'circle_scan.html',
      },
      {
        name: '雷达扫描',
        page: 'radar_scan.html',
      },
      {
        name: '泛光',
        page: 'bloom.html',
      },
      {
        name: '亮度',
        page: 'brightness.html',
      },
      {
        name: '景深',
        page: 'depth_of_field.html',
      },
      {
        name: '轮廓',
        page: 'silhouette.html',
      },
      {
        name: '夜光',
        page: 'night_vision.html',
      },
      {
        name: '黑白',
        page: 'black_and_white.html',
      },
      {
        name: '镜头眩光',
        page: 'lens_flare.html',
      },
      {
        name: '天际线',
        page: 'sky_line.html',
      },
    ],
  },
  {
    name: 'Turf计算',
    folder: 'turf',
    children: [
      {
        name: '点缓冲',
        page: 'point_buffer.html',
      },
      {
        name: '线缓冲',
        page: 'polyline_buffer.html',
      },
      {
        name: '面缓冲',
        page: 'polygon_buffer.html',
      },
      {
        name: '比例面',
        page: 'polygon_scale.html',
      },
      {
        name: '旋转线',
        page: 'polyline_rotate.html',
      },
      {
        name: '旋转面',
        page: 'polygon_rotate.html',
      },
      {
        name: '扇形面',
        page: 'polygon_sector.html',
      },
    ],
  },
  {
    name: '数据可视化',
    folder: 'datav',
    children: [
      {
        name: '热区图',
        page: 'heat.html',
      },
      {
        name: '热区图(高度)',
        page: 'heat_height.html',
      },
      {
        name: '热区图(建筑)',
        page: 'heat_building.html',
      },
      {
        name: '风场',
        page: 'wind.html',
      },
    ],
  },
  {
    name: 'Echarts',
    folder: 'echarts',
    children: [
      {
        name: 'pm 2.5',
        page: 'pm.html',
      },
      {
        name: '迁徙图',
        page: 'migrate.html',
      },
      {
        name: '航线',
        page: 'airline.html',
      },
      {
        name: '航线（大庆）',
        page: 'plane.html',
      },
      {
        name: '人口迁徙图',
        page: 'population_mobility.html',
      },
      {
        name: '物流图',
        page: 'logistics.html',
      },
    ],
  },
]
