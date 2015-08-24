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
  'type': 'circle',
  'source': 'directions',
  'filter': ['all', ['==', '$type', 'Point']],
  'paint': {
    'circle-radius': 5,
    'circle-color': '#f0f'
  },
  'interactive': true
}];

export default style;
