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
    const { map, data } = this.props;

    map.on('style.load', () => {

      const geojson = new mapboxgl.GeoJSONSource({
        data: data.geojson
      });

      // Add and set data theme layer/style
      map.addSource('directions', geojson);

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
    const { map, data } = this.props;

    if (data.geojson.features.length) {

      const geojson = new mapboxgl.GeoJSONSource({
        data: data.geojson
      });

      map.getSource('directions').setData(geojson);

      console.log('geojson', data.geojson);
      // map.fitBounds[[minLat, minLng], [maxLat, maxLng]]
    }
  }

  render() {
    const { data, dispatch } = this.props;
    const actions = bindActionCreators(RoutingActions, dispatch);

    return (
      <div>
        <div className='directions-control directions-control-inputs'>
          <InputsControl
            {...actions}
            data={data}
          />
        </div>
        {data.directions.length !== 0 && <div className='directions-control directions-control-directions'>
          <RoutesControl
            data={data}
          />
          <InstructionsControl
            data={data}
          />
        </div>}
      </div>
    );
  }
}

function select(state) {
  return {
    data: state.data
  };
}

export default connect(select)(App);

App.propTypes = {
  data: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  map: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired
};
