import 'autocompleter/autocomplete.css'

import fuzzy from 'fuzzy'
import mapboxgl from 'mapbox-gl'
import autocomplete from 'autocompleter'
import { EventEmitter } from '../state/EventEmitter.js'
import { wrap, roundWithOriginalPrecision } from '../utils/index.js'
import { fetchGeocoder, type GeocodingFeature } from '../api/geocoder.js'

export interface GeocoderOptions {
  api?: string
  accessToken?: string
  placeholder?: string
  flyTo?: boolean
  zoom?: number
  container?: HTMLElement | string
  position?: boolean
  queryParams?: Record<PropertyKey, PropertyKey>
}

interface GeocoderAutocompleteOption extends GeocodingFeature {
  label?: string
  html?: string
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
export class Geocoder extends EventEmitter<GeocoderEvents> {
  api: string

  _map: mapboxgl.Map

  _value: GeocodingFeature | null

  _results: GeocodingFeature[]

  _containerElement: HTMLDivElement

  _inputElement: HTMLInputElement

  _clearElement: HTMLButtonElement

  _loadingElement: HTMLSpanElement

  constructor(public options: GeocoderOptions = {}) {
    super()

    // Override the control being added to control containers
    if (options.container) options.position = false

    this._map = Object.create(null)

    this.api = options.api ?? 'https://api.mapbox.com/geocoding/v5/mapbox.places/'

    const icon = document.createElement('span')
    icon.className = 'geocoder-icon geocoder-icon-search'

    this._inputElement = document.createElement('input')
    this._inputElement.type = 'text'
    this._inputElement.placeholder = options.placeholder ?? 'Search'

    this._clearElement = document.createElement('button')
    this._clearElement.className = 'geocoder-icon geocoder-icon-close'
    this._clearElement.addEventListener('click', this._clear.bind(this))

    this._loadingElement = document.createElement('span')
    this._loadingElement.className = 'geocoder-icon geocoder-icon-loading'

    const actions = document.createElement('div')
    actions.classList.add('geocoder-pin-right')
    actions.appendChild(this._clearElement)
    actions.appendChild(this._loadingElement)

    this._containerElement = document.createElement('div')
    this._containerElement.className = 'mapboxgl-ctrl-geocoder'
    this._containerElement.appendChild(icon)
    this._containerElement.appendChild(this._inputElement)
    this._containerElement.appendChild(actions)

    this._results = []
    this._value = null

    const autocompleteOption = document.createElement('div')
    autocompleteOption.style.padding = '8px'
    autocompleteOption.style.fontSize = '12px'
    autocompleteOption.style.fontWeight = '400'
    autocompleteOption.style.cursor = 'pointer'
    autocompleteOption.style.overflow = 'hidden'
    autocompleteOption.style.whiteSpace = 'nowrap'
    autocompleteOption.style.textOverflow = 'ellipsis'
    autocompleteOption.style.fontFamily = 'Helvetica Neue, Arial, Helvetica, sans-serif'

    autocomplete.default<GeocoderAutocompleteOption>({
      input: this._inputElement,
      fetch: async (text, update, _trigger, _cursorPos) => {
        const results = await this._queryFromInput(text)

        const filteredResults = fuzzy
          .filter(text, results ?? [], {
            pre: '<strong style="font-weight: 700">',
            post: '</strong>',
            extract: (item) => item.place_name,
          })
          .map((result) => {
            ;(result.original as GeocoderAutocompleteOption).html = result.string
            return result.original
          })

        update(filteredResults.length ? filteredResults : false)
      },
      onSelect: (item, _input) => {
        this._value = item
        this._inputElement.value = item.place_name

        if (options.flyTo) {
          if (
            (item.bbox && item.context && item.context.length <= 3) ||
            (item.bbox && !item.context)
          ) {
            this._map.fitBounds(item.bbox)
          } else {
            this._map.flyTo({ center: item.center, zoom: this.options.zoom })
          }
        }

        this.fire('result', { result: item })
      },
      render: (item, _currentValue, _index) => {
        const renderedOption = autocompleteOption.cloneNode(true) as HTMLDivElement
        renderedOption.innerHTML = item.html ?? item.place_name
        return renderedOption
      },
    })
  }

  onAdd(map: mapboxgl.Map) {
    this._map = map
    return this._containerElement
  }

  async _geocode(input: string) {
    this._loadingElement.classList.add('active')

    this.fire('loading', undefined)

    this.options.queryParams ??= {}
    this.options.queryParams.access_token = this.options.accessToken ?? mapboxgl.accessToken

    const data = await fetchGeocoder(this.api, input, this.options.queryParams)

    this._loadingElement.classList.remove('active')

    if ('features' in data) {
      this._clearElement.classList[data.features.length ? 'add' : 'remove']('active')
      this.fire('results', { results: data.features ?? [] })
      return data?.features ?? []
    } else {
      this._clearElement.classList.remove('active')
      this.fire('error', { error: data.message })
      return []
    }
  }

  async _queryFromInput(input: string) {
    const trimmedValue = input.trim()

    if (!trimmedValue) {
      this._clear()
    }

    if (trimmedValue.length > 2) {
      return (this._results = await this._geocode(trimmedValue))
    }
  }

  _change() {
    const changeEvent = new Event('HTMLEvents', { bubbles: true, cancelable: false })
    this._inputElement.dispatchEvent(changeEvent)
  }

  async _query(input?: mapboxgl.LngLatLike) {
    if (!input) return []

    const geocodeInput = Array.isArray(input) ? input.map(wrap).join() : input

    const results = await this._geocode(geocodeInput.toString())

    if (!results.length) return results

    this._results = results
    this._inputElement.value = results[0].place_name
    this._change()

    return results
  }

  _setInput(input?: mapboxgl.LngLatLike) {
    if (!input) return

    const newInputValue = Array.isArray(input)
      ? input.map((i) => roundWithOriginalPrecision(wrap(i), i)).join()
      : input

    // Set input value to passed value and clear everything else.
    this._inputElement.value = newInputValue.toString()
    this._value = null
    this._change()
  }

  _clear() {
    this._value = null
    this._inputElement.value = ''

    this._change()

    this._inputElement.focus()
    this._clearElement.classList.remove('active')

    this.fire('clear', undefined)
  }

  getResult() {
    return this._value
  }

  query(query: mapboxgl.LngLatLike) {
    this._query(query)
    return this
  }

  setInput(value: mapboxgl.LngLatLike) {
    this._setInput(value)
    return this
  }
}
