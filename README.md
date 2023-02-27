Mapbox GL Directions
---

A full featured directions plugin for [Mapbox GL JS](https://github.com/mapbox/mapbox-gl-js) using the [Mapbox Directions API](https://www.mapbox.com/directions/). Quickly add UI to display driving, cycling, or walking directions on the map. The Mapbox Directions API is powered by the [OSRM](http://project-osrm.org/) routing engine and open data from the [OpenStreetMap](https://www.openstreetmap.org/) project.

For directions functionality in native mobile and desktop applications, see [Mapbox Android Services](https://github.com/mapbox/mapbox-java/), [MapboxDirections.swift](https://github.com/mapbox/MapboxDirections.swift/), and [MapboxNavigation.swift](https://github.com/mapbox/MapboxNavigation.swift/).

### Usage

```javascript
var mapboxgl = require('mapbox-gl');
var MapboxDirections = require('@mapbox/mapbox-gl-directions');

var directions = new MapboxDirections({
  accessToken: 'YOUR-MAPBOX-ACCESS-TOKEN',
  unit: 'metric',
  profile: 'mapbox/cycling'
});

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12'
});

map.addControl(directions, 'top-left');
```

Live example: https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-directions/

### Deeper dive

See [API.md](https://github.com/mapbox/mapbox-gl-directions/blob/master/API.md) for complete reference.

### Contributing

See [CONTRIBUTING.md](https://github.com/mapbox/mapbox-gl-directions/blob/master/CONTRIBUTING.md).
