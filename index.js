'use strict';

import Directions from './src/directions';

function exportFn(options) {
  return new Directions(options);
}

if (window.mapboxgl) {
  mapboxgl.Directions = exportFn;
} else if (typeof module !== 'undefined') {
  module.exports = exportFn;
}
