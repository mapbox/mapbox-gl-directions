import { combineReducers } from 'redux';
import { ORIGIN_RESULTS, DESTINATION_RESULTS } from '../constants/action_types.js';

const initialState = {
  originResults: [],
  destinationResults: []
};

function inputs(state = initialState, action) {
  switch (action.type) {
  case ORIGIN_RESULTS:
    return {
      originResults: action.results,
      destinationResults: state.destinationResults
    };

  case DESTINATION_RESULTS:
    return {
      originResults: state.originResults,
      destinationResults: action.results
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
