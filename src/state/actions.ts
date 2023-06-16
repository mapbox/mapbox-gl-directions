import { store } from './store.js'
import type { MapboxProfile } from '../index.js'
import { stringifyCoordinates, type Point } from '../utils/index.js'
import { fetchDirections } from '../api/directions.js'

export function setOrigin(origin: Point) {
  store.setState((prevState) => {
    prevState.origin = origin
    return prevState
  })
}

export function setDestination(destination: Point) {
  store.setState((prevState) => {
    prevState.destination = destination
    return prevState
  })
}

export function setProfile(profile: MapboxProfile) {
  store.setState((prevState) => {
    prevState.profile = profile
    return prevState
  })
}

export function reverse() {
  store.setState((prevState) => {
    const { origin, destination } = prevState
    prevState.origin = destination
    prevState.destination = origin
    return prevState
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
      prevState.directions = directions.routes
      return prevState
    })
  } else {
  }
}
