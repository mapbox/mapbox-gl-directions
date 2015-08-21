import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as RoutingActions from '../actions';

// Components
import InputsControl from '../components/inputs';
import RoutesControl from '../components/routes';
import InstructionsControl from '../components/instructions';

class App extends Component {
  render() {
    const { inputs, dispatch } = this.props;
    const actions = bindActionCreators(RoutingActions, dispatch);

    return (
      <div>
        <div className='directions-control directions-control-inputs'>
          <InputsControl
            {...actions}
            inputs={inputs}
          />
        </div>
        <div className='directions-control directions-control-directions'>
          <RoutesControl
            inputs={inputs}
          />
          <InstructionsControl
            inputs={inputs}
          />
        </div>
      </div>
    );
  }
}

function select(state) {
  return {
    inputs: state.inputs
  };
}

export default connect(select)(App);

App.propTypes = {
  inputs: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  map: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired
};
