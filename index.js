import Directions from './src/directions';
import './dist/mapboxgl.directions.css';

function exportFn(options) {
  return new Directions(options);
}

if (window.mapboxgl) {
  mapboxgl.Directions = exportFn;
} else if (typeof module !== 'undefined') {
  module.exports = exportFn;
}
