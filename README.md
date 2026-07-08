Mapbox GL Directions
---

A full featured directions plugin for [Mapbox GL JS](https://github.com/mapbox/mapbox-gl-js) using the [Mapbox Directions API](https://www.mapbox.com/directions/). Quickly add UI to display driving, cycling, or walking directions on the map.

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
  container: 'map'
});

map.addControl(directions, 'top-left');
```

Live example: https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-directions/

### Deeper dive

See [API.md](https://github.com/mapbox/mapbox-gl-directions/blob/master/API.md) for complete reference.

### Contributing

See [CONTRIBUTING.md](https://github.com/mapbox/mapbox-gl-directions/blob/master/CONTRIBUTING.md).

## Publishing
To GitHub and NPM:

```
npm version (major|minor|patch)
git push --tags
git push
npm publish
```

To CDN:

```
# make sure you are authenticated for AWS
git checkout v{x.y.z}
npm ci
npm run prepublish
aws s3 cp --recursive --acl public-read dist s3://mapbox-gl-js/plugins/mapbox-gl-directions/v{x.y.z}
```

Update the version number in the [GL JS example](https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-directions/).