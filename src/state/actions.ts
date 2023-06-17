import { store } from './store.js'
import type { MapboxProfile } from '../index.js'
import { fetchDirections } from '../api/directions.js'
import { stringifyCoordinates, type Point } from '../utils/index.js'

export function setOrigin(origin: Point) {
  store.setState((prevState) => {
    return { ...prevState, origin }
  })
}

export function clearOrigin() {
  store.setState((prevState) => {
    return { 
      ...prevState,
      origin: null,
      originQuery: '',
      waypoints: [],
      directions: [] 
    }
  })
}

export function setDestination(destination: Point) {
  store.setState((prevState) => {
    return { ...prevState, destination }
  })
}

export function clearDestination() {
  store.setState((prevState) => {
    return { 
      ...prevState,
      destination: null,
      destinationQuery: '',
      waypoints: [],
      directions: [] 
    }
  })
}

export function setProfile(profile: MapboxProfile) {
  store.setState((prevState) => {
    return { ...prevState, profile }
  })
}

export function reverse() {
  store.setState((prevState) => {
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
}

export async function updateDirections() {
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
  } = store.getState()

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
    store.setState((prevState) => {
      return { ...prevState, directions: directions.routes }
    })
  } else {
  }
}
