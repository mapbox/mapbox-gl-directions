'use strict';
var mapboxgl = require('mapbox-gl');
var MapboxGeocoder = require('../src/index');
var insertCss = require('insert-css');
var fs = require('fs');
mapboxgl.accessToken = window.localStorage.getItem('MapboxAccessToken');

insertCss(fs.readFileSync('./node_modules/mapbox-gl/dist/mapbox-gl.css', 'utf8'));
var mapDiv = document.body.appendChild(document.createElement('div'));
mapDiv.style = 'position:absolute;top:0;right:0;left:0;bottom:0;';

var map = new mapboxgl.Map({
  hash: true,
  container: mapDiv,
  style: 'mapbox://styles/mapbox/streets-v9',
  center: [-79.4512, 43.6568],
  zoom: 13
});

// ui
// var button = document.body.appendChild(document.createElement('button'));
// button.style = 'position:absolute;top:10px;left:10px;z-index:10;';
var button = document.createElement('button');
button.style = 'z-index:10;';
button.textContent = 'click me';

// directions
var MapboxDirections = require('../src/index');
var directions = new MapboxDirections({
  accessToken: window.localStorage.getItem('MapboxAccessToken'),
  unit: 'metric',
  profile: 'cycling',
  container: 'directions'
});
window.directions = directions;

map.getContainer().querySelector('.mapboxgl-ctrl-bottom-left').appendChild(button);
map.addControl(directions);

map.on('load', () => {
  button.addEventListener('click', function() {
    directions.setOrigin([-79.4512, 43.6568]);
    directions.setDestination('Montreal Quebec');
  });
});
