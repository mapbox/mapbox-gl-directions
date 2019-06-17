import * as types from '../constants/action_types';
import utils from '../utils';
const request = new XMLHttpRequest();

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
    const { api, accessToken, routeIndex, profile, alternatives, congestion, destination, language } = getState();
    // if there is no destination set, do not make request because it will fail
    if (!(destination && destination.geometry)) return;

    const query = buildDirectionsQuery(getState);

    // Request params
    var options = [];
    options.push('geometries=polyline');
    if (alternatives) options.push('alternatives=true');
    if (congestion) options.push('annotations=congestion');
    options.push('steps=true');
    options.push('overview=full');
    options.push('language='+language);
    if (accessToken) options.push('access_token=' + accessToken);
    request.abort();
    request.open('GET', `${api}${profile}/${query}.json?${options.join('&')}`, true);

    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
        if (data.error) {
          dispatch(setDirections([]));
          return dispatch(setError(data.error));
        }

        dispatch(setError(null));
        if (!data.routes[routeIndex]) dispatch(setRouteIndex(0));
        dispatch(setDirections(data.routes));

        // Revise origin / destination points
        dispatch(originPoint(data.waypoints[0].location));
        dispatch(destinationPoint(data.waypoints[data.waypoints.length - 1].location));
      } else {
        dispatch(setDirections([]));
        return dispatch(setError(JSON.parse(request.responseText).message));
      }
    };

    request.onerror = () => {
      dispatch(setDirections([]));
      return dispatch(setError(JSON.parse(request.responseText).message));
    };

    request.send();
  };
}

/*
 * Build query used to fetch directions
 *
 * @param {Function} state
 */
function buildDirectionsQuery(state) {
  const { origin, destination, waypoints } = state();

  let query = [];
  query.push((origin.geometry.coordinates).join(','));
  query.push(';');

  // Add any waypoints.
  if (waypoints.length) {
    waypoints.forEach((waypoint) => {
      query.push((waypoint.geometry.coordinates).join(','));
      query.push(';');
    });
  }

  query.push((destination.geometry.coordinates).join(','));
  return encodeURIComponent(query.join(''));
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

export function queryOrigin(query) {
  return {
    type: types.ORIGIN_QUERY,
    query
  };
}

export function queryDestination(query) {
  return {
    type: types.DESTINATION_QUERY,
    query
  };
}

export function queryOriginCoordinates(coords) {
  return {
    type: types.ORIGIN_FROM_COORDINATES,
    coordinates: coords
  };
}

export function queryDestinationCoordinates(coords) {
  return {
    type: types.DESTINATION_FROM_COORDINATES,
    coordinates: coords
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

export function createOrigin(coordinates) {
  return (dispatch, getState) => {
    const { destination } = getState();
    dispatch(originPoint(coordinates));
    if (destination.geometry) dispatch(fetchDirections());
  };
}

export function createDestination(coordinates) {
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
export function setOriginFromCoordinates(coords) {
  return (dispatch) => {
    if (!utils.validCoords(coords)) coords = [utils.wrap(coords[0]), utils.wrap(coords[1])];
    if (isNaN(coords[0]) && isNaN(coords[1])) return dispatch(setError(new Error('Coordinates are not valid')));
    dispatch(queryOriginCoordinates(coords));
    dispatch(createOrigin(coords));
  };
}

/*
 * Set destination from coordinates
 *
 * @param {Array<number>} coords [lng, lat] array.
 */
export function setDestinationFromCoordinates(coords) {
  return (dispatch) => {
    if (!utils.validCoords(coords)) coords = [utils.wrap(coords[0]), utils.wrap(coords[1])];
    if (isNaN(coords[0]) && isNaN(coords[1])) return dispatch(setError(new Error('Coordinates are not valid')));
    dispatch(createDestination(coords));
    dispatch(queryDestinationCoordinates(coords));
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
