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

const directionsLayerName = 'directions'

const directionsSource: mapboxgl.GeoJSONSourceRaw = {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [],
  },
}

export const MapboxProfiles = [
  'mapbox/driving-traffic',
  'mapbox/driving',
  'mapbox/walking',
  'mapbox/cycling',
] as const

export type MapboxProfile = (typeof MapboxProfiles)[number]

export type MapboxDirectionsUnits = 'imperial' | 'metric'

export interface MapDirectionsControls {
  inputs?: boolean
  instructions?: boolean
  profileSwitcher?: boolean
  zoom?: number
  language?: string
  placeholderOrigin?: string
  placeholderDestination?: string
  flyTo?: boolean
  exclude?: string
  routePadding?: number | mapboxgl.PaddingOptions
}

export interface MapboxDirectionsOptions {
  styles?: mapboxgl.AnyLayer[]
  accessToken?: string
  api?: string
  interactive?: boolean
  profile?: MapboxProfile
  alternatives?: boolean
  congestion?: boolean
  unit?: MapboxDirectionsUnits
  compile?: Function
  geocoderQueryParameters?: Record<PropertyKey, PropertyKey>
  controls?: MapDirectionsControls
}

export interface MapboxDirectionsEvents {
  profile: { profile: MapboxProfile | undefined }
}

export class MapboxDirections extends EventEmitter<MapboxDirectionsEvents> {
  map: mapboxgl.Map

  store: DirectionsStore

  container: HTMLElement

  unsubscribe?: () => void

  originGeocoder: Geocoder

  destinationGeocoder: Geocoder

  instructions: Instructions

  timer?: number

  isDragging?: mapboxgl.MapboxGeoJSONFeature | boolean

  isCursorOverPoint?: mapboxgl.MapboxGeoJSONFeature | boolean

  constructor(public options: MapboxDirectionsOptions = {}) {
    super()

    this.map = Object.create(null)
    this.store = createDirectionsStore(options)
    this.container = document.createElement('div')
    this.container.className = 'mapboxgl-ctrl-directions mapboxgl-ctrl'

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

    const state = this.store.getState()
    const geocoderOptions = { ...state, ...state.controls, api: undefined }

    this.originGeocoder = new Geocoder(geocoderOptions)
    const originElement = this.originGeocoder.onAdd(map)
    const originContainer = geocoderContainer.querySelector('#mapbox-directions-origin-input')
    originContainer?.appendChild(originElement)

    this.originGeocoder.on('result', async (data) => {
      const { setOrigin, updateDirections } = this.store.getState()

      setOrigin(
        utils.createPoint(data.result.center, {
          id: 'origin',
          'marker-symbol': 'A',
        })
      )

      const { origin, destination } = this.store.getState()

      if (origin?.geometry.coordinates && destination?.geometry.coordinates) {
        await updateDirections()
      }
    })

    this.originGeocoder.on('clear', () => {
      this.store.getState().clearOrigin()
    })

    this.destinationGeocoder = new Geocoder(geocoderOptions)
    const destinationElement = this.destinationGeocoder.onAdd(map)
    const destinationContainer = geocoderContainer.querySelector(
      '#mapbox-directions-destination-input'
    )
    destinationContainer?.appendChild(destinationElement)

    this.destinationGeocoder.on('result', (data) => {
      const { setDestination, updateDirections } = this.store.getState()

      setDestination(
        utils.createPoint(data.result.center, {
          id: 'destination',
          'marker-symbol': 'B',
        })
      )

      const { origin, destination } = this.store.getState()

      if (origin?.geometry.coordinates && destination?.geometry.coordinates) {
        updateDirections()
      }
    })

    this.destinationGeocoder.on('clear', () => {
      this.store.getState().clearDestination()
    })

    if (state.controls?.inputs) {
      this.container.appendChild(geocoderContainer)
    }

    const directionsElement = document.createElement('div')
    directionsElement.className = 'directions-control directions-control-instructions'

    this.instructions = new Instructions(directionsElement, this.store)
    this.instructions.onAdd(map)

    if (state.controls?.instructions) {
      this.container.appendChild(directionsElement)
    }
  }

  onAdd(map: mapboxgl.Map) {
    this.map = map

    this.subscribe()

    if (this.map.loaded()) {
      this.loadMapLayers()
    } else {
      this.map.on('load', () => this.loadMapLayers())
    }

    return this.container
  }

  loadMapLayers() {
    const { styles, interactive, profile } = this.store.getState()

    // Emit any default or option set config
    this.fire('profile', { profile })

    // Add and set data theme layer/style
    this.map.addSource(directionsLayerName, directionsSource)

    styles?.forEach((style) => this.map.addLayer(style))

    if (interactive) {
      this.map.on('mousedown', this.onDragDown.bind(this))
      this.map.on('mousemove', this.move.bind(this))
      this.map.on('click', this.onClick.bind(this))

      this.map.on('touchstart', this.move.bind(this))
      this.map.on('touchstart', this.onDragDown.bind(this))
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

      const loadedDirectionsSource = this.map.getSource('directions')
      if (loadedDirectionsSource && loadedDirectionsSource.type === 'geojson') {
        loadedDirectionsSource.setData(geojson)
      }
    })
  }

  onClick(e: mapboxgl.MapMouseEvent) {
    const delay = 250

    if (this.timer == null) {
      this.timer = setTimeout(async () => {
        await this.onSingleClick(e)
        this.timer = undefined
      }, delay)
    } else {
      clearTimeout(this.timer)
      this.timer = undefined
      this.map.zoomIn()
    }
  }

  async onSingleClick(e: mapboxgl.MapMouseEvent) {
    const { origin, setOrigin, setRouteIndex, removeWaypoint, setDestination } =
      this.store.getState()

    if (!origin?.geometry) {
      setOrigin(
        utils.createPoint([e.lngLat.lng, e.lngLat.lat], {
          id: 'origin',
          'marker-symbol': 'A',
        })
      )
    } else {
      const features = this.map.queryRenderedFeatures(e.point, {
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
        setDestination(
          utils.createPoint([e.lngLat.lng, e.lngLat.lat], {
            id: 'destination',
            'marker-symbol': 'B',
          })
        )
        this.map.flyTo({ center: [e.lngLat.lng, e.lngLat.lat] })
      }
    }

    const newState = this.store.getState()

    if (newState.origin?.geometry && newState.destination?.geometry) {
      await newState.updateDirections()
    }
  }

  move(e: mapboxgl.MapMouseEvent) {
    const { hoverMarker, setHoverMarker } = this.store.getState()

    const features = this.map.queryRenderedFeatures(e.point, {
      layers: [
        'directions-route-line-alt',
        'directions-route-line',
        'directions-origin-point',
        'directions-destination-point',
        'directions-hover-point',
      ],
    })

    this.map.getCanvas().style.cursor = features.length ? 'pointer' : ''

    if (features.length) {
      this.isCursorOverPoint = features[0]
      this.map.dragPan.disable()

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
      this.map.dragPan.enable()
    }
  }

  onDragDown() {
    if (!this.isCursorOverPoint) return
    this.isDragging = this.isCursorOverPoint
    this.map.getCanvas().style.cursor = 'grab'

    this.map.on('mousemove', this.onDragMove.bind(this))
    this.map.on('mouseup', this.onDragUp.bind(this))

    this.map.on('touchmove', this.onDragMove.bind(this))
    this.map.on('touchend', this.onDragUp.bind(this))
  }

  onDragMove(event: mapboxgl.MapMouseEvent) {
    if (!(this.isDragging && typeof this.isDragging === 'object')) return

    const { setOrigin, setDestination, setHoverMarker } = this.store.getState()

    switch (this.isDragging?.layer?.id) {
      case 'directions-origin-point':
        setOrigin(utils.createPoint([event.lngLat.lng, event.lngLat.lat]))
        break
      case 'directions-destination-point':
        setDestination(utils.createPoint([event.lngLat.lng, event.lngLat.lat]))
        break
      case 'directions-hover-point':
        setHoverMarker([event.lngLat.lng, event.lngLat.lat])
        break
    }
  }

  onDragUp() {
    if (!(this.isDragging && typeof this.isDragging === 'object')) return

    const { origin, destination, setOrigin, setDestination, hoverMarker, addWaypoint } =
      this.store.getState()

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
          addWaypoint(0, hoverMarker)
        }
        break
    }

    this.isDragging = false
    this.map.getCanvas().style.cursor = ''

    this.map.off('touchmove', this.onDragMove.bind(this))
    this.map.off('touchend', this.onDragUp.bind(this))

    this.map.off('mousemove', this.onDragMove.bind(this))
    this.map.off('mouseup', this.onDragUp.bind(this))
  }

  //---------------------------------------------------------------------------------
  // API Methods
  //---------------------------------------------------------------------------------

  interactive(state: boolean) {
    if (state) {
      this.map.on('touchstart', this.move.bind(this))
      this.map.on('touchstart', this.onDragDown.bind(this))

      this.map.on('mousedown', this.onDragDown.bind(this))
      this.map.on('mousemove', this.move.bind(this))
      this.map.on('click', this.onClick.bind(this))
    } else {
      this.map.off('touchstart', this.move.bind(this))
      this.map.off('touchstart', this.onDragDown.bind(this))

      this.map.off('mousedown', this.onDragDown.bind(this))
      this.map.off('mousemove', this.move.bind(this))
      this.map.off('click', this.onClick.bind(this))
    }

    return this
  }

  onRemove(map: mapboxgl.Map) {
    const { styles, clearOrigin, clearDestination } = this.store.getState()

    this.container.parentNode?.removeChild(this.container)

    clearOrigin()
    clearDestination()

    map.off('mousedown', this.onDragDown.bind(this))
    map.off('mousemove', this.move.bind(this))
    map.off('touchstart', this.onDragDown.bind(this))
    map.off('touchstart', this.move.bind(this))
    map.off('click', this.onClick.bind(this))

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

    this.map = Object.create(null)

    this.originGeocoder.onRemove()
    this.destinationGeocoder.onRemove()
    this.instructions.onRemove()
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
