import 'autocompleter/autocomplete.css'

import autocomplete from 'autocompleter'
import Typeahead from 'suggestions';
import type { Map } from 'mapbox-gl';
import { EventEmitter } from 'events';
import utils, { Coordinates } from '../utils';
import type { GeocodingOkResponse, GeocodingErrorResponse, GeocodingFeature } from './geocoder.types';

const exclude = ['placeholder', 'zoom', 'flyTo', 'accessToken', 'api'];

export interface GeocoderOptions {
  api?: string
  accessToken?: string
  placeholder?: string
  flyTo?: boolean
  zoom?: number
  container?: HTMLElement | string
  position?: boolean
}

export interface GeocoderEvents {
  clear: undefined
  loading: undefined
  results: { results: GeocodingFeature[] }
  result: { result: GeocodingFeature }
  error: { error: string }
}

export type GeocoderEventCallback<T extends keyof GeocoderEvents> = (data: GeocoderEvents[T]) => void

/**
 * Geocoder - this slightly mimicks the mapboxl-gl-geocoder but isn't an exact replica.
 * Once gl-js plugins can be added to custom divs,
 * we should be able to require mapbox-gl-geocoder instead of including it here.
 */
export default class Geocoder {
  api: string

  controller: AbortController

  _map: Map

  _input: GeocodingFeature | null

  _results: GeocodingFeature[]

  _eventEmitter: EventEmitter

  _el: HTMLDivElement

  _inputEl: HTMLInputElement

  _clearEl: HTMLButtonElement

  _loadingEl: HTMLSpanElement

  constructor(public options: GeocoderOptions = {}) {
    // Override the control being added to control containers
    if (options.container) options.position = false;

    this._map = Object.create(null);

    this.api = options.api ?? 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
    this.controller = new AbortController();
    this._eventEmitter = new EventEmitter();

    const icon = document.createElement('span');
    icon.className = 'geocoder-icon geocoder-icon-search';

    this._inputEl = document.createElement('input');
    this._inputEl.type = 'text';
    this._inputEl.placeholder = options.placeholder ?? 'Search';

    this._clearEl = document.createElement('button');
    this._clearEl.className = 'geocoder-icon geocoder-icon-close';
    this._clearEl.addEventListener('click', this._clear.bind(this));

    this._loadingEl = document.createElement('span');
    this._loadingEl.className = 'geocoder-icon geocoder-icon-loading';

    const actions = document.createElement('div');
    actions.classList.add('geocoder-pin-right');
    actions.appendChild(this._clearEl);
    actions.appendChild(this._loadingEl);

    this._el = document.createElement('div');
    this._el.className = 'mapboxgl-ctrl-geocoder';

    this._el.appendChild(icon);
    this._el.appendChild(this._inputEl);
    this._el.appendChild(actions);

    this._results = [];
    this._input = null

    let timeout: number | null = null;

    this._inputEl.addEventListener('input', (event) => {
      if (timeout) clearTimeout(timeout);

      const target = event.target as HTMLInputElement;

      if (target.value) {
        timeout = setTimeout(() => {
          timeout = null
          this._queryFromInput(target.value);
        }, 200)
      } else {
        this._clearEl.classList.remove('active');
      }
    });

    // this._inputEl.addEventListener('change', (event) => {
    //   const target = event.target as HTMLInputElement;

    //   if (target.value) {
    //     this._clearEl.classList.add('active');
    //   }

    //   const selected: GeocodingFeature = this._typeahead.selected;

    //   if (selected) {
    //     if (this.options.flyTo) {
    //       if (selected.bbox && selected.context && selected.context.length <= 3 ||
    //         selected.bbox && !selected.context) {
    //         this._map.fitBounds(selected.bbox);
    //       } else {
    //         this._map.flyTo({
    //           center: selected.center,
    //           zoom: this.options.zoom
    //         });
    //       }
    //     }

    //     this._input = selected;

    //     this.fire('result', { result: selected });
    //   }
    // });

    autocomplete<GeocodingFeature & { label: string }>({
      input: this._inputEl,
      async fetch(text, update, _trigger, _cursorPos) {
        update([])
        console.log({ text })
      },
      onSelect(item, input) {
        console.log({ item, input })
      },
    })
  }

  onAdd(map: Map) {
    this._map = map;
    return this._el;
  }

  async _geocode(input: string) {
    this._loadingEl.classList.add('active');

    this.fire('loading', undefined);

    const geocodingOptions = this.options as Record<string, string>

    var accessToken = 'pk.eyJ1IjoicGVkcmljIiwiYSI6ImNsZzE0bjk2ajB0NHEzanExZGFlbGpwazIifQ.l14rgv5vmu5wIMgOUUhUXw' // this.options.accessToken ? this.options.accessToken : mapboxgl.accessToken;

    const options = [`access_token=${accessToken}`]

    options.push(
      ...Object.keys(this.options)
        .filter((key) => !exclude.includes(key))
        .map((key) => `${key}=${geocodingOptions[key]}`)
    )

    const url = `${this.api}${encodeURIComponent(input.trim())}.json?${options.join('&')}`;

    this.controller.abort()
    this.controller = new AbortController()

    const data = await fetch(url, { signal: this.controller.signal })
      .then(async (response) => {
        if (response.ok) {
          const data: GeocodingOkResponse = await response.json()
          return data
        } else {
          const data: GeocodingErrorResponse = await response.json()
          this.fire('error', { error: data.message });
        }
      })
      .catch(error => {
        this._loadingEl.classList.remove('active');
        this.fire('error', { error: JSON.stringify(error) });
      })

    this._clearEl.classList[data?.features.length ? 'add' : 'remove']('active');

    this.fire('results', { results: data?.features ?? [] });

    return data?.features ?? []
  }

  async _queryFromInput(input: string) {
    const trimmedValue = input.trim();

    if (!trimmedValue) {
      this._clear();
    }

    if (trimmedValue.length > 2) {
      this._results = await this._geocode(trimmedValue)
    }
  }

  _change() {
    const changeEvent = new Event('HTMLEvents', { bubbles: true, cancelable: false })
    this._inputEl.dispatchEvent(changeEvent);
  }

  async _query(input?: Coordinates) {
    if (!input) return [];

    const geocodeInput = Array.isArray(input) ? input.map(utils.wrap).join() : input;

    const results = await this._geocode(geocodeInput)

    if (!results.length) return results;

    this._results = results;
    this._inputEl.value = results[0].place_name;
    this._change();

    return results
  }

  _setInput(input?: Coordinates) {
    if (!input) return;

    const newInputValue = Array.isArray(input)
      ? input.map(i => utils.roundWithOriginalPrecision(utils.wrap(i), i)).join()
      : input;

    // Set input value to passed value and clear everything else.
    this._inputEl.value = newInputValue;
    this._input = null;
    this._change();
  }

  _clear() {
    this._input = null;
    this._inputEl.value = '';

    this._change();

    this._inputEl.focus();
    this._clearEl.classList.remove('active');
    this.fire('clear', undefined);
  }

  getResult() {
    return this._input;
  }

  /**
   * Set & query the input
   */
  query(query: Coordinates) {
    this._query(query);
    return this;
  }

  /**
   * Set input
   * @param value An array of coordinates [lng, lat] or location name as a string.
   * Calling this function just sets the input and does not trigger an API request.
   */
  setInput(value: Coordinates) {
    this._setInput(value);
    return this;
  }

  /**
   * Subscribe to events that happen within the plugin.
   * @param type name of event. Available events and the data passed into their respective event objects are:
   *
   * @param listener function that's called when the event is emitted.
   */
  on<T extends keyof GeocoderEvents>(type: T, listener: GeocoderEventCallback<T>) {
    this._eventEmitter.on(type, listener);
    this._eventEmitter.on('error', (err) => console.log(err));
    return this;
  }

  /**
   * Fire an event
   * @param type The event name.
   * @param data The event data to pass to the function subscribed.
   */
  fire<T extends keyof GeocoderEvents>(type: T, data: GeocoderEvents[T]) {
    this._eventEmitter.emit(type, data);
    return this;
  }

  off<T extends keyof GeocoderEvents>(type: T, listener: GeocoderEventCallback<T>) {
    this._eventEmitter.removeListener(type, listener)
    return this
  }
};
