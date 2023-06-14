import type { Map, LngLatLike } from 'mapbox-gl';
import extent from 'turf-extent';
import isEqual from 'lodash.isequal';
import template from 'lodash.template';
import Geocoder from './geocoder.js';
import inputTemplate from '../templates/inputs.js'

const tmpl = template(inputTemplate);

/**
 * Inputs controller
 *
 * @param el The summary parent container.
 * @param {Object} store A redux store
 * @param {Object} actions Actions an element can dispatch
 * @param {Object} map The mapboxgl instance
 * @private
 */
export default class Inputs {
  container: HTMLElement;

  actions: any;

  store: any;

  _map: Map;

  originInput: Geocoder = Object.create(null);

  destinationInput: Geocoder = Object.create(null);

  constructor(el: HTMLElement, store, actions, map: Map) {
    const { originQuery, destinationQuery, profile, controls } = store.getState();

    el.innerHTML = tmpl({
      originQuery,
      destinationQuery,
      profile,
      controls
    });

    this.container = el;
    this.actions = actions;
    this.store = store;
    this._map = map;

    this.onAdd();
    this.render();
  }

  animateToCoordinates(mode: unknown, coords: LngLatLike) {
    const { origin, destination, routePadding } = this.store.getState();

    if (origin.geometry &&
      destination.geometry &&
      !isEqual(origin.geometry, destination.geometry)) {
      // Animate map to fit bounds.
      const bb = extent({
        type: 'FeatureCollection',
        features: [origin, destination]
      });

      this._map.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { padding: routePadding });
    } else {
      this._map.flyTo({ center: coords });
    }
  }

  onAdd() {
    const {
      clearOrigin,
      clearDestination,
      createOrigin,
      createDestination,
      setProfile,
      reverse
    } = this.actions;

    const { geocoder, accessToken, flyTo, placeholderOrigin, placeholderDestination, zoom } = this.store.getState();

    this.originInput = new Geocoder(
      this._map,
      Object.assign({}, { accessToken }, geocoder, { flyTo, placeholder: placeholderOrigin, zoom })
    );

    const originEl = this.originInput.onAdd();
    this.container.querySelector('#mapbox-directions-origin-input')?.appendChild(originEl);

    this.destinationInput = new Geocoder(
      this._map,
      Object.assign({}, { accessToken }, geocoder, { flyTo, placeholder: placeholderDestination, zoom })
    );

    const destinationEl = this.destinationInput.onAdd();
    this.container.querySelector('#mapbox-directions-destination-input')?.appendChild(destinationEl);

    this.originInput.on('result', (e) => {
      const coords = e.result.center;
      createOrigin(coords);
      this.animateToCoordinates('origin', coords);
    });

    this.originInput.on('clear', clearOrigin);

    this.destinationInput.on('result', (e) => {
      const coords = e.result.center;
      createDestination(coords);
      this.animateToCoordinates('destination', coords);
    });

    this.destinationInput.on('clear', clearDestination);

    // Driving / Walking / Cycling profiles
    const profiles = this.container.querySelectorAll('input[type="radio"]');
    Array.prototype.forEach.call(profiles, (el) => {
      el.addEventListener('change', () => {
        setProfile(el.value);
      });
    });

    // Reversing Origin / Destination
    this.container.querySelector('.js-reverse-inputs')?.addEventListener('click', () => {
      const { origin, destination } = this.store.getState();
      if (origin) this.actions.queryDestination(origin.geometry.coordinates);
      if (destination) this.actions.queryOrigin(destination.geometry.coordinates);
      reverse();
    });
  }

  render() {
    this.store.subscribe(() => {
      const {
        originQuery,
        destinationQuery,
        originQueryCoordinates,
        destinationQueryCoordinates
      } = this.store.getState();

      if (originQuery) {
        this.originInput.query(originQuery);
        this.actions.queryOrigin(null);
      }

      if (destinationQuery) {
        this.destinationInput.query(destinationQuery);
        this.actions.queryDestination(null);
      }

      if (originQueryCoordinates) {
        this.originInput.setInput(originQueryCoordinates);
        this.animateToCoordinates('origin', originQueryCoordinates);
        this.actions.queryOriginCoordinates(null);
      }

      if (destinationQueryCoordinates) {
        this.destinationInput.setInput(destinationQueryCoordinates);
        this.animateToCoordinates('destination', destinationQueryCoordinates);
        this.actions.queryDestinationCoordinates(null);
      }
    });
  }
}
