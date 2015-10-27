import template from 'lodash.template';
import debounce from 'lodash.debounce';

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

    this.onAdd(actions);
  }
  onAdd(actions) {
    const { reverseInputs, queryOrigin } = actions;

    // Events
    document.querySelector('.js-reverse-inputs').addEventListener('click', reverseInputs);
    document.querySelector('.js-origin').addEventListener('keypress', debounce((e) => {
      queryOrigin(e.target.value);
    }), 100);
  }
}
