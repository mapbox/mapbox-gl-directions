'use strict';
var mapboxgl = require('mapbox-gl');
var insertCss = require('insert-css');
var fs = require('fs');
mapboxgl.accessToken = window.localStorage.getItem('MapboxAccessToken');

// var directionsDiv = document.body.appendChild(document.createElement('div'));
// directionsDiv.id = 'directions';

insertCss(fs.readFileSync('./src/mapbox-gl-directions.css', 'utf8'));
insertCss(fs.readFileSync('./node_modules/mapbox-gl/dist/mapbox-gl.css', 'utf8'));
var mapDiv = document.body.appendChild(document.createElement('div'));
mapDiv.style = 'position:absolute;top:0;right:0;left:0;bottom:0;';

var map = window.map = new mapboxgl.Map({
  hash: true,
  container: mapDiv,
  center: [-79.4512, 43.6568],
  zoom: 13
});

// remove control
var button = document.body.appendChild(document.createElement('button'));
button.style = 'z-index:10;position:absolute;top:10px;right:10px;';
button.textContent = 'Remove directions control';

// remove all waypoints
var removeWaypointsButton = document.body.appendChild(document.createElement('button'));
removeWaypointsButton.style = 'z-index:10;position:absolute;top:30px;right:10px;';
removeWaypointsButton.textContent = 'Remove all waypoints';

// directions
var coordinatesGeocoder = function (query) {
  var matches = query.match(/^[ ]*(-?\d+\.?\d*)[, ]+(-?\d+\.?\d*)[ ]*$/);
  if (!matches) {
    return null;
  }
  function coordinateFeature(lng, lat) {
    var lng = Number(lng);
    var lat = Number(lat);
    return {
      center: [lng, lat],
      geometry: {
        type: "Point",
        coordinates: [lng, lat]
      },
      place_name: 'Lat: ' + lat + ', Lng: ' + lng,
      place_type: ['coordinate'],
      properties: {},
      type: 'Feature'
    };
  }
  var coord1 = matches[1];
  var coord2 = matches[2];
  var geocodes = [];
  if (coord1 < -90 || coord1 > 90) {
    // must be lng, lat
    geocodes.push(coordinateFeature(coord1, coord2));
  }
  if (coord2 < -90 || coord2 > 90) {
    // must be lat, lng
    geocodes.push(coordinateFeature(coord2, coord1));
  }
  if (geocodes.length == 0) {
    // else could be either
    geocodes.push(coordinateFeature(coord1, coord2));
    geocodes.push(coordinateFeature(coord2, coord1));
  }
  console.log(geocodes);
  return geocodes;
};
var MapboxDirections = require('../src/index');
var directions = new MapboxDirections({
  accessToken: window.localStorage.getItem('MapboxAccessToken'),
  unit: 'metric',
  profile: 'mapbox/cycling',
  geocoder: {
    localGeocoder: coordinatesGeocoder
  }
});
window.directions = directions;

map.addControl(directions, 'top-left');

map.on('load', () => {
  button.addEventListener('click', function() {
    map.removeControl(directions);
  });

  removeWaypointsButton.addEventListener('click', function() {
    directions.removeRoutes();
  });
});
