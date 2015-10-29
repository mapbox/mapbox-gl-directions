/**
 * A directions component using Mapbox Directions APi
 * @class mapboxgl.Directions
 *
 * @param {Object} options
 * @param {String} [options.profile="driving"]
 * @param {String} [options.unit="imperial"]
 *
 * @return {Directions} `this`
 */
import Directions from './src/directions';

function exportFn(el, options) {
  return new Directions(el, options);
}

if (window.mapboxgl) {
  mapboxgl.Directions = exportFn;
} else if (typeof module !== 'undefined') {
  module.exports = exportFn;
}
