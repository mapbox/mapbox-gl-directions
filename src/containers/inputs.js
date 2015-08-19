import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routingActions from '../actions';

import InputsControl from '../components/inputs';

class Inputs extends Component {
  render() {
    const { inputs, dispatch } = this.props;
    const actions = bindActionCreators(routingActions, dispatch);

    return (
      <InputsControl
        inputs={inputs}
        actions={actions}
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
