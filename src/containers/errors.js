import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routingActions from '../actions';

import ErrorsControl from '../components/errors';

class Errors extends Component {
  render() {
    const { inputs, dispatch } = this.props;
    const actions = bindActionCreators(routingActions, dispatch);

    return (
      <ErrorsControl
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

export default connect(select)(Errors);
