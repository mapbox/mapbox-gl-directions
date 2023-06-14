import { LngLatLike, Map } from 'mapbox-gl';
import Geocoder from './geocoder';
import { createInputsTemplate } from '../templates/inputs';

/**
 * @internal
 */
export default class Inputs {
  originInput: Geocoder;

  destinationInput: Geocoder;

  /**
   * Inputs controller
   *
   * @param container Summary parent container.
   * @param map The mapboxgl instance.
   */
  constructor(public container: HTMLElement, public _map: Map) {
    container.innerHTML = createInputsTemplate({
      profile: 'mapbox/driving',
      controls: {
        profileSwitcher: true,
      }
    });

    this.originInput = Object.create(null);
    this.destinationInput = Object.create(null);
  }

  onAdd(map: Map) {
    this.originInput = new Geocoder()
    const originElement = this.originInput.onAdd(map);
    const originContainerElement = this.container.querySelector('#mapbox-directions-origin-input');
    originContainerElement?.appendChild(originElement);

    this.destinationInput = new Geocoder()
    const destinationElement = this.destinationInput.onAdd(map);
    const destinationContainerElement = this.container.querySelector('#mapbox-directions-destination-input');
    destinationContainerElement?.appendChild(destinationElement);

    // const {
    //   clearOrigin,
    //   clearDestination,
    //   createOrigin,
    //   createDestination,
    //   setProfile,
    //   reverse
    // } = this.actions;

    // const { geocoder, accessToken, flyTo, placeholderOrigin, placeholderDestination, zoom } = this.store.getState();

    // this.originInput = new Geocoder(Object.assign({}, {
    //   accessToken
    // }, geocoder, {flyTo, placeholder: placeholderOrigin, zoom}));

    // const originEl = this.originInput.onAdd(this._map);
    // const originContainerEl = this.container.querySelector('#mapbox-directions-origin-input');
    // originContainerEl.appendChild(originEl);

    // this.destinationInput = new Geocoder(Object.assign({}, {
    //   accessToken
    // }, geocoder, {flyTo, placeholder: placeholderDestination, zoom}));

    // const destinationEl = this.destinationInput.onAdd(this._map);
    // this.container.querySelector('#mapbox-directions-destination-input').appendChild(destinationEl);

    this.originInput.on('result', (data) => {
      data.result.center
      // createOrigin(coords);
    });

    // this.originInput.on('clear', clearOrigin);

    this.destinationInput.on('result', (data) => {
      data.result.center
      // createDestination(coords);
    });

    // this.destinationInput.on('clear', clearDestination);

    // // Driving / Walking / Cycling profiles
    this.container.querySelectorAll<HTMLInputElement>('input[type="radio"]')
      .forEach(profileRadioInput => {
        profileRadioInput.addEventListener('change', () => {
          console.log(profileRadioInput.value)
          // setProfile(el.value);
        });
      });

    // // Reversing Origin / Destination
    // this.container
    //   .querySelector('.js-reverse-inputs')
    //   .addEventListener('click', () => {
    //     const { origin, destination } = this.store.getState();
    //     if (origin) this.actions.queryDestination(origin.geometry.coordinates);
    //     if (destination) this.actions.queryOrigin(destination.geometry.coordinates);
    //     reverse();
    //   });
  }

  render() {
    // this.store.subscribe(() => {
    //   const {
    //     originQuery,
    //     destinationQuery,
    //     originQueryCoordinates,
    //     destinationQueryCoordinates
    //   } = this.store.getState();

    //   if (originQuery) {
    //     this.originInput.query(originQuery);
    //     this.actions.queryOrigin(null);
    //   }

    //   if (destinationQuery) {
    //     this.destinationInput.query(destinationQuery);
    //     this.actions.queryDestination(null);
    //   }

    //   if (originQueryCoordinates) {
    //     this.originInput.setInput(originQueryCoordinates);
    //     this.animateToCoordinates('origin', originQueryCoordinates);
    //     this.actions.queryOriginCoordinates(null);
    //   }

    //   if (destinationQueryCoordinates) {
    //     this.destinationInput.setInput(destinationQueryCoordinates);
    //     this.animateToCoordinates('destination', destinationQueryCoordinates);
    //     this.actions.queryDestinationCoordinates(null);
    //   }
    // });
  }
}
