'use strict';

const once = require('lodash.once');
const test = require('tape');

test('Directions#styles', tt => {
  let container, map, directions;

  function setup(opts) {
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    directions = new mapboxgl.Directions(opts);
    map.addControl(directions);
  }

  tt.test('option.styles', t => {
    t.plan(1);
    setup({
      styles: [{
        'id': 'origin',
        'interactive': true,
        'type': 'circle',
        'source': 'directions',
        'paint': {
          'circle-color': '#f00'
        },
        'filter': [
          'all',
          ['in', '$type', 'Point'],
          ['in', 'marker-symbol', 'A']
        ]
      }]
    });

    directions.setOrigin([-77, 41]);
    directions.on('origin', once(() => {
      map.featuresIn({
        layer: 'origin'
      }, function(err, features) {
        if (err) t.notOk(err);
        t.ok(features.length, 'Custom layer is present');
      });
    }));
  });

  tt.end();
});

