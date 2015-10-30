'use strict';

const test = require('tape');
const mapboxgl = require('mapbox-gl');

mapboxgl.accessToken = process.env.MapboxAccessToken;

// Tests
require('./directions');
require('./ui/inputs');

// close the smokestack window once tests are complete
test('shutdown', (t) => {
  t.end();
  setTimeout(() => {
    window.close();
  });
});
