import React, { Component, PropTypes } from 'react';
import format from '../format';

export default class Instructions extends Component {

  _mouseOver() {}

  _mouseOut() {}

  _click() {}

  render() {
    const { data, unit } = this.props;
    const steps = data[0].steps;

    const renderSteps = function(d) {
      var icon = d.maneuver.type.replace(/\s+/g, '-').toLowerCase();
      var distance = (d.distance) ? format[unit](d.distance) : false;

      return (
        <li
          onMouseOver={this._mouseOver}
          onMouseOut={this._mouseOut}
          click={this._onClick}
          className='mapbox-directions-step'>
          <span className={`directions-icon directions-icon-${icon}`}></span>
          <div
            dangerouslySetInnerHTML={{__html: d.maneuver.instruction}}
            className={`mapbox-directions-step-maneuver`} />
          {distance && <div className={`mapbox-directions-step-distance`}>
            {distance}
          </div>}
        </li>
      );
    }.bind(this);

    return (
      <div className='mapbox-directions-instructions'>
        <ol className='mapbox-directions-steps'>
          {steps.map(renderSteps)}
        </ol>
      </div>
    );
  }
}

Instructions.propTypes = {
  unit: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired
};
