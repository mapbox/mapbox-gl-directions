/**
 * Geocoder - this slightly mimicks the mapboxl-gl-geocoder but isn't an exact replica.
 * Once gl-js plugins can be added to custom divs,
 * we should be able to require mapbox-gl-geocoder instead of including it here.
 */

import Typeahead from 'suggestions';
import type { Map } from 'mapbox-gl'
import { EventEmitter } from 'events'
import utils, { Coordinates } from '../utils.js'

const IgnoreKeys = ['Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'Enter', 'ArrowUp', 'ArrowDown']

const excludedOptions = ['placeholder', 'zoom', 'flyTo', 'accessToken', 'api'];

export interface GeocoderOptions {
  api?: string
  accessToken?: string
  placeholder?: string
  flyTo?: boolean
  zoom?: number
}

export interface GeocoderEvents {
  clear: undefined
  loading: undefined
  results: any
  result: any
  error: { error: any }
}

export type GeocoderEventCallback<T extends keyof GeocoderEvents> = (data: GeocoderEvents[T]) => void

export default class Geocoder {
  _map: Map = Object.create(null)

  /**
   * @internal
   */
  api: string

  /**
   * @internal
   */
  _ev: EventEmitter

  /**
   * @internal
   */
  _inputEl: HTMLInputElement

  /**
   * @internal
   */
  _clearEl: HTMLButtonElement

  /**
   * @internal
   */
  _loadingEl: HTMLSpanElement

  _input: any

  /**
   * @internal
   */
  _results: any

  /**
   * @internal
   */
  _typeahead: Typeahead

  /**
   * @internal
   */
  _abortController: AbortController

  constructor(public options: GeocoderOptions = {}) {
    this.api = options.api ?? 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

    this._ev = new EventEmitter()

    this._input = null

    this._inputEl = document.createElement('input')
    this._inputEl.type = 'text'
    this._inputEl.placeholder = options.placeholder ?? ''

    this._inputEl.addEventListener('keydown', async (e) => {
      const target = e.target as HTMLInputElement | undefined

      if (!target) {
        this._clearEl.classList.remove('active')
        return
      }

      if (e.metaKey || !IgnoreKeys.includes(e.key)) return

      this._queryFromInput(target.value)
    })

    this._clearEl = document.createElement('button')
    this._clearEl.className = 'geocoder-icon geocoder-icon-close'

    this._loadingEl = document.createElement('span')
    this._loadingEl.className = 'geocoder-icon geocoder-icon-loading'

    this._typeahead = new Typeahead(this._inputEl, [], { filter: false });
    this._typeahead.getItemValue = (item: any) => item.place_name

    this._abortController = new AbortController()
  }

  onAdd(map: Map) {
    this._map = map;

    const icon = document.createElement('span');
    icon.className = 'geocoder-icon geocoder-icon-search';

    const actions = document.createElement('div');
    actions.classList.add('geocoder-pin-right');
    actions.appendChild(this._clearEl);
    actions.appendChild(this._loadingEl);

    const element = document.createElement('div')
    element.className = 'mapboxgl-ctrl-geocoder';
    element.appendChild(icon);
    element.appendChild(this._inputEl);
    element.appendChild(actions);

    return element
  }

  _geocode(query: string, callback: (data: any) => unknown) {
    this._loadingEl.classList.add('active');
    this.fire('loading', undefined);

    const geocodingOptions = this.options as Record<string, string>

    const options = Object.keys(this.options)
      .filter((option) => !excludedOptions.includes(option))
      .map((key) => `${key}=${geocodingOptions[key]}`)

    // @ts-ignore
    options.push(`access_token=${this.options.accessToken ?? mapboxgl.accessToken}`)

    this._abortController.abort()
    this._abortController = new AbortController()

    fetch(`${this.api}${encodeURIComponent(query)}.json?${options.join('&')}`, {
      signal: this._abortController.signal
    }).then(async (response) => {
      this._loadingEl.classList.remove('active');

      const data = await response.json()

      if (!response.ok) {
        this.fire('error', { error: data.message });
        return
      }

      if (data.features.length) {
        this._clearEl.classList.add('active');
      } else {
        this._clearEl.classList.remove('active');
        this._typeahead.selected = null;
      }

      this.fire('results', { results: data.features });
      this._typeahead.update(data.features);
      return callback(data.features);
    })
      .catch(error => {
        this._loadingEl.classList.remove('active');
        this.fire('error', { error });
      })
  }

  /**
   * Set & query the input
   */
  query(query: Coordinates) {
    this._query(query);
    return this;
  }


  _query(input?: Coordinates) {
    if (!input) return;

    const geocodeInput = Array.isArray(input) ? input.map(utils.wrap).join() : input;

    this._geocode(geocodeInput, (results) => {
      if (!results.length) return;
      var result = results[0];
      this._results = results;
      this._typeahead.selected = result;
      this._inputEl.value = result.place_name;
      this._change();
    });
  }

  _queryFromInput(input: string) {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      this._clear()
    }

    if (trimmedInput.length > 2) {
      this._geocode(input, (results) => {
        this._results = results
      });
    }
  }

  setInput(input: Coordinates) {
    if (!input) return;

    const newInputValue = Array.isArray(input)
      ? input.map(i => utils.roundWithOriginalPrecision(utils.wrap(i), i)).join()
      : input;

    // Set input value to passed value and clear everything else.
    this._inputEl.value = newInputValue;
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
    this.fire('clear', undefined);
  }

  _change() {
    const changeEvent = new Event('HTMLEvents', { bubbles: true, cancelable: false })
    this._inputEl.dispatchEvent(changeEvent);
  }

  /**
 * Subscribe to events that happen within the plugin.
 * @param type name of event. Available events and the data passed into their respective event objects are:
 *
 * @param listener function that's called when the event is emitted.
 */
  on<T extends keyof GeocoderEvents>(type: T, listener: GeocoderEventCallback<T>) {
    this._ev.on(type, listener);
    this._ev.on('error', (err) => console.log(err));
    return this;
  }

  /**
   * Fire an event
   * @param type The event name.
   * @param data The event data to pass to the function subscribed.
   */
  fire<T extends keyof GeocoderEvents>(type: T, data: GeocoderEvents[T]) {
    this._ev.emit(type, data);
    return this;
  }

  off<T extends keyof GeocoderEvents>(type: T, listener: GeocoderEventCallback<T>) {
    this._ev.removeListener(type, listener)
    return this
  }
}
