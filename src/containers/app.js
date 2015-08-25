import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as RoutingActions from '../actions';
import { decode } from 'polyline';

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
    const { map } = this.props;

    map.on('style.load', () => {

      const geojson = new mapboxgl.GeoJSONSource({
        data: {
          type: 'FeatureCollection',
          features: []
        }
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

  componentWillReceiveProps(props) {
    const { map, data } = props;
    const geojson = {
      type: 'FeatureCollection',
      features: [data.origin, data.destination].filter((d) => {
        return d.geometry;
      })
    };

    if (data.directions.length) {
      geojson.features.push({
        geometry: {
          type: 'LineString',
          coordinates: decode(data.directions[0].geometry, 6).map((c) => {
            return c.reverse();
          })
        }
      });
    }

    // TODO fitBounds to geojson?
    if (geojson.features.length) {
      map.getSource('directions').setData(geojson);

      if (!data.origin.geometry) {
        map.flyTo({ center: data.destination.geometry.coordinates });
      } else if (!data.destination.geometry) {
        map.flyTo({ center: data.origin.geometry.coordinates });
      }
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
            unit={data.unit}
            data={data.directions}
          />
          <InstructionsControl
            unit={data.unit}
            data={data.directions}
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
