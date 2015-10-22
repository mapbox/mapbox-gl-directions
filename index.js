/**
 * A directions component using Mapbox Directions APi
 * @class mapboxgl.Directions
 *
 * @param {Object} options
 * @param {String} [options.mode="driving"]
 * @param {String} [options.unit="imperial"]
 *
 * @return {Directions} `this`
 */
import Directions from './src/directions';

function exportFn(options) {
  return new Directions(options);
}

if (window.mapboxgl) {
  mapboxgl.Directions = exportFn;
} else if (typeof module !== 'undefined') {
  module.exports = exportFn;
}
