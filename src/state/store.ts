import { defu } from 'defu'
import mapboxgl from 'mapbox-gl'
import { createStore } from 'zustand/vanilla'
import type { Point } from '../utils/index.js'
import type { Route } from '../api/directions.js'
import type { GeocodingFeature } from '../api/geocoder.js'
import type { MapboxDirectionsOptions } from '../index.js'

export interface MapboxDirectionsState extends MapboxDirectionsOptions {
  // Container for client registered events
  events: {}

  // Marker feature drawn on the map at any point.
  origin: Point | null
  destination: Point | null
  hoverMarker: mapboxgl.LngLatLike | null
  waypoints: GeocodingFeature[]

  // User input strings or result returned from geocoder
  originQuery: string
  destinationQuery: string
  originQueryCoordinates: mapboxgl.LngLatLike | null
  destinationQueryCoordinates: mapboxgl.LngLatLike | null

  // Directions data
  directions: Route[]
  routeIndex: number
  routePadding: number
}

export const defaultOptions = {
  // Options set on initialization
  api: 'https://api.mapbox.com/directions/v5/',
  profile: 'mapbox/driving-traffic',
  alternatives: false,
  congestion: false,
  unit: 'imperial',
  styles: [
    {
      id: 'directions-route-line-alt',
      type: 'line',
      source: 'directions',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#bbb',
        'line-width': 4,
      },
      filter: ['all', ['in', '$type', 'LineString'], ['in', 'route', 'alternate']],
    },
    {
      id: 'directions-route-line-casing',
      type: 'line',
      source: 'directions',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#2d5f99',
        'line-width': 12,
      },
      filter: ['all', ['in', '$type', 'LineString'], ['in', 'route', 'selected']],
    },
    {
      id: 'directions-route-line',
      type: 'line',
      source: 'directions',
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
      },
      paint: {
        'line-color': {
          property: 'congestion',
          type: 'categorical',
          default: '#4882c5',
          stops: [
            ['unknown', '#4882c5'],
            ['low', '#4882c5'],
            ['moderate', '#f09a46'],
            ['heavy', '#e34341'],
            ['severe', '#8b2342'],
          ],
        },
        'line-width': 7,
      },
      filter: ['all', ['in', '$type', 'LineString'], ['in', 'route', 'selected']],
    },
    {
      id: 'directions-hover-point-casing',
      type: 'circle',
      source: 'directions',
      paint: {
        'circle-radius': 8,
        'circle-color': '#fff',
      },
      filter: ['all', ['in', '$type', 'Point'], ['in', 'id', 'hover']],
    },
    {
      id: 'directions-hover-point',
      type: 'circle',
      source: 'directions',
      paint: {
        'circle-radius': 6,
        'circle-color': '#3bb2d0',
      },
      filter: ['all', ['in', '$type', 'Point'], ['in', 'id', 'hover']],
    },
    {
      id: 'directions-waypoint-point-casing',
      type: 'circle',
      source: 'directions',
      paint: {
        'circle-radius': 8,
        'circle-color': '#fff',
      },
      filter: ['all', ['in', '$type', 'Point'], ['in', 'id', 'waypoint']],
    },
    {
      id: 'directions-waypoint-point',
      type: 'circle',
      source: 'directions',
      paint: {
        'circle-radius': 6,
        'circle-color': '#8a8bc9',
      },
      filter: ['all', ['in', '$type', 'Point'], ['in', 'id', 'waypoint']],
    },
    {
      id: 'directions-origin-point',
      type: 'circle',
      source: 'directions',
      paint: {
        'circle-radius': 18,
        'circle-color': '#3bb2d0',
      },
      filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'A']],
    },
    {
      id: 'directions-origin-label',
      type: 'symbol',
      source: 'directions',
      layout: {
        'text-field': 'A',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: {
        'text-color': '#fff',
      },
      filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'A']],
    },
    {
      id: 'directions-destination-point',
      type: 'circle',
      source: 'directions',
      paint: {
        'circle-radius': 18,
        'circle-color': '#8a8bc9',
      },
      filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'B']],
    },
    {
      id: 'directions-destination-label',
      type: 'symbol',
      source: 'directions',
      layout: {
        'text-field': 'B',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: {
        'text-color': '#fff',
      },
      filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'B']],
    },
  ],

  // UI controls
  controls: {
    language: 'en',
    // proximity: false,
    flyTo: true,
    placeholderOrigin: 'Choose a starting place',
    placeholderDestination: 'Choose destination',
    zoom: 16,
    profileSwitcher: true,
    inputs: true,
    instructions: true,
  },

  // Optional setting to pass options available to mapbox-gl-geocoder
  geocoderQueryParameters: {},

  interactive: true,

  // Container for client registered events
  events: {},

  // Marker feature drawn on the map at any point.
  origin: null,
  destination: null,
  hoverMarker: null,
  waypoints: [],

  // User input strings or result returned from geocoder
  originQuery: '',
  destinationQuery: '',
  originQueryCoordinates: null,
  destinationQueryCoordinates: null,

  // Directions data
  directions: [],
  routeIndex: 0,
  routePadding: 80,
} satisfies MapboxDirectionsState

/**
 * A globally shared store is created with default options.
 */
export const store = createStore<MapboxDirectionsState>()((_set) => defaultOptions)

/**
 * Initialize the store by merging the initial settings with user options.
 */
export function initializeStore(options: MapboxDirectionsOptions) {
  store.setState((p) => {
    return defu(options, p) as MapboxDirectionsState
  })
}
