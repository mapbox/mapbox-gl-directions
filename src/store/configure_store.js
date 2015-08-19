'use strict';

import { createStore, combineReducers } from 'redux';
import * as reducers from '../reducers';

const reducer = combineReducers(reducers);

export default function configureStore() {
  return createStore(reducer);
}
