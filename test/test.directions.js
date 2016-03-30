'use strict';

const test = require('tape');
const once = require('lodash.once');

test('directions', (tt) => {
  tt.test('initialized', t => {
    const directions = new mapboxgl.Directions({
      container: document.createElement('div')
    });

    t.ok(directions, 'directions is initialized');
    t.end();
  });

  tt.test('set/get inputs', t => {
    t.plan(5);

    const directions = new mapboxgl.Directions({
      container: document.createElement('div'),
      proximity: [-79.45, 43.65]
    });

    directions.setOrigin('Queen Street');
    directions.setDestination([-77, 41]);

    directions.on('origin', once((e) => {
      t.ok(directions.getOrigin().type, 'origin feature is present from get');
      t.ok(e.feature, 'origin feature is in the event object');
    }));

    directions.on('destination', once((e) => {
      t.ok(directions.getDestination().type, 'destination feature is present from get');
      t.ok(e.feature, 'destination feature is in the event object');
    }));

    directions.on('route', once((e) => {
      t.ok(e.route, 'routing data was passed');
    }));

  });

  /*
  tt.test('Directions#off', t => {
    t.plan(1);

    const directions = new mapboxgl.Directions({
      container: document.createElement('div'),
      proximity: [-79.45, 43.65]
    });

    directions.setOrigin([-77, 41]);

    directions.on('origin', function(e) {
      t.deepEqual(e.feature.geometry.coordinates, [-77, 41], 'origin is only emitted once');
      directions.off('origin');
    });

    directions.setOrigin('Queen Street');
  });
  */

  /*
  tt.test('Directions#off fn', t => {
    t.plan(2);
    directions.setOrigin([-77, 41]);

    function foo(e) {
      t.ok(directions.getOrigin().type, 'origin feature is present from get');
      t.ok(e.feature, 'origin feature is in the event object');
      directions.off(foo);
    }

    directions.on('origin', foo);
    //directions.on('origin', once(bar));
  });
  */

  tt.end();
});

