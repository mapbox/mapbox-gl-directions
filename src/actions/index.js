import fetch from 'isomorphic-fetch';
import * as types from '../constants/action_types';

export function addOrigin(input) {
  return {
    type: types.ADD_ORIGIN,
    input
  };
}

export function addDestination(input) {
  return {
    type: types.ADD_DESTINATION,
    input
  };
}
