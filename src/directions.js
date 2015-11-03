import { createStore, applyMiddleware, bindActionCreators } from 'redux';
import thunk from 'redux-thunk';
import mapboxgl from 'mapbox-gl';
import { decode } from 'polyline';
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

  constructor(el, options) {
    super();

    this.container = el;

    this.actions = bindActionCreators(actions, store.dispatch);
    this.actions.setOptions(options || {});

    this.onMouseDown = this._onMouseDown.bind(this);
    this.onMouseMove = this._onMouseMove.bind(this);
    this.onMouseUp = this._onMouseUp.bind(this);
  }

  onAdd(map) {
    this.map = map;

    const inputEl = document.createElement('div');
    inputEl.className = 'directions-control directions-control-inputs';
    const directionsEl = document.createElement('div');
    directionsEl.className = 'directions-control-directions-container';

    this.container.appendChild(inputEl);
    this.container.appendChild(directionsEl);

    // Add controllers to the page
    new Inputs(inputEl, store, this.actions, this.map);
    new Instructions(directionsEl, store, {
      hoverMarker: this.actions.hoverMarker
    }, this.map);

    this.mapState();
    this.subscribedActions();
  }

  mapState() {
    const map = this.map;

    map.on('load', () => {

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
        const { hoverWayPoint } = store.getState();

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
          radius: 5,
          layer: 'directions-route-line'
        }, (err, features) => {
          if (err) throw err;
          if (features.length) {
            var coords = e.lngLat;
            this.actions.hoverWayPoint([coords.lng, coords.lat]);
          } else if (hoverWayPoint.geometry) {
            this.actions.hoverWayPoint(null);
          }
        });

      }.bind(this));

      // Map event handlers
      map.on('click', (e) => {
        const { origin } = store.getState();
        const coords = [e.lngLat.lng, e.lngLat.lat];

        if (!origin.geometry) {
          this.actions.queryOriginCoordinates(coords);
        } else {
          map.featuresAt(e.point, {
            radius: 10,
            layer: [
              'directions-origin-point',
              'directions-destination-point',
              'directions-route-line-alt'
            ]
          }, (err, features) => {
            if (err) throw err;
            if (features.length && features[0].properties.route === 'alternate') {
              const index = features[0].properties['route-index'];
              this.actions.setRouteIndex(index);
            }

            if (!features.length) {
              this.actions.queryDestinationCoordinates(coords);
              this.map.flyTo({ center: coords });
            }
          });
        }
      }.bind(this));
    });
  }

  subscribedActions() {
    store.subscribe(() => {
      const {
        origin,
        destination,
        hoverMarker,
        hoverWayPoint,
        directions,
        routeIndex
      } = store.getState();

      const geojson = {
        type: 'FeatureCollection',
        features: [
          origin,
          destination,
          hoverMarker,
          hoverWayPoint
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

      this.map.getSource('directions').setData(geojson);
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
        'directions-waypoint-point'
      ]
    }, (err, features) => {
      if (err) throw err;
      if (features.length) {
        this.dragging = features[0];

        // Remove any existing waypoints from the same location
        if (this.dragging.layer.id === 'directions-waypoint-point') {
          this.actions.filterWayPoint(this.dragging.geometry.coordinates);
        }
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
          this.actions.addOrigin(coords);
        break;
        case 'directions-destination-point':
          this.actions.addDestination(coords);
        break;
        case 'directions-waypoint-point':
          this.actions.hoverWayPoint(coords);
        break;
      }
    }
  }

  _onMouseUp() {
    const { hoverWayPoint, origin, destination } = store.getState();

    if (this.dragging) {
      switch (this.dragging.layer.id) {
        case 'directions-origin-point':
          this.actions.queryOriginCoordinates(origin.geometry.coordinates);
        break;
        case 'directions-destination-point':

          this.actions.queryDestinationCoordinates(destination.geometry.coordinates);
        break;
        case 'directions-waypoint-point':
          this.actions.addWayPoint(hoverWayPoint.geometry.coordinates);
        break;
      }
    }

    this.dragging = false;
    this.map.getContainer().classList.remove('directions-drag');
  }

  //  API Methods
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
   * @param {Array} coordinates [lng, lat]
   * @returns {Directions} this
   */
  setOrigin(coordinates) {
    this.actions.queryOriginCoordinates(coordinates);
    this.map.flyTo({ center: coordinates });
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
   * @param {Array} coordinates [lng, lat]
   * @returns {Directions} this
   */
  setDestination(coordinates) {
    this.actions.queryDestinationCoordinates(coordinates);
    this.map.flyTo({ center: coordinates });
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
}
