import 'mapbox-gl/dist/mapbox-gl.css';
import './styles/mapbox-gl-directions.css';

import { Map } from 'mapbox-gl'
import { MapboxDirections } from './directions';

const accessToken = 'pk.eyJ1IjoicGVkcmljIiwiYSI6ImNsZzE0bjk2ajB0NHEzanExZGFlbGpwazIifQ.l14rgv5vmu5wIMgOUUhUXw'

const map = new Map({
  container: 'app',
  accessToken,
  style: "mapbox://styles/mapbox/streets-v9",
  center: [-117.842717, 33.6459],
  zoom: 16,
})

const directions = new MapboxDirections()

map.addControl(directions);
