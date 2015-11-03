'use strict';

const test = require('tape');
const Directions = require('../');

test('initialization', (t) => {
  var directions = Directions(document.createElement('div'));
  t.ok(directions, 'Directions is initialized');
  t.end();
});

test('Directions.setOrigin Directions.getOrigin', (t) => {
  var coordinates = [-79.4512, 43.6568];
  var directions = Directions(document.createElement('div'));
  directions.setOrigin(coordinates);
  t.equal(directions.getOrigin().geometry.coordinates, coordinates);
  t.end();
});

test('Directions.setDestination Directions.getDestination', (t) => {
  var coordinates = [-79.4512, 43.6568];
  var directions = Directions(document.createElement('div'));
  directions.setDestination(coordinates);
  t.equal(directions.getDestination().geometry.coordinates, coordinates);
  t.end();
});
