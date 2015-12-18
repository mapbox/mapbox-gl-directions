import { createStore, applyMiddleware, bindActionCreators } from 'redux';
import thunk from 'redux-thunk';
import { decode } from 'polyline';
import { coordinateMatch, createPoint } from './utils';
import rootReducer from './reducers';

const storeWithMiddleware = applyMiddleware(thunk)(createStore);
const store = storeWithMiddleware(rootReducer);

// State object management via redux
import * as actions from './actions';
import directionsStyle from './directions_style';

// Controls
import Inputs from './controls/inputs';
import Instructions from './controls/instructions';

export default class Directions extends mapboxgl.Control {

  constructor(options) {
    super();

    this.actions = bindActionCreators(actions, store.dispatch);
    this.actions.setOptions(options || {});

    this.onMouseDown = this._onMouseDown.bind(this);
    this.onMouseMove = this._onMouseMove.bind(this);
    this.onMouseUp = this._onMouseUp.bind(this);
  }

  onAdd(map) {
    this.map = map;

    const { container } = store.getState();

    this.container = container ? typeof container === 'string' ?
      document.getElementById(container) : container : this.map.getContainer();

    const inputEl = document.createElement('div');
    inputEl.className = 'directions-control directions-control-inputs';
    const directionsEl = document.createElement('div');
    directionsEl.className = 'directions-control-directions-container';

    this.container.appendChild(inputEl);
    this.container.appendChild(directionsEl);

    // Add controllers to the page
    new Inputs(inputEl, store, this.actions, this.map);
    new Instructions(directionsEl, store, {
      hoverMarker: this.actions.hoverMarker,
      setRouteIndex: this.actions.setRouteIndex
    }, this.map);

    this.subscribedActions();
    map.on('style.load', () => { this.mapState(); });
  }

  mapState() {
    const { profile } = store.getState();

    // Emit any default or option set config
    this.actions.eventEmit('directions.profile', { profile });

    const map = this.map;
    const geojson = new mapboxgl.GeoJSONSource({
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Add and set data theme layer/style
    map.addSource('directions', geojson);

    // Add direction specific styles to the map
    directionsStyle.forEach((style) => { map.addLayer(style); });

    map.getContainer().addEventListener('mousedown', this.onMouseDown);
    map.getContainer().addEventListener('mousemove', this.onMouseMove, true);
    map.getContainer().addEventListener('mouseup', this.onMouseUp);

    map.on('mousemove', (e) => {
      const { hoverMarker } = store.getState();

      // Adjust cursor state on routes
      map.featuresAt(e.point, {
        radius: 10,
        layer: [
          'directions-route-line-alt',
          'directions-route-line'
        ]
      }, (err, features) => {
        if (err) throw err;
        if (features.length) {
          map.getContainer().classList.add('directions-select');
        } else {
          map.getContainer().classList.remove('directions-select');
        }
      });

      // Add a possible waypoint marker
      // when hovering over the active route line
      map.featuresAt(e.point, {
        radius: 2,
        layer: [
          'directions-route-line'
        ]
      }, (err, features) => {
        if (err) throw err;
        if (features.length) {
          const coords = e.lngLat;
          this.actions.hoverMarker([coords.lng, coords.lat]);
        } else if (hoverMarker.geometry) {
          this.actions.hoverMarker(null);
        }
      });

    }.bind(this));

    // Map event handlers
    map.on('click', (e) => {
      const { origin } = store.getState();
      const coords = [e.lngLat.lng, e.lngLat.lat];

      if (!origin.geometry) {
        this.actions.setOrigin(coords);
      } else {
        map.featuresAt(e.point, {
          radius: 10,
          includeGeometry: true,
          layer: [
            'directions-origin-point',
            'directions-destination-point',
            'directions-waypoint-point',
            'directions-route-line-alt'
          ]
        }, (err, features) => {
          if (err) throw err;

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
            this.actions.setDestination(coords);
            this.map.flyTo({ center: coords });
          }
        });
      }
    }.bind(this));
  }

  subscribedActions() {
    store.subscribe(() => {
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

          const lineString = {
            geometry: {
              type: 'LineString',
              coordinates: decode(feature.geometry, 6).map((c) => {
                return c.reverse();
              })
            },
            properties: {
              'route-index': index,
              route: (index === routeIndex) ? 'selected' : 'alternate'
            }
          };

          geojson.features.push(lineString);

          if (index === routeIndex) {
            // Collect any possible waypoints from steps
            feature.steps.forEach((d) => {
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

      if (this.map.style) {
        this.map.getSource('directions').setData(geojson);
      }
    });
  }

  mousePos(e) {
    const el = this.map.getContainer();
    const rect = el.getBoundingClientRect();
    return new mapboxgl.Point(
      e.clientX - rect.left - el.clientLeft,
      e.clientY - rect.top - el.clientTop
    );
  }

  _onMouseDown(e) {
    this.map.featuresAt(this.mousePos(e), {
      radius: 10,
      includeGeometry: true,
      layer: [
        'directions-origin-point',
        'directions-destination-point',
        'directions-hover-point'
      ]
    }, (err, features) => {
      if (err) throw err;
      if (features.length) {
        this.dragging = features[0];
        features.forEach((f) => {
          if (f.layer.id === 'directions-hover-point') {
            this.actions.removeWaypoint(f);
          }
        });
      }
    });
  }

  _onMouseMove(e) {
    if (this.dragging) {

      // Disable map dragging.
      e.stopPropagation();
      e.preventDefault();

      this.map.getContainer().classList.add('directions-drag');
      const lngLat = this.map.unproject(this.mousePos(e));
      const coords = [lngLat.lng, lngLat.lat];

      switch (this.dragging.layer.id) {
        case 'directions-origin-point':
          this.actions.originCoordinates(coords);
        break;
        case 'directions-destination-point':
          this.actions.destinationCoordinates(coords);
        break;
        case 'directions-hover-point':
          this.actions.hoverMarker(coords);
        break;
      }
    }
  }

  _onMouseUp() {
    const { hoverMarker, origin, destination } = store.getState();

    if (this.dragging) {
      switch (this.dragging.layer.id) {
        case 'directions-origin-point':
          this.actions.setOrigin(origin.geometry.coordinates);
        break;
        case 'directions-destination-point':
          this.actions.setDestination(destination.geometry.coordinates);
        break;
        case 'directions-hover-point':
          // Add waypoint if a sufficent amount of dragging has occurred.
          if (hoverMarker.geometry && !coordinateMatch(this.dragging, hoverMarker)) {
            this.actions.addWaypoint(0, hoverMarker);
          }
        break;
      }
    }

    this.dragging = false;
    this.map.getContainer().classList.remove('directions-drag');
  }

  // API Methods
  // ============================

  /**
   * Returns the origin of the current route.
   * @returns {Object} origin
   */
  getOrigin() {
    return store.getState().origin;
  }

  /**
   * Sets the origin of the current route.
   * @param {Array<number>|String} query An array of coordinates [lng, lat] or location name as a string.
   * @returns {Directions} this
   */
  setOrigin(query) {
    if (typeof query === 'string') {
      this.actions.queryOrigin(query);
    } else {
      this.actions.setOrigin(query);
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
   * Sets the destination of the current route.
   * @param {Array<number>|String} query An array of coordinates [lng, lat] or location name as a string.
   * @returns {Directions} this
   */
  setDestination(query) {
    if (typeof query === 'string') {
      this.actions.queryDestination(query);
    } else {
      this.actions.setDestination(query);
    }

    return this;
  }

  /**
   * Swap the origin and destination.
   * @returns {Directions} this
   */
  reverse() {
    this.actions.reverse();
    return this;
  }

  /**
   * Add a waypoint to the route.
   * @param {Number} index position waypoint should be placed in the waypoint array
   * @param {Array<number>|Point} waypoint can be a GeoJSON Point Feature or [lng, lat] coordinates.
   * @returns {Directions} this;
   */
  addWaypoint(index, waypoint) {
    if (!waypoint.type) waypoint = createPoint(waypoint, { id: 'waypoint' });
    this.actions.addWaypoint(index, waypoint);
    return this;
  }

  /**
   * Change the waypoint at a given index in the route.
   * @param {Number} index indexed position of the waypoint to update
   * @param {Array<number>|Point} waypoint can be a GeoJSON Point Feature or [lng, lat] coordinates.
   * @returns {Directions} this;
   */
  setWaypoint(index, waypoint) {
    if (!waypoint.type) waypoint = createPoint(waypoint, { id: 'waypoint' });
    this.actions.setWaypoint(index, waypoint);
    return this;
  }

  /**
   * Remove a waypoint from the route.
   * @param {Number} index position in the waypoints array.
   * @returns {Directions} this;
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
   * Subscribe to events that happen within the plugin.
   * @param {String} type name of event. Available events and the data passed into their respective event objects are:
   * - __directions.clear__ `{ type: } Type is one of 'origin' or 'destination'`
   * - __directions.loading__ `{ type: } Type is one of 'origin' or 'destination'`
   * - __directions.profile__ `{ profile } Profile is one of 'driving', 'walking', or 'cycling'`
   * - __directions.origin__ `{ feature } Fired when origin is set`
   * - __directions.destination__ `{ feature } Fired when destination is set`
   * - __directions.route__ `{ route } Fired when a route is updated`
   * - __directions.error__ `{ error } Error as string
   * @param {Function} fn function that's called when the event is emitted.
   * @returns {Directions} this;
   */
  on(type, fn) {
    this.actions.eventSubscribe(type, fn);
    return this;
  }
}
