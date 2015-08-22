import { combineReducers } from 'redux';
import * as types from '../constants/action_types.js';

const initialState = {
  originQuery: '',
  originResults: [],
  destinationQuery: '',
  destinationResults: []
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

  default:
    return state;
  }
}

// One for now `inputs` ... will add more.
const rootReducer = combineReducers({
  inputs
});

export default rootReducer;
