'use strict';

const test = require('tape');
const once = require('lodash.once');

test('directions', (tt) => {
  let container, directions;

  function setup(opts) {
    container = document.createElement('div');
    directions = new mapboxgl.Directions(opts, Object.assign({
      container: container
    }, opts));
  }

  tt.test('initialized', t => {
    setup();
    t.ok(directions, 'directions is initialized');
    t.end();
  });

  tt.test('set/get inputs', t => {
    t.plan(5);
    setup();

    directions.setOrigin('Toronto');
    directions.setDestination([-77, 41]);

    directions.on('directions.origin', once((e) => {
      t.ok(directions.getOrigin().type, 'origin feature is present from get');
      t.ok(e.feature, 'origin feature is in the event object');
    }));

    directions.on('directions.destination', once((e) => {
      t.ok(directions.getDestination().type, 'destination feature is present from get');
      t.ok(e.feature, 'destination feature is in the event object');
    }));

    directions.on('directions.route', once((e) => {
      t.ok(e.route, 'routing data was passed');
    }));

  });

  tt.end();
});

