'use strict';

const test = require('tape');

test('Directions#inputControl', tt => {
  let container, map, directions;

  function setup(opts) {
    container = document.body;
    map = new mapboxgl.Map({ container: document.body });
    directions = mapboxgl.Directions(document.body, Object.assign({
      accessToken: process.env.MapboxAccessToken
    }, opts));

    map.addControl(directions);
  }

  tt.test('origin', t => {
    setup();
    var inputOrigin = container.querySelector('.js-origin');
    var inputOriginClear = container.querySelector('.js-origin-clear');
    inputOrigin.addEventListener('change', () => {
      t.ok(inputOrigin.value, 'value populates in origin');
      t.ok(inputOriginClear.classList.contains('active'), 'clear link is active');
      t.end();
    });
    directions.setOrigin([-79, 43]);
  });

  tt.test('destination', t => {
    setup();
    var inputDestination = container.querySelector('.js-destination');
    var inputDestinationClear = container.querySelector('.js-destination-clear');
    inputDestination.addEventListener('change', () => {
      t.ok(inputDestination.value, 'value populates in destination');
      t.ok(inputDestinationClear.classList.contains('active'), 'clear link is active');
      t.end();
    });
    directions.setDestination([-78, 42]);
  });

  tt.test('profiles', t => {
    setup({ profile: 'cycling' });
    t.equal(container.querySelector('#mapbox-directions-profile-driving').checked, false);
    t.equal(container.querySelector('#mapbox-directions-profile-cycling').checked, true);
    t.end();
  });

  tt.end();
});

