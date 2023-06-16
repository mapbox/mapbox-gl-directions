import type { Map } from "mapbox-gl";
import utils from "../utils/index.js";

/**
 * Summary/Instructions controller
 *
 * @param {HTMLElement} el Summary parent container
 * @param {Object} store A redux store
 * @param {Object} actions Actions an element can dispatch
 * @param {Object} map The mapboxgl instance
 * @private
 */
export default class Instructions {
  constructor(
    public container: HTMLElement,
    public _map: Map = Object.create(null)
  ) {}

  onAdd(map: Map) {
    this._map = map;
    return this.container;
  }

  render() {
    this.store.subscribe(() => {
      const { hoverMarker, setRouteIndex } = this.actions;
      const { routeIndex, unit, directions, error, compile } =
        this.store.getState();
      const shouldRender = !isEqual(directions[routeIndex], this.directions);

      if (error) {
        this.container.innerHTML = errorTemplate({ error });
        return;
      }

      if (directions.length && shouldRender) {
        const direction = (this.directions = directions[routeIndex]);

        if (compile) {
          direction.legs.forEach(function (leg) {
            leg.steps.forEach(function (step) {
              step.maneuver.instruction = compile("en", step);
            });
          });
        }

        this.container.innerHTML = instructionsTemplate({
          routeIndex,
          routes: directions.length,
          steps: direction.legs[0].steps, // Todo: Respect all legs,
          format: utils.format[unit],
          duration: utils.format.duration(direction.duration),
          distance: utils.format[unit](direction.distance),
        });

        const steps = this.container.querySelectorAll(
          ".mapbox-directions-step"
        );

        Array.prototype.forEach.call(steps, (el) => {
          const lng = el.getAttribute("data-lng");
          const lat = el.getAttribute("data-lat");

          el.addEventListener("mouseover", () => {
            hoverMarker([lng, lat]);
          });

          el.addEventListener("mouseout", () => {
            hoverMarker(null);
          });

          el.addEventListener("click", () => {
            this._map.flyTo({
              center: [lng, lat],
              zoom: 16,
            });
          });
        });

        const routes = this.container.querySelectorAll('input[type="radio"]');
        Array.prototype.forEach.call(routes, (el) => {
          el.addEventListener("change", (e) => {
            setRouteIndex(parseInt(e.target.id, 10));
          });
        });
      } else if (this.container.innerHTML && shouldRender) {
        this.container.innerHTML = "";
      }
    });
  }
}
