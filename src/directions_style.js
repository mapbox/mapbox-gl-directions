const style = [{
  'id': 'directions-line',
  'type': 'line',
  'source': 'directions',
  'filter': [
    'all',
    ['in', '$type', 'LineString']
  ],
  'paint': {
    'line-color': '#f0f',
    'line-width': 2
  }
}, {
  'id': 'directions-line-alt',
  'type': 'line',
  'source': 'directions',
  'filter': [
    'all',
    ['in', '$type', 'Point'],
    ['in', 'route', 'alternate']
  ],
  'paint': {
    'line-color': '#aaa',
    'line-width': 2
  }
}, {
  'id': 'directions-point',
  'type': 'circle',
  'source': 'directions',
  'filter': [
    'all',
    ['in', '$type', 'Point']
  ],
  'paint': {
    'circle-radius': 5,
    'circle-color': '#f0f'
  },
  'interactive': true
}];

export default style;
