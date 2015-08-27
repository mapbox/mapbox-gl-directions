import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as RoutingActions from '../actions';
import { decode } from 'polyline';

// Components
import InputsControl from '../components/inputs';
import RouteSummaryControl from '../components/route_summary';
import InstructionsControl from '../components/instructions';

import directionsStyle from '../directions_style';

class App extends Component {

  constructor(props) {
    super(props);

    this.map = props.map;
    this.onMouseDown = this._onMouseDown.bind(this);
    this.onMouseMove = this._onMouseMove.bind(this);
    this.onMouseUp = this._onMouseUp.bind(this);
  }

  mousePos(e) {
    const el = this.map.getContainer();
    const rect = el.getBoundingClientRect();
    return new mapboxgl.Point(
      e.clientX - rect.left - el.clientLeft,
      e.clientY - rect.top - el.clientTop
    );
  }

  _onMouseDown(e) {
    this.map.featuresAt(this.mousePos(e), {
      radius: 10,
      includeGeometry: true,
      layer: [
        'directions-origin-point',
        'directions-destination-point'
      ]
    }, (err, features) => {
      if (err) throw err;
      if (features.length) {
        this.dragging = features[0];
      }
    });
  }

  _onMouseMove(e) {
    if (this.dragging) {

      // Disable map dragging.
      e.stopPropagation();
      e.preventDefault();

      const lngLat = this.map.unproject(this.mousePos(e));
      const mode = this.dragging.properties.id;
      this.props.dispatch(RoutingActions.queryPointFromMap(lngLat, mode));
    }
  }

  _onMouseUp() {
    this.dragging = false;
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

      map.getContainer().addEventListener('mousedown', this.onMouseDown);
      map.getContainer().addEventListener('mousemove', this.onMouseMove, true);
      map.getContainer().addEventListener('mouseup', this.onMouseUp);

      // Map event handlers
      map.on('click', (e) => {
        const { data, dispatch } = this.props;

        map.featuresAt(e.point, {
          radius: 10,
          includeGeometry: true,
          layer: [
            'directions-origin-point',
            'directions-destination-point'
          ]
        }, (err, features) => {
          if (err) throw err;
          if (!features.length) {
            const mode = (data.origin.geometry) ? 'destination' : 'origin';
            dispatch(RoutingActions.queryPointFromMap(e.lngLat, mode));
          }
        });
      }.bind(this));

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

    map.getSource('directions').setData(geojson);

    if (!data.origin.geometry && data.destination.geometry) {
      map.flyTo({ center: data.destination.geometry.coordinates });
    } else if (!data.destination.geometry && data.origin.geometry) {
      map.flyTo({ center: data.origin.geometry.coordinates });
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
          <RouteSummaryControl
            unit={data.unit}
            data={data.directions}
            routeIndex={data.routeIndex}
          />
          <InstructionsControl
            unit={data.unit}
            data={data.directions}
            routeIndex={data.routeIndex}
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
