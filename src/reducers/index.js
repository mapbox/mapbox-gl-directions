import { combineReducers } from 'redux';
import { ADD_ORIGIN, ADD_DESTINATION } from '../actions';

function inputs(state = {
  origin: '',
  destination: ''
}, action) {
  switch (action.type) {
  case ADD_ORIGIN:

    console.log('ORIGIN SHOULD BE ADDED!!!');

    return state;

  case ADD_DESTINATION:
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
