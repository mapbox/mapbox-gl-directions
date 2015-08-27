import React, { Component, PropTypes } from 'react';
import format from '../format';

export default class Instructions extends Component {

  _mouseOver(e) {
    var coordinates = e.target.getAttribute('data-coordinates');
    if (coordinates) {
      // console.log(coordinates);
    }
  }

  _mouseOut() {
    // Remove the route point marker.
  }

  _click() {
    // Zoom to point on map
  }

  render() {
    const { data, unit, routeIndex } = this.props;
    const steps = data[routeIndex].steps;

    const renderSteps = function(d, i) {
      const icon = d.maneuver.type.replace(/\s+/g, '-').toLowerCase();
      const distance = (d.distance) ? format[unit](d.distance) : false;
      const coordinates = d.maneuver.location.coordinates;

      return (
        <li
          key={i}
          onMouseOver={this._mouseOver}
          onMouseOut={this._mouseOut}
          click={this._onClick}
          data-coordinates={coordinates}
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
  data: PropTypes.array.isRequired,
  routeIndex: PropTypes.number.isRequired
};
