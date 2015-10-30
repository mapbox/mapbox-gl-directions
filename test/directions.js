'use strict';

const test = require('tape');
const Directions = require('../');

test('basics', (t) => {
  var container = document.createElement('div');

  var directions = Directions(container, {
    accessToken: process.env.MapboxAccessToken
  });

  t.ok(directions, 'Directions is initialized');
  t.end();
});

