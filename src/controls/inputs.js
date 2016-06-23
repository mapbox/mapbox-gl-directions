import 'mapbox-gl-geocoder';
import template from 'lodash.template';
import extent from 'turf-extent';

let fs = require('fs'); // substack/brfs#39
let tmpl = template(fs.readFileSync(__dirname + '/../templates/inputs.html', 'utf8'));

/**
 * Inputs controller
 *
 * @param {HTMLElement} el Summary parent container
 * @param {Object} store A redux store
 * @param {Object} actions Actions an element can dispatch
 * @param {Object} map The mapboxgl instance
 * @private
 */
export default class Inputs {
  constructor(el, store, actions, map) {
    const { originQuery, destinationQuery, profile } = store.getState();

    el.innerHTML = tmpl({
      originQuery,
      destinationQuery,
      profile
    });

    this.container = el;
    this.actions = actions;
    this.store = store;
    this.map = map;

    this.onAdd();
    this.render();
  }

  animateToCoordinates(mode, coords) {
    const { origin, destination } = this.store.getState();

    if (origin.type && destination.type) {
      // Animate map to fit bounds.
      const bb = extent({
        type: 'FeatureCollection',
        features: [origin, destination]
      });

      this.map.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { padding: 40 });
    } else {
      this.map.flyTo({ center: coords });
    }
  }

  onAdd() {
    const {
      clearOrigin,
      clearDestination,
      originCoordinates,
      destinationCoordinates,
      setProfile,
      reverse
    } = this.actions;

    this.originInput = new mapboxgl.Geocoder({
      flyTo: false,
      placeholder: 'Choose a starting place',
      container: this.container.querySelector('#mapbox-directions-origin-input')
    });

    this.map.addControl(this.originInput);

    this.destinationInput = new mapboxgl.Geocoder({
      flyTo: false,
      placeholder: 'Choose destination',
      container: this.container.querySelector('#mapbox-directions-destination-input')
    });

    this.map.addControl(this.destinationInput);

    // Events
    // ============================

    this.originInput.on('result', (e) => {
      const coords = e.result.center;
      originCoordinates(coords);
      this.animateToCoordinates('origin', coords);
    });

    this.originInput.on('clear', clearOrigin);

    this.destinationInput.on('result', (e) => {
      const coords = e.result.center;
      destinationCoordinates(coords);
      this.animateToCoordinates('destination', coords);
    });

    this.destinationInput.on('clear', clearDestination);

    // Driving / Walking / Cycling profiles
    const profiles = this.container.querySelectorAll('input[type="radio"]');
    Array.prototype.forEach.call(profiles, (el) => {
      el.addEventListener('change', () => {
        setProfile(el.id.split('-').pop());
      });
    });

    // Reversing Origin / Destination
    this.container
      .querySelector('.js-reverse-inputs')
      .addEventListener('click', reverse);
  }

  render() {
    this.store.subscribe(() => {
      const { originQuery, destinationQuery } = this.store.getState();

      if (originQuery) {
        this.originInput.query(originQuery);
        this.actions.originQuery(null);
      }

      if (destinationQuery) {
        this.destinationInput.query(destinationQuery);
        this.actions.destinationQuery(null);
      }
    });
  }
}
