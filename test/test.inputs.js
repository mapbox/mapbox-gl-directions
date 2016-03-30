'use strict';

const once = require('lodash.once');
const test = require('tape');

test('Directions#inputControl', tt => {
  const changeEvent = document.createEvent('HTMLEvents');
  changeEvent.initEvent('change', true, false);

  const clickEvent = document.createEvent('HTMLEvents');
  clickEvent.initEvent('click', true, false);

  tt.test('origin', t => {
    t.plan(4);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const map = new mapboxgl.Map({ container: container });
    const directions = new mapboxgl.Directions();
    map.addControl(directions);

    console.log(container.innerHTML);

    var inputEl = container.querySelector('.js-origin');
    var clearEl = container.querySelector('.js-origin-clear');
    inputEl.addEventListener('change', once(() => {
      t.ok(inputEl.value, 'value populates in origin');
      t.ok(clearEl.classList.contains('active'), 'clear link is active');
      clearEl.dispatchEvent(clickEvent);
    }));

    directions.on('loading', once((e) => {
      t.equal(e.type, 'origin', 'origin load event was emitted');
    }));

    directions.on('clear', once((e) => {
      t.equal(e.type, 'origin', 'origin input was cleared');
    }));

    directions.setOrigin([-79, 43]);
  }, 3000);

  tt.test('destination', t => {
    t.plan(4);
    const container = document.createElement('div');
    const map = new mapboxgl.Map({ container: container });
    const directions = new mapboxgl.Directions();
    map.addControl(directions);

    var inputEl = container.querySelector('.js-destination');
    var clearEl = container.querySelector('.js-destination-clear');
    inputEl.addEventListener('change', once(() => {
      t.ok(inputEl.value, 'value populates in destination');
      t.ok(clearEl.classList.contains('active'), 'clear link is active');
      clearEl.dispatchEvent(clickEvent);
    }));

    directions.on('loading', once((e) => {
      t.equal(e.type, 'destination', 'destination load event was emitted');
    }));

    directions.on('clear', once((e) => {
      t.equal(e.type, 'destination', 'destination input was cleared');
    }));

    directions.setDestination([-78, 42]);
  });

  tt.test('profiles', t => {
    const container = document.createElement('div');
    const map = new mapboxgl.Map({ container: container });
    const directions = new mapboxgl.Directions({
      profile: 'cycling'
    });
    map.addControl(directions);

    t.plan(3);

    var drivingEl = container.querySelector('#mapbox-directions-profile-driving');
    var cyclingEl = container.querySelector('#mapbox-directions-profile-cycling');

    t.equal(drivingEl.checked, false, 'default driving profile should is false');
    t.equal(cyclingEl.checked, true, 'cycling profile is active');

    directions.on('profile', once((e) => {
      t.equal(e.profile, 'driving', 'driving profile is set and event emitted');
    }));

    drivingEl.dispatchEvent(changeEvent);
  });

  tt.end();
});

