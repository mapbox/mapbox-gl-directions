# mapboxgl.Directions

A directions component using Mapbox Directions APi

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
var directions = new mapboxgl.Directions({
  container: 'directions',
  unit: 'metric',
  profile: 'walking'
});

map.addControl(directions);
```

Returns **Directions** `this`

# remove

Removes the control from the map it has been added to.

Returns **Control** `this`

# interactive

Turn on or off interactivity

**Parameters**

-   `state` **[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** sets interactivity based on a state of `true` or `false`.

Returns **Directions** this

# getOrigin

Returns the origin of the current route.

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** origin

# setOrigin

Sets origin. _Note:_ calling this method requires the [map load event](https://www.mapbox.com/mapbox-gl-js/api/#Map.load)
to have run.

**Parameters**

-   `query` **([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)> | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** An array of coordinates [lng, lat] or location name as a string.

Returns **Directions** this

# getDestination

Returns the destination of the current route.

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** destination

# setDestination

Sets destination. _Note:_ calling this method requires the [map load event](https://www.mapbox.com/mapbox-gl-js/api/#Map.load)
to have run.

**Parameters**

-   `query` **([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)> | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** An array of coordinates [lng, lat] or location name as a string.

Returns **Directions** this

# reverse

Swap the origin and destination.

Returns **Directions** this

# addWaypoint

Add a waypoint to the route. _Note:_ calling this method requires the
[map load event](https://www.mapbox.com/mapbox-gl-js/api/#Map.load) to have run.

**Parameters**

-   `index` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** position waypoint should be placed in the waypoint array
-   `waypoint` **([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)> | Point)** can be a GeoJSON Point Feature or [lng, lat] coordinates.

Returns **Directions** this;

# setWaypoint

Change the waypoint at a given index in the route. _Note:_ calling this
method requires the [map load event](https://www.mapbox.com/mapbox-gl-js/api/#Map.load)
to have run.

**Parameters**

-   `index` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** indexed position of the waypoint to update
-   `waypoint` **([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)> | Point)** can be a GeoJSON Point Feature or [lng, lat] coordinates.

Returns **Directions** this;

# removeWaypoint

Remove a waypoint from the route.

**Parameters**

-   `index` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** position in the waypoints array.

Returns **Directions** this;

# getWaypoints

Fetch all current waypoints in a route.

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** waypoints

# on

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

Returns **Directions** this;

# mapboxgl.Geocoder

A geocoder component using Mapbox Geocoding API

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.country` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** a comma seperated list of country codes to limit results to specified country or countries.
    -   `options.accessToken` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** Required unless `mapboxgl.accessToken` is set globally (optional, default `null`)
    -   `options.container` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [element](https://developer.mozilla.org/en-US/docs/Web/API/Element))** The HTML element to append the Geocoder input to. if container is not specified, `map.getcontainer()` is used.
    -   `options.proximity` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)>** If set, search results closer to these coordinates will be given higher priority.
    -   `options.position` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** A string indicating the control's position on the map. Options are `top-right`, `top-left`, `bottom-right`, `bottom-left` (optional, default `"top-right"`)
    -   `options.zoom` **\[[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)]** On geocoded result what zoom level should the map animate to. (optional, default `16`)
    -   `options.flyTo` **\[[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)]** If false, animating the map to a selected result is disabled. (optional, default `true`)
    -   `options.placeholder` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** Override the default placeholder attribute value. (optional, default `"Search"`)
    -   `options.types` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** a comma seperated list of types that filter results to match those specified. See <https://www.mapbox.com/developers/api/geocoding/#filter-type> for available types.
    -   `options.bbox` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)>** Limit results to a given bounding box provided as `[minX, minY, maxX, maxY]`.

**Examples**

```javascript
var geocoder = new mapboxgl.Geocoder();
map.addControl(geocoder);
```

Returns **Geocoder** `this`

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
