import template from 'lodash.template';
let fs = require('fs'); // substack/brfs#39

let tmpl = template(fs.readFileSync(__dirname + '/../templates/inputs.html', 'utf8'));

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

    const { originQuery, destinationQuery, mode } = data;

    el.innerHTML = tmpl({
      originQuery,
      destinationQuery,
      mode
    });
  }
}
