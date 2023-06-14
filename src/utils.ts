export function validCoords(coords: [number, number]) {
  return coords[0] >= -180 && coords[0] <= 180 && coords[1] >= -90 && coords[1] <= 90;
}

export interface Point {
  type: string
  geometry: Geometry
  properties: Properties
}

export interface Geometry {
  type: string
  coordinates: Coordinates
}

export type Coordinates = number[] | string

export interface Properties {
}

export function coordinateMatch(a: Point, b: Point) {
  const aCoordinates = a.geometry.coordinates;
  const bCoordinates = b.geometry.coordinates;

  return (
    typeof aCoordinates === 'string' &&
    typeof bCoordinates === 'string' &&
    aCoordinates === bCoordinates
  ) || (
      Array.isArray(aCoordinates) &&
      Array.isArray(bCoordinates) &&
      aCoordinates[0].toFixed(3) === bCoordinates[0].toFixed(3) &&
      aCoordinates[1].toFixed(3) === bCoordinates[1].toFixed(3)
    )
}

export function wrap(n: number) {
  var d = 180 - -180;
  var w = ((n - -180) % d + d) % d + -180;
  return (w === -180) ? 180 : w;
}

function roundWithOriginalPrecision(input: number, original: number) {
  const precision = +(Math.floor(original) !== original && original.toString().split('.')[1].length)
  return input.toFixed(Math.min(precision, 5));
}

export function createPoint(coordinates: Coordinates, properties: Properties = {}) {
  const point: Point = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coordinates
    },
    properties
  };

  return point
}

const format = {
  duration(s: number) {
    var m = Math.floor(s / 60),
      h = Math.floor(m / 60);
    s %= 60;
    m %= 60;
    if (h === 0 && m === 0) return s + 's';
    if (h === 0) return m + 'min';
    return h + 'h ' + m + 'min';
  },

  imperial(m: number) {
    var mi = m / 1609.344;
    if (mi >= 100) return mi.toFixed(0) + 'mi';
    if (mi >= 10) return mi.toFixed(1) + 'mi';
    if (mi >= 0.1) return mi.toFixed(2) + 'mi';
    return (mi * 5280).toFixed(0) + 'ft';
  },

  metric(m: number) {
    if (m >= 100000) return (m / 1000).toFixed(0) + 'km';
    if (m >= 10000) return (m / 1000).toFixed(1) + 'km';
    if (m >= 100) return (m / 1000).toFixed(2) + 'km';
    return m.toFixed(0) + 'm';
  }
};

export default {
  format,
  coordinateMatch,
  createPoint,
  validCoords,
  wrap,
  roundWithOriginalPrecision
};
