import { protobuf } from '../../../libs'

// Wire fields from tianditu-cesium-ext/src/proto.js (V1–V3).
// The optional additions share one schema; retain field case and 64-bit IDs.
const poiFields = {
  OID: { type: 'uint64', id: 1, rule: 'required' },
  Name: { type: 'string', id: 2, rule: 'required' },
  Coordinates: {
    type: 'double',
    id: 3,
    rule: 'repeated',
    options: { packed: true },
  },
  GeometryType: { type: 'int32', id: 4, rule: 'required' },
  Priority: { type: 'int32', id: 5 },
  Interates: { type: 'int32', id: 6, rule: 'repeated' },
  SymbolID: { type: 'int32', id: 10, options: { default: 0 } },
  DisplayHeight: { type: 'double', id: 11, options: { default: 32 } },
  ShiningColor: { type: 'uint32', id: 12 },
  FontNameIndex: { type: 'uint32', id: 13 },
  FontSize: { type: 'int32', id: 14, options: { default: 18 } },
  FontColor: { type: 'uint32', id: 15 },
  ZCoordType: { type: 'int32', id: 16, options: { default: 3 } },
  FontStyle: { type: 'int32', id: 17 },
  ShiningSize: { type: 'int32', id: 18 },
}

const tileType = protobuf.Root.fromJSON({
  nested: {
    POI: { edition: 'proto2', fields: poiFields },
    StringTable: {
      edition: 'proto2',
      fields: { s: { type: 'string', id: 1, rule: 'repeated' } },
    },
    Tile: {
      edition: 'proto2',
      fields: {
        Version: { type: 'int64', id: 1, rule: 'required' },
        TileKey: { type: 'int64', id: 2, rule: 'required' },
        StringTable: { type: 'StringTable', id: 3, rule: 'required' },
        POIS: { type: 'POI', id: 4, rule: 'repeated' },
      },
    },
  },
}).lookupType('Tile')

export function parseTdtTile(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  // WTFS wraps the protobuf message in a 19-byte header and a 9-byte trailer.
  if (bytes.byteLength === 0 || bytes.byteLength === 28) {
    return { pois: [], stringTable: [] }
  }
  if (bytes.byteLength < 28) {
    throw new Error('Invalid TDT label tile envelope.')
  }
  const tile = tileType.decode(bytes.subarray(19, bytes.byteLength - 9))
  const tileKey = tile.TileKey.toString()
  const version = Number(tile.Version.toString())
  return {
    stringTable: tile.StringTable.s,
    pois: tile.POIS.map((poi) => ({
      oid: `${poi.OID.toString()}_${tileKey}`,
      name: poi.Name,
      coordinate: poi.Coordinates,
      geometryType: poi.GeometryType,
      symbolID: poi.SymbolID,
      displayHeight: poi.DisplayHeight,
      fontNameIndex: poi.FontNameIndex,
      fontSize: poi.FontSize,
      fontColor: poi.FontColor,
      shiningColor: poi.ShiningColor,
      zCoordType: poi.ZCoordType,
      priority: version >= 3 ? poi.Priority : 0,
      fontStyle: poi.hasOwnProperty('FontStyle') ? poi.FontStyle : undefined,
      shiningSize: poi.hasOwnProperty('ShiningSize')
        ? poi.ShiningSize
        : undefined,
    })),
  }
}

export function parseTdtRoads(data) {
  if (!Array.isArray(data)) {
    throw new Error('Invalid TDT road label tile.')
  }
  return {
    stringTable: [],
    pois: data.map((item) => ({
      oid: `${item.LabelPoint.X}_${item.LabelPoint.Y}_${item.Feature.properties.Name}`,
      name: item.Feature.properties.Name,
      coordinate: [
        item.LabelPoint.X,
        item.LabelPoint.Y,
        item.LabelPoint.Z ?? 0,
      ],
      geometryType: 0,
      zCoordType: 0,
      priority: 0,
    })),
  }
}
