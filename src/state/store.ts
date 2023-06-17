import { defu } from 'defu'
import mapboxgl from 'mapbox-gl'
import { createStore } from 'zustand/vanilla'
import type { GeocodingFeature } from '../api/geocoder.js'
import type { MapboxDirectionsOptions } from '../index.js'
import { fetchDirections, type Route } from '../api/directions.js'
import { stringifyCoordinates, type Point } from '../utils/index.js'

export interface MapboxDirectionsState extends MapboxDirectionsOptions {
  // Container for client registered events
  events: {}

  // Marker feature drawn on the map at any point.
  origin: Point | null
  destination: Point | null
  hoverMarker: Point | null
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

  setOrigin: (origin: Point) => void
  clearOrigin: () => void
  setDestination: (destination: Point) => void
  clearDestination: () => void
  reverse: () => void
  updateDirections: () => void
}

export function createDirectionsStore(options: MapboxDirectionsOptions) {
  const directionsStore = createStore<MapboxDirectionsState>((set, get) => {
    const initialState: MapboxDirectionsState = {
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

      setOrigin: (origin: Point) => {
        set(prevState => ({ ...prevState, origin }))
      },
      clearOrigin: () => {
        set(prevState => ({
          ...prevState,
          origin: null,
          originQuery: '',
          waypoints: [],
          directions: []
        }))
      },
      setDestination: (destination: Point) => {
        set(prevState => ({ ...prevState, destination }))
      },
      clearDestination: () => {
        set(prevState => ({
          ...prevState,
          destination: null,
          destinationQuery: '',
          waypoints: [],
          directions: []
        }))
      },
      reverse: () => {
        set((prevState) => {
          const {
            origin,
            originQuery,
            originQueryCoordinates,
            destination,
            destinationQuery,
            destinationQueryCoordinates
          } = prevState

          return {
            ...prevState,
            origin: destination,
            originQuery: destinationQuery,
            originQueryCoordinates: destinationQueryCoordinates,
            destination: origin,
            destinationQuery: originQuery,
            destinationQueryCoordinates: originQueryCoordinates,
          }
        })
      },
      updateDirections: async () => {
        const {
          api,
          origin,
          waypoints,
          destination,
          profile,
          alternatives,
          congestion,
          controls,
          accessToken
        } = get()

        if (!(
          origin?.geometry.coordinates && destination?.geometry.coordinates && profile
        )) return

        const queryArray = [
          stringifyCoordinates(origin.geometry.coordinates),
          ';',
          ...waypoints.flatMap((waypoint) => [
            stringifyCoordinates(waypoint.geometry.coordinates as [number, number]),
            ';',
          ]),
          stringifyCoordinates(destination.geometry.coordinates),
        ]

        const query = encodeURIComponent(queryArray.join(''))

        const queryParameters: Record<string, string> = {
          geometries: 'polyline',
          steps: 'true',
          overview: 'full',
          ...(alternatives && { alternatives: 'true' }),
          ...(congestion && { annotations: 'congestion' }),
          ...(accessToken && { access_token: accessToken }),
          ...(controls?.language && { language: controls.language }),
          ...(controls?.exclude && { exclude: controls.exclude }),
        }

        const directions = await fetchDirections(api ?? '', profile, query, queryParameters)

        if ('routes' in directions) {
          set((prevState) => {
            return { ...prevState, directions: directions.routes }
          })
        } else {
        }
      }
    }

    return defu(options, initialState) as MapboxDirectionsState
  })
  return directionsStore
}
