### Developing

    npm install && npm start && open http://localhost:9966/

You'll need a [Mapbox access token](https://www.mapbox.com/help/create-api-access-token/) stored in localstorage. Set it via

    localStorage.setItem('MapboxAccessToken', '<YOUR ACCESS TOKEN>');

### Testing

Tests require an MapboxAccessToken env variable to be set.

    MapboxAccessToken=<YOUR ACCESS TOKEN> npm test

### Release process

1. `git checkout master`
1. `git pull --rebase --autostash` to ensure you have the latest changes.
1. `MapboxAccessToken=<YOUR ACCESS TOKEN> npm test`
1. Update [`CHANGELOG.md`](https://github.com/mapbox/mapbox-gl-directions/blob/master/CHANGELOG.md)
1. `npm version {major|minor|patch}`
1. Create a release branch off of master that updates `CHANGELOG.md` and increments `package.json`.
1. `git push --follow-tags`
1. `mbx npm publish`
1. Update version number on [GL JS example page](https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-directions/)
