import 'mapbox-gl/dist/mapbox-gl.css';

import { Map } from 'mapbox-gl'
import MapboxDirections from './src';

const container = document.createElement('div')
container.style.height = '100vh'
container.style.width = '100vw'

document.querySelector('#app')?.appendChild(container)

const accessToken = 'pk.eyJ1IjoicGVkcmljIiwiYSI6ImNsZzE0bjk2ajB0NHEzanExZGFlbGpwazIifQ.l14rgv5vmu5wIMgOUUhUXw'

const map = new Map({
  container,
  accessToken,
  style: "mapbox://styles/mapbox/streets-v9",
  center: [-117.842717, 33.6459],
  zoom: 16,
})

const directions = new MapboxDirections({
  accessToken,
  unit: 'metric',
  profile: 'mapbox/walking'
});

map.addControl(directions, 'top-left');
