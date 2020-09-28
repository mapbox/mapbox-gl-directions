import * as types from '../constants/action_types.js';
import deepAssign from 'deep-assign';

const initialState = {
  // Options set on initialization
  api: 'https://api.mapbox.com/directions/v5/',
  profile: 'mapbox/driving-traffic',
  alternatives: false,
  congestion: false,
  unit: 'imperial',
  flyTo: true,
  placeholderOrigin: 'Choose a starting place',
  placeholderDestination: 'Choose destination',
  zoom: 16,
  language: 'en',
  compile: null,
  proximity: false,
  styles: [],

  // UI controls
  controls: {
    profileSwitcher: true,
    inputs: true,
    instructions: true
  },

  // Optional setting to pass options available to mapbox-gl-geocoder
  geocoder: {},

  interactive: true,

  // Container for client registered events
  events: {},

  // Marker feature drawn on the map at any point.
  origin: {},
  destination: {},
  hoverMarker: {},
  waypoints: [],

  // User input strings or result returned from geocoder
  originQuery: null,
  destinationQuery: null,
  originQueryCoordinates: null,
  destinationQueryCoordinates: null,

  // Directions data
  directions: [],
  routeIndex: 0, 
  routePadding: 80
};

function data(state = initialState, action) {
  switch (action.type) {
  case types.SET_OPTIONS:
    return deepAssign({}, state, action.options);

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
      waypoints: action.waypoints
    });

  case types.ORIGIN_QUERY:
    return Object.assign({}, state, {
      originQuery: action.query
    });

  case types.DESTINATION_QUERY:
    return Object.assign({}, state, {
      destinationQuery: action.query
    });

  case types.ORIGIN_FROM_COORDINATES:
    return Object.assign({}, state, {
      originQueryCoordinates: action.coordinates
    });

  case types.DESTINATION_FROM_COORDINATES:
    return Object.assign({}, state, {
      destinationQueryCoordinates: action.coordinates
    });

  case types.ORIGIN_CLEAR:
    return Object.assign({}, state, {
      origin: {},
      originQuery: '',
      waypoints: [],
      directions: []
    });

  case types.DESTINATION_CLEAR:
    return Object.assign({}, state, {
      destination: {},
      destinationQuery: '',
      waypoints: [],
      directions: []
    });

  case types.DIRECTIONS:
    return Object.assign({}, state, {
      directions: action.directions
    });

  case types.ROUTE_INDEX:
    return Object.assign({}, state, {
      routeIndex: action.routeIndex
    });

  case types.ERROR:
    return Object.assign({}, state, {
      error: action.error
    });

  default:
    return state;
  }
}

export default data;
