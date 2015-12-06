/**
 * A directions component using Mapbox Directions APi
 * @class mapboxgl.Directions
 *
 * @param {Object} options
 * @param {String} [options.accessToken=null] Required unless `mapboxgl.accessToken` is set globally
 * @param {String} [options.profile="driving"] Routing profile to use. Options: `driving`, `walking`, `cycling`
 * @param {String} [options.unit="imperial"] Measurement system to be used in navigation instructions. Options: `imperial`, `metric`
 * @param {Object} [options.proximity=false] Object a proximity argument: this is a geographical point given as an object with latitude and longitude properties. Search results closer to this point will be given higher priority.
 * @example
 * var directions = Directions(document.getElementById('directions'), {
 *   unit: 'metric',
 *   profile: 'walking'
 * });
 *
 * map.addControl(directions);
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
