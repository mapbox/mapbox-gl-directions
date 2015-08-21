import fetch from 'isomorphic-fetch';
import * as types from '../constants/action_types';
import { ACCESS_TOKEN, GEOCODER_URL } from '../config';

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

function geocode(query, mode) {
  return dispatch => {
    return fetch(`${GEOCODER_URL}/v4/geocode/mapbox.places/${query.trim()}.json?access_token=${ACCESS_TOKEN}`)
      .then(req => req.json())
      .then(json => dispatch((mode === 'origin') ?
        originResults(query, json.features) :
        destinationResults(query, json.features)));
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
