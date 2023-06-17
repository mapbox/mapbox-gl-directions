import mapboxgl from 'mapbox-gl'
import { GeocodingFeature } from '../api/geocoder'

export type Geometry = Exclude<GeoJSON.Geometry, GeoJSON.GeometryCollection>

export type Feature = GeoJSON.Feature<GeoJSON.Point>

export function validCoordinates(coords: mapboxgl.LngLatLike) {
  if (Array.isArray(coords)) {
    return coords[0] >= -180 && coords[0] <= 180 && coords[1] >= -90 && coords[1] <= 90
  } else if ('lon' in coords) {
    return coords.lon >= -180 && coords.lon <= 180 && coords.lat >= -90 && coords.lat <= 90
  } else {
    return coords.lng >= -180 && coords.lng <= 180 && coords.lat >= -90 && coords.lat <= 90
  }
}

export function coordinateMatch(a: Feature | GeocodingFeature, b: Feature) {
  const aCoordinates = a.geometry.coordinates
  const bCoordinates = b.geometry.coordinates

  /**
   * Bruh.
   */
  return (
    (typeof aCoordinates === 'string' &&
      typeof bCoordinates === 'string' &&
      aCoordinates === bCoordinates) ||
    (Array.isArray(aCoordinates) &&
      Array.isArray(bCoordinates) &&
      typeof aCoordinates[0] === 'number' &&
      typeof bCoordinates[0] === 'number' &&
      typeof aCoordinates[1] === 'number' &&
      typeof bCoordinates[1] === 'number' &&
      aCoordinates[0].toFixed(3) === bCoordinates[0].toFixed(3) &&
      aCoordinates[1].toFixed(3) === bCoordinates[1].toFixed(3))
  )
}

export function wrap(n: number) {
  var d = 180 - -180
  var w = ((((n - -180) % d) + d) % d) + -180
  return w === -180 ? 180 : w
}

export function roundWithOriginalPrecision(input: number, original: number) {
  const precision = +(Math.floor(original) !== original && original.toString().split('.')[1].length)
  return input.toFixed(Math.min(precision, 5))
}

export function createPoint(
  coordinates: mapboxgl.LngLatLike,
  properties: Feature['properties'] = {}
) {
  const point: Feature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coordinates as GeoJSON.Position,
    },
    properties,
  }

  return point
}

export const format = {
  duration(s: number) {
    var m = Math.floor(s / 60),
      h = Math.floor(m / 60)
    s %= 60
    m %= 60
    if (h === 0 && m === 0) return s + 's'
    if (h === 0) return m + 'min'
    return h + 'h ' + m + 'min'
  },

  imperial(m: number) {
    var mi = m / 1609.344
    if (mi >= 100) return mi.toFixed(0) + 'mi'
    if (mi >= 10) return mi.toFixed(1) + 'mi'
    if (mi >= 0.1) return mi.toFixed(2) + 'mi'
    return (mi * 5280).toFixed(0) + 'ft'
  },

  metric(m: number) {
    if (m >= 100000) return (m / 1000).toFixed(0) + 'km'
    if (m >= 10000) return (m / 1000).toFixed(1) + 'km'
    if (m >= 100) return (m / 1000).toFixed(2) + 'km'
    return m.toFixed(0) + 'm'
  },
}

export function stringifyCoordinates(coordinates: Geometry['coordinates']) {
  return coordinates.join(',')
}

export const notNull = <T>(value: T): value is NonNullable<T> => value != null
