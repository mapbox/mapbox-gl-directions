const style = [{
  'id': 'directions-line',
  'type': 'line',
  'source': 'directions',
  'filter': ['all', ['==', '$type', 'LineString']],
  'paint': {
    'line-color': '#f0f',
    'line-width': 1
  }
}, {
  'id': 'directions-point',
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
