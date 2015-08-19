import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import configureStore from '../store/configure_store';

// Containers
import Inputs from './inputs';
import Errors from './errors';
import Routes from './routes';
import Instructions from './instructions';

const store = configureStore();

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
