'use strict';

const once = require('lodash.once');
const test = require('tape');

const setup = require('./utils/setup');

test('Directions#option', tt => {
  tt.test('option.styles', t => {
    const { directions, map } = setup({
      styles: [{
        'id': 'foo',
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

    map.on('load', once(() => {
      directions.on('origin', once(() => {
        t.ok(map.getLayer('foo'), 'Custom layer is present');
        t.end();
      }));
      directions.setOrigin([-77, 41]);
    }));
  });

  tt.end();
});
