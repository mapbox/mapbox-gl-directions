import { combineReducers } from 'redux';
import * as types from '../constants/action_types.js';

const initialState = {
  mode: 'driving',
  unit: 'imperial',

  // Marker feature drawn on the map at any point.
  origin: {},
  destination: {},
  hoverMarker: {},

  // Original input user entered
  originQuery: '',
  destinationQuery: '',

  // Arrays returned from geocode result.
  originResults: [],
  destinationResults: [],

  originCoordinates: [], // [Lng, Lat]
  destinationCoordinates: [], // [Lng, Lat]

  // Directions data
  directions: [],
  routeIndex: 0,
  refresh: false
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

  case types.HOVER_MARKER:
    return Object.assign({}, state, {
      hoverMarker: action.hoverMarker
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
      origin: {},
      originQuery: '',
      originResults: [],
      directions: []
    });

  case types.DESTINATION_CLEAR:
    return Object.assign({}, state, {
      destination: {},
      destinationQuery: '',
      destinationResults: [],
      directions: []
    });

  case types.REVERSE_INPUTS:
    return Object.assign({}, state, {
      origin: action.destination,
      originResults: state.destinationResults,
      originQuery: state.destinationQuery,
      destination: action.origin,
      destinationResults: state.originResults,
      destinationQuery: state.originQuery,
      refresh: true
    });

  case types.DIRECTIONS_MODE:
    return Object.assign({}, state, {
      mode: action.mode
    });

  case types.DIRECTIONS:
    return Object.assign({}, state, {
      directions: action.directions
    });

  case types.REFRESH_CLEAR:
    return Object.assign({}, state, {
      refresh: false
    });

  case types.RESULT_FROM_MAP:
    return Object.assign({}, state, {
      refresh: true
    });

  case types.ROUTE_INDEX:
    return Object.assign({}, state, {
      routeIndex: action.routeIndex
    });

  default:
    return state;
  }
}

const rootReducer = combineReducers({
  data
});

export default rootReducer;
