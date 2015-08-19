import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { addOrigin, addDestination } from '../actions';

import RoutesControl from '../components/routes';

class Routes extends Component {
  render() {
    const { inputs, dispatch } = this.props;
    const actions = bindActionCreators(addOrigin, addDestination, dispatch);

    return (
      <RoutesControl
        inputs={inputs}
        actions={actions}
      />
    );
  }
}

function select(state) {
  return {
    origin: state.origin,
    destination: state.destination
  };
}

export default connect(select)(Routes);
