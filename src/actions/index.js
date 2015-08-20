import fetch from 'isomorphic-fetch';
import * as types from '../constants/action_types';
import { ACCESS_TOKEN, GEOCODER_URL } from '../config';

function queryResults(input, results) {
  return {
    type: types.QUERY_RESULTS,
    input,
    results
  };
}

function geocode(input) {
  return dispatch => {
    return fetch(`${GEOCODER_URL}/v4/geocode/mapbox.places/${input}.json?access_token=${ACCESS_TOKEN}`)
      .then(req => req.json())
      .then(json => dispatch(queryResults(input, json.features)));
  };
}

export function queryGeocoder(input) {
  return (dispatch) => {
    return dispatch(geocode(input));
  };
}
