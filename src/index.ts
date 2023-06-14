import type { LngLatLike, Map, MapboxGeoJSONFeature, MapMouseEvent } from 'mapbox-gl';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, bindActionCreators, Unsubscribe } from 'redux';
import { decode } from '@mapbox/polyline';
import rootReducer from './state/reducers.js';
import utils, { type Coordinates, type Point } from './utils.js';

const storeWithMiddleware = applyMiddleware(thunk)(createStore);
const store = storeWithMiddleware(rootReducer);

// State object management via redux
import * as actions from './state/actions.js';
import directionsStyle from './style/directions.js';

// Controls
import Inputs from './controls/inputs.js';
import Instructions from './controls/instructions.js';

/**
 */
export default class MapboxDirections {
  isCursorOverPoint: MapboxGeoJSONFeature | false

  isDragging: Point

  storeUnsubscribe: Unsubscribe | undefined

  _map: Map | null

  actions: any;

  container: HTMLElement;

  constructor(public options = {}) {
    this._map = null;
    this.actions = bindActionCreators(actions, store.dispatch);
    this.actions.setOptions(options);

    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl-directions mapboxgl-ctrl';

    this.isDragging = Object.create(null);
    this.isCursorOverPoint = Object.create(null);
  }

  onAdd(map: Map) {
    this._map = map;

    const { controls } = store.getState();

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

    if (controls.inputs) this.container.appendChild(inputEl);
    if (controls.instructions) this.container.appendChild(directionsEl);

    this.subscribedActions();
    if (this._map.loaded()) this.mapState()
    else this._map.on('load', () => this.mapState());

    return this.container;
  }

  /**
   * Removes the control from the map it has been added to. This is called by `map.removeControl`,
   * which is the recommended method to remove controls.
   */
  onRemove(map: Map) {
    this.container.parentNode?.removeChild(this.container);
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
    const { profile, styles, interactive } = store.getState();

    // Emit any default or option set config
    this.actions.eventEmit('profile', { profile });

    // Add and set data theme layer/style
    this._map?.addSource('directions', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Add direction specific styles to the map
    if (styles && styles.length) styles.forEach((style) => this._map?.addLayer(style));

    directionsStyle.forEach((style) => {
      // only add the default style layer if a custom layer wasn't provided
      if (!this._map?.getLayer(style.id)) {
        this._map?.addLayer(style);
      }
    });


    if (interactive) {
      this._map?.on('mousedown', this.onDragDown);
      this._map?.on('mousemove', this.move);
      this._map?.on('click', this.onClick);

      this._map?.on('touchstart', this.move);
      this._map?.on('touchstart', this.onDragDown);
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

          const features: any[] = [];

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
              if (previous) {
                segment.geometry.coordinates.push(previous.geometry.coordinates[previous.geometry.coordinates.length - 1]);
              }

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

      if (this._map?.style && this._map?.getSource('directions')) {
        this._map?.getSource('directions').setData(geojson);
      }
    });
  }

  onClick() {
    let timer: number | null
    let delay = 250;

    return (event: MapMouseEvent) => {
      if (!timer) {
        timer = setTimeout(() => {
          this._onSingleClick(event);
          timer = null;
        }, delay);
      } else {
        clearTimeout(timer);
        timer = null;
        this._map?.zoomIn();
      }
    };
  }

  _onSingleClick(e: MapMouseEvent) {
    const { origin } = store.getState();
    const coords: LngLatLike = [e.lngLat.lng, e.lngLat.lat];

    if (!origin.geometry) {
      this.actions.setOriginFromCoordinates(coords);
    } else {

      const features = this._map?.queryRenderedFeatures(e.point, {
        layers: [
          'directions-origin-point',
          'directions-destination-point',
          'directions-waypoint-point',
          'directions-route-line-alt'
        ]
      }) ?? [];

      if (features.length) {

        // Remove any waypoints
        features.forEach((f) => {
          if (f.layer.id === 'directions-waypoint-point') {
            this.actions.removeWaypoint(f);
          }
        });

        if (features[0].properties?.route === 'alternate') {
          const index = features[0].properties['route-index'];
          this.actions.setRouteIndex(index);
        }
      } else {
        this.actions.setDestinationFromCoordinates(coords);
        this._map?.flyTo({ center: coords });
      }
    }
  }

  move(e: MapMouseEvent) {
    const { hoverMarker } = store.getState();

    const features = this._map?.queryRenderedFeatures(e.point, {
      layers: [
        'directions-route-line-alt',
        'directions-route-line',
        'directions-origin-point',
        'directions-destination-point',
        'directions-hover-point'
      ]
    }) ?? [];

    if (this._map) {
      this._map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    }

    if (features.length) {
      this.isCursorOverPoint = features[0];
      this._map?.dragPan.disable();

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
      this._map?.dragPan.enable();
    }
  }

  onDragDown() {
    if (!this.isCursorOverPoint) return;
    this.isDragging = this.isCursorOverPoint as any;

    if (this._map) {
      this._map.getCanvas().style.cursor = 'grab';
    }

    this._map?.on('mousemove', this.onDragMove);
    this._map?.on('mouseup', this.onDragUp);

    this._map?.on('touchmove', this.onDragMove);
    this._map?.on('touchend', this.onDragUp);
  }

  onDragMove(e: MapMouseEvent) {
    if (!this.isDragging) return;

    const coords: LngLatLike = [e.lngLat.lng, e.lngLat.lat];

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

  onDragUp() {
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

    if (this._map) {
      this._map.getCanvas().style.cursor = '';
    }

    this._map?.off('touchmove', this.onDragMove);
    this._map?.off('touchend', this.onDragUp);

    this._map?.off('mousemove', this.onDragMove);
    this._map?.off('mouseup', this.onDragUp);
  }

  interactive(state: boolean) {
    if (state) {
      this._map?.on('touchstart', this.move);
      this._map?.on('touchstart', this.onDragDown);

      this._map?.on('mousedown', this.onDragDown);
      this._map?.on('mousemove', this.move);
      this._map?.on('click', this.onClick);
    } else {
      this._map?.off('touchstart', this.move);
      this._map?.off('touchstart', this.onDragDown);

      this._map?.off('mousedown', this.onDragDown);
      this._map?.off('mousemove', this.move);
      this._map?.off('click', this.onClick);
    }

    return this;
  }

  getOrigin() {
    return store.getState().origin;
  }

  setOrigin(query: Coordinates) {
    if (typeof query === 'string') {
      this.actions.queryOrigin(query);
    } else {
      this.actions.setOriginFromCoordinates(query);
    }

    return this;
  }

  getDestination() {
    return store.getState().destination;
  }

  setDestination(query: Coordinates) {
    if (typeof query === 'string') {
      this.actions.queryDestination(query);
    } else {
      this.actions.setDestinationFromCoordinates(query);
    }

    return this;
  }

  reverse() {
    this.actions.reverse();
    return this;
  }

  addWaypoint(index: number, point: Coordinates | Point) {
    const waypoint = Array.isArray(point) || typeof point === 'string'
      ? utils.createPoint(point, { id: 'waypoint' })
      : point;
    this.actions.addWaypoint(index, waypoint);
    return this;
  }

  setWaypoint(index: number, point: Coordinates | Point) {
    const waypoint = Array.isArray(point) || typeof point === 'string'
      ? utils.createPoint(point, { id: 'waypoint' })
      : point;
    this.actions.setWaypoint(index, waypoint);
    return this;
  }

  removeWaypoint(index: number) {
    const { waypoints } = store.getState();
    this.actions.removeWaypoint(waypoints[index]);
    return this;
  }

  getWaypoints() {
    return store.getState().waypoints;
  }

  removeRoutes() {
    this.actions.clearOrigin();
    this.actions.clearDestination();
    return this;
  }

  on(type: string, fn: Function) {
    this.actions.eventSubscribe(type, fn);
    return this;
  }
}
