import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as RoutingActions from '../actions';

// Components
import InputsControl from '../components/inputs';
import RoutesControl from '../components/routes';
import InstructionsControl from '../components/instructions';

import directionsStyle from '../directions_style';

class App extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var map = this.props.map;

    map.on('style.load', () => {

      // Add and set data theme layer/style
      map.addSource('directions', {
        type: 'geojson',
        data: {
          type: 'featureCollection',
          features: []
        }
      });

      directionsStyle.forEach((style) => {
        map.addLayer(style);
      });

      // Map event handlers
      map.on('click', (e) => {
        console.log(e);
      });

    });
  }

  componentWillReceiveProps() {
    // TODO manage any map updating here.
    console.log('Map updating happens here', this.props);
  }

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
