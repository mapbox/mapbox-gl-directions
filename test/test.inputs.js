'use strict';

const once = require('lodash.once');
const test = require('tape');

const setup = require('./utils/setup');

test('Directions#inputControl', tt => {
  const changeEvent = document.createEvent('HTMLEvents');
  changeEvent.initEvent('change', true, false);

  const clickEvent = document.createEvent('HTMLEvents');
  clickEvent.initEvent('click', true, false);

  tt.test('profiles', (t) => {
    const { container, directions } = setup({ profile: 'mapbox/cycling' });
    t.plan(3);

    var drivingEl = container.querySelector('#mapbox-directions-profile-driving');
    var cyclingEl = container.querySelector('#mapbox-directions-profile-cycling');

    t.equal(drivingEl.checked, false, 'default driving profile should is false');
    t.equal(cyclingEl.checked, true, 'cycling profile is active');

    directions.on('profile', once((e) => {
      t.equal(e.profile, 'mapbox/driving', 'driving profile is set and event emitted');
    }));

    drivingEl.dispatchEvent(changeEvent);
  });

  tt.end();
});

