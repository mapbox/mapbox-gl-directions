import format from '../format';
import template from 'lodash.template';

const instructionsTemplate = fs.readFileSync(__dirname + '../templates/summary.html', 'utf8');

/**
 * Summary controller
 *
 * @param {HTMLElement} el Summary parent container
 * @param {Object} data Data passed from store
 * @param {String} data.unit The read unit distance should be calculated as
 * @param {Object} data.directions The directions object received from Mapbox Directions API
 * @param {Number} data.activeRoute Of all possible routes the index of the current one
 * @param {Object} actions All available actions this controller can dispatch
 * @private
 */
export default class Instructions {

  constructor(el, data) {
    console.log('TEMPLATE IS', instructionsTemplate);
  }
}
