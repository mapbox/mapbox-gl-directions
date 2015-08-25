import { combineReducers } from 'redux';
import * as types from '../constants/action_types.js';

const initialState = {
  mode: 'driving',
  unit: 'imperial',

  // `origin` & `destination` represented as
  // geojson objects on the map.
  origin: {},
  destination: {},

  // Original input user entered
  originQuery: '',
  destinationQuery: '',

  // Arrays returned from geocode result.
  originResults: [],
  destinationResults: [],

  originCoordinates: [], // [Lng, Lat]
  destinationCoordinates: [], // [Lng, Lat]

  // Directions data
  directions: []
};

function data(state = initialState, action) {
  switch (action.type) {
  case types.ORIGIN:
    return Object.assign({}, state, {
      origin: action.origin
    });

  case types.DESTINATION:
    return Object.assign({}, state, {
      destination: action.destination
    });

  case types.ORIGIN_INPUT:
    return Object.assign({}, state, {
      originQuery: action.query,
      originResults: action.results
    });

  case types.DESTINATION_INPUT:
    return Object.assign({}, state, {
      destinationQuery: action.query,
      destinationResults: action.results
    });

  case types.ORIGIN_CLEAR:
    return Object.assign({}, state, {
      originQuery: '',
      originResults: []
    });

  case types.DESTINATION_CLEAR:
    return Object.assign({}, state, {
      destinationQuery: '',
      destinationResults: []
    });

  case types.REVERSE_INPUTS:
    return Object.assign({}, state, {
      originResults: state.destinationResults,
      originQuery: state.destinationQuery,
      destinationResults: state.originResults,
      destinationQuery: state.originQuery
    });

  case types.DIRECTIONS_MODE:
    return Object.assign({}, state, {
      mode: action.mode
    });

  case types.DIRECTIONS:
    return Object.assign({}, state, {
      directions: action.directions
    });

  default:
    return state;
  }
}

const rootReducer = combineReducers({
  data
});

export default rootReducer;
