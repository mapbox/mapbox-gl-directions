'use strict';

const once = require('lodash.once');
const test = require('tape');

test('Directions#instructionControl', tt => {
  let container, map, directions;

  function setup(opts) {
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    var MapboxDirections = require('..');
    directions = new MapboxDirections(opts);
    map.addControl(directions);
  }

  tt.test('displayed', t => {
    setup();
    t.plan(2);
    directions.setOrigin([-79, 43]);
    directions.setDestination([-77, 41]);
    directions.on('route', once((e) => {
      t.ok(e.route, 'route is emitted');
      t.ok(container.querySelector('.directions-control-directions').textContent, 'instructions are shown');
    }));
  });

  tt.test('error', t => {
    setup();
    t.plan(1);
    directions.setOrigin('Montreal Quebec');
    directions.setDestination('Toledo Spain');
    directions.on('error', once((e) => {
      t.ok(e.error, 'error is emitted');
    }));
  });

  tt.end();
});

