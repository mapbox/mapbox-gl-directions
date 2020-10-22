function validCoords(coords) {
  return coords[0] >= -180 && coords[0] <= 180 && coords[1] >= -90 && coords[1] <= 90;
}

function coordinateMatch(a, b) {
  a = a.geometry.coordinates;
  b = b.geometry.coordinates;
  return (a.join() === b.join()) ||
    a[0].toFixed(3) === b[0].toFixed(3) &&
    a[1].toFixed(3) === b[1].toFixed(3);
}

function wrap(n) {
  var d = 180 - -180;
  var w = ((n - -180) % d + d) % d + -180;
  return (w === -180) ? 180 : w;
}

function roundWithOriginalPrecision(input, original) {
  let precision = 0;
  if (Math.floor(original) !== original) {
    precision = original.toString().split('.')[1].length;
  }
  return input.toFixed(Math.min(precision, 5));
}

function createPoint(coordinates, properties) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coordinates
    },
    properties: properties ? properties : {}
  };
}

const format = {
  duration(s) {
    var m = Math.floor(s / 60),
      h = Math.floor(m / 60);
    s %= 60;
    m %= 60;
    if (h === 0 && m === 0) return s + 's';
    if (h === 0) return m + 'min';
    return h + 'h ' + m + 'min';
  },

  imperial(m) {
    var mi = m / 1609.344;
    if (mi >= 100) return mi.toFixed(0) + 'mi';
    if (mi >= 10) return mi.toFixed(1) + 'mi';
    if (mi >= 0.1) return mi.toFixed(2) + 'mi';
    return (mi * 5280).toFixed(0) + 'ft';
  },

  metric(m) {
    if (m >= 100000) return (m / 1000).toFixed(0) + 'km';
    if (m >= 10000) return (m / 1000).toFixed(1) + 'km';
    if (m >= 100) return (m / 1000).toFixed(2) + 'km';
    return m.toFixed(0) + 'm';
  }
};

const distance = ([x1, y1], [x2, y2]) =>
  Math.hypot((x1 - x2), (y1 - y2));

const nearest = origin =>
  (p1, p2, index) =>
    (distance(origin, p1) < distance(origin, p2))
      ? p1
      : p2.concat(index);


const find = (route, origin) => route
  .reduce(nearest(origin), [Infinity, Infinity, -1])[2];

const compare = point =>
  waypoint =>
    coordinateMatch(point, waypoint);

const getNextWaypoint = (getRoute, waypoints, origin) => {
  if (waypoints.length === 0) return 0;
  
  const route = getRoute();
  
  for(let i = find(route, origin); i < route.length; i++) {
    const index = waypoints.findIndex(compare({ geometry: { coordinates: route[i] } }));
    if (index !== -1) {
      return index;  
    }
  }
  return waypoints.length;
};

export default { 
  format, 
  coordinateMatch, 
  createPoint, 
  validCoords, 
  wrap, 
  roundWithOriginalPrecision, 
  getNextWaypoint 
};
