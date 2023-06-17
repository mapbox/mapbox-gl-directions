import { defu } from 'defu'
import mapboxgl from 'mapbox-gl'
import { createStore, StoreApi } from 'zustand/vanilla'
import layers from '../layers.js'
import { fetchDirections, type Route } from '../api/directions.js'
import { stringifyCoordinates, type Feature, coordinateMatch, createPoint } from '../utils/index.js'
import type { MapboxDirectionsOptions, MapboxProfile } from '../index.js'

export interface MapboxDirectionsState extends MapboxDirectionsOptions {
  error: unknown

  // Container for client registered events
  events: {}

  // Marker feature drawn on the map at any point.
  origin: Feature | null
  destination: Feature | null
  hoverMarker: Feature | null
  waypoints: Feature[]

  // User input strings or result returned from geocoder
  originQuery: string
  destinationQuery: string
  originQueryCoordinates: mapboxgl.LngLatLike | null
  destinationQueryCoordinates: mapboxgl.LngLatLike | null

  // Directions data
  directions: Route[]
  routeIndex: number
  routePadding: number

  setProfile: (profile: MapboxProfile) => void
  setOrigin: (origin: Feature) => void
  clearOrigin: () => void
  setDestination: (destination: Feature) => void
  clearDestination: () => void
  reverse: () => void
  updateDirections: () => void
  setRouteIndex: (routeIndex: number) => void
  addWaypoint: (index: number, waypoint: Feature) => void
  removeWaypoint: (feature: mapboxgl.MapboxGeoJSONFeature) => void
  setHoverMarker: (coordinates: mapboxgl.LngLatLike | null) => void
}

export type DirectionsStore = StoreApi<MapboxDirectionsState>

export function createDirectionsStore(options: MapboxDirectionsOptions): DirectionsStore {
  const directionsStore = createStore<MapboxDirectionsState>((set, get) => {
    const initialState: MapboxDirectionsState = {
      error: null,

      // Options set on initialization
      api: 'https://api.mapbox.com/directions/v5/',
      profile: 'mapbox/driving-traffic',
      alternatives: false,
      congestion: false,
      unit: 'imperial',
      styles: layers,

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

      setProfile: (profile) => {
        set((prevState) => ({ ...prevState, profile }))
      },
      setOrigin: (origin: Feature) => {
        set((prevState) => ({ ...prevState, origin }))
      },
      clearOrigin: () => {
        set((prevState) => ({
          ...prevState,
          origin: null,
          originQuery: '',
          waypoints: [],
          directions: [],
        }))
      },
      setDestination: (destination: Feature) => {
        set((prevState) => ({ ...prevState, destination }))
      },
      clearDestination: () => {
        set((prevState) => ({
          ...prevState,
          destination: null,
          destinationQuery: '',
          waypoints: [],
          directions: [],
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
            destinationQueryCoordinates,
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
          accessToken,
        } = get()

        if (!(origin?.geometry.coordinates && destination?.geometry.coordinates && profile)) return

        const queryArray = [
          stringifyCoordinates(origin.geometry.coordinates),
          ';',
          ...waypoints.flatMap((waypoint) => [
            stringifyCoordinates(waypoint.geometry.coordinates),
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
      },
      setRouteIndex: (routeIndex) => {
        set((prevState) => ({ ...prevState, routeIndex }))
      },
      addWaypoint(index, waypoint) {
        const { waypoints } = get()
        waypoints.splice(index, 0, {
          ...waypoint,
          properties: { id: 'waypoint', ...waypoint.properties }
        })
        set((prevState) => ({ ...prevState, waypoints }))
      },
      removeWaypoint: (waypoint) => {
        set((prevState) => {
          const { waypoints } = prevState
          return {
            ...prevState,
            waypoints: waypoints.filter((way) => !coordinateMatch(way, waypoint)),
          }
        })
      },
      setHoverMarker: (coordinates) => {
        set((prevState) => ({
          ...prevState,
          hoverMarker: coordinates ? createPoint(coordinates, { id: 'hover' }) : null
        }))
      },
    }

    const state = defu(options, initialState) as MapboxDirectionsState

    const customStyles = options.styles ?? []
    state.styles = [
      ...customStyles,
      ...layers.filter((layer) => !customStyles.some((customLayer) => customLayer.id === layer.id)),
    ]

    return state
  })
  return directionsStore
}
