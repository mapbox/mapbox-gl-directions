import fetch from 'isomorphic-fetch';
import * as types from '../constants/action_types';

export function queryOrigin(input) {
  console.log('input from action', input);
  return {
    type: types.QUERY_ORIGIN,
    input
  };
}

export function queryDestination(input) {
  return {
    type: types.QUERY_DESTINATION,
    input
  };
}
