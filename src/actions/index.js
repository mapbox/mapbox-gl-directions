import fetch from 'isomorphic-fetch';
import * as types from '../constants/action_types';
import { ACCESS_TOKEN, GEOCODER_URL, DIRECTIONS_URL } from '../config';

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
    return fetch(`${GEOCODER_URL}/v4/geocode/mapbox.places/${query.trim()}.json?access_token=${ACCESS_TOKEN}`)
      .then(req => req.json())
      .then(json => dispatch(callback(json.features)));
  };
}

function fetchDirections(query, mode) {
  return dispatch => {
    return fetch(`${DIRECTIONS_URL}/v4/directions/mapbox.${mode}/${query}.json?instructions=html&geometry=polyline&access_token=${ACCESS_TOKEN}`)
      .then(req => req.json())
      .then(json => dispatch(directionsResults(json.routes)));
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

function setMode(mode) {
  return {
    type: types.DIRECTIONS_MODE,
    mode
  };
}

export function addOrigin(coordinates) {
  return (dispatch, getState) => {
    const { data } = getState();
    const { destination, mode } = data;

    if (destination.geometry) {
      let query = coordinates.join(',');
      query += ';' + destination.geometry.coordinates.join(',');

      dispatch(fetchDirections(query, mode));
    }

    dispatch(setOrigin({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coordinates
      },
      properties: {
        'marker-symbol': 'A'
      }
    }));
  };
}

export function addDestination(coordinates) {
  return (dispatch, getState) => {
    const { data } = getState();
    const { origin, mode } = data;

    if (origin.geometry) {
      let query = origin.geometry.coordinates.join(',');
      query += ';' + coordinates.join(',');

      dispatch(fetchDirections(query, mode));
    }

    dispatch(setDestination({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coordinates
      },
      properties: {
        'marker-symbol': 'B'
      }
    }));
  };
}

export function directionsMode(mode) {
  return (dispatch, getState) => {
    const { data } = getState();
    const { origin, destination } = data;

    if (origin.geometry && destination.geometry) {
      let query = origin.geometry.coordinates.join(',');
      query += ';' + destination.geometry.coordinates.join(',');

      dispatch(fetchDirections(query, mode));
    }

    dispatch(setMode(mode));
  };
}

export function reverseInputs() {
  return (dispatch, getState) => {
    const { data } = getState();
    const { origin, destination, mode } = data;

    if (origin.geometry && destination.geometry) {
      let query = destination.geometry.coordinates.join(',');
      query += ';' + origin.geometry.coordinates.join(',');

      dispatch(fetchDirections(query, mode));
    }

    let originReversed = {};
    let destinationReversed = {};

    if (!destination.geometry || !origin.geometry) {

      if (!destination.geometry && origin.geometry) {
        // Origin remains empty
        // Destination gets origin
        destinationReversed = Object.assign({}, origin, {
          properties: Object.assign({}, origin.properties, {
            'marker-symbol': 'B'
          })
        });
      } else if (!origin.geometry && destination.geometry) {
        // Destination remains empty
        // Origin gets destination
        originReversed = Object.assign({}, destination, {
          properties: Object.assign({}, destination.properties, {
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
    return dispatch(geocode(coordinates.lng + ',' + coordinates.lat, (results) => {

      if (results.length && mode === 'origin') {
        dispatch(addOrigin([coordinates.lng, coordinates.lat]));
        dispatch(originResults(results[0].place_name, results));
      } else if (results.length && mode === 'destination') {
        dispatch(addDestination([coordinates.lng, coordinates.lat]));
        dispatch(destinationResults(results[0].place_name, results));
      }

      return {
        type: types.RESULT_FROM_MAP
      };
    }));
  };
}
