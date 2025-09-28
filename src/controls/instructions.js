import utils from '../utils';
import { Eta } from 'eta';

let fs = require('fs'); // substack/brfs#39
const eta = new Eta({ useWith: true });
let instructionsTemplate = eta.compile(fs.readFileSync(__dirname + '/../templates/instructions.html', 'utf8'));
let errorTemplate = eta.compile(fs.readFileSync(__dirname + '/../templates/error.html', 'utf8'));

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
    this.store = store;
    this._map = map;
    this.directions = {};
    this.render();
  }

  render() {
    this.store.subscribe(() => {
      const { hoverMarker, setRouteIndex } = this.actions;
      const { routeIndex, unit, directions, error, compile, instructions: instructionsOptions } = this.store.getState();
      const shouldRender = JSON.stringify(directions[routeIndex]) !== JSON.stringify(this.directions);

      if (error) {
        this.container.innerHTML = eta.render(errorTemplate, { error });
        return;
      }

      const filterStepsBy = instructionsOptions.showWaypointInstructions 
        ? undefined 
        : (step) => step.maneuver.type !== 'waypoint';

      if (directions.length && shouldRender) {
        const direction = this.directions = directions[routeIndex];
        const allSteps = utils.getAllSteps(direction, filterStepsBy);

        if (compile) {
          direction.legs.forEach(function(leg) {
            leg.steps.forEach(function(step) {
              step.maneuver.instruction = compile('en', step);
            });
          });
        }

        this.container.innerHTML = eta.render(instructionsTemplate, {
          routeIndex,
          routes: directions.length,
          steps: allSteps,
          format: utils.format[unit],
          duration: utils.format.duration(direction.duration),
          distance: utils.format[unit](direction.distance)
        });

        const steps = this.container.querySelectorAll('.mapbox-directions-step');

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
            this._map.flyTo({
              center: [lng, lat],
              zoom: 16
            });
          });
        });

        const routes = this.container.querySelectorAll('input[type="radio"]');
        Array.prototype.forEach.call(routes, (el) => {
          el.addEventListener('change', (e) => { setRouteIndex(parseInt(e.target.id, 10)); });
        });
      } else if (this.container.innerHTML && shouldRender) {
        this.container.innerHTML = '';
      }
    });
  }
}
