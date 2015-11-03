'use strict';

const test = require('tape');
const Directions = require('../');

test('initialization', (t) => {
  var directions = Directions(document.createElement('div'));
  t.ok(directions, 'Directions is initialized');
  t.end();
});

test('Directions.setOrigin Directions.getOrigin', (t) => {
  var coordinates = [-79, 43];
  var directions = Directions(document.createElement('div'));
  directions.setOrigin(coordinates);
  t.equal(directions.getOrigin().geometry.coordinates, coordinates);
  t.end();
});

test('Directions.setDestination Directions.getDestination', (t) => {
  var coordinates = [-79, 43];
  var directions = Directions(document.createElement('div'));
  directions.setDestination(coordinates);
  t.equal(directions.getDestination().geometry.coordinates, coordinates);
  t.end();
});

test('Directions.reverse', (t) => {
  var a = [-79, 43];
  var b = [-78, 42];

  var directions = Directions(document.createElement('div'));

  directions.setOrigin(a);
  directions.setDestination(b);
  directions.reverse();

  t.equal(directions.getDestination().geometry.coordinates, a);
  t.equal(directions.getOrigin().geometry.coordinates, b);

  t.end();
});
