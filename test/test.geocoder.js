'use strict';

const test = require('tape');
import Geocoder from '../src/controls/geocoder';

test('Geocoder#constructor', t =>{
  t.test('default options', t =>{
    const geocoder = new Geocoder();

    t.equal(geocoder.api, 'https://api.mapbox.com/geocoding/v5/mapbox.places/');
    t.deepEqual(geocoder.options, {
      placeholder: 'Search',
      zoom: 16,
      flyTo: true,
    });
    t.end();
  });


  t.test('Geocoder#api', t => {
    const geocoder = new Geocoder({api: 'https://fake-geocoder.pizza'});
    t.equal(geocoder.api, 'https://fake-geocoder.pizza');
    t.end();
  });

  t.end();
})