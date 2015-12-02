'use strict';

const once = require('lodash.once');
const test = require('tape');

test('Directions#inputControl', tt => {
  let container, map, directions;

  function setup(opts) {
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    directions = mapboxgl.Directions(container, opts);
    map.addControl(directions);
  }

  tt.test('origin', t => {
    setup();
    t.plan(2);
    var inputOrigin = container.querySelector('.js-origin');
    var inputOriginClear = container.querySelector('.js-origin-clear');
    inputOrigin.addEventListener('change', once(() => {
      t.ok(inputOrigin.value, 'value populates in origin');
      t.ok(inputOriginClear.classList.contains('active'), 'clear link is active');
    }));
    directions.setOrigin([-79, 43]);
  });

  tt.test('destination', t => {
    setup();
    t.plan(2);
    var inputDestination = container.querySelector('.js-destination');
    var inputDestinationClear = container.querySelector('.js-destination-clear');
    inputDestination.addEventListener('change', once(() => {
      t.ok(inputDestination.value, 'value populates in destination');
      t.ok(inputDestinationClear.classList.contains('active'), 'clear link is active');
    }));
    directions.setDestination([-78, 42]);
  });

  tt.test('profiles', t => {
    setup({ profile: 'cycling' });
    t.plan(3);

    var changeEvent = document.createEvent('HTMLEvents');
    changeEvent.initEvent('change', true, false);

    var drivingEl = container.querySelector('#mapbox-directions-profile-driving');
    var cyclingEl = container.querySelector('#mapbox-directions-profile-cycling');

    t.equal(drivingEl.checked, false, 'default driving profile should is false');
    t.equal(cyclingEl.checked, true, 'cycling profile is active');

    directions.on('directions.profile', once((e) => {
      t.equal(e.profile, 'driving', 'driving profile is set and event emitted');
    }));

    drivingEl.dispatchEvent(changeEvent);
  });

  tt.end();
});

