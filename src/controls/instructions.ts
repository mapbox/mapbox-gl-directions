import mapboxgl from 'mapbox-gl'
import * as utils from '../utils/index.js'
import type { DirectionsStore } from '../state/store.js'
import { createErrorTemplate } from '../templates/error.js'
import { createInstructionsTemplate } from '../templates/instructions.js'

/**
 * Summary/Instructions controller
 * @private
 */
export class Instructions {
  unsubscribe?: () => void

  /**
   * @param container Summary parent container.
   * @param map The mapboxgl instance.
   */
  constructor(
    public container: HTMLElement,
    public store: DirectionsStore,
    public _map: mapboxgl.Map = Object.create(null)
  ) {}

  onAdd(map: mapboxgl.Map) {
    this._map = map
    this.subscribe()
    return this.container
  }

  subscribe() {
    this.unsubscribe = this.store.subscribe((state) => {
      const { routeIndex, unit, directions, error, compile, setHoverMarker } = state
      const shouldRender = true // !isEqual(directions[routeIndex], this.directions);

      if (error) {
        this.container.innerHTML = createErrorTemplate({ error })
        return
      }

      if (directions.length && shouldRender) {
        const direction = directions[routeIndex]
        if (compile) {
          direction.legs.forEach(function (leg) {
            leg.steps.forEach(function (step) {
              step.maneuver.instruction = compile('en', step)
            })
          })
        }

        this.container.innerHTML = createInstructionsTemplate({
          routeIndex,
          routes: directions.length,
          steps: direction.legs[0].steps, // Todo: Respect all legs,
          format: utils.format[unit as keyof typeof utils.format],
          duration: utils.format.duration(direction.duration),
          distance: utils.format[unit as keyof typeof utils.format](direction.distance),
        })

        this.container.querySelectorAll('.mapbox-directions-step').forEach((el) => {
          const lng = el.getAttribute('data-lng') ?? 0
          const lat = el.getAttribute('data-lat') ?? 0

          el.addEventListener('mouseover', () => {
            setHoverMarker([+lng, +lat])
          })

          el.addEventListener('mouseout', () => {
            setHoverMarker(null)
          })

          el.addEventListener('click', () => {
            this._map.flyTo({
              center: [lng, lat] as mapboxgl.LngLatLike,
              zoom: 16,
            })
          })
        })

        this.container.querySelectorAll('input[type="radio"]').forEach((el) => {
          el.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement
            const { setRouteIndex } = this.store.getState()
            setRouteIndex(parseInt(target.id, 10))
          })
        })
      } else if (this.container.innerHTML && shouldRender) {
        this.container.innerHTML = ''
      }
    })
  }
  onRemove() {
    this.unsubscribe?.()
    this.unsubscribe = undefined
  }
}
