import fetch from 'isomorphic-fetch';
import * as types from '../constants/action_types';
import { ACCESS_TOKEN, GEOCODER_URL } from '../config';

function originResults(query, results) {
  return {
    type: types.ORIGIN_RESULTS,
    query,
    results
  };
}

function destinationResults(query, results) {
  return {
    type: types.DESTINATION_RESULTS,
    query,
    results
  };
}

function geocode(query, mode) {
  console.log('query', query);
  return dispatch => {
    return fetch(`${GEOCODER_URL}/v4/geocode/mapbox.places/${query}.json?access_token=${ACCESS_TOKEN}`)
      .then(req => req.json())
      .then(json => dispatch((mode === 'origin') ?
        originResults(query, json.features) :
        destinationResults(query, json.features)));
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
