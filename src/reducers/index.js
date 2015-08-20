import { combineReducers } from 'redux';
import { QUERY_RESULTS } from '../constants/action_types.js';

const initialState = {
  results: []
};

function inputs(state = initialState, action) {
  switch (action.type) {
  case QUERY_RESULTS:
    return {
      results: action.results
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
