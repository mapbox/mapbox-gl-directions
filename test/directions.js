'use strict';

const test = require('tape');
const Directions = require('../');

function createDirections() {
  const directions = Directions(document.createElement('div'), {
    accessToken: process.env.MapboxAccessToken
  });

  return directions;
}

test('initialization', (t) => {
  const directions = createDirections();
  t.ok(directions, 'Directions is initialized');
  t.end();
});

test('Directions.setOrigin Directions.getOrigin', (t) => {
  const coordinates = [-79, 43];
  const directions = createDirections();
  directions.setOrigin(coordinates);
  t.equal(directions.getOrigin().geometry.coordinates, coordinates);
  t.end();
});

test('Directions.setDestination Directions.getDestination', (t) => {
  const coordinates = [-79, 43];
  const directions = createDirections();
  directions.setDestination(coordinates);
  t.equal(directions.getDestination().geometry.coordinates, coordinates);
  t.end();
});

test('Directions.reverse', (t) => {
  const a = [-79, 43];
  const b = [-78, 42];
  const directions = createDirections();

  directions.setOrigin(a);
  directions.setDestination(b);
  directions.reverse();

  t.equal(directions.getDestination().geometry.coordinates, a);
  t.equal(directions.getOrigin().geometry.coordinates, b);

  t.end();
});
