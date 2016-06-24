'use strict';
/* global mapboxgl */

require('../');
mapboxgl.accessToken = window.localStorage.getItem('MapboxAccessToken');

var map = new mapboxgl.Map({
  hash: true,
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9',
  center: [-79.4512, 43.6568],
  zoom: 13
});

var directions = new mapboxgl.Directions({
  unit: 'metric',
  profile: 'cycling',
  container: 'directions'
});

var button = document.createElement('button');
button.textContent = 'click me';

map.getContainer().querySelector('.mapboxgl-ctrl-bottom-left').appendChild(button);
map.addControl(directions);

map.on('load', () => {
  button.addEventListener('click', function() {
    directions.setOrigin('Montreal Quebec');
    directions.setDestination('Toronto');
  });
});
