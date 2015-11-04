import * as types from '../constants/action_types.js';

const initialState = {
  profile: 'driving',

  // Marker feature drawn on the map at any point.
  origin: {},
  destination: {},
  hoverMarker: {},

  // Original input user entered
  originQuery: '',
  destinationQuery: '',

  // Arrays returned from geocode result.
  originResults: [],
  destinationResults: [],

  originCoordinates: [], // [Lng, Lat]
  destinationCoordinates: [], // [Lng, Lat]

  // Directions data
  directions: [],

  // Any waypoints
  waypoints: [],

  routeIndex: 0
};

function data(state = initialState, action) {
  switch (action.type) {
  case types.SET_OPTIONS:
    return Object.assign({}, state, action.options);

  case types.DIRECTIONS_PROFILE:
    return Object.assign({}, state, {
      profile: action.profile
    });

  case types.ORIGIN:
    return Object.assign({}, state, {
      origin: action.origin,
      hoverMarker: {}
    });

  case types.DESTINATION:
    return Object.assign({}, state, {
      destination: action.destination,
      hoverMarker: {}
    });

  case types.HOVER_MARKER:
    return Object.assign({}, state, {
      hoverMarker: action.hoverMarker
    });

  case types.WAYPOINTS:
    return Object.assign({}, state, {
      waypoints: [
        ...state.waypoints,
        action.waypoint
      ]
    });

  case types.REMOVE_WAYPOINT:
    const coords = action.waypoint.geometry.coordinates;
    return Object.assign({}, state, {
      waypoints: state.waypoints.filter((way) => {
        const c = way.geometry.coordinates;
        return c[0].toFixed(4) !== coords[0].toFixed(4) &&
          c[1].toFixed(4) !== coords[1].toFixed(4);
      })
    });

  case types.ORIGIN_INPUT:
    return Object.assign({}, state, {
      originQuery: action.query,
      originResults: action.results
    });

  case types.DESTINATION_INPUT:
    return Object.assign({}, state, {
      destinationQuery: action.query,
      destinationResults: action.results
    });

  case types.ORIGIN_CLEAR:
    return Object.assign({}, state, {
      origin: {},
      originQuery: '',
      originResults: [],
      waypoints: [],
      directions: []
    });

  case types.DESTINATION_CLEAR:
    return Object.assign({}, state, {
      destination: {},
      destinationQuery: '',
      destinationResults: [],
      waypoints: [],
      directions: []
    });

  case types.REVERSE_INPUTS:
    return Object.assign({}, state, {
      origin: action.origin,
      originResults: state.destinationResults,
      originQuery: state.destinationQuery,
      destination: action.destination,
      destinationResults: state.originResults,
      destinationQuery: state.originQuery
    });

  case types.DIRECTIONS:
    return Object.assign({}, state, {
      directions: action.directions
    });

  case types.ROUTE_INDEX:
    return Object.assign({}, state, {
      routeIndex: action.routeIndex
    });

  default:
    return state;
  }
}

export default data;
