'use strict';

const test = require('tape');

test('directions', (tt) => {
  function createDirections(opts) {
    opts = opts || {};
    const config = Object.assign({
      accessToken: process.env.MapboxAccessToken
    }, opts);
    return new Directions(document.body, config);
  }

  const directions = createDirections();

  tt.test('initialized', (t) => {
    t.ok(directions);
    t.end();
  });

  tt.test('getting setting origin', (t) => {
    t.plan(1);
    const coordinates = [-79, 43];
    directions.setOrigin(coordinates);
    directions.on('origin', (e) => {
      t.ok(e.feature);
    });
  });

  tt.test('getting setting destination', (t) => {
    t.plan(1);
    const coordinates = [-77, 41];
    directions.setDestination(coordinates);
    directions.on('destination', (e) => {
      t.ok(e.feature);
    });
  });

  tt.end();
});

