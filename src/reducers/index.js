import { combineReducers } from 'redux';
import * as types from '../constants/action_types.js';

const initialState = {

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

function inputs(state = initialState, action) {
  switch (action.type) {
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

  case types.ORIGIN_COORDINATES:
    return Object.assign({}, state, {
      originCoordinates: action.coords
    });

  case types.DESTINATION_COORDINATES:
    return Object.assign({}, state, {
      destinationCoordinates: action.coords
    });

  default:
    return state;
  }
}

// One for now `inputs` ... will add more.
const rootReducer = combineReducers({
  inputs
});

export default rootReducer;
