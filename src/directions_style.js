const style = [{
  'id': 'directions-line',
  'type': 'line',
  'source': 'directions',
  'filter': [
    'all',
    ['in', '$type', 'LineString']
  ],
  'layout': {
    'line-cap': 'round',
    'line-join': 'round'
  },
  'paint': {
    'line-color': '#3bb2d0',
    'line-opacity': 0.75,
    'line-width': 4
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
  'layout': {
    'line-cap': 'round',
    'line-join': 'round'
  },
  'paint': {
    'line-color': '#aaa',
    'line-opacity': 0.75,
    'line-width': 4
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
    'circle-radius': 7,
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
    'circle-radius': 7,
    'circle-color': '#8a8bc9'
  },
  'interactive': true
}];

export default style;
