const style = [{
  'id': 'line',
  'type': 'line',
  'source': 'directions',
  'filter': ['all', ['==', '$type', 'LineString']],
  'layout': {
    'icon-image': '{marker-symbol}-12'
  },
  'paint': {
    'text-size': 12
  },
  'interactive': true
}, {
  'id': 'marker',
  'type': 'symbol',
  'source': 'directions',
  'filter': ['all', ['==', '$type', 'Point']],
  'layout': {
    'icon-image': 'circle.sdf',
    'text-anchor': 'top',
    'icon-allow-overlap': true
  },
  'paint': {
    'icon-color': '#ff00ff',
    'icon-size': 1
  },
  'interactive': true
}];

export default style;
