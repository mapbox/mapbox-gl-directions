import * as types from '../constants/action_types.js';

const initialState = {
  profile: 'driving',

  // Marker feature drawn on the map at any point.
  origin: {},
  destination: {},
  hoverMarker: {},
  hoverWayPoint: {},

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
  wayPoints: [],

  routeIndex: 0,
  refresh: false
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
      origin: action.origin
    });

  case types.DESTINATION:
    return Object.assign({}, state, {
      destination: action.destination
    });

  case types.HOVER_MARKER:
    return Object.assign({}, state, {
      hoverMarker: action.hoverMarker
    });

  case types.HOVER_WAYPOINT:
    return Object.assign({}, state, {
      hoverWayPoint: action.hoverWayPoint
    });

  case types.WAYPOINTS:
    return Object.assign({}, state, {
      wayPoints: [
        ...state.wayPoints,
        action.wayPoint
      ]
    });

  case types.REDUCE_WAYPOINTS:
    return Object.assign({}, state, {
      wayPoints: state.wayPoints.filter((way) => {
        return way[0].toFixed(3) !== action.wayPoint[0].toFixed(3) &&
               way[1].toFixed(3) !== action.wayPoint[1].toFixed(3);
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
      wayPoints: [],
      directions: []
    });

  case types.DESTINATION_CLEAR:
    return Object.assign({}, state, {
      destination: {},
      destinationQuery: '',
      destinationResults: [],
      wayPoints: [],
      directions: []
    });

  case types.REVERSE_INPUTS:
    return Object.assign({}, state, {
      origin: action.origin,
      originResults: state.destinationResults,
      originQuery: state.destinationQuery,
      destination: action.destination,
      destinationResults: state.originResults,
      destinationQuery: state.originQuery,
      refresh: true
    });

  case types.DIRECTIONS:
    return Object.assign({}, state, {
      directions: action.directions
    });

  case types.REFRESH_CLEAR:
    return Object.assign({}, state, {
      refresh: false
    });

  case types.RESULT_FROM_MAP:
    return Object.assign({}, state, {
      hoverWayPoint: {},
      refresh: true
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
