Mapbox GL Directions
---

A full featured directions plugin for [mapbox-gl-js](https://github.com/mapbox/mapbox-gl-js) using the [Mapbox Directions API](https://www.mapbox.com/developers/api/directions/).

## Usage

### Quick start

```html
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.12.0/mapbox-gl.js'></script>
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v1.0.0/mapbox-gl-directions.js'></script>

<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.12.0/mapbox-gl.css' rel='stylesheet' />
<link href='https://api.tiles.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v1.0.0/mapbox-gl-directions.css' rel='stylesheet' />

<script>
mapboxgl.accessToken = '<YOUR_ACCESS_TOKEN>';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v8',
  center: [-79.45, 43.65]
});

map.addControl(new mapboxgl.Directions());
</script>
```

### Deeper dive

- See [API.md](https://github.com/mapbox/mapbox-gl-directions/blob/master/API.md) for complete reference.

## Contributing

- See [CONTRIBUTING.md](https://github.com/mapbox/mapbox-gl-directions/blob/master/CONTRIBUTING.md).
