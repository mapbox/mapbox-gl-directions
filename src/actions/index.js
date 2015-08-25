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

function geocode(query, mode) {
  return dispatch => {
    return fetch(`${GEOCODER_URL}/v4/geocode/mapbox.places/${query.trim()}.json?access_token=${ACCESS_TOKEN}`)
      .then(req => req.json())
      .then(json => dispatch((mode === 'origin') ?
        originResults(query, json.features) :
        destinationResults(query, json.features)));
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

export function addOrigin(feature) {
  return (dispatch, getState) => {
    const { data } = getState();
    const { destination, mode } = data;

    if (destination.geometry) {
      let query = feature.geometry.coordinates.join(',');
      query += ';' + destination.geometry.coordinates.join(',');
      dispatch(fetchDirections(query, mode));
    }

    dispatch(setOrigin(feature));
  };
}

export function addDestination(feature) {
  return (dispatch, getState) => {
    const { data } = getState();
    const { origin, mode } = data;

    if (origin.geometry) {
      let query = origin.geometry.coordinates.join(',');
      query += ';' + feature.geometry.coordinates.join(',');
      dispatch(fetchDirections(query, mode));
    }

    dispatch(setDestination(feature));
  };
}

export function getDirections(query, mode) {
  return (dispatch) => {
    return dispatch(directions(query, mode));
  };
}

export function reverseInputs() {
  return {
    type: types.REVERSE_INPUTS
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
    return dispatch(geocode(query, 'origin'));
  };
}

export function queryDestination(query) {
  return (dispatch) => {
    return dispatch(geocode(query, 'destination'));
  };
}

export function directionsMode(mode) {
  return {
    type: types.DIRECTIONS_MODE,
    mode
  };
}
