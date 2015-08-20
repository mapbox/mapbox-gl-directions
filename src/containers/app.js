import React, { Component, PropTypes } from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from '../reducers';

// Containers
import Inputs from './inputs';
import Errors from './errors';
import Routes from './routes';
import Instructions from './instructions';

const store = createStore(rootReducer);

export default class App extends Component {
  render() {
    const { control, options } = this.props;

    return (
      <Provider store={store}>
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
