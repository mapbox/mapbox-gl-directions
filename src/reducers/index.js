import { combineReducers } from 'redux';
import { QUERY_ORIGIN, QUERY_DESTINATION } from '../constants/action_types.js';

const initialState = {
  origin: '',
  destination: '',
  results: []
};

function inputs(state = initialState, action) {
  switch (action.type) {
  case QUERY_ORIGIN:
    return state;

  case QUERY_DESTINATION:
    return state;

  default:
    return state;
  }
}

// One for now `inputs` ... will add more.
const rootReducer = combineReducers({
  inputs
});

export default rootReducer;
