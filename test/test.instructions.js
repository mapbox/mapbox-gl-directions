'use strict';

const once = require('lodash.once');
const test = require('tape');

test('Directions#instructionControl', tt => {
  tt.test('displayed', t => {
    t.plan(2);
    const container = document.createElement('div');
    const map = new mapboxgl.Map({ container: container });
    const directions = new mapboxgl.Directions();
    map.addControl(directions);

    directions.setOrigin([-79, 43]);
    directions.setDestination([-77, 41]);
    directions.on('route', once((e) => {
      t.ok(e.route, 'route is emitted');
      t.ok(container.querySelector('.directions-control-directions').textContent, 'instructions are shown');
    }));
  });

  tt.test('error', t => {
    t.plan(1);
    const container = document.createElement('div');
    const map = new mapboxgl.Map({ container: container });
    const directions = new mapboxgl.Directions();
    map.addControl(directions);

    directions.setOrigin('Montreal Quebec');
    directions.setDestination('Toledo Spain');
    directions.on('error', once((e) => {
      t.ok(e.error, 'error is emitted');
    }));
  });

  tt.end();
});

