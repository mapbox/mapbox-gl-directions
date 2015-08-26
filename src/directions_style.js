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
  'id': 'directions-origin-point',
  'type': 'circle',
  'source': 'directions',
  'filter': [
    'all',
    ['in', '$type', 'Point'],
    ['in', 'marker-symbol', 'A']
  ],
  'paint': {
    'circle-radius': 6,
    'circle-color': '#3bb2d0'
  },
  'interactive': true
}, {
  'id': 'directions-destination-point',
  'type': 'circle',
  'source': 'directions',
  'filter': [
    'all',
    ['in', '$type', 'Point'],
    ['in', 'marker-symbol', 'B']
  ],
  'paint': {
    'circle-radius': 6,
    'circle-color': '#8a8bc9'
  },
  'interactive': true
}];

export default style;
