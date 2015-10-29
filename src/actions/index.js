import * as types from '../constants/action_types';
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

function directionsResults(directions) {
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

function fetchDirections(query, mode) {
  return dispatch => {
    return mapbox.getDirections(query, {
      profile: 'mapbox.' + mode,
      geometry: 'polyline'
    }, (err, res) => {
      if (err) throw err;
      dispatch(setRouteIndex(0));
      dispatch(directionsResults(res.routes));
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

function _setMode(mode) {
  return {
    type: types.DIRECTIONS_MODE,
    mode
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

export function setOptions(options) {
  if (options.accessToken) {
    mapbox = new MapboxClient(options.accessToken);
  }

  return {
    type: types.SET_OPTIONS,
    options: options
  };
}

export function hoverWayPoint(coordinates) {
  return (dispatch) => {
    const feature = (coordinates) ? {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coordinates
      },
      properties: {
        id: 'waypoint'
      }
    } : {};

    dispatch(setHoverWayPoint(feature));
  };
}

export function hoverMarker(coordinates) {
  return (dispatch) => {
    const feature = (coordinates) ? {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coordinates
      },
      properties: {
        id: 'hover'
      }
    } : {};

    dispatch(setHoverMarker(feature));
  };
}

export function setRouteIndex(routeIndex) {
  return {
    type: types.ROUTE_INDEX,
    routeIndex
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

export function addOrigin(coordinates) {
  return (dispatch, getState) => {
    const { destination, mode, wayPoints } = getState();
    const origin = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coordinates
      },
      properties: {
        id: 'origin',
        'marker-symbol': 'A'
      }
    };

    if (destination.geometry) {
      const query = buildDirectionsQuery(origin, destination, wayPoints);
      dispatch(fetchDirections(query, mode));
    }

    dispatch(setOrigin(origin));
  };
}

export function addDestination(coordinates) {
  return (dispatch, getState) => {
    const { origin, mode, wayPoints } = getState();
    const destination = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coordinates
      },
      properties: {
        id: 'destination',
        'marker-symbol': 'B'
      }
    };

    if (origin.geometry) {
      const query = buildDirectionsQuery(origin, destination, wayPoints);
      dispatch(fetchDirections(query, mode));
    }

    dispatch(setDestination(destination));
  };
}

export function setMode(mode) {
  return (dispatch, getState) => {
    const { origin, destination, wayPoints } = getState();

    if (origin.geometry && destination.geometry) {
      const query = buildDirectionsQuery(origin, destination, wayPoints);
      dispatch(fetchDirections(query, mode));
    }

    dispatch(_setMode(mode));
  };
}

export function reverseInputs() {
  return (dispatch, getState) => {
    const { origin, destination, wayPoints, mode } = getState();

    if (origin.geometry && destination.geometry) {
      const query = buildDirectionsQuery(origin, destination, wayPoints);
      dispatch(fetchDirections(query, mode));
    }

    let originReversed = {};
    let destinationReversed = {};

    if (!destination.geometry || !origin.geometry) {

      if (!destination.geometry && origin.geometry) {
        // If Origin is empty Destination gets origin
        destinationReversed = Object.assign({}, origin, {
          properties: Object.assign({}, origin.properties, {
            id: 'destination',
            'marker-symbol': 'B'
          })
        });
      } else if (!origin.geometry && destination.geometry) {
        // If Destination is empty Origin gets destination
        originReversed = Object.assign({}, destination, {
          properties: Object.assign({}, destination.properties, {
            id: 'origin',
            'marker-symbol': 'A'
          })
        });
      }

    } else {
      originReversed = Object.assign({}, origin, {
        geometry: Object.assign({}, origin.geometry, {
          coordinates: destination.geometry.coordinates
        })
      });

      destinationReversed = Object.assign({}, destination, {
        geometry: Object.assign({}, destination.geometry, {
          coordinates: origin.geometry.coordinates
        })
      });
    }

    dispatch(reverseOriginDestination(originReversed, destinationReversed));
  };
}

export function reverseOriginDestination(origin, destination) {
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

export function clearRefresh() {
  return {
    type: types.REFRESH_CLEAR
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

export function queryPointFromMap(coordinates, mode) {
  return (dispatch) => {
    return dispatch(geocode(coordinates.join(','), (results) => {

      if (results.length && mode === 'origin') {
        dispatch(addOrigin(coordinates));
        dispatch(originResults(results[0].place_name, results));
      } else if (results.length && mode === 'destination') {
        dispatch(addDestination(coordinates));
        dispatch(destinationResults(results[0].place_name, results));
      }

      return {
        type: types.RESULT_FROM_MAP
      };
    }));
  };
}

export function addWayPoint(coords) {
  return (dispatch, getState) => {
    const { origin, destination, wayPoints, mode} = getState();

    if (destination.geometry) {
      const query = buildDirectionsQuery(origin, destination, [coords, ...wayPoints]);
      dispatch(fetchDirections(query, mode));
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
