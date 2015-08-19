'use strict';

import React from 'react';
import App from './containers/app';

export default class Directions extends mapboxgl.Control {

  constructor(opts) {

    // Call functions on an object's parent
    super();

    this.options = {
      units: 'imperial'
    };

    mapboxgl.util.setOptions(this, opts);
  }

  onAdd() {}

  /**
   * Adds a directions component to the document
   *
   * @param {String} name Controller name. Options are `inputs`, `errors`, `routes`, & `instructions`.
   * @param {Object} el DOM object controller should mount to.
   * @example
   * var directions = mapboxgl.Directions();
   * map.addControl(directions);
   *
   * directions.addControl('inputs', document.getElementById('inputs'));
   */
  addControl(name, el, opts) {
    React.render(<App control={name} options={opts} />, el);
  }

}
