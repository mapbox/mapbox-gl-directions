import * as types from '../constants/action_types';
import mapboxgl from 'mapbox-gl';
import MapboxClient from 'mapbox';
let mapbox;

function originResults(query, results) {
  return {
    type: types.ORIGIN_INPUT,
    query,
    results
  };
}

function destinationResults(query, results) {
  return {
    type: types.DESTINATION_INPUT,
    query,
    results
  };
}

function setDirections(directions) {
  return {
    type: types.DIRECTIONS,
    directions
  };
}

function geocode(query, callback) {
  return dispatch => {
    return mapbox.geocodeForward(query.trim(), (err, res) => {
      if (err) throw err;
      dispatch(callback(res.features));
    });
  };
}

function fetchDirections(query, profile) {
  return dispatch => {
    return mapbox.getDirections(query, {
      profile: 'mapbox.' + profile,
      geometry: 'polyline'
    }, (err, res) => {
      if (err) throw err;
      if (res.error) throw res.error;
      dispatch(setRouteIndex(0));
      dispatch(setDirections(res.routes));

      // Revise origin + destination
      dispatch(setOrigin(Object.assign(res.origin, {
        properties: {
          id: 'origin',
          'marker-symbol': 'A'
        }
      })));
      dispatch(setDestination(Object.assign(res.destination, {
        properties: {
          id: 'destination',
          'marker-symbol': 'B'
        }
      })));

    });
  };
}

function setOrigin(feature) {
  return {
    type: types.ORIGIN,
    origin: feature
  };
}

function setDestination(feature) {
  return {
    type: types.DESTINATION,
    destination: feature
  };
}

function setWayPoint(feature) {
  return {
    type: types.WAYPOINTS,
    wayPoint: feature
  };
}

function _setProfile(profile) {
  return {
    type: types.DIRECTIONS_PROFILE,
    profile
  };
}

function setHoverMarker(feature) {
  return {
    type: types.HOVER_MARKER,
    hoverMarker: feature
  };
}

function setHoverWayPoint(feature) {
  return {
    type: types.HOVER_WAYPOINT,
    hoverWayPoint: feature
  };
}

function buildPoint(coordinates, properties) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coordinates
    },
    properties: properties
  };
}

function buildDirectionsQuery(origin, destination, wayPoints) {
  let query = [{
    longitude: origin.geometry.coordinates[0],
    latitude: origin.geometry.coordinates[1]
  }];

  // Add any waypoints.
  if (wayPoints.length) {
    wayPoints.forEach((wayPoint) => {
      query.push({
        longitude: wayPoint[0],
        latitude: wayPoint[1]
      });
    });
  }

  query.push({
    longitude: destination.geometry.coordinates[0],
    latitude: destination.geometry.coordinates[1]
  });

  return query;
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

export function hoverWayPoint(coordinates) {
  return (dispatch) => {
    const feature = (coordinates) ? buildPoint(coordinates, { id: 'waypoint'}) : {};
    dispatch(setHoverWayPoint(feature));
  };
}

export function hoverMarker(coordinates) {
  return (dispatch) => {
    const feature = (coordinates) ? buildPoint(coordinates, { id: 'hover'}) : {};
    dispatch(setHoverMarker(feature));
  };
}

export function setRouteIndex(routeIndex) {
  return {
    type: types.ROUTE_INDEX,
    routeIndex
  };
}

export function addOrigin(coordinates) {
  return (dispatch, getState) => {
    const { destination, profile, wayPoints } = getState();

    const origin = buildPoint(coordinates, {
      id: 'origin',
      'marker-symbol': 'A'
    });

    if (destination.geometry) {
      const query = buildDirectionsQuery(origin, destination, wayPoints);
      dispatch(fetchDirections(query, profile));
    }

    dispatch(setOrigin(origin));
  };
}

export function addDestination(coordinates) {
  return (dispatch, getState) => {
    const { origin, profile, wayPoints } = getState();
    const destination = buildPoint(coordinates, {
      id: 'destination',
      'marker-symbol': 'B'
    });

    if (origin.geometry) {
      const query = buildDirectionsQuery(origin, destination, wayPoints);
      dispatch(fetchDirections(query, profile));
    }

    dispatch(setDestination(destination));
  };
}

export function setProfile(profile) {
  return (dispatch, getState) => {
    const { origin, destination, wayPoints } = getState();

    if (origin.geometry && destination.geometry) {
      const query = buildDirectionsQuery(origin, destination, wayPoints);
      dispatch(fetchDirections(query, profile));
    }

    dispatch(_setProfile(profile));
  };
}

export function reverse() {
  return (dispatch, getState) => {
    const { origin, destination, wayPoints, profile } = getState();

    let o = {}, d = {};

    if (destination.geometry) {
      o = Object.assign(destination, {
        properties: {
          id: 'origin',
          'marker-symbol': 'A'
        }
      });
    }

    if (origin.geometry) {
      d = Object.assign(origin, {
        properties: {
          id: 'destination',
          'marker-symbol': 'B'
        }
      });
    }

    dispatch(reverseInputs(o, d));

    if (origin.geometry && destination.geometry) {
      const query = buildDirectionsQuery(o, d, wayPoints);
      dispatch(fetchDirections(query, profile));
    }
  };
}

export function reverseInputs(origin, destination) {
  return {
    type: types.REVERSE_INPUTS,
    origin,
    destination
  };
}

export function clearOrigin() {
  return {
    type: types.ORIGIN_CLEAR
  };
}

export function clearDestination() {
  return {
    type: types.DESTINATION_CLEAR
  };
}

export function queryOrigin(query) {
  return (dispatch) => {
    return dispatch(geocode(query, (results) => {
      return dispatch(originResults(query, results));
    }));
  };
}

export function queryDestination(query) {
  return (dispatch) => {
    return dispatch(geocode(query, (results) => {
      return dispatch(destinationResults(query, results));
    }));
  };
}

export function queryOriginCoordinates(coordinates) {
  return (dispatch) => {
    dispatch(addOrigin(coordinates));
    return dispatch(geocode(coordinates.join(','), (results) => {
      if (!results.length) return;
      return dispatch(originResults(results[0].place_name, results));
    }));
  };
}

export function queryDestinationCoordinates(coordinates) {
  return (dispatch) => {
    dispatch(addDestination(coordinates));
    return dispatch(geocode(coordinates.join(','), (results) => {
      if (!results.length) return;
      return dispatch(destinationResults(results[0].place_name, results));
    }));
  };
}

export function addWayPoint(coords) {
  return (dispatch, getState) => {
    const { origin, destination, wayPoints, profile} = getState();

    if (destination.geometry) {
      const query = buildDirectionsQuery(origin, destination, [coords, ...wayPoints]);
      dispatch(fetchDirections(query, profile));
    }

    dispatch(setWayPoint(coords));
  };
}

export function filterWayPoint(coords) {
  return {
    type: types.REDUCE_WAYPOINTS,
    wayPoint: coords
  };
}
