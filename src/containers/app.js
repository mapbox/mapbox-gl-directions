import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as RoutingActions from '../actions';
import { decode } from 'polyline';
import debounce from 'debounce';

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
      layer: [
        'directions-origin-point',
        'directions-destination-point',
        'directions-waypoint-point'
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

      this.map.getContainer().classList.add('directions-drag');
      const lngLat = this.map.unproject(this.mousePos(e));
      const coords = [lngLat.lng, lngLat.lat];
      const { dispatch } = this.props;

      switch (this.dragging.layer.id) {
        case 'directions-origin-point':
          debounce(dispatch(RoutingActions.queryPointFromMap(coords, 'origin')), 100);
        break;
        case 'directions-destination-point':
          debounce(dispatch(RoutingActions.queryPointFromMap(coords, 'destination')), 100);
        break;
        case 'directions-waypoint-point':
          debounce(dispatch(RoutingActions.hoverWayPoint(coords)), 100);
        break;
      }
    }
  }

  _onMouseUp() {
    const {dispatch, data} = this.props;

    if (this.dragging && data.hoverWayPoint.geometry) {
      switch (this.dragging.layer.id) {
        case 'directions-waypoint-point':
          dispatch(RoutingActions.addWayPoint(data.hoverWayPoint));
        break;
      }
    }

    this.dragging = false;
    this.map.getContainer().classList.remove('directions-drag');
  }

  componentDidMount() {
    const { map } = this.props;

    map.on('load', () => {

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

      map.on('mousemove', (e) => {
        const { dispatch } = this.props;

        // Adjust cursor state on routes
        map.featuresAt(e.point, {
          radius: 10,
          layer: [
            'directions-route-line-alt',
            'directions-route-line'
          ]
        }, (err, features) => {
          if (err) throw err;
          if (features.length) {
            map.getContainer().classList.add('directions-select');
          } else {
            map.getContainer().classList.remove('directions-select');
          }
        });

        // Add a possible waypoint marker
        // when hovering over the active route line
        map.featuresAt(e.point, {
          radius: 5,
          layer: 'directions-route-line'
        }, (err, features) => {
          if (err) throw err;
          if (features.length) {
            var coords = e.lngLat;
            dispatch(RoutingActions.hoverWayPoint([coords.lng, coords.lat]));
          } else {
            dispatch(RoutingActions.hoverWayPoint(null));
          }
        });

      }.bind(this));

      // Map event handlers
      map.on('click', (e) => {
        const { data, dispatch } = this.props;
        const coords = [e.lngLat.lng, e.lngLat.lat];

        if (!data.origin.geometry) {
          dispatch(RoutingActions.queryPointFromMap(coords, 'origin'));
        } else {
          map.featuresAt(e.point, {
            radius: 10,
            layer: [
              'directions-origin-point',
              'directions-destination-point',
              'directions-route-line-alt'
            ]
          }, (err, features) => {
            if (err) throw err;
            if (features.length && features[0].properties.route === 'alternate') {
              const index = features[0].properties['route-index'];
              dispatch(RoutingActions.setRouteIndex(index));
            }

            if (!features.length) {
              dispatch(RoutingActions.queryPointFromMap(coords, 'destination'));
            }
          });
        }
      }.bind(this));

    });
  }

  componentWillReceiveProps(props) {
    const { map, data } = props;

    const geojson = {
      type: 'FeatureCollection',
      features: [
        data.origin,
        data.destination,
        data.hoverMarker,
        data.hoverWayPoint,
        ...data.wayPoints
      ].filter((d) => {
        return d.geometry;
      })
    };

    if (data.directions.length) {
      data.directions.forEach((feature, index) => {

        feature = {
          geometry: {
            type: 'LineString',
            coordinates: decode(feature.geometry, 6).map((c) => {
              return c.reverse();
            })
          },
          properties: {
            'route-index': index,
            route: (index === data.routeIndex) ? 'selected' : 'alternate'
          }
        };

        geojson.features.push(feature);
      });
    }

    map.getSource('directions').setData(geojson);

    // TODO Redo this. Use TURF for bounds?
    if (!this.dragging) {
      if (!data.origin.geometry && data.destination.geometry) {
        map.flyTo({ center: data.destination.geometry.coordinates });
      } else if (!data.destination.geometry && data.origin.geometry) {
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
          <RouteSummaryControl
            unit={data.unit}
            data={data.directions}
            routeIndex={data.routeIndex}
          />
          <InstructionsControl
            unit={data.unit}
            data={data.directions}
            routeIndex={data.routeIndex}
            hoverMarker={actions.hoverMarker}
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
