'use strict';

const test = require('tape');
const mapboxgl = require('mapbox-gl');
const Directions = require('../../');

test('Directions#inputs', (tt) => {
  let container, map, directions;

  function setup() {
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    directions = Directions(container, {
      profile: 'cycling'
    });

    map.addControl(directions);
  }

  tt.test('directions profile set on initialization', (t) => {
    setup();

    console.log(container.querySelectorAll('radio'));
    console.log(container.querySelector('#mapbox-directions-profile-driving'));

    t.equal(container.querySelector('#mapbox-directions-profile-driving').checked, false);
    t.equal(container.querySelector('#mapbox-directions-profile-cycling').checked, true);
    t.end();
  });

  tt.end();
});

