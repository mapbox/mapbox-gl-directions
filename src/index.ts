import 'mapbox-gl/dist/mapbox-gl.css'
import './mapbox-gl-directions.css'

import mapboxgl from 'mapbox-gl'
import { decode } from '@mapbox/polyline'
import * as utils from './utils/index.js'
import { Geocoder } from './controls/geocoder.js'
import { Instructions } from './controls/instructions.js'
import { createInputsTemplate } from './templates/input.js'
import { createDirectionsStore, type DirectionsStore } from './state/store.js'

export const MapboxProfiles = [
  'mapbox/driving-traffic',
  'mapbox/driving',
  'mapbox/walking',
  'mapbox/cycling',
] as const

export type MapboxProfile = (typeof MapboxProfiles)[number]

export type MapboxDirectionsUnits = 'imperial' | 'metric'

export interface MapDirectionsControls {
  /**
   * @param Hide or display the inputs control.
   * @default true
   */
  inputs?: boolean

  /**
   * Hide or display the instructions control.
   * @default true
   */
  instructions?: boolean

  /**
   * Hide or display the default profile switch with options for traffic, driving, walking and cycling.
   * @default true
   */
  profileSwitcher?: boolean

  /**
   * If no bbox exists from the geocoder result, the zoom you set here will be used in the flyTo.
   * @default 16
   */
  zoom?: number

  /**
   * The language of returned turn-by-turn text instructions. See supported languages : https://docs.mapbox.com/api/navigation/#instructions-languages
   * @default 'en'
   */
  language?: string

  /**
   * @param If set, this text will appear as the placeholder attribute for the origin input element.
   * @default 'Choose a starting place'
   */
  placeholderOrigin?: string

  /**
   * @param If set, this text will appear as the placeholder attribute for the destination input element.
   * @default 'Choose destination'
   */
  placeholderDestination?: string

  /**
   * @param If false, animating the map to a selected result is disabled.
   * @default true
   */
  flyTo?: boolean

  /**
   * @param Exclude certain road types from routing. The default is to not exclude anything.
   * Search for `exclude` in `optional parameters`: https://docs.mapbox.com/api/navigation/#retrieve-directions
   * @default null
   */
  exclude?: string

  /**
   * @param Specify padding surrounding route. A single number of pixels or a [PaddingOptions](https://docs.mapbox.com/mapbox-gl-js/api/#paddingoptions) object.
   * @default 80
   */
  routePadding?: number | mapboxgl.PaddingOptions
}

export interface MapboxDirectionsOptions {
  /**
   * Override default layer properties of the [directions source](https://github.com/mapbox/mapbox-gl-directions/blob/master/src/directions_style.js).
   * Documentation for each property are specified in the [Mapbox GL Style Reference](https://www.mapbox.com/mapbox-gl-style-spec/).
   */
  styles?: mapboxgl.AnyLayer[]

  /**
   * Required unless `mapboxgl.accessToken` is set globally.
   * @default null
   */
  accessToken?: string

  /**
   * Override default routing endpoint url.
   * @default 'https://api.mapbox.com/directions/v5/'
   */
  api?: string

  /**
   * Enable/Disable mouse or touch interactivity from the plugin.
   * @default true
   */
  interactive?: boolean

  /**
   * Routing profile to use.
   * @default 'mapbox/driving-traffic'
   */
  profile?: MapboxProfile

  /**
   * Whether to enable alternatives.
   * @default false
   */
  alternatives?: boolean

  /**
   * Whether to enable congestion along the route line.
   * @default false
   */
  congestion?: boolean

  /**
   * Measurement system to be used in navigation instructions.
   * @default 'imperial'
   */
  unit?: MapboxDirectionsUnits

  /**
   * Provide a custom function for generating instruction, compatible with osrm-text-instructions.
   * @default null
   */
  compile?: Function

  /**
   * Accepts an object containing the query parameters as [documented here](https://www.mapbox.com/api-documentation/#search-for-places).
   */
  geocoderQueryParameters?: Record<PropertyKey, PropertyKey>

  /**
   * Control the rendering.
   */
  controls?: MapDirectionsControls
}

const directionsLayerName = 'directions'

const directionsSource: mapboxgl.AnySourceData = {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [],
  },
}

/**
 * @example
 * const MapboxDirections = require('../src/index.js');
 *
 * const directions = new MapboxDirections({
 *   accessToken: 'YOUR-MAPBOX-ACCESS-TOKEN',
 *   unit: 'metric',
 *   profile: 'mapbox/cycling'
 * });
 *
 * // add to your mapboxgl map
 * map.addControl(directions);
 */
export class MapboxDirections {
  container: HTMLElement

  _map: mapboxgl.Map

  timer: number | undefined

  store: DirectionsStore

  unsubscribe: () => void

  constructor(public options: MapboxDirectionsOptions = {}) {
    this.container = document.createElement('div')
    this.container.className = 'mapboxgl-ctrl-directions mapboxgl-ctrl'
    this._map = Object.create(null)
    this.store = createDirectionsStore(options)
    this.unsubscribe = () => {
      console.log('NOOP unsubscribe')
    }
  }

  onAdd(map: mapboxgl.Map) {
    const state = this.store.getState()

    this._map = map

    const geocoderContainer = document.createElement('div')
    geocoderContainer.className = 'directions-control directions-control-inputs'
    geocoderContainer.innerHTML = createInputsTemplate({
      profile: 'mapbox/driving',
      controls: {
        profileSwitcher: true,
      },
    })

    // Driving / Walking / Cycling profiles
    geocoderContainer
      .querySelectorAll<HTMLInputElement>('input[type="radio"]')
      .forEach((element) => {
        element.addEventListener('change', () => {
          const { origin, destination, setProfile, updateDirections } = this.store.getState()

          setProfile(element.value as MapboxProfile)

          if (origin?.geometry.coordinates && destination?.geometry.coordinates) {
            updateDirections()
          }
        })
      })

    // Reversing Origin / Destination
    geocoderContainer.querySelector('.js-reverse-inputs')?.addEventListener('click', () => {
      const { reverse, origin, destination, updateDirections } = this.store.getState()

      reverse()

      if (origin?.geometry.coordinates && destination?.geometry.coordinates) {
        updateDirections()
      }
    })

    const geocoderOptions = { ...state, ...state.controls, api: undefined }

    const originGeocoder = new Geocoder(geocoderOptions)
    const originElement = originGeocoder.onAdd(map)
    const originContainer = geocoderContainer.querySelector('#mapbox-directions-origin-input')
    originContainer?.appendChild(originElement)

    originGeocoder.on('result', async (data) => {
      const { setOrigin, updateDirections } = this.store.getState()

      setOrigin(utils.createPoint(data.result.center))

      const { origin, destination } = this.store.getState()

      if (origin?.geometry.coordinates && destination?.geometry.coordinates) {
        updateDirections()
      }
    })

    originGeocoder.on('clear', () => {
      this.store.getState().clearOrigin()
    })

    const destinationGeocoder = new Geocoder(geocoderOptions)
    const destinationElement = destinationGeocoder.onAdd(map)
    const destinationContainer = geocoderContainer.querySelector(
      '#mapbox-directions-destination-input'
    )
    destinationContainer?.appendChild(destinationElement)

    destinationGeocoder.on('result', (data) => {
      const { setDestination, updateDirections } = this.store.getState()

      setDestination(utils.createPoint(data.result.center))

      const { origin, destination } = this.store.getState()

      if (origin?.geometry.coordinates && destination?.geometry.coordinates) {
        updateDirections()
      }
    })

    destinationGeocoder.on('clear', () => {
      this.store.getState().clearDestination()
    })

    if (state.controls?.inputs || true) {
      this.container.appendChild(geocoderContainer)
    }

    const directionsElement = document.createElement('div')
    directionsElement.className = 'directions-control directions-control-instructions'

    const instructions = new Instructions(directionsElement, this.store)
    instructions.onAdd(map)
    instructions.render()

    if (state.controls?.instructions || true) {
      this.container.appendChild(directionsElement)
    }

    this.unsubscribe = this.subscribe()

    if (this._map.loaded()) {
      this.loadMapLayers()
    } else {
      this._map.on('load', () => this.loadMapLayers());
    }

    return this.container
  }

  loadMapLayers() {
    const { styles, interactive } = this.store.getState()

    // Emit any default or option set config
    // this.actions.eventEmit('profile', { profile });

    // Add and set data theme layer/style
    this._map.addSource(directionsLayerName, directionsSource)

    styles?.forEach((style) => this._map.addLayer(style))

    const noop = () => {
      console.log('TODO')
    }

    if (interactive) {
      this._map.on('mousedown', noop) // this.onDragDown);
      this._map.on('mousemove', noop) // this.move);
      this._map.on('click', noop) // this.onClick);

      this._map.on('touchstart', noop) // this.move);
      this._map.on('touchstart', noop) // this.onDragDown);
    }
  }

  subscribe() {
    return this.store.subscribe((state) => {
      const { origin, destination, hoverMarker, directions, routeIndex } = state

      const features = directions.flatMap((feature, index) =>
        decode(feature.geometry, 5)
          .map((coordinates) => coordinates.reverse())
          .reduce((features, coordinates, i) => {
            const previous = features[features.length - 1]

            const congestion =
              feature.legs[0].annotation &&
              feature.legs[0].annotation.congestion &&
              feature.legs[0].annotation.congestion[i - 1]

            if (previous && (!congestion || previous.properties?.congestion === congestion)) {
              previous.geometry.coordinates.push(coordinates)
              return features
            }

            const segment: GeoJSON.Feature<GeoJSON.LineString> = {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [],
              },
              properties: {
                'route-index': index,
                route: index === routeIndex ? 'selected' : 'alternate',
              },
            }

            // New segment starts with previous segment's last coordinate.
            if (previous) {
              segment.geometry.coordinates.push(
                previous.geometry.coordinates[previous.geometry.coordinates.length - 1]
              )
            }

            segment.geometry.coordinates.push(coordinates)

            if (congestion && segment.properties?.congestion) {
              segment.properties.congestion = feature.legs[0].annotation.congestion[i - 1]
            }

            features.push(segment)

            if (index === routeIndex) {
              // Collect any possible waypoints from steps
              features.push(
                ...feature.legs[0].steps
                  .filter((d) => d.maneuver.type === 'waypoint')
                  .flatMap((d) => {
                    const waypointFeature: GeoJSON.Feature<GeoJSON.LineString> = {
                      type: 'Feature',
                      geometry: {
                        type: 'LineString',
                        coordinates: [d.maneuver.location],
                      },
                      properties: {
                        id: 'waypoint'
                      }
                    }
                    return waypointFeature
                  })
              )
            }

            return features
          }, [] as GeoJSON.Feature<GeoJSON.LineString>[])
      )

      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features
      }

      if (origin?.geometry) geojson.features.push(origin)
      if (destination?.geometry) geojson.features.push(destination)
      if (hoverMarker?.geometry) geojson.features.push(hoverMarker)

      const loadedDirectionsSource = this._map.getSource('directions')
      console.log('loadedDirectionsSource', loadedDirectionsSource)
      if (loadedDirectionsSource && loadedDirectionsSource.type === 'geojson') {
        loadedDirectionsSource.setData(geojson)
      }
    })
  }

  onRemove(map: mapboxgl.Map) {
    const { styles, clearOrigin, clearDestination } = this.store.getState()

    this.container.parentNode?.removeChild(this.container)

    clearOrigin()
    clearDestination()

    // map.off('mousedown', this.onDragDown);
    // map.off('mousemove', this.move);
    // map.off('touchstart', this.onDragDown);
    // map.off('touchstart', this.move);
    // map.off('click', this.onClick);

    this.unsubscribe()
    this.unsubscribe = () => {
      console.log('NOOP unsubscribe')
    }

    styles?.forEach((layer) => {
      if (map.getLayer(layer.id)) {
        map.removeLayer(layer.id)
      }
    })

    if (map.getSource('directions')) {
      map.removeSource('directions')
    }

    this._map = Object.create(null)
  }
}

const accessToken =
  'pk.eyJ1IjoicGVkcmljIiwiYSI6ImNsZzE0bjk2ajB0NHEzanExZGFlbGpwazIifQ.l14rgv5vmu5wIMgOUUhUXw'
const container = document.createElement('div')
container.style.height = '100vh'
container.style.width = '100vw'
document.body.appendChild(container)

const map = new mapboxgl.Map({
  container,
  accessToken,
  style: 'mapbox://styles/mapbox/streets-v9',
  center: [-117.842717, 33.6459],
  zoom: 16,
})

const directions = new MapboxDirections({ accessToken })
map.addControl(directions)
