'use strict';

const once = require('lodash.once');
const test = require('tape');

test('Directions#inputControl', tt => {
  let container, map, directions;

  const changeEvent = document.createEvent('HTMLEvents');
  changeEvent.initEvent('change', true, false);

  const clickEvent = document.createEvent('HTMLEvents');
  clickEvent.initEvent('click', true, false);

  function setup(opts) {
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    directions = new mapboxgl.Directions(opts);
    map.addControl(directions);
  }

  tt.test('origin', t => {
    setup();
    t.plan(4);
    var inputEl = container.querySelector('.js-origin');
    var clearEl = container.querySelector('.js-origin-clear');
    inputEl.addEventListener('change', once(() => {
      t.ok(inputEl.value, 'value populates in origin');
      t.ok(clearEl.classList.contains('active'), 'clear link is active');
      clearEl.dispatchEvent(clickEvent);
    }));

    directions.on('directions.loading', once((e) => {
      t.equal(e.type, 'origin', 'origin load event was emitted');
    }));

    directions.on('directions.clear', once((e) => {
      t.equal(e.type, 'origin', 'origin input was cleared');
    }));

    directions.setOrigin([-79, 43]);
  });

  tt.test('destination', t => {
    setup();
    t.plan(4);
    var inputEl = container.querySelector('.js-destination');
    var clearEl = container.querySelector('.js-destination-clear');
    inputEl.addEventListener('change', once(() => {
      t.ok(inputEl.value, 'value populates in destination');
      t.ok(clearEl.classList.contains('active'), 'clear link is active');
      clearEl.dispatchEvent(clickEvent);
    }));

    directions.on('directions.loading', once((e) => {
      t.equal(e.type, 'destination', 'destination load event was emitted');
    }));

    directions.on('directions.clear', once((e) => {
      t.equal(e.type, 'destination', 'destination input was cleared');
    }));

    directions.setDestination([-78, 42]);
  });

  tt.test('profiles', t => {
    setup({ profile: 'cycling' });
    t.plan(3);

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

