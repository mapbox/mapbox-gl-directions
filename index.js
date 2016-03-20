/**
 * A directions component using Mapbox Directions APi
 * @class mapboxgl.Directions
 *
 * @param {Object} options
 * @param {Array} [options.styles] Override default layer properties of the [directions source](https://github.com/mapbox/mapbox-gl-directions/blob/master/src/directions_style.js). Documentation for each property are specified in the [Mapbox GL Style Reference](https://www.mapbox.com/mapbox-gl-style-spec/).
 * @param {String} [options.accessToken=null] Required unless `mapboxgl.accessToken` is set globally
 * @param {String} [options.profile="driving"] Routing profile to use. Options: `driving`, `walking`, `cycling`
 * @param {String} [options.unit="imperial"] Measurement system to be used in navigation instructions. Options: `imperial`, `metric`
 * @param {string|Element} options.container HTML element to initialize the map in (or element id as string). If no container is passed map.getContainer() is used instead.
 * @param {Array<Array<number>>} options.proximity If set, search results closer to these coordinates will be given higher priority.
 * @example
 * var directions = new mapboxgl.Directions({
 *   container: 'directions',
 *   unit: 'metric',
 *   profile: 'walking'
 * });
 *
 * map.addControl(directions);
 * @return {Directions} `this`
 */
import Directions from './src/directions';

if (window.mapboxgl) {
  mapboxgl.Directions = Directions;
} else if (typeof module !== 'undefined') {
  module.exports = Directions;
}
