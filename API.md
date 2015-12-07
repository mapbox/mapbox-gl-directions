# mapboxgl.Directions

A directions component using Mapbox Directions APi

**Parameters**

-   `options` **Object** 
    -   `options.accessToken` **[String]** Required unless `mapboxgl.accessToken` is set globally (optional, default `null`)
    -   `options.profile` **[String]** Routing profile to use. Options: `driving`, `walking`, `cycling` (optional, default `"driving"`)
    -   `options.unit` **[String]** Measurement system to be used in navigation instructions. Options: `imperial`, `metric` (optional, default `"imperial"`)
    -   `options.container` **string or Element** HTML element to initialize the map in (or element id as string). If no container is passed map.getContainer() is used instead.
    -   `options.proximity` **Array&lt;Array&lt;number&gt;&gt;** If set, search results closer to these coordinates will be given higher priority.

**Examples**

```javascript
var directions = Directions(document.getElementById('directions'), {
  unit: 'metric',
  profile: 'walking'
});

map.addControl(directions);
```

Returns **Directions** `this`

# addWaypoint

Add a waypoint to the route.

**Parameters**

-   `index` **Number** position waypoint should be placed in the waypoint array
-   `waypoint` **Array&lt;number&gt; or Point** can be a GeoJSON Point Feature or [lng, lat] coordinates.

Returns **Directions** this;

# getDestination

Returns the destination of the current route.

Returns **Object** destination

# getOrigin

Returns the origin of the current route.

Returns **Object** origin

# getWaypoints

Fetch all current waypoints in a route.

Returns **Array** waypoints

# on

Subscribe to events that happen within the plugin.

**Parameters**

-   `type` **String** name of event. Available events and the data passed into their respective event objects are:-   **directions.clear** `{ type: } Type is one of 'origin' or 'destination'`
    -   **directions.loading** `{ type: } Type is one of 'origin' or 'destination'`
    -   **directions.profile** `{ profile } Profile is one of 'driving', 'walking', or 'cycling'`
    -   **directions.origin** `{ feature } Fired when origin is set`
    -   **directions.destination** `{ feature } Fired when destination is set`
    -   **directions.route** `{ route } Fired when a route is updated`
    -   **directions.error** `{ error } Error as string
-   `fn` **Function** function that's called when the event is emitted.

Returns **Directions** this;

# removeWaypoint

Remove a waypoint from the route.

**Parameters**

-   `index` **Number** position in the waypoints array.

Returns **Directions** this;

# reverse

Swap the origin and destination.

Returns **Directions** this

# setDestination

Sets the destination of the current route.

**Parameters**

-   `query` **Array or String** An array of coordinates [lng, lat] or location name as a string.

Returns **Directions** this

# setOrigin

Sets the origin of the current route.

**Parameters**

-   `query` **Array or String** An array of coordinates [lng, lat] or location name as a string.

Returns **Directions** this

# setWaypoint

Change the waypoint at a given index in the route.

**Parameters**

-   `index` **Number** indexed position of the waypoint to update
-   `waypoint` **Array&lt;number&gt; or Point** can be a GeoJSON Point Feature or [lng, lat] coordinates.

Returns **Directions** this;
