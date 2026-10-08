import { Cesium } from '../../../libs'

const cartographicScratch = new Cesium.Cartographic()

const DEF_LABEL = {
  font: '28px sans-serif',
  scale: 0.5,
  fillColor: Cesium.Color.WHITE,
  outlineColor: Cesium.Color.BLACK,
  outlineWidth: 2,
  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
  horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
  verticalOrigin: Cesium.VerticalOrigin.TOP,
  pixelOffset: new Cesium.Cartesian2(0, 8),
  // Screen-aligned text must not be clipped by terrain at grazing angles.
  disableDepthTestDistance: Number.POSITIVE_INFINITY,
}

function parseColor(value) {
  // Service colors are packed ARGB, independent of host byte order.
  return Cesium.Color.fromBytes(
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255
  )
}

export function createTdtEntity(poi, tile, options, id) {
  const [lng, lat, height = 0] = poi.coordinate || []
  if (
    poi.geometryType !== 0 ||
    !Number.isFinite(lng) ||
    !Number.isFinite(lat) ||
    !Number.isFinite(height) ||
    Math.abs(lng) > 180 ||
    Math.abs(lat) > 90
  ) {
    return undefined
  }
  const serverLabel = {}
  if (options.serverFirstStyle && tile.type === 'poi') {
    const fontStyle = poi.fontStyle || 0
    serverLabel.font = [
      fontStyle & 1 ? 'bold' : '',
      fontStyle & 2 ? 'italic' : '',
      `${poi.fontSize}px`,
      tile.data.stringTable[poi.fontNameIndex] || 'sans-serif',
    ]
      .filter(Boolean)
      .join(' ')
    serverLabel.fillColor = parseColor(poi.fontColor)
    serverLabel.outlineColor = parseColor(poi.shiningColor)
    if (poi.shiningSize != null) {
      serverLabel.outlineWidth = poi.shiningSize
    }
  }
  const heightReference =
    poi.zCoordType === 0
      ? Cesium.HeightReference.CLAMP_TO_GROUND
      : poi.zCoordType === 2
      ? Cesium.HeightReference.RELATIVE_TO_GROUND
      : Cesium.HeightReference.NONE
  const entity = new Cesium.Entity({
    id,
    name: poi.name,
    position: Cesium.Cartesian3.fromDegrees(
      lng,
      lat,
      poi.zCoordType === 1 ? 0 : height
    ),
    label: {
      ...DEF_LABEL,
      heightReference,
      ...options.labelGraphics,
      ...serverLabel,
      text: poi.name,
    },
  })
  entity._tdtPriority = poi.priority ?? 0
  if (options.icoUrl && poi.symbolID >= 0) {
    const subdomains = options.subdomains ?? '01234567'
    const key = options.key ?? options.token ?? ''
    entity.billboard = {
      width: 18,
      height: 18,
      scale: 1,
      heightReference,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      ...options.billboardGraphics,
      ...(options.serverFirstStyle
        ? { width: poi.displayHeight, height: poi.displayHeight }
        : {}),
      image: Cesium.Resource.createIfNeeded(options.icoUrl).getDerivedResource({
        templateValues: {
          x: tile.x,
          y: tile.y,
          z: tile.level + 1,
          id: poi.symbolID,
          // Keep each symbol on one host so Cesium can reuse its image.
          s: subdomains.length
            ? subdomains[poi.symbolID % subdomains.length]
            : '',
          key,
          token: key,
        },
        proxy: options.proxy,
      }),
    }
  }
  return entity
}

export function getTdtLabelPosition(
  entity,
  scene,
  time,
  result = new Cesium.Cartesian3(),
  heightReference
) {
  const position = entity.position.getValue(time, result)
  if (!position) return undefined
  const reference =
    heightReference ??
    Cesium.Property.getValueOrDefault(
      entity.label.heightReference,
      time,
      Cesium.HeightReference.NONE
    )
  if (
    !scene.globe ||
    (reference !== Cesium.HeightReference.CLAMP_TO_GROUND &&
      reference !== Cesium.HeightReference.RELATIVE_TO_GROUND)
  ) {
    return Cesium.Cartesian3.clone(position, result)
  }
  const ellipsoid = scene.globe.ellipsoid
  const cartographic = ellipsoid.cartesianToCartographic(
    position,
    cartographicScratch
  )
  const ground = scene.globe.getHeight(cartographic)
  if (!Cesium.defined(ground)) {
    return Cesium.Cartesian3.clone(position, result)
  }
  cartographic.height =
    ground +
    (reference === Cesium.HeightReference.RELATIVE_TO_GROUND
      ? cartographic.height
      : 0)
  return ellipsoid.cartographicToCartesian(cartographic, result)
}

// Approximate bounds relative to the anchor in CSS pixels.
export function getTdtLabelBounds(graphic, time, measureText, isLabel) {
  const scale = Cesium.Property.getValueOrDefault(graphic.scale, time, 1)
  if (!(scale > 0)) return undefined
  let width
  let height
  if (isLabel) {
    const font = Cesium.Property.getValueOrDefault(
      graphic.font,
      time,
      DEF_LABEL.font
    )
    const fontSize = Number(/([\d.]+)px/.exec(font)?.[1] || 28)
    const lines = Cesium.Property.getValueOrDefault(
      graphic.text,
      time,
      ''
    ).split('\n')
    const outline = Cesium.Property.getValueOrDefault(
      graphic.outlineWidth,
      time,
      0
    )
    let textWidth = 0
    let hasText = false
    for (const line of lines) {
      textWidth = Math.max(textWidth, measureText(font, line))
      hasText ||= line.length > 0
    }
    if (!hasText) return undefined
    width = (textWidth + outline * 2) * scale
    height = (lines.length * fontSize * 1.2 + outline * 2) * scale
  } else {
    width = Cesium.Property.getValueOrDefault(graphic.width, time, 18) * scale
    height = Cesium.Property.getValueOrDefault(graphic.height, time, 18) * scale
    if (!(width > 0 && height > 0)) return undefined
  }
  const offset = Cesium.Property.getValueOrDefault(
    graphic.pixelOffset,
    time,
    Cesium.Cartesian2.ZERO
  )
  const horizontal = Cesium.Property.getValueOrDefault(
    graphic.horizontalOrigin,
    time,
    Cesium.HorizontalOrigin.CENTER
  )
  const vertical = Cesium.Property.getValueOrDefault(
    graphic.verticalOrigin,
    time,
    Cesium.VerticalOrigin.CENTER
  )
  const left =
    offset.x -
    (horizontal === Cesium.HorizontalOrigin.LEFT
      ? 0
      : horizontal === Cesium.HorizontalOrigin.RIGHT
      ? width
      : width / 2)
  const top =
    offset.y -
    (vertical === Cesium.VerticalOrigin.TOP
      ? 0
      : vertical === Cesium.VerticalOrigin.CENTER
      ? height / 2
      : height)
  return { left, top, right: left + width, bottom: top + height }
}
