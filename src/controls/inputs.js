import template from 'lodash.template';
import debounce from 'lodash.debounce';
import typeahead from 'suggestions';

let fs = require('fs'); // substack/brfs#39
let tmpl = template(fs.readFileSync(__dirname + '/../templates/inputs.html', 'utf8'));

/**
 * Inputs controller
 *
 * @param {HTMLElement} el Summary parent container
 * @param {Object} store A redux store
 * @param {Actions} actions Actions an element can dispatch
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
    const {
      queryOrigin,
      queryDestination,
      addOrigin,
      addDestination,
      setMode,
      reverseInputs
    } = this.actions;

    const $origin = this.container.querySelector('.js-origin');
    const $destination = this.container.querySelector('.js-destination');

    // Events
    // ======

    // Origin / Destination autosuggest
    $origin.addEventListener('keypress', debounce((e) => {
      queryOrigin(e.target.value);
    }), 100);

    $origin.addEventListener('change', () => {
      if (this.originTypeahead.selected.center) {
        addOrigin(this.originTypeahead.selected.center);
      }
    });

    $destination.addEventListener('keypress', debounce((e) => {
      queryDestination(e.target.value);
    }), 100);

    $destination.addEventListener('change', () => {
      if (this.destinationTypeahead.selected.center) {
        addDestination(this.destinationTypeahead.selected.center);
      }
    });

    this.originTypeahead = new typeahead($origin, []);
    this.destinationTypeahead = new typeahead($destination, []);

    // Filter results by place_name
    this.originTypeahead.getItemValue = function(item) { return item.place_name; };
    this.destinationTypeahead.getItemValue = function(item) { return item.place_name; };

    // Driving / Walking / Cycling modes
    const profiles = this.container.querySelectorAll('input[type="radio"]');
    Array.prototype.forEach.call(profiles, (el) => {
      el.addEventListener('change', () => {
        setMode(el.id.split('-').pop());
      });
    });

    // Reversing Origin / Destination
    this.container
      .querySelector('.js-reverse-inputs')
      .addEventListener('click', reverseInputs);
  }

  render(store) {
    store.subscribe(() => {
      const { originResults, destinationResults } = store.getState();
      if (originResults.length) this.originTypeahead.update(originResults);
      if (destinationResults.length) this.destinationTypeahead.update(destinationResults);
    });
  }
}
