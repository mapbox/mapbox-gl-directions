import React, { Component, PropTypes } from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';

// Containers
import Inputs from './inputs';
import Errors from './errors';
import Routes from './routes';
import Instructions from './instructions';

const storeWithMiddleware = applyMiddleware(thunk)(createStore);

export default class App extends Component {
  render() {
    const { control, options } = this.props;

    return (
      <Provider store={storeWithMiddleware(rootReducer)}>
        {() =>
          <div>
            {control === 'inputs' && <Inputs options={options} />}
            {control === 'routes' && <Routes options={options} />}
            {control === 'errors' && <Errors options={options} />}
            {control === 'instructions' && <Instructions options={options} />}
          </div>
        }
      </Provider>
    );
  }
}

App.propTypes = {
  options: PropTypes.object,
  control: PropTypes.string.isRequired
};
