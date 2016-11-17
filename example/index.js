'use strict';
var mapboxgl = require('mapbox-gl');
var insertCss = require('insert-css');
var fs = require('fs');
mapboxgl.accessToken = window.localStorage.getItem('MapboxAccessToken');

// var directionsDiv = document.body.appendChild(document.createElement('div'));
// directionsDiv.id = 'directions';

insertCss(fs.readFileSync('./dist/mapbox-gl-directions.css', 'utf8'));
insertCss(fs.readFileSync('./node_modules/mapbox-gl/dist/mapbox-gl.css', 'utf8'));
var mapDiv = document.body.appendChild(document.createElement('div'));
mapDiv.style = 'position:absolute;top:0;right:0;left:0;bottom:0;';

var map = window.map = new mapboxgl.Map({
  hash: true,
  container: mapDiv,
  style: 'mapbox://styles/mapbox/streets-v9',
  center: [-79.4512, 43.6568],
  zoom: 13
});

// ui
var button = document.createElement('button');
button.textContent = 'click me';

// directions
var MapboxDirections = require('../src/index');
var directions = new MapboxDirections({
  accessToken: window.localStorage.getItem('MapboxAccessToken'),
  unit: 'metric',
  profile: 'cycling'
});
window.directions = directions;

map.getContainer().querySelector('.mapboxgl-ctrl-top-right').appendChild(button);
map.addControl(directions, 'top-left');

map.on('load', () => {
  button.addEventListener('click', function() {
    directions.setOrigin([-79.4512, 43.6568]);
    directions.setDestination('Montreal Quebec');
  });
});