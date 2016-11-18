# MapboxDirections

A directions component using Mapbox Directions API

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.styles` **\[[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)]** Override default layer properties of the [directions source](https://github.com/mapbox/mapbox-gl-directions/blob/master/src/directions_style.js). Documentation for each property are specified in the [Mapbox GL Style Reference](https://www.mapbox.com/mapbox-gl-style-spec/).
    -   `options.accessToken` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** Required unless `mapboxgl.accessToken` is set globally (optional, default `null`)
    -   `options.interactive` **\[[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)]** Enable/Disable mouse or touch interactivity from the plugin (optional, default `true`)
    -   `options.profile` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** Routing profile to use. Options: `driving`, `walking`, `cycling` (optional, default `"driving"`)
    -   `options.unit` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** Measurement system to be used in navigation instructions. Options: `imperial`, `metric` (optional, default `"imperial"`)
    -   `options.geocoder` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** Pass options available to mapbox-gl-geocoder as [documented here](https://github.com/mapbox/mapbox-gl-geocoder/blob/master/API.md#mapboxglgeocoder).
    -   `options.controls` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 
        -   `options.controls.inputs` **\[[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)]** Hide or display the inputs control. (optional, default `true`)
        -   `options.controls.instructions` **\[[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)]** Hide or display the instructions control. (optional, default `true`)

**Examples**

```javascript
var MapboxDirections = require('../src/index');
var directions = new MapboxDirections({
  accessToken: 'YOUR-MAPBOX-ACCESS-TOKEN',
  unit: 'metric',
  profile: 'cycling'
});
// add to your mapboxgl map
map.addControl(directions);
```

Returns **[MapboxDirections](#mapboxdirections)** `this`

## onRemove

Removes the control from the map it has been added to. This is called by `map.removeControl`,
which is the recommended method to remove controls.

**Parameters**

-   `map`  

Returns **Control** `this`

## interactive

Turn on or off interactivity

**Parameters**

-   `state` **[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** sets interactivity based on a state of `true` or `false`.

Returns **[MapboxDirections](#mapboxdirections)** this

## getOrigin

Returns the origin of the current route.

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** origin

## setOrigin

Sets origin. _Note:_ calling this method requires the [map load event](https://www.mapbox.com/mapbox-gl-js/api/#Map.load)
to have run.

**Parameters**

-   `query` **([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)> | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** An array of coordinates [lng, lat] or location name as a string.

Returns **[MapboxDirections](#mapboxdirections)** this

## getDestination

Returns the destination of the current route.

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** destination

## setDestination

Sets destination. _Note:_ calling this method requires the [map load event](https://www.mapbox.com/mapbox-gl-js/api/#Map.load)
to have run.

**Parameters**

-   `query` **([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)> | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** An array of coordinates [lng, lat] or location name as a string.

Returns **[MapboxDirections](#mapboxdirections)** this

## reverse

Swap the origin and destination.

Returns **[MapboxDirections](#mapboxdirections)** this

## addWaypoint

Add a waypoint to the route. _Note:_ calling this method requires the
[map load event](https://www.mapbox.com/mapbox-gl-js/api/#Map.load) to have run.

**Parameters**

-   `index` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** position waypoint should be placed in the waypoint array
-   `waypoint` **([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)> | Point)** can be a GeoJSON Point Feature or [lng, lat] coordinates.

Returns **[MapboxDirections](#mapboxdirections)** this;

## setWaypoint

Change the waypoint at a given index in the route. _Note:_ calling this
method requires the [map load event](https://www.mapbox.com/mapbox-gl-js/api/#Map.load)
to have run.

**Parameters**

-   `index` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** indexed position of the waypoint to update
-   `waypoint` **([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)> | Point)** can be a GeoJSON Point Feature or [lng, lat] coordinates.

Returns **[MapboxDirections](#mapboxdirections)** this;

## removeWaypoint

Remove a waypoint from the route.

**Parameters**

-   `index` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** position in the waypoints array.

Returns **[MapboxDirections](#mapboxdirections)** this;

## getWaypoints

Fetch all current waypoints in a route.

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** waypoints

## removeRoutes

Removes all routes and waypoints from the map.

Returns **[MapboxDirections](#mapboxdirections)** this;

## on

Subscribe to events that happen within the plugin.

**Parameters**

-   `type` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** name of event. Available events and the data passed into their respective event objects are:-   **clear** `{ type: } Type is one of 'origin' or 'destination'`
    -   **loading** `{ type: } Type is one of 'origin' or 'destination'`
    -   **profile** `{ profile } Profile is one of 'driving', 'walking', or 'cycling'`
    -   **origin** `{ feature } Fired when origin is set`
    -   **destination** `{ feature } Fired when destination is set`
    -   **route** `{ route } Fired when a route is updated`
    -   **error** \`{ error } Error as string
-   `fn` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** function that's called when the event is emitted.

Returns **[MapboxDirections](#mapboxdirections)** this;

# getResult

Return the input

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** input

# query

Set & query the input

**Parameters**

-   `query` **([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) \| [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** An array of coordinates [lng, lat] or location name as a string.

Returns **Geocoder** this

# setInput

Set input

**Parameters**

-   `value` **([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) \| [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** An array of coordinates [lng, lat] or location name as a string. Calling this function just sets the input and does not trigger an API request.

Returns **Geocoder** this

# on

Subscribe to events that happen within the plugin.

**Parameters**

-   `type` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** name of event. Available events and the data passed into their respective event objects are:-   **clear** `Emitted when the input is cleared`
    -   **loading** `Emitted when the geocoder is looking up a query`
    -   **results** `{ results } Fired when the geocoder returns a response`
    -   **result** `{ result } Fired when input is set`
    -   **error** \`{ error } Error as string
-   `fn` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** function that's called when the event is emitted.

Returns **Geocoder** this;

# fire

Fire an event

**Parameters**

-   `type` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** event name.
-   `data` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** event data to pass to the function subscribed.

Returns **Geocoder** this

# off

Remove an event

**Parameters**

-   `type` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Event name.
-   `fn` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** Function that should unsubscribe to the event emitted.

Returns **Geocoder** this
