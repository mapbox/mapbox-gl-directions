const mapboxgl = require('mapbox-gl');
const test = require('tape');
const Directions = require('../');

mapboxgl.accessToken = process.env.MapboxAccessToken;

test('basics', function(t) {
  var container = document.createElement('div');

  var directions = Directions(container, {
    accessToken: process.env.MapboxAccessToken
  });

  t.ok(directions, 'Directions is initialized');
  t.end();
});

// close the smokestack window once tests are complete
test('shutdown', function(t) {
  t.end();
  setTimeout(function() {
    window.close();
  });
});
