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

  t.test('options.localGeocoder', function(t) {
    //t.plan(3);
    const geocoder = new Geocoder({
      flyTo: false,
      limit: 6,
      localGeocoder: function(q) {
        return [{place_name: q}];
      }
    });

    geocoder.onAdd();
    new Promise((resolve, reject) => {
      geocoder.query('-30,150');
      geocoder.once('results', function(e) {
        t.equal(e.results.length, 1, 'Local geocoder used');
        resolve();
      });
      geocoder.once('error', function(e) {});
    }).then(function(result) {
      return new Promise((resolve, reject) => {
        geocoder.query('London');
        geocoder.once('results', function(e) {
          t.equal(e.results.length, 7, 'Local geocoder supplement remote response');
          resolve();
        });
      });
    }).then(function(result) {
      return new Promise((resolve, reject) => {
        geocoder.query('London');
        geocoder.once('results', function(e) {
          t.equal(e.results[0].place_name, 'London', 'Local geocoder results above remote response');
          resolve();
        });
      });
    }).then(function(result) {
      t.end();
    });
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
