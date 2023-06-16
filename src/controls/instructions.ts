import { store } from '../state/store.js'

/**
 * Summary/Instructions controller
 *
 * @param container Summary parent container.
 * @param map The mapboxgl instance.
 * @private
 */
export default class Instructions {
  constructor(public container: HTMLElement, public _map: mapboxgl.Map = Object.create(null)) {}

  onAdd(map: mapboxgl.Map) {
    this._map = map
    return this.container
  }

  render() {
    store.subscribe((state, _prevState) => {
      // const { routeIndex, unit, directions, error, compile } = state
      // const shouldRender = !isEqual(directions[routeIndex], this.directions);
      // if (error) {
      //   this.container.innerHTML = errorTemplate({ error });
      //   return;
      // }
      // if (directions.length && shouldRender) {
      //   const direction = (this.directions = directions[routeIndex]);
      //   if (compile) {
      //     direction.legs.forEach(function (leg) {
      //       leg.steps.forEach(function (step) {
      //         step.maneuver.instruction = compile("en", step);
      //       });
      //     });
      //   }
      //   this.container.innerHTML = instructionsTemplate({
      //     routeIndex,
      //     routes: directions.length,
      //     steps: direction.legs[0].steps, // Todo: Respect all legs,
      //     format: utils.format[unit],
      //     duration: utils.format.duration(direction.duration),
      //     distance: utils.format[unit](direction.distance),
      //   });
      //   const steps = this.container.querySelectorAll(
      //     ".mapbox-directions-step"
      //   );
      //   Array.prototype.forEach.call(steps, (el) => {
      //     const lng = el.getAttribute("data-lng");
      //     const lat = el.getAttribute("data-lat");
      //     el.addEventListener("mouseover", () => {
      //       hoverMarker([lng, lat]);
      //     });
      //     el.addEventListener("mouseout", () => {
      //       hoverMarker(null);
      //     });
      //     el.addEventListener("click", () => {
      //       this._map.flyTo({
      //         center: [lng, lat],
      //         zoom: 16,
      //       });
      //     });
      //   });
      //   const routes = this.container.querySelectorAll('input[type="radio"]');
      //   Array.prototype.forEach.call(routes, (el) => {
      //     el.addEventListener("change", (e) => {
      //       setRouteIndex(parseInt(e.target.id, 10));
      //     });
      //   });
      // } else if (this.container.innerHTML && shouldRender) {
      //   this.container.innerHTML = "";
      // }
    })
  }
}
