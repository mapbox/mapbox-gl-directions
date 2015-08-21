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
    return {
      originQuery: action.query,
      originResults: action.results,
      destinationResults: state.destinationResults,
      destinationQuery: state.destinationQuery
    };

  case types.DESTINATION_INPUT:
    return {
      originQuery: state.originQuery,
      originResults: state.originResults,
      destinationQuery: action.query,
      destinationResults: action.results
    };

  case types.ORIGIN_CLEAR:
    return {
      originQuery: '',
      originResults: [],
      destinationResults: state.destinationResults,
      destinationQuery: state.destinationQuery
    };

  case types.DESTINATION_CLEAR:
    return {
      originQuery: state.originQuery,
      originResults: state.originResults,
      destinationQuery: '',
      destinationResults: []
    };

  case types.REVERSE_INPUTS:
    return {
      originResults: state.destinationResults,
      originQuery: state.destinationQuery,
      destinationResults: state.originResults,
      destinationQuery: state.originQuery
    };

  default:
    return state;
  }
}

// One for now `inputs` ... will add more.
const rootReducer = combineReducers({
  inputs
});

export default rootReducer;
