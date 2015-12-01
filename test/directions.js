'use strict';

const test = require('tape');

test('directions', (tt) => {
  let container, directions;

  function setup(opts) {
    container = document.createElement('div');
    directions = mapboxgl.Directions(container, opts);
  }

  tt.test('initialized', t => {
    setup();
    t.ok(directions);
    t.end();
  });

  tt.test('set/get inputs', t => {
    t.plan(4);
    setup();

    directions.setOrigin('Toronto');
    directions.setDestination([-77, 41]);

    directions.on('directions.origin', (e) => {
      t.ok(e.feature);
      t.ok(directions.getOrigin());
    });

    directions.on('directions.route', (e) => {
      t.ok(directions.getDestination());
      t.ok(e.route);
    });
  });

  tt.end();
});

