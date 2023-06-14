import 'autocompleter/autocomplete.css'

import fuzzy from 'fuzzy'
import type { Map } from 'mapbox-gl';
import autocomplete from 'autocompleter'
import { EventEmitter } from '../events';
import utils, { Coordinates } from '../utils';
import type {
  GeocodingOkResponse,
  GeocodingErrorResponse,
  GeocodingFeature
} from './geocoder.types';

const exclude = ['placeholder', 'zoom', 'flyTo', 'accessToken', 'api'];

interface GeocoderAutocompleteOption extends GeocodingFeature {
  label?: string
  html?: string
}

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

/**
 * Geocoder - this slightly mimicks the mapboxl-gl-geocoder but isn't an exact replica.
 * Once gl-js plugins can be added to custom divs,
 * we should be able to require mapbox-gl-geocoder instead of including it here.
 */
export default class Geocoder extends EventEmitter<GeocoderEvents> {
  api: string

  _map: Map

  _value: GeocodingFeature | null

  _results: GeocodingFeature[]

  _containerElement: HTMLDivElement

  _inputElement: HTMLInputElement

  _clearElement: HTMLButtonElement

  _loadingElement: HTMLSpanElement

  constructor(public options: GeocoderOptions = {}) {
    super()

    // Override the control being added to control containers
    if (options.container) options.position = false;

    this._map = Object.create(null);

    this.api = options.api ?? 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

    const icon = document.createElement('span');
    icon.className = 'geocoder-icon geocoder-icon-search';

    this._inputElement = document.createElement('input');
    this._inputElement.type = 'text';
    this._inputElement.placeholder = options.placeholder ?? 'Search';

    this._clearElement = document.createElement('button');
    this._clearElement.className = 'geocoder-icon geocoder-icon-close';
    this._clearElement.addEventListener('click', this._clear.bind(this));

    this._loadingElement = document.createElement('span');
    this._loadingElement.className = 'geocoder-icon geocoder-icon-loading';

    const actions = document.createElement('div');
    actions.classList.add('geocoder-pin-right');
    actions.appendChild(this._clearElement);
    actions.appendChild(this._loadingElement);

    this._containerElement = document.createElement('div');
    this._containerElement.className = 'mapboxgl-ctrl-geocoder';

    this._containerElement.appendChild(icon);
    this._containerElement.appendChild(this._inputElement);
    this._containerElement.appendChild(actions);

    this._results = [];
    this._value = null

    const autocompleteOption = document.createElement('div');
    autocompleteOption.style.overflow = 'hidden';
    autocompleteOption.style.textOverflow = 'ellipsis';
    autocompleteOption.style.whiteSpace = 'nowrap';
    autocompleteOption.style.fontFamily = 'Helvetica Neue, Arial, Helvetica, sans-serif'
    autocompleteOption.style.fontSize = '12px'
    autocompleteOption.style.padding = '5px 10px'
    autocompleteOption.style.cursor = 'pointer'
    autocompleteOption.style.fontWeight = '400'

    autocomplete<GeocoderAutocompleteOption>({
      input: this._inputElement,
      fetch: async (text, update, _trigger, _cursorPos) => {
        const results = await this._queryFromInput(text);

        const filteredResults = fuzzy.filter(text, results ?? [], {
          pre: '<strong style="font-weight: 700">',
          post: '</strong>',
          extract: (item) => item.place_name
        }).map(result => {
          (result.original as GeocoderAutocompleteOption).html = result.string
          return result.original
        })

        update(filteredResults.length ? filteredResults : false)
      },
      onSelect: (item, _input) => {
        this._value = item;
        this._inputElement.value = item.place_name

        if (!this.options.flyTo) return

        if (item.bbox && item.context && item.context.length <= 3 || item.bbox && !item.context) {
          this._map.fitBounds(item.bbox);
        } else {
          this._map.flyTo({ center: item.center, zoom: this.options.zoom ?? 16 });
        }
      },
      render: (item, currentValue, index) => {
        const renderedOption = autocompleteOption.cloneNode(true) as HTMLDivElement
        renderedOption.innerHTML = item.html ?? item.place_name
        return renderedOption
      },
    })
  }

  onAdd(map: Map) {
    this._map = map;
    return this._containerElement;
  }

  async _geocode(input: string) {
    this._loadingElement.classList.add('active');

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

    const data = await fetch(url)
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
        console.log({ error })
        this._loadingElement.classList.remove('active');
        this.fire('error', { error: JSON.stringify(error) });
      })

    this._loadingElement.classList.remove('active');
    this._clearElement.classList[data?.features.length ? 'add' : 'remove']('active');

    this.fire('results', { results: data?.features ?? [] });

    return data?.features ?? []
  }

  async _queryFromInput(input: string) {
    const trimmedValue = input.trim();

    if (!trimmedValue) {
      this._clear();
    }

    if (trimmedValue.length > 2) {
      return this._results = await this._geocode(trimmedValue)
    }
  }

  _change() {
    const changeEvent = new Event('HTMLEvents', { bubbles: true, cancelable: false })
    this._inputElement.dispatchEvent(changeEvent);
  }

  async _query(input?: Coordinates) {
    if (!input) return [];

    const geocodeInput = Array.isArray(input) ? input.map(utils.wrap).join() : input;

    const results = await this._geocode(geocodeInput)

    if (!results.length) return results;

    this._results = results;
    this._inputElement.value = results[0].place_name;
    this._change();

    return results
  }

  _setInput(input?: Coordinates) {
    if (!input) return;

    const newInputValue = Array.isArray(input)
      ? input.map(i => utils.roundWithOriginalPrecision(utils.wrap(i), i)).join()
      : input;

    // Set input value to passed value and clear everything else.
    this._inputElement.value = newInputValue;
    this._value = null;
    this._change();
  }

  _clear() {
    this._value = null;
    this._inputElement.value = '';

    this._change();

    this._inputElement.focus();
    this._clearElement.classList.remove('active');
    this.fire('clear', undefined);
  }

  getResult() {
    return this._value;
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
};
