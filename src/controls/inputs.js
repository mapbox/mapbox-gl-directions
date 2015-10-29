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
 * @param {Object} actions Actions an element can dispatch
 * @private
 */
export default class Inputs {
  constructor(el, store, actions) {
    const { originQuery, destinationQuery, profile } = store.getState();

    el.innerHTML = tmpl({
      originQuery,
      destinationQuery,
      profile
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
      setProfile,
      reverseInputs
    } = this.actions;

    this.originInput = this.container.querySelector('.js-origin');
    this.destinationInput = this.container.querySelector('.js-destination');

    // Events
    // ======

    // Origin / Destination autosuggest
    this.originInput.addEventListener('keypress', debounce((e) => {
      queryOrigin(e.target.value);
    }), 100);

    this.originInput.addEventListener('change', () => {
      if (this.originTypeahead.selected) {
        addOrigin(this.originTypeahead.selected.center);
      }
    });

    this.destinationInput.addEventListener('keypress', debounce((e) => {
      queryDestination(e.target.value);
    }), 100);

    this.destinationInput.addEventListener('change', () => {
      if (this.destinationTypeahead.selected) {
        addDestination(this.destinationTypeahead.selected.center);
      }
    });

    this.originTypeahead = new typeahead(this.originInput, []);
    this.destinationTypeahead = new typeahead(this.destinationInput, []);

    // Filter results by place_name
    this.originTypeahead.getItemValue = function(item) { return item.place_name; };
    this.destinationTypeahead.getItemValue = function(item) { return item.place_name; };

    // Driving / Walking / Cycling profiles
    const profiles = this.container.querySelectorAll('input[type="radio"]');
    Array.prototype.forEach.call(profiles, (el) => {
      el.addEventListener('change', () => {
        setProfile(el.id.split('-').pop());
      });
    });

    // Reversing Origin / Destination
    this.container
      .querySelector('.js-reverse-inputs')
      .addEventListener('click', reverseInputs);
  }

  render(store) {
    store.subscribe(() => {
      const {
        originQuery,
        originResults,
        destinationQuery,
        destinationResults
      } = store.getState();

      if (originResults.length) {
        this.originTypeahead.update(originResults);
      }

      if (destinationResults.length) {
        this.destinationTypeahead.update(destinationResults);
      }

      this.originInput.value = originQuery;
      this.destinationInput.value = destinationQuery;
    });
  }
}
