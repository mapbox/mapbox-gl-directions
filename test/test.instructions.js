'use strict';

const once = require('lodash.once');
const test = require('tape');
const template = require('lodash.template');
const fs = require('fs');

const setup = require('./utils/setup');

const instructionsTemplate = template(fs.readFileSync(__dirname + '/../src/templates/instructions.html', 'utf8'));
const errorTemplate = template(fs.readFileSync(__dirname + '/../src/templates/error.html', 'utf8'));

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

  tt.test('escapes HTML in step maneuver instructions', t => {
    const payload = '<img src=x onerror=alert(1)>';
    const html = instructionsTemplate({
      routeIndex: 0,
      routes: 1,
      steps: [{
        distance: false,
        maneuver: {
          type: 'turn',
          instruction: payload,
          location: [0, 0]
        }
      }],
      format: () => '',
      duration: '1 min',
      distance: '1 km'
    });

    t.false(html.includes('<img src=x onerror=alert(1)>'), 'raw payload is not present in rendered HTML');
    t.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'), 'payload is HTML-escaped');
    t.end();
  });

  tt.test('escapes HTML in error messages', t => {
    const payload = '<img src=x onerror=alert(1)>';
    const html = errorTemplate({ error: payload });

    t.false(html.includes('<img src=x onerror=alert(1)>'), 'raw payload is not present in rendered HTML');
    t.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'), 'payload is HTML-escaped');
    t.end();
  });

  tt.end();
});

