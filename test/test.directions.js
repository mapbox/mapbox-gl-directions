'use strict';

const test = require('tape');
const once = require('lodash.once');

test('directions', (tt) => {
  var container, map, directions;

  function setup(opts) {
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    const MapboxDirections = require('..');
    directions = new MapboxDirections(opts);
    map.addControl(directions);
  }

  tt.test('initialized', t => {
    setup();
    t.ok(directions, 'directions is initialized');
    t.end();
  });

  tt.test('set/get inputs', t => {
    setup();

    map.on('load', function(e) {
      directions.setOrigin([-116.95820880083824,32.807655722345544]);
      directions.setDestination([-116.95070759690503,32.81334260625454]);

      directions.on('origin', function(e) {
        t.ok(directions.getOrigin(), 'origin feature is present from get');
        t.ok(e.feature, 'origin feature is in the event object');
      });

      directions.on('destination', once((e) => {
        t.ok(directions.getDestination(), 'destination feature is present from get');
        t.ok(e.feature, 'destination feature is in the event object');
      }));

      directions.on('route', once((e) => {
        t.ok(e.route, 'routing data was passed');

        console.log(e.route);

        // get GeoJSON
        const gj = directions.getGeoJSON();
        console.log(gj);

        t.end();
      }));
    });

  });

  tt.end();
});

