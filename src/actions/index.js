'use strict';

import fetch from 'isomorphic-fetch';

export const ADD_ORIGIN = 'ADD_ORIGIN';
export const ADD_DESTINATION = 'ADD_DESTINATION';

export function addOrigin(input) {
  return {
    type: ADD_ORIGIN,
    input
  };
}

export function addDestination(input) {
  return {
    type: ADD_DESTINATION,
    input
  };
}
