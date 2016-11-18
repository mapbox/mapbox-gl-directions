Mapbox GL Directions
---

A full featured directions plugin for [mapbox-gl-js](https://github.com/mapbox/mapbox-gl-js) using the [Mapbox Directions API](https://www.mapbox.com/developers/api/directions/).

### Usage

```javascript
var mapboxgl = require('mapbox-gl');
var MapboxDirections = require('mapbox-gl-directions');

var directions = new MapboxDirections({
  accessToken: 'YOUR-MAPBOX-ACCESS-TOKEN',
  unit: 'metric',
  profile: 'cycling'
});

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9'
});

map.addControl(directions, 'top-left');
```

Live example: https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-directions/

### Deeper dive

See [API.md](https://github.com/mapbox/mapbox-gl-directions/blob/master/API.md) for complete reference.

### Contributing

See [CONTRIBUTING.md](https://github.com/mapbox/mapbox-gl-directions/blob/master/CONTRIBUTING.md).
