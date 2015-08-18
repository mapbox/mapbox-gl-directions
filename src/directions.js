'use strict';

import React from 'react';

// Controllers
import InputsControl from './components/inputs';
import ErrorsControl from './components/errors';
import RoutesControl from './components/routes';
import InstructionsControl from './components/instructions';

export default class Directions extends mapboxgl.Control {

  constructor(opts) {

    // Call functions on an object's parent
    super();

    this.options = {
      units: 'imperial'
    };

    mapboxgl.util.setOptions(this, opts);
    console.log(mapboxgl.util.setOptions(this, opts));
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

    switch (name) {
      case 'inputs':
      React.render(<InputsControl options={opts} />, el);
      break;
      case 'errors':
      React.render(<ErrorsControl options={opts} />, el);
      break;
      case 'routes':
      React.render(<RoutesControl options={opts} />, el);
      break;
      case 'instructions':
      React.render(<InstructionsControl options={opts} />, el);
      break;
    }
  }

}
