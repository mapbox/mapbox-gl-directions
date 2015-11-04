var mapboxgl = require('mapbox-gl');
var Directions = require('../');

mapboxgl.accessToken = 'pk.eyJ1IjoidHJpc3RlbiIsImEiOiJiUzBYOEJzIn0.VyXs9qNWgTfABLzSI3YcrQ';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v8',
  center: [-79.4512, 43.6568],
  zoom: 13
});

var directions = Directions(document.getElementById('directions'), {
  unit: 'metric',
  profile: 'walking'
});

var button = document.createElement('button');
button.textContent = 'click me';

map.getContainer().querySelector('.mapboxgl-ctrl-bottom-left').appendChild(button);

map.addControl(directions);

map.on('load', () => {
  button.addEventListener('click', function() {
    console.log(directions.getOrigin());
  });
});
