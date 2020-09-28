'use strict';

import Typeahead from 'suggestions';
import debounce from 'lodash.debounce';
import { EventEmitter } from 'events';
import utils from '../utils';

// Geocoder - this slightly mimicks the mapboxl-gl-geocoder but isn't an exact replica.
// Once gl-js plugins can be added to custom divs, we should be able to require mapbox-gl-geocoder
// instead of including it here

export default class Geocoder {
  constructor(options) {
    this._ev = new EventEmitter();
    this.options = options;
    this.api = options && options.api || 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
  }

  onAdd(map) {
    this._map = map;

    this.request = new XMLHttpRequest();

    // Template
    var el = document.createElement('div');
    el.className = 'mapboxgl-ctrl-geocoder';

    var icon = document.createElement('span');
    icon.className = 'geocoder-icon geocoder-icon-search';

    var input = this._inputEl = document.createElement('input');
    input.type = 'text';
    input.placeholder = this.options.placeholder;

    input.addEventListener('keydown', debounce(function(e) {
      if (!e.target.value) return this._clearEl.classList.remove('active');

      // TAB, ESC, LEFT, RIGHT, ENTER, UP, DOWN
      if (e.metaKey || [9, 27, 37, 39, 13, 38, 40].indexOf(e.keyCode) !== -1) return;
      this._queryFromInput(e.target.value);
    }.bind(this)), 200);

    input.addEventListener('change', function(e) {
      if (e.target.value) this._clearEl.classList.add('active');

      var selected = this._typeahead.selected;
      if (selected) {
        if (this.options.flyTo) {
          if (selected.bbox && selected.context && selected.context.length <= 3 ||
              selected.bbox && !selected.context) {
            var bbox = selected.bbox;
            map.fitBounds([[bbox[0], bbox[1]],[bbox[2], bbox[3]]]);
          } else {
            map.flyTo({
              center: selected.center,
              zoom: this.options.zoom
            });
          }
        }
        this._input = selected;
        this.fire('result', { result: selected });
      }
    }.bind(this));

    var actions = document.createElement('div');
    actions.classList.add('geocoder-pin-right');

    var clear = this._clearEl = document.createElement('button');
    clear.className = 'geocoder-icon geocoder-icon-close';
    clear.addEventListener('click', this._clear.bind(this));

    var loading = this._loadingEl = document.createElement('span');
    loading.className = 'geocoder-icon geocoder-icon-loading';

    actions.appendChild(clear);
    actions.appendChild(loading);

    el.appendChild(icon);
    el.appendChild(input);
    el.appendChild(actions);

    // Override the control being added to control containers
    if (this.options.container) this.options.position = false;

    this._typeahead = new Typeahead(input, [], { filter: false });
    this._typeahead.getItemValue = function(item) { return item.place_name; };

    return el;
  }

  _geocode(q, callback) {
    this._loadingEl.classList.add('active');
    this.fire('loading');

    const geocodingOptions = this.options
    const exclude = ['placeholder', 'zoom', 'flyTo', 'accessToken'];
    const options = Object.keys(this.options).filter(function(key) {
      return exclude.indexOf(key) === -1;
    }).map(function(key) {
      return key + '=' + geocodingOptions[key];
    });

    var accessToken = this.options.accessToken ? this.options.accessToken : mapboxgl.accessToken;
    options.push('access_token=' + accessToken);
    this.request.abort();
    this.request.open('GET', this.api + encodeURIComponent(q.trim()) + '.json?' + options.join('&'), true);
    this.request.onload = function() {
      this._loadingEl.classList.remove('active');
      if (this.request.status >= 200 && this.request.status < 400) {
        var data = JSON.parse(this.request.responseText);
        if (data.features.length) {
          this._clearEl.classList.add('active');
        } else {
          this._clearEl.classList.remove('active');
          this._typeahead.selected = null;
        }

        this.fire('results', { results: data.features });
        this._typeahead.update(data.features);
        return callback(data.features);
      } else {
        this.fire('error', { error: JSON.parse(this.request.responseText).message });
      }
    }.bind(this);

    this.request.onerror = function() {
      this._loadingEl.classList.remove('active');
      this.fire('error', { error: JSON.parse(this.request.responseText).message });
    }.bind(this);

    this.request.send();
  }

  _queryFromInput(q) {
    q = q.trim();
    if (!q) this._clear();
    if (q.length > 2) {
      this._geocode(q, function(results) {
        this._results = results;
      }.bind(this));
    }
  }

  _change() {
    var onChange = document.createEvent('HTMLEvents');
    onChange.initEvent('change', true, false);
    this._inputEl.dispatchEvent(onChange);
  }

  _query(input) {
    if (!input) return;
    if (typeof input === 'object' && input.length) {
      input = [
        utils.wrap(input[0]),
        utils.wrap(input[1])
      ].join();
    }

    this._geocode(input, function(results) {
      if (!results.length) return;
      var result = results[0];
      this._results = results;
      this._typeahead.selected = result;
      this._inputEl.value = result.place_name;
      this._change();
    }.bind(this));
  }

  _setInput(input) {
    if (!input) return;
    if (typeof input === 'object' && input.length) {
      input = [
        utils.roundWithOriginalPrecision(utils.wrap(input[0]), input[0]),
        utils.roundWithOriginalPrecision(utils.wrap(input[1]), input[1])
      ].join();
    }

    // Set input value to passed value and clear everything else.
    this._inputEl.value = input;
    this._input = null;
    this._typeahead.selected = null;
    this._typeahead.clear();
    this._change();
  }

  _clear() {
    this._input = null;
    this._inputEl.value = '';
    this._typeahead.selected = null;
    this._typeahead.clear();
    this._change();
    this._inputEl.focus();
    this._clearEl.classList.remove('active');
    this.fire('clear');
  }

  getResult() {
    return this._input;
  }

  /**
   * Set & query the input
   * @param {Array|String} query An array of coordinates [lng, lat] or location name as a string.
   * @returns {Geocoder} this
   */
  query(query) {
    this._query(query);
    return this;
  }

  /**
   * Set input
   * @param {Array|String} value An array of coordinates [lng, lat] or location name as a string. Calling this function just sets the input and does not trigger an API request.
   * @returns {Geocoder} this
   */
  setInput(value) {
    this._setInput(value);
    return this;
  }

  /**
   * Subscribe to events that happen within the plugin.
   * @param {String} type name of event. Available events and the data passed into their respective event objects are:
   *
   * - __clear__ `Emitted when the input is cleared`
   * - __loading__ `Emitted when the geocoder is looking up a query`
   * - __results__ `{ results } Fired when the geocoder returns a response`
   * - __result__ `{ result } Fired when input is set`
   * - __error__ `{ error } Error as string`
   * @param {Function} fn function that's called when the event is emitted.
   * @returns {Geocoder} this;
   */
  on(type, fn) {
    this._ev.on(type, fn);
    this._ev.on('error', function (err) {
      console.log(err);
    });
    return this;
  }
  /**
   * Fire an event
   * @param {String} type event name.
   * @param {Object} data event data to pass to the function subscribed.
   * @returns {Geocoder} this
   */
  fire(type, data) {
    this._ev.emit(type, data);
    return this;
  }

  /**
   * Remove an event
   * @returns {Geocoder} this
   * @param {String} type Event name.
   * @param {Function} fn Function that should unsubscribe to the event emitted.
   */
  off(type, fn) {
    this._ev.removeListener(type, fn);
    return this;
  }
};
