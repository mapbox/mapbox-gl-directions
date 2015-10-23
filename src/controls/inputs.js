import template from 'lodash.template';
let fs = require('fs'); // substack/brfs#39

let inputsTemplate = fs.readFileSync(__dirname + '/../templates/inputs.html', 'utf8');
let inputTemplate = fs.readFileSync(__dirname + '/../templates/shared/input.html', 'utf8');

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
