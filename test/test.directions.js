'use strict';

const test = require('tape');
const once = require('lodash.once');

const setup = require('./utils/setup');

test('directions', (tt) => {
  tt.test('initialized', t => {
    const { map, directions } = setup();

    t.ok(directions, 'directions is initialized');
    t.end();
  });

  tt.test('set/get inputs', t => {
    const { map, directions } = setup({
      geocoder: {
        proximity: [-79.45, 43.65]
      }
    });

    directions.setOrigin('Queen Street NY');
    directions.setDestination([-77, 41]);

    directions.on('origin', (e) => {
      t.ok(directions.getOrigin(), 'origin feature is present from get');
      t.ok(e.feature, 'origin feature is in the event object');
    });

    directions.on('destination', (e) => {
      t.ok(directions.getDestination(), 'destination feature is present from get');
      t.ok(e.feature, 'destination feature is in the event object');
    });

    directions.on('route', once((e) => {
      t.ok(e.route, 'routing data was passed');
      t.end();
    }));

  });

  tt.end();
});

test('Directions with custom styles', t => {
  var customLayer = {
    'id': 'directions-route-line',
    'type': 'line',
    'source': 'directions',
    'filter': [
      'all',
      ['in', '$type', 'LineString'],
      ['in', 'route', 'selected']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#3bb2d0',
      'line-width': 4
    }
  };

  const { map, directions } = setup({
    styles: [customLayer]
  });

  map.on('load', () => {
    t.ok(map.getLayer('directions-route-line-alt'), 'adds default for unspecified custom layer');
    t.deepEqual(map.getLayer('directions-route-line').serialize(), customLayer);
    t.end();
  })
});

test('Directions#onRemove', t => {
  const { map, directions } = setup({
    geocoder: {
      proximity: [-79.45, 43.65]
    }
  });

  map.on('load', () => {
    directions.on('route', once(()=>{
      t.true(!!map.getSource('directions'), 'directions source is added');
      t.true(!!map.getSource('directions:markers'), 'directions markers source is added');
      map.removeControl(directions);
      t.false(!!map.getSource('directions'), 'directions source is removed');
      t.false(!!map.getSource('directions:markers'), 'directions markers source is removed');
      t.end();
    }));
    directions.setOrigin('Queen Street NY');
    directions.setDestination([-77, 41]);
  });
});