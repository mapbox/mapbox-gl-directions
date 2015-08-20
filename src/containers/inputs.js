import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as RoutingActions from '../actions';

import InputsControl from '../components/inputs';

class Inputs extends Component {
  render() {
    const { inputs, dispatch } = this.props;
    const actions = bindActionCreators(RoutingActions, dispatch);

    return (
      <InputsControl
        {...actions}
        inputs={inputs}
      />
    );
  }
}

function select(state) {
  return {
    inputs: state.inputs
  };
}

export default connect(select)(Inputs);
