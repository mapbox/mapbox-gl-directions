import { createStore, applyMiddleware, bindActionCreators } from 'redux';
import thunk from 'redux-thunk';
import { decode } from '@mapbox/polyline';
import utils from './utils';
import rootReducer from './reducers';

const storeWithMiddleware = applyMiddleware(thunk)(createStore);
const store = storeWithMiddleware(rootReducer);

// State object management via redux
import * as actions from './actions';
import directionsStyle from './directions_style';

// Controls
import Inputs from './controls/inputs';
import Instructions from './controls/instructions';

/**
 * The Directions control
 * @class MapboxDirections
 *
 * @param {Object} options
 * @param {Array} [options.styles] Override default layer properties of the [directions source](https://github.com/mapbox/mapbox-gl-directions/blob/master/src/directions_style.js). Documentation for each property are specified in the [Mapbox GL Style Reference](https://www.mapbox.com/mapbox-gl-style-spec/).
 * @param {String} [options.accessToken=null] Required unless `mapboxgl.accessToken` is set globally
 * @param {String} [options.api="https://api.mapbox.com/directions/v5/"] Override default routing endpoint url
 * @param {Boolean} [options.interactive=true] Enable/Disable mouse or touch interactivity from the plugin
 * @param {String} [options.profile="mapbox/driving-traffic"] Routing profile to use. Options: `mapbox/driving-traffic`, `mapbox/driving`, `mapbox/walking`, `mapbox/cycling`
 * @param {Boolean} [options.alternatives=false] Whether to enable alternatives.
 * @param {Boolean} [options.congestion=false] Whether to enable congestion along the route line.
 * @param {String} [options.unit="imperial"] Measurement system to be used in navigation instructions. Options: `imperial`, `metric`
 * @param {Function} [options.compile=null] Provide a custom function for generating instruction, compatible with osrm-text-instructions.
 * @param {Object} [options.geocoder] Accepts an object containing the query parameters as [documented here](https://www.mapbox.com/api-documentation/#search-for-places).
 * @param {Object} [options.controls]
 * @param {Boolean} [options.controls.inputs=true] Hide or display the inputs control.
 * @param {Boolean} [options.controls.instructions=true] Hide or display the instructions control.
 * @param {Boolean} [options.controls.profileSwitcher=true] Hide or display the default profile switch with options for traffic, driving, walking and cycling.
 * @param {Number} [options.zoom=16] If no bbox exists from the geocoder result, the zoom you set here will be used in the flyTo.
 * @param {String} [options.language="en"] The language of returned turn-by-turn text instructions. See supported languages : https://docs.mapbox.com/api/navigation/#instructions-languages
 * @param {String} [options.placeholderOrigin="Choose a starting place"] If set, this text will appear as the placeholder attribute for the origin input element.
 * @param {String} [options.placeholderDestination="Choose destination"] If set, this text will appear as the placeholder attribute for the destination input element.
 * @param {Boolean} [options.flyTo=true] If false, animating the map to a selected result is disabled.
 * @param {String} [options.exclude=null] Exclude certain road types from routing. The default is to not exclude anything. Search for `exclude` in `optional parameters`: https://docs.mapbox.com/api/navigation/#retrieve-directions
 * @param {number | PaddingOptions} [options.routePadding=80] Specify padding surrounding route. A single number of pixels or a [PaddingOptions](https://docs.mapbox.com/mapbox-gl-js/api/#paddingoptions) object.
 * @example
 * var MapboxDirections = require('../src/index');
 * var directions = new MapboxDirections({
 *   accessToken: 'YOUR-MAPBOX-ACCESS-TOKEN',
 *   unit: 'metric',
 *   profile: 'mapbox/cycling'
 * });
 * // add to your mapboxgl map
 * map.addControl(directions);
 *
 * @return {MapboxDirections} `this`
 */
export default class MapboxDirections {

  constructor(options) {
    this.actions = bindActionCreators(actions, store.dispatch);
    this.actions.setOptions(options || {});
    this.options = options || {};

    this.onDragDown = this._onDragDown.bind(this);
    this.onDragMove = this._onDragMove.bind(this);
    this.onDragUp = this._onDragUp.bind(this);
    this.move = this._move.bind(this);
    this.onClick = this._clickHandler().bind(this);
  }

  onAdd(map) {
    this._map = map;

    const { controls } = store.getState();

    var el = this.container = document.createElement('div');
    el.className = 'mapboxgl-ctrl-directions mapboxgl-ctrl';

    // Add controls to the page
    const inputEl = document.createElement('div');
    inputEl.className = 'directions-control directions-control-inputs';
    new Inputs(inputEl, store, this.actions, this._map);

    const directionsEl = document.createElement('div');
    directionsEl.className = 'directions-control directions-control-instructions';

    new Instructions(directionsEl, store, {
      hoverMarker: this.actions.hoverMarker,
      setRouteIndex: this.actions.setRouteIndex
    }, this._map);

    if (controls.inputs) el.appendChild(inputEl);
    if (controls.instructions) el.appendChild(directionsEl);

    this.subscribedActions();
    if (this._map.loaded()) this.mapState()
    else this._map.on('load', () => this.mapState());

    return el;
  }

  /**
   * Removes the control from the map it has been added to. This is called by `map.removeControl`,
   * which is the recommended method to remove controls.
   *
   * @returns {Control} `this`
   */
  onRemove(map) {
    this.container.parentNode.removeChild(this.container);
    this.removeRoutes();
    map.off('mousedown', this.onDragDown);
    map.off('mousemove', this.move);
    map.off('touchstart', this.onDragDown);
    map.off('touchstart', this.move);
    map.off('click', this.onClick);
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
      delete this.storeUnsubscribe;
    }
    directionsStyle.forEach((layer) => {
      if (map.getLayer(layer.id)) map.removeLayer(layer.id);
    });

    if (map.getSource('directions')) map.removeSource('directions');

    this._map = null;
    return this;
  }

  mapState() {
    const { profile, alternatives, congestion, styles, interactive, compile } = store.getState();

    // Emit any default or option set config
    this.actions.eventEmit('profile', { profile });

    const geojson = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    };

    // Add and set data theme layer/style
    this._map.addSource('directions', geojson);

    // Add direction specific styles to the map
    if (styles && styles.length) styles.forEach((style) => this._map.addLayer(style));
    directionsStyle.forEach((style) => {
      // only add the default style layer if a custom layer wasn't provided
      if (!this._map.getLayer(style.id)) this._map.addLayer(style);
    });


    if (interactive) {
      this._map.on('mousedown', this.onDragDown);
      this._map.on('mousemove', this.move);
      this._map.on('click', this.onClick);

      this._map.on('touchstart', this.move);
      this._map.on('touchstart', this.onDragDown);
    }
  }

  subscribedActions() {
    this.storeUnsubscribe = store.subscribe(() => {
      const {
        origin,
        destination,
        hoverMarker,
        directions,
        routeIndex
      } = store.getState();

      const geojson = {
        type: 'FeatureCollection',
        features: [
          origin,
          destination,
          hoverMarker
        ].filter((d) => {
          return d.geometry;
        })
      };

      if (directions.length) {
        directions.forEach((feature, index) => {

          const features = [];

          const decoded = decode(feature.geometry, 5).map(function(c) {
            return c.reverse();
          });

          decoded.forEach(function(c, i) {
            var previous = features[features.length - 1];
            var congestion = feature.legs[0].annotation && feature.legs[0].annotation.congestion && feature.legs[0].annotation.congestion[i - 1];

            if (previous && (!congestion || previous.properties.congestion === congestion)) {
              previous.geometry.coordinates.push(c);
            } else {
              var segment = {
                geometry: {
                  type: 'LineString',
                  coordinates: []
                },
                properties: {
                  'route-index': index,
                  route: (index === routeIndex) ? 'selected' : 'alternate',
                }
              };

              // New segment starts with previous segment's last coordinate.
              if (previous) segment.geometry.coordinates.push(previous.geometry.coordinates[previous.geometry.coordinates.length - 1]);

              segment.geometry.coordinates.push(c);

              if (congestion) {
                segment.properties.congestion = feature.legs[0].annotation.congestion[i - 1];
              }

              features.push(segment);
            }
          });

          geojson.features = geojson.features.concat(features);

          if (index === routeIndex) {
            // Collect any possible waypoints from steps
            feature.legs[0].steps.forEach((d) => {
              if (d.maneuver.type === 'waypoint') {
                geojson.features.push({
                  type: 'Feature',
                  geometry: d.maneuver.location,
                  properties: {
                    id: 'waypoint'
                  }
                });
              }
            });
          }

        });
      }

      if (this._map.style && this._map.getSource('directions')) {
        this._map.getSource('directions').setData(geojson);
      }
    });
  }

  _clickHandler() {
    var timer = null;
    var delay = 250;
    return function(event) {
      if (!timer) {
        var singleClickHandler = this._onSingleClick.bind(this);

        timer = setTimeout(function() {
          singleClickHandler(event);
          timer = null;
        }, delay);

      } else {
        clearTimeout(timer);
        timer = null;
        this._map.zoomIn();
      }
    };
  }

  _onSingleClick(e) {
    const { origin } = store.getState();
    const coords = [e.lngLat.lng, e.lngLat.lat];

    if (!origin.geometry) {
      this.actions.setOriginFromCoordinates(coords);
    } else {

      const features = this._map.queryRenderedFeatures(e.point, {
        layers: [
          'directions-origin-point',
          'directions-destination-point',
          'directions-waypoint-point',
          'directions-route-line-alt'
        ]
      });

      if (features.length) {

        // Remove any waypoints
        features.forEach((f) => {
          if (f.layer.id === 'directions-waypoint-point') {
            this.actions.removeWaypoint(f);
          }
        });

        if (features[0].properties.route === 'alternate') {
          const index = features[0].properties['route-index'];
          this.actions.setRouteIndex(index);
        }
      } else {
        this.actions.setDestinationFromCoordinates(coords);
        this._map.flyTo({ center: coords });
      }
    }
  }

  _move(e) {
    const { hoverMarker } = store.getState();

    const features = this._map.queryRenderedFeatures(e.point, {
      layers: [
        'directions-route-line-alt',
        'directions-route-line',
        'directions-origin-point',
        'directions-destination-point',
        'directions-hover-point'
      ]
    });

    this._map.getCanvas().style.cursor = features.length ? 'pointer' : '';

    if (features.length) {
      this.isCursorOverPoint = features[0];
      this._map.dragPan.disable();

      // Add a possible waypoint marker when hovering over the active route line
      features.forEach((feature) => {
        if (feature.layer.id === 'directions-route-line') {
          this.actions.hoverMarker([e.lngLat.lng, e.lngLat.lat]);
        } else if (hoverMarker.geometry) {
          this.actions.hoverMarker(null);
        }
      });

    } else if (this.isCursorOverPoint) {
      this.isCursorOverPoint = false;
      this._map.dragPan.enable();
    }
  }

  _onDragDown() {
    if (!this.isCursorOverPoint) return;
    this.isDragging = this.isCursorOverPoint;
    this._map.getCanvas().style.cursor = 'grab';

    this._map.on('mousemove', this.onDragMove);
    this._map.on('mouseup', this.onDragUp);

    this._map.on('touchmove', this.onDragMove);
    this._map.on('touchend', this.onDragUp);
  }

  _onDragMove(e) {
    if (!this.isDragging) return;

    const coords = [e.lngLat.lng, e.lngLat.lat];
    switch (this.isDragging.layer.id) {
      case 'directions-origin-point':
        this.actions.createOrigin(coords);
      break;
      case 'directions-destination-point':
        this.actions.createDestination(coords);
      break;
      case 'directions-hover-point':
        this.actions.hoverMarker(coords);
      break;
    }
  }

  _onDragUp() {
    if (!this.isDragging) return;

    const { hoverMarker, origin, destination } = store.getState();

    switch (this.isDragging.layer.id) {
      case 'directions-origin-point':
        this.actions.setOriginFromCoordinates(origin.geometry.coordinates);
      break;
      case 'directions-destination-point':
        this.actions.setDestinationFromCoordinates(destination.geometry.coordinates);
      break;
      case 'directions-hover-point':
        // Add waypoint if a sufficent amount of dragging has occurred.
        if (hoverMarker.geometry && !utils.coordinateMatch(this.isDragging, hoverMarker)) {
          this.actions.addWaypoint(0, hoverMarker);
        }
      break;
    }

    this.isDragging = false;
    this._map.getCanvas().style.cursor = '';

    this._map.off('touchmove', this.onDragMove);
    this._map.off('touchend', this.onDragUp);

    this._map.off('mousemove', this.onDragMove);
    this._map.off('mouseup', this.onDragUp);
  }

  // API Methods
  // ============================

  /**
   * Turn on or off interactivity
   * @param {Boolean} state sets interactivity based on a state of `true` or `false`.
   * @returns {MapboxDirections} this
   */
  interactive(state) {
    if (state) {
      this._map.on('touchstart', this.move);
      this._map.on('touchstart', this.onDragDown);

      this._map.on('mousedown', this.onDragDown);
      this._map.on('mousemove', this.move);
      this._map.on('click', this.onClick);
    } else {
      this._map.off('touchstart', this.move);
      this._map.off('touchstart', this.onDragDown);

      this._map.off('mousedown', this.onDragDown);
      this._map.off('mousemove', this.move);
      this._map.off('click', this.onClick);
    }

    return this;
  }

  /**
   * Returns the origin of the current route.
   * @returns {Object} origin
   */
  getOrigin() {
    return store.getState().origin;
  }

  /**
   * Sets origin. _Note:_ calling this method requires the [map load event](https://www.mapbox.com/mapbox-gl-js/api/#Map.load)
   * to have run.
   * @param {Array<number>|String} query An array of coordinates [lng, lat] or location name as a string.
   * @returns {MapboxDirections} this
   */
  setOrigin(query) {
    if (typeof query === 'string') {
      this.actions.queryOrigin(query);
    } else {
      this.actions.setOriginFromCoordinates(query);
    }

    return this;
  }

  /**
   * Returns the destination of the current route.
   * @returns {Object} destination
   */
  getDestination() {
    return store.getState().destination;
  }

  /**
   * Sets destination. _Note:_ calling this method requires the [map load event](https://www.mapbox.com/mapbox-gl-js/api/#Map.load)
   * to have run.
   * @param {Array<number>|String} query An array of coordinates [lng, lat] or location name as a string.
   * @returns {MapboxDirections} this
   */
  setDestination(query) {
    if (typeof query === 'string') {
      this.actions.queryDestination(query);
    } else {
      this.actions.setDestinationFromCoordinates(query);
    }

    return this;
  }

  /**
   * Swap the origin and destination.
   * @returns {MapboxDirections} this
   */
  reverse() {
    this.actions.reverse();
    return this;
  }

  /**
   * Add a waypoint to the route. _Note:_ calling this method requires the
   * [map load event](https://www.mapbox.com/mapbox-gl-js/api/#Map.load) to have run.
   * @param {Number} index position waypoint should be placed in the waypoint array
   * @param {Array<number>|Point} waypoint can be a GeoJSON Point Feature or [lng, lat] coordinates.
   * @returns {MapboxDirections} this;
   */
  addWaypoint(index, waypoint) {
    if (!waypoint.type) waypoint = utils.createPoint(waypoint, { id: 'waypoint' });
    this.actions.addWaypoint(index, waypoint);
    return this;
  }

  /**
   * Change the waypoint at a given index in the route. _Note:_ calling this
   * method requires the [map load event](https://www.mapbox.com/mapbox-gl-js/api/#Map.load)
   * to have run.
   * @param {Number} index indexed position of the waypoint to update
   * @param {Array<number>|Point} waypoint can be a GeoJSON Point Feature or [lng, lat] coordinates.
   * @returns {MapboxDirections} this;
   */
  setWaypoint(index, waypoint) {
    if (!waypoint.type) waypoint = utils.createPoint(waypoint, { id: 'waypoint' });
    this.actions.setWaypoint(index, waypoint);
    return this;
  }

  /**
   * Remove a waypoint from the route.
   * @param {Number} index position in the waypoints array.
   * @returns {MapboxDirections} this;
   */
  removeWaypoint(index) {
    const { waypoints } = store.getState();
    this.actions.removeWaypoint(waypoints[index]);
    return this;
  }

  /**
   * Fetch all current waypoints in a route.
   * @returns {Array} waypoints
   */
  getWaypoints() {
    return store.getState().waypoints;
  }

  /**
   * Removes all routes and waypoints from the map.
   *
   * @returns {MapboxDirections} this;
   */
  removeRoutes() {
    this.actions.clearOrigin();
    this.actions.clearDestination();
    return this;
  }

  /**
   * Subscribe to events that happen within the plugin.
   * @param {String} type name of event. Available events and the data passed into their respective event objects are:
   *
   * - __clear__ `{ type: } Type is one of 'origin' or 'destination'`
   * - __loading__ `{ type: } Type is one of 'origin' or 'destination'`
   * - __profile__ `{ profile } Profile is one of 'driving', 'walking', or 'cycling'`
   * - __origin__ `{ feature } Fired when origin is set`
   * - __destination__ `{ feature } Fired when destination is set`
   * - __route__ `{ route } Fired when a route is updated`
   * - __error__ `{ error } Error as string`
   * @param {Function} fn function that's called when the event is emitted.
   * @returns {MapboxDirections} this;
   */
  on(type, fn) {
    this.actions.eventSubscribe(type, fn);
    return this;
  }
}
