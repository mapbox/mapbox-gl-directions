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
  constructor(el, store, actions, map) {
    const { originQuery, destinationQuery, profile } = store.getState();

    el.innerHTML = tmpl({
      originQuery,
      destinationQuery,
      profile
    });

    this.container = el;
    this.actions = actions;
    this.map = map;

    this.onAdd();
    this.render(store);
  }

  onAdd() {
    const {
      queryOrigin,
      queryDestination,
      addOrigin,
      addDestination,
      clearOrigin,
      clearDestination,
      setProfile,
      reverse
    } = this.actions;

    this.originInput = this.container.querySelector('.js-origin');
    this.destinationInput = this.container.querySelector('.js-destination');

    this.originClear = this.container.querySelector('.js-origin-clear');
    this.destinationClear = this.container.querySelector('.js-destination-clear');

    // Events
    // ======

    // Origin / Destination autosuggest
    this.originInput.addEventListener('keypress', debounce((e) => {
      queryOrigin(e.target.value);
    }), 100);

    this.originInput.addEventListener('change', () => {
      if (this.originTypeahead.selected) {
        const coords = this.originTypeahead.selected.center;
        addOrigin(coords);
        this.map.flyTo({ center: coords });
      }
    });

    this.originClear.addEventListener('click', clearOrigin);
    this.destinationClear.addEventListener('click', clearDestination);

    this.destinationInput.addEventListener('keypress', debounce((e) => {
      queryDestination(e.target.value);
    }), 100);

    this.destinationInput.addEventListener('change', () => {
      if (this.destinationTypeahead.selected) {
        const coords = this.destinationTypeahead.selected.center;
        addDestination(coords);
        this.map.flyTo({ center: coords });
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
      .addEventListener('click', reverse);
  }

  render(store) {
    store.subscribe(() => {
      const {
        originQuery,
        originResults,
        destinationQuery,
        destinationResults
      } = store.getState();

      if (originResults.length) this.originTypeahead.update(originResults);
      if (destinationResults.length) this.destinationTypeahead.update(destinationResults);

      this.originClear.classList.toggle('active', originResults.length);
      this.destinationClear.classList.toggle('active', destinationResults.length);

      var onChange = document.createEvent('HTMLEvents');
      onChange.initEvent('change', true, false);

      // Adjust values if input is not :focus
      // or query remains unchanged.
      if (this.originInput !== document.activeElement &&
          this.originInput.value !== originQuery) {
        this.originInput.value = originQuery;
        this.originInput.dispatchEvent(onChange);
      }

      if (this.destinationInput !== document.activeElement &&
          this.destinationInput.value !== destinationQuery) {
        this.destinationInput.value = destinationQuery;
        this.destinationInput.dispatchEvent(onChange);
      }

    });
  }
}
