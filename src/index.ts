import 'mapbox-gl/dist/mapbox-gl.css'
import './mapbox-gl-directions.css'

import mapboxgl from 'mapbox-gl'
import { initializeStore, store } from './state/store.js'
import * as utils from './utils/index.js'
import * as actions from './state/actions.js'
import { Geocoder } from './controls/geocoder.js'
import { createInputsTemplate } from './templates/input.js'

export const MapboxProfiles = [
  'mapbox/driving-traffic',
  'mapbox/driving',
  'mapbox/walking',
  'mapbox/cycling',
] as const

export type MapboxProfile = (typeof MapboxProfiles)[number]

export type MapboxDirectionsUnits = 'imperial' | 'metric'

export interface MapDirectionsControls {
  /**
   * @param Hide or display the inputs control.
   * @default true
   */
  inputs?: boolean

  /**
   * Hide or display the instructions control.
   * @default true
   */
  instructions?: boolean

  /**
   * Hide or display the default profile switch with options for traffic, driving, walking and cycling.
   * @default true
   */
  profileSwitcher?: boolean

  /**
   * If no bbox exists from the geocoder result, the zoom you set here will be used in the flyTo.
   * @default 16
   */
  zoom?: number

  /**
   * The language of returned turn-by-turn text instructions. See supported languages : https://docs.mapbox.com/api/navigation/#instructions-languages
   * @default 'en'
   */
  language?: string

  /**
   * @param If set, this text will appear as the placeholder attribute for the origin input element.
   * @default 'Choose a starting place'
   */
  placeholderOrigin?: string

  /**
   * @param If set, this text will appear as the placeholder attribute for the destination input element.
   * @default 'Choose destination'
   */
  placeholderDestination?: string

  /**
   * @param If false, animating the map to a selected result is disabled.
   * @default true
   */
  flyTo?: boolean

  /**
   * @param Exclude certain road types from routing. The default is to not exclude anything.
   * Search for `exclude` in `optional parameters`: https://docs.mapbox.com/api/navigation/#retrieve-directions
   * @default null
   */
  exclude?: string

  /**
   * @param Specify padding surrounding route. A single number of pixels or a [PaddingOptions](https://docs.mapbox.com/mapbox-gl-js/api/#paddingoptions) object.
   * @default 80
   */
  routePadding?: number | mapboxgl.PaddingOptions
}

export interface MapboxDirectionsOptions {
  /**
   * Override default layer properties of the [directions source](https://github.com/mapbox/mapbox-gl-directions/blob/master/src/directions_style.js).
   * Documentation for each property are specified in the [Mapbox GL Style Reference](https://www.mapbox.com/mapbox-gl-style-spec/).
   */
  styles?: mapboxgl.AnyLayer[]

  /**
   * Required unless `mapboxgl.accessToken` is set globally.
   * @default null
   */
  accessToken?: string

  /**
   * Override default routing endpoint url.
   * @default 'https://api.mapbox.com/directions/v5/'
   */
  api?: string

  /**
   * Enable/Disable mouse or touch interactivity from the plugin.
   * @default true
   */
  interactive?: boolean

  /**
   * Routing profile to use.
   * @default 'mapbox/driving-traffic'
   */
  profile?: MapboxProfile

  /**
   * Whether to enable alternatives.
   * @default false
   */
  alternatives?: boolean

  /**
   * Whether to enable congestion along the route line.
   * @default false
   */
  congestion?: boolean

  /**
   * Measurement system to be used in navigation instructions.
   * @default 'imperial'
   */
  unit?: MapboxDirectionsUnits

  /**
   * Provide a custom function for generating instruction, compatible with osrm-text-instructions.
   * @default null
   */
  compile?: Function

  /**
   * Accepts an object containing the query parameters as [documented here](https://www.mapbox.com/api-documentation/#search-for-places).
   */
  geocoderQueryParameters?: Record<PropertyKey, PropertyKey>

  /**
   * Control the rendering.
   */
  controls?: MapDirectionsControls
}

/**
 * @example
 * const MapboxDirections = require('../src/index.js');
 *
 * const directions = new MapboxDirections({
 *   accessToken: 'YOUR-MAPBOX-ACCESS-TOKEN',
 *   unit: 'metric',
 *   profile: 'mapbox/cycling'
 * });
 *
 * // add to your mapboxgl map
 * map.addControl(directions);
 */
export class MapboxDirections {
  container: HTMLElement
  _map: mapboxgl.Map | null
  timer: number | undefined

  constructor(public options: MapboxDirectionsOptions = {}) {
    initializeStore(options)

    this.container = document.createElement('div')
    this.container.className = 'mapboxgl-ctrl-directions mapboxgl-ctrl'
    this._map = null
  }

  onAdd(map: mapboxgl.Map) {
    const controls: MapDirectionsControls = {}

    const geocoderContainer = document.createElement('div')
    geocoderContainer.className = 'directions-control directions-control-inputs'
    geocoderContainer.innerHTML = createInputsTemplate({
      profile: 'mapbox/driving',
      controls: {
        profileSwitcher: true,
      },
    })

    // Driving / Walking / Cycling profiles
    geocoderContainer
      .querySelectorAll<HTMLInputElement>('input[type="radio"]')
      .forEach((element) => {
        element.addEventListener('change', () => {
          const profile = element.value as MapboxProfile
          actions.setProfile(profile)
        })
      })

    // Reversing Origin / Destination
    geocoderContainer.querySelector('.js-reverse-inputs')?.addEventListener('click', () => {
      actions.reverse()

      const { origin, destination } = store.getState();

      if (origin?.geometry.coordinates && destination?.geometry.coordinates) {
        actions.updateDirections()
      }
    })

    const originGeocoder = new Geocoder()
    const originElement = originGeocoder.onAdd(map)
    const originContainerElement = geocoderContainer.querySelector(
      '#mapbox-directions-origin-input'
    )
    originContainerElement?.appendChild(originElement)
    originGeocoder.on('result', async (data) => {
      const centerCoords = utils.createPoint(data.result.center)
      actions.setOrigin(centerCoords)

      const { origin, destination } = store.getState()
      
      if (origin?.geometry.coordinates && destination?.geometry.coordinates) {
        actions.updateDirections()
      }
    })

    const destinationGeocoder = new Geocoder()
    const destinationElement = destinationGeocoder.onAdd(map)
    const destinationContainerElement = geocoderContainer.querySelector(
      '#mapbox-directions-destination-input'
    )
    destinationContainerElement?.appendChild(destinationElement)
    destinationGeocoder.on('result', (data) => {
      const centerCoords = utils.createPoint(data.result.center)
      actions.setDestination(centerCoords)

      const { origin, destination } = store.getState()
      
      if (origin?.geometry.coordinates && destination?.geometry.coordinates) {
        actions.updateDirections()
      }
    })

    if (controls.inputs || true) {
      this.container.appendChild(geocoderContainer)
    }

    const directionsElement = document.createElement('div')
    directionsElement.className = 'directions-control directions-control-instructions'
    directionsElement.textContent = 'Directions Element'

    // new Instructions(directionsEl, store, {
    //   hoverMarker: this.actions.hoverMarker,
    //   setRouteIndex: this.actions.setRouteIndex
    // }, this._map);

    if (controls.instructions || true) {
      this.container.appendChild(directionsElement)
    }

    // this.subscribedActions();
    // if (map.loaded()) this.mapState()
    // else map.on('load', () => this.mapState());

    return this.container
  }

  /**
   * Removes the control from the map it has been added to.
   * This is called by `map.removeControl`, which is the recommended method to remove controls.
   */
  onRemove(map: mapboxgl.Map) {
    this.container.parentNode?.removeChild(this.container)
    this.removeRoutes()

    map.off('mousedown', this.onDragDown)
    map.off('mousemove', this.move)
    map.off('touchstart', this.onDragDown)
    map.off('touchstart', this.move)
    map.off('click', this.onClick)

    // if (this.storeUnsubscribe) {
    //   this.storeUnsubscribe();
    //   delete this.storeUnsubscribe;
    // }

    this.options.styles?.forEach((layer) => {
      if (map.getLayer(layer.id)) map.removeLayer(layer.id)
    })

    if (map.getSource('directions')) map.removeSource('directions')

    this._map = null

    return this
  }

  onDragDown() {
    // if (!(this.isCursorOverPoint && this._map)) return;
    // this.isDragging = this.isCursorOverPoint;

    if (!this._map) return
    this._map.getCanvas().style.cursor = 'grab'

    this._map.on('mousemove', this.onDragMove)
    this._map.on('mouseup', this.onDragUp)
    this._map.on('touchmove', this.onDragMove)
    this._map.on('touchend', this.onDragUp)
  }

  onDragMove(event: mapboxgl.MapMouseEvent) {
    // if (!this.isDragging) return;
    // const coords = [event.lngLat.lng, event.lngLat.lat];
    // switch (this.isDragging.layer.id) {
    //   case 'directions-origin-point':
    //     this.actions.createOrigin(coords);
    //     break;
    //   case 'directions-destination-point':
    //     this.actions.createDestination(coords);
    //     break;
    //   case 'directions-hover-point':
    //     this.actions.hoverMarker(coords);
    //     break;
    // }
  }

  onDragUp() {
    // if (!this.isDragging) return;
    if (!this._map) return

    // const { hoverMarker, origin, destination } = store.getState();

    // switch (this.isDragging.layer.id) {
    //   case 'directions-origin-point':
    //     this.actions.setOriginFromCoordinates(origin.geometry.coordinates);
    //     break;
    //   case 'directions-destination-point':
    //     this.actions.setDestinationFromCoordinates(destination.geometry.coordinates);
    //     break;
    //   case 'directions-hover-point':
    //     // Add waypoint if a sufficent amount of dragging has occurred.
    //     if (hoverMarker.geometry && !utils.coordinateMatch(this.isDragging, hoverMarker)) {
    //       this.actions.addWaypoint(0, hoverMarker);
    //     }
    //     break;
    // }

    // this.isDragging = false;
    this._map.getCanvas().style.cursor = ''

    this._map.off('touchmove', this.onDragMove)
    this._map.off('touchend', this.onDragUp)
    this._map.off('mousemove', this.onDragMove)
    this._map.off('mouseup', this.onDragUp)
  }

  /**
   * Removes all routes and waypoints from the map.
   */
  removeRoutes() {
    // this.actions.clearOrigin();
    // this.actions.clearDestination();
    return this
  }

  onClick(event: mapboxgl.MapMouseEvent) {
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this._onSingleClick(event)
        this.timer = undefined
      }, 250)
    } else {
      clearTimeout(this.timer)
      this.timer = undefined
      this._map?.zoomIn()
    }
  }

  _onSingleClick(event: mapboxgl.MapMouseEvent) {
    // const { origin } = store.getState();
    // const coords = [event.lngLat.lng, event.lngLat.lat];
    // if (!origin.geometry) {
    //   this.actions.setOriginFromCoordinates(coords);
    // } else {
    //   const features = this._map.queryRenderedFeatures(event.point, {
    //     layers: [
    //       'directions-origin-point',
    //       'directions-destination-point',
    //       'directions-waypoint-point',
    //       'directions-route-line-alt'
    //     ]
    //   });
    //   if (features.length) {
    //     // Remove any waypoints
    //     features.forEach((f) => {
    //       if (f.layer.id === 'directions-waypoint-point') {
    //         this.actions.removeWaypoint(f);
    //       }
    //     });
    //     if (features[0].properties.route === 'alternate') {
    //       const index = features[0].properties['route-index'];
    //       this.actions.setRouteIndex(index);
    //     }
    //   } else {
    //     this.actions.setDestinationFromCoordinates(coords);
    //     this._map.flyTo({ center: coords });
    //   }
    // }
  }

  move(event: mapboxgl.MapMouseEvent) {
    // const { hoverMarker } = store.getState();
    // const features = this._map.queryRenderedFeatures(event.point, {
    //   layers: [
    //     'directions-route-line-alt',
    //     'directions-route-line',
    //     'directions-origin-point',
    //     'directions-destination-point',
    //     'directions-hover-point'
    //   ]
    // });
    // this._map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    // if (features.length) {
    //   this.isCursorOverPoint = features[0];
    //   this._map.dragPan.disable();
    //   // Add a possible waypoint marker when hovering over the active route line
    //   features.forEach((feature) => {
    //     if (feature.layer.id === 'directions-route-line') {
    //       this.actions.hoverMarker([event.lngLat.lng, event.lngLat.lat]);
    //     } else if (hoverMarker.geometry) {
    //       this.actions.hoverMarker(null);
    //     }
    //   });
    // } else if (this.isCursorOverPoint) {
    //   this.isCursorOverPoint = false;
    //   this._map.dragPan.enable();
    // }
  }
}
const accessToken =
  'pk.eyJ1IjoicGVkcmljIiwiYSI6ImNsZzE0bjk2ajB0NHEzanExZGFlbGpwazIifQ.l14rgv5vmu5wIMgOUUhUXw'

const container = document.createElement('div')
container.style.height = '100vh'
container.style.width = '100vw'
document.body.appendChild(container)

const map = new mapboxgl.Map({
  container,
  accessToken,
  style: 'mapbox://styles/mapbox/streets-v9',
  center: [-117.842717, 33.6459],
  zoom: 16,
})

const directions = new MapboxDirections({ accessToken })
map.addControl(directions)
