## 2.1.0

- [bug] Warn if mapboxgl is not present [#66](https://github.com/mapbox/mapbox-gl-directions/issues/66)
- [bug] Point `main` in `package.json` to transpiled result [#63](https://github.com/mapbox/mapbox-gl-directions/issues/63)
- [feature] Wrap coordinates outside of -180, 180 [#54]((https://github.com/mapbox/mapbox-gl-directions/issues/54)
- [feature] Basic support for touch handling [#61](https://github.com/mapbox/mapbox-gl-directions/issues/61)
- [feature] Allow interaction to be toggled on or off [#65](https://github.com/mapbox/mapbox-gl-directions/issues/65)
- [feature] Allow controls to be removed on initialization.
- [internal] Refactor out native DOM and use registered mapbox-gl-js ones.
- [internal] Remove custom implementation of a geocoder and use mapbox-gl-geocoder.

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
