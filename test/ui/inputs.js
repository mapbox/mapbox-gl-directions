'use strict';

const test = require('tape');
const mapboxgl = require('mapbox-gl');
const Directions = require('../../');

function createMap() {
  var map = new mapboxgl.Map({
    container: document.createElement('div'),
    style: 'mapbox://styles/mapbox/streets-v8'
  });

  return map;
}

test('Directions#inputs', (tt) => {
  tt.test('clear buttons', (t) => {
    t.plan(4);

    var map = createMap();
    var container = document.createElement('div');
    var directions = Directions(container);
    map.addControl(directions);

    var event = document.createEvent('HTMLEvents');
    event.initEvent('click', true, false);

    map.on('load', () => {
      directions.setOrigin([-79, 43]);
      directions.setDestination([-78, 42]);

      var inputOrigin = container.querySelector('.js-origin');
      var inputOriginClear = container.querySelector('.js-origin-clear');
      var inputDestination = container.querySelector('.js-destination');
      var inputDestinationClear = container.querySelector('.js-destination-clear');

      inputOrigin.addEventListener('change', () => {
        t.ok(inputOrigin.value, 'value populates in origin');
        t.ok(inputOriginClear.classList.contains('active'), 'clear link is active');
      });

      inputDestination.addEventListener('change', () => {
        t.ok(inputDestination.value, 'value populates in destination');
        t.ok(inputDestinationClear.classList.contains('active'), 'clear link is active');
      });

    });
  });

  tt.test('passed options profile is set on initialization', (t) => {
    var map = createMap();
    var container = document.createElement('div');
    var directions = Directions(container, { profile: 'cycling' });
    map.addControl(directions);

    t.equal(container.querySelector('#mapbox-directions-profile-driving').checked, false);
    t.equal(container.querySelector('#mapbox-directions-profile-cycling').checked, true);
    t.end();
  });

  tt.end();
});
