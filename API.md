# MapboxDirections

The Directions control

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** no currently accepted options

**Examples**

```javascript
var directions = new MapboxDirections({
  accessToken: mapboxgl.accessToken
});
map.addControl(directions, 'top-left');
```

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
