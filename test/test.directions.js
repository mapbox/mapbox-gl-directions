'use strict';

const test = require('tape');
const once = require('lodash.once');
const MapboxDirections = require('..');

function setup() {
  var container = document.createElement('div');
  var map = new mapboxgl.Map({ container: container, style: {
  "version": 8,
  "sources": {
  },
  "layers": [
      {
          "id": "background", "type": "background",
          "paint": {
              "background-color": "#fff"
          }
      }] }});

  return map;
}

test('directions', (tt) => {
  tt.test('initialized', t => {
    var map = setup();
    var directions = new MapboxDirections();
    map.addControl(directions);

    t.ok(directions, 'directions is initialized');
    t.end();
  });

  tt.test('set/get inputs', t => {
    var map = setup();

    var directions = new MapboxDirections({
      geocoder: {
        proximity: [-79.45, 43.65]
      }
    });
    map.addControl(directions);


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

test('Directions#onRemove', t => {
  var map = setup();
  var directions = new MapboxDirections({
    geocoder: {
      proximity: [-79.45, 43.65]
    }
  });
  map.addControl(directions);


  directions.setOrigin('Queen Street NY');
  directions.setDestination([-77, 41]);
  directions.on('route', once(()=>{
    t.true(!!map.getSource('directions'), 'directions source is added');
    map.removeControl(directions);
    t.false(!!map.getSource('directions'), 'directions source is removed');
    t.end();
  }));
});
