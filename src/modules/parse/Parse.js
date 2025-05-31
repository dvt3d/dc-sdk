/**
 * @Author : Caven Chen
 */
import Position from '../position/Position'
import { Cesium } from '../../libs'
import { Transform } from '../transform'

class Parse {
  /**
   * Parses all kinds of coordinates to position
   * @param position
   * @returns {Position}
   */
  static parsePosition(position) {
    let result = new Position()
    if (!position) {
      return result
    }
    if (typeof position === 'string') {
      result = Position.fromString(position)
    } else if (Array.isArray(position)) {
      result = Position.fromArray(position)
    } else if (
      !(Object(position) instanceof Position) &&
      Object(position).hasOwnProperty('lng') &&
      Object(position).hasOwnProperty('lat')
    ) {
      result = Position.fromObject(position)
    } else if (Object(position) instanceof Position) {
      result = position
    } else if (Object(position) instanceof Cesium.Cartesian3) {
      result = Transform.transformCartesianToWGS84(position)
    } else if (Object(position) instanceof Cesium.Cartographic) {
      result = Transform.transformCartographicToWGS84(position)
    }
    return result
  }

  /**
   * Parses all kinds of coordinates array to position array
   * @param positions
   * @returns {unknown[]}
   */
  static parsePositions(positions) {
    if (typeof positions === 'string') {
      if (positions.indexOf('#') >= 0) {
        throw new Error('the positions invalid')
      }
      positions = positions.split(';').filter((item) => !!item)
    }
    return positions.map((item) => {
      return this.parsePosition(item)
    })
  }

  /**
   * Parses point position to array
   * @param position
   * @returns {*[]}
   */
  static parsePointCoordToArray(position) {
    position = this.parsePosition(position)
    return [position.lng, position.lat]
  }

  /**
   * Parses polyline positions to array
   * @param positions
   * @returns {[]}
   */
  static parsePolylineCoordToArray(positions) {
    let result = []
    positions = this.parsePositions(positions)
    positions.forEach((item) => {
      result.push([item.lng, item.lat])
    })
    return result
  }

  /**
   * Parses polygon positions to array
   * @param positions
   * @param loop
   * @returns {[][]}
   */
  static parsePolygonCoordToArray(positions, loop = false) {
    let result = []
    positions = this.parsePositions(positions)
    positions.forEach((item) => {
      result.push([item.lng, item.lat])
    })
    if (loop && result.length > 0) {
      result.push(result[0])
    }
    return [result]
  }
}

export default Parse
