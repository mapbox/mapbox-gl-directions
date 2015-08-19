import { combineReducers } from 'redux';
import { ADD_ORIGIN, ADD_DESTINATION } from '../actions';

export default function inputs(state = {
  origin: false,
  destination: false
}, action) {
  switch (action.type) {
  case ADD_ORIGIN:
    return state;

  case ADD_DESTINATION:
    return state;

  default:
    return state;
  }
}

const rootReducer = combineReducers({
  inputs
});

export default rootReducer;
