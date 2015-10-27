import template from 'lodash.template';
import debounce from 'lodash.debounce';
import typeahead from 'type-ahead';

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
  constructor(el, store, actions) {
    const { originQuery, destinationQuery, mode } = store.getState();

    el.innerHTML = tmpl({
      originQuery,
      destinationQuery,
      mode
    });

    this.container = el;
    this.actions = actions;

    this.onAdd();
    this.render(store);
  }

  onAdd() {
    const { reverseInputs, queryOrigin, setMode } = this.actions;

    const $origin = this.container.querySelector('.js-origin');
    // const $destination = this.container.querySelector('.js-destination');

    // Events
    this.container.querySelector('.js-reverse-inputs').addEventListener('click', reverseInputs);
    $origin.addEventListener('keypress', debounce((e) => {
      queryOrigin(e.target.value);
    }), 100);

    // Auto suggest
    this.originTypeahead = new typeahead($origin, []);
    // this.destinationTypeahead = new typeahead($destination, []);

    // Driving / Walking / Cycling modes
    const profiles = this.container.querySelectorAll('input[type="radio"]');
    Array.prototype.forEach.call(profiles, (el) => {
      el.addEventListener('change', () => {
        setMode(el.id.split('-').pop());
      });
    });
  }

  render(store) {
    store.subscribe(() => {
      const { originResults, destinationResults } = store.getState();

      if (originResults.length) {
        this.originTypeahead.update(originResults.reduce((memo, item) => {
          memo.push(item.place_name);
          return memo;
        }, []));
      }

    });
  }
}
