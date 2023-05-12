'use strict';
var mapboxgl = require('mapbox-gl');
var insertCss = require('insert-css');
var fs = require('fs');

mapboxgl.accessToken = 'pk.eyJ1IjoidmVkaXRiZWxhZGlhIiwiYSI6ImNsZ2Q5ZmFzcDBsbTczZm8waHZ0dHNjdXcifQ.gCw4tf3znD_ZQTS4mpoEQQ';

// var directionsDiv = document.body.appendChild(document.createElement('div'));
// directionsDiv.id = 'directions';

insertCss(fs.readFileSync('./src/mapbox-gl-directions.css', 'utf8'));
insertCss(fs.readFileSync('./node_modules/mapbox-gl/dist/mapbox-gl.css', 'utf8'));
var mapDiv = document.body.appendChild(document.createElement('div'));
mapDiv.style = 'position:absolute;top:0;right:0;left:0;bottom:0;';

var map = window.map = new mapboxgl.Map({
  hash: true,
  container: mapDiv,
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-77.0172, 38.8887],
  zoom: 13
});

// remove control
var button = document.body.appendChild(document.createElement('button'));
button.style = 'z-index:10;position:absolute;top:10px;right:10px;';
button.textContent = 'Remove directions control';

// remove all waypoints
var removeWaypointsButton = document.body.appendChild(document.createElement('button'));
removeWaypointsButton.style = 'z-index:10;position:absolute;top:30px;right:10px;';
removeWaypointsButton.textContent = 'Remove all waypoints';

// directions
var MapboxDirections = require('../src/index');
var directions = new MapboxDirections({
  accessToken: mapboxgl.accessToken,
  unit: 'metric',
  profile: 'mapbox/driving'
});
window.directions = directions;

map.addControl(directions, 'top-left');

map.on('load', () => {
  button.addEventListener('click', function () {
    map.removeControl(directions);
  });

  removeWaypointsButton.addEventListener('click', function () {
    directions.removeRoutes();
  });
});


const routes = [{
  stops: [[-77.03645,38.89877], 
  [-77.03361,38.89872],
  [-77.03361,38.892203],
  [-77.03191,38.89203], 
  [-77.02392,38.89196],
  [-77.02393,38.89054],
  [-77.01752,38.89057],
  [-77.01758,38.88886],
  [-77.01758,38.89202],
  [-77.02596,38.89432],
  [-77.02599,38.90245], 
  [-77.02688,38.90249],
  [-77.02703,38.92063],
  [-77.02959,38.92045],
  [-77.02971,38.92105],
  [-77.03032,38.92108],
  [-77.03032,38.92120],
  ],
},
  // add more routes as needed
];

const routespnt = [{
  stops: [[-77.0366, 38.8977], // Washington, DC
  [-77.0172, 38.8887], // White House
  [-77.0259, 38.8936], // Lincoln Memorial
  [-77.0303, 38.9213], // National Zoo
  ],
},
  // add more routes as needed
];

function renderRoute(index) {
  const { stops } = routes[index];
  const origin = stops[0];
  const destination = stops[stops.length - 1];
  const waypoints = stops.slice(1, -1);
  directions.setOrigin(origin);
  directions.setDestination(destination);
  directions.setWaypoints(waypoints);
  directions.on("route", ({ route }) => {
    map.getSource(`route-${index}`).setData(route[0].geometry);
  });
}

map.on('load', function () {
  init();
});

//////////////////////////////////////////////
// var input = document.body.appendChild(document.createElement('input'));
// input.placeholder = 'Add address...';
// input.style = 'z-index:10;position:absolute;bottom:60px;left:10px;';

// var addButton = document.body.appendChild(document.createElement('button'));
// addButton.textContent = 'Add';
// addButton.style = 'z-index:10;position:absolute;bottom:60px;left:300px;';

// addButton.addEventListener('click', function() {
//   geocode(input.value)
//       .then(function(coordinates) {
//           routespnt[0].stops.push(coordinates);
//           renderMarkers();
//       })
//       .catch(function(error) {
//           console.log('Error:', error);
//       });
// });

// function renderMarkers() {
//   // clear existing markers
//   var markers = document.getElementsByClassName('marker');
//   while (markers[0]) {
//       markers[0].parentNode.removeChild(markers[0]);
//   }

//   // add markers at stops
//   var { stops } = routespnt[0];
//   stops.forEach((stop, index) => {
//       var el = document.createElement('div');
//       el.className = 'marker';
//       el.textContent = index + 1;
//       el.style.backgroundColor = 'red'; // set marker background color
//       new mapboxgl.Marker(el)
//           .setLngLat(stop)
//           .addTo(map);
//   });
// }

// function geocode(address) {
//   return new Promise(function(resolve, reject) {
//       var url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${mapboxgl.accessToken}`;
//       fetch(url)
//           .then(function(response) {
//               if (response.ok) {
//                   return response.json();
//               } else {
//                   throw new Error('Network response was not ok.');
//               }
//           })
//           .then(function(data) {
//               if (data.features.length > 0) {
//                   var coordinates = data.features[0].geometry.coordinates;
//                   resolve(coordinates);
//               } else {
//                   reject('Address not found.');
//               }
//           })
//           .catch(function(error) {
//               reject(error);
//           });
//   });
// }
/////////////////////////////////

function init() {
  //markers
  for (let i = 0; i < routespnt.length; i++) {
    const { stops } = routespnt[i];
    // add markers at stops
    stops.forEach((stop, index) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.textContent = index + 1;
      el.style.backgroundColor = 'red'; // set marker background color
      new mapboxgl.Marker(el)
        .setLngLat(stop)
        .addTo(map);
    });

  }
  //lines
  for (let i = 0; i < routes.length; i++) {
    const { stops } = routes[i];
    const coordinates = stops.map((stop) => [stop[0], stop[1]]);

    map.addSource(`route-${i}`, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: coordinates,
        },
      },
    });

    map.addLayer({
      id: `route-${i}`,
      type: "line",
      source: `route-${i}`,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#098",
        "line-width": 10,
        "line-opacity": 1,
      },
    });

    renderRoute(i);
  }
}


console.log(routes);
