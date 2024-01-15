'use strict';

const MapboxDirections = require('../..');

module.exports = function setup(opts) {
  const container = document.createElement('div');
  mapboxgl.Map.prototype._detectMissingCSS = () => { };
  const map = new mapboxgl.Map({
    container: container,
    style: {
      version: 8,
      sources: {},
      glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#fff'
          }
        }
      ]
    }
  });

  const directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    ...opts
  });
  map.addControl(directions);

  return {
    container,
    map,
    directions
  };
}