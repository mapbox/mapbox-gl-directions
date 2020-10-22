import utils from '../utils';
import template from 'lodash.template';
import isEqual from 'lodash.isequal';

let fs = require('fs'); // substack/brfs#39
let instructionsTemplate = template(fs.readFileSync(__dirname + '/../templates/instructions.html', 'utf8'));
let errorTemplate = template(fs.readFileSync(__dirname + '/../templates/error.html', 'utf8'));

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
      const { routeIndex, unit, directions, error, compile } = this.store.getState();
      const shouldRender = !isEqual(directions[routeIndex], this.directions);

      if (error) {
        this.container.innerHTML = errorTemplate({ error });
        return;
      }

      if (directions.length && shouldRender) {
        const direction = this.directions = directions[routeIndex];

        direction.legs.forEach(function(leg) {
          leg.steps.forEach(function(step) {
            step.lanes = stepToLanes(step);
            if (compile) {
              step.maneuver.instruction = compile('en', step);
            }
          });
        });

	function stepToLanes(step) {
	  var lanes = step.intersections[0].lanes;

	  if (!lanes) return [];

	  var maneuver = step.maneuver.modifier || '';

	  return lanes.map(function(lane, index) {
	    var classes = [];
	    if (!lane.valid) classes.push(['invalid']);

	    // check maneuver direction matches this lane one(s)
	    var maneuverIndication = lane.indications.indexOf(maneuver);
	    if (maneuverIndication === -1) {
	      // check non-indicated lane to allow straight, right turn from last lane and left turn for first lane
	      if ((lane.indications[0] === 'none' || lane.indications[0] === '') && (
		maneuver === 'straight' ||
		(index === 0 && maneuver.slice(-4) === 'left') ||
		(index === (lanes.length - 1) && maneuver.slice(-5) === 'right'))) {
		maneuverIndication = 0;
	      } else if (maneuver.slice(0, 7) === 'slight ' ) {
		// try to exclude 'slight' modifier
		maneuverIndication = lane.indications.indexOf(maneuver.slice(7));
	      }
	    }
	    var indication = (maneuverIndication === -1) ? lane.indications[0] : maneuver;

	    var icon;
	    switch (indication) {
	    case 'right':
	      icon = 'right';
	      break;
	    case 'sharp right':
	      icon = 'sharp-right';
	      break;
	    case 'slight right':
	      icon = 'slight-right';
	      break;
	    case 'left':
	      icon = 'left';
	      break;
	    case 'sharp left':
	      icon = 'sharp-left';
	      break;
	    case 'slight left':
	      icon = 'slight-left';
	      break;
	    case 'uturn':
	      icon = 'u-turn';
	      break;
	    //case 'straight':
	    //case 'none':
	    default:
	      icon = 'straight';
	      break;
	    }
	    classes.push('directions-icon-' + icon);

	    return classes.join(' ');
	  });
	}

        this.container.innerHTML = instructionsTemplate({
          routeIndex,
          routes: directions.length,
          steps: direction.legs[0].steps, // Todo: Respect all legs,
          format: utils.format[unit],
          duration: utils.format[unit](direction.distance),
          distance: utils.format.duration(direction.duration)
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
