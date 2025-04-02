'use strict';

const once = require('lodash.once');
const test = require('tape');

const setup = require('./utils/setup');

test('Directions#instructionControl', tt => {
  tt.test('displayed', t => {
    const { directions, container } = setup();
    t.plan(2);
    directions.setOrigin([-77.1, 41]);
    directions.setDestination([-77.3, 41]);
    directions.on('route', once((e) => {
      t.ok(e.route, 'route is emitted');
      t.ok(container.querySelector('.directions-icon-arrive'), 'instructions are shown');
    }));
  });

  tt.test('direction with waypoints are displayed', t => {
    const { directions, container } = setup();

    directions.on('route', once(() => {
      directions.on('route', once((e) => {
        t.ok(e.route, 'route is emitted');
        t.ok(
          container.querySelector('.directions-icon-waypoint'),
          'instructions for waypoint shown'
        );
        t.end();
      }));

      directions.addWaypoint(0, {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [-79.41523694152666, 43.68393045837692]
        },
        properties: {}
      });
    }));


    directions.setOrigin([-79.4486679946892, 43.66968384056892])
    directions.setDestination([-79.39708375091327, 43.677009321432536]);
  });

  tt.test('hide waypoint instructions if showWaypointInstructions equals false', t => {
    const { directions, container } = setup({
      instructions: {
        showWaypointInstructions: false
      }
    });

    directions.on('route', once(() => {
      directions.on('route', once((e) => {
        t.ok(e.route, 'route is emitted');
        t.false(
          container.querySelector('.directions-icon-waypoint'),
          'instructions for waypoint not shown'
        );
        t.end();
      }));

      directions.addWaypoint(0, {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [-79.41523694152666, 43.68393045837692]
        },
        properties: {}
      });
    }));

    directions.setOrigin([-79.4486679946892, 43.66968384056892])
    directions.setDestination([-79.39708375091327, 43.677009321432536]);
  });

  tt.test('error', t => {
    const { directions } = setup();
    t.plan(1);
    directions.on('error', once((e) => {
      t.ok(e.error, 'error is emitted');
    }));
    directions.setOrigin('Montreal Quebec');
    directions.setDestination('Toledo Spain');
  });

  tt.end();
});

