import format from '../format';
import template from 'lodash.template';
import isEqual from 'lodash.isequal';
import extent from 'turf-extent';

let fs = require('fs'); // substack/brfs#39
let tmpl = template(fs.readFileSync(__dirname + '/../templates/instructions.html', 'utf8'));

/**
 * Summary/Instructions controller
 *
 * @param {HTMLElement} el Summary parent container
 * @param {Object} store A redux store
 * @param {Object} actions Actions an element can dispatch
 * @param {Object} map The mapboxgl instance
 * @private
 */
export default class Instructions {
  constructor(el, store, actions, map) {
    this.container = el;
    this.actions = actions;
    this.map = map;
    this.directions = {};

    this.render(store);
  }

  render(store) {
    store.subscribe(() => {
      const { hoverMarker } = this.actions;
      const { origin, destination, routeIndex, unit, directions } = store.getState();
      const shouldRender = !isEqual(directions[routeIndex], this.directions);

      if (directions.length && shouldRender) {
        const direction = this.directions = directions[routeIndex];

        this.container.innerHTML = tmpl({
          routeIndex,
          steps: direction.steps,
          format: format[unit],
          duration: format[unit](direction.distance),
          distance: format.duration(direction.duration)
        });

        var steps = this.container.querySelectorAll('.mapbox-directions-step');

        Array.prototype.forEach.call(steps, (el) => {
          const lng = el.getAttribute('data-lng');
          const lat = el.getAttribute('data-lat');

          el.addEventListener('mouseover', () => {
            hoverMarker([lng, lat]);
          });

          el.addEventListener('mouseout', () => {
            hoverMarker(null);
          });

          el.addEventListener('click', () => {
            this.map.flyTo({
              center: [lng, lat],
              zoom: 16
            });
          });
        });

        // Animate map to fit bounds.
        const bbox = extent({
          type: 'FeatureCollection',
          features: [origin, destination]
        });

        this.map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], {
          padding: 40
        });

      } else if (this.container.innerHTML && shouldRender) {
        this.container.innerHTML = '';
      }
    });
  }
}
