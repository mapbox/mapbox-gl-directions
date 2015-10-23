import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import debounce from 'lodash.debounce';
import extent from 'turf-extent';
import { decode } from 'polyline';

// State object management via redux
import * as actions from './actions';
import reducers from './reducers';
import directionsStyle from './directions_style';
let storeWithMiddleware = applyMiddleware(thunk)(createStore);

// Controls
import Inputs from './controls/inputs';
import Summary from './controls/summary';
import Instructions from './controls/instructions';

export default class Directions extends mapboxgl.Control {

  constructor(options) {
    super();

    this.options = {
      mode: 'driving',
      unit: 'imperial'
    };

    Object.assign(this, options);

    this.store = storeWithMiddleware(reducers);

    this.onMouseDown = this._onMouseDown.bind(this);
    this.onMouseMove = this._onMouseMove.bind(this);
    this.onMouseUp = this._onMouseUp.bind(this);
  }

  onAdd(map) {
    this.map = map;
    const container = this.map.getContainer();
    const data = this.store.getState();

    const inputEl = document.createElement('div');
    inputEl.className = 'directions-control directions-control-inputs';
    const directionsEl = document.createElement('div');
    directionsEl.className = 'directions-control directions-control-directions';

    container.appendChild(inputEl);
    container.appendChild(directionsEl);

    // Set up elements to the map
    // Add controllers to the page
    new Inputs(inputEl, data, actions);

    new Summary(directionsEl, {
      unit: data.unit,
      directions: data.directions,
      activeRoute: data.routeIndex
    });

    new Instructions(directionsEl, {
      unit: data.unit,
      directions: data.directions,
      activeRoute: data.routeIndex
    }, {
      hoverMarker: actions.hoverMarker
    });

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

      directionsStyle.forEach((style) => {
        map.addLayer(style);
      });

      map.getContainer().addEventListener('mousedown', this.onMouseDown);
      map.getContainer().addEventListener('mousemove', this.onMouseMove, true);
      map.getContainer().addEventListener('mouseup', this.onMouseUp);

      map.on('mousemove', (e) => {
        const { hoverWayPoint } = this.store.getState();

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
            this.store.dispatch(actions.hoverWayPoint([coords.lng, coords.lat]));
          } else if (hoverWayPoint.geometry) {
            this.store.dispatch(actions.hoverWayPoint(null));
          }
        });

      }.bind(this));

      // Map event handlers
      map.on('click', (e) => {
        const { origin } = this.store.getState();
        const coords = [e.lngLat.lng, e.lngLat.lat];

        if (!origin.geometry) {
          this.store.dispatch(actions.queryPointFromMap(coords, 'origin'));
          map.flyTo({ center: coords });
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
              this.store.dispatch(actions.setRouteIndex(index));
            }

            if (!features.length) {
              this.store.dispatch(actions.queryPointFromMap(coords, 'destination'));
              var bbox = extent({
                type: 'FeatureCollection',
                features: [origin, {
                  type: 'feature',
                  geometry: {
                    type: 'Point',
                    coordinates: coords
                  }
                }]});
                map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], {
                padding: 40
              });
            }
          });
        }
      }.bind(this));

      // Set options.
      this.store.dispatch(actions.setOptions(this.options));
    });
  }

  subscribedActions() {
    this.store.subscribe(() => {
      const data = this.store.getState();
      const geojson = {
        type: 'FeatureCollection',
        features: [
          data.origin,
          data.destination,
          data.hoverMarker,
          data.hoverWayPoint
        ].filter((d) => {
          return d.geometry;
        })
      };

      if (data.directions.length) {
        data.directions.forEach((feature, index) => {

          const lineString = {
            geometry: {
              type: 'LineString',
              coordinates: decode(feature.geometry, 6).map((c) => {
                return c.reverse();
              })
            },
            properties: {
              'route-index': index,
              route: (index === data.routeIndex) ? 'selected' : 'alternate'
            }
          };

          geojson.features.push(lineString);

          if (index === data.routeIndex) {
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
          this.store.dispatch(actions.filterWayPoint(this.dragging.geometry.coordinates));
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
          debounce(this.store.dispatch(actions.queryPointFromMap(coords, 'origin')), 100);
        break;
        case 'directions-destination-point':
          debounce(this.store.dispatch(actions.queryPointFromMap(coords, 'destination')), 100);
        break;
        case 'directions-waypoint-point':
          debounce(this.store.dispatch(actions.hoverWayPoint(coords)), 100);
        break;
      }
    }
  }

  _onMouseUp() {
    const { hoverWayPoint } = this.store.getState();

    if (this.dragging && hoverWayPoint.geometry) {
      switch (this.dragging.layer.id) {
        case 'directions-waypoint-point':
          this.store.dispatch(actions.addWayPoint(hoverWayPoint.geometry.coordinates));
        break;
      }
    }

    this.dragging = false;
    this.map.getContainer().classList.remove('directions-drag');
  }
}
