const style = [{
  'id': 'directions-route-line-alt',
  'type': 'line',
  'source': 'directions',
  'filter': [
    'all',
    ['in', '$type', 'LineString'],
    ['in', 'route', 'alternate']
  ],
  'layout': {
    'line-cap': 'round',
    'line-join': 'round'
  },
  'paint': {
    'line-color': '#aaa',
    'line-width': 5
  },
  'interactive': true
}, {
  'id': 'directions-route-line',
  'type': 'line',
  'source': 'directions',
  'filter': [
    'all',
    ['in', '$type', 'LineString'],
    ['in', 'route', 'selected']
  ],
  'layout': {
    'line-cap': 'round',
    'line-join': 'round'
  },
  'paint': {
    'line-color': '#3bb2d0',
    'line-dasharray': [0,1.5],
    'line-width': 6
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
