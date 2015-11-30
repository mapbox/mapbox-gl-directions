'use strict';

const test = require('tape');
const mapboxgl = require('mapbox-gl');
const Directions = require('../../');

test('clear buttons', (t) => {

  function createDirections(el, opts) {
    opts = opts || {};
    const config = Object.assign({
      accessToken: process.env.MapboxAccessToken
    }, opts);
    return new Directions(el, config);
  }

  var container = document.body;
  var map = new mapboxgl.Map({ container: document.body });
  var directions = createDirections(document.body);

  map.addControl(directions);

  // map.on('load', () => {

    t.test('origin change event', tt => {
      var inputOrigin = container.querySelector('.js-origin');
      var inputOriginClear = container.querySelector('.js-origin-clear');
      inputOrigin.addEventListener('change', () => {
        tt.ok(inputOrigin.value, 'value populates in origin');
        tt.ok(inputOriginClear.classList.contains('active'), 'clear link is active');
        tt.end();
      });
      directions.setOrigin([-79, 43]);
    });

    t.test('destination change event', tt => {
      var inputDestination = container.querySelector('.js-destination');
      var inputDestinationClear = container.querySelector('.js-destination-clear');
      inputDestination.addEventListener('change', () => {
        tt.ok(inputDestination.value, 'value populates in destination');
        tt.ok(inputDestinationClear.classList.contains('active'), 'clear link is active');
        tt.end();
      });
      directions.setDestination([-78, 42]);
    });

    t.end();
  // });
});

/*

test('passed options profile is set on initialization', (t) => {
  var container = document.createElement('div');
  var map = createMap({ container: container });
  var directions = createDirections();

  map.addControl(directions);

  t.equal(container.querySelector('#mapbox-directions-profile-driving').checked, false);
  t.equal(container.querySelector('#mapbox-directions-profile-cycling').checked, true);
  t.end();
});

*/
