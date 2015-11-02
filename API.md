# getDestination

Returns the destination of the current route.


Returns **Object** destination




# getOrigin

Returns the origin of the current route.


Returns **Object** origin




# reverse

Swap the origin and destination.


Returns **Directions** this




# setDestination

Sets the destination of the current route.


**Parameters**

-   `coordinates` **Array** [lng, lat]



Returns **Directions** this




# setOrigin

Sets the origin of the current route.


**Parameters**

-   `coordinates` **Array** [lng, lat]



Returns **Directions** this




# mapboxgl.Directions

A directions component using Mapbox Directions APi


**Parameters**

-   `options` **Object** 
    -   `options.accessToken` **[String]** Required unless `mapboxgl.accessToken` is set globally
         (optional, default `null`)
    -   `options.profile` **[String]** Routing profile to use. Options: `driving`, `walking`, `cycling`
         (optional, default `"driving"`)
    -   `options.unit` **[String]** Measurement system to be used in navigation instructions. Options: `imperial`, `metric`
         (optional, default `"imperial"`)


**Examples**

```javascript
var directions = Directions(document.getElementById('directions'), {
  unit: 'metric',
  profile: 'walking'
});

map.addControl(directions);
```



Returns **Directions** `this`



