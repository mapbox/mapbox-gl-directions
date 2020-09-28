'use strict';

const test = require('tape');
import Geocoder from '../src/controls/geocoder';

test('Geocoder#constructor', t =>{
  t.test('default options', t =>{
    const geocoder = new Geocoder({});
    t.equal(geocoder.api, 'https://api.mapbox.com/geocoding/v5/mapbox.places/');
    t.deepEqual(geocoder.options, {});
    t.end();
  });

  t.test('placeholder option is assigned to the right places', t =>{
    const geocoder = new Geocoder({
      flyTo: false,
      placeholder: 'foo'
    });

    geocoder.onAdd();
    t.equal(geocoder._inputEl.getAttribute('placeholder'), 'foo');
    t.end();
  });

  // TODO test to confirm the query parameters actually get passed.
  /*
  t.test('query parameters passed are added to the request', t =>{
    const geocoder = new Geocoder({
      language: 'fr',
      country: 'fr'
    });

    geocoder.onAdd();
    geocoder._geocode('san francisco', res => {
      console.log('request assignment!', geocode.request);
    });

    // t.end();
  });
  */

  t.test('Geocoder#api', t => {
    const geocoder = new Geocoder({api: 'https://fake-geocoder.pizza'});
    t.equal(geocoder.api, 'https://fake-geocoder.pizza');
    t.end();
  });

  t.end();
})
