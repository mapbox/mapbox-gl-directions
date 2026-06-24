### Developing

    npm install & npm start & open http://localhost:9966/

You'll need a [Mapbox access token](https://www.mapbox.com/help/create-api-access-token/) stored in localstorage. Set it via

    localStorage.setItem('MapboxAccessToken', '<YOUR ACCESS TOKEN>');

### Testing

Tests require an MapboxAccessToken env variable to be set.

    export MapboxAccessToken=<YOUR ACCESS TOKEN> && npm test

### Release process

1. `git checkout main`
1. `git pull --rebase --autostash` to ensure you have the latest changes.
1. `export MapboxAccessToken=<YOUR ACCESS TOKEN> && npm test`
1. Update [`CHANGELOG.md`](https://github.com/mapbox/mapbox-gl-directions/blob/main/CHANGELOG.md)
1. `npm version {major|minor|patch}`
1. Create a release branch off of master that updates `CHANGELOG.md` and increments `package.json`.
1. `git push --follow-tags`
1. `mbx npm publish`
1. Update version number on [GL JS example page](https://github.com/mapbox/mapbox-gl-js/blob/mb-pages/docs/_posts/examples/3400-01-11-mapbox-gl-directions.html)

## Releasing a new version

Releases are published to npm via GitHub Actions.

### Steps

1. **Bump the version** in `package.json` (follow [semver](https://semver.org))
2. **Update `CHANGELOG.md`** with a summary of what changed
3. **Open a PR**, get it reviewed and merged to `main`
4. **Trigger the release** from the [Actions tab](../../actions/workflows/npm-release.yml):
   - Select **NPM release** → **Run workflow** → run from `main`

The workflow will publish to npm and create a GitHub release with auto-generated notes.

> **Note:** Only Mapbox maintainers with write access to this repository can trigger the release workflow. External contributors can open and contribute to PRs, but releases are always cut by the owning team.
