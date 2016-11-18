/**
 * A directions component using Mapbox Directions API
 * @class MapboxDirections
 *
 * @param {Object} options
 * @param {Array} [options.styles] Override default layer properties of the [directions source](https://github.com/mapbox/mapbox-gl-directions/blob/master/src/directions_style.js). Documentation for each property are specified in the [Mapbox GL Style Reference](https://www.mapbox.com/mapbox-gl-style-spec/).
 * @param {String} [options.accessToken=null] Required unless `mapboxgl.accessToken` is set globally
 * @param {Boolean} [options.interactive=true] Enable/Disable mouse or touch interactivity from the plugin
 * @param {String} [options.profile="driving"] Routing profile to use. Options: `driving`, `walking`, `cycling`
 * @param {String} [options.unit="imperial"] Measurement system to be used in navigation instructions. Options: `imperial`, `metric`
 * @param {Object} [options.geocoder] Pass options available to mapbox-gl-geocoder as [documented here](https://github.com/mapbox/mapbox-gl-geocoder/blob/master/API.md#mapboxglgeocoder).
 * @param {Object} [options.controls]
 * @param {Boolean} [options.controls.inputs=true] Hide or display the inputs control.
 * @param {Boolean} [options.controls.instructions=true] Hide or display the instructions control.
 * @example
 * var MapboxDirections = require('../src/index');
 * var directions = new MapboxDirections({
 *   accessToken: 'YOUR-MAPBOX-ACCESS-TOKEN',
 *   unit: 'metric',
 *   profile: 'cycling'
 * });
 * // add to your mapboxgl map
 * map.addControl(directions);
 * 
 * @return {MapboxDirections} `this`
 */
import MapboxDirections from './directions';

module.exports = MapboxDirections;