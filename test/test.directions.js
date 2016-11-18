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
    setup({
      geocoder: {
        proximity: [-79.45, 43.65]
      }
    });

    directions.setOrigin('Queen Street');
    directions.setDestination([-77, 41]);

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
      t.end();
    }));

  });

  tt.end();
});

