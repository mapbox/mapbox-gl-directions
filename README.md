GL directions
---

A full featured directions plugin for [mapbox-gl-js](https://github.com/mapbox/mapbox-gl-js) using the [Mapbox Directions API](https://www.mapbox.com/developers/api/directions/).

### Usage

#### Quick start

```html
<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.11.2/mapbox-gl.css' rel='stylesheet' />
<link href='dist/mapboxgl.directions.css' rel='stylesheet' />

<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.11.2/mapbox-gl.js'></script>
<script src='dist/mapboxgl.directions.js'></script>

<script>
mapboxgl.accessToken = 'YOUR_ACCESS_TOKEN';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v8',
  center: [-79.45, 43.65]
});

var directions = Directions(document.getElementById('directions'));
map.addControl(directions);
</script>
```

### Documentation

- See [API.md](https://github.com/mapbox/gl-directions/blob/v1/API.md).

### Developing

    npm install & npm start & open http://localhost:9966/example/

### Testing

Tests require an environment variable to be set. Create a file named `env.test.sh`
in the root directory with the following contents:

    export MapboxAccessToken="YOUR ACCESS TOKEN"

Don't have an access token? There's info [here](https://www.mapbox.com/help/create-api-access-token/) about it.

Lastly, run the test command from the console:

    npm test
