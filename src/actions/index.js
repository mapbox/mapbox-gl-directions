import * as types from '../constants/action_types';
import utils from '../utils';
import MapboxClient from 'mapbox';
let mapbox;

function originPoint(coordinates) {
  return (dispatch) => {
    const origin = utils.createPoint(coordinates, {
      id: 'origin',
      'marker-symbol': 'A'
    });

    dispatch({ type: types.ORIGIN, origin });
    dispatch(eventEmit('origin', { feature: origin }));
  };
}

function destinationPoint(coordinates) {
  return (dispatch) => {
    const destination = utils.createPoint(coordinates, {
      id: 'destination',
      'marker-symbol': 'B'
    });

    dispatch({ type: types.DESTINATION, destination });
    dispatch(eventEmit('destination', { feature: destination }));
  };
}

function setDirections(directions) {
  return dispatch => {
    dispatch({
      type: types.DIRECTIONS,
      directions
    });
    dispatch(eventEmit('route', { route: directions }));
  };
}

function updateWaypoints(waypoints) {
  return {
    type: types.WAYPOINTS,
    waypoints: waypoints
  };
}

function setHoverMarker(feature) {
  return {
    type: types.HOVER_MARKER,
    hoverMarker: feature
  };
}

function fetchDirections() {
  return (dispatch, getState) => {
    const { routeIndex, profile } = getState();
    const query = buildDirectionsQuery(getState);
    return mapbox.getDirections(query, {
      profile: 'mapbox.' + profile,
      geometry: 'polyline'
    }, (err, res) => {
      if (err) throw err;
      if (res.error) return dispatch(setError(res.error));
      dispatch(setError(null));
      if (!res.routes[routeIndex]) dispatch(setRouteIndex(0));
      dispatch(setDirections(res.routes));

      // Revise origin / destination points
      dispatch(originPoint(res.origin.geometry.coordinates));
      dispatch(destinationPoint(res.destination.geometry.coordinates));
    });
  };
}

/*
 * Build query used to fetch directions
 *
 * @param {Function} state
 */
function buildDirectionsQuery(state) {
  const { origin, destination, waypoints } = state();

  let query = [{
    longitude: origin.geometry.coordinates[0],
    latitude: origin.geometry.coordinates[1]
  }];

  // Add any waypoints.
  if (waypoints.length) {
    waypoints.forEach((waypoint) => {
      query.push({
        longitude: waypoint.geometry.coordinates[0],
        latitude: waypoint.geometry.coordinates[1]
      });
    });
  }

  query.push({
    longitude: destination.geometry.coordinates[0],
    latitude: destination.geometry.coordinates[1]
  });

  return query;
}

function normalizeWaypoint(waypoint) {
  const properties = { id: 'waypoint' };
  return Object.assign(waypoint, {
    properties: waypoint.properties ?
      Object.assign(waypoint.properties, properties) :
      properties
  });
}

function setError(error) {
  return dispatch => {
    dispatch({
      type: 'ERROR',
      error
    });
    if (error) dispatch(eventEmit('error', { error: error }));
  };
}

export function originQuery(query) {
  return {
    type: types.ORIGIN_QUERY,
    query
  };
}

export function destinationQuery(query) {
  return {
    type: types.DESTINATION_QUERY,
    query
  };
}

export function clearOrigin() {
  return dispatch => {
    dispatch({
      type: types.ORIGIN_CLEAR
    });
    dispatch(eventEmit('clear', { type: 'origin' }));
    dispatch(setError(null));
  };
}

export function clearDestination() {
  return dispatch => {
    dispatch({
      type: types.DESTINATION_CLEAR
    });
    dispatch(eventEmit('clear', { type: 'destination' }));
    dispatch(setError(null));
  };
}

export function setOptions(options) {
  const accessToken = (options.accessToken) ?
    options.accessToken :
    mapboxgl.accessToken;

  mapbox = new MapboxClient(accessToken);

  return {
    type: types.SET_OPTIONS,
    options: options
  };
}

export function hoverMarker(coordinates) {
  return (dispatch) => {
    const feature = (coordinates) ? utils.createPoint(coordinates, { id: 'hover'}) : {};
    dispatch(setHoverMarker(feature));
  };
}

export function setRouteIndex(routeIndex) {
  return {
    type: types.ROUTE_INDEX,
    routeIndex
  };
}

export function originCoordinates(coordinates) {
  return (dispatch, getState) => {
    const { destination } = getState();
    dispatch(originPoint(coordinates));
    if (destination.geometry) dispatch(fetchDirections());
  };
}

export function destinationCoordinates(coordinates) {
  return (dispatch, getState) => {
    const { origin } = getState();
    dispatch(destinationPoint(coordinates));
    if (origin.geometry) dispatch(fetchDirections());
  };
}

export function setProfile(profile) {
  return (dispatch, getState) => {
    const { origin, destination } = getState();
    dispatch({ type: types.DIRECTIONS_PROFILE, profile });
    dispatch(eventEmit('profile', { profile }));
    if (origin.geometry && destination.geometry) dispatch(fetchDirections());
  };
}

export function reverse() {
  return (dispatch, getState) => {
    const state = getState();

    dispatch(originQuery(state.destinationQuery));
    dispatch(destinationQuery(state.originQuery));

    if (state.destination.geometry) dispatch(originPoint(state.destination.geometry.coordinates));
    if (state.origin.geometry) dispatch(destinationPoint(state.origin.geometry.coordinates));
    if (state.origin.geometry && state.destination.geometry) dispatch(fetchDirections());
  };
}

/*
 * Set origin from coordinates
 *
 * @param {Array<number>} coordinates [lng, lat] array.
 */
export function setOrigin(coords) {
  return (dispatch) => {
    if (!utils.validCoords(coords)) return dispatch(setError(new Error('Coordinates are not valid')));
    dispatch(originCoordinates(coords));
    dispatch(originQuery(coords));
  };
}

/*
 * Set destination from coordinates
 *
 * @param {Array<number>} coords [lng, lat] array.
 */
export function setDestination(coords) {
  return (dispatch) => {
    if (!utils.validCoords(coords)) return dispatch(setError(new Error('Coordinates are not valid')));
    dispatch(destinationCoordinates(coords));
    dispatch(destinationQuery(coords));
  };
}

export function addWaypoint(index, waypoint) {
  return (dispatch, getState) => {
    let { destination, waypoints } = getState();
    waypoints.splice(index, 0, normalizeWaypoint(waypoint));
    dispatch(updateWaypoints(waypoints));
    if (destination.geometry) dispatch(fetchDirections());
  };
}

export function setWaypoint(index, waypoint) {
  return (dispatch, getState) => {
    let { destination, waypoints } = getState();
    waypoints[index] = normalizeWaypoint(waypoint);
    dispatch(updateWaypoints(waypoints));
    if (destination.geometry) dispatch(fetchDirections());
  };
}

export function removeWaypoint(waypoint) {
  return (dispatch, getState) => {
    let { destination, waypoints } = getState();
      waypoints = waypoints.filter((way) => {
        return !utils.coordinateMatch(way, waypoint);
      });

      dispatch(updateWaypoints(waypoints));
      if (destination.geometry) dispatch(fetchDirections());
  };
}

export function eventSubscribe(type, fn) {
  return (dispatch, getState) => {
    const { events } = getState();
    events[type] = events[type] || [];
    events[type].push(fn);
    return {
      type: types.EVENTS,
      events
    };
  };
}

export function eventEmit(type, data) {
  return (dispatch, getState) => {
    const { events } = getState();

    if (!events[type]) {
      return {
        type: types.EVENTS,
        events
      };
    }

    const listeners = events[type].slice();

    for (var i = 0; i < listeners.length; i++) {
      listeners[i].call(this, data);
    }
  };
}
