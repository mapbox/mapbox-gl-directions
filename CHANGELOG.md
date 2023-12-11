## 4.1.2

- [chore] Update mapbox-gl peer dependency version [#298](https://github.com/mapbox/mapbox-gl-directions/pull/298)

## 4.1.1

- [bug] Exclude `options.api` from query params [#266](https://github.com/mapbox/mapbox-gl-directions/pull/266)
- [bug] Catch 'No Route found' response [#278](https://github.com/mapbox/mapbox-gl-directions/pull/278)
* [bug] Abort request after `removeRoutes()` is called [#285](https://github.com/mapbox/mapbox-gl-directions/pull/285)
* [bug] Fix mixed duration and distance values [#271](https://github.com/mapbox/mapbox-gl-directions/pull/271)

## 4.1.0
- Adds routePadding option to MapboxDirections object [#243](https://github.com/mapbox/mapbox-gl-directions/pull/243)
- Fixes bug that showed dropdown suggestions when reversing route [#246](https://github.com/mapbox/mapbox-gl-directions/pull/246)

## 4.0.3
- Adds exclude parameter [#233](https://github.com/mapbox/mapbox-gl-directions/pull/233)

## 4.0.2
- Adds language parameter to allow turn-by-turn instructions in other [supported languages](https://docs.mapbox.com/api/navigation/#instructions-languages)

## 4.0.1
- Update packages to resolve polyline dependency
- Update peerDependency for Mapbox-GL-JS to support v1.0 release
- Switch to `yarn` to workaround `sockjs-client` dependency issue

## 4.0.0
- [Refactor] options passed to internal Geocoder class
  - Made options.geocoder dynamic, accepting only query parameters from the Geocoding API
  - Removed placeholder option in favor of placeholderOrigin and placeholderDestination
  - Added top level options flyTo, zoom, placeholderOrigin and placeholderDestination
- [Chore] Update packages to resolve vulnerabilities in smokestack

## 3.1.3
- [bug] Bump package `suggestions` to support autocompletion on quick keypress.[#179](https://github.com/mapbox/mapbox-gl-directions/pull/179)

## 3.1.2
- [workaround] Include `/dist` directory in published NPM package

## 3.1.1

- [bug] Fixes css for turn instruction icons

## 3.1.0

- [internal] upgrade to v5 of the Mapbox Directions API
- [feature] add traffic aware driving directions profile

## 3.0.3

- [bug] re-enable hiding instructions panel [#101](https://github.com/mapbox/mapbox-gl-directions/issues/101)

## 3.0.2

- [bug] Fixing a fix for `3.0.1`. Missed a single space.

## 3.0.1

- [bug] CSS fix for departure/arrival icons that were not center aligned because of global line-height properties

## 3.0.0

Support for the Mapbox GL JS 0.27.0 API. This is compatible with 0.27.0 and later, and not compatible with earlier versions.

- [breaking] `container` option removed - attaching the control outside of the map is no longer supported
- [breaking] `position` option removed - the `addControl` method now specifies the position
- [breaking] Now exports `MapboxDirections` rather than attaches to `mapbox.Directions`
- [internal] no longer creates a new map control for each of the two geocoders, instead creates two internal geocoders
- [feature] `removeRoutes` method that removes all route lines, waypoints, and instructions

## 2.2.0
- [feature] Defer mapboxgl dependency til runtime to support webpack async loading #86 https://github.com/mapbox/mapbox-gl-directions/pull/86
- [bug] Fix mapboxgl.GeoJSONSource deprecation in gl-js v.22 and map.load race condition

## 2.1.0

- [bug] Warn if mapboxgl is not present [#66](https://github.com/mapbox/mapbox-gl-directions/issues/66)
- [bug] Point `main` in `package.json` to transpiled result [#63](https://github.com/mapbox/mapbox-gl-directions/issues/63)
- [feature] Wrap coordinates outside of -180, 180 [#54]((https://github.com/mapbox/mapbox-gl-directions/issues/54)
- [feature] Basic support for touch handling [#61](https://github.com/mapbox/mapbox-gl-directions/issues/61)
- [feature] Allow interaction to be toggled on or off [#65](https://github.com/mapbox/mapbox-gl-directions/issues/65)
- [feature] Allow controls to be removed on initialization.
- [internal] Refactor out native DOM and use registered mapbox-gl-js ones.
- [internal] Remove custom implementation of a geocoder and use mapbox-gl-geocoder.
- [internal] Use plain XMLHttpRequest for direction queries.

## 2.0.0

- [breaking] Drop `directions` prefix from event names [#59](https://github.com/mapbox/mapbox-gl-directions/issues/59)
- [bug] Fix loading UI state and clearing past geocoded results [#58](https://github.com/mapbox/mapbox-gl-directions/pull/58)
- [breaking] Update `peerDependencies` to use mapbox-gl-js@v0.16.0 [#56](https://github.com/mapbox/mapbox-gl-directions/issues/56)
- [feature] Zoom to bounds if exist on origin or destination geocode [#46](https://github.com/mapbox/mapbox-gl-directions/issues/46)
- [feature] Pass custom styles in options argument [#45](https://github.com/mapbox/mapbox-gl-directions/issues/45)
- [bug] Fix points where a geocoded request is not found. Pass coordinates in request [#43](https://github.com/mapbox/mapbox-gl-directions/issues/43)

## 1.0.0

- [bug] Infer container if no element is passed [#30](https://github.com/mapbox/mapbox-gl-directions/issues/30)
- [feature] Pass `container` as an options param [#30](https://github.com/mapbox/mapbox-gl-directions/issues/30)
- [breaking] Change `proximity` option to [lng, lat] format [#29](https://github.com/mapbox/mapbox-gl-directions/issues/29)
- [feature] Toggle routes from sidebar listing [#28](https://github.com/mapbox/mapbox-gl-directions/issues/28)
- [ui] Target mobile devices with media queries [#26](https://github.com/mapbox/mapbox-gl-directions/issues/26)
- [ui] Add loading state to input queries [#25](https://github.com/mapbox/mapbox-gl-directions/issues/25)
- [ui] Display routing errors in the instructions panel [#24](https://github.com/mapbox/mapbox-gl-directions/issues/24)

## 0.0.0

- Initial commit
