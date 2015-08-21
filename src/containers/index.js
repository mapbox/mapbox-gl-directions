import React, { Component, PropTypes } from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';
import App from './app';

const storeWithMiddleware = applyMiddleware(thunk)(createStore);

export default class Root extends Component {
  render() {
    const { map, options } = this.props;

    return (
      <Provider store={storeWithMiddleware(rootReducer)}>
        {() => <App options={options} map={map} /> }
      </Provider>
    );
  }
}

Root.propTypes = {
  map: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired
};
