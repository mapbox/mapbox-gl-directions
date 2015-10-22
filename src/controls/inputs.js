import template from 'lodash.template';

const inputsTemplate = fs.readFileSync(__dirname + '../templates/inputs.html', 'utf8');
const inputTemplate = fs.readFileSync(__dirname + '../templates/shared/input.html', 'utf8');

/**
 * Inputs controller
 *
 * @param {HTMLElement} el Summary parent container
 * @param {Object} data Data passed from store
 * @param {Actions} actions All available actions an element can dispatch
 * @private
 */
export default class Inputs {
  constructor(el, data, actions) {
    console.log('TEMPLATE IS', inputsTemplate);
  }
}
