import 'mapbox-gl/dist/mapbox-gl.css'
import './mapbox-gl-directions.css'

import mapboxgl from 'mapbox-gl'
import { decode } from '@mapbox/polyline'
import * as utils from './utils/index.js'
import { Geocoder } from './controls/geocoder.js'
import { EventEmitter } from './state/EventEmitter.js'
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

export interface MapboxDirectionsEvents {
  profile: { profile: MapboxProfile | undefined }
}

/**
 * @example
 * ```ts
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
 * ```
 */
export class MapboxDirections extends EventEmitter<MapboxDirectionsEvents> {
  container: HTMLElement

  _map: mapboxgl.Map

  timer: number | undefined

  isCursorOverPoint: mapboxgl.MapboxGeoJSONFeature | null | boolean

  isDragging: mapboxgl.MapboxGeoJSONFeature | null | boolean

  store: DirectionsStore

  unsubscribe?: () => void

  constructor(public options: MapboxDirectionsOptions = {}) {
    super()

    this._map = Object.create(null)
    this.isCursorOverPoint = null
    this.isDragging = null
    this.store = createDirectionsStore(options)
    this.container = document.createElement('div')
    this.container.className = 'mapboxgl-ctrl-directions mapboxgl-ctrl'

    const state = this.store.getState()

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

    if (state.controls?.inputs) {
      this.container.appendChild(geocoderContainer)
    }

    const directionsElement = document.createElement('div')
    directionsElement.className = 'directions-control directions-control-instructions'

    const instructions = new Instructions(directionsElement, this.store)
    instructions.onAdd(map)

    if (state.controls?.instructions) {
      this.container.appendChild(directionsElement)
    }

  }

  onAdd(map: mapboxgl.Map) {
    this._map = map

    this.subscribe()

    if (this._map.loaded()) {
      this.loadMapLayers()
    } else {
      this._map.on('load', () => this.loadMapLayers())
    }

    return this.container
  }

  loadMapLayers() {
    const { styles, interactive, profile } = this.store.getState()

    // Emit any default or option set config
    this.fire('profile', { profile })

    // Add and set data theme layer/style
    this._map.addSource(directionsLayerName, directionsSource)

    styles?.forEach((style) => this._map.addLayer(style))

    if (interactive) {
      this._map.on('mousedown', this.onDragDown.bind(this));
      this._map.on('mousemove', this.move.bind(this));
      this._map.on('click', this.onClick.bind(this));

      this._map.on('touchstart', this.move.bind(this));
      this._map.on('touchstart', this.onDragDown.bind(this));
    }
  }

  subscribe() {
    this.unsubscribe = this.store.subscribe((state) => {
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
                        id: 'waypoint',
                      },
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
        features,
      }

      if (origin?.geometry) geojson.features.push(origin)
      if (destination?.geometry) geojson.features.push(destination)
      if (hoverMarker?.geometry) geojson.features.push(hoverMarker)

      const loadedDirectionsSource = this._map.getSource('directions')
      if (loadedDirectionsSource && loadedDirectionsSource.type === 'geojson') {
        loadedDirectionsSource.setData(geojson)
      }
    })
  }

  onClick(e: mapboxgl.MapMouseEvent) {
    const delay = 250

    if (this.timer == null) {
      this.timer = setTimeout(() => {
        this.onSingleClick(e);
        this.timer = undefined;
      }, delay);
    } else {
      clearTimeout(this.timer);
      this.timer = undefined;
      this._map.zoomIn();
    }
  }

  onSingleClick(e: mapboxgl.MapMouseEvent) {
    const {
      origin,
      setOrigin,
      setRouteIndex,
      removeWaypoint,
      setDestination,
    } = this.store.getState()

    if (!origin?.geometry) {
      setOrigin(utils.createPoint([e.lngLat.lng, e.lngLat.lat]))
    } else {
      const features = this._map.queryRenderedFeatures(e.point, {
        layers: [
          'directions-origin-point',
          'directions-destination-point',
          'directions-waypoint-point',
          'directions-route-line-alt',
        ],
      })

      if (features.length) {
        // Remove any waypoints
        features.forEach((feature) => {
          if (feature.layer.id === 'directions-waypoint-point') {
            removeWaypoint(feature)
          }
        })

        if (features[0].properties?.route === 'alternate') {
          const index = features[0].properties['route-index']
          setRouteIndex(index)
        }
      } else {
        setDestination(utils.createPoint([e.lngLat.lng, e.lngLat.lat]))
        this._map.flyTo({ center: [e.lngLat.lng, e.lngLat.lat] })
      }
    }
  }

  move(e: mapboxgl.MapMouseEvent) {
    const { hoverMarker, setHoverMarker } = this.store.getState()

    const features = this._map.queryRenderedFeatures(e.point, {
      layers: [
        'directions-route-line-alt',
        'directions-route-line',
        'directions-origin-point',
        'directions-destination-point',
        'directions-hover-point',
      ],
    })

    this._map.getCanvas().style.cursor = features.length ? 'pointer' : ''

    if (features.length) {
      this.isCursorOverPoint = features[0]
      this._map.dragPan.disable()

      // Add a possible waypoint marker when hovering over the active route line
      features.forEach((feature) => {
        if (feature.layer.id === 'directions-route-line') {
          setHoverMarker([e.lngLat.lng, e.lngLat.lat])
        } else if (hoverMarker?.geometry) {
          setHoverMarker(null)
        }
      })
    } else if (this.isCursorOverPoint) {
      this.isCursorOverPoint = false
      this._map.dragPan.enable()
    }
  }

  onDragDown() {
    if (!this.isCursorOverPoint) return;
    this.isDragging = this.isCursorOverPoint;
    this._map.getCanvas().style.cursor = 'grab'

    this._map.on('mousemove', this.onDragMove.bind(this))
    this._map.on('mouseup', this.onDragUp.bind(this))

    this._map.on('touchmove', this.onDragMove.bind(this))
    this._map.on('touchend', this.onDragUp.bind(this))
  }

  onDragMove(event: mapboxgl.MapMouseEvent) {
    if (!(this.isDragging && typeof this.isDragging === 'object')) return;

    const { setOrigin, setDestination, setHoverMarker } = this.store.getState()

    switch (this.isDragging?.layer?.id) {
      case 'directions-origin-point':
        setOrigin(utils.createPoint([event.lngLat.lng, event.lngLat.lat]))
        break
      case 'directions-destination-point':
        setDestination(utils.createPoint([event.lngLat.lng, event.lngLat.lat]))
        break
      case 'directions-hover-point':
        setHoverMarker([event.lngLat.lng, event.lngLat.lat]);
        break
    }
  }

  onDragUp() {
    if (!(this.isDragging && typeof this.isDragging === 'object')) return;

    const {
      origin,
      destination,
      setOrigin,
      setDestination,
      hoverMarker,
      addWaypoint,
    } = this.store.getState()

    switch (this.isDragging.layer.id) {
      case 'directions-origin-point':
        if (origin) {
          setOrigin(
            utils.createPoint([origin.geometry.coordinates[0], origin.geometry.coordinates[1]])
          )
        }
        break
      case 'directions-destination-point':
        if (destination) {
          setDestination(
            utils.createPoint([
              destination.geometry.coordinates[0],
              destination.geometry.coordinates[1],
            ])
          )
        }
        break
      case 'directions-hover-point':
        // Add waypoint if a sufficent amount of dragging has occurred.
        if (hoverMarker?.geometry && !utils.coordinateMatch(this.isDragging, hoverMarker)) {
          addWaypoint(0, hoverMarker);
        }
        break
    }

    this.isDragging = false;
    this._map.getCanvas().style.cursor = ''

    this._map.off('touchmove', this.onDragMove.bind(this))
    this._map.off('touchend', this.onDragUp.bind(this))

    this._map.off('mousemove', this.onDragMove.bind(this))
    this._map.off('mouseup', this.onDragUp.bind(this))
  }

  //---------------------------------------------------------------------------------
  // API Methods
  //---------------------------------------------------------------------------------

  /**
   * Turn on or off interactivity
   */
  interactive(state: boolean) {
    if (state) {
      this._map.on('touchstart', this.move.bind(this))
      this._map.on('touchstart', this.onDragDown.bind(this))

      this._map.on('mousedown', this.onDragDown.bind(this))
      this._map.on('mousemove', this.move.bind(this))
      this._map.on('click', this.onClick.bind(this))
    } else {
      this._map.off('touchstart', this.move.bind(this))
      this._map.off('touchstart', this.onDragDown.bind(this))

      this._map.off('mousedown', this.onDragDown.bind(this))
      this._map.off('mousemove', this.move.bind(this))
      this._map.off('click', this.onClick.bind(this))
    }

    return this
  }

  onRemove(map: mapboxgl.Map) {
    const { styles, clearOrigin, clearDestination } = this.store.getState()

    this.container.parentNode?.removeChild(this.container)

    clearOrigin()
    clearDestination()

    map.off('mousedown', this.onDragDown.bind(this));
    map.off('mousemove', this.move.bind(this));
    map.off('touchstart', this.onDragDown.bind(this));
    map.off('touchstart', this.move.bind(this));
    map.off('click', this.onClick.bind(this));

    this.unsubscribe?.()
    this.unsubscribe = undefined

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
