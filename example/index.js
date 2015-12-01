var mapboxgl = require('mapbox-gl');
var Directions = require('../');

mapboxgl.accessToken = window.localStorage.getItem('MapboxAccessToken');

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v8',
  center: [-79.4512, 43.6568],
  zoom: 13
});

var directions = Directions(document.getElementById('directions'), {
  unit: 'metric',
  profile: 'walking',
  proximity: {
    latitude: 66.1,
    longitude: 45.3
  }
});

var button = document.createElement('button');
button.textContent = 'click me';

map.getContainer().querySelector('.mapboxgl-ctrl-bottom-left').appendChild(button);

map.addControl(directions);

map.on('load', () => {
  button.addEventListener('click', function() {
    directions.setOrigin('Toronto');
    directions.setDestination([-78, 42]);
  });
});
