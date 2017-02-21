### Dependencies

- [node.js](https://nodejs.org/en/) >= 0.12

### Developing

    npm install & npm start & open http://localhost:9966/example/

You'll need a [Mapbox access token](https://www.mapbox.com/help/create-api-access-token/) stored in localstorage. Set it via

    localStorage.setItem('MapboxAccessToken', '<TOKEN HERE>');

### Testing

Tests require an MapboxAccessToken env variable to be set.

    export MapboxAccessToken="YOUR ACCESS TOKEN"

Lastly, run the test command from the console:

    npm test

### Deploying

- `npm test`
- Update `[CHANGELOG.md](https://github.com/mapbox/mapbox-gl-directions/blob/master/CHANGELOG.md)`
- `git commit -am "Update changelog"`
- `npm version {major|minor|patch}`
- `git push --follow-tags`
- `npm publish`
- update version number on [GL JS example page](https://github.com/mapbox/mapbox-gl-js/blob/mb-pages/docs/_posts/examples/3400-01-11-mapbox-gl-directions.html)
